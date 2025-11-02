<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
    public function stats()
    {
        try {
            // Check if tables exist
            if (!DB::getSchemaBuilder()->hasTable('devices')) {
                return response()->json([
                    'stats' => [
                        'total' => 0,
                        'online' => 0,
                        'offline' => 0,
                        'warning' => 0,
                    ],
                    'recent_alerts' => [],
                    'recent_activity' => [],
                ]);
            }

            // Get basic device counts
            $stats = [
                'total' => DB::table('devices')->where('is_active', true)->count(),
                'online' => DB::table('devices')->where('is_active', true)->where('status', 'online')->count(),
                'offline' => DB::table('devices')->where('is_active', true)->whereIn('status', ['offline', 'down'])->count(),
                'warning' => DB::table('devices')->where('is_active', true)->where('status', 'warning')->count(),
            ];

            $recentAlerts = [];
            $recentActivity = [];

            // Check if alerts table exists
            if (DB::getSchemaBuilder()->hasTable('alerts')) {
                $alertsData = DB::table('alerts')
                    ->join('devices', 'alerts.device_id', '=', 'devices.id')
                    ->where('alerts.status', '!=', 'resolved')
                    ->orderBy('alerts.created_at', 'desc')
                    ->limit(5)
                    ->select('alerts.*', 'devices.name as device_name')
                    ->get();

                $recentAlerts = $alertsData->map(function ($alert) {
                    return [
                        'id' => $alert->id,
                        'device_id' => $alert->device_id,
                        'type' => $alert->type,
                        'severity' => $alert->severity,
                        'title' => $alert->title,
                        'message' => $alert->message,
                        'status' => $alert->status,
                        'acknowledged' => (bool) $alert->acknowledged,
                        'resolved' => (bool) $alert->resolved,
                        'created_at' => $alert->created_at,
                        'device_name' => $alert->device_name ?? 'Unknown',
                        'created_at_human' => now()->parse($alert->created_at)->diffForHumans(),
                    ];
                })->toArray();
            }

            // Check if monitoring_history table exists
            if (DB::getSchemaBuilder()->hasTable('monitoring_history')) {
                $historyData = DB::table('monitoring_history')
                    ->join('devices', 'monitoring_history.device_id', '=', 'devices.id')
                    ->orderBy('monitoring_history.checked_at', 'desc')
                    ->limit(10)
                    ->select('monitoring_history.*', 'devices.name as device_name')
                    ->get();

                $recentActivity = $historyData->map(function ($history) {
                    return [
                        'device_id' => $history->device_id,
                        'device_name' => $history->device_name ?? 'Unknown',
                        'status' => $history->status,
                        'checked_at' => $history->checked_at,
                        'time_ago' => now()->parse($history->checked_at)->diffForHumans(),
                    ];
                })->toArray();
            }

            return response()->json([
                'stats' => $stats,
                'recent_alerts' => $recentAlerts,
                'recent_activity' => $recentActivity,
            ]);
        } catch (\Exception $e) {
            Log::error('Dashboard stats error: ' . $e->getMessage());
            
            return response()->json([
                'stats' => [
                    'total' => 0,
                    'online' => 0,
                    'offline' => 0,
                    'warning' => 0,
                ],
                'recent_alerts' => [],
                'recent_activity' => [],
                'error' => $e->getMessage(),
            ], 200);
        }
    }
}
