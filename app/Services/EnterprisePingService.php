<?php

namespace App\Services;

use App\Models\Device;
use App\Models\MonitoringHistory;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class EnterprisePingService
{
    private $timeout;
    private $maxConcurrent;
    private $batchSize;
    private $cache;

    public function __construct()
    {
        $this->timeout = config('monitoring.timeout', 0.5); // Faster timeout for scale
        $this->maxConcurrent = config('monitoring.max_concurrent', 100); // Higher concurrency
        $this->batchSize = config('monitoring.batch_size', 500); // Process in larger batches
        $this->cache = Cache::store(); // Use Laravel cache instead of Redis directly
    }

    /**
     * Monitor all devices with enterprise-scale optimization
     */
    public function monitorAllDevices()
    {
        $startTime = microtime(true);
        $monitoringId = uniqid('monitor_', true);
        
        // Clear any existing monitoring locks
        Cache::put('monitoring.active', false, 300);
        
        Log::info("Starting enterprise monitoring for 3000+ devices", [
            'monitoring_id' => $monitoringId,
            'start_time' => now()->toISOString()
        ]);

        try {
            // Get device count and strategy
            $totalDevices = Device::where('is_active', true)->count();
            
            if ($totalDevices === 0) {
                return $this->emptyResult();
            }

            // Choose monitoring strategy based on device count
            if ($totalDevices > 1000) {
                $result = $this->largeScaleMonitoring($monitoringId);
            } elseif ($totalDevices > 100) {
                $result = $this->mediumScaleMonitoring($monitoringId);
            } else {
                $result = $this->smallScaleMonitoring($monitoringId);
            }

            $duration = round((microtime(true) - $startTime) * 1000, 2);
            
            // Cache results with different strategies based on scale
            $this->cacheResults($result, $monitoringId, $totalDevices);

            Log::info("Enterprise monitoring completed", [
                'monitoring_id' => $monitoringId,
                'total_devices' => $totalDevices,
                'duration' => $duration,
                'online' => $result['stats']['online'],
                'offline' => $result['stats']['offline']
            ]);

            return $result;

        } catch (\Exception $e) {
            Log::error("Enterprise monitoring failed", [
                'monitoring_id' => $monitoringId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResult($e->getMessage());
        }
    }

    /**
     * Large-scale monitoring for 1000+ devices
     */
    private function largeScaleMonitoring($monitoringId)
    {
        Log::info("Using large-scale monitoring strategy", ['monitoring_id' => $monitoringId]);

        // Process devices in chunks for memory efficiency, excluding offline acknowledged devices
        $chunks = Device::where('is_active', true)
            ->where('status', '!=', 'offline_ack')
            ->orderBy('id') // Consistent ordering for distributed processing
            ->chunk($this->batchSize, function ($devices) use ($monitoringId) {
                $this->processDeviceChunk($devices, $monitoringId);
            });

        // Get aggregated results from cache
        return $this->getAggregatedResults($monitoringId);
    }

    /**
     * Medium-scale monitoring for 100-1000 devices
     */
    private function mediumScaleMonitoring($monitoringId)
    {
        Log::info("Using medium-scale monitoring strategy", ['monitoring_id' => $monitoringId]);

        $devices = Device::where('is_active', true)
            ->where('status', '!=', 'offline_ack')
            ->orderBy('id')
            ->get();

        return $this->processBatchDevices($devices, $monitoringId);
    }

    /**
     * Small-scale monitoring for <100 devices
     */
    private function smallScaleMonitoring($monitoringId)
    {
        Log::info("Using small-scale monitoring strategy", ['monitoring_id' => $monitoringId]);

        $devices = Device::where('is_active', true)
            ->where('status', '!=', 'offline_ack')
            ->get();
        return $this->processBatchDevices($devices, $monitoringId);
    }

    /**
     * Process a chunk of devices efficiently
     */
    private function processDeviceChunk($devices, $monitoringId)
    {
        $chunkResults = [];
        $processes = [];

        // Split chunk into smaller concurrent batches
        $concurrentBatches = $devices->chunk($this->maxConcurrent);

        foreach ($concurrentBatches as $batch) {
            $batchResults = $this->pingConcurrentBatch($batch);
            $chunkResults = array_merge($chunkResults, $batchResults);
            
            // Update database in batches for performance
            $this->updateDeviceStatusesBatch($batchResults);
            
            // Store history in batches
            $this->storeMonitoringHistoryBatch($batchResults);
            
            // Clear memory
            unset($batchResults);
        }

        // Cache chunk results for aggregation
        $chunkKey = "monitoring_chunk_{$monitoringId}_" . $devices->first()->id;
        $this->cache->put($chunkKey, $chunkResults, 300); // 5 minutes
        
        // Track chunk keys for aggregation
        $chunkKeysKey = "monitoring_chunks_{$monitoringId}";
        $chunkKeys = $this->cache->get($chunkKeysKey, []);
        $chunkKeys[] = $chunkKey;
        $this->cache->put($chunkKeysKey, $chunkKeys, 300);

        return $chunkResults;
    }

    /**
     * Process devices in batches with optimized execution
     */
    private function processBatchDevices($devices, $monitoringId)
    {
        $allResults = [];
        $batches = $devices->chunk($this->maxConcurrent);

        foreach ($batches as $batchIndex => $batch) {
            $batchResults = $this->pingConcurrentBatch($batch);
            $allResults = array_merge($allResults, $batchResults);

            // Update statuses in batches
            if ($batchIndex % 5 === 0) { // Update every 5 batches
                $this->updateDeviceStatusesBatch($batchResults);
            }
        }

        // Final update for remaining devices
        $this->updateDeviceStatusesBatch($allResults);
        $this->storeMonitoringHistoryBatch($allResults);

        return $this->formatResults($allResults);
    }

    /**
     * Ping a batch of devices concurrently with optimized execution
     */
    private function pingConcurrentBatch($devices)
    {
        $results = [];
        $startTime = microtime(true);

        // Use process pool for better performance at scale
        if ($devices->count() > 50) {
            $results = $this->pingWithProcessPool($devices);
        } else {
            $results = $this->pingWithExec($devices);
        }

        $duration = round((microtime(true) - $startTime) * 1000, 2);
        Log::debug("Batch completed", [
            'device_count' => $devices->count(),
            'duration' => $duration,
            'devices_per_second' => round($devices->count() / ($duration / 1000), 2)
        ]);

        return $results;
    }

    /**
     * Use process pool for large batches (Windows compatible alternative)
     */
    private function pingWithProcessPool($devices)
    {
        $results = [];
        
        // For Windows compatibility, use optimized exec with batching
        foreach ($devices as $device) {
            $result = $this->executeOptimizedPing($device);
            $results[] = $result;
        }

        return $results;
    }

    /**
     * Standard exec-based ping for smaller batches
     */
    private function pingWithExec($devices)
    {
        $results = [];
        
        foreach ($devices as $device) {
            $result = $this->executeOptimizedPing($device);
            $results[] = $result;
        }

        return $results;
    }

    /**
     * Execute optimized ping with caching
     */
    public function executeOptimizedPing($device)
    {
        $startTime = microtime(true);
        
        // Check cache first for very recent results
        $cacheKey = "ping_result_{$device->id}";
        $cached = $this->cache->get($cacheKey);
        
        if ($cached) {
            // Use cached result if less than 30 seconds old
            if (isset($cached['timestamp']) && (time() - $cached['timestamp']) < 30) {
                return $cached['data'];
            }
        }

        try {
            $command = $this->buildOptimizedPingCommand($device->ip_address);
            $output = [];
            $returnCode = 0;
            
            exec($command . ' 2>&1', $output, $returnCode);
            
            $duration = round((microtime(true) - $startTime) * 1000, 2);
            
            if ($returnCode === 0) {
                $responseTime = $this->parseResponseTime($output, $duration);
                $status = 'online';
            } else {
                $responseTime = null;
                $status = 'offline';
            }

            $result = [
                'device_id' => $device->id,
                'ip_address' => $device->ip_address,
                'name' => $device->name,
                'status' => $status,
                'response_time' => $responseTime,
                'duration' => $duration,
                'timestamp' => now(),
                'batch_id' => uniqid('batch_', true)
            ];

            // Cache result for 30 seconds
            $this->cache->put($cacheKey, [
                'data' => $result,
                'timestamp' => time()
            ], 30);

            return $result;

        } catch (\Exception $e) {
            Log::error("Ping execution failed", [
                'device_id' => $device->id,
                'ip_address' => $device->ip_address,
                'error' => $e->getMessage()
            ]);

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
     * Build optimized ping command
     */
    private function buildOptimizedPingCommand($ip)
    {
        if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
            // Windows: optimized for speed
            return "ping -n 1 -w " . ($this->timeout * 1000) . " {$ip}";
        } else {
            // Linux/Mac: optimized for speed
            return "ping -c 1 -W {$this->timeout} {$ip}";
        }
    }

    /**
     * Parse response time efficiently
     */
    private function parseResponseTime($output, $fallback)
    {
        $outputText = implode(' ', $output);
        
        // Optimized regex patterns
        if (preg_match('/time[=<](\d+\.?\d*)\s*ms/i', $outputText, $matches)) {
            return (float) $matches[1];
        }
        
        if (preg_match('/(\d+\.?\d*)\s*ms/i', $outputText, $matches)) {
            return (float) $matches[1];
        }
        
        return $fallback;
    }

    /**
     * Update device statuses in database batches
     */
    public function updateDeviceStatusesBatch($results)
    {
        $updateData = [];
        
        foreach ($results as $result) {
            $device = Device::find($result['device_id']);
            if (!$device) continue;
            
            $previousStatus = $device->status;
            $newStatus = $result['status'];
            
            // Track offline timestamp
            if ($newStatus === 'offline' && $previousStatus !== 'offline') {
                // Device just went offline
                $device->offline_since = now();
                $device->online_since = null;
                $device->offline_alert_sent = false;
            } elseif ($newStatus === 'online' && $previousStatus === 'offline') {
                // Device came back online
                $device->online_since = now();
                $device->offline_since = null;
                $device->offline_alert_sent = false;
            }
            
            $updateFields = [
                'id' => $result['device_id'],
                'status' => $result['status'],
                'response_time' => $result['response_time'],
                'last_ping' => $result['timestamp'],
            ];
            
            // Helper function to check if status is "online" (online or warning)
            $isOnlineStatus = function($status) {
                return in_array($status, ['online', 'warning']);
            };
            
            // Only update updated_at if transitioning between online and offline states
            $wasOnline = $isOnlineStatus($previousStatus);
            $isNowOnline = $isOnlineStatus($newStatus);
            
            if ($wasOnline !== $isNowOnline) {
                // Status changed from online→offline or offline→online
                $updateFields['updated_at'] = now();
            }
            
            $updateData[] = $updateFields;
            
            // Check for 2-minute offline alert
            if ($newStatus === 'offline' && !$device->offline_alert_sent) {
                $offlineSince = $device->offline_since ?: $device->last_status_change ?: $device->updated_at;
                $offlineMinutes = $offlineSince->diffInMinutes(now());
                
                if ($offlineMinutes >= 2) {
                    // Create alert for device offline for 2+ minutes
                    try {
                        \App\Models\Alert::create([
                            'device_id' => $device->id,
                            'type' => 'device_offline',
                            'severity' => 'high',
                            'category' => 'connectivity',
                            'title' => "Device Offline: {$device->name}",
                            'message' => "Device {$device->name} ({$device->ip_address}) has been offline for {$offlineMinutes} minutes.",
                            'status' => 'active',
                            'triggered_at' => now(),
                            'downtime' => "{$offlineMinutes} minutes",
                        ]);
                        
                        $device->offline_alert_sent = true;
                        Log::info("Created 2-minute offline alert", [
                            'device_id' => $device->id,
                            'device_name' => $device->name,
                            'offline_minutes' => $offlineMinutes
                        ]);
                    } catch (\Exception $e) {
                        Log::error("Failed to create offline alert", [
                            'device_id' => $device->id,
                            'error' => $e->getMessage()
                        ]);
                    }
                }
            }
        }

        // Use bulk update for performance
        $this->bulkUpdateDevices($updateData);
        
        // Save devices with alert flags
        foreach ($results as $result) {
            $device = Device::find($result['device_id']);
            if ($device && ($device->isDirty('offline_alert_sent') || $device->isDirty('offline_since') || $device->isDirty('online_since'))) {
                $device->save();
            }
        }
    }

    /**
     * Bulk update devices for better performance
     */
    private function bulkUpdateDevices($updateData)
    {
        foreach ($updateData as $data) {
            $device = Device::find($data['id']);
            if (!$device) continue;
            
            // Always update these fields
            $device->status = $data['status'];
            $device->response_time = $data['response_time'];
            $device->last_ping = $data['last_ping'];
            
            // Only include updated_at if it was set (status changed)
            if (isset($data['updated_at'])) {
                $device->updated_at = $data['updated_at'];
                $device->save();
            } else {
                // Disable timestamps to prevent auto-update of updated_at
                $device->timestamps = false;
                $device->save();
                $device->timestamps = true;
            }
        }
    }

    /**
     * Store monitoring history in batches
     */
    public function storeMonitoringHistoryBatch($results)
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

        // Insert in large chunks for performance
        if (!empty($historyData)) {
            $chunks = array_chunk($historyData, 1000);
            foreach ($chunks as $chunk) {
                MonitoringHistory::insert($chunk);
            }
        }
    }

    /**
     * Get aggregated results from cache
     */
    private function getAggregatedResults($monitoringId)
    {
        // Get all chunk results from cache
        $allResults = [];
        
        // Since we can't use Redis keys pattern, we'll use a different approach
        // Store a list of chunk keys in a main key
        $chunkKeysKey = "monitoring_chunks_{$monitoringId}";
        $chunkKeys = $this->cache->get($chunkKeysKey, []);
        
        foreach ($chunkKeys as $key) {
            $chunkData = $this->cache->get($key);
            if ($chunkData) {
                $allResults = array_merge($allResults, $chunkData);
            }
            
            // Clean up chunk data
            $this->cache->forget($key);
        }
        
        // Clean up the chunk keys list
        $this->cache->forget($chunkKeysKey);

        return $this->formatResults($allResults);
    }

    /**
     * Format results consistently
     */
    private function formatResults($results)
    {
        $stats = [
            'total' => count($results),
            'online' => count(array_filter($results, fn($r) => $r['status'] === 'online')),
            'offline' => count(array_filter($results, fn($r) => $r['status'] === 'offline')),
            'duration' => 0 // Will be calculated by caller
        ];

        return [
            'success' => true,
            'message' => "Monitored {$stats['total']} devices",
            'results' => $results,
            'stats' => $stats
        ];
    }

    /**
     * Cache results with appropriate strategy
     */
    private function cacheResults($result, $monitoringId, $deviceCount)
    {
        // Cache duration based on device count
        $cacheDuration = $deviceCount > 1000 ? 120 : 60; // Longer cache for larger sets
        
        $this->cache->put('monitoring_results_latest', $result, $cacheDuration);
        $this->cache->put('monitoring_stats_latest', $result['stats'], $cacheDuration);
        
        // Also use Laravel cache for compatibility
        Cache::put('ping_results.latest', $result['results'], $cacheDuration);
        Cache::put('ping_stats.latest', $result['stats'], $cacheDuration);
    }

    /**
     * Get monitoring statistics
     */
    public function getStats()
    {
        // Try cache first for performance
        $cached = $this->cache->get('monitoring_stats_latest');
        if ($cached) {
            return $cached;
        }

        // Fallback to Laravel cache
        return Cache::get('ping_stats.latest', [
            'total' => 0,
            'online' => 0,
            'offline' => 0,
            'duration' => 0
        ]);
    }

    /**
     * Get latest results
     */
    public function getResults()
    {
        // Try cache first for performance
        $cached = $this->cache->get('monitoring_results_latest');
        if ($cached) {
            return $cached['results'] ?? [];
        }

        // Fallback to Laravel cache
        return Cache::get('ping_results.latest', []);
    }

    /**
     * Empty result helper
     */
    private function emptyResult()
    {
        return [
            'success' => true,
            'message' => 'No devices to monitor',
            'results' => [],
            'stats' => [
                'total' => 0,
                'online' => 0,
                'offline' => 0,
                'duration' => 0
            ]
        ];
    }

    /**
     * Error result helper
     */
    private function errorResult($message)
    {
        return [
            'success' => false,
            'message' => $message,
            'results' => [],
            'stats' => [
                'total' => 0,
                'online' => 0,
                'offline' => 0,
                'duration' => 0
            ]
        ];
    }
}
