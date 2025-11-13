<?php

namespace App\Mail;

use App\Models\Device;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class DeviceStatusChange extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * The device instance.
     *
     * @var \App\Models\Device
     */
    public $device;

    /**
     * The status change data.
     *
     * @var array
     */
    public $changeData;

    /**
     * Create a new message instance.
     */
    public function __construct(Device $device, array $changeData)
    {
        $this->device = $device;
        $this->changeData = $changeData;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $statusIcon = $this->changeData['new_status'] === 'offline' ? '🔴' : '🟢';
        $statusText = ucfirst($this->changeData['new_status']);
        
        return new Envelope(
            subject: "{$statusIcon} Device Status Change: {$this->device->name} is now {$statusText}",
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.device-status-change',
            with: [
                'device' => $this->device,
                'changeData' => $this->changeData,
                'previousStatus' => ucfirst($this->changeData['previous_status']),
                'newStatus' => ucfirst($this->changeData['new_status']),
                'changeTime' => \Carbon\Carbon::parse($this->changeData['timestamp'])->setTimezone('Asia/Kuala_Lumpur'),
                'isCritical' => $this->changeData['previous_status'] === 'online' && $this->changeData['new_status'] === 'offline',
            ]
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
