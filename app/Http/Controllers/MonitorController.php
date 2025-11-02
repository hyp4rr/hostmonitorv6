<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\Device;
use App\Models\Alert;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MonitorController extends Controller
{
    public function dashboard()
    {
        $currentBranch = Branch::with('devices')->first();
        
        if (!$currentBranch) {
            return Inertia::render('monitor/dashboard', [
                'stats' => [
                    'totalDevices' => 0,
                    'onlineDevices' => 0,
                    'warningDevices' => 0,
                    'offlineDevices' => 0,
                ],
                'recentAlerts' => [],
                'recentActivity' => [],
            ]);
        }

        $devices = $currentBranch->devices;
        
        return Inertia::render('monitor/dashboard', [
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
        return Inertia::render('monitor/devices');
    }

    public function alerts()
    {
        $alerts = Alert::with('device')->latest('triggered_at')->get();
        
        return Inertia::render('monitor/alerts', [
            'alerts' => $alerts,
        ]);
    }

    public function maps()
    {
        return Inertia::render('monitor/maps');
    }

    public function reports()
    {
        return Inertia::render('monitor/reports');
    }

    public function settings()
    {
        return Inertia::render('monitor/settings');
    }

    public function configuration()
    {
        return Inertia::render('monitor/configuration');
    }
}