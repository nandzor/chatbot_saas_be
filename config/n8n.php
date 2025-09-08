<?php

return [
    /*
    |--------------------------------------------------------------------------
    | n8n Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains configuration options for n8n workflow integration
    | and API testing. Now using kayedspace/laravel-n8n package for workflow
    | management operations.
    |
    */

    // n8n Server Configuration
    'server' => [
        'url' => env('N8N_API_BASE_URL', 'http://localhost:5678'),
        'api_key' => env('N8N_API_KEY', ''),
        'webhook_secret' => env('N8N_WEBHOOK_SECRET', ''),
        'timeout' => env('N8N_TIMEOUT', 30),
    ],

    // Workflow Configuration
    'workflows' => [
        'default_status' => 'active',
        'webhook_base_url' => env('N8N_WEBHOOK_BASE_URL', 'http://localhost:5678/webhook/'),
        'max_execution_time' => env('N8N_MAX_EXECUTION_TIME', 300),
        'retry_attempts' => env('N8N_RETRY_ATTEMPTS', 3),
    ],

    // API Testing Configuration
    'testing' => [
        'enabled' => env('N8N_TESTING_ENABLED', true),
        'test_workflow_id' => env('N8N_TEST_WORKFLOW_ID', ''),
        'mock_responses' => env('N8N_MOCK_RESPONSES', false),
        'log_executions' => env('N8N_LOG_EXECUTIONS', true),
    ],

    // Webhook Configuration
    'webhooks' => [
        'verify_signature' => env('N8N_VERIFY_WEBHOOK_SIGNATURE', true),
        'allowed_ips' => explode(',', env('N8N_ALLOWED_IPS', '127.0.0.1,::1')),
        'rate_limit' => env('N8N_WEBHOOK_RATE_LIMIT', 100),
    ],

    // Notification Configuration
    'notifications' => [
        'on_workflow_failure' => env('N8N_NOTIFY_ON_FAILURE', true),
        'on_workflow_success' => env('N8N_NOTIFY_ON_SUCCESS', false),
        'notification_channels' => explode(',', env('N8N_NOTIFICATION_CHANNELS', 'mail,slack')),
    ],
];
