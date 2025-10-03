<?php

namespace App\Console\Commands;

use App\Models\WahaSession;
use App\Services\Waha\WahaService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class ReconfigureWahaWebhooks extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'waha:reconfigure-webhooks
                            {--organization= : Organization ID to reconfigure webhooks for}
                            {--session= : Specific session name to reconfigure}
                            {--all : Reconfigure all active sessions}
                            {--dry-run : Show what would be done without making changes}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Reconfigure WAHA webhooks for existing sessions to fix duplicate event issues';

    protected WahaService $wahaService;

    public function __construct(WahaService $wahaService)
    {
        parent::__construct();
        $this->wahaService = $wahaService;
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('🔧 WAHA Webhook Reconfiguration Tool');
        $this->info('=====================================');
        $this->newLine();

        $isDryRun = $this->option('dry-run');
        $organizationId = $this->option('organization');
        $sessionName = $this->option('session');
        $reconfigureAll = $this->option('all');

        if ($isDryRun) {
            $this->warn('⚠️  DRY RUN MODE - No changes will be made');
            $this->newLine();
        }

        // Get sessions to reconfigure
        $sessions = $this->getSessions($organizationId, $sessionName, $reconfigureAll);

        if ($sessions->isEmpty()) {
            $this->error('❌ No sessions found to reconfigure');
            return self::FAILURE;
        }

        $this->info("Found {$sessions->count()} session(s) to reconfigure:");
        $this->newLine();

        $successCount = 0;
        $failureCount = 0;
        $skippedCount = 0;

        foreach ($sessions as $session) {
            $this->info("Processing: {$session->session_name}");
            $this->line("  Organization: {$session->organization->name}");
            $this->line("  Status: {$session->status}");
            $this->line("  Connected: " . ($session->is_connected ? 'Yes' : 'No'));

            // Skip if session is not connected
            if (!$session->is_connected) {
                $this->warn("  ⏭️  Skipped (session not connected)");
                $skippedCount++;
                $this->newLine();
                continue;
            }

            if ($isDryRun) {
                $this->info("  🔍 Would reconfigure webhook events from ['message', 'message.any'] to ['message.any']");
                $successCount++;
            } else {
                try {
                    // Get current session info from WAHA
                    $sessionInfo = $this->wahaService->getSessionInfo($session->session_name);
                    $webhooks = $sessionInfo['config']['webhooks'] ?? [];

                    if (empty($webhooks)) {
                        $this->error("  ❌ No webhook configured for this session");
                        $failureCount++;
                        $this->newLine();
                        continue;
                    }

                    $this->line("  📋 Current webhooks: " . count($webhooks));

                    // Update webhooks to use message.any instead of message
                    $updatedWebhooks = [];
                    foreach ($webhooks as $webhook) {
                        $events = $webhook['events'] ?? [];

                        // Replace 'message' with 'message.any' if exists
                        if (in_array('message', $events) && !in_array('message.any', $events)) {
                            $events = array_diff($events, ['message']);
                            $events[] = 'message.any';
                        }

                        // Remove 'message' if both 'message' and 'message.any' exist
                        if (in_array('message', $events) && in_array('message.any', $events)) {
                            $events = array_diff($events, ['message']);
                        }

                        $webhook['events'] = array_values($events);
                        $updatedWebhooks[] = $webhook;
                    }

                    // Stop and restart session with updated config
                    $this->line("  🔄 Restarting session with updated webhook config...");

                    $stopResult = $this->wahaService->stopSession($session->session_name);
                    if (!$stopResult['success']) {
                        $this->warn("  ⚠️  Warning: Could not stop session: " . ($stopResult['message'] ?? 'Unknown error'));
                    }

                    sleep(2); // Wait for session to stop

                    // Start session with updated config
                    $startResult = $this->wahaService->startSession($session->session_name, [
                        'webhooks' => $updatedWebhooks
                    ]);

                    if ($startResult['success'] || isset($startResult['session'])) {
                        $this->info("  ✅ Successfully reconfigured webhook events");

                        // Update local webhook config
                        $session->update([
                            'webhook_config' => [
                                'enabled' => true,
                                'events' => ['message.any', 'session.status'],
                                'webhooks' => $updatedWebhooks,
                                'updated_at' => now()
                            ]
                        ]);

                        $successCount++;
                    } else {
                        $this->error("  ❌ Failed to restart session: " . ($startResult['message'] ?? 'Unknown error'));
                        $failureCount++;
                    }

                } catch (\Exception $e) {
                    $this->error("  ❌ Error: " . $e->getMessage());
                    Log::error('Failed to reconfigure WAHA webhook', [
                        'session_name' => $session->session_name,
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString()
                    ]);
                    $failureCount++;
                }
            }

            $this->newLine();
        }

        // Summary
        $this->info('=====================================');
        $this->info('Summary:');
        $this->info("  ✅ Success: {$successCount}");
        if ($failureCount > 0) {
            $this->error("  ❌ Failed: {$failureCount}");
        }
        if ($skippedCount > 0) {
            $this->warn("  ⏭️  Skipped: {$skippedCount}");
        }
        $this->info('=====================================');

        if (!$isDryRun) {
            $this->newLine();
            $this->info('💡 Tip: Clear cache and restart queue workers:');
            $this->line('   php artisan optimize:clear && php artisan queue:restart');
        }

        return $failureCount > 0 ? self::FAILURE : self::SUCCESS;
    }

    /**
     * Get sessions to reconfigure based on options
     */
    protected function getSessions(?string $organizationId, ?string $sessionName, bool $all)
    {
        $query = WahaSession::with('organization');

        if ($sessionName) {
            // Specific session
            return $query->where('session_name', $sessionName)->get();
        }

        if ($organizationId) {
            // All sessions for organization
            return $query->where('organization_id', $organizationId)->get();
        }

        if ($all) {
            // All active sessions across all organizations
            return $query->whereIn('status', ['WORKING', 'SCAN_QR_CODE', 'STARTING'])
                        ->orWhere('is_connected', true)
                        ->get();
        }

        // Default: show help
        $this->error('Please specify one of the following options:');
        $this->line('  --session=SESSION_NAME   : Reconfigure specific session');
        $this->line('  --organization=ORG_ID    : Reconfigure all sessions for organization');
        $this->line('  --all                    : Reconfigure all active sessions');
        $this->newLine();

        return collect([]);
    }
}
