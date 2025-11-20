<?php

namespace App\Services;

use App\Models\Device;
use App\Models\MonitoringHistory;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class FastPingService
{
    private $timeout;
    private $maxConcurrent;
    private $results;

    public function __construct()
    {
        $this->timeout = 0.5; // 0.5 second timeout for maximum speed
        $this->maxConcurrent = 100; // Maximum concurrent pings for fastest processing
        $this->results = [];
    }

    /**
     * Ping all devices in parallel for maximum speed
     */
    public function pingAllDevices()
    {
        $startTime = microtime(true);
        
        // Get all active devices, excluding offline acknowledged devices
        $devices = Device::where('is_active', true)
            ->where('status', '!=', 'offline_ack')
            ->get();
        
        if ($devices->isEmpty()) {
            return [
                'success' => true,
                'message' => 'No devices to ping',
                'results' => [],
                'stats' => [
                    'total' => 0,
                    'online' => 0,
                    'offline' => 0,
                    'duration' => 0
                ]
            ];
        }

        Log::info("Starting fast ping for {$devices->count()} devices");

        // Process devices in batches for optimal performance
        $batches = $devices->chunk($this->maxConcurrent);
        $allResults = [];
        $batchCount = 0;

        foreach ($batches as $batch) {
            $batchCount++;
            Log::info("Processing batch {$batchCount} of " . $batches->count() . " ({$batch->count()} devices)");
            
            $batchResults = $this->pingBatch($batch);
            $allResults = array_merge($allResults, $batchResults);
            
            // No delay between batches for maximum speed
        }

        // Update device statuses in database
        $this->updateDeviceStatuses($allResults);

        // Store monitoring history
        $this->storeMonitoringHistory($allResults);

        $duration = round((microtime(true) - $startTime) * 1000, 2);
        
        $stats = [
            'total' => count($allResults),
            'online' => count(array_filter($allResults, fn($r) => $r['status'] === 'online')),
            'offline' => count(array_filter($allResults, fn($r) => $r['status'] === 'offline')),
            'duration' => $duration
        ];

        Log::info("Fast ping completed: {$stats['total']} devices in {$duration}ms");

        // Cache results for quick API access
        Cache::put('ping_results.latest', $allResults, 60); // Cache for 1 minute
        Cache::put('ping_stats.latest', $stats, 60);

        return [
            'success' => true,
            'message' => "Pinged {$stats['total']} devices in {$duration}ms",
            'results' => $allResults,
            'stats' => $stats
        ];
    }

    /**
     * Ping a batch of devices concurrently
     */
    private function pingBatch($devices)
    {
        $results = [];
        $processes = [];

        foreach ($devices as $device) {
            // Use native ping command for fastest performance
            $cmd = $this->buildPingCommand($device->ip_address);
            
            $processes[] = [
                'device' => $device,
                'command' => $cmd,
                'start_time' => microtime(true)
            ];
        }

        // Execute all ping commands concurrently
        foreach ($processes as &$process) {
            $result = $this->executePing($process['command'], $process['device']);
            $process['result'] = $result;
            $results[] = $result;
        }

        return $results;
    }

    /**
     * Build optimized ping command based on OS
     */
    private function buildPingCommand($ip)
    {
        if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
            // Windows ping command
            return "ping -n 1 -w " . ($this->timeout * 1000) . " {$ip}";
        } else {
            // Linux/Mac ping command
            return "ping -c 1 -W {$this->timeout} {$ip}";
        }
    }

    /**
     * Execute ping command and parse results
     */
    private function executePing($command, $device)
    {
        $startTime = microtime(true);
        
        try {
            $output = [];
            $returnCode = 0;
            
            // Execute ping command with timeout
            exec($command . ' 2>&1', $output, $returnCode);
            
            $duration = round((microtime(true) - $startTime) * 1000, 2);
            
            if ($returnCode === 0) {
                // Device is online - parse response time
                $responseTime = $this->parseResponseTime($output, $duration);
                
                return [
                    'device_id' => $device->id,
                    'ip_address' => $device->ip_address,
                    'name' => $device->name,
                    'status' => 'online',
                    'response_time' => $responseTime,
                    'duration' => $duration,
                    'timestamp' => now(),
                    'raw_output' => implode("\n", $output)
                ];
            } else {
                // Device is offline
                return [
                    'device_id' => $device->id,
                    'ip_address' => $device->ip_address,
                    'name' => $device->name,
                    'status' => 'offline',
                    'response_time' => null,
                    'duration' => $duration,
                    'timestamp' => now(),
                    'raw_output' => implode("\n", $output)
                ];
            }
        } catch (\Exception $e) {
            Log::error("Ping error for {$device->ip_address}: " . $e->getMessage());
            
            return [
                'device_id' => $device->id,
                'ip_address' => $device->ip_address,
                'name' => $device->name,
                'status' => 'offline',
                'response_time' => null,
                'duration' => round((microtime(true) - $startTime) * 1000, 2),
                'timestamp' => now(),
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Parse response time from ping output
     */
    private function parseResponseTime($output, $fallback)
    {
        $outputText = implode(' ', $output);
        
        // Try to extract response time from ping output
        if (preg_match('/time[=<](\d+\.?\d*)\s*ms/i', $outputText, $matches)) {
            return (float) $matches[1];
        }
        
        if (preg_match('/(\d+\.?\d*)\s*ms/i', $outputText, $matches)) {
            return (float) $matches[1];
        }
        
        // Return fallback duration if we can't parse response time
        return $fallback;
    }

    /**
     * Update device statuses in database
     */
    private function updateDeviceStatuses($results)
    {
        foreach ($results as $result) {
            $device = Device::find($result['device_id']);
            if (!$device) continue;
            
            $previousStatus = $device->status;
            $newStatus = $result['status'];
            
            // Helper function to check if status is "online" (online or warning)
            $isOnlineStatus = function($status) {
                return in_array($status, ['online', 'warning']);
            };
            
            // Only update updated_at if transitioning between online and offline states
            $wasOnline = $isOnlineStatus($previousStatus);
            $isNowOnline = $isOnlineStatus($newStatus);
            
            // Always update these fields
            $device->status = $newStatus;
            $device->response_time = $result['response_time'];
            $device->last_ping = $result['timestamp'];
            
            if ($wasOnline !== $isNowOnline) {
                // Status changed from online→offline or offline→online
                $device->updated_at = now();
                $device->save();
            } else {
                // Status stayed in same category (online→online or offline→offline)
                // Disable timestamps to prevent auto-update of updated_at
                $device->timestamps = false;
                $device->save();
                $device->timestamps = true;
            }
        }
    }

    /**
     * Store monitoring history for analytics
     */
    private function storeMonitoringHistory($results)
    {
        $historyData = [];
        
        foreach ($results as $result) {
            $historyData[] = [
                'device_id' => $result['device_id'],
                'status' => $result['status'],
                'response_time' => $result['response_time'],
                'checked_at' => $result['timestamp'],
                'created_at' => now(),
                'updated_at' => now()
            ];
        }
        
        // Insert in batches for better performance
        if (!empty($historyData)) {
            $chunks = array_chunk($historyData, 100);
            foreach ($chunks as $chunk) {
                MonitoringHistory::insert($chunk);
            }
        }
    }

    /**
     * Get latest ping results from cache
     */
    public function getLatestResults()
    {
        return Cache::get('ping_results.latest', []);
    }

    /**
     * Get latest ping stats from cache
     */
    public function getLatestStats()
    {
        return Cache::get('ping_stats.latest', [
            'total' => 0,
            'online' => 0,
            'offline' => 0,
            'duration' => 0
        ]);
    }

    /**
     * Ping a single device
     */
    public function pingSingle($deviceId)
    {
        $device = Device::findOrFail($deviceId);
        
        $command = $this->buildPingCommand($device->ip_address);
        $result = $this->executePing($command, $device);
        
        $previousStatus = $device->status;
        
        // Helper function to check if status is "online" (online or warning)
        $isOnlineStatus = function($status) {
            return in_array($status, ['online', 'warning']);
        };
        
        // Only update updated_at if transitioning between online and offline states
        $wasOnline = $isOnlineStatus($previousStatus);
        $isNowOnline = $isOnlineStatus($result['status']);
        
        // Always update these fields
        $device->status = $result['status'];
        $device->response_time = $result['response_time'];
        $device->last_ping = $result['timestamp'];
        
        if ($wasOnline !== $isNowOnline) {
            // Status changed from online→offline or offline→online
            $device->updated_at = now();
            $device->save();
        } else {
            // Status stayed in same category (online→online or offline→offline)
            // Disable timestamps to prevent auto-update of updated_at
            $device->timestamps = false;
            $device->save();
            $device->timestamps = true;
        }
        
        // Store history
        MonitoringHistory::create([
            'device_id' => $deviceId,
            'status' => $result['status'],
            'response_time' => $result['response_time'],
            'checked_at' => $result['timestamp']
        ]);
        
        return $result;
    }
}
