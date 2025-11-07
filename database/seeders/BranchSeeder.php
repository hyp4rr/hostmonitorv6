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
                'name' => 'UTHM Kampus Parit Raja',
                'code' => 'PR',
                'description' => 'Kampus Parit Raja',
                'address' => '',
                'latitude' => 1.8542,
                'longitude' => 103.0839,
                'is_active' => true,
            ],
            [
                'name' => 'UTHM Kampus Pagoh',
                'code' => 'PH',
                'description' => 'Kampus Pagoh',
                'address' => '',
                'latitude' => 2.1459,
                'longitude' => 102.7608,
                'is_active' => true,
            ],
            [
                'name' => 'UTHM Kampus Bandar',
                'code' => 'BR',
                'description' => 'Kampus Bandar',
                'address' => '',
                'latitude' => 1.8553,
                'longitude' => 102.9325,
                'is_active' => true,
            ],
            [
                'name' => 'UTHM Kampus Tanjong Laboh',
                'code' => 'TL',
                'description' => 'Kampus Tanjong Laboh',
                'address' => '',
                'latitude' => 1.8565,
                'longitude' => 103.0852,
                'is_active' => true,
            ],
            [
                'name' => 'UTHM Kampus Sungai Buloh',
                'code' => 'SB',
                'description' => 'Kampus Sungai Buloh',
                'address' => '',
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