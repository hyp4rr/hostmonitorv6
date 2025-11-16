<?php

namespace App\Jobs;

use App\Models\Device;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class PingDeviceBatchJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     *
     * @var int
     */
    public $tries = 2;

    /**
     * The number of seconds the job can run before timing out.
     *
     * @var int
     */
    public $timeout = 300; // 5 minutes per batch

    /**
     * Device IDs to ping in this batch
     *
     * @var array
     */
    protected $deviceIds;

    /**
     * Warning threshold in milliseconds (devices responding slower than this will be marked as warning)
     *
     * @var int
     */
    protected $warningThreshold = 1000; // 1 second

    /**
     * Create a new job instance.
     */
    public function __construct(array $deviceIds, int $warningThreshold = 1000)
    {
        $this->deviceIds = $deviceIds;
        $this->warningThreshold = $warningThreshold;
        $this->onQueue('ping'); // Use dedicated ping queue
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            $startTime = microtime(true);
            
            // Get devices for this batch
            $devices = Device::whereIn('id', $this->deviceIds)
                ->where('is_active', true)
                ->get();
            
            if ($devices->isEmpty()) {
                Log::info("PingDeviceBatchJob: No devices found for batch");
                return;
            }

            $pingTimeout = 2000; // 2 seconds timeout per device (kept for accuracy)
            $onlineCount = 0;
            $offlineCount = 0;
            $warningCount = 0;
            $errorCount = 0;
            
            // Process devices in parallel
            $processes = [];
            $deviceMap = [];
            
            // Start all ping processes in parallel
            foreach ($devices as $device) {
                $ip = escapeshellarg($device->ip_address);
                $deviceMap[$device->id] = $device;
                
                if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
                    $pingCommand = "ping -n 2 -w {$pingTimeout} {$ip} 2>nul";
                } else {
                    $timeoutSeconds = round($pingTimeout / 1000, 1);
                    $pingCommand = "ping -c 2 -W {$timeoutSeconds} {$ip} 2>/dev/null";
                }
                
                $descriptorspec = [
                    0 => ['pipe', 'r'],
                    1 => ['pipe', 'w'],
                    2 => ['pipe', 'w']
                ];
                
                $process = @proc_open($pingCommand, $descriptorspec, $pipes);
                
                if (is_resource($process)) {
                    stream_set_blocking($pipes[1], false);
                    stream_set_blocking($pipes[2], false);
                    
                    $processes[] = [
                        'process' => $process,
                        'pipes' => $pipes,
                        'device_id' => $device->id,
                        'start_time' => microtime(true),
                    ];
                } else {
                    // Fallback to exec
                    $output = [];
                    $returnCode = 1;
                    exec($pingCommand, $output, $returnCode);
                    
                    $this->updateDeviceStatus(
                        $device,
                        $returnCode === 0,
                        $returnCode === 0 ? $this->parseResponseTime($output) : null,
                        $onlineCount,
                        $offlineCount,
                        $warningCount
                    );
                }
            }
            
            // Wait for all processes to complete
            $maxWaitTime = 2.5; // 2.5 seconds max wait (optimized for speed)
            $startWait = microtime(true);
            
            while (!empty($processes) && (microtime(true) - $startWait) < $maxWaitTime) {
                foreach ($processes as $key => $proc) {
                    $status = proc_get_status($proc['process']);
                    
                    if (!$status['running']) {
                        $device = $deviceMap[$proc['device_id']];
                        $output = stream_get_contents($proc['pipes'][1]);
                        
                        fclose($proc['pipes'][0]);
                        fclose($proc['pipes'][1]);
                        fclose($proc['pipes'][2]);
                        proc_close($proc['process']);
                        
                        $returnCode = $status['exitcode'];
                        $isOnline = ($returnCode === 0);
                        $responseTime = null;
                        
                        if ($isOnline) {
                            $responseTime = $this->parseResponseTime(explode("\n", $output));
                            $processDuration = (microtime(true) - $proc['start_time']) * 1000;
                            
                            // Use process duration if we couldn't parse response time
                            if ($responseTime === null) {
                                $responseTime = round($processDuration, 2);
                            }
                        }
                        
                        $this->updateDeviceStatus(
                            $device,
                            $isOnline,
                            $responseTime,
                            $onlineCount,
                            $offlineCount,
                            $warningCount
                        );
                        
                        unset($processes[$key]);
                    }
                }
                
                if (!empty($processes)) {
                    usleep(10000); // 10ms
                }
            }
            
            // Clean up remaining processes
            foreach ($processes as $proc) {
                proc_terminate($proc['process']);
                fclose($proc['pipes'][0]);
                fclose($proc['pipes'][1]);
                fclose($proc['pipes'][2]);
                proc_close($proc['process']);
                
                $device = $deviceMap[$proc['device_id']];
                $this->updateDeviceStatus(
                    $device,
                    false,
                    null,
                    $onlineCount,
                    $offlineCount,
                    $warningCount
                );
            }
            
            $duration = round((microtime(true) - $startTime) * 1000, 2);
            
            Log::info("PingDeviceBatchJob: Completed batch", [
                'devices' => $devices->count(),
                'online' => $onlineCount,
                'offline' => $offlineCount,
                'warning' => $warningCount,
                'duration' => $duration . 'ms'
            ]);
            
        } catch (\Exception $e) {
            Log::error("PingDeviceBatchJob failed: " . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    /**
     * Update device status based on ping result
     */
    protected function updateDeviceStatus($device, $isOnline, $responseTime, &$onlineCount, &$offlineCount, &$warningCount)
    {
        try {
            $previousStatus = $device->status;
            $newStatus = 'offline';
            
            if ($isOnline && $responseTime !== null) {
                // Device responded - check if it's slow (warning) or fast (online)
                if ($responseTime > $this->warningThreshold) {
                    $newStatus = 'warning'; // Slow response
                    $warningCount++;
                } else {
                    $newStatus = 'online'; // Fast response
                    $onlineCount++;
                }
            } else {
                // Device didn't respond
                $newStatus = 'offline';
                $offlineCount++;
            }
            
            $updateFields = [
                'status' => $newStatus,
                'response_time' => $responseTime,
                'last_ping' => now(),
            ];
            
            // Update online/offline timestamps
            if ($newStatus === 'online' || $newStatus === 'warning') {
                if ($previousStatus !== 'online' && $previousStatus !== 'warning') {
                    $updateFields['online_since'] = now();
                    $updateFields['offline_since'] = null;
                }
            } elseif ($newStatus === 'offline') {
                if ($previousStatus === 'online' || $previousStatus === 'warning') {
                    $updateFields['offline_since'] = now();
                    $updateFields['online_since'] = null;
                }
            }
            
            // Track status changes
            if ($previousStatus !== $newStatus) {
                $updateFields['previous_status'] = $previousStatus;
                $updateFields['last_status_change'] = now();
            }
            
            $device->update($updateFields);
            $device->updateUptime();
            
        } catch (\Exception $e) {
            Log::error("Failed to update device {$device->id}: " . $e->getMessage());
        }
    }

    /**
     * Parse response time from ping output
     */
    protected function parseResponseTime(array $output): ?int
    {
        $outputText = implode(' ', $output);
        if (preg_match('/time[=<](\d+)ms/i', $outputText, $matches)) {
            return (int)$matches[1];
        }
        return null;
    }
}

