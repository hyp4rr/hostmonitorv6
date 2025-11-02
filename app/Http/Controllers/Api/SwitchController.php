<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\PingSwitch;
use App\Models\NetworkSwitch;
use Illuminate\Http\Request;

class SwitchController extends Controller
{
    /**
     * Get all switches with current status
     */
    public function index()
    {
        $switches = NetworkSwitch::all()->map(function ($switch) {
            return [
                'id' => $switch->id,
                'name' => $switch->name,
                'ip' => $switch->ip_address,
                'location' => $switch->location,
                'brand' => $switch->brand,
                'status' => $switch->status,
                'uptime' => $switch->uptime,
                'category' => 'switch',
            ];
        });

        return response()->json($switches);
    }

    /**
     * Get statistics
     */
    public function stats()
    {
        $total = NetworkSwitch::count();
        $online = NetworkSwitch::where('status', 'online')->count();
        $offline = NetworkSwitch::where('status', 'offline')->count();
        $warning = NetworkSwitch::where('status', 'warning')->count();

        return response()->json([
            'total' => $total,
            'online' => $online,
            'offline' => $offline,
            'warning' => $warning,
        ]);
    }

    /**
     * Trigger ping for all switches
     */
    public function pingAll()
    {
        $switches = NetworkSwitch::all();
        
        foreach ($switches as $switch) {
            PingSwitch::dispatch($switch);
        }

        return response()->json([
            'message' => 'Ping jobs dispatched',
            'count' => $switches->count()
        ]);
    }

    /**
     * Trigger ping for a single switch
     */
    public function pingSingle($id)
    {
        $switch = NetworkSwitch::findOrFail($id);
        
        PingSwitch::dispatch($switch);

        return response()->json([
            'message' => 'Ping job dispatched',
            'switch' => $switch->name
        ]);
    }
}
