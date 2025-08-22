<?php

namespace Database\Factories;

use App\Models\Organization;
use App\Models\SubscriptionPlan;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrganizationFactory extends Factory
{
    protected $model = Organization::class;

    public function definition(): array
    {
        $name = $this->faker->company();
        $orgCode = 'ORG' . strtoupper($this->faker->unique()->lexify('???'));

        return [
            'org_code' => $orgCode,
            'name' => $name,
            'display_name' => $name,
            'email' => $this->faker->companyEmail(),
            'phone' => $this->faker->phoneNumber(),
            'address' => $this->faker->address(),
            'logo_url' => $this->faker->imageUrl(200, 200, 'business'),
            'favicon_url' => $this->faker->imageUrl(32, 32, 'business'),
            'website' => $this->faker->url(),
            'tax_id' => $this->faker->numerify('##.###.###.#-###.###'),
            'business_type' => $this->faker->randomElement(['PT', 'CV', 'UD', 'Koperasi', 'Yayasan']),
            'industry' => $this->faker->randomElement([
                'Technology', 'E-commerce', 'Education', 'Healthcare',
                'Finance', 'Manufacturing', 'Retail', 'Consulting'
            ]),
            'company_size' => $this->faker->randomElement(['1-10', '11-50', '51-200', '201-500', '500+']),
            'timezone' => 'Asia/Jakarta',
            'locale' => 'id',
            'currency' => 'IDR',
            'subscription_plan_id' => SubscriptionPlan::factory(),
            'subscription_status' => $this->faker->randomElement(['trial', 'active', 'inactive', 'suspended']),
            'trial_ends_at' => $this->faker->optional()->dateTimeBetween('now', '+30 days'),
            'subscription_starts_at' => $this->faker->optional()->dateTimeBetween('-30 days', 'now'),
            'subscription_ends_at' => $this->faker->optional()->dateTimeBetween('now', '+365 days'),
            'billing_cycle' => $this->faker->randomElement(['monthly', 'quarterly', 'yearly']),
            'current_usage' => [
                'messages' => $this->faker->numberBetween(0, 5000),
                'ai_requests' => $this->faker->numberBetween(0, 500),
                'api_calls' => $this->faker->numberBetween(0, 1000),
                'storage_mb' => $this->faker->numberBetween(10, 500),
                'active_agents' => $this->faker->numberBetween(1, 5),
                'active_channels' => $this->faker->numberBetween(1, 3),
            ],
            'theme_config' => [
                'primaryColor' => $this->faker->hexColor(),
                'secondaryColor' => $this->faker->hexColor(),
                'darkMode' => $this->faker->boolean(),
            ],
            'branding_config' => [
                'company_logo' => $this->faker->optional()->imageUrl(),
                'custom_domain' => $this->faker->optional()->domainName(),
            ],
            'feature_flags' => [
                'beta_features' => $this->faker->boolean(),
                'advanced_reporting' => $this->faker->boolean(),
            ],
            'business_hours' => [
                'timezone' => 'Asia/Jakarta',
                'days' => [
                    'monday' => ['start' => '09:00', 'end' => '17:00'],
                    'tuesday' => ['start' => '09:00', 'end' => '17:00'],
                    'wednesday' => ['start' => '09:00', 'end' => '17:00'],
                    'thursday' => ['start' => '09:00', 'end' => '17:00'],
                    'friday' => ['start' => '09:00', 'end' => '17:00'],
                    'saturday' => ['start' => '09:00', 'end' => '13:00'],
                    'sunday' => ['closed' => true],
                ],
            ],
            'contact_info' => [
                'support_email' => 'support@' . $this->faker->domainName(),
                'support_phone' => $this->faker->phoneNumber(),
            ],
            'security_settings' => [
                'password_policy' => [
                    'min_length' => 8,
                    'require_special' => true,
                    'require_numbers' => true,
                    'require_uppercase' => true,
                ],
                'session_timeout' => 3600,
                'two_factor_required' => $this->faker->boolean(30),
            ],
            'api_enabled' => $this->faker->boolean(70),
            'webhook_url' => $this->faker->optional()->url(),
            'webhook_secret' => $this->faker->optional()->sha256(),
            'settings' => [
                'auto_assign_chats' => $this->faker->boolean(),
                'enable_notifications' => $this->faker->boolean(90),
            ],
            'metadata' => [
                'created_by' => 'system',
                'source' => 'registration',
            ],
            'status' => 'active',
        ];
    }

    public function withTrial(): static
    {
        return $this->state(fn (array $attributes) => [
            'subscription_status' => 'trial',
            'trial_ends_at' => now()->addDays(14),
            'subscription_plan_id' => SubscriptionPlan::factory()->trial(),
        ]);
    }

    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'subscription_status' => 'active',
            'subscription_starts_at' => now()->subDays(30),
            'subscription_ends_at' => now()->addDays(335),
        ]);
    }

    public function suspended(): static
    {
        return $this->state(fn (array $attributes) => [
            'subscription_status' => 'suspended',
            'status' => 'suspended',
        ]);
    }

    public function withApiEnabled(): static
    {
        return $this->state(fn (array $attributes) => [
            'api_enabled' => true,
            'webhook_url' => $this->faker->url(),
            'webhook_secret' => $this->faker->sha256(),
        ]);
    }

    public function enterprise(): static
    {
        return $this->state(fn (array $attributes) => [
            'subscription_plan_id' => SubscriptionPlan::factory()->enterprise(),
            'company_size' => '500+',
            'api_enabled' => true,
            'current_usage' => [
                'messages' => $this->faker->numberBetween(10000, 50000),
                'ai_requests' => $this->faker->numberBetween(1000, 5000),
                'api_calls' => $this->faker->numberBetween(5000, 20000),
                'storage_mb' => $this->faker->numberBetween(1000, 5000),
                'active_agents' => $this->faker->numberBetween(10, 50),
                'active_channels' => $this->faker->numberBetween(5, 15),
            ],
        ]);
    }
}
