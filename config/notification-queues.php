<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Notification Queue Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains configuration for notification queue processing.
    | You can specify different queues for different priority levels and
    | configure retry settings for notification delivery.
    |
    */

    'queues' => [
        'urgent' => env('NOTIFICATION_QUEUE_URGENT', 'notifications-urgent'),
        'high' => env('NOTIFICATION_QUEUE_HIGH', 'notifications-high'),
        'normal' => env('NOTIFICATION_QUEUE_NORMAL', 'notifications'),
        'low' => env('NOTIFICATION_QUEUE_LOW', 'notifications-low'),
    ],

    'defaults' => [
        'priority' => env('NOTIFICATION_DEFAULT_PRIORITY', 'normal'),
        'channels' => ['in_app'],
        'timeout' => env('NOTIFICATION_TIMEOUT', 60),
        'tries' => env('NOTIFICATION_TRIES', 3),
        'retry_delay' => env('NOTIFICATION_RETRY_DELAY', 30), // seconds
    ],

    'email' => [
        'enabled' => env('NOTIFICATION_EMAIL_ENABLED', true),
        'timeout' => env('NOTIFICATION_EMAIL_TIMEOUT', 30),
        'tries' => env('NOTIFICATION_EMAIL_TRIES', 3),
        'templates' => [
            'default' => 'emails.notifications.default',
            'welcome' => 'emails.notifications.welcome',
            'urgent' => 'emails.notifications.urgent',
            'newsletter' => 'emails.notifications.newsletter',
        ],
    ],

    'webhook' => [
        'enabled' => env('NOTIFICATION_WEBHOOK_ENABLED', true),
        'timeout' => env('NOTIFICATION_WEBHOOK_TIMEOUT', 10),
        'tries' => env('NOTIFICATION_WEBHOOK_TRIES', 3),
        'verify_ssl' => env('NOTIFICATION_WEBHOOK_VERIFY_SSL', true),
        'user_agent' => env('NOTIFICATION_WEBHOOK_USER_AGENT', 'OrganizationBot/1.0'),
    ],

    'in_app' => [
        'enabled' => env('NOTIFICATION_IN_APP_ENABLED', true),
        'timeout' => env('NOTIFICATION_IN_APP_TIMEOUT', 15),
        'tries' => env('NOTIFICATION_IN_APP_TRIES', 2),
        'broadcast' => env('NOTIFICATION_IN_APP_BROADCAST', false),
    ],

    'cache' => [
        'enabled' => env('NOTIFICATION_CACHE_ENABLED', true),
        'ttl' => env('NOTIFICATION_CACHE_TTL', 3600), // 1 hour
        'prefix' => env('NOTIFICATION_CACHE_PREFIX', 'notifications'),
    ],

    'rate_limiting' => [
        'enabled' => env('NOTIFICATION_RATE_LIMITING_ENABLED', true),
        'email' => [
            'max_per_hour' => env('NOTIFICATION_EMAIL_MAX_PER_HOUR', 100),
            'max_per_day' => env('NOTIFICATION_EMAIL_MAX_PER_DAY', 1000),
        ],
        'webhook' => [
            'max_per_minute' => env('NOTIFICATION_WEBHOOK_MAX_PER_MINUTE', 60),
            'max_per_hour' => env('NOTIFICATION_WEBHOOK_MAX_PER_HOUR', 3600),
        ],
        'in_app' => [
            'max_per_minute' => env('NOTIFICATION_IN_APP_MAX_PER_MINUTE', 300),
            'max_per_hour' => env('NOTIFICATION_IN_APP_MAX_PER_HOUR', 10000),
        ],
    ],

    'cleanup' => [
        'enabled' => env('NOTIFICATION_CLEANUP_ENABLED', true),
        'keep_days' => env('NOTIFICATION_KEEP_DAYS', 90),
        'batch_size' => env('NOTIFICATION_CLEANUP_BATCH_SIZE', 1000),
    ],

    'monitoring' => [
        'enabled' => env('NOTIFICATION_MONITORING_ENABLED', true),
        'log_channel' => env('NOTIFICATION_LOG_CHANNEL', 'single'),
        'alert_failed_threshold' => env('NOTIFICATION_ALERT_FAILED_THRESHOLD', 10),
        'metrics' => [
            'enabled' => env('NOTIFICATION_METRICS_ENABLED', false),
            'driver' => env('NOTIFICATION_METRICS_DRIVER', 'log'),
        ],
    ],

    'sms' => [
        'enabled' => env('NOTIFICATION_SMS_ENABLED', false),
        'timeout' => env('NOTIFICATION_SMS_TIMEOUT', 30),
        'tries' => env('NOTIFICATION_SMS_TRIES', 3),
        'provider' => env('NOTIFICATION_SMS_PROVIDER', 'mock'),
        'max_length' => env('NOTIFICATION_SMS_MAX_LENGTH', 160),
        'include_organization' => env('NOTIFICATION_SMS_INCLUDE_ORGANIZATION', false),
        'twilio' => [
            'account_sid' => env('TWILIO_ACCOUNT_SID'),
            'auth_token' => env('TWILIO_AUTH_TOKEN'),
            'from_number' => env('TWILIO_FROM_NUMBER'),
        ],
        'nexmo' => [
            'api_key' => env('NEXMO_API_KEY'),
            'api_secret' => env('NEXMO_API_SECRET'),
            'from_name' => env('NEXMO_FROM_NAME', config('app.name')),
        ],
        'aws_sns' => [
            'access_key' => env('AWS_ACCESS_KEY_ID'),
            'secret_key' => env('AWS_SECRET_ACCESS_KEY'),
            'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
        ],
    ],

    'push' => [
        'enabled' => env('NOTIFICATION_PUSH_ENABLED', false),
        'timeout' => env('NOTIFICATION_PUSH_TIMEOUT', 30),
        'tries' => env('NOTIFICATION_PUSH_TRIES', 3),
        'provider' => env('NOTIFICATION_PUSH_PROVIDER', 'mock'),
        'fcm' => [
            'server_key' => env('FCM_SERVER_KEY'),
            'project_id' => env('FCM_PROJECT_ID'),
            'icon' => env('FCM_ICON', 'ic_notification'),
            'sound' => env('FCM_SOUND', 'default'),
            'click_action' => env('FCM_CLICK_ACTION'),
            'channel_id' => env('FCM_CHANNEL_ID', 'default'),
        ],
        'apns' => [
            'certificate_path' => env('APNS_CERTIFICATE_PATH'),
            'passphrase' => env('APNS_PASSPHRASE'),
            'environment' => env('APNS_ENVIRONMENT', 'production'),
        ],
        'onesignal' => [
            'app_id' => env('ONESIGNAL_APP_ID'),
            'rest_api_key' => env('ONESIGNAL_REST_API_KEY'),
        ],
    ],

    'channels' => [
        'available' => ['in_app', 'email', 'webhook', 'sms', 'push'],
        'default' => ['in_app'],
        'required' => ['in_app'], // These channels are always enabled
    ],

    'types' => [
        'welcome' => [
            'channels' => ['in_app', 'email'],
            'priority' => 'normal',
            'template' => 'welcome',
        ],
        'urgent' => [
            'channels' => ['in_app', 'email', 'webhook'],
            'priority' => 'urgent',
            'template' => 'urgent',
        ],
        'system' => [
            'channels' => ['in_app', 'email'],
            'priority' => 'high',
            'template' => 'default',
        ],
        'newsletter' => [
            'channels' => ['email'],
            'priority' => 'low',
            'template' => 'newsletter',
        ],
        'reminder' => [
            'channels' => ['in_app', 'email'],
            'priority' => 'normal',
            'template' => 'default',
        ],
    ],
];
