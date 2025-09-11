<?php

return [
    /*
    |--------------------------------------------------------------------------
    | N8N Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains configuration options for N8N workflow automation
    | integration. Our custom N8N service provides a clean interface to
    | interact with N8N server.
    |
    */

    // N8N Server Configuration
    'server' => [
        'base_url' => env('N8N_BASE_URL', 'http://localhost:5678'),
        'api_key' => env('N8N_API_KEY', ''),
        'timeout' => env('N8N_TIMEOUT', 30),
    ],

    // HTTP Client Configuration
    'http' => [
        'retry_attempts' => env('N8N_RETRY_ATTEMPTS', 3),
        'retry_delay' => env('N8N_RETRY_DELAY', 1000), // milliseconds
        'log_requests' => env('N8N_LOG_REQUESTS', true),
        'log_responses' => env('N8N_LOG_RESPONSES', true),
    ],

    // Workflow Configuration
    'workflows' => [
        'default_limit' => 20,
        'max_limit' => 100,
        'auto_activate' => env('N8N_AUTO_ACTIVATE_WORKFLOWS', false),
        'retry_attempts' => env('N8N_WORKFLOW_RETRY_ATTEMPTS', 3),
        'retry_delay' => env('N8N_WORKFLOW_RETRY_DELAY', 1000), // milliseconds
    ],

    // Execution Configuration
    'executions' => [
        'default_limit' => 20,
        'max_limit' => 100,
        'timeout' => env('N8N_EXECUTION_TIMEOUT', 300), // seconds
        'retry_attempts' => env('N8N_EXECUTION_RETRY_ATTEMPTS', 3),
        'retry_delay' => env('N8N_EXECUTION_RETRY_DELAY', 1000), // milliseconds
    ],

    // Credentials Configuration
    'credentials' => [
        'encryption_key' => env('N8N_CREDENTIALS_ENCRYPTION_KEY', ''),
        'auto_test' => env('N8N_AUTO_TEST_CREDENTIALS', true),
        'retry_attempts' => env('N8N_CREDENTIALS_RETRY_ATTEMPTS', 3),
        'retry_delay' => env('N8N_CREDENTIALS_RETRY_DELAY', 1000), // milliseconds
    ],

    // Webhook Configuration
    'webhooks' => [
        'verify_signature' => env('N8N_VERIFY_WEBHOOK_SIGNATURE', true),
        'allowed_ips' => explode(',', env('N8N_ALLOWED_IPS', '127.0.0.1,::1')),
        'rate_limit' => env('N8N_WEBHOOK_RATE_LIMIT', 100),
        'timeout' => env('N8N_WEBHOOK_TIMEOUT', 30), // seconds
    ],

    // Testing Configuration
    'testing' => [
        'enabled' => env('N8N_TESTING_ENABLED', true),
        'mock_responses' => env('N8N_MOCK_RESPONSES', false),
        'log_requests' => env('N8N_LOG_REQUESTS', true),
        'log_responses' => env('N8N_LOG_RESPONSES', true),
    ],

    // Notification Configuration
    'notifications' => [
        'on_workflow_execution' => env('N8N_NOTIFY_ON_EXECUTION', true),
        'on_workflow_error' => env('N8N_NOTIFY_ON_ERROR', true),
        'notification_channels' => explode(',', env('N8N_NOTIFICATION_CHANNELS', 'mail,slack')),
    ],

    // Security Configuration
    'security' => [
        'require_authentication' => env('N8N_REQUIRE_AUTH', true),
        'allowed_origins' => explode(',', env('N8N_ALLOWED_ORIGINS', '')),
        'rate_limit' => env('N8N_RATE_LIMIT', 1000), // requests per minute
    ],

    // Default workflow configuration
    'default_workflow' => [
        'name' => 'Default Workflow',
        'active' => false,
        'nodes' => [],
        'connections' => [],
        'settings' => [
            'executionOrder' => 'v1',
            'saveManualExecutions' => true,
            'callerPolicy' => 'workflowsFromSameOwner',
            'errorWorkflow' => '',
        ],
    ],

    // Default credential configuration
    'default_credential' => [
        'name' => 'Default Credential',
        'type' => 'httpBasicAuth',
        'data' => [],
    ],
];