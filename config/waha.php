<?php

return [
    /*
    |--------------------------------------------------------------------------
    | WAHA Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains configuration options for WAHA (WhatsApp HTTP API)
    | integration. Our custom WAHA service provides a clean interface to
    | interact with WAHA server.
    |
    */

    // WAHA Server Configuration
    'server' => [
        'base_url' => env('WAHA_BASE_URL', 'http://localhost:3000'),
        'api_key' => env('WAHA_API_KEY', ''),
        'timeout' => env('WAHA_TIMEOUT', 30),
    ],

    // HTTP Client Configuration
    'http' => [
        'retry_attempts' => env('WAHA_RETRY_ATTEMPTS', 3),
        'retry_delay' => env('WAHA_RETRY_DELAY', 1000), // milliseconds
        'max_retry_delay' => env('WAHA_MAX_RETRY_DELAY', 10000), // milliseconds
        'exponential_backoff' => env('WAHA_EXPONENTIAL_BACKOFF', true),
        'log_requests' => env('WAHA_LOG_REQUESTS', true),
        'log_responses' => env('WAHA_LOG_RESPONSES', true),
    ],

    // Session Configuration
    'sessions' => [
        'default_config' => [
            'webhook' => env('WAHA_WEBHOOK_URL', ''),
            'webhook_by_events' => false,
            'events' => ['message', 'session.status'],
            'reject_calls' => false,
            'mark_online_on_chat' => true,
        ],
        'max_sessions' => env('WAHA_MAX_SESSIONS', 10),
        'session_timeout' => env('WAHA_SESSION_TIMEOUT', 3600),
    ],

    // Message Configuration
    'messages' => [
        'default_limit' => 50,
        'max_limit' => 100,
        'retry_attempts' => env('WAHA_MESSAGE_RETRY_ATTEMPTS', 3),
        'retry_delay' => env('WAHA_MESSAGE_RETRY_DELAY', 1000), // milliseconds
    ],

    // Testing Configuration
    'testing' => [
        'enabled' => env('WAHA_TESTING_ENABLED', true),
        'mock_responses' => env('WAHA_MOCK_RESPONSES', false),
        'log_requests' => env('WAHA_LOG_REQUESTS', true),
        'log_responses' => env('WAHA_LOG_RESPONSES', true),
    ],

    // Webhook Configuration
    'webhooks' => [
        'verify_signature' => env('WAHA_VERIFY_WEBHOOK_SIGNATURE', true),
        'allowed_ips' => explode(',', env('WAHA_ALLOWED_IPS', '127.0.0.1,::1')),
        'rate_limit' => env('WAHA_WEBHOOK_RATE_LIMIT', 100),
    ],

    // Notification Configuration
    'notifications' => [
        'on_message_received' => env('WAHA_NOTIFY_ON_MESSAGE', true),
        'on_session_status_change' => env('WAHA_NOTIFY_ON_SESSION_STATUS', true),
        'notification_channels' => explode(',', env('WAHA_NOTIFICATION_CHANNELS', 'mail,slack')),
    ],

    // Security Configuration
    'security' => [
        'allowed_phone_numbers' => explode(',', env('WAHA_ALLOWED_PHONE_NUMBERS', '')),
        'blocked_phone_numbers' => explode(',', env('WAHA_BLOCKED_PHONE_NUMBERS', '')),
        'require_authentication' => env('WAHA_REQUIRE_AUTH', true),
    ],

    // Default session configuration for new sessions
    'default_session' => [
        'name' => 'default',
        'config' => [
            'webhook' => env('WAHA_WEBHOOK_URL', ''),
            'webhook_by_events' => false,
            'events' => ['message', 'session.status'],
            'reject_calls' => false,
            'mark_online_on_chat' => true,
        ],
    ],
];
