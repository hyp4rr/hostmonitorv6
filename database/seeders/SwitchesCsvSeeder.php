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

class SwitchesCsvSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('🚀 Starting Switches CSV Import...');

        // Get UTHM Kampus Parit Raja branch
        $branch = Branch::where('code', 'PR')->first();
        
        if (!$branch) {
            $this->command->error('❌ Branch PR not found. Please run BranchSeeder first.');
            return;
        }

        $this->command->info('✅ Branch found: ' . $branch->name);

        // Create Generic brand
        $brand = Brand::firstOrCreate(['name' => 'Generic']);

        // Create Network Switch model
        $model = HardwareModel::firstOrCreate(
            ['brand_id' => $brand->id, 'name' => 'Network Switch'],
            ['description' => 'Generic network switch']
        );
        
        $hardwareDetail = HardwareDetail::firstOrCreate(
            ['brand_id' => $brand->id, 'model_id' => $model->id]
        );

        // Read CSV file
        $csvPath = database_path('seeders/data/switches.csv');
        
        if (!File::exists($csvPath)) {
            $this->command->error('❌ CSV file not found: ' . $csvPath);
            return;
        }

        $csv = array_map('str_getcsv', file($csvPath));
        $header = array_shift($csv); // Remove header row
        
        $this->command->info('📄 CSV file loaded with ' . count($csv) . ' devices');

        // Track locations and statistics
        $locations = [];
        $locationsCreated = 0;
        $locationsReused = 0;
        $stats = [
            'total' => 0,
            'created' => 0,
            'updated' => 0,
            'skipped' => 0,
        ];

        // Process each row
        foreach ($csv as $row) {
            if (count($row) < 6) {
                $stats['skipped']++;
                continue; // Skip invalid rows
            }

            [$name, $ipAddress, $category, $status, $locationName, $brandName] = $row;

            // Skip if IP is empty or invalid
            if (empty($ipAddress) || $ipAddress === '0.0.0.0' || !filter_var($ipAddress, FILTER_VALIDATE_IP)) {
                $stats['skipped']++;
                continue;
            }

            // Skip if name is empty
            if (empty($name)) {
                $stats['skipped']++;
                continue;
            }

            // Use default location if empty
            if (empty($locationName) || trim($locationName) === '') {
                $locationName = 'Unknown';
            }

            // Create or get location
            if (!isset($locations[$locationName])) {
                $location = Location::firstOrCreate(
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
                
                $locations[$locationName] = $location;
                
                // Track if location was created or reused
                if ($location->wasRecentlyCreated) {
                    $locationsCreated++;
                } else {
                    $locationsReused++;
                }
            }

            $location = $locations[$locationName];

            // Determine status - convert 'unknown' to 'offline' for initial import
            $deviceStatus = strtolower(trim($status));
            if ($deviceStatus === 'unknown' || empty($deviceStatus)) {
                $deviceStatus = 'offline';
            } elseif (!in_array($deviceStatus, ['online', 'offline', 'warning', 'maintenance'])) {
                $deviceStatus = 'offline';
            }

            // Calculate uptime percentage
            $uptimePercentage = $deviceStatus === 'online' ? 99.9 : 0.0;

            // Generate barcode (SWITCHES-{padded_ip})
            $ipParts = explode('.', $ipAddress);
            $paddedIp = implode('', array_map(fn($part) => str_pad($part, 3, '0', STR_PAD_LEFT), $ipParts));
            $barcode = 'SWITCHES-' . $paddedIp;

            // Create or update device
            $device = Device::updateOrCreate(
                ['ip_address' => $ipAddress],
                [
                    'branch_id' => $branch->id,
                    'location_id' => $location->id,
                    'hardware_detail_id' => $hardwareDetail->id,
                    'name' => trim($name),
                    'mac_address' => $this->generateMacAddress($ipAddress),
                    'barcode' => $barcode,
                    'category' => 'switches',
                    'status' => $deviceStatus,
                    'is_active' => true,
                    'response_time' => null,
                    'uptime_percentage' => $uptimePercentage,
                    'last_ping' => now(),
                ]
            );

            // Update statistics
            $stats['total']++;
            
            if ($device->wasRecentlyCreated) {
                $stats['created']++;
            } else {
                $stats['updated']++;
            }
        }

        // Display summary
        $this->command->newLine(2);
        $this->command->info('═══════════════════════════════════════════════════════');
        $this->command->info('           📊 SWITCHES IMPORT SUMMARY');
        $this->command->info('═══════════════════════════════════════════════════════');
        $this->command->info('🌐 Total Devices Processed: ' . $stats['total']);
        $this->command->info('🆕 Devices Created: ' . $stats['created']);
        $this->command->info('🔄 Devices Updated: ' . $stats['updated']);
        $this->command->info('⏭️  Devices Skipped: ' . $stats['skipped']);
        $this->command->info('📍 Locations: ' . $locationsCreated . ' created, ' . $locationsReused . ' reused');
        $this->command->info('═══════════════════════════════════════════════════════');
        $this->command->info('');
        $this->command->info('✅ Switches import completed successfully!');
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

