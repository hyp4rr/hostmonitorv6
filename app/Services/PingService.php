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
        // Skip pinging acknowledged offline devices
        if ($device->status === 'offline_ack') {
            return [
                'device_id' => $device->id,
                'status' => 'offline_ack',
                'response_time' => null,
                'message' => 'Device is acknowledged as offline, skipping ping'
            ];
        }

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
        $statusChanged = ($oldStatus !== $status);
        
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
                Log::info("Device {$device->id} just went offline, starting tracking");
            } elseif ($device->offline_since) {
                // Already offline, calculate duration using absolute value
                $device->offline_duration_minutes = abs(now()->diffInMinutes($device->offline_since));
                Log::info("Device {$device->id} offline duration: {$device->offline_duration_minutes} minutes");
                
                // Create alert if offline for more than 2 minutes and alert not sent yet
                if ($device->offline_duration_minutes >= 2 && !$device->offline_alert_sent) {
                    Log::info("Creating offline alert for device {$device->id}");
                    $this->createOfflineAlert($device);
                    $device->offline_alert_sent = true;
                }
            } else {
                // offline_since is null but device is offline, set it now
                $device->offline_since = now();
                $device->offline_duration_minutes = 0;
                Log::info("Device {$device->id} offline but offline_since was null, setting now");
            }
        } else {
            // Device is back online, reset offline tracking
            $device->offline_since = null;
            $device->offline_duration_minutes = 0;
            $device->offline_alert_sent = false;
        }
        
        // Only update updated_at if status actually changed
        if ($statusChanged) {
            $device->timestamps = true; // Enable timestamps for this save
            $device->save();
            Log::info("Device {$device->id} status CHANGED from {$oldStatus} to {$status}, updated_at will be updated");
        } else {
            $device->timestamps = false; // Disable timestamps to prevent updated_at change
            $device->save();
            $device->timestamps = true; // Re-enable for future saves
            Log::info("Device {$device->id} status UNCHANGED ({$status}), updated_at will NOT be updated");
        }

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
     * Ping multiple devices (optimized with parallel execution)
     */
    public function pingMultipleDevices(array $deviceIds): array
    {
        $devices = Device::whereIn('id', $deviceIds)->get();
        
        // Use parallel pinging for better performance
        return $this->pingDevicesInParallel($devices);
    }

    /**
     * Ping all devices in a branch (optimized with parallel execution)
     */
    public function pingBranchDevices(int $branchId): array
    {
        $devices = Device::where('branch_id', $branchId)
            ->where('is_active', true)
            ->get();

        // Use parallel pinging for better performance
        return $this->pingDevicesInParallel($devices);
    }

    /**
     * Ping multiple devices in parallel for faster execution
     */
    private function pingDevicesInParallel($devices): array
    {
        $results = [];
        $processes = [];
        $deviceMap = [];
        
        $isWindows = strtoupper(substr(PHP_OS, 0, 3)) === 'WIN';
        
        // Start all ping processes in parallel
        foreach ($devices as $device) {
            // Skip acknowledged offline devices
            if ($device->status === 'offline_ack') {
                $results[] = [
                    'device_id' => $device->id,
                    'status' => 'offline_ack',
                    'response_time' => null,
                    'message' => 'Device is acknowledged as offline, skipping ping'
                ];
                continue;
            }
            
            $startTime = microtime(true);
            
            // Build ping command with shorter timeout for speed
            if ($isWindows) {
                $command = sprintf('ping -n 1 -w 500 %s 2>&1', escapeshellarg($device->ip_address));
            } else {
                $command = sprintf('ping -c 1 -W 1 %s 2>&1', escapeshellarg($device->ip_address));
            }
            
            // Start process in background
            $descriptors = [
                0 => ['pipe', 'r'],
                1 => ['pipe', 'w'],
                2 => ['pipe', 'w']
            ];
            
            $process = proc_open($command, $descriptors, $pipes);
            
            if (is_resource($process)) {
                // Set non-blocking mode for faster reading
                stream_set_blocking($pipes[1], false);
                stream_set_blocking($pipes[2], false);
                
                $processes[] = [
                    'process' => $process,
                    'pipes' => $pipes,
                    'device' => $device,
                    'start_time' => $startTime
                ];
                
                $deviceMap[$device->id] = count($processes) - 1;
            }
        }
        
        // Collect results from all processes
        foreach ($processes as $procData) {
            $output = stream_get_contents($procData['pipes'][1]);
            fclose($procData['pipes'][0]);
            fclose($procData['pipes'][1]);
            fclose($procData['pipes'][2]);
            
            $returnCode = proc_close($procData['process']);
            $device = $procData['device'];
            $endTime = microtime(true);
            
            $responseTime = round(($endTime - $procData['start_time']) * 1000, 2);
            $status = 'offline';
            
            if ($returnCode === 0) {
                $status = 'online';
                
                // Extract actual ping time
                if ($isWindows) {
                    if (preg_match('/time[=<](\d+)ms/i', $output, $matches)) {
                        $responseTime = (float)$matches[1];
                    }
                } else {
                    if (preg_match('/time=([\d.]+)\s*ms/i', $output, $matches)) {
                        $responseTime = (float)$matches[1];
                    }
                }
            }
            
            // Update device status
            $oldStatus = $device->status;
            $device->status = $status;
            $device->response_time = $responseTime;
            $device->last_ping = now();
            
            // Track offline duration
            if ($status === 'offline') {
                if ($oldStatus !== 'offline' && $oldStatus !== 'offline_ack') {
                    $device->offline_since = now();
                    $device->offline_duration_minutes = 0;
                    $device->offline_alert_sent = false;
                } elseif ($device->offline_since) {
                    $device->offline_duration_minutes = abs(now()->diffInMinutes($device->offline_since));
                    
                    // Create alert if offline for more than 2 minutes
                    if ($device->offline_duration_minutes >= 2 && !$device->offline_alert_sent) {
                        $this->createOfflineAlert($device);
                        $device->offline_alert_sent = true;
                    }
                }
            } else {
                // Device is back online
                if ($oldStatus === 'offline' || $oldStatus === 'offline_ack') {
                    $device->offline_since = null;
                    $device->offline_duration_minutes = null;
                    $device->offline_alert_sent = false;
                }
            }
            
            $device->save();
            
            // Log monitoring history
            $this->logMonitoringHistory($device, $status, $responseTime);
            
            // Update uptime percentage
            $this->updateUptimePercentage($device);
            
            $results[] = [
                'device_id' => $device->id,
                'status' => $status,
                'response_time' => $responseTime,
                'old_status' => $oldStatus,
                'status_changed' => ($oldStatus !== $status)
            ];
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
     * Uses a 7-day rolling window with weighted average (recent data more important)
     */
    private function updateUptimePercentage(Device $device): void
    {
        try {
            // Calculate uptime from last 7 days
            $history = MonitoringHistory::where('device_id', $device->id)
                ->where('checked_at', '>=', now()->subDays(7))
                ->orderBy('checked_at', 'desc')
                ->get();

            $totalCount = $history->count();

            if ($totalCount > 0) {
                // Use weighted average - recent pings are more important
                $weightedSum = 0;
                $totalWeight = 0;
                
                foreach ($history as $index => $record) {
                    // Weight decreases exponentially for older records
                    // Most recent = weight 1.0, oldest = weight 0.3
                    $weight = 1.0 - ($index / $totalCount) * 0.7;
                    $isOnline = $record->status === 'online' ? 1 : 0;
                    
                    $weightedSum += $isOnline * $weight;
                    $totalWeight += $weight;
                }
                
                $uptimePercentage = round(($weightedSum / $totalWeight) * 100, 2);
                
                // Ensure uptime is between 0 and 100
                $uptimePercentage = max(0, min(100, $uptimePercentage));
                
                $device->uptime_percentage = $uptimePercentage;
                $device->saveQuietly();
                
                Log::info("Updated uptime for device {$device->id}: {$uptimePercentage}% (based on {$totalCount} checks)");
            } else {
                // New device with no history - set to 100% initially
                if ($device->status === 'online') {
                    $device->uptime_percentage = 100.00;
                    $device->saveQuietly();
                }
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
                $alert = Alert::create([
                    'device_id' => $device->id,
                    'type' => 'offline',
                    'category' => $device->category,
                    'severity' => 'high',
                    'title' => "Device Offline: {$device->name}",
                    'message' => "Device {$device->name} ({$device->ip_address}) has been offline for " . round($device->offline_duration_minutes) . " minutes.",
                    'status' => 'active',
                    'triggered_at' => now(),
                ]);
                
                Log::info("Created offline alert for device {$device->id} ({$device->name}), alert ID: {$alert->id}");
            } else {
                Log::info("Alert already exists for device {$device->id}, skipping creation");
            }
        } catch (\Exception $e) {
            Log::error("Failed to create offline alert for device {$device->id}: " . $e->getMessage());
        }
    }
}
