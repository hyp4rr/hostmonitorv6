<?php

namespace Database\Seeders;

use App\Models\Alert;
use App\Models\Device;
use Illuminate\Database\Seeder;

class AlertSeeder extends Seeder
{
    public function run(): void
    {
        $offlineDevices = Device::where('status', 'offline')->get();
        $acknowledgedDevices = Device::where('status', 'offline_ack')->get();
        
        foreach ($offlineDevices as $device) {
            Alert::create([
                'device_id' => $device->id,
                'severity' => 'critical',
                'category' => $device->category,
                'triggered_at' => now()->subMinutes(rand(15, 120)),
                'acknowledged' => false,
                'downtime' => rand(15, 120) . ' minutes',
            ]);
        }
        
        foreach ($acknowledgedDevices as $device) {
            Alert::create([
                'device_id' => $device->id,
                'severity' => 'medium',
                'category' => $device->category,
                'triggered_at' => now()->subHours(rand(2, 48)),
                'acknowledged' => true,
                'acknowledged_by' => 'Admin User',
                'reason' => $device->offline_reason ?? 'Scheduled maintenance',
                'acknowledged_at' => $device->offline_acknowledged_at,
                'downtime' => rand(2, 48) . ' hours',
            ]);
        }
    }
}