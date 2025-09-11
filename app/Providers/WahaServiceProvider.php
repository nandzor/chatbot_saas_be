<?php

namespace App\Providers;

use App\Services\Waha\WahaService;
use Illuminate\Support\ServiceProvider;

class WahaServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->singleton(WahaService::class, function ($app) {
            $config = $app['config']['waha'];
            
            return new WahaService([
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
        $this->app->alias(WahaService::class, 'waha');
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // Publish configuration file
        if ($this->app->runningInConsole()) {
            $this->publishes([
                __DIR__ . '/../../config/waha.php' => config_path('waha.php'),
            ], 'waha-config');
        }
    }
}
