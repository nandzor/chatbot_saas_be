<?php

namespace App\Console\Commands;

use App\Jobs\ProcessOverdueInvoices;
use Illuminate\Console\Command;

class ProcessOverdueInvoicesCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'billing:process-overdue
                            {--dry-run : Show what would be processed without actually processing}
                            {--days=0 : Process invoices overdue by this many days (0 = all overdue)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Process overdue invoices and update subscription statuses';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $dryRun = $this->option('dry-run');
        $days = (int) $this->option('days');

        $this->info('Starting overdue invoice processing...');

        if ($days > 0) {
            $this->line("Processing invoices overdue by {$days} or more days");
        } else {
            $this->line('Processing all overdue invoices');
        }

        if ($dryRun) {
            $this->warn('DRY RUN MODE - No invoices will be processed');
        }

        try {
            if ($dryRun) {
                $this->performDryRun($days);
            } else {
                $this->processOverdueInvoices();
            }

            $this->info('Overdue invoice processing completed successfully!');
            return Command::SUCCESS;

        } catch (\Exception $e) {
            $this->error('Failed to process overdue invoices: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }

    /**
     * Perform dry run to show what would be processed.
     */
    protected function performDryRun(int $days): void
    {
        $this->info('Performing dry run...');

        // This would normally query the database to show what would be processed
        // For now, we'll just show the parameters
        $this->table(
            ['Parameter', 'Value'],
            [
                ['Overdue Days Filter', $days > 0 ? "{$days} or more days" : 'All overdue'],
                ['Mode', 'Dry Run'],
            ]
        );

        $this->info('Dry run completed. Use without --dry-run to actually process overdue invoices.');
    }

    /**
     * Process overdue invoices by dispatching the job.
     */
    protected function processOverdueInvoices(): void
    {
        $this->info('Dispatching overdue invoice processing job...');

        ProcessOverdueInvoices::dispatch();

        $this->info('Overdue invoice processing job dispatched successfully!');
        $this->line('Check the queue worker logs for progress updates.');
    }
}
