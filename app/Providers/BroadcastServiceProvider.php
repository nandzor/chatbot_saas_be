<?php

namespace App\Providers;

use Illuminate\Broadcasting\BroadcastServiceProvider as BaseBroadcastServiceProvider;
use App\Broadcasting\CustomReverbBroadcaster;

class BroadcastServiceProvider extends BaseBroadcastServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        parent::register();
    }

    /**
     * Bootstrap any application services (optimized)
     */
    public function boot(): void
    {
        // Register optimized custom Reverb broadcaster
        \Illuminate\Support\Facades\Broadcast::extend('reverb', function ($app, $config) {
            $pusher = new \Pusher\Pusher(
                $config['key'],
                $config['secret'],
                $config['app_id'],
                $config['options'] ?? []
            );

            return new CustomReverbBroadcaster($pusher);
        });

        // Register broadcasting routes
        \Illuminate\Support\Facades\Broadcast::routes();

        // Load channel definitions
        require base_path('routes/channels.php');
    }
}
