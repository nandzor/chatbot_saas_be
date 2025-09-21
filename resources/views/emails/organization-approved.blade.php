<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Organization Approved</title>
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
            color: #059669;
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
        .success-box {
            background-color: #d1fae5;
            border: 1px solid #10b981;
            border-radius: 6px;
            padding: 20px;
            margin: 20px 0;
            color: #065f46;
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
        .features {
            background-color: #fefce8;
            border: 1px solid #eab308;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
        }
        .features h3 {
            margin: 0 0 10px 0;
            color: #a16207;
        }
        .features ul {
            margin: 0;
            padding-left: 20px;
        }
        .features li {
            margin-bottom: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">Chatbot SaaS</div>
            <h1 class="title">🎉 Congratulations!</h1>
        </div>

        <div class="content">
            <p>Hello <strong>{{ $user->full_name }}</strong>,</p>

            <div class="success-box">
                <h2 style="margin: 0 0 10px 0; color: #065f46;">✅ Organization Approved!</h2>
                <p style="margin: 0;">Your organization registration has been reviewed and approved by our team. You can now access your organization dashboard and start using our chatbot platform.</p>
            </div>

            <div class="organization-info">
                <h3>Organization Details</h3>
                <p><strong>Organization:</strong> {{ $organization->name }}</p>
                <p><strong>Organization Code:</strong> {{ $organization->org_code }}</p>
                <p><strong>Status:</strong> <span style="color: #059669; font-weight: bold;">Active</span></p>
                <p><strong>Trial Period:</strong> 14 days (starts now)</p>
            </div>

            <div style="text-align: center;">
                <a href="{{ $loginUrl }}" class="button">Access Your Dashboard</a>
            </div>

            <div class="features">
                <h3>🚀 What You Can Do Now:</h3>
                <ul>
                    <li><strong>Create Chatbots:</strong> Build and customize your AI chatbots</li>
                    <li><strong>Manage Team:</strong> Invite team members and assign roles</li>
                    <li><strong>Configure Settings:</strong> Customize your organization settings</li>
                    <li><strong>Integrate APIs:</strong> Connect with your existing systems</li>
                    <li><strong>Monitor Analytics:</strong> Track chatbot performance and usage</li>
                    <li><strong>Set Up Webhooks:</strong> Receive real-time notifications</li>
                </ul>
            </div>

            <p><strong>Next Steps:</strong></p>
            <ol>
                <li>Log in to your dashboard using your admin credentials</li>
                <li>Complete your organization profile setup</li>
                <li>Create your first chatbot</li>
                <li>Invite team members to collaborate</li>
                <li>Explore our documentation and tutorials</li>
            </ol>

            <p>If you have any questions or need assistance getting started, our support team is here to help!</p>
        </div>

        <div class="footer">
            <p>Welcome to Chatbot SaaS! We're excited to help you build amazing chatbot experiences.</p>
            <p>This email was sent to {{ $user->email }}. If you have any questions, please contact our{' '}
                <a href="{{ $loginUrl }}/support" style="color: #4f46e5;">support team</a>.
            </p>
            <p>&copy; {{ date('Y') }} Chatbot SaaS. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
