<?php

require_once __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Available users:\n";
echo "================\n";
$users = App\Models\User::all();

if ($users->isEmpty()) {
    echo "No users found. Creating a default user...\n";
    
    // Create a default user
    $user = App\Models\User::create([
        'name' => 'System Administrator',
        'email' => 'admin@hostmonitor.com',
        'password' => bcrypt('password'),
    ]);
    
    echo "✓ Created default user: ID {$user->id}, Name: {$user->name}, Email: {$user->email}\n";
} else {
    foreach ($users as $user) {
        echo "ID: {$user->id}, Name: {$user->name}, Email: {$user->email}\n";
    }
}
