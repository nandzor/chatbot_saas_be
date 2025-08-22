<?php

namespace Database\Factories;

use App\Models\SubscriptionPlan;
use Illuminate\Database\Eloquent\Factories\Factory;

class SubscriptionPlanFactory extends Factory
{
    protected $model = SubscriptionPlan::class;

    public function definition(): array
    {
        $tier = $this->faker->randomElement(['trial', 'starter', 'professional', 'enterprise']);

        $prices = match ($tier) {
            'trial' => [0, 0, 0],
            'starter' => [99000, 270000, 950000],
            'professional' => [299000, 800000, 2900000],
            'enterprise' => [999000, 2700000, 9900000],
        };

        $features = match ($tier) {
            'trial' => [
                'ai_assistant' => false,
                'sentiment_analysis' => false,
                'auto_translation' => false,
                'advanced_analytics' => false,
                'custom_branding' => false,
                'api_access' => false,
                'priority_support' => false,
                'sso' => false,
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
            ],
        };

        $limits = match ($tier) {
            'trial' => [1, 1, 50, 100, 10, 1, 100],
            'starter' => [3, 2, 200, 1000, 100, 5, 1000],
            'professional' => [10, 5, 1000, 10000, 1000, 50, 10000],
            'enterprise' => [-1, -1, -1, 100000, 10000, 500, 100000],
        };

        return [
            'name' => ucfirst($tier),
            'display_name' => ucfirst($tier) . ' Plan',
            'description' => $this->faker->sentence(10),
            'tier' => $tier,
            'price_monthly' => $prices[0],
            'price_quarterly' => $prices[1],
            'price_yearly' => $prices[2],
            'currency' => 'IDR',
            'max_agents' => $limits[0],
            'max_channels' => $limits[1],
            'max_knowledge_articles' => $limits[2],
            'max_monthly_messages' => $limits[3],
            'max_monthly_ai_requests' => $limits[4],
            'max_storage_gb' => $limits[5],
            'max_api_calls_per_day' => $limits[6],
            'features' => $features,
            'trial_days' => $tier === 'trial' ? 14 : 0,
            'is_popular' => $tier === 'professional',
            'is_custom' => $tier === 'enterprise',
            'sort_order' => match ($tier) {
                'trial' => 1,
                'starter' => 2,
                'professional' => 3,
                'enterprise' => 4,
            },
            'status' => 'active',
        ];
    }

    public function trial(): static
    {
        return $this->state(fn (array $attributes) => [
            'tier' => 'trial',
            'price_monthly' => 0,
            'price_quarterly' => 0,
            'price_yearly' => 0,
            'trial_days' => 14,
        ]);
    }

    public function starter(): static
    {
        return $this->state(fn (array $attributes) => [
            'tier' => 'starter',
            'name' => 'Starter',
            'display_name' => 'Starter Plan',
        ]);
    }

    public function professional(): static
    {
        return $this->state(fn (array $attributes) => [
            'tier' => 'professional',
            'name' => 'Professional',
            'display_name' => 'Professional Plan',
            'is_popular' => true,
        ]);
    }

    public function enterprise(): static
    {
        return $this->state(fn (array $attributes) => [
            'tier' => 'enterprise',
            'name' => 'Enterprise',
            'display_name' => 'Enterprise Plan',
            'is_custom' => true,
        ]);
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'inactive',
        ]);
    }
}
