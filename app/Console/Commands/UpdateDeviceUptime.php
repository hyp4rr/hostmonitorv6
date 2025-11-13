<?php

namespace App\Console\Commands;

use App\Models\Device;
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

        // Increment uptime for online devices (status = 'online')
        $onlineUpdated = DB::table('devices')
            ->where('status', 'online')
            ->increment('uptime_minutes', 1);

        // Reset uptime to 0 for offline devices (status = 'offline' or 'offline_ack')
        $offlineUpdated = DB::table('devices')
            ->whereIn('status', ['offline', 'offline_ack'])
            ->update(['uptime_minutes' => 0]);

        $this->info("Updated {$onlineUpdated} online devices (incremented uptime)");
        $this->info("Reset {$offlineUpdated} offline devices (uptime set to 0)");
        $this->info('Device uptime update completed.');

        return Command::SUCCESS;
    }
}
