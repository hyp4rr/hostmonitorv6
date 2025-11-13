<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Updating switch categories from 'switch' to 'switches'...\n";

// Get all devices with category 'switch'
$switchDevices = \App\Models\Device::where('category', 'switch')->get();

echo "Found " . $switchDevices->count() . " devices with category 'switch'\n";

if ($switchDevices->count() === 0) {
    echo "No devices found with category 'switch'.\n";
    exit;
}

// Update all of them to 'switches'
$updated = \App\Models\Device::where('category', 'switch')
    ->update(['category' => 'switches']);

echo "Updated {$updated} devices from 'switch' to 'switches'\n";

// Verify the update
$switchesDevices = \App\Models\Device::where('category', 'switches')->get();
$remainingSwitch = \App\Models\Device::where('category', 'switch')->count();

echo "\nVerification:\n";
echo "- Devices with category 'switches': " . $switchesDevices->count() . "\n";
echo "- Devices with category 'switch': " . $remainingSwitch . "\n";

if ($remainingSwitch === 0) {
    echo "✅ All devices successfully updated!\n";
} else {
    echo "⚠️  Some devices still have category 'switch'\n";
}

// Show sample of updated devices
echo "\nSample of updated devices:\n";
$samples = $switchesDevices->take(5);
foreach ($samples as $device) {
    echo "- {$device->name} ({$device->ip_address}) → category: {$device->category}\n";
}

echo "\nUpdate complete!\n";
