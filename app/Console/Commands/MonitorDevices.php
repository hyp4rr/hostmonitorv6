<?php

namespace App\Console\Commands;

use App\Services\FastPingService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class MonitorDevices extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'devices:monitor 
                            {--concurrent=20 : Maximum concurrent pings}
                            {--timeout=1 : Ping timeout in seconds}
                            {--continuous : Run continuous monitoring}
                            {--interval=30 : Interval between checks in seconds}
                            {--notifications : Send notifications for status changes}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fast device monitoring with parallel pinging';

    private $pingService;
    private $previousStatuses = [];

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🚀 Starting Fast Device Monitoring System');
        $this->info('==========================================');

        // Initialize ping service with options
        $this->pingService = new FastPingService();
        
        if ($this->option('continuous')) {
            return $this->runContinuousMonitoring();
        } else {
            return $this->runSingleCheck();
        }
    }

    /**
     * Run a single monitoring check
     */
    private function runSingleCheck()
    {
        $this->info('Performing device status check...');
        
        $startTime = microtime(true);
        
        try {
            // Get previous statuses for change detection
            $this->loadPreviousStatuses();
            
            // Execute fast ping on all devices
            $result = $this->pingService->pingAllDevices();
            
            if ($result['success']) {
                $this->displayResults($result);
                
                // Check for status changes and send notifications if enabled
                if ($this->option('notifications')) {
                    $this->handleStatusChanges($result['results']);
                }
                
                $totalDuration = round((microtime(true) - $startTime) * 1000, 2);
                $this->info("✅ Monitoring completed in {$totalDuration}ms");
                
                return Command::SUCCESS;
            } else {
                $this->error('❌ Monitoring failed: ' . $result['message']);
                return Command::FAILURE;
            }
        } catch (\Exception $e) {
            $this->error('❌ Monitoring error: ' . $e->getMessage());
            Log::error('Device monitoring error: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }

    /**
     * Run continuous monitoring
     * NOTE: This function contains an intentional infinite loop that runs
     * until manually stopped with Ctrl+C. This is the designed behavior
     * for continuous monitoring operations.
     */
    private function runContinuousMonitoring()
    {
        $interval = (int) $this->option('interval');
        $this->info("Starting continuous monitoring every {$interval} seconds");
        $this->info('Press Ctrl+C to stop');
        
        $checkCount = 0;
        $maxChecks = 1000; // Safety limit: prevent truly infinite execution
        
        while ($checkCount < $maxChecks) {
            $checkCount++;
            $this->info("\n📊 Check #" . $checkCount . ' - ' . now()->format('Y-m-d H:i:s'));
            
            // Check if monitoring should continue (allows for external stop signals)
            if (!$this->shouldContinueMonitoring()) {
                $this->info("\n⏹️  Monitoring stopped by external signal");
                break;
            }
            
            $result = $this->runSingleCheck();
            
            if ($result !== Command::SUCCESS) {
                $this->warn('⚠️  Check failed, waiting before retry...');
            }
            
            $this->info("⏳ Waiting {$interval} seconds until next check...");
            
            // Wait for the specified interval
            sleep($interval);
        }
        
        if ($checkCount >= $maxChecks) {
            $this->warn("\n⚠️  Maximum check limit ({$maxChecks}) reached. Restart to continue.");
        }
    }

    /**
     * Check if monitoring should continue
     * Allows for external stop signals and graceful shutdown
     */
    private function shouldContinueMonitoring()
    {
        // Check if a stop file exists (external control)
        $stopFile = storage_path('app/monitoring.stop');
        if (file_exists($stopFile)) {
            unlink($stopFile); // Clean up the stop file
            return false;
        }
        
        // Could add other conditions here like:
        // - Check system load
        // - Check maintenance mode
        // - Check external configuration
        
        return true;
    }

    /**
     * Display monitoring results in a formatted table
     */
    private function displayResults($result)
    {
        $stats = $result['stats'];
        $results = $result['results'];
        
        $this->info("\n📈 Monitoring Results:");
        $this->info("====================");
        $this->info("Total Devices: {$stats['total']}");
        $this->info("Online: {$stats['online']} ✅");
        $this->info("Offline: {$stats['offline']} ❌");
        $this->info("Duration: {$stats['duration']}ms");
        
        if (!empty($results)) {
            $this->info("\n📋 Device Details:");
            $this->info("===================");
            
            $tableData = [];
            foreach ($results as $deviceResult) {
                $statusIcon = $deviceResult['status'] === 'online' ? '✅' : '❌';
                $responseTime = $deviceResult['response_time'] ? $deviceResult['response_time'] . 'ms' : 'N/A';
                
                $tableData[] = [
                    'name' => $deviceResult['name'],
                    'ip' => $deviceResult['ip_address'],
                    'status' => $statusIcon . ' ' . ucfirst($deviceResult['status']),
                    'response' => $responseTime,
                    'duration' => $deviceResult['duration'] . 'ms'
                ];
            }
            
            $this->table(
                ['Device Name', 'IP Address', 'Status', 'Response Time', 'Ping Duration'],
                $tableData
            );
            
            // Show offline devices separately for visibility
            $offlineDevices = array_filter($results, fn($r) => $r['status'] === 'offline');
            if (!empty($offlineDevices)) {
                $this->info("\n⚠️  Offline Devices:");
                $this->info("===================");
                foreach ($offlineDevices as $device) {
                    $this->line("❌ {$device['name']} ({$device['ip_address']})");
                }
            }
        }
    }

    /**
     * Load previous device statuses for change detection
     */
    private function loadPreviousStatuses()
    {
        $devices = \App\Models\Device::where('is_active', true)
            ->pluck('status', 'id')
            ->toArray();
        
        $this->previousStatuses = $devices;
    }

    /**
     * Handle status changes and trigger notifications
     */
    private function handleStatusChanges($results)
    {
        $changes = [];
        
        foreach ($results as $result) {
            $deviceId = $result['device_id'];
            $newStatus = $result['status'];
            $previousStatus = $this->previousStatuses[$deviceId] ?? 'unknown';
            
            if ($previousStatus !== $newStatus && $previousStatus !== 'unknown') {
                $changes[] = [
                    'device_id' => $deviceId,
                    'device_name' => $result['name'],
                    'ip_address' => $result['ip_address'],
                    'previous_status' => $previousStatus,
                    'new_status' => $newStatus,
                    'timestamp' => $result['timestamp']
                ];
            }
        }
        
        if (!empty($changes)) {
            $this->info("\n🔔 Status Changes Detected:");
            $this->info("==========================");
            
            foreach ($changes as $change) {
                $icon = $change['new_status'] === 'online' ? '🟢' : '🔴';
                $this->line("{$icon} {$change['device_name']} ({$change['ip_address']})");
                $this->line("   {$change['previous_status']} → {$change['new_status']}");
                
                // Log the status change
                Log::info("Device status changed", [
                    'device_id' => $change['device_id'],
                    'device_name' => $change['device_name'],
                    'ip_address' => $change['ip_address'],
                    'previous_status' => $change['previous_status'],
                    'new_status' => $change['new_status'],
                    'timestamp' => $change['timestamp']
                ]);
            }
            
            // Here you could trigger email notifications, SMS, etc.
            // $this->sendStatusChangeNotifications($changes);
        }
    }

    /**
     * Get monitoring statistics
     */
    public function getStats()
    {
        return $this->pingService->getLatestStats();
    }

    /**
     * Get latest monitoring results
     */
    public function getResults()
    {
        return $this->pingService->getLatestResults();
    }
}
