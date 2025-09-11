<?php

namespace App\Providers;

use App\Models\PaymentTransaction;
use App\Models\BillingInvoice;
use App\Observers\PaymentTransactionObserver;
use App\Observers\BillingInvoiceObserver;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
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
     * Configure the rate limiters for the application.
     */
    protected function configureRateLimiting(): void
    {
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('auth', function (Request $request) {
            return Limit::perMinute(5)->by($request->ip());
        });

        RateLimiter::for('login', function (Request $request) {
            return Limit::perMinute(5)->by($request->ip());
        });

        RateLimiter::for('refresh', function (Request $request) {
            return Limit::perMinute(10)->by($request->user()?->id ?: $request->ip());
        });
    }

    /**
     * Register model observers.
     */
    protected function registerObservers(): void
    {
        PaymentTransaction::observe(PaymentTransactionObserver::class);
        BillingInvoice::observe(BillingInvoiceObserver::class);
    }
}
