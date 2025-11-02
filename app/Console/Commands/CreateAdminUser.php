<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class CreateAdminUser extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'admin:create 
                            {--email= : Admin email address}
                            {--password= : Admin password}
                            {--name= : Admin name}';

    /**
     * The console command description.
     */
    protected $description = 'Create a new admin user for the configuration panel';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('🔧 Creating Admin User for Host Monitor');
        $this->newLine();

        // Get email
        $email = $this->option('email') ?? $this->ask('Admin Email', 'admin@hostmonitor.local');

        // Validate email
        $validator = Validator::make(['email' => $email], [
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            $this->error('❌ Invalid email address');
            return self::FAILURE;
        }

        // Check if user exists
        if (User::where('email', $email)->exists()) {
            if (!$this->confirm("User with email {$email} already exists. Update password?", false)) {
                $this->warn('Operation cancelled');
                return self::SUCCESS;
            }
        }

        // Get name
        $name = $this->option('name') ?? $this->ask('Admin Name', 'Administrator');

        // Get password
        $password = $this->option('password') ?? $this->secret('Admin Password');
        
        if (!$password) {
            $this->error('❌ Password is required');
            return self::FAILURE;
        }

        // Confirm password
        if (!$this->option('password')) {
            $confirmPassword = $this->secret('Confirm Password');
            
            if ($password !== $confirmPassword) {
                $this->error('❌ Passwords do not match');
                return self::FAILURE;
            }
        }

        // Create or update user
        $user = User::updateOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'password' => Hash::make($password),
                'email_verified_at' => now(),
            ]
        );

        $this->newLine();
        $this->info('✅ Admin user created successfully!');
        $this->newLine();
        $this->table(
            ['Field', 'Value'],
            [
                ['Name', $user->name],
                ['Email', $user->email],
                ['Created At', $user->created_at->format('Y-m-d H:i:s')],
            ]
        );

        $this->newLine();
        $this->comment('You can now login to /monitor/configuration with these credentials');

        return self::SUCCESS;
    }
}
