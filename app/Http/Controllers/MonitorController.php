<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\Device;
use App\Models\Alert;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MonitorController extends Controller
{
    private function getCurrentBranch()
    {
        $branch = Branch::with('devices')->first();
        
        if (!$branch) {
            return [
                'id' => 1,
                'name' => 'Default Branch',
                'code' => 'DEFAULT',
                'description' => 'No branch configured',
                'address' => '',
                'latitude' => 0,
                'longitude' => 0,
                'is_active' => true,
                'devices' => [],
                'deviceCount' => 0,
                'locations' => [],
            ];
        }

        return [
            'id' => $branch->id,
            'name' => $branch->name,
            'code' => $branch->code,
            'description' => $branch->description,
            'address' => $branch->address,
            'latitude' => $branch->latitude,
            'longitude' => $branch->longitude,
            'is_active' => $branch->is_active,
            'devices' => $branch->devices->toArray(),
            'deviceCount' => $branch->devices->count(),
            'locations' => $branch->devices->pluck('location')->unique()->values()->toArray(),
        ];
    }

    public function dashboard()
    {
        $currentBranch = $this->getCurrentBranch();
        $devices = collect($currentBranch['devices']);
        
        return Inertia::render('monitor/dashboard', [
            'currentBranch' => $currentBranch,
            'stats' => [
                'totalDevices' => $devices->count(),
                'onlineDevices' => $devices->where('status', 'online')->count(),
                'warningDevices' => $devices->where('status', 'warning')->count(),
                'offlineDevices' => $devices->whereIn('status', ['offline', 'offline_ack'])->count(),
            ],
            'recentAlerts' => Alert::with('device')
                ->where('acknowledged', false)
                ->latest('triggered_at')
                ->take(5)
                ->get(),
            'recentActivity' => $devices->whereNotNull('last_check')
                ->sortByDesc('last_check')
                ->take(10)
                ->values()
                ->toArray(),
        ]);
    }

    public function devices()
    {
        return Inertia::render('monitor/devices', [
            'currentBranch' => $this->getCurrentBranch(),
        ]);
    }

    public function alerts()
    {
        $alerts = Alert::with('device')->latest('triggered_at')->get();
        
        return Inertia::render('monitor/alerts', [
            'currentBranch' => $this->getCurrentBranch(),
            'alerts' => $alerts,
        ]);
    }

    public function maps()
    {
        return Inertia::render('monitor/maps', [
            'currentBranch' => $this->getCurrentBranch(),
        ]);
    }

    public function reports()
    {
        return Inertia::render('monitor/reports', [
            'currentBranch' => $this->getCurrentBranch(),
        ]);
    }

    public function settings()
    {
        return Inertia::render('monitor/settings', [
            'currentBranch' => $this->getCurrentBranch(),
        ]);
    }

    public function configuration()
    {
        return Inertia::render('monitor/configuration', [
            'currentBranch' => $this->getCurrentBranch(),
        ]);
    }
}