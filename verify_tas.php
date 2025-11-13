<?php

require_once __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "TAS category verification:\n";
echo "==========================\n";
echo "TAS devices: " . App\Models\Device::where('category', 'tas')->count() . "\n";

echo "\nSample devices:\n";
echo "================\n";
$devices = App\Models\Device::take(5)->get();
foreach ($devices as $device) {
    echo "{$device->barcode}: {$device->name} - {$device->category} - {$device->status}\n";
}
