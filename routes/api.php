<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DeviceController;
use App\Http\Controllers\Api\ConfigController;
use App\Http\Controllers\Api\BranchController;
use App\Http\Controllers\Api\AlertController;
use App\Http\Controllers\Api\LocationController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\BrandController;
use App\Http\Controllers\Api\ModelController;
use App\Http\Controllers\Api\ActivityLogController;
use App\Http\Controllers\Api\ReportsController;
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

Route::middleware('api')->group(function () {
    Route::apiResource('branches', BranchController::class);
    Route::apiResource('devices', DeviceController::class);
    Route::apiResource('alerts', AlertController::class);
    Route::apiResource('locations', LocationController::class);
    Route::apiResource('users', UserController::class);
    Route::apiResource('brands', BrandController::class);
    Route::apiResource('models', ModelController::class);
});

// Alert routes (only index, update, destroy - alerts are created by system)
Route::get('alerts', [AlertController::class, 'index']);
Route::put('alerts/{alert}', [AlertController::class, 'update']);
Route::delete('alerts/{alert}', [AlertController::class, 'destroy']);

// Ping routes
Route::post('/devices/{id}/ping', [DeviceController::class, 'ping']);
Route::post('/devices/ping-multiple', [DeviceController::class, 'pingMultiple']);
Route::post('/devices/ping-branch', [DeviceController::class, 'pingBranch']);

// Acknowledge offline
Route::post('/devices/{id}/acknowledge-offline', [DeviceController::class, 'acknowledgeOffline']);

Route::get('hardware/brands', [BrandController::class, 'index']);
Route::get('hardware/models', [ModelController::class, 'index']);

// Brand management routes
Route::get('/brands', [App\Http\Controllers\Api\BrandController::class, 'index']);
Route::post('/brands', [App\Http\Controllers\Api\BrandController::class, 'store']);
Route::put('/brands/{id}', [App\Http\Controllers\Api\BrandController::class, 'update']);
Route::delete('/brands/{id}', [App\Http\Controllers\Api\BrandController::class, 'destroy']);

// Model management routes (hardware models)
Route::get('/models', [App\Http\Controllers\Api\ModelController::class, 'index']);
Route::post('/models', [App\Http\Controllers\Api\ModelController::class, 'store']);
Route::put('/models/{id}', [App\Http\Controllers\Api\ModelController::class, 'update']);
Route::delete('/models/{id}', [App\Http\Controllers\Api\ModelController::class, 'destroy']);

// Device CRUD
Route::get('/devices', [App\Http\Controllers\Api\DeviceController::class, 'index']);
Route::post('/devices', [App\Http\Controllers\Api\DeviceController::class, 'store']);
Route::put('/devices/{id}', [App\Http\Controllers\Api\DeviceController::class, 'update']);
Route::delete('/devices/{id}', [App\Http\Controllers\Api\DeviceController::class, 'destroy']);

// Hardware Model CRUD
Route::get('/models', [App\Http\Controllers\Api\HardwareModelController::class, 'index']);
Route::post('/models', [App\Http\Controllers\Api\HardwareModelController::class, 'store']);
Route::put('/models/{id}', [App\Http\Controllers\Api\HardwareModelController::class, 'update']);
Route::delete('/models/{id}', [App\Http\Controllers\Api\HardwareModelController::class, 'destroy']);

// Activity Logs
Route::get('/activity-logs', [ActivityLogController::class, 'index']);

// Reports
Route::get('/reports/summary', [ReportsController::class, 'summary']);
Route::get('/reports/uptime-stats', [ReportsController::class, 'uptimeStats']);
Route::get('/reports/device-events', [ReportsController::class, 'deviceEvents']);
Route::get('/reports/category-stats', [ReportsController::class, 'categoryStats']);
Route::get('/reports/alert-summary', [ReportsController::class, 'alertSummary']);