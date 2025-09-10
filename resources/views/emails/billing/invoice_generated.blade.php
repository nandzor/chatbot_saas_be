<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Invoice - {{ $invoice->invoice_number }} - {{ $appName }}</title>
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
        .invoice-icon {
            width: 60px;
            height: 60px;
            background-color: #3b82f6;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 20px;
        }
        .invoice-icon::before {
            content: "📄";
            font-size: 24px;
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
        .invoice-details {
            background-color: #f3f4f6;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
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
            color: #3b82f6;
            font-size: 24px;
            font-weight: bold;
        }
        .due-date {
            color: #f59e0b;
            font-weight: bold;
        }
        .overdue {
            color: #ef4444;
            font-weight: bold;
        }
        .cta-button {
            display: inline-block;
            background-color: #2563eb;
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
        .billing-period {
            background-color: #f0f9ff;
            border: 1px solid #bae6fd;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            text-align: center;
        }
        .billing-period h3 {
            color: #0369a1;
            margin-bottom: 10px;
        }
        .billing-period p {
            color: #0c4a6e;
            margin: 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">{{ $appName }}</div>
            <div class="invoice-icon"></div>
            <h1 class="title">New Invoice Generated</h1>
            <p class="subtitle">Invoice #{{ $invoice->invoice_number }} is ready for payment</p>
        </div>

        <div class="billing-period">
            <h3>Billing Period</h3>
            <p>{{ $invoice->period_start->format('M d, Y') }} - {{ $invoice->period_end->format('M d, Y') }}</p>
        </div>

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
                <span class="detail-label">Billing Cycle:</span>
                <span class="detail-value">{{ ucfirst($invoice->billing_cycle) }}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Invoice Date:</span>
                <span class="detail-value">{{ $invoice->invoice_date->format('M d, Y') }}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Due Date:</span>
                <span class="detail-value {{ now()->isAfter($invoice->due_date) ? 'overdue' : 'due-date' }}">
                    {{ $invoice->due_date->format('M d, Y') }}
                    @if(now()->isAfter($invoice->due_date))
                        ({{ now()->diffInDays($invoice->due_date) }} days overdue)
                    @endif
                </span>
            </div>
            @if($invoice->subscription_id)
            <div class="detail-row">
                <span class="detail-label">Subscription:</span>
                <span class="detail-value">#{{ $invoice->subscription_id }}</span>
            </div>
            @endif
        </div>

        <div style="text-align: center;">
            <a href="{{ $appUrl }}/billing/invoices/{{ $invoice->id }}" class="cta-button">View Invoice</a>
            <a href="{{ $appUrl }}/billing/pay/{{ $invoice->id }}" class="cta-button pay-button">Pay Now</a>
        </div>

        <div class="footer">
            <p>Thank you for your business!</p>
            <p>If you have any questions about this invoice, please contact our support team.</p>
            <p>
                <a href="{{ $appUrl }}/support">Support Center</a> |
                <a href="{{ $appUrl }}/contact">Contact Us</a>
            </p>
            <p>&copy; {{ date('Y') }} {{ $appName }}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
