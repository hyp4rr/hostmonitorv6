<?php

require_once __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Checking for duplicate IP addresses within the CSV file itself...\n";
echo "============================================================\n";

$csvFile = 'c:\Users\hyper\Herd\hostmonitorv6\database\seeders\data\tas.csv';
$ipAddresses = [];
$duplicates = [];

if (($handle = fopen($csvFile, 'r')) !== FALSE) {
    // Skip header row
    fgetcsv($handle);
    
    while (($data = fgetcsv($handle)) !== FALSE) {
        if (isset($data[1]) && isset($data[2])) {
            $name = trim($data[1]);
            $ip_address = trim($data[2]);
            
            if (isset($ipAddresses[$ip_address])) {
                $duplicates[] = [
                    'first_name' => $ipAddresses[$ip_address],
                    'second_name' => $name,
                    'ip_address' => $ip_address,
                ];
            } else {
                $ipAddresses[$ip_address] = $name;
            }
        }
    }
    fclose($handle);
}

if (empty($duplicates)) {
    echo "No duplicate IP addresses found in CSV.\n";
} else {
    echo "Found " . count($duplicates) . " duplicate IP address(es):\n\n";
    foreach ($duplicates as $duplicate) {
        echo "IP: {$duplicate['ip_address']}\n";
        echo "  First entry: {$duplicate['first_name']}\n";
        echo "  Second entry: {$duplicate['second_name']}\n";
        echo "---\n";
    }
}

echo "\nTotal unique entries in CSV: " . count($ipAddresses) . "\n";
