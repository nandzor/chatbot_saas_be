<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use App\Models\Organization;
use App\Models\User;
use App\Models\EmailVerificationToken;
use Carbon\Carbon;

class OrganizationRegistrationMonitor
{
    protected OrganizationRegistrationLogger $logger;

    public function __construct(OrganizationRegistrationLogger $logger)
    {
        $this->logger = $logger;
    }

    /**
     * Monitor registration health and performance.
     */
    public function monitorRegistrationHealth(): array
    {
        $health = [
            'timestamp' => now()->toISOString(),
            'status' => 'healthy',
            'checks' => [],
            'metrics' => [],
            'alerts' => [],
        ];

        // Check database connectivity
        $health['checks']['database'] = $this->checkDatabaseHealth();
        
        // Check email service
        $health['checks']['email_service'] = $this->checkEmailServiceHealth();
        
        // Check rate limiting
        $health['checks']['rate_limiting'] = $this->checkRateLimitingHealth();
        
        // Check pending verifications
        $health['checks']['pending_verifications'] = $this->checkPendingVerifications();
        
        // Check pending approvals
        $health['checks']['pending_approvals'] = $this->checkPendingApprovals();

        // Get performance metrics
        $health['metrics'] = $this->getPerformanceMetrics();

        // Check for alerts
        $health['alerts'] = $this->checkAlerts();

        // Determine overall status
        $health['status'] = $this->determineOverallStatus($health['checks'], $health['alerts']);

        return $health;
    }

    /**
     * Check database health.
     */
    private function checkDatabaseHealth(): array
    {
        try {
            $startTime = microtime(true);
            DB::connection()->getPdo();
            $responseTime = (microtime(true) - $startTime) * 1000;

            return [
                'status' => 'healthy',
                'response_time_ms' => round($responseTime, 2),
                'message' => 'Database connection successful',
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'unhealthy',
                'error' => $e->getMessage(),
                'message' => 'Database connection failed',
            ];
        }
    }

    /**
     * Check email service health.
     */
    private function checkEmailServiceHealth(): array
    {
        try {
            // Check if email configuration is valid
            $mailConfig = config('mail');
            
            if (empty($mailConfig['default']) || empty($mailConfig['mailers'][$mailConfig['default']])) {
                return [
                    'status' => 'unhealthy',
                    'message' => 'Email configuration is incomplete',
                ];
            }

            return [
                'status' => 'healthy',
                'driver' => $mailConfig['default'],
                'message' => 'Email service configuration is valid',
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'unhealthy',
                'error' => $e->getMessage(),
                'message' => 'Email service check failed',
            ];
        }
    }

    /**
     * Check rate limiting health.
     */
    private function checkRateLimitingHealth(): array
    {
        try {
            $cache = Cache::store();
            $testKey = 'rate_limit_test_' . now()->timestamp;
            
            $startTime = microtime(true);
            $cache->put($testKey, 'test', 60);
            $cache->get($testKey);
            $cache->forget($testKey);
            $responseTime = (microtime(true) - $startTime) * 1000;

            return [
                'status' => 'healthy',
                'response_time_ms' => round($responseTime, 2),
                'message' => 'Rate limiting cache is working',
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'unhealthy',
                'error' => $e->getMessage(),
                'message' => 'Rate limiting cache failed',
            ];
        }
    }

    /**
     * Check pending email verifications.
     */
    private function checkPendingVerifications(): array
    {
        try {
            $pendingCount = EmailVerificationToken::where('is_used', false)
                ->where('expires_at', '>', now())
                ->count();

            $expiredCount = EmailVerificationToken::where('is_used', false)
                ->where('expires_at', '<=', now())
                ->count();

            $status = 'healthy';
            $message = 'Pending verifications are within normal range';

            if ($pendingCount > 100) {
                $status = 'warning';
                $message = 'High number of pending verifications';
            }

            if ($expiredCount > 50) {
                $status = 'warning';
                $message = 'High number of expired verification tokens';
            }

            return [
                'status' => $status,
                'pending_count' => $pendingCount,
                'expired_count' => $expiredCount,
                'message' => $message,
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'unhealthy',
                'error' => $e->getMessage(),
                'message' => 'Failed to check pending verifications',
            ];
        }
    }

    /**
     * Check pending organization approvals.
     */
    private function checkPendingApprovals(): array
    {
        try {
            $pendingCount = Organization::where('status', 'pending_approval')->count();
            $oldestPending = Organization::where('status', 'pending_approval')
                ->orderBy('created_at', 'asc')
                ->first();

            $status = 'healthy';
            $message = 'Pending approvals are within normal range';

            if ($pendingCount > 20) {
                $status = 'warning';
                $message = 'High number of pending approvals';
            }

            $oldestAge = null;
            if ($oldestPending) {
                $oldestAge = now()->diffInHours($oldestPending->created_at);
                if ($oldestAge > 48) {
                    $status = 'warning';
                    $message = 'Oldest pending approval is over 48 hours old';
                }
            }

            return [
                'status' => $status,
                'pending_count' => $pendingCount,
                'oldest_age_hours' => $oldestAge,
                'message' => $message,
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'unhealthy',
                'error' => $e->getMessage(),
                'message' => 'Failed to check pending approvals',
            ];
        }
    }

    /**
     * Get performance metrics.
     */
    private function getPerformanceMetrics(): array
    {
        $last24Hours = now()->subDay();
        $last7Days = now()->subDays(7);

        return [
            'registrations_last_24h' => Organization::where('created_at', '>=', $last24Hours)->count(),
            'registrations_last_7d' => Organization::where('created_at', '>=', $last7Days)->count(),
            'verifications_last_24h' => EmailVerificationToken::where('is_used', true)
                ->where('used_at', '>=', $last24Hours)->count(),
            'approvals_last_24h' => Organization::where('status', 'active')
                ->where('updated_at', '>=', $last24Hours)->count(),
            'average_registration_time' => $this->getAverageRegistrationTime($last24Hours),
            'success_rate_24h' => $this->getSuccessRate($last24Hours),
        ];
    }

    /**
     * Get average registration time.
     */
    private function getAverageRegistrationTime(Carbon $since): float
    {
        // This would typically calculate from audit logs
        // For now, return a placeholder
        return 0.0;
    }

    /**
     * Get success rate.
     */
    private function getSuccessRate(Carbon $since): float
    {
        $totalAttempts = Organization::where('created_at', '>=', $since)->count();
        $successfulRegistrations = Organization::where('created_at', '>=', $since)->count();
        
        return $totalAttempts > 0 ? round(($successfulRegistrations / $totalAttempts) * 100, 2) : 0;
    }

    /**
     * Check for alerts.
     */
    private function checkAlerts(): array
    {
        $alerts = [];

        // Check for high failure rate
        $failureRate = $this->getFailureRate(now()->subHour());
        if ($failureRate > 20) {
            $alerts[] = [
                'type' => 'high_failure_rate',
                'severity' => 'warning',
                'message' => "High registration failure rate: {$failureRate}%",
                'timestamp' => now()->toISOString(),
            ];
        }

        // Check for rate limiting issues
        $rateLimitViolations = $this->getRateLimitViolations(now()->subHour());
        if ($rateLimitViolations > 10) {
            $alerts[] = [
                'type' => 'rate_limit_abuse',
                'severity' => 'warning',
                'message' => "High rate limit violations: {$rateLimitViolations} in the last hour",
                'timestamp' => now()->toISOString(),
            ];
        }

        // Check for security violations
        $securityViolations = $this->getSecurityViolations(now()->subHour());
        if ($securityViolations > 0) {
            $alerts[] = [
                'type' => 'security_violation',
                'severity' => 'critical',
                'message' => "Security violations detected: {$securityViolations} in the last hour",
                'timestamp' => now()->toISOString(),
            ];
        }

        return $alerts;
    }

    /**
     * Get failure rate.
     */
    private function getFailureRate(Carbon $since): float
    {
        // This would typically calculate from logs
        // For now, return a placeholder
        return 0.0;
    }

    /**
     * Get rate limit violations.
     */
    private function getRateLimitViolations(Carbon $since): int
    {
        // This would typically query logs
        // For now, return a placeholder
        return 0;
    }

    /**
     * Get security violations.
     */
    private function getSecurityViolations(Carbon $since): int
    {
        // This would typically query logs
        // For now, return a placeholder
        return 0;
    }

    /**
     * Determine overall system status.
     */
    private function determineOverallStatus(array $checks, array $alerts): string
    {
        // Check for critical alerts
        $criticalAlerts = array_filter($alerts, fn($alert) => $alert['severity'] === 'critical');
        if (!empty($criticalAlerts)) {
            return 'critical';
        }

        // Check for unhealthy services
        $unhealthyChecks = array_filter($checks, fn($check) => $check['status'] === 'unhealthy');
        if (!empty($unhealthyChecks)) {
            return 'unhealthy';
        }

        // Check for warnings
        $warningAlerts = array_filter($alerts, fn($alert) => $alert['severity'] === 'warning');
        $warningChecks = array_filter($checks, fn($check) => $check['status'] === 'warning');
        
        if (!empty($warningAlerts) || !empty($warningChecks)) {
            return 'warning';
        }

        return 'healthy';
    }

    /**
     * Get dashboard data.
     */
    public function getDashboardData(): array
    {
        return [
            'health' => $this->monitorRegistrationHealth(),
            'statistics' => $this->logger->getRegistrationStatistics(),
            'performance' => $this->logger->getPerformanceMetrics(),
            'recent_activity' => $this->getRecentActivity(),
        ];
    }

    /**
     * Get recent activity.
     */
    private function getRecentActivity(): array
    {
        $recentOrganizations = Organization::with('users')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($org) {
                return [
                    'id' => $org->id,
                    'name' => $org->name,
                    'email' => $org->email,
                    'status' => $org->status,
                    'created_at' => $org->created_at->toISOString(),
                    'admin_user' => $org->users->first()?->only(['id', 'email', 'full_name', 'is_email_verified']),
                ];
            });

        return [
            'recent_organizations' => $recentOrganizations,
            'pending_approvals' => Organization::where('status', 'pending_approval')->count(),
            'pending_verifications' => EmailVerificationToken::where('is_used', false)
                ->where('expires_at', '>', now())->count(),
        ];
    }

    /**
     * Clean up expired data.
     */
    public function cleanupExpiredData(): array
    {
        $results = [];

        // Clean up expired verification tokens
        $expiredTokens = EmailVerificationToken::where('expires_at', '<', now()->subDays(7))->delete();
        $results['expired_tokens_cleaned'] = $expiredTokens;

        // Clean up old audit logs (if using database logging)
        // This would typically clean up old log entries
        $results['old_logs_cleaned'] = 0;

        Log::info('Organization registration cleanup completed', $results);

        return $results;
    }
}
