<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\Device;
use App\Models\Alert;
use App\Models\MonitoringHistory;
use App\Services\ActivityLogService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Log;
use Inertia\Response;

class MonitorController extends Controller
{
    /**
     * Get all branches for dropdown
     */
    private function getAllBranches()
    {
        return Branch::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'code', 'description'])
            ->toArray();
    }

    /**
     * Get or set current branch ID from request/session
     */
    private function getCurrentBranchId(Request $request)
    {
        // Priority: 1. Request parameter, 2. Session, 3. First available branch
        $branchId = $request->input('branch_id');
        
        if ($branchId) {
            // Store in session when explicitly selected
            session(['current_branch_id' => $branchId]);
            return (int)$branchId;
        }
        
        // Try session
        if (session()->has('current_branch_id')) {
            return (int)session('current_branch_id');
        }
        
        // Fallback to first branch
        $branches = $this->getAllBranches();
        if (!empty($branches)) {
            $firstBranchId = $branches[0]['id'];
            session(['current_branch_id' => $firstBranchId]);
            return $firstBranchId;
        }
        
        return null;
    }

    /**
     * Get complete branch data including devices and locations
     */
    private function getBranchData($branchId = null)
    {
        // Get all active branches for dropdown
        $allBranches = $this->getAllBranches();

        if (!$branchId && !empty($allBranches)) {
            $branchId = $allBranches[0]['id'];
        }

        // Get the current branch with relationships (exclude offline_ack devices)
        $branch = Branch::with(['devices' => function ($query) {
            $query->where('is_active', true)
                ->where('status', '!=', 'offline_ack')
                ->with(['location', 'hardwareDetail.brand', 'hardwareDetail.hardwareModel']);
        }, 'locations'])->find($branchId);

        if (!$branch) {
            return [
                'id' => null,
                'name' => 'No Branch',
                'code' => 'NONE',
                'description' => 'No branches configured',
                'address' => '',
                'latitude' => null,
                'longitude' => null,
                'is_active' => false,
                'devices' => [],
                'deviceCount' => 0,
                'locations' => [],
                'branches' => $allBranches,
            ];
        }

        // Transform devices to include location data
        $transformedDevices = $branch->devices->map(function ($device) {
            return [
                'id' => $device->id,
                'branch_id' => $device->branch_id,
                'location_id' => $device->location_id,
                'name' => $device->name,
                'ip_address' => $device->ip_address,
                'mac_address' => $device->mac_address,
                'barcode' => $device->barcode,
                'category' => $device->category,
                'status' => $device->status,
                'building' => $device->building,
                'location' => $device->location ? $device->location->name : $device->building,
                'latitude' => $device->location ? $device->location->latitude : null,
                'longitude' => $device->location ? $device->location->longitude : null,
                'brand' => $device->brand ?? '',
                'model' => $device->model ?? '',
                'uptime_percentage' => $device->uptime_percentage ?? 0,
                'is_active' => $device->is_active,
                'last_check' => $device->last_ping,
                'response_time' => $device->response_time,
                'last_ping' => $device->last_ping,
                'updated_at' => $device->updated_at?->toIso8601String(),
            ];
        })->toArray();

        return [
            'id' => $branch->id,
            'name' => $branch->name,
            'code' => $branch->code,
            'description' => $branch->description,
            'address' => $branch->address ?? '',
            'latitude' => $branch->latitude,
            'longitude' => $branch->longitude,
            'is_active' => $branch->is_active,
            'devices' => $transformedDevices,
            'deviceCount' => count($transformedDevices),
            'locations' => $branch->locations->pluck('name')->unique()->values()->toArray(),
            'branches' => $allBranches,
        ];
    }

    public function dashboard(Request $request): Response
    {
        try {
            if (!Schema::hasTable('branches')) {
                return $this->renderEmptyDashboard();
            }

            $branchId = $this->getCurrentBranchId($request);
            $branchData = $this->getBranchData($branchId);

            if (!$branchData['id']) {
                return $this->renderEmptyDashboard($branchData);
            }

            // Calculate stats for current branch
            $stats = $this->calculateBranchStats($branchData['id']);
            $deviceTypes = $this->getDeviceTypeBreakdown($branchData['id']);
            $locationStats = $this->getLocationStats($branchData['id']);
            $recentAlerts = $this->getRecentAlerts($branchData['id']);
            $recentActivity = $this->getRecentActivity($branchData['id']);

            return Inertia::render('monitor/dashboard', [
                'currentBranch' => $branchData,
                'stats' => $stats,
                'deviceTypes' => $deviceTypes,
                'locationStats' => $locationStats,
                'recentAlerts' => $recentAlerts,
                'recentActivity' => $recentActivity,
                'lastUpdate' => now()->toIso8601String()
            ]);
        } catch (\Exception $e) {
            Log::error('Dashboard error: ' . $e->getMessage());
            return $this->renderEmptyDashboard(null, 'Error: ' . $e->getMessage());
        }
    }

    private function renderEmptyDashboard($branchData = null, $error = null)
    {
        return Inertia::render('monitor/dashboard', [
            'currentBranch' => $branchData ?? [
                'id' => null,
                'name' => 'No Branch',
                'code' => 'NONE',
                'description' => 'No branches configured',
                'address' => '',
                'latitude' => null,
                'longitude' => null,
                'is_active' => false,
                'devices' => [],
                'deviceCount' => 0,
                'locations' => [],
                'branches' => [],
            ],
            'stats' => [
                'totalDevices' => 0,
                'onlineDevices' => 0,
                'warningDevices' => 0,
                'offlineDevices' => 0,
            ],
            'deviceTypes' => [],
            'locationStats' => [],
            'recentAlerts' => [],
            'recentActivity' => [],
            'lastUpdate' => now()->toIso8601String(),
            'error' => $error,
        ]);
    }

    private function calculateBranchStats($branchId)
    {
        return [
            'totalDevices' => Device::where('branch_id', $branchId)->where('is_active', true)->where('status', '!=', 'offline_ack')->count(),
            'onlineDevices' => Device::where('branch_id', $branchId)->where('is_active', true)->where('status', 'online')->count(),
            'warningDevices' => Device::where('branch_id', $branchId)->where('is_active', true)->where('status', 'warning')->count(),
            'offlineDevices' => Device::where('branch_id', $branchId)->where('is_active', true)->where('status', 'offline')->count(),
        ];
    }

    private function getDeviceTypeBreakdown($branchId)
    {
        $totalDevices = Device::where('branch_id', $branchId)->where('is_active', true)->where('status', '!=', 'offline_ack')->count();
        
        return Device::where('branch_id', $branchId)
            ->where('is_active', true)
            ->where('status', '!=', 'offline_ack')
            ->select('category', DB::raw('count(*) as count'))
            ->groupBy('category')
            ->get()
            ->map(function ($item) use ($totalDevices) {
                return [
                    'type' => $this->formatCategory($item->category),
                    'count' => $item->count,
                    'percentage' => $totalDevices > 0 ? round(($item->count / $totalDevices) * 100, 1) : 0,
                    'color' => $this->getCategoryColor($item->category)
                ];
            })
            ->toArray();
    }

    private function getLocationStats($branchId)
    {
        if (!Schema::hasTable('locations')) {
            return [];
        }

        return Device::where('devices.branch_id', $branchId)
            ->where('devices.is_active', true)
            ->where('devices.status', '!=', 'offline_ack')
            ->whereNotNull('devices.location_id')
            ->join('locations', 'devices.location_id', '=', 'locations.id')
            ->select('locations.name as location', DB::raw('count(*) as total'))
            ->addSelect(DB::raw("SUM(CASE WHEN devices.status = 'online' THEN 1 ELSE 0 END) as online"))
            ->addSelect(DB::raw("SUM(CASE WHEN devices.status = 'offline' THEN 1 ELSE 0 END) as offline"))
            ->groupBy('locations.id', 'locations.name')
            ->havingRaw('count(*) > 0')
            ->get()
            ->map(function ($item) {
                return [
                    'location' => $item->location,
                    'devices' => $item->total,
                    'online' => $item->online,
                    'offline' => $item->offline
                ];
            })
            ->toArray();
    }

    private function getRecentAlerts($branchId)
    {
        return Alert::with('device')
            ->whereHas('device', function ($query) use ($branchId) {
                $query->where('branch_id', $branchId);
            })
            ->orderBy('triggered_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($alert) {
                return [
                    'id' => $alert->id,
                    'device_name' => $alert->device->name ?? 'Unknown Device',
                    'title' => $alert->title,
                    'message' => $alert->message,
                    'severity' => $alert->severity,
                    'status' => $alert->status,
                    'acknowledged' => $alert->acknowledged,
                    'resolved' => $alert->resolved,
                    'created_at' => $alert->triggered_at,
                    'created_at_human' => $alert->triggered_at->diffForHumans()
                ];
            })
            ->toArray();
    }

    private function getRecentActivity($branchId)
    {
        $activityLogService = new ActivityLogService();
        return $activityLogService->getRecentActivities($branchId, 20);
    }

    private function getCategoryColor($category): string
    {
        $colors = [
            'switches' => 'bg-blue-500',
            'servers' => 'bg-green-500',
            'wifi' => 'bg-purple-500',
            'tas' => 'bg-orange-500',
            'cctv' => 'bg-red-500',
        ];

        return $colors[strtolower($category)] ?? 'bg-gray-500';
    }

    public function devices(Request $request)
    {
        $branchId = $this->getCurrentBranchId($request);
        
        return Inertia::render('monitor/devices', [
            'currentBranch' => $this->getBranchData($branchId),
        ]);
    }

    public function alerts(Request $request)
    {
        $branchId = $this->getCurrentBranchId($request);
        
        return Inertia::render('monitor/alerts', [
            'currentBranch' => $this->getBranchData($branchId),
        ]);
    }

    public function maps(Request $request)
    {
        $branchId = $this->getCurrentBranchId($request);
        
        return Inertia::render('monitor/maps', [
            'currentBranch' => $this->getBranchData($branchId),
        ]);
    }

    public function reports(Request $request)
    {
        $branchId = $this->getCurrentBranchId($request);
        
        return Inertia::render('monitor/reports', [
            'currentBranch' => $this->getBranchData($branchId),
        ]);
    }

    public function settings(Request $request)
    {
        $branchId = $this->getCurrentBranchId($request);
        
        return Inertia::render('monitor/settings', [
            'currentBranch' => $this->getBranchData($branchId),
        ]);
    }

    public function configuration(Request $request)
    {
        $branchId = $this->getCurrentBranchId($request);
        
        return Inertia::render('monitor/configuration', [
            'currentBranch' => $this->getBranchData($branchId),
        ]);
    }

    private function transformDevice($device)
    {
        // Get location data
        $locationName = $device->location ? $device->location->name : ($device->building ?? '');
        $latitude = $device->location ? $device->location->latitude : null;
        $longitude = $device->location ? $device->location->longitude : null;
        
        return [
            'id' => $device->id,
            'branch_id' => $device->branch_id,
            'location_id' => $device->location_id,
            'hardware_detail_id' => $device->hardware_detail_id,
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
            'brand' => $device->brand ?? '',
            'model' => $device->model ?? '',
            'uptime_percentage' => $device->uptime_percentage ?? 0,
            'is_active' => $device->is_active,
            'last_check' => $device->last_ping,
            'response_time' => $device->response_time,
            'last_ping' => $device->last_ping,
            'updated_at' => $device->updated_at?->toIso8601String(),
        ];
    }

    private function calculateStats($currentBranch)
    {
        if (!$currentBranch) {
            return [
                'totalDevices' => 0,
                'onlineDevices' => 0,
                'offlineDevices' => 0,
                'warningDevices' => 0,
            ];
        }

        $devices = $currentBranch->devices;

        return [
            'totalDevices' => $devices->count(),
            'onlineDevices' => $devices->where('status', 'online')->count(),
            'offlineDevices' => $devices->where('status', 'offline')->count(),
            'warningDevices' => $devices->where('status', 'warning')->count(),
        ];
    }
    
    /**
     * Format category name for display
     */
    private function formatCategory($category)
    {
        return match(strtolower($category)) {
            'tas' => 'TAS',
            'cctv' => 'CCTV',
            'wifi' => 'WiFi',
            default => ucfirst($category),
        };
    }
}