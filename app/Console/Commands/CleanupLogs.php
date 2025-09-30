<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class CleanupLogs extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'logs:cleanup {--days=14 : Number of days to keep log files}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean up old log files to prevent disk space issues';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $days = (int) $this->option('days');
        $logPath = storage_path('logs');

        $this->info("Cleaning up log files older than {$days} days...");

        if (!File::exists($logPath)) {
            $this->error('Log directory does not exist: ' . $logPath);
            return Command::FAILURE;
        }

        $deletedCount = 0;
        $totalSize = 0;
        $cutoffDate = now()->subDays($days);

        // Get all log files
        $logFiles = File::glob($logPath . '/*.log');

        foreach ($logFiles as $logFile) {
            $fileInfo = File::info($logFile);
            $fileDate = File::lastModified($logFile);

            // Skip if file is newer than cutoff date
            if ($fileDate > $cutoffDate->timestamp) {
                continue;
            }

            // Get file size before deletion
            $fileSize = File::size($logFile);
            $totalSize += $fileSize;

            // Delete the file
            if (File::delete($logFile)) {
                $deletedCount++;
                $this->line("Deleted: " . basename($logFile) . " (" . $this->formatBytes($fileSize) . ")");
            } else {
                $this->error("Failed to delete: " . basename($logFile));
            }
        }

        if ($deletedCount > 0) {
            $this->info("Cleaned up {$deletedCount} log files, freed " . $this->formatBytes($totalSize) . " of disk space.");
        } else {
            $this->info('No old log files found to clean up.');
        }

        // Show current log directory status
        $this->showLogStatus($logPath);

        return Command::SUCCESS;
    }

    /**
     * Show current log directory status
     */
    private function showLogStatus(string $logPath): void
    {
        $this->info("\nCurrent log directory status:");

        $logFiles = File::glob($logPath . '/*.log');
        $totalSize = 0;
        $fileCount = count($logFiles);

        foreach ($logFiles as $logFile) {
            $totalSize += File::size($logFile);
        }

        $this->info("- Total log files: {$fileCount}");
        $this->info("- Total size: " . $this->formatBytes($totalSize));

        // Show largest files
        $largestFiles = collect($logFiles)
            ->map(function ($file) {
                return [
                    'name' => basename($file),
                    'size' => File::size($file)
                ];
            })
            ->sortByDesc('size')
            ->take(5);

        if ($largestFiles->isNotEmpty()) {
            $this->info("\nLargest log files:");
            foreach ($largestFiles as $file) {
                $this->line("- {$file['name']}: " . $this->formatBytes($file['size']));
            }
        }
    }

    /**
     * Format bytes to human readable format
     */
    private function formatBytes(int $bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, 2) . ' ' . $units[$i];
    }
}
