<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Failed - {{ $appName }}</title>
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
        .error-icon {
            width: 60px;
            height: 60px;
            background-color: #ef4444;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 20px;
        }
        .error-icon::before {
            content: "✗";
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
        .payment-details {
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
        .failure-reason {
            background-color: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            color: #dc2626;
            font-weight: 500;
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
        .retry-button {
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
        .help-section {
            background-color: #f3f4f6;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .help-section h3 {
            color: #1f2937;
            margin-bottom: 15px;
        }
        .help-section ul {
            margin: 0;
            padding-left: 20px;
        }
        .help-section li {
            margin-bottom: 8px;
            color: #6b7280;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">{{ $appName }}</div>
            <div class="error-icon"></div>
            <h1 class="title">Payment Failed</h1>
            <p class="subtitle">We were unable to process your payment</p>
        </div>

        <div class="payment-details">
            <div class="detail-row">
                <span class="detail-label">Transaction ID:</span>
                <span class="detail-value">#{{ $payment->id }}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Amount:</span>
                <span class="detail-value amount">{{ number_format($payment->amount, 2) }} {{ strtoupper($payment->currency) }}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Payment Method:</span>
                <span class="detail-value">{{ ucfirst($payment->gateway) }}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Date:</span>
                <span class="detail-value">{{ $payment->created_at->format('M d, Y H:i') }}</span>
            </div>
            @if($payment->subscription_id)
            <div class="detail-row">
                <span class="detail-label">Subscription:</span>
                <span class="detail-value">#{{ $payment->subscription_id }}</span>
            </div>
            @endif
        </div>

        @if($payment->failure_reason)
        <div class="failure-reason">
            <strong>Failure Reason:</strong> {{ $payment->failure_reason }}
        </div>
        @endif

        <div class="help-section">
            <h3>What can you do?</h3>
            <ul>
                <li>Check your payment method details and try again</li>
                <li>Ensure you have sufficient funds in your account</li>
                <li>Contact your bank if the issue persists</li>
                <li>Try using a different payment method</li>
                <li>Contact our support team for assistance</li>
            </ul>
        </div>

        <div style="text-align: center;">
            <a href="{{ $appUrl }}/dashboard" class="cta-button">View Dashboard</a>
            <a href="{{ $appUrl }}/billing/retry-payment/{{ $payment->id }}" class="cta-button retry-button">Retry Payment</a>
        </div>

        <div class="footer">
            <p>Need help? Our support team is here to assist you.</p>
            <p>
                <a href="{{ $appUrl }}/support">Support Center</a> |
                <a href="{{ $appUrl }}/contact">Contact Us</a>
            </p>
            <p>&copy; {{ date('Y') }} {{ $appName }}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
