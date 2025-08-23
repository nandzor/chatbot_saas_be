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
                'permissions' => [],
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
                'permissions' => [],
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
                'permissions' => [],
                'status' => 'active'
            ]
        ];

        // Create system users (no organization)
        foreach ($systemUsers as $user) {
            $user['organization_id'] = null; // Explicitly set to null for system users
            User::create($user);
        }

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
                    'permissions' => [],
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
                    'permissions' => [],
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
                    'permissions' => [],
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
                    'permissions' => [],
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
                    'permissions' => [],
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
                    'permissions' => [],
                    'status' => 'active'
                ]
            ];

            foreach ($orgUsers as $user) {
                User::create($user);
            }
        }
    }
}
