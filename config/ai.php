<?php

return [
    /*
    |--------------------------------------------------------------------------
    | AI Analysis Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains configuration for AI analysis services to optimize
    | costs and performance.
    |
    */

    /*
    |--------------------------------------------------------------------------
    | Analysis Method
    |--------------------------------------------------------------------------
    |
    | Set to true to use local analysis (cost-free) instead of API calls
    | Set to false to use OpenAI API (more accurate but expensive)
    |
    */
    'use_local_analysis' => env('AI_USE_LOCAL_ANALYSIS', true),

    /*
    |--------------------------------------------------------------------------
    | Cache Configuration
    |--------------------------------------------------------------------------
    |
    | Enable caching to avoid repeated analysis of the same content
    | Cache duration in seconds (3600 = 1 hour)
    |
    */
    'cache_enabled' => env('AI_CACHE_ENABLED', true),
    'cache_duration' => env('AI_CACHE_DURATION', 3600),

    /*
    |--------------------------------------------------------------------------
    | API Fallback
    |--------------------------------------------------------------------------
    |
    | When local analysis fails or confidence is low, fallback to API
    | Set to true to enable fallback to OpenAI API
    |
    */
    'api_fallback_enabled' => env('AI_API_FALLBACK_ENABLED', false),

    /*
    |--------------------------------------------------------------------------
    | Confidence Threshold
    |--------------------------------------------------------------------------
    |
    | Minimum confidence score for local analysis before considering API fallback
    | Range: 0.0 to 1.0
    |
    */
    'confidence_threshold' => env('AI_CONFIDENCE_THRESHOLD', 0.6),

    /*
    |--------------------------------------------------------------------------
    | Cost Optimization
    |--------------------------------------------------------------------------
    |
    | Enable cost optimization features
    |
    */
    'cost_optimization' => [
        'enabled' => env('AI_COST_OPTIMIZATION_ENABLED', true),
        'max_api_calls_per_hour' => env('AI_MAX_API_CALLS_PER_HOUR', 100),
        'batch_analysis' => env('AI_BATCH_ANALYSIS', true),
    ],

    /*
    |--------------------------------------------------------------------------
    | Local Analysis Settings
    |--------------------------------------------------------------------------
    |
    | Configuration for local analysis methods
    |
    */
    'local_analysis' => [
        'sentiment' => [
            'positive_words' => [
                'terima kasih', 'bagus', 'baik', 'senang', 'puas', 'membantu',
                'cepat', 'profesional', 'excellent', 'great', 'good', 'happy'
            ],
            'negative_words' => [
                'buruk', 'jelek', 'lambat', 'tidak puas', 'kecewa', 'marah',
                'frustasi', 'masalah', 'bad', 'terrible', 'slow', 'angry'
            ]
        ],
        'intent_patterns' => [
            'complaint' => ['komplain', 'keluhan', 'masalah', 'tidak puas', 'kecewa'],
            'inquiry' => ['tanya', 'bertanya', 'informasi', 'bagaimana', 'apa', 'kapan'],
            'request' => ['minta', 'mohon', 'tolong', 'bisa', 'boleh'],
            'greeting' => ['halo', 'hai', 'selamat', 'pagi', 'siang', 'malam'],
            'thanks' => ['terima kasih', 'makasih', 'thanks'],
            'goodbye' => ['selamat tinggal', 'bye', 'sampai jumpa']
        ],
        'urgency_keywords' => [
            'urgent', 'segera', 'cepat', 'mendesak', 'penting', 'asap', 'sekarang', 'hari ini'
        ],
        'topic_keywords' => [
            'billing' => ['tagihan', 'bayar', 'pembayaran', 'invoice', 'bill'],
            'technical' => ['error', 'bug', 'masalah teknis', 'tidak bisa', 'gagal'],
            'account' => ['akun', 'login', 'password', 'registrasi', 'daftar'],
            'product' => ['produk', 'barang', 'item', 'beli', 'order'],
            'support' => ['bantuan', 'help', 'support', 'tolong', 'mohon bantuan']
        ]
    ],

    /*
    |--------------------------------------------------------------------------
    | API Settings
    |--------------------------------------------------------------------------
    |
    | Configuration for API-based analysis
    |
    */
    'api' => [
        'openai' => [
            'model' => env('OPENAI_MODEL', 'gpt-3.5-turbo'),
            'max_tokens' => env('OPENAI_MAX_TOKENS', 150),
            'temperature' => env('OPENAI_TEMPERATURE', 0.3),
        ],
        'gemini' => [
            'model' => env('GEMINI_MODEL', 'gemini-pro'),
            'max_tokens' => env('GEMINI_MAX_TOKENS', 150),
        ]
    ],

    /*
    |--------------------------------------------------------------------------
    | Monitoring
    |--------------------------------------------------------------------------
    |
    | Enable monitoring and logging for cost tracking
    |
    */
    'monitoring' => [
        'enabled' => env('AI_MONITORING_ENABLED', true),
        'log_api_calls' => env('AI_LOG_API_CALLS', true),
        'log_costs' => env('AI_LOG_COSTS', true),
    ]
];
