<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
use App\Models\Organization;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Generate permissions based on user role.
     */
    private function generatePermissionsByRole(string $role): array
    {
        switch ($role) {
            case 'super_admin':
                return [
                    'users.view_all' => true,
                    'users.create' => true,
                    'users.update' => true,
                    'users.delete' => true,
                    'users.manage_roles' => true,
                    'organizations.view' => true,
                    'organizations.create' => true,
                    'organizations.update' => true,
                    'organizations.delete' => true,
                    'roles.view' => true,
                    'roles.create' => true,
                    'roles.update' => true,
                    'roles.delete' => true,
                    'roles.manage_permissions' => true,
                    'permissions.view' => true,
                    'permissions.create' => true,
                    'permissions.update' => true,
                    'permissions.delete' => true,
                    'system_logs.view' => true,
                    'system.manage' => true,
                    'agents.view' => true,
                    'agents.create' => true,
                    'agents.update' => true,
                    'agents.delete' => true,
                    'agents.execute' => true,
                    'customers.view' => true,
                    'customers.create' => true,
                    'customers.update' => true,
                    'customers.delete' => true,
                    'chat_sessions.view' => true,
                    'chat_sessions.create' => true,
                    'chat_sessions.update' => true,
                    'chat_sessions.delete' => true,
                    'messages.view' => true,
                    'messages.create' => true,
                    'messages.update' => true,
                    'messages.delete' => true,
                    'knowledge_articles.view' => true,
                    'knowledge_articles.create' => true,
                    'knowledge_articles.update' => true,
                    'knowledge_articles.delete' => true,
                    'analytics.view' => true,
                    'billing.view' => true,
                    'billing.manage' => true
                ];
            case 'org_admin':
                return [
                    'users.view_org' => true,
                    'users.create_org' => true,
                    'users.update_org' => true,
                    'users.delete_org' => true,
                    'agents.view' => true,
                    'agents.create' => true,
                    'agents.update' => true,
                    'agents.delete' => true,
                    'agents.execute' => true,
                    'customers.view' => true,
                    'customers.create' => true,
                    'customers.update' => true,
                    'customers.delete' => true,
                    'chat_sessions.view' => true,
                    'chat_sessions.create' => true,
                    'chat_sessions.update' => true,
                    'chat_sessions.delete' => true,
                    'messages.view' => true,
                    'messages.create' => true,
                    'messages.update' => true,
                    'messages.delete' => true,
                    'knowledge_articles.view' => true,
                    'knowledge_articles.create' => true,
                    'knowledge_articles.update' => true,
                    'knowledge_articles.delete' => true,
                    'analytics.view' => true,
                    'billing.view' => true,
                    'reports.view' => true,
                    'inbox.view' => true,
                    'inbox.create' => true,
                    'inbox.update' => true,
                    'inbox.delete' => true,
                    'inbox.manage' => true,
                    'inbox.export' => true,
                    'inbox.templates.create' => true
                ];
            case 'agent':
                return [
                    'chat_sessions.view' => true,
                    'chat_sessions.create' => true,
                    'chat_sessions.update' => true,
                    'customers.view' => true,
                    'customers.update' => true,
                    'knowledge_articles.view' => true,
                    'knowledge_articles.create' => true,
                    'knowledge_articles.update' => true,
                    'messages.view' => true,
                    'messages.create' => true,
                    'messages.update' => true,
                    'analytics.view_own' => true,
                    'reports.view' => true,
                    'inbox.view' => true,
                    'inbox.create' => true,
                    'inbox.update' => true
                ];
            case 'developer':
                return [
                    'api_keys.view' => true,
                    'api_keys.create' => true,
                    'api_keys.update' => true,
                    'api_keys.delete' => true,
                    'system_logs.view' => true,
                    'webhooks.view' => true,
                    'webhooks.create' => true,
                    'webhooks.update' => true,
                    'webhooks.delete' => true,
                    'ai_models.view' => true,
                    'ai_models.create' => true,
                    'ai_models.update' => true,
                    'ai_models.delete' => true,
                    'workflows.view' => true,
                    'workflows.create' => true,
                    'workflows.update' => true,
                    'workflows.delete' => true
                ];
            case 'moderator':
                return [
                    'content_moderation' => true,
                    'user_moderation' => true,
                    'chat_monitoring' => true,
                    'reports.view' => true,
                    'content_approval' => true,
                    'user_suspension' => true,
                    'chat_review' => true,
                    'abuse_reports' => true,
                    'chat_sessions.view' => true,
                    'messages.view' => true,
                    'knowledge_articles.view' => true,
                    'knowledge_articles.update' => true
                ];
            case 'customer':
                return [
                    'own_profile.view' => true,
                    'own_profile.update' => true,
                    'chat_sessions.create' => true,
                    'chat_sessions.view_own' => true,
                    'messages.create' => true,
                    'messages.view_own' => true,
                    'knowledge_articles.view' => true
                ];
            case 'viewer':
                return [
                    'analytics.view' => true,
                    'reports.view' => true,
                    'content.view' => true,
                    'users.view_org' => true,
                    'chat_sessions.view' => true,
                    'knowledge_articles.view' => true
                ];
            default:
                return [
                    'own_profile.view' => true,
                    'own_profile.update' => true
                ];
        }
    }

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $organizations = Organization::all();

        // Validate that organizations exist (only needed for organization users)
        if ($organizations->isEmpty()) {
            throw new \Exception('No organizations found. Please run OrganizationSeeder first.');
        }

        // System users (no organization)
        $systemUsers = [
            [
                'email' => 'superadmin@chatbot-saas.com',
                'username' => 'superadmin',
                'password_hash' => Hash::make('SuperAdmin123!'),
                'full_name' => 'Super Administrator',
                'first_name' => 'Super',
                'last_name' => 'Administrator',
                'phone' => '+6281234567890',
                'avatar_url' => 'https://via.placeholder.com/200x200/DC2626/FFFFFF?text=SA',
                'role' => 'super_admin',
                'is_email_verified' => true,
                'is_phone_verified' => true,
                'two_factor_enabled' => true,
                'login_count' => 0,
                'failed_login_attempts' => 0,
                'password_changed_at' => now(),
                'active_sessions' => [],
                'max_concurrent_sessions' => 5,
                'ui_preferences' => [
                    'theme' => 'dark',
                    'language' => 'en',
                    'timezone' => 'Asia/Jakarta',
                    'notifications' => ['email' => true, 'push' => true]
                ],
                'dashboard_config' => [
                    'widgets' => ['analytics', 'recent_activity', 'system_status'],
                    'layout' => 'grid'
                ],
                'notification_preferences' => [
                    'email_notifications' => true,
                    'push_notifications' => true,
                    'sms_notifications' => false
                ],
                'bio' => 'System Super Administrator with full access to all features and organizations.',
                'location' => 'Jakarta, Indonesia',
                'department' => 'System Administration',
                'job_title' => 'Super Administrator',
                'skills' => ['System Administration', 'Security', 'DevOps', 'Database Management'],
                'languages' => ['indonesia', 'english'],
                'api_access_enabled' => true,
                'api_rate_limit' => 1000,
                'permissions' => $this->generatePermissionsByRole('super_admin'),
                'status' => 'active'
            ],
            [
                'email' => 'systemadmin@chatbot-saas.com',
                'username' => 'systemadmin',
                'password_hash' => Hash::make('SystemAdmin123!'),
                'full_name' => 'System Administrator',
                'first_name' => 'System',
                'last_name' => 'Administrator',
                'phone' => '+6281234567891',
                'avatar_url' => 'https://via.placeholder.com/200x200/EA580C/FFFFFF?text=SA',
                'role' => 'super_admin',
                'is_email_verified' => true,
                'is_phone_verified' => true,
                'two_factor_enabled' => true,
                'login_count' => 0,
                'failed_login_attempts' => 0,
                'password_changed_at' => now(),
                'active_sessions' => [],
                'max_concurrent_sessions' => 3,
                'ui_preferences' => [
                    'theme' => 'light',
                    'language' => 'en',
                    'timezone' => 'Asia/Jakarta',
                    'notifications' => ['email' => true, 'push' => true]
                ],
                'dashboard_config' => [
                    'widgets' => ['system_status', 'user_management', 'analytics'],
                    'layout' => 'list'
                ],
                'notification_preferences' => [
                    'email_notifications' => true,
                    'push_notifications' => true,
                    'sms_notifications' => false
                ],
                'bio' => 'System Administrator responsible for system-wide management and configuration.',
                'location' => 'Jakarta, Indonesia',
                'department' => 'System Administration',
                'job_title' => 'System Administrator',
                'skills' => ['System Administration', 'Network Management', 'Security'],
                'languages' => ['indonesia', 'english'],
                'api_access_enabled' => true,
                'api_rate_limit' => 500,
                'permissions' => $this->generatePermissionsByRole('super_admin'),
                'status' => 'active'
            ],
            [
                'email' => 'support@chatbot-saas.com',
                'username' => 'support',
                'password_hash' => Hash::make('Support123!'),
                'full_name' => 'Support Team',
                'first_name' => 'Support',
                'last_name' => 'Team',
                'phone' => '+6281234567892',
                'avatar_url' => 'https://via.placeholder.com/200x200/059669/FFFFFF?text=ST',
                'role' => 'moderator',
                'is_email_verified' => true,
                'is_phone_verified' => true,
                'two_factor_enabled' => false,
                'login_count' => 0,
                'failed_login_attempts' => 0,
                'password_changed_at' => now(),
                'active_sessions' => [],
                'max_concurrent_sessions' => 2,
                'ui_preferences' => [
                    'theme' => 'light',
                    'language' => 'id',
                    'timezone' => 'Asia/Jakarta',
                    'notifications' => ['email' => true, 'push' => false]
                ],
                'dashboard_config' => [
                    'widgets' => ['support_tickets', 'user_activity'],
                    'layout' => 'simple'
                ],
                'notification_preferences' => [
                    'email_notifications' => true,
                    'push_notifications' => false,
                    'sms_notifications' => false
                ],
                'bio' => 'Customer support team member helping users with technical issues.',
                'location' => 'Jakarta, Indonesia',
                'department' => 'Customer Support',
                'job_title' => 'Support Specialist',
                'skills' => ['Customer Support', 'Technical Troubleshooting', 'Communication'],
                'languages' => ['indonesia', 'english'],
                'api_access_enabled' => false,
                'api_rate_limit' => 100,
                'permissions' => $this->generatePermissionsByRole('moderator'),
                'status' => 'active'
            ]
        ];

        // Create system users (no organization)
        foreach ($systemUsers as $user) {
            $user['organization_id'] = null; // Explicitly set to null for system users
            User::updateOrCreate(
                ['email' => $user['email']], // Search by email
                $user // Update or create with all data
            );
        }

        // Enhanced Organization Administrator for testing
        $enhancedOrgAdmin = [
            'organization_id' => $organizations->first()->id,
            'email' => 'admin@test.com',
            'username' => 'admin',
            'password_hash' => Hash::make('Password123!'),
            'full_name' => 'Organization Administrator',
            'first_name' => 'Organization',
            'last_name' => 'Administrator',
            'phone' => '+6281234567891',
            'avatar_url' => 'https://via.placeholder.com/200x200/2563EB/FFFFFF?text=OA',
            'role' => 'org_admin',
            'is_email_verified' => true,
            'is_phone_verified' => true,
            'two_factor_enabled' => false,
            'login_count' => 14,
            'failed_login_attempts' => 0,
            'password_changed_at' => now(),
            'active_sessions' => [],
            'max_concurrent_sessions' => 5,
            'ui_preferences' => [
                'theme' => 'light',
                'language' => 'id',
                'timezone' => 'Asia/Jakarta',
                'notifications' => ['email' => true, 'push' => true]
            ],
            'dashboard_config' => [
                'widgets' => ['analytics', 'recent_activity', 'organization_status', 'bot_personalities', 'knowledge_base'],
                'layout' => 'grid'
            ],
            'notification_preferences' => [
                'email_notifications' => true,
                'push_notifications' => true,
                'sms_notifications' => false
            ],
            'bio' => 'Enhanced Organization Administrator with full API permissions for testing and development.',
            'location' => 'Jakarta, Indonesia',
            'department' => 'Administration',
            'job_title' => 'Organization Administrator',
            'skills' => ['Management', 'Administration', 'Leadership', 'API Development', 'Testing'],
            'languages' => ['indonesia', 'english'],
            'api_access_enabled' => true,
            'api_rate_limit' => 1000,
            'permissions' => [
                // User Management
                'users.view' => true,
                'users.create' => true,
                'users.update' => true,
                'users.delete' => true,
                'users.restore' => true,
                'users.bulk_update' => true,
                'users.view_all' => true,
                'users.edit_all' => true,

                // Role Management
                'roles.view' => true,
                'roles.create' => true,
                'roles.update' => true,
                'roles.delete' => true,
                'roles.assign' => true,
                'roles.revoke' => true,

                // Permission Management
                'permissions.view' => true,
                'permissions.create' => true,
                'permissions.update' => true,
                'permissions.delete' => true,
                'permissions.manage_groups' => true,
                'permissions.assign' => true,
                'permissions.revoke' => true,
                'permissions.check' => true,
                'permissions.manage' => true,

                // Organization Management
                'organizations.view' => true,
                'organizations.create' => true,
                'organizations.update' => true,
                'organizations.delete' => true,
                'organizations.manage_users' => true,
                'organizations.manage_permissions' => true,
                'organizations.bulk_actions' => true,
                'organizations.import' => true,

                // Bot Management
                'bots.view' => true,
                'bots.create' => true,
                'bots.update' => true,
                'bots.delete' => true,
                'bots.train' => true,
                'bots.chat' => true,
                'bots.manage' => true,

                // Bot Personalities
                'bot_personalities.view' => true,
                'bot_personalities.create' => true,
                'bot_personalities.update' => true,
                'bot_personalities.delete' => true,
                'bot_personalities.manage' => true,
                'bot_personalities.view_all' => true,
                'bot_personalities.edit_all' => true,
                'bot_personalities.assign_whatsapp' => true,
                'bot_personalities.assign_knowledge_base' => true,
                'bot_personalities.assign_n8n_workflow' => true,
                'bot_personalities.set_default' => true,
                'bot_personalities.toggle_status' => true,
                'bot_personalities.export' => true,
                'bot_personalities.view_statistics' => true,

                // Conversation Management
                'conversations.view' => true,
                'conversations.create' => true,
                'conversations.send_message' => true,

                // Analytics
                'analytics.view' => true,
                'analytics.export' => true,
                'analytics.admin' => true,

                // Knowledge Base
                'knowledge_articles.view' => true,
                'knowledge.create' => true,
                'knowledge.update' => true,
                'knowledge.delete' => true,
                'knowledge.publish' => true,
                'knowledge.approve' => true,
                'articles.manage' => true,

                // Subscription Plans
                'subscription_plans.view' => true,
                'subscription_plans.create' => true,
                'subscription_plans.update' => true,
                'subscription_plans.delete' => true,

                // Subscriptions
                'subscriptions.view' => true,
                'subscriptions.update' => true,

                // Payments
                'payments.view' => true,

                // Settings
                'settings.manage' => true,

                // Super Admin
                'superadmin.*' => true,

                // Advanced
                'advanced.*' => true,

                // Reports
                'reports.view' => true,
                'reports.export' => true,

                // Inbox Management
                'inbox.view' => true,
                'inbox.create' => true,
                'inbox.update' => true,
                'inbox.delete' => true,
                'inbox.manage' => true,
                'inbox.export' => true,
                'inbox.templates.create' => true
            ],
            'status' => 'active'
        ];

        // Create enhanced organization admin
        User::updateOrCreate(
            ['email' => $enhancedOrgAdmin['email']],
            $enhancedOrgAdmin
        );

        // Organization-specific users
        foreach ($organizations as $organization) {
            $orgUsers = [
                [
                    'organization_id' => $organization->id,
                    'email' => "admin@{$organization->org_code}.com",
                    'username' => "admin_{$organization->org_code}",
                    'password_hash' => Hash::make('Admin123!'),
                    'full_name' => "{$organization->name} Administrator",
                    'first_name' => $organization->name,
                    'last_name' => 'Administrator',
                    'phone' => $organization->phone,
                    'avatar_url' => "https://via.placeholder.com/200x200/2563EB/FFFFFF?text={$organization->org_code}",
                    'role' => 'org_admin',
                    'is_email_verified' => true,
                    'is_phone_verified' => true,
                    'two_factor_enabled' => true,
                    'login_count' => 0,
                    'failed_login_attempts' => 0,
                    'password_changed_at' => now(),
                    'active_sessions' => [],
                    'max_concurrent_sessions' => 3,
                    'ui_preferences' => [
                        'theme' => 'light',
                        'language' => $organization->locale,
                        'timezone' => $organization->timezone,
                        'notifications' => ['email' => true, 'push' => true]
                    ],
                    'dashboard_config' => [
                        'widgets' => ['analytics', 'recent_activity', 'organization_status'],
                        'layout' => 'grid'
                    ],
                    'notification_preferences' => [
                        'email_notifications' => true,
                        'push_notifications' => true,
                        'sms_notifications' => false
                    ],
                    'bio' => "Organization Administrator for {$organization->name}",
                    'location' => 'Jakarta, Indonesia',
                    'department' => 'Administration',
                    'job_title' => 'Organization Administrator',
                    'skills' => ['Management', 'Administration', 'Leadership'],
                    'languages' => [$organization->locale, 'english'],
                    'api_access_enabled' => $organization->api_enabled,
                    'api_rate_limit' => 200,
                    'permissions' => $this->generatePermissionsByRole('org_admin'),
                    'status' => 'active'
                ],
                [
                    'organization_id' => $organization->id,
                    'email' => "manager@{$organization->org_code}.com",
                    'username' => "manager_{$organization->org_code}",
                    'password_hash' => Hash::make('Manager123!'),
                    'full_name' => "{$organization->name} Manager",
                    'first_name' => $organization->name,
                    'last_name' => 'Manager',
                    'phone' => str_replace('+62', '+62', $organization->phone) . '1',
                    'avatar_url' => "https://via.placeholder.com/200x200/7C3AED/FFFFFF?text={$organization->org_code}M",
                    'role' => 'org_admin',
                    'is_email_verified' => true,
                    'is_phone_verified' => true,
                    'two_factor_enabled' => false,
                    'login_count' => 0,
                    'failed_login_attempts' => 0,
                    'password_changed_at' => now(),
                    'active_sessions' => [],
                    'max_concurrent_sessions' => 2,
                    'ui_preferences' => [
                        'theme' => 'light',
                        'language' => $organization->locale,
                        'timezone' => $organization->timezone,
                        'notifications' => ['email' => true, 'push' => true]
                    ],
                    'dashboard_config' => [
                        'widgets' => ['team_activity', 'analytics', 'reports'],
                        'layout' => 'list'
                    ],
                    'notification_preferences' => [
                        'email_notifications' => true,
                        'push_notifications' => true,
                        'sms_notifications' => false
                    ],
                    'bio' => "Team Manager for {$organization->name}",
                    'location' => 'Jakarta, Indonesia',
                    'department' => 'Management',
                    'job_title' => 'Team Manager',
                    'skills' => ['Team Management', 'Project Management', 'Leadership'],
                    'languages' => [$organization->locale, 'english'],
                    'api_access_enabled' => $organization->api_enabled,
                    'api_rate_limit' => 100,
                    'permissions' => $this->generatePermissionsByRole('org_admin'),
                    'status' => 'active'
                ],
                [
                    'organization_id' => $organization->id,
                    'email' => "agent@{$organization->org_code}.com",
                    'username' => "agent_{$organization->org_code}",
                    'password_hash' => Hash::make('Agent123!'),
                    'full_name' => "{$organization->name} Agent",
                    'first_name' => $organization->name,
                    'last_name' => 'Agent',
                    'phone' => str_replace('+62', '+62', $organization->phone) . '2',
                    'avatar_url' => "https://via.placeholder.com/200x200/059669/FFFFFF?text={$organization->org_code}A",
                    'role' => 'agent',
                    'is_email_verified' => true,
                    'is_phone_verified' => true,
                    'two_factor_enabled' => false,
                    'login_count' => 0,
                    'failed_login_attempts' => 0,
                    'password_changed_at' => now(),
                    'active_sessions' => [],
                    'max_concurrent_sessions' => 2,
                    'ui_preferences' => [
                        'theme' => 'light',
                        'language' => $organization->locale,
                        'timezone' => $organization->timezone,
                        'notifications' => ['email' => true, 'push' => true]
                    ],
                    'dashboard_config' => [
                        'widgets' => ['chat_sessions', 'agent_performance', 'recent_messages'],
                        'layout' => 'simple'
                    ],
                    'notification_preferences' => [
                        'email_notifications' => true,
                        'push_notifications' => true,
                        'sms_notifications' => false
                    ],
                    'bio' => "Chatbot Agent for {$organization->name}",
                    'location' => 'Jakarta, Indonesia',
                    'department' => 'Customer Service',
                    'job_title' => 'Chatbot Agent',
                    'skills' => ['Customer Service', 'Communication', 'Problem Solving'],
                    'languages' => [$organization->locale, 'english'],
                    'api_access_enabled' => false,
                    'api_rate_limit' => 50,
                    'permissions' => $this->generatePermissionsByRole('agent'),
                    'status' => 'active'
                ],
                [
                    'organization_id' => $organization->id,
                    'email' => "creator@{$organization->org_code}.com",
                    'username' => "creator_{$organization->org_code}",
                    'password_hash' => Hash::make('Creator123!'),
                    'full_name' => "{$organization->name} Content Creator",
                    'first_name' => $organization->name,
                    'last_name' => 'Content Creator',
                    'phone' => str_replace('+62', '+62', $organization->phone) . '3',
                    'avatar_url' => "https://via.placeholder.com/200x200/D97706/FFFFFF?text={$organization->org_code}C",
                    'role' => 'agent',
                    'is_email_verified' => true,
                    'is_phone_verified' => true,
                    'two_factor_enabled' => false,
                    'login_count' => 0,
                    'failed_login_attempts' => 0,
                    'password_changed_at' => now(),
                    'active_sessions' => [],
                    'max_concurrent_sessions' => 2,
                    'ui_preferences' => [
                        'theme' => 'light',
                        'language' => $organization->locale,
                        'timezone' => $organization->timezone,
                        'notifications' => ['email' => true, 'push' => false]
                    ],
                    'dashboard_config' => [
                        'widgets' => ['knowledge_articles', 'content_analytics', 'drafts'],
                        'layout' => 'list'
                    ],
                    'notification_preferences' => [
                        'email_notifications' => true,
                        'push_notifications' => false,
                        'sms_notifications' => false
                    ],
                    'bio' => "Content Creator for {$organization->name}",
                    'location' => 'Jakarta, Indonesia',
                    'department' => 'Content',
                    'job_title' => 'Content Creator',
                    'skills' => ['Content Writing', 'SEO', 'Digital Marketing'],
                    'languages' => [$organization->locale, 'english'],
                    'api_access_enabled' => false,
                    'api_rate_limit' => 50,
                    'permissions' => $this->generatePermissionsByRole('agent'),
                    'status' => 'active'
                ],
                [
                    'organization_id' => $organization->id,
                    'email' => "analyst@{$organization->org_code}.com",
                    'username' => "analyst_{$organization->org_code}",
                    'password_hash' => Hash::make('Analyst123!'),
                    'full_name' => "{$organization->name} Analyst",
                    'first_name' => $organization->name,
                    'last_name' => 'Analyst',
                    'phone' => str_replace('+62', '+62', $organization->phone) . '4',
                    'avatar_url' => "https://via.placeholder.com/200x200/0891B2/FFFFFF?text={$organization->org_code}AN",
                    'role' => 'viewer',
                    'is_email_verified' => true,
                    'is_phone_verified' => true,
                    'two_factor_enabled' => false,
                    'login_count' => 0,
                    'failed_login_attempts' => 0,
                    'password_changed_at' => now(),
                    'active_sessions' => [],
                    'max_concurrent_sessions' => 2,
                    'ui_preferences' => [
                        'theme' => 'dark',
                        'language' => $organization->locale,
                        'timezone' => $organization->timezone,
                        'notifications' => ['email' => true, 'push' => false]
                    ],
                    'dashboard_config' => [
                        'widgets' => ['analytics', 'reports', 'data_insights'],
                        'layout' => 'grid'
                    ],
                    'notification_preferences' => [
                        'email_notifications' => true,
                        'push_notifications' => false,
                        'sms_notifications' => false
                    ],
                    'bio' => "Data Analyst for {$organization->name}",
                    'location' => 'Jakarta, Indonesia',
                    'department' => 'Analytics',
                    'job_title' => 'Data Analyst',
                    'skills' => ['Data Analysis', 'Statistics', 'Reporting'],
                    'languages' => [$organization->locale, 'english'],
                    'api_access_enabled' => $organization->api_enabled,
                    'api_rate_limit' => 100,
                    'permissions' => $this->generatePermissionsByRole('viewer'),
                    'status' => 'active'
                ],
                [
                    'organization_id' => $organization->id,
                    'email' => "customer@{$organization->org_code}.com",
                    'username' => "customer_{$organization->org_code}",
                    'password_hash' => Hash::make('Customer123!'),
                    'full_name' => "{$organization->name} Customer",
                    'first_name' => $organization->name,
                    'last_name' => 'Customer',
                    'phone' => str_replace('+62', '+62', $organization->phone) . '5',
                    'avatar_url' => "https://via.placeholder.com/200x200/6B7280/FFFFFF?text={$organization->org_code}CU",
                    'role' => 'customer',
                    'is_email_verified' => true,
                    'is_phone_verified' => true,
                    'two_factor_enabled' => false,
                    'login_count' => 0,
                    'failed_login_attempts' => 0,
                    'password_changed_at' => now(),
                    'active_sessions' => [],
                    'max_concurrent_sessions' => 1,
                    'ui_preferences' => [
                        'theme' => 'light',
                        'language' => $organization->locale,
                        'timezone' => $organization->timezone,
                        'notifications' => ['email' => true, 'push' => true]
                    ],
                    'dashboard_config' => [
                        'widgets' => ['chat_history', 'support_tickets'],
                        'layout' => 'simple'
                    ],
                    'notification_preferences' => [
                        'email_notifications' => true,
                        'push_notifications' => true,
                        'sms_notifications' => false
                    ],
                    'bio' => "Customer of {$organization->name}",
                    'location' => 'Jakarta, Indonesia',
                    'department' => 'Customer',
                    'job_title' => 'Customer',
                    'skills' => [],
                    'languages' => [$organization->locale, 'english'],
                    'api_access_enabled' => false,
                    'api_rate_limit' => 10,
                    'permissions' => $this->generatePermissionsByRole('customer'),
                    'status' => 'active'
                ]
            ];

            foreach ($orgUsers as $user) {
                User::updateOrCreate(
                    ['email' => $user['email']], // Search by email
                    $user // Update or create with all data
                );
            }
        }
    }
}
