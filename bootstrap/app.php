<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Console\Scheduling\Schedule;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

       $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);
        
        // Completely disable CSRF for all routes
        $middleware->validateCsrfTokens(except: [
            '*',
            'ping-all-simple',
            'ping-all-devices',
            'api/*',
            'monitoring/*',
        ]);
    })
    ->withSchedule(function (Schedule $schedule): void {
        // Update device uptime every minute
        $schedule->command('devices:update-uptime')->everyMinute();
        
        // Send device offline notifications every 5 minutes
        $schedule->command('devices:send-notifications')->everyFiveMinutes();
        
        // DISABLED: Ping all devices every 5 minutes
        // $schedule->command('devices:ping-all')
        //          ->everyFiveMinutes()
        //          ->description('Ping all devices and update their status and last_ping timestamp')
        //          ->withoutOverlapping();
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
