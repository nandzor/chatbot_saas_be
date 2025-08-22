<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SubscriptionPlan>
 */
class SubscriptionPlanFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $tiers = ['trial', 'starter', 'professional', 'enterprise', 'custom'];
        $tier = $this->faker->randomElement($tiers);
        
        // Base pricing based on tier
        $basePrice = match($tier) {
            'trial' => 0,
            'starter' => $this->faker->numberBetween(50000, 150000),
            'professional' => $this->faker->numberBetween(200000, 500000),
            'enterprise' => $this->faker->numberBetween(800000, 2000000),
            'custom' => $this->faker->numberBetween(1000000, 5000000),
        };
        
        // Calculate other pricing
        $quarterlyDiscount = $tier === 'trial' ? 0 : 0.10; // 10% discount
        $yearlyDiscount = $tier === 'trial' ? 0 : 0.20; // 20% discount
        
        $priceQuarterly = $basePrice * 3 * (1 - $quarterlyDiscount);
        $priceYearly = $basePrice * 12 * (1 - $yearlyDiscount);
        
        // Features based on tier
        $features = match($tier) {
            'trial' => [
                'ai_assistant' => false,
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
            'starter' => [
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
            'professional' => [
                'ai_assistant' => true,
                'sentiment_analysis' => true,
                'auto_translation' => true,
                'advanced_analytics' => true,
                'custom_branding' => false,
                'api_access' => true,
                'priority_support' => false,
                'sso' => false,
                'webhook' => true,
                'custom_integrations' => false
            ],
            'enterprise' => [
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
            'custom' => [
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
        };
        
        // Limits based on tier
        $maxAgents = match($tier) {
            'trial' => 1,
            'starter' => $this->faker->numberBetween(3, 5),
            'professional' => $this->faker->numberBetween(10, 25),
            'enterprise' => $this->faker->numberBetween(50, 200),
            'custom' => -1, // unlimited
        };
        
        $maxChannels = match($tier) {
            'trial' => 1,
            'starter' => $this->faker->numberBetween(2, 3),
            'professional' => $this->faker->numberBetween(5, 10),
            'enterprise' => $this->faker->numberBetween(15, 50),
            'custom' => -1, // unlimited
        };
        
        $maxKnowledgeArticles = match($tier) {
            'trial' => 50,
            'starter' => $this->faker->numberBetween(200, 500),
            'professional' => $this->faker->numberBetween(1000, 5000),
            'enterprise' => $this->faker->numberBetween(10000, 50000),
            'custom' => -1, // unlimited
        };
        
        $maxMonthlyMessages = match($tier) {
            'trial' => 100,
            'starter' => $this->faker->numberBetween(1000, 5000),
            'professional' => $this->faker->numberBetween(10000, 50000),
            'enterprise' => $this->faker->numberBetween(100000, 500000),
            'custom' => -1, // unlimited
        };
        
        $maxMonthlyAiRequests = match($tier) {
            'trial' => 10,
            'starter' => $this->faker->numberBetween(100, 500),
            'professional' => $this->faker->numberBetween(1000, 5000),
            'enterprise' => $this->faker->numberBetween(10000, 50000),
            'custom' => -1, // unlimited
        };
        
        $maxStorageGb = match($tier) {
            'trial' => 1,
            'starter' => $this->faker->numberBetween(5, 20),
            'professional' => $this->faker->numberBetween(50, 200),
            'enterprise' => $this->faker->numberBetween(500, 2000),
            'custom' => -1, // unlimited
        };
        
        $maxApiCallsPerDay = match($tier) {
            'trial' => 1000,
            'starter' => $this->faker->numberBetween(5000, 20000),
            'professional' => $this->faker->numberBetween(50000, 200000),
            'enterprise' => $this->faker->numberBetween(500000, 2000000),
            'custom' => -1, // unlimited
        };
        
        return [
            'name' => $this->faker->unique()->word(),
            'display_name' => $this->faker->unique()->sentence(3),
            'description' => $this->faker->paragraph(),
            'tier' => $tier,
            
            // Pricing
            'price_monthly' => $basePrice,
            'price_quarterly' => round($priceQuarterly),
            'price_yearly' => round($priceYearly),
            'currency' => 'IDR',
            
            // Features & Limits
            'max_agents' => $maxAgents,
            'max_channels' => $maxChannels,
            'max_knowledge_articles' => $maxKnowledgeArticles,
            'max_monthly_messages' => $maxMonthlyMessages,
            'max_monthly_ai_requests' => $maxMonthlyAiRequests,
            'max_storage_gb' => $maxStorageGb,
            'max_api_calls_per_day' => $maxApiCallsPerDay,
            
            // Feature Flags
            'features' => $features,
            
            // Plan Configuration
            'trial_days' => $tier === 'trial' ? $this->faker->numberBetween(7, 30) : 0,
            'is_popular' => $tier === 'professional',
            'is_custom' => $tier === 'custom',
            'sort_order' => array_search($tier, $tiers) + 1,
            
            // System fields
            'status' => 'active',
        ];
    }
    
    /**
     * Indicate that the plan is a trial plan.
     */
    public function trial(): static
    {
        return $this->state(fn (array $attributes) => [
            'tier' => 'trial',
            'price_monthly' => 0,
            'price_quarterly' => 0,
            'price_yearly' => 0,
            'trial_days' => 14,
            'max_agents' => 1,
            'max_channels' => 1,
            'max_knowledge_articles' => 50,
            'max_monthly_messages' => 100,
            'max_monthly_ai_requests' => 10,
            'max_storage_gb' => 1,
            'max_api_calls_per_day' => 1000,
        ]);
    }
    
    /**
     * Indicate that the plan is a starter plan.
     */
    public function starter(): static
    {
        return $this->state(fn (array $attributes) => [
            'tier' => 'starter',
            'price_monthly' => 99000,
            'price_quarterly' => 267300,
            'price_yearly' => 950400,
            'trial_days' => 0,
            'max_agents' => 3,
            'max_channels' => 2,
            'max_knowledge_articles' => 200,
            'max_monthly_messages' => 1000,
            'max_monthly_ai_requests' => 100,
            'max_storage_gb' => 5,
            'max_api_calls_per_day' => 5000,
        ]);
    }
    
    /**
     * Indicate that the plan is a professional plan.
     */
    public function professional(): static
    {
        return $this->state(fn (array $attributes) => [
            'tier' => 'professional',
            'price_monthly' => 299000,
            'price_quarterly' => 807300,
            'price_yearly' => 2870400,
            'trial_days' => 0,
            'max_agents' => 10,
            'max_channels' => 5,
            'max_knowledge_articles' => 1000,
            'max_monthly_messages' => 10000,
            'max_monthly_ai_requests' => 1000,
            'max_storage_gb' => 50,
            'max_api_calls_per_day' => 50000,
        ]);
    }
    
    /**
     * Indicate that the plan is an enterprise plan.
     */
    public function enterprise(): static
    {
        return $this->state(fn (array $attributes) => [
            'tier' => 'enterprise',
            'price_monthly' => 999000,
            'price_quarterly' => 2697300,
            'price_yearly' => 9590400,
            'trial_days' => 0,
            'max_agents' => -1, // unlimited
            'max_channels' => -1, // unlimited
            'max_knowledge_articles' => -1, // unlimited
            'max_monthly_messages' => 100000,
            'max_monthly_ai_requests' => 10000,
            'max_storage_gb' => 500,
            'max_api_calls_per_day' => 500000,
        ]);
    }
    
    /**
     * Indicate that the plan is a custom plan.
     */
    public function custom(): static
    {
        return $this->state(fn (array $attributes) => [
            'tier' => 'custom',
            'price_monthly' => $this->faker->numberBetween(1500000, 5000000),
            'price_quarterly' => $this->faker->numberBetween(4000000, 13000000),
            'price_yearly' => $this->faker->numberBetween(15000000, 50000000),
            'trial_days' => 0,
            'max_agents' => -1, // unlimited
            'max_channels' => -1, // unlimited
            'max_knowledge_articles' => -1, // unlimited
            'max_monthly_messages' => -1, // unlimited
            'max_monthly_ai_requests' => -1, // unlimited
            'max_storage_gb' => -1, // unlimited
            'max_api_calls_per_day' => -1, // unlimited
        ]);
    }
    
    /**
     * Indicate that the plan is popular.
     */
    public function popular(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_popular' => true,
        ]);
    }
    
    /**
     * Indicate that the plan is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'inactive',
        ]);
    }
}
