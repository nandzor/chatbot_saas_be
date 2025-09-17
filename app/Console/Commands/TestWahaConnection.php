<?php

namespace App\Console\Commands;

use App\Services\Waha\WahaService;
use Illuminate\Console\Command;
use Exception;

class TestWahaConnection extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'waha:test
                            {--sessions : Test sessions endpoint}
                            {--detailed : Show detailed output}';

    /**
     * The console command description.
     */
    protected $description = 'Test WAHA service connection and endpoints';

    protected WahaService $wahaService;

    public function __construct(WahaService $wahaService)
    {
        parent::__construct();
        $this->wahaService = $wahaService;
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Testing WAHA Service Connection...');

        // Test basic connection
        $this->line("\n1. Testing basic connection...");
        $result = $this->wahaService->testConnection();
        if ($result['success']) {
            $this->info("   ✅ " . $result['message']);
            if ($this->option('detailed')) {
                $this->line("      Base URL: " . $result['base_url']);
                $this->line("      Status: " . ($result['status'] ?? 'N/A'));
                $this->line("      Mock Mode: " . ($result['mock_mode'] ? 'Yes' : 'No'));
            }
        } else {
            $this->error("   ❌ " . $result['message']);
            if (isset($result['error'])) {
                $this->line("   🔍 Error: " . $result['error']);
            }
        }

        // Test sessions endpoint
        if ($this->option('sessions')) {
            $this->line("\n2. Testing sessions endpoint...");
            try {
                $sessions = $this->wahaService->getSessions();
                $count = count($sessions['sessions'] ?? []);
                $this->info("   ✅ Sessions retrieved successfully. Total: {$count}");
                if ($this->option('detailed') && $count > 0) {
                    foreach (array_slice($sessions['sessions'], 0, 3) as $session) {
                        $this->line("      - ID: {$session['id']}, Status: {$session['status']}, Created: " . ($session['created_at'] ?? 'N/A'));
                    }
                    if ($count > 3) {
                        $this->line("      ... and " . ($count - 3) . " more.");
                    }
                }
            } catch (Exception $e) {
                $this->error("   ❌ Failed to retrieve sessions: " . $e->getMessage());
            }
        }

        $this->line("\nWAHA Service testing complete.");
    }
}
