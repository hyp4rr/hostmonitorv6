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
use Illuminate\Support\Facades\Cache;

class DeviceController extends Controller
{
    /**
     * Clear all device cache to force fresh data from database
     */
    private function clearDeviceCache($branchId)
    {
        // Flush all cache to ensure frontend gets fresh data
        // This is the simplest and most reliable approach
        Cache::flush();
        
        // Clear report caches
        foreach (['24hours', '7days', '30days', '90days'] as $range) {
            Cache::forget("reports.summary.branch.{$branchId}.range.{$range}");
            Cache::forget("reports.uptime.branch.{$branchId}.range.{$range}");
            Cache::forget("reports.alerts.branch.{$branchId}.range.{$range}");
            for ($limit = 10; $limit <= 100; $limit += 10) {
                Cache::forget("reports.events.branch.{$branchId}.range.{$range}.limit.{$limit}");
            }
        }
        Cache::forget("reports.category.branch.{$branchId}");
    }
    public function index(Request $request)
    {
        try {
            $branchId = $request->input('branch_id', 'all');
            $perPage = $request->input('per_page', 50); // Default 50 items per page
            $page = $request->input('page', 1);
            $category = $request->input('category');
            $status = $request->input('status');
            $sortBy = $request->input('sort_by', 'name'); // Default sort by name
            $sortOrder = $request->input('sort_order', 'asc'); // Default ascending
            
            $cacheKey = "devices.list.branch.{$branchId}.page.{$page}.per.{$perPage}.cat.{$category}.status.{$status}.sort.{$sortBy}.{$sortOrder}";
            
            // Cache for 5 minutes (300 seconds)
            $result = Cache::remember($cacheKey, 300, function () use ($request, $perPage, $category, $status, $sortBy, $sortOrder) {
                $query = Device::with(['branch', 'location', 'hardwareDetail.brand', 'hardwareDetail.hardwareModel', 'managedBy'])
                    ->where('is_active', true);
                
                // Filter by branch if provided
                if ($request->has('branch_id') && $request->branch_id !== 'all') {
                    $query->where('branch_id', $request->branch_id);
                }
                
                // Filter by category if provided
                if ($category) {
                    $query->where('category', $category);
                }
                
                // Filter by status if provided
                if ($status) {
                    $query->where('status', $status);
                }
                
                // Apply sorting
                $allowedSortFields = ['name', 'ip_address', 'status', 'uptime_percentage', 'response_time', 'last_ping', 'category'];
                $sortField = in_array($sortBy, $allowedSortFields) ? $sortBy : 'name';
                $sortDirection = in_array(strtolower($sortOrder), ['asc', 'desc']) ? strtolower($sortOrder) : 'asc';
                
                // Special handling for status sorting (custom order)
                if ($sortField === 'status') {
                    // Define status priority: offline first, then warning, then online
                    $query->orderByRaw("
                        CASE status
                            WHEN 'offline' THEN 1
                            WHEN 'warning' THEN 2
                            WHEN 'online' THEN 3
                            WHEN 'offline_ack' THEN 4
                            ELSE 5
                        END " . ($sortDirection === 'desc' ? 'DESC' : 'ASC'));
                    // Secondary sort by name
                    $query->orderBy('name', 'asc');
                } else {
                    $query->orderBy($sortField, $sortDirection);
                }
                
                // Paginate results
                $devices = $query->paginate($perPage);
                
                // Transform the data to match frontend expectations
                return [
                    'data' => $devices->map(function ($device) {
                        return $this->transformDevice($device);
                    }),
                    'pagination' => [
                        'total' => $devices->total(),
                        'per_page' => $devices->perPage(),
                        'current_page' => $devices->currentPage(),
                        'last_page' => $devices->lastPage(),
                        'from' => $devices->firstItem(),
                        'to' => $devices->lastItem(),
                    ]
                ];
            });
            
            return response()->json($result);
        } catch (\Exception $e) {
            Log::error('Error fetching devices: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch devices'], 500);
        }
    }

    public function stats(Request $request)
    {
        try {
            $branchId = $request->input('branch_id', 'all');
            
            $cacheKey = "devices.stats.branch.{$branchId}";
            
            // Cache for 2 minutes (120 seconds)
            $stats = Cache::remember($cacheKey, 120, function () use ($request, $branchId) {
                $query = Device::where('is_active', true);
                
                // Filter by branch if provided
                if ($branchId !== 'all') {
                    $query->where('branch_id', $branchId);
                }
                
                // Get overall stats
                $totalDevices = $query->count();
                $onlineDevices = $query->where('status', 'online')->count();
                $offlineDevices = $query->whereIn('status', ['offline', 'down'])->count();
                $warningDevices = $query->where('status', 'warning')->count();
                
                // Get category breakdown
                $categoryStats = Device::where('is_active', true)
                    ->when($branchId !== 'all', function ($q) use ($branchId) {
                        $q->where('branch_id', $branchId);
                    })
                    ->selectRaw('category, COUNT(*) as count')
                    ->groupBy('category')
                    ->orderBy('count', 'desc')
                    ->get()
                    ->map(function ($stat) {
                        return [
                            'category' => $stat->category,
                            'count' => (int) $stat->count,
                        ];
                    });
                
                return [
                    'total' => $totalDevices,
                    'online' => $onlineDevices,
                    'offline' => $offlineDevices,
                    'warning' => $warningDevices,
                    'categories' => $categoryStats,
                ];
            });
            
            return response()->json($stats);
        } catch (\Exception $e) {
            Log::error('Error fetching device stats: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch device stats'], 500);
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
                'managed_by' => 'nullable|exists:users,id',
                'serial_number' => 'nullable|string|max:255',
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
                'managed_by' => $request->managed_by ?: null,
                'serial_number' => $request->serial_number,
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
            
            // Clear device cache
            $this->clearDeviceCache($device->branch_id);
            
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
                'managed_by' => 'nullable|exists:users,id',
                'serial_number' => 'nullable|string|max:255',
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
                'status', 'branch_id', 'location_id', 'building', 'is_active',
                'managed_by', 'serial_number'
            ]));
            
            // Convert empty string to null for managed_by
            if ($request->has('managed_by') && $request->managed_by === '') {
                $device->managed_by = null;
            }

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

            // Clear device cache
            $this->clearDeviceCache($device->branch_id);

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

            // Clear device cache
            $this->clearDeviceCache($branchId);

            return response()->json(['message' => 'Device deleted successfully']);
        } catch (\Exception $e) {
            Log::error('Error deleting device: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to delete device'], 500);
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
            
            // Clear device cache
            $this->clearDeviceCache($device->branch_id);

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
     * Reset all device uptimes to 100% and clear downtime
     */
    public function resetUptimes()
    {
        try {
            // Reset device uptime percentages to 100% and clear downtime tracking
            $updatedCount = Device::query()->update([
                'uptime_percentage' => 100.00,
                'offline_duration_minutes' => 0,
                'offline_since' => null,
                'offline_alert_sent' => false
            ]);
            
            // Clear monitoring history to reset report calculations
            $historyDeletedCount = \App\Models\MonitoringHistory::query()->delete();
            
            Log::info('All device uptimes, downtime, and monitoring history reset', [
                'devices_updated' => $updatedCount,
                'history_deleted' => $historyDeletedCount
            ]);
            
            return response()->json([
                'message' => 'All device uptimes have been reset to 100%, downtime cleared, and monitoring history cleared',
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
            'managed_by' => $device->managed_by,
            'managed_by_user' => $device->managedBy ? [
                'id' => $device->managedBy->id,
                'name' => $device->managedBy->name,
                'email' => $device->managedBy->email,
                'role' => $device->managedBy->role,
            ] : null,
            'serial_number' => $device->serial_number,
            'category' => $device->category,
            'status' => $device->status,
            'building' => $device->building,
            'location' => $locationName,
            'latitude' => $latitude,
            'longitude' => $longitude,
            'brand' => $brand,
            'model' => $model,
            'uptime_percentage' => $device->uptime_percentage ?? 0,
            'uptime_minutes' => $device->uptime_minutes ?? 0,
            'is_active' => $device->is_active,
            'response_time' => $device->response_time,
            'last_check' => $device->last_ping,
            'created_at' => $device->created_at,
            'updated_at' => $device->updated_at,
        ];
    }
}