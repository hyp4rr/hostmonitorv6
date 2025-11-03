<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DeviceController;
use App\Http\Controllers\Api\ConfigController;
use App\Http\Controllers\Api\BranchController;
use App\Http\Controllers\Api\AlertController;
use App\Http\Controllers\Api\LocationController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\HardwareDetailController;
use Illuminate\Http\Request;

// Config authentication (no CSRF required for these endpoints)
Route::post('/config/login', [ConfigController::class, 'login']);

// Protected config routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/config/logout', [ConfigController::class, 'logout']);
    Route::get('/config/verify', [ConfigController::class, 'verify']);
});

// Dashboard
Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

// Test API
Route::get('/test', function () {
    return response()->json(['status' => 'API is working']);
});

// Public CRUD endpoints (no authentication required per project specs)
// Using apiResource for RESTful routes - this automatically creates all routes including PUT
Route::apiResource('branches', BranchController::class);
Route::apiResource('devices', DeviceController::class);
Route::apiResource('alerts', AlertController::class);
Route::apiResource('locations', LocationController::class);
Route::apiResource('users', UserController::class);

// Additional device routes
Route::get('/devices/stats', [DeviceController::class, 'stats']);
Route::post('/devices/ping-all', [DeviceController::class, 'pingAll']);
Route::post('/devices/{id}/ping', [DeviceController::class, 'ping']);

// Hardware detail helper routes
Route::get('/hardware/manufacturers', [HardwareDetailController::class, 'manufacturers']);
Route::get('/hardware/models', [HardwareDetailController::class, 'models']);