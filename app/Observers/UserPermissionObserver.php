<?php

namespace App\Observers;

use App\Models\User;
use App\Services\PermissionSyncService;

class UserPermissionObserver
{
    protected $permissionSyncService;

    public function __construct(PermissionSyncService $permissionSyncService)
    {
        $this->permissionSyncService = $permissionSyncService;
    }

    /**
     * Handle the User "created" event.
     */
    public function created(User $user): void
    {
        // Skip auto-sync permissions to avoid timeout
        // $this->permissionSyncService->syncUserPermissions($user, true);
    }

    /**
     * Handle the User "updated" event.
     */
    public function updated(User $user): void
    {
        // Check if role was changed
        if ($user->isDirty('role')) {
            $this->permissionSyncService->syncUserPermissions($user, true);
        }
    }

    /**
     * Handle the User "saved" event.
     */
    public function saved(User $user): void
    {
        // Only sync if role was changed or this is a new user
        if ($user->wasRecentlyCreated || $user->isDirty('role')) {
            $this->permissionSyncService->syncUserPermissions($user, true);
        }
    }
}
