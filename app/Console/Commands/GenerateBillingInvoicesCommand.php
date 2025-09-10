<?php

namespace App\Console\Commands;

use App\Jobs\GenerateBillingInvoices;
use Illuminate\Console\Command;

class GenerateBillingInvoicesCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'billing:generate-invoices
                            {--organization= : Generate invoices for specific organization ID}
                            {--subscription= : Generate invoices for specific subscription ID}
                            {--cycle=monthly : Billing cycle (monthly, yearly, weekly, daily)}
                            {--dry-run : Show what would be generated without actually creating invoices}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate billing invoices for active subscriptions';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $organizationId = $this->option('organization');
        $subscriptionId = $this->option('subscription');
        $billingCycle = $this->option('cycle');
        $dryRun = $this->option('dry-run');

        $this->info('Starting billing invoice generation...');
        $this->line("Billing cycle: {$billingCycle}");

        if ($organizationId) {
            $this->line("Organization ID: {$organizationId}");
        }

        if ($subscriptionId) {
            $this->line("Subscription ID: {$subscriptionId}");
        }

        if ($dryRun) {
            $this->warn('DRY RUN MODE - No invoices will be created');
        }

        try {
            if ($dryRun) {
                $this->performDryRun($organizationId, $subscriptionId, $billingCycle);
            } else {
                $this->generateInvoices($organizationId, $subscriptionId, $billingCycle);
            }

            $this->info('Billing invoice generation completed successfully!');
            return Command::SUCCESS;

        } catch (\Exception $e) {
            $this->error('Failed to generate billing invoices: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }

    /**
     * Perform dry run to show what would be generated.
     */
    protected function performDryRun(?int $organizationId, ?int $subscriptionId, string $billingCycle): void
    {
        $this->info('Performing dry run...');

        // This would normally query the database to show what would be generated
        // For now, we'll just show the parameters
        $this->table(
            ['Parameter', 'Value'],
            [
                ['Organization ID', $organizationId ?? 'All organizations'],
                ['Subscription ID', $subscriptionId ?? 'All subscriptions'],
                ['Billing Cycle', $billingCycle],
                ['Mode', 'Dry Run'],
            ]
        );

        $this->info('Dry run completed. Use without --dry-run to actually generate invoices.');
    }

    /**
     * Generate invoices by dispatching the job.
     */
    protected function generateInvoices(?int $organizationId, ?int $subscriptionId, string $billingCycle): void
    {
        $this->info('Dispatching invoice generation job...');

        GenerateBillingInvoices::dispatch($organizationId, $subscriptionId, $billingCycle);

        $this->info('Invoice generation job dispatched successfully!');
        $this->line('Check the queue worker logs for progress updates.');
    }
}
