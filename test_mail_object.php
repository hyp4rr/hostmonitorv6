<?php

require_once __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Mail\DailyDeviceDigest;
use App\Models\Device;

echo "Testing DailyDeviceDigest mail object...\n";
echo "========================================\n";

// Get offline devices the same way the command does
$offlineDevices = Device::where('status', 'offline')
    ->whereNotNull('managed_by')
    ->with(['managedBy', 'branch', 'location'])
    ->get();

echo "Offline devices found: {$offlineDevices->count()}\n";

if ($offlineDevices->isNotEmpty()) {
    // Group by user
    $devicesByUser = $offlineDevices->groupBy('managed_by');
    
    foreach ($devicesByUser as $userId => $devices) {
        echo "\nUser {$userId} devices:\n";
        foreach ($devices as $device) {
            echo "  - {$device->name} ({$device->ip_address}) - Status: {$device->status}\n";
        }
        
        // Create mail object to test
        $mail = new DailyDeviceDigest($devices);
        echo "\nMail object properties:\n";
        echo "User: " . ($mail->user ? $mail->user->name : 'null') . "\n";
        echo "Device count: " . $mail->devices->count() . "\n";
        
        // Test template rendering
        try {
            $content = $mail->render();
            echo "Template rendered successfully\n";
            
            // Check if the content contains the device count
            if (strpos($content, '2 device') !== false) {
                echo "✓ Template contains correct device count\n";
            } else {
                echo "✗ Template does not contain correct device count\n";
                echo "Content snippet: " . substr($content, strpos($content, 'Summary'), 100) . "\n";
            }
        } catch (Exception $e) {
            echo "Error rendering template: " . $e->getMessage() . "\n";
        }
    }
}
