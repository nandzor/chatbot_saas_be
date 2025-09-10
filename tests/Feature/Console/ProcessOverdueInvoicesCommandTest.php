<?php

namespace Tests\Feature\Console;

use App\Models\BillingInvoice;
use App\Models\Organization;
use App\Models\Subscription;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Tests\TestCase;

class ProcessOverdueInvoicesCommandTest extends TestCase
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
        ]);
    }

    /** @test */
    public function it_can_process_overdue_invoices()
    {
        $overdueInvoice = BillingInvoice::factory()->create([
            'organization_id' => $this->organization->id,
            'subscription_id' => $this->subscription->id,
            'status' => 'pending',
            'due_date' => now()->subDays(10),
            'total_amount' => 500000.00,
            'currency' => 'IDR',
        ]);

        $this->artisan('billing:process-overdue', [
            '--dry-run' => false,
        ])
        ->expectsOutput('Processing overdue invoices...')
        ->expectsOutput('Overdue invoices processed successfully!')
        ->assertExitCode(0);

        $overdueInvoice->refresh();
        $this->assertEquals('overdue', $overdueInvoice->status);
    }

    /** @test */
    public function it_can_process_overdue_invoices_for_specific_organization()
    {
        $overdueInvoice = BillingInvoice::factory()->create([
            'organization_id' => $this->organization->id,
            'subscription_id' => $this->subscription->id,
            'status' => 'pending',
            'due_date' => now()->subDays(5),
            'total_amount' => 750000.00,
            'currency' => 'IDR',
        ]);

        $this->artisan('billing:process-overdue', [
            '--organization-id' => $this->organization->id,
            '--dry-run' => false,
        ])
        ->expectsOutput('Processing overdue invoices...')
        ->expectsOutput('Overdue invoices processed successfully!')
        ->assertExitCode(0);

        $overdueInvoice->refresh();
        $this->assertEquals('overdue', $overdueInvoice->status);
    }

    /** @test */
    public function it_can_process_overdue_invoices_with_days_threshold()
    {
        $overdueInvoice = BillingInvoice::factory()->create([
            'organization_id' => $this->organization->id,
            'subscription_id' => $this->subscription->id,
            'status' => 'pending',
            'due_date' => now()->subDays(15),
            'total_amount' => 300000.00,
            'currency' => 'IDR',
        ]);

        $this->artisan('billing:process-overdue', [
            '--days' => 10,
            '--dry-run' => false,
        ])
        ->expectsOutput('Processing overdue invoices...')
        ->expectsOutput('Overdue invoices processed successfully!')
        ->assertExitCode(0);

        $overdueInvoice->refresh();
        $this->assertEquals('overdue', $overdueInvoice->status);
    }

    /** @test */
    public function it_can_process_overdue_invoices_with_amount_threshold()
    {
        $overdueInvoice = BillingInvoice::factory()->create([
            'organization_id' => $this->organization->id,
            'subscription_id' => $this->subscription->id,
            'status' => 'pending',
            'due_date' => now()->subDays(8),
            'total_amount' => 1000000.00,
            'currency' => 'IDR',
        ]);

        $this->artisan('billing:process-overdue', [
            '--min-amount' => 500000,
            '--dry-run' => false,
        ])
        ->expectsOutput('Processing overdue invoices...')
        ->expectsOutput('Overdue invoices processed successfully!')
        ->assertExitCode(0);

        $overdueInvoice->refresh();
        $this->assertEquals('overdue', $overdueInvoice->status);
    }

    /** @test */
    public function it_can_run_dry_run_mode()
    {
        $overdueInvoice = BillingInvoice::factory()->create([
            'organization_id' => $this->organization->id,
            'subscription_id' => $this->subscription->id,
            'status' => 'pending',
            'due_date' => now()->subDays(10),
            'total_amount' => 400000.00,
            'currency' => 'IDR',
        ]);

        $this->artisan('billing:process-overdue', [
            '--dry-run' => true,
        ])
        ->expectsOutput('Processing overdue invoices...')
        ->expectsOutput('DRY RUN MODE - No invoices will be updated')
        ->expectsOutput('Overdue invoices processed successfully!')
        ->assertExitCode(0);

        // Should not update invoice status in dry run mode
        $overdueInvoice->refresh();
        $this->assertEquals('pending', $overdueInvoice->status);
    }

    /** @test */
    public function it_skips_invoices_that_are_not_overdue()
    {
        $pendingInvoice = BillingInvoice::factory()->create([
            'organization_id' => $this->organization->id,
            'subscription_id' => $this->subscription->id,
            'status' => 'pending',
            'due_date' => now()->addDays(5), // Future due date
            'total_amount' => 600000.00,
            'currency' => 'IDR',
        ]);

        $this->artisan('billing:process-overdue', [
            '--dry-run' => false,
        ])
        ->expectsOutput('Processing overdue invoices...')
        ->expectsOutput('Overdue invoices processed successfully!')
        ->assertExitCode(0);

        // Should not update invoice status
        $pendingInvoice->refresh();
        $this->assertEquals('pending', $pendingInvoice->status);
    }

    /** @test */
    public function it_skips_invoices_that_are_already_overdue()
    {
        $alreadyOverdueInvoice = BillingInvoice::factory()->create([
            'organization_id' => $this->organization->id,
            'subscription_id' => $this->subscription->id,
            'status' => 'overdue',
            'due_date' => now()->subDays(10),
            'total_amount' => 800000.00,
            'currency' => 'IDR',
        ]);

        $this->artisan('billing:process-overdue', [
            '--dry-run' => false,
        ])
        ->expectsOutput('Processing overdue invoices...')
        ->expectsOutput('Overdue invoices processed successfully!')
        ->assertExitCode(0);

        // Should not change status
        $alreadyOverdueInvoice->refresh();
        $this->assertEquals('overdue', $alreadyOverdueInvoice->status);
    }

    /** @test */
    public function it_skips_invoices_that_are_paid()
    {
        $paidInvoice = BillingInvoice::factory()->create([
            'organization_id' => $this->organization->id,
            'subscription_id' => $this->subscription->id,
            'status' => 'paid',
            'due_date' => now()->subDays(10),
            'total_amount' => 900000.00,
            'currency' => 'IDR',
        ]);

        $this->artisan('billing:process-overdue', [
            '--dry-run' => false,
        ])
        ->expectsOutput('Processing overdue invoices...')
        ->expectsOutput('Overdue invoices processed successfully!')
        ->assertExitCode(0);

        // Should not change status
        $paidInvoice->refresh();
        $this->assertEquals('paid', $paidInvoice->status);
    }

    /** @test */
    public function it_skips_invoices_that_are_cancelled()
    {
        $cancelledInvoice = BillingInvoice::factory()->create([
            'organization_id' => $this->organization->id,
            'subscription_id' => $this->subscription->id,
            'status' => 'cancelled',
            'due_date' => now()->subDays(10),
            'total_amount' => 1100000.00,
            'currency' => 'IDR',
        ]);

        $this->artisan('billing:process-overdue', [
            '--dry-run' => false,
        ])
        ->expectsOutput('Processing overdue invoices...')
        ->expectsOutput('Overdue invoices processed successfully!')
        ->assertExitCode(0);

        // Should not change status
        $cancelledInvoice->refresh();
        $this->assertEquals('cancelled', $cancelledInvoice->status);
    }

    /** @test */
    public function it_handles_nonexistent_organization()
    {
        $this->artisan('billing:process-overdue', [
            '--organization-id' => 99999,
            '--dry-run' => false,
        ])
        ->expectsOutput('Processing overdue invoices...')
        ->expectsOutput('Overdue invoices processed successfully!')
        ->assertExitCode(0);

        // Should not process any invoices
        $this->assertDatabaseCount('billing_invoices', 0);
    }

    /** @test */
    public function it_processes_multiple_overdue_invoices()
    {
        $overdueInvoice1 = BillingInvoice::factory()->create([
            'organization_id' => $this->organization->id,
            'subscription_id' => $this->subscription->id,
            'status' => 'pending',
            'due_date' => now()->subDays(5),
            'total_amount' => 200000.00,
            'currency' => 'IDR',
        ]);

        $overdueInvoice2 = BillingInvoice::factory()->create([
            'organization_id' => $this->organization->id,
            'subscription_id' => $this->subscription->id,
            'status' => 'pending',
            'due_date' => now()->subDays(8),
            'total_amount' => 350000.00,
            'currency' => 'IDR',
        ]);

        $this->artisan('billing:process-overdue', [
            '--dry-run' => false,
        ])
        ->expectsOutput('Processing overdue invoices...')
        ->expectsOutput('Overdue invoices processed successfully!')
        ->assertExitCode(0);

        $overdueInvoice1->refresh();
        $overdueInvoice2->refresh();

        $this->assertEquals('overdue', $overdueInvoice1->status);
        $this->assertEquals('overdue', $overdueInvoice2->status);
    }

    /** @test */
    public function it_handles_invalid_days_threshold()
    {
        $overdueInvoice = BillingInvoice::factory()->create([
            'organization_id' => $this->organization->id,
            'subscription_id' => $this->subscription->id,
            'status' => 'pending',
            'due_date' => now()->subDays(10),
            'total_amount' => 500000.00,
            'currency' => 'IDR',
        ]);

        $this->artisan('billing:process-overdue', [
            '--days' => -5, // Invalid negative value
            '--dry-run' => false,
        ])
        ->expectsOutput('Processing overdue invoices...')
        ->expectsOutput('Overdue invoices processed successfully!')
        ->assertExitCode(0);

        // Should still process overdue invoices
        $overdueInvoice->refresh();
        $this->assertEquals('overdue', $overdueInvoice->status);
    }

    /** @test */
    public function it_handles_invalid_amount_threshold()
    {
        $overdueInvoice = BillingInvoice::factory()->create([
            'organization_id' => $this->organization->id,
            'subscription_id' => $this->subscription->id,
            'status' => 'pending',
            'due_date' => now()->subDays(10),
            'total_amount' => 500000.00,
            'currency' => 'IDR',
        ]);

        $this->artisan('billing:process-overdue', [
            '--min-amount' => -1000, // Invalid negative value
            '--dry-run' => false,
        ])
        ->expectsOutput('Processing overdue invoices...')
        ->expectsOutput('Overdue invoices processed successfully!')
        ->assertExitCode(0);

        // Should still process overdue invoices
        $overdueInvoice->refresh();
        $this->assertEquals('overdue', $overdueInvoice->status);
    }
}
