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
        $warningDevices = Device::where('status', 'warning')->get();
        $acknowledgedDevices = Device::where('status', 'offline_ack')->get();
        
        // Create alerts for offline devices
        foreach ($offlineDevices as $device) {
            Alert::create([
                'device_id' => $device->id,
                'type' => 'device_offline',
                'severity' => 'critical',
                'category' => $device->category,
                'title' => 'Device Offline',
                'message' => "Device {$device->name} is not responding to monitoring requests",
                'status' => 'active',
                'triggered_at' => now()->subMinutes(rand(15, 120)),
                'acknowledged' => false,
                'downtime' => rand(15, 120) . ' minutes',
            ]);
        }
        
        // Create alerts for warning devices
        foreach ($warningDevices as $device) {
            Alert::create([
                'device_id' => $device->id,
                'type' => 'high_response_time',
                'severity' => 'warning',
                'category' => $device->category,
                'title' => 'High Response Time',
                'message' => "Device {$device->name} is experiencing high response time ({$device->response_time}ms)",
                'status' => 'active',
                'triggered_at' => now()->subMinutes(rand(30, 180)),
                'acknowledged' => false,
                'downtime' => rand(30, 180) . ' minutes',
            ]);
        }
        
        // Create acknowledged alerts for offline_ack devices
        foreach ($acknowledgedDevices as $device) {
            Alert::create([
                'device_id' => $device->id,
                'type' => 'scheduled_maintenance',
                'severity' => 'medium',
                'category' => $device->category,
                'title' => 'Scheduled Maintenance',
                'message' => "Device {$device->name} is offline for scheduled maintenance",
                'status' => 'acknowledged',
                'triggered_at' => now()->subHours(rand(2, 48)),
                'acknowledged' => true,
                'acknowledged_by' => $device->offline_acknowledged_by ?? 'Admin User',
                'reason' => $device->offline_reason ?? 'Scheduled maintenance',
                'acknowledged_at' => $device->offline_acknowledged_at,
                'downtime' => rand(2, 48) . ' hours',
            ]);
        }
    }
}