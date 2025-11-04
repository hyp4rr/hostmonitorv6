<?php

namespace App\Services;

use App\Models\Device;
use App\Models\MonitoringHistory;
use App\Models\Alert;
use Illuminate\Support\Facades\Log;

class PingService
{
    /**
     * Ping a single device
     */
    public function pingDevice(Device $device): array
    {
        $startTime = microtime(true);
        $status = 'offline';
        $responseTime = null;
        $isReachable = false;

        try {
            // Determine OS for ping command
            $isWindows = strtoupper(substr(PHP_OS, 0, 3)) === 'WIN';
            
            // Build ping command based on OS
            if ($isWindows) {
                // Windows: ping -n 1 -w 1000 (1 packet, 1 second timeout)
                $command = sprintf('ping -n 1 -w 1000 %s', escapeshellarg($device->ip_address));
            } else {
                // Linux/Unix: ping -c 1 -W 1 (1 packet, 1 second timeout)
                $command = sprintf('ping -c 1 -W 1 %s', escapeshellarg($device->ip_address));
            }

            // Execute ping command
            exec($command, $output, $returnCode);
            
            $endTime = microtime(true);
            $responseTime = round(($endTime - $startTime) * 1000, 2); // Convert to milliseconds

            // Check if ping was successful
            if ($returnCode === 0) {
                $isReachable = true;
                $status = 'online';
                
                // Try to extract actual ping time from output
                $outputString = implode("\n", $output);
                if ($isWindows) {
                    // Windows format: "time=XXms" or "time<1ms"
                    if (preg_match('/time[=<](\d+)ms/i', $outputString, $matches)) {
                        $responseTime = (float)$matches[1];
                    }
                } else {
                    // Linux format: "time=XX.X ms"
                    if (preg_match('/time=([\d.]+)\s*ms/i', $outputString, $matches)) {
                        $responseTime = (float)$matches[1];
                    }
                }
            } else {
                $status = 'offline';
            }

        } catch (\Exception $e) {
            Log::error("Ping error for device {$device->id} ({$device->ip_address}): " . $e->getMessage());
            $status = 'offline';
            $responseTime = null;
        }

        // Update device status
        Log::info("Updating device {$device->id} ({$device->name}) - Old status: {$device->status}, New status: {$status}");
        
        $oldStatus = $device->status;
        $device->status = $status;
        $device->response_time = $responseTime;
        $device->last_ping = now();
        
        // Track offline duration
        if ($status === 'offline') {
            if ($oldStatus !== 'offline' && $oldStatus !== 'offline_ack') {
                // Just went offline, start tracking
                $device->offline_since = now();
                $device->offline_duration_minutes = 0;
                $device->offline_alert_sent = false;
            } elseif ($device->offline_since) {
                // Already offline, calculate duration
                $device->offline_duration_minutes = now()->diffInMinutes($device->offline_since);
                
                // Create alert if offline for more than 2 minutes and alert not sent yet
                if ($device->offline_duration_minutes >= 2 && !$device->offline_alert_sent) {
                    $this->createOfflineAlert($device);
                    $device->offline_alert_sent = true;
                }
            }
        } else {
            // Device is back online, reset offline tracking
            $device->offline_since = null;
            $device->offline_duration_minutes = 0;
            $device->offline_alert_sent = false;
        }
        
        $device->save();
        Log::info("Device {$device->id} saved with status: {$device->status}");

        // Log to monitoring history
        $this->logMonitoringHistory($device, $status, $responseTime);

        // Update uptime percentage
        $this->updateUptimePercentage($device);

        return [
            'device_id' => $device->id,
            'ip_address' => $device->ip_address,
            'status' => $status,
            'response_time' => $responseTime,
            'is_reachable' => $isReachable,
            'last_check' => $device->last_ping->toIso8601String(),
        ];
    }

    /**
     * Ping multiple devices
     */
    public function pingMultipleDevices(array $deviceIds): array
    {
        $results = [];
        
        foreach ($deviceIds as $deviceId) {
            $device = Device::find($deviceId);
            if ($device) {
                $results[] = $this->pingDevice($device);
            }
        }

        return $results;
    }

    /**
     * Ping all devices in a branch
     */
    public function pingBranchDevices(int $branchId): array
    {
        $devices = Device::where('branch_id', $branchId)
            ->where('is_active', true)
            ->get();

        $results = [];
        foreach ($devices as $device) {
            $results[] = $this->pingDevice($device);
        }

        return $results;
    }

    /**
     * Log monitoring history
     */
    private function logMonitoringHistory(Device $device, string $status, ?float $responseTime): void
    {
        try {
            MonitoringHistory::create([
                'device_id' => $device->id,
                'status' => $status,
                'response_time' => $responseTime,
                'checked_at' => now(),
            ]);
        } catch (\Exception $e) {
            Log::error("Failed to log monitoring history for device {$device->id}: " . $e->getMessage());
        }
    }

    /**
     * Update device uptime percentage based on recent history
     */
    private function updateUptimePercentage(Device $device): void
    {
        try {
            // Calculate uptime from last 24 hours
            $onlineCount = MonitoringHistory::where('device_id', $device->id)
                ->where('checked_at', '>=', now()->subDay())
                ->where('status', 'online')
                ->count();

            $totalCount = MonitoringHistory::where('device_id', $device->id)
                ->where('checked_at', '>=', now()->subDay())
                ->count();

            if ($totalCount > 0) {
                $uptimePercentage = round(($onlineCount / $totalCount) * 100, 2);
                $device->uptime_percentage = $uptimePercentage;
                $device->save();
            }
        } catch (\Exception $e) {
            Log::error("Failed to update uptime for device {$device->id}: " . $e->getMessage());
        }
    }

    /**
     * Create an alert for device that has been offline for more than 2 minutes
     */
    private function createOfflineAlert(Device $device): void
    {
        try {
            // Check if there's already an unresolved alert for this device
            $existingAlert = Alert::where('device_id', $device->id)
                ->where('status', 'active')
                ->where('type', 'offline')
                ->first();

            if (!$existingAlert) {
                Alert::create([
                    'device_id' => $device->id,
                    'branch_id' => $device->branch_id,
                    'type' => 'offline',
                    'severity' => 'high',
                    'title' => "Device Offline: {$device->name}",
                    'message' => "Device {$device->name} ({$device->ip_address}) has been offline for {$device->offline_duration_minutes} minutes.",
                    'status' => 'active',
                    'triggered_at' => now(),
                ]);
                
                Log::info("Created offline alert for device {$device->id} ({$device->name})");
            }
        } catch (\Exception $e) {
            Log::error("Failed to create offline alert for device {$device->id}: " . $e->getMessage());
        }
    }
}
