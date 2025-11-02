<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Device;
use App\Models\Branch;
use App\Models\Alert;
use App\Models\MonitoringHistory;

class DeviceSeeder extends Seeder
{
    public function run(): void
    {
        $mainBranch = Branch::where('code', 'MAIN')->first();
        
        if (!$mainBranch) {
            $this->command->error('Main branch not found. Please run BranchSeeder first.');
            return;
        }

        $devices = [
            [
                'branch_id' => $mainBranch->id,
                'name' => 'Core Switch 1',
                'ip_address' => '192.168.1.1',
                'mac_address' => '00:1A:2B:3C:4D:01',
                'barcode' => 'SW000001',
                'category' => 'switch',
                'status' => 'offline',
                'building' => 'Blok ABC',
                'brand' => 'Cisco',
                'model' => 'Catalyst 9300',
                'uptime_percentage' => 99.95,
                'response_time' => 2,
                'last_ping' => now()
            ]
        ];

        foreach ($devices as $deviceData) {
            $device = Device::create($deviceData);

            // Create monitoring history
            if (class_exists('App\Models\MonitoringHistory')) {
                MonitoringHistory::create([
                    'device_id' => $device->id,
                    'status' => $device->status === 'offline_ack' ? 'offline' : $device->status,
                    'response_time' => $device->response_time,
                    'checked_at' => now(),
                ]);
            }
        }

        $this->command->info('Devices seeded successfully!');
    }
}