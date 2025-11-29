<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Device Report</title>
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
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 20px;
            border-radius: 8px 8px 0 0;
            margin: -30px -30px 20px -30px;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .info-section {
            background-color: #f9fafb;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
        }
        .info-row:last-child {
            border-bottom: none;
        }
        .info-label {
            font-weight: 600;
            color: #4b5563;
        }
        .info-value {
            color: #1f2937;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 12px;
            color: #6b7280;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Device Report</h1>
        </div>

        <p>Hello,</p>

        <p>Please find attached the requested device report.</p>

        <div class="info-section">
            <div class="info-row">
                <span class="info-label">Report Type:</span>
                <span class="info-value">{{ ucfirst($reportType) }} Report</span>
            </div>
            <div class="info-row">
                <span class="info-label">Date Range:</span>
                <span class="info-value">{{ $startDate }} to {{ $endDate }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Categories:</span>
                <span class="info-value">{{ implode(', ', array_map('ucfirst', $categories)) }}</span>
            </div>
        </div>

        <p>The detailed report is attached as an Excel (.xlsx) file. You can open it in Microsoft Excel, Google Sheets, or any compatible spreadsheet application.</p>

        <div class="footer">
            <p>This is an automated message from Host Monitor System.</p>
            <p>Generated on {{ now()->timezone('Asia/Kuala_Lumpur')->format('F j, Y g:i A (MYT)') }}</p>
        </div>
    </div>
</body>
</html>

