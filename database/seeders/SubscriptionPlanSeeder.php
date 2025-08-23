<?php

namespace Database\Seeders;

use App\Models\SubscriptionPlan;
use Illuminate\Database\Seeder;

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
                'description' => 'Free trial plan for new users to explore the platform',
                'tier' => 'trial',
                'price_monthly' => 0,
                'price_quarterly' => 0,
                'price_yearly' => 0,
                'currency' => 'IDR',
                'max_agents' => 1,
                'max_channels' => 1,
                'max_knowledge_articles' => 50,
                'max_monthly_messages' => 500,
                'max_monthly_ai_requests' => 50,
                'max_storage_gb' => 0.5,
                'max_api_calls_per_day' => 100,
                'features' => [
                    'ai_assistant' => true,
                    'sentiment_analysis' => false,
                    'auto_translation' => false,
                    'advanced_analytics' => false,
                    'custom_branding' => false,
                    'api_access' => false,
                    'priority_support' => false,
                    'sso' => false,
                    'webhook' => false,
                    'custom_integrations' => false
                ],
                'trial_days' => 14,
                'is_popular' => false,
                'is_custom' => false,
                'sort_order' => 1,
                'status' => 'active'
            ],
            [
                'name' => 'starter',
                'display_name' => 'Starter Plan',
                'description' => 'Perfect for small businesses and startups',
                'tier' => 'starter',
                'price_monthly' => 299000,
                'price_quarterly' => 799000,
                'price_yearly' => 2999000,
                'currency' => 'IDR',
                'max_agents' => 3,
                'max_channels' => 3,
                'max_knowledge_articles' => 200,
                'max_monthly_messages' => 2000,
                'max_monthly_ai_requests' => 200,
                'max_storage_gb' => 2,
                'max_api_calls_per_day' => 2000,
                'features' => [
                    'ai_assistant' => true,
                    'sentiment_analysis' => true,
                    'auto_translation' => false,
                    'advanced_analytics' => false,
                    'custom_branding' => false,
                    'api_access' => true,
                    'priority_support' => false,
                    'sso' => false,
                    'webhook' => true,
                    'custom_integrations' => false
                ],
                'trial_days' => 0,
                'is_popular' => true,
                'is_custom' => false,
                'sort_order' => 2,
                'status' => 'active'
            ],
            [
                'name' => 'professional',
                'display_name' => 'Professional Plan',
                'description' => 'Ideal for growing businesses with advanced needs',
                'tier' => 'professional',
                'price_monthly' => 799000,
                'price_quarterly' => 2199000,
                'price_yearly' => 7999000,
                'currency' => 'IDR',
                'max_agents' => 10,
                'max_channels' => 10,
                'max_knowledge_articles' => 1000,
                'max_monthly_messages' => 10000,
                'max_monthly_ai_requests' => 1000,
                'max_storage_gb' => 10,
                'max_api_calls_per_day' => 10000,
                'features' => [
                    'ai_assistant' => true,
                    'sentiment_analysis' => true,
                    'auto_translation' => true,
                    'advanced_analytics' => true,
                    'custom_branding' => true,
                    'api_access' => true,
                    'priority_support' => true,
                    'sso' => false,
                    'webhook' => true,
                    'custom_integrations' => true
                ],
                'trial_days' => 0,
                'is_popular' => false,
                'is_custom' => false,
                'sort_order' => 3,
                'status' => 'active'
            ],
            [
                'name' => 'enterprise',
                'display_name' => 'Enterprise Plan',
                'description' => 'For large organizations with unlimited scalability',
                'tier' => 'enterprise',
                'price_monthly' => 1999000,
                'price_quarterly' => 5499000,
                'price_yearly' => 19999000,
                'currency' => 'IDR',
                'max_agents' => -1, // Unlimited
                'max_channels' => -1, // Unlimited
                'max_knowledge_articles' => -1, // Unlimited
                'max_monthly_messages' => -1, // Unlimited
                'max_monthly_ai_requests' => -1, // Unlimited
                'max_storage_gb' => 100,
                'max_api_calls_per_day' => 100000,
                'features' => [
                    'ai_assistant' => true,
                    'sentiment_analysis' => true,
                    'auto_translation' => true,
                    'advanced_analytics' => true,
                    'custom_branding' => true,
                    'api_access' => true,
                    'priority_support' => true,
                    'sso' => true,
                    'webhook' => true,
                    'custom_integrations' => true
                ],
                'trial_days' => 0,
                'is_popular' => false,
                'is_custom' => false,
                'sort_order' => 4,
                'status' => 'active'
            ]
        ];

        foreach ($plans as $plan) {
            SubscriptionPlan::updateOrCreate(
                ['name' => $plan['name']], // Search by name
                $plan // Update or create with all data
            );
        }
    }
}
