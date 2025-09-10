<?php

namespace Tests\Feature\Console;

use App\Models\BillingInvoice;
use App\Models\Organization;
use App\Models\Subscription;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Tests\TestCase;

class GenerateBillingInvoicesCommandTest extends TestCase
{
    use RefreshDatabase;

    protected Organization $organization;
    protected Subscription $subscription;

    protected function setUp(): void
    {
        parent::setUp();

        $this->organization = Organization::factory()->create();
        $this->subscription = Subscription::factory()->create([
            'organization_id' => $this->organization->id,
            'billing_cycle' => 'monthly',
            'unit_amount' => 500000.00,
            'currency' => 'IDR',
            'status' => 'active',
            'current_period_start' => now()->subMonth(),
            'current_period_end' => now()->subDays(7),
        ]);
    }

    /** @test */
    public function it_can_generate_invoices_for_monthly_subscriptions()
    {
        $this->artisan('billing:generate-invoices', [
            '--billing-cycle' => 'monthly',
            '--dry-run' => false,
        ])
        ->expectsOutput('Generating billing invoices...')
        ->expectsOutput('Billing invoices generated successfully!')
        ->assertExitCode(0);

        $this->assertDatabaseHas('billing_invoices', [
            'organization_id' => $this->organization->id,
            'subscription_id' => $this->subscription->id,
            'billing_cycle' => 'monthly',
            'total_amount' => 500000.00,
            'currency' => 'IDR',
        ]);
    }

    /** @test */
    public function it_can_generate_invoices_for_yearly_subscriptions()
    {
        $yearlySubscription = Subscription::factory()->create([
            'organization_id' => $this->organization->id,
            'billing_cycle' => 'yearly',
            'unit_amount' => 6000000.00,
            'currency' => 'IDR',
            'status' => 'active',
            'current_period_start' => now()->subYear(),
            'current_period_end' => now()->subDays(7),
        ]);

        $this->artisan('billing:generate-invoices', [
            '--billing-cycle' => 'yearly',
            '--dry-run' => false,
        ])
        ->expectsOutput('Generating billing invoices...')
        ->expectsOutput('Billing invoices generated successfully!')
        ->assertExitCode(0);

        $this->assertDatabaseHas('billing_invoices', [
            'organization_id' => $this->organization->id,
            'subscription_id' => $yearlySubscription->id,
            'billing_cycle' => 'yearly',
            'total_amount' => 6000000.00,
            'currency' => 'IDR',
        ]);
    }

    /** @test */
    public function it_can_generate_invoices_for_weekly_subscriptions()
    {
        $weeklySubscription = Subscription::factory()->create([
            'organization_id' => $this->organization->id,
            'billing_cycle' => 'weekly',
            'unit_amount' => 125000.00,
            'currency' => 'IDR',
            'status' => 'active',
            'current_period_start' => now()->subWeek(),
            'current_period_end' => now()->subDays(2),
        ]);

        $this->artisan('billing:generate-invoices', [
            '--billing-cycle' => 'weekly',
            '--dry-run' => false,
        ])
        ->expectsOutput('Generating billing invoices...')
        ->expectsOutput('Billing invoices generated successfully!')
        ->assertExitCode(0);

        $this->assertDatabaseHas('billing_invoices', [
            'organization_id' => $this->organization->id,
            'subscription_id' => $weeklySubscription->id,
            'billing_cycle' => 'weekly',
            'total_amount' => 125000.00,
            'currency' => 'IDR',
        ]);
    }

    /** @test */
    public function it_can_generate_invoices_for_daily_subscriptions()
    {
        $dailySubscription = Subscription::factory()->create([
            'organization_id' => $this->organization->id,
            'billing_cycle' => 'daily',
            'unit_amount' => 25000.00,
            'currency' => 'IDR',
            'status' => 'active',
            'current_period_start' => now()->subDay(),
            'current_period_end' => now()->subHours(12),
        ]);

        $this->artisan('billing:generate-invoices', [
            '--billing-cycle' => 'daily',
            '--dry-run' => false,
        ])
        ->expectsOutput('Generating billing invoices...')
        ->expectsOutput('Billing invoices generated successfully!')
        ->assertExitCode(0);

        $this->assertDatabaseHas('billing_invoices', [
            'organization_id' => $this->organization->id,
            'subscription_id' => $dailySubscription->id,
            'billing_cycle' => 'daily',
            'total_amount' => 25000.00,
            'currency' => 'IDR',
        ]);
    }

    /** @test */
    public function it_can_generate_invoices_for_specific_organization()
    {
        $this->artisan('billing:generate-invoices', [
            '--organization-id' => $this->organization->id,
            '--billing-cycle' => 'monthly',
            '--dry-run' => false,
        ])
        ->expectsOutput('Generating billing invoices...')
        ->expectsOutput('Billing invoices generated successfully!')
        ->assertExitCode(0);

        $this->assertDatabaseHas('billing_invoices', [
            'organization_id' => $this->organization->id,
            'subscription_id' => $this->subscription->id,
        ]);
    }

    /** @test */
    public function it_can_generate_invoices_for_specific_subscription()
    {
        $this->artisan('billing:generate-invoices', [
            '--subscription-id' => $this->subscription->id,
            '--billing-cycle' => 'monthly',
            '--dry-run' => false,
        ])
        ->expectsOutput('Generating billing invoices...')
        ->expectsOutput('Billing invoices generated successfully!')
        ->assertExitCode(0);

        $this->assertDatabaseHas('billing_invoices', [
            'organization_id' => $this->organization->id,
            'subscription_id' => $this->subscription->id,
        ]);
    }

    /** @test */
    public function it_can_run_dry_run_mode()
    {
        $this->artisan('billing:generate-invoices', [
            '--billing-cycle' => 'monthly',
            '--dry-run' => true,
        ])
        ->expectsOutput('Generating billing invoices...')
        ->expectsOutput('DRY RUN MODE - No invoices will be created')
        ->expectsOutput('Billing invoices generated successfully!')
        ->assertExitCode(0);

        // Should not create any invoices in dry run mode
        $this->assertDatabaseMissing('billing_invoices', [
            'organization_id' => $this->organization->id,
            'subscription_id' => $this->subscription->id,
        ]);
    }

    /** @test */
    public function it_skips_inactive_subscriptions()
    {
        $inactiveSubscription = Subscription::factory()->create([
            'organization_id' => $this->organization->id,
            'billing_cycle' => 'monthly',
            'unit_amount' => 300000.00,
            'currency' => 'IDR',
            'status' => 'cancelled',
            'current_period_start' => now()->subMonth(),
            'current_period_end' => now()->subDays(7),
        ]);

        $this->artisan('billing:generate-invoices', [
            '--billing-cycle' => 'monthly',
            '--dry-run' => false,
        ])
        ->expectsOutput('Generating billing invoices...')
        ->expectsOutput('Billing invoices generated successfully!')
        ->assertExitCode(0);

        // Should only create invoice for active subscription
        $this->assertDatabaseHas('billing_invoices', [
            'organization_id' => $this->organization->id,
            'subscription_id' => $this->subscription->id,
        ]);

        $this->assertDatabaseMissing('billing_invoices', [
            'organization_id' => $this->organization->id,
            'subscription_id' => $inactiveSubscription->id,
        ]);
    }

    /** @test */
    public function it_skips_subscriptions_with_future_period_end()
    {
        $futureSubscription = Subscription::factory()->create([
            'organization_id' => $this->organization->id,
            'billing_cycle' => 'monthly',
            'unit_amount' => 400000.00,
            'currency' => 'IDR',
            'status' => 'active',
            'current_period_start' => now(),
            'current_period_end' => now()->addDays(20), // Future end date
        ]);

        $this->artisan('billing:generate-invoices', [
            '--billing-cycle' => 'monthly',
            '--dry-run' => false,
        ])
        ->expectsOutput('Generating billing invoices...')
        ->expectsOutput('Billing invoices generated successfully!')
        ->assertExitCode(0);

        // Should only create invoice for subscription with past period end
        $this->assertDatabaseHas('billing_invoices', [
            'organization_id' => $this->organization->id,
            'subscription_id' => $this->subscription->id,
        ]);

        $this->assertDatabaseMissing('billing_invoices', [
            'organization_id' => $this->organization->id,
            'subscription_id' => $futureSubscription->id,
        ]);
    }

    /** @test */
    public function it_skips_subscriptions_with_existing_invoices()
    {
        // Create existing invoice for the subscription
        BillingInvoice::factory()->create([
            'organization_id' => $this->organization->id,
            'subscription_id' => $this->subscription->id,
            'period_start' => $this->subscription->current_period_start,
            'period_end' => $this->subscription->current_period_end,
            'currency' => 'IDR',
        ]);

        $this->artisan('billing:generate-invoices', [
            '--billing-cycle' => 'monthly',
            '--dry-run' => false,
        ])
        ->expectsOutput('Generating billing invoices...')
        ->expectsOutput('Billing invoices generated successfully!')
        ->assertExitCode(0);

        // Should not create duplicate invoice
        $invoiceCount = BillingInvoice::where('subscription_id', $this->subscription->id)->count();
        $this->assertEquals(1, $invoiceCount);
    }

    /** @test */
    public function it_handles_nonexistent_organization()
    {
        $this->artisan('billing:generate-invoices', [
            '--organization-id' => 99999,
            '--billing-cycle' => 'monthly',
            '--dry-run' => false,
        ])
        ->expectsOutput('Generating billing invoices...')
        ->expectsOutput('Billing invoices generated successfully!')
        ->assertExitCode(0);

        // Should not create any invoices
        $this->assertDatabaseCount('billing_invoices', 0);
    }

    /** @test */
    public function it_handles_nonexistent_subscription()
    {
        $this->artisan('billing:generate-invoices', [
            '--subscription-id' => 99999,
            '--billing-cycle' => 'monthly',
            '--dry-run' => false,
        ])
        ->expectsOutput('Generating billing invoices...')
        ->expectsOutput('Billing invoices generated successfully!')
        ->assertExitCode(0);

        // Should not create any invoices
        $this->assertDatabaseCount('billing_invoices', 0);
    }

    /** @test */
    public function it_handles_invalid_billing_cycle()
    {
        $this->artisan('billing:generate-invoices', [
            '--billing-cycle' => 'invalid',
            '--dry-run' => false,
        ])
        ->expectsOutput('Generating billing invoices...')
        ->expectsOutput('Billing invoices generated successfully!')
        ->assertExitCode(0);

        // Should not create any invoices
        $this->assertDatabaseCount('billing_invoices', 0);
    }
}
