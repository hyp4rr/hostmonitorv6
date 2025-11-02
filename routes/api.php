<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DeviceController;
use App\Http\Controllers\ConfigurationController;

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

// Configuration routes - login without auth
Route::post('/config/login', [ConfigurationController::class, 'login']);

// Protected configuration routes
Route::middleware(['auth:sanctum'])->prefix('config')->group(function () {
    Route::post('/logout', [ConfigurationController::class, 'logout']);
    
    // Devices
    Route::get('/devices', [ConfigurationController::class, 'getDevices']);
    Route::post('/devices', [ConfigurationController::class, 'createDevice']);
    Route::put('/devices/{id}', [ConfigurationController::class, 'updateDevice']);
    Route::delete('/devices/{id}', [ConfigurationController::class, 'deleteDevice']);
    
    // Alerts
    Route::get('/alerts', [ConfigurationController::class, 'getAlerts']);
    Route::put('/alerts/{id}', [ConfigurationController::class, 'updateAlert']);
    Route::delete('/alerts/{id}', [ConfigurationController::class, 'deleteAlert']);
});