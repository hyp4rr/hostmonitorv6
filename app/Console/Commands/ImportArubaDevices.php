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

class ImportArubaDevices extends Command
{
    protected $signature = 'devices:import-aruba {csv_file}';
    protected $description = 'Import Aruba WiFi devices from CSV file';

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
        
        $nameIndex = array_search('Device', $header);
        $ipIndex = array_search('IP Address', $header);
        $typeIndex = array_search('Type', $header);
        $statusIndex = array_search('Status', $header);

        if ($nameIndex === false || $ipIndex === false || $typeIndex === false) {
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

        // Find or create brand "Aruba"
        $brand = Brand::firstOrCreate(
            ['name' => 'Aruba'],
            ['description' => 'Aruba']
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

                // Clean quoted values
                $row = array_map(function($value) {
                    return trim($value, '"');
                }, $row);

                $deviceName = trim($row[$nameIndex] ?? '');
                $ipAddress = trim($row[$ipIndex] ?? '');
                $modelType = trim($row[$typeIndex] ?? '');
                $status = strtoupper(trim($row[$statusIndex] ?? 'Up'));

                // Skip if essential fields are missing
                if (empty($deviceName) || empty($ipAddress) || empty($modelType)) {
                    $stats['skipped']++;
                    $this->warn("Row {$rowNumber}: Skipped (missing name, IP, or type)");
                    continue;
                }

                // Validate IP address
                if (!filter_var($ipAddress, FILTER_VALIDATE_IP)) {
                    $stats['skipped']++;
                    $this->warn("Row {$rowNumber}: Skipped (invalid IP: {$ipAddress})");
                    continue;
                }

                // Determine status
                $deviceStatus = ($status === 'UP') ? 'online' : 'offline';

                // Find or create model based on Type
                $model = HardwareModel::firstOrCreate(
                    [
                        'brand_id' => $brand->id,
                        'name' => $modelType
                    ],
                    ['description' => $modelType]
                );

                // Track unique models
                if (!in_array($modelType, $stats['models'])) {
                    $stats['models'][] = $modelType;
                }

                // Find or create hardware detail for this brand/model combination
                $hardwareDetail = HardwareDetail::firstOrCreate(
                    [
                        'brand_id' => $brand->id,
                        'model_id' => $model->id
                    ]
                );

                try {
                    // Use updateOrCreate to handle duplicates
                    $device = Device::updateOrCreate(
                        ['ip_address' => $ipAddress],
                        [
                            'branch_id' => $branch->id,
                            'location_id' => $location->id,
                            'hardware_detail_id' => $hardwareDetail->id,
                            'name' => $deviceName,
                            'category' => 'wifi',
                            'status' => $deviceStatus,
                            'is_active' => true,
                        ]
                    );

                    if ($device->wasRecentlyCreated) {
                        $stats['created']++;
                        $this->info("Row {$rowNumber}: Created - {$deviceName} ({$ipAddress}) - {$modelType}");
                    } else {
                        $stats['updated']++;
                        $this->line("Row {$rowNumber}: Updated - {$deviceName} ({$ipAddress}) - {$modelType}");
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

