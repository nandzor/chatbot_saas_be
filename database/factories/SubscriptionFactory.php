<?php

namespace Database\Factories;

use App\Models\Organization;
use App\Models\SubscriptionPlan;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Subscription>
 */
class SubscriptionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $statuses = ['active', 'trial', 'past_due', 'canceled', 'unpaid', 'suspended'];
        $status = $this->faker->randomElement($statuses);

        $billingCycles = ['monthly', 'quarterly', 'yearly'];
        $billingCycle = $this->faker->randomElement($billingCycles);

        $plan = SubscriptionPlan::factory();

        // Calculate pricing based on billing cycle
        $basePrice = $this->faker->numberBetween(100000, 5000000); // IDR
        $price = match($billingCycle) {
            'monthly' => $basePrice,
            'quarterly' => round($basePrice * 3 * 0.9), // 10% discount
            'yearly' => round($basePrice * 12 * 0.8), // 20% discount
            default => $basePrice
        };

        // Generate subscription dates
        $startDate = $this->faker->dateTimeBetween('-2 years', 'now');
        $trialEndDate = $status === 'trial' ? $this->faker->dateTimeBetween($startDate, '+30 days') : null;
        $currentPeriodStart = $this->faker->dateTimeBetween($startDate, 'now');
        $currentPeriodEnd = $this->calculatePeriodEnd($currentPeriodStart, $billingCycle);
        $canceledAt = $status === 'canceled' ? $this->faker->dateTimeBetween($startDate, 'now') : null;
        $endedAt = $status === 'canceled' ? $canceledAt : null;

        // Generate usage data
        $usageData = $this->generateUsageData($status);

        // Generate payment information
        $paymentInfo = $this->generatePaymentInfo($status, $billingCycle);

        // Generate subscription features
        $features = $this->generateSubscriptionFeatures($status);

        // Generate metadata
        $metadata = $this->generateMetadata($status, $billingCycle);

        return [
            'organization_id' => Organization::factory(),
            'subscription_plan_id' => $plan,
            'user_id' => User::factory(),
            'status' => $status,
            'billing_cycle' => $billingCycle,

            // Pricing
            'price' => $price,
            'currency' => $planData['currency'] ?? 'IDR',
            'discount_amount' => $this->faker->optional(0.3)->randomFloat(2, 0, $price * 0.3),
            'discount_percentage' => $this->faker->optional(0.3)->randomFloat(2, 0, 30),
            'tax_amount' => $this->faker->optional(0.7)->randomFloat(2, 0, $price * 0.1),
            'total_amount' => $price,

            // Dates
            'start_date' => $startDate,
            'trial_ends_at' => $trialEndDate,
            'current_period_start' => $currentPeriodStart,
            'current_period_end' => $currentPeriodEnd,
            'canceled_at' => $canceledAt,
            'ended_at' => $endedAt,
            'next_billing_date' => $this->calculateNextBillingDate($currentPeriodEnd, $billingCycle, $status),

            // Usage & Limits
            'usage_data' => $usageData,
            'feature_usage' => $this->generateFeatureUsage($status),
            'overage_charges' => $this->generateOverageCharges($usageData),

            // Payment & Billing
            'payment_method_id' => $this->faker->optional(0.8)->uuid(),
            'payment_status' => $this->determinePaymentStatus($status),
            'last_payment_date' => $this->faker->optional(0.7)->dateTimeBetween($startDate, 'now'),
            'next_payment_amount' => $this->calculateNextPaymentAmount($price, $billingCycle, $status),
            'payment_failure_count' => $this->faker->numberBetween(0, 5),
            'last_payment_failure' => $this->faker->optional(0.3)->dateTimeBetween($startDate, 'now'),

            // Features & Configuration
            'features' => $features,
            'feature_flags' => $this->generateFeatureFlags($status),
            'custom_fields' => $this->generateCustomFields(),

            // Metadata
            'metadata' => $metadata,

            // System fields
            'created_at' => $startDate,
            'updated_at' => $this->faker->dateTimeBetween($startDate, 'now'),
        ];
    }

    /**
     * Calculate period end based on billing cycle
     */
    private function calculatePeriodEnd(\DateTime $startDate, string $billingCycle): \DateTime
    {
        $endDate = clone $startDate;

        return match($billingCycle) {
            'monthly' => $endDate->modify('+1 month'),
            'quarterly' => $endDate->modify('+3 months'),
            'yearly' => $endDate->modify('+1 year'),
            default => $endDate->modify('+1 month')
        };
    }

    /**
     * Calculate next billing date
     */
    private function calculateNextBillingDate(\DateTime $currentPeriodEnd, string $billingCycle, string $status): ?\DateTime
    {
        if (in_array($status, ['canceled', 'suspended', 'unpaid'])) {
            return null;
        }

        $nextBilling = clone $currentPeriodEnd;

        return match($billingCycle) {
            'monthly' => $nextBilling->modify('+1 month'),
            'quarterly' => $nextBilling->modify('+3 months'),
            'yearly' => $nextBilling->modify('+1 year'),
            default => $nextBilling->modify('+1 month')
        };
    }

    /**
     * Calculate next payment amount
     */
    private function calculateNextPaymentAmount(float $price, string $billingCycle, string $status): ?float
    {
        if (in_array($status, ['canceled', 'suspended', 'unpaid'])) {
            return null;
        }

        return $price;
    }

    /**
     * Generate usage data
     */
    private function generateUsageData(string $status): array
    {
        $isActive = in_array($status, ['active', 'trial']);
        $usageMultiplier = $isActive ? $this->faker->randomFloat(2, 0.1, 1.5) : 0;

        $maxAgents = 10;
        $maxCustomers = 1000;
        $maxApiCalls = 10000;
        $maxStorage = 10;
        $maxChatSessions = 1000;

        return [
            'agents' => [
                'used' => round($maxAgents * $usageMultiplier),
                'limit' => $maxAgents,
                'percentage' => min(100, round(($usageMultiplier * 100)))
            ],
            'customers' => [
                'used' => round($maxCustomers * $usageMultiplier),
                'limit' => $maxCustomers,
                'percentage' => min(100, round(($usageMultiplier * 100)))
            ],
            'api_calls' => [
                'used' => round($maxApiCalls * $usageMultiplier),
                'limit' => $maxApiCalls,
                'percentage' => min(100, round(($usageMultiplier * 100)))
            ],
            'storage' => [
                'used' => round($maxStorage * $usageMultiplier, 2),
                'limit' => $maxStorage,
                'percentage' => min(100, round(($usageMultiplier * 100)))
            ],
            'chat_sessions' => [
                'used' => round($maxChatSessions * $usageMultiplier),
                'limit' => $maxChatSessions,
                'percentage' => min(100, round(($usageMultiplier * 100)))
            ],
            'last_updated' => now()->toISOString()
        ];
    }

    /**
     * Generate feature usage
     */
    private function generateFeatureUsage(string $status): array
    {
        $isActive = in_array($status, ['active', 'trial']);
        $usageMultiplier = $isActive ? $this->faker->randomFloat(2, 0.1, 1.2) : 0;

        $features = [
            'ai_models' => true,
            'knowledge_bases' => true,
            'integrations' => true,
            'webhooks' => true,
            'custom_branding' => false,
            'priority_support' => false,
            'advanced_analytics' => false,
            'api_access' => true,
            'multi_language' => false,
            'white_label' => false
        ];
        $featureUsage = [];

        foreach ($features as $feature => $enabled) {
            if ($enabled) {
                $featureUsage[$feature] = [
                    'enabled' => true,
                    'usage_count' => $this->faker->numberBetween(0, 1000),
                    'last_used' => $this->faker->optional(0.7)->dateTimeBetween('-30 days', 'now'),
                    'usage_limit' => $this->faker->optional(0.5)->numberBetween(100, 10000)
                ];
            } else {
                $featureUsage[$feature] = [
                    'enabled' => false,
                    'usage_count' => 0,
                    'last_used' => null,
                    'usage_limit' => null
                ];
            }
        }

        return $featureUsage;
    }

    /**
     * Generate overage charges
     */
    private function generateOverageCharges(array $usageData): array
    {
        $overages = [];

        foreach ($usageData as $resource => $data) {
            if ($data['percentage'] > 100) {
                $overageAmount = $data['used'] - $data['limit'];
                $overageRate = $this->getOverageRate($resource);

                $overages[$resource] = [
                    'overage_amount' => $overageAmount,
                    'overage_rate' => $overageRate,
                    'overage_cost' => $overageAmount * $overageRate,
                    'billing_period' => 'current',
                    'charged' => $this->faker->boolean(80)
                ];
            }
        }

        return $overages;
    }

    /**
     * Get overage rate for resource
     */
    private function getOverageRate(string $resource): float
    {
        $overageRates = [
            'agents' => 50.0,
            'customers' => 0.10,
            'api_calls' => 0.001,
            'storage' => 0.50,
            'chat_sessions' => 0.05
        ];

        return $overageRates[$resource] ?? 1.0;
    }

    /**
     * Generate payment information
     */
    private function generatePaymentInfo(string $status, string $billingCycle): array
    {
        $paymentMethods = [
            'credit_card' => [
                'type' => 'credit_card',
                'last4' => $this->faker->numerify('####'),
                'brand' => $this->faker->randomElement(['visa', 'mastercard', 'amex']),
                'exp_month' => $this->faker->numberBetween(1, 12),
                'exp_year' => $this->faker->numberBetween(date('Y') + 1, date('Y') + 10)
            ],
            'bank_transfer' => [
                'type' => 'bank_transfer',
                'bank_name' => $this->faker->randomElement(['BCA', 'Mandiri', 'BNI', 'BRI']),
                'account_number' => $this->faker->numerify('##########')
            ],
            'paypal' => [
                'type' => 'paypal',
                'email' => $this->faker->email()
            ]
        ];

        $selectedMethod = $this->faker->randomElement(array_keys($paymentMethods));

        return [
            'method' => $selectedMethod,
            'details' => $paymentMethods[$selectedMethod],
            'auto_renew' => $this->faker->boolean(80),
            'retry_on_failure' => $this->faker->boolean(70),
            'retry_count' => $this->faker->numberBetween(0, 3),
            'retry_interval_hours' => $this->faker->randomElement([1, 6, 12, 24])
        ];
    }

    /**
     * Generate subscription features
     */
    private function generateSubscriptionFeatures(string $status): array
    {
        $features = [
            'ai_models' => true,
            'knowledge_bases' => true,
            'integrations' => true,
            'webhooks' => true,
            'custom_branding' => false,
            'priority_support' => false,
            'advanced_analytics' => false,
            'api_access' => true,
            'multi_language' => false,
            'white_label' => false
        ];
        $subscriptionFeatures = [];

        foreach ($features as $feature => $enabled) {
            $subscriptionFeatures[$feature] = [
                'enabled' => $enabled && in_array($status, ['active', 'trial']),
                'limit' => $this->getFeatureLimit($feature),
                'usage' => $this->faker->numberBetween(0, 100),
                'last_updated' => now()->toISOString()
            ];
        }

        return $subscriptionFeatures;
    }

    /**
     * Get feature limit
     */
    private function getFeatureLimit(string $feature): ?int
    {
        $featureLimits = [
            'ai_models' => 5,
            'knowledge_bases' => 10,
            'integrations' => 20,
            'webhooks' => 50,
            'custom_branding' => false,
            'priority_support' => false,
            'advanced_analytics' => false,
            'api_access' => true,
            'multi_language' => false,
            'white_label' => false
        ];

        return $featureLimits[$feature] ?? null;
    }

    /**
     * Generate feature flags
     */
    private function generateFeatureFlags(string $status): array
    {
        $isActive = in_array($status, ['active', 'trial']);

        return [
            'beta_features' => $isActive && $this->faker->boolean(30),
            'early_access' => $isActive && $this->faker->boolean(20),
            'experimental_features' => $isActive && $this->faker->boolean(15),
            'custom_integrations' => $isActive && $this->faker->boolean(40),
            'advanced_reporting' => $isActive && $this->faker->boolean(60),
            'ai_training' => $isActive && $this->faker->boolean(70),
            'webhook_customization' => $isActive && $this->faker->boolean(50),
            'multi_tenant' => $isActive && $this->faker->boolean(25)
        ];
    }

    /**
     * Generate custom fields
     */
    private function generateCustomFields(): array
    {
        $customFields = [];

        if ($this->faker->boolean(40)) {
            $customFields['company_size'] = $this->faker->randomElement(['startup', 'sme', 'enterprise']);
        }

        if ($this->faker->boolean(30)) {
            $customFields['industry'] = $this->faker->randomElement(['technology', 'healthcare', 'finance', 'education', 'retail']);
        }

        if ($this->faker->boolean(25)) {
            $customFields['contract_terms'] = $this->faker->randomElement(['standard', 'custom', 'enterprise']);
        }

        if ($this->faker->boolean(20)) {
            $customFields['payment_terms'] = $this->faker->randomElement(['net_30', 'net_60', 'net_90']);
        }

        return $customFields;
    }

    /**
     * Generate metadata
     */
    private function generateMetadata(string $status, string $billingCycle): array
    {
        return [
            'subscription_source' => $this->faker->randomElement(['web', 'sales', 'partner', 'migration']),
            'sales_rep' => $this->faker->optional(0.4)->name(),
            'partner_code' => $this->faker->optional(0.2)->bothify('PART-####'),
            'contract_id' => $this->faker->optional(0.6)->bothify('CON-####-####'),
            'renewal_notes' => $this->faker->optional(0.3)->sentence(),
            'cancellation_reason' => $status === 'canceled' ? $this->faker->randomElement([
                'too_expensive', 'not_using', 'switched_competitor', 'business_closed', 'other'
            ]) : null,
            'upgrade_path' => $this->faker->optional(0.4)->randomElement([
                'monthly_to_yearly', 'starter_to_professional', 'professional_to_enterprise'
            ]),
            'downgrade_path' => $this->faker->optional(0.3)->randomElement([
                'yearly_to_monthly', 'enterprise_to_professional', 'professional_to_starter'
            ]),
            'special_pricing' => $this->faker->optional(0.2)->randomElement([
                'startup_discount', 'non_profit', 'educational', 'bulk_pricing'
            ]),
            'compliance_requirements' => $this->faker->optional(0.3)->randomElements([
                'gdpr', 'ccpa', 'sox', 'hipaa', 'iso27001'
            ], $this->faker->numberBetween(1, 3)),
            'integration_requirements' => $this->faker->optional(0.4)->randomElements([
                'slack', 'teams', 'zapier', 'webhook', 'api', 'sso'
            ], $this->faker->numberBetween(1, 4)),
            'support_level' => $this->faker->randomElement(['basic', 'standard', 'priority', 'dedicated']),
            'onboarding_status' => $this->faker->randomElement(['not_started', 'in_progress', 'completed', 'skipped']),
            'training_sessions' => $this->faker->optional(0.6)->numberBetween(0, 5),
            'account_manager' => $this->faker->optional(0.3)->name(),
            'technical_contact' => $this->faker->optional(0.4)->name(),
            'billing_contact' => $this->faker->optional(0.4)->name(),
            'emergency_contact' => $this->faker->optional(0.2)->name(),
            'notes' => $this->faker->optional(0.5)->sentences(2, true),
            'tags' => $this->generateSubscriptionTags($status, $billingCycle)
        ];
    }

    /**
     * Generate subscription tags
     */
    private function generateSubscriptionTags(string $status, string $billingCycle): array
    {
        $tags = ['subscription', $status, $billingCycle];

        if ($billingCycle === 'yearly') {
            $tags[] = 'annual';
        }

        if ($status === 'trial') {
            $tags[] = 'trial';
        }

        if ($status === 'active') {
            $tags[] = 'active';
        }

        return array_unique($tags);
    }

    /**
     * Determine payment status based on subscription status
     */
    private function determinePaymentStatus(string $status): string
    {
        return match($status) {
            'active', 'trial' => 'paid',
            'past_due' => 'overdue',
            'canceled' => 'canceled',
            'unpaid' => 'failed',
            'suspended' => 'suspended',
            default => 'unknown'
        };
    }

    /**
     * Indicate that the subscription is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'active',
            'current_period_end' => $this->faker->dateTimeBetween('now', '+1 year'),
            'next_billing_date' => $this->faker->dateTimeBetween('now', '+1 year'),
        ]);
    }

    /**
     * Indicate that the subscription is in trial.
     */
    public function trial(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'trial',
            'trial_ends_at' => $this->faker->dateTimeBetween('now', '+30 days'),
            'current_period_end' => $this->faker->dateTimeBetween('now', '+30 days'),
        ]);
    }

    /**
     * Indicate that the subscription is past due.
     */
    public function pastDue(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'past_due',
            'current_period_end' => $this->faker->dateTimeBetween('-30 days', 'now'),
            'payment_failure_count' => $this->faker->numberBetween(1, 5),
        ]);
    }

    /**
     * Indicate that the subscription is canceled.
     */
    public function canceled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'canceled',
            'canceled_at' => $this->faker->dateTimeBetween('-6 months', 'now'),
            'ended_at' => $this->faker->dateTimeBetween('-6 months', 'now'),
            'next_billing_date' => null,
        ]);
    }

    /**
     * Indicate that the subscription is unpaid.
     */
    public function unpaid(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'unpaid',
            'payment_failure_count' => $this->faker->numberBetween(3, 10),
            'last_payment_failure' => $this->faker->dateTimeBetween('-30 days', 'now'),
        ]);
    }

    /**
     * Indicate that the subscription is suspended.
     */
    public function suspended(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'suspended',
            'current_period_end' => $this->faker->dateTimeBetween('-30 days', 'now'),
            'next_billing_date' => null,
        ]);
    }

    /**
     * Indicate that the subscription is monthly.
     */
    public function monthly(): static
    {
        return $this->state(fn (array $attributes) => [
            'billing_cycle' => 'monthly',
        ]);
    }

    /**
     * Indicate that the subscription is quarterly.
     */
    public function quarterly(): static
    {
        return $this->state(fn (array $attributes) => [
            'billing_cycle' => 'quarterly',
        ]);
    }

    /**
     * Indicate that the subscription is yearly.
     */
    public function yearly(): static
    {
        return $this->state(fn (array $attributes) => [
            'billing_cycle' => 'yearly',
        ]);
    }

    /**
     * Indicate that the subscription has high usage.
     */
    public function highUsage(): static
    {
        return $this->state(fn (array $attributes) => [
            'usage_data' => [
                'agents' => ['used' => 8, 'limit' => 10, 'percentage' => 80],
                'customers' => ['used' => 800, 'limit' => 1000, 'percentage' => 80],
                'api_calls' => ['used' => 8000, 'limit' => 10000, 'percentage' => 80],
                'storage' => ['used' => 8.0, 'limit' => 10, 'percentage' => 80],
                'chat_sessions' => ['used' => 800, 'limit' => 1000, 'percentage' => 80],
                'last_updated' => now()->toISOString()
            ],
        ]);
    }

    /**
     * Indicate that the subscription has overage usage.
     */
    public function overageUsage(): static
    {
        return $this->state(fn (array $attributes) => [
            'usage_data' => [
                'agents' => ['used' => 12, 'limit' => 10, 'percentage' => 120],
                'customers' => ['used' => 1200, 'limit' => 1000, 'percentage' => 120],
                'api_calls' => ['used' => 12000, 'limit' => 10000, 'percentage' => 120],
                'storage' => ['used' => 12.0, 'limit' => 10, 'percentage' => 120],
                'chat_sessions' => ['used' => 1200, 'limit' => 1000, 'percentage' => 120],
                'last_updated' => now()->toISOString()
            ],
            'overage_charges' => [
                'agents' => [
                    'overage_amount' => 2,
                    'overage_rate' => 50.0,
                    'overage_cost' => 100.0,
                    'billing_period' => 'current',
                    'charged' => true
                ]
            ],
        ]);
    }

    /**
     * Indicate that the subscription is newly created.
     */
    public function newlyCreated(): static
    {
        return $this->state(fn (array $attributes) => [
            'start_date' => $this->faker->dateTimeBetween('-30 days', 'now'),
            'current_period_start' => $this->faker->dateTimeBetween('-30 days', 'now'),
            'current_period_end' => $this->faker->dateTimeBetween('now', '+1 month'),
            'usage_data' => [
                'agents' => ['used' => 1, 'limit' => 10, 'percentage' => 10],
                'customers' => ['used' => 50, 'limit' => 1000, 'percentage' => 5],
                'api_calls' => ['used' => 500, 'limit' => 10000, 'percentage' => 5],
                'storage' => ['used' => 1.0, 'limit' => 10, 'percentage' => 10],
                'chat_sessions' => ['used' => 100, 'limit' => 1000, 'percentage' => 10],
                'last_updated' => now()->toISOString()
            ],
        ]);
    }

    /**
     * Indicate that the subscription is expiring soon.
     */
    public function expiringSoon(): static
    {
        return $this->state(fn (array $attributes) => [
            'current_period_end' => $this->faker->dateTimeBetween('now', '+7 days'),
            'next_billing_date' => $this->faker->dateTimeBetween('now', '+7 days'),
        ]);
    }

    /**
     * Indicate that the subscription has payment issues.
     */
    public function paymentIssues(): static
    {
        return $this->state(fn (array $attributes) => [
            'payment_failure_count' => $this->faker->numberBetween(1, 5),
            'last_payment_failure' => $this->faker->dateTimeBetween('-30 days', 'now'),
            'payment_status' => 'failed',
        ]);
    }

    /**
     * Indicate that the subscription is for enterprise.
     */
    public function enterprise(): static
    {
        return $this->state(fn (array $attributes) => [
            'metadata' => array_merge($attributes['metadata'] ?? [], [
                'tags' => array_merge($attributes['metadata']['tags'] ?? [], ['enterprise']),
                'contract_terms' => 'enterprise',
                'support_level' => 'dedicated',
                'account_manager' => $this->faker->name(),
            ]),
        ]);
    }

    /**
     * Indicate that the subscription is for startups.
     */
    public function startup(): static
    {
        return $this->state(fn (array $attributes) => [
            'metadata' => array_merge($attributes['metadata'] ?? [], [
                'tags' => array_merge($attributes['metadata']['tags'] ?? [], ['startup']),
                'special_pricing' => 'startup_discount',
                'support_level' => 'standard',
            ]),
        ]);
    }
}
