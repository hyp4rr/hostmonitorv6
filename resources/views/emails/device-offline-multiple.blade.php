<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Device Offline Alert</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: white;
            padding: 20px;
            border-radius: 8px 8px 0 0;
            margin: -30px -30px 20px -30px;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .alert-icon {
            font-size: 32px;
        }
        .device-list {
            margin: 20px 0;
        }
        .device-item {
            background-color: #fef2f2;
            border-left: 4px solid #ef4444;
            padding: 15px;
            margin: 15px 0;
            border-radius: 4px;
        }
        .device-name {
            font-weight: 600;
            font-size: 16px;
            color: #991b1b;
            margin-bottom: 10px;
        }
        .device-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            font-size: 14px;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            padding: 4px 0;
        }
        .info-label {
            font-weight: 600;
            color: #991b1b;
        }
        .info-value {
            color: #1f2937;
        }
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            background-color: #fee2e2;
            color: #991b1b;
        }
        .action-button {
            display: inline-block;
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin-top: 20px;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 12px;
            color: #6b7280;
            text-align: center;
        }
        .timestamp {
            background-color: #f3f4f6;
            padding: 10px;
            border-radius: 4px;
            margin: 15px 0;
            font-size: 14px;
            color: #4b5563;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>
                {{ count($devices) }} Device{{ count($devices) > 1 ? 's' : '' }} Offline Alert
            </h1>
        </div>

        <p>Hello <strong>{{ $devices->first()->managedBy->name ?? 'Administrator' }}</strong>,</p>

        <p>This is an automated notification to inform you that {{ count($devices) }} device{{ count($devices) > 1 ? 's' : '' }} under your management {{ count($devices) > 1 ? 'have' : 'has' }} gone offline.</p>

        <div class="device-list">
            @foreach($devices as $device)
            <div class="device-item">
                <div class="device-name">{{ $device->name }}</div>
                <div class="device-info">
                    <div class="info-row">
                        <span class="info-label">IP Address:&nbsp;</span>
                        <span class="info-value">{{ $device->ip_address }}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Category:&nbsp;</span>
                        <span class="info-value">{{ ucfirst($device->category) }}</span>
                    </div>
                    @if($device->location)
                    <div class="info-row">
                        <span class="info-label">Location:&nbsp;</span>
                        <span class="info-value">{{ $device->location->name ?? 'N/A' }}</span>
                    </div>
                    @endif
                    @if($device->barcode)
                    <div class="info-row">
                        <span class="info-label">Barcode:&nbsp;</span>
                        <span class="info-value">{{ $device->barcode }}</span>
                    </div>
                    @endif
                    <div class="info-row">
                        <span class="info-label">Status:&nbsp;</span>
                        <span class="info-value">
                            <span class="status-badge">OFFLINE</span>
                        </span>
                    </div>
                    @if($device->offline_since)
                    <div class="info-row">
                        <span class="info-label">Offline Since:&nbsp;</span>
                        <span class="info-value">{{ $device->offline_since->format('M j, Y g:i A') }}</span>
                    </div>
                    @elseif($device->last_ping)
                    <div class="info-row">
                        <span class="info-label">Last Ping:&nbsp;</span>
                        <span class="info-value">{{ $device->last_ping->format('M j, Y g:i A') }}</span>
                    </div>
                    @else
                    <div class="info-row">
                        <span class="info-label">Status Since:&nbsp;</span>
                        <span class="info-value">{{ $device->updated_at->format('M j, Y g:i A') }}</span>
                    </div>
                    @endif
                    @if($device->offline_duration_minutes)
                    <div class="info-row">
                        <span class="info-label">Downtime:&nbsp;</span>
                        <span class="info-value">{{ \App\Helpers\FormatHelper::formatOfflineDuration($device->offline_duration_minutes) }}</span>
                    </div>
                    @elseif($device->last_ping)
                    <div class="info-row">
                        <span class="info-label">Downtime:&nbsp;</span>
                        <span class="info-value">{{ $device->last_ping->diffForHumans(now(), true) }}</span>
                    </div>
                    @else
                    <div class="info-row">
                        <span class="info-label">Downtime:&nbsp;</span>
                        <span class="info-value">{{ $device->updated_at->diffForHumans(now(), true) }}</span>
                    </div>
                    @endif
                    @if($device->branch)
                    <div class="info-row">
                        <span class="info-label">Branch:&nbsp;</span>
                        <span class="info-value">{{ $device->branch->name ?? 'N/A' }}</span>
                    </div>
                    @endif
                </div>
            </div>
            @endforeach
        </div>

        <div class="timestamp">
            <strong>Alert Time: </strong> {{ now()->timezone('Asia/Kuala_Lumpur')->format('F j, Y g:i A (MYT)') }}
        </div>

        <p><strong>Recommended Actions:</strong></p>
        <ul>
            <li>Check if the devices are powered on</li>
            <li>Verify network connectivity</li>
            <li>Check for any physical damage or loose cables</li>
            <li>Review recent changes or maintenance activities</li>
            <li>Contact IT support if the issue persists</li>
        </ul>

        <center>
            <a href="{{ config('app.url') }}/monitor/devices" class="action-button">
                View Device Dashboard
            </a>
        </center>

        <div class="footer">
            <p>This is an automated message from Host Monitor System.</p>
            <p>If you believe this is an error or need assistance, please contact your system administrator.</p>
        </div>
    </div>
</body>
</html>
