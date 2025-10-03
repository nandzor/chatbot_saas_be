<?php

namespace App\Console\Commands;

use App\Services\Waha\WahaServiceLog;
use Illuminate\Console\Command;

class WahaLogViewer extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'waha:logs
                            {--service= : Filter by service name}
                            {--session= : Filter by session ID}
                            {--limit=50 : Number of logs to show}
                            {--stats : Show statistics}
                            {--hours=24 : Hours for statistics}';

    /**
     * The console command description.
     */
    protected $description = 'View WAHA service logs with filtering and statistics';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $service = $this->option('service');
        $session = $this->option('session');
        $limit = (int) $this->option('limit');
        $showStats = $this->option('stats');
        $hours = (int) $this->option('hours');

        if ($showStats) {
            $this->showStatistics($hours);
            return;
        }

        $this->showLogs($service, $session, $limit);
    }

    /**
     * Show logs with filtering
     */
    private function showLogs(?string $service, ?string $session, int $limit): void
    {
        $this->info("🔍 WAHA Service Logs");
        $this->line("");

        if ($service) {
            $logs = WahaServiceLog::getLogsByService($service, $limit);
            $this->info("📋 Filtered by service: {$service}");
        } elseif ($session) {
            $logs = WahaServiceLog::getLogsBySession($session, $limit);
            $this->info("📋 Filtered by session: {$session}");
        } else {
            $logs = WahaServiceLog::getRecentLogs($limit);
        }

        if (empty($logs)) {
            $this->warn("No logs found");
            return;
        }

        $this->line("📊 Showing " . count($logs) . " log entries");
        $this->line("");

        foreach ($logs as $log) {
            $this->displayLogEntry($log);
        }
    }

    /**
     * Display a single log entry
     */
    private function displayLogEntry(array $log): void
    {
        $timestamp = $log['timestamp'];
        $service = $log['service'];
        $action = $log['action'];
        $status = $log['status'];
        $data = $log['data'] ?? [];
        $error = $log['error'] ?? null;

        // Status icon
        $statusIcon = $status === 'success' ? '✅' : '❌';

        // Service icon
        $serviceIcon = $this->getServiceIcon($service);

        $this->line("{$statusIcon} {$serviceIcon} [{$timestamp}] {$service}::{$action}");

        // Display relevant data
        if (!empty($data)) {
            $relevantData = $this->extractRelevantData($data);
            if (!empty($relevantData)) {
                $this->line("   📝 " . implode(' | ', $relevantData));
            }
        }

        // Display error if present
        if ($error) {
            $this->line("   ⚠️  Error: {$error}");
        }

        $this->line("");
    }

    /**
     * Get service icon
     */
    private function getServiceIcon(string $service): string
    {
        $icons = [
            'typing-indicator' => '⌨️',
            'outgoing-message' => '📤',
            'incoming-message' => '📥',
            'media-upload' => '📎',
            'media-download' => '📁',
            'session-status' => '🔗',
            'webhook' => '🔗',
            'api-call' => '🌐',
        ];

        return $icons[$service] ?? '🔧';
    }

    /**
     * Extract relevant data for display
     */
    private function extractRelevantData(array $data): array
    {
        $relevant = [];

        if (isset($data['session_id'])) {
            $relevant[] = "Session: {$data['session_id']}";
        }

        if (isset($data['to'])) {
            $relevant[] = "To: {$data['to']}";
        }

        if (isset($data['from'])) {
            $relevant[] = "From: {$data['from']}";
        }

        if (isset($data['message'])) {
            $message = strlen($data['message']) > 50
                ? substr($data['message'], 0, 50) . '...'
                : $data['message'];
            $relevant[] = "Message: {$message}";
        }

        if (isset($data['type'])) {
            $relevant[] = "Type: {$data['type']}";
        }

        if (isset($data['direction'])) {
            $relevant[] = "Direction: {$data['direction']}";
        }

        if (isset($data['is_typing'])) {
            $relevant[] = "Typing: " . ($data['is_typing'] ? 'Start' : 'Stop');
        }

        return $relevant;
    }

    /**
     * Show statistics
     */
    private function showStatistics(int $hours): void
    {
        $this->info("📊 WAHA Service Statistics (Last {$hours} hours)");
        $this->line("");

        $stats = WahaServiceLog::getStatistics($hours);

        // Overall stats
        $this->line("📈 Overall Statistics:");
        $this->line("   Total Requests: {$stats['total_requests']}");
        $this->line("   Successful: {$stats['successful_requests']}");
        $this->line("   Failed: {$stats['failed_requests']}");

        if ($stats['total_requests'] > 0) {
            $successRate = round(($stats['successful_requests'] / $stats['total_requests']) * 100, 2);
            $this->line("   Success Rate: {$successRate}%");
        }

        $this->line("");

        // Service breakdown
        if (!empty($stats['services'])) {
            $this->line("🔧 Service Breakdown:");
            arsort($stats['services']);
            foreach ($stats['services'] as $service => $count) {
                $icon = $this->getServiceIcon($service);
                $this->line("   {$icon} {$service}: {$count}");
            }
            $this->line("");
        }

        // Action breakdown
        if (!empty($stats['actions'])) {
            $this->line("⚡ Action Breakdown:");
            arsort($stats['actions']);
            foreach ($stats['actions'] as $action => $count) {
                $this->line("   {$action}: {$count}");
            }
            $this->line("");
        }

        // Recent errors
        if (!empty($stats['errors'])) {
            $this->line("⚠️  Recent Errors:");
            $errorCount = 0;
            foreach ($stats['errors'] as $error) {
                if ($errorCount >= 5) break; // Show only last 5 errors
                $this->line("   [{$error['timestamp']}] {$error['service']}::{$error['action']}");
                $this->line("      {$error['error']}");
                $errorCount++;
            }
        }
    }
}
