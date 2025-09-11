<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Welcome to {{ config('app.name') }}!</title>
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
            font-size: 28px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
        }
        .welcome-badge {
            display: inline-block;
            padding: 8px 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 25px;
            font-size: 14px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 20px;
        }
        .title {
            font-size: 28px;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 20px;
            text-align: center;
        }
        .subtitle {
            font-size: 18px;
            color: #6b7280;
            text-align: center;
            margin-bottom: 30px;
        }
        .message {
            font-size: 16px;
            line-height: 1.8;
            color: #4b5563;
            margin-bottom: 30px;
        }
        .organization-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 25px;
            border-radius: 10px;
            margin: 30px 0;
            text-align: center;
        }
        .organization-card h3 {
            margin: 0 0 15px 0;
            font-size: 20px;
            font-weight: 600;
        }
        .organization-card p {
            margin: 8px 0;
            opacity: 0.9;
        }
        .features {
            margin: 30px 0;
        }
        .features h3 {
            color: #1f2937;
            font-size: 18px;
            margin-bottom: 20px;
            text-align: center;
        }
        .feature-list {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
        }
        .feature-item {
            background-color: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #2563eb;
        }
        .feature-item h4 {
            margin: 0 0 10px 0;
            color: #1f2937;
            font-size: 16px;
        }
        .feature-item p {
            margin: 0;
            color: #6b7280;
            font-size: 14px;
        }
        .button {
            display: inline-block;
            padding: 15px 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            text-align: center;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }
        .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }
        .next-steps {
            background-color: #f0f9ff;
            padding: 25px;
            border-radius: 8px;
            border: 1px solid #e0f2fe;
            margin: 30px 0;
        }
        .next-steps h3 {
            color: #0c4a6e;
            margin: 0 0 15px 0;
            font-size: 18px;
        }
        .next-steps ol {
            color: #164e63;
            margin: 15px 0;
            padding-left: 20px;
        }
        .next-steps li {
            margin: 8px 0;
            line-height: 1.6;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            font-size: 14px;
            color: #6b7280;
        }
        .social-links {
            margin: 20px 0;
        }
        .social-links a {
            display: inline-block;
            margin: 0 10px;
            color: #6b7280;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">{{ config('app.name', 'ChatBot SaaS') }}</div>
            <div class="welcome-badge">Welcome Aboard!</div>
        </div>

        <h1 class="title">🎉 Welcome to {{ config('app.name') }}!</h1>
        <p class="subtitle">Your journey to intelligent conversations starts here</p>

        <div class="message">
            <p>Dear {{ $organization->name }} team,</p>
            <p>We're absolutely thrilled to have you join our community! Your organization has been successfully registered and you're now ready to experience the power of AI-driven chatbot solutions.</p>
        </div>

        <div class="organization-card">
            <h3>🏢 {{ $organization->name }}</h3>
            <p><strong>Organization Code:</strong> {{ $organization->code }}</p>
            <p><strong>Contact Email:</strong> {{ $organization->email }}</p>
            <p><strong>Status:</strong> {{ ucfirst($organization->status) }}</p>
            <p><strong>Subscription:</strong> {{ ucfirst($organization->subscription_status ?? 'Trial') }}</p>
        </div>

        <div class="features">
            <h3>🚀 What you can do with {{ config('app.name') }}</h3>
            <div class="feature-list">
                <div class="feature-item">
                    <h4>🤖 Intelligent Chatbots</h4>
                    <p>Create and deploy AI-powered chatbots that understand and respond naturally to your customers.</p>
                </div>
                <div class="feature-item">
                    <h4>📊 Analytics & Insights</h4>
                    <p>Get detailed analytics on conversations, user engagement, and bot performance.</p>
                </div>
                <div class="feature-item">
                    <h4>🔧 Easy Integration</h4>
                    <p>Seamlessly integrate with your existing systems via our robust API and webhooks.</p>
                </div>
                <div class="feature-item">
                    <h4>👥 Team Collaboration</h4>
                    <p>Collaborate with your team members and manage permissions effectively.</p>
                </div>
            </div>
        </div>

        <div class="next-steps">
            <h3>🎯 Next Steps to Get Started</h3>
            <ol>
                <li><strong>Log in to your dashboard</strong> and explore the interface</li>
                <li><strong>Create your first chatbot</strong> using our intuitive bot builder</li>
                <li><strong>Train your bot</strong> with your knowledge base and FAQs</li>
                <li><strong>Test and deploy</strong> your chatbot to your website or app</li>
                <li><strong>Monitor performance</strong> using our analytics dashboard</li>
            </ol>
        </div>

        <div style="text-align: center; margin: 40px 0;">
            <a href="{{ $data['dashboard_url'] ?? config('app.url') }}" class="button">
                🚀 Access Your Dashboard
            </a>
        </div>

        @if(isset($data['trial_info']) && $data['trial_info'])
            <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 30px 0;">
                <h4 style="margin: 0 0 10px 0; color: #92400e;">⏰ Trial Information</h4>
                <p style="margin: 0; color: #b45309;">You're currently on a {{ $data['trial_info']['duration'] ?? '30-day' }} trial. Explore all our features and upgrade anytime to continue enjoying our services!</p>
            </div>
        @endif

        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #22c55e; margin: 30px 0;">
            <h4 style="margin: 0 0 10px 0; color: #166534;">💬 Need Help?</h4>
            <p style="margin: 0; color: #166534;">Our support team is here to help you succeed. Don't hesitate to reach out if you have any questions or need assistance getting started.</p>
        </div>

        <div class="footer">
            <p><strong>Thank you for choosing {{ config('app.name') }}!</strong></p>
            <p>We're excited to see what amazing chatbots you'll create.</p>

            <div class="social-links">
                <a href="{{ $data['support_url'] ?? '#' }}">Support Center</a> |
                <a href="{{ $data['documentation_url'] ?? '#' }}">Documentation</a> |
                <a href="{{ $data['community_url'] ?? '#' }}">Community</a>
            </div>

            <p style="margin-top: 30px;">
                This email was sent to {{ $organization->email }} from {{ config('app.name') }}.<br>
                &copy; {{ date('Y') }} {{ config('app.name') }}. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
