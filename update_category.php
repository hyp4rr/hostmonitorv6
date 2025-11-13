<?php

require_once __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Device;
use Illuminate\Support\Facades\DB;

echo "Updating all devices to TAS category...\n";
echo "======================================\n";

$updatedCount = Device::where('category', 'network')->update(['category' => 'tas']);

echo "✓ Updated {$updatedCount} devices to 'TAS' category\n";

echo "\nCategory breakdown:\n";
echo "====================\n";
$categories = Device::select('category', \DB::raw('count(*) as count'))
    ->groupBy('category')
    ->get();

foreach ($categories as $category) {
    echo "{$category->category}: {$category->count} devices\n";
}

echo "\nTotal devices: " . Device::count() . "\n";
