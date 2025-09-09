<?php

namespace Database\Factories;

use App\Models\Organization;
use App\Models\SubscriptionPlan;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Organization>
 */
class OrganizationFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Organization::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $businessTypes = [
            'startup', 'small_business', 'medium_business', 'large_enterprise',
            'non_profit', 'government', 'educational', 'healthcare', 'financial',
            'retail', 'manufacturing', 'technology', 'consulting', 'other'
        ];

        $industries = [
            'technology', 'healthcare', 'finance', 'education', 'retail',
            'manufacturing', 'consulting', 'non_profit', 'government', 'media',
            'real_estate', 'transportation', 'energy', 'agriculture', 'other'
        ];

        $companySizes = [
            '1-10', '11-50', '51-200', '201-500', '501-1000',
            '1001-5000', '5001-10000', '10000+'
        ];

        $currencies = ['IDR', 'USD', 'EUR', 'GBP', 'SGD', 'MYR', 'THB', 'JPY', 'KRW', 'CNY'];

        $businessType = $this->faker->randomElement($businessTypes);
        $industry = $this->faker->randomElement($industries);
        $companySize = $this->faker->randomElement($companySizes);
        $currency = $this->faker->randomElement($currencies);

        // Generate org_code based on business type and random number
        $orgCode = strtoupper(substr($businessType, 0, 3)) . str_pad($this->faker->numberBetween(1, 999), 3, '0', STR_PAD_LEFT);

        // Generate company name based on business type
        $companyName = $this->generateCompanyName($businessType, $industry);

        return [
            'org_code' => $orgCode,
            'name' => $companyName,
            'display_name' => $this->faker->optional()->words(2, true),
            'email' => $this->faker->unique()->companyEmail(),
            'phone' => $this->faker->phoneNumber(),
            'address' => $this->faker->address(),
            'logo_url' => $this->faker->optional()->imageUrl(200, 200, 'business'),
            'favicon_url' => $this->faker->optional()->imageUrl(32, 32, 'business'),
            'website' => $this->faker->optional()->url(),
            'tax_id' => $this->faker->optional()->numerify('##.###.###.#-###.###'),
            'business_type' => $businessType,
            'industry' => $industry,
            'company_size' => $companySize,
            'timezone' => $this->faker->randomElement(['Asia/Jakarta', 'Asia/Makassar', 'Asia/Jayapura']),
            'locale' => $this->faker->randomElement(['id', 'en']),
            'currency' => $currency,
            'subscription_plan_id' => SubscriptionPlan::inRandomOrder()->first()?->id,
            'subscription_status' => $this->faker->randomElement(['trial', 'active', 'inactive', 'suspended']),
            'trial_ends_at' => $this->faker->optional()->dateTimeBetween('now', '+30 days'),
            'subscription_starts_at' => $this->faker->optional()->dateTimeBetween('-6 months', 'now'),
            'subscription_ends_at' => $this->faker->optional()->dateTimeBetween('now', '+12 months'),
            'billing_cycle' => $this->faker->randomElement(['monthly', 'quarterly', 'yearly']),
            'current_usage' => [
                'agents' => $this->faker->numberBetween(0, 20),
                'channels' => $this->faker->numberBetween(0, 10),
                'knowledge_articles' => $this->faker->numberBetween(0, 1000),
                'monthly_messages' => $this->faker->numberBetween(0, 50000),
                'monthly_ai_requests' => $this->faker->numberBetween(0, 25000),
                'storage_gb' => $this->faker->numberBetween(0, 100),
                'api_calls_today' => $this->faker->numberBetween(0, 1000)
            ],
            'theme_config' => [
                'primary_color' => $this->faker->hexColor(),
                'secondary_color' => $this->faker->hexColor(),
                'logo_position' => $this->faker->randomElement(['left', 'center', 'right'])
            ],
            'branding_config' => [
                'company_name' => $companyName,
                'slogan' => $this->faker->optional()->sentence(),
                'custom_domain' => $this->faker->optional()->domainName()
            ],
            'feature_flags' => [
                'ai_chat' => $this->faker->boolean(80),
                'knowledge_base' => $this->faker->boolean(80),
                'multi_channel' => $this->faker->boolean(70),
                'api_access' => $this->faker->boolean(60),
                'analytics' => $this->faker->boolean(60),
                'custom_branding' => $this->faker->boolean(40),
                'priority_support' => $this->faker->boolean(30),
                'white_label' => $this->faker->boolean(20),
                'advanced_analytics' => $this->faker->boolean(30),
                'custom_integrations' => $this->faker->boolean(20)
            ],
            'ui_preferences' => [
                'language' => $this->faker->randomElement(['id', 'en']),
                'theme' => $this->faker->randomElement(['light', 'dark']),
                'notifications' => $this->faker->boolean(80)
            ],
            'business_hours' => [
                'monday' => ['09:00', '17:00'],
                'tuesday' => ['09:00', '17:00'],
                'wednesday' => ['09:00', '17:00'],
                'thursday' => ['09:00', '17:00'],
                'friday' => ['09:00', '17:00'],
                'saturday' => $this->faker->optional()->randomElement([['09:00', '12:00'], []]),
                'sunday' => []
            ],
            'contact_info' => [
                'primary_contact' => [
                    'name' => $this->faker->name(),
                    'email' => $this->faker->email(),
                    'phone' => $this->faker->phoneNumber()
                ],
                'support_email' => $this->faker->optional()->email(),
                'sales_email' => $this->faker->optional()->email()
            ],
            'social_media' => [
                'linkedin' => $this->faker->optional()->url(),
                'twitter' => $this->faker->optional()->url(),
                'facebook' => $this->faker->optional()->url(),
                'instagram' => $this->faker->optional()->url()
            ],
            'security_settings' => [
                'two_factor_required' => $this->faker->boolean(30),
                'session_timeout' => $this->faker->randomElement([1800, 3600, 7200]),
                'ip_whitelist' => $this->faker->optional()->randomElements(['192.168.1.0/24', '10.0.0.0/8'], $this->faker->numberBetween(0, 2)),
                'password_policy' => $this->faker->randomElement(['weak', 'medium', 'strong', 'very_strong'])
            ],
            'api_enabled' => $this->faker->boolean(60),
            'webhook_url' => $this->faker->optional()->url(),
            'webhook_secret' => $this->faker->optional()->regexify('[A-Za-z0-9]{32}'),
            'settings' => [
                'auto_backup' => $this->faker->boolean(70),
                'backup_frequency' => $this->faker->randomElement(['hourly', 'daily', 'weekly']),
                'retention_days' => $this->faker->randomElement([7, 30, 90])
            ],
            'metadata' => [
                'founded_year' => $this->faker->numberBetween(1990, 2024),
                'headquarters' => $this->faker->city() . ', Indonesia',
                'employee_count' => $this->faker->numberBetween(1, 1000)
            ],
            'status' => $this->faker->randomElement(['active', 'inactive', 'suspended'])
        ];
    }

    /**
     * Generate company name based on business type and industry
     */
    private function generateCompanyName(string $businessType, string $industry): string
    {
        $suffixes = [
            'startup' => ['Labs', 'Tech', 'Innovation', 'Hub', 'Studio'],
            'small_business' => ['Solutions', 'Services', 'Group', 'Company', 'Enterprise'],
            'medium_business' => ['Corporation', 'Industries', 'Systems', 'Technologies', 'Partners'],
            'large_enterprise' => ['International', 'Global', 'Worldwide', 'Holdings', 'Group'],
            'healthcare' => ['Medical', 'Health', 'Care', 'Clinic', 'Hospital'],
            'financial' => ['Finance', 'Capital', 'Bank', 'Investment', 'Wealth'],
            'educational' => ['Education', 'Learning', 'Academy', 'Institute', 'University'],
            'technology' => ['Tech', 'Digital', 'Software', 'Systems', 'Solutions'],
            'retail' => ['Retail', 'Store', 'Market', 'Shop', 'Commerce'],
            'manufacturing' => ['Manufacturing', 'Industries', 'Production', 'Factory', 'Works']
        ];

        $prefixes = [
            'technology' => ['Cyber', 'Digital', 'Smart', 'Future', 'Next'],
            'healthcare' => ['Medi', 'Health', 'Care', 'Vita', 'Well'],
            'financial' => ['Prime', 'Capital', 'Global', 'Elite', 'Premium'],
            'educational' => ['Edu', 'Learn', 'Smart', 'Bright', 'Future'],
            'retail' => ['Shop', 'Market', 'Store', 'Buy', 'Trade'],
            'manufacturing' => ['Pro', 'Indus', 'Manu', 'Factory', 'Works']
        ];

        $suffix = $suffixes[$businessType] ?? $suffixes['small_business'];
        $prefix = $prefixes[$industry] ?? ['New', 'Modern', 'Advanced', 'Smart', 'Future'];

        return $this->faker->randomElement($prefix) . ' ' . $this->faker->randomElement($suffix);
    }

    /**
     * Indicate that the organization is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'active',
            'subscription_status' => 'active'
        ]);
    }

    /**
     * Indicate that the organization is in trial.
     */
    public function trial(): static
    {
        return $this->state(fn (array $attributes) => [
            'subscription_status' => 'trial',
            'trial_ends_at' => now()->addDays($this->faker->numberBetween(1, 30))
        ]);
    }

    /**
     * Indicate that the organization is a startup.
     */
    public function startup(): static
    {
        return $this->state(fn (array $attributes) => [
            'business_type' => 'startup',
            'company_size' => $this->faker->randomElement(['1-10', '11-50']),
            'subscription_status' => 'trial'
        ]);
    }

    /**
     * Indicate that the organization is a small business.
     */
    public function smallBusiness(): static
    {
        return $this->state(fn (array $attributes) => [
            'business_type' => 'small_business',
            'company_size' => $this->faker->randomElement(['1-10', '11-50', '51-200'])
        ]);
    }

    /**
     * Indicate that the organization is a medium business.
     */
    public function mediumBusiness(): static
    {
        return $this->state(fn (array $attributes) => [
            'business_type' => 'medium_business',
            'company_size' => $this->faker->randomElement(['51-200', '201-500'])
        ]);
    }

    /**
     * Indicate that the organization is a large enterprise.
     */
    public function largeEnterprise(): static
    {
        return $this->state(fn (array $attributes) => [
            'business_type' => 'large_enterprise',
            'company_size' => $this->faker->randomElement(['501-1000', '1001-5000', '5001-10000', '10000+'])
        ]);
    }

    /**
     * Indicate that the organization is in healthcare industry.
     */
    public function healthcare(): static
    {
        return $this->state(fn (array $attributes) => [
            'industry' => 'healthcare',
            'business_type' => 'healthcare',
            'security_settings' => [
                'two_factor_required' => true,
                'session_timeout' => 1800,
                'ip_whitelist' => [],
                'password_policy' => 'very_strong',
                'hipaa_compliant' => true
            ]
        ]);
    }

    /**
     * Indicate that the organization is in technology industry.
     */
    public function technology(): static
    {
        return $this->state(fn (array $attributes) => [
            'industry' => 'technology',
            'business_type' => 'technology',
            'api_enabled' => true,
            'feature_flags' => [
                'ai_chat' => true,
                'knowledge_base' => true,
                'multi_channel' => true,
                'api_access' => true,
                'analytics' => true,
                'custom_branding' => true,
                'priority_support' => false,
                'white_label' => false,
                'advanced_analytics' => false,
                'custom_integrations' => false
            ]
        ]);
    }

    /**
     * Indicate that the organization is in financial industry.
     */
    public function financial(): static
    {
        return $this->state(fn (array $attributes) => [
            'industry' => 'finance',
            'business_type' => 'financial',
            'security_settings' => [
                'two_factor_required' => true,
                'session_timeout' => 1800,
                'ip_whitelist' => [],
                'password_policy' => 'very_strong'
            ]
        ]);
    }

    /**
     * Indicate that the organization has API enabled.
     */
    public function withApi(): static
    {
        return $this->state(fn (array $attributes) => [
            'api_enabled' => true,
            'webhook_url' => $this->faker->url(),
            'webhook_secret' => $this->faker->regexify('[A-Za-z0-9]{32}')
        ]);
    }

    /**
     * Indicate that the organization is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'inactive',
            'subscription_status' => 'inactive'
        ]);
    }

    /**
     * Indicate that the organization is suspended.
     */
    public function suspended(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'suspended',
            'subscription_status' => 'suspended'
        ]);
    }
}
