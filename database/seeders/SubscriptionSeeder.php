<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Subscription;
use App\Models\Organization;
use App\Models\SubscriptionPlan;
use Carbon\Carbon;

class SubscriptionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get subscription plans
        $trialPlan = SubscriptionPlan::where('name', 'trial')->first();
        $starterPlan = SubscriptionPlan::where('name', 'starter')->first();
        $professionalPlan = SubscriptionPlan::where('name', 'professional')->first();
        $enterprisePlan = SubscriptionPlan::where('name', 'enterprise')->first();
        $customPlan = SubscriptionPlan::where('name', 'custom')->first();

        // Get organizations
        $organizations = Organization::all();

        if ($organizations->isEmpty()) {
            $this->command->warn('No organizations found. Please run OrganizationSeeder first.');
            return;
        }

        $subscriptions = [];

        foreach ($organizations as $index => $organization) {
            // Determine subscription plan based on organization
            $plan = $this->getPlanForOrganization($organization, $index, [
                'trial' => $trialPlan,
                'starter' => $starterPlan,
                'professional' => $professionalPlan,
                'enterprise' => $enterprisePlan,
                'custom' => $customPlan,
            ]);

            if (!$plan) {
                continue;
            }

            // Determine subscription status and dates
            $status = $this->getSubscriptionStatus($index);
            $dates = $this->getSubscriptionDates($status, $plan);

            $subscription = [
                'organization_id' => $organization->id,
                'plan_id' => $plan->id,
                'status' => $status,
                'billing_cycle' => $this->getBillingCycle($plan, $index),
                'current_period_start' => $dates['current_period_start'],
                'current_period_end' => $dates['current_period_end'],
                'trial_start' => $dates['trial_start'],
                'trial_end' => $dates['trial_end'],
                'unit_amount' => $this->getUnitAmount($plan, $index),
                'currency' => $plan->currency,
                'discount_amount' => $this->getDiscountAmount($index),
                'tax_amount' => $this->getTaxAmount($plan, $index),
                'payment_method_id' => null, // Will be set when payment method is created
                'last_payment_date' => $dates['last_payment_date'],
                'next_payment_date' => $dates['next_payment_date'],
                'cancel_at_period_end' => $status === 'cancelled' ? true : false,
                'canceled_at' => $status === 'cancelled' ? now()->subDays(rand(1, 30)) : null,
                'cancellation_reason' => $status === 'cancelled' ? $this->getCancellationReason() : null,
                'metadata' => $this->getSubscriptionMetadata($organization, $plan),
            ];

            $subscriptions[] = $subscription;
        }

        // Create subscriptions
        foreach ($subscriptions as $subscriptionData) {
            Subscription::updateOrCreate(
                [
                    'organization_id' => $subscriptionData['organization_id'],
                ],
                $subscriptionData
            );
        }

        $this->command->info('Subscriptions seeded successfully!');
        $this->command->info('Created ' . count($subscriptions) . ' subscriptions.');
    }

    /**
     * Get subscription plan for organization based on index
     */
    private function getPlanForOrganization($organization, $index, $plans): ?SubscriptionPlan
    {
        // Distribute organizations across different plans
        $planDistribution = [
            'trial' => 2,      // 2 organizations on trial
            'starter' => 3,    // 3 organizations on starter
            'professional' => 4, // 4 organizations on professional
            'enterprise' => 2,   // 2 organizations on enterprise
            'custom' => 1,       // 1 organization on custom
        ];

        $currentIndex = 0;
        foreach ($planDistribution as $planName => $count) {
            if ($index >= $currentIndex && $index < $currentIndex + $count) {
                return $plans[$planName];
            }
            $currentIndex += $count;
        }

        // Default to professional plan
        return $plans['professional'];
    }

    /**
     * Get subscription status based on index
     */
    private function getSubscriptionStatus($index): string
    {
        $statuses = ['success', 'success', 'success', 'pending', 'success', 'cancelled', 'success', 'success', 'failed', 'success'];
        return $statuses[$index % count($statuses)];
    }

    /**
     * Get subscription dates based on status and plan
     */
    private function getSubscriptionDates($status, $plan): array
    {
        $now = now();
        $trialDays = $plan->trial_days ?? 0;

        switch ($status) {
            case 'pending':
                return [
                    'current_period_start' => $now->copy()->subDays(rand(1, $trialDays - 1)),
                    'current_period_end' => $now->copy()->addDays($trialDays - rand(1, $trialDays - 1)),
                    'trial_start' => $now->copy()->subDays($trialDays),
                    'trial_end' => $now->copy()->addDays($trialDays - rand(1, $trialDays - 1)),
                    'last_payment_date' => null,
                    'next_payment_date' => $now->copy()->addDays($trialDays - rand(1, $trialDays - 1)),
                ];

            case 'cancelled':
                $cancelledAt = $now->copy()->subDays(rand(1, 30));
                return [
                    'current_period_start' => $cancelledAt->copy()->subMonths(1),
                    'current_period_end' => $cancelledAt,
                    'trial_start' => null,
                    'trial_end' => null,
                    'last_payment_date' => $cancelledAt->copy()->subMonths(1),
                    'next_payment_date' => null,
                ];

            case 'failed':
                return [
                    'current_period_start' => $now->copy()->subMonths(1),
                    'current_period_end' => $now->copy()->subDays(rand(1, 15)),
                    'trial_start' => null,
                    'trial_end' => null,
                    'last_payment_date' => $now->copy()->subMonths(2),
                    'next_payment_date' => $now->copy()->subDays(rand(1, 15)),
                ];

            default: // success
                return [
                    'current_period_start' => $now->copy()->subDays(rand(1, 30)),
                    'current_period_end' => $now->copy()->addDays(rand(1, 30)),
                    'trial_start' => null,
                    'trial_end' => null,
                    'last_payment_date' => $now->copy()->subDays(rand(1, 30)),
                    'next_payment_date' => $now->copy()->addDays(rand(1, 30)),
                ];
        }
    }

    /**
     * Get billing cycle based on plan and index
     */
    private function getBillingCycle($plan, $index): string
    {
        $cycles = ['monthly', 'quarterly', 'yearly'];
        return $cycles[$index % count($cycles)];
    }

    /**
     * Get unit amount based on plan and billing cycle
     */
    private function getUnitAmount($plan, $index): float
    {
        $billingCycle = $this->getBillingCycle($plan, $index);

        switch ($billingCycle) {
            case 'monthly':
                return $plan->price_monthly;
            case 'quarterly':
                return $plan->price_quarterly;
            case 'yearly':
                return $plan->price_yearly;
            default:
                return $plan->price_monthly;
        }
    }

    /**
     * Get discount amount (some subscriptions have discounts)
     */
    private function getDiscountAmount($index): float
    {
        // 30% chance of having a discount
        if (rand(1, 100) <= 30) {
            return rand(100000, 500000); // Random discount between 100k-500k IDR
        }
        return 0;
    }

    /**
     * Get tax amount (11% VAT in Indonesia)
     */
    private function getTaxAmount($plan, $index): float
    {
        $unitAmount = $this->getUnitAmount($plan, $index);
        $discountAmount = $this->getDiscountAmount($index);
        $taxableAmount = $unitAmount - $discountAmount;
        return $taxableAmount * 0.11; // 11% VAT
    }

    /**
     * Get cancellation reason
     */
    private function getCancellationReason(): string
    {
        $reasons = [
            'Switching to competitor',
            'Budget constraints',
            'No longer needed',
            'Found better solution',
            'Company restructuring',
            'Trial period ended',
        ];
        return $reasons[array_rand($reasons)];
    }

    /**
     * Get subscription metadata
     */
    private function getSubscriptionMetadata($organization, $plan): array
    {
        return [
            'source' => 'seeder',
            'organization_name' => $organization->name,
            'plan_name' => $plan->name,
            'plan_tier' => $plan->tier,
            'seeded_at' => now()->toISOString(),
            'notes' => 'Generated by SubscriptionSeeder',
        ];
    }
}
