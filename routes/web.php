<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\Api\SwitchController;
use App\Http\Controllers\Api\AlertController;
use App\Http\Controllers\Api\DeviceController;
use App\Http\Controllers\Api\MonitoringController;
use App\Http\Controllers\MonitorController;
use App\Http\Controllers\ConfigurationController;
use App\Models\Device;
use App\Models\Alert;

Route::get('/', function () {
    return redirect('/monitor/dashboard');
});

// Use MonitorController for all monitor routes
Route::prefix('monitor')->group(function () {
    Route::get('/dashboard', [MonitorController::class, 'dashboard'])->name('monitor.dashboard');
    Route::get('/devices', [MonitorController::class, 'devices'])->name('monitor.devices');
    Route::get('/alerts', [MonitorController::class, 'alerts'])->name('monitor.alerts');
    Route::get('/maps', [MonitorController::class, 'maps'])->name('monitor.maps');
    Route::get('/reports', [MonitorController::class, 'reports'])->name('monitor.reports');
    Route::get('/settings', [MonitorController::class, 'settings'])->name('monitor.settings');
    Route::get('/configuration', [MonitorController::class, 'configuration'])->name('monitor.configuration');
});

// API routes
Route::prefix('api')->group(function () {
    // Devices
    Route::get('/devices', [DeviceController::class, 'index']);
    Route::get('/devices/stats', [DeviceController::class, 'stats']);
    Route::get('/dashboard/stats', [DeviceController::class, 'dashboardStats']);
    Route::get('/devices/{id}', [DeviceController::class, 'show']);
    
    // Monitoring - exempt from CSRF for API calls
    Route::get('/monitoring/status', [MonitoringController::class, 'status'])->withoutMiddleware([\App\Http\Middleware\VerifyCsrfToken::class]);
    Route::post('/monitoring/ping-all', [MonitoringController::class, 'pingAllDevices'])->withoutMiddleware([\App\Http\Middleware\VerifyCsrfToken::class]);
    Route::get('/monitoring/ping-status', [MonitoringController::class, 'getPingStatus'])->withoutMiddleware([\App\Http\Middleware\VerifyCsrfToken::class]);
    Route::post('/monitoring/device/{id}/ping', [MonitoringController::class, 'pingSingleDevice'])->withoutMiddleware([\App\Http\Middleware\VerifyCsrfToken::class]);
    Route::get('/monitoring/device/{id}/ping', [MonitoringController::class, 'pingSingleDevice'])->withoutMiddleware([\App\Http\Middleware\VerifyCsrfToken::class]);
    Route::get('/monitoring/device/{id}/history', [MonitoringController::class, 'getDeviceHistory'])->withoutMiddleware([\App\Http\Middleware\VerifyCsrfToken::class]);
    Route::post('/monitoring/category/{category}/ping', [MonitoringController::class, 'pingByCategory'])->withoutMiddleware([\App\Http\Middleware\VerifyCsrfToken::class]);
    Route::get('/monitoring/analytics', [MonitoringController::class, 'analytics'])->withoutMiddleware([\App\Http\Middleware\VerifyCsrfToken::class]);
    Route::post('/monitoring/toggle', [MonitoringController::class, 'toggleMonitoring'])->withoutMiddleware([\App\Http\Middleware\VerifyCsrfToken::class]);
    Route::get('/monitoring/dashboard', [MonitoringController::class, 'dashboard'])->withoutMiddleware([\App\Http\Middleware\VerifyCsrfToken::class]);
});

// NEW: Real ICMP ping system - uses actual Windows ping command like CMD
Route::post('/ping-all-devices', function() {
    try {
        $startTime = microtime(true);
        
        // Get all active devices
        $devices = \App\Models\Device::where('is_active', true)->get();
        
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

        $results = [];
        $onlineCount = 0;
        $offlineCount = 0;
        
        // Real ICMP ping using Windows ping command
        foreach ($devices as $device) {
            try {
                // Use Windows ping command with proper options
                $pingCommand = "ping -n 1 -w 1000 {$device->ip_address}";
                $output = [];
                $returnCode = 0;
                
                $deviceStartTime = microtime(true);
                exec($pingCommand . ' 2>&1', $output, $returnCode);
                $pingDuration = round((microtime(true) - $deviceStartTime) * 1000, 2);
                
                if ($returnCode === 0) {
                    // Device is online - extract real response time from ping output
                    $responseTime = null;
                    $status = 'online';
                    $onlineCount++;
                    
                    // Parse ping output to get actual response time
                    foreach ($output as $line) {
                        if (preg_match('/time[=<](\d+)ms/', $line, $matches)) {
                            $responseTime = (int)$matches[1];
                            break;
                        }
                    }
                    
                    // If we couldn't parse the response time, use the execution time
                    if ($responseTime === null) {
                        $responseTime = $pingDuration;
                    }
                    
                } else {
                    // Device is offline
                    $responseTime = null;
                    $status = 'offline';
                    $offlineCount++;
                }
                
                // Update device with real ping results
                $device->update([
                    'status' => $status,
                    'response_time' => $responseTime,
                    'last_ping' => now(),
                ]);
                
                $results[] = [
                    'id' => $device->id,
                    'ip_address' => $device->ip_address,
                    'status' => $status,
                    'response_time' => $responseTime,
                    'ping_output' => implode("\n", $output), // For debugging
                ];
                
            } catch (\Exception $e) {
                // Error pinging device - mark as offline
                $device->update([
                    'status' => 'offline',
                    'response_time' => null,
                    'last_ping' => now(),
                ]);
                
                $results[] = [
                    'id' => $device->id,
                    'ip_address' => $device->ip_address,
                    'status' => 'offline',
                    'response_time' => null,
                    'error' => $e->getMessage(),
                ];
                $offlineCount++;
            }
        }
        
        $duration = round((microtime(true) - $startTime) * 1000, 2);
        $devicesPerSecond = $duration > 0 ? round(count($devices) / ($duration / 1000), 2) : 0;

        return response()->json([
            'success' => true,
            'message' => 'All devices pinged successfully with real ICMP ping',
            'duration' => $duration,
            'timestamp' => now()->toISOString(),
            'result' => [
                'results' => $results,
                'stats' => [
                    'total' => count($devices),
                    'online' => $onlineCount,
                    'offline' => $offlineCount,
                    'duration' => $duration
                ]
            ],
            'stats' => [
                'total_devices' => count($devices),
                'online_devices' => $onlineCount,
                'offline_devices' => $offlineCount,
                'ping_duration' => $duration,
                'devices_per_second' => $devicesPerSecond,
                'error_count' => 0
            ]
        ]);
        
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error' => 'Failed to ping all devices',
            'message' => $e->getMessage()
        ], 500);
    }
})->withoutMiddleware([\App\Http\Middleware\VerifyCsrfToken::class]);

// Single device ping
Route::post('/ping-device/{id}', function($id) {
    try {
        $device = \App\Models\Device::find($id);
        if (!$device) {
            return response()->json([
                'success' => false,
                'error' => 'Device not found'
            ], 404);
        }
        
        // Use real ICMP ping (same as ping all devices)
        $pingCommand = "ping -n 1 -w 1000 {$device->ip_address}";
        $output = [];
        $returnCode = 0;
        
        $deviceStartTime = microtime(true);
        exec($pingCommand . ' 2>&1', $output, $returnCode);
        
        if ($returnCode === 0) {
            // Device is online - extract real response time from ping output
            $responseTime = null;
            $status = 'online';
            
            // Parse ping output to get actual response time
            foreach ($output as $line) {
                if (preg_match('/time[=<](\d+)ms/', $line, $matches)) {
                    $responseTime = (int)$matches[1];
                    break;
                }
            }
            
            // If we couldn't parse the response time, use execution time
            if ($responseTime === null) {
                $responseTime = round((microtime(true) - $deviceStartTime) * 1000, 2);
            }
        } else {
            // Device is offline
            $responseTime = null;
            $status = 'offline';
        }
        
        $device->update([
            'status' => $status,
            'response_time' => $responseTime,
            'last_ping' => now(),
        ]);
        
        // Refresh device from database to confirm update
        $device->refresh();
        
        return response()->json([
            'success' => true,
            'message' => 'Device pinged successfully',
            'device' => [
                'id' => $device->id,
                'name' => $device->name,
                'ip_address' => $device->ip_address,
                'status' => $device->status,
                'response_time' => $device->response_time,
                'last_ping' => $device->last_ping,
            ],
            'debug' => [
                'ping_command' => $pingCommand,
                'return_code' => $returnCode,
                'raw_output' => $output,
                'database_status_after_update' => $device->status,
                'database_response_time_after_update' => $device->response_time,
            ]
        ]);
        
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error' => 'Failed to ping device',
            'message' => $e->getMessage()
        ], 500);
    }
})->withoutMiddleware([\App\Http\Middleware\VerifyCsrfToken::class]);

// Device Comments API
Route::get('/devices/{id}/comments', function($id) {
    try {
        $device = \App\Models\Device::find($id);
        if (!$device) {
            return response()->json([
                'success' => false,
                'error' => 'Device not found'
            ], 404);
        }
        
        $comments = $device->comments()->with('device:id,name')->get();
        
        return response()->json([
            'success' => true,
            'comments' => $comments
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error' => 'Failed to fetch comments',
            'message' => $e->getMessage()
        ], 500);
    }
});

Route::post('/devices/{id}/comments', function($id) {
    try {
        $device = \App\Models\Device::find($id);
        if (!$device) {
            return response()->json([
                'success' => false,
                'error' => 'Device not found'
            ], 404);
        }
        
        $data = request()->validate([
            'comment' => 'required|string|max:1000',
            'author' => 'nullable|string|max:100',
            'type' => 'in:general,maintenance,issue,note'
        ]);
        
        $comment = $device->comments()->create([
            'comment' => $data['comment'],
            'author' => $data['author'] ?? 'Anonymous',
            'type' => $data['type'] ?? 'general',
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Comment added successfully',
            'comment' => $comment
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error' => 'Failed to add comment',
            'message' => $e->getMessage()
        ], 500);
    }
});

Route::delete('/comments/{commentId}', function($commentId) {
    try {
        $comment = \App\Models\DeviceComment::find($commentId);
        if (!$comment) {
            return response()->json([
                'success' => false,
                'error' => 'Comment not found'
            ], 404);
        }
        
        $comment->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Comment deleted successfully'
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error' => 'Failed to delete comment',
            'message' => $e->getMessage()
        ], 500);
    }
});

// Switches (legacy)
Route::get('/switches', [SwitchController::class, 'index']);
Route::get('/switches/stats', [SwitchController::class, 'stats']);
Route::post('/switches/ping-all', [SwitchController::class, 'pingAll']);
Route::post('/switches/{id}/ping', [SwitchController::class, 'pingSingle']);

// Alerts
Route::get('/alerts', [AlertController::class, 'index']);
Route::get('/alerts/stats', [AlertController::class, 'stats']);
Route::post('/alerts/{id}/read', [AlertController::class, 'markAsRead']);
Route::post('/alerts/{id}/resolve', [AlertController::class, 'resolve']);

// Configuration routes - login without auth
Route::post('/api/config/login', [ConfigurationController::class, 'login'])->name('config.login');

// Protected configuration routes
Route::middleware(['web', 'auth'])->prefix('api/config')->group(function () {
    Route::post('/logout', [ConfigurationController::class, 'logout']);
    
    // Branches
    Route::get('/branches', [ConfigurationController::class, 'getBranches']);
    Route::post('/branches', [ConfigurationController::class, 'createBranch']);
    Route::put('/branches/{id}', [ConfigurationController::class, 'updateBranch']);
    Route::delete('/branches/{id}', [ConfigurationController::class, 'deleteBranch']);
    
    // Devices
    Route::get('/devices', [ConfigurationController::class, 'getDevices']);
    Route::post('/devices', [ConfigurationController::class, 'createDevice']);
    Route::put('/devices/{id}', [ConfigurationController::class, 'updateDevice']);
    Route::delete('/devices/{id}', [ConfigurationController::class, 'deleteDevice']);
    
    // Alerts
    Route::get('/alerts', [ConfigurationController::class, 'getAlerts']);
    Route::put('/alerts/{id}', [ConfigurationController::class, 'updateAlert']);
    Route::delete('/alerts/{id}', [ConfigurationController::class, 'deleteAlert']);
    
    // Locations
    Route::get('/locations', [ConfigurationController::class, 'getLocations']);
    Route::post('/locations', [ConfigurationController::class, 'createLocation']);
    Route::put('/locations/{id}', [ConfigurationController::class, 'updateLocation']);
    Route::delete('/locations/{id}', [ConfigurationController::class, 'deleteLocation']);
    
    // Users
    Route::get('/users', [ConfigurationController::class, 'getUsers']);
    Route::post('/users', [ConfigurationController::class, 'createUser']);
    Route::put('/users/{id}', [ConfigurationController::class, 'updateUser']);
    Route::delete('/users/{id}', [ConfigurationController::class, 'deleteUser']);
});

// Legacy host-monitor route (redirect to new dashboard)
Route::get('host-monitor', function () {
    return redirect()->route('monitor.dashboard');
})->name('host-monitor');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

require __DIR__.'/settings.php';