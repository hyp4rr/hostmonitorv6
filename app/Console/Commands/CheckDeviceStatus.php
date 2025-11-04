<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Device;

class CheckDeviceStatus extends Command
{
    protected $signature = 'devices:check-status';
    protected $description = 'Check current device statuses in database';

    public function handle()
    {
        $devices = Device::select('id', 'name', 'ip_address', 'status', 'last_ping', 'updated_at')
            ->orderBy('id')
            ->get();

        $this->info("Total devices: " . $devices->count());
        $this->newLine();

        $this->table(
            ['ID', 'Name', 'IP Address', 'Status', 'Last Ping', 'Updated At'],
            $devices->map(function ($device) {
                return [
                    $device->id,
                    $device->name,
                    $device->ip_address,
                    $device->status,
                    $device->last_ping ?? 'Never',
                    $device->updated_at,
                ];
            })
        );

        // Summary
        $this->newLine();
        $this->info("Status Summary:");
        $this->info("Online: " . $devices->where('status', 'online')->count());
        $this->info("Offline: " . $devices->where('status', 'offline')->count());
        $this->info("Other: " . $devices->whereNotIn('status', ['online', 'offline'])->count());

        return 0;
    }
}
