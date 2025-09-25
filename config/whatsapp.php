<?php

return [
    /*
    |--------------------------------------------------------------------------
    | WhatsApp Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for WhatsApp integration including webhook settings,
    | message processing, and bot personality settings.
    |
    */

    'webhook' => [
        'secret' => env('WHATSAPP_WEBHOOK_SECRET'),
        'verify_token' => env('WHATSAPP_VERIFY_TOKEN'),
        'timeout' => 30,
    ],

    'waha' => [
        'base_url' => env('WAHA_BASE_URL', 'http://localhost:3000'),
        'api_key' => env('WAHA_API_KEY'),
        'timeout' => 30,
    ],

    'message_processing' => [
        'max_retries' => 3,
        'retry_delay' => 5, // seconds
        'auto_create_customer' => true,
        'auto_create_session' => true,
        'default_bot_personality' => 'default',
    ],

    'session' => [
        'auto_timeout' => 30, // minutes
        'max_inactive_time' => 60, // minutes
        'default_intent' => 'general_inquiry',
        'default_priority' => 'normal',
    ],

    'bot' => [
        'enabled' => true,
        'fallback_message' => 'Maaf, saya tidak dapat memproses pesan Anda saat ini. Silakan coba lagi nanti.',
        'welcome_message' => 'Halo! Selamat datang di layanan kami. Ada yang bisa saya bantu?',
        'typing_delay' => 1000, // milliseconds
    ],

    'analytics' => [
        'track_sentiment' => true,
        'track_intent' => true,
        'track_response_time' => true,
        'auto_summarize' => false,
    ],
];
