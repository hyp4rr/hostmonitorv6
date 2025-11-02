<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user
        User::updateOrCreate(
            ['email' => 'admin@hostmonitor.local'],
            [
                'name' => 'Administrator',
                'email' => 'admin@hostmonitor.local',
                'password' => Hash::make('admin123'), // Change this password!
                'email_verified_at' => now(),
            ]
        );

        $this->command->info('✅ Admin user created successfully!');
        $this->command->info('📧 Email: admin@hostmonitor.local');
        $this->command->info('🔑 Password: admin123');
        $this->command->warn('⚠️  Please change the password in production!');
    }
}
