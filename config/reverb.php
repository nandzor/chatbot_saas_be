<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Reverb Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your Reverb settings for real-time communication.
    | Reverb is Laravel's WebSocket server for real-time features.
    |
    */

    'host' => env('REVERB_HOST', '0.0.0.0'),
    'port' => env('REVERB_PORT', 8081),
    'scheme' => env('REVERB_SCHEME', 'http'),

    /*
    |--------------------------------------------------------------------------
    | Application Settings
    |--------------------------------------------------------------------------
    |
    | These settings configure the Reverb application instance.
    |
    */

    'app_id' => env('REVERB_APP_ID', 'chatbot_saas'),
    'app_key' => env('REVERB_APP_KEY', 'local-key'),
    'app_secret' => env('REVERB_APP_SECRET', 'local-secret'),

    /*
    |--------------------------------------------------------------------------
    | Scaling Configuration
    |--------------------------------------------------------------------------
    |
    | Configure how Reverb handles scaling across multiple instances.
    |
    */

    'scaling' => [
        'enabled' => env('REVERB_SCALING_ENABLED', false),
        'driver' => env('REVERB_SCALING_DRIVER', 'redis'),
        'redis' => [
            'connection' => env('REVERB_REDIS_CONNECTION', 'default'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Server Configuration
    |--------------------------------------------------------------------------
    |
    | Configure the Reverb server settings.
    |
    */

    'server' => [
        'max_connections' => env('REVERB_MAX_CONNECTIONS', 2000),
        'heartbeat_interval' => env('REVERB_HEARTBEAT_INTERVAL', 15),
        'max_request_size' => env('REVERB_MAX_REQUEST_SIZE', 2 * 1024 * 1024), // 2MB
        'enable_compression' => env('REVERB_ENABLE_COMPRESSION', true),
        'enable_metrics' => env('REVERB_ENABLE_METRICS', true),
    ],

    /*
    |--------------------------------------------------------------------------
    | Authentication
    |--------------------------------------------------------------------------
    |
    | Configure authentication for Reverb connections.
    |
    */

    'auth' => [
        'guard' => env('REVERB_AUTH_GUARD', 'sanctum'),
        'middleware' => [
            'unified.auth', // Temporarily disabled to test basic connection
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Logging
    |--------------------------------------------------------------------------
    |
    | Configure logging for Reverb.
    |
    */

    'logging' => [
        'enabled' => env('REVERB_LOGGING_ENABLED', true),
        'level' => env('REVERB_LOG_LEVEL', 'info'),
    ],
];
