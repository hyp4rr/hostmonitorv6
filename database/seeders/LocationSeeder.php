<?php

namespace Database\Seeders;

use App\Models\Location;
use App\Models\Branch;
use Illuminate\Database\Seeder;

class LocationSeeder extends Seeder
{
    public function run(): void
    {
        $branches = Branch::all();
        
        if ($branches->isEmpty()) {
            $this->command->warn('No branches found. Please run BranchSeeder first.');
            return;
        }

        // Locations for each branch
        $locationsByBranch = [
            'UTHM Kampus Parit Raja' => [
                [
                    'name' => 'FPTV Building',
                    'description' => 'Faculty of Electrical and Electronic Engineering',
                    'latitude' => 1.8536,
                    'longitude' => 103.0809,
                ],
                [
                    'name' => 'FKMP Building',
                    'description' => 'Faculty of Mechanical and Manufacturing Engineering',
                    'latitude' => 1.8545,
                    'longitude' => 103.0820,
                ],
                [
                    'name' => 'FPTP Building',
                    'description' => 'Faculty of Engineering Technology',
                    'latitude' => 1.8528,
                    'longitude' => 103.0801,
                ],
                [
                    'name' => 'Main Data Center',
                    'description' => 'Primary server room and network hub',
                    'latitude' => 1.8540,
                    'longitude' => 103.0815,
                ],
                [
                    'name' => 'Library',
                    'description' => 'Main campus library',
                    'latitude' => 1.8550,
                    'longitude' => 103.0825,
                ],
            ],
            'UTHM Kampus Pagoh' => [
                [
                    'name' => 'Academic Block A',
                    'description' => 'Main academic building',
                    'latitude' => 2.1642,
                    'longitude' => 102.5989,
                ],
                [
                    'name' => 'Academic Block B',
                    'description' => 'Secondary academic building',
                    'latitude' => 2.1650,
                    'longitude' => 102.5995,
                ],
                [
                    'name' => 'Pagoh Data Center',
                    'description' => 'Campus network and server room',
                    'latitude' => 2.1635,
                    'longitude' => 102.5985,
                ],
                [
                    'name' => 'Student Center',
                    'description' => 'Student activities and services',
                    'latitude' => 2.1645,
                    'longitude' => 102.5992,
                ],
            ],
        ];

        foreach ($branches as $branch) {
            $locations = $locationsByBranch[$branch->name] ?? [];
            
            foreach ($locations as $locationData) {
                Location::create([
                    'branch_id' => $branch->id,
                    'name' => $locationData['name'],
                    'description' => $locationData['description'],
                    'latitude' => $locationData['latitude'],
                    'longitude' => $locationData['longitude'],
                ]);
            }
        }

        $this->command->info('Locations seeded successfully with coordinates!');
    }
}
