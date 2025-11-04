<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Run seeders in dependency order
        $this->call([
            BranchSeeder::class,      // 1. Create branches first
            LocationSeeder::class,     // 2. Create locations (depends on branches)
            DeviceSeeder::class,       // 3. Create devices (depends on branches, locations, brands, models)
            AlertSeeder::class,        // 4. Create alerts (depends on devices)
            AdminUserSeeder::class,    // 5. Create admin users
        ]);
    }
}