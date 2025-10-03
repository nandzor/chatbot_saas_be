<?php

namespace App\Providers;

use App\Models\PaymentTransaction;
use App\Models\BillingInvoice;
use App\Models\User;
use App\Observers\PaymentTransactionObserver;
use App\Observers\BillingInvoiceObserver;
use App\Observers\UserPermissionObserver;
use App\Services\WebSocketIntegrationService;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureRateLimiting();
        $this->registerObservers();
        $this->configureGlobalHttpTimeout();
        $this->initializeWebSocket();

        // Allow publishing our custom config files via: php artisan vendor:publish --tag="waha-config" or --tag="n8n-config"
        if ($this->app->runningInConsole()) {
            $this->publishes([
                base_path('config/waha.php') => config_path('waha.php'),
            ], 'waha-config');

            $this->publishes([
                base_path('config/n8n.php') => config_path('n8n.php'),
            ], 'n8n-config');
        }
    }

    /**
     * Initialize WebSocket integration
     */
    protected function initializeWebSocket(): void
    {
        try {
            // Register WebSocket integration service
            $this->app->singleton(WebSocketIntegrationService::class, function ($app) {
                return new WebSocketIntegrationService();
            });

            // Initialize broadcasting if not in console
            if (!$this->app->runningInConsole()) {
                Broadcast::routes();
            }

            \Log::info('WebSocket integration initialized successfully');
        } catch (\Exception $e) {
            \Log::error('Failed to initialize WebSocket integration: ' . $e->getMessage());
        }
    }

    /**
     * Configure global HTTP timeout settings.
     */
    protected function configureGlobalHttpTimeout(): void
    {
        // Set default timeout for all HTTP requests to prevent 10-second timeout
        \Illuminate\Support\Facades\Http::globalOptions([
            'timeout' => 120, // 120 seconds
            'connect_timeout' => 30 // 30 seconds
        ]);
    }

    /**
     * Configure the rate limiters for the application.
     */
    protected function configureRateLimiting(): void
    {
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(1000)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('auth', function (Request $request) {
            return Limit::perMinute(1000)->by($request->ip());
        });

        RateLimiter::for('login', function (Request $request) {
            return Limit::perMinute(1000)->by($request->ip());
        });

        RateLimiter::for('refresh', function (Request $request) {
            return Limit::perMinute(1000)->by($request->user()?->id ?: $request->ip());
        });
    }

    /**
     * Register model observers.
     */
    protected function registerObservers(): void
    {
        PaymentTransaction::observe(PaymentTransactionObserver::class);
        BillingInvoice::observe(BillingInvoiceObserver::class);
        User::observe(UserPermissionObserver::class);
    }
}
