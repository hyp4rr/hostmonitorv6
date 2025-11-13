<?php

namespace App\Console\Commands;

use App\Mail\DeviceOfflineNotification;
use App\Mail\DailyDeviceDigest;
use App\Models\Device;
use App\Models\DeviceNotification;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class SendDeviceNotifications extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'devices:send-notifications {--digest : Send daily digest instead of real-time notifications}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check device status and send email notifications to device managers';

    /**
     * Cooldown period in minutes before sending another notification for the same device
     */
    private const NOTIFICATION_COOLDOWN_MINUTES = 0;

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $isDigestMode = $this->option('digest');
        
        if ($isDigestMode) {
            return $this->sendDailyDigest();
        } else {
            return $this->sendRealTimeNotifications();
        }
    }

    /**
     * Send daily digest at 9 AM
     */
    private function sendDailyDigest()
    {
        $this->info('Sending daily device digest...');

        // Reset daily digest flags for all devices
        Device::where('daily_digest_sent', true)->get()->each(function ($device) {
            $device->resetDailyDigest();
        });

        // Get all offline devices that have a managed_by user
        $offlineDevices = Device::where('status', 'offline')
            ->whereNotNull('managed_by')
            ->with(['managedBy', 'branch', 'location'])
            ->get();

        if ($offlineDevices->isEmpty()) {
            $this->info('No offline devices found. No digest sent.');
            return Command::SUCCESS;
        }

        // Group devices by user
        $devicesByUser = $offlineDevices->groupBy('managed_by');
        
        $digestsSent = 0;

        foreach ($devicesByUser as $userId => $devices) {
            $user = $devices->first()->managedBy;
            
            // Check if user has email
            if (!$user || !$user->email) {
                $this->warn("User ID {$userId} has no email address. Skipping digest for {$devices->count()} devices...");
                continue;
            }

            try {
                // Send individual daily digest to each user
                Mail::to($user->email)->send(new DailyDeviceDigest($devices));
                
                // Mark devices as included in digest
                foreach ($devices as $device) {
                    $device->daily_digest_sent = true;
                    $device->save();
                }
                
                $digestsSent++;
                $this->info("✓ Daily digest sent to {$user->name} with {$devices->count()} offline devices");
            } catch (\Exception $e) {
                $this->error("✗ Failed to send daily digest to {$user->name}: {$e->getMessage()}");
            }
        }

        $this->info("Daily digest complete: {$digestsSent} users notified");
        return Command::SUCCESS;
    }

    /**
     * Send real-time notifications during business hours (9 AM - 5 PM Malaysia time)
     */
    private function sendRealTimeNotifications()
    {
        $this->info('Checking devices for real-time notifications...');

        // Check if current time is within business hours (9 AM - 5 PM Malaysia time)
        $currentHour = now()->timezone('Asia/Kuala_Lumpur')->hour;
        if ($currentHour < 9 || $currentHour >= 17) {
            $this->info('Outside business hours (9 AM - 5 PM Malaysia time). Skipping real-time notifications.');
            return Command::SUCCESS;
        }

        // Get all offline devices that have been offline for more than 5 minutes
        $offlineDevices = Device::where('status', 'offline')
            ->whereNotNull('managed_by')
            ->with(['managedBy', 'branch', 'location'])
            ->get()
            ->filter(function ($device) {
                return $device->isOfflineForMoreThan(5) && $device->shouldSendNotification();
            });

        if ($offlineDevices->isEmpty()) {
            $this->info('No devices requiring real-time notifications.');
            return Command::SUCCESS;
        }

        // Group devices by user
        $devicesByUser = $offlineDevices->groupBy('managed_by');
        
        $notificationsSent = 0;

        foreach ($devicesByUser as $userId => $devices) {
            $user = $devices->first()->managedBy;
            
            // Check if user has email
            if (!$user || !$user->email) {
                $this->warn("User ID {$userId} has no email address. Skipping {$devices->count()} devices...");
                continue;
            }

            try {
                // Send combined email notification for real-time alerts
                Mail::to($user->email)
                    ->send(new DeviceOfflineNotification($devices));

                // Mark notifications as sent and record them
                foreach ($devices as $device) {
                    $device->markNotificationSent();
                    
                    DeviceNotification::create([
                        'device_id' => $device->id,
                        'notification_type' => 'offline',
                        'recipient_email' => $user->email,
                        'sent_at' => now(),
                    ]);
                }

                $notificationsSent += $devices->count();
                $this->info("✓ Sent real-time notification for {$devices->count()} devices to {$user->email}");
            } catch (\Exception $e) {
                $this->error("✗ Failed to send notification for {$user->name}: {$e->getMessage()}");
            }
        }

        $this->info("\nReal-time Notification Summary:");
        $this->info("- Devices requiring notification: {$offlineDevices->count()}");
        $this->info("- Notifications sent: {$notificationsSent}");

        return Command::SUCCESS;
    }
}
