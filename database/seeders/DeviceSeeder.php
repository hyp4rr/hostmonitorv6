<?php

namespace Database\Seeders;

use App\Models\Device;
use App\Models\Branch;
use App\Models\Location;
use App\Models\Brand;
use App\Models\HardwareModel;
use App\Models\HardwareDetail;
use Illuminate\Database\Seeder;

class DeviceSeeder extends Seeder
{
    public function run(): void
    {
        // Get all branches
        $branches = Branch::all();
        
        if ($branches->isEmpty()) {
            $this->command->warn('No branches found. Please run BranchSeeder first.');
            return;
        }

        // Create sample brands if they don't exist
        $brands = [
            ['name' => 'Cisco', 'description' => 'Leading network equipment manufacturer'],
            ['name' => 'HP', 'description' => 'Server and networking solutions'],
            ['name' => 'Ubiquiti', 'description' => 'Wireless networking equipment'],
            ['name' => 'Hikvision', 'description' => 'CCTV and surveillance systems'],
            ['name' => 'Dell', 'description' => 'Enterprise server solutions'],
        ];

        foreach ($brands as $brandData) {
            Brand::firstOrCreate(['name' => $brandData['name']], $brandData);
        }

        // Create sample models for each brand
        $brandModels = [
            'Cisco' => ['Catalyst 2960', 'Catalyst 3850', 'ASR 1000'],
            'HP' => ['ProLiant DL380', 'ProLiant DL360', 'OfficeConnect'],
            'Ubiquiti' => ['UniFi AP AC Pro', 'UniFi Dream Machine', 'EdgeRouter'],
            'Hikvision' => ['DS-2CD2043G0-I', 'DS-7608NI-I2', 'DS-2DE4425IW-DE'],
            'Dell' => ['PowerEdge R740', 'PowerEdge R640', 'PowerEdge T340'],
        ];

        foreach ($brandModels as $brandName => $models) {
            $brand = Brand::where('name', $brandName)->first();
            if ($brand) {
                foreach ($models as $modelName) {
                    HardwareModel::firstOrCreate([
                        'brand_id' => $brand->id,
                        'name' => $modelName,
                    ], [
                        'description' => "Model: {$modelName}",
                    ]);
                }
            }
        }

        // Device data grouped by branch and category
        $devicesByBranch = [
            'UTHM Kampus Parit Raja' => [
                'switches' => [
                    ['name' => 'Core Switch FPTV', 'ip' => '10.10.1.1', 'brand' => 'Cisco', 'model' => 'Catalyst 3850'],
                    ['name' => 'Access Switch FPTV-L1', 'ip' => '10.10.1.10', 'brand' => 'Cisco', 'model' => 'Catalyst 2960'],
                    ['name' => 'Access Switch FPTV-L2', 'ip' => '10.10.1.11', 'brand' => 'Cisco', 'model' => 'Catalyst 2960'],
                ],
                'servers' => [
                    ['name' => 'Mail Server', 'ip' => '10.10.2.1', 'brand' => 'HP', 'model' => 'ProLiant DL380'],
                    ['name' => 'Web Server', 'ip' => '10.10.2.2', 'brand' => 'Dell', 'model' => 'PowerEdge R740'],
                    ['name' => 'Database Server', 'ip' => '10.10.2.3', 'brand' => 'HP', 'model' => 'ProLiant DL360'],
                ],
                'wifi' => [
                    ['name' => 'WiFi AP FPTV-01', 'ip' => '10.10.3.1', 'brand' => 'Ubiquiti', 'model' => 'UniFi AP AC Pro'],
                    ['name' => 'WiFi AP FPTV-02', 'ip' => '10.10.3.2', 'brand' => 'Ubiquiti', 'model' => 'UniFi AP AC Pro'],
                ],
                'cctv' => [
                    ['name' => 'CCTV Main Entrance', 'ip' => '10.10.4.1', 'brand' => 'Hikvision', 'model' => 'DS-2CD2043G0-I'],
                    ['name' => 'CCTV Parking', 'ip' => '10.10.4.2', 'brand' => 'Hikvision', 'model' => 'DS-2CD2043G0-I'],
                ],
                'tas' => [
                    ['name' => 'TAS Main Gate', 'ip' => '10.10.5.1', 'brand' => 'Hikvision', 'model' => 'DS-2DE4425IW-DE'],
                ],
            ],
            'UTHM Kampus Pagoh' => [
                'switches' => [
                    ['name' => 'Core Switch Pagoh', 'ip' => '10.20.1.1', 'brand' => 'Cisco', 'model' => 'Catalyst 3850'],
                    ['name' => 'Access Switch PG-L1', 'ip' => '10.20.1.10', 'brand' => 'Cisco', 'model' => 'Catalyst 2960'],
                ],
                'servers' => [
                    ['name' => 'Mail Server Pagoh', 'ip' => '10.20.2.1', 'brand' => 'Dell', 'model' => 'PowerEdge R640'],
                    ['name' => 'File Server Pagoh', 'ip' => '10.20.2.2', 'brand' => 'HP', 'model' => 'ProLiant DL360'],
                ],
                'wifi' => [
                    ['name' => 'WiFi AP PG-01', 'ip' => '10.20.3.1', 'brand' => 'Ubiquiti', 'model' => 'UniFi Dream Machine'],
                ],
                'cctv' => [
                    ['name' => 'CCTV PG Entrance', 'ip' => '10.20.4.1', 'brand' => 'Hikvision', 'model' => 'DS-7608NI-I2'],
                ],
                'tas' => [
                    ['name' => 'TAS Pagoh Gate', 'ip' => '10.20.5.1', 'brand' => 'Hikvision', 'model' => 'DS-2DE4425IW-DE'],
                ],
            ],
        ];

        foreach ($branches as $branch) {
            $branchDevices = $devicesByBranch[$branch->name] ?? [];
            
            // Get locations for this branch
            $locations = Location::where('branch_id', $branch->id)->get();
            
            if ($locations->isEmpty()) {
                $this->command->warn("No locations found for branch: {$branch->name}");
                continue;
            }

            foreach ($branchDevices as $category => $devices) {
                foreach ($devices as $index => $deviceData) {
                    // Get brand and model
                    $brand = Brand::where('name', $deviceData['brand'])->first();
                    $hardwareDetailId = null;

                    if ($brand) {
                        $model = HardwareModel::where('brand_id', $brand->id)
                            ->where('name', $deviceData['model'])
                            ->first();

                        if ($model) {
                            // Create hardware detail
                            $hardwareDetail = HardwareDetail::create([
                                'brand_id' => $brand->id,
                                'model_id' => $model->id,
                            ]);
                            $hardwareDetailId = $hardwareDetail->id;
                        }
                    }

                    // Assign location (cycle through available locations)
                    $location = $locations[$index % $locations->count()];

                    // Determine status (80% online, 10% warning, 10% offline)
                    $rand = rand(1, 100);
                    $status = $rand <= 80 ? 'online' : ($rand <= 90 ? 'warning' : 'offline');

                    Device::create([
                        'branch_id' => $branch->id,
                        'location_id' => $location->id,
                        'hardware_detail_id' => $hardwareDetailId,
                        'name' => $deviceData['name'],
                        'ip_address' => $deviceData['ip'],
                        'mac_address' => $this->generateMacAddress(),
                        'barcode' => 'BC-' . strtoupper(substr(md5($deviceData['name']), 0, 8)),
                        'category' => $category,
                        'status' => $status,
                        'building' => $location->name,
                        'uptime_percentage' => $status === 'online' ? rand(95, 100) : rand(60, 90),
                        'is_active' => true,
                        'last_ping' => now(),
                    ]);
                }
            }
        }

        $this->command->info('Devices seeded successfully with hardware details!');
    }

    private function generateMacAddress(): string
    {
        return sprintf(
            '%02X:%02X:%02X:%02X:%02X:%02X',
            rand(0, 255),
            rand(0, 255),
            rand(0, 255),
            rand(0, 255),
            rand(0, 255),
            rand(0, 255)
        );
    }
}