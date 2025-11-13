<?php

require_once __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Current Time Settings:\n";
echo "UTC Time: " . now()->format('Y-m-d H:i:s') . "\n";
echo "Malaysia Time: " . now()->timezone('Asia/Kuala_Lumpur')->format('Y-m-d H:i:s') . "\n";
echo "Current Hour (Malaysia): " . now()->timezone('Asia/Kuala_Lumpur')->hour . "\n";
echo "Current Hour (UTC): " . now()->hour . "\n";
