<?php

namespace App\Listeners;

use App\Events\OrganizationCreated;
use App\Events\OrganizationUpdated;
use App\Events\OrganizationDeleted;
use App\Models\AuditLog;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class LogOrganizationActivity implements ShouldQueue
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
                $this->logOrganizationCreated($event);
            } elseif ($event instanceof OrganizationUpdated) {
                $this->logOrganizationUpdated($event);
            } elseif ($event instanceof OrganizationDeleted) {
                $this->logOrganizationDeleted($event);
            }
        } catch (\Exception $e) {
            Log::error('Failed to log organization activity', [
                'event' => get_class($event),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }

    /**
     * Log organization created event
     */
    private function logOrganizationCreated(OrganizationCreated $event): void
    {
        AuditLog::create([
            'organization_id' => $event->organization->id,
            'action' => 'created',
            'description' => 'Organization created',
            'user_id' => auth()->id(),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'resource_type' => 'Organization',
            'resource_id' => $event->organization->id,
            'resource_name' => $event->organization->name,
            'new_values' => $event->organization->toArray(),
            'severity' => 'info'
        ]);
    }

    /**
     * Log organization updated event
     */
    private function logOrganizationUpdated(OrganizationUpdated $event): void
    {
        AuditLog::create([
            'organization_id' => $event->organization->id,
            'action' => 'updated',
            'description' => 'Organization updated: ' . implode(', ', array_keys($event->changes)),
            'user_id' => auth()->id(),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'resource_type' => 'Organization',
            'resource_id' => $event->organization->id,
            'resource_name' => $event->organization->name,
            'old_values' => $event->changes,
            'new_values' => $event->organization->toArray(),
            'changes' => $event->changes,
            'severity' => 'info'
        ]);
    }

    /**
     * Log organization deleted event
     */
    private function logOrganizationDeleted(OrganizationDeleted $event): void
    {
        AuditLog::create([
            'organization_id' => $event->organizationId,
            'action' => $event->deletionType === 'soft' ? 'soft_deleted' : 'deleted',
            'description' => "Organization {$event->deletionType} deleted: {$event->organizationName}",
            'user_id' => auth()->id(),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'resource_type' => 'Organization',
            'resource_id' => $event->organizationId,
            'resource_name' => $event->organizationName,
            'severity' => 'warning'
        ]);
    }
}
