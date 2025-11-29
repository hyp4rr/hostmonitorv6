<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Queue\SerializesModels;

class ReportEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $reportData;
    public $reportType;
    public $startDate;
    public $endDate;
    public $categories;
    public $fileName;

    /**
     * Create a new message instance.
     */
    public function __construct($reportData, $reportType, $startDate, $endDate, $categories, $fileName)
    {
        $this->reportData = $reportData;
        $this->reportType = $reportType;
        $this->startDate = $startDate;
        $this->endDate = $endDate;
        $this->categories = $categories;
        $this->fileName = $fileName;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $categoryText = count($this->categories) > 0 
            ? implode(', ', array_map('ucfirst', $this->categories))
            : 'All Devices';
        
        $reportTypeNames = [
            'uptime' => 'Uptime',
            'sla' => 'SLA',
            'incidents' => 'Incident',
            'comprehensive' => 'Comprehensive',
        ];
        
        $reportTypeName = $reportTypeNames[$this->reportType] ?? 'Device';
        
        return new Envelope(
            subject: "📊 {$reportTypeName} Report - {$categoryText} ({$this->startDate} to {$this->endDate})",
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.report',
            with: [
                'reportType' => $this->reportType,
                'startDate' => $this->startDate,
                'endDate' => $this->endDate,
                'categories' => $this->categories,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     */
    public function attachments(): array
    {
        if ($this->fileName && file_exists(storage_path("app/reports/{$this->fileName}"))) {
            return [
                Attachment::fromPath(storage_path("app/reports/{$this->fileName}"))
                    ->as($this->fileName)
                    ->withMime('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'),
            ];
        }
        
        return [];
    }
}

