<?php

namespace App\Console\Commands;

use App\Http\Controllers\Api\MonitoringController;
use App\Services\FastPingService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class PingAllDevices extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'devices:ping-all';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Ping all devices and update their status and last_ping timestamp';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting ping all devices...');
        Log::info('Starting scheduled ping all devices');

        $startTime = microtime(true);

        try {
            // Use optimized MonitoringController method with bulk updates
            $pingService = new FastPingService();
            $controller = new MonitoringController($pingService);
            
            // Call the optimized pingAllDevices method
            $response = $controller->pingAllDevices();
            $result = json_decode($response->getContent(), true);

            $duration = round((microtime(true) - $startTime) * 1000, 2);
            
            if ($result && isset($result['success']) && $result['success']) {
                $stats = $result['stats'] ?? [];
                $this->info("✅ Ping completed successfully!");
                $this->info("   Total devices: " . ($stats['total_devices'] ?? 0));
                $this->info("   Online: " . ($stats['online_devices'] ?? 0));
                $this->info("   Offline: " . ($stats['offline_devices'] ?? 0));
                $this->info("   Duration: {$stats['ping_duration']}ms");
                
                Log::info("Scheduled ping all devices completed", [
                    'duration_ms' => $duration,
                    'total_devices' => $stats['total_devices'] ?? 0,
                    'online' => $stats['online_devices'] ?? 0,
                    'offline' => $stats['offline_devices'] ?? 0
                ]);

                return Command::SUCCESS;
            } else {
                $errorMessage = $result['error'] ?? $result['message'] ?? 'Unknown error';
                $this->error('Ping failed: ' . $errorMessage);
                Log::error('Scheduled ping all devices failed: ' . $errorMessage);
                return Command::FAILURE;
            }
        } catch (\Exception $e) {
            $this->error('Failed to ping all devices: ' . $e->getMessage());
            Log::error('Failed to ping all devices: ' . $e->getMessage(), [
                'exception' => $e
            ]);

            return Command::FAILURE;
        }
    }
}

