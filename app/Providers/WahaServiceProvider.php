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
            $serverConfig = $config['server'] ?? [];
            $httpConfig = $config['http'] ?? [];
            $testingConfig = $config['testing'] ?? [];

            return new WahaService(array_merge($serverConfig, $httpConfig, [
                'mock_responses' => $testingConfig['mock_responses'] ?? false,
            ]));
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
