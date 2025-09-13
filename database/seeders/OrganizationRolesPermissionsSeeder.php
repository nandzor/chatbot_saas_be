<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrganizationRolesPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all organizations
        $organizations = DB::table('organizations')->get();

        if ($organizations->isEmpty()) {
            $this->command->info('No organizations found. Please run organization seeder first.');
            return;
        }

        $this->command->info('Seeding roles and permissions for ' . $organizations->count() . ' organizations...');

        foreach ($organizations as $organization) {
            $this->seedOrganizationRolesAndPermissions($organization->id);
        }

        $this->command->info('Roles and permissions seeded successfully!');
    }

    private function seedOrganizationRolesAndPermissions($organizationId)
    {
        // Define permissions
        $permissions = [
            // User Management
            ['name' => 'View Users', 'slug' => 'users.view', 'category' => 'User Management', 'description' => 'View user list and details'],
            ['name' => 'Create Users', 'slug' => 'users.create', 'category' => 'User Management', 'description' => 'Create new users'],
            ['name' => 'Update Users', 'slug' => 'users.update', 'category' => 'User Management', 'description' => 'Update user information'],
            ['name' => 'Delete Users', 'slug' => 'users.delete', 'category' => 'User Management', 'description' => 'Delete users'],
            ['name' => 'Manage User Roles', 'slug' => 'users.manage_roles', 'category' => 'User Management', 'description' => 'Assign and revoke user roles'],

            // Organization Management
            ['name' => 'View Organization', 'slug' => 'organization.view', 'category' => 'Organization', 'description' => 'View organization details'],
            ['name' => 'Update Organization', 'slug' => 'organization.update', 'category' => 'Organization', 'description' => 'Update organization settings'],
            ['name' => 'Manage Organization Settings', 'slug' => 'organization.manage_settings', 'category' => 'Organization', 'description' => 'Manage organization settings'],

            // Chatbot Management
            ['name' => 'View Chatbots', 'slug' => 'chatbots.view', 'category' => 'Chatbot', 'description' => 'View chatbot list and details'],
            ['name' => 'Create Chatbots', 'slug' => 'chatbots.create', 'category' => 'Chatbot', 'description' => 'Create new chatbots'],
            ['name' => 'Update Chatbots', 'slug' => 'chatbots.update', 'category' => 'Chatbot', 'description' => 'Update chatbot settings'],
            ['name' => 'Delete Chatbots', 'slug' => 'chatbots.delete', 'category' => 'Chatbot', 'description' => 'Delete chatbots'],

            // Conversations
            ['name' => 'View Conversations', 'slug' => 'conversations.view', 'category' => 'Conversations', 'description' => 'View conversation list and details'],
            ['name' => 'Manage Conversations', 'slug' => 'conversations.manage', 'category' => 'Conversations', 'description' => 'Manage conversations'],
            ['name' => 'Export Conversations', 'slug' => 'conversations.export', 'category' => 'Conversations', 'description' => 'Export conversation data'],

            // Analytics
            ['name' => 'View Analytics', 'slug' => 'analytics.view', 'category' => 'Analytics', 'description' => 'View analytics dashboard'],
            ['name' => 'Export Analytics', 'slug' => 'analytics.export', 'category' => 'Analytics', 'description' => 'Export analytics data'],

            // Roles & Permissions
            ['name' => 'View Roles', 'slug' => 'roles.view', 'category' => 'Roles & Permissions', 'description' => 'View role list and details'],
            ['name' => 'Create Roles', 'slug' => 'roles.create', 'category' => 'Roles & Permissions', 'description' => 'Create new roles'],
            ['name' => 'Update Roles', 'slug' => 'roles.update', 'category' => 'Roles & Permissions', 'description' => 'Update role settings'],
            ['name' => 'Delete Roles', 'slug' => 'roles.delete', 'category' => 'Roles & Permissions', 'description' => 'Delete roles'],
            ['name' => 'Manage Permissions', 'slug' => 'permissions.manage', 'category' => 'Roles & Permissions', 'description' => 'Manage role permissions'],

            // API Management
            ['name' => 'View API Keys', 'slug' => 'api.view', 'category' => 'API', 'description' => 'View API keys and settings'],
            ['name' => 'Manage API Keys', 'slug' => 'api.manage', 'category' => 'API', 'description' => 'Manage API keys and settings'],

            // Billing
            ['name' => 'View Billing', 'slug' => 'billing.view', 'category' => 'Billing', 'description' => 'View billing information'],
            ['name' => 'Manage Billing', 'slug' => 'billing.manage', 'category' => 'Billing', 'description' => 'Manage billing settings'],
        ];

        // Insert permissions using upsert
        $permissionIds = [];
        foreach ($permissions as $permission) {
            $permissionData = [
                'organization_id' => $organizationId,
                'name' => $permission['name'],
                'slug' => $permission['slug'],
                'description' => $permission['description'],
                'category' => $permission['category'],
                'is_active' => true,
                'sort_order' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ];

            $permissionId = DB::table('organization_permissions')
                ->where('organization_id', $organizationId)
                ->where('slug', $permission['slug'])
                ->value('id');

            if (!$permissionId) {
                $permissionData['id'] = \Illuminate\Support\Str::uuid();
                $permissionId = DB::table('organization_permissions')->insertGetId($permissionData);
            }

            $permissionIds[$permission['slug']] = $permissionId;
        }

        // Define roles
        $roles = [
            [
                'name' => 'Organization Admin',
                'slug' => 'organization_admin',
                'description' => 'Full access to organization settings and user management',
                'is_system' => true,
                'permissions' => [
                    'users.view', 'users.create', 'users.update', 'users.delete', 'users.manage_roles',
                    'organization.view', 'organization.update', 'organization.manage_settings',
                    'chatbots.view', 'chatbots.create', 'chatbots.update', 'chatbots.delete',
                    'conversations.view', 'conversations.manage', 'conversations.export',
                    'analytics.view', 'analytics.export',
                    'roles.view', 'roles.create', 'roles.update', 'roles.delete', 'permissions.manage',
                    'api.view', 'api.manage',
                    'billing.view', 'billing.manage'
                ]
            ],
            [
                'name' => 'Agent',
                'slug' => 'agent',
                'description' => 'Access to chatbot management and customer interactions',
                'is_system' => true,
                'permissions' => [
                    'users.view',
                    'organization.view',
                    'chatbots.view', 'chatbots.create', 'chatbots.update',
                    'conversations.view', 'conversations.manage',
                    'analytics.view'
                ]
            ],
            [
                'name' => 'Viewer',
                'slug' => 'viewer',
                'description' => 'Read-only access to organization data',
                'is_system' => true,
                'permissions' => [
                    'users.view',
                    'organization.view',
                    'chatbots.view',
                    'conversations.view',
                    'analytics.view'
                ]
            ],
            [
                'name' => 'Manager',
                'slug' => 'manager',
                'description' => 'Management access to organization features',
                'is_system' => false,
                'permissions' => [
                    'users.view', 'users.create', 'users.update',
                    'organization.view', 'organization.update',
                    'chatbots.view', 'chatbots.create', 'chatbots.update',
                    'conversations.view', 'conversations.manage',
                    'analytics.view', 'analytics.export',
                    'billing.view'
                ]
            ]
        ];

        // Insert roles and assign permissions
        foreach ($roles as $role) {
            $roleData = [
                'organization_id' => $organizationId,
                'name' => $role['name'],
                'slug' => $role['slug'],
                'description' => $role['description'],
                'is_system' => $role['is_system'],
                'is_active' => true,
                'sort_order' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ];

            $roleId = DB::table('organization_roles')
                ->where('organization_id', $organizationId)
                ->where('slug', $role['slug'])
                ->value('id');

            if (!$roleId) {
                $roleData['id'] = \Illuminate\Support\Str::uuid();
                $roleId = DB::table('organization_roles')->insertGetId($roleData);
            }

            // Assign permissions to role
            foreach ($role['permissions'] as $permissionSlug) {
                if (isset($permissionIds[$permissionSlug])) {
                    $permissionId = $permissionIds[$permissionSlug];

                    // Check if role permission already exists
                    $exists = DB::table('organization_role_permissions')
                        ->where('role_id', $roleId)
                        ->where('permission_id', $permissionId)
                        ->exists();

                    if (!$exists) {
                        DB::table('organization_role_permissions')->insert([
                            'role_id' => $roleId,
                            'permission_id' => $permissionId,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                    }
                }
            }
        }
    }
}
