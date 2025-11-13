<?php

namespace App\Mail;

use App\Models\Device;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class DeviceOfflineNotification extends Mailable
{
    use Queueable, SerializesModels;

    public $devices;

    /**
     * Create a new message instance.
     */
    public function __construct($devices)
    {
        $this->devices = $devices;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $deviceCount = is_countable($this->devices) ? count($this->devices) : 1;
        return new Envelope(
            subject: "🔴 {$deviceCount} Device" . ($deviceCount > 1 ? 's' : '') . " Offline Alert",
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.device-offline-multiple',
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
