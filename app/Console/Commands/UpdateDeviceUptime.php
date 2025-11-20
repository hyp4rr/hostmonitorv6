<?php

namespace App\Console\Commands;

use App\Models\Device;
use App\Services\DeviceUptimeService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class UpdateDeviceUptime extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'devices:update-uptime';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update device uptime and downtime calculations - increment for online/offline devices respectively';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Updating device uptime and downtime...');
        Log::info('Starting device uptime and downtime update');

        $startTime = microtime(true);
        $uptimeService = new DeviceUptimeService();
        
        // Update all device uptimes and downtimes using the service
        $uptimeService->updateAllDeviceUptimes();

        $duration = round((microtime(true) - $startTime) * 1000, 2);
        $this->info('Device uptime and downtime update completed with proper percentage calculations.');
        
        // Log to file for scheduler visibility
        $deviceCount = Device::where('is_active', true)->count();
        Log::info("Device uptime and downtime update completed", [
            'duration_ms' => $duration,
            'devices_updated' => $deviceCount
        ]);

        return Command::SUCCESS;
    }
}
