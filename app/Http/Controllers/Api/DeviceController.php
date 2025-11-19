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
            $includeInactive = $request->input('include_inactive', false); // For configuration panel
            $search = $request->input('search'); // Global search term
            $activeFilter = $request->input('active_filter', 'all'); // all, active, inactive
            $locationFilter = $request->input('location'); // Location filter (location name or ID)
            $brandFilter = $request->input('brand'); // Brand filter (brand ID)
            $modelFilter = $request->input('model'); // Model filter (model ID)
            $managedByFilter = $request->input('managed_by'); // Managed by filter (user ID or 'unassigned')
            
            $cacheKey = "devices.list.branch.{$branchId}.page.{$page}.per.{$perPage}.cat.{$category}.status.{$status}.sort.{$sortBy}.{$sortOrder}.inactive.{$includeInactive}.search.{$search}.active.{$activeFilter}.loc.{$locationFilter}.brand.{$brandFilter}.model.{$modelFilter}.mgr.{$managedByFilter}";
            
            // Cache for 30 seconds (reduced from 5 minutes) since uptime updates frequently
            $result = Cache::remember($cacheKey, 30, function () use ($request, $perPage, $category, $status, $sortBy, $sortOrder, $includeInactive, $search, $activeFilter, $locationFilter, $brandFilter, $modelFilter, $managedByFilter) {
                $query = Device::with(['branch', 'location', 'hardwareDetail.brand', 'hardwareDetail.hardwareModel', 'managedBy', 'managers']);
                
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
                if ($request->has('branch_id') && $request->branch_id !== 'all') {
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
            'location_data' => $device->location ? [
                'id' => $device->location->id,
                'name' => $device->location->name,
            ] : null,
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
}