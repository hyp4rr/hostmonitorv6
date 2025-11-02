<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DeviceController;
use App\Http\Controllers\ConfigurationController;
use App\Http\Controllers\Api\ConfigController;

// Config authentication (no CSRF required for these endpoints)
Route::post('/config/login', [ConfigController::class, 'login']);

// Protected config routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/config/logout', [ConfigController::class, 'logout']);
    Route::get('/config/verify', [ConfigController::class, 'verify']);
    
    // Config CRUD endpoints
    Route::apiResource('/config/branches', \App\Http\Controllers\Api\BranchController::class);
    Route::apiResource('/config/devices', \App\Http\Controllers\Api\DeviceController::class);
    Route::apiResource('/config/alerts', \App\Http\Controllers\Api\AlertController::class);
    Route::apiResource('/config/locations', \App\Http\Controllers\Api\LocationController::class);
    Route::apiResource('/config/users', \App\Http\Controllers\Api\UserController::class);
    Route::get('/config/hardware/manufacturers', [\App\Http\Controllers\Api\HardwareController::class, 'manufacturers']);
    Route::get('/config/hardware/models', [\App\Http\Controllers\Api\HardwareController::class, 'models']);
});

// Dashboard
Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

// Devices
Route::get('/devices', [DeviceController::class, 'index']);
Route::get('/devices/stats', [DeviceController::class, 'stats']);
Route::get('/devices/{id}', [DeviceController::class, 'show']);
Route::post('/devices/ping-all', [DeviceController::class, 'pingAll']);

// Test API
Route::get('/test', function () {
    return response()->json(['status' => 'API is working']);
});

// Configuration routes (login is public, others require auth)
Route::post('/config/login', [ConfigController::class, 'login']);
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/config/logout', [ConfigController::class, 'logout']);
    Route::get('/config/verify', [ConfigController::class, 'verify']);
    
    // Branches
    Route::apiResource('/config/branches', \App\Http\Controllers\Api\BranchController::class);
    
    // Devices
    Route::apiResource('/config/devices', \App\Http\Controllers\Api\DeviceController::class);
    
    // Alerts
    Route::apiResource('/config/alerts', \App\Http\Controllers\Api\AlertController::class);
    
    // Locations
    Route::apiResource('/config/locations', \App\Http\Controllers\Api\LocationController::class);
    
    // Users
    Route::apiResource('/config/users', \App\Http\Controllers\Api\UserController::class);
    
    // Hardware details
    Route::get('/config/hardware/manufacturers', [\App\Http\Controllers\Api\HardwareController::class, 'manufacturers']);
    Route::get('/config/hardware/models', [\App\Http\Controllers\Api\HardwareController::class, 'models']);
});

// Public config CRUD endpoints (no authentication)
Route::apiResource('/branches', \App\Http\Controllers\Api\BranchController::class);
Route::apiResource('/devices', \App\Http\Controllers\Api\DeviceController::class);
Route::apiResource('/alerts', \App\Http\Controllers\Api\AlertController::class);
Route::apiResource('/locations', \App\Http\Controllers\Api\LocationController::class);
Route::apiResource('/users', \App\Http\Controllers\Api\UserController::class);
Route::get('/hardware/manufacturers', [\App\Http\Controllers\Api\HardwareController::class, 'manufacturers']);
Route::get('/hardware/models', [\App\Http\Controllers\Api\HardwareController::class, 'models']);

// Debug/Test endpoint (remove after debugging)
Route::get('/config/test-user', function () {
    try {
        $users = \App\Models\User::all(['id', 'name', 'email']);
        return response()->json([
            'success' => true,
            'total_users' => $users->count(),
            'users' => $users->map(fn($u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
            ]),
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage(),
        ], 500);
    }
});