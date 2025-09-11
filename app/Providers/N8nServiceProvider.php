<?php

namespace App\Providers;

use App\Services\N8n\N8nService;
use Illuminate\Support\ServiceProvider;

class N8nServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->singleton(N8nService::class, function ($app) {
            $config = $app['config']['n8n'];

            return new N8nService([
                'base_url' => $config['server']['base_url'],
                'api_key' => $config['server']['api_key'],
                'timeout' => $config['server']['timeout'],
                'retry_attempts' => $config['http']['retry_attempts'],
                'retry_delay' => $config['http']['retry_delay'],
                'log_requests' => $config['http']['log_requests'],
                'log_responses' => $config['http']['log_responses'],
                'mock_responses' => $config['testing']['mock_responses'],
            ]);
        });

        // Register alias for easier access
        $this->app->alias(N8nService::class, 'n8n');
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // Publish configuration file
        if ($this->app->runningInConsole()) {
            $this->publishes([
                __DIR__ . '/../../config/n8n.php' => config_path('n8n.php'),
            ], 'n8n-config');
        }
    }
}
