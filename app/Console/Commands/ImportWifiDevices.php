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

class ImportWifiDevices extends Command
{
    protected $signature = 'devices:import-wifi {csv_file}';
    protected $description = 'Import WiFi devices from CSV file';

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

        // Find column indices
        $nameIndex = array_search('DEVICE NAME', $header);
        $serialIndex = array_search('SERIALNUMBER', $header);
        $macIndex = array_search('MAC', $header);
        $ipIndex = array_search('MANAGE IP', $header);
        $statusIndex = array_search('ONLINE STATUS', $header);

        if ($nameIndex === false || $serialIndex === false || $macIndex === false || $ipIndex === false) {
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

        // Find or create model "Ruijie AP9220"
        $model = HardwareModel::firstOrCreate(
            [
                'brand_id' => $brand->id,
                'name' => 'Ruijie AP9220'
            ],
            ['description' => 'Ruijie AP9220']
        );
        $this->info("Model: {$model->name} (ID: {$model->id})");

        // Create hardware detail (one for all devices with same brand/model)
        $hardwareDetail = HardwareDetail::firstOrCreate(
            [
                'brand_id' => $brand->id,
                'model_id' => $model->id
            ]
        );
        $this->info("Hardware Detail ID: {$hardwareDetail->id}");

        $this->newLine();
        $this->info("Starting import...");
        $this->newLine();

        $stats = [
            'total' => 0,
            'created' => 0,
            'updated' => 0,
            'skipped' => 0,
            'errors' => 0
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

                $deviceName = trim($row[$nameIndex] ?? '');
                $serialNumber = trim($row[$serialIndex] ?? '');
                $macAddress = trim($row[$macIndex] ?? '');
                $ipAddress = trim($row[$ipIndex] ?? '');
                $onlineStatus = strtoupper(trim($row[$statusIndex] ?? 'ON'));

                // Skip if essential fields are missing
                if (empty($deviceName) || empty($ipAddress)) {
                    $stats['skipped']++;
                    $this->warn("Row {$rowNumber}: Skipped (missing name or IP)");
                    continue;
                }

                // Validate IP address
                if (!filter_var($ipAddress, FILTER_VALIDATE_IP)) {
                    $stats['skipped']++;
                    $this->warn("Row {$rowNumber}: Skipped (invalid IP: {$ipAddress})");
                    continue;
                }

                // Determine status
                $status = ($onlineStatus === 'ON') ? 'online' : 'offline';

                // Clean MAC address (remove dots, keep colons)
                $macAddress = str_replace('.', '', $macAddress);
                if (!empty($macAddress) && strlen($macAddress) === 12) {
                    // Format as XX:XX:XX:XX:XX:XX
                    $macAddress = implode(':', str_split($macAddress, 2));
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
                            'category' => 'wifi',
                            'status' => $status,
                            'is_active' => true,
                        ]
                    );

                    if ($device->wasRecentlyCreated) {
                        $stats['created']++;
                        $this->info("Row {$rowNumber}: Created - {$deviceName} ({$ipAddress})");
                    } else {
                        $stats['updated']++;
                        $this->line("Row {$rowNumber}: Updated - {$deviceName} ({$ipAddress})");
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

