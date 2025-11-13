<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class DailyDeviceDigest extends Mailable
{
    use Queueable, SerializesModels;

    public $devices;
    public $user;

    /**
     * Create a new message instance.
     */
    public function __construct($devices)
    {
        // Extract the user from the first device
        $this->user = $devices->first()->managedBy;
        $this->devices = $devices;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $deviceCount = $this->devices->count();
        $userName = $this->user->name ?? 'User';
        
        return new Envelope(
            subject: "📊 Daily Device Digest for {$userName}: {$deviceCount} Offline Device" . ($deviceCount > 1 ? 's' : ''),
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.daily-device-digest',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
