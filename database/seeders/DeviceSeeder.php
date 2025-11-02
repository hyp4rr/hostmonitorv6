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
                'type' => 'switch',
                'category' => 'switches',
                'status' => 'online',
                'location' => 'MC Rack Server A5',
                'building' => 'Main Campus',
                'manufacturer' => 'Cisco',
                'model' => 'Catalyst 9300',
                'priority' => 1,
                'uptime_percentage' => 99.95,
                'response_time' => 2,
                'last_check' => now(),
                'latitude' => 1.8542,
                'longitude' => 103.0839,
            ],
            // ...existing code... (copy all other devices from previous DeviceSeeder)
            [
                'branch_id' => $mainBranch->id,
                'name' => 'Core Switch 2',
                'ip_address' => '192.168.1.2',
                'mac_address' => '00:1A:2B:3C:4D:02',
                'barcode' => 'SW000002',
                'type' => 'switch',
                'category' => 'switches',
                'status' => 'online',
                'location' => 'MC Rack Server C2',
                'building' => 'Main Campus',
                'manufacturer' => 'Cisco',
                'model' => 'Catalyst 9300',
                'priority' => 1,
                'uptime_percentage' => 99.92,
                'response_time' => 3,
                'last_check' => now(),
                'latitude' => 1.8543,
                'longitude' => 103.0840,
            ],
            [
                'branch_id' => $mainBranch->id,
                'name' => 'Web Server 01',
                'ip_address' => '192.168.10.10',
                'mac_address' => '00:1A:2B:3C:5D:01',
                'barcode' => 'SR000001',
                'type' => 'server',
                'category' => 'servers',
                'status' => 'online',
                'location' => 'MC Rack Server A5',
                'building' => 'Main Campus',
                'manufacturer' => 'Dell',
                'model' => 'PowerEdge R740',
                'priority' => 1,
                'uptime_percentage' => 99.99,
                'response_time' => 5,
                'last_check' => now(),
                'latitude' => 1.8542,
                'longitude' => 103.0839,
            ],
            [
                'branch_id' => $mainBranch->id,
                'name' => 'Database Server',
                'ip_address' => '192.168.10.11',
                'mac_address' => '00:1A:2B:3C:5D:02',
                'barcode' => 'SR000002',
                'type' => 'server',
                'category' => 'servers',
                'status' => 'online',
                'location' => 'MC Rack Server A5',
                'building' => 'Main Campus',
                'manufacturer' => 'HP',
                'model' => 'ProLiant DL380',
                'priority' => 1,
                'uptime_percentage' => 99.97,
                'response_time' => 4,
                'last_check' => now(),
                'latitude' => 1.8542,
                'longitude' => 103.0839,
            ],
            [
                'branch_id' => $mainBranch->id,
                'name' => 'Backup Server',
                'ip_address' => '192.168.10.12',
                'mac_address' => '00:1A:2B:3C:5D:03',
                'barcode' => 'SR000003',
                'type' => 'server',
                'category' => 'servers',
                'status' => 'offline',
                'location' => 'MC Rack Server C2',
                'building' => 'Main Campus',
                'manufacturer' => 'Dell',
                'model' => 'PowerEdge R640',
                'priority' => 2,
                'uptime_percentage' => 94.8,
                'response_time' => null,
                'last_check' => now()->subHours(2),
                'latitude' => 1.8543,
                'longitude' => 103.0840,
            ],
            [
                'branch_id' => $mainBranch->id,
                'name' => 'Access Switch Floor 3',
                'ip_address' => '192.168.3.1',
                'mac_address' => '00:1A:2B:3C:4D:08',
                'barcode' => 'SW000008',
                'type' => 'switch',
                'category' => 'switches',
                'status' => 'warning',
                'location' => 'MC Blok DEFG',
                'building' => 'Main Campus',
                'manufacturer' => 'HP',
                'model' => 'Aruba 2930F',
                'priority' => 2,
                'uptime_percentage' => 98.50,
                'response_time' => 45,
                'last_check' => now(),
                'latitude' => 1.8545,
                'longitude' => 103.0842,
            ],
            [
                'branch_id' => $mainBranch->id,
                'name' => 'WiFi Controller',
                'ip_address' => '192.168.1.10',
                'mac_address' => '00:1A:2B:3C:6D:01',
                'barcode' => 'WF000001',
                'type' => 'wifi',
                'category' => 'wifi',
                'status' => 'online',
                'location' => 'MC Rack Server A5',
                'building' => 'Main Campus',
                'manufacturer' => 'Cisco',
                'model' => 'WLC 5520',
                'priority' => 2,
                'uptime_percentage' => 99.91,
                'response_time' => 7,
                'last_check' => now(),
                'latitude' => 1.8542,
                'longitude' => 103.0839,
            ],
            [
                'branch_id' => $mainBranch->id,
                'name' => 'TAS Main Gateway',
                'ip_address' => '192.168.4.10',
                'mac_address' => '00:1A:2B:3C:7D:01',
                'barcode' => 'TAS00001',
                'type' => 'gateway',
                'category' => 'tas',
                'status' => 'online',
                'location' => 'MC HEPA.Cafe.OriccF6',
                'building' => 'Main Campus',
                'manufacturer' => 'ZKTeco',
                'model' => 'inBio460',
                'priority' => 2,
                'uptime_percentage' => 99.5,
                'response_time' => 25,
                'last_check' => now(),
                'latitude' => 1.8544,
                'longitude' => 103.0841,
            ],
            [
                'branch_id' => $mainBranch->id,
                'name' => 'CCTV NVR Main',
                'ip_address' => '192.168.5.10',
                'mac_address' => '00:1A:2B:3C:8D:01',
                'barcode' => 'CC000001',
                'type' => 'nvr',
                'category' => 'cctv',
                'status' => 'offline_ack',
                'location' => 'MC Rack Server A5',
                'building' => 'Main Campus',
                'manufacturer' => 'Hikvision',
                'model' => 'DS-7616NI-K2',
                'priority' => 2,
                'uptime_percentage' => 95.5,
                'response_time' => null,
                'last_check' => now()->subHours(1),
                'offline_reason' => 'Scheduled maintenance for firmware update',
                'offline_acknowledged_by' => 'Admin User',
                'offline_acknowledged_at' => now()->subHours(1),
                'latitude' => 1.8542,
                'longitude' => 103.0839,
            ],
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