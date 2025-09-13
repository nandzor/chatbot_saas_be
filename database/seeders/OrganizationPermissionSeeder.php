<?php

namespace Database\Seeders;

use App\Models\Organization;
use App\Models\OrganizationPermission;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class OrganizationPermissionSeeder extends Seeder
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
            $this->createPermissionsForOrganization($organization);
        }

        $this->command->info('Organization permissions seeded successfully.');
    }

    /**
     * Create permissions for a specific organization
     */
    private function createPermissionsForOrganization(Organization $organization): void
    {
        $permissions = [
            // User Management
            [
                'name' => 'View Users',
                'slug' => 'users.view',
                'description' => 'View user list and details',
                'category' => 'user_management',
                'metadata' => ['resource' => 'users', 'action' => 'view']
            ],
            [
                'name' => 'Create Users',
                'slug' => 'users.create',
                'description' => 'Create new users',
                'category' => 'user_management',
                'metadata' => ['resource' => 'users', 'action' => 'create']
            ],
            [
                'name' => 'Edit Users',
                'slug' => 'users.edit',
                'description' => 'Edit user information',
                'category' => 'user_management',
                'metadata' => ['resource' => 'users', 'action' => 'edit']
            ],
            [
                'name' => 'Delete Users',
                'slug' => 'users.delete',
                'description' => 'Delete users',
                'category' => 'user_management',
                'metadata' => ['resource' => 'users', 'action' => 'delete']
            ],
            [
                'name' => 'Manage User Roles',
                'slug' => 'users.roles',
                'description' => 'Assign and manage user roles',
                'category' => 'user_management',
                'metadata' => ['resource' => 'users', 'action' => 'manage_roles']
            ],

            // Content Management
            [
                'name' => 'View Content',
                'slug' => 'content.view',
                'description' => 'View content and articles',
                'category' => 'content_management',
                'metadata' => ['resource' => 'content', 'action' => 'view']
            ],
            [
                'name' => 'Create Content',
                'slug' => 'content.create',
                'description' => 'Create new content and articles',
                'category' => 'content_management',
                'metadata' => ['resource' => 'content', 'action' => 'create']
            ],
            [
                'name' => 'Edit Content',
                'slug' => 'content.edit',
                'description' => 'Edit existing content',
                'category' => 'content_management',
                'metadata' => ['resource' => 'content', 'action' => 'edit']
            ],
            [
                'name' => 'Delete Content',
                'slug' => 'content.delete',
                'description' => 'Delete content and articles',
                'category' => 'content_management',
                'metadata' => ['resource' => 'content', 'action' => 'delete']
            ],
            [
                'name' => 'Publish Content',
                'slug' => 'content.publish',
                'description' => 'Publish and unpublish content',
                'category' => 'content_management',
                'metadata' => ['resource' => 'content', 'action' => 'publish']
            ],

            // Chat Management
            [
                'name' => 'View Chats',
                'slug' => 'chats.view',
                'description' => 'View chat sessions and messages',
                'category' => 'chat_management',
                'metadata' => ['resource' => 'chats', 'action' => 'view']
            ],
            [
                'name' => 'Manage Chats',
                'slug' => 'chats.manage',
                'description' => 'Manage chat sessions and responses',
                'category' => 'chat_management',
                'metadata' => ['resource' => 'chats', 'action' => 'manage']
            ],
            [
                'name' => 'Export Chats',
                'slug' => 'chats.export',
                'description' => 'Export chat data and reports',
                'category' => 'chat_management',
                'metadata' => ['resource' => 'chats', 'action' => 'export']
            ],

            // Analytics
            [
                'name' => 'View Analytics',
                'slug' => 'analytics.view',
                'description' => 'View analytics and reports',
                'category' => 'analytics',
                'metadata' => ['resource' => 'analytics', 'action' => 'view']
            ],
            [
                'name' => 'Export Analytics',
                'slug' => 'analytics.export',
                'description' => 'Export analytics data',
                'category' => 'analytics',
                'metadata' => ['resource' => 'analytics', 'action' => 'export']
            ],

            // Settings
            [
                'name' => 'View Settings',
                'slug' => 'settings.view',
                'description' => 'View organization settings',
                'category' => 'settings',
                'metadata' => ['resource' => 'settings', 'action' => 'view']
            ],
            [
                'name' => 'Edit Settings',
                'slug' => 'settings.edit',
                'description' => 'Edit organization settings',
                'category' => 'settings',
                'metadata' => ['resource' => 'settings', 'action' => 'edit']
            ],

            // Billing
            [
                'name' => 'View Billing',
                'slug' => 'billing.view',
                'description' => 'View billing information',
                'category' => 'billing',
                'metadata' => ['resource' => 'billing', 'action' => 'view']
            ],
            [
                'name' => 'Manage Billing',
                'slug' => 'billing.manage',
                'description' => 'Manage billing and subscriptions',
                'category' => 'billing',
                'metadata' => ['resource' => 'billing', 'action' => 'manage']
            ],

            // API Management
            [
                'name' => 'View API Keys',
                'slug' => 'api.view',
                'description' => 'View API keys and usage',
                'category' => 'api_management',
                'metadata' => ['resource' => 'api', 'action' => 'view']
            ],
            [
                'name' => 'Manage API Keys',
                'slug' => 'api.manage',
                'description' => 'Create and manage API keys',
                'category' => 'api_management',
                'metadata' => ['resource' => 'api', 'action' => 'manage']
            ],

            // Audit Logs
            [
                'name' => 'View Audit Logs',
                'slug' => 'audit.view',
                'description' => 'View audit logs and activity',
                'category' => 'audit',
                'metadata' => ['resource' => 'audit', 'action' => 'view']
            ],
            [
                'name' => 'Export Audit Logs',
                'slug' => 'audit.export',
                'description' => 'Export audit log data',
                'category' => 'audit',
                'metadata' => ['resource' => 'audit', 'action' => 'export']
            ]
        ];

        foreach ($permissions as $index => $permissionData) {
            // Check if permission already exists
            $existingPermission = OrganizationPermission::where('organization_id', $organization->id)
                ->where('slug', $permissionData['slug'])
                ->first();

            if ($existingPermission) {
                // Update existing permission without changing ID
                $existingPermission->update([
                    'name' => $permissionData['name'],
                    'description' => $permissionData['description'],
                    'category' => $permissionData['category'],
                    'metadata' => $permissionData['metadata'],
                    'is_active' => true,
                    'sort_order' => $index + 1,
                    'updated_at' => now()
                ]);
            } else {
                // Create new permission with UUID
                OrganizationPermission::create([
                    'id' => \Illuminate\Support\Str::uuid(),
                    'organization_id' => $organization->id,
                    'name' => $permissionData['name'],
                    'slug' => $permissionData['slug'],
                    'description' => $permissionData['description'],
                    'category' => $permissionData['category'],
                    'metadata' => $permissionData['metadata'],
                    'is_active' => true,
                    'sort_order' => $index + 1
                ]);
            }
        }

        $this->command->info("Created " . count($permissions) . " permissions for organization: {$organization->name}");
    }
}
