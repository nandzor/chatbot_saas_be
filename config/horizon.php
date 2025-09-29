<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Horizon Domain
    |--------------------------------------------------------------------------
    |
    | This is the subdomain where Horizon will be accessible from. If this
    | setting is null, Horizon will reside under the same domain as the
    | application. Otherwise, this value will be used as the subdomain.
    |
    */

    'domain' => env('HORIZON_DOMAIN', null),

    /*
    |--------------------------------------------------------------------------
    | Horizon Path
    |--------------------------------------------------------------------------
    |
    | This is the URI path where Horizon will be accessible from. Feel free
    | to change this path to anything you like. Note that the URI will not
    | affect the paths of its internal API that aren't exposed to users.
    |
    */

    'path' => env('HORIZON_PATH', 'horizon'),

    /*
    |--------------------------------------------------------------------------
    | Horizon Redis Connection
    |--------------------------------------------------------------------------
    |
    | This is the name of the Redis connection where Horizon will store the
    | meta information required for it to function. It includes the list
    | of supervisors, failed jobs, job metrics, and other information.
    |
    */

    'use' => env('HORIZON_REDIS_CONNECTION', 'default'),

    /*
    |--------------------------------------------------------------------------
    | Horizon Redis Prefix
    |--------------------------------------------------------------------------
    |
    | This prefix will be used when storing all Horizon data in Redis. You
    | may modify the prefix when you are running multiple installations
    | of Horizon on the same server so that they don't have problems.
    |
    */

    'prefix' => env('HORIZON_PREFIX', 'horizon:'),

    /*
    |--------------------------------------------------------------------------
    | Horizon Route Middleware
    |--------------------------------------------------------------------------
    |
    | These middleware will get attached onto each Horizon route, giving you
    | the chance to add your own middleware to this list or change any of
    | the existing middleware. Or, you can simply stick with this list.
    |
    */

    'middleware' => ['web'],

    /*
    |--------------------------------------------------------------------------
    | Queue Wait Time Thresholds
    |--------------------------------------------------------------------------
    |
    | This option allows you to configure when the LongWaitDetected event will
    | be fired. Every connection / queue combination may have its own threshold
    | value. The "slow" threshold is 5x the "balance" threshold.
    |
    */

    'waits' => [
        'redis:default' => 60,
        'redis:high_priority' => 30,
        'redis:notifications' => 120,
        'redis:webhooks' => 60,
        'redis:whatsapp-messages' => 90,
        'redis:payment' => 30,
        'redis:billing' => 60,
    ],

    /*
    |--------------------------------------------------------------------------
    | Job Trimming Times
    |--------------------------------------------------------------------------
    |
    | Here you can configure for how long (in minutes) you desire Horizon to
    | persist the recent and failed jobs. Typically, recent jobs are kept
    | for one hour while all failed jobs are stored for an entire week.
    |
    */

    'trim' => [
        'recent' => 60,
        'completed' => 60,
        'recent_failed' => 10080,
        'failed' => 10080,
        'monitored' => 10080,
    ],

    /*
    |--------------------------------------------------------------------------
    | Fast Termination
    |--------------------------------------------------------------------------
    |
    | When this option is enabled, Horizon's "terminate" command will not
    | wait on all of the workers to terminate unless the --wait option
    | is provided. Fast termination can reduce deployment latency by
    | not waiting for workers to finish their current job.
    |
    */

    'fast_termination' => env('HORIZON_FAST_TERMINATION', false),

    /*
    |--------------------------------------------------------------------------
    | Memory Limit (MB)
    |--------------------------------------------------------------------------
    |
    | This value describes the maximum amount of memory a worker may consume
    | before it is terminated and restarted. You should set this value
    | according to the resources available to your application.
    |
    */

    'memory_limit' => env('HORIZON_MEMORY_LIMIT', 512),

    /*
    |--------------------------------------------------------------------------
    | Queue Worker Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure the queue workers. Each worker configuration
    | includes the queue name, connection, and the number of processes
    | that should be started for each queue.
    |
    */

    'environments' => [
        'production' => [
            'supervisor-1' => [
                'connection' => 'redis',
                'queue' => ['high_priority'],
                'balance' => 'simple',
                'processes' => 3,
                'tries' => 3,
                'nice' => 0,
                'timeout' => 60,
                'memory' => 512,
            ],
            'supervisor-2' => [
                'connection' => 'redis',
                'queue' => ['default', 'notifications'],
                'balance' => 'simple',
                'processes' => 5,
                'tries' => 3,
                'nice' => 0,
                'timeout' => 60,
                'memory' => 512,
            ],
            'supervisor-3' => [
                'connection' => 'redis',
                'queue' => ['webhooks', 'whatsapp-messages'],
                'balance' => 'simple',
                'processes' => 4,
                'tries' => 3,
                'nice' => 0,
                'timeout' => 90,
                'memory' => 512,
            ],
            'supervisor-4' => [
                'connection' => 'redis',
                'queue' => ['payment', 'billing'],
                'balance' => 'simple',
                'processes' => 2,
                'tries' => 5,
                'nice' => 0,
                'timeout' => 120,
                'memory' => 512,
            ],
        ],

        'local' => [
            'supervisor-1' => [
                'connection' => 'redis',
                'queue' => ['high_priority', 'default'],
                'balance' => 'simple',
                'processes' => 2,
                'tries' => 3,
                'nice' => 0,
                'timeout' => 60,
                'memory' => 256,
            ],
            'supervisor-2' => [
                'connection' => 'redis',
                'queue' => ['notifications', 'webhooks'],
                'balance' => 'simple',
                'processes' => 2,
                'tries' => 3,
                'nice' => 0,
                'timeout' => 60,
                'memory' => 256,
            ],
            'supervisor-3' => [
                'connection' => 'redis',
                'queue' => ['whatsapp-messages', 'payment', 'billing'],
                'balance' => 'simple',
                'processes' => 2,
                'tries' => 3,
                'nice' => 0,
                'timeout' => 90,
                'memory' => 256,
            ],
        ],
    ],
];
