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

    'host' => env('REVERB_HOST', 'localhost'),
    'port' => env('REVERB_PORT', 9000),
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
        'max_connections' => env('REVERB_MAX_CONNECTIONS', 1000),
        'heartbeat_interval' => env('REVERB_HEARTBEAT_INTERVAL', 30),
        'max_request_size' => env('REVERB_MAX_REQUEST_SIZE', 1024 * 1024), // 1MB
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
        'guard' => env('REVERB_AUTH_GUARD', 'web'),
        'middleware' => [
            'auth:sanctum',
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
