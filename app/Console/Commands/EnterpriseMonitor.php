<?php

namespace App\Console\Commands;

use App\Services\EnterprisePingService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Redis;

class EnterpriseMonitor extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'devices:enterprise-monitor 
                            {--strategy=auto : Monitoring strategy (auto|small|medium|large|enterprise)}
                            {--workers=1 : Number of concurrent workers}
                            {--memory=512M : Memory limit per worker}
                            {--batch-size=500 : Batch size for processing}
                            {--continuous : Run continuous monitoring}
                            {--interval=60 : Interval between checks in seconds}
                            {--queue : Use queue for async processing}
                            {--notifications : Send notifications for status changes}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Enterprise-scale device monitoring for 3000+ devices';

    private $pingService;
    private $startTime;
    private $memoryLimit;

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->startTime = microtime(true);
        $this->memoryLimit = $this->option('memory');

        // Set memory limit
        ini_set('memory_limit', $this->memoryLimit);

        $this->info('🚀 Starting Enterprise Device Monitoring System');
        $this->info('==================================================');
        $this->info('Memory Limit: ' . $this->memoryLimit);
        $this->info('Workers: ' . $this->option('workers'));
        $this->info('Strategy: ' . $this->option('strategy'));
        $this->info('Batch Size: ' . $this->option('batch-size'));

        // Initialize enterprise ping service
        $this->pingService = new EnterprisePingService();
        
        if ($this->option('continuous')) {
            return $this->runContinuousMonitoring();
        } elseif ($this->option('queue')) {
            return $this->runQueueMonitoring();
        } else {
            return $this->runSingleCheck();
        }
    }

    /**
     * Run a single enterprise monitoring check
     */
    private function runSingleCheck()
    {
        $this->info('Performing enterprise-scale device check...');
        
        try {
            // Get device count and choose strategy
            $deviceCount = \App\Models\Device::where('is_active', true)->count();
            $strategy = $this->chooseStrategy($deviceCount);
            
            $this->info("Device Count: {$deviceCount}");
            $this->info("Strategy: {$strategy}");
            
            // Execute monitoring
            $result = $this->pingService->monitorAllDevices();
            
            if ($result['success']) {
                $this->displayEnterpriseResults($result, $deviceCount);
                
                // Handle notifications if enabled
                if ($this->option('notifications')) {
                    $this->handleStatusChanges($result['results']);
                }
                
                $totalDuration = round((microtime(true) - $this->startTime) * 1000, 2);
                $memoryUsed = $this->getMemoryUsage();
                
                $this->info("✅ Enterprise monitoring completed in {$totalDuration}ms");
                $this->info("📊 Memory used: {$memoryUsed}");
                
                return Command::SUCCESS;
            } else {
                $this->error('❌ Enterprise monitoring failed: ' . $result['message']);
                return Command::FAILURE;
            }
        } catch (\Exception $e) {
            $this->error('❌ Enterprise monitoring error: ' . $e->getMessage());
            Log::error('Enterprise monitoring error: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }

    /**
     * Run continuous enterprise monitoring
     */
    private function runContinuousMonitoring()
    {
        $interval = (int) $this->option('interval');
        $this->info("Starting continuous enterprise monitoring every {$interval} seconds");
        $this->info('Press Ctrl+C to stop');
        
        $checkCount = 0;
        $maxChecks = 1000; // Safety limit
        
        while ($checkCount < $maxChecks) {
            $checkCount++;
            $this->info("\n📊 Enterprise Check #" . $checkCount . ' - ' . now()->format('Y-m-d H:i:s'));
            
            // Memory cleanup between checks
            if ($checkCount % 10 === 0) {
                $this->performMemoryCleanup();
            }
            
            $result = $this->runSingleCheck();
            
            if ($result !== Command::SUCCESS) {
                $this->warn('⚠️  Check failed, waiting before retry...');
            }
            
            $this->info("⏳ Waiting {$interval} seconds until next check...");
            sleep($interval);
        }
        
        if ($checkCount >= $maxChecks) {
            $this->warn("\n⚠️  Maximum check limit reached. Restart to continue.");
        }
    }

    /**
     * Run queue-based monitoring for async processing
     */
    private function runQueueMonitoring()
    {
        $this->info('Dispatching monitoring jobs to queue...');
        
        $deviceCount = \App\Models\Device::where('is_active', true)->count();
        $batchSize = (int) $this->option('batch-size');
        $batches = ceil($deviceCount / $batchSize);
        
        $this->info("Total Devices: {$deviceCount}");
        $this->info("Batch Size: {$batchSize}");
        $this->info("Total Batches: {$batches}");
        
        // Dispatch monitoring jobs
        for ($i = 0; $i < $batches; $i++) {
            \App\Jobs\MonitorDevicesJob::dispatch($i, $batchSize)
                ->onQueue('monitoring')
                ->delay(now()->addSeconds($i * 2)); // Stagger jobs
        }
        
        $this->info("✅ Dispatched {$batches} monitoring jobs to queue");
        
        return Command::SUCCESS;
    }

    /**
     * Choose monitoring strategy based on device count
     */
    private function chooseStrategy($deviceCount)
    {
        $strategy = $this->option('strategy');
        
        if ($strategy !== 'auto') {
            return $strategy;
        }
        
        $config = config('monitoring.strategies');
        
        if ($deviceCount <= $config['small_scale']['max_devices']) {
            return 'small_scale';
        } elseif ($deviceCount <= $config['medium_scale']['max_devices']) {
            return 'medium_scale';
        } elseif ($deviceCount <= $config['large_scale']['max_devices']) {
            return 'large_scale';
        } else {
            return 'enterprise_scale';
        }
    }

    /**
     * Display enterprise monitoring results
     */
    private function displayEnterpriseResults($result, $deviceCount)
    {
        $stats = $result['stats'];
        $duration = round((microtime(true) - $this->startTime) * 1000, 2);
        
        $this->info("\n📈 Enterprise Monitoring Results:");
        $this->info("===================================");
        $this->info("Device Count: {$deviceCount}");
        $this->info("Total Checked: {$stats['total']}");
        $this->info("Online: {$stats['online']} ✅");
        $this->info("Offline: {$stats['offline']} ❌");
        $this->info("Duration: {$duration}ms");
        $this->info("Devices/Second: " . round($stats['total'] / ($duration / 1000), 2));
        
        // Performance metrics
        $memoryUsed = $this->getMemoryUsage();
        $this->info("Memory Used: {$memoryUsed}");
        
        // Show offline devices summary
        $offlineDevices = array_filter($result['results'], fn($r) => $r['status'] === 'offline');
        if (!empty($offlineDevices)) {
            $this->info("\n⚠️  Offline Devices Summary:");
            $this->info("=============================");
            $this->info("Total Offline: " . count($offlineDevices));
            
            // Show first 10 offline devices
            $offlineSample = array_slice($offlineDevices, 0, 10);
            foreach ($offlineSample as $device) {
                $this->line("❌ {$device['name']} ({$device['ip_address']})");
            }
            
            if (count($offlineDevices) > 10) {
                $this->info("... and " . (count($offlineDevices) - 10) . " more");
            }
        }
        
        // Performance analysis
        $this->info("\n🎯 Performance Analysis:");
        $this->info("========================");
        $avgTimePerDevice = round($duration / $stats['total'], 2);
        $this->info("Avg Time/Device: {$avgTimePerDevice}ms");
        
        if ($stats['total'] > 1000) {
            $this->info("Scale Performance: Excellent (1000+ devices)");
        } elseif ($stats['total'] > 100) {
            $this->info("Scale Performance: Good (100+ devices)");
        } else {
            $this->info("Scale Performance: Normal (<100 devices)");
        }
    }

    /**
     * Get current memory usage
     */
    private function getMemoryUsage()
    {
        $memoryUsage = memory_get_usage(true);
        $peakUsage = memory_get_peak_usage(true);
        
        return "Current: " . $this->formatBytes($memoryUsage) . 
               ", Peak: " . $this->formatBytes($peakUsage);
    }

    /**
     * Format bytes to human readable format
     */
    private function formatBytes($bytes)
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        
        $bytes /= (1 << (10 * $pow));
        
        return round($bytes, 2) . ' ' . $units[$pow];
    }

    /**
     * Perform memory cleanup
     */
    private function performMemoryCleanup()
    {
        $this->info("🧹 Performing memory cleanup...");
        
        // Force garbage collection
        gc_collect_cycles();
        
        // Clear Laravel cache
        Cache::flush();
        
        // Clear Redis monitoring keys (except latest)
        $redis = Redis::connection();
        $keys = $redis->keys('monitoring:*');
        foreach ($keys as $key) {
            if (!str_ends_with($key, '_latest')) {
                $redis->del($key);
            }
        }
        
        $memoryAfter = $this->getMemoryUsage();
        $this->info("✅ Memory cleanup completed. {$memoryAfter}");
    }

    /**
     * Handle status changes for enterprise scale
     */
    private function handleStatusChanges($results)
    {
        // This would integrate with your existing notification system
        // For enterprise scale, consider using queues for notifications
        $changes = $this->detectStatusChanges($results);
        
        if (!empty($changes)) {
            $this->info("\n🔔 Status Changes Detected:");
            $this->info("==========================");
            $this->info("Total Changes: " . count($changes));
            
            // Dispatch notification jobs instead of processing immediately
            foreach ($changes as $change) {
                \App\Jobs\DeviceStatusChangeJob::dispatch($change)
                    ->onQueue('notifications');
            }
            
            $this->info("✅ Dispatched " . count($changes) . " notification jobs");
        }
    }

    /**
     * Detect status changes efficiently
     */
    private function detectStatusChanges($results)
    {
        // Implementation would compare with previous cached results
        // For now, return empty array
        return [];
    }
}
