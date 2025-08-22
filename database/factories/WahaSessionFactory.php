<?php

namespace Database\Factories;

use App\Models\WahaSession;
use App\Models\Organization;
use App\Models\ChannelConfig;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\WahaSession>
 */
class WahaSessionFactory extends Factory
{
    protected $model = WahaSession::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $sessionName = 'waha_' . $this->faker->randomNumber(6);
        $phoneNumber = '62' . $this->faker->numberBetween(8000000000, 8999999999);

        return [
            'organization_id' => Organization::factory(),
            'channel_config_id' => ChannelConfig::factory(),
            'session_name' => $sessionName,
            'waha_instance_url' => $this->faker->url() . '/api',
            'waha_api_key' => 'waha_' . $this->faker->md5(),
            'phone_number' => $phoneNumber,
            'business_name' => $this->faker->company(),
            'business_description' => $this->faker->catchPhrase(),
            'business_category' => $this->faker->randomElement([
                'Financial Services', 'Technology', 'E-commerce', 'Education',
                'Healthcare', 'Real Estate', 'Automotive', 'Food & Beverage'
            ]),
            'business_website' => $this->faker->url(),
            'business_email' => $this->faker->companyEmail(),
            'status' => $this->faker->randomElement([
                WahaSession::STATUS_WORKING,
                WahaSession::STATUS_STARTING,
                WahaSession::STATUS_SCAN_QR,
                WahaSession::STATUS_STOPPED,
            ]),
            'qr_code' => null,
            'qr_expires_at' => null,
            'is_authenticated' => $this->faker->boolean(80),
            'last_seen_at' => $this->faker->dateTimeBetween('-1 hour', 'now'),
            'wa_version' => $this->faker->randomElement(['2.2347.52', '2.2348.51', '2.2349.50']),
            'platform' => $this->faker->randomElement(['android', 'ios', 'web']),
            'battery_level' => $this->faker->numberBetween(20, 100),
            'is_connected' => $this->faker->boolean(85),
            'connection_state' => $this->faker->randomElement(['open', 'connecting', 'close']),
            'webhook_url' => $this->faker->url() . '/webhook/waha',
            'webhook_events' => [
                WahaSession::WEBHOOK_MESSAGE,
                WahaSession::WEBHOOK_STATE_CHANGE,
                WahaSession::WEBHOOK_MESSAGE_ACK,
            ],
            'webhook_secret' => $this->faker->sha256(),
            'features' => [
                'multidevice' => true,
                'groups' => $this->faker->boolean(90),
                'broadcast' => $this->faker->boolean(30),
                'business' => $this->faker->boolean(40),
                'media_upload' => true,
                'voice_messages' => true,
                'location_sharing' => $this->faker->boolean(80),
                'contact_sharing' => $this->faker->boolean(70),
            ],
            'rate_limits' => [
                'messages_per_minute' => $this->faker->numberBetween(15, 25),
                'messages_per_hour' => $this->faker->numberBetween(800, 1200),
                'media_per_minute' => $this->faker->numberBetween(3, 8),
                'media_per_hour' => $this->faker->numberBetween(80, 120),
            ],
            'health_status' => $this->faker->randomElement([
                WahaSession::HEALTH_HEALTHY,
                WahaSession::HEALTH_WARNING,
                WahaSession::HEALTH_CRITICAL,
            ]),
            'last_health_check' => $this->faker->dateTimeBetween('-30 minutes', 'now'),
            'error_count' => $this->faker->numberBetween(0, 5),
            'last_error' => $this->faker->optional(0.3)->sentence(),
            'restart_count' => $this->faker->numberBetween(0, 3),
            'total_messages_sent' => $this->faker->numberBetween(0, 1000),
            'total_messages_received' => $this->faker->numberBetween(0, 1500),
            'total_media_sent' => $this->faker->numberBetween(0, 100),
            'total_media_received' => $this->faker->numberBetween(0, 150),
            'uptime_percentage' => $this->faker->randomFloat(2, 85.00, 99.99),
            'config' => [
                'auto_restart' => $this->faker->boolean(70),
                'max_retries' => $this->faker->numberBetween(3, 10),
                'timeout_seconds' => $this->faker->numberBetween(30, 120),
                'debug_mode' => $this->faker->boolean(20),
            ],
            'metadata' => [
                'created_by' => $this->faker->name(),
                'environment' => $this->faker->randomElement(['production', 'staging', 'development']),
                'tags' => $this->faker->words(3),
            ],
            'status_type' => 'active',
        ];
    }

    /**
     * Configure the factory for a working session state
     */
    public function working(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => WahaSession::STATUS_WORKING,
            'is_authenticated' => true,
            'is_connected' => true,
            'health_status' => WahaSession::HEALTH_HEALTHY,
            'error_count' => 0,
            'last_error' => null,
            'qr_code' => null,
            'qr_expires_at' => null,
        ]);
    }

    /**
     * Configure the factory for a session that needs QR authentication
     */
    public function needsQrAuth(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => WahaSession::STATUS_SCAN_QR,
            'is_authenticated' => false,
            'is_connected' => false,
            'qr_code' => 'data:image/png;base64,' . base64_encode($this->faker->text(200)),
            'qr_expires_at' => now()->addMinutes(5),
        ]);
    }

    /**
     * Configure the factory for a stopped session
     */
    public function stopped(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => WahaSession::STATUS_STOPPED,
            'is_authenticated' => false,
            'is_connected' => false,
            'health_status' => WahaSession::HEALTH_UNKNOWN,
            'last_seen_at' => $this->faker->dateTimeBetween('-2 hours', '-30 minutes'),
        ]);
    }

    /**
     * Configure the factory for a failed session
     */
    public function failed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => WahaSession::STATUS_FAILED,
            'is_authenticated' => false,
            'is_connected' => false,
            'health_status' => WahaSession::HEALTH_CRITICAL,
            'error_count' => $this->faker->numberBetween(5, 15),
            'last_error' => 'Connection timeout after multiple retry attempts',
        ]);
    }

    /**
     * Configure the factory for a business account
     */
    public function business(): static
    {
        return $this->state(fn (array $attributes) => [
            'features' => array_merge($attributes['features'] ?? [], [
                'business' => true,
                'catalog' => true,
                'labels' => true,
            ]),
            'business_name' => $this->faker->company(),
            'business_category' => $this->faker->randomElement([
                'Financial Services', 'E-commerce', 'Technology', 'Healthcare'
            ]),
            'business_description' => $this->faker->paragraph(),
        ]);
    }

    /**
     * Configure the factory with high message volume
     */
    public function highVolume(): static
    {
        return $this->state(fn (array $attributes) => [
            'total_messages_sent' => $this->faker->numberBetween(5000, 50000),
            'total_messages_received' => $this->faker->numberBetween(8000, 60000),
            'total_media_sent' => $this->faker->numberBetween(500, 5000),
            'total_media_received' => $this->faker->numberBetween(800, 6000),
            'rate_limits' => [
                'messages_per_minute' => 50,
                'messages_per_hour' => 2000,
                'media_per_minute' => 15,
                'media_per_hour' => 500,
            ],
        ]);
    }

    /**
     * Configure the factory with poor health status
     */
    public function unhealthy(): static
    {
        return $this->state(fn (array $attributes) => [
            'health_status' => $this->faker->randomElement([
                WahaSession::HEALTH_WARNING,
                WahaSession::HEALTH_CRITICAL,
            ]),
            'error_count' => $this->faker->numberBetween(10, 25),
            'uptime_percentage' => $this->faker->randomFloat(2, 60.00, 84.99),
            'restart_count' => $this->faker->numberBetween(5, 15),
            'last_error' => $this->faker->randomElement([
                'WhatsApp connection lost',
                'Rate limit exceeded',
                'Authentication failed',
                'Network timeout',
                'Server error 500',
            ]),
        ]);
    }

    /**
     * Configure the factory for development environment
     */
    public function development(): static
    {
        return $this->state(fn (array $attributes) => [
            'waha_instance_url' => 'http://localhost:3000/api',
            'config' => array_merge($attributes['config'] ?? [], [
                'debug_mode' => true,
                'environment' => 'development',
            ]),
            'metadata' => array_merge($attributes['metadata'] ?? [], [
                'environment' => 'development',
                'debug_enabled' => true,
            ]),
        ]);
    }

    /**
     * Configure the factory for production environment
     */
    public function production(): static
    {
        return $this->state(fn (array $attributes) => [
            'config' => array_merge($attributes['config'] ?? [], [
                'debug_mode' => false,
                'environment' => 'production',
                'auto_restart' => true,
                'max_retries' => 5,
            ]),
            'metadata' => array_merge($attributes['metadata'] ?? [], [
                'environment' => 'production',
                'monitoring_enabled' => true,
            ]),
        ]);
    }

    /**
     * Configure the factory with specific organization
     */
    public function forOrganization(Organization $organization): static
    {
        return $this->state(fn (array $attributes) => [
            'organization_id' => $organization->id,
        ]);
    }

    /**
     * Configure the factory with specific channel config
     */
    public function forChannelConfig(ChannelConfig $channelConfig): static
    {
        return $this->state(fn (array $attributes) => [
            'channel_config_id' => $channelConfig->id,
            'organization_id' => $channelConfig->organization_id,
        ]);
    }
}
