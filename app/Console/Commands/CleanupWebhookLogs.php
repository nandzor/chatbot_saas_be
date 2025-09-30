<?php

namespace App\Console\Commands;

use App\Models\WebhookLog;
use Illuminate\Console\Command;

class CleanupWebhookLogs extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'webhook:cleanup {--days=7 : Number of days to keep webhook logs}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean up old webhook logs to prevent database bloat';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $days = (int) $this->option('days');

        $this->info("Cleaning up webhook logs older than {$days} days...");

        $deletedCount = WebhookLog::cleanupOldLogs($days);

        if ($deletedCount > 0) {
            $this->info("Cleaned up {$deletedCount} old webhook logs.");
        } else {
            $this->info('No old webhook logs found to clean up.');
        }

        // Also show current webhook log statistics
        $totalLogs = WebhookLog::count();
        $recentLogs = WebhookLog::recent(24)->count();

        $this->info("Current webhook log statistics:");
        $this->info("- Total logs: {$totalLogs}");
        $this->info("- Recent logs (24h): {$recentLogs}");

        return Command::SUCCESS;
    }
}
