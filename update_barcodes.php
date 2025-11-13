<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "🔄 Updating device barcodes to new format...\n";
echo str_repeat("=", 60) . "\n";

$devices = App\Models\Device::all();
$updated = 0;
$errors = 0;

foreach ($devices as $device) {
    // Determine category prefix
    $category = $device->category;
    $barcodePrefix = $category === 'servers' ? 'HM' : strtoupper($category);
    
    // Generate new barcode with padded IP
    $ipParts = explode('.', $device->ip_address);
    $paddedIp = implode('', array_map(fn($part) => str_pad($part, 3, '0', STR_PAD_LEFT), $ipParts));
    $newBarcode = $barcodePrefix . '-' . $paddedIp;
    
    if ($device->barcode !== $newBarcode) {
        try {
            $oldBarcode = $device->barcode;
            $device->barcode = $newBarcode;
            $device->save();
            $updated++;
            echo "✅ Updated: {$device->ip_address} | {$oldBarcode} → {$newBarcode}\n";
        } catch (\Exception $e) {
            $errors++;
            echo "❌ Error updating {$device->ip_address}: {$e->getMessage()}\n";
        }
    }
}

echo str_repeat("=", 60) . "\n";
echo "✅ Updated: {$updated} devices\n";
echo "❌ Errors: {$errors}\n";
echo "📊 Total devices: " . $devices->count() . "\n";
