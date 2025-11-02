<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\Api\SwitchController;
use App\Http\Controllers\Api\AlertController;
use App\Http\Controllers\Api\DeviceController;
use App\Http\Controllers\MonitorController;
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

require __DIR__.'/settings.php';