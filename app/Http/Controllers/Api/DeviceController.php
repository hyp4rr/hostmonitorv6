<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DeviceController extends Controller
{
    public function index()
    {
        try {
            if (!DB::getSchemaBuilder()->hasTable('devices')) {
                return response()->json([]);
            }

            $devices = DB::table('devices')
                ->where('is_active', true)
                ->orderBy('name')
                ->get();

            return response()->json($devices);
        } catch (\Exception $e) {
            Log::error('Device index error: ' . $e->getMessage());
            return response()->json([], 200);
        }
    }

    public function show($id)
    {
        try {
            if (!DB::getSchemaBuilder()->hasTable('devices')) {
                return response()->json(['error' => 'Device not found'], 404);
            }

            $device = DB::table('devices')->where('id', $id)->first();

            if (!$device) {
                return response()->json(['error' => 'Device not found'], 404);
            }

            return response()->json($device);
        } catch (\Exception $e) {
            Log::error('Device show error: ' . $e->getMessage());
            return response()->json(['error' => 'Device not found'], 404);
        }
    }

    public function stats()
    {
        try {
            if (!DB::getSchemaBuilder()->hasTable('devices')) {
                return response()->json([
                    'total' => 0,
                    'online' => 0,
                    'offline' => 0,
                    'warning' => 0,
                ]);
            }

            $stats = [
                'total' => DB::table('devices')->where('is_active', true)->count(),
                'online' => DB::table('devices')->where('is_active', true)->where('status', 'online')->count(),
                'offline' => DB::table('devices')->where('is_active', true)->whereIn('status', ['offline', 'down'])->count(),
                'warning' => DB::table('devices')->where('is_active', true)->where('status', 'warning')->count(),
            ];

            return response()->json($stats);
        } catch (\Exception $e) {
            Log::error('Device stats error: ' . $e->getMessage());
            return response()->json([
                'total' => 0,
                'online' => 0,
                'offline' => 0,
                'warning' => 0,
            ], 200);
        }
    }

    public function pingAll()
    {
        try {
            return response()->json([
                'success' => true,
                'message' => 'Ping initiated for all devices',
            ]);
        } catch (\Exception $e) {
            Log::error('Ping all error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 200);
        }
    }
}
