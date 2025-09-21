<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Organization Email</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
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
            color: #4f46e5;
            margin-bottom: 10px;
        }
        .title {
            font-size: 28px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 20px;
        }
        .content {
            margin-bottom: 30px;
        }
        .button {
            display: inline-block;
            background-color: #4f46e5;
            color: #ffffff;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            text-align: center;
            margin: 20px 0;
        }
        .button:hover {
            background-color: #4338ca;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 14px;
            color: #6b7280;
            text-align: center;
        }
        .warning {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            color: #92400e;
        }
        .expires {
            font-size: 14px;
            color: #6b7280;
            margin-top: 10px;
        }
        .organization-info {
            background-color: #f0f9ff;
            border: 1px solid #0ea5e9;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
        }
        .organization-info h3 {
            margin: 0 0 10px 0;
            color: #0c4a6e;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">Chatbot SaaS</div>
            <h1 class="title">Verify Your Organization Email</h1>
        </div>

        <div class="content">
            <p>Hello <strong>{{ $user->full_name }}</strong>,</p>

            <p>Thank you for registering your organization with Chatbot SaaS! To complete your organization registration and activate your admin account, please verify your email address by clicking the button below:</p>

            <div class="organization-info">
                <h3>Organization Details</h3>
                <p><strong>Organization:</strong> {{ $organization->name }}</p>
                <p><strong>Organization Code:</strong> {{ $organization->org_code }}</p>
                <p><strong>Admin Email:</strong> {{ $user->email }}</p>
            </div>

            <div style="text-align: center;">
                <a href="{{ $verificationUrl }}" class="button">Verify Organization Email</a>
            </div>

            <div class="warning">
                <strong>Important:</strong> This verification link will expire in 24 hours for security reasons. After verification, your organization will be activated and you can start using our chatbot platform.
            </div>

            <p>If the button above doesn't work, you can copy and paste the following link into your browser:</p>
            <p style="word-break: break-all; background-color: #f3f4f6; padding: 10px; border-radius: 4px; font-family: monospace;">
                {{ $verificationUrl }}
            </p>

            <div class="expires">
                <strong>Expires:</strong> {{ $expiresAt->format('F j, Y \a\t g:i A T') }}
            </div>

            <p>After verification, you will be able to:</p>
            <ul>
                <li>Access your organization dashboard</li>
                <li>Create and manage chatbots</li>
                <li>Invite team members</li>
                <li>Configure organization settings</li>
                <li>Start your 14-day free trial</li>
            </ul>
        </div>

        <div class="footer">
            <p>If you didn't register an organization with Chatbot SaaS, please ignore this email.</p>
            <p>This email was sent to {{ $user->email }}. If you have any questions, please contact our support team.</p>
            <p>&copy; {{ date('Y') }} Chatbot SaaS. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
