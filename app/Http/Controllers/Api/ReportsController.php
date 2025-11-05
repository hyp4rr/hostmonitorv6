<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Device;
use App\Models\MonitoringHistory;
use App\Models\Alert;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReportsController extends Controller
{
    /**
     * Get uptime statistics for devices
     */
    public function uptimeStats(Request $request)
    {
        $branchId = $request->input('branch_id');
        $dateRange = $request->input('date_range', '7days');
        
        // Calculate date range
        $startDate = $this->getStartDate($dateRange);
        
        // Get devices with their actual uptime data
        $devices = Device::where('branch_id', $branchId)
            ->where('is_active', true)
            ->where('status', '!=', 'offline_ack')
            ->get();
        
        $stats = $devices->map(function ($device) use ($startDate) {
            // Get monitoring history for this device in the date range
            $history = MonitoringHistory::where('device_id', $device->id)
                ->where('checked_at', '>=', $startDate)
                ->orderBy('checked_at', 'asc')
                ->get();
            
            $totalChecks = $history->count();
            $onlineChecks = $history->where('status', 'online')->count();
            
            // Calculate uptime percentage
            $uptimePercentage = $totalChecks > 0 ? ($onlineChecks / $totalChecks) * 100 : $device->uptime_percentage;
            
            // Calculate downtime
            $downtimeMinutes = $device->offline_duration_minutes ?? 0;
            $hours = floor($downtimeMinutes / 60);
            $minutes = $downtimeMinutes % 60;
            $downtimeStr = $hours > 0 ? "{$hours}h {$minutes}min" : "{$minutes}min";
            
            // Count incidents (state transitions from online to offline only)
            $incidents = 0;
            $previousStatus = null;
            foreach ($history as $record) {
                if ($previousStatus === 'online' && $record->status === 'offline') {
                    $incidents++;
                }
                $previousStatus = $record->status;
            }
            
            // Get last incident (last transition to offline)
            $lastIncident = null;
            $previousStatus = null;
            foreach ($history->reverse() as $record) {
                if ($record->status === 'offline' && $previousStatus === 'online') {
                    $lastIncident = $record;
                    break;
                }
                $previousStatus = $record->status;
            }
            
            return [
                'device' => $device->name,
                'uptime' => round($uptimePercentage, 2),
                'downtime' => $downtimeStr,
                'incidents' => $incidents,
                'category' => ucfirst($device->category),
                'lastIncident' => $lastIncident ? $lastIncident->checked_at->toDateString() : 'Never',
            ];
        });
        
        return response()->json($stats);
    }
    
    /**
     * Get device events (status changes)
     */
    public function deviceEvents(Request $request)
    {
        $branchId = $request->input('branch_id');
        $dateRange = $request->input('date_range', '7days');
        $limit = $request->input('limit', 50);
        
        $startDate = $this->getStartDate($dateRange);
        
        // Get recent monitoring history with status changes
        $events = MonitoringHistory::join('devices', 'monitoring_history.device_id', '=', 'devices.id')
            ->where('devices.branch_id', $branchId)
            ->where('devices.status', '!=', 'offline_ack')
            ->where('monitoring_history.checked_at', '>=', $startDate)
            ->orderBy('monitoring_history.checked_at', 'desc')
            ->limit($limit)
            ->select(
                'monitoring_history.id',
                'devices.name as device_name',
                'devices.ip_address as device_ip',
                'devices.category',
                'monitoring_history.status as event_type',
                'monitoring_history.checked_at as timestamp',
                'monitoring_history.response_time'
            )
            ->get()
            ->map(function ($event) {
                return [
                    'id' => 'event-' . $event->id,
                    'deviceName' => $event->device_name,
                    'deviceIp' => $event->device_ip,
                    'eventType' => $event->event_type === 'online' ? 'up' : 'down',
                    'timestamp' => $event->timestamp->toIso8601String(),
                    'category' => ucfirst($event->category),
                    'responseTime' => $event->response_time,
                ];
            });
        
        return response()->json($events);
    }
    
    /**
     * Get category statistics
     */
    public function categoryStats(Request $request)
    {
        $branchId = $request->input('branch_id');
        
        $stats = Device::where('branch_id', $branchId)
            ->where('is_active', true)
            ->where('status', '!=', 'offline_ack')
            ->select('category', DB::raw('count(*) as total'))
            ->addSelect(DB::raw("SUM(CASE WHEN status = 'online' THEN 1 ELSE 0 END) as online"))
            ->addSelect(DB::raw("SUM(CASE WHEN status = 'offline' THEN 1 ELSE 0 END) as offline"))
            ->addSelect(DB::raw("AVG(uptime_percentage) as avg_uptime"))
            ->groupBy('category')
            ->get()
            ->map(function ($stat) {
                return [
                    'category' => ucfirst($stat->category),
                    'total' => $stat->total,
                    'online' => $stat->online,
                    'offline' => $stat->offline,
                    'avgUptime' => round($stat->avg_uptime, 2),
                ];
            });
        
        return response()->json($stats);
    }
    
    /**
     * Get alert summary
     */
    public function alertSummary(Request $request)
    {
        $branchId = $request->input('branch_id');
        $dateRange = $request->input('date_range', '7days');
        
        $startDate = $this->getStartDate($dateRange);
        
        $summary = Alert::join('devices', 'alerts.device_id', '=', 'devices.id')
            ->where('devices.branch_id', $branchId)
            ->where('alerts.triggered_at', '>=', $startDate)
            ->select('alerts.severity', DB::raw('count(*) as count'))
            ->groupBy('alerts.severity')
            ->get()
            ->pluck('count', 'severity')
            ->toArray();
        
        return response()->json([
            'critical' => $summary['critical'] ?? 0,
            'high' => $summary['high'] ?? 0,
            'medium' => $summary['medium'] ?? 0,
            'low' => $summary['low'] ?? 0,
            'total' => array_sum($summary),
        ]);
    }
    
    /**
     * Get summary statistics for dashboard cards
     */
    public function summary(Request $request)
    {
        $branchId = $request->input('branch_id');
        $dateRange = $request->input('date_range', '7days');
        
        $startDate = $this->getStartDate($dateRange);
        
        // Get all devices
        $devices = Device::where('branch_id', $branchId)
            ->where('is_active', true)
            ->where('status', '!=', 'offline_ack')
            ->get();
        
        $totalDevices = $devices->count();
        
        // Calculate average uptime from monitoring history
        $avgUptime = 0;
        if ($totalDevices > 0) {
            $uptimeSum = 0;
            foreach ($devices as $device) {
                $history = MonitoringHistory::where('device_id', $device->id)
                    ->where('checked_at', '>=', $startDate)
                    ->get();
                
                $totalChecks = $history->count();
                if ($totalChecks > 0) {
                    $onlineChecks = $history->where('status', 'online')->count();
                    $uptimeSum += ($onlineChecks / $totalChecks) * 100;
                } else {
                    $uptimeSum += $device->uptime_percentage;
                }
            }
            $avgUptime = round($uptimeSum / $totalDevices, 2);
        }
        
        // Count total incidents (state transitions from online to offline only)
        $totalIncidents = 0;
        foreach ($devices as $device) {
            // Get history ordered by time
            $history = MonitoringHistory::where('device_id', $device->id)
                ->where('checked_at', '>=', $startDate)
                ->orderBy('checked_at', 'asc')
                ->get();
            
            // Count transitions from online to offline
            $previousStatus = null;
            foreach ($history as $record) {
                if ($previousStatus === 'online' && $record->status === 'offline') {
                    $totalIncidents++;
                }
                $previousStatus = $record->status;
            }
        }
        
        // Calculate total downtime
        $totalDowntimeMinutes = $devices->sum('offline_duration_minutes') ?? 0;
        $hours = floor($totalDowntimeMinutes / 60);
        $minutes = round($totalDowntimeMinutes % 60);
        
        return response()->json([
            'avgUptime' => $avgUptime,
            'totalIncidents' => $totalIncidents,
            'totalDowntime' => [
                'hours' => $hours,
                'minutes' => $minutes,
                'formatted' => $hours > 0 ? "{$hours}h {$minutes}m" : "{$minutes}m",
                'percentage' => $totalDevices > 0 ? round((100 - $avgUptime), 2) : 0,
            ],
            'devicesMonitored' => $totalDevices,
        ]);
    }
    
    /**
     * Helper to get start date based on range
     */
    private function getStartDate($range)
    {
        return match($range) {
            '24hours' => Carbon::now()->subDay(),
            '7days' => Carbon::now()->subWeek(),
            '30days' => Carbon::now()->subMonth(),
            '90days' => Carbon::now()->subDays(90),
            default => Carbon::now()->subWeek(),
        };
    }
}
