<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DeviceController;

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