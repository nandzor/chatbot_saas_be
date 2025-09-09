<?php

namespace Database\Seeders;

use App\Models\Agent;
use App\Models\BotPersonality;
use App\Models\ChannelConfig;
use App\Models\ChatSession;
use App\Models\Customer;
use App\Models\KnowledgeBaseCategory;
use App\Models\KnowledgeBaseItem;
use App\Models\N8nWorkflow;
use App\Models\Organization;
use App\Models\Permission;
use App\Models\PermissionGroup;
use App\Models\RealtimeMetric;
use App\Models\Role;
use App\Models\SubscriptionPlan;
use App\Models\SystemLog;
use App\Models\User;
use App\Models\UserRole;
use App\Models\Webhook;
use Illuminate\Database\Seeder;
use Faker\Generator as Faker;
use Illuminate\Support\Facades\Hash;

class ChatbotSaasSeeder extends Seeder
{
    protected $faker;

    public function __construct()
    {
        $this->faker = \Faker\Factory::create('id_ID');
    }

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('🚀 Starting ChatBot SAAS Database Seeding...');

        // 1. Create Subscription Plans
        $this->command->info('📋 Creating subscription plans...');
        $plans = $this->createSubscriptionPlans();

        // 2. Create Organizations
        $this->command->info('🏢 Creating organizations...');
        $organizations = $this->createOrganizations($plans);

        // 3. Create Users for each organization
        $this->command->info('👥 Creating users...');
        $this->createUsers($organizations);

        // 4. Create Knowledge Base
        $this->command->info('📚 Creating knowledge base...');
        $this->createKnowledgeBase($organizations);

        // 5. Create Bot Configurations
        $this->command->info('🤖 Creating bot configurations...');
        $this->createBotConfigurations($organizations);

        // 6. Create RBAC System
        $this->command->info('🔐 Creating RBAC system (roles, permissions, assignments)...');
        $this->createRBACSystem($organizations);

        // 7. Create Webhooks & Integration
        $this->command->info('🔗 Creating webhooks and integrations...');
        $this->createWebhooksAndIntegration($organizations);

        // 8. Create N8N Workflows
        $this->command->info('⚡ Creating N8N workflows and executions...');
        $this->createN8nWorkflows($organizations);

        // 9. Create System Monitoring
        $this->command->info('📊 Creating system monitoring (metrics, logs)...');
        $this->createSystemMonitoring($organizations);

        // 10. Create Customers and Chat Sessions
        $this->command->info('💬 Creating customers and chat sessions...');
        $this->createCustomersAndChats($organizations);

        $this->command->info('✅ ChatBot SAAS Database Seeding Completed!');
    }

    private function createSubscriptionPlans(): array
    {
        $plans = [];

        // Ensure baseline plans exist without relying on factory state methods
        $plans['trial'] = SubscriptionPlan::firstOrCreate(
            ['name' => 'trial'],
            [
                'display_name' => 'Free Trial',
                'description' => '14-day free trial with basic features',
                'tier' => 'trial',
                'price_monthly' => 0,
                'price_quarterly' => 0,
                'price_yearly' => 0,
                'currency' => 'IDR',
                'max_agents' => 1,
                'max_channels' => 1,
                'max_knowledge_articles' => 10,
                'max_monthly_messages' => 100,
                'max_monthly_ai_requests' => 50,
                'max_storage_gb' => 1,
                'max_api_calls_per_day' => 100,
                'features' => [
                    'ai_chat' => true,
                    'knowledge_base' => true,
                    'multi_channel' => false,
                    'api_access' => false,
                    'analytics' => false,
                    'custom_branding' => false,
                    'priority_support' => false,
                    'white_label' => false,
                    'advanced_analytics' => false,
                    'custom_integrations' => false,
                ],
                'trial_days' => 14,
                'is_popular' => true,
                'is_custom' => false,
                'sort_order' => 0,
                'status' => 'active',
            ]
        );

        $plans['starter'] = SubscriptionPlan::firstOrCreate(
            ['name' => 'starter'],
            [
                'display_name' => 'Starter Plan',
                'description' => 'Perfect for small businesses getting started',
                'tier' => 'starter',
                'price_monthly' => 1000000,
                'price_quarterly' => 4000000,
                'price_yearly' => 12000000,
                'currency' => 'IDR',
                'max_agents' => 2,
                'max_channels' => 3,
                'max_knowledge_articles' => 100,
                'max_monthly_messages' => 1000,
                'max_monthly_ai_requests' => 500,
                'max_storage_gb' => 5,
                'max_api_calls_per_day' => 1000,
                'features' => [
                    'ai_chat' => true,
                    'knowledge_base' => true,
                    'multi_channel' => true,
                    'api_access' => false,
                    'analytics' => false,
                    'custom_branding' => false,
                    'priority_support' => false,
                    'white_label' => false,
                    'advanced_analytics' => false,
                    'custom_integrations' => false,
                ],
                'trial_days' => 14,
                'is_popular' => true,
                'is_custom' => false,
                'sort_order' => 1,
                'status' => 'active',
            ]
        );

        $plans['professional'] = SubscriptionPlan::firstOrCreate(
            ['name' => 'professional'],
            [
                'display_name' => 'Professional Plan',
                'description' => 'Advanced features for growing businesses',
                'tier' => 'professional',
                'price_monthly' => 2000000,
                'price_quarterly' => 8000000,
                'price_yearly' => 24000000,
                'currency' => 'IDR',
                'max_agents' => 10,
                'max_channels' => 10,
                'max_knowledge_articles' => 1000,
                'max_monthly_messages' => 10000,
                'max_monthly_ai_requests' => 5000,
                'max_storage_gb' => 50,
                'max_api_calls_per_day' => 10000,
                'features' => [
                    'ai_chat' => true,
                    'knowledge_base' => true,
                    'multi_channel' => true,
                    'api_access' => true,
                    'analytics' => true,
                    'custom_branding' => true,
                    'priority_support' => false,
                    'white_label' => false,
                    'advanced_analytics' => false,
                    'custom_integrations' => false,
                ],
                'trial_days' => 30,
                'is_popular' => true,
                'is_custom' => false,
                'sort_order' => 2,
                'status' => 'active',
            ]
        );

        $plans['enterprise'] = SubscriptionPlan::firstOrCreate(
            ['name' => 'enterprise'],
            [
                'display_name' => 'Enterprise Plan',
                'description' => 'Full-featured plan for large organizations',
                'tier' => 'enterprise',
                'price_monthly' => 2700000,
                'price_quarterly' => 10800000,
                'price_yearly' => 43200000,
                'currency' => 'IDR',
                'max_agents' => 100,
                'max_channels' => 50,
                'max_knowledge_articles' => 10000,
                'max_monthly_messages' => 100000,
                'max_monthly_ai_requests' => 50000,
                'max_storage_gb' => 500,
                'max_api_calls_per_day' => 100000,
                'features' => [
                    'ai_chat' => true,
                    'knowledge_base' => true,
                    'multi_channel' => true,
                    'api_access' => true,
                    'analytics' => true,
                    'custom_branding' => true,
                    'priority_support' => true,
                    'white_label' => true,
                    'advanced_analytics' => true,
                    'custom_integrations' => true,
                ],
                'trial_days' => 30,
                'is_popular' => false,
                'is_custom' => false,
                'sort_order' => 3,
                'status' => 'active',
            ]
        );

        $this->command->info('   ✓ Ensured subscription plans are present');
        return $plans;
    }

    private function createOrganizations(array $plans): array
    {
        $organizations = [];

        // Demo Organization (Professional Plan) - idempotent
        $organizations['demo'] = Organization::updateOrCreate(
            ['org_code' => 'DEMO001'],
            [
                'name' => 'Demo Corporation',
                'display_name' => 'Demo Corp',
                'email' => 'admin@demo.com',
                'subscription_plan_id' => $plans['professional']->id,
                'subscription_status' => 'active',
                'billing_cycle' => 'monthly',
                'status' => 'active',
            ]
        );

        // Test Organization (Trial) - idempotent
        $organizations['test'] = Organization::updateOrCreate(
            ['org_code' => 'TEST001'],
            [
                'name' => 'Test Company Ltd',
                'display_name' => 'Test Co.',
                'email' => 'admin@test.com',
                'subscription_plan_id' => $plans['trial']->id,
                'subscription_status' => 'trial',
                'trial_ends_at' => now()->addDays(14),
                'billing_cycle' => 'monthly',
                'status' => 'active',
            ]
        );

        // Enterprise Organization (active) - idempotent
        $organizations['enterprise'] = Organization::updateOrCreate(
            ['org_code' => 'ENT001'],
            [
                'name' => 'Enterprise Solutions Inc',
                'display_name' => 'Enterprise Solutions',
                'email' => 'admin@enterprise.com',
                'subscription_plan_id' => $plans['enterprise']->id,
                'subscription_status' => 'active',
                'billing_cycle' => 'yearly',
                'status' => 'active',
            ]
        );

        // Additional random organizations
        $additionalOrgs = Organization::factory(3)->create();
        foreach ($additionalOrgs as $index => $org) {
            $organizations["org_$index"] = $org;
        }

        $this->command->info('   ✓ Created ' . count($organizations) . ' organizations');
        return $organizations;
    }

    private function createUsers(array $organizations): void
    {
        foreach ($organizations as $key => $organization) {
            // Create or update admin user (idempotent)
            User::updateOrCreate(
                [
                    'organization_id' => $organization->id,
                    'email' => "admin@{$organization->org_code}.com",
                ],
                [
                    'username' => "admin_{$organization->org_code}",
                    'full_name' => 'Admin User',
                    'password_hash' => Hash::make('Admin123!'),
                    'role' => 'org_admin',
                    'is_email_verified' => true,
                    'status' => 'active',
                ]
            );

            // Create agent users (2-5 per organization) - idempotent by username
            $agentCount = rand(2, 5);
            $agents = collect();
            for ($i = 0; $i < $agentCount; $i++) {
                $email = "agent{$i}@{$organization->org_code}.com";
                $username = "agent_{$organization->org_code}_{$i}";
                $user = User::updateOrCreate(
                    [
                        'organization_id' => $organization->id,
                        'email' => $email,
                    ],
                    [
                        'username' => $username,
                        'full_name' => 'Agent User',
                        'password_hash' => Hash::make('Agent123!'),
                        'role' => 'agent',
                        'is_email_verified' => true,
                        'status' => 'active',
                    ]
                );
                $agents->push($user);
            }

            // Create Agent profiles for agent users (no factory dependency)
            foreach ($agents as $agentUser) {
                Agent::updateOrCreate(
                    [
                        'user_id' => $agentUser->id,
                        'organization_id' => $organization->id,
                    ],
                    [
                        'agent_code' => 'AGT' . str_pad(rand(1, 999), 3, '0', STR_PAD_LEFT),
                        'display_name' => $agentUser->full_name ?? $agentUser->username,
                        'availability_status' => 'online',
                        'max_concurrent_chats' => 3,
                        'current_active_chats' => 0,
                        'status' => 'active',
                    ]
                );
            }

            // Create customer users (5-10 per organization) - idempotent by username
            $customerCount = rand(5, 10);
            for ($i = 0; $i < $customerCount; $i++) {
                $email = "customer{$i}@{$organization->org_code}.com";
                $username = "customer_{$organization->org_code}_{$i}";
                User::updateOrCreate(
                    [
                        'organization_id' => $organization->id,
                        'email' => $email,
                    ],
                    [
                        'username' => $username,
                        'full_name' => 'Customer User',
                        'password_hash' => Hash::make('Customer123!'),
                        'role' => 'customer',
                        'is_email_verified' => true,
                        'status' => 'active',
                    ]
                );
            }

            $this->command->info("   ✓ Created users for {$organization->name}");
        }
    }

    private function createKnowledgeBase(array $organizations): void
    {
        foreach ($organizations as $organization) {
            // Create knowledge base categories
            $categories = [];

            // Main categories (idempotent by organization_id + slug)
            $categories['general'] = KnowledgeBaseCategory::updateOrCreate(
                [
                    'organization_id' => $organization->id,
                    'slug' => 'general-faq',
                ],
                [
                    'name' => 'General FAQ',
                    'description' => 'Frequently asked questions and general information',
                    'icon' => 'help-circle',
                    'is_featured' => true,
                    'is_public' => true,
                    'supports_articles' => true,
                    'supports_qa' => true,
                    'supports_faq' => true,
                    'status' => 'active',
                ]
            );

            $categories['technical'] = KnowledgeBaseCategory::updateOrCreate(
                [
                    'organization_id' => $organization->id,
                    'slug' => 'technical-support',
                ],
                [
                    'name' => 'Technical Support',
                    'description' => 'Technical help and troubleshooting guides',
                    'icon' => 'settings',
                    'is_system_category' => true,
                    'is_public' => true,
                    'supports_articles' => true,
                    'supports_qa' => true,
                    'supports_faq' => true,
                    'status' => 'active',
                ]
            );

            $categories['product'] = KnowledgeBaseCategory::updateOrCreate(
                [
                    'organization_id' => $organization->id,
                    'slug' => 'product-info',
                ],
                [
                    'name' => 'Product Information',
                    'description' => 'Product features and specifications',
                    'icon' => 'package',
                    'is_public' => true,
                    'supports_articles' => true,
                    'supports_qa' => true,
                    'supports_faq' => true,
                    'status' => 'active',
                ]
            );

            // Create subcategories without factory state helper
            $subCategory = KnowledgeBaseCategory::updateOrCreate(
                [
                    'organization_id' => $organization->id,
                    'slug' => 'troubleshooting',
                ],
                [
                    'parent_id' => $categories['technical']->id,
                    'name' => 'Troubleshooting',
                    'description' => 'Troubleshooting guides and resolutions',
                    'supports_articles' => true,
                    'supports_qa' => true,
                    'supports_faq' => true,
                    'is_public' => true,
                    'status' => 'active',
                ]
            );

            // Create knowledge base items for each category
            foreach ($categories as $category) {
                $authorId = User::where('organization_id', $organization->id)->value('id');

                // Articles (3)
                for ($i = 0; $i < 3; $i++) {
                    $title = $this->faker->sentence(6, true);
                    $content = '<h2>Introduction</h2><p>' . $this->faker->paragraphs(3, true) . '</p>';
                    KnowledgeBaseItem::updateOrCreate(
                        [
                            'organization_id' => $organization->id,
                            'category_id' => $category->id,
                            'title' => $title,
                        ],
                        [
                            'author_id' => $authorId,
                            'slug' => \Illuminate\Support\Str::slug($title) . '-' . \Illuminate\Support\Str::random(6),
                            'excerpt' => \Illuminate\Support\Str::limit(strip_tags($content), 160),
                            'content' => $content,
                            'content_type' => 'article',
                            'status' => 'published',
                            'is_public' => true,
                            'language' => 'indonesia',
                        ]
                    );
                }

                // Q&A Collections (2)
                for ($i = 0; $i < 2; $i++) {
                    $title = 'Q&A: ' . $this->faker->sentence(5, true);
                    $content = '<p>' . $this->faker->paragraphs(2, true) . '</p>';
                    KnowledgeBaseItem::updateOrCreate(
                        [
                            'organization_id' => $organization->id,
                            'category_id' => $category->id,
                            'title' => $title,
                        ],
                        [
                            'author_id' => $authorId,
                            'slug' => \Illuminate\Support\Str::slug($title) . '-' . \Illuminate\Support\Str::random(6),
                            'excerpt' => \Illuminate\Support\Str::limit(strip_tags($content), 160),
                            'content' => $content,
                            'content_type' => 'qa_collection',
                            'status' => 'published',
                            'is_public' => true,
                            'language' => 'indonesia',
                        ]
                    );
                }

                // FAQs (2)
                for ($i = 0; $i < 2; $i++) {
                    $title = 'FAQ: ' . $this->faker->sentence(5, true);
                    $content = '<p>' . $this->faker->paragraphs(1, true) . '</p>';
                    KnowledgeBaseItem::updateOrCreate(
                        [
                            'organization_id' => $organization->id,
                            'category_id' => $category->id,
                            'title' => $title,
                        ],
                        [
                            'author_id' => $authorId,
                            'slug' => \Illuminate\Support\Str::slug($title) . '-' . \Illuminate\Support\Str::random(6),
                            'excerpt' => \Illuminate\Support\Str::limit(strip_tags($content), 160),
                            'content' => $content,
                            'content_type' => 'faq',
                            'status' => 'published',
                            'is_public' => true,
                            'language' => 'indonesia',
                        ]
                    );
                }

                // Draft item (1)
                $title = 'Draft: ' . $this->faker->sentence(6, true);
                $content = '<p>' . $this->faker->paragraphs(2, true) . '</p>';
                KnowledgeBaseItem::updateOrCreate(
                    [
                        'organization_id' => $organization->id,
                        'category_id' => $category->id,
                        'title' => $title,
                    ],
                    [
                        'author_id' => $authorId,
                        'slug' => \Illuminate\Support\Str::slug($title) . '-' . \Illuminate\Support\Str::random(6),
                        'excerpt' => \Illuminate\Support\Str::limit(strip_tags($content), 160),
                        'content' => $content,
                        'content_type' => 'article',
                        'status' => 'draft',
                        'is_public' => false,
                        'language' => 'indonesia',
                    ]
                );
            }

            $this->command->info("   ✓ Created knowledge base for {$organization->name}");
        }
    }

    private function createBotConfigurations(array $organizations): void
    {
        foreach ($organizations as $organization) {
            // Create bot personality (idempotent by organization_id + code)
            $personality = BotPersonality::updateOrCreate(
                [
                    'organization_id' => $organization->id,
                    'code' => 'default',
                ],
                [
                    'name' => 'Default Assistant',
                    'display_name' => 'Customer Assistant',
                    'language' => 'indonesia',
                    'is_default' => true,
                ]
            );

            // Create channel configurations
            $channels = ['webchat', 'whatsapp', 'telegram'];

            foreach ($channels as $channel) {
                ChannelConfig::updateOrCreate(
                    [
                        'organization_id' => $organization->id,
                        'channel' => $channel,
                        'channel_identifier' => $channel . '_' . $organization->org_code,
                    ],
                    [
                        'name' => ucfirst($channel) . ' Channel',
                        'personality_id' => $personality->id,
                        'status' => 'active',
                    ]
                );
            }

            $this->command->info("   ✓ Created bot configurations for {$organization->name}");
        }
    }

    private function createCustomersAndChats(array $organizations): void
    {
        foreach ($organizations as $organization) {
            $channelConfigs = ChannelConfig::where('organization_id', $organization->id)->get();
            $agents = Agent::where('organization_id', $organization->id)->get();

            // Create customers (10-20 per organization)
            $customerCount = rand(10, 20);
            $customers = Customer::factory($customerCount)->create([
                'organization_id' => $organization->id,
            ]);

            // Create VIP customers (using segments to mark as VIP)
            $vipCustomers = Customer::factory(2)->create([
                'organization_id' => $organization->id,
                'segments' => ['vip', 'high_value', 'premium'],
            ]);

            $allCustomers = $customers->concat($vipCustomers);

            // Create chat sessions for customers
            foreach ($allCustomers as $customer) {
                $sessionCount = rand(1, 5);

                for ($i = 0; $i < $sessionCount; $i++) {
                    $channelConfig = $channelConfigs->random();

                    // 70% bot sessions, 30% agent sessions
                    if (rand(1, 10) <= 7) {
                        // Bot session
                        ChatSession::factory()->create([
                            'organization_id' => $organization->id,
                            'customer_id' => $customer->id,
                            'channel_config_id' => $channelConfig->id,
                            'session_type' => 'bot',
                        ]);
                    } else {
                        // Agent session
                        $agent = $agents->isNotEmpty() ? $agents->random() : null;
                        ChatSession::factory()->create([
                            'organization_id' => $organization->id,
                            'customer_id' => $customer->id,
                            'channel_config_id' => $channelConfig->id,
                            'agent_id' => $agent?->id,
                            'session_type' => 'agent',
                        ]);
                    }
                }
            }

            // Create some active sessions
            ChatSession::factory(3)->create([
                'organization_id' => $organization->id,
                'customer_id' => $allCustomers->random()->id,
                'channel_config_id' => $channelConfigs->random()->id,
                'is_active' => true,
            ]);

            // Create high satisfaction sessions
            ChatSession::factory(5)->create([
                'organization_id' => $organization->id,
                'customer_id' => $allCustomers->random()->id,
                'channel_config_id' => $channelConfigs->random()->id,
                'is_resolved' => true,
            ]);

            $totalSessions = ChatSession::where('organization_id', $organization->id)->count();
            $this->command->info("   ✓ Created {$allCustomers->count()} customers and {$totalSessions} chat sessions for {$organization->name}");
        }
    }

    private function createRBACSystem(array $organizations): void
    {
        foreach ($organizations as $organization) {
            // Create Permission Groups
            $permissionGroups = [];
            $groupsData = [
                ['name' => 'User Management', 'code' => 'user_mgmt', 'category' => 'administration'],
                ['name' => 'Content Management', 'code' => 'content_mgmt', 'category' => 'content'],
                ['name' => 'Customer Service', 'code' => 'customer_service', 'category' => 'operations'],
                ['name' => 'Analytics & Reports', 'code' => 'analytics', 'category' => 'insights'],
                ['name' => 'System Administration', 'code' => 'system_admin', 'category' => 'administration'],
            ];

            foreach ($groupsData as $groupData) {
                $permissionGroups[$groupData['code']] = PermissionGroup::updateOrCreate(
                    [
                        'organization_id' => $organization->id,
                        'code' => $groupData['code'],
                    ],
                    [
                        'name' => $groupData['name'],
                        'category' => $groupData['category'],
                    ]
                );
            }

            // Create Permissions
            $permissions = [];
            $permissionData = [
                ['name' => 'Create Users', 'code' => 'users.create', 'resource' => 'users', 'action' => 'create'],
                ['name' => 'View All Users', 'code' => 'users.view_all', 'resource' => 'users', 'action' => 'view_all'],
                ['name' => 'Edit All Users', 'code' => 'users.edit_all', 'resource' => 'users', 'action' => 'edit_all'],
                ['name' => 'Delete Users', 'code' => 'users.delete', 'resource' => 'users', 'action' => 'delete'],
                ['name' => 'Manage Knowledge Articles', 'code' => 'articles.manage', 'resource' => 'knowledge_articles', 'action' => 'manage'],
                ['name' => 'Publish Articles', 'code' => 'articles.publish', 'resource' => 'knowledge_articles', 'action' => 'publish'],
                ['name' => 'Handle Chats', 'code' => 'chats.handle', 'resource' => 'chat_sessions', 'action' => 'update'],
                ['name' => 'View Analytics', 'code' => 'analytics.view', 'resource' => 'analytics', 'action' => 'read'],
                ['name' => 'Manage API Keys', 'code' => 'api_keys.manage', 'resource' => 'api_keys', 'action' => 'manage'],
                ['name' => 'View System Logs', 'code' => 'logs.view', 'resource' => 'system_logs', 'action' => 'read'],
            ];

            // Permission creation
            foreach ($permissionData as $permData) {
                $permissions[$permData['code']] = Permission::updateOrCreate(
                    [
                        'organization_id' => $organization->id,
                        'code' => $permData['code'],
                    ],
                    [
                        'name' => $permData['name'],
                        'resource' => $permData['resource'],
                        'action' => $permData['action'],
                    ]
                );
            }

            // Create Roles
            $roles = [];
            $rolesData = [
                ['name' => 'Super Administrator', 'code' => 'super_admin', 'level' => 1],
                ['name' => 'Organization Administrator', 'code' => 'org_admin', 'level' => 2],
                ['name' => 'Agent Manager', 'code' => 'agent_manager', 'level' => 3],
                ['name' => 'Customer Agent', 'code' => 'customer_agent', 'level' => 4],
                ['name' => 'Content Manager', 'code' => 'content_manager', 'level' => 4],
                ['name' => 'Analyst', 'code' => 'analyst', 'level' => 5],
                ['name' => 'Viewer', 'code' => 'viewer', 'level' => 6],
            ];

            // Role creation
            foreach ($rolesData as $roleData) {
                $roles[$roleData['code']] = Role::updateOrCreate(
                    [
                        'organization_id' => $organization->id,
                        'code' => $roleData['code'],
                    ],
                    [
                        'name' => $roleData['name'],
                        'level' => $roleData['level'],
                    ]
                );
            }

            // Assign permissions to roles (simplified)
            $rolePermissions = [
                'super_admin' => array_keys($permissions),
                'org_admin' => ['users.create', 'users.view_all', 'users.edit_all', 'articles.manage', 'analytics.view'],
                'agent_manager' => ['users.view_all', 'chats.handle', 'analytics.view'],
                'customer_agent' => ['chats.handle'],
                'content_manager' => ['articles.manage', 'articles.publish'],
                'analyst' => ['analytics.view'],
                'viewer' => ['analytics.view'],
            ];

            // Assign permissions to roles
            foreach ($rolePermissions as $roleCode => $permissionCodes) {
                foreach ($permissionCodes as $permissionCode) {
                    if (isset($roles[$roleCode]) && isset($permissions[$permissionCode])) {
                        \App\Models\RolePermission::updateOrCreate(
                            [
                                'role_id' => $roles[$roleCode]->id,
                                'permission_id' => $permissions[$permissionCode]->id,
                            ],
                            [
                                'is_granted' => true,
                                'granted_at' => now(),
                            ]
                        );
                    }
                }
            }

            // Assign roles to users
            $users = User::where('organization_id', $organization->id)->get();
            foreach ($users as $user) {
                // Assign primary role based on user role
                $roleCode = match ($user->role) {
                    'org_admin' => 'org_admin',
                    'agent' => 'customer_agent',
                    'customer' => 'viewer',
                    default => 'viewer',
                };

                if (isset($roles[$roleCode])) {
                    UserRole::updateOrCreate(
                        [
                            'user_id' => $user->id,
                            'role_id' => $roles[$roleCode]->id,
                        ],
                        [
                            'is_primary' => true,
                        ]
                    );
                }
            }

            $this->command->info("   ✓ Created RBAC system for {$organization->name}");
        }
    }

    private function createWebhooksAndIntegration(array $organizations): void
    {
        foreach ($organizations as $organization) {
            // Create webhooks (2-5 per organization)
            $webhookCount = rand(2, 5);

            $webhooks = [
                Webhook::factory()->create([
                    'organization_id' => $organization->id,
                    'events' => ['chat.created','chat.updated'],
                ]),
                Webhook::factory()->create([
                    'organization_id' => $organization->id,
                    'events' => ['payment.succeeded','payment.failed'],
                ]),
                Webhook::factory()->create([
                    'organization_id' => $organization->id,
                    'events' => ['user.created','user.updated'],
                ]),
            ];

            // Add random webhooks
            for ($i = 3; $i < $webhookCount; $i++) {
                $webhooks[] = Webhook::factory()->create([
                    'organization_id' => $organization->id,
                ]);
            }

            // Create webhook deliveries for active webhooks
            foreach ($webhooks as $webhook) {
                if ($webhook->isActive()) {
                    // Create 5-15 deliveries
                    $deliveryCount = rand(5, 15);
                    for ($j = 0; $j < $deliveryCount; $j++) {
                        $isSuccess = rand(1, 10) <= 8; // 80% success rate
                        $eventType = $this->faker->randomElement($webhook->events);
                        $createdAt = $this->faker->dateTimeBetween('-30 days', 'now');
                        \App\Models\WebhookDelivery::updateOrCreate(
                            [
                                'webhook_id' => $webhook->id,
                                'event_type' => $eventType,
                                'created_at' => $createdAt,
                            ],
                            [
                                'payload' => [
                                    'event_id' => $this->faker->uuid(),
                                    'timestamp' => now()->toISOString(),
                                    'data' => ['test' => 'data'],
                                ],
                                'http_status' => $isSuccess ? 200 : rand(400, 500),
                                'is_success' => $isSuccess,
                                'delivered_at' => $createdAt,
                                'response_time_ms' => rand(100, 2000),
                                'attempt_number' => $isSuccess ? 1 : rand(1, 3),
                            ]
                        );
                    }
                }
            }

            $this->command->info("   ✓ Created {$webhookCount} webhooks for {$organization->name}");
        }
    }

    private function createN8nWorkflows(array $organizations): void
    {
        foreach ($organizations as $organization) {
            // Create workflows (3-8 per organization)
            $workflowCount = rand(3, 8);
            $workflows = [];

            for ($i = 0; $i < $workflowCount; $i++) {
                $workflowId = \Illuminate\Support\Str::uuid()->toString();
                $workflowUuid = \Illuminate\Support\Str::uuid()->toString();
                $workflowName = 'Workflow ' . ($i + 1) . ' - ' . \Illuminate\Support\Str::random(6);
                $workflows[] = N8nWorkflow::updateOrCreate(
                    [
                        'organization_id' => $organization->id,
                        'name' => $workflowName,
                    ],
                    [
                        'id' => $workflowId,
                        'workflow_id' => $workflowUuid,
                        'created_by' => User::where('organization_id', $organization->id)->first()?->id,
                        'workflow_data' => ['nodes' => [], 'connections' => []],
                        // ...other fields as needed...
                    ]
                );
            }

            // Create some scheduled workflows
            $scheduledWorkflowId = \Illuminate\Support\Str::uuid()->toString();
            $scheduledWorkflowUuid = \Illuminate\Support\Str::uuid()->toString();
            N8nWorkflow::updateOrCreate(
                [
                    'organization_id' => $organization->id,
                    'name' => 'Daily Report Generation - ' . \Illuminate\Support\Str::random(6),
                ],
                [
                    'id' => $scheduledWorkflowId,
                    'workflow_id' => $scheduledWorkflowUuid,
                    'created_by' => User::where('organization_id', $organization->id)->first()?->id,
                    'workflow_data' => ['nodes' => [], 'connections' => []],
                    // ...other fields as needed...
                ]
            );

            // Create some webhook workflows
            $webhookWorkflowId = \Illuminate\Support\Str::uuid()->toString();
            $webhookWorkflowUuid = \Illuminate\Support\Str::uuid()->toString();
            N8nWorkflow::updateOrCreate(
                [
                    'organization_id' => $organization->id,
                    'name' => 'Incoming Message Processor - ' . \Illuminate\Support\Str::random(6),
                ],
                [
                    'id' => $webhookWorkflowId,
                    'workflow_id' => $webhookWorkflowUuid,
                    'created_by' => User::where('organization_id', $organization->id)->first()?->id,
                    'workflow_data' => ['nodes' => [], 'connections' => []],
                    // ...other fields as needed...
                ]
            );

            // Create executions for some workflows
            foreach ($workflows as $workflow) {
                if (rand(1, 10) <= 7) { // 70% of workflows have executions
                    $executionCount = rand(5, 50);
                    for ($j = 0; $j < $executionCount; $j++) {
                        $isSuccessful = rand(1, 10) <= 8; // 80% success rate
                        $executionId = \Illuminate\Support\Str::uuid()->toString();
                        $workflow->executions()->updateOrCreate(
                            [
                                'id' => $executionId,
                                'organization_id' => $organization->id,
                                'execution_id' => 'exec_' . $this->faker->uuid(),
                            ],
                            [
                                'status' => $isSuccessful ? 'success' : 'failed',
                                'mode' => $this->faker->randomElement(['trigger', 'manual', 'retry']),
                                'started_at' => $startedAt = $this->faker->dateTimeBetween('-30 days', 'now'),
                                'finished_at' => $finishedAt = $this->faker->dateTimeBetween($startedAt, 'now'),
                                    // Cap duration_ms to 24 hours max (86400000 ms) to avoid integer overflow
                                    'duration_ms' => min(abs($finishedAt->getTimestamp() - $startedAt->getTimestamp()) * 1000, 86400000),
                                'input_data' => ['test' => 'input'],
                                'output_data' => $isSuccessful ? ['test' => 'output'] : ['test' => 'error'],
                                'error_message' => $isSuccessful ? null : $this->faker->sentence(),
                            ]
                        );
                    }
                }
            }

            $this->command->info("   ✓ Created {$workflowCount} N8N workflows for {$organization->name}");
        }
    }

    private function createSystemMonitoring(array $organizations): void
    {
        foreach ($organizations as $organization) {
            // Create Realtime Metrics
            $metricNames = [
                'active_sessions', 'message_count', 'response_time', 'memory_usage',
                'cpu_usage', 'disk_usage', 'api_requests', 'webhook_deliveries',
                'error_rate', 'user_satisfaction'
            ];

            foreach ($metricNames as $metricName) {
                // Create metrics for last 7 days
                for ($day = 7; $day >= 0; $day--) {
                    $timestamp = now()->subDays($day);

                    // Create hourly metrics
                    for ($hour = 0; $hour < 24; $hour++) {
                        $metricTimestamp = $timestamp->copy()->addHours($hour);
                        RealtimeMetric::updateOrCreate(
                            [
                                'organization_id' => $organization->id,
                                'metric_name' => $metricName,
                                'timestamp' => $metricTimestamp,
                            ],
                            [
                                'metric_type' => $this->faker->randomElement(['counter', 'gauge', 'histogram']),
                                'value' => $this->generateMetricValue($metricName),
                                'labels' => [
                                    'environment' => 'production',
                                    'instance' => 'web-01',
                                ],
                            ]
                        );
                    }
                }
            }

            // Create System Logs
            $logCount = rand(100, 500);
            for ($i = 0; $i < $logCount; $i++) {
                SystemLog::updateOrCreate(
                    [
                        'id' => \Illuminate\Support\Str::uuid()->toString(),
                        'organization_id' => $organization->id,
                        'user_id' => $this->faker->optional(0.3)->randomElement(
                            User::where('organization_id', $organization->id)->pluck('id')->toArray()
                        ),
                        'timestamp' => now(),
                    ],
                    [
                        'level' => $this->faker->randomElement(['info', 'debug', 'warn', 'error', 'fatal']),
                        'message' => $this->faker->sentence(),
                        'created_at' => now(),
                    ]
                );
            }

            // Create some error logs
            for ($i = 0; $i < 20; $i++) {
                SystemLog::updateOrCreate(
                    [
                        'id' => \Illuminate\Support\Str::uuid()->toString(),
                        'organization_id' => $organization->id,
                        'timestamp' => now(),
                    ],
                    [
                        'level' => 'error',
                        'message' => $this->faker->sentence(),
                        'created_at' => now(),
                    ]
                );
            }

            $this->command->info("   ✓ Created system monitoring data for {$organization->name}");
        }
    }

    private function generateMetricValue(string $metricName): float
    {
        return match ($metricName) {
            'active_sessions' => rand(10, 100),
            'message_count' => rand(0, 1000),
            'response_time' => rand(50, 2000) / 1000, // Convert to seconds
            'memory_usage' => rand(30, 90), // Percentage
            'cpu_usage' => rand(10, 80), // Percentage
            'disk_usage' => rand(20, 70), // Percentage
            'api_requests' => rand(100, 5000),
            'webhook_deliveries' => rand(0, 100),
            'error_rate' => rand(0, 10) / 100, // Percentage as decimal
            'user_satisfaction' => rand(70, 95) / 100, // Rating as decimal
            default => rand(1, 100),
        };
    }
}
