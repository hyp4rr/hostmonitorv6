<?php

$csvFile = 'c:\Users\hyper\Herd\hostmonitorv6\database\seeders\data\tas.csv';
$devices = [];

if (($handle = fopen($csvFile, 'r')) !== FALSE) {
    // Skip header row
    fgetcsv($handle);
    
    while (($data = fgetcsv($handle)) !== FALSE) {
        if (isset($data[1]) && isset($data[2])) {
            $devices[] = [
                'name' => trim($data[1]),
                'ip_address' => trim($data[2])
            ];
        }
    }
    fclose($handle);
}

echo "Devices from tas.csv:\n";
echo "====================\n";
foreach ($devices as $device) {
    echo "Name: {$device['name']}, IP: {$device['ip_address']}\n";
}

echo "\nTotal devices: " . count($devices) . "\n";
