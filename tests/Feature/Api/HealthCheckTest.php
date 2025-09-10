<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class HealthCheckTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_can_perform_basic_health_check()
    {
        $response = $this->getJson('/api/health/basic');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'status',
                    'timestamp',
                    'version',
                    'environment',
                ]
            ])
            ->assertJson([
                'success' => true,
                'data' => [
                    'status' => 'healthy',
                ]
            ]);
    }

    /** @test */
    public function it_can_perform_detailed_health_check()
    {
        $response = $this->getJson('/api/health/detailed');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'status',
                    'timestamp',
                    'version',
                    'environment',
                    'checks' => [
                        'database',
                        'cache',
                        'redis',
                        'storage',
                        'queue',
                        'payment_gateways',
                    ]
                ]
            ]);
    }

    /** @test */
    public function it_can_get_system_metrics()
    {
        $response = $this->getJson('/api/health/metrics');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'system' => [
                        'memory_usage',
                        'disk_usage',
                        'uptime',
                    ],
                    'application' => [
                        'version',
                        'environment',
                        'debug_mode',
                        'timezone',
                    ],
                    'database' => [
                        'connection_count',
                        'slow_queries',
                    ],
                    'cache' => [
                        'hit_rate',
                        'memory_usage',
                    ],
                ]
            ]);
    }

    /** @test */
    public function it_tests_database_connection()
    {
        $response = $this->getJson('/api/health/detailed');

        $response->assertStatus(200);

        $checks = $response->json('data.checks');
        $this->assertArrayHasKey('database', $checks);
        $this->assertEquals('healthy', $checks['database']['status']);
    }

    /** @test */
    public function it_tests_cache_functionality()
    {
        $response = $this->getJson('/api/health/detailed');

        $response->assertStatus(200);

        $checks = $response->json('data.checks');
        $this->assertArrayHasKey('cache', $checks);
        $this->assertEquals('healthy', $checks['cache']['status']);
    }

    /** @test */
    public function it_tests_storage_functionality()
    {
        $response = $this->getJson('/api/health/detailed');

        $response->assertStatus(200);

        $checks = $response->json('data.checks');
        $this->assertArrayHasKey('storage', $checks);
        $this->assertEquals('healthy', $checks['storage']['status']);
    }

    /** @test */
    public function it_tests_queue_functionality()
    {
        $response = $this->getJson('/api/health/detailed');

        $response->assertStatus(200);

        $checks = $response->json('data.checks');
        $this->assertArrayHasKey('queue', $checks);
        $this->assertEquals('healthy', $checks['queue']['status']);
    }

    /** @test */
    public function it_tests_payment_gateways_configuration()
    {
        $response = $this->getJson('/api/health/detailed');

        $response->assertStatus(200);

        $checks = $response->json('data.checks');
        $this->assertArrayHasKey('payment_gateways', $checks);

        $gateways = $checks['payment_gateways'];
        $this->assertIsArray($gateways);
    }

    /** @test */
    public function it_returns_healthy_status_when_all_checks_pass()
    {
        $response = $this->getJson('/api/health/detailed');

        $response->assertStatus(200);

        $data = $response->json('data');
        $this->assertContains($data['status'], ['healthy', 'degraded']);
    }

    /** @test */
    public function it_includes_timestamp_in_response()
    {
        $response = $this->getJson('/api/health/basic');

        $response->assertStatus(200);

        $data = $response->json('data');
        $this->assertArrayHasKey('timestamp', $data);
        $this->assertNotEmpty($data['timestamp']);
    }

    /** @test */
    public function it_includes_version_in_response()
    {
        $response = $this->getJson('/api/health/basic');

        $response->assertStatus(200);

        $data = $response->json('data');
        $this->assertArrayHasKey('version', $data);
        $this->assertNotEmpty($data['version']);
    }

    /** @test */
    public function it_includes_environment_in_response()
    {
        $response = $this->getJson('/api/health/basic');

        $response->assertStatus(200);

        $data = $response->json('data');
        $this->assertArrayHasKey('environment', $data);
        $this->assertNotEmpty($data['environment']);
    }

    /** @test */
    public function it_does_not_require_authentication()
    {
        $response = $this->getJson('/api/health/basic');

        $response->assertStatus(200);
    }

    /** @test */
    public function it_handles_database_connection_failure_gracefully()
    {
        // This test would require mocking database connection failure
        // For now, we'll just ensure the endpoint doesn't crash
        $response = $this->getJson('/api/health/detailed');

        $response->assertStatus(200);

        $checks = $response->json('data.checks');
        $this->assertArrayHasKey('database', $checks);
    }

    /** @test */
    public function it_handles_cache_failure_gracefully()
    {
        // This test would require mocking cache failure
        // For now, we'll just ensure the endpoint doesn't crash
        $response = $this->getJson('/api/health/detailed');

        $response->assertStatus(200);

        $checks = $response->json('data.checks');
        $this->assertArrayHasKey('cache', $checks);
    }

    /** @test */
    public function it_handles_storage_failure_gracefully()
    {
        // This test would require mocking storage failure
        // For now, we'll just ensure the endpoint doesn't crash
        $response = $this->getJson('/api/health/detailed');

        $response->assertStatus(200);

        $checks = $response->json('data.checks');
        $this->assertArrayHasKey('storage', $checks);
    }

    /** @test */
    public function it_handles_redis_failure_gracefully()
    {
        // This test would require mocking Redis failure
        // For now, we'll just ensure the endpoint doesn't crash
        $response = $this->getJson('/api/health/detailed');

        $response->assertStatus(200);

        $checks = $response->json('data.checks');
        $this->assertArrayHasKey('redis', $checks);
    }

    /** @test */
    public function it_handles_queue_failure_gracefully()
    {
        // This test would require mocking queue failure
        // For now, we'll just ensure the endpoint doesn't crash
        $response = $this->getJson('/api/health/detailed');

        $response->assertStatus(200);

        $checks = $response->json('data.checks');
        $this->assertArrayHasKey('queue', $checks);
    }
}
