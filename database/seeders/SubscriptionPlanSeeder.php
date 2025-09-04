<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\SubscriptionPlan;

class SubscriptionPlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $plans = [
            [
                'name' => 'trial',
                'display_name' => 'Trial Plan',
                'description' => 'Paket trial gratis untuk mencoba fitur',
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
            ],
            [
                'name' => 'starter',
                'display_name' => 'Starter Plan',
                'description' => 'Paket dasar untuk bisnis kecil dan startup',
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
            ],
            [
                'name' => 'professional',
                'display_name' => 'Professional Plan',
                'description' => 'Paket profesional untuk bisnis menengah',
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
            ],
            [
                'name' => 'enterprise',
                'display_name' => 'Enterprise Plan',
                'description' => 'Paket enterprise untuk perusahaan besar',
                'tier' => 'enterprise',
                'price_monthly' => 27000000,
                'price_quarterly' => 108000000,
                'price_yearly' => 432000000,
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
            ],
            [
                'name' => 'custom',
                'display_name' => 'Custom Plan',
                'description' => 'Paket kustom sesuai kebutuhan khusus',
                'tier' => 'custom',
                'price_monthly' => null,
                'price_quarterly' => null,
                'price_yearly' => null,
                'currency' => 'USD',
                'max_agents' => -1, // Unlimited
                'max_channels' => -1, // Unlimited
                'max_knowledge_articles' => -1, // Unlimited
                'max_monthly_messages' => -1, // Unlimited
                'max_monthly_ai_requests' => -1, // Unlimited
                'max_storage_gb' => -1, // Unlimited
                'max_api_calls_per_day' => -1, // Unlimited
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
                'trial_days' => 0,
                'is_popular' => false,
                'is_custom' => true,
                'sort_order' => 4,
                'status' => 'active',
            ],
        ];

        foreach ($plans as $planData) {
            SubscriptionPlan::updateOrCreate(
                ['name' => $planData['name']],
                $planData
            );
        }

        $this->command->info('Subscription plans seeded successfully!');
    }
}
