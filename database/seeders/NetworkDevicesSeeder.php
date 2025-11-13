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

class NetworkDevicesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('🚀 Starting Network Devices Import...');

        // Get UTHM Kampus Parit Raja branch
        $branch = Branch::where('code', 'PR')->first();
        
        if (!$branch) {
            $this->command->error('❌ Branch PR not found. Please run BranchSeeder first.');
            return;
        }

        $this->command->info('✅ Branch found: ' . $branch->name);

        // Create Generic brand
        $brand = Brand::firstOrCreate(['name' => 'Generic']);

        // Define categories with their CSV files and model names
        $categories = [
            'servers' => [
                'csv' => 'server.csv',
                'model_name' => 'Network Server',
                'description' => 'Generic network server',
            ],
            'switches' => [
                'csv' => 'switches.csv',
                'model_name' => 'Network Switch',
                'description' => 'Generic network switch',
            ],
            'wifi' => [
                'csv' => 'wifi.csv',
                'model_name' => 'WiFi Access Point',
                'description' => 'Generic WiFi access point',
            ],
            'tas' => [
                'csv' => 'tas.csv',
                'model_name' => 'Time Attendance System',
                'description' => 'Generic time attendance system',
            ],
            'cctv' => [
                'csv' => 'cctv.csv',
                'model_name' => 'CCTV Camera',
                'description' => 'Generic CCTV camera',
            ],
        ];

        $totalStats = [
            'total' => 0,
            'online' => 0,
            'offline' => 0,
            'created' => 0,
            'updated' => 0,
        ];

        $categoryStats = [];

        // Process each category
        foreach ($categories as $category => $config) {
            $this->command->newLine();
            $this->command->info("📦 Processing {$category}...");

            // Create model for this category
            $model = HardwareModel::firstOrCreate(
                ['brand_id' => $brand->id, 'name' => $config['model_name']],
                ['description' => $config['description']]
            );
            
            $hardwareDetail = HardwareDetail::firstOrCreate(
                ['brand_id' => $brand->id, 'model_id' => $model->id]
            );

            // Read CSV file
            $csvPath = database_path('seeders/data/' . $config['csv']);
            
            if (!File::exists($csvPath)) {
                $this->command->warn("⚠️  CSV file not found: {$config['csv']}");
                continue;
            }

            $csv = array_map('str_getcsv', file($csvPath));
            $header = array_shift($csv); // Remove header row
            
            $this->command->info("📄 CSV file loaded with " . count($csv) . " devices");

            // Track locations and statistics for this category
            $locations = [];
            $locationsCreated = 0;
            $locationsReused = 0;
            $stats = [
                'total' => 0,
                'online' => 0,
                'offline' => 0,
                'created' => 0,
                'updated' => 0,
            ];

            // Process each row
            foreach ($csv as $row) {
                if (count($row) < 5) {
                    continue; // Skip invalid rows
                }

                [$locationName, $deviceName, $ipAddress, $status, $responseTime] = $row;

                // Skip if IP is empty or invalid
                if (empty($ipAddress) || $ipAddress === '0.0.0.0') {
                    continue;
                }

                // Create or get location - firstOrCreate will reuse existing location if found
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

                // Parse response time
                $responseTimeValue = !empty($responseTime) && is_numeric($responseTime) 
                    ? (int)$responseTime 
                    : null;

                // Determine status
                $deviceStatus = strtolower($status) === 'online' ? 'online' : 'offline';
                
                // Calculate uptime percentage
                $uptimePercentage = $deviceStatus === 'online' ? 99.9 : 0.0;

                // Generate barcode (use HM- for servers, category prefix for others)
                // Pad each octet to 3 digits to ensure uniqueness (e.g., 10.8.5.45 -> 010008005045)
                $barcodePrefix = $category === 'servers' ? 'HM' : strtoupper($category);
                $ipParts = explode('.', $ipAddress);
                $paddedIp = implode('', array_map(fn($part) => str_pad($part, 3, '0', STR_PAD_LEFT), $ipParts));
                $barcode = $barcodePrefix . '-' . $paddedIp;

                // Create or update device
                $device = Device::updateOrCreate(
                    ['ip_address' => $ipAddress],
                    [
                        'branch_id' => $branch->id,
                        'location_id' => $location->id,
                        'hardware_detail_id' => $hardwareDetail->id,
                        'name' => $deviceName,
                        'mac_address' => $this->generateMacAddress($ipAddress),
                        'barcode' => $barcode,
                        'category' => $category,
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
            }

            // Store category stats
            $categoryStats[$category] = $stats;

            // Update total stats
            $totalStats['total'] += $stats['total'];
            $totalStats['online'] += $stats['online'];
            $totalStats['offline'] += $stats['offline'];
            $totalStats['created'] += $stats['created'];
            $totalStats['updated'] += $stats['updated'];

            $this->command->info("✅ {$category}: {$stats['total']} devices imported");
            $this->command->info("   📍 Locations: {$locationsCreated} created, {$locationsReused} reused");
        }

        // Display summary
        $this->command->newLine(2);
        $this->command->info('═══════════════════════════════════════════════════════');
        $this->command->info('           📊 IMPORT SUMMARY');
        $this->command->info('═══════════════════════════════════════════════════════');
        $this->command->info('🌐 Total Devices Processed: ' . $totalStats['total']);
        $this->command->info('✅ Online Devices: ' . $totalStats['online']);
        $this->command->info('❌ Offline Devices: ' . $totalStats['offline']);
        $this->command->info('🆕 Devices Created: ' . $totalStats['created']);
        $this->command->info('🔄 Devices Updated: ' . $totalStats['updated']);
        $this->command->info('═══════════════════════════════════════════════════════');
        
        // Display category breakdown
        $this->command->info('');
        $this->command->info('📦 Devices by Category:');
        foreach ($categoryStats as $category => $stats) {
            $this->command->info("   • " . strtoupper($category) . ": {$stats['total']} devices ({$stats['online']} online, {$stats['offline']} offline)");
        }
        
        $this->command->info('');
        $this->command->info('✅ Network devices import completed successfully!');
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
