<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schedule;
use App\Jobs\GenerateBillingInvoices;
use App\Jobs\ProcessOverdueInvoices;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// ============================================================================
// SCHEDULED TASKS
// ============================================================================

// Generate monthly billing invoices every day at 2:00 AM
Schedule::call(function () {
    GenerateBillingInvoices::dispatch(null, null, 'monthly');
})->dailyAt('02:00')->name('generate-monthly-invoices');

// Generate yearly billing invoices every day at 2:30 AM
Schedule::call(function () {
    GenerateBillingInvoices::dispatch(null, null, 'yearly');
})->dailyAt('02:30')->name('generate-yearly-invoices');

// Generate weekly billing invoices every Monday at 3:00 AM
Schedule::call(function () {
    GenerateBillingInvoices::dispatch(null, null, 'weekly');
})->weeklyOn(1, '03:00')->name('generate-weekly-invoices');

// Generate daily billing invoices every day at 3:30 AM
Schedule::call(function () {
    GenerateBillingInvoices::dispatch(null, null, 'daily');
})->dailyAt('03:30')->name('generate-daily-invoices');

// Process overdue invoices every day at 4:00 AM
Schedule::call(function () {
    ProcessOverdueInvoices::dispatch();
})->dailyAt('04:00')->name('process-overdue-invoices');

// Process overdue invoices every 6 hours for critical cases
Schedule::call(function () {
    ProcessOverdueInvoices::dispatch();
})->everySixHours()->name('process-overdue-invoices-frequent');

// Clean up old logs and cache every day at 5:00 AM
Schedule::call(function () {
    Artisan::call('cache:clear');
    Artisan::call('config:clear');
    Artisan::call('route:clear');
    Artisan::call('view:clear');
})->dailyAt('05:00')->name('cleanup-system');

// Clean up old log files every day at 5:30 AM
Schedule::call(function () {
    $logPath = storage_path('logs');
    $files = \Illuminate\Support\Facades\File::glob($logPath . '/*.log');
    $deleted = 0;
    $freed = 0;

    foreach ($files as $file) {
        $fileDate = \Illuminate\Support\Facades\File::lastModified($file);
        $cutoff = now()->subDays(14)->timestamp; // Keep logs for 14 days

        if ($fileDate < $cutoff) {
            $size = \Illuminate\Support\Facades\File::size($file);
            if (\Illuminate\Support\Facades\File::delete($file)) {
                $deleted++;
                $freed += $size;
            }
        }
    }

    if ($deleted > 0) {
        Log::info("Log cleanup completed: deleted {$deleted} files, freed " . round($freed/1024/1024, 2) . " MB");
    }
})->dailyAt('05:30')->name('cleanup-logs');

// Clean up old webhook logs from database every day at 5:45 AM
Schedule::call(function () {
    try {
        $deletedCount = \App\Models\WebhookLog::cleanupOldLogs(7); // Keep for 7 days

        if ($deletedCount > 0) {
            Log::info("Webhook logs cleanup completed: deleted {$deletedCount} old webhook log records");
        }
    } catch (\Exception $e) {
        Log::error("Webhook logs cleanup failed: " . $e->getMessage());
    }
})->dailyAt('05:45')->name('cleanup-webhook-logs');

// Backup database every day at 6:00 AM (if backup command exists)
Schedule::call(function () {
    try {
        Artisan::call('backup:run');
    } catch (\Exception $e) {
        // Backup command might not be available
        Log::info('Backup command not available: ' . $e->getMessage());
    }
})->dailyAt('06:00')->name('backup-database');

// Health check every hour
Schedule::call(function () {
    try {
        Artisan::call('health:check');
    } catch (\Exception $e) {
        Log::error('Health check failed: ' . $e->getMessage());
    }
})->hourly()->name('health-check');

// Queue status monitoring every 15 minutes
Schedule::call(function () {
    try {
        Artisan::call('queue:status');
    } catch (\Exception $e) {
        Log::error('Queue status check failed: ' . $e->getMessage());
    }
})->everyFifteenMinutes()->name('queue-status-check');
