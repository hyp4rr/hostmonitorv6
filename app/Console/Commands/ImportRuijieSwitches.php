<?php

namespace App\Console\Commands;

use App\Models\Device;
use App\Models\Branch;
use App\Models\Location;
use App\Models\Brand;
use App\Models\HardwareModel;
use App\Models\HardwareDetail;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ImportRuijieSwitches extends Command
{
    protected $signature = 'devices:import-ruijie-switches {csv_file}';
    protected $description = 'Import Ruijie switches from CSV file';

    public function handle()
    {
        $csvFile = $this->argument('csv_file');
        
        if (!file_exists($csvFile)) {
            $this->error("CSV file not found: {$csvFile}");
            return 1;
        }

        $this->info("Reading CSV file: {$csvFile}");
        
        // Open CSV file
        $handle = fopen($csvFile, 'r');
        if (!$handle) {
            $this->error("Failed to open CSV file");
            return 1;
        }

        // Read header row
        $header = fgetcsv($handle);
        if (!$header) {
            $this->error("Failed to read CSV header");
            fclose($handle);
            return 1;
        }

        // Find column indices (handle quoted headers)
        $header = array_map('trim', array_map(function($h) {
            return trim($h, '"');
        }, $header));
        
        $nameIndex = array_search('DEVICE NAME', $header);
        $ipIndex = array_search('MANAGE IP', $header);
        $productClassIndex = array_search('PRODUCT CLASS', $header);
        $statusIndex = array_search('ONLINE STATUS', $header);
        $serialIndex = array_search('SERIALNUMBER', $header);
        $macIndex = array_search('MAC', $header);

        if ($nameIndex === false || $ipIndex === false || $productClassIndex === false) {
            $this->error("Required columns not found in CSV");
            $this->error("Found columns: " . implode(', ', $header));
            fclose($handle);
            return 1;
        }

        // Find existing branch "UTHM Kampus Parit Raja"
        $branch = Branch::where('name', 'UTHM Kampus Parit Raja')->first();
        if (!$branch) {
            $this->error("Branch 'UTHM Kampus Parit Raja' not found in database!");
            return 1;
        }
        $this->info("Branch: {$branch->name} (ID: {$branch->id})");

        // Find existing location "A5" under branch "UTHM Kampus Parit Raja"
        $location = Location::where('branch_id', $branch->id)
            ->where('name', 'A5')
            ->first();
        if (!$location) {
            $this->error("Location 'A5' not found under branch 'UTHM Kampus Parit Raja'!");
            return 1;
        }
        $this->info("Location: {$location->name} (ID: {$location->id})");

        // Find or create brand "Ruijie"
        $brand = Brand::firstOrCreate(
            ['name' => 'Ruijie'],
            ['description' => 'Ruijie']
        );
        $this->info("Brand: {$brand->name} (ID: {$brand->id})");

        $this->newLine();
        $this->info("Starting import...");
        $this->newLine();

        $stats = [
            'total' => 0,
            'created' => 0,
            'updated' => 0,
            'skipped' => 0,
            'errors' => 0,
            'models' => []
        ];

        DB::beginTransaction();
        try {
            $rowNumber = 1;
            while (($row = fgetcsv($handle)) !== false) {
                $rowNumber++;
                
                // Skip empty rows
                if (empty(array_filter($row))) {
                    continue;
                }

                // Clean quoted values and handle encoding
                $row = array_map(function($value) {
                    $cleaned = trim($value, '"');
                    // Remove invalid UTF-8 characters
                    $cleaned = mb_convert_encoding($cleaned, 'UTF-8', 'UTF-8');
                    // Remove any remaining invalid characters
                    $cleaned = filter_var($cleaned, FILTER_SANITIZE_STRING, FILTER_FLAG_STRIP_HIGH);
                    return $cleaned;
                }, $row);

                $deviceName = trim($row[$nameIndex] ?? '');
                $ipAddress = trim($row[$ipIndex] ?? '');
                $productClass = trim($row[$productClassIndex] ?? '');
                $status = strtoupper(trim($row[$statusIndex] ?? 'ON'));
                $serialNumber = trim($row[$serialIndex] ?? '');
                $macAddress = trim($row[$macIndex] ?? '');
                
                // Additional cleaning for device name - replace invalid characters
                $deviceName = preg_replace('/[^\x20-\x7E\x{00A0}-\x{FFFF}]/u', '_', $deviceName);

                // Skip if essential fields are missing
                if (empty($deviceName) || empty($ipAddress) || empty($productClass)) {
                    $stats['skipped']++;
                    $this->warn("Row {$rowNumber}: Skipped (missing name, IP, or product class)");
                    continue;
                }

                // Validate IP address
                if (!filter_var($ipAddress, FILTER_VALIDATE_IP)) {
                    $stats['skipped']++;
                    $this->warn("Row {$rowNumber}: Skipped (invalid IP: {$ipAddress})");
                    continue;
                }

                // Determine status
                $deviceStatus = ($status === 'ON') ? 'online' : 'offline';

                // Find or create model based on Product Class
                $model = HardwareModel::firstOrCreate(
                    [
                        'brand_id' => $brand->id,
                        'name' => $productClass
                    ],
                    ['description' => $productClass]
                );

                // Track unique models
                if (!in_array($productClass, $stats['models'])) {
                    $stats['models'][] = $productClass;
                }

                // Find or create hardware detail for this brand/model combination
                $hardwareDetail = HardwareDetail::firstOrCreate(
                    [
                        'brand_id' => $brand->id,
                        'model_id' => $model->id
                    ]
                );

                // Clean MAC address (remove dots, keep colons)
                if (!empty($macAddress)) {
                    $macAddress = str_replace('.', '', $macAddress);
                    if (strlen($macAddress) === 12) {
                        // Format as XX:XX:XX:XX:XX:XX
                        $macAddress = implode(':', str_split($macAddress, 2));
                    }
                }

                try {
                    // Use updateOrCreate to handle duplicates
                    $device = Device::updateOrCreate(
                        ['ip_address' => $ipAddress],
                        [
                            'branch_id' => $branch->id,
                            'location_id' => $location->id,
                            'hardware_detail_id' => $hardwareDetail->id,
                            'name' => $deviceName,
                            'serial_number' => $serialNumber ?: null,
                            'mac_address' => $macAddress ?: null,
                            'category' => 'switches',
                            'status' => $deviceStatus,
                            'is_active' => true,
                        ]
                    );

                    if ($device->wasRecentlyCreated) {
                        $stats['created']++;
                        $this->info("Row {$rowNumber}: Created - {$deviceName} ({$ipAddress}) - {$productClass}");
                    } else {
                        $stats['updated']++;
                        $this->line("Row {$rowNumber}: Updated - {$deviceName} ({$ipAddress}) - {$productClass}");
                    }

                    $stats['total']++;
                } catch (\Exception $e) {
                    $stats['errors']++;
                    $this->error("Row {$rowNumber}: Error - {$e->getMessage()}");
                }
            }

            DB::commit();

            $this->newLine();
            $this->info("Import completed!");
            $this->table(
                ['Metric', 'Count'],
                [
                    ['Total Processed', $stats['total']],
                    ['Created', $stats['created']],
                    ['Updated', $stats['updated']],
                    ['Skipped', $stats['skipped']],
                    ['Errors', $stats['errors']],
                ]
            );

            if (!empty($stats['models'])) {
                $this->newLine();
                $this->info("Models found: " . implode(', ', $stats['models']));
            }

        } catch (\Exception $e) {
            DB::rollBack();
            $this->error("Import failed: {$e->getMessage()}");
            return 1;
        } finally {
            fclose($handle);
        }

        return 0;
    }
}

