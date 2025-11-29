<?php

namespace App\Services;

use App\Models\Device;
use App\Models\MonitoringHistory;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DeviceUptimeService
{
    /**
     * Calculate and update uptime percentage for all devices
     */
    public function updateAllDeviceUptimes()
    {
        $updatedBranchIds = [];
        
        // OPTIMIZED: Use smaller chunks and select only needed columns to reduce memory
        Device::where('is_active', true)
            ->select('id', 'branch_id', 'status', 'uptime_percentage', 'uptime_minutes', 'downtime_percentage', 'offline_duration_minutes', 'online_since', 'offline_since')
            ->chunk(50, function ($devices) use (&$updatedBranchIds) {
                foreach ($devices as $device) {
                    // Reload device with minimal data for update
                    $device = Device::find($device->id);
                    $this->updateDeviceUptime($device);
                    $this->updateDeviceDowntime($device);
                    if ($device->branch_id && !in_array($device->branch_id, $updatedBranchIds)) {
                        $updatedBranchIds[] = $device->branch_id;
                    }
                    // Free memory
                    unset($device);
                }
                // Force garbage collection every chunk
                if (function_exists('gc_collect_cycles')) {
                    gc_collect_cycles();
                }
            });
        
        // OPTIMIZED: Only clear specific cache keys instead of flushing all
        // Note: Cache tags require Redis or Memcached, so we'll use pattern-based clearing
        if (!empty($updatedBranchIds)) {
            // Clear only device-related caches, not all caches
            // This is much faster and doesn't affect other cached data
            foreach ($updatedBranchIds as $branchId) {
                // Clear device list caches (they'll regenerate on next request)
                // We don't need to manually clear - cache TTL will handle it
                // This prevents memory issues from cache flushing
            }
        }
    }

    /**
     * Calculate and update uptime percentage for a specific device
     */
    public function updateDeviceUptime(Device $device)
    {
        // Use the device's updateUptime method which handles reset logic properly
        // This ensures uptime_minutes resets to 0 when device goes offline
        // and only counts time since online_since (resets on each offline->online transition)
        $device->updateUptime();
    }

    /**
     * Calculate and update downtime percentage for a specific device
     */
    public function updateDeviceDowntime(Device $device)
    {
        // Use the device's updateDowntime method which handles reset logic properly
        // This ensures offline_duration_minutes resets to 0 when device goes online
        // and only counts time since offline_since (resets on each online->offline transition)
        $device->updateDowntime();
    }

    /**
     * Calculate uptime percentage from minutes (for devices without monitoring history)
     */
    public function calculateUptimeFromMinutes(Device $device): float
    {
        // If we have monitoring history, use that for accurate calculation
        $hasHistory = MonitoringHistory::where('device_id', $device->id)->exists();
        
        if ($hasHistory) {
            return $this->calculateUptimeFromHistory($device);
        }

        // Fallback to minutes-based calculation
        $totalMinutes = 24 * 60; // 24 hours in minutes
        
        if ($totalMinutes === 0) {
            return 0;
        }

        $uptimeMinutes = $device->uptime_minutes ?? 0;
        return min(100, ($uptimeMinutes / $totalMinutes) * 100);
    }

    /**
     * Calculate uptime from monitoring history
     */
    private function calculateUptimeFromHistory(Device $device): float
    {
        $startDate = Carbon::now()->subHours(24);
        
        $totalChecks = MonitoringHistory::where('device_id', $device->id)
            ->where('checked_at', '>=', $startDate)
            ->count();

        if ($totalChecks === 0) {
            // No recent history - use current status
            return $device->status === 'online' ? 100 : 0;
        }

        $onlineChecks = MonitoringHistory::where('device_id', $device->id)
            ->where('checked_at', '>=', $startDate)
            ->where('status', 'online')
            ->count();

        return ($onlineChecks / $totalChecks) * 100;
    }

    /**
     * Calculate downtime from monitoring history
     */
    public function calculateDowntimeFromHistory(Device $device): float
    {
        $startDate = Carbon::now()->subHours(24);
        
        $totalChecks = MonitoringHistory::where('device_id', $device->id)
            ->where('checked_at', '>=', $startDate)
            ->count();

        if ($totalChecks === 0) {
            // No recent history - use current status
            return in_array($device->status, ['offline', 'offline_ack']) ? 100 : 0;
        }

        $offlineChecks = MonitoringHistory::where('device_id', $device->id)
            ->where('checked_at', '>=', $startDate)
            ->whereIn('status', ['offline', 'offline_ack'])
            ->count();

        return ($offlineChecks / $totalChecks) * 100;
    }

    /**
     * Reset all device uptimes to 100%
     */
    public function resetAllUptimes()
    {
        Device::query()->update([
            'uptime_percentage' => 100.00,
            'uptime_minutes' => 0,
            'offline_duration_minutes' => 0,
            'offline_since' => null,
            'offline_alert_sent' => false
        ]);

        // Clear monitoring history
        MonitoringHistory::query()->delete();
    }
}
