<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Device;
use App\Models\MonitoringHistory;
use App\Models\Alert;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
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
        $category = $request->input('category', 'all');
        
        $cacheKey = "reports.uptime.branch.{$branchId}.range.{$dateRange}.cat." . ($category === 'all' ? 'all' : strtolower($category));
        
        // Cache for 2 minutes (120 seconds)
        $stats = Cache::remember($cacheKey, 120, function () use ($branchId, $dateRange, $category) {
            // Calculate date range
            $startDate = $this->getStartDate($dateRange);
            
            // Get devices with their actual uptime data
            $devicesQuery = Device::where('branch_id', $branchId)
                ->where('is_active', true)
                ->where('status', '!=', 'offline_ack');
            
            // Apply category filter if not 'all'
            if ($category !== 'all') {
                $categoryFilter = $this->normalizeCategory($category);
                $devicesQuery->where('category', $categoryFilter);
            }
            
            $devices = $devicesQuery->select('id', 'name', 'category', 'uptime_percentage', 'offline_duration_minutes')
                ->get();
            
            // Get all monitoring history for these devices in one query
            $deviceIds = $devices->pluck('id');
            $allHistory = MonitoringHistory::whereIn('device_id', $deviceIds)
                ->where('checked_at', '>=', $startDate)
                ->orderBy('device_id', 'asc')
                ->orderBy('checked_at', 'asc')
                ->select('device_id', 'status', 'checked_at')
                ->get()
                ->groupBy('device_id');
            
            return $devices->map(function ($device) use ($allHistory) {
                // Get history for this specific device
                $history = $allHistory->get($device->id, collect());
                
                // Use device's actual uptime percentage
                $uptimePercentage = $device->uptime_percentage;
                
                // Calculate downtime
                $downtimeMinutes = $device->offline_duration_minutes ?? 0;
                $hours = floor($downtimeMinutes / 60);
                $minutes = ceil($downtimeMinutes % 60);
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
                    'category' => $this->formatCategory($device->category),
                    'lastIncident' => $lastIncident ? $lastIncident->checked_at->toDateString() : 'Never',
                ];
            });
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
        
        $cacheKey = "reports.events.branch.{$branchId}.range.{$dateRange}.limit.{$limit}";
        
        // Cache for 1 minute (60 seconds)
        return Cache::remember($cacheKey, 60, function () use ($branchId, $dateRange, $limit) {
            $startDate = $this->getStartDate($dateRange);
        
        // Get all monitoring history entries
        $allHistory = MonitoringHistory::join('devices', 'monitoring_history.device_id', '=', 'devices.id')
            ->where('devices.branch_id', $branchId)
            ->where('monitoring_history.checked_at', '>=', $startDate)
            ->orderBy('monitoring_history.device_id', 'asc')
            ->orderBy('monitoring_history.checked_at', 'asc')
            ->select(
                'monitoring_history.id',
                'monitoring_history.device_id',
                'devices.name as device_name',
                'devices.ip_address as device_ip',
                'devices.category',
                'monitoring_history.status',
                'monitoring_history.checked_at as timestamp',
                'monitoring_history.response_time'
            )
            ->get();
        
        // Filter to only status changes
        $statusChanges = collect();
        $lastStatus = [];
        
        foreach ($allHistory as $entry) {
            $deviceId = $entry->device_id;
            $currentStatus = $entry->status;
            
            // If this is the first entry for this device or status changed
            if (!isset($lastStatus[$deviceId]) || $lastStatus[$deviceId] !== $currentStatus) {
                $statusChanges->push($entry);
                $lastStatus[$deviceId] = $currentStatus;
            }
        }
        
        // Get the most recent status changes
        $events = $statusChanges
            ->sortByDesc('timestamp')
            ->take($limit)
            ->map(function ($event) {
                return [
                    'id' => 'event-' . $event->id,
                    'deviceName' => $event->device_name,
                    'deviceIp' => $event->device_ip,
                    'eventType' => $event->status === 'online' ? 'up' : 'down',
                    'timestamp' => $event->timestamp->toIso8601String(),
                    'category' => $this->formatCategory($event->category),
                    'responseTime' => $event->response_time,
                ];
            })
            ->values();
        
            return response()->json($events);
        });
    }
    
    /**
     * Get category statistics
     */
    public function categoryStats(Request $request)
    {
        $branchId = $request->input('branch_id');
        
        $cacheKey = "reports.category.branch.{$branchId}";
        
        // Cache for 3 minutes (180 seconds)
        return Cache::remember($cacheKey, 180, function () use ($branchId) {
        
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
                    'category' => $this->formatCategory($stat->category),
                    'total' => $stat->total,
                    'online' => $stat->online,
                    'offline' => $stat->offline,
                    'avgUptime' => round($stat->avg_uptime, 2),
                ];
            });
        
            return response()->json($stats);
        });
    }
    
    /**
     * Get alert summary
     */
    public function alertSummary(Request $request)
    {
        $branchId = $request->input('branch_id');
        $dateRange = $request->input('date_range', '7days');
        
        $cacheKey = "reports.alerts.branch.{$branchId}.range.{$dateRange}";
        
        // Cache for 2 minutes (120 seconds)
        return Cache::remember($cacheKey, 120, function () use ($branchId, $dateRange) {
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
        });
    }
    
    /**
     * Get summary statistics for dashboard cards
     */
    public function summary(Request $request)
    {
        $branchId = $request->input('branch_id');
        $dateRange = $request->input('date_range', '7days');
        $category = $request->input('category', 'all');
        
        $cacheKey = "reports.summary.branch.{$branchId}.range.{$dateRange}.cat." . ($category === 'all' ? 'all' : strtolower($category));
        
        // Cache for 2 minutes (120 seconds)
        return Cache::remember($cacheKey, 120, function () use ($branchId, $dateRange, $category) {
            $startDate = $this->getStartDate($dateRange);
            
            // Build device query with category filter
            $devicesQuery = Device::where('branch_id', $branchId)
                ->where('is_active', true)
                ->where('status', '!=', 'offline_ack');
            
            // Apply category filter if not 'all'
            if ($category !== 'all') {
                $categoryFilter = $this->normalizeCategory($category);
                $devicesQuery->where('category', $categoryFilter);
            }
            
            // Get aggregate stats in a single query
            $deviceStats = $devicesQuery->select([
                    DB::raw('COUNT(*) as total_devices'),
                    DB::raw('AVG(uptime_percentage) as avg_uptime'),
                    DB::raw('SUM(offline_duration_minutes) as total_downtime_minutes')
                ])
                ->first();
            
            $totalDevices = $deviceStats->total_devices ?? 0;
            $avgUptime = round($deviceStats->avg_uptime ?? 0, 2);
            $totalDowntimeMinutes = $deviceStats->total_downtime_minutes ?? 0;
            
            // Count incidents using a more efficient query
            // Get device IDs for this branch with category filter
            $deviceIdsQuery = Device::where('branch_id', $branchId)
                ->where('is_active', true)
                ->where('status', '!=', 'offline_ack');
            
            if ($category !== 'all') {
                $categoryFilter = $this->normalizeCategory($category);
                $deviceIdsQuery->where('category', $categoryFilter);
            }
            
            $deviceIds = $deviceIdsQuery->pluck('id');
            
            // Count status transitions in a single query using window functions
            $totalIncidents = DB::table('monitoring_history as mh1')
                ->join('monitoring_history as mh2', function($join) {
                    $join->on('mh1.device_id', '=', 'mh2.device_id')
                         ->whereRaw('mh2.checked_at = (
                             SELECT MAX(checked_at) 
                             FROM monitoring_history 
                             WHERE device_id = mh1.device_id 
                             AND checked_at < mh1.checked_at
                         )');
                })
                ->whereIn('mh1.device_id', $deviceIds)
                ->where('mh1.checked_at', '>=', $startDate)
                ->where('mh2.status', 'online')
                ->where('mh1.status', 'offline')
                ->count();
            
            // Calculate downtime display
            $hours = floor($totalDowntimeMinutes / 60);
            $minutes = ceil($totalDowntimeMinutes % 60);
            
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
        });
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
    
    /**
     * Normalize category name for filtering (convert display name to database value)
     */
    private function normalizeCategory($category)
    {
        return match(strtolower($category)) {
            'switches' => 'switches',
            'servers' => 'servers',
            'wifi' => 'wifi',
            'tas' => 'tas',
            'cctv' => 'cctv',
            default => strtolower($category),
        };
    }
}
