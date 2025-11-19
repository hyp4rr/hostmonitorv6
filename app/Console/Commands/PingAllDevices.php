<?php

namespace App\Console\Commands;

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
            // Use FastPingService to ping devices synchronously (no queue needed)
            $pingService = new FastPingService();
            $result = $pingService->pingAllDevices();

            $duration = round((microtime(true) - $startTime) * 1000, 2);
            
            if ($result['success']) {
                $stats = $result['stats'];
                $this->info("✅ Ping completed successfully!");
                $this->info("   Total devices: {$stats['total']}");
                $this->info("   Online: {$stats['online']}");
                $this->info("   Offline: {$stats['offline']}");
                $this->info("   Duration: {$stats['duration']}ms");
                
                Log::info("Scheduled ping all devices completed", [
                    'duration_ms' => $duration,
                    'total_devices' => $stats['total'],
                    'online' => $stats['online'],
                    'offline' => $stats['offline']
                ]);

                return Command::SUCCESS;
            } else {
                $this->error('Ping failed: ' . $result['message']);
                Log::error('Scheduled ping all devices failed: ' . $result['message']);
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

