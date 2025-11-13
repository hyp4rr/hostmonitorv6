<?php

require_once __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Device;

echo "Checking for duplicate IP addresses in CSV vs database...\n";
echo "========================================================\n";

$csvFile = 'c:\Users\hyper\Herd\hostmonitorv6\database\seeders\data\tas.csv';
$duplicates = [];

if (($handle = fopen($csvFile, 'r')) !== FALSE) {
    // Skip header row
    fgetcsv($handle);
    
    while (($data = fgetcsv($handle)) !== FALSE) {
        if (isset($data[1]) && isset($data[2])) {
            $name = trim($data[1]);
            $ip_address = trim($data[2]);
            
            // Check if device with this IP already exists in database
            $existingDevice = Device::where('ip_address', $ip_address)->first();
            if ($existingDevice) {
                $duplicates[] = [
                    'csv_name' => $name,
                    'csv_ip' => $ip_address,
                    'db_name' => $existingDevice->name,
                    'db_ip' => $existingDevice->ip_address,
                    'db_barcode' => $existingDevice->barcode,
                ];
            }
        }
    }
    fclose($handle);
}

if (empty($duplicates)) {
    echo "No duplicates found.\n";
} else {
    echo "Found " . count($duplicates) . " duplicate(s):\n\n";
    foreach ($duplicates as $duplicate) {
        echo "CSV Entry: {$duplicate['csv_name']} ({$duplicate['csv_ip']})\n";
        echo "Already in DB: {$duplicate['db_name']} ({$duplicate['db_ip']}) - Barcode: {$duplicate['db_barcode']}\n";
        echo "---\n";
    }
}

echo "\nAll devices in database:\n";
echo "========================\n";
Device::all()->each(function($device) {
    echo "{$device->barcode}: {$device->name} ({$device->ip_address}) - {$device->status}\n";
});
