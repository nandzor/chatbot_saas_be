<?php

namespace App\Providers;

use App\Events\OrganizationCreated;
use App\Events\OrganizationUpdated;
use App\Events\OrganizationDeleted;
use App\Events\NotificationSent;
use App\Events\WhatsAppMessageReceived;
use App\Events\MessageProcessed;
use App\Events\MessageSent;
use App\Listeners\LogOrganizationActivity;
use App\Listeners\SendOrganizationNotification;
use App\Listeners\ProcessNotification;
use App\Listeners\ProcessWhatsAppMessageListener;
use App\Listeners\SendMessageToWahaListener;
use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Listeners\SendEmailVerificationNotification;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Event;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event to listener mappings for the application.
     *
     * @var array<class-string, array<int, class-string>>
     */
    protected $listen = [
        Registered::class => [
            SendEmailVerificationNotification::class,
        ],

        // Organization Events
        OrganizationCreated::class => [
            LogOrganizationActivity::class,
            SendOrganizationNotification::class,
        ],

        OrganizationUpdated::class => [
            LogOrganizationActivity::class,
            SendOrganizationNotification::class,
        ],

        OrganizationDeleted::class => [
            LogOrganizationActivity::class,
            SendOrganizationNotification::class,
        ],

        // Notification Events
        NotificationSent::class => [
            ProcessNotification::class,
        ],

        // WhatsApp Message Events
        WhatsAppMessageReceived::class => [
            ProcessWhatsAppMessageListener::class,
        ],

        // Message Sent Events
        MessageSent::class => [
            SendMessageToWahaListener::class,
        ],
    ];

    /**
     * Register any events for your application.
     */
    public function boot(): void
    {
        //
    }

    /**
     * Determine if events and listeners should be automatically discovered.
     */
    public function shouldDiscoverEvents(): bool
    {
        return false;
    }
}
