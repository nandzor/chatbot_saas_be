<?php

namespace App\Providers;

use App\Services\N8n\N8nService;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Config;

class N8nServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->singleton(N8nService::class, function ($app) {
            $config = Config::get('n8n', []);

            // Use host.docker.internal when running in Docker container
            $baseUrl = $config['server']['base_url'] ?? env('N8N_BASE_URL', 'http://localhost:5678');
            if (strpos($baseUrl, 'localhost') !== false && file_exists('/.dockerenv')) {
                $baseUrl = str_replace('localhost', 'host.docker.internal', $baseUrl);
            }

            return new N8nService([
                'base_url' => $baseUrl,
                'api_key' => $config['server']['api_key'] ?? '',
                'timeout' => $config['server']['timeout'] ?? env('N8N_TIMEOUT', 30),
                'retry_attempts' => $config['http']['retry_attempts'] ?? env('N8N_RETRY_ATTEMPTS', 3),
                'retry_delay' => $config['http']['retry_delay'] ?? env('N8N_RETRY_DELAY', 1000),
                'max_retry_delay' => $config['http']['max_retry_delay'] ?? env('N8N_MAX_RETRY_DELAY', 10000),
                'exponential_backoff' => $config['http']['exponential_backoff'] ?? env('N8N_EXPONENTIAL_BACKOFF', true),
                'log_requests' => $config['http']['log_requests'] ?? env('N8N_LOG_REQUESTS', true),
                'log_responses' => $config['http']['log_responses'] ?? env('N8N_LOG_RESPONSES', true),
                'mock_responses' => $config['testing']['mock_responses'] ?? env('N8N_MOCK_RESPONSES', false),
            ]);
        });
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
