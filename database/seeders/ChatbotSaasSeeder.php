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

class ChatbotSaasSeeder extends Seeder
{
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

        // Trial Plan
        $plans['trial'] = SubscriptionPlan::factory()->trial()->create([
            'name' => 'Trial',
            'display_name' => 'Free Trial',
            'description' => '14-day free trial with basic features',
        ]);

        // Starter Plan
        $plans['starter'] = SubscriptionPlan::factory()->starter()->create([
            'name' => 'Starter',
            'display_name' => 'Starter Plan',
            'description' => 'Perfect for small businesses getting started',
        ]);

        // Professional Plan (Popular)
        $plans['professional'] = SubscriptionPlan::factory()->professional()->create([
            'name' => 'Professional',
            'display_name' => 'Professional Plan',
            'description' => 'Advanced features for growing businesses',
            'is_popular' => true,
        ]);

        // Enterprise Plan
        $plans['enterprise'] = SubscriptionPlan::factory()->enterprise()->create([
            'name' => 'Enterprise',
            'display_name' => 'Enterprise Plan',
            'description' => 'Full-featured plan for large organizations',
        ]);

        $this->command->info('   ✓ Created ' . count($plans) . ' subscription plans');
        return $plans;
    }

    private function createOrganizations(array $plans): array
    {
        $organizations = [];

        // Demo Organization (Professional Plan)
        $organizations['demo'] = Organization::factory()->active()->create([
            'org_code' => 'DEMO001',
            'name' => 'Demo Corporation',
            'display_name' => 'Demo Corp',
            'email' => 'admin@demo.com',
            'subscription_plan_id' => $plans['professional']->id,
            'subscription_status' => 'active',
        ]);

        // Test Organization (Trial)
        $organizations['test'] = Organization::factory()->withTrial()->create([
            'org_code' => 'TEST001',
            'name' => 'Test Company Ltd',
            'display_name' => 'Test Co.',
            'email' => 'admin@test.com',
            'subscription_plan_id' => $plans['trial']->id,
        ]);

        // Enterprise Organization
        $organizations['enterprise'] = Organization::factory()->enterprise()->create([
            'org_code' => 'ENT001',
            'name' => 'Enterprise Solutions Inc',
            'display_name' => 'Enterprise Solutions',
            'email' => 'admin@enterprise.com',
            'subscription_plan_id' => $plans['enterprise']->id,
            'subscription_status' => 'active',
        ]);

        // Additional random organizations
        $additionalOrgs = Organization::factory(3)->active()->create();
        foreach ($additionalOrgs as $index => $org) {
            $organizations["org_$index"] = $org;
        }

        $this->command->info('   ✓ Created ' . count($organizations) . ' organizations');
        return $organizations;
    }

    private function createUsers(array $organizations): void
    {
        foreach ($organizations as $key => $organization) {
            // Create admin user
            User::factory()->admin()->create([
                'organization_id' => $organization->id,
                'email' => "admin@{$organization->org_code}.com",
                'username' => "admin_{$organization->org_code}",
                'full_name' => 'Admin User',
                'role' => 'org_admin',
            ]);

            // Create agent users (2-5 per organization)
            $agentCount = rand(2, 5);
            $agents = User::factory($agentCount)->agent()->create([
                'organization_id' => $organization->id,
            ]);

            // Create Agent profiles for agent users
            foreach ($agents as $agentUser) {
                Agent::factory()->create([
                    'user_id' => $agentUser->id,
                    'organization_id' => $organization->id,
                    'agent_code' => 'AGT' . str_pad(rand(1, 999), 3, '0', STR_PAD_LEFT),
                ]);
            }

            // Create customer users (5-10 per organization)
            $customerCount = rand(5, 10);
            User::factory($customerCount)->customer()->create([
                'organization_id' => $organization->id,
            ]);

            $this->command->info("   ✓ Created users for {$organization->name}");
        }
    }

    private function createKnowledgeBase(array $organizations): void
    {
        foreach ($organizations as $organization) {
            // Create knowledge base categories
            $categories = [];

            // Main categories
            $categories['general'] = KnowledgeBaseCategory::factory()->featured()->create([
                'organization_id' => $organization->id,
                'name' => 'General FAQ',
                'slug' => 'general-faq',
                'description' => 'Frequently asked questions and general information',
                'icon' => 'help-circle',
            ]);

            $categories['technical'] = KnowledgeBaseCategory::factory()->system()->create([
                'organization_id' => $organization->id,
                'name' => 'Technical Support',
                'slug' => 'technical-support',
                'description' => 'Technical help and troubleshooting guides',
                'icon' => 'settings',
            ]);

            $categories['product'] = KnowledgeBaseCategory::factory()->create([
                'organization_id' => $organization->id,
                'name' => 'Product Information',
                'slug' => 'product-info',
                'description' => 'Product features and specifications',
                'icon' => 'package',
            ]);

            // Create subcategories
            $subCategory = KnowledgeBaseCategory::factory()->withParent($categories['technical'])->create([
                'organization_id' => $organization->id,
                'name' => 'Troubleshooting',
                'slug' => 'troubleshooting',
            ]);

            // Create knowledge base items for each category
            foreach ($categories as $category) {
                // Articles
                KnowledgeBaseItem::factory(3)->article()->published()->create([
                    'organization_id' => $organization->id,
                    'category_id' => $category->id,
                ]);

                // Q&A Collections
                KnowledgeBaseItem::factory(2)->qaCollection()->published()->create([
                    'organization_id' => $organization->id,
                    'category_id' => $category->id,
                ]);

                // FAQs
                KnowledgeBaseItem::factory(2)->faq()->published()->create([
                    'organization_id' => $organization->id,
                    'category_id' => $category->id,
                ]);

                // Some draft items
                KnowledgeBaseItem::factory(1)->draft()->create([
                    'organization_id' => $organization->id,
                    'category_id' => $category->id,
                ]);
            }

            $this->command->info("   ✓ Created knowledge base for {$organization->name}");
        }
    }

    private function createBotConfigurations(array $organizations): void
    {
        foreach ($organizations as $organization) {
            // Create bot personality
            $personality = BotPersonality::factory()->create([
                'organization_id' => $organization->id,
                'name' => 'Default Assistant',
                'code' => 'default',
                'display_name' => 'Customer Assistant',
                'language' => 'indonesia',
                'is_default' => true,
            ]);

            // Create channel configurations
            $channels = ['webchat', 'whatsapp', 'telegram'];

            foreach ($channels as $channel) {
                ChannelConfig::factory()->active()->create([
                    'organization_id' => $organization->id,
                    'channel' => $channel,
                    'channel_identifier' => $channel . '_' . $organization->org_code,
                    'name' => ucfirst($channel) . ' Channel',
                    'personality_id' => $personality->id,
                ]);
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

            // Create VIP customers
            $vipCustomers = Customer::factory(2)->vip()->create([
                'organization_id' => $organization->id,
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
                        ChatSession::factory()->botSession()->create([
                            'organization_id' => $organization->id,
                            'customer_id' => $customer->id,
                            'channel_config_id' => $channelConfig->id,
                        ]);
                    } else {
                        // Agent session
                        $agent = $agents->isNotEmpty() ? $agents->random() : null;
                        ChatSession::factory()->agentSession()->create([
                            'organization_id' => $organization->id,
                            'customer_id' => $customer->id,
                            'channel_config_id' => $channelConfig->id,
                            'agent_id' => $agent?->id,
                        ]);
                    }
                }
            }

            // Create some active sessions
            ChatSession::factory(3)->active()->create([
                'organization_id' => $organization->id,
                'customer_id' => $allCustomers->random()->id,
                'channel_config_id' => $channelConfigs->random()->id,
            ]);

            // Create high satisfaction sessions
            ChatSession::factory(5)->withHighSatisfaction()->resolved()->create([
                'organization_id' => $organization->id,
                'customer_id' => $allCustomers->random()->id,
                'channel_config_id' => $channelConfigs->random()->id,
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
                $permissionGroups[$groupData['code']] = PermissionGroup::factory()->create([
                    'organization_id' => $organization->id,
                    'name' => $groupData['name'],
                    'code' => $groupData['code'],
                    'category' => $groupData['category'],
                ]);
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

            foreach ($permissionData as $permData) {
                $permissions[$permData['code']] = Permission::factory()->create([
                    'organization_id' => $organization->id,
                    'name' => $permData['name'],
                    'code' => $permData['code'],
                    'resource' => $permData['resource'],
                    'action' => $permData['action'],
                ]);
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

            foreach ($rolesData as $roleData) {
                $roles[$roleData['code']] = Role::factory()->create([
                    'organization_id' => $organization->id,
                    'name' => $roleData['name'],
                    'code' => $roleData['code'],
                    'level' => $roleData['level'],
                ]);
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

            foreach ($rolePermissions as $roleCode => $permissionCodes) {
                foreach ($permissionCodes as $permissionCode) {
                    if (isset($roles[$roleCode]) && isset($permissions[$permissionCode])) {
                        $roles[$roleCode]->permissions()->attach($permissions[$permissionCode]->id, [
                            'is_granted' => true,
                            'granted_at' => now(),
                        ]);
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
                    UserRole::factory()->create([
                        'user_id' => $user->id,
                        'role_id' => $roles[$roleCode]->id,
                        'is_primary' => true,
                    ]);
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
                Webhook::factory()->forChatEvents()->create([
                    'organization_id' => $organization->id,
                ]),
                Webhook::factory()->forPaymentEvents()->create([
                    'organization_id' => $organization->id,
                ]),
                Webhook::factory()->forUserEvents()->create([
                    'organization_id' => $organization->id,
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

                        $webhook->deliveries()->create([
                            'event_type' => fake()->randomElement($webhook->events),
                            'payload' => [
                                'event_id' => fake()->uuid(),
                                'timestamp' => now()->toISOString(),
                                'data' => ['test' => 'data'],
                            ],
                            'http_status' => $isSuccess ? 200 : rand(400, 500),
                            'is_success' => $isSuccess,
                            'delivered_at' => fake()->dateTimeBetween('-30 days', 'now'),
                            'response_time_ms' => rand(100, 2000),
                            'attempt_number' => $isSuccess ? 1 : rand(1, 3),
                        ]);
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
                $workflows[] = N8nWorkflow::factory()->create([
                    'organization_id' => $organization->id,
                    'created_by' => User::where('organization_id', $organization->id)->first()?->id,
                ]);
            }

            // Create some scheduled workflows
            N8nWorkflow::factory()->scheduled()->create([
                'organization_id' => $organization->id,
                'name' => 'Daily Report Generation',
                'created_by' => User::where('organization_id', $organization->id)->first()?->id,
            ]);

            // Create some webhook workflows
            N8nWorkflow::factory()->webhook()->create([
                'organization_id' => $organization->id,
                'name' => 'Incoming Message Processor',
                'created_by' => User::where('organization_id', $organization->id)->first()?->id,
            ]);

            // Create executions for some workflows
            foreach ($workflows as $workflow) {
                if (rand(1, 10) <= 7) { // 70% of workflows have executions
                    $executionCount = rand(5, 50);
                    for ($j = 0; $j < $executionCount; $j++) {
                        $isSuccessful = rand(1, 10) <= 8; // 80% success rate

                        $workflow->executions()->create([
                            'organization_id' => $organization->id,
                            'execution_id' => 'exec_' . fake()->uuid(),
                            'status' => $isSuccessful ? 'success' : 'failed',
                            'mode' => fake()->randomElement(['trigger', 'manual', 'retry']),
                            'started_at' => $startedAt = fake()->dateTimeBetween('-30 days', 'now'),
                            'finished_at' => $finishedAt = fake()->dateTimeBetween($startedAt, 'now'),
                            'duration_ms' => $startedAt->diffInMilliseconds($finishedAt),
                            'input_data' => ['test' => 'input'],
                            'output_data' => $isSuccessful ? ['test' => 'output'] : null,
                            'error_message' => $isSuccessful ? null : fake()->sentence(),
                        ]);
                    }
                }
            }

            $this->command->info("   ✓ Created {$workflowCount} N8N workflows for {$organization->name}");
        }
    }

    private function createSystemMonitoring(array $organizations): void
    {
        foreach ($organizations as $organization) {
            // Create Real-time Metrics
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

                        RealtimeMetric::factory()->create([
                            'organization_id' => $organization->id,
                            'metric_name' => $metricName,
                            'metric_type' => fake()->randomElement(['counter', 'gauge', 'histogram']),
                            'value' => $this->generateMetricValue($metricName),
                            'timestamp' => $metricTimestamp,
                            'labels' => [
                                'environment' => 'production',
                                'instance' => 'web-01',
                            ],
                        ]);
                    }
                }
            }

            // Create System Logs
            $logCount = rand(100, 500);
            for ($i = 0; $i < $logCount; $i++) {
                SystemLog::factory()->create([
                    'organization_id' => $organization->id,
                    'user_id' => fake()->optional(30)->randomElement(
                        User::where('organization_id', $organization->id)->pluck('id')->toArray()
                    ),
                ]);
            }

            // Create some error logs
            for ($i = 0; $i < 20; $i++) {
                SystemLog::factory()->error()->create([
                    'organization_id' => $organization->id,
                ]);
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
