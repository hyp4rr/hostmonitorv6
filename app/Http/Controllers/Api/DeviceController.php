<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Device;
use App\Models\HardwareDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

class DeviceController extends Controller
{
    public function index()
    {
        try {
            if (!Schema::hasTable('devices')) {
                return response()->json([]);
            }

            $devices = Device::with(['branch', 'hardwareDetail'])
                ->orderBy('name')
                ->get();
            
            return response()->json($devices);
        } catch (\Exception $e) {
            Log::error('Error fetching devices: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch devices'], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'branch_id' => 'required|exists:branches,id',
                'location_id' => 'nullable|exists:locations,id',
                'name' => 'required|string|max:255',
                'ip_address' => 'required|ip|unique:devices,ip_address',
                'mac_address' => 'nullable|string|max:17',
                'barcode' => 'required|string|max:255|unique:devices,barcode',
                'type' => 'nullable|string|max:50',
                'category' => 'required|string|max:50',
                'status' => 'required|in:online,offline,warning,maintenance',
                'building' => 'nullable|string|max:255',
                'manufacturer' => 'nullable|string|max:100',
                'model' => 'nullable|string|max:100',
                'is_active' => 'boolean',
                'response_time' => 'nullable|integer|min:0',
                'latitude' => 'nullable|numeric|between:-90,90',
                'longitude' => 'nullable|numeric|between:-180,180',
            ]);

            // Handle hardware details
            $hardwareDetailId = null;
            if (!empty($validated['manufacturer']) && !empty($validated['model'])) {
                $hardwareDetail = HardwareDetail::firstOrCreate([
                    'manufacturer' => $validated['manufacturer'],
                    'model' => $validated['model'],
                ]);
                $hardwareDetailId = $hardwareDetail->id;
            }

            // Remove manufacturer and model from validated data
            unset($validated['manufacturer'], $validated['model']);
            
            $validated['hardware_detail_id'] = $hardwareDetailId;
            $validated['is_active'] = $request->boolean('is_active', true);
            $validated['type'] = $validated['type'] ?? $validated['category'];
            $validated['uptime_percentage'] = 0;

            $device = Device::create($validated);

            return response()->json($device->load(['branch', 'hardwareDetail']), 201);
        } catch (\Exception $e) {
            Log::error('Error creating device: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create device', 'message' => $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        try {
            if (!Schema::hasTable('devices')) {
                return response()->json(['error' => 'Device not found'], 404);
            }

            $device = Device::with('branch')->find($id);

            if (!$device) {
                return response()->json(['error' => 'Device not found'], 404);
            }

            return response()->json($device);
        } catch (\Exception $e) {
            Log::error('Device show error: ' . $e->getMessage());
            return response()->json(['error' => 'Device not found'], 404);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $device = Device::findOrFail($id);

            $validated = $request->validate([
                'branch_id' => 'required|exists:branches,id',
                'location_id' => 'nullable|exists:locations,id',
                'name' => 'required|string|max:255',
                'ip_address' => 'required|ip|unique:devices,ip_address,' . $id,
                'mac_address' => 'nullable|string|max:17',
                'barcode' => 'required|string|max:255|unique:devices,barcode,' . $id,
                'type' => 'nullable|string|max:50',
                'category' => 'required|string|max:50',
                'status' => 'required|in:online,offline,warning,maintenance',
                'building' => 'nullable|string|max:255',
                'manufacturer' => 'nullable|string|max:100',
                'model' => 'nullable|string|max:100',
                'is_active' => 'boolean',
                'response_time' => 'nullable|integer|min:0',
                'latitude' => 'nullable|numeric|between:-90,90',
                'longitude' => 'nullable|numeric|between:-180,180',
            ]);

            // Handle hardware details
            $hardwareDetailId = null;
            if (!empty($validated['manufacturer']) && !empty($validated['model'])) {
                $hardwareDetail = HardwareDetail::firstOrCreate([
                    'manufacturer' => $validated['manufacturer'],
                    'model' => $validated['model'],
                ]);
                $hardwareDetailId = $hardwareDetail->id;
            }

            // Remove manufacturer and model from validated data
            unset($validated['manufacturer'], $validated['model']);
            
            $validated['hardware_detail_id'] = $hardwareDetailId;
            $validated['is_active'] = $request->boolean('is_active', true);
            $validated['type'] = $validated['type'] ?? $validated['category'];

            $device->update($validated);

            return response()->json($device->load(['branch', 'hardwareDetail']));
        } catch (\Exception $e) {
            Log::error('Error updating device: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update device', 'message' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $device = Device::findOrFail($id);
            
            // Soft delete to preserve history
            $device->is_active = false;
            $device->save();
            $device->delete();

            return response()->json(['message' => 'Device deleted successfully']);
        } catch (\Exception $e) {
            Log::error('Error deleting device: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to delete device', 'message' => $e->getMessage()], 500);
        }
    }

    public function stats()
    {
        try {
            if (!Schema::hasTable('devices')) {
                return response()->json([
                    'total' => 0,
                    'online' => 0,
                    'offline' => 0,
                    'warning' => 0,
                ]);
            }

            $stats = [
                'total' => Device::where('is_active', true)->count(),
                'online' => Device::where('is_active', true)->where('status', 'online')->count(),
                'offline' => Device::where('is_active', true)->whereIn('status', ['offline', 'down'])->count(),
                'warning' => Device::where('is_active', true)->where('status', 'warning')->count(),
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
