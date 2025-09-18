<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Role;
use App\Models\Permission;
use Illuminate\Support\Facades\DB;

class SyncUserPermissions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'permissions:sync-user
                            {--user-id= : Sync specific user by ID}
                            {--role= : Sync all users with specific role}
                            {--all : Sync all users}
                            {--dry-run : Show what would be synced without making changes}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync user permissions from role_permissions table to user.permissions field';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔄 Starting user permissions synchronization...');

        $userId = $this->option('user-id');
        $role = $this->option('role');
        $all = $this->option('all');
        $dryRun = $this->option('dry-run');

        if ($dryRun) {
            $this->warn('🔍 DRY RUN MODE - No changes will be made');
        }

        try {
            if ($userId) {
                $this->syncSpecificUser($userId, $dryRun);
            } elseif ($role) {
                $this->syncUsersByRole($role, $dryRun);
            } elseif ($all) {
                $this->syncAllUsers($dryRun);
            } else {
                $this->error('❌ Please specify --user-id, --role, or --all');
                return 1;
            }

            $this->info('✅ Synchronization completed successfully!');
            return 0;
        } catch (\Exception $e) {
            $this->error('❌ Synchronization failed: ' . $e->getMessage());
            return 1;
        }
    }

    /**
     * Sync specific user by ID
     */
    private function syncSpecificUser($userId, $dryRun = false)
    {
        $user = User::find($userId);

        if (!$user) {
            $this->error("❌ User with ID {$userId} not found");
            return;
        }

        $this->info("🔄 Syncing user: {$user->email} (ID: {$userId})");
        $this->syncUserPermissions($user, $dryRun);
    }

    /**
     * Sync all users with specific role
     */
    private function syncUsersByRole($role, $dryRun = false)
    {
        $users = User::where('role', $role)->get();

        if ($users->isEmpty()) {
            $this->warn("⚠️ No users found with role: {$role}");
            return;
        }

        $this->info("🔄 Found {$users->count()} users with role: {$role}");

        foreach ($users as $user) {
            $this->syncUserPermissions($user, $dryRun);
        }
    }

    /**
     * Sync all users
     */
    private function syncAllUsers($dryRun = false)
    {
        $users = User::all();

        $this->info("🔄 Found {$users->count()} total users");

        $progressBar = $this->output->createProgressBar($users->count());
        $progressBar->start();

        foreach ($users as $user) {
            $this->syncUserPermissions($user, $dryRun);
            $progressBar->advance();
        }

        $progressBar->finish();
        $this->newLine();
    }

    /**
     * Sync permissions for a specific user
     */
    private function syncUserPermissions(User $user, $dryRun = false)
    {
        try {
            // Get current direct permissions
            $currentPermissions = $user->permissions ?? [];

            // Get permissions from roles
            $rolePermissions = $this->getRolePermissions($user);

            // Merge permissions (role permissions take precedence for conflicts)
            $mergedPermissions = array_merge($currentPermissions, $rolePermissions);

            // Show what would be changed
            $this->showPermissionChanges($user, $currentPermissions, $mergedPermissions);

            if (!$dryRun) {
                // Update user permissions
                $user->update(['permissions' => $mergedPermissions]);
                $this->line("✅ Updated permissions for {$user->email}");
            } else {
                $this->line("🔍 Would update permissions for {$user->email}");
            }

        } catch (\Exception $e) {
            $this->error("❌ Failed to sync user {$user->email}: " . $e->getMessage());
        }
    }

    /**
     * Get permissions from user's roles
     */
    private function getRolePermissions(User $user): array
    {
        $permissions = [];

        // Get permissions from direct role field
        if ($user->role) {
            $role = Role::where('code', $user->role)->first();
            if ($role) {
                $rolePermissions = $role->permissions()
                    ->wherePivot('is_granted', true)
                    ->get();

                foreach ($rolePermissions as $permission) {
                    $permissions[$permission->code] = true;
                }
            }
        }

        // Get permissions from user_roles relationship
        if ($user->relationLoaded('roles') || $user->roles()->exists()) {
            $userRoles = $user->roles()->wherePivot('is_active', true)->get();

            foreach ($userRoles as $role) {
                $rolePermissions = $role->permissions()
                    ->wherePivot('is_granted', true)
                    ->get();

                foreach ($rolePermissions as $permission) {
                    $permissions[$permission->code] = true;
                }
            }
        }

        return $permissions;
    }

    /**
     * Show permission changes
     */
    private function showPermissionChanges(User $user, array $current, array $new)
    {
        $added = array_diff_key($new, $current);
        $removed = array_diff_key($current, $new);
        $changed = [];

        foreach ($current as $key => $value) {
            if (isset($new[$key]) && $new[$key] !== $value) {
                $changed[$key] = ['old' => $value, 'new' => $new[$key]];
            }
        }

        if (!empty($added) || !empty($removed) || !empty($changed)) {
            $this->line("📋 Changes for {$user->email}:");

            if (!empty($added)) {
                $this->line("  ➕ Added: " . implode(', ', array_keys($added)));
            }

            if (!empty($removed)) {
                $this->line("  ➖ Removed: " . implode(', ', array_keys($removed)));
            }

            if (!empty($changed)) {
                foreach ($changed as $key => $change) {
                    $this->line("  🔄 Changed {$key}: {$change['old']} → {$change['new']}");
                }
            }
        } else {
            $this->line("✅ No changes needed for {$user->email}");
        }
    }
}
