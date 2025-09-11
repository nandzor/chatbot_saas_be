<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $subject ?? $notification->title }}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #f0f0f0;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
        }
        .title {
            font-size: 22px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 20px;
        }
        .message {
            font-size: 16px;
            line-height: 1.8;
            color: #4b5563;
            margin-bottom: 30px;
        }
        .organization-info {
            background-color: #f8fafc;
            padding: 20px;
            border-radius: 6px;
            border-left: 4px solid #2563eb;
            margin: 20px 0;
        }
        .organization-info h3 {
            margin: 0 0 10px 0;
            color: #1f2937;
            font-size: 16px;
        }
        .organization-info p {
            margin: 5px 0;
            color: #6b7280;
            font-size: 14px;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            font-size: 14px;
            color: #6b7280;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #2563eb;
            color: #ffffff;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
        }
        .button:hover {
            background-color: #1d4ed8;
        }
        .notification-type {
            display: inline-block;
            padding: 4px 12px;
            background-color: #e0e7ff;
            color: #3730a3;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            margin-bottom: 15px;
        }
        .timestamp {
            font-size: 12px;
            color: #9ca3af;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">{{ config('app.name', 'ChatBot SaaS') }}</div>
            <div class="notification-type">{{ $notification->type }}</div>
        </div>

        <h1 class="title">{{ $notification->title }}</h1>

        <div class="message">
            {!! nl2br(e($notification->message)) !!}
        </div>

        @if($notification->data && is_array($notification->data))
            @if(isset($notification->data['action_url']) && $notification->data['action_url'])
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{{ $notification->data['action_url'] }}" class="button">
                        {{ $notification->data['action_text'] ?? 'Take Action' }}
                    </a>
                </div>
            @endif

            @if(isset($notification->data['additional_info']) && $notification->data['additional_info'])
                <div class="organization-info">
                    <h3>Additional Information</h3>
                    @foreach($notification->data['additional_info'] as $key => $value)
                        <p><strong>{{ ucfirst(str_replace('_', ' ', $key)) }}:</strong> {{ $value }}</p>
                    @endforeach
                </div>
            @endif
        @endif

        <div class="organization-info">
            <h3>Organization Details</h3>
            <p><strong>Organization:</strong> {{ $organization->name }}</p>
            <p><strong>Code:</strong> {{ $organization->code }}</p>
            <p><strong>Email:</strong> {{ $organization->email }}</p>
            <p><strong>Status:</strong> {{ ucfirst($organization->status) }}</p>
        </div>

        <div class="timestamp">
            Sent on {{ $notification->sent_at->format('F j, Y \a\t g:i A') }}
        </div>

        <div class="footer">
            <p>This email was sent to {{ $organization->email }} from {{ config('app.name') }}.</p>
            <p>If you have any questions, please contact our support team.</p>
            <p>&copy; {{ date('Y') }} {{ config('app.name') }}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
