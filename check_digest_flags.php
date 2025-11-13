<?php

require_once __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Device;

echo "Checking daily digest flags...\n";
echo "==============================\n";

$offlineDevices = Device::where('status', 'offline')->get();

foreach ($offlineDevices as $device) {
    echo "Device: {$device->name}\n";
    echo "  Status: {$device->status}\n";
    echo "  Daily digest sent: " . ($device->daily_digest_sent ? 'Yes' : 'No') . "\n";
    echo "  Last notification sent: " . ($device->last_notification_sent ? $device->last_notification_sent->format('Y-m-d H:i:s') : 'Never') . "\n";
    echo "---\n";
}

echo "\nResetting daily digest flags...\n";
Device::where('daily_digest_sent', true)->update(['daily_digest_sent' => false]);
echo "✓ Reset all daily digest flags\n";

echo "\nRunning digest again...\n";
$output = shell_exec('php artisan devices:send-notifications --digest');
echo $output;
