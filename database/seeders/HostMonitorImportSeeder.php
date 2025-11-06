<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Branch;
use App\Models\Location;
use App\Models\Device;
use App\Models\Brand;
use App\Models\Model as HardwareModel;
use App\Models\HardwareDetail;

class HostMonitorImportSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get or create UTHM Main Campus branch
        $branch = Branch::firstOrCreate(
            ['code' => 'UTHM-MAIN'],
            [
                'name' => 'UTHM Main Campus',
                'description' => 'Main Campus Parit Raja',
                'address' => 'Parit Raja, Batu Pahat, Johor',
                'latitude' => 1.8655,
                'longitude' => 103.0850,
                'is_active' => true,
            ]
        );

        // Create default location for UTHM Main Campus
        $mainLocation = Location::firstOrCreate(
            [
                'branch_id' => $branch->id,
                'name' => 'Main Campus Network'
            ],
            [
                'description' => 'Main campus network infrastructure',
                'latitude' => 1.8655,
                'longitude' => 103.0850,
            ]
        );

        // Get or create default brand and model
        $brand = Brand::firstOrCreate(['name' => 'Generic']);
        $model = HardwareModel::firstOrCreate(
            ['brand_id' => $brand->id, 'name' => 'Network Device'],
            ['description' => 'Standard network device']
        );
        
        $hardwareDetail = HardwareDetail::firstOrCreate(
            ['brand_id' => $brand->id, 'model_id' => $model->id]
        );

        // TAS Category Devices
        $tasDevices = [
            ['name' => 'A4', 'ip' => '10.8.23.155', 'status' => 'online', 'response_time' => 1],
            ['name' => 'A5', 'ip' => '10.8.27.222', 'status' => 'online', 'response_time' => 2],
            ['name' => 'BCB', 'ip' => '10.9.159.202', 'status' => 'online', 'response_time' => 14],
            ['name' => 'BENDAHARI', 'ip' => '10.60.27.205', 'status' => 'offline', 'response_time' => null],
            ['name' => 'C16', 'ip' => '10.61.27.201', 'status' => 'online', 'response_time' => 1],
            ['name' => 'D15 HEP', 'ip' => '10.60.27.204', 'status' => 'online', 'response_time' => 1],
            ['name' => 'FKAAS', 'ip' => '10.67.23.222', 'status' => 'online', 'response_time' => 1],
            ['name' => 'FKEE QA', 'ip' => '10.69.23.201', 'status' => 'online', 'response_time' => 1],
            ['name' => 'FKEE', 'ip' => '10.61.68.7', 'status' => 'online', 'response_time' => 1],
            ['name' => 'FKMP', 'ip' => '10.69.23.201', 'status' => 'online', 'response_time' => 1],
            ['name' => 'FPTP', 'ip' => '10.68.23.201', 'status' => 'offline', 'response_time' => null],
            ['name' => 'FPTV', 'ip' => '10.66.23.216', 'status' => 'online', 'response_time' => 1],
            ['name' => 'FSKTM', 'ip' => '10.65.53.158', 'status' => 'online', 'response_time' => 1],
            ['name' => 'LIBRARY', 'ip' => '10.63.23.201', 'status' => 'online', 'response_time' => 1],
            ['name' => 'MASJID', 'ip' => '10.63.47.209', 'status' => 'online', 'response_time' => 1],
            ['name' => 'PENDAFTAR', 'ip' => '10.61.24.138', 'status' => 'online', 'response_time' => 1],
            ['name' => 'PENGAWAL', 'ip' => '10.8.23.224', 'status' => 'online', 'response_time' => 2],
            ['name' => 'PERWIRA', 'ip' => '10.8.35.205', 'status' => 'online', 'response_time' => 1],
            ['name' => 'PHUI', 'ip' => '10.8.23.156', 'status' => 'online', 'response_time' => 1],
            ['name' => 'PKU', 'ip' => '10.60.27.221', 'status' => 'online', 'response_time' => 1],
            ['name' => 'PPA', 'ip' => '10.60.34.140', 'status' => 'online', 'response_time' => 2],
            ['name' => 'PPA 2', 'ip' => '10.63.47.212', 'status' => 'online', 'response_time' => 1],
            ['name' => 'PPP', 'ip' => '10.63.47.212', 'status' => 'online', 'response_time' => 1],
            ['name' => 'PPUK', 'ip' => '10.60.33.67', 'status' => 'online', 'response_time' => 2],
            ['name' => 'PUMAS', 'ip' => '10.100.10.1', 'status' => 'online', 'response_time' => 14],
            ['name' => 'SHIFT KESELAMATAN', 'ip' => '10.8.23.201', 'status' => 'online', 'response_time' => 1],
        ];

        foreach ($tasDevices as $deviceData) {
            Device::updateOrCreate(
                ['ip_address' => $deviceData['ip']],
                [
                    'branch_id' => $branch->id,
                    'location_id' => $mainLocation->id,
                    'hardware_detail_id' => $hardwareDetail->id,
                    'name' => $deviceData['name'],
                    'mac_address' => null,
                    'barcode' => 'TAS-' . str_replace('.', '', $deviceData['ip']),
                    'category' => 'switches',
                    'status' => $deviceData['status'],
                    'is_active' => true,
                    'response_time' => $deviceData['response_time'],
                    'uptime_percentage' => $deviceData['status'] === 'online' ? 99.9 : 0,
                    'last_ping' => now(),
                ]
            );
        }

        // ANPR (Auto Number Plate Recognition) Devices
        $anprDevices = [
            ['name' => 'ANPR Pos 1 Stadium 1', 'ip' => '10.8.23.225', 'status' => 'online', 'response_time' => 46],
            ['name' => 'ANPR Pos 1 Stadium 2', 'ip' => '10.8.23.226', 'status' => 'online', 'response_time' => 58],
            ['name' => 'ANPR Pos 1 Stadium 3', 'ip' => '10.8.23.227', 'status' => 'online', 'response_time' => 59],
            ['name' => 'ANPR Pos 1 Stadium 4', 'ip' => '10.8.23.228', 'status' => 'online', 'response_time' => 33],
            ['name' => 'ANPR Pos Wakaf Gate 1', 'ip' => '10.63.47.215', 'status' => 'online', 'response_time' => 1],
            ['name' => 'ANPR Pos Wakaf Gate 2', 'ip' => '10.63.47.216', 'status' => 'online', 'response_time' => 1],
        ];

        foreach ($anprDevices as $deviceData) {
            Device::updateOrCreate(
                ['ip_address' => $deviceData['ip']],
                [
                    'branch_id' => $branch->id,
                    'location_id' => $mainLocation->id,
                    'hardware_detail_id' => $hardwareDetail->id,
                    'name' => $deviceData['name'],
                    'mac_address' => null,
                    'barcode' => 'ANPR-' . str_replace('.', '', $deviceData['ip']),
                    'category' => 'cctv',
                    'status' => $deviceData['status'],
                    'is_active' => true,
                    'response_time' => $deviceData['response_time'],
                    'uptime_percentage' => $deviceData['status'] === 'online' ? 99.9 : 0,
                    'last_ping' => now(),
                ]
            );
        }

        $this->command->info('✅ HostMonitor data imported successfully!');
        $this->command->info('📊 Total TAS devices: ' . count($tasDevices));
        $this->command->info('📹 Total ANPR devices: ' . count($anprDevices));
        $this->command->info('🌐 Total devices imported: ' . (count($tasDevices) + count($anprDevices)));
    }
}
