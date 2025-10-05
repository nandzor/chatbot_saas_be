<?php

namespace App\Console\Commands;

use App\Services\N8n\N8nService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class TestN8nConnection extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'n8n:test
                            {--workflows : Test workflows endpoint}
                            {--credentials : Test credentials endpoint}
                            {--webhook= : Test webhook with workflow_id:node_id}
                            {--detailed : Show detailed output}';

    /**
     * The console command description.
     */
    protected $description = 'Test N8N service connection and endpoints';

    protected N8nService $n8nService;

    /**
     * Create a new command instance.
     */
    public function __construct(N8nService $n8nService)
    {
        parent::__construct();
        $this->n8nService = $n8nService;
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Testing N8N Service Connection...');
        $this->newLine();

        // Test basic connection
        $this->testConnection();

        // Test specific endpoints if requested
        if ($this->option('workflows')) {
            $this->testWorkflows();
        }

        if ($this->option('credentials')) {
            $this->testCredentials();
        }

        if ($webhook = $this->option('webhook')) {
            $this->testWebhook($webhook);
        }

        return Command::SUCCESS;
    }

    protected function testConnection(): void
    {
        $this->info('1. Testing basic connection...');

        $result = $this->n8nService->testConnection();

        if ($result['success']) {
            $this->info("   ✅ {$result['message']}");
            $this->line("   📍 Base URL: {$result['base_url']}");

            if (isset($result['status'])) {
                $this->line("   📊 Status: {$result['status']}");
            }

            if (isset($result['mock_mode'])) {
                $this->line("   🎭 Mock Mode: " . ($result['mock_mode'] ? 'Yes' : 'No'));
            }
        } else {
            $this->error("   ❌ {$result['message']}");
            if (isset($result['error'])) {
                $this->error("   🔍 Error: {$result['error']}");
            }
        }

        $this->newLine();
    }

    protected function testWorkflows(): void
    {
        $this->info('2. Testing workflows endpoint...');

        try {
            $workflows = $this->n8nService->getWorkflows();

            if (is_array($workflows)) {
                $count = count($workflows);
                $this->info("   ✅ Workflows retrieved successfully");
                $this->line("   📊 Total workflows: {$count}");

                if ($this->option('detailed') && $count > 0) {
                    $this->line("   📋 Workflow names:");
                    foreach (array_slice($workflows, 0, 5) as $workflow) {
                        $name = $workflow['name'] ?? 'Unnamed';
                        $active = isset($workflow['active']) && $workflow['active'] ? '🟢' : '🔴';
                        $this->line("      {$active} {$name}");
                    }

                    if ($count > 5) {
                        $this->line("      ... and " . ($count - 5) . " more");
                    }
                }
            } else {
                $this->warn("   ⚠️  Unexpected response format");
            }
        } catch (\Exception $e) {
            $this->error("   ❌ Failed to retrieve workflows: {$e->getMessage()}");
        }

        $this->newLine();
    }

    protected function testCredentials(): void
    {
        $this->info('3. Testing credentials endpoint...');

        try {
            $credentials = $this->n8nService->getCredentials();

            if (is_array($credentials)) {
                $count = count($credentials);
                $this->info("   ✅ Credentials retrieved successfully");
                $this->line("   📊 Total credentials: {$count}");

                if ($this->option('detailed') && $count > 0) {
                    $this->line("   🔑 Credential types:");
                    $types = [];
                    foreach ($credentials as $credential) {
                        $type = $credential['type'] ?? 'Unknown';
                        $types[$type] = ($types[$type] ?? 0) + 1;
                    }

                    foreach ($types as $type => $count) {
                        $this->line("      • {$type}: {$count}");
                    }
                }
            } else {
                $this->warn("   ⚠️  Unexpected response format");
            }
        } catch (\Exception $e) {
            $this->error("   ❌ Failed to retrieve credentials: {$e->getMessage()}");
        }

        $this->newLine();
    }

    protected function testWebhook(string $webhook): void
    {
        $this->info('4. Testing webhook...');

        if (!str_contains($webhook, ':')) {
            $this->error("   ❌ Invalid webhook format. Use: workflow_id:node_id");
            return;
        }

        [$workflowId, $nodeId] = explode(':', $webhook, 2);

        try {
            $testData = [
                'test' => true,
                'timestamp' => now()->toISOString(),
                'source' => 'connectivity_test',
            ];

            $result = $this->n8nService->sendWebhook($workflowId, $nodeId, $testData);

            if ($result['success']) {
                $this->info("   ✅ Webhook connectivity test successful");
                if (isset($result['executionId'])) {
                    $this->line("   🆔 Execution ID: {$result['executionId']}");
                }
            } else {
                $this->error("   ❌ Webhook connectivity test failed");
                if (isset($result['message'])) {
                    $this->error("   🔍 Error: {$result['message']}");
                }
            }
        } catch (\Exception $e) {
            $this->error("   ❌ Webhook test failed: {$e->getMessage()}");
        }

        $this->newLine();
    }
}
