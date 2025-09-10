<?php

namespace Database\Seeders;

use App\Models\BillingInvoice;
use App\Models\Organization;
use App\Models\Subscription;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BillingInvoiceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::transaction(function () {
            $this->createBillingInvoices();
        });
    }

    /**
     * Create billing invoices for existing organizations and subscriptions.
     */
    private function createBillingInvoices(): void
    {
        $organizations = Organization::with('subscriptions')->get();

        if ($organizations->isEmpty()) {
            $this->command->warn('No organizations found. Please run OrganizationSeeder first.');
            return;
        }

        $invoiceCount = 0;

        foreach ($organizations as $organization) {
            // Create invoices for each subscription
            foreach ($organization->subscriptions as $subscription) {
                $invoices = $this->createSubscriptionInvoices($subscription);
                $invoiceCount += $invoices;
            }

            // Create some standalone invoices for the organization
            $standaloneInvoices = $this->createStandaloneInvoices($organization);
            $invoiceCount += $standaloneInvoices;
        }

        $this->command->info("Created {$invoiceCount} billing invoices.");
    }

    /**
     * Create invoices for a specific subscription.
     */
    private function createSubscriptionInvoices(Subscription $subscription): int
    {
        $invoiceCount = 0;
        $billingCycle = $subscription->billing_cycle;
        $startDate = $subscription->created_at;
        $endDate = now();

        // Create historical invoices based on billing cycle
        if ($billingCycle === 'monthly') {
            $months = $startDate->diffInMonths($endDate);
            $invoiceCount = min($months, 12); // Max 12 months of history
        } else {
            $years = $startDate->diffInYears($endDate);
            $invoiceCount = min($years, 3); // Max 3 years of history
        }

        for ($i = 0; $i < $invoiceCount; $i++) {
            $invoiceDate = $billingCycle === 'monthly'
                ? $startDate->copy()->addMonths($i)
                : $startDate->copy()->addYears($i);

            $dueDate = $invoiceDate->copy()->addDays(30);
            $periodStart = $invoiceDate;
            $periodEnd = $billingCycle === 'monthly'
                ? $invoiceDate->copy()->addMonth()
                : $invoiceDate->copy()->addYear();

            // Determine status based on date
            $status = $this->determineInvoiceStatus($invoiceDate, $dueDate);

            BillingInvoice::factory()->create([
                'organization_id' => $subscription->organization_id,
                'subscription_id' => $subscription->id,
                'invoice_date' => $invoiceDate,
                'due_date' => $dueDate,
                'period_start' => $periodStart,
                'period_end' => $periodEnd,
                'billing_cycle' => $billingCycle,
                'status' => $status,
                'paid_date' => $status === 'paid' ? $this->getPaidDate($invoiceDate, $dueDate) : null,
                'total_amount' => $subscription->unit_amount,
                'currency' => $subscription->currency,
                'customer_name' => $subscription->organization->name,
                'customer_email' => $subscription->organization->email,
            ]);
        }

        return $invoiceCount;
    }

    /**
     * Create standalone invoices for an organization.
     */
    private function createStandaloneInvoices(Organization $organization): int
    {
        $invoiceCount = rand(1, 3); // 1-3 standalone invoices

        for ($i = 0; $i < $invoiceCount; $i++) {
            $invoiceDate = now()->subDays(rand(1, 90));
            $dueDate = $invoiceDate->copy()->addDays(30);

            BillingInvoice::factory()->create([
                'organization_id' => $organization->id,
                'subscription_id' => null,
                'invoice_date' => $invoiceDate,
                'due_date' => $dueDate,
                'period_start' => $invoiceDate,
                'period_end' => $invoiceDate->copy()->addDays(30),
                'billing_cycle' => 'monthly',
                'status' => $this->determineInvoiceStatus($invoiceDate, $dueDate),
                'paid_date' => $this->getPaidDate($invoiceDate, $dueDate),
                'customer_name' => $organization->name,
                'customer_email' => $organization->email,
            ]);
        }

        return $invoiceCount;
    }

    /**
     * Determine invoice status based on dates.
     */
    private function determineInvoiceStatus($invoiceDate, $dueDate): string
    {
        $now = now();

        if ($now->isAfter($dueDate)) {
            // Past due date
            return fake()->randomElement(['paid', 'overdue', 'overdue']);
        } elseif ($now->isAfter($invoiceDate)) {
            // Between invoice date and due date
            return fake()->randomElement(['paid', 'pending', 'pending']);
        } else {
            // Future invoice
            return fake()->randomElement(['draft', 'pending']);
        }
    }

    /**
     * Get paid date if invoice is paid.
     */
    private function getPaidDate($invoiceDate, $dueDate): ?\DateTime
    {
        if (fake()->boolean(70)) { // 70% chance of being paid
            return fake()->dateTimeBetween($invoiceDate, $dueDate);
        }

        return null;
    }
}
