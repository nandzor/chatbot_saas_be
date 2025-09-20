<?php

namespace App\Providers;

use App\Services\Waha\WahaService;
use App\Services\Waha\WahaSyncService;
use Illuminate\Support\ServiceProvider;

class WahaServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        // Register WahaService as singleton
        $this->app->singleton(WahaService::class, function ($app) {
            return new WahaService();
        });

        // Register WahaSyncService as singleton
        $this->app->singleton(WahaSyncService::class, function ($app) {
            return new WahaSyncService($app->make(WahaService::class));
        });

        // Register alias for easier access
        $this->app->alias(WahaService::class, 'waha.service');
        $this->app->alias(WahaSyncService::class, 'waha.sync');
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // Publish configuration file
        $this->publishes([
            __DIR__ . '/../../config/waha.php' => config_path('waha.php'),
        ], 'waha-config');

        // Merge configuration
        $this->mergeConfigFrom(
            __DIR__ . '/../../config/waha.php',
            'waha'
        );
    }

    /**
     * Get the services provided by the provider.
     *
     * @return array
     */
    public function provides(): array
    {
        return [
            WahaService::class,
            WahaSyncService::class,
            'waha.service',
            'waha.sync',
        ];
    }
}
