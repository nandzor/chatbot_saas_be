<?php

namespace Database\Seeders;

use App\Models\Organization;
use App\Models\OrganizationPermission;
use App\Models\OrganizationRole;
use App\Models\OrganizationRolePermission;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class OrganizationRolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all organizations
        $organizations = Organization::all();

        if ($organizations->isEmpty()) {
            $this->command->warn('No organizations found. Please run OrganizationSeeder first.');
            return;
        }

        foreach ($organizations as $organization) {
            $this->linkRolesAndPermissionsForOrganization($organization);
        }

        $this->command->info('Organization role permissions linked successfully.');
    }

    /**
     * Link roles and permissions for a specific organization
     */
    private function linkRolesAndPermissionsForOrganization(Organization $organization): void
    {
        // Get all roles and permissions for this organization
        $roles = OrganizationRole::where('organization_id', $organization->id)->get();
        $permissions = OrganizationPermission::where('organization_id', $organization->id)->get();

        if ($roles->isEmpty() || $permissions->isEmpty()) {
            $this->command->warn("No roles or permissions found for organization: {$organization->name}");
            return;
        }

        // Create a mapping of permission slugs to IDs
        $permissionMap = $permissions->keyBy('slug');

        $linkedCount = 0;

        foreach ($roles as $role) {
            // Get permissions from the role's JSON permissions field
            $rolePermissions = $role->permissions ?? [];

            foreach ($rolePermissions as $permissionSlug) {
                if (isset($permissionMap[$permissionSlug])) {
                    $permission = $permissionMap[$permissionSlug];

                    // Check if the relationship already exists
                    $exists = DB::table('organization_role_permissions')
                        ->where('role_id', $role->id)
                        ->where('permission_id', $permission->id)
                        ->exists();

                    if (!$exists) {
                        OrganizationRolePermission::create([
                            'role_id' => $role->id,
                            'permission_id' => $permission->id
                        ]);
                        $linkedCount++;
                    }
                } else {
                    $this->command->warn("Permission '{$permissionSlug}' not found for role '{$role->name}' in organization '{$organization->name}'");
                }
            }
        }

        $this->command->info("Linked {$linkedCount} role-permission relationships for organization: {$organization->name}");
    }

    /**
     * Alternative method to create role-permission relationships based on predefined mappings
     */
    private function createPredefinedRolePermissions(Organization $organization): void
    {
        $rolePermissionMappings = [
            'super-admin' => [
                'users.view', 'users.create', 'users.edit', 'users.delete', 'users.roles',
                'content.view', 'content.create', 'content.edit', 'content.delete', 'content.publish',
                'chats.view', 'chats.manage', 'chats.export',
                'analytics.view', 'analytics.export',
                'settings.view', 'settings.edit',
                'billing.view', 'billing.manage',
                'api.view', 'api.manage',
                'audit.view', 'audit.export'
            ],
            'administrator' => [
                'users.view', 'users.create', 'users.edit', 'users.roles',
                'content.view', 'content.create', 'content.edit', 'content.publish',
                'chats.view', 'chats.manage', 'chats.export',
                'analytics.view', 'analytics.export',
                'settings.view',
                'billing.view',
                'api.view',
                'audit.view'
            ],
            'manager' => [
                'users.view', 'users.edit',
                'content.view', 'content.create', 'content.edit', 'content.publish',
                'chats.view', 'chats.manage',
                'analytics.view',
                'settings.view',
                'audit.view'
            ],
            'content-manager' => [
                'content.view', 'content.create', 'content.edit', 'content.publish',
                'chats.view',
                'analytics.view'
            ],
            'support-agent' => [
                'chats.view', 'chats.manage',
                'content.view',
                'analytics.view'
            ],
            'analyst' => [
                'analytics.view', 'analytics.export',
                'chats.view',
                'content.view',
                'audit.view'
            ],
            'viewer' => [
                'users.view',
                'content.view',
                'chats.view',
                'analytics.view',
                'settings.view'
            ],
            'guest' => [
                'content.view',
                'chats.view'
            ]
        ];

        // Get all roles and permissions for this organization
        $roles = OrganizationRole::where('organization_id', $organization->id)->get();
        $permissions = OrganizationPermission::where('organization_id', $organization->id)->get();

        // Create a mapping of permission slugs to IDs
        $permissionMap = $permissions->keyBy('slug');
        $roleMap = $roles->keyBy('slug');

        $linkedCount = 0;

        foreach ($rolePermissionMappings as $roleSlug => $permissionSlugs) {
            if (!isset($roleMap[$roleSlug])) {
                $this->command->warn("Role '{$roleSlug}' not found for organization '{$organization->name}'");
                continue;
            }

            $role = $roleMap[$roleSlug];

            foreach ($permissionSlugs as $permissionSlug) {
                if (!isset($permissionMap[$permissionSlug])) {
                    $this->command->warn("Permission '{$permissionSlug}' not found for organization '{$organization->name}'");
                    continue;
                }

                $permission = $permissionMap[$permissionSlug];

                // Check if the relationship already exists
                $exists = DB::table('organization_role_permissions')
                    ->where('role_id', $role->id)
                    ->where('permission_id', $permission->id)
                    ->exists();

                if (!$exists) {
                    OrganizationRolePermission::create([
                        'role_id' => $role->id,
                        'permission_id' => $permission->id
                    ]);
                    $linkedCount++;
                }
            }
        }

        $this->command->info("Linked {$linkedCount} predefined role-permission relationships for organization: {$organization->name}");
    }
}
