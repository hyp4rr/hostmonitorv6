<?php
// filepath: c:\Users\hyper\Herd\hostmonitorv6\app\Http\Controllers\Api\DeviceController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Device;
use App\Models\HardwareDetail;
use App\Services\PingService;
use App\Services\ActivityLogService;
use App\Services\DeviceUptimeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Cache;

class DeviceController extends Controller
{
    private $uptimeService;

    public function __construct(DeviceUptimeService $uptimeService)
    {
        $this->uptimeService = $uptimeService;
    }

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
            // Convert string 'true'/'false' to boolean for include_inactive
            $includeInactive = filter_var($request->input('include_inactive', false), FILTER_VALIDATE_BOOLEAN);
            $search = $request->input('search'); // Global search term
            $activeFilter = $request->input('active_filter', 'all'); // all, active, inactive
            $locationFilter = $request->input('location'); // Location filter (location name or ID)
            $brandFilter = $request->input('brand'); // Brand filter (brand ID)
            $modelFilter = $request->input('model'); // Model filter (model ID)
            $managedByFilter = $request->input('managed_by'); // Managed by filter (user ID or 'unassigned')
            
            $cacheKey = "devices.list.branch.{$branchId}.page.{$page}.per.{$perPage}.cat.{$category}.status.{$status}.sort.{$sortBy}.{$sortOrder}.inactive.{$includeInactive}.search.{$search}.active.{$activeFilter}.loc.{$locationFilter}.brand.{$brandFilter}.model.{$modelFilter}.mgr.{$managedByFilter}";
            
            // Cache for 30 seconds (reduced from 5 minutes) since uptime updates frequently
            $result = Cache::remember($cacheKey, 30, function () use ($request, $perPage, $category, $status, $sortBy, $sortOrder, $includeInactive, $search, $activeFilter, $locationFilter, $brandFilter, $modelFilter, $managedByFilter) {
                // OPTIMIZED: Select only needed columns and use lazy eager loading
                $query = Device::select([
                    'devices.id', 'devices.branch_id', 'devices.location_id', 'devices.hardware_detail_id',
                    'devices.name', 'devices.ip_address', 'devices.mac_address', 'devices.barcode',
                    'devices.category', 'devices.status', 'devices.building', 'devices.is_active',
                    'devices.uptime_percentage', 'devices.uptime_minutes', 'devices.downtime_percentage',
                    'devices.response_time', 'devices.last_ping', 'devices.offline_reason',
                    'devices.offline_acknowledged_by', 'devices.offline_acknowledged_at',
                    'devices.offline_since', 'devices.offline_duration_minutes', 'devices.managed_by',
                    'devices.serial_number', 'devices.sla_target'
                ])->with([
                    'branch:id,name',
                    'location:id,name,location_folder_id,latitude,longitude',
                    'location.locationFolder:id,name',
                    'hardwareDetail:id,brand_id,model_id',
                    'hardwareDetail.brand:id,name',
                    'hardwareDetail.hardwareModel:id,name',
                    'managedBy:id,name,email',
                    'managers:id,name,email'
                ]);
                
                // Filter by is_active based on active_filter parameter
                if ($activeFilter === 'active') {
                    $query->where('is_active', true);
                } elseif ($activeFilter === 'inactive') {
                    $query->where('is_active', false);
                } elseif (!$includeInactive) {
                    // Default: only show active if include_inactive is not requested
                    $query->where('is_active', true);
                }
                
                // Filter by branch if provided
                // IMPORTANT: Only filter by branch if explicitly provided and not 'all'
                // This allows showing devices from all branches when branch_id is not specified
                if ($request->has('branch_id') && $request->branch_id !== 'all' && $request->branch_id !== null && $request->branch_id !== '') {
                    $query->where('branch_id', $request->branch_id);
                }
                
                // Filter by category if provided
                if ($category && $category !== 'all') {
                    $query->where('category', $category);
                }
                
                // Filter by status if provided
                if ($status && $status !== 'all') {
                    $query->where('status', $status);
                }
                
                // Global search filter
                if ($search) {
                    $query->where(function($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%")
                          ->orWhere('ip_address', 'like', "%{$search}%")
                          ->orWhere('barcode', 'like', "%{$search}%")
                          ->orWhere('mac_address', 'like', "%{$search}%")
                          ->orWhere('serial_number', 'like', "%{$search}%");
                    });
                }
                
                // Filter by location
                if ($locationFilter && $locationFilter !== 'all') {
                    // Try to match by location ID first, then by name
                    if (is_numeric($locationFilter)) {
                        $query->where('location_id', $locationFilter);
                    } else {
                        $query->whereHas('location', function($q) use ($locationFilter) {
                            $q->where('name', 'like', "%{$locationFilter}%");
                        });
                    }
                }
                
                // Filter by brand
                if ($brandFilter && $brandFilter !== 'all') {
                    $query->whereHas('hardwareDetail.brand', function($q) use ($brandFilter) {
                        if (is_numeric($brandFilter)) {
                            $q->where('brands.id', $brandFilter);
                        } else {
                            $q->where('brands.name', 'like', "%{$brandFilter}%");
                        }
                    });
                }
                
                // Filter by model
                if ($modelFilter && $modelFilter !== 'all') {
                    $query->whereHas('hardwareDetail.hardwareModel', function($q) use ($modelFilter) {
                        if (is_numeric($modelFilter)) {
                            $q->where('hardware_models.id', $modelFilter);
                        } else {
                            $q->where('hardware_models.name', 'like', "%{$modelFilter}%");
                        }
                    });
                }
                
                // Filter by managed_by (primary or any additional manager)
                if ($managedByFilter && $managedByFilter !== 'all') {
                    if ($managedByFilter === 'unassigned') {
                        $query->whereNull('managed_by')->whereDoesntHave('managers');
                    } else {
                        $query->where(function ($q) use ($managedByFilter) {
                            $q->where('managed_by', $managedByFilter)
                              ->orWhereHas('managers', function ($mq) use ($managedByFilter) {
                                  $mq->where('users.id', $managedByFilter);
                              });
                        });
                    }
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
            
            // Cache for 30 seconds (reduced from 2 minutes) since stats update frequently
            $stats = Cache::remember($cacheKey, 30, function () use ($request, $branchId) {
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

    /**
     * Display the specified device with relations.
     */
    public function show($id)
    {
        try {
            $device = Device::with([
                'branch',
                'location',
                'hardwareDetail.brand',
                'hardwareDetail.hardwareModel',
                'managedBy',
                'managers',
            ])->findOrFail($id);

            return response()->json($this->transformDevice($device));
        } catch (\Exception $e) {
            Log::error('Error fetching device: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch device'], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'ip_address' => 'required|ip|unique:devices,ip_address',
                'barcode' => 'nullable|string|max:255|unique:devices,barcode',
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
                'barcode' => !empty($request->barcode) ? $request->barcode : null,
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

            // Sync additional managers if provided
            if ($request->has('managed_by_ids') && is_array($request->managed_by_ids)) {
                $device->managers()->sync(array_unique(array_filter($request->managed_by_ids)));
            }

            $device->load(['branch', 'location', 'hardwareDetail.brand', 'hardwareDetail.hardwareModel', 'managedBy', 'managers']);
            
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
                'barcode' => 'nullable|string|max:255|unique:devices,barcode,' . $id,
                'mac_address' => 'nullable|string|max:17',
                'category' => 'sometimes|required|string|in:switches,servers,wifi,tas,cctv',
                'status' => 'sometimes|required|string|in:online,offline,warning,maintenance',
                'branch_id' => 'sometimes|required|exists:branches,id',
                'location_id' => 'sometimes|required|exists:locations,id',
                'model_id' => 'sometimes|required|exists:hardware_models,id', // Changed
                'managed_by' => 'nullable|exists:users,id',
                'managed_by_ids' => 'sometimes|array',
                'managed_by_ids.*' => 'integer|exists:users,id',
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
            
            // Convert empty string to null for barcode
            if ($request->has('barcode') && $request->barcode === '') {
                $device->barcode = null;
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

            // Sync additional managers
            if ($request->has('managed_by_ids')) {
                $ids = is_array($request->managed_by_ids) ? $request->managed_by_ids : [];
                $device->managers()->sync(array_unique(array_filter($ids)));
            }
            
            $device->load(['branch', 'location', 'hardwareDetail.brand', 'hardwareDetail.hardwareModel', 'managedBy', 'managers']);

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
     * Bulk acknowledge offline devices
     */
    public function bulkAcknowledgeOffline(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'device_ids' => 'required|array|min:1',
                'device_ids.*' => 'required|integer|exists:devices,id',
                'reason' => 'required|string|max:500',
                'acknowledged_by' => 'required|string|max:255',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'error' => 'Validation failed',
                    'messages' => $validator->errors()
                ], 422);
            }

            $deviceIds = $request->device_ids;
            $reason = $request->reason;
            $acknowledgedBy = $request->acknowledged_by;

            $devices = Device::whereIn('id', $deviceIds)
                ->where('status', 'offline')
                ->get();

            if ($devices->isEmpty()) {
                return response()->json([
                    'error' => 'No offline devices found in the selected devices'
                ], 404);
            }

            $updatedCount = 0;
            $branchIds = [];
            $activityLog = new ActivityLogService();

            foreach ($devices as $device) {
                $device->status = 'offline_ack';
                $device->offline_reason = $reason;
                $device->offline_acknowledged_by = $acknowledgedBy;
                $device->offline_acknowledged_at = now();
                $device->save();

                $branchIds[] = $device->branch_id;

                // Log activity
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
                                'new' => $reason
                            ]
                        ]
                    ],
                    $device->branch_id
                );

                $updatedCount++;
            }

            // Clear device cache for all affected branches
            foreach (array_unique($branchIds) as $branchId) {
                $this->clearDeviceCache($branchId);
            }

            return response()->json([
                'message' => "Successfully acknowledged {$updatedCount} offline device(s)",
                'acknowledged_count' => $updatedCount,
                'total_selected' => count($deviceIds)
            ]);
        } catch (\Exception $e) {
            Log::error('Error bulk acknowledging offline devices: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to acknowledge offline devices'], 500);
        }
    }

    /**
     * Bulk update devices
     */
    public function bulkUpdate(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'device_ids' => 'required|array|min:1',
                'device_ids.*' => 'required|integer|exists:devices,id',
                'status' => 'sometimes|string|in:online,offline,warning,maintenance',
                'category' => 'sometimes|string|in:switches,servers,wifi,tas,cctv',
                'branch_id' => 'sometimes|integer|exists:branches,id',
                'location_id' => 'sometimes|nullable|integer|exists:locations,id',
                'is_active' => 'sometimes|boolean',
                'managed_by' => 'sometimes|nullable|integer|exists:users,id',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'error' => 'Validation failed',
                    'messages' => $validator->errors()
                ], 422);
            }

            $deviceIds = $request->device_ids;
            $updateData = $request->only(['status', 'category', 'branch_id', 'location_id', 'is_active', 'managed_by']);

            // Handle managed_by: 0 means null (not assigned)
            if (isset($updateData['managed_by']) && $updateData['managed_by'] == 0) {
                $updateData['managed_by'] = null;
            }

            // Remove null values (but keep false for is_active)
            $updateData = array_filter($updateData, function($value, $key) {
                if ($key === 'is_active') {
                    return true; // Keep false values for is_active
                }
                return $value !== null && $value !== '';
            }, ARRAY_FILTER_USE_BOTH);

            if (empty($updateData)) {
                return response()->json([
                    'error' => 'No fields to update'
                ], 422);
            }

            $devices = Device::whereIn('id', $deviceIds)->get();

            if ($devices->isEmpty()) {
                return response()->json([
                    'error' => 'No devices found'
                ], 404);
            }

            $updatedCount = 0;
            $branchIds = [];
            $activityLog = new ActivityLogService();

            foreach ($devices as $device) {
                $oldValues = [];
                $newValues = [];

                foreach ($updateData as $field => $value) {
                    $oldValues[$field] = $device->$field;
                    $device->$field = $value;
                    $newValues[$field] = $value;
                }

                $device->save();
                $branchIds[] = $device->branch_id;
                $updatedCount++;

                // Log activity
                $changes = [];
                foreach ($updateData as $field => $value) {
                    $changes[$field] = [
                        'old' => $oldValues[$field],
                        'new' => $value
                    ];
                }

                $activityLog->log(
                    'updated',
                    'device',
                    $device->id,
                    [
                        'device_name' => $device->name,
                        'changes' => $changes
                    ],
                    $device->branch_id
                );
            }

            // Clear device cache for all affected branches
            foreach (array_unique($branchIds) as $branchId) {
                $this->clearDeviceCache($branchId);
            }

            return response()->json([
                'message' => "Successfully updated {$updatedCount} device(s)",
                'updated_count' => $updatedCount,
                'total_selected' => count($deviceIds)
            ]);
        } catch (\Exception $e) {
            Log::error('Error bulk updating devices: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update devices'], 500);
        }
    }

    /**
     * Refresh all device uptimes based on monitoring history
     */
    public function refreshUptimes()
    {
        try {
            $this->uptimeService->updateAllDeviceUptimes();
            
            // Clear device cache to force fresh data
            Cache::flush();
            
            Log::info('All device uptimes refreshed successfully');
            
            return response()->json([
                'message' => 'All device uptimes have been refreshed based on monitoring history'
            ]);
        } catch (\Exception $e) {
            Log::error('Error refreshing device uptimes: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to refresh device uptimes'], 500);
        }
    }

    /**
     * Reset all device uptimes to 100% and clear downtime
     */
    public function resetUptimes()
    {
        try {
            $this->uptimeService->resetAllUptimes();
            
            // Clear device cache to force fresh data
            Cache::flush();
            
            Log::info('All device uptimes, downtime, and monitoring history reset');
            
            return response()->json([
                'message' => 'All device uptimes have been reset to 100%, downtime cleared, and monitoring history cleared'
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
            'location' => $device->location ? [
                'id' => $device->location->id,
                'name' => $device->location->name,
                'main_block' => $device->location->main_block,
                'description' => $device->location->description,
                'latitude' => $device->location->latitude,
                'longitude' => $device->location->longitude,
                'location_folder' => $device->location->locationFolder ? [
                    'id' => $device->location->locationFolder->id,
                    'name' => $device->location->locationFolder->name,
                ] : null,
            ] : null,
            'location_data' => $device->location ? [
                'id' => $device->location->id,
                'name' => $device->location->name,
                'main_block' => $device->location->main_block,
                'location_folder' => $device->location->locationFolder ? [
                    'id' => $device->location->locationFolder->id,
                    'name' => $device->location->locationFolder->name,
                ] : null,
            ] : null,
            'location_folder_id' => $device->location && $device->location->locationFolder ? $device->location->locationFolder->id : null,
            'location_folder_name' => $device->location && $device->location->locationFolder ? $device->location->locationFolder->name : null,
            'hardware_detail_id' => $device->hardware_detail_id,
            'hardware_detail' => $device->hardwareDetail ? [
                'id' => $device->hardwareDetail->id,
                'brand' => $brand,
                'model' => $model,
                'brand_id' => $device->hardwareDetail->brand_id,
                'model_id' => $device->hardwareDetail->model_id,
                'hardware_model' => $device->hardwareDetail->hardwareModel ? [
                    'id' => $device->hardwareDetail->hardwareModel->id,
                    'name' => $device->hardwareDetail->hardwareModel->name,
                ] : null,
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
            'managed_by_users' => $device->relationLoaded('managers')
                ? $device->managers->map(function ($u) {
                    return [
                        'id' => $u->id,
                        'name' => $u->name,
                        'email' => $u->email,
                        'role' => $u->role,
                    ];
                })->values()
                : [],
            'serial_number' => $device->serial_number,
            'category' => $device->category,
            'status' => $device->status,
            'building' => $device->building,
            'location' => $locationName,
            'latitude' => $latitude,
            'longitude' => $longitude,
            'brand' => $brand,
            'model' => $model,
            'uptime_percentage' => $device->getCalculatedUptimePercentage(),
            'uptime_minutes' => (int) ($device->uptime_minutes ?? 0), // Ensure it's an integer
            'is_active' => $device->is_active,
            'response_time' => $device->response_time,
            'last_check' => $device->last_ping,
            'last_ping' => $device->last_ping,
            'offline_reason' => $device->offline_reason,
            'offline_acknowledged_by' => $device->offline_acknowledged_by,
            'offline_acknowledged_at' => $device->offline_acknowledged_at,
            'offline_since' => $device->offline_since,
            'offline_duration_minutes' => $device->offline_duration_minutes,
            'offline_alert_sent' => $device->offline_alert_sent,
            'created_at' => $device->created_at,
            'updated_at' => $device->updated_at,
        ];
    }

    /**
     * Export devices to Excel (.xls) format with multiple sheets by category
     */
    public function exportCsv(Request $request)
    {
        try {
            // Check if PhpSpreadsheet is available
            if (!class_exists(\PhpOffice\PhpSpreadsheet\Spreadsheet::class)) {
                return response()->json([
                    'error' => 'PhpSpreadsheet library is not installed. Please run: composer require phpoffice/phpspreadsheet'
                ], 500);
            }

            $branchId = $request->input('branch_id', 'all');
            $category = $request->input('category', 'all');
            $status = $request->input('status', 'all');
            
            // Build query
            $query = Device::with([
                'branch:id,name',
                'location:id,name',
                'hardwareDetail.brand:id,name',
                'hardwareDetail.hardwareModel:id,name',
                'managedBy:id,name,email'
            ]);
            
            // Apply filters (but we'll still split by category)
            if ($branchId !== 'all') {
                $query->where('branch_id', $branchId);
            }
            
            if ($status && $status !== 'all') {
                $query->where('status', $status);
            }
            
            // Note: We ignore category filter here because we split by category into sheets
            // Get all devices (no pagination for export)
            $devices = $query->orderBy('category', 'asc')->orderBy('name', 'asc')->get();
            
            // Group devices by category
            $devicesByCategory = $devices->groupBy('category');
            
            // Create new Spreadsheet
            $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
            $spreadsheet->removeSheetByIndex(0); // Remove default sheet
            
            // Header row definition
            $headers = [
                'ID',
                'Name',
                'IP Address',
                'MAC Address',
                'Barcode',
                'Category',
                'Status',
                'Branch',
                'Location',
                'Brand',
                'Model',
                'Serial Number',
                'Managed By',
                'Building',
                'Uptime %',
                'Response Time (ms)',
                'Is Active',
                'SLA Target %',
                'Created At',
                'Updated At'
            ];
            
            // Create a sheet for each category
            foreach ($devicesByCategory as $categoryName => $categoryDevices) {
                // Create new sheet
                $sheet = new \PhpOffice\PhpSpreadsheet\Worksheet\Worksheet($spreadsheet, $categoryName);
                $spreadsheet->addSheet($sheet);
                
                // Set header row with styling
                $headerStyle = [
                    'font' => [
                        'bold' => true,
                        'color' => ['rgb' => '000000'],
                    ],
                    'fill' => [
                        'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                        'startColor' => ['rgb' => 'D9EAF7'],
                    ],
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN,
                        ],
                    ],
                ];
                
                // Write headers using column letters (A, B, C, etc.)
                $col = 1;
                foreach ($headers as $header) {
                    $columnLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($col);
                    $sheet->setCellValue($columnLetter . '1', $header);
                    $sheet->getStyle($columnLetter . '1')->applyFromArray($headerStyle);
                    $col++;
                }
                
                // Write data rows
                $row = 2;
                foreach ($categoryDevices as $device) {
                    $col = 1;
                    $dataRow = [
                        $device->id,
                        $device->name,
                        $device->ip_address,
                        $device->mac_address ?? '',
                        $device->barcode ?? '',
                        $device->category,
                        $device->status,
                        $device->branch?->name ?? '',
                        $device->location?->name ?? '',
                        $device->hardwareDetail?->brand?->name ?? '',
                        $device->hardwareDetail?->hardwareModel?->name ?? '',
                        $device->serial_number ?? '',
                        $device->managedBy?->name ?? '',
                        $device->building ?? '',
                        $device->uptime_percentage ?? 0,
                        $device->response_time ?? '',
                        $device->is_active ? 'Yes' : 'No',
                        $device->sla_target ?? 99.9,
                        $device->created_at?->format('Y-m-d H:i:s') ?? '',
                        $device->updated_at?->format('Y-m-d H:i:s') ?? '',
                    ];
                    
                    foreach ($dataRow as $value) {
                        $columnLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($col);
                        $sheet->setCellValue($columnLetter . $row, $value);
                        // Apply borders to all data cells
                        $sheet->getStyle($columnLetter . $row)->applyFromArray([
                            'borders' => [
                                'allBorders' => [
                                    'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN,
                                ],
                            ],
                        ]);
                        $col++;
                    }
                    $row++;
                }
                
                // Auto-fit column widths using column letters
                foreach (range(1, count($headers)) as $col) {
                    $columnLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($col);
                    $sheet->getColumnDimension($columnLetter)->setAutoSize(true);
                }
            }
            
            // Set active sheet to first one
            $spreadsheet->setActiveSheetIndex(0);
            
            // Create writer for .xls format (Excel5)
            $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xls($spreadsheet);
            
            // Save to temporary file
            $tempFile = tempnam(sys_get_temp_dir(), 'devices_export_') . '.xls';
            try {
                $writer->save($tempFile);
                
                // Read file contents
                $fileContents = file_get_contents($tempFile);
                
                $filename = 'devices_export_' . date('Y-m-d_His') . '.xls';
                
                // Clean up temporary file
                @unlink($tempFile);
                
                return response($fileContents)
                    ->header('Content-Type', 'application/vnd.ms-excel')
                    ->header('Content-Disposition', "attachment; filename=\"{$filename}\"");
            } catch (\Exception $e) {
                // Clean up temporary file on error
                @unlink($tempFile);
                throw $e;
            }
                
        } catch (\Exception $e) {
            Log::error('Excel export error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to export devices: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Download CSV template for device import
     */
    public function downloadCsvTemplate(Request $request)
    {
        try {
            // Create CSV content with headers and example row
            $headers = [
                'name',
                'ip_address',
                'mac_address',
                'barcode',
                'category',
                'status',
                'branch',
                'location',
                'brand',
                'model',
                'serial_number',
                'managed_by',
                'building',
                'sla_target',
                'is_active'
            ];
            
            // Create example data row
            $exampleRow = [
                'Example Device',
                '192.168.1.100',
                '00:11:22:33:44:55',
                'BC001',
                'switches',
                'offline',
                'Main Branch',
                'Server Room',
                'Cisco',
                'Catalyst 2960',
                'SN123456',
                'admin@example.com',
                'Building A',
                '99.90',
                'Yes'
            ];
            
            // Create CSV content
            $output = fopen('php://temp', 'r+');
            
            // Write headers
            fputcsv($output, $headers);
            
            // Write example row
            fputcsv($output, $exampleRow);
            
            // Write instructions row (as comment in second example)
            $instructions = [
                'NOTE: Required columns are: name, ip_address',
                '',
                '',
                '',
                'Categories: switches, servers, wifi, tas, cctv',
                'Status: online, offline, warning, offline_ack',
                'Branch name (will be matched by name)',
                'Location name (will be matched by name)',
                'Brand name (will be created if not exists)',
                'Model name (will be created if not exists)',
                '',
                'User email (will be matched by email)',
                '',
                'SLA Target % (default: 99.90)',
                'Yes/No or True/False or 1/0'
            ];
            fputcsv($output, $instructions);
            
            rewind($output);
            $csvContent = stream_get_contents($output);
            fclose($output);
            
            // Add BOM for Excel compatibility
            $csvContent = "\xEF\xBB\xBF" . $csvContent;
            
            $filename = 'device_import_template_' . date('Y-m-d') . '.csv';
            
            return response($csvContent)
                ->header('Content-Type', 'text/csv; charset=utf-8')
                ->header('Content-Disposition', "attachment; filename=\"{$filename}\"");
                
        } catch (\Exception $e) {
            Log::error('CSV template download error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to generate template: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Import devices from CSV
     */
    public function importCsv(Request $request)
    {
        try {
            $request->validate([
                'file' => 'required|file|mimes:csv,txt|max:10240', // 10MB max
            ]);
            
            $file = $request->file('file');
            $branchId = $request->input('branch_id');
            $updateExisting = filter_var($request->input('update_existing', false), FILTER_VALIDATE_BOOLEAN);
            
            if (!$file->isValid()) {
                return response()->json(['error' => 'Invalid file'], 400);
            }
            
            $results = [
                'imported' => 0,
                'updated' => 0,
                'skipped' => 0,
                'errors' => [],
            ];
            
            // Read CSV file
            $handle = fopen($file->getRealPath(), 'r');
            if (!$handle) {
                return response()->json(['error' => 'Failed to read CSV file'], 400);
            }
            
            // Read header row
            $header = fgetcsv($handle);
            if (!$header || empty($header)) {
                fclose($handle);
                return response()->json(['error' => 'CSV file is empty or invalid'], 400);
            }
            
            // Remove BOM if present (common in Excel exports)
            if (!empty($header[0])) {
                $header[0] = preg_replace('/^\xEF\xBB\xBF/', '', $header[0]);
            }
            
            // Normalize header (trim and lowercase, handle empty values)
            $header = array_map(function($h) {
                return strtolower(trim($h ?? ''));
            }, $header);
            
            // Filter out empty header columns
            $header = array_filter($header, function($h) {
                return !empty($h);
            });
            
            // Re-index array after filtering
            $header = array_values($header);
            
            // Debug: Log the detected headers
            Log::info('CSV Import - Detected headers: ' . json_encode($header));
            
            // Map header to column indices
            $columnMap = [];
            $requiredColumns = ['name', 'ip_address'];
            $optionalColumns = [
                'id', 'mac_address', 'barcode', 'category', 'status', 'branch', 'location',
                'brand', 'model', 'serial_number', 'managed_by', 'building', 'sla_target', 'is_active'
            ];
            
            foreach ($requiredColumns as $col) {
                $index = array_search($col, $header);
                if ($index === false) {
                    // Try alternative names
                    $alternatives = [
                        'name' => ['device_name', 'device name', 'hostname'],
                        'ip_address' => ['ip', 'ip address', 'ipaddress'],
                    ];
                    if (isset($alternatives[$col])) {
                        foreach ($alternatives[$col] as $alt) {
                            $index = array_search($alt, $header);
                            if ($index !== false) break;
                        }
                    }
                }
                if ($index === false) {
                    fclose($handle);
                    $detectedHeaders = implode(', ', $header);
                    return response()->json([
                        'error' => "Required column '{$col}' not found in CSV",
                        'detected_headers' => $detectedHeaders,
                        'expected' => $requiredColumns
                    ], 400);
                }
                $columnMap[$col] = $index;
            }
            
            // Map optional columns
            foreach ($optionalColumns as $col) {
                $index = array_search($col, $header);
                if ($index === false) {
                    // Try alternatives
                    $alternatives = [
                        'category' => ['type', 'device_type'],
                        'status' => ['device_status'],
                        'branch' => ['branch_name'],
                        'location' => ['location_name'],
                    ];
                    if (isset($alternatives[$col])) {
                        foreach ($alternatives[$col] as $alt) {
                            $index = array_search($alt, $header);
                            if ($index !== false) break;
                        }
                    }
                }
                if ($index !== false) {
                    $columnMap[$col] = $index;
                }
            }
            
            $rowNumber = 1; // Start from 1 (header is row 0)
            
            // Process each row
            while (($row = fgetcsv($handle)) !== false) {
                $rowNumber++;
                
                try {
                    // Get values from CSV
                    $name = trim($row[$columnMap['name']] ?? '');
                    $ipAddress = trim($row[$columnMap['ip_address']] ?? '');
                    
                    // Skip empty rows
                    if (empty($name) || empty($ipAddress)) {
                        $results['skipped']++;
                        continue;
                    }
                    
                    // Validate IP address
                    if (!filter_var($ipAddress, FILTER_VALIDATE_IP)) {
                        $results['errors'][] = "Row {$rowNumber}: Invalid IP address '{$ipAddress}'";
                        $results['skipped']++;
                        continue;
                    }
                    
                    // Get optional values
                    $csvId = isset($columnMap['id']) ? trim($row[$columnMap['id']] ?? '') : null;
                    $category = isset($columnMap['category']) ? trim($row[$columnMap['category']] ?? 'switches') : 'switches';
                    $status = isset($columnMap['status']) ? trim($row[$columnMap['status']] ?? 'offline') : 'offline';
                    $macAddress = isset($columnMap['mac_address']) ? trim($row[$columnMap['mac_address']] ?? '') : null;
                    $barcode = isset($columnMap['barcode']) ? trim($row[$columnMap['barcode']] ?? '') : null;
                    $serialNumber = isset($columnMap['serial_number']) ? trim($row[$columnMap['serial_number']] ?? '') : null;
                    $building = isset($columnMap['building']) ? trim($row[$columnMap['building']] ?? '') : null;
                    $slaTarget = isset($columnMap['sla_target']) ? floatval($row[$columnMap['sla_target']] ?? 99.9) : 99.9;
                    $isActive = isset($columnMap['is_active']) ? 
                        (strtolower(trim($row[$columnMap['is_active']] ?? '')) === 'yes' || 
                         strtolower(trim($row[$columnMap['is_active']] ?? '')) === 'true' || 
                         strtolower(trim($row[$columnMap['is_active']] ?? '')) === '1') : true;
                    
                    // Normalize category
                    $category = strtolower($category);
                    if (!in_array($category, ['switches', 'servers', 'wifi', 'tas', 'cctv'])) {
                        $category = 'switches'; // Default
                    }
                    
                    // Normalize status
                    $status = strtolower($status);
                    if (!in_array($status, ['online', 'offline', 'warning', 'offline_ack'])) {
                        $status = 'offline'; // Default
                    }
                    
                    // Find existing device by IP or ID
                    $existingDevice = null;
                    if ($csvId) {
                        $existingDevice = Device::find($csvId);
                    }
                    if (!$existingDevice) {
                        $existingDevice = Device::where('ip_address', $ipAddress)->first();
                    }
                    
                    // Prepare device data
                    $deviceData = [
                        'name' => $name,
                        'ip_address' => $ipAddress,
                        'category' => $category,
                        'status' => $status,
                        'is_active' => $isActive,
                        'sla_target' => $slaTarget,
                    ];
                    
                    // Add optional fields if provided
                    if ($macAddress) $deviceData['mac_address'] = $macAddress;
                    if ($barcode) $deviceData['barcode'] = $barcode;
                    if ($serialNumber) $deviceData['serial_number'] = $serialNumber;
                    if ($building) $deviceData['building'] = $building;
                    
                    // Set branch_id if provided
                    if ($branchId && $branchId !== 'all' && $branchId !== '') {
                        $deviceData['branch_id'] = (int) $branchId;
                    } elseif (!$existingDevice || !$existingDevice->branch_id) {
                        // Use current branch if no branch specified
                        $deviceData['branch_id'] = (int) ($branchId ?? 1);
                    }
                    
                    // Handle location (by name)
                    if (isset($columnMap['location'])) {
                        $locationName = trim($row[$columnMap['location']] ?? '');
                        if ($locationName) {
                            $location = \App\Models\Location::where('name', $locationName)->first();
                            if ($location) {
                                $deviceData['location_id'] = $location->id;
                            }
                        }
                    }
                    
                    // Handle brand and model (by name)
                    if (isset($columnMap['brand']) || isset($columnMap['model'])) {
                        $brandName = isset($columnMap['brand']) ? trim($row[$columnMap['brand']] ?? '') : '';
                        $modelName = isset($columnMap['model']) ? trim($row[$columnMap['model']] ?? '') : '';
                        
                        if ($brandName || $modelName) {
                            $brand = null;
                            $model = null;
                            
                            if ($brandName) {
                                $brand = \App\Models\Brand::firstOrCreate(['name' => $brandName]);
                            }
                            
                            if ($modelName) {
                                $model = \App\Models\HardwareModel::firstOrCreate([
                                    'name' => $modelName,
                                    'brand_id' => $brand?->id ?? 1,
                                ]);
                            }
                            
                            if ($brand || $model) {
                                $hardwareDetail = \App\Models\HardwareDetail::firstOrCreate([
                                    'brand_id' => $brand?->id ?? 1,
                                    'model_id' => $model?->id ?? 1,
                                ]);
                                $deviceData['hardware_detail_id'] = $hardwareDetail->id;
                            }
                        }
                    }
                    
                    // Create or update device
                    if ($existingDevice && $updateExisting) {
                        $existingDevice->update($deviceData);
                        $results['updated']++;
                    } elseif (!$existingDevice) {
                        Device::create($deviceData);
                        $results['imported']++;
                    } else {
                        $results['skipped']++;
                    }
                    
                } catch (\Exception $e) {
                    $results['errors'][] = "Row {$rowNumber}: " . $e->getMessage();
                    $results['skipped']++;
                    Log::error("CSV import error on row {$rowNumber}: " . $e->getMessage());
                }
            }
            
            fclose($handle);
            
            // Clear cache
            if ($branchId && $branchId !== 'all') {
                $this->clearDeviceCache($branchId);
            } else {
                Cache::flush();
            }
            
            return response()->json([
                'success' => true,
                'message' => "Import completed: {$results['imported']} imported, {$results['updated']} updated, {$results['skipped']} skipped",
                'results' => $results,
            ]);
            
        } catch (\Exception $e) {
            Log::error('CSV import error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to import devices: ' . $e->getMessage()], 500);
        }
    }
}