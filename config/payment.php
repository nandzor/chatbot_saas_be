<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Payment Gateway Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains configuration for various payment gateways used
    | in the application. Each gateway has its own configuration section
    | with API keys, settings, and webhook configurations.
    |
    */

    /*
    |--------------------------------------------------------------------------
    | Default Payment Gateway
    |--------------------------------------------------------------------------
    |
    | This option controls the default payment gateway that will be used
    | for processing payments. You may change this value as needed.
    |
    */

    'default_gateway' => env('PAYMENT_DEFAULT_GATEWAY', 'stripe'),

    /*
    |--------------------------------------------------------------------------
    | Supported Gateways
    |--------------------------------------------------------------------------
    |
    | List of supported payment gateways in the application.
    |
    */

    'supported_gateways' => [
        'stripe',
        'midtrans',
        'xendit',
    ],

    /*
    |--------------------------------------------------------------------------
    | Stripe Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for Stripe payment gateway.
    |
    */

    'stripe' => [
        'public_key' => env('STRIPE_PUBLIC_KEY'),
        'secret_key' => env('STRIPE_SECRET_KEY'),
        'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),
        'currency' => env('STRIPE_CURRENCY', 'usd'),
        'test_mode' => env('STRIPE_TEST_MODE', true),
        'api_version' => env('STRIPE_API_VERSION', '2023-10-16'),
        'timeout' => env('STRIPE_TIMEOUT', 30),
        'retry_attempts' => env('STRIPE_RETRY_ATTEMPTS', 3),
    ],

    /*
    |--------------------------------------------------------------------------
    | Midtrans Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for Midtrans payment gateway.
    |
    */

    'midtrans' => [
        'server_key' => env('MIDTRANS_SERVER_KEY'),
        'client_key' => env('MIDTRANS_CLIENT_KEY'),
        'is_production' => env('MIDTRANS_IS_PRODUCTION', false),
        'is_sanitized' => env('MIDTRANS_IS_SANITIZED', true),
        'is_3ds' => env('MIDTRANS_IS_3DS', true),
        'webhook_secret' => env('MIDTRANS_WEBHOOK_SECRET'),
        'api_url' => env('MIDTRANS_IS_PRODUCTION', false)
            ? 'https://api.midtrans.com'
            : 'https://api.sandbox.midtrans.com',
        'snap_url' => env('MIDTRANS_IS_PRODUCTION', false)
            ? 'https://app.midtrans.com'
            : 'https://app.sandbox.midtrans.com',
    ],

    /*
    |--------------------------------------------------------------------------
    | Xendit Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for Xendit payment gateway.
    |
    */

    'xendit' => [
        'secret_key' => env('XENDIT_SECRET_KEY'),
        'public_key' => env('XENDIT_PUBLIC_KEY'),
        'webhook_token' => env('XENDIT_WEBHOOK_TOKEN'),
        'callback_token' => env('XENDIT_CALLBACK_TOKEN'),
        'is_production' => env('XENDIT_IS_PRODUCTION', false),
        'api_url' => env('XENDIT_IS_PRODUCTION', false)
            ? 'https://api.xendit.co'
            : 'https://api.xendit.co',
        'timeout' => env('XENDIT_TIMEOUT', 30),
    ],

    /*
    |--------------------------------------------------------------------------
    | Payment Processing Settings
    |--------------------------------------------------------------------------
    |
    | General settings for payment processing.
    |
    */

    'processing' => [
        'timeout' => env('PAYMENT_TIMEOUT', 30),
        'retry_attempts' => env('PAYMENT_RETRY_ATTEMPTS', 3),
        'retry_delay' => env('PAYMENT_RETRY_DELAY', 5), // seconds
        'webhook_timeout' => env('PAYMENT_WEBHOOK_TIMEOUT', 10),
        'max_amount' => env('PAYMENT_MAX_AMOUNT', 10000000), // 10M in cents
        'min_amount' => env('PAYMENT_MIN_AMOUNT', 100), // 1 in cents
    ],

    /*
    |--------------------------------------------------------------------------
    | Currency Configuration
    |--------------------------------------------------------------------------
    |
    | Supported currencies and their configurations.
    |
    */

    'currencies' => [
        'IDR' => [
            'name' => 'Indonesian Rupiah',
            'symbol' => 'Rp',
            'decimal_places' => 0,
            'symbol_position' => 'before',
        ],
        'USD' => [
            'name' => 'US Dollar',
            'symbol' => '$',
            'decimal_places' => 2,
            'symbol_position' => 'before',
        ],
        'EUR' => [
            'name' => 'Euro',
            'symbol' => '€',
            'decimal_places' => 2,
            'symbol_position' => 'before',
        ],
        'SGD' => [
            'name' => 'Singapore Dollar',
            'symbol' => 'S$',
            'decimal_places' => 2,
            'symbol_position' => 'before',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Webhook Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for webhook handling.
    |
    */

    'webhooks' => [
        'enabled' => env('PAYMENT_WEBHOOKS_ENABLED', true),
        'verify_signature' => env('PAYMENT_WEBHOOK_VERIFY_SIGNATURE', true),
        'retry_failed' => env('PAYMENT_WEBHOOK_RETRY_FAILED', true),
        'max_retries' => env('PAYMENT_WEBHOOK_MAX_RETRIES', 3),
        'retry_delay' => env('PAYMENT_WEBHOOK_RETRY_DELAY', 60), // seconds
    ],

    /*
    |--------------------------------------------------------------------------
    | Fraud Detection
    |--------------------------------------------------------------------------
    |
    | Configuration for fraud detection and risk assessment.
    |
    */

    'fraud_detection' => [
        'enabled' => env('PAYMENT_FRAUD_DETECTION_ENABLED', true),
        'risk_threshold' => env('PAYMENT_RISK_THRESHOLD', 70),
        'block_high_risk' => env('PAYMENT_BLOCK_HIGH_RISK', true),
        'require_3ds' => env('PAYMENT_REQUIRE_3DS', false),
        'max_daily_amount' => env('PAYMENT_MAX_DAILY_AMOUNT', 5000000), // 50M in cents
    ],

    /*
    |--------------------------------------------------------------------------
    | Logging Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for payment logging.
    |
    */

    'logging' => [
        'enabled' => env('PAYMENT_LOGGING_ENABLED', true),
        'log_level' => env('PAYMENT_LOG_LEVEL', 'info'),
        'log_sensitive_data' => env('PAYMENT_LOG_SENSITIVE_DATA', false),
        'log_webhooks' => env('PAYMENT_LOG_WEBHOOKS', true),
        'log_failures' => env('PAYMENT_LOG_FAILURES', true),
    ],

];
