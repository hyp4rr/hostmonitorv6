<?php

use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Route;

Route::get('/test-mail', function () {
    try {
        Mail::raw('Test email content', function ($message) {
            $message->to('hyperskeleton20@gmail.com')
                   ->subject('Test Email from Host Monitor')
                   ->from('noreply@hostmonitor.com', 'Host Monitor System');
        });
        
        return 'Email sent successfully! Check your Mailtrap dashboard.';
    } catch (\Exception $e) {
        return 'Error sending email: ' . $e->getMessage();
    }
});
