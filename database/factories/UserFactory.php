<?php

namespace Database\Factories;

use App\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $firstName = $this->faker->firstName();
        $lastName = $this->faker->lastName();
        $fullName = $firstName . ' ' . $lastName;
        $username = strtolower($firstName . '.' . $lastName . $this->faker->numberBetween(1, 999));
        
        $roles = ['super_admin', 'org_admin', 'agent', 'customer', 'viewer', 'moderator', 'developer'];
        $role = $this->faker->randomElement($roles);
        
        $departments = [
            'IT & Development', 'Customer Service', 'Sales & Marketing', 'Human Resources',
            'Finance & Accounting', 'Operations', 'Product Management', 'Quality Assurance',
            'Research & Development', 'Legal & Compliance', 'Facilities', 'Training'
        ];
        
        $jobTitles = [
            'IT & Development' => ['Software Engineer', 'DevOps Engineer', 'QA Engineer', 'System Administrator', 'Data Scientist'],
            'Customer Service' => ['Customer Support Specialist', 'Team Lead', 'Manager', 'Supervisor'],
            'Sales & Marketing' => ['Sales Representative', 'Marketing Specialist', 'Business Development', 'Account Manager'],
            'Human Resources' => ['HR Specialist', 'Recruiter', 'HR Manager', 'Training Coordinator'],
            'Finance & Accounting' => ['Accountant', 'Financial Analyst', 'Controller', 'Auditor'],
            'Operations' => ['Operations Manager', 'Process Analyst', 'Project Manager', 'Coordinator'],
            'Product Management' => ['Product Manager', 'Product Owner', 'Business Analyst', 'Product Specialist'],
            'Quality Assurance' => ['QA Engineer', 'Test Lead', 'Quality Manager', 'Test Analyst'],
            'Research & Development' => ['Research Scientist', 'R&D Engineer', 'Innovation Manager', 'Technical Lead'],
            'Legal & Compliance' => ['Legal Counsel', 'Compliance Officer', 'Risk Manager', 'Legal Assistant'],
            'Facilities' => ['Facilities Manager', 'Maintenance Technician', 'Security Officer', 'Administrative Assistant'],
            'Training' => ['Training Manager', 'Instructional Designer', 'Trainer', 'Learning Specialist']
        ];
        
        $skills = [
            'Programming' => ['PHP', 'Laravel', 'JavaScript', 'Vue.js', 'React', 'Python', 'Java', 'C#', 'Go', 'Rust'],
            'Databases' => ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch', 'SQL Server', 'Oracle'],
            'Cloud & DevOps' => ['AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'GitLab CI', 'Terraform'],
            'AI & ML' => ['TensorFlow', 'PyTorch', 'OpenAI API', 'LangChain', 'Hugging Face', 'Scikit-learn'],
            'Communication' => ['Customer Service', 'Technical Writing', 'Presentation', 'Negotiation', 'Conflict Resolution'],
            'Management' => ['Project Management', 'Team Leadership', 'Strategic Planning', 'Risk Management', 'Change Management'],
            'Analytics' => ['Data Analysis', 'Business Intelligence', 'Statistical Analysis', 'Performance Metrics', 'Reporting'],
            'Design' => ['UI/UX Design', 'Graphic Design', 'Web Design', 'Prototyping', 'User Research']
        ];
        
        $languages = [
            'indonesia', 'english', 'javanese', 'sundanese', 'balinese', 'minang',
            'chinese', 'japanese', 'korean', 'spanish', 'french', 'german', 'arabic', 'thai', 'vietnamese'
        ];
        
        $department = $this->faker->randomElement($departments);
        $jobTitle = $this->faker->randomElement($jobTitles[$department] ?? ['Staff', 'Specialist', 'Coordinator']);
        
        // Generate skills based on department and role
        $userSkills = $this->generateUserSkills($department, $role, $skills);
        
        // Generate UI preferences based on role
        $uiPreferences = $this->generateUIPreferences($role);
        
        // Generate dashboard config based on role
        $dashboardConfig = $this->generateDashboardConfig($role);
        
        // Generate notification preferences
        $notificationPreferences = [
            'email' => [
                'marketing' => $this->faker->boolean(70),
                'security' => true,
                'updates' => $this->faker->boolean(80),
                'reports' => $this->faker->boolean(60),
                'daily_summary' => $this->faker->boolean(50)
            ],
            'push' => [
                'chat_notifications' => $this->faker->boolean(90),
                'system_alerts' => $this->faker->boolean(80),
                'reminders' => $this->faker->boolean(70),
                'achievements' => $this->faker->boolean(60)
            ],
            'sms' => [
                'security_alerts' => $this->faker->boolean(40),
                'important_updates' => $this->faker->boolean(30)
            ]
        ];
        
        // Generate permissions based on role
        $permissions = $this->generateUserPermissions($role);
        
        // Generate active sessions
        $activeSessions = $this->faker->optional(0.3)->randomElements([
            [
                'session_id' => Str::uuid(),
                'device' => 'Chrome on Windows',
                'ip' => $this->faker->ipv4(),
                'last_activity' => now()->subMinutes($this->faker->numberBetween(1, 60))
            ],
            [
                'session_id' => Str::uuid(),
                'device' => 'Safari on iPhone',
                'ip' => $this->faker->ipv4(),
                'last_activity' => now()->subMinutes($this->faker->numberBetween(1, 120))
            ]
        ], $this->faker->numberBetween(1, 2));
        
        return [
            'organization_id' => Organization::factory(),
            'email' => $this->faker->unique()->safeEmail(),
            'username' => $username,
            'password_hash' => Hash::make('password123'),
            'full_name' => $fullName,
            'first_name' => $firstName,
            'last_name' => $lastName,
            'phone' => $this->faker->phoneNumber(),
            'avatar_url' => $this->faker->optional(0.7)->imageUrl(200, 200, 'people'),
            'role' => $role,
            
            // Authentication & Security
            'is_email_verified' => $this->faker->boolean(80),
            'is_phone_verified' => $this->faker->boolean(60),
            'two_factor_enabled' => $this->faker->boolean(30),
            'two_factor_secret' => $this->faker->optional(0.3)->sha256(),
            'backup_codes' => $this->faker->optional(0.3)->randomElements([
                '12345678', '87654321', '11223344', '44332211', '55667788', '88776655'
            ], 6),
            'last_login_at' => $this->faker->optional(0.8)->dateTimeBetween('-30 days', 'now'),
            'last_login_ip' => $this->faker->optional(0.8)->ipv4(),
            'login_count' => $this->faker->numberBetween(0, 1000),
            'failed_login_attempts' => $this->faker->numberBetween(0, 5),
            'locked_until' => $this->faker->optional(0.1)->dateTimeBetween('now', '+1 hour'),
            'password_changed_at' => $this->faker->dateTimeBetween('-1 year', 'now'),
            
            // Session Management
            'active_sessions' => $activeSessions,
            'max_concurrent_sessions' => $this->faker->randomElement([1, 2, 3, 5]),
            
            // UI/UX Preferences
            'ui_preferences' => $uiPreferences,
            'dashboard_config' => $dashboardConfig,
            'notification_preferences' => $notificationPreferences,
            
            // Profile & Activity
            'bio' => $this->faker->optional(0.6)->paragraph(),
            'location' => $this->faker->optional(0.7)->city() . ', ' . $this->faker->optional(0.7)->state(),
            'department' => $department,
            'job_title' => $jobTitle,
            'skills' => $userSkills,
            'languages' => $this->faker->randomElements($languages, $this->faker->numberBetween(1, 3)),
            
            // API Access
            'api_access_enabled' => in_array($role, ['super_admin', 'org_admin', 'developer']) ? $this->faker->boolean(80) : false,
            'api_rate_limit' => $this->faker->randomElement([100, 500, 1000, 5000, 10000]),
            
            // System fields
            'permissions' => $permissions,
            'status' => 'active',
        ];
    }
    
    /**
     * Generate user skills based on department and role
     */
    private function generateUserSkills(string $department, string $role, array $availableSkills): array
    {
        $userSkills = [];
        
        // Add department-specific skills
        if (isset($availableSkills[$department])) {
            $userSkills = array_merge($userSkills, $this->faker->randomElements($availableSkills[$department], 
                $this->faker->numberBetween(2, 5)));
        }
        
        // Add role-specific skills
        switch ($role) {
            case 'super_admin':
            case 'org_admin':
                $userSkills = array_merge($userSkills, $this->faker->randomElements($availableSkills['Management'], 3));
                $userSkills = array_merge($userSkills, $this->faker->randomElements($availableSkills['Analytics'], 2));
                break;
            case 'agent':
                $userSkills = array_merge($userSkills, $this->faker->randomElements($availableSkills['Communication'], 3));
                break;
            case 'developer':
                $userSkills = array_merge($userSkills, $this->faker->randomElements($availableSkills['Programming'], 4));
                $userSkills = array_merge($userSkills, $this->faker->randomElements($availableSkills['Databases'], 2));
                break;
            case 'moderator':
                $userSkills = array_merge($userSkills, $this->faker->randomElements($availableSkills['Communication'], 2));
                $userSkills = array_merge($userSkills, $this->faker->randomElements($availableSkills['Management'], 2));
                break;
        }
        
        return array_unique($userSkills);
    }
    
    /**
     * Generate UI preferences based on role
     */
    private function generateUIPreferences(string $role): array
    {
        $basePreferences = [
            'theme' => $this->faker->randomElement(['light', 'dark', 'auto']),
            'language' => $this->faker->randomElement(['id', 'en']),
            'timezone' => 'Asia/Jakarta',
            'notifications' => [
                'email' => true,
                'push' => true,
                'sms' => $this->faker->boolean(30)
            ]
        ];
        
        switch ($role) {
            case 'super_admin':
            case 'org_admin':
                $basePreferences['dashboard_layout'] = 'grid';
                $basePreferences['sidebar_collapsed'] = false;
                $basePreferences['show_advanced_features'] = true;
                break;
            case 'agent':
                $basePreferences['dashboard_layout'] = 'list';
                $basePreferences['show_chat_widget'] = true;
                $basePreferences['auto_refresh_chats'] = true;
                break;
            case 'developer':
                $basePreferences['dashboard_layout'] = 'compact';
                $basePreferences['show_technical_details'] = true;
                $basePreferences['debug_mode'] = $this->faker->boolean(70);
                break;
            default:
                $basePreferences['dashboard_layout'] = 'grid';
                $basePreferences['show_help_tooltips'] = true;
        }
        
        return $basePreferences;
    }
    
    /**
     * Generate dashboard config based on role
     */
    private function generateDashboardConfig(string $role): array
    {
        $baseConfig = [
            'widgets' => [],
            'layout' => 'default',
            'refresh_interval' => 300 // 5 minutes
        ];
        
        switch ($role) {
            case 'super_admin':
            case 'org_admin':
                $baseConfig['widgets'] = [
                    'organization_overview',
                    'revenue_metrics',
                    'user_activity',
                    'system_health',
                    'recent_activities',
                    'quick_actions'
                ];
                $baseConfig['layout'] = 'admin';
                $baseConfig['refresh_interval'] = 60; // 1 minute
                break;
            case 'agent':
                $baseConfig['widgets'] = [
                    'my_chats',
                    'chat_queue',
                    'performance_metrics',
                    'knowledge_base',
                    'quick_responses',
                    'team_status'
                ];
                $baseConfig['layout'] = 'agent';
                $baseConfig['refresh_interval'] = 30; // 30 seconds
                break;
            case 'developer':
                $baseConfig['widgets'] = [
                    'system_metrics',
                    'error_logs',
                    'api_usage',
                    'deployment_status',
                    'performance_monitoring',
                    'development_tools'
                ];
                $baseConfig['layout'] = 'developer';
                $baseConfig['refresh_interval'] = 120; // 2 minutes
                break;
            default:
                $baseConfig['widgets'] = [
                    'welcome_message',
                    'quick_start_guide',
                    'recent_activities',
                    'help_resources'
                ];
                $baseConfig['layout'] = 'user';
        }
        
        return $baseConfig;
    }
    
    /**
     * Generate user permissions based on role
     */
    private function generateUserPermissions(string $role): array
    {
        $permissions = [];
        
        switch ($role) {
            case 'super_admin':
                $permissions = [
                    'all_permissions' => true,
                    'system_administration' => true,
                    'user_management' => true,
                    'billing_management' => true,
                    'audit_logs' => true
                ];
                break;
            case 'org_admin':
                $permissions = [
                    'organization_management' => true,
                    'user_management' => true,
                    'content_management' => true,
                    'analytics_view' => true,
                    'billing_view' => true
                ];
                break;
            case 'agent':
                $permissions = [
                    'chat_management' => true,
                    'customer_view' => true,
                    'knowledge_base_view' => true,
                    'own_analytics' => true
                ];
                break;
            case 'developer':
                $permissions = [
                    'api_access' => true,
                    'system_logs' => true,
                    'technical_features' => true,
                    'development_tools' => true
                ];
                break;
            case 'moderator':
                $permissions = [
                    'content_moderation' => true,
                    'user_moderation' => true,
                    'chat_monitoring' => true,
                    'reports_view' => true
                ];
                break;
            default:
                $permissions = [
                    'basic_access' => true,
                    'own_profile' => true
                ];
        }
        
        return $permissions;
    }
    
    /**
     * Indicate that the user is a super admin.
     */
    public function superAdmin(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'super_admin',
            'is_email_verified' => true,
            'is_phone_verified' => true,
            'two_factor_enabled' => true,
            'api_access_enabled' => true,
            'api_rate_limit' => 10000,
        ]);
    }
    
    /**
     * Indicate that the user is an organization admin.
     */
    public function orgAdmin(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'org_admin',
            'is_email_verified' => true,
            'is_phone_verified' => true,
            'two_factor_enabled' => $this->faker->boolean(70),
            'api_access_enabled' => true,
            'api_rate_limit' => 5000,
        ]);
    }
    
    /**
     * Indicate that the user is an agent.
     */
    public function agent(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'agent',
            'is_email_verified' => true,
            'is_phone_verified' => $this->faker->boolean(80),
            'two_factor_enabled' => $this->faker->boolean(40),
            'api_access_enabled' => false,
            'api_rate_limit' => 100,
        ]);
    }
    
    /**
     * Indicate that the user is a customer.
     */
    public function customer(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'customer',
            'is_email_verified' => $this->faker->boolean(60),
            'is_phone_verified' => $this->faker->boolean(40),
            'two_factor_enabled' => false,
            'api_access_enabled' => false,
            'api_rate_limit' => 50,
            'department' => null,
            'job_title' => null,
            'skills' => [],
        ]);
    }
    
    /**
     * Indicate that the user is a developer.
     */
    public function developer(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'developer',
            'is_email_verified' => true,
            'is_phone_verified' => true,
            'two_factor_enabled' => $this->faker->boolean(80),
            'api_access_enabled' => true,
            'api_rate_limit' => 10000,
            'department' => 'IT & Development',
            'job_title' => $this->faker->randomElement(['Software Engineer', 'DevOps Engineer', 'QA Engineer', 'System Administrator']),
        ]);
    }
    
    /**
     * Indicate that the user is verified.
     */
    public function verified(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_email_verified' => true,
            'is_phone_verified' => true,
        ]);
    }
    
    /**
     * Indicate that the user has two-factor authentication enabled.
     */
    public function withTwoFactor(): static
    {
        return $this->state(fn (array $attributes) => [
            'two_factor_enabled' => true,
            'two_factor_secret' => $this->faker->sha256(),
            'backup_codes' => $this->faker->randomElements([
                '12345678', '87654321', '11223344', '44332211', '55667788', '88776655'
            ], 6),
        ]);
    }
    
    /**
     * Indicate that the user is suspended.
     */
    public function suspended(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'suspended',
            'locked_until' => now()->addDays($this->faker->numberBetween(1, 30)),
        ]);
    }
    
    /**
     * Indicate that the user is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'inactive',
            'last_login_at' => $this->faker->dateTimeBetween('-6 months', '-1 month'),
        ]);
    }
    
    /**
     * Indicate that the user has API access.
     */
    public function withApiAccess(): static
    {
        return $this->state(fn (array $attributes) => [
            'api_access_enabled' => true,
            'api_rate_limit' => $this->faker->randomElement([1000, 5000, 10000]),
        ]);
    }
}
