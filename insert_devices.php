<?php

require_once __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Device;

$csvFile = 'c:\Users\hyper\Herd\hostmonitorv6\database\seeders\data\tas.csv';
$insertedCount = 0;
$skippedCount = 0;

if (($handle = fopen($csvFile, 'r')) !== FALSE) {
    // Skip header row
    fgetcsv($handle);
    
    while (($data = fgetcsv($handle)) !== FALSE) {
        if (isset($data[1]) && isset($data[2])) {
            $name = trim($data[1]);
            $ip_address = trim($data[2]);
            $status = trim($data[3] ?? 'offline');
            
            // Skip if name or IP is empty
            if (empty($name) || empty($ip_address)) {
                $skippedCount++;
                continue;
            }
            
            // Check if device already exists
            $existingDevice = Device::where('ip_address', $ip_address)->first();
            if ($existingDevice) {
                echo "Device with IP {$ip_address} already exists. Skipping.\n";
                $skippedCount++;
                continue;
            }
            
            // Create new device with required barcode
            $device = Device::create([
                'name' => $name,
                'ip_address' => $ip_address,
                'barcode' => 'DEV-' . str_pad(($insertedCount + 1), 4, '0', STR_PAD_LEFT), // Generate barcode
                'status' => ($status === 'Alive') ? 'online' : 'offline',
                'category' => 'tas',
                'is_active' => true,
                'managed_by' => 3, // Assign to user ID 3 (Faiq)
                'branch_id' => 1, // Assign to branch ID 1 by default
                'location_id' => 1, // Assign to location ID 1 by default
            ]);
            
            echo "✓ Inserted: {$name} ({$ip_address}) - Barcode: {$device->barcode} - Status: {$device->status}\n";
            $insertedCount++;
        }
    }
    fclose($handle);
}

echo "\n=== Summary ===\n";
echo "Devices inserted: {$insertedCount}\n";
echo "Devices skipped: {$skippedCount}\n";
echo "Total devices in database: " . Device::count() . "\n";
