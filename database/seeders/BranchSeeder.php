<?php

namespace Database\Seeders;

use App\Models\Branch;
use Illuminate\Database\Seeder;

class BranchSeeder extends Seeder
{
    public function run(): void
    {
        $branches = [
            [
                'name' => 'UTHM Main Campus',
                'code' => 'MAIN',
                'description' => 'Main campus network infrastructure',
                'address' => 'Parit Raja, Batu Pahat, Johor',
                'latitude' => 1.8542,
                'longitude' => 103.0839,
                'is_active' => true,
            ],
            [
                'name' => 'UTHM Pagoh Campus',
                'code' => 'PAGOH',
                'description' => 'Pagoh campus network infrastructure',
                'address' => 'KM 1, Jalan Panchor, Pagoh, Johor',
                'latitude' => 2.1459,
                'longitude' => 102.7608,
                'is_active' => true,
            ],
            [
                'name' => 'UTHM Kampus Bandar',
                'code' => 'BANDAR',
                'description' => 'City campus network infrastructure',
                'address' => 'Batu Pahat, Johor',
                'latitude' => 1.8553,
                'longitude' => 102.9325,
                'is_active' => true,
            ],
            [
                'name' => 'UTHM Kolej Kediaman Perwira',
                'code' => 'PERWIRA',
                'description' => 'Perwira residential college network',
                'address' => 'Parit Raja, Batu Pahat, Johor',
                'latitude' => 1.8565,
                'longitude' => 103.0852,
                'is_active' => true,
            ],
            [
                'name' => 'UTHM PUMAS',
                'code' => 'PUMAS',
                'description' => 'PUMAS sports complex network infrastructure',
                'address' => 'Parit Raja, Batu Pahat, Johor',
                'latitude' => 1.8522,
                'longitude' => 103.0815,
                'is_active' => true,
            ],
        ];

        foreach ($branches as $branch) {
            Branch::create($branch);
        }
    }
}