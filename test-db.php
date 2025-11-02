<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$count = App\Models\Device::count();
$first = App\Models\Device::first();

echo "Device count: " . $count . "\n";
echo "First device: " . ($first ? $first->name : 'none') . "\n";
echo "First device IP: " . ($first ? $first->ip_address : 'none') . "\n";
