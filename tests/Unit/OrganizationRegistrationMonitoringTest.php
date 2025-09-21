<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\User;
use App\Models\Organization;
use App\Models\EmailVerificationToken;
use App\Services\OrganizationRegistrationLogger;
use App\Services\OrganizationRegistrationMonitor;
use App\Services\OrganizationRegistrationOptimizer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class OrganizationRegistrationMonitoringTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected OrganizationRegistrationLogger $logger;
    protected OrganizationRegistrationMonitor $monitor;
    protected OrganizationRegistrationOptimizer $optimizer;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->logger = new OrganizationRegistrationLogger();
        $this->monitor = new OrganizationRegistrationMonitor($this->logger);
        $this->optimizer = new OrganizationRegistrationOptimizer();
    }

    /**
     * Test organization registration logger.
     */
    public function test_organization_registration_logger(): void
    {
        $data = [
            'organization_name' => 'Test Organization',
            'organization_email' => 'org@test.com',
            'admin_email' => 'admin@test.com',
        ];

        // Test logging registration attempt
        $this->logger->logRegistrationAttempt($data, '127.0.0.1', 'Test User Agent');
        
        // Test logging registration success
        $organization = Organization::factory()->create();
        $user = User::factory()->create(['organization_id' => $organization->id]);
        
        $this->logger->logRegistrationSuccess($organization, $user, ['test' => 'data']);
        
        // Test logging registration failure
        $this->logger->logRegistrationFailure($data, 'Test error', '127.0.0.1', ['test' => 'data']);
        
        // Test logging email verification attempt
        $token = EmailVerificationToken::factory()->create();
        $this->logger->logEmailVerificationAttempt($token->token, '127.0.0.1', 'Test User Agent');
        
        // Test logging email verification success
        $this->logger->logEmailVerificationSuccess($user, $organization, $token);
        
        // Test logging email verification failure
        $this->logger->logEmailVerificationFailure('invalid-token', 'Test error', '127.0.0.1');
        
        // Test logging resend verification attempt
        $this->logger->logResendVerificationAttempt('admin@test.com', 'organization_verification', '127.0.0.1');
        
        // Test logging resend verification success
        $this->logger->logResendVerificationSuccess('admin@test.com', 'organization_verification', $token);
        
        // Test logging organization approval
        $approvedBy = User::factory()->create();
        $this->logger->logOrganizationApproval($organization, $user, $approvedBy, ['test' => 'data']);
        
        // Test logging organization rejection
        $rejectedBy = User::factory()->create();
        $this->logger->logOrganizationRejection($organization, $user, $rejectedBy, 'Test reason', ['test' => 'data']);
        
        // Test logging rate limit exceeded
        $this->logger->logRateLimitExceeded('127.0.0.1', '/api/register-organization', 5, 3);
        
        // Test logging security violation
        $this->logger->logSecurityViolation('xss_attempt', '127.0.0.1', ['test' => 'data'], 'Test User Agent');
        
        $this->assertTrue(true); // If we get here, all logging methods executed without errors
    }

    /**
     * Test organization registration monitor.
     */
    public function test_organization_registration_monitor(): void
    {
        // Test monitoring registration health
        $health = $this->monitor->monitorRegistrationHealth();
        
        $this->assertArrayHasKey('timestamp', $health);
        $this->assertArrayHasKey('status', $health);
        $this->assertArrayHasKey('checks', $health);
        $this->assertArrayHasKey('metrics', $health);
        $this->assertArrayHasKey('alerts', $health);
        
        // Test getting dashboard data
        $dashboardData = $this->monitor->getDashboardData();
        
        $this->assertArrayHasKey('health', $dashboardData);
        $this->assertArrayHasKey('statistics', $dashboardData);
        $this->assertArrayHasKey('performance', $dashboardData);
        $this->assertArrayHasKey('recent_activity', $dashboardData);
        
        // Test cleanup expired data
        $cleanupResults = $this->monitor->cleanupExpiredData();
        
        $this->assertArrayHasKey('expired_tokens_cleaned', $cleanupResults);
        $this->assertArrayHasKey('old_logs_cleaned', $cleanupResults);
    }

    /**
     * Test organization registration optimizer.
     */
    public function test_organization_registration_optimizer(): void
    {
        // Test optimizing database queries
        $optimizationResults = $this->optimizer->optimizeDatabaseQueries();
        
        $this->assertArrayHasKey('indexes', $optimizationResults);
        $this->assertArrayHasKey('query_optimizations', $optimizationResults);
        $this->assertArrayHasKey('cleanup', $optimizationResults);
        $this->assertArrayHasKey('cache_optimization', $optimizationResults);
        
        // Test getting database performance metrics
        $metrics = $this->optimizer->getDatabasePerformanceMetrics();
        
        $this->assertArrayHasKey('table_sizes', $metrics);
        $this->assertArrayHasKey('index_usage', $metrics);
        $this->assertArrayHasKey('query_performance', $metrics);
        $this->assertArrayHasKey('connection_stats', $metrics);
        
        // Test running database maintenance
        $maintenanceResults = $this->optimizer->runDatabaseMaintenance();
        
        $this->assertIsArray($maintenanceResults);
    }

    /**
     * Test registration statistics.
     */
    public function test_registration_statistics(): void
    {
        $startDate = now()->subDays(30);
        $endDate = now();
        
        $statistics = $this->logger->getRegistrationStatistics($startDate, $endDate);
        
        $this->assertArrayHasKey('period', $statistics);
        $this->assertArrayHasKey('total_attempts', $statistics);
        $this->assertArrayHasKey('successful_registrations', $statistics);
        $this->assertArrayHasKey('failed_registrations', $statistics);
        $this->assertArrayHasKey('email_verifications', $statistics);
        $this->assertArrayHasKey('failed_verifications', $statistics);
        $this->assertArrayHasKey('organizations_approved', $statistics);
        $this->assertArrayHasKey('organizations_rejected', $statistics);
        $this->assertArrayHasKey('rate_limit_violations', $statistics);
        $this->assertArrayHasKey('security_violations', $statistics);
        $this->assertArrayHasKey('success_rate', $statistics);
        $this->assertArrayHasKey('verification_rate', $statistics);
        $this->assertArrayHasKey('approval_rate', $statistics);
    }

    /**
     * Test performance metrics.
     */
    public function test_performance_metrics(): void
    {
        $startDate = now()->subDays(7);
        $endDate = now();
        
        $metrics = $this->logger->getPerformanceMetrics($startDate, $endDate);
        
        $this->assertArrayHasKey('period', $metrics);
        $this->assertArrayHasKey('average_registration_time', $metrics);
        $this->assertArrayHasKey('average_verification_time', $metrics);
        $this->assertArrayHasKey('average_approval_time', $metrics);
        $this->assertArrayHasKey('peak_registration_hours', $metrics);
    }

    /**
     * Test recent security events.
     */
    public function test_recent_security_events(): void
    {
        $events = $this->logger->getRecentSecurityEvents(50);
        
        $this->assertIsArray($events);
    }

    /**
     * Test database health monitoring.
     */
    public function test_database_health_monitoring(): void
    {
        $health = $this->monitor->monitorRegistrationHealth();
        
        // Test database connectivity check
        $this->assertArrayHasKey('database', $health['checks']);
        $this->assertArrayHasKey('status', $health['checks']['database']);
        
        // Test email service check
        $this->assertArrayHasKey('email_service', $health['checks']);
        $this->assertArrayHasKey('status', $health['checks']['email_service']);
        
        // Test rate limiting check
        $this->assertArrayHasKey('rate_limiting', $health['checks']);
        $this->assertArrayHasKey('status', $health['checks']['rate_limiting']);
        
        // Test pending verifications check
        $this->assertArrayHasKey('pending_verifications', $health['checks']);
        $this->assertArrayHasKey('status', $health['checks']['pending_verifications']);
        
        // Test pending approvals check
        $this->assertArrayHasKey('pending_approvals', $health['checks']);
        $this->assertArrayHasKey('status', $health['checks']['pending_approvals']);
    }

    /**
     * Test system alerts.
     */
    public function test_system_alerts(): void
    {
        $health = $this->monitor->monitorRegistrationHealth();
        
        $this->assertArrayHasKey('alerts', $health);
        $this->assertIsArray($health['alerts']);
        
        // Test alert structure if alerts exist
        if (!empty($health['alerts'])) {
            $alert = $health['alerts'][0];
            $this->assertArrayHasKey('type', $alert);
            $this->assertArrayHasKey('severity', $alert);
            $this->assertArrayHasKey('message', $alert);
            $this->assertArrayHasKey('timestamp', $alert);
        }
    }

    /**
     * Test cache optimization.
     */
    public function test_cache_optimization(): void
    {
        // Test cache optimization
        $optimizationResults = $this->optimizer->optimizeDatabaseQueries();
        
        $this->assertArrayHasKey('cache_optimization', $optimizationResults);
        $this->assertIsArray($optimizationResults['cache_optimization']);
    }

    /**
     * Test data cleanup.
     */
    public function test_data_cleanup(): void
    {
        // Create some test data
        $expiredToken = EmailVerificationToken::factory()->create([
            'expires_at' => now()->subDays(35),
            'is_used' => false,
        ]);
        
        $usedToken = EmailVerificationToken::factory()->create([
            'is_used' => true,
            'used_at' => now()->subDays(10),
        ]);
        
        // Test cleanup
        $cleanupResults = $this->monitor->cleanupExpiredData();
        
        $this->assertArrayHasKey('expired_tokens_cleaned', $cleanupResults);
        $this->assertArrayHasKey('old_logs_cleaned', $cleanupResults);
    }

    /**
     * Test monitoring with real data.
     */
    public function test_monitoring_with_real_data(): void
    {
        // Create test organizations
        $organizations = Organization::factory()->count(5)->create();
        
        // Create test users
        $users = User::factory()->count(5)->create();
        
        // Create test verification tokens
        $tokens = EmailVerificationToken::factory()->count(3)->create();
        
        // Test monitoring with real data
        $health = $this->monitor->monitorRegistrationHealth();
        $dashboardData = $this->monitor->getDashboardData();
        
        $this->assertArrayHasKey('health', $dashboardData);
        $this->assertArrayHasKey('statistics', $dashboardData);
        $this->assertArrayHasKey('performance', $dashboardData);
        $this->assertArrayHasKey('recent_activity', $dashboardData);
        
        // Test recent activity
        $recentActivity = $dashboardData['recent_activity'];
        $this->assertArrayHasKey('recent_organizations', $recentActivity);
        $this->assertArrayHasKey('pending_approvals', $recentActivity);
        $this->assertArrayHasKey('pending_verifications', $recentActivity);
    }

    /**
     * Test error handling in monitoring.
     */
    public function test_monitoring_error_handling(): void
    {
        // Test monitoring with invalid data
        $health = $this->monitor->monitorRegistrationHealth();
        
        // Should not throw exceptions
        $this->assertArrayHasKey('status', $health);
        $this->assertContains($health['status'], ['healthy', 'warning', 'unhealthy', 'critical', 'error']);
    }

    /**
     * Test optimization error handling.
     */
    public function test_optimization_error_handling(): void
    {
        // Test optimization with potential errors
        $optimizationResults = $this->optimizer->optimizeDatabaseQueries();
        
        // Should not throw exceptions
        $this->assertIsArray($optimizationResults);
        $this->assertArrayHasKey('indexes', $optimizationResults);
        $this->assertArrayHasKey('query_optimizations', $optimizationResults);
        $this->assertArrayHasKey('cleanup', $optimizationResults);
        $this->assertArrayHasKey('cache_optimization', $optimizationResults);
    }
}
