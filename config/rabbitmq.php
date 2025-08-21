<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Default Queue Connection Name
    |--------------------------------------------------------------------------
    |
    | Laravel's queue API supports an assortment of back-ends via a single
    | API, giving you convenient access to each back-end using the same
    | syntax for every one. Here you may define a default connection.
    |
    */

    'default' => env('RABBITMQ_QUEUE', 'default'),

    /*
    |--------------------------------------------------------------------------
    | RabbitMQ Connections
    |--------------------------------------------------------------------------
    |
    | Here you may configure the connection information for each server that
    | is used by your application. A default configuration has been added
    | for each back-end shipped with Laravel. You are free to add more.
    |
    */

    'connections' => [

        'rabbitmq' => [
            'driver' => 'rabbitmq',
            'queue' => env('RABBITMQ_QUEUE', 'default'),
            'connection' => PhpAmqpLib\Connection\AMQPLazyConnection::class,

            'hosts' => [
                [
                    'host' => env('RABBITMQ_HOST', '127.0.0.1'),
                    'port' => env('RABBITMQ_PORT', 5672),
                    'user' => env('RABBITMQ_USER', 'guest'),
                    'password' => env('RABBITMQ_PASSWORD', 'guest'),
                    'vhost' => env('RABBITMQ_VHOST', '/'),
                ],
            ],

            'options' => [
                'ssl_options' => [
                    'cafile' => env('RABBITMQ_SSL_CAFILE', null),
                    'local_cert' => env('RABBITMQ_SSL_LOCALCERT', null),
                    'local_key' => env('RABBITMQ_SSL_LOCALKEY', null),
                    'verify_peer' => env('RABBITMQ_SSL_VERIFY_PEER', true),
                    'passphrase' => env('RABBITMQ_SSL_PASSPHRASE', null),
                ],
                'queue' => [
                    'job' => VladimirYuldashev\LaravelQueueRabbitMQ\Queue\Jobs\RabbitMQJob::class,
                ],
            ],

            /*
             * Set to "horizon" if you wish to use Laravel Horizon.
             */
            'worker' => env('RABBITMQ_WORKER', 'default'),

            /*
             * The name of the default queue.
             */
            'queue' => env('RABBITMQ_QUEUE', 'default'),

            /*
             * Queue exchange configuration.
             */
            'exchange' => env('RABBITMQ_EXCHANGE', 'laravel_direct'),
            'exchange_type' => env('RABBITMQ_EXCHANGE_TYPE', 'direct'),
            'exchange_passive' => env('RABBITMQ_EXCHANGE_PASSIVE', false),
            'exchange_durable' => env('RABBITMQ_EXCHANGE_DURABLE', true),
            'exchange_auto_delete' => env('RABBITMQ_EXCHANGE_AUTO_DELETE', false),
            'exchange_arguments' => env('RABBITMQ_EXCHANGE_ARGUMENTS', ''),

            /*
             * Queue routing configuration.
             */
            'queue_force_declare' => env('RABBITMQ_QUEUE_FORCE_DECLARE', false),
            'queue_passive' => env('RABBITMQ_QUEUE_PASSIVE', false),
            'queue_durable' => env('RABBITMQ_QUEUE_DURABLE', true),
            'queue_exclusive' => env('RABBITMQ_QUEUE_EXCLUSIVE', false),
            'queue_auto_delete' => env('RABBITMQ_QUEUE_AUTO_DELETE', false),
            'queue_arguments' => env('RABBITMQ_QUEUE_ARGUMENTS', ''),

            /*
             * Message configuration.
             */
            'message_persistent' => env('RABBITMQ_MESSAGE_PERSISTENT', false),

            /*
             * Consumer configuration.
             */
            'consumer_tag' => env('RABBITMQ_CONSUMER_TAG', ''),
            'consumer_no_local' => env('RABBITMQ_CONSUMER_NO_LOCAL', false),
            'consumer_no_ack' => env('RABBITMQ_CONSUMER_NO_ACK', false),
            'consumer_exclusive' => env('RABBITMQ_CONSUMER_EXCLUSIVE', false),
            'consumer_nowait' => env('RABBITMQ_CONSUMER_NOWAIT', false),
            'timeout' => 60,
            'persistent' => env('RABBITMQ_PERSISTENT', false),

            /*
             * QoS configuration.
             */
            'qos' => env('RABBITMQ_QOS', false),
            'qos_prefetch_size' => env('RABBITMQ_QOS_PREFETCH_SIZE', 0),
            'qos_prefetch_count' => env('RABBITMQ_QOS_PREFETCH_COUNT', 1),
            'qos_a_global' => env('RABBITMQ_QOS_GLOBAL', false),

            /*
             * Horizon integration.
             */
            'processes' => env('RABBITMQ_PROCESSES', 1),
            'tries' => env('RABBITMQ_TRIES', 1),
            'sleep' => env('RABBITMQ_SLEEP', 3),
            'balance' => env('RABBITMQ_BALANCE', 'simple'),
            'nice' => env('RABBITMQ_NICE', 0),
            'timeout' => env('RABBITMQ_TIMEOUT', 60),
            'memory' => env('RABBITMQ_MEMORY', 128),

            /*
             * Priority queue configuration.
             */
            'priority_queue_max_priority' => env('RABBITMQ_PRIORITY_QUEUE_MAX_PRIORITY', 2),

            /*
             * Failed queue configuration.
             */
            'failed_exchange' => env('RABBITMQ_FAILED_EXCHANGE', 'failed'),
            'failed_routing_key' => env('RABBITMQ_FAILED_ROUTING_KEY', 'failed'),

            /*
             * Retry delay for failed jobs (in seconds).
             */
            'retry_delay' => env('RABBITMQ_RETRY_DELAY', 0),
        ],

    ],

    /*
    |--------------------------------------------------------------------------
    | Priority Queues
    |--------------------------------------------------------------------------
    |
    | You can define priority queues here. Higher numbers indicate higher
    | priority. Jobs with higher priority will be processed first.
    |
    */

    'priority_queues' => [
        'high_priority' => 10,
        'default' => 5,
        'low_priority' => 1,
    ],

];
