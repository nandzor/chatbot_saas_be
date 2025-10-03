<?php

namespace App\Services\Waha;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class WahaServiceLog
{
    private const LOG_FILE = 'waha-service.log';
    private const MAX_LOG_SIZE = 10 * 1024 * 1024; // 10MB
    private const MAX_LOG_FILES = 5;

    /**
     * Log WAHA service access
     */
    public static function log(string $service, string $action, array $data = [], string $status = 'success', ?string $error = null): void
    {
        $logEntry = [
            'timestamp' => Carbon::now()->toISOString(),
            'service' => $service,
            'action' => $action,
            'status' => $status,
            'data' => $data,
            'error' => $error,
            'request_id' => request()->header('X-Request-ID', uniqid('waha_')),
        ];

        // Log to Laravel log
        Log::channel('waha')->info('WAHA Service Access', $logEntry);

        // Log to dedicated file
        self::writeToFile($logEntry);
    }

    /**
     * Log typing indicator
     */
    public static function logTypingIndicator(string $sessionId, string $to, bool $isTyping, string $status = 'success', ?string $error = null): void
    {
        self::log(
            'typing-indicator',
            $isTyping ? 'TypingStart' : 'TypingStop',
            [
                'session_id' => $sessionId,
                'to' => $to,
                'is_typing' => $isTyping,
                'direction' => 'outgoing'
            ],
            $status,
            $error
        );
    }

    /**
     * Log outgoing message
     */
    public static function logOutgoingMessage(string $sessionId, string $to, string $message, string $type = 'text', string $status = 'success', ?string $error = null): void
    {
        self::log(
            'outgoing-message',
            'MessageSent',
            [
                'session_id' => $sessionId,
                'to' => $to,
                'message' => $message,
                'type' => $type,
                'direction' => 'outgoing'
            ],
            $status,
            $error
        );
    }

    /**
     * Log incoming message
     */
    public static function logIncomingMessage(string $sessionId, string $from, string $message, string $type = 'text', string $status = 'success', ?string $error = null): void
    {
        self::log(
            'incoming-message',
            'MessageReceived',
            [
                'session_id' => $sessionId,
                'from' => $from,
                'message' => $message,
                'type' => $type,
                'direction' => 'incoming'
            ],
            $status,
            $error
        );
    }

    /**
     * Log session status
     */
    public static function logSessionStatus(string $sessionId, string $status, array $data = []): void
    {
        self::log(
            'session-status',
            'StatusUpdate',
            array_merge([
                'session_id' => $sessionId,
                'status' => $status
            ], $data),
            'success'
        );
    }

    /**
     * Log media upload
     */
    public static function logMediaUpload(string $sessionId, string $to, string $mediaType, string $fileName, string $status = 'success', ?string $error = null): void
    {
        self::log(
            'media-upload',
            'MediaUpload',
            [
                'session_id' => $sessionId,
                'to' => $to,
                'media_type' => $mediaType,
                'file_name' => $fileName,
                'direction' => 'outgoing'
            ],
            $status,
            $error
        );
    }

    /**
     * Log media download
     */
    public static function logMediaDownload(string $sessionId, string $from, string $mediaType, string $fileName, string $status = 'success', ?string $error = null): void
    {
        self::log(
            'media-download',
            'MediaDownload',
            [
                'session_id' => $sessionId,
                'from' => $from,
                'media_type' => $mediaType,
                'file_name' => $fileName,
                'direction' => 'incoming'
            ],
            $status,
            $error
        );
    }

    /**
     * Log webhook events
     */
    public static function logWebhook(string $event, array $data, string $status = 'success', ?string $error = null): void
    {
        self::log(
            'webhook',
            $event,
            $data,
            $status,
            $error
        );
    }

    /**
     * Log API calls
     */
    public static function logApiCall(string $endpoint, string $method, array $payload = [], string $status = 'success', ?string $error = null): void
    {
        self::log(
            'api-call',
            $method . ' ' . $endpoint,
            [
                'endpoint' => $endpoint,
                'method' => $method,
                'payload' => $payload
            ],
            $status,
            $error
        );
    }

    /**
     * Write to dedicated log file
     */
    private static function writeToFile(array $logEntry): void
    {
        try {
            $logPath = storage_path('logs/' . self::LOG_FILE);
            $logLine = json_encode($logEntry) . "\n";

            // Check file size and rotate if needed
            if (file_exists($logPath) && filesize($logPath) > self::MAX_LOG_SIZE) {
                self::rotateLogFile();
            }

            file_put_contents($logPath, $logLine, FILE_APPEND | LOCK_EX);
        } catch (\Exception $e) {
            Log::error('Failed to write WAHA service log', [
                'error' => $e->getMessage(),
                'log_entry' => $logEntry
            ]);
        }
    }

    /**
     * Rotate log file
     */
    private static function rotateLogFile(): void
    {
        $logPath = storage_path('logs/' . self::LOG_FILE);

        // Rotate existing files
        for ($i = self::MAX_LOG_FILES - 1; $i > 0; $i--) {
            $oldFile = $logPath . '.' . $i;
            $newFile = $logPath . '.' . ($i + 1);

            if (file_exists($oldFile)) {
                if ($i === self::MAX_LOG_FILES - 1) {
                    unlink($oldFile); // Delete oldest file
                } else {
                    rename($oldFile, $newFile);
                }
            }
        }

        // Move current file to .1
        if (file_exists($logPath)) {
            rename($logPath, $logPath . '.1');
        }
    }

    /**
     * Get recent logs
     */
    public static function getRecentLogs(int $lines = 100): array
    {
        $logPath = storage_path('logs/' . self::LOG_FILE);

        if (!file_exists($logPath)) {
            return [];
        }

        $logs = [];
        $file = new \SplFileObject($logPath);
        $file->seek(PHP_INT_MAX);
        $totalLines = $file->key();

        $startLine = max(0, $totalLines - $lines);
        $file->seek($startLine);

        while (!$file->eof()) {
            $line = trim($file->fgets());
            if (!empty($line)) {
                $logEntry = json_decode($line, true);
                if ($logEntry) {
                    $logs[] = $logEntry;
                }
            }
        }

        return array_reverse($logs);
    }

    /**
     * Get logs by service
     */
    public static function getLogsByService(string $service, int $limit = 50): array
    {
        $logs = self::getRecentLogs(1000); // Get more logs to filter

        return array_filter($logs, function($log) use ($service) {
            return $log['service'] === $service;
        });
    }

    /**
     * Get logs by session
     */
    public static function getLogsBySession(string $sessionId, int $limit = 50): array
    {
        $logs = self::getRecentLogs(1000);

        return array_filter($logs, function($log) use ($sessionId) {
            return isset($log['data']['session_id']) && $log['data']['session_id'] === $sessionId;
        });
    }

    /**
     * Get statistics
     */
    public static function getStatistics(int $hours = 24): array
    {
        $logs = self::getRecentLogs(10000);
        $cutoff = Carbon::now()->subHours($hours);

        $stats = [
            'total_requests' => 0,
            'successful_requests' => 0,
            'failed_requests' => 0,
            'services' => [],
            'actions' => [],
            'errors' => []
        ];

        foreach ($logs as $log) {
            $logTime = Carbon::parse($log['timestamp']);
            if ($logTime->lt($cutoff)) {
                continue;
            }

            $stats['total_requests']++;

            if ($log['status'] === 'success') {
                $stats['successful_requests']++;
            } else {
                $stats['failed_requests']++;
            }

            // Count by service
            $service = $log['service'];
            $stats['services'][$service] = ($stats['services'][$service] ?? 0) + 1;

            // Count by action
            $action = $log['action'];
            $stats['actions'][$action] = ($stats['actions'][$action] ?? 0) + 1;

            // Collect errors
            if (!empty($log['error'])) {
                $stats['errors'][] = [
                    'service' => $service,
                    'action' => $action,
                    'error' => $log['error'],
                    'timestamp' => $log['timestamp']
                ];
            }
        }

        return $stats;
    }
}
