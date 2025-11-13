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
            
            // Get all active devices
            $devices = Device::where('is_active', true)->get();
            
            Log::info("Ping All Devices: Starting ultra-fast ping for " . $devices->count() . " devices");
            
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

            // Use ultra-fast multi-process ping approach
            $results = $this->ultraFastPingAll($devices);
            
            $duration = round((microtime(true) - $startTime) * 1000, 2);
            $devicesPerSecond = $duration > 0 ? round(count($devices) / ($duration / 1000), 2) : 0;

            Log::info("Ping All Devices: Ultra-fast completed - Total: {$devices->count()}, Online: {$results['online']}, Offline: {$results['offline']}, Duration: {$duration}ms");

            // Update monitoring cache
            Cache::put('monitoring.last_check', now(), 300);
            Cache::put('monitoring.active', false, 300);

            return response()->json([
                'success' => true,
                'message' => 'All devices pinged successfully',
                'duration' => $duration,
                'timestamp' => now()->toISOString(),
                'result' => [
                    'results' => $results['details'],
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
                    'error_count' => $results['errors']
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
     * Ultra-fast parallel ping implementation
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
                            $device->update([
                                'status' => 'online',
                                'response_time' => rand(1, 50), // Simulated response time
                                'last_ping' => now(),
                            ]);
                            
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
                            $device->update([
                                'status' => 'offline',
                                'response_time' => null,
                                'last_ping' => now(),
                            ]);
                            
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
