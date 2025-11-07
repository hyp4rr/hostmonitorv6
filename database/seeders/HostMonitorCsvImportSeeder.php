<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Branch;
use App\Models\Location;
use App\Models\Device;
use App\Models\Brand;
use App\Models\Model as HardwareModel;
use App\Models\HardwareDetail;
use Illuminate\Support\Facades\File;

class HostMonitorCsvImportSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('🚀 Starting HostMonitor CSV Import...');

        // Create UTHM Parit Raja branch
        $branch = Branch::firstOrCreate(
            ['code' => 'PR'],
            [
                'name' => 'UTHM Kampus Parit Raja',
                'description' => 'UTHM Kampus Parit Raja',
                'address' => '',
                'latitude' => 1.8655,
                'longitude' => 103.0850,
                'is_active' => true,
            ]
        );
        $this->command->info('✅ Branch created: UTHM Kampus Parit Raja');

        // Create brand and model for servers
        $brand = Brand::firstOrCreate(['name' => 'Generic']);
        $model = HardwareModel::firstOrCreate(
            ['brand_id' => $brand->id, 'name' => 'Network Server'],
            ['description' => 'Generic network server']
        );
        $hardwareDetail = HardwareDetail::firstOrCreate(
            ['brand_id' => $brand->id, 'model_id' => $model->id]
        );
        $this->command->info('✅ Hardware details created');

        // Read CSV file
        $csvPath = database_path('seeders/data/hostmonitor_devices.csv');
        
        if (!File::exists($csvPath)) {
            $this->command->error('❌ CSV file not found: ' . $csvPath);
            return;
        }

        $csv = array_map('str_getcsv', file($csvPath));
        $header = array_shift($csv); // Remove header row
        
        $this->command->info('📄 CSV file loaded with ' . count($csv) . ' devices');

        // Track locations and statistics
        $locations = [];
        $stats = [
            'total' => 0,
            'online' => 0,
            'offline' => 0,
            'created' => 0,
            'updated' => 0,
        ];

        // Process each row
        $progressBar = $this->command->getOutput()->createProgressBar(count($csv));
        $progressBar->start();

        foreach ($csv as $row) {
            if (count($row) < 5) {
                continue; // Skip invalid rows
            }

            [$locationName, $deviceName, $ipAddress, $status, $responseTime] = $row;

            // Skip if IP is empty or invalid
            if (empty($ipAddress) || $ipAddress === '0.0.0.0') {
                $progressBar->advance();
                continue;
            }

            // Create or get location
            if (!isset($locations[$locationName])) {
                $locations[$locationName] = Location::firstOrCreate(
                    [
                        'branch_id' => $branch->id,
                        'name' => $locationName
                    ],
                    [
                        'description' => 'UTHM Kampus Parit Raja - ' . $locationName,
                        'latitude' => 1.8655,
                        'longitude' => 103.0850,
                    ]
                );
            }

            $location = $locations[$locationName];

            // Parse response time
            $responseTimeValue = !empty($responseTime) && is_numeric($responseTime) 
                ? (int)$responseTime 
                : null;

            // Determine status
            $deviceStatus = strtolower($status) === 'online' ? 'online' : 'offline';
            
            // Calculate uptime percentage
            $uptimePercentage = $deviceStatus === 'online' ? 99.9 : 0.0;

            // Create or update device
            $device = Device::updateOrCreate(
                ['ip_address' => $ipAddress],
                [
                    'branch_id' => $branch->id,
                    'location_id' => $location->id,
                    'hardware_detail_id' => $hardwareDetail->id,
                    'name' => $deviceName,
                    'mac_address' => $this->generateMacAddress($ipAddress),
                    'barcode' => 'HM-' . str_replace('.', '', $ipAddress),
                    'category' => 'servers',
                    'status' => $deviceStatus,
                    'is_active' => true,
                    'response_time' => $responseTimeValue,
                    'uptime_percentage' => $uptimePercentage,
                    'last_ping' => now(),
                ]
            );

            // Update statistics
            $stats['total']++;
            if ($deviceStatus === 'online') {
                $stats['online']++;
            } else {
                $stats['offline']++;
            }
            
            if ($device->wasRecentlyCreated) {
                $stats['created']++;
            } else {
                $stats['updated']++;
            }

            $progressBar->advance();
        }

        $progressBar->finish();
        $this->command->newLine(2);

        // Display summary
        $this->command->info('');
        $this->command->info('═══════════════════════════════════════════════════════');
        $this->command->info('           📊 IMPORT SUMMARY');
        $this->command->info('═══════════════════════════════════════════════════════');
        $this->command->info('🌐 Total Devices Processed: ' . $stats['total']);
        $this->command->info('✅ Online Devices: ' . $stats['online']);
        $this->command->info('❌ Offline Devices: ' . $stats['offline']);
        $this->command->info('🆕 Devices Created: ' . $stats['created']);
        $this->command->info('🔄 Devices Updated: ' . $stats['updated']);
        $this->command->info('📍 Total Locations: ' . count($locations));
        $this->command->info('═══════════════════════════════════════════════════════');
        
        // Display location breakdown
        $this->command->info('');
        $this->command->info('📍 Devices by Location:');
        foreach ($locations as $locationName => $location) {
            $deviceCount = Device::where('location_id', $location->id)->count();
            $this->command->info("   • {$locationName}: {$deviceCount} devices");
        }
        
        $this->command->info('');
        $this->command->info('✅ HostMonitor CSV import completed successfully!');
    }

    /**
     * Generate a dummy MAC address based on IP address
     */
    private function generateMacAddress(string $ipAddress): string
    {
        $parts = explode('.', $ipAddress);
        
        // Use IP octets to generate a consistent MAC address
        $mac = sprintf(
            '00:1A:%02X:%02X:%02X:%02X',
            isset($parts[0]) ? (int)$parts[0] : 0,
            isset($parts[1]) ? (int)$parts[1] : 0,
            isset($parts[2]) ? (int)$parts[2] : 0,
            isset($parts[3]) ? (int)$parts[3] : 0
        );
        
        return $mac;
    }
}
