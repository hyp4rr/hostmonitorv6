<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Checking for barcode WIFI-108545:\n";
$device = App\Models\Device::where('barcode', 'WIFI-108545')->first();
if ($device) {
    echo "Found device:\n";
    echo "  ID: {$device->id}\n";
    echo "  Name: {$device->name}\n";
    echo "  IP: {$device->ip_address}\n";
    echo "  Barcode: {$device->barcode}\n";
    echo "  Category: {$device->category}\n";
} else {
    echo "Not found\n";
}

echo "\nChecking for IP 10.8.54.5:\n";
$device2 = App\Models\Device::where('ip_address', '10.8.54.5')->first();
if ($device2) {
    echo "Found device:\n";
    echo "  ID: {$device2->id}\n";
    echo "  Name: {$device2->name}\n";
    echo "  IP: {$device2->ip_address}\n";
    echo "  Barcode: {$device2->barcode}\n";
    echo "  Category: {$device2->category}\n";
} else {
    echo "Not found\n";
}

echo "\nTotal devices in database: " . App\Models\Device::count() . "\n";
