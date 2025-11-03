<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\Device;
use App\Models\Alert;
use App\Models\MonitoringHistory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Log;

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

        // Get the current branch with relationships
        $branch = Branch::with(['devices' => function ($query) {
            $query->where('is_active', true);
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

        return [
            'id' => $branch->id,
            'name' => $branch->name,
            'code' => $branch->code,
            'description' => $branch->description,
            'address' => $branch->address ?? '',
            'latitude' => $branch->latitude,
            'longitude' => $branch->longitude,
            'is_active' => $branch->is_active,
            'devices' => $branch->devices->toArray(),
            'deviceCount' => $branch->devices->count(),
            'locations' => $branch->locations->pluck('name')->unique()->values()->toArray(),
            'branches' => $allBranches,
        ];
    }

    public function dashboard(Request $request)
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
            'totalDevices' => Device::where('branch_id', $branchId)->where('is_active', true)->count(),
            'onlineDevices' => Device::where('branch_id', $branchId)->where('is_active', true)->where('status', 'online')->count(),
            'warningDevices' => Device::where('branch_id', $branchId)->where('is_active', true)->where('status', 'warning')->count(),
            'offlineDevices' => Device::where('branch_id', $branchId)->where('is_active', true)->whereIn('status', ['offline', 'offline_ack'])->count(),
        ];
    }

    private function getDeviceTypeBreakdown($branchId)
    {
        $totalDevices = Device::where('branch_id', $branchId)->where('is_active', true)->count();
        
        return Device::where('branch_id', $branchId)
            ->where('is_active', true)
            ->select('category', DB::raw('count(*) as count'))
            ->groupBy('category')
            ->get()
            ->map(function ($item) use ($totalDevices) {
                return [
                    'type' => ucfirst($item->category),
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
            ->whereNotNull('devices.location_id')
            ->join('locations', 'devices.location_id', '=', 'locations.id')
            ->select('locations.name as location', DB::raw('count(*) as total'))
            ->addSelect(DB::raw("SUM(CASE WHEN devices.status = 'online' THEN 1 ELSE 0 END) as online"))
            ->addSelect(DB::raw("SUM(CASE WHEN devices.status IN ('offline', 'offline_ack') THEN 1 ELSE 0 END) as offline"))
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
        if (!Schema::hasTable('monitoring_history')) {
            return [];
        }

        return MonitoringHistory::with('device')
            ->whereHas('device', function ($query) use ($branchId) {
                $query->where('branch_id', $branchId);
            })
            ->orderBy('checked_at', 'desc')
            ->limit(20)
            ->get()
            ->map(function ($history) {
                return [
                    'id' => $history->id,
                    'device_name' => $history->device->name ?? 'Unknown Device',
                    'status' => $history->status,
                    'checked_at' => $history->checked_at,
                    'time_ago' => $history->checked_at->diffForHumans()
                ];
            })
            ->toArray();
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
}