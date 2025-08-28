<?php

namespace Database\Factories;

use App\Models\SubscriptionPlan;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SubscriptionPlan>
 */
class SubscriptionPlanFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = SubscriptionPlan::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $tiers = ['basic', 'professional', 'enterprise', 'custom'];
        $currencies = ['IDR'];
        $tier = $this->faker->randomElement($tiers);

        return [
            'name' => $this->faker->unique()->slug(2),
            'display_name' => $this->faker->words(2, true),
            'description' => $this->faker->sentence(),
            'tier' => $tier,
            'price_monthly' => $this->faker->randomFloat(2, 10, 500),
            'price_quarterly' => $this->faker->optional()->randomFloat(2, 25, 1200),
            'price_yearly' => $this->faker->optional()->randomFloat(2, 100, 5000),
            'currency' => $this->faker->randomElement($currencies),
            'max_agents' => $this->faker->numberBetween(1, 100),
            'max_channels' => $this->faker->numberBetween(1, 50),
            'max_knowledge_articles' => $this->faker->numberBetween(50, 10000),
            'max_monthly_messages' => $this->faker->numberBetween(100, 100000),
            'max_monthly_ai_requests' => $this->faker->numberBetween(50, 50000),
            'max_storage_gb' => $this->faker->numberBetween(1, 1000),
            'max_api_calls_per_day' => $this->faker->numberBetween(100, 100000),
            'features' => [
                'ai_chat' => $this->faker->boolean(80),
                'knowledge_base' => $this->faker->boolean(80),
                'multi_channel' => $this->faker->boolean(70),
                'api_access' => $this->faker->boolean(60),
                'analytics' => $this->faker->boolean(60),
                'custom_branding' => $this->faker->boolean(40),
                'priority_support' => $this->faker->boolean(30),
                'white_label' => $this->faker->boolean(20),
                'advanced_analytics' => $this->faker->boolean(30),
                'custom_integrations' => $this->faker->boolean(20),
            ],
            'trial_days' => $this->faker->numberBetween(0, 30),
            'is_popular' => $this->faker->boolean(20),
            'is_custom' => $tier === 'custom',
            'sort_order' => $this->faker->numberBetween(1, 100),
            'status' => $this->faker->randomElement(['active', 'inactive', 'draft']),
        ];
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
     * Indicate that the plan is custom.
     */
    public function custom(): static
    {
        return $this->state(fn (array $attributes) => [
            'tier' => 'custom',
            'is_custom' => true,
            'price_monthly' => null,
            'price_quarterly' => null,
            'price_yearly' => null,
            'max_agents' => -1,
            'max_channels' => -1,
            'max_knowledge_articles' => -1,
            'max_monthly_messages' => -1,
            'max_monthly_ai_requests' => -1,
            'max_storage_gb' => -1,
            'max_api_calls_per_day' => -1,
        ]);
    }

    /**
     * Indicate that the plan is basic tier.
     */
    public function basic(): static
    {
        return $this->state(fn (array $attributes) => [
            'tier' => 'basic',
            'price_monthly' => $this->faker->randomFloat(2, 10, 50),
            'max_agents' => $this->faker->numberBetween(1, 5),
            'max_channels' => $this->faker->numberBetween(1, 5),
            'max_knowledge_articles' => $this->faker->numberBetween(50, 500),
            'max_monthly_messages' => $this->faker->numberBetween(100, 5000),
            'max_monthly_ai_requests' => $this->faker->numberBetween(50, 2500),
            'max_storage_gb' => $this->faker->numberBetween(1, 25),
            'max_api_calls_per_day' => $this->faker->numberBetween(100, 5000),
        ]);
    }

    /**
     * Indicate that the plan is professional tier.
     */
    public function professional(): static
    {
        return $this->state(fn (array $attributes) => [
            'tier' => 'professional',
            'price_monthly' => $this->faker->randomFloat(2, 50, 200),
            'max_agents' => $this->faker->numberBetween(5, 25),
            'max_channels' => $this->faker->numberBetween(5, 15),
            'max_knowledge_articles' => $this->faker->numberBetween(500, 5000),
            'max_monthly_messages' => $this->faker->numberBetween(5000, 50000),
            'max_monthly_ai_requests' => $this->faker->numberBetween(2500, 25000),
            'max_storage_gb' => $this->faker->numberBetween(25, 250),
            'max_api_calls_per_day' => $this->faker->numberBetween(5000, 50000),
        ]);
    }

    /**
     * Indicate that the plan is enterprise tier.
     */
    public function enterprise(): static
    {
        return $this->state(fn (array $attributes) => [
            'tier' => 'enterprise',
            'price_monthly' => $this->faker->randomFloat(2, 200, 1000),
            'max_agents' => $this->faker->numberBetween(25, 100),
            'max_channels' => $this->faker->numberBetween(15, 50),
            'max_knowledge_articles' => $this->faker->numberBetween(5000, 10000),
            'max_monthly_messages' => $this->faker->numberBetween(50000, 100000),
            'max_monthly_ai_requests' => $this->faker->numberBetween(25000, 50000),
            'max_storage_gb' => $this->faker->numberBetween(250, 1000),
            'max_api_calls_per_day' => $this->faker->numberBetween(50000, 100000),
        ]);
    }

    /**
     * Indicate that the plan is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'active',
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

    /**
     * Indicate that the plan is draft.
     */
    public function draft(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'draft',
        ]);
    }
}
