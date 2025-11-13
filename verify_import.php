<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Check switch devices
$switchCount = \App\Models\Device::where('category', 'switch')->count();
echo "Switch devices in database: {$switchCount}\n";

// Show sample switches
echo "\nSample switches:\n";
$switches = \App\Models\Device::where('category', 'switch')->take(5)->get();
foreach ($switches as $switch) {
    echo "- {$switch->name} -> {$switch->ip_address}\n";
}

// Check categories
echo "\nDevice categories:\n";
$categories = \App\Models\Device::selectRaw('category, COUNT(*) as count')
    ->groupBy('category')
    ->get();
foreach ($categories as $category) {
    echo "- {$category->category}: {$category->count}\n";
}
