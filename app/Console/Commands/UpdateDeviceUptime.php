<?php

namespace App\Console\Commands;

use App\Models\Device;
use App\Services\DeviceUptimeService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

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
    protected $description = 'Update device uptime minutes - increment for online devices, reset to 0 for offline devices';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Updating device uptime...');

        $uptimeService = new DeviceUptimeService();
        
        // Update all device uptimes using the service
        $uptimeService->updateAllDeviceUptimes();

        $this->info('Device uptime update completed with proper percentage calculations.');

        return Command::SUCCESS;
    }
}
