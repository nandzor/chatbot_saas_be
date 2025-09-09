<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Notification;
use App\Notifications\OrganizationNotification;

class NotificationServiceProvider extends ServiceProvider
{
    /**
     * The event to listener mappings for the application.
     *
     * @var array<class-string, array<int, class-string>>
     */
    protected $listen = [
        //
    ];

    /**
     * Register any events for your application.
     */
    public function boot(): void
    {
        // Register notification channels
        $this->registerNotificationChannels();
    }

    /**
     * Register notification channels
     */
    protected function registerNotificationChannels(): void
    {
        // Register custom notification channels if needed
        // For now, we'll use the default channels (mail, database, broadcast)
    }

    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Register notification services
        $this->app->singleton('organization.notifications', function ($app) {
            return new class {
                public function sendToOrganization($organizationId, $notification) {
                    // Get organization users
                    $users = \App\Models\User::where('organization_id', $organizationId)
                        ->where('status', 'active')
                        ->get();

                    // Send notification to all users
                    foreach ($users as $user) {
                        $user->notify($notification);
                    }

                    return $users->count();
                }
            };
        });
    }
}
