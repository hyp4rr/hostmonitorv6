<?php

use Illuminate\Support\Facades\Mail;

require_once __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Mail Configuration:\n";
echo "MAIL_MAILER: " . env('MAIL_MAILER') . "\n";
echo "MAIL_HOST: " . env('MAIL_HOST') . "\n";
echo "MAIL_PORT: " . env('MAIL_PORT') . "\n";
echo "MAIL_USERNAME: " . env('MAIL_USERNAME') . "\n";
echo "MAIL_PASSWORD: " . (env('MAIL_PASSWORD') ? '***SET***' : 'NOT SET') . "\n";
echo "MAIL_ENCRYPTION: " . env('MAIL_ENCRYPTION') . "\n";
echo "MAIL_FROM_ADDRESS: " . env('MAIL_FROM_ADDRESS') . "\n";
echo "MAIL_FROM_NAME: " . env('MAIL_FROM_NAME') . "\n";

echo "\nTesting mail send...\n";
try {
    Mail::raw('Test email content', function ($message) {
        $message->to('hyperskeleton20@gmail.com')
               ->subject('Test Email from Host Monitor')
               ->from('noreply@hostmonitor.com', 'Host Monitor System');
    });
    echo "✓ Mail sent successfully\n";
} catch (\Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
}
