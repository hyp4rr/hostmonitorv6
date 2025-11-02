<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\Api\SwitchController;
use App\Http\Controllers\Api\AlertController;
use App\Http\Controllers\Api\DeviceController;
use App\Models\Device;
use App\Models\Alert;

Route::get('/', function () {
    return redirect('/monitor/dashboard');
});

Route::prefix('monitor')->group(function () {
    Route::get('/dashboard', function () {
        $stats = [
            'total' => Device::where('is_active', true)->count(),
            'up' => Device::where('is_active', true)->where('status', 'up')->count(),
            'down' => Device::where('is_active', true)->where('status', 'down')->count(),
            'warning' => Device::where('is_active', true)->where('status', 'warning')->count(),
            'online' => Device::where('is_active', true)->where('status', 'up')->count(),
            'offline' => Device::where('is_active', true)->where('status', 'down')->count(),
        ];
        
        $recentAlerts = Alert::with('device')
            ->whereIn('status', ['open', 'acknowledged'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();
        
        return Inertia::render('monitor/dashboard', [
            'stats' => $stats,
            'recentAlerts' => $recentAlerts,
        ]);
    });

    Route::get('/devices', function () {
        $devices = Device::where('is_active', true)
            ->orderBy('priority')
            ->orderBy('name')
            ->get()
            ->map(function ($device) {
                return [
                    'id' => $device->id,
                    'name' => $device->name,
                    'ip' => $device->ip_address,
                    'ip_address' => $device->ip_address,
                    'type' => $device->type,
                    'category' => $device->category,
                    'status' => $device->status,
                    'uptime' => $device->uptime_percentage . '%',
                    'uptime_percentage' => $device->uptime_percentage,
                    'location' => $device->location,
                    'building' => $device->building,
                    'brand' => $device->manufacturer,
                    'manufacturer' => $device->manufacturer,
                    'model' => $device->model,
                    'priority' => $device->priority,
                    'response_time' => $device->response_time,
                    'last_check' => $device->last_check,
                    'is_monitored' => $device->is_monitored,
                    'is_active' => $device->is_active,
                ];
            });
        
        return Inertia::render('monitor/devices', [
            'devices' => $devices,
        ]);
    });

    Route::get('/maps', function () {
        return Inertia::render('monitor/maps');
    });

    Route::get('/alerts', function () {
        return Inertia::render('monitor/alerts');
    });

    Route::get('/reports', function () {
        return Inertia::render('monitor/reports');
    });

    Route::get('/settings', function () {
        return Inertia::render('monitor/settings');
    });

    Route::get('/configuration', function () {
        return Inertia::render('monitor/configuration');
    });
});

// API routes
Route::prefix('api')->group(function () {
    // Devices
    Route::get('/devices', [DeviceController::class, 'index']);
    Route::get('/devices/stats', [DeviceController::class, 'stats']);
    Route::get('/dashboard/stats', [DeviceController::class, 'dashboardStats']);
    Route::get('/devices/{id}', [DeviceController::class, 'show']);
    
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

use App\Http\Controllers\MonitorController;

Route::prefix('monitor')->group(function () {
    Route::get('/dashboard', [MonitorController::class, 'dashboard'])->name('monitor.dashboard');
    Route::get('/devices', [MonitorController::class, 'devices'])->name('monitor.devices');
    Route::get('/alerts', [MonitorController::class, 'alerts'])->name('monitor.alerts');
    Route::get('/maps', [MonitorController::class, 'maps'])->name('monitor.maps');
    Route::get('/reports', [MonitorController::class, 'reports'])->name('monitor.reports');
    Route::get('/settings', [MonitorController::class, 'settings'])->name('monitor.settings');
    Route::get('/configuration', [MonitorController::class, 'configuration'])->name('monitor.configuration');
});

require __DIR__.'/settings.php';
