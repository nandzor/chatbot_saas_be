<?php

namespace App\Listeners;

use App\Events\OrganizationCreated;
use App\Events\OrganizationUpdated;
use App\Events\OrganizationDeleted;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;

class SendOrganizationNotification implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle($event): void
    {
        try {
            if ($event instanceof OrganizationCreated) {
                $this->sendOrganizationCreatedNotification($event);
            } elseif ($event instanceof OrganizationUpdated) {
                $this->sendOrganizationUpdatedNotification($event);
            } elseif ($event instanceof OrganizationDeleted) {
                $this->sendOrganizationDeletedNotification($event);
            }
        } catch (\Exception $e) {
            Log::error('Failed to send organization notification', [
                'event' => get_class($event),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }

    /**
     * Send organization created notification
     */
    private function sendOrganizationCreatedNotification(OrganizationCreated $event): void
    {
        $organization = $event->organization;

        // Log notification
        Log::info('Organization created notification', [
            'organization_id' => $organization->id,
            'organization_name' => $organization->name,
            'organization_email' => $organization->email,
            'status' => $organization->status,
            'subscription_status' => $organization->subscription_status
        ]);

        // Here you can implement actual notification logic:
        // - Send welcome email to organization
        // - Send notification to admin team
        // - Send webhook notification
        // - Send in-app notification

        // Example: Send welcome email (uncomment when email templates are ready)
        /*
        Mail::to($organization->email)->send(new OrganizationWelcomeEmail($organization));
        */

        // TODO: Implement admin notification when notification system is ready
    }

    /**
     * Send organization updated notification
     */
    private function sendOrganizationUpdatedNotification(OrganizationUpdated $event): void
    {
        $organization = $event->organization;
        $changes = $event->changes;

        // Log notification
        Log::info('Organization updated notification', [
            'organization_id' => $organization->id,
            'organization_name' => $organization->name,
            'changes' => $changes,
            'updated_fields' => array_keys($changes)
        ]);

        // Check if critical fields were updated
        $criticalFields = ['status', 'subscription_status', 'email', 'name'];
        $criticalChanges = array_intersect_key($changes, array_flip($criticalFields));

        if (!empty($criticalChanges)) {
            // Send critical update notification
            Log::warning('Critical organization update detected', [
                'organization_id' => $organization->id,
                'critical_changes' => $criticalChanges
            ]);

            // Here you can implement critical update notifications:
            // - Send email to organization about critical changes
            // - Send alert to admin team
            // - Send webhook notification
        }

        // Here you can implement general update notifications:
        // - Send update summary email
        // - Send in-app notification
    }

    /**
     * Send organization deleted notification
     */
    private function sendOrganizationDeletedNotification(OrganizationDeleted $event): void
    {
        // Log notification
        Log::warning('Organization deleted notification', [
            'organization_id' => $event->organizationId,
            'organization_name' => $event->organizationName,
            'deletion_type' => $event->deletionType
        ]);

        // Send admin notification about deletion
        Log::critical('Organization deletion requires attention', [
            'organization_id' => $event->organizationId,
            'organization_name' => $event->organizationName,
            'deletion_type' => $event->deletionType,
            'deleted_by' => \Illuminate\Support\Facades\Auth::check() ? \Illuminate\Support\Facades\Auth::id() : 'system',
            'deleted_at' => now()
        ]);

        // Here you can implement deletion notifications:
        // - Send email to admin team
        // - Send webhook notification
        // - Send alert to monitoring system
    }
}
