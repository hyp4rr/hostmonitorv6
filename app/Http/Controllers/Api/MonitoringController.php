<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\FastPingService;
use App\Models\Device;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class MonitoringController extends Controller
{
    private $pingService;

    public function __construct(FastPingService $pingService)
    {
        $this->pingService = $pingService;
    }

    /**
     * Get real-time monitoring status
     */
    public function status()
    {
        try {
            $stats = $this->pingService->getLatestStats();
            $results = $this->pingService->getLatestResults();

            return response()->json([
                'success' => true,
                'timestamp' => now()->toISOString(),
                'stats' => $stats,
                'devices' => $results,
                'monitoring_active' => Cache::get('monitoring.active', false),
                'last_check' => Cache::get('monitoring.last_check'),
            ]);
        } catch (\Exception $e) {
            Log::error('Monitoring status error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to get monitoring status'
            ], 500);
        }
    }

    /**
     * Ping all devices with enterprise optimization
     */
    public function pingAllDevices()
    {
        try {
            $startTime = microtime(true);
            
            // Set time limit at the very beginning
            set_time_limit(600); // 10 minutes
            
            // Clear all possible monitoring locks
            Cache::put('monitoring.active', false, 300);
            Cache::put('monitoring.running', false, 300);
            Cache::put('ping_service.running', false, 300);
            Cache::put('bulk_ping.active', false, 300);
            
            // Clear any stale monitoring data
            Cache::forget('monitoring.lock');
            Cache::forget('ping.lock');
            Cache::forget('bulk_ping.lock');
            
            // Get all active devices, excluding offline acknowledged devices
            $devices = Device::where('is_active', true)
                ->where('status', '!=', 'offline_ack')
                ->get();
            $deviceCount = $devices->count();
            
            Log::info("Ping All Devices: Starting optimized ping for {$deviceCount} devices");
            
            if ($devices->isEmpty()) {
                return response()->json([
                    'success' => true,
                    'message' => 'No devices to ping',
                    'stats' => [
                        'total_devices' => 0,
                        'online_devices' => 0,
                        'offline_devices' => 0,
                        'ping_duration' => 0,
                        'devices_per_second' => 0
                    ]
                ]);
            }
            
            // Optimized for large device sets (5000+ devices)
            // Use parallel processing with larger batches
            $totalDevices = $devices->count();
            $batchSize = 200; // Process 200 devices per batch in parallel
            
            Log::info("Ping All Devices: Starting optimized parallel ping for {$totalDevices} devices (batch size: {$batchSize})");
            
            // Use optimized parallel batch processing
            $results = $this->parallelBatchPingDevices($devices, $batchSize);
            
            $duration = round((microtime(true) - $startTime) * 1000, 2);
            $devicesPerSecond = $duration > 0 ? round($totalDevices / ($duration / 1000), 2) : 0;

            Log::info("Ping All Devices: Completed - Total: {$totalDevices}, Online: {$results['online']}, Offline: {$results['offline']}, Duration: {$duration}ms, Speed: {$devicesPerSecond} devices/sec");

            // Update monitoring cache
            Cache::put('monitoring.last_check', now(), 300);
            Cache::put('monitoring.active', false, 300);

            return response()->json([
                'success' => true,
                'message' => 'All devices pinged successfully',
                'duration' => $duration,
                'timestamp' => now()->toISOString(),
                'result' => [
                    'results' => $results['results'] ?? $results['details'] ?? [],
                    'stats' => [
                        'total' => count($devices),
                        'online' => $results['online'],
                        'offline' => $results['offline'],
                        'duration' => $duration
                    ]
                ],
                'stats' => [
                    'total_devices' => count($devices),
                    'online_devices' => $results['online'],
                    'offline_devices' => $results['offline'],
                    'ping_duration' => $duration,
                    'devices_per_second' => $devicesPerSecond,
                    'error_count' => $results['errors'] ?? 0
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Ping all devices error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to ping all devices',
                'message' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Fast ping implementation for smaller device sets
     */
    public function fastPingAll($devices)
    {
        $onlineCount = 0;
        $offlineCount = 0;
        $results = [];
        
        foreach ($devices as $device) {
            $result = $this->pingSingleDeviceFast($device);
            
            if ($result['status'] === 'online') {
                $onlineCount++;
            } else {
                $offlineCount++;
            }
            
            $results[] = $result;
        }
        
        // Batch update all devices at once for better performance
        $this->batchUpdateDevices($results);
        
        return [
            'online' => $onlineCount,
            'offline' => $offlineCount,
            'results' => $results
        ];
    }

    /**
     * Batch update devices to improve performance
     */
    private function batchUpdateDevices($results)
    {
        foreach ($results as $result) {
            if (isset($result['device'])) {
                $device = $result['device'];
                $previousStatus = $device->status;
                $device->status = $result['status'];
                $device->response_time = $result['response_time'];
                $device->last_ping = now();
                
                // Track online_since timestamp when device goes online
                if ($result['status'] === 'online' && $previousStatus !== 'online') {
                    $device->online_since = now();
                    $device->offline_since = null;
                } elseif ($result['status'] === 'offline' && $previousStatus === 'online') {
                    $device->offline_since = now();
                    $device->online_since = null;
                }
                
                // Update uptime based on new status (calculates real minutes)
                $device->updateUptime();
                
                // Record monitoring history
                $device->recordMonitoringHistory();
                
                $device->save();
            }
        }
    }

    /**
     * Parallel batch ping devices - optimized for 5000+ devices
     */
    private function parallelBatchPingDevices($devices, $batchSize = 200)
    {
        $totalOnline = 0;
        $totalOffline = 0;
        $allResults = [];
        $processedCount = 0;
        $totalDevices = $devices->count();
        $pingTimeout = 2000; // 2000ms (2 seconds) timeout per device for better accuracy
        
        $batches = $devices->chunk($batchSize);
        $batchCount = $batches->count();
        
        Log::info("Parallel Batch Ping: Processing {$totalDevices} devices in {$batchCount} batches of {$batchSize}");
        
        foreach ($batches as $index => $batch) {
            $batchStartTime = microtime(true);
            $batchResults = $this->parallelPingBatch($batch, $pingTimeout);
            $batchDuration = round((microtime(true) - $batchStartTime) * 1000, 2);
            
            $totalOnline += $batchResults['online'];
            $totalOffline += $batchResults['offline'];
            $allResults = array_merge($allResults, $batchResults['results']);
            
            $processedCount += $batch->count();
            $progress = round(($processedCount / $totalDevices) * 100, 1);
            
            Log::info("Batch " . ($index + 1) . "/{$batchCount} completed: {$batch->count()} devices, {$batchResults['online']} online, {$batchResults['offline']} offline, {$batchDuration}ms ({$progress}% complete)");
        }
        
        return [
            'online' => $totalOnline,
            'offline' => $totalOffline,
            'results' => $allResults
        ];
    }
    
    /**
     * Ping a batch of devices in parallel using proc_open
     */
    private function parallelPingBatch($devices, $timeout = 300)
    {
        $onlineCount = 0;
        $offlineCount = 0;
        $results = [];
        $processes = [];
        $deviceMap = [];
        
        // Start all ping processes in parallel
        foreach ($devices as $device) {
            $ip = escapeshellarg($device->ip_address);
            $deviceMap[$device->id] = $device;
            
            if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
                // Windows: -n 2 sends 2 packets for better accuracy, -w is timeout in milliseconds
                $pingCommand = "ping -n 2 -w {$timeout} {$ip} 2>nul";
            } else {
                // Linux/Mac: -c 2 sends 2 packets, -W is timeout in seconds
                $timeoutSeconds = round($timeout / 1000, 1);
                $pingCommand = "ping -c 2 -W {$timeoutSeconds} {$ip} 2>/dev/null";
            }
            
            $descriptorspec = [
                0 => ['pipe', 'r'],
                1 => ['pipe', 'w'],
                2 => ['pipe', 'w']
            ];
            
            $process = @proc_open($pingCommand, $descriptorspec, $pipes);
            
            if (is_resource($process)) {
                stream_set_blocking($pipes[1], false);
                stream_set_blocking($pipes[2], false);
                
                $processes[] = [
                    'process' => $process,
                    'pipes' => $pipes,
                    'device_id' => $device->id,
                    'start_time' => microtime(true)
                ];
            } else {
                // Fallback to exec
                $output = [];
                $returnCode = 1;
                exec($pingCommand, $output, $returnCode);
                
                $status = ($returnCode === 0) ? 'online' : 'offline';
                $responseTime = null;
                
                if ($returnCode === 0) {
                    $outputText = implode(' ', $output);
                    if (preg_match('/time[=<](\d+)ms/i', $outputText, $matches)) {
                        $responseTime = (int)$matches[1];
                    }
                }
                
                if ($status === 'online') {
                    $onlineCount++;
                } else {
                    $offlineCount++;
                }
                
                $results[] = [
                    'id' => $device->id,
                    'device' => $device,
                    'ip_address' => $device->ip_address,
                    'status' => $status,
                    'response_time' => $responseTime,
                ];
            }
        }
        
        // Wait for all processes with timeout
        // Increased wait time to allow for network congestion and slower devices
        // Wait time = ping timeout (2000ms) + buffer (1000ms) = 3000ms total
        $maxWaitTime = 3.0; // 3 seconds max wait (allows for slower network responses and timeout)
        $startWait = microtime(true);
        
        while (!empty($processes) && (microtime(true) - $startWait) < $maxWaitTime) {
            foreach ($processes as $key => $proc) {
                $status = proc_get_status($proc['process']);
                
                if (!$status['running']) {
                    $device = $deviceMap[$proc['device_id']];
                    $output = stream_get_contents($proc['pipes'][1]);
                    
                    fclose($proc['pipes'][0]);
                    fclose($proc['pipes'][1]);
                    fclose($proc['pipes'][2]);
                    proc_close($proc['process']);
                    
                    $returnCode = $status['exitcode'];
                    $isOnline = ($returnCode === 0);
                    $responseTime = null;
                    
                    if ($isOnline) {
                        if (preg_match('/time[=<](\d+)ms/i', $output, $matches)) {
                            $responseTime = (int)$matches[1];
                        }
                        $onlineCount++;
                    } else {
                        $offlineCount++;
                    }
                    
                    $results[] = [
                        'id' => $device->id,
                        'device' => $device,
                        'ip_address' => $device->ip_address,
                        'status' => $isOnline ? 'online' : 'offline',
                        'response_time' => $responseTime,
                    ];
                    
                    unset($processes[$key]);
                }
            }
            
            if (!empty($processes)) {
                usleep(1000); // 1ms sleep
            }
        }
        
        // Clean up remaining processes (only after waiting the full timeout)
        // Check one more time if processes finished (might have completed during cleanup)
        foreach ($processes as $proc) {
            $status = proc_get_status($proc['process']);
            
            if (!$status['running']) {
                // Process finished, get the result
                $device = $deviceMap[$proc['device_id']];
                $output = stream_get_contents($proc['pipes'][1]);
                
                fclose($proc['pipes'][0]);
                fclose($proc['pipes'][1]);
                fclose($proc['pipes'][2]);
                proc_close($proc['process']);
                
                $returnCode = $status['exitcode'];
                $isOnline = ($returnCode === 0);
                $responseTime = null;
                
                if ($isOnline) {
                    if (preg_match('/time[=<](\d+)ms/i', $output, $matches)) {
                        $responseTime = (int)$matches[1];
                    }
                    $onlineCount++;
                } else {
                    $offlineCount++;
                }
                
                $results[] = [
                    'id' => $device->id,
                    'device' => $device,
                    'ip_address' => $device->ip_address,
                    'status' => $isOnline ? 'online' : 'offline',
                    'response_time' => $responseTime,
                ];
            } else {
                // Process still running - terminate it and mark as offline
                proc_terminate($proc['process']);
                fclose($proc['pipes'][0]);
                fclose($proc['pipes'][1]);
                fclose($proc['pipes'][2]);
                proc_close($proc['process']);
                
                $device = $deviceMap[$proc['device_id']];
                $offlineCount++;
                
                $results[] = [
                    'id' => $device->id,
                    'device' => $device,
                    'ip_address' => $device->ip_address,
                    'status' => 'offline',
                    'response_time' => null,
                ];
            }
        }
        
        // Batch update devices
        $this->batchUpdateDevices($results);
        
        return [
            'online' => $onlineCount,
            'offline' => $offlineCount,
            'results' => $results
        ];
    }
    
    /**
     * Batch ping devices to prevent timeout (legacy method)
     */
    private function batchPingDevices($devices, $batchSize = 15)
    {
        return $this->parallelBatchPingDevices($devices, $batchSize);
    }

    /**
     * Fast single device ping with optimized timeout
     */
    private function pingSingleDeviceFast($device)
    {
        $timeout = 2000; // 2000ms (2 seconds) timeout for single device ping for better accuracy
        $startTime = microtime(true);
        
        // Use optimized ping command with timeout
        if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
            // Windows: -n 2 sends 2 packets for better accuracy, -w is timeout in milliseconds
            $command = "ping -n 2 -w " . $timeout . " " . escapeshellarg($device->ip_address) . " 2>nul";
            $output = [];
            $returnCode = 0;
            exec($command, $output, $returnCode);
            $isOnline = ($returnCode === 0);
        } else {
            // Linux/Mac: -c 2 sends 2 packets, -W is timeout in seconds
            $timeoutSeconds = round($timeout / 1000, 1);
            $command = "ping -c 2 -W {$timeoutSeconds} " . escapeshellarg($device->ip_address) . " 2>/dev/null";
            $output = [];
            $returnCode = 0;
            exec($command, $output, $returnCode);
            $isOnline = ($returnCode === 0);
        }
        
        $pingDuration = round((microtime(true) - $startTime) * 1000, 2);
        
        if ($isOnline) {
            // Parse response time from output
            $outputText = implode(' ', $output);
            $responseTime = null;
            if (preg_match('/time[=<](\d+)ms/i', $outputText, $matches)) {
                $responseTime = (int)$matches[1];
            } else {
                $responseTime = $pingDuration;
            }
        } else {
            $responseTime = null;
        }
        
        $status = $isOnline ? 'online' : 'offline';
        
        // Batch database updates for better performance
        // Don't update each device individually, collect and update later
        
        return [
            'id' => $device->id,
            'device' => $device, // Keep device reference for batch update
            'ip_address' => $device->ip_address,
            'status' => $status,
            'response_time' => $responseTime,
        ];
    }

    /**
     * Ultra-fast parallel ping implementation (deprecated - use fastPingAll instead)
     */
    private function ultraFastPingAll($devices)
    {
        $onlineCount = 0;
        $offlineCount = 0;
        $errorCount = 0;
        $results = [];
        
        // Create temporary file to store ping commands
        $tempFile = tempnam(sys_get_temp_dir(), 'ping_batch_');
        $batchFile = $tempFile . '.bat';
        
        // Create batch file for Windows ping commands
        $batchContent = "@echo off\n";
        $batchContent .= "setlocal enabledelayedexpansion\n\n";
        
        foreach ($devices as $index => $device) {
            // Use Windows ping command with timeout
            $batchContent .= "echo Pinging device {$index}: {$device->ip_address}\n";
            $batchContent .= "ping -n 1 -w 1000 {$device->ip_address} > nul 2>&1\n";
            $batchContent .= "if !errorlevel! equ 0 (\n";
            $batchContent .= "    echo ONLINE_{$device->id}_{$device->ip_address}\n";
            $batchContent .= ") else (\n";
            $batchContent .= "    echo OFFLINE_{$device->id}_{$device->ip_address}\n";
            $batchContent .= ")\n\n";
        }
        
        file_put_contents($batchFile, $batchContent);
        
        try {
            // Execute batch file and capture output
            $output = shell_exec($batchFile . ' 2>&1');
            $lines = explode("\n", $output);
            
            // Process results
            foreach ($lines as $line) {
                if (strpos($line, 'ONLINE_') === 0) {
                    $parts = explode('_', $line);
                    if (count($parts) >= 3) {
                        $deviceId = $parts[1];
                        $ipAddress = $parts[2];
                        
                        // Update device in database
                        $device = Device::find($deviceId);
                        if ($device) {
                            $device->status = 'online';
                            $device->response_time = rand(1, 50); // Simulated response time
                            $device->last_ping = now();
                            
                            // Update uptime based on new status
                            $device->updateUptime();
                            
                            // Record monitoring history
                            $device->recordMonitoringHistory();
                            
                            $device->save();
                            
                            $results[] = [
                                'id' => $deviceId,
                                'ip_address' => $ipAddress,
                                'status' => 'online',
                                'response_time' => rand(1, 50),
                            ];
                            $onlineCount++;
                        }
                    }
                } elseif (strpos($line, 'OFFLINE_') === 0) {
                    $parts = explode('_', $line);
                    if (count($parts) >= 3) {
                        $deviceId = $parts[1];
                        $ipAddress = $parts[2];
                        
                        // Update device in database
                        $device = Device::find($deviceId);
                        if ($device) {
                            $device->status = 'offline';
                            $device->response_time = null;
                            $device->last_ping = now();
                            
                            // Update uptime based on new status
                            $device->updateUptime();
                            
                            // Record monitoring history
                            $device->recordMonitoringHistory();
                            
                            $device->save();
                            
                            $results[] = [
                                'id' => $deviceId,
                                'ip_address' => $ipAddress,
                                'status' => 'offline',
                                'response_time' => null,
                            ];
                            $offlineCount++;
                        }
                    }
                }
            }
            
        } catch (\Exception $e) {
            Log::error('Batch ping execution error: ' . $e->getMessage());
            $errorCount = count($devices);
            $offlineCount = count($devices);
        } finally {
            // Clean up temporary files
            if (file_exists($batchFile)) {
                unlink($batchFile);
            }
            if (file_exists($tempFile)) {
                unlink($tempFile);
            }
        }
        
        return [
            'online' => $onlineCount,
            'offline' => $offlineCount,
            'errors' => $errorCount,
            'details' => $results
        ];
    }

    /**
     * Ping a single device with detailed response
     */
    public function pingSingleDevice($id)
    {
        try {
            $device = Device::findOrFail($id);
            $startTime = microtime(true);
            
            // Use enterprise ping service if available
            if (class_exists('App\Services\EnterprisePingService')) {
                $pingService = new \App\Services\EnterprisePingService();
                $result = $pingService->executeOptimizedPing($device);
            } else {
                $result = $this->pingService->pingSingle($id);
            }
            
            $duration = round((microtime(true) - $startTime) * 1000, 2);

            // Update device status and response time
            $device->status = $result['status'];
            $device->response_time = $result['response_time'];
            $device->last_ping = now();
            
            // Update uptime based on new status
            $device->updateUptime();
            
            // Record monitoring history
            $device->recordMonitoringHistory();
            
            $device->save();

            // Get device's recent ping history
            $recentHistory = \App\Models\MonitoringHistory::where('device_id', $id)
                ->orderBy('checked_at', 'desc')
                ->limit(10)
                ->get()
                ->map(function ($record) {
                    return [
                        'status' => $record->status,
                        'response_time' => $record->response_time,
                        'checked_at' => $record->checked_at->toISOString(),
                    ];
                });

            return response()->json([
                'success' => true,
                'message' => 'Device pinged successfully',
                'timestamp' => now()->toISOString(),
                'device' => [
                    'id' => $device->id,
                    'name' => $device->name,
                    'ip_address' => $device->ip_address,
                    'category' => $device->category,
                    'location' => $device->location?->name,
                    'branch' => $device->branch?->name,
                ],
                'ping_result' => $result,
                'duration' => $duration,
                'recent_history' => $recentHistory,
                'stats' => [
                    'current_status' => $result['status'],
                    'response_time' => $result['response_time'],
                    'ping_duration' => $result['duration'],
                    'is_online' => $result['status'] === 'online',
                    'performance' => $this->categorizePerformance($result['response_time'])
                ]
            ]);
        } catch (\Exception $e) {
            Log::error("Ping single device {$id} error: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to ping device',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Categorize ping performance
     */
    private function categorizePerformance($responseTime)
    {
        if ($responseTime === null) {
            return 'offline';
        } elseif ($responseTime < 10) {
            return 'excellent';
        } elseif ($responseTime < 50) {
            return 'good';
        } elseif ($responseTime < 100) {
            return 'fair';
        } else {
            return 'poor';
        }
    }

    /**
     * Get real-time ping status for all devices
     */
    public function getPingStatus()
    {
        try {
            $devices = Device::where('is_active', true)
                ->with(['branch', 'location'])
                ->get()
                ->map(function ($device) {
                    return [
                        'id' => $device->id,
                        'name' => $device->name,
                        'ip_address' => $device->ip_address,
                        'status' => $device->status,
                        'response_time' => $device->response_time,
                        'last_ping' => $device->last_ping?->toISOString(),
                        'category' => $device->category,
                        'location' => $device->location?->name,
                        'branch' => $device->branch?->name,
                        'performance' => $this->categorizePerformance($device->response_time)
                    ];
                });

            return response()->json([
                'success' => true,
                'timestamp' => now()->toISOString(),
                'devices' => $devices,
                'stats' => [
                    'total' => $devices->count(),
                    'online' => $devices->where('status', 'online')->count(),
                    'offline' => $devices->where('status', 'offline')->count(),
                    'warning' => $devices->where('status', 'warning')->count(),
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Get ping status error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to get ping status'
            ], 500);
        }
    }

    /**
     * Ping devices by category
     */
    public function pingByCategory($category)
    {
        try {
            $devices = Device::where('is_active', true)
                ->where('category', $category)
                ->where('status', '!=', 'offline_ack')
                ->get();

            if ($devices->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'error' => 'No devices found in this category'
                ], 404);
            }

            $startTime = microtime(true);
            $results = [];

            foreach ($devices as $device) {
                if (class_exists('App\Services\EnterprisePingService')) {
                    $pingService = new \App\Services\EnterprisePingService();
                    $result = $pingService->executeOptimizedPing($device);
                } else {
                    $result = $this->pingService->pingSingle($device->id);
                }
                $results[] = $result;
            }

            $duration = round((microtime(true) - $startTime) * 1000, 2);

            return response()->json([
                'success' => true,
                'message' => "Pinged {$devices->count()} devices in category '{$category}'",
                'category' => $category,
                'duration' => $duration,
                'timestamp' => now()->toISOString(),
                'results' => $results,
                'stats' => [
                    'total_devices' => $devices->count(),
                    'online_devices' => count(array_filter($results, fn($r) => $r['status'] === 'online')),
                    'offline_devices' => count(array_filter($results, fn($r) => $r['status'] === 'offline')),
                ]
            ]);
        } catch (\Exception $e) {
            Log::error("Ping by category {$category} error: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to ping devices by category',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get monitoring history for a device
     */
    public function getDeviceHistory($id, Request $request)
    {
        try {
            $limit = min($request->get('limit', 100), 1000); // Max 1000 records
            $hours = min($request->get('hours', 24), 168); // Max 7 days

            $history = \App\Models\MonitoringHistory::where('device_id', $id)
                ->where('checked_at', '>=', now()->subHours($hours))
                ->orderBy('checked_at', 'desc')
                ->limit($limit)
                ->get()
                ->map(function ($record) {
                    return [
                        'status' => $record->status,
                        'response_time' => $record->response_time,
                        'checked_at' => $record->checked_at->toISOString(),
                        'timestamp' => $record->checked_at->timestamp,
                    ];
                });

            return response()->json([
                'success' => true,
                'history' => $history,
                'stats' => [
                    'total_checks' => $history->count(),
                    'online_checks' => $history->where('status', 'online')->count(),
                    'offline_checks' => $history->where('status', 'offline')->count(),
                    'avg_response_time' => $history->where('response_time', '>', 0)->avg('response_time'),
                ]
            ]);
        } catch (\Exception $e) {
            Log::error("Device history {$id} error: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to get device history'
            ], 500);
        }
    }

    /**
     * Get monitoring analytics
     */
    public function analytics(Request $request)
    {
        try {
            $hours = min($request->get('hours', 24), 168); // Max 7 days
            
            // Get overall uptime stats
            $totalDevices = \App\Models\Device::where('is_active', true)->count();
            $onlineDevices = \App\Models\Device::where('is_active', true)
                ->where('status', 'online')
                ->count();
            $offlineDevices = $totalDevices - $onlineDevices;

            // Get recent monitoring history
            $recentHistory = \App\Models\MonitoringHistory::where('checked_at', '>=', now()->subHours($hours))
                ->get();

            // Calculate uptime percentage
            $totalChecks = $recentHistory->count();
            $onlineChecks = $recentHistory->where('status', 'online')->count();
            $uptimePercentage = $totalChecks > 0 ? round(($onlineChecks / $totalChecks) * 100, 2) : 0;

            // Get response time stats
            $responseTimes = $recentHistory->where('response_time', '>', 0)->pluck('response_time');
            $avgResponseTime = $responseTimes->isNotEmpty() ? round($responseTimes->avg(), 2) : 0;
            $minResponseTime = $responseTimes->isNotEmpty() ? $responseTimes->min() : 0;
            $maxResponseTime = $responseTimes->isNotEmpty() ? $responseTimes->max() : 0;

            // Get device uptime breakdown
            $deviceUptime = \App\Models\Device::where('is_active', true)
                ->select('name', 'status', 'uptime_percentage')
                ->orderBy('uptime_percentage', 'asc')
                ->get()
                ->map(function ($device) {
                    return [
                        'name' => $device->name,
                        'status' => $device->status,
                        'uptime_percentage' => $device->uptime_percentage ?? 0,
                    ];
                });

            return response()->json([
                'success' => true,
                'period' => [
                    'hours' => $hours,
                    'from' => now()->subHours($hours)->toISOString(),
                    'to' => now()->toISOString(),
                ],
                'overview' => [
                    'total_devices' => $totalDevices,
                    'online_devices' => $onlineDevices,
                    'offline_devices' => $offlineDevices,
                    'uptime_percentage' => $uptimePercentage,
                ],
                'performance' => [
                    'total_checks' => $totalChecks,
                    'online_checks' => $onlineChecks,
                    'avg_response_time' => $avgResponseTime,
                    'min_response_time' => $minResponseTime,
                    'max_response_time' => $maxResponseTime,
                ],
                'devices' => $deviceUptime,
            ]);
        } catch (\Exception $e) {
            Log::error('Monitoring analytics error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to get analytics'
            ], 500);
        }
    }

    /**
     * Start/stop continuous monitoring
     */
    public function toggleMonitoring(Request $request)
    {
        try {
            $action = $request->get('action'); // 'start' or 'stop'
            
            if ($action === 'start') {
                Cache::put('monitoring.active', true, 3600); // Active for 1 hour
                return response()->json([
                    'success' => true,
                    'message' => 'Continuous monitoring started',
                    'active' => true,
                ]);
            } elseif ($action === 'stop') {
                Cache::put('monitoring.active', false, 3600);
                return response()->json([
                    'success' => true,
                    'message' => 'Continuous monitoring stopped',
                    'active' => false,
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'error' => 'Invalid action. Use "start" or "stop"'
                ], 400);
            }
        } catch (\Exception $e) {
            Log::error('Toggle monitoring error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to toggle monitoring'
            ], 500);
        }
    }

    /**
     * Get real-time dashboard data
     */
    public function dashboard()
    {
        try {
            $stats = $this->pingService->getLatestStats();
            $results = $this->pingService->getLatestResults();

            // Get recent alerts (status changes)
            $recentAlerts = \App\Models\MonitoringHistory::with('device')
                ->where('checked_at', '>=', now()->subMinutes(30))
                ->orderBy('checked_at', 'desc')
                ->limit(10)
                ->get()
                ->map(function ($record) {
                    return [
                        'device_name' => $record->device->name ?? 'Unknown',
                        'status' => $record->status,
                        'response_time' => $record->response_time,
                        'checked_at' => $record->checked_at->toISOString(),
                    ];
                });

            return response()->json([
                'success' => true,
                'timestamp' => now()->toISOString(),
                'stats' => $stats,
                'devices' => $results,
                'recent_alerts' => $recentAlerts,
                'monitoring' => [
                    'active' => Cache::get('monitoring.active', false),
                    'last_check' => Cache::get('monitoring.last_check'),
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Dashboard monitoring error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to get dashboard data'
            ], 500);
        }
    }
}
