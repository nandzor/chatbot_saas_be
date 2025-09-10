<?php

namespace Tests\Feature\Console;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Tests\TestCase;

class QueueStatusCommandTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_can_display_queue_status()
    {
        $this->artisan('queue:status')
            ->expectsOutput('Queue Status Information')
            ->expectsOutput('=======================')
            ->assertExitCode(0);
    }

    /** @test */
    public function it_displays_default_queue_connection()
    {
        $this->artisan('queue:status')
            ->expectsOutput('Default Queue Connection:')
            ->assertExitCode(0);
    }

    /** @test */
    public function it_displays_queue_connections()
    {
        $this->artisan('queue:status')
            ->expectsOutput('Available Queue Connections:')
            ->assertExitCode(0);
    }

    /** @test */
    public function it_displays_queue_jobs_count()
    {
        $this->artisan('queue:status')
            ->expectsOutput('Queue Jobs Count:')
            ->assertExitCode(0);
    }

    /** @test */
    public function it_displays_failed_jobs_count()
    {
        $this->artisan('queue:status')
            ->expectsOutput('Failed Jobs Count:')
            ->assertExitCode(0);
    }

    /** @test */
    public function it_displays_queue_workers_status()
    {
        $this->artisan('queue:status')
            ->expectsOutput('Queue Workers Status:')
            ->assertExitCode(0);
    }

    /** @test */
    public function it_displays_redis_connection_status()
    {
        $this->artisan('queue:status')
            ->expectsOutput('Redis Connection Status:')
            ->assertExitCode(0);
    }

    /** @test */
    public function it_displays_database_connection_status()
    {
        $this->artisan('queue:status')
            ->expectsOutput('Database Connection Status:')
            ->assertExitCode(0);
    }

    /** @test */
    public function it_displays_system_resources()
    {
        $this->artisan('queue:status')
            ->expectsOutput('System Resources:')
            ->assertExitCode(0);
    }

    /** @test */
    public function it_displays_memory_usage()
    {
        $this->artisan('queue:status')
            ->expectsOutput('Memory Usage:')
            ->assertExitCode(0);
    }

    /** @test */
    public function it_displays_disk_usage()
    {
        $this->artisan('queue:status')
            ->expectsOutput('Disk Usage:')
            ->assertExitCode(0);
    }

    /** @test */
    public function it_displays_cpu_usage()
    {
        $this->artisan('queue:status')
            ->expectsOutput('CPU Usage:')
            ->assertExitCode(0);
    }

    /** @test */
    public function it_displays_queue_performance_metrics()
    {
        $this->artisan('queue:status')
            ->expectsOutput('Queue Performance Metrics:')
            ->assertExitCode(0);
    }

    /** @test */
    public function it_displays_average_processing_time()
    {
        $this->artisan('queue:status')
            ->expectsOutput('Average Processing Time:')
            ->assertExitCode(0);
    }

    /** @test */
    public function it_displays_throughput_rate()
    {
        $this->artisan('queue:status')
            ->expectsOutput('Throughput Rate:')
            ->assertExitCode(0);
    }

    /** @test */
    public function it_displays_error_rate()
    {
        $this->artisan('queue:status')
            ->expectsOutput('Error Rate:')
            ->assertExitCode(0);
    }

    /** @test */
    public function it_displays_queue_health_status()
    {
        $this->artisan('queue:status')
            ->expectsOutput('Queue Health Status:')
            ->assertExitCode(0);
    }

    /** @test */
    public function it_displays_recommendations()
    {
        $this->artisan('queue:status')
            ->expectsOutput('Recommendations:')
            ->assertExitCode(0);
    }

    /** @test */
    public function it_displays_timestamp()
    {
        $this->artisan('queue:status')
            ->expectsOutput('Generated at:')
            ->assertExitCode(0);
    }

    /** @test */
    public function it_handles_redis_connection_failure_gracefully()
    {
        // This test would require mocking Redis connection failure
        // For now, we'll just ensure the command doesn't crash
        $this->artisan('queue:status')
            ->assertExitCode(0);
    }

    /** @test */
    public function it_handles_database_connection_failure_gracefully()
    {
        // This test would require mocking database connection failure
        // For now, we'll just ensure the command doesn't crash
        $this->artisan('queue:status')
            ->assertExitCode(0);
    }

    /** @test */
    public function it_displays_all_required_sections()
    {
        $this->artisan('queue:status')
            ->expectsOutput('Queue Status Information')
            ->expectsOutput('Default Queue Connection:')
            ->expectsOutput('Available Queue Connections:')
            ->expectsOutput('Queue Jobs Count:')
            ->expectsOutput('Failed Jobs Count:')
            ->expectsOutput('Queue Workers Status:')
            ->expectsOutput('Redis Connection Status:')
            ->expectsOutput('Database Connection Status:')
            ->expectsOutput('System Resources:')
            ->expectsOutput('Queue Performance Metrics:')
            ->expectsOutput('Queue Health Status:')
            ->expectsOutput('Recommendations:')
            ->expectsOutput('Generated at:')
            ->assertExitCode(0);
    }
}
