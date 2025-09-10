<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Redis;

class QueueStatusCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'queue:status
                            {--queue= : Check specific queue status}
                            {--detailed : Show detailed queue information}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Show queue status and statistics';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $queueName = $this->option('queue');
        $detailed = $this->option('detailed');

        $this->info('Queue Status Report');
        $this->line('==================');

        try {
            if ($queueName) {
                $this->showQueueStatus($queueName, $detailed);
            } else {
                $this->showAllQueuesStatus($detailed);
            }

            return Command::SUCCESS;

        } catch (\Exception $e) {
            $this->error('Failed to get queue status: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }

    /**
     * Show status for all queues.
     */
    protected function showAllQueuesStatus(bool $detailed): void
    {
        $queues = [
            'default',
            'payment',
            'billing',
            'notifications',
            'webhooks',
            'high_priority',
        ];

        $headers = ['Queue', 'Pending', 'Processing', 'Failed'];
        $rows = [];

        foreach ($queues as $queue) {
            $pending = $this->getQueueSize($queue);
            $processing = $this->getProcessingJobs($queue);
            $failed = $this->getFailedJobs($queue);

            $rows[] = [
                $queue,
                $pending,
                $processing,
                $failed,
            ];
        }

        $this->table($headers, $rows);

        if ($detailed) {
            $this->showDetailedInformation();
        }
    }

    /**
     * Show status for specific queue.
     */
    protected function showQueueStatus(string $queueName, bool $detailed): void
    {
        $this->info("Queue: {$queueName}");
        $this->line('================');

        $pending = $this->getQueueSize($queueName);
        $processing = $this->getProcessingJobs($queueName);
        $failed = $this->getFailedJobs($queueName);

        $this->table(
            ['Metric', 'Count'],
            [
                ['Pending Jobs', $pending],
                ['Processing Jobs', $processing],
                ['Failed Jobs', $failed],
            ]
        );

        if ($detailed) {
            $this->showQueueDetails($queueName);
        }
    }

    /**
     * Show detailed queue information.
     */
    protected function showDetailedInformation(): void
    {
        $this->line('');
        $this->info('Detailed Information');
        $this->line('===================');

        // Show Redis connection status
        try {
            $redis = Redis::connection();
            $redis->ping();
            $this->info('✅ Redis connection: OK');
        } catch (\Exception $e) {
            $this->error('❌ Redis connection: FAILED - ' . $e->getMessage());
        }

        // Show queue configuration
        $this->line('');
        $this->info('Queue Configuration:');
        $defaultConnection = config('queue.default');
        $this->line("Default connection: {$defaultConnection}");

        // Show worker status (if available)
        $this->line('');
        $this->info('Worker Status:');
        $this->line('Check if queue workers are running with: php artisan queue:work');
    }

    /**
     * Show detailed information for specific queue.
     */
    protected function showQueueDetails(string $queueName): void
    {
        $this->line('');
        $this->info("Detailed information for queue: {$queueName}");

        // Show recent jobs (if available)
        $this->line('');
        $this->info('Recent Jobs:');
        $this->line('(This would show recent job information in a real implementation)');
    }

    /**
     * Get queue size.
     */
    protected function getQueueSize(string $queueName): int
    {
        try {
            $redis = Redis::connection();
            return $redis->llen("queues:{$queueName}");
        } catch (\Exception $e) {
            return 0;
        }
    }

    /**
     * Get processing jobs count.
     */
    protected function getProcessingJobs(string $queueName): int
    {
        try {
            $redis = Redis::connection();
            return $redis->zcard("queues:{$queueName}:reserved");
        } catch (\Exception $e) {
            return 0;
        }
    }

    /**
     * Get failed jobs count.
     */
    protected function getFailedJobs(string $queueName): int
    {
        try {
            $redis = Redis::connection();
            return $redis->llen("queues:{$queueName}:failed");
        } catch (\Exception $e) {
            return 0;
        }
    }
}
