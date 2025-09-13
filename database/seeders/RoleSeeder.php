<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\Organization;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $organizations = Organization::all();

        // Validate that organizations exist
        if ($organizations->isEmpty()) {
            throw new \Exception('No organizations found. Please run OrganizationSeeder first.');
        }

        // System roles (global scope, no organization)
        $systemRoles = [
            [
                'name' => 'Super Administrator',
                'code' => 'super_admin',
                'display_name' => 'Super Administrator',
                'description' => 'Full system access with all permissions',
                'scope' => 'global',
                'level' => 100,
                'is_system_role' => true,
                'is_default' => false,
                'parent_role_id' => null,
                'inherits_permissions' => false,
                'max_users' => null,
                'current_users' => 0,
                'color' => '#DC2626',
                'icon' => 'shield-check',
                'badge_text' => 'SUPER',
                'metadata' => [
                    'created_via' => 'seeder',
                    'system_role' => true,
                    'dangerous_role' => true
                ],
                'status' => 'active'
            ],
            [
                'name' => 'System Administrator',
                'code' => 'system_admin',
                'display_name' => 'System Administrator',
                'description' => 'System-wide administration with limited dangerous operations',
                'scope' => 'global',
                'level' => 90,
                'is_system_role' => true,
                'is_default' => false,
                'parent_role_id' => null,
                'inherits_permissions' => false,
                'max_users' => null,
                'current_users' => 0,
                'color' => '#EA580C',
                'icon' => 'cog',
                'badge_text' => 'SYS',
                'metadata' => [
                    'created_via' => 'seeder',
                    'system_role' => true
                ],
                'status' => 'active'
            ],
            [
                'name' => 'Support Team',
                'code' => 'support_team',
                'display_name' => 'Support Team',
                'description' => 'Customer support and troubleshooting access',
                'scope' => 'global',
                'level' => 50,
                'is_system_role' => true,
                'is_default' => false,
                'parent_role_id' => null,
                'inherits_permissions' => false,
                'max_users' => null,
                'current_users' => 0,
                'color' => '#059669',
                'icon' => 'life-ring',
                'badge_text' => 'SUPPORT',
                'metadata' => [
                    'created_via' => 'seeder',
                    'system_role' => true
                ],
                'status' => 'active'
            ]
        ];

        // Create system roles (no organization)
        foreach ($systemRoles as $role) {
            $role['organization_id'] = null; // Explicitly set to null for system roles
            $role['id'] = \Illuminate\Support\Str::uuid(); // Add UUID for new records
            Role::updateOrCreate(
                ['code' => $role['code']], // Search by code
                $role // Update or create with all data
            );
        }

        // Organization-specific roles
        foreach ($organizations as $organization) {
            $orgRoles = [
                [
                    'name' => 'Organization Administrator',
                    'code' => 'org_admin',
                    'display_name' => 'Organization Administrator',
                    'description' => 'Full access to organization settings and management',
                    'scope' => 'organization',
                    'level' => 80,
                    'is_system_role' => false,
                    'is_default' => false,
                    'parent_role_id' => null,
                    'inherits_permissions' => false,
                    'max_users' => null,
                    'current_users' => 0,
                    'color' => '#2563EB',
                    'icon' => 'building',
                    'badge_text' => 'ADMIN',
                    'metadata' => [
                        'created_via' => 'seeder',
                        'organization_role' => true,
                        'dangerous_role' => true
                    ],
                    'status' => 'active'
                ],
                [
                    'name' => 'Manager',
                    'code' => 'manager',
                    'display_name' => 'Manager',
                    'description' => 'Team management and oversight capabilities',
                    'scope' => 'organization',
                    'level' => 60,
                    'is_system_role' => false,
                    'is_default' => false,
                    'parent_role_id' => null,
                    'inherits_permissions' => false,
                    'max_users' => null,
                    'current_users' => 0,
                    'color' => '#7C3AED',
                    'icon' => 'users',
                    'badge_text' => 'MANAGER',
                    'metadata' => [
                        'created_via' => 'seeder',
                        'organization_role' => true
                    ],
                    'status' => 'active'
                ],
                [
                    'name' => 'Agent',
                    'code' => 'agent',
                    'display_name' => 'Agent',
                    'description' => 'Chatbot agent management and operation',
                    'scope' => 'organization',
                    'level' => 40,
                    'is_system_role' => false,
                    'is_default' => false,
                    'parent_role_id' => null,
                    'inherits_permissions' => false,
                    'max_users' => null,
                    'current_users' => 0,
                    'color' => '#059669',
                    'icon' => 'robot',
                    'badge_text' => 'AGENT',
                    'metadata' => [
                        'created_via' => 'seeder',
                        'organization_role' => true
                    ],
                    'status' => 'active'
                ],
                [
                    'name' => 'Content Creator',
                    'code' => 'content_creator',
                    'display_name' => 'Content Creator',
                    'description' => 'Knowledge base and content management',
                    'scope' => 'organization',
                    'level' => 30,
                    'is_system_role' => false,
                    'is_default' => false,
                    'parent_role_id' => null,
                    'inherits_permissions' => false,
                    'max_users' => null,
                    'current_users' => 0,
                    'color' => '#D97706',
                    'icon' => 'document-text',
                    'badge_text' => 'CREATOR',
                    'metadata' => [
                        'created_via' => 'seeder',
                        'organization_role' => true
                    ],
                    'status' => 'active'
                ],
                [
                    'name' => 'Analyst',
                    'code' => 'analyst',
                    'display_name' => 'Analyst',
                    'description' => 'Analytics and reporting access',
                    'scope' => 'organization',
                    'level' => 25,
                    'is_system_role' => false,
                    'is_default' => false,
                    'parent_role_id' => null,
                    'inherits_permissions' => false,
                    'max_users' => null,
                    'current_users' => 0,
                    'color' => '#0891B2',
                    'icon' => 'chart-bar',
                    'badge_text' => 'ANALYST',
                    'metadata' => [
                        'created_via' => 'seeder',
                        'organization_role' => true
                    ],
                    'status' => 'active'
                ],
                [
                    'name' => 'Customer',
                    'code' => 'customer',
                    'display_name' => 'Customer',
                    'description' => 'Basic customer access to chat and support',
                    'scope' => 'organization',
                    'level' => 10,
                    'is_system_role' => false,
                    'is_default' => true,
                    'parent_role_id' => null,
                    'inherits_permissions' => false,
                    'max_users' => null,
                    'current_users' => 0,
                    'color' => '#6B7280',
                    'icon' => 'user',
                    'badge_text' => 'CUSTOMER',
                    'metadata' => [
                        'created_via' => 'seeder',
                        'organization_role' => true,
                        'default_role' => true
                    ],
                    'status' => 'active'
                ],
                [
                    'name' => 'Viewer',
                    'code' => 'viewer',
                    'display_name' => 'Viewer',
                    'description' => 'Read-only access to organization data',
                    'scope' => 'organization',
                    'level' => 5,
                    'is_system_role' => false,
                    'is_default' => false,
                    'parent_role_id' => null,
                    'inherits_permissions' => false,
                    'max_users' => null,
                    'current_users' => 0,
                    'color' => '#9CA3AF',
                    'icon' => 'eye',
                    'badge_text' => 'VIEWER',
                    'metadata' => [
                        'created_via' => 'seeder',
                        'organization_role' => true,
                        'read_only' => true
                    ],
                    'status' => 'active'
                ]
            ];

            foreach ($orgRoles as $role) {
                $role['organization_id'] = $organization->id;
                $role['id'] = \Illuminate\Support\Str::uuid(); // Add UUID for new records
                Role::updateOrCreate(
                    ['organization_id' => $organization->id, 'code' => $role['code']], // Search by organization_id and code
                    $role // Update or create with all data
                );
            }
        }
    }
}
