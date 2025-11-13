<?php

require_once __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Http\Controllers\Api\DeviceController;

echo "Testing device stats endpoint...\n";
echo "=================================\n";

$controller = new DeviceController();
$request = new \Illuminate\Http\Request();

// Test the stats method
$response = $controller->stats($request);
$stats = $response->getData();

echo "Overall Stats:\n";
echo "Total: {$stats->total}\n";
echo "Online: {$stats->online}\n";
echo "Offline: {$stats->offline}\n";
echo "Warning: {$stats->warning}\n\n";

echo "Category Breakdown:\n";
echo "====================\n";
foreach ($stats->categories as $category) {
    echo "{$category->category}: {$category->count} devices\n";
}

echo "\nDirect database check:\n";
echo "======================\n";
$categories = \App\Models\Device::where('is_active', true)
    ->selectRaw('category, COUNT(*) as count')
    ->groupBy('category')
    ->orderBy('count', 'desc')
    ->get();

foreach ($categories as $cat) {
    echo "{$cat->category}: {$cat->count}\n";
}
