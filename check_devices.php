<?php

require_once __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Checking offline device data...\n";
$devices = App\Models\Device::where('status', 'offline')->get();

foreach($devices as $device) {
    echo "Device: " . $device->name . "\n";
    echo "Offline Since: " . ($device->offline_since ? $device->offline_since->format('Y-m-d H:i:s') : 'NULL') . "\n";
    echo "Duration: " . ($device->offline_duration_minutes ?? 'NULL') . " minutes\n";
    echo "---\n";
}
