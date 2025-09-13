<?php

namespace Database\Seeders;

use App\Models\Organization;
use App\Models\OrganizationRole;
use Illuminate\Database\Seeder;

class OrganizationRoleSeeder extends Seeder
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
            $this->createRolesForOrganization($organization);
        }

        $this->command->info('Organization roles seeded successfully.');
    }

    /**
     * Create roles for a specific organization
     */
    private function createRolesForOrganization(Organization $organization): void
    {
        $roles = [
            // Super Admin Role
            [
                'name' => 'Super Administrator',
                'slug' => 'super-admin',
                'description' => 'Full access to all organization features and settings',
                'permissions' => [
                    'users.view', 'users.create', 'users.edit', 'users.delete', 'users.roles',
                    'content.view', 'content.create', 'content.edit', 'content.delete', 'content.publish',
                    'chats.view', 'chats.manage', 'chats.export',
                    'analytics.view', 'analytics.export',
                    'settings.view', 'settings.edit',
                    'billing.view', 'billing.manage',
                    'api.view', 'api.manage',
                    'audit.view', 'audit.export'
                ],
                'is_system' => true,
                'is_active' => true,
                'sort_order' => 1
            ],

            // Administrator Role
            [
                'name' => 'Administrator',
                'slug' => 'administrator',
                'description' => 'Administrative access to most organization features',
                'permissions' => [
                    'users.view', 'users.create', 'users.edit', 'users.roles',
                    'content.view', 'content.create', 'content.edit', 'content.publish',
                    'chats.view', 'chats.manage', 'chats.export',
                    'analytics.view', 'analytics.export',
                    'settings.view',
                    'billing.view',
                    'api.view',
                    'audit.view'
                ],
                'is_system' => true,
                'is_active' => true,
                'sort_order' => 2
            ],

            // Manager Role
            [
                'name' => 'Manager',
                'slug' => 'manager',
                'description' => 'Management access to team and content features',
                'permissions' => [
                    'users.view', 'users.edit',
                    'content.view', 'content.create', 'content.edit', 'content.publish',
                    'chats.view', 'chats.manage',
                    'analytics.view',
                    'settings.view',
                    'audit.view'
                ],
                'is_system' => true,
                'is_active' => true,
                'sort_order' => 3
            ],

            // Content Manager Role
            [
                'name' => 'Content Manager',
                'slug' => 'content-manager',
                'description' => 'Specialized role for content creation and management',
                'permissions' => [
                    'content.view', 'content.create', 'content.edit', 'content.publish',
                    'chats.view',
                    'analytics.view'
                ],
                'is_system' => false,
                'is_active' => true,
                'sort_order' => 4
            ],

            // Support Agent Role
            [
                'name' => 'Support Agent',
                'slug' => 'support-agent',
                'description' => 'Role for customer support and chat management',
                'permissions' => [
                    'chats.view', 'chats.manage',
                    'content.view',
                    'analytics.view'
                ],
                'is_system' => false,
                'is_active' => true,
                'sort_order' => 5
            ],

            // Analyst Role
            [
                'name' => 'Analyst',
                'slug' => 'analyst',
                'description' => 'Role for viewing and analyzing data',
                'permissions' => [
                    'analytics.view', 'analytics.export',
                    'chats.view',
                    'content.view',
                    'audit.view'
                ],
                'is_system' => false,
                'is_active' => true,
                'sort_order' => 6
            ],

            // Viewer Role
            [
                'name' => 'Viewer',
                'slug' => 'viewer',
                'description' => 'Read-only access to organization data',
                'permissions' => [
                    'users.view',
                    'content.view',
                    'chats.view',
                    'analytics.view',
                    'settings.view'
                ],
                'is_system' => false,
                'is_active' => true,
                'sort_order' => 7
            ],

            // Guest Role
            [
                'name' => 'Guest',
                'slug' => 'guest',
                'description' => 'Limited access for temporary users',
                'permissions' => [
                    'content.view',
                    'chats.view'
                ],
                'is_system' => false,
                'is_active' => true,
                'sort_order' => 8
            ]
        ];

        foreach ($roles as $roleData) {
            // Check if role already exists
            $existingRole = OrganizationRole::where('organization_id', $organization->id)
                ->where('slug', $roleData['slug'])
                ->first();

            if ($existingRole) {
                // Update existing role without changing ID
                $existingRole->update([
                    'name' => $roleData['name'],
                    'description' => $roleData['description'],
                    'permissions' => $roleData['permissions'],
                    'is_system' => $roleData['is_system'],
                    'is_active' => $roleData['is_active'],
                    'sort_order' => $roleData['sort_order'],
                    'updated_at' => now()
                ]);
            } else {
                // Create new role with UUID
                OrganizationRole::create([
                    'id' => \Illuminate\Support\Str::uuid(),
                    'organization_id' => $organization->id,
                    'name' => $roleData['name'],
                    'slug' => $roleData['slug'],
                    'description' => $roleData['description'],
                    'permissions' => $roleData['permissions'],
                    'is_system' => $roleData['is_system'],
                    'is_active' => $roleData['is_active'],
                    'sort_order' => $roleData['sort_order']
                ]);
            }
        }

        $this->command->info("Created " . count($roles) . " roles for organization: {$organization->name}");
    }
}
