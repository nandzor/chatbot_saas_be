<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice Overdue - {{ $invoice->invoice_number }} - {{ $appName }}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 40px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
        }
        .warning-icon {
            width: 60px;
            height: 60px;
            background-color: #f59e0b;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 20px;
        }
        .warning-icon::before {
            content: "⚠";
            color: white;
            font-size: 24px;
            font-weight: bold;
        }
        .title {
            font-size: 28px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 10px;
        }
        .subtitle {
            font-size: 16px;
            color: #6b7280;
            margin-bottom: 30px;
        }
        .overdue-alert {
            background-color: #fef3c7;
            border: 2px solid #f59e0b;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
            text-align: center;
        }
        .overdue-alert h2 {
            color: #92400e;
            margin-bottom: 10px;
        }
        .overdue-alert p {
            color: #92400e;
            font-weight: 500;
            margin: 0;
        }
        .invoice-details {
            background-color: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 8px 0;
            border-bottom: 1px solid #fecaca;
        }
        .detail-row:last-child {
            border-bottom: none;
            font-weight: bold;
            font-size: 18px;
            color: #1f2937;
        }
        .detail-label {
            color: #6b7280;
            font-weight: 500;
        }
        .detail-value {
            color: #1f2937;
            font-weight: 600;
        }
        .amount {
            color: #ef4444;
            font-size: 24px;
            font-weight: bold;
        }
        .overdue-days {
            color: #ef4444;
            font-weight: bold;
            font-size: 18px;
        }
        .cta-button {
            display: inline-block;
            background-color: #ef4444;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
        }
        .pay-button {
            background-color: #10b981;
            margin-left: 10px;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
        }
        .footer a {
            color: #2563eb;
            text-decoration: none;
        }
        .consequences {
            background-color: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 6px;
            padding: 20px;
            margin: 20px 0;
        }
        .consequences h3 {
            color: #dc2626;
            margin-bottom: 15px;
        }
        .consequences ul {
            margin: 0;
            padding-left: 20px;
        }
        .consequences li {
            margin-bottom: 8px;
            color: #7f1d1d;
        }
        .urgent-notice {
            background-color: #dc2626;
            color: white;
            padding: 15px;
            border-radius: 6px;
            text-align: center;
            margin: 20px 0;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">{{ $appName }}</div>
            <div class="warning-icon"></div>
            <h1 class="title">Invoice Overdue</h1>
            <p class="subtitle">Immediate action required</p>
        </div>

        <div class="overdue-alert">
            <h2>⚠️ Payment Overdue</h2>
            <p>This invoice is {{ $overdueDays }} days past due</p>
        </div>

        @if($overdueDays >= 30)
        <div class="urgent-notice">
            URGENT: This invoice is {{ $overdueDays }} days overdue. Please pay immediately to avoid service suspension.
        </div>
        @endif

        <div class="invoice-details">
            <div class="detail-row">
                <span class="detail-label">Invoice Number:</span>
                <span class="detail-value">#{{ $invoice->invoice_number }}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Amount:</span>
                <span class="detail-value amount">{{ number_format($invoice->total_amount, 2) }} {{ strtoupper($invoice->currency) }}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Due Date:</span>
                <span class="detail-value overdue-days">{{ $invoice->due_date->format('M d, Y') }}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Days Overdue:</span>
                <span class="detail-value overdue-days">{{ $overdueDays }} days</span>
            </div>
            @if($invoice->subscription_id)
            <div class="detail-row">
                <span class="detail-label">Subscription:</span>
                <span class="detail-value">#{{ $invoice->subscription_id }}</span>
            </div>
            @endif
        </div>

        @if($overdueDays >= 7)
        <div class="consequences">
            <h3>⚠️ Important Notice</h3>
            <ul>
                @if($overdueDays >= 30)
                <li>Your subscription may be suspended due to non-payment</li>
                <li>Service access may be restricted</li>
                @elseif($overdueDays >= 14)
                <li>Your subscription status has been changed to "Past Due"</li>
                <li>Service may be suspended if payment is not received soon</li>
                @else
                <li>Your subscription status has been changed to "Past Due"</li>
                @endif
                <li>Late fees may apply</li>
                <li>Credit score may be affected</li>
            </ul>
        </div>
        @endif

        <div style="text-align: center;">
            <a href="{{ $appUrl }}/billing/invoices/{{ $invoice->id }}" class="cta-button">View Invoice</a>
            <a href="{{ $appUrl }}/billing/pay/{{ $invoice->id }}" class="cta-button pay-button">Pay Now</a>
        </div>

        <div class="footer">
            <p><strong>Need immediate assistance?</strong> Contact our support team right away.</p>
            <p>
                <a href="{{ $appUrl }}/support">Support Center</a> |
                <a href="{{ $appUrl }}/contact">Contact Us</a>
            </p>
            <p>&copy; {{ date('Y') }} {{ $appName }}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
