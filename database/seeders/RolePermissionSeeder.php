<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\Permission;
use App\Models\RolePermission;
use Illuminate\Database\Seeder;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all roles and permissions
        $roles = Role::all();
        $permissions = Permission::all();

        // Validate that roles and permissions exist
        if ($roles->isEmpty()) {
            throw new \Exception('No roles found. Please run RoleSeeder first.');
        }

        if ($permissions->isEmpty()) {
            throw new \Exception('No permissions found. Please run PermissionSeeder first.');
        }

        foreach ($roles as $role) {
            $rolePermissions = [];

            // Super Administrator - All permissions
            if ($role->code === 'super_admin') {
                foreach ($permissions as $permission) {
                    $rolePermissions[] = [
                        'role_id' => $role->id,
                        'permission_id' => $permission->id,
                        'is_granted' => true,
                        'is_inherited' => false,
                        'conditions' => [],
                        'constraints' => [],
                        'granted_by' => null,
                        'granted_at' => now(),
                        'metadata' => ['assigned_via' => 'seeder']
                    ];
                }
            }
            // System Administrator - All system permissions + limited dangerous operations
            elseif ($role->code === 'system_admin') {
                foreach ($permissions as $permission) {
                    $isGranted = true;

                    // Don't grant dangerous permissions to system admin
                    if ($permission->is_dangerous && $permission->code !== 'system.manage') {
                        $isGranted = false;
                    }

                    $rolePermissions[] = [
                        'role_id' => $role->id,
                        'permission_id' => $permission->id,
                        'is_granted' => $isGranted,
                        'is_inherited' => false,
                        'conditions' => [],
                        'constraints' => [],
                        'granted_by' => null,
                        'granted_at' => now(),
                        'metadata' => ['assigned_via' => 'seeder']
                    ];
                }
            }
            // Support Team - Limited system access
            elseif ($role->code === 'support_team') {
                $supportPermissions = [
                    'users.view_all', 'users.view_org', 'organizations.view',
                    'system_logs.view', 'analytics.view', 'chat_sessions.view',
                    'messages.view', 'customers.view'
                ];

                foreach ($permissions as $permission) {
                    $isGranted = in_array($permission->code, $supportPermissions);

                    $rolePermissions[] = [
                        'role_id' => $role->id,
                        'permission_id' => $permission->id,
                        'is_granted' => $isGranted,
                        'is_inherited' => false,
                        'conditions' => [],
                        'constraints' => [],
                        'granted_by' => null,
                        'granted_at' => now(),
                        'metadata' => ['assigned_via' => 'seeder']
                    ];
                }
            }
            // Organization Administrator - Full organization access
            elseif ($role->code === 'org_admin') {
                foreach ($permissions as $permission) {
                    $isGranted = false;

                    // Grant all organization-scoped permissions
                    if ($permission->scope === 'organization' && $permission->organization_id === $role->organization_id) {
                        $isGranted = true;
                    }

                    // Grant limited global permissions
                    if (in_array($permission->code, [
                        'users.view_all', 'organizations.view', 'roles.view', 'permissions.view'
                    ])) {
                        $isGranted = true;
                    }

                    $rolePermissions[] = [
                        'role_id' => $role->id,
                        'permission_id' => $permission->id,
                        'is_granted' => $isGranted,
                        'is_inherited' => false,
                        'conditions' => [],
                        'constraints' => [],
                        'granted_by' => null,
                        'granted_at' => now(),
                        'metadata' => ['assigned_via' => 'seeder']
                    ];
                }
            }
            // Manager - Team management permissions
            elseif ($role->code === 'manager') {
                $managerPermissions = [
                    'users.view_org', 'users.create_org', 'users.update_org',
                    'agents.view', 'agents.create', 'agents.update', 'agents.execute',
                    'customers.view', 'customers.create', 'customers.update',
                    'chat_sessions.view', 'chat_sessions.create', 'chat_sessions.update',
                    'messages.view', 'messages.create', 'messages.update',
                    'knowledge_articles.view', 'knowledge_articles.create', 'knowledge_articles.update',
                    'bot_personalities.view', 'bot_personalities.create', 'bot_personalities.update',
                    'channel_configs.view', 'channel_configs.create', 'channel_configs.update',
                    'analytics.view', 'analytics.export',
                    'billing.view',
                    'api_keys.view', 'api_keys.create', 'api_keys.update',
                    'webhooks.view', 'webhooks.create', 'webhooks.update',
                    'workflows.view', 'workflows.create', 'workflows.update', 'workflows.execute',
                    'inbox.view', 'inbox.create', 'inbox.update', 'inbox.manage', 'inbox.export'
                ];

                foreach ($permissions as $permission) {
                    $isGranted = in_array($permission->code, $managerPermissions) &&
                                $permission->organization_id === $role->organization_id;

                    $rolePermissions[] = [
                        'role_id' => $role->id,
                        'permission_id' => $permission->id,
                        'is_granted' => $isGranted,
                        'is_inherited' => false,
                        'conditions' => [],
                        'constraints' => [],
                        'granted_by' => null,
                        'granted_at' => now(),
                        'metadata' => ['assigned_via' => 'seeder']
                    ];
                }
            }
            // Agent - Chatbot operation permissions
            elseif ($role->code === 'agent') {
                $agentPermissions = [
                    'agents.view', 'agents.execute',
                    'customers.view',
                    'chat_sessions.view', 'chat_sessions.create', 'chat_sessions.update',
                    'messages.view', 'messages.create', 'messages.update',
                    'knowledge_articles.view',
                    'bot_personalities.view',
                    'channel_configs.view',
                    'analytics.view',
                    'inbox.view', 'inbox.create', 'inbox.update'
                ];

                foreach ($permissions as $permission) {
                    $isGranted = in_array($permission->code, $agentPermissions) &&
                                $permission->organization_id === $role->organization_id;

                    $rolePermissions[] = [
                        'role_id' => $role->id,
                        'permission_id' => $permission->id,
                        'is_granted' => $isGranted,
                        'is_inherited' => false,
                        'conditions' => [],
                        'constraints' => [],
                        'granted_by' => null,
                        'granted_at' => now(),
                        'metadata' => ['assigned_via' => 'seeder']
                    ];
                }
            }
            // Content Creator - Content management permissions
            elseif ($role->code === 'content_creator') {
                $creatorPermissions = [
                    'knowledge_articles.view', 'knowledge_articles.create', 'knowledge_articles.update', 'knowledge_articles.publish',
                    'bot_personalities.view', 'bot_personalities.create', 'bot_personalities.update',
                    'analytics.view'
                ];

                foreach ($permissions as $permission) {
                    $isGranted = in_array($permission->code, $creatorPermissions) &&
                                $permission->organization_id === $role->organization_id;

                    $rolePermissions[] = [
                        'role_id' => $role->id,
                        'permission_id' => $permission->id,
                        'is_granted' => $isGranted,
                        'is_inherited' => false,
                        'conditions' => [],
                        'constraints' => [],
                        'granted_by' => null,
                        'granted_at' => now(),
                        'metadata' => ['assigned_via' => 'seeder']
                    ];
                }
            }
            // Analyst - Analytics and reporting permissions
            elseif ($role->code === 'analyst') {
                $analystPermissions = [
                    'analytics.view', 'analytics.export',
                    'chat_sessions.view',
                    'messages.view',
                    'customers.view',
                    'agents.view'
                ];

                foreach ($permissions as $permission) {
                    $isGranted = in_array($permission->code, $analystPermissions) &&
                                $permission->organization_id === $role->organization_id;

                    $rolePermissions[] = [
                        'role_id' => $role->id,
                        'permission_id' => $permission->id,
                        'is_granted' => $isGranted,
                        'is_inherited' => false,
                        'conditions' => [],
                        'constraints' => [],
                        'granted_by' => null,
                        'granted_at' => now(),
                        'metadata' => ['assigned_via' => 'seeder']
                    ];
                }
            }
            // Customer - Basic access permissions
            elseif ($role->code === 'customer') {
                $customerPermissions = [
                    'chat_sessions.view', 'chat_sessions.create',
                    'messages.view', 'messages.create',
                    'knowledge_articles.view'
                ];

                foreach ($permissions as $permission) {
                    $isGranted = in_array($permission->code, $customerPermissions) &&
                                $permission->organization_id === $role->organization_id;

                    $rolePermissions[] = [
                        'role_id' => $role->id,
                        'permission_id' => $permission->id,
                        'is_granted' => $isGranted,
                        'is_inherited' => false,
                        'conditions' => [],
                        'constraints' => [],
                        'granted_by' => null,
                        'granted_at' => now(),
                        'metadata' => ['assigned_via' => 'seeder']
                    ];
                }
            }
            // Viewer - Read-only permissions
            elseif ($role->code === 'viewer') {
                $viewerPermissions = [
                    'users.view_org',
                    'agents.view',
                    'customers.view',
                    'chat_sessions.view',
                    'messages.view',
                    'knowledge_articles.view',
                    'bot_personalities.view',
                    'channel_configs.view',
                    'analytics.view'
                ];

                foreach ($permissions as $permission) {
                    $isGranted = in_array($permission->code, $viewerPermissions) &&
                                $permission->organization_id === $role->organization_id;

                    $rolePermissions[] = [
                        'role_id' => $role->id,
                        'permission_id' => $permission->id,
                        'is_granted' => $isGranted,
                        'is_inherited' => false,
                        'conditions' => [],
                        'constraints' => [],
                        'granted_by' => null,
                        'granted_at' => now(),
                        'metadata' => ['assigned_via' => 'seeder']
                    ];
                }
            }

            // Create role permissions
            foreach ($rolePermissions as $rolePermission) {
                RolePermission::updateOrCreate(
                    ['role_id' => $rolePermission['role_id'], 'permission_id' => $rolePermission['permission_id']], // Search by role_id and permission_id
                    $rolePermission // Update or create with all data
                );
            }
        }
    }
}
