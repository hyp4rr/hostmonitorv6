<?php
// filepath: c:\Users\hyper\Herd\hostmonitorv6\app\Http\Controllers\Api\DeviceController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Device;
use App\Models\HardwareDetail;
use App\Services\PingService;
use App\Services\ActivityLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class DeviceController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Device::with(['branch', 'location', 'hardwareDetail.brand', 'hardwareDetail.hardwareModel']);
            
            // Filter by branch if provided
            if ($request->has('branch_id')) {
                $query->where('branch_id', $request->branch_id);
            }
            
            $devices = $query->orderBy('name', 'asc')->get();
            
            // Transform the data to match frontend expectations
            $transformedDevices = $devices->map(function ($device) {
                return $this->transformDevice($device);
            });
            
            return response()->json($transformedDevices);
        } catch (\Exception $e) {
            Log::error('Error fetching devices: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch devices'], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'ip_address' => 'required|ip|unique:devices,ip_address',
                'barcode' => 'required|string|max:255|unique:devices,barcode',
                'mac_address' => 'nullable|string|max:17',
                'category' => 'required|string|in:switches,servers,wifi,tas,cctv',
                'status' => 'required|string|in:online,offline,warning,maintenance',
                'branch_id' => 'required|exists:branches,id',
                'location_id' => 'required|exists:locations,id',
                'model_id' => 'required|exists:hardware_models,id', // Changed from hardware_detail_id
                'building' => 'nullable|string|max:255',
                'is_active' => 'boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'error' => 'Validation failed',
                    'messages' => $validator->errors()
                ], 422);
            }

            // Get the model and its brand
            $model = \App\Models\HardwareModel::with('brand')->findOrFail($request->model_id);
            
            // Create hardware detail
            $hardwareDetail = HardwareDetail::create([
                'brand_id' => $model->brand_id,
                'model_id' => $model->id,
            ]);

            $device = Device::create([
                'name' => $request->name,
                'ip_address' => $request->ip_address,
                'barcode' => $request->barcode,
                'mac_address' => $request->mac_address,
                'category' => $request->category,
                'status' => $request->status,
                'branch_id' => $request->branch_id,
                'location_id' => $request->location_id,
                'hardware_detail_id' => $hardwareDetail->id, // Use the created hardware_detail
                'building' => $request->building,
                'is_active' => $request->is_active ?? true,
                'uptime_percentage' => 0,
            ]);

            $device->load(['branch', 'location', 'hardwareDetail.brand', 'hardwareDetail.hardwareModel']);
            
            // Log activity
            $activityLog = new ActivityLogService();
            $activityLog->logDeviceCreated($device->id, $device->name, $device->branch_id);
            
            return response()->json($this->transformDevice($device), 201);
        } catch (\Exception $e) {
            Log::error('Error creating device: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create device: ' . $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $device = Device::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|required|string|max:255',
                'ip_address' => 'sometimes|required|ip|unique:devices,ip_address,' . $id,
                'barcode' => 'sometimes|required|string|max:255|unique:devices,barcode,' . $id,
                'mac_address' => 'nullable|string|max:17',
                'category' => 'sometimes|required|string|in:switches,servers,wifi,tas,cctv',
                'status' => 'sometimes|required|string|in:online,offline,warning,maintenance',
                'branch_id' => 'sometimes|required|exists:branches,id',
                'location_id' => 'sometimes|required|exists:locations,id',
                'model_id' => 'sometimes|required|exists:hardware_models,id', // Changed
                'building' => 'nullable|string|max:255',
                'is_active' => 'boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'error' => 'Validation failed',
                    'messages' => $validator->errors()
                ], 422);
            }

            // If model_id is being updated, create new hardware detail
            if ($request->has('model_id')) {
                $model = \App\Models\HardwareModel::with('brand')->findOrFail($request->model_id);
                
                // Create new hardware detail
                $hardwareDetail = HardwareDetail::create([
                    'brand_id' => $model->brand_id,
                    'model_id' => $model->id,
                ]);
                
                $device->hardware_detail_id = $hardwareDetail->id;
            }

            // Update other fields
            $device->fill($request->only([
                'name', 'ip_address', 'barcode', 'mac_address', 'category', 
                'status', 'branch_id', 'location_id', 'building', 'is_active'
            ]));

            // Track changes with before/after values
            $changes = [];
            $dirty = $device->getDirty();
            foreach ($dirty as $field => $newValue) {
                $changes[$field] = [
                    'old' => $device->getOriginal($field),
                    'new' => $newValue
                ];
            }
            
            $device->save();
            
            $device->load(['branch', 'location', 'hardwareDetail.brand', 'hardwareDetail.hardwareModel']);

            // Log activity
            if (!empty($changes)) {
                $activityLog = new ActivityLogService();
                $activityLog->logDeviceUpdated($device->id, $device->name, $changes, $device->branch_id);
            }

            return response()->json($this->transformDevice($device));
        } catch (\Exception $e) {
            Log::error('Error updating device: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update device: ' . $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $device = Device::findOrFail($id);
            
            // Store info before deletion
            $deviceName = $device->name;
            $branchId = $device->branch_id;
            
            $device->delete();

            // Log activity
            $activityLog = new ActivityLogService();
            $activityLog->logDeviceDeleted($id, $deviceName, $branchId);

            return response()->json(['message' => 'Device deleted successfully']);
        } catch (\Exception $e) {
            Log::error('Error deleting device: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to delete device'], 500);
        }
    }
    
    /**
     * Ping a single device
     */
    public function ping($id)
    {
        try {
            $device = Device::findOrFail($id);
            $pingService = new PingService();
            $result = $pingService->pingDevice($device);
            
            return response()->json($result);
        } catch (\Exception $e) {
            Log::error('Error pinging device: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to ping device'], 500);
        }
    }

    /**
     * Ping multiple devices
     */
    public function pingMultiple(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'device_ids' => 'required|array',
                'device_ids.*' => 'required|integer|exists:devices,id',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'error' => 'Validation failed',
                    'messages' => $validator->errors()
                ], 422);
            }

            $pingService = new PingService();
            $results = $pingService->pingMultipleDevices($request->device_ids);
            
            return response()->json($results);
        } catch (\Exception $e) {
            Log::error('Error pinging multiple devices: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to ping devices'], 500);
        }
    }

    /**
     * Ping all devices in a branch
     */
    public function pingBranch(Request $request)
    {
        try {
            Log::info('Ping branch request received', ['branch_id' => $request->branch_id]);
            
            $validator = Validator::make($request->all(), [
                'branch_id' => 'required|integer|exists:branches,id',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'error' => 'Validation failed',
                    'messages' => $validator->errors()
                ], 422);
            }

            $pingService = new PingService();
            $results = $pingService->pingBranchDevices($request->branch_id);
            
            Log::info('Ping branch completed', ['results_count' => count($results)]);
            
            return response()->json($results);
        } catch (\Exception $e) {
            Log::error('Error pinging branch devices: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to ping branch devices'], 500);
        }
    }

    /**
     * Acknowledge a device as offline with reason
     */
    public function acknowledgeOffline(Request $request, $id)
    {
        try {
            $device = Device::findOrFail($id);
            
            $validator = Validator::make($request->all(), [
                'reason' => 'required|string|max:500',
                'acknowledged_by' => 'required|string|max:255',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'error' => 'Validation failed',
                    'messages' => $validator->errors()
                ], 422);
            }

            $device->status = 'offline_ack';
            $device->offline_reason = $request->reason;
            $device->offline_acknowledged_by = $request->acknowledged_by;
            $device->offline_acknowledged_at = now();
            $device->save();

            // Log activity
            $activityLog = new ActivityLogService();
            $activityLog->log(
                'updated',
                'device',
                $device->id,
                [
                    'device_name' => $device->name,
                    'changes' => [
                        'status' => [
                            'old' => 'offline',
                            'new' => 'offline_ack'
                        ],
                        'offline_reason' => [
                            'old' => null,
                            'new' => $request->reason
                        ]
                    ]
                ],
                $device->branch_id
            );

            return response()->json([
                'message' => 'Device offline status acknowledged',
                'device' => $this->transformDevice($device->load(['branch', 'location', 'hardwareDetail.brand', 'hardwareDetail.hardwareModel']))
            ]);
        } catch (\Exception $e) {
            Log::error('Error acknowledging offline device: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to acknowledge offline device'], 500);
        }
    }

    /**
     * Reset all device uptimes to 100%
     */
    public function resetUptimes()
    {
        try {
            // Reset device uptime percentages to 100%
            $updatedCount = Device::query()->update(['uptime_percentage' => 100.00]);
            
            // Clear monitoring history to reset report calculations
            $historyDeletedCount = \App\Models\MonitoringHistory::query()->delete();
            
            Log::info('All device uptimes and monitoring history reset', [
                'devices_updated' => $updatedCount,
                'history_deleted' => $historyDeletedCount
            ]);
            
            return response()->json([
                'message' => 'All device uptimes have been reset to 100% and monitoring history cleared',
                'devices_updated' => $updatedCount,
                'history_cleared' => $historyDeletedCount
            ]);
        } catch (\Exception $e) {
            Log::error('Error resetting device uptimes: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to reset device uptimes'], 500);
        }
    }

    private function transformDevice($device)
    {
        // Get location data
        $locationName = $device->location ? $device->location->name : ($device->building ?? '');
        $latitude = $device->location ? $device->location->latitude : null;
        $longitude = $device->location ? $device->location->longitude : null;
        
        // Get hardware details
        $brand = $device->hardwareDetail?->brand?->name ?? '';
        $model = $device->hardwareDetail?->hardwareModel?->name ?? '';
        
        return [
            'id' => $device->id,
            'branch_id' => $device->branch_id,
            'branch' => $device->branch ? [
                'id' => $device->branch->id,
                'name' => $device->branch->name,
            ] : null,
            'location_id' => $device->location_id,
            'location_name' => $locationName,
            'location_data' => $device->location ? [
                'id' => $device->location->id,
                'name' => $device->location->name,
            ] : null,
            'hardware_detail_id' => $device->hardware_detail_id,
            'hardware_detail' => $device->hardwareDetail ? [
                'id' => $device->hardwareDetail->id,
                'brand' => $brand,
                'model' => $model,
            ] : null,
            'name' => $device->name,
            'ip_address' => $device->ip_address,
            'mac_address' => $device->mac_address,
            'barcode' => $device->barcode,
            'category' => $device->category,
            'status' => $device->status,
            'building' => $device->building,
            'location' => $locationName,
            'latitude' => $latitude,
            'longitude' => $longitude,
            'brand' => $brand,
            'model' => $model,
            'uptime_percentage' => $device->uptime_percentage ?? 0,
            'is_active' => $device->is_active,
            'response_time' => $device->response_time,
            'last_check' => $device->last_ping,
            'created_at' => $device->created_at,
            'updated_at' => $device->updated_at,
        ];
    }
}