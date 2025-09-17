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
            
            return new N8nService([
                'base_url' => $config['server']['base_url'] ?? 'http://n8n:5678',
                'api_key' => $config['server']['api_key'] ?? '',
                'timeout' => $config['server']['timeout'] ?? 30,
                'retry_attempts' => $config['http']['retry_attempts'] ?? 3,
                'retry_delay' => $config['http']['retry_delay'] ?? 1000,
                'max_retry_delay' => $config['http']['max_retry_delay'] ?? 10000,
                'exponential_backoff' => $config['http']['exponential_backoff'] ?? true,
                'log_requests' => $config['http']['log_requests'] ?? true,
                'log_responses' => $config['http']['log_responses'] ?? true,
                'mock_responses' => $config['server']['mock_responses'] ?? false,
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