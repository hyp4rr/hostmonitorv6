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

// Configuration panel routes
Route::post('/config/login', [App\Http\Controllers\Api\ConfigController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/config/logout', [App\Http\Controllers\Api\ConfigController::class, 'logout']);
    
    // Branches
    Route::get('/config/branches', [App\Http\Controllers\Api\BranchController::class, 'index']);
    Route::post('/config/branches', [App\Http\Controllers\Api\BranchController::class, 'store']);
    Route::put('/config/branches/{id}', [App\Http\Controllers\Api\BranchController::class, 'update']);
    Route::delete('/config/branches/{id}', [App\Http\Controllers\Api\BranchController::class, 'destroy']);
    
    // Devices
    Route::get('/config/devices', [App\Http\Controllers\Api\DeviceController::class, 'index']);
    Route::post('/config/devices', [App\Http\Controllers\Api\DeviceController::class, 'store']);
    Route::put('/config/devices/{id}', [App\Http\Controllers\Api\DeviceController::class, 'update']);
    Route::delete('/config/devices/{id}', [App\Http\Controllers\Api\DeviceController::class, 'destroy']);
    
    // Alerts
    Route::get('/config/alerts', [App\Http\Controllers\Api\AlertController::class, 'index']);
    Route::post('/config/alerts', [App\Http\Controllers\Api\AlertController::class, 'store']);
    Route::put('/config/alerts/{id}', [App\Http\Controllers\Api\AlertController::class, 'update']);
    Route::delete('/config/alerts/{id}', [App\Http\Controllers\Api\AlertController::class, 'destroy']);
    
    // Locations
    Route::get('/config/locations', [App\Http\Controllers\Api\LocationController::class, 'index']);
    Route::post('/config/locations', [App\Http\Controllers\Api\LocationController::class, 'store']);
    Route::put('/config/locations/{id}', [App\Http\Controllers\Api\LocationController::class, 'update']);
    Route::delete('/config/locations/{id}', [App\Http\Controllers\Api\LocationController::class, 'destroy']);
    
    // Users
    Route::get('/config/users', [App\Http\Controllers\Api\UserController::class, 'index']);
    Route::post('/config/users', [App\Http\Controllers\Api\UserController::class, 'store']);
    Route::put('/config/users/{id}', [App\Http\Controllers\Api\UserController::class, 'update']);
    Route::delete('/config/users/{id}', [App\Http\Controllers\Api\UserController::class, 'destroy']);
    
    // Hardware details
    Route::get('/config/hardware/manufacturers', [App\Http\Controllers\Api\HardwareDetailController::class, 'manufacturers']);
    Route::get('/config/hardware/models', [App\Http\Controllers\Api\HardwareDetailController::class, 'models']);
});