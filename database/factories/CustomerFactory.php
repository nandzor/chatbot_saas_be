<?php

namespace Database\Factories;

use App\Models\Organization;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Customer>
 */
class CustomerFactory extends Factory
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
        $email = $this->faker->unique()->safeEmail();
        $phone = $this->faker->phoneNumber();

        $customerTypes = ['individual', 'business', 'enterprise', 'startup', 'agency'];
        $customerType = $this->faker->randomElement($customerTypes);

        $statuses = ['active', 'inactive', 'pending', 'suspended', 'churned'];
        $status = $this->faker->randomElement($statuses);

        $sources = ['website', 'referral', 'social_media', 'advertising', 'partnership', 'cold_outreach'];
        $source = $this->faker->randomElement($sources);

        // Generate customer profile data
        $profileData = $this->generateCustomerProfile($customerType);

        // Generate contact information
        $contactInfo = $this->generateContactInfo($customerType);

        // Generate preferences and settings
        $preferences = $this->generateCustomerPreferences($customerType);

        // Generate metadata
        $metadata = $this->generateCustomerMetadata($customerType, $status, $source);

        return [
            'organization_id' => Organization::factory(),
            'user_id' => User::factory(),
            'customer_code' => 'CUST-' . strtoupper(Str::random(8)),
            'first_name' => $firstName,
            'last_name' => $lastName,
            'full_name' => $fullName,
            'email' => $email,
            'phone' => $phone,
            'customer_type' => $customerType,
            'status' => $status,
            'source' => $source,

            // Profile Information
            'company_name' => $profileData['company_name'],
            'job_title' => $profileData['job_title'],
            'department' => $profileData['department'],
            'industry' => $profileData['industry'],
            'company_size' => $profileData['company_size'],
            'website' => $profileData['website'],
            'linkedin_url' => $profileData['linkedin_url'],
            'twitter_handle' => $profileData['twitter_handle'],

            // Contact Information
            'address' => $contactInfo['address'],
            'city' => $contactInfo['city'],
            'state' => $contactInfo['state'],
            'country' => $contactInfo['country'],
            'postal_code' => $contactInfo['postal_code'],
            'timezone' => $contactInfo['timezone'],
            'language' => $contactInfo['language'],
            'currency' => $contactInfo['currency'],

            // Customer Details
            'avatar_url' => $this->faker->optional(0.7)->imageUrl(200, 200, 'people'),
            'bio' => $this->faker->optional(0.6)->paragraph(),
            'notes' => $this->faker->optional(0.4)->sentences(2, true),
            'tags' => $this->generateCustomerTags($customerType, $industry ?? null),

            // Preferences & Settings
            'communication_preferences' => $preferences['communication'],
            'notification_settings' => $preferences['notifications'],
            'privacy_settings' => $preferences['privacy'],
            'ui_preferences' => $preferences['ui'],

            // Engagement & Activity
            'last_contact_at' => $this->faker->optional(0.8)->dateTimeBetween('-6 months', 'now'),
            'last_purchase_at' => $this->faker->optional(0.6)->dateTimeBetween('-1 year', 'now'),
            'total_purchases' => $this->faker->numberBetween(0, 50),
            'total_spent' => $this->faker->randomFloat(2, 0, 100000),
            'average_order_value' => $this->faker->randomFloat(2, 0, 5000),
            'engagement_score' => $this->faker->randomFloat(2, 0, 100),
            'loyalty_points' => $this->faker->numberBetween(0, 10000),
            'referral_count' => $this->faker->numberBetween(0, 20),

            // Subscription & Billing
            'subscription_status' => $this->determineSubscriptionStatus($status),
            'subscription_plan' => $this->faker->optional(0.7)->randomElement(['trial', 'starter', 'professional', 'enterprise']),
            'billing_cycle' => $this->faker->optional(0.6)->randomElement(['monthly', 'quarterly', 'yearly']),
            'payment_method' => $this->faker->optional(0.5)->randomElement(['credit_card', 'bank_transfer', 'paypal']),
            'tax_exempt' => $this->faker->boolean(10),
            'credit_limit' => $this->faker->optional(0.3)->randomFloat(2, 1000, 50000),

            // Support & Communication
            'support_tier' => $this->determineSupportTier($customerType, $status),
            'assigned_agent_id' => $this->faker->optional(0.4)->uuid(),
            'preferred_contact_method' => $this->faker->randomElement(['email', 'phone', 'chat', 'video_call']),
            'communication_frequency' => $this->faker->randomElement(['daily', 'weekly', 'monthly', 'quarterly', 'as_needed']),
            'marketing_consent' => $this->faker->boolean(70),
            'newsletter_subscription' => $this->faker->boolean(60),

            // Integration & API
            'api_access_enabled' => $this->faker->boolean(30),
            'api_key' => $this->faker->optional(0.3)->uuid(),
            'webhook_url' => $this->faker->optional(0.2)->url(),
            'integration_preferences' => $this->generateIntegrationPreferences($customerType),

            // Analytics & Tracking
            'first_visit_at' => $this->faker->dateTimeBetween('-2 years', '-6 months'),
            'last_visit_at' => $this->faker->optional(0.8)->dateTimeBetween('-6 months', 'now'),
            'total_visits' => $this->faker->numberBetween(1, 100),
            'average_session_duration' => $this->faker->numberBetween(60, 3600),
            'conversion_rate' => $this->faker->randomFloat(2, 0, 15),
            'customer_lifetime_value' => $this->faker->randomFloat(2, 0, 500000),

            // Risk & Compliance
            'risk_level' => $this->determineRiskLevel($status, $totalSpent ?? 0),
            'compliance_status' => $this->generateComplianceStatus($customerType),
            'verification_status' => $this->faker->randomElement(['unverified', 'pending', 'verified', 'rejected']),
            'kyc_completed' => $this->faker->boolean(60),
            'aml_check_passed' => $this->faker->boolean(90),

            // Metadata
            'metadata' => $metadata,

            // System fields
            'created_at' => $this->faker->dateTimeBetween('-2 years', 'now'),
            'updated_at' => $this->faker->dateTimeBetween('-1 year', 'now'),
        ];
    }

    /**
     * Generate customer profile based on type
     */
    private function generateCustomerProfile(string $customerType): array
    {
        $profiles = [
            'individual' => [
                'company_name' => null,
                'job_title' => $this->faker->randomElement(['Student', 'Freelancer', 'Consultant', 'Entrepreneur', 'Professional']),
                'department' => null,
                'industry' => $this->faker->randomElement(['Technology', 'Education', 'Healthcare', 'Finance', 'Creative']),
                'company_size' => '1',
                'website' => $this->faker->optional(0.3)->url(),
                'linkedin_url' => $this->faker->optional(0.4)->url(),
                'twitter_handle' => $this->faker->optional(0.2)->userName()
            ],
            'business' => [
                'company_name' => $this->faker->company(),
                'job_title' => $this->faker->randomElement(['Manager', 'Director', 'VP', 'CEO', 'Owner']),
                'department' => $this->faker->randomElement(['Sales', 'Marketing', 'Operations', 'IT', 'Customer Service']),
                'industry' => $this->faker->randomElement(['Technology', 'Healthcare', 'Finance', 'Retail', 'Manufacturing']),
                'company_size' => $this->faker->randomElement(['2-10', '11-50', '51-200']),
                'website' => $this->faker->url(),
                'linkedin_url' => $this->faker->optional(0.8)->url(),
                'twitter_handle' => $this->faker->optional(0.5)->userName()
            ],
            'enterprise' => [
                'company_name' => $this->faker->company() . ' Inc.',
                'job_title' => $this->faker->randomElement(['Senior Manager', 'Director', 'VP', 'CTO', 'CIO']),
                'department' => $this->faker->randomElement(['IT', 'Operations', 'Strategy', 'Innovation', 'Digital Transformation']),
                'industry' => $this->faker->randomElement(['Technology', 'Healthcare', 'Finance', 'Energy', 'Telecommunications']),
                'company_size' => $this->faker->randomElement(['201-1000', '1001-10000', '10000+']),
                'website' => $this->faker->url(),
                'linkedin_url' => $this->faker->url(),
                'twitter_handle' => $this->faker->optional(0.7)->userName()
            ],
            'startup' => [
                'company_name' => $this->faker->company() . ' Labs',
                'job_title' => $this->faker->randomElement(['Founder', 'Co-Founder', 'CEO', 'CTO', 'Head of Product']),
                'department' => $this->faker->randomElement(['Product', 'Engineering', 'Growth', 'Operations']),
                'industry' => $this->faker->randomElement(['Technology', 'Fintech', 'Healthtech', 'Edtech', 'SaaS']),
                'company_size' => $this->faker->randomElement(['2-10', '11-50']),
                'website' => $this->faker->url(),
                'linkedin_url' => $this->faker->optional(0.9)->url(),
                'twitter_handle' => $this->faker->optional(0.6)->userName()
            ],
            'agency' => [
                'company_name' => $this->faker->company() . ' Agency',
                'job_title' => $this->faker->randomElement(['Account Manager', 'Creative Director', 'Strategy Director', 'CEO']),
                'department' => $this->faker->randomElement(['Client Services', 'Creative', 'Strategy', 'Operations']),
                'industry' => $this->faker->randomElement(['Marketing', 'Advertising', 'Digital', 'Creative', 'Consulting']),
                'company_size' => $this->faker->randomElement(['2-10', '11-50', '51-200']),
                'website' => $this->faker->url(),
                'linkedin_url' => $this->faker->optional(0.8)->url(),
                'twitter_handle' => $this->faker->optional(0.7)->userName()
            ]
        ];

        return $profiles[$customerType] ?? $profiles['individual'];
    }

    /**
     * Generate contact information
     */
    private function generateContactInfo(string $customerType): array
    {
        $countries = ['ID', 'US', 'SG', 'MY', 'AU', 'GB', 'DE', 'JP', 'CA'];
        $country = $this->faker->randomElement($countries);

        $timezones = [
            'ID' => 'Asia/Jakarta',
            'US' => 'America/New_York',
            'SG' => 'Asia/Singapore',
            'MY' => 'Asia/Kuala_Lumpur',
            'AU' => 'Australia/Sydney',
            'GB' => 'Europe/London',
            'DE' => 'Europe/Berlin',
            'JP' => 'Asia/Tokyo',
            'CA' => 'America/Toronto'
        ];

        $languages = [
            'ID' => ['id', 'en'],
            'US' => ['en'],
            'SG' => ['en', 'zh', 'ms'],
            'MY' => ['en', 'ms', 'zh'],
            'AU' => ['en'],
            'GB' => ['en'],
            'DE' => ['de', 'en'],
            'JP' => ['ja', 'en'],
            'CA' => ['en', 'fr']
        ];

        $currencies = [
            'ID' => 'IDR',
            'US' => 'USD',
            'SG' => 'SGD',
            'MY' => 'MYR',
            'AU' => 'AUD',
            'GB' => 'GBP',
            'DE' => 'EUR',
            'JP' => 'JPY',
            'CA' => 'CAD'
        ];

        return [
            'address' => $this->faker->streetAddress(),
            'city' => $this->faker->city(),
            'state' => $this->faker->state(),
            'country' => $country,
            'postal_code' => $this->faker->postcode(),
            'timezone' => $timezones[$country] ?? 'UTC',
            'language' => $this->faker->randomElement($languages[$country] ?? ['en']),
            'currency' => $currencies[$country] ?? 'USD'
        ];
    }

    /**
     * Generate customer preferences
     */
    private function generateCustomerPreferences(string $customerType): array
    {
        return [
            'communication' => [
                'preferred_channel' => $this->faker->randomElement(['email', 'phone', 'chat', 'video_call']),
                'frequency' => $this->faker->randomElement(['daily', 'weekly', 'monthly', 'quarterly', 'as_needed']),
                'time_of_day' => $this->faker->randomElement(['morning', 'afternoon', 'evening']),
                'timezone_aware' => $this->faker->boolean(80),
                'language_preference' => $this->faker->randomElement(['en', 'id', 'auto'])
            ],
            'notifications' => [
                'email_notifications' => $this->faker->boolean(80),
                'sms_notifications' => $this->faker->boolean(40),
                'push_notifications' => $this->faker->boolean(60),
                'marketing_emails' => $this->faker->boolean(70),
                'product_updates' => $this->faker->boolean(90),
                'security_alerts' => $this->faker->boolean(95)
            ],
            'privacy' => [
                'data_sharing' => $this->faker->boolean(60),
                'analytics_tracking' => $this->faker->boolean(80),
                'personalization' => $this->faker->boolean(70),
                'third_party_integrations' => $this->faker->boolean(50),
                'cookie_preferences' => $this->faker->randomElement(['essential', 'functional', 'analytics', 'marketing'])
            ],
            'ui' => [
                'theme' => $this->faker->randomElement(['light', 'dark', 'auto']),
                'language' => $this->faker->randomElement(['en', 'id', 'auto']),
                'accessibility_features' => $this->faker->randomElements(['high_contrast', 'large_text', 'screen_reader', 'keyboard_navigation'], $this->faker->numberBetween(0, 3)),
                'dashboard_layout' => $this->faker->randomElement(['default', 'compact', 'detailed', 'custom']),
                'notifications_position' => $this->faker->randomElement(['top_right', 'top_left', 'bottom_right', 'bottom_left'])
            ]
        ];
    }

    /**
     * Generate customer metadata
     */
    private function generateCustomerMetadata(string $customerType, string $status, string $source): array
    {
        return [
            'customer_segment' => $this->determineCustomerSegment($customerType),
            'acquisition_channel' => $source,
            'lead_score' => $this->faker->numberBetween(0, 100),
            'sales_stage' => $this->determineSalesStage($status),
            'account_manager' => $this->faker->optional(0.4)->name(),
            'sales_rep' => $this->faker->optional(0.3)->name(),
            'territory' => $this->faker->optional(0.5)->randomElement(['North', 'South', 'East', 'West', 'Central']),
            'campaign_source' => $this->faker->optional(0.6)->randomElement(['google_ads', 'facebook_ads', 'linkedin_ads', 'email_campaign', 'content_marketing']),
            'referral_source' => $this->faker->optional(0.3)->randomElement(['customer_referral', 'partner_referral', 'employee_referral', 'online_review']),
            'competitor_switching_from' => $this->faker->optional(0.2)->randomElement(['Intercom', 'Zendesk', 'Freshdesk', 'Help Scout', 'Crisp']),
            'use_case' => $this->faker->randomElement(['customer_support', 'sales_enablement', 'marketing_automation', 'internal_communication', 'ecommerce']),
            'implementation_timeline' => $this->faker->randomElement(['immediate', '1_month', '3_months', '6_months', '1_year']),
            'budget_range' => $this->faker->randomElement(['under_1k', '1k_5k', '5k_10k', '10k_25k', '25k_50k', '50k_100k', '100k_plus']),
            'decision_maker' => $this->faker->boolean(70),
            'technical_contact' => $this->faker->boolean(60),
            'billing_contact' => $this->faker->boolean(80),
            'project_requirements' => $this->faker->optional(0.5)->sentences(3, true),
            'success_metrics' => $this->faker->optional(0.4)->randomElements(['response_time', 'customer_satisfaction', 'resolution_rate', 'cost_reduction'], $this->faker->numberBetween(1, 3)),
            'integration_requirements' => $this->faker->optional(0.6)->randomElements(['slack', 'teams', 'zapier', 'api', 'webhook'], $this->faker->numberBetween(1, 4)),
            'compliance_requirements' => $this->faker->optional(0.3)->randomElements(['gdpr', 'ccpa', 'sox', 'hipaa', 'iso27001'], $this->faker->numberBetween(0, 2)),
            'training_requirements' => $this->faker->optional(0.4)->randomElements(['onboarding', 'advanced_features', 'best_practices', 'api_usage'], $this->faker->numberBetween(0, 3)),
            'support_requirements' => $this->faker->optional(0.5)->randomElements(['24_7_support', 'dedicated_agent', 'priority_queue', 'custom_integrations'], $this->faker->numberBetween(0, 2)),
            'notes' => $this->faker->optional(0.6)->sentences(2, true),
            'tags' => $this->generateCustomerTags($customerType, null),
            'last_updated' => now()->toISOString()
        ];
    }

    /**
     * Generate customer tags
     */
    private function generateCustomerTags(string $customerType, ?string $industry): array
    {
        $tags = [$customerType];

        if ($industry) {
            $tags[] = strtolower(str_replace(' ', '_', $industry));
        }

        $additionalTags = [
            'new_customer',
            'returning_customer',
            'high_value',
            'enterprise',
            'startup',
            'agency',
            'individual',
            'verified',
            'active',
            'premium'
        ];

        $selectedTags = $this->faker->randomElements($additionalTags, $this->faker->numberBetween(2, 5));
        $tags = array_merge($tags, $selectedTags);

        return array_unique($tags);
    }

    /**
     * Generate integration preferences
     */
    private function generateIntegrationPreferences(string $customerType): array
    {
        $integrations = [
            'slack' => $this->faker->boolean(60),
            'teams' => $this->faker->boolean(40),
            'zapier' => $this->faker->boolean(50),
            'webhook' => $this->faker->boolean(70),
            'api' => $this->faker->boolean(80),
            'sso' => $this->faker->boolean(30),
            'crm' => $this->faker->boolean(60),
            'helpdesk' => $this->faker->boolean(70),
            'analytics' => $this->faker->boolean(80),
            'marketing' => $this->faker->boolean(50)
        ];

        return $integrations;
    }

    /**
     * Determine subscription status
     */
    private function determineSubscriptionStatus(string $status): string
    {
        return match($status) {
            'active' => 'subscribed',
            'trial' => 'trial',
            'pending' => 'pending',
            'inactive', 'suspended' => 'unsubscribed',
            'churned' => 'churned',
            default => 'none'
        };
    }

    /**
     * Determine support tier
     */
    private function determineSupportTier(string $customerType, string $status): string
    {
        if ($status !== 'active') {
            return 'basic';
        }

        return match($customerType) {
            'enterprise' => 'dedicated',
            'business' => 'priority',
            'startup' => 'standard',
            'agency' => 'standard',
            'individual' => 'basic',
            default => 'basic'
        };
    }

    /**
     * Determine risk level
     */
    private function determineRiskLevel(string $status, float $totalSpent): string
    {
        if ($status === 'churned' || $status === 'suspended') {
            return 'high';
        }

        if ($totalSpent > 10000) {
            return 'low';
        } elseif ($totalSpent > 1000) {
            return 'medium';
        } else {
            return 'medium';
        }
    }

    /**
     * Generate compliance status
     */
    private function generateComplianceStatus(string $customerType): array
    {
        $complianceStandards = ['gdpr', 'ccpa', 'sox', 'hipaa', 'iso27001'];
        $relevantStandards = $this->faker->randomElements($complianceStandards, $this->faker->numberBetween(0, 3));

        return [
            'standards' => $relevantStandards,
            'compliance_score' => $this->faker->randomFloat(2, 0.7, 1.0),
            'last_audit' => $this->faker->optional(0.6)->dateTimeBetween('-1 year', 'now')->format('c'),
            'next_audit_due' => $this->faker->dateTimeBetween('now', '+1 year')->format('c'),
            'risk_level' => $this->faker->randomElement(['low', 'medium', 'high'])
        ];
    }

    /**
     * Determine customer segment
     */
    private function determineCustomerSegment(string $customerType): string
    {
        return match($customerType) {
            'enterprise' => 'enterprise',
            'business' => 'mid_market',
            'startup' => 'startup',
            'agency' => 'agency',
            'individual' => 'individual',
            default => 'general'
        };
    }

    /**
     * Determine sales stage
     */
    private function determineSalesStage(string $status): string
    {
        return match($status) {
            'active' => 'closed_won',
            'trial' => 'trial',
            'pending' => 'proposal',
            'inactive' => 'lead',
            'suspended' => 'churned',
            'churned' => 'churned',
            default => 'lead'
        };
    }

    /**
     * Indicate that the customer is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'active',
            'subscription_status' => 'subscribed',
        ]);
    }

    /**
     * Indicate that the customer is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'inactive',
            'subscription_status' => 'unsubscribed',
        ]);
    }

    /**
     * Indicate that the customer is in trial.
     */
    public function trial(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
            'subscription_status' => 'trial',
        ]);
    }

    /**
     * Indicate that the customer has churned.
     */
    public function churned(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'churned',
            'subscription_status' => 'churned',
            'last_contact_at' => $this->faker->dateTimeBetween('-1 year', '-6 months'),
        ]);
    }

    /**
     * Indicate that the customer is an individual.
     */
    public function individual(): static
    {
        return $this->state(fn (array $attributes) => [
            'customer_type' => 'individual',
            'company_name' => null,
            'department' => null,
            'company_size' => '1',
        ]);
    }

    /**
     * Indicate that the customer is a business.
     */
    public function business(): static
    {
        return $this->state(fn (array $attributes) => [
            'customer_type' => 'business',
            'company_size' => $this->faker->randomElement(['2-10', '11-50', '51-200']),
        ]);
    }

    /**
     * Indicate that the customer is an enterprise.
     */
    public function enterprise(): static
    {
        return $this->state(fn (array $attributes) => [
            'customer_type' => 'enterprise',
            'company_size' => $this->faker->randomElement(['201-1000', '1001-10000', '10000+']),
            'support_tier' => 'dedicated',
        ]);
    }

    /**
     * Indicate that the customer is a startup.
     */
    public function startup(): static
    {
        return $this->state(fn (array $attributes) => [
            'customer_type' => 'startup',
            'company_size' => $this->faker->randomElement(['2-10', '11-50']),
        ]);
    }

    /**
     * Indicate that the customer is an agency.
     */
    public function agency(): static
    {
        return $this->state(fn (array $attributes) => [
            'customer_type' => 'agency',
            'industry' => $this->faker->randomElement(['Marketing', 'Advertising', 'Digital', 'Creative', 'Consulting']),
        ]);
    }

    /**
     * Indicate that the customer is high value.
     */
    public function highValue(): static
    {
        return $this->state(fn (array $attributes) => [
            'total_spent' => $this->faker->randomFloat(2, 10000, 100000),
            'average_order_value' => $this->faker->randomFloat(2, 1000, 10000),
            'customer_lifetime_value' => $this->faker->randomFloat(2, 50000, 500000),
            'engagement_score' => $this->faker->randomFloat(2, 70, 100),
            'support_tier' => 'priority',
        ]);
    }

    /**
     * Indicate that the customer is new.
     */
    public function newlyCreated(): static
    {
        return $this->state(fn (array $attributes) => [
            'created_at' => $this->faker->dateTimeBetween('-30 days', 'now'),
            'total_purchases' => 0,
            'total_spent' => 0,
            'engagement_score' => $this->faker->randomFloat(2, 0, 30),
            'status' => 'pending',
        ]);
    }

    /**
     * Indicate that the customer is verified.
     */
    public function verified(): static
    {
        return $this->state(fn (array $attributes) => [
            'verification_status' => 'verified',
            'kyc_completed' => true,
            'aml_check_passed' => true,
        ]);
    }

    /**
     * Indicate that the customer has API access.
     */
    public function withApiAccess(): static
    {
        return $this->state(fn (array $attributes) => [
            'api_access_enabled' => true,
            'api_key' => $this->faker->uuid(),
        ]);
    }

    /**
     * Indicate that the customer is from a specific source.
     */
    public function fromSource(string $source): static
    {
        return $this->state(fn (array $attributes) => [
            'source' => $source,
        ]);
    }

    /**
     * Indicate that the customer is from a specific industry.
     */
    public function fromIndustry(string $industry): static
    {
        return $this->state(fn (array $attributes) => [
            'industry' => $industry,
        ]);
    }

    /**
     * Indicate that the customer is from a specific country.
     */
    public function fromCountry(string $country): static
    {
        return $this->state(fn (array $attributes) => [
            'country' => $country,
        ]);
    }
}
