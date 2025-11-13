<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // Send daily digest at 9 AM Malaysia time every day
        $schedule->command('devices:send-notifications --digest')
                 ->dailyAt('09:00')
                 ->timezone('Asia/Kuala_Lumpur')
                 ->description('Send daily device digest at 9 AM Malaysia time');

        // Check for real-time notifications every minute during business hours (9 AM - 5 PM Malaysia time)
        $schedule->command('devices:send-notifications')
                 ->everyMinute()
                 ->between('09:00', '16:59')
                 ->timezone('Asia/Kuala_Lumpur')
                 ->description('Check for real-time device notifications during business hours (Malaysia time)');

        // Fast device monitoring every 30 seconds
        $schedule->command('devices:monitor')
                 ->everyThirtySeconds()
                 ->description('Fast device monitoring every 30 seconds')
                 ->withoutOverlapping();

        // Continuous monitoring (backup - every 2 minutes)
        $schedule->command('devices:monitor --continuous --interval=120')
                 ->everyTwoMinutes()
                 ->description('Continuous device monitoring backup')
                 ->withoutOverlapping();

        // Update device uptime calculations every minute
        $schedule->command('devices:update-uptime')
                 ->everyMinute()
                 ->description('Update device uptime calculations based on monitoring history')
                 ->withoutOverlapping();
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
