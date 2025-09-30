<?php

namespace App\Console\Commands;

use App\Services\Waha\WahaWebhookService;
use Illuminate\Console\Command;

class ClearExpiredWebhookKeys extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'waha:clear-expired-keys {--force : Force clear all keys without confirmation}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clear expired webhook deduplication keys from Redis';

    /**
     * Execute the console command.
     */
    public function handle(WahaWebhookService $webhookService): int
    {
        $this->info('Clearing expired webhook deduplication keys...');

        $clearedCount = $webhookService->clearExpiredWebhookKeys();

        if ($clearedCount > 0) {
            $this->info("Cleared {$clearedCount} expired webhook keys.");
        } else {
            $this->info('No expired webhook keys found.');
        }

        // Also clear any orphaned lock keys
        $this->clearOrphanedLockKeys();

        return Command::SUCCESS;
    }

    /**
     * Clear orphaned lock keys that might be stuck
     */
    private function clearOrphanedLockKeys(): void
    {
        try {
            $pattern = 'webhook_lock:*';
            $keys = \Illuminate\Support\Facades\Redis::keys($pattern);
            $clearedCount = 0;

            foreach ($keys as $key) {
                $ttl = \Illuminate\Support\Facades\Redis::ttl($key);
                // If TTL is -1 (no expiration) or -2 (expired), delete the key
                if ($ttl === -1 || $ttl === -2) {
                    \Illuminate\Support\Facades\Redis::del($key);
                    $clearedCount++;
                }
            }

            if ($clearedCount > 0) {
                $this->info("Cleared {$clearedCount} orphaned lock keys.");
            }

        } catch (\Exception $e) {
            $this->error('Failed to clear orphaned lock keys: ' . $e->getMessage());
        }
    }
}
