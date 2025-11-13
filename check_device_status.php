<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Check all devices
echo "All devices in database:\n";
$allDevices = \App\Models\Device::count();
echo "- Total devices: {$allDevices}\n";

// Check active devices by category
echo "\nActive devices by category:\n";
$activeDevices = \App\Models\Device::where('is_active', true)
    ->selectRaw('category, COUNT(*) as count')
    ->groupBy('category')
    ->get();
foreach ($activeDevices as $category) {
    echo "- {$category->category}: {$category->count} active\n";
}

// Check inactive devices by category
echo "\nInactive devices by category:\n";
$inactiveDevices = \App\Models\Device::where('is_active', false)
    ->selectRaw('category, COUNT(*) as count')
    ->groupBy('category')
    ->get();
foreach ($inactiveDevices as $category) {
    echo "- {$category->category}: {$category->count} inactive\n";
}

// Show sample switches with their status
echo "\nSample switches:\n";
$switches = \App\Models\Device::where('category', 'switch')->take(5)->get();
foreach ($switches as $switch) {
    $status = $switch->is_active ? 'Active' : 'Inactive';
    echo "- {$switch->name} -> {$switch->ip_address} ({$status})\n";
}
