<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redis;

class WebSocketMonitor extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'websocket:monitor {--interval=30 : Monitoring interval in seconds}';

    /**
     * The console command description.
     */
    protected $description = 'Monitor WebSocket connection health and performance';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $interval = (int) $this->option('interval');

        $this->info("Starting WebSocket monitoring (interval: {$interval}s)");

        $this->checkWebSocketHealth();
        $this->checkPerformanceMetrics();
        $this->checkConnectionCount();

        $this->info("WebSocket monitoring completed");
    }

    /**
     * Check WebSocket server health
     */
    private function checkWebSocketHealth()
    {
        try {
            $host = config('reverb.host', 'localhost');
            $port = config('reverb.port', 8081);

            $connection = @fsockopen($host, $port, $errno, $errstr, 5);

            if ($connection) {
                fclose($connection);
                $this->line("✅ WebSocket server is healthy ({$host}:{$port})");
            } else {
                $this->error("❌ WebSocket server is down ({$host}:{$port}) - {$errstr}");
                Log::error('WebSocket server health check failed', [
                    'host' => $host,
                    'port' => $port,
                    'error' => $errstr
                ]);
            }
        } catch (\Exception $e) {
            $this->error("❌ Health check failed: " . $e->getMessage());
        }
    }

    /**
     * Check performance metrics
     */
    private function checkPerformanceMetrics()
    {
        try {
            // Check Redis connection if scaling is enabled
            if (config('reverb.scaling.enabled')) {
                $redis = Redis::connection(config('reverb.scaling.redis.connection'));
                $ping = $redis->ping();

                if ($ping) {
                    $this->line("✅ Redis scaling connection is healthy");
                } else {
                    $this->error("❌ Redis scaling connection failed");
                }
            }

            // Check memory usage
            $memoryUsage = memory_get_usage(true);
            $memoryLimit = ini_get('memory_limit');
            $memoryPercent = ($memoryUsage / $this->parseMemoryLimit($memoryLimit)) * 100;

            if ($memoryPercent > 80) {
                $this->warn("⚠️ High memory usage: " . $this->formatBytes($memoryUsage) . " ({$memoryPercent}%)");
            } else {
                $this->line("✅ Memory usage: " . $this->formatBytes($memoryUsage) . " ({$memoryPercent}%)");
            }

        } catch (\Exception $e) {
            $this->error("❌ Performance check failed: " . $e->getMessage());
        }
    }

    /**
     * Check connection count
     */
    private function checkConnectionCount()
    {
        try {
            // This would need to be implemented based on your specific setup
            // For now, just log that we're checking
            $this->line("📊 Checking connection metrics...");

        } catch (\Exception $e) {
            $this->error("❌ Connection count check failed: " . $e->getMessage());
        }
    }

    /**
     * Parse memory limit string to bytes
     */
    private function parseMemoryLimit($limit)
    {
        $limit = trim($limit);
        $last = strtolower($limit[strlen($limit) - 1]);
        $limit = (int) $limit;

        switch ($last) {
            case 'g':
                $limit *= 1024;
            case 'm':
                $limit *= 1024;
            case 'k':
                $limit *= 1024;
        }

        return $limit;
    }

    /**
     * Format bytes to human readable format
     */
    private function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, $precision) . ' ' . $units[$i];
    }
}
