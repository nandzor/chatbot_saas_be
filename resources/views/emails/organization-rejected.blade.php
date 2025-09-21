<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Organization Registration Update</title>
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
            color: #dc2626;
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
        .rejection-box {
            background-color: #fee2e2;
            border: 1px solid #ef4444;
            border-radius: 6px;
            padding: 20px;
            margin: 20px 0;
            color: #991b1b;
        }
        .organization-info {
            background-color: #f3f4f6;
            border: 1px solid #9ca3af;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
        }
        .organization-info h3 {
            margin: 0 0 10px 0;
            color: #374151;
        }
        .reason-box {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
        }
        .reason-box h3 {
            margin: 0 0 10px 0;
            color: #92400e;
        }
        .next-steps {
            background-color: #e0f2fe;
            border: 1px solid #0ea5e9;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
        }
        .next-steps h3 {
            margin: 0 0 10px 0;
            color: #0c4a6e;
        }
        .next-steps ul {
            margin: 0;
            padding-left: 20px;
        }
        .next-steps li {
            margin-bottom: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">Chatbot SaaS</div>
            <h1 class="title">Registration Update</h1>
        </div>

        <div class="content">
            <p>Hello <strong>{{ $user->full_name }}</strong>,</p>

            <div class="rejection-box">
                <h2 style="margin: 0 0 10px 0; color: #991b1b;">❌ Registration Not Approved</h2>
                <p style="margin: 0;">We regret to inform you that your organization registration could not be approved at this time. Please see the details below.</p>
            </div>

            <div class="organization-info">
                <h3>Organization Details</h3>
                <p><strong>Organization:</strong> {{ $organization->name }}</p>
                <p><strong>Organization Code:</strong> {{ $organization->org_code }}</p>
                <p><strong>Status:</strong> <span style="color: #dc2626; font-weight: bold;">Not Approved</span></p>
                <p><strong>Registration Date:</strong> {{ $organization->created_at->format('F j, Y') }}</p>
            </div>

            <div class="reason-box">
                <h3>Reason for Rejection</h3>
                <p>{{ $reason }}</p>
            </div>

            <div class="next-steps">
                <h3>🔄 What You Can Do Next</h3>
                <ul>
                    <li><strong>Review the reason:</strong> Please carefully review the reason provided above</li>
                    <li><strong>Address the issues:</strong> Make necessary corrections or provide additional information</li>
                    <li><strong>Re-apply:</strong> You can submit a new registration with the required information</li>
                    <li><strong>Contact support:</strong> If you have questions, our support team can help clarify requirements</li>
                    <li><strong>Provide documentation:</strong> Ensure all required business documents are valid and up-to-date</li>
                </ul>
            </div>

            <p><strong>Important Notes:</strong></p>
            <ul>
                <li>You can re-apply for organization registration at any time</li>
                <li>Make sure to address all the issues mentioned in the rejection reason</li>
                <li>Ensure all provided information is accurate and complete</li>
                <li>Contact our support team if you need clarification on any requirements</li>
            </ul>

            <div style="text-align: center;">
                <a href="{{ $supportUrl }}" class="button">Contact Support</a>
            </div>

            <p>We appreciate your interest in Chatbot SaaS and look forward to working with you once the registration requirements are met.</p>
        </div>

        <div class="footer">
            <p>If you have any questions about this decision, please don't hesitate to contact our support team.</p>
            <p>This email was sent to {{ $user->email }}. For assistance, please contact our{' '}
                <a href="{{ $supportUrl }}" style="color: #4f46e5;">support team</a>.
            </p>
            <p>&copy; {{ date('Y') }} Chatbot SaaS. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
