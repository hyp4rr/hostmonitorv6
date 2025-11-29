<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Device;
use App\Models\MonitoringHistory;
use App\Models\Alert;
use App\Models\Branch;
use App\Models\User;
use App\Models\ReportHistory;
use App\Models\CustomReport;
use App\Mail\ReportEmail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use Dompdf\Dompdf;
use Dompdf\Options;

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
            // Include all active devices regardless of status (online, offline, warning, offline_ack)
            $devicesQuery = Device::where('branch_id', $branchId)
                ->where('is_active', true);
            
            // Apply category filter if not 'all'
            if ($category !== 'all') {
                $categoryFilter = $this->normalizeCategory($category);
                $devicesQuery->where('category', $categoryFilter);
            }
            
            $devices = $devicesQuery->select('id', 'name', 'ip_address', 'category', 'status', 'uptime_percentage', 'offline_duration_minutes')
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
            
            return $devices->map(function ($device) use ($allHistory, $startDate) {
                // Get history for this specific device
                $history = $allHistory->get($device->id, collect());
                
                // Calculate uptime percentage from monitoring history for the selected date range
                $uptimePercentage = 0;
                if ($history->count() > 0) {
                    // Count online checks vs total checks in the date range
                    $totalChecks = $history->count();
                    $onlineChecks = $history->where('status', 'online')->count();
                    $uptimePercentage = round((float) (($onlineChecks / $totalChecks) * 100), 2);
                } else {
                    // No history in the date range - use current status
                    // If device is currently offline, uptime should be 0% (or very low)
                    // If device is online but no history, assume 100% (newly added device)
                    if ($device->status === 'offline' || $device->status === 'offline_ack') {
                        $uptimePercentage = 0;
                    } else {
                        // Device is online but no history - could be newly added
                        // Use stored uptime percentage or default to 100%
                        $uptimePercentage = $device->uptime_percentage ?? 100;
                    }
                }
                
                // Calculate downtime using FormatHelper
                $downtimeMinutes = $device->offline_duration_minutes ?? 0;
                $downtimeStr = \App\Helpers\FormatHelper::formatOfflineDuration($downtimeMinutes);
                
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
                    'ip_address' => $device->ip_address,
                    'status' => $device->status,
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
                'monitoring_history.checked_at',
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
            ->sortByDesc('checked_at')
            ->take($limit)
            ->map(function ($event) {
                // checked_at should be a Carbon instance from Eloquent
                // but handle cases where it might be a string
                $timestamp = $event->checked_at;
                if (is_string($timestamp)) {
                    $timestamp = Carbon::parse($timestamp);
                } elseif (!$timestamp instanceof Carbon) {
                    $timestamp = Carbon::now();
                }
                
                return [
                    'id' => 'event-' . $event->id,
                    'deviceName' => $event->device_name ?? 'Unknown',
                    'deviceIp' => $event->device_ip ?? 'N/A',
                    'eventType' => ($event->status === 'online' || $event->status === 'warning') ? 'up' : 'down',
                    'timestamp' => $timestamp->toIso8601String(),
                    'category' => $this->formatCategory($event->category ?? 'switches'),
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
            ->select('category', DB::raw('count(*) as total'))
            ->addSelect(DB::raw("SUM(CASE WHEN status = 'online' THEN 1 ELSE 0 END) as online"))
            ->addSelect(DB::raw("SUM(CASE WHEN status IN ('offline', 'offline_ack') THEN 1 ELSE 0 END) as offline"))
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
            // Include all active devices regardless of status
            $devicesQuery = Device::where('branch_id', $branchId)
                ->where('is_active', true);
            
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
            // Include all active devices regardless of status
            $deviceIdsQuery = Device::where('branch_id', $branchId)
                ->where('is_active', true);
            
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
    
    /**
     * Get SLA report with compliance metrics
     */
    public function slaReport(Request $request)
    {
        $branchId = $request->input('branch_id');
        $dateRange = $request->input('date_range', '30days');
        // SLA reports need longer periods for meaningful metrics, default to 30 days minimum
        if ($dateRange === '24hours') {
            $dateRange = '30days';
        }
        $category = $request->input('category', 'all');
        
        $cacheKey = "reports.sla.branch.{$branchId}.range.{$dateRange}.cat." . ($category === 'all' ? 'all' : strtolower($category));
        
        // Cache for 2 minutes (120 seconds)
        return Cache::remember($cacheKey, 120, function () use ($branchId, $dateRange, $category) {
            $startDate = $this->getStartDate($dateRange);
            $endDate = Carbon::now();
            
            // Calculate total minutes in the date range
            $totalMinutes = $endDate->diffInMinutes($startDate);
            $totalHours = $totalMinutes / 60;
            $totalDays = $totalHours / 24;
            
            // Get devices with SLA targets
            $devicesQuery = Device::where('branch_id', $branchId)
                ->where('is_active', true);
            
            // Apply category filter if not 'all'
            if ($category !== 'all') {
                $categoryFilter = $this->normalizeCategory($category);
                $devicesQuery->where('category', $categoryFilter);
            }
            
            $devices = $devicesQuery->select('id', 'name', 'ip_address', 'category', 'status', 'uptime_percentage', 'sla_target', 'offline_duration_minutes')
                ->get();
            
            // Get all monitoring history for these devices - OPTIMIZED: Use database aggregation
            $deviceIds = $devices->pluck('id');
            
            // Get aggregated stats per device in one query
            $historyStats = MonitoringHistory::whereIn('device_id', $deviceIds)
                ->where('checked_at', '>=', $startDate)
                ->where('checked_at', '<=', $endDate)
                ->select('device_id', 'status', 'checked_at')
                ->orderBy('device_id', 'asc')
                ->orderBy('checked_at', 'asc')
                ->get()
                ->groupBy('device_id');
            
            // Pre-calculate uptime stats using database aggregation
            $uptimeAggregates = MonitoringHistory::whereIn('device_id', $deviceIds)
                ->where('checked_at', '>=', $startDate)
                ->where('checked_at', '<=', $endDate)
                ->select('device_id', DB::raw('COUNT(*) as total_checks'), DB::raw('SUM(CASE WHEN status = \'online\' THEN 1 ELSE 0 END) as online_checks'), DB::raw('SUM(CASE WHEN status IN (\'offline\', \'offline_ack\') THEN 1 ELSE 0 END) as offline_checks'))
                ->groupBy('device_id')
                ->get()
                ->keyBy('device_id');
            
            // Get last status change for each device (for last incident)
            $lastStatusChanges = MonitoringHistory::whereIn('device_id', $deviceIds)
                ->where('checked_at', '>=', $startDate)
                ->where('checked_at', '<=', $endDate)
                ->select('device_id', 'status', 'checked_at')
                ->orderBy('device_id', 'asc')
                ->orderBy('checked_at', 'desc')
                ->get()
                ->groupBy('device_id')
                ->map(function ($records) {
                    return $records->first();
                });
            
            // Process each device for SLA metrics - OPTIMIZED: Single pass calculation
            $slaData = $devices->map(function ($device) use ($historyStats, $uptimeAggregates, $lastStatusChanges, $startDate, $endDate, $totalMinutes, $totalHours, $totalDays) {
                $history = $historyStats->get($device->id, collect());
                $slaTarget = $device->sla_target ?? 99.9; // Default to 99.9% if not set
                
                // Use pre-calculated aggregates for faster computation
                $aggregate = $uptimeAggregates->get($device->id);
                
                // Calculate actual uptime percentage
                $actualUptime = 0;
                if ($aggregate && $aggregate->total_checks > 0) {
                    $actualUptime = round((float) (($aggregate->online_checks / $aggregate->total_checks) * 100), 2);
                } else {
                    // No history - use stored uptime or current status
                    $actualUptime = $device->uptime_percentage ?? ($device->status === 'online' ? 100 : 0);
                }
                
                // Calculate SLA compliance
                $isCompliant = $actualUptime >= $slaTarget;
                $complianceGap = round($actualUptime - $slaTarget, 2);
                
                // Calculate allowed downtime based on SLA target
                $slaDowntimePercentage = 100 - $slaTarget;
                $allowedDowntimeMinutes = ($totalMinutes * $slaDowntimePercentage) / 100;
                $allowedDowntimeHours = $allowedDowntimeMinutes / 60;
                
                // Calculate actual downtime
                $actualDowntimeMinutes = 0;
                if ($aggregate && $aggregate->total_checks > 0) {
                    $actualDowntimeMinutes = ($totalMinutes * $aggregate->offline_checks) / $aggregate->total_checks;
                } else {
                    // Use stored offline duration or estimate from current status
                    if ($device->status === 'offline' || $device->status === 'offline_ack') {
                        $actualDowntimeMinutes = $device->offline_duration_minutes ?? $totalMinutes;
                    }
                }
                $actualDowntimeHours = $actualDowntimeMinutes / 60;
                
                // Calculate downtime violation
                $downtimeViolation = max(0, $actualDowntimeMinutes - $allowedDowntimeMinutes);
                $downtimeViolationHours = $downtimeViolation / 60;
                
                // Calculate incidents and MTTR - OPTIMIZED: Single pass through history
                $incidents = 0;
                $downtimeIncidents = [];
                $previousStatus = null;
                $downtimeStart = null;
                $lastIncident = null;
                
                // Only process history if we have it (avoid processing empty collections)
                if ($history->count() > 0) {
                    foreach ($history as $record) {
                        // Track incidents
                        if ($previousStatus === 'online' && in_array($record->status, ['offline', 'offline_ack'])) {
                            $incidents++;
                            $downtimeStart = $record->checked_at;
                            $lastIncident = $record->checked_at;
                        } elseif (in_array($previousStatus, ['offline', 'offline_ack']) && $record->status === 'online' && $downtimeStart) {
                            $downtimeDuration = $downtimeStart->diffInMinutes($record->checked_at);
                            $downtimeIncidents[] = $downtimeDuration;
                            $downtimeStart = null;
                        }
                        $previousStatus = $record->status;
                    }
                    
                    // Handle ongoing downtime
                    if ($downtimeStart && ($device->status === 'offline' || $device->status === 'offline_ack')) {
                        $ongoingDowntime = $downtimeStart->diffInMinutes(Carbon::now());
                        $downtimeIncidents[] = $ongoingDowntime;
                    }
                }
                
                // Calculate MTTR (Mean Time To Repair) - average downtime duration
                $mttr = 0;
                if (count($downtimeIncidents) > 0) {
                    $mttr = array_sum($downtimeIncidents) / count($downtimeIncidents);
                }
                
                // Calculate MTBF (Mean Time Between Failures) - average time between incidents
                $mtbf = 0;
                if ($incidents > 0) {
                    $mtbf = $totalMinutes / $incidents;
                } elseif ($incidents === 0 && $totalMinutes > 0) {
                    // No incidents - MTBF is effectively infinite, but we'll cap it at total time
                    $mtbf = $totalMinutes;
                }
                
                // Count SLA violations (when actual uptime < SLA target)
                $slaViolations = $isCompliant ? 0 : 1;
                
                // Format last incident
                $lastIncidentStr = $lastIncident ? $lastIncident->toDateTimeString() : 'Never';
                
                return [
                    'device' => $device->name,
                    'ip_address' => $device->ip_address,
                    'category' => $this->formatCategory($device->category),
                    'status' => $device->status,
                    'sla_target' => round($slaTarget, 2),
                    'actual_uptime' => round($actualUptime, 2),
                    'is_compliant' => $isCompliant,
                    'compliance_gap' => round($complianceGap, 2),
                    'allowed_downtime_minutes' => round($allowedDowntimeMinutes, 2),
                    'allowed_downtime_hours' => round($allowedDowntimeHours, 2),
                    'actual_downtime_minutes' => round($actualDowntimeMinutes, 2),
                    'actual_downtime_hours' => round($actualDowntimeHours, 2),
                    'downtime_violation_minutes' => round($downtimeViolation, 2),
                    'downtime_violation_hours' => round($downtimeViolationHours, 2),
                    'incidents' => $incidents,
                    'sla_violations' => $slaViolations,
                    'mttr_minutes' => round($mttr, 2),
                    'mttr_hours' => round($mttr / 60, 2),
                    'mtbf_minutes' => round($mtbf, 2),
                    'mtbf_hours' => round($mtbf / 60, 2),
                    'mtbf_days' => round($mtbf / (60 * 24), 2),
                    'last_incident' => $lastIncidentStr,
                ];
            });
            
            // Calculate summary statistics
            $totalDevices = $slaData->count();
            $compliantDevices = $slaData->where('is_compliant', true)->count();
            $nonCompliantDevices = $slaData->where('is_compliant', false)->count();
            $complianceRate = $totalDevices > 0 ? round(($compliantDevices / $totalDevices) * 100, 2) : 0;
            
            $totalIncidents = $slaData->sum('incidents');
            $totalViolations = $slaData->sum('sla_violations');
            
            $avgUptime = $totalDevices > 0 ? round($slaData->avg('actual_uptime'), 2) : 0;
            $avgSlaTarget = $totalDevices > 0 ? round($slaData->avg('sla_target'), 2) : 0;
            
            $totalAllowedDowntime = $slaData->sum('allowed_downtime_minutes');
            $totalActualDowntime = $slaData->sum('actual_downtime_minutes');
            $totalDowntimeViolation = $slaData->sum('downtime_violation_minutes');
            
            $avgMttr = $totalDevices > 0 ? round($slaData->where('mttr_minutes', '>', 0)->avg('mttr_minutes'), 2) : 0;
            $avgMtbf = $totalDevices > 0 ? round($slaData->where('mtbf_minutes', '>', 0)->avg('mtbf_minutes'), 2) : 0;
            
            return response()->json([
                'summary' => [
                    'total_devices' => $totalDevices,
                    'compliant_devices' => $compliantDevices,
                    'non_compliant_devices' => $nonCompliantDevices,
                    'compliance_rate' => $complianceRate,
                    'avg_uptime' => $avgUptime,
                    'avg_sla_target' => $avgSlaTarget,
                    'total_incidents' => $totalIncidents,
                    'total_violations' => $totalViolations,
                    'total_allowed_downtime_hours' => round($totalAllowedDowntime / 60, 2),
                    'total_actual_downtime_hours' => round($totalActualDowntime / 60, 2),
                    'total_downtime_violation_hours' => round($totalDowntimeViolation / 60, 2),
                    'avg_mttr_hours' => round($avgMttr / 60, 2),
                    'avg_mtbf_days' => round($avgMtbf / (60 * 24), 2),
                    'date_range' => [
                        'start' => $startDate->toDateString(),
                        'end' => $endDate->toDateString(),
                        'total_days' => round($totalDays, 2),
                    ],
                ],
                'devices' => $slaData->values(),
            ]);
        });
    }
    
    /**
     * Generate custom report based on date range and report type
     */
    public function generate(Request $request)
    {
        $branchId = $request->input('branch_id');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        $reportType = $request->input('report_type', 'uptime');
        $reportName = $request->input('report_name'); // Custom report name
        $categories = $request->input('categories', []); // Array of categories
        $managedBy = $request->input('managed_by'); // Optional managed_by filter (user ID or array of IDs)
        $email = $request->input('email'); // Optional email recipient(s) - can be string or array
        
        // Normalize managed_by to array if it's a single value
        if ($managedBy && !is_array($managedBy)) {
            $managedBy = [$managedBy];
        }
        
        // Normalize email to array if it's a single value
        $emails = [];
        if ($email) {
            if (is_array($email)) {
                $emails = array_filter($email); // Remove empty values
            } else {
                $emails = [trim($email)];
            }
        }
        
        // Get current user ID for history
        $userId = Auth::id() ?? $request->user()?->id;
        
        // If still no user, try to get from session
        if (!$userId) {
            $userId = auth()->id() ?? session('user_id');
        }
        
        // If still no user, try to get first admin user as fallback
        if (!$userId) {
            $adminUser = User::where('role', 'admin')->first();
            if ($adminUser) {
                $userId = $adminUser->id;
            } else {
                // Get any user as last resort
                $anyUser = User::first();
                $userId = $anyUser?->id;
            }
        }
        
        // If still no user, we can't save history but continue with report generation
        if (!$userId) {
            \Log::warning('Report generation attempted without authenticated user - history will not be saved');
        }
        
        // Check if report_type is a custom report ID
        $customReport = null;
        if (is_numeric($reportType)) {
            $customReport = CustomReport::where('id', $reportType)
                ->where('branch_id', $branchId)
                ->first();
            
            if ($customReport) {
                // Use custom report configuration
                if (empty($categories) && $customReport->filters && isset($customReport->filters['categories'])) {
                    $categories = $customReport->filters['categories'];
                }
                if (!$managedBy && $customReport->filters && isset($customReport->filters['managed_by'])) {
                    $customManagedBy = $customReport->filters['managed_by'];
                    // Normalize to array
                    if (is_array($customManagedBy)) {
                        $managedBy = $customManagedBy;
                    } elseif ($customManagedBy) {
                        $managedBy = [$customManagedBy];
                    }
                }
            }
        }
        
        // Validate dates
        if (!$startDate || !$endDate) {
            return response()->json(['error' => 'Start date and end date are required'], 400);
        }
        
        // Validate categories
        if (empty($categories) || !is_array($categories)) {
            return response()->json(['error' => 'At least one category must be selected'], 400);
        }
        
        // Parse datetime (handles both date and datetime-local formats)
        try {
            $start = Carbon::parse($startDate);
            $end = Carbon::parse($endDate);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Invalid date format'], 400);
        }
        
        // Validate date range
        $now = Carbon::now();
        $oldestAllowedDate = Carbon::now()->subYears(10); // Allow up to 10 years back
        
        if ($start->isBefore($oldestAllowedDate)) {
            return response()->json(['error' => 'Start date is too far in the past. Maximum allowed: ' . $oldestAllowedDate->format('Y-m-d')], 400);
        }
        
        if ($end->isAfter($now)) {
            return response()->json(['error' => 'End date cannot be in the future. Maximum allowed: ' . $now->format('Y-m-d H:i:s')], 400);
        }
        
        if ($start->isAfter($end)) {
            return response()->json(['error' => 'Start date must be before or equal to end date'], 400);
        }
        
        // Normalize categories
        $normalizedCategories = array_map([$this, 'normalizeCategory'], $categories);
        
        // Generate report based on type
        $reportData = null;
        $actualReportType = $customReport ? 'custom' : $reportType;
        
        try {
            if ($customReport) {
                // Generate custom report based on configuration
                $reportData = $this->generateCustomReport($branchId, $start, $end, $normalizedCategories, $managedBy, $customReport);
            } else {
                switch ($reportType) {
                    case 'uptime':
                        $reportData = $this->generateUptimeReport($branchId, $start, $end, $normalizedCategories, $managedBy);
                        break;
                    case 'sla':
                        $reportData = $this->generateSlaReport($branchId, $start, $end, $normalizedCategories, $managedBy);
                        break;
                    case 'incidents':
                        $reportData = $this->generateIncidentReport($branchId, $start, $end, $normalizedCategories, $managedBy);
                        break;
                    case 'comprehensive':
                        $reportData = $this->generateComprehensiveReport($branchId, $start, $end, $normalizedCategories, $managedBy);
                        break;
                    case 'client_session':
                        $reportData = $this->generateClientSessionReport($branchId, $start, $end, $normalizedCategories, $managedBy);
                        break;
                    case 'device_summary':
                        $reportData = $this->generateDeviceSummaryReport($branchId, $start, $end, $normalizedCategories, $managedBy);
                        break;
                    case 'rf_health':
                        $reportData = $this->generateRFHealthReport($branchId, $start, $end, $normalizedCategories, $managedBy);
                        break;
                    default:
                        return response()->json(['error' => 'Invalid report type'], 400);
                }
            }
            
            // Extract data from JsonResponse if needed
            if (is_object($reportData) && method_exists($reportData, 'getData')) {
                $extractedData = $reportData->getData(true);
            } else {
                $extractedData = $reportData;
            }
            
            // Calculate summary statistics
            $summaryStats = $this->calculateSummaryStats($extractedData, $actualReportType);
        } catch (\Exception $e) {
            \Log::error('Error generating report: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json(['error' => 'Failed to generate report: ' . $e->getMessage()], 500);
        }
        
        // Generate file based on format
        $format = request()->input('format', 'xlsx'); // xlsx or pdf
        try {
            if ($format === 'pdf') {
                $fileName = $this->generatePdfFile($reportData, $actualReportType, $startDate, $endDate, $categories, $managedBy, $reportName, $summaryStats, $customReport);
            } else {
                $fileName = $this->generateXlsxFile($reportData, $actualReportType, $startDate, $endDate, $categories, $managedBy, $reportName, $summaryStats, $customReport);
            }
            $filePath = storage_path("app/reports/{$fileName}");
        } catch (\Exception $e) {
            \Log::error('Error generating report file: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json(['error' => 'Failed to generate report file: ' . $e->getMessage()], 500);
        }
        
        // Save to report history BEFORE returning response (only if we have a user)
        $reportHistoryRecord = null;
        if ($userId) {
            try {
                $reportHistoryRecord = ReportHistory::create([
                    'branch_id' => $branchId,
                    'user_id' => $userId,
                    'report_name' => $reportName ?: ($customReport ? $customReport->name : $this->getReportTypeName($reportType)),
                    'report_type' => $customReport ? 'custom_' . $customReport->id : $reportType,
                    'file_path' => $filePath,
                    'start_date' => $start,
                    'end_date' => $end,
                    'categories' => $categories,
                    'managed_by' => $managedBy,
                    'email_sent_to' => !empty($emails) ? implode(', ', $emails) : null,
                    'file_size' => file_exists($filePath) ? filesize($filePath) : null,
                    'summary_stats' => $summaryStats,
                ]);
                \Log::info('Report history saved successfully', ['id' => $reportHistoryRecord->id, 'file_path' => $filePath, 'user_id' => $userId]);
            } catch (\Exception $e) {
                \Log::error('Error saving report to history: ' . $e->getMessage());
                \Log::error('Stack trace: ' . $e->getTraceAsString());
                \Log::error('Data attempted: ', [
                    'branch_id' => $branchId,
                    'user_id' => $userId,
                    'file_path' => $filePath,
                    'file_exists' => file_exists($filePath),
                ]);
                // Continue even if history save fails
            }
        } else {
            \Log::warning('Skipping report history save - no user ID available');
        }
        
        // If emails are provided, send the report via email to all recipients
        if (!empty($emails)) {
            try {
                $successCount = 0;
                $failedEmails = [];
                
                // Send email to each recipient
                foreach ($emails as $emailAddress) {
                    try {
                        Mail::to($emailAddress)->send(new ReportEmail(
                            $reportData,
                            $actualReportType,
                            $startDate,
                            $endDate,
                            $categories,
                            $fileName
                        ));
                        $successCount++;
                        \Log::info('Report email sent successfully', ['email' => $emailAddress]);
                    } catch (\Exception $e) {
                        $failedEmails[] = $emailAddress;
                        \Log::error('Error sending report email to individual recipient', [
                            'email' => $emailAddress,
                            'error' => $e->getMessage()
                        ]);
                    }
                }
                
                if ($successCount > 0) {
                    $message = $successCount === count($emails)
                        ? 'Report generated and sent via email to ' . $successCount . ' recipient' . ($successCount > 1 ? 's' : '')
                        : 'Report generated and sent to ' . $successCount . ' of ' . count($emails) . ' recipient' . (count($emails) > 1 ? 's' : '');
                    
                    if (!empty($failedEmails)) {
                        $message .= '. Failed to send to: ' . implode(', ', $failedEmails);
                    }
                    
                    return response()->json([
                        'message' => $message,
                        'emails' => $emails,
                        'success_count' => $successCount,
                        'failed_emails' => $failedEmails,
                        'data' => $reportData,
                        'file' => $fileName,
                        'history_id' => $reportHistory->id ?? null
                    ]);
                } else {
                    // All emails failed
                    return response()->json([
                        'error' => 'Report generated but all emails failed to send',
                        'message' => 'Failed to send to: ' . implode(', ', $failedEmails),
                        'emails' => $emails,
                        'data' => $reportData,
                        'file' => $fileName,
                        'history_id' => $reportHistory->id ?? null
                    ], 500);
                }
            } catch (\Exception $e) {
                \Log::error('Error sending report emails: ' . $e->getMessage());
                return response()->json([
                    'error' => 'Report generated but email failed to send',
                    'message' => $e->getMessage(),
                    'data' => $reportData,
                    'file' => $fileName,
                    'history_id' => $reportHistory->id ?? null
                ], 500);
            }
        }
        
        // Return file for download
        if (file_exists($filePath)) {
            $format = request()->input('format', 'xlsx'); // xlsx or pdf
            
            // Determine content type based on file extension
            $fileExtension = pathinfo($fileName, PATHINFO_EXTENSION);
            $contentType = $fileExtension === 'pdf' 
                ? 'application/pdf'
                : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            
            // Return file with proper headers to avoid security warnings
            return response()->download($filePath, $fileName, [
                'Content-Type' => $contentType,
                'Content-Disposition' => 'attachment; filename="' . basename($fileName) . '"',
                'Cache-Control' => 'no-cache, no-store, must-revalidate',
                'Pragma' => 'no-cache',
                'Expires' => '0',
            ])->deleteFileAfterSend(false); // Don't delete, we're saving it to history
        }
        
        // Fallback to JSON if file generation fails
        return response()->json($reportData);
    }
    
    /**
     * Generate XLSX file from report data with nice formatting
     */
    private function generateXlsxFile($reportData, $reportType, $startDate, $endDate, $categories, $managedBy = null, $reportName = null, $summaryStats = null, $customReport = null)
    {
        // Get branch and user info for report title
        $branchId = request()->input('branch_id');
        $branch = $branchId ? Branch::find($branchId) : null;
        
        // Handle managedBy - can be array or single value
        $users = null;
        if ($managedBy) {
            if (is_array($managedBy)) {
                $users = User::whereIn('id', $managedBy)->get();
            } else {
                $user = User::find($managedBy);
                $users = $user ? collect([$user]) : null;
            }
        }
        
        // For backward compatibility, keep $user as first user or null
        $user = $users && $users->isNotEmpty() ? $users->first() : null;
        
        // Generate filename - use custom report name if provided
        if ($reportName) {
            $sanitizedName = preg_replace('/[^a-zA-Z0-9_-]/', '_', $reportName);
            $fileName = "LAPORAN_{$sanitizedName}_" . time() . '.xlsx';
        } else {
            $userName = $users && $users->isNotEmpty() 
                ? implode('_', $users->pluck('name')->map(fn($n) => str_replace(' ', '_', $n))->toArray())
                : 'All';
            $branchName = $branch ? str_replace(' ', '_', $branch->name) : 'Unknown';
            $reportTypeName = $customReport ? str_replace(' ', '_', $customReport->name) : strtoupper($reportType);
            $fileName = "LAPORAN_{$reportTypeName}_" . strtoupper($branchName) . "_{$userName}_" . time() . '.xlsx';
        }
        $filePath = storage_path("app/reports/{$fileName}");
        
        // Ensure directory exists
        if (!file_exists(storage_path('app/reports'))) {
            mkdir(storage_path('app/reports'), 0755, true);
        }
        
        $spreadsheet = new Spreadsheet();
        
        // Get data from response - handle both JsonResponse and array
        if (method_exists($reportData, 'getData')) {
            $data = $reportData->getData(true);
        } else {
            $data = $reportData;
        }
        
        // Define header styles
        $headerStyle = [
            'font' => [
                'bold' => true,
                'size' => 11,
                'color' => ['rgb' => 'FFFFFF'],
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '10B981'], // Emerald green
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['rgb' => 'FFFFFF'],
                ],
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
        ];
        
        $dataStyle = [
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['rgb' => 'E5E7EB'],
                ],
            ],
            'alignment' => [
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
        ];
        
        // Add summary sheet first
        // Pass $users collection to methods that can handle it, or first user for backward compatibility
        $userForSheets = $users && $users->isNotEmpty() ? $users : ($user ? collect([$user]) : null);
        $this->addSummarySheet($spreadsheet, $summaryStats, $reportType, $startDate, $endDate, $branch, $userForSheets, $categories, $data);
        
        // Handle different report types
        if ($reportType === 'client_session') {
            // Client Session report - multiple sheets
            $sheetIndex = 1; // Start at 1 because summary is at 0
            
            // By SSID
            if (isset($data['by_ssid'])) {
                $this->addClientSessionSheet($spreadsheet, 'By SSID', $data['by_ssid'], $sheetIndex, $headerStyle, $dataStyle, $startDate, $endDate, $branch, $userForSheets, $categories, 'ssid');
                $sheetIndex++;
            }
            
            // By VLAN
            if (isset($data['by_vlan'])) {
                $this->addClientSessionSheet($spreadsheet, 'By VLAN', $data['by_vlan'], $sheetIndex, $headerStyle, $dataStyle, $startDate, $endDate, $branch, $userForSheets, $categories, 'vlan');
                $sheetIndex++;
            }
            
            // Top Clients
            if (isset($data['top_clients'])) {
                $this->addClientSessionSheet($spreadsheet, 'Top Clients', $data['top_clients'], $sheetIndex, $headerStyle, $dataStyle, $startDate, $endDate, $branch, $userForSheets, $categories, 'top_clients');
                $sheetIndex++;
            }
            
            // By Cipher
            if (isset($data['by_cipher'])) {
                $this->addClientSessionSheet($spreadsheet, 'By Cipher', $data['by_cipher'], $sheetIndex, $headerStyle, $dataStyle, $startDate, $endDate, $branch, $userForSheets, $categories, 'cipher');
                $sheetIndex++;
            }
            
            // By Connection Mode
            if (isset($data['by_connection_mode'])) {
                $this->addClientSessionSheet($spreadsheet, 'By Connection Mode', $data['by_connection_mode'], $sheetIndex, $headerStyle, $dataStyle, $startDate, $endDate, $branch, $userForSheets, $categories, 'connection_mode');
                $sheetIndex++;
            }
            
            // By Role
            if (isset($data['by_role'])) {
                $this->addClientSessionSheet($spreadsheet, 'By Role', $data['by_role'], $sheetIndex, $headerStyle, $dataStyle, $startDate, $endDate, $branch, $userForSheets, $categories, 'role');
                $sheetIndex++;
            }
            
            // Remove default sheet if we added custom sheets
            if ($sheetIndex > 1 && $spreadsheet->getSheetCount() > $sheetIndex) {
                $spreadsheet->removeSheetByIndex($spreadsheet->getSheetCount() - 1);
            }
        } elseif ($reportType === 'device_summary' && (isset($data['most_utilized_by_max_clients']) || isset($data['most_utilized_by_usage']) || isset($data['least_utilized_by_max_clients']) || isset($data['least_utilized_by_usage']) || isset($data['most_utilized_folders_by_max_clients']) || isset($data['most_utilized_folders_by_usage']))) {
            // Device Summary report - multiple sheets
            $sheetIndex = 1; // Start at 1 because summary is at 0
            
            // Most Utilized by Maximum Concurrent Clients
            if (isset($data['most_utilized_by_max_clients'])) {
                $this->addDeviceSummarySheet($spreadsheet, 'Most Utilized - Max Clients', $data['most_utilized_by_max_clients'], $sheetIndex, $headerStyle, $dataStyle, $startDate, $endDate, $branch, $userForSheets, $categories, 'device');
                $sheetIndex++;
            }
            
            // Most Utilized by Usage
            if (isset($data['most_utilized_by_usage'])) {
                $this->addDeviceSummarySheet($spreadsheet, 'Most Utilized - Usage', $data['most_utilized_by_usage'], $sheetIndex, $headerStyle, $dataStyle, $startDate, $endDate, $branch, $userForSheets, $categories, 'device');
                $sheetIndex++;
            }
            
            // Least Utilized by Maximum Concurrent Clients
            if (isset($data['least_utilized_by_max_clients'])) {
                $this->addDeviceSummarySheet($spreadsheet, 'Least Utilized - Max Clients', $data['least_utilized_by_max_clients'], $sheetIndex, $headerStyle, $dataStyle, $startDate, $endDate, $branch, $userForSheets, $categories, 'device');
                $sheetIndex++;
            }
            
            // Least Utilized by Usage
            if (isset($data['least_utilized_by_usage'])) {
                $this->addDeviceSummarySheet($spreadsheet, 'Least Utilized - Usage', $data['least_utilized_by_usage'], $sheetIndex, $headerStyle, $dataStyle, $startDate, $endDate, $branch, $userForSheets, $categories, 'device');
                $sheetIndex++;
            }
            
            // Most Utilized Folders by Maximum Concurrent Clients
            if (isset($data['most_utilized_folders_by_max_clients'])) {
                $this->addDeviceSummarySheet($spreadsheet, 'Folders - Max Clients', $data['most_utilized_folders_by_max_clients'], $sheetIndex, $headerStyle, $dataStyle, $startDate, $endDate, $branch, $userForSheets, $categories, 'folder');
                $sheetIndex++;
            }
            
            // Most Utilized Folders by Usage
            if (isset($data['most_utilized_folders_by_usage'])) {
                $this->addDeviceSummarySheet($spreadsheet, 'Folders - Usage', $data['most_utilized_folders_by_usage'], $sheetIndex, $headerStyle, $dataStyle, $startDate, $endDate, $branch, $userForSheets, $categories, 'folder');
                $sheetIndex++;
            }
            
            // Remove default sheet if we added custom sheets
            if ($sheetIndex > 1 && $spreadsheet->getSheetCount() > $sheetIndex) {
                $spreadsheet->removeSheetByIndex($spreadsheet->getSheetCount() - 1);
            }
        } elseif ($reportType === 'rf_health' && (isset($data['thresholds']) || isset($data['clients_least_goodput']) || isset($data['clients_least_speed']) || isset($data['top_folders_worst_stats']) || isset($data['least_utilized_2_4ghz']) || isset($data['least_utilized_5ghz']) || isset($data['max_clients_2_4ghz']) || isset($data['max_clients_5ghz']) || isset($data['most_channel_changes_2_4ghz']) || isset($data['most_channel_changes_5ghz']) || isset($data['most_mac_phy_errors_2_4ghz']) || isset($data['most_mac_phy_errors_5ghz']) || isset($data['most_noise_2_4ghz']) || isset($data['most_noise_5ghz']) || isset($data['most_tx_power_changes_2_4ghz']) || isset($data['most_tx_power_changes_5ghz']) || isset($data['most_utilized_2_4ghz']) || isset($data['most_utilized_5ghz']) || isset($data['problem_radios_2_4ghz']) || isset($data['problem_radios_5ghz']) || isset($data['radios_least_goodput']))) {
            // RF Health report - multiple sheets
            $sheetIndex = 1; // Start at 1 because summary is at 0
            
            // Thresholds
            if (isset($data['thresholds'])) {
                $this->addRFHealthSheet($spreadsheet, 'Thresholds', $data['thresholds'], $sheetIndex, $headerStyle, $dataStyle, $startDate, $endDate, $branch, $userForSheets, $categories, 'thresholds');
                $sheetIndex++;
            }
            
            // Clients with Least Goodput
            if (isset($data['clients_least_goodput'])) {
                $this->addRFHealthSheet($spreadsheet, 'Clients - Least Goodput', $data['clients_least_goodput'], $sheetIndex, $headerStyle, $dataStyle, $startDate, $endDate, $branch, $userForSheets, $categories, 'clients_least_goodput');
                $sheetIndex++;
            }
            
            // Clients with Least Speed
            if (isset($data['clients_least_speed'])) {
                $this->addRFHealthSheet($spreadsheet, 'Clients - Least Speed', $data['clients_least_speed'], $sheetIndex, $headerStyle, $dataStyle, $startDate, $endDate, $branch, $userForSheets, $categories, 'clients_least_speed');
                $sheetIndex++;
            }
            
            // Top Folders by Worst Stats
            if (isset($data['top_folders_worst_stats'])) {
                $this->addRFHealthSheet($spreadsheet, 'Top Folders Worst Stats', $data['top_folders_worst_stats'], $sheetIndex, $headerStyle, $dataStyle, $startDate, $endDate, $branch, $userForSheets, $categories, 'top_folders_worst_stats');
                $sheetIndex++;
            }
            
            // Least Utilized by Channel Usage (2.4 GHz)
            if (isset($data['least_utilized_2_4ghz'])) {
                $this->addRFHealthSheet($spreadsheet, 'Least Utilized 2.4GHz', $data['least_utilized_2_4ghz'], $sheetIndex, $headerStyle, $dataStyle, $startDate, $endDate, $branch, $userForSheets, $categories, 'channel_usage');
                $sheetIndex++;
            }
            
            // Least Utilized by Channel Usage (5 GHz)
            if (isset($data['least_utilized_5ghz'])) {
                $this->addRFHealthSheet($spreadsheet, 'Least Utilized 5GHz', $data['least_utilized_5ghz'], $sheetIndex, $headerStyle, $dataStyle, $startDate, $endDate, $branch, $userForSheets, $categories, 'channel_usage');
                $sheetIndex++;
            }
            
            // Max Concurrent Clients (2.4 GHz)
            if (isset($data['max_clients_2_4ghz'])) {
                $this->addRFHealthSheet($spreadsheet, 'Max Clients 2.4GHz', $data['max_clients_2_4ghz'], $sheetIndex, $headerStyle, $dataStyle, $startDate, $endDate, $branch, $userForSheets, $categories, 'max_clients');
                $sheetIndex++;
            }
            
            // Max Concurrent Clients (5 GHz)
            if (isset($data['max_clients_5ghz'])) {
                $this->addRFHealthSheet($spreadsheet, 'Max Clients 5GHz', $data['max_clients_5ghz'], $sheetIndex, $headerStyle, $dataStyle, $startDate, $endDate, $branch, $userForSheets, $categories, 'max_clients');
                $sheetIndex++;
            }
            
            // Most Channel Changes (2.4 GHz)
            if (isset($data['most_channel_changes_2_4ghz'])) {
                $this->addRFHealthSheet($spreadsheet, 'Most Ch Changes 2.4GHz', $data['most_channel_changes_2_4ghz'], $sheetIndex, $headerStyle, $dataStyle, $startDate, $endDate, $branch, $userForSheets, $categories, 'channel_changes');
                $sheetIndex++;
            }
            
            // Most Channel Changes (5 GHz)
            if (isset($data['most_channel_changes_5ghz'])) {
                $this->addRFHealthSheet($spreadsheet, 'Most Ch Changes 5GHz', $data['most_channel_changes_5ghz'], $sheetIndex, $headerStyle, $dataStyle, $startDate, $endDate, $branch, $userForSheets, $categories, 'channel_changes');
                $sheetIndex++;
            }
            
            // Most MAC/PHY Errors (2.4 GHz)
            if (isset($data['most_mac_phy_errors_2_4ghz'])) {
                $this->addRFHealthSheet($spreadsheet, 'MAC/PHY Errors 2.4GHz', $data['most_mac_phy_errors_2_4ghz'], $sheetIndex, $headerStyle, $dataStyle, $startDate, $endDate, $branch, $userForSheets, $categories, 'mac_phy_errors');
                $sheetIndex++;
            }
            
            // Most MAC/PHY Errors (5 GHz)
            if (isset($data['most_mac_phy_errors_5ghz'])) {
                $this->addRFHealthSheet($spreadsheet, 'MAC/PHY Errors 5GHz', $data['most_mac_phy_errors_5ghz'], $sheetIndex, $headerStyle, $dataStyle, $startDate, $endDate, $branch, $userForSheets, $categories, 'mac_phy_errors');
                $sheetIndex++;
            }
            
            // Most Noise (2.4 GHz)
            if (isset($data['most_noise_2_4ghz'])) {
                $this->addRFHealthSheet($spreadsheet, 'Most Noise 2.4GHz', $data['most_noise_2_4ghz'], $sheetIndex, $headerStyle, $dataStyle, $startDate, $endDate, $branch, $userForSheets, $categories, 'noise');
                $sheetIndex++;
            }
            
            // Most Noise (5 GHz)
            if (isset($data['most_noise_5ghz'])) {
                $this->addRFHealthSheet($spreadsheet, 'Most Noise 5GHz', $data['most_noise_5ghz'], $sheetIndex, $headerStyle, $dataStyle, $startDate, $endDate, $branch, $userForSheets, $categories, 'noise');
                $sheetIndex++;
            }
            
            // Most Transmit Power Changes (2.4 GHz)
            if (isset($data['most_tx_power_changes_2_4ghz'])) {
                $this->addRFHealthSheet($spreadsheet, 'Most TX Pwr Ch 2.4GHz', $data['most_tx_power_changes_2_4ghz'], $sheetIndex, $headerStyle, $dataStyle, $startDate, $endDate, $branch, $userForSheets, $categories, 'tx_power_changes');
                $sheetIndex++;
            }
            
            // Most Transmit Power Changes (5 GHz)
            if (isset($data['most_tx_power_changes_5ghz'])) {
                $this->addRFHealthSheet($spreadsheet, 'Most TX Pwr Ch 5GHz', $data['most_tx_power_changes_5ghz'], $sheetIndex, $headerStyle, $dataStyle, $startDate, $endDate, $branch, $userForSheets, $categories, 'tx_power_changes');
                $sheetIndex++;
            }
            
            // Most Utilized by Channel Usage (2.4 GHz)
            if (isset($data['most_utilized_2_4ghz'])) {
                $this->addRFHealthSheet($spreadsheet, 'Most Utilized 2.4GHz', $data['most_utilized_2_4ghz'], $sheetIndex, $headerStyle, $dataStyle, $startDate, $endDate, $branch, $userForSheets, $categories, 'channel_usage');
                $sheetIndex++;
            }
            
            // Most Utilized by Channel Usage (5 GHz)
            if (isset($data['most_utilized_5ghz'])) {
                $this->addRFHealthSheet($spreadsheet, 'Most Utilized 5GHz', $data['most_utilized_5ghz'], $sheetIndex, $headerStyle, $dataStyle, $startDate, $endDate, $branch, $userForSheets, $categories, 'channel_usage');
                $sheetIndex++;
            }
            
            // Problem 2.4 GHz Radios
            if (isset($data['problem_radios_2_4ghz'])) {
                $this->addRFHealthSheet($spreadsheet, 'Problem Radios 2.4GHz', $data['problem_radios_2_4ghz'], $sheetIndex, $headerStyle, $dataStyle, $startDate, $endDate, $branch, $userForSheets, $categories, 'problem_radios');
                $sheetIndex++;
            }
            
            // Problem 5 GHz Radios
            if (isset($data['problem_radios_5ghz'])) {
                $this->addRFHealthSheet($spreadsheet, 'Problem Radios 5GHz', $data['problem_radios_5ghz'], $sheetIndex, $headerStyle, $dataStyle, $startDate, $endDate, $branch, $userForSheets, $categories, 'problem_radios');
                $sheetIndex++;
            }
            
            // Radios with Least Goodput
            if (isset($data['radios_least_goodput'])) {
                $this->addRFHealthSheet($spreadsheet, 'Radios - Least Goodput', $data['radios_least_goodput'], $sheetIndex, $headerStyle, $dataStyle, $startDate, $endDate, $branch, $userForSheets, $categories, 'radios_least_goodput');
                $sheetIndex++;
            }
            
            // Remove default sheet if we added custom sheets
            if ($sheetIndex > 1 && $spreadsheet->getSheetCount() > $sheetIndex) {
                $spreadsheet->removeSheetByIndex($spreadsheet->getSheetCount() - 1);
            }
        } elseif (isset($data['uptime']) || isset($data['sla']) || isset($data['incidents'])) {
            // Comprehensive report - multiple sheets
            $sheetIndex = 1; // Start at 1 because summary is at 0
            
            if (isset($data['uptime']['devices']) && count($data['uptime']['devices']) > 0) {
                $this->addSheetToSpreadsheet($spreadsheet, 'Uptime', $data['uptime']['devices'], $sheetIndex, $headerStyle, $dataStyle, $reportType, $startDate, $endDate, $branch, $userForSheets, $categories);
                $sheetIndex++;
            }
            
            if (isset($data['sla']['devices']) && count($data['sla']['devices']) > 0) {
                $this->addSheetToSpreadsheet($spreadsheet, 'SLA', $data['sla']['devices'], $sheetIndex, $headerStyle, $dataStyle, $reportType, $startDate, $endDate, $branch, $userForSheets, $categories);
                $sheetIndex++;
            }
            
            if (isset($data['incidents']['events']) && count($data['incidents']['events']) > 0) {
                $this->addSheetToSpreadsheet($spreadsheet, 'Incidents', $data['incidents']['events'], $sheetIndex, $headerStyle, $dataStyle, $reportType, $startDate, $endDate, $branch, $userForSheets, $categories);
                $sheetIndex++;
            }
            
            // Remove default sheet if we added custom sheets
            if ($sheetIndex > 1 && $spreadsheet->getSheetCount() > $sheetIndex) {
                $spreadsheet->removeSheetByIndex($spreadsheet->getSheetCount() - 1);
            }
        } elseif (isset($data['devices']) && is_array($data['devices']) && count($data['devices']) > 0) {
            // Single sheet report (uptime or SLA)
            $sheetIndex = 1; // Start at 1 because summary is at 0
            
            if ($reportType === 'uptime') {
                // For uptime reports, add multiple sheets with grouped data
                // 1. Overall Average
                if (isset($data['overall_average'])) {
                    $this->addGroupedUptimeSheet($spreadsheet, 'Overall Average', [$data['overall_average']], $sheetIndex, $headerStyle, $dataStyle, $startDate, $endDate, $branch, $userForSheets, $categories);
                    $sheetIndex++;
                }
                
                // 2. By Group (Managed By)
                if (isset($data['grouped_by_group']) && count($data['grouped_by_group']) > 0) {
                    $this->addGroupedUptimeSheet($spreadsheet, 'By Group', $data['grouped_by_group'], $sheetIndex, $headerStyle, $dataStyle, $startDate, $endDate, $branch, $userForSheets, $categories);
                    $sheetIndex++;
                }
                
                // 3. By Location
                if (isset($data['grouped_by_location']) && count($data['grouped_by_location']) > 0) {
                    $this->addGroupedUptimeSheet($spreadsheet, 'By Location', $data['grouped_by_location'], $sheetIndex, $headerStyle, $dataStyle, $startDate, $endDate, $branch, $userForSheets, $categories);
                    $sheetIndex++;
                }
                
                // 4. By Category
                if (isset($data['grouped_by_category']) && count($data['grouped_by_category']) > 0) {
                    $this->addGroupedUptimeSheet($spreadsheet, 'By Category', $data['grouped_by_category'], $sheetIndex, $headerStyle, $dataStyle, $startDate, $endDate, $branch, $userForSheets, $categories);
                    $sheetIndex++;
                }
                
                // 5. By Device (detailed list)
                $this->addSheetToSpreadsheet($spreadsheet, 'By Device', $data['devices'], $sheetIndex, $headerStyle, $dataStyle, $reportType, $startDate, $endDate, $branch, $userForSheets, $categories);
            } else {
                // For SLA reports, just add the main sheet
                $sheet = new \PhpOffice\PhpSpreadsheet\Worksheet\Worksheet($spreadsheet, $this->getReportTypeName($reportType));
                $spreadsheet->addSheet($sheet);
                $this->writeDataToSheet($sheet, $data['devices'], $headerStyle, $dataStyle, $reportType, $startDate, $endDate, $branch, $userForSheets, $categories);
            }
        } elseif (isset($data['events']) && is_array($data['events']) && count($data['events']) > 0) {
            // Incident report
            $sanitizedSheetName = $this->sanitizeSheetName('Incidents');
            $sheet = new \PhpOffice\PhpSpreadsheet\Worksheet\Worksheet($spreadsheet, $sanitizedSheetName);
            $spreadsheet->addSheet($sheet);
            $this->writeDataToSheet($sheet, $data['events'], $headerStyle, $dataStyle, $reportType, $startDate, $endDate, $branch, $userForSheets, $categories);
        }
        
        // Set active sheet to summary (first sheet)
        $spreadsheet->setActiveSheetIndex(0);
        
        // Write file
        $writer = new Xlsx($spreadsheet);
        $writer->save($filePath);
        
        return $fileName;
    }
    
    /**
     * Generate PDF file from report data
     */
    private function generatePdfFile($reportData, $reportType, $startDate, $endDate, $categories, $managedBy = null, $reportName = null, $summaryStats = null, $customReport = null)
    {
        // Increase memory limit for PDF generation
        $originalMemoryLimit = ini_get('memory_limit');
        $currentUsage = memory_get_usage(true);
        $currentLimitBytes = $this->convertToBytes($originalMemoryLimit);
        
        // Calculate target memory limit - use at least 2x current usage or 512M, whichever is higher
        // This ensures we set a limit that's definitely higher than current usage
        $minTargetBytes = max(ceil($currentUsage * 2), $this->convertToBytes('512M'));
        $targetMemoryLimit = $this->bytesToMemoryString($minTargetBytes);
        $targetLimitBytes = $this->convertToBytes($targetMemoryLimit);
        
        // Only try to increase if:
        // 1. Target is higher than current limit
        // 2. Current usage is less than target (can't set limit below current usage)
        // 3. Target is at least 1.5x current usage to give us headroom
        $canIncrease = $targetLimitBytes > $currentLimitBytes && 
                      $currentUsage < $targetLimitBytes &&
                      $targetLimitBytes >= ($currentUsage * 1.5);
        
        if ($canIncrease) {
            // Use error suppression and check result
            $oldErrorReporting = error_reporting(0);
            $result = ini_set('memory_limit', $targetMemoryLimit);
            error_reporting($oldErrorReporting);
            
            if ($result === false) {
                \Log::warning('Could not set memory limit (returned false)', [
                    'original' => $originalMemoryLimit,
                    'target' => $targetMemoryLimit,
                    'current_usage' => $currentUsage,
                    'current_limit_bytes' => $currentLimitBytes,
                    'target_limit_bytes' => $targetLimitBytes
                ]);
                // Continue anyway - might still work with current limit
            } else {
                \Log::info('Memory limit increased successfully', [
                    'original' => $originalMemoryLimit,
                    'new' => ini_get('memory_limit'),
                    'target' => $targetMemoryLimit
                ]);
            }
        } else {
            \Log::info('Skipping memory limit increase', [
                'original' => $originalMemoryLimit,
                'target' => $targetMemoryLimit,
                'current_usage' => $currentUsage,
                'current_limit_bytes' => $currentLimitBytes,
                'target_limit_bytes' => $targetLimitBytes,
                'reason' => $currentUsage >= $targetLimitBytes ? 'current_usage_too_high' : 
                           ($targetLimitBytes <= $currentLimitBytes ? 'target_not_higher' : 'insufficient_headroom')
            ]);
        }
        
        try {
            // Get branch and user info for report title
            $branchId = request()->input('branch_id');
            $branch = $branchId ? Branch::find($branchId) : null;
            
            // Handle managedBy - can be array or single value
            $users = null;
            if ($managedBy) {
                if (is_array($managedBy)) {
                    $users = User::whereIn('id', $managedBy)->get();
                } else {
                    $users = collect([User::find($managedBy)])->filter();
                }
            }
            
            // Generate filename
            if ($reportName) {
                $sanitizedName = preg_replace('/[^a-zA-Z0-9_-]/', '_', $reportName);
                $fileName = "LAPORAN_{$sanitizedName}_" . time() . '.pdf';
            } else {
                $userName = $users && $users->isNotEmpty() 
                    ? implode('_', $users->pluck('name')->map(fn($n) => str_replace(' ', '_', $n))->toArray())
                    : 'All';
                $branchName = $branch ? str_replace(' ', '_', $branch->name) : 'Unknown';
                $reportTypeName = $customReport ? str_replace(' ', '_', $customReport->name) : strtoupper($reportType);
                $fileName = "LAPORAN_{$reportTypeName}_" . strtoupper($branchName) . "_{$userName}_" . time() . '.pdf';
            }
            $filePath = storage_path("app/reports/{$fileName}");
            
            // Ensure directory exists
            if (!file_exists(storage_path('app/reports'))) {
                mkdir(storage_path('app/reports'), 0755, true);
            }
            
            // Get data from response
            if (method_exists($reportData, 'getData')) {
                $data = $reportData->getData(true);
            } else {
                $data = $reportData;
            }
            
            // Generate HTML content
            $html = $this->generatePdfHtml($data, $reportType, $startDate, $endDate, $categories, $managedBy, $reportName, $summaryStats, $customReport, $branch, $users);
            
            // Configure DomPDF
            $options = new Options();
            $options->set('isHtml5ParserEnabled', true);
            $options->set('isRemoteEnabled', true);
            $options->set('defaultFont', 'DejaVu Sans');
            
            $dompdf = new Dompdf($options);
            $dompdf->loadHtml($html);
            $dompdf->setPaper('A4', 'portrait');
            $dompdf->render();
            
            // Save PDF
            file_put_contents($filePath, $dompdf->output());
            
            return $fileName;
        } catch (\Throwable $e) {
            // Check if it's a memory error
            $errorMessage = $e->getMessage();
            $isMemoryError = strpos($errorMessage, 'memory') !== false || 
                           strpos($errorMessage, 'Memory') !== false ||
                           strpos($errorMessage, 'Failed to set memory limit') !== false ||
                           strpos($errorMessage, 'Allowed memory size') !== false;
            
            if ($isMemoryError) {
                \Log::error('PDF generation failed due to memory limit', [
                    'error' => $errorMessage,
                    'memory_limit' => ini_get('memory_limit'),
                    'memory_usage' => memory_get_usage(true),
                    'memory_peak' => memory_get_peak_usage(true),
                ]);
                throw new \Exception('PDF generation failed due to insufficient memory. Please try generating an XLSX report instead or reduce the date range.', 0, $e);
            }
            
            // Re-throw other errors
            throw $e;
        } finally {
            // Try to restore original memory limit (but don't fail if it doesn't work)
            try {
                $oldErrorReporting = error_reporting(0);
                @ini_set('memory_limit', $originalMemoryLimit);
                error_reporting($oldErrorReporting);
            } catch (\Throwable $e) {
                // Ignore errors when restoring memory limit
            }
        }
    }
    
    /**
     * Generate HTML content for PDF
     */
    private function generatePdfHtml($data, $reportType, $startDate, $endDate, $categories, $managedBy, $reportName, $summaryStats, $customReport, $branch, $users)
    {
        $start = Carbon::parse($startDate);
        $end = Carbon::parse($endDate);
        $reportTypeName = $this->getReportTypeName($reportType);
        
        $html = '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: DejaVu Sans, Arial, sans-serif; font-size: 7px; color: #333; }
        .header { background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 12px; margin-bottom: 12px; }
        .header h1 { font-size: 14px; margin-bottom: 6px; }
        .header-info { display: table; width: 100%; }
        .header-info div { display: table-row; }
        .header-info span { display: table-cell; padding: 3px 6px; font-size: 7px; }
        .header-info .label { font-weight: bold; width: 100px; }
        .section { margin-bottom: 15px; page-break-inside: avoid; }
        .section-title { background: #f3f4f6; padding: 6px; font-size: 9px; font-weight: bold; border-left: 3px solid #059669; margin-bottom: 6px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 6px; }
        th { background: #059669; color: white; padding: 4px; text-align: left; font-weight: bold; font-size: 7px; }
        td { padding: 3px; border: 1px solid #e5e7eb; font-size: 6px; }
        tr:nth-child(even) { background: #f9fafb; }
        .summary-grid { display: table; width: 100%; margin-bottom: 12px; }
        .summary-item { display: table-cell; padding: 8px; border: 1px solid #e5e7eb; text-align: center; }
        .summary-value { font-size: 12px; font-weight: bold; color: #059669; }
        .summary-label { font-size: 7px; color: #6b7280; margin-top: 3px; }
        .footer { margin-top: 15px; padding-top: 12px; border-top: 2px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 7px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>' . htmlspecialchars($reportName ?: $reportTypeName) . '</h1>
        <div class="header-info">
            <div><span class="label">Branch:</span><span>' . htmlspecialchars($branch ? $branch->name : 'Unknown') . '</span></div>
            <div><span class="label">Report Type:</span><span>' . htmlspecialchars($reportTypeName) . '</span></div>
            <div><span class="label">Date Range:</span><span>' . $start->format('Y-m-d H:i:s') . ' to ' . $end->format('Y-m-d H:i:s') . '</span></div>
            <div><span class="label">Categories:</span><span>' . htmlspecialchars(implode(', ', $categories)) . '</span></div>';
        
        if ($users && $users->isNotEmpty()) {
            $userNames = $users->pluck('name')->implode(', ');
            $html .= '<div><span class="label">Managed By:</span><span>' . htmlspecialchars($userNames) . '</span></div>';
        }
        
        $html .= '<div><span class="label">Generated:</span><span>' . Carbon::now()->format('Y-m-d H:i:s') . '</span></div>
        </div>
    </div>';
        
        // Add Summary Statistics
        if ($summaryStats) {
            $html .= '<div class="section">
                <div class="section-title">Summary Statistics</div>
                <div class="summary-grid">';
            
            // Device Statistics
            if (isset($summaryStats['total_devices'])) {
                $html .= '<div class="summary-item">
                    <div class="summary-value">' . $summaryStats['total_devices'] . '</div>
                    <div class="summary-label">Total Devices</div>
                </div>';
            }
            
            if (isset($summaryStats['devices_online'])) {
                $html .= '<div class="summary-item">
                    <div class="summary-value">' . $summaryStats['devices_online'] . '</div>
                    <div class="summary-label">Online</div>
                </div>';
            }
            
            if (isset($summaryStats['devices_offline'])) {
                $html .= '<div class="summary-item">
                    <div class="summary-value">' . $summaryStats['devices_offline'] . '</div>
                    <div class="summary-label">Offline</div>
                </div>';
            }
            
            if (isset($summaryStats['devices_warning'])) {
                $html .= '<div class="summary-item">
                    <div class="summary-value">' . $summaryStats['devices_warning'] . '</div>
                    <div class="summary-label">Warning</div>
                </div>';
            }
            
            // Uptime Statistics
            if (isset($summaryStats['avg_uptime']) && $summaryStats['avg_uptime'] > 0) {
                $html .= '<div class="summary-item">
                    <div class="summary-value">' . number_format($summaryStats['avg_uptime'], 2) . '%</div>
                    <div class="summary-label">Avg Uptime</div>
                </div>';
            }
            
            if (isset($summaryStats['total_downtime_minutes']) && $summaryStats['total_downtime_minutes'] > 0) {
                $downtimeHours = round($summaryStats['total_downtime_minutes'] / 60, 2);
                $html .= '<div class="summary-item">
                    <div class="summary-value">' . number_format($downtimeHours, 2) . 'h</div>
                    <div class="summary-label">Total Downtime</div>
                </div>';
            }
            
            if (isset($summaryStats['avg_downtime_minutes']) && $summaryStats['avg_downtime_minutes'] > 0) {
                $avgDowntimeHours = round($summaryStats['avg_downtime_minutes'] / 60, 2);
                $html .= '<div class="summary-item">
                    <div class="summary-value">' . number_format($avgDowntimeHours, 2) . 'h</div>
                    <div class="summary-label">Avg Downtime</div>
                </div>';
            }
            
            // SLA Statistics
            if (isset($summaryStats['avg_sla']) && $summaryStats['avg_sla'] > 0) {
                $html .= '<div class="summary-item">
                    <div class="summary-value">' . number_format($summaryStats['avg_sla'], 2) . '%</div>
                    <div class="summary-label">Avg SLA</div>
                </div>';
            }
            
            if (isset($summaryStats['sla_compliant_devices'])) {
                $html .= '<div class="summary-item">
                    <div class="summary-value">' . $summaryStats['sla_compliant_devices'] . '</div>
                    <div class="summary-label">SLA Compliant</div>
                </div>';
            }
            
            if (isset($summaryStats['sla_violations'])) {
                $html .= '<div class="summary-item">
                    <div class="summary-value">' . $summaryStats['sla_violations'] . '</div>
                    <div class="summary-label">SLA Violations</div>
                </div>';
            }
            
            // Incident Statistics
            if (isset($summaryStats['total_incidents'])) {
                $html .= '<div class="summary-item">
                    <div class="summary-value">' . $summaryStats['total_incidents'] . '</div>
                    <div class="summary-label">Total Incidents</div>
                </div>';
            }
            
            $html .= '</div>';
            
            // Additional detailed statistics in a table format
            $hasDetails = false;
            $detailsHtml = '<div class="section"><div class="section-title">Detailed Statistics</div><table>';
            
            // Devices by Category
            if (isset($summaryStats['devices_by_category']) && is_array($summaryStats['devices_by_category']) && count($summaryStats['devices_by_category']) > 0) {
                $hasDetails = true;
                $detailsHtml .= '<tr><th colspan="2">Devices by Category</th></tr>';
                foreach ($summaryStats['devices_by_category'] as $category => $count) {
                    $detailsHtml .= '<tr><td>' . htmlspecialchars(ucfirst($category)) . '</td><td>' . $count . '</td></tr>';
                }
            }
            
            // Incidents by Type
            if (isset($summaryStats['incidents_by_type']) && is_array($summaryStats['incidents_by_type']) && count($summaryStats['incidents_by_type']) > 0) {
                $hasDetails = true;
                $detailsHtml .= '<tr><th colspan="2">Incidents by Type</th></tr>';
                foreach ($summaryStats['incidents_by_type'] as $type => $count) {
                    $detailsHtml .= '<tr><td>' . htmlspecialchars(ucfirst($type)) . '</td><td>' . $count . '</td></tr>';
                }
            }
            
            $detailsHtml .= '</table></div>';
            
            if ($hasDetails) {
                $html .= $detailsHtml;
            }
            
            $html .= '</div>';
        }
        
        // Add main data table
        $html .= $this->generatePdfDataTable($data, $reportType);
        
        $html .= '<div class="footer">
            <p>Generated on ' . Carbon::now()->format('Y-m-d H:i:s') . '</p>
            <p>This is an automated report generated by the Host Monitor System</p>
        </div>
</body>
</html>';
        
        return $html;
    }
    
    /**
     * Generate PDF data table based on report type
     */
    private function generatePdfDataTable($data, $reportType)
    {
        $html = '<div class="section"><div class="section-title">Report Data</div>';
        
        if (isset($data['devices']) && is_array($data['devices']) && count($data['devices']) > 0) {
            // Uptime report or similar
            $headers = array_keys($data['devices'][0]);
            $html .= '<table><thead><tr>';
            foreach ($headers as $header) {
                $html .= '<th>' . htmlspecialchars(ucwords(str_replace('_', ' ', $header))) . '</th>';
            }
            $html .= '</tr></thead><tbody>';
            
            foreach ($data['devices'] as $device) {
                $html .= '<tr>';
                foreach ($headers as $header) {
                    $value = $device[$header] ?? '';
                    $html .= '<td>' . htmlspecialchars($value) . '</td>';
                }
                $html .= '</tr>';
            }
            
            $html .= '</tbody></table>';
        } elseif (isset($data['events']) && is_array($data['events']) && count($data['events']) > 0) {
            // Incident report
            $headers = array_keys($data['events'][0]);
            $html .= '<table><thead><tr>';
            foreach ($headers as $header) {
                $html .= '<th>' . htmlspecialchars(ucwords(str_replace('_', ' ', $header))) . '</th>';
            }
            $html .= '</tr></thead><tbody>';
            
            foreach ($data['events'] as $event) {
                $html .= '<tr>';
                foreach ($headers as $header) {
                    $value = $event[$header] ?? '';
                    $html .= '<td>' . htmlspecialchars($value) . '</td>';
                }
                $html .= '</tr>';
            }
            
            $html .= '</tbody></table>';
        } else {
            $html .= '<p>No data available for this report.</p>';
        }
        
        $html .= '</div>';
        
        return $html;
    }
    
    /**
     * Add a sheet to the spreadsheet with formatted data
     */
    private function addSheetToSpreadsheet($spreadsheet, $sheetName, $data, $index, $headerStyle, $dataStyle, $reportType, $startDate, $endDate, $branch, $user, $categories)
    {
        $sanitizedSheetName = $this->sanitizeSheetName($sheetName);
        if ($index === 0) {
            $sheet = $spreadsheet->getActiveSheet();
            $sheet->setTitle($sanitizedSheetName);
        } else {
            $sheet = new \PhpOffice\PhpSpreadsheet\Worksheet\Worksheet($spreadsheet, $sanitizedSheetName);
            $spreadsheet->addSheet($sheet);
        }
        
        $this->writeDataToSheet($sheet, $data, $headerStyle, $dataStyle, $reportType, $startDate, $endDate, $branch, $user, $categories);
    }
    
    /**
     * Write formatted data to a sheet with clean header
     */
    private function writeDataToSheet($sheet, $data, $headerStyle, $dataStyle, $reportType, $startDate, $endDate, $branch, $user, $categories)
    {
        if (empty($data)) {
            return;
        }
        
        $startRow = 1;
        
        // Add report header section and get the next row
        $currentRow = $this->addReportHeader($sheet, $reportType, $startDate, $endDate, $branch, $user, $categories, $startRow);
        
        // Get headers from first row
        $headers = array_keys($data[0]);
        
        // Store table header row for freezing
        $tableHeaderRow = $currentRow;
        
        // Write table headers
        $col = 1;
        foreach ($headers as $header) {
            $columnLetter = Coordinate::stringFromColumnIndex($col);
            $sheet->setCellValue($columnLetter . $currentRow, $this->formatHeaderName($header));
            $sheet->getStyle($columnLetter . $currentRow)->applyFromArray($headerStyle);
            $sheet->getColumnDimension($columnLetter)->setAutoSize(true);
            $col++;
        }
        
        // Set header row height
        $sheet->getRowDimension($currentRow)->setRowHeight(25);
        $currentRow++;
        
        // Write data rows
        foreach ($data as $rowData) {
            $col = 1;
            foreach ($headers as $header) {
                $columnLetter = Coordinate::stringFromColumnIndex($col);
                $value = $rowData[$header] ?? '';
                
                // Format specific columns
                if (in_array(strtolower($header), ['uptime', 'actual_uptime', 'sla_target', 'downtime_percentage'])) {
                    $value = is_numeric($value) ? round((float)$value, 2) . '%' : $value;
                }
                
                $sheet->setCellValue($columnLetter . $currentRow, $value);
                $sheet->getStyle($columnLetter . $currentRow)->applyFromArray($dataStyle);
                
                // Color code status columns
                if (strtolower($header) === 'status' || strtolower($header) === 'is_compliant') {
                    $statusColor = $this->getStatusColor($value);
                    if ($statusColor) {
                        $sheet->getStyle($columnLetter . $currentRow)->getFill()
                            ->setFillType(Fill::FILL_SOLID)
                            ->getStartColor()->setRGB($statusColor);
                    }
                }
                
                $col++;
            }
            $currentRow++;
        }
        
        // Freeze header row (freeze at row after table header)
        $sheet->freezePane('A' . ($tableHeaderRow + 1));
    }
    
    /**
     * Add clean report header section
     */
    private function addReportHeader($sheet, $reportType, $startDate, $endDate, $branch, $user, $categories, $startRow)
    {
        $row = $startRow;
        
        // Report Title
        $reportTitle = 'LAPORAN ' . strtoupper($this->getReportTypeName($reportType));
        if ($branch) {
            $reportTitle .= ' : ' . strtoupper($branch->name);
        }
        if ($user) {
            $userName = is_a($user, \Illuminate\Support\Collection::class) 
                ? $user->pluck('name')->implode(', ')
                : $user->name;
            $reportTitle .= ' - ' . strtoupper($userName);
        }
        
        $sheet->setCellValue('A' . $row, $reportTitle);
        $sheet->getStyle('A' . $row)->getFont()->setBold(true)->setSize(14);
        $sheet->getStyle('A' . $row)->getFont()->getColor()->setRGB('1F2937');
        $sheet->mergeCells('A' . $row . ':F' . $row);
        $row++;
        
        // Date Range
        $dateRangeText = $this->formatDateRange($startDate, $endDate);
        $sheet->setCellValue('A' . $row, $dateRangeText);
        $sheet->getStyle('A' . $row)->getFont()->setSize(11);
        $sheet->getStyle('A' . $row)->getFont()->getColor()->setRGB('4B5563');
        $sheet->mergeCells('A' . $row . ':F' . $row);
        $row += 2;
        
        // Filter Information
        $filterInfo = [];
        if (!empty($categories)) {
            $filterInfo[] = 'Categories: ' . implode(', ', array_map('ucfirst', $categories));
        }
        if ($user) {
            $userName = is_a($user, \Illuminate\Support\Collection::class) 
                ? $user->pluck('name')->implode(', ')
                : $user->name;
            $filterInfo[] = 'Managed By: ' . $userName;
        }
        if ($branch) {
            $filterInfo[] = 'Branch: ' . $branch->name;
        }
        
        if (!empty($filterInfo)) {
            $sheet->setCellValue('A' . $row, implode(' | ', $filterInfo));
            $sheet->getStyle('A' . $row)->getFont()->setSize(10);
            $sheet->getStyle('A' . $row)->getFont()->getColor()->setRGB('6B7280');
            $sheet->mergeCells('A' . $row . ':F' . $row);
            $row++;
        }
        
        // Empty row before table
        $row++;
        
        return $row;
    }
    
    /**
     * Format date range for display
     */
    private function formatDateRange($startDate, $endDate)
    {
        try {
            $start = Carbon::parse($startDate);
            $end = Carbon::parse($endDate);
            return $start->format('d/m/Y H:i A') . ' to ' . $end->format('d/m/Y H:i A') . ' +08';
        } catch (\Exception $e) {
            return $startDate . ' to ' . $endDate;
        }
    }
    
    
    /**
     * Format header names for display
     */
    private function formatHeaderName($header)
    {
        $header = str_replace('_', ' ', $header);
        $header = ucwords($header);
        $header = str_replace('Ip', 'IP', $header);
        $header = str_replace('Sla', 'SLA', $header);
        $header = str_replace('Mttr', 'MTTR', $header);
        $header = str_replace('Mtbf', 'MTBF', $header);
        return $header;
    }
    
    /**
     * Add summary sheet to spreadsheet
     */
    private function addSummarySheet($spreadsheet, $summaryStats, $reportType, $startDate, $endDate, $branch, $user, $categories, $data)
    {
        // Normalize report type for checking
        $normalizedReportType = $reportType;
        if (is_numeric($reportType)) {
            $normalizedReportType = 'custom';
        }
        
        $summarySheet = $spreadsheet->getActiveSheet();
        $summarySheet->setTitle($this->sanitizeSheetName('Summary'));
        
        $row = 1;
        
        // Report Header
        $summarySheet->setCellValue('A' . $row, 'REPORT SUMMARY');
        $summarySheet->mergeCells('A' . $row . ':B' . $row);
        $summarySheet->getStyle('A' . $row)->applyFromArray([
            'font' => ['bold' => true, 'size' => 16, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '10B981']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $row += 2;
        
        // Report Information
        $summarySheet->setCellValue('A' . $row, 'Report Type:');
        $summarySheet->setCellValue('B' . $row, $this->getReportTypeName($reportType));
        $row++;
        
        $summarySheet->setCellValue('A' . $row, 'Date Range:');
        $summarySheet->setCellValue('B' . $row, $this->formatDateRange($startDate, $endDate));
        $row++;
        
        if ($branch) {
            $summarySheet->setCellValue('A' . $row, 'Branch:');
            $summarySheet->setCellValue('B' . $row, $branch->name);
            $row++;
        }
        
        if ($user) {
            $userName = is_a($user, \Illuminate\Support\Collection::class) 
                ? $user->pluck('name')->implode(', ')
                : $user->name;
            $summarySheet->setCellValue('A' . $row, 'Managed By:');
            $summarySheet->setCellValue('B' . $row, $userName);
            $row++;
        }
        
        if (!empty($categories)) {
            $summarySheet->setCellValue('A' . $row, 'Categories:');
            $summarySheet->setCellValue('B' . $row, implode(', ', array_map('ucfirst', $categories)));
            $row++;
        }
        
        $summarySheet->setCellValue('A' . $row, 'Generated At:');
        $summarySheet->setCellValue('B' . $row, Carbon::now()->format('d/m/Y H:i:s'));
        $row += 2;
        
        // Summary Statistics Header
        $summarySheet->setCellValue('A' . $row, 'SUMMARY STATISTICS');
        $summarySheet->mergeCells('A' . $row . ':B' . $row);
        $summarySheet->getStyle('A' . $row)->applyFromArray([
            'font' => ['bold' => true, 'size' => 14, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '059669']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $row++;
        
        // General Statistics
        $summarySheet->setCellValue('A' . $row, 'Total Devices');
        $summarySheet->setCellValue('B' . $row, $summaryStats['total_devices'] ?? 0);
        $row++;
        
        // Uptime Statistics (if available)
        if (isset($summaryStats['avg_uptime']) && $summaryStats['avg_uptime'] > 0) {
            $summarySheet->setCellValue('A' . $row, 'Average Uptime');
            $summarySheet->setCellValue('B' . $row, ($summaryStats['avg_uptime'] ?? 0) . '%');
            $row++;
            
            $summarySheet->setCellValue('A' . $row, 'Total Downtime');
            $summarySheet->setCellValue('B' . $row, round(($summaryStats['total_downtime_minutes'] ?? 0) / 60, 2) . ' hours');
            $row++;
            
            $summarySheet->setCellValue('A' . $row, 'Average Downtime');
            $summarySheet->setCellValue('B' . $row, round(($summaryStats['avg_downtime_minutes'] ?? 0) / 60, 2) . ' hours');
            $row++;
            
            if (isset($summaryStats['devices_online'])) {
                $summarySheet->setCellValue('A' . $row, 'Devices Online');
                $summarySheet->setCellValue('B' . $row, $summaryStats['devices_online'] ?? 0);
                $row++;
            }
            
            if (isset($summaryStats['devices_offline'])) {
                $summarySheet->setCellValue('A' . $row, 'Devices Offline');
                $summarySheet->setCellValue('B' . $row, $summaryStats['devices_offline'] ?? 0);
                $row++;
            }
            
            if (isset($summaryStats['devices_warning'])) {
                $summarySheet->setCellValue('A' . $row, 'Devices Warning');
                $summarySheet->setCellValue('B' . $row, $summaryStats['devices_warning'] ?? 0);
                $row++;
            }
        }
        
        // SLA Statistics (only for SLA or comprehensive reports)
        if (($normalizedReportType === 'sla' || $normalizedReportType === 'comprehensive') && 
            isset($summaryStats['avg_sla']) && $summaryStats['avg_sla'] > 0) {
            $summarySheet->setCellValue('A' . $row, 'Average SLA Compliance');
            $summarySheet->setCellValue('B' . $row, ($summaryStats['avg_sla'] ?? 0) . '%');
            $row++;
            
            if (isset($summaryStats['sla_compliant_devices'])) {
                $summarySheet->setCellValue('A' . $row, 'SLA Compliant Devices');
                $summarySheet->setCellValue('B' . $row, $summaryStats['sla_compliant_devices'] ?? 0);
                $row++;
            }
            
            if (isset($summaryStats['sla_violations'])) {
                $summarySheet->setCellValue('A' . $row, 'SLA Violations');
                $summarySheet->setCellValue('B' . $row, $summaryStats['sla_violations'] ?? 0);
                $row++;
            }
        }
        
        // Incident Statistics (only for incident or comprehensive reports)
        if (($normalizedReportType === 'incidents' || $normalizedReportType === 'comprehensive') && 
            isset($summaryStats['total_incidents']) && $summaryStats['total_incidents'] > 0) {
            $summarySheet->setCellValue('A' . $row, 'Total Incidents');
            $summarySheet->setCellValue('B' . $row, $summaryStats['total_incidents'] ?? 0);
            $row++;
            
            if (!empty($summaryStats['incidents_by_type'])) {
                foreach ($summaryStats['incidents_by_type'] as $type => $count) {
                    $summarySheet->setCellValue('A' . $row, ucfirst($type) . ' Incidents');
                    $summarySheet->setCellValue('B' . $row, $count);
                    $row++;
                }
            }
        }
        
        // Devices by Category (if available)
        if (!empty($summaryStats['devices_by_category'])) {
            $row++;
            $summarySheet->setCellValue('A' . $row, 'DEVICES BY CATEGORY');
            $summarySheet->mergeCells('A' . $row . ':B' . $row);
            $summarySheet->getStyle('A' . $row)->applyFromArray([
                'font' => ['bold' => true, 'size' => 12],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'D1FAE5']],
            ]);
            $row++;
            
            foreach ($summaryStats['devices_by_category'] as $category => $count) {
                $summarySheet->setCellValue('A' . $row, ucfirst($category));
                $summarySheet->setCellValue('B' . $row, $count);
                $row++;
            }
        }
        
        // Format columns
        $summarySheet->getColumnDimension('A')->setWidth(25);
        $summarySheet->getColumnDimension('B')->setWidth(30);
        
        // Apply borders to data cells
        $lastRow = $row - 1;
        if ($lastRow > 0) {
            $summarySheet->getStyle('A1:B' . $lastRow)->applyFromArray([
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                        'color' => ['rgb' => 'E5E7EB'],
                    ],
                ],
            ]);
        }
        
        // Freeze first row
        $summarySheet->freezePane('A2');
    }
    
    /**
     * Get color code for status values
     */
    private function getStatusColor($status)
    {
        $status = strtolower((string)$status);
        if (in_array($status, ['online', 'true', '1', 'yes', 'compliant'])) {
            return 'D1FAE5'; // Light green
        } elseif (in_array($status, ['offline', 'false', '0', 'no', 'non-compliant'])) {
            return 'FEE2E2'; // Light red
        } elseif (in_array($status, ['warning'])) {
            return 'FEF3C7'; // Light yellow
        }
        return null;
    }
    
    /**
     * Calculate grouped uptime averages
     */
    private function calculateGroupedUptime($devices, $groupBy)
    {
        $grouped = [];
        
        foreach ($devices as $device) {
            $groupKey = $device[$groupBy] ?? 'N/A';
            
            if (!isset($grouped[$groupKey])) {
                $grouped[$groupKey] = [
                    'group' => $groupKey,
                    'device_count' => 0,
                    'total_uptime' => 0,
                    'devices' => [],
                ];
            }
            
            $grouped[$groupKey]['device_count']++;
            $grouped[$groupKey]['total_uptime'] += $device['uptime'] ?? $device['uptime_percentage'] ?? 0;
            $grouped[$groupKey]['devices'][] = $device;
        }
        
        // Calculate averages
        $result = [];
        foreach ($grouped as $groupKey => $data) {
            $avgUptime = $data['device_count'] > 0 
                ? round($data['total_uptime'] / $data['device_count'], 2) 
                : 0;
            
            $result[] = [
                'group' => $groupKey,
                'device_uptime' => $avgUptime . '%',
                'device_count' => $data['device_count'],
            ];
        }
        
        // Sort by group name
        usort($result, function($a, $b) {
            return strcmp($a['group'], $b['group']);
        });
        
        return $result;
    }
    
    /**
     * Calculate overall average uptime
     */
    private function calculateOverallUptime($devices)
    {
        if (count($devices) === 0) {
            return [
                'group' => 'All Devices',
                'device_uptime' => '0%',
                'device_count' => 0,
            ];
        }
        
        $totalUptime = 0;
        foreach ($devices as $device) {
            $totalUptime += $device['uptime'] ?? $device['uptime_percentage'] ?? 0;
        }
        
        $avgUptime = round($totalUptime / count($devices), 2);
        
        return [
            'group' => 'All Devices',
            'device_uptime' => $avgUptime . '%',
            'device_count' => count($devices),
        ];
    }
    
    /**
     * Sanitize sheet name for Excel compatibility
     */
    private function sanitizeSheetName($sheetName)
    {
        // Remove invalid characters: \ / ? * [ ]
        $sanitized = preg_replace('/[\\\\\/\?\*\[\]]/', '', $sheetName);
        // Truncate to 31 characters (Excel limit)
        return mb_substr($sanitized, 0, 31);
    }
    
    /**
     * Add grouped uptime sheet to spreadsheet
     */
    private function addGroupedUptimeSheet($spreadsheet, $sheetName, $groupedData, $index, $headerStyle, $dataStyle, $startDate, $endDate, $branch, $user, $categories)
    {
        $sanitizedSheetName = $this->sanitizeSheetName($sheetName);
        if ($index === 1) {
            $sheet = $spreadsheet->getActiveSheet();
            $sheet->setTitle($sanitizedSheetName);
        } else {
            $sheet = new \PhpOffice\PhpSpreadsheet\Worksheet\Worksheet($spreadsheet, $sanitizedSheetName);
            $spreadsheet->addSheet($sheet);
        }
        
        $row = 1;
        
        // Add report header
        $currentRow = $this->addReportHeader($sheet, 'uptime', $startDate, $endDate, $branch, $user, $categories, $row);
        $row = $currentRow;
        
        // Headers
        $headers = ['Group', 'Device Uptime'];
        $col = 'A';
        foreach ($headers as $header) {
            $sheet->setCellValue($col . $row, $header);
            $sheet->getStyle($col . $row)->applyFromArray($headerStyle);
            $sheet->getColumnDimension($col)->setAutoSize(true);
            $col++;
        }
        $row++;
        
        // Data rows
        foreach ($groupedData as $item) {
            $col = 'A';
            $sheet->setCellValue($col . $row, $item['group']);
            $col++;
            $sheet->setCellValue($col . $row, $item['device_uptime']);
            
            // Apply data style
            $sheet->getStyle('A' . $row . ':' . $col . $row)->applyFromArray($dataStyle);
            $row++;
        }
        
        // Freeze header row
        $sheet->freezePane('A2');
    }
    
    /**
     * Add client session sheet to spreadsheet
     */
    private function addClientSessionSheet($spreadsheet, $sheetName, $sessionData, $index, $headerStyle, $dataStyle, $startDate, $endDate, $branch, $user, $categories, $dataType)
    {
        $sanitizedSheetName = $this->sanitizeSheetName($sheetName);
        if ($index === 1) {
            $sheet = $spreadsheet->getActiveSheet();
            $sheet->setTitle($sanitizedSheetName);
        } else {
            $sheet = new \PhpOffice\PhpSpreadsheet\Worksheet\Worksheet($spreadsheet, $sanitizedSheetName);
            $spreadsheet->addSheet($sheet);
        }
        
        $row = 1;
        
        // Add report header
        $currentRow = $this->addReportHeader($sheet, 'client_session', $startDate, $endDate, $branch, $user, $categories, $row);
        $row = $currentRow;
        
        // Define headers based on data type
        $headers = [];
        if ($dataType === 'top_clients') {
            $headers = ['Rank', 'MAC Address', 'Usernames', 'Bytes Used (MB)', 'Time', 'Avg Usage (Kbps)', 'Connection Modes', 'Device Types'];
        } else {
            $headers = [
                $dataType === 'ssid' ? 'SSID' : ($dataType === 'vlan' ? 'VLAN' : ($dataType === 'cipher' ? 'Cipher' : ($dataType === 'connection_mode' ? 'Connection Mode' : 'Role'))),
                'Sessions',
                'Clients',
                '% of Clients',
                'Time',
                '% of Time',
                'Bytes Used (MB)',
                '% of MB Used',
                'Bytes Used per Client (MB)',
                'Bytes Used per Session (MB)',
                'Bytes In (MB)',
                'Bytes In per Client (MB)',
                'Bytes In per Session (MB)',
                'Bytes Out (MB)',
                'Bytes Out per Client (MB)',
                'Bytes Out per Session (MB)',
                'Avg Signal Quality',
                'Avg Signal (dBm)'
            ];
        }
        
        // Write headers
        $col = 'A';
        foreach ($headers as $header) {
            $sheet->setCellValue($col . $row, $header);
            $sheet->getStyle($col . $row)->applyFromArray($headerStyle);
            $sheet->getColumnDimension($col)->setAutoSize(true);
            $col++;
        }
        $row++;
        
        // Write data rows (empty template)
        if (empty($sessionData) || count($sessionData) === 0) {
            // Add a placeholder row indicating no data
            $col = 'A';
            $sheet->setCellValue($col . $row, 'No data available - Template only');
            $sheet->mergeCells('A' . $row . ':' . Coordinate::stringFromColumnIndex(count($headers)) . $row);
            $sheet->getStyle('A' . $row)->applyFromArray([
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
                'font' => ['italic' => true, 'color' => ['rgb' => '6B7280']],
            ]);
        } else {
            foreach ($sessionData as $item) {
                $col = 'A';
                foreach ($headers as $header) {
                    $value = $item[$header] ?? $item[strtolower(str_replace(' ', '_', $header))] ?? '';
                    $sheet->setCellValue($col . $row, $value);
                    $col++;
                }
                $sheet->getStyle('A' . $row . ':' . Coordinate::stringFromColumnIndex(count($headers)) . $row)->applyFromArray($dataStyle);
                $row++;
            }
        }
        
        // Freeze header row
        $sheet->freezePane('A' . ($currentRow + 1));
    }
    
    /**
     * Add device summary sheet to spreadsheet
     */
    private function addDeviceSummarySheet($spreadsheet, $sheetName, $summaryData, $index, $headerStyle, $dataStyle, $startDate, $endDate, $branch, $user, $categories, $dataType)
    {
        $sanitizedSheetName = $this->sanitizeSheetName($sheetName);
        if ($index === 1) {
            $sheet = $spreadsheet->getActiveSheet();
            $sheet->setTitle($sanitizedSheetName);
        } else {
            $sheet = new \PhpOffice\PhpSpreadsheet\Worksheet\Worksheet($spreadsheet, $sanitizedSheetName);
            $spreadsheet->addSheet($sheet);
        }
        
        $row = 1;
        
        // Add report header
        $currentRow = $this->addReportHeader($sheet, 'device_summary', $startDate, $endDate, $branch, $user, $categories, $row);
        $row = $currentRow;
        
        // Define headers based on data type
        $headers = [];
        if ($dataType === 'device') {
            $headers = ['Rank', 'Device', 'Max Clients', 'Unique Clients', 'Total Data', 'Avg Usage', 'Max Usage', 'Location', 'Controller', 'Folder', 'Group'];
        } else { // folder
            $headers = ['Rank', 'Folder', 'Max Clients', 'Unique Clients', 'Total Data', 'Avg Usage', 'Max Usage'];
        }
        
        // Write headers
        $col = 'A';
        foreach ($headers as $header) {
            $sheet->setCellValue($col . $row, $header);
            $sheet->getStyle($col . $row)->applyFromArray($headerStyle);
            $sheet->getColumnDimension($col)->setAutoSize(true);
            $col++;
        }
        $row++;
        
        // Write data rows (empty template)
        if (empty($summaryData) || count($summaryData) === 0) {
            // Add a placeholder row indicating no data
            $col = 'A';
            $sheet->setCellValue($col . $row, 'No data available - Template only');
            $sheet->mergeCells('A' . $row . ':' . Coordinate::stringFromColumnIndex(count($headers)) . $row);
            $sheet->getStyle('A' . $row)->applyFromArray([
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
                'font' => ['italic' => true, 'color' => ['rgb' => '6B7280']],
            ]);
        } else {
            foreach ($summaryData as $item) {
                $col = 'A';
                foreach ($headers as $header) {
                    // Map various possible key formats
                    $key = $header;
                    $value = $item[$key] ?? $item[strtolower(str_replace(' ', '_', $key))] ?? '';
                    
                    // Handle special formatting for data columns
                    if (in_array($header, ['Total Data', 'Avg Usage', 'Max Usage'])) {
                        // Keep as is if already formatted, otherwise format
                        if (is_numeric($value)) {
                            if ($header === 'Total Data') {
                                $value = number_format($value, 2) . ' MB';
                            } else {
                                $value = number_format($value, 2) . ' Kbps';
                            }
                        }
                    }
                    
                    $sheet->setCellValue($col . $row, $value);
                    $col++;
                }
                $sheet->getStyle('A' . $row . ':' . Coordinate::stringFromColumnIndex(count($headers)) . $row)->applyFromArray($dataStyle);
                $row++;
            }
        }
        
        // Freeze header row
        $sheet->freezePane('A' . ($currentRow + 1));
    }
    
    /**
     * Add RF Health sheet to spreadsheet
     */
    private function addRFHealthSheet($spreadsheet, $sheetName, $rfHealthData, $index, $headerStyle, $dataStyle, $startDate, $endDate, $branch, $user, $categories, $dataType)
    {
        $sanitizedSheetName = $this->sanitizeSheetName($sheetName);
        if ($index === 1) {
            $sheet = $spreadsheet->getActiveSheet();
            $sheet->setTitle($sanitizedSheetName);
        } else {
            $sheet = new \PhpOffice\PhpSpreadsheet\Worksheet\Worksheet($spreadsheet, $sanitizedSheetName);
            $spreadsheet->addSheet($sheet);
        }
        
        $row = 1;
        
        // Add report header
        $currentRow = $this->addReportHeader($sheet, 'rf_health', $startDate, $endDate, $branch, $user, $categories, $row);
        $row = $currentRow;
        
        // Define headers based on data type
        $headers = [];
        switch ($dataType) {
            case 'thresholds':
                $headers = ['Client Health(2.4 GHz)', 'Client Health(5 GHz)', 'Client Health(6 GHz)', 'Client SNR(2.4 GHz)', 'Client SNR(5 GHz)', 'Client SNR(6 GHz)', 'Radio Noise(2.4 GHz)', 'Radio Noise(5 GHz)', 'Radio Noise(6 GHz)', 'Radio Utilization(2.4 GHz)', 'Radio Utilization(5 GHz)', 'Radio Utilization(6 GHz)', 'Radio Interference(2.4 GHz)', 'Radio Interference(5 GHz)', 'Radio Interference(6 GHz)'];
                break;
            case 'clients_least_goodput':
                $headers = ['Rank', 'Client', 'Goodput'];
                break;
            case 'clients_least_speed':
                $headers = ['Rank', 'Client', 'Speed'];
                break;
            case 'top_folders_worst_stats':
                $headers = ['Folder', '% Time with Poor Client Health', '% Time with Poor Client SNR', '% Time with High Radio Noise', '% Time with High Radio Utilization', '% Time with High Radio Interference'];
                break;
            case 'channel_usage':
                $headers = ['Rank', 'Device', 'Channel Busy (%)', 'Interference (%)', 'Clients', 'Usage', 'Location', 'Controller', 'Folder', 'Group'];
                break;
            case 'max_clients':
                $headers = ['Rank', 'Device', 'Max Clients', 'Timestamp'];
                break;
            case 'channel_changes':
                $headers = ['Rank', 'Device', 'Channel Changes', 'Avg Noise (dBm)', 'Avg Channel Busy (%)', 'Clients', 'Usage', 'Location', 'Controller', 'Folder', 'Group'];
                break;
            case 'mac_phy_errors':
                $headers = ['Rank', 'Device', 'MAC Errors (%)', 'PHY Errors (%)', 'Channel Changes', 'Avg Noise (dBm)', 'Avg Channel Busy (%)', 'Clients', 'Usage', 'Location', 'Controller', 'Folder', 'Group'];
                break;
            case 'noise':
                $headers = ['Rank', 'Device', 'Avg Noise (dBm)', 'Channel Changes', 'Avg Channel Busy (%)', 'Clients', 'Usage', 'Location', 'Controller', 'Folder', 'Group'];
                break;
            case 'tx_power_changes':
                $headers = ['Rank', 'Device', 'Transmit Power Changes', 'Channel Changes', 'Avg Noise (dBm)', 'Avg Channel Busy (%)', 'Clients', 'Usage', 'Location', 'Controller', 'Folder', 'Group'];
                break;
            case 'problem_radios':
                $headers = ['Device', 'Channel Changes', 'Transmit Power Changes', 'Mode Changes', 'Avg Noise (dBm)', 'Avg Channel Busy (%)', 'MAC Errors (%)', 'PHY Errors (%)', 'Interfering Devices', 'Clients', 'Usage', 'Location', 'Controller', 'Folder', 'Group'];
                break;
            case 'radios_least_goodput':
                $headers = ['Rank', 'Device', 'Goodput', 'Controller', 'Group', 'Folder'];
                break;
        }
        
        // Write headers
        $col = 'A';
        foreach ($headers as $header) {
            $sheet->setCellValue($col . $row, $header);
            $sheet->getStyle($col . $row)->applyFromArray($headerStyle);
            $sheet->getColumnDimension($col)->setAutoSize(true);
            $col++;
        }
        $row++;
        
        // Write data rows (empty template)
        if (empty($rfHealthData) || count($rfHealthData) === 0) {
            // Add a placeholder row indicating no data
            $col = 'A';
            $sheet->setCellValue($col . $row, 'No data available - Template only');
            $sheet->mergeCells('A' . $row . ':' . Coordinate::stringFromColumnIndex(count($headers)) . $row);
            $sheet->getStyle('A' . $row)->applyFromArray([
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
                'font' => ['italic' => true, 'color' => ['rgb' => '6B7280']],
            ]);
        } else {
            foreach ($rfHealthData as $item) {
                $col = 'A';
                foreach ($headers as $header) {
                    // Map various possible key formats
                    $key = $header;
                    $value = $item[$key] ?? $item[strtolower(str_replace([' ', '(', ')', '%'], ['_', '', '', ''], $key))] ?? '';
                    
                    $sheet->setCellValue($col . $row, $value);
                    $col++;
                }
                $sheet->getStyle('A' . $row . ':' . Coordinate::stringFromColumnIndex(count($headers)) . $row)->applyFromArray($dataStyle);
                $row++;
            }
        }
        
        // Freeze header row
        $sheet->freezePane('A' . ($currentRow + 1));
    }
    
    /**
     * Get formatted report type name
     */
    private function getReportTypeName($reportType)
    {
        $names = [
            'uptime' => 'Uptime Report',
            'sla' => 'SLA Report',
            'incidents' => 'Incident Report',
            'comprehensive' => 'Comprehensive Report',
            'client_session' => 'Client Session Report',
            'device_summary' => 'Device Summary Report',
            'rf_health' => 'RF Health Report',
        ];
        return $names[$reportType] ?? 'Report';
    }
    
    /**
     * Generate uptime report for custom date range
     */
    private function generateUptimeReport($branchId, $start, $end, $categories, $managedBy = null)
    {
        $devicesQuery = Device::where('branch_id', $branchId)
            ->where('is_active', true);
        
        // Filter by multiple categories
        if (!empty($categories) && is_array($categories)) {
            $devicesQuery->whereIn('category', $categories);
        }
        
        // Filter by managed_by if provided (can be array or single value)
        if ($managedBy) {
            $managedByArray = is_array($managedBy) ? $managedBy : [$managedBy];
            $devicesQuery->where(function ($q) use ($managedByArray) {
                $q->whereIn('managed_by', $managedByArray)
                  ->orWhereHas('managers', function ($mq) use ($managedByArray) {
                      $mq->whereIn('users.id', $managedByArray);
                  });
            });
        }
        
        $devices = $devicesQuery->with(['location.locationFolder', 'managedBy', 'managers'])
            ->select('id', 'name', 'ip_address', 'category', 'status', 'uptime_percentage', 'offline_duration_minutes', 'location_id', 'managed_by')
            ->get();
        
        $deviceIds = $devices->pluck('id');
        $allHistory = MonitoringHistory::whereIn('device_id', $deviceIds)
            ->where('checked_at', '>=', $start)
            ->where('checked_at', '<=', $end)
            ->orderBy('device_id', 'asc')
            ->orderBy('checked_at', 'asc')
            ->select('device_id', 'status', 'checked_at')
            ->get()
            ->groupBy('device_id');
        
        $reportData = $devices->map(function ($device) use ($allHistory, $start, $end) {
            $history = $allHistory->get($device->id, collect());
            
            $uptimePercentage = 0;
            if ($history->count() > 0) {
                // Calculate from actual monitoring history in the date range
                $totalChecks = $history->count();
                $onlineChecks = $history->where('status', 'online')->count();
                $uptimePercentage = round((float) (($onlineChecks / $totalChecks) * 100), 2);
                
                // If device is currently offline and all checks in range are offline, ensure 0%
                if (($device->status === 'offline' || $device->status === 'offline_ack') && $onlineChecks === 0) {
                    $uptimePercentage = 0;
                }
            } else {
                // No history in date range - use current device status
                // If device is offline, uptime should be 0% regardless of stored value
                if ($device->status === 'offline' || $device->status === 'offline_ack') {
                    $uptimePercentage = 0;
                } else {
                    // Device is online but no history - could be newly added or no checks in range
                    // Only use stored percentage if device is actually online
                    $uptimePercentage = ($device->status === 'online') ? ($device->uptime_percentage ?? 100) : 0;
                }
            }
            
            $downtimeMinutes = $device->offline_duration_minutes ?? 0;
            $downtimeStr = \App\Helpers\FormatHelper::formatOfflineDuration($downtimeMinutes);
            
            $incidents = 0;
            $previousStatus = null;
            $lastIncident = null;
            foreach ($history as $record) {
                if ($previousStatus === 'online' && $record->status === 'offline') {
                    $incidents++;
                    $lastIncident = $record->checked_at;
                }
                $previousStatus = $record->status;
            }
            
            // Get location path (folder > location)
            $locationPath = 'N/A';
            if ($device->location) {
                $parts = [];
                if ($device->location->locationFolder) {
                    $parts[] = $device->location->locationFolder->name;
                }
                $parts[] = $device->location->name;
                $locationPath = implode(' > ', $parts);
            }
            
            // Get managed by name
            $managedByName = 'N/A';
            if ($device->managedBy) {
                $managedByName = $device->managedBy->name;
            } elseif ($device->managers && $device->managers->count() > 0) {
                $managedByName = $device->managers->pluck('name')->join(', ');
            }
            
            return [
                'device' => $device->name,
                'ip_address' => $device->ip_address,
                'category' => $this->formatCategory($device->category),
                'status' => $device->status,
                'uptime' => round($uptimePercentage, 2),
                'uptime_percentage' => round($uptimePercentage, 2), // Also include for compatibility
                'downtime' => $downtimeStr,
                'downtime_minutes' => $downtimeMinutes, // Include raw minutes for summary calculation
                'incidents' => $incidents,
                'lastIncident' => $lastIncident ? $lastIncident->toDateString() : 'Never',
                'location' => $locationPath,
                'location_id' => $device->location_id,
                'location_folder_id' => $device->location?->location_folder_id,
                'managed_by' => $managedByName,
                'managed_by_id' => $device->managed_by,
            ];
        });
        
        // Calculate grouped summaries
        $groupedByGroup = $this->calculateGroupedUptime($reportData, 'managed_by');
        $groupedByLocation = $this->calculateGroupedUptime($reportData, 'location');
        $groupedByCategory = $this->calculateGroupedUptime($reportData, 'category');
        $overallAverage = $this->calculateOverallUptime($reportData);
        
        return response()->json([
            'devices' => $reportData,
            'grouped_by_group' => $groupedByGroup,
            'grouped_by_location' => $groupedByLocation,
            'grouped_by_category' => $groupedByCategory,
            'overall_average' => $overallAverage,
        ]);
    }
    
    /**
     * Generate SLA report for custom date range
     */
    private function generateSlaReport($branchId, $start, $end, $categories, $managedBy = null)
    {
        $devicesQuery = Device::where('branch_id', $branchId)
            ->where('is_active', true);
        
        // Filter by multiple categories
        if (!empty($categories) && is_array($categories)) {
            $devicesQuery->whereIn('category', $categories);
        }
        
        // Filter by managed_by if provided (can be array or single value)
        if ($managedBy) {
            $managedByArray = is_array($managedBy) ? $managedBy : [$managedBy];
            $devicesQuery->where(function ($q) use ($managedByArray) {
                $q->whereIn('managed_by', $managedByArray)
                  ->orWhereHas('managers', function ($mq) use ($managedByArray) {
                      $mq->whereIn('users.id', $managedByArray);
                  });
            });
        }
        
        $devices = $devicesQuery->select('id', 'name', 'ip_address', 'category', 'status', 'uptime_percentage', 'sla_target', 'offline_duration_minutes')
            ->get();
        
        $deviceIds = $devices->pluck('id');
        $totalMinutes = $end->diffInMinutes($start);
        
        $uptimeAggregates = MonitoringHistory::whereIn('device_id', $deviceIds)
            ->where('checked_at', '>=', $start)
            ->where('checked_at', '<=', $end)
            ->select('device_id', DB::raw('COUNT(*) as total_checks'), DB::raw('SUM(CASE WHEN status = \'online\' THEN 1 ELSE 0 END) as online_checks'))
            ->groupBy('device_id')
            ->get()
            ->keyBy('device_id');
        
        $slaData = $devices->map(function ($device) use ($uptimeAggregates, $totalMinutes) {
            $slaTarget = $device->sla_target ?? 99.9;
            $aggregate = $uptimeAggregates->get($device->id);
            
            $actualUptime = 0;
            if ($aggregate && $aggregate->total_checks > 0) {
                $actualUptime = round((float) (($aggregate->online_checks / $aggregate->total_checks) * 100), 2);
                
                // If device is currently offline and all checks in range are offline, ensure 0%
                if (($device->status === 'offline' || $device->status === 'offline_ack') && $aggregate->online_checks === 0) {
                    $actualUptime = 0;
                }
            } else {
                // No history in date range - use current device status
                // If device is offline, uptime should be 0% regardless of stored value
                if ($device->status === 'offline' || $device->status === 'offline_ack') {
                    $actualUptime = 0;
                } else {
                    // Device is online but no history - use stored percentage or default to 100%
                    $actualUptime = ($device->status === 'online') ? ($device->uptime_percentage ?? 100) : 0;
                }
            }
            
            $isCompliant = $actualUptime >= $slaTarget;
            
            // Calculate MTTR and MTBF (simplified)
            $mttrHours = 0;
            $mtbfDays = 0;
            
            return [
                'device' => $device->name,
                'ip_address' => $device->ip_address,
                'category' => $this->formatCategory($device->category),
                'status' => $device->status,
                'sla_target' => round($slaTarget, 2),
                'actual_uptime' => round($actualUptime, 2),
                'sla_compliance' => round($actualUptime, 2), // Also include for compatibility
                'is_compliant' => $isCompliant,
                'mttr_hours' => round($mttrHours, 2),
                'mtbf_days' => round($mtbfDays, 2),
                'sla_violations' => $isCompliant ? 0 : 1,
            ];
        });
        
        return response()->json(['devices' => $slaData]);
    }
    
    /**
     * Generate incident report for custom date range
     */
    private function generateIncidentReport($branchId, $start, $end, $categories, $managedBy = null)
    {
        $devicesQuery = Device::where('branch_id', $branchId)
            ->where('is_active', true);
        
        // Filter by multiple categories
        if (!empty($categories) && is_array($categories)) {
            $devicesQuery->whereIn('category', $categories);
        }
        
        // Filter by managed_by if provided (can be array or single value)
        if ($managedBy) {
            $managedByArray = is_array($managedBy) ? $managedBy : [$managedBy];
            $devicesQuery->where(function ($q) use ($managedByArray) {
                $q->whereIn('managed_by', $managedByArray)
                  ->orWhereHas('managers', function ($mq) use ($managedByArray) {
                      $mq->whereIn('users.id', $managedByArray);
                  });
            });
        }
        
        $deviceIds = $devicesQuery->pluck('id');
        
        $allHistory = MonitoringHistory::join('devices', 'monitoring_history.device_id', '=', 'devices.id')
            ->whereIn('monitoring_history.device_id', $deviceIds)
            ->where('monitoring_history.checked_at', '>=', $start)
            ->where('monitoring_history.checked_at', '<=', $end)
            ->orderBy('monitoring_history.device_id', 'asc')
            ->orderBy('monitoring_history.checked_at', 'asc')
            ->select(
                'monitoring_history.id',
                'monitoring_history.device_id',
                'devices.name as device_name',
                'devices.ip_address as device_ip',
                'devices.category',
                'monitoring_history.status',
                'monitoring_history.checked_at'
            )
            ->get();
        
        $statusChanges = collect();
        $lastStatus = [];
        
        foreach ($allHistory as $entry) {
            $deviceId = $entry->device_id;
            $currentStatus = $entry->status;
            
            if (!isset($lastStatus[$deviceId]) || $lastStatus[$deviceId] !== $currentStatus) {
                $statusChanges->push($entry);
                $lastStatus[$deviceId] = $currentStatus;
            }
        }
        
        $events = $statusChanges->map(function ($event) {
            return [
                'deviceName' => $event->device_name ?? 'Unknown',
                'deviceIp' => $event->device_ip ?? 'N/A',
                'eventType' => ($event->status === 'online' || $event->status === 'warning') ? 'up' : 'down',
                'timestamp' => Carbon::parse($event->checked_at)->toIso8601String(),
                'category' => $this->formatCategory($event->category ?? 'switches'),
            ];
        });
        
        return response()->json(['events' => $events]);
    }
    
    /**
     * Generate comprehensive report for custom date range
     */
    private function generateComprehensiveReport($branchId, $start, $end, $categories, $managedBy = null)
    {
        $uptimeReport = $this->generateUptimeReport($branchId, $start, $end, $categories, $managedBy);
        $slaReport = $this->generateSlaReport($branchId, $start, $end, $categories, $managedBy);
        $incidentReport = $this->generateIncidentReport($branchId, $start, $end, $categories, $managedBy);
        
        // Extract data from JsonResponse objects
        $uptimeData = is_object($uptimeReport) && method_exists($uptimeReport, 'getData') ? $uptimeReport->getData(true) : $uptimeReport;
        $slaData = is_object($slaReport) && method_exists($slaReport, 'getData') ? $slaReport->getData(true) : $slaReport;
        $incidentData = is_object($incidentReport) && method_exists($incidentReport, 'getData') ? $incidentReport->getData(true) : $incidentReport;
        
        return [
            'uptime' => $uptimeData,
            'sla' => $slaData,
            'incidents' => $incidentData,
        ];
    }
    
    /**
     * Generate client session report (template - no real data available)
     */
    private function generateClientSessionReport($branchId, $start, $end, $categories, $managedBy = null)
    {
        // Template data structure - no real data available
        // This creates empty/placeholder data matching the CSV structure
        
        return response()->json([
            'by_ssid' => [], // Session data by SSID
            'by_vlan' => [], // Session data by VLAN
            'top_clients' => [], // Top clients by total MB used
            'by_cipher' => [], // Session data by encryption cipher
            'by_connection_mode' => [], // Session data by connection mode (802.11ac, etc.)
            'by_role' => [], // Session data by user role
        ]);
    }
    
    /**
     * Generate device summary report (template - no real data available)
     */
    private function generateDeviceSummaryReport($branchId, $start, $end, $categories, $managedBy = null)
    {
        // Template data structure - no real data available
        // This creates empty/placeholder data matching the CSV structure
        
        return response()->json([
            'most_utilized_by_max_clients' => [], // Most utilized devices by maximum concurrent clients
            'most_utilized_by_usage' => [], // Most utilized devices by usage
            'least_utilized_by_max_clients' => [], // Least utilized devices by maximum concurrent clients
            'least_utilized_by_usage' => [], // Least utilized devices by usage
            'most_utilized_folders_by_max_clients' => [], // Most utilized folders by maximum concurrent clients
            'most_utilized_folders_by_usage' => [], // Most utilized folders by usage
        ]);
    }
    
    /**
     * Generate RF Health report (template - no real data available)
     */
    private function generateRFHealthReport($branchId, $start, $end, $categories, $managedBy = null)
    {
        // Template data structure - no real data available
        // This creates empty/placeholder data matching the CSV structure
        
        return response()->json([
            'thresholds' => [], // Threshold values for various metrics
            'clients_least_goodput' => [], // Clients with least goodput
            'clients_least_speed' => [], // Clients with least speed
            'top_folders_worst_stats' => [], // Top folders by worst client and radio statistics
            'least_utilized_2_4ghz' => [], // Least utilized by channel usage (2.4 GHz)
            'least_utilized_5ghz' => [], // Least utilized by channel usage (5 GHz)
            'max_clients_2_4ghz' => [], // Max concurrent clients (2.4 GHz)
            'max_clients_5ghz' => [], // Max concurrent clients (5 GHz)
            'most_channel_changes_2_4ghz' => [], // Most channel changes (2.4 GHz)
            'most_channel_changes_5ghz' => [], // Most channel changes (5 GHz)
            'most_mac_phy_errors_2_4ghz' => [], // Most MAC/PHY errors (2.4 GHz)
            'most_mac_phy_errors_5ghz' => [], // Most MAC/PHY errors (5 GHz)
            'most_noise_2_4ghz' => [], // Most noise (2.4 GHz)
            'most_noise_5ghz' => [], // Most noise (5 GHz)
            'most_tx_power_changes_2_4ghz' => [], // Most transmit power changes (2.4 GHz)
            'most_tx_power_changes_5ghz' => [], // Most transmit power changes (5 GHz)
            'most_utilized_2_4ghz' => [], // Most utilized by channel usage (2.4 GHz)
            'most_utilized_5ghz' => [], // Most utilized by channel usage (5 GHz)
            'problem_radios_2_4ghz' => [], // Problem 2.4 GHz radios
            'problem_radios_5ghz' => [], // Problem 5 GHz radios
            'radios_least_goodput' => [], // Radios with least goodput
        ]);
    }
    
    /**
     * Generate custom report based on custom report configuration
     */
    private function generateCustomReport($branchId, $start, $end, $categories, $managedBy, $customReport)
    {
        // For now, generate comprehensive report for custom reports
        // In the future, this can be customized based on customReport->included_fields and included_metrics
        return $this->generateComprehensiveReport($branchId, $start, $end, $categories, $managedBy);
    }
    
    /**
     * Calculate summary statistics from report data
     */
    private function calculateSummaryStats($reportData, $reportType)
    {
        $stats = [
            'total_devices' => 0,
            'avg_uptime' => 0,
            'avg_sla' => 0,
            'total_incidents' => 0,
            'devices_online' => 0,
            'devices_offline' => 0,
            'devices_warning' => 0,
            'total_downtime_minutes' => 0,
            'avg_downtime_minutes' => 0,
            'sla_compliant_devices' => 0,
            'sla_violations' => 0,
            'incidents_by_type' => [],
            'devices_by_category' => [],
        ];
        
        if (is_object($reportData) && method_exists($reportData, 'getData')) {
            $data = $reportData->getData(true);
        } else {
            $data = $reportData;
        }
        
        if ($reportType === 'comprehensive' || (isset($data['uptime']) && isset($data['sla']) && isset($data['incidents']))) {
            // Comprehensive report
            $uptimeData = $data['uptime']['devices'] ?? [];
            $slaData = $data['sla']['devices'] ?? [];
            $incidentsData = $data['incidents']['events'] ?? [];
            
            $stats['total_devices'] = count($uptimeData);
            $stats['total_incidents'] = count($incidentsData);
            
            if (count($uptimeData) > 0) {
                $totalUptime = 0;
                foreach ($uptimeData as $device) {
                    // Uptime can be 'uptime' or 'uptime_percentage'
                    $uptime = $device['uptime'] ?? $device['uptime_percentage'] ?? 0;
                    $totalUptime += $uptime;
                }
                $stats['avg_uptime'] = round($totalUptime / count($uptimeData), 2);
                
                // Count devices by status
                foreach ($uptimeData as $device) {
                    $status = strtolower($device['status'] ?? 'unknown');
                    if ($status === 'online') {
                        $stats['devices_online']++;
                    } elseif (in_array($status, ['offline', 'offline_ack'])) {
                        $stats['devices_offline']++;
                    } elseif ($status === 'warning') {
                        $stats['devices_warning']++;
                    }
                    
                    // Count by category
                    $category = $device['category'] ?? 'unknown';
                    if (!isset($stats['devices_by_category'][$category])) {
                        $stats['devices_by_category'][$category] = 0;
                    }
                    $stats['devices_by_category'][$category]++;
                }
            }
            
            if (count($slaData) > 0) {
                // SLA can be 'sla_compliance' or 'actual_uptime'
                $totalSla = 0;
                foreach ($slaData as $device) {
                    $sla = $device['sla_compliance'] ?? $device['actual_uptime'] ?? 0;
                    $totalSla += $sla;
                }
                $stats['avg_sla'] = round($totalSla / count($slaData), 2);
                
                $totalViolations = array_sum(array_column($slaData, 'sla_violations'));
                $stats['sla_violations'] = $totalViolations;
                
                foreach ($slaData as $device) {
                    $sla = $device['sla_compliance'] ?? $device['actual_uptime'] ?? 0;
                    if ($sla >= 99) {
                        $stats['sla_compliant_devices']++;
                    }
                }
            }
            
            // Count incidents by type
            foreach ($incidentsData as $incident) {
                $type = $incident['eventType'] ?? 'unknown';
                if (!isset($stats['incidents_by_type'][$type])) {
                    $stats['incidents_by_type'][$type] = 0;
                }
                $stats['incidents_by_type'][$type]++;
            }
        } elseif (isset($data['devices']) && is_array($data['devices'])) {
            // Single report type (uptime or SLA)
            $devices = $data['devices'];
            $stats['total_devices'] = count($devices);
            
            if (count($devices) > 0) {
                if (isset($devices[0]['uptime']) || isset($devices[0]['uptime_percentage'])) {
                    // Uptime report
                    $totalUptime = 0;
                    foreach ($devices as $device) {
                        $uptime = $device['uptime'] ?? $device['uptime_percentage'] ?? 0;
                        $totalUptime += $uptime;
                    }
                    $stats['avg_uptime'] = round($totalUptime / count($devices), 2);
                    
                    // Count devices by status
                    foreach ($devices as $device) {
                        $status = strtolower($device['status'] ?? 'unknown');
                        if ($status === 'online') {
                            $stats['devices_online']++;
                        } elseif (in_array($status, ['offline', 'offline_ack'])) {
                            $stats['devices_offline']++;
                        } elseif ($status === 'warning') {
                            $stats['devices_warning']++;
                        }
                        
                        // Count by category
                        $category = $device['category'] ?? 'unknown';
                        if (!isset($stats['devices_by_category'][$category])) {
                            $stats['devices_by_category'][$category] = 0;
                        }
                        $stats['devices_by_category'][$category]++;
                    }
                }
                
                if (isset($devices[0]['sla_compliance']) || isset($devices[0]['actual_uptime'])) {
                    // SLA report
                    $totalSla = 0;
                    foreach ($devices as $device) {
                        $sla = $device['sla_compliance'] ?? $device['actual_uptime'] ?? 0;
                        $totalSla += $sla;
                    }
                    $stats['avg_sla'] = round($totalSla / count($devices), 2);
                    
                    $totalViolations = array_sum(array_column($devices, 'sla_violations'));
                    $stats['sla_violations'] = $totalViolations;
                    
                    foreach ($devices as $device) {
                        $sla = $device['sla_compliance'] ?? $device['actual_uptime'] ?? 0;
                        if ($sla >= 99) {
                            $stats['sla_compliant_devices']++;
                        }
                    }
                }
            }
        } elseif (isset($data['events']) && is_array($data['events'])) {
            // Incident report
            $stats['total_incidents'] = count($data['events']);
            
            // Count incidents by type
            foreach ($data['events'] as $incident) {
                $type = $incident['eventType'] ?? 'unknown';
                if (!isset($stats['incidents_by_type'][$type])) {
                    $stats['incidents_by_type'][$type] = 0;
                }
                $stats['incidents_by_type'][$type]++;
            }
        } elseif ($reportType === 'client_session') {
            // Client session report - calculate stats from session data
            $totalSessions = 0;
            $totalClients = 0;
            $totalBytes = 0;
            
            // Aggregate from all session data types
            $sessionTypes = ['by_ssid', 'by_vlan', 'by_cipher', 'by_connection_mode', 'by_role'];
            foreach ($sessionTypes as $type) {
                if (isset($data[$type]) && is_array($data[$type])) {
                    foreach ($data[$type] as $item) {
                        $totalSessions += $item['Sessions'] ?? $item['sessions'] ?? 0;
                        $totalClients += $item['Clients'] ?? $item['clients'] ?? 0;
                        $totalBytes += floatval(str_replace(['MB', ' ', ','], '', $item['Bytes Used (MB)'] ?? $item['bytes_used_mb'] ?? '0'));
                    }
                }
            }
            
            $stats['total_sessions'] = $totalSessions;
            $stats['total_clients'] = $totalClients;
            $stats['total_bytes_mb'] = round($totalBytes, 2);
        } elseif ($reportType === 'device_summary') {
            // Device summary report - calculate stats from utilization data
            $totalDevices = 0;
            $totalMaxClients = 0;
            $totalUniqueClients = 0;
            $totalDataMB = 0;
            
            // Aggregate from all device summary data types
            $summaryTypes = ['most_utilized_by_max_clients', 'most_utilized_by_usage', 'least_utilized_by_max_clients', 'least_utilized_by_usage'];
            foreach ($summaryTypes as $type) {
                if (isset($data[$type]) && is_array($data[$type])) {
                    foreach ($data[$type] as $item) {
                        $totalDevices++;
                        $totalMaxClients += intval($item['Max Clients'] ?? $item['max_clients'] ?? 0);
                        $totalUniqueClients += intval($item['Unique Clients'] ?? $item['unique_clients'] ?? 0);
                        $dataValue = $item['Total Data'] ?? $item['total_data'] ?? '0 MB';
                        $totalDataMB += floatval(str_replace(['MB', 'GB', 'TB', ' ', ','], '', $dataValue));
                    }
                }
            }
            
            $stats['total_devices_analyzed'] = $totalDevices;
            $stats['total_max_clients'] = $totalMaxClients;
            $stats['total_unique_clients'] = $totalUniqueClients;
            $stats['total_data_mb'] = round($totalDataMB, 2);
        } elseif ($reportType === 'rf_health') {
            // RF Health report - calculate stats from RF health data
            $totalProblemRadios = 0;
            $totalChannelChanges = 0;
            $totalMACErrors = 0;
            $totalPHYErrors = 0;
            
            // Aggregate from problem radios
            $problemTypes = ['problem_radios_2_4ghz', 'problem_radios_5ghz'];
            foreach ($problemTypes as $type) {
                if (isset($data[$type]) && is_array($data[$type])) {
                    $totalProblemRadios += count($data[$type]);
                    foreach ($data[$type] as $radio) {
                        $totalChannelChanges += intval($radio['Channel Changes'] ?? $radio['channel_changes'] ?? 0);
                        $totalMACErrors += floatval($radio['MAC Errors (%)'] ?? $radio['mac_errors'] ?? 0);
                        $totalPHYErrors += floatval($radio['PHY Errors (%)'] ?? $radio['phy_errors'] ?? 0);
                    }
                }
            }
            
            $stats['total_problem_radios'] = $totalProblemRadios;
            $stats['total_channel_changes'] = $totalChannelChanges;
            $stats['avg_mac_errors'] = $totalProblemRadios > 0 ? round($totalMACErrors / $totalProblemRadios, 2) : 0;
            $stats['avg_phy_errors'] = $totalProblemRadios > 0 ? round($totalPHYErrors / $totalProblemRadios, 2) : 0;
        }
        
        return $stats;
    }
    
    /**
     * List report history
     */
    public function listReportHistory(Request $request)
    {
        $branchId = $request->input('branch_id');
        $limit = $request->input('limit', 50);
        
        $query = ReportHistory::with(['user', 'branch', 'managedByUser'])
            ->where('branch_id', $branchId)
            ->orderBy('created_at', 'desc')
            ->limit($limit);
        
        return response()->json($query->get());
    }
    
    /**
     * Download report from history
     */
    public function downloadReportHistory($id)
    {
        $report = ReportHistory::findOrFail($id);
        
        if (!file_exists($report->file_path)) {
            return response()->json(['error' => 'Report file not found'], 404);
        }
        
        return response()->download($report->file_path, basename($report->file_path), [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }
    
    /**
     * Delete report from history
     */
    public function deleteReportHistory($id)
    {
        $report = ReportHistory::findOrFail($id);
        
        // Delete file if exists
        if (file_exists($report->file_path)) {
            @unlink($report->file_path);
        }
        
        $report->delete();
        
        return response()->json(['message' => 'Report deleted successfully']);
    }
    
    /**
     * List custom reports
     */
    public function listCustomReports(Request $request)
    {
        $branchId = $request->input('branch_id');
        
        $customReports = CustomReport::where('branch_id', $branchId)
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json($customReports);
    }
    
    /**
     * Store custom report
     */
    public function storeCustomReport(Request $request)
    {
        $request->validate([
            'branch_id' => 'required|exists:branches,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'included_fields' => 'nullable|array',
            'included_metrics' => 'nullable|array',
            'filters' => 'nullable|array',
            'summary_config' => 'nullable|array',
        ]);
        
        // Get user ID with fallback
        $userId = Auth::id() ?? $request->user()?->id;
        if (!$userId) {
            $userId = auth()->id() ?? session('user_id');
        }
        if (!$userId) {
            $adminUser = User::where('role', 'admin')->first();
            if ($adminUser) {
                $userId = $adminUser->id;
            } else {
                $anyUser = User::first();
                $userId = $anyUser?->id;
            }
        }
        
        if (!$userId) {
            return response()->json(['error' => 'Unable to determine user. Please ensure you are logged in.'], 400);
        }
        
        $customReport = CustomReport::create([
            'branch_id' => $request->branch_id,
            'user_id' => $userId,
            'name' => $request->name,
            'description' => $request->description,
            'report_type' => 'custom',
            'categories' => $request->filters['categories'] ?? [],
            'managed_by' => $request->filters['managed_by'] ?? null,
        ]);
        
        // Store additional fields in JSON columns if they exist
        if ($request->has('included_fields')) {
            $customReport->included_fields = $request->included_fields;
        }
        if ($request->has('included_metrics')) {
            $customReport->included_metrics = $request->included_metrics;
        }
        if ($request->has('filters')) {
            $customReport->filters = $request->filters;
        }
        if ($request->has('summary_config')) {
            $customReport->summary_config = $request->summary_config;
        }
        $customReport->save();
        
        return response()->json($customReport);
    }
    
    /**
     * Show custom report
     */
    public function showCustomReport($id)
    {
        $customReport = CustomReport::findOrFail($id);
        return response()->json($customReport);
    }
    
    /**
     * Update custom report
     */
    public function updateCustomReport(Request $request, $id)
    {
        $customReport = CustomReport::findOrFail($id);
        
        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'included_fields' => 'nullable|array',
            'included_metrics' => 'nullable|array',
            'filters' => 'nullable|array',
            'summary_config' => 'nullable|array',
        ]);
        
        $updateData = [
            'name' => $request->input('name', $customReport->name),
            'description' => $request->input('description', $customReport->description),
        ];
        
        // Update categories and managed_by from filters if provided
        if ($request->has('filters')) {
            if (isset($request->filters['categories'])) {
                $updateData['categories'] = $request->filters['categories'];
            }
            if (isset($request->filters['managed_by'])) {
                $updateData['managed_by'] = $request->filters['managed_by'];
            }
        }
        
        $customReport->update($updateData);
        
        if ($request->has('included_fields')) {
            $customReport->included_fields = $request->included_fields;
        }
        if ($request->has('included_metrics')) {
            $customReport->included_metrics = $request->included_metrics;
        }
        if ($request->has('filters')) {
            $customReport->filters = $request->filters;
        }
        if ($request->has('summary_config')) {
            $customReport->summary_config = $request->summary_config;
        }
        $customReport->save();
        
        return response()->json($customReport);
    }
    
    /**
     * Delete custom report
     */
    public function deleteCustomReport($id)
    {
        $customReport = CustomReport::findOrFail($id);
        $customReport->delete();
        
        return response()->json(['message' => 'Custom report deleted successfully']);
    }
    
    /**
     * Convert memory limit string to bytes
     */
    private function convertToBytes(string $memoryLimit): int
    {
        $memoryLimit = trim($memoryLimit);
        if (empty($memoryLimit) || $memoryLimit === '-1') {
            return PHP_INT_MAX; // Unlimited
        }
        
        $last = strtolower($memoryLimit[strlen($memoryLimit) - 1]);
        $value = (int) $memoryLimit;
        
        switch ($last) {
            case 'g':
                $value *= 1024;
                // fall through
            case 'm':
                $value *= 1024;
                // fall through
            case 'k':
                $value *= 1024;
        }
        
        return $value;
    }
    
    /**
     * Convert bytes to memory limit string (e.g., "512M")
     */
    private function bytesToMemoryString(int $bytes): string
    {
        if ($bytes >= 1024 * 1024 * 1024) {
            return round($bytes / (1024 * 1024 * 1024)) . 'G';
        } elseif ($bytes >= 1024 * 1024) {
            return round($bytes / (1024 * 1024)) . 'M';
        } elseif ($bytes >= 1024) {
            return round($bytes / 1024) . 'K';
        }
        return (string) $bytes;
    }
}
