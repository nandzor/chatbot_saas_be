<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ChannelConfig>
 */
class ChannelConfigFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $channels = ['whatsapp', 'webchat', 'telegram', 'facebook', 'instagram', 'line', 'slack', 'discord', 'teams', 'viber', 'wechat'];
        $channel = $this->faker->randomElement($channels);


        return [
            'organization_id' => \App\Models\Organization::factory(),
            'channel' => $channel,
            'channel_identifier' => $channel . '_' . $this->faker->uuid(),
            'name' => ucfirst($channel) . ' Channel',
            'display_name' => ucfirst($channel) . ' Integration',
            'description' => $this->faker->sentence(),
            'personality_id' => \App\Models\BotPersonality::factory(),
            'webhook_url' => $this->faker->optional(0.7)->url(),
            'api_key_encrypted' => $this->faker->optional(0.6)->sha256(),
            'api_secret_encrypted' => $this->faker->optional(0.5)->sha256(),
            'access_token_encrypted' => $this->faker->optional(0.4)->sha256(),
            'refresh_token_encrypted' => $this->faker->optional(0.3)->sha256(),
            'token_expires_at' => $this->faker->optional(0.4)->dateTimeBetween('now', '+1 year'),
            'settings' => [
                'auto_reply' => $this->faker->boolean(70),
                'business_hours' => [
                    'enabled' => $this->faker->boolean(60),
                    'timezone' => $this->faker->timezone(),
                    'schedule' => [
                        'monday' => ['start' => '09:00', 'end' => '17:00'],
                        'tuesday' => ['start' => '09:00', 'end' => '17:00'],
                        'wednesday' => ['start' => '09:00', 'end' => '17:00'],
                        'thursday' => ['start' => '09:00', 'end' => '17:00'],
                        'friday' => ['start' => '09:00', 'end' => '17:00'],
                    ]
                ],
                'greeting_message' => $this->faker->optional(0.8)->sentence(),
                'farewell_message' => $this->faker->optional(0.6)->sentence(),
            ],
            'rate_limits' => [
                'messages_per_minute' => $this->faker->numberBetween(10, 100),
                'messages_per_hour' => $this->faker->numberBetween(100, 1000),
                'messages_per_day' => $this->faker->numberBetween(1000, 10000),
            ],
            'widget_config' => $channel === 'webchat' ? [
                'position' => $this->faker->randomElement(['bottom_right', 'bottom_left', 'top_right', 'top_left']),
                'theme' => $this->faker->randomElement(['light', 'dark', 'auto']),
                'size' => $this->faker->randomElement(['small', 'medium', 'large']),
                'show_avatar' => $this->faker->boolean(80),
                'show_typing' => $this->faker->boolean(70),
            ] : null,
            'theme_config' => [
                'primary_color' => $this->faker->hexColor(),
                'secondary_color' => $this->faker->hexColor(),
                'background_color' => $this->faker->hexColor(),
                'text_color' => $this->faker->hexColor(),
                'border_radius' => $this->faker->numberBetween(0, 20),
            ],
            'supported_message_types' => $this->faker->randomElements(['text', 'image', 'file', 'video', 'audio', 'location', 'contact'], $this->faker->numberBetween(2, 5)),
            'features' => [
                'file_sharing' => $this->faker->boolean(70),
                'location_sharing' => $this->faker->boolean(50),
                'voice_messages' => $this->faker->boolean(60),
                'video_calls' => $this->faker->boolean(30),
                'typing_indicators' => $this->faker->boolean(80),
                'read_receipts' => $this->faker->boolean(70),
            ],
            'is_active' => $this->faker->boolean(80),
            'health_status' => $this->faker->randomElement(['healthy', 'warning', 'error']),
            'last_connected_at' => $this->faker->optional(0.8)->dateTimeBetween('-1 month', 'now'),
            'last_error' => $this->faker->optional(0.2)->sentence(),
            'connection_attempts' => $this->faker->numberBetween(0, 10),
            'total_messages_sent' => $this->faker->numberBetween(0, 10000),
            'total_messages_received' => $this->faker->numberBetween(0, 10000),
            'uptime_percentage' => $this->faker->randomFloat(2, 85, 100),
            'status' => $this->faker->randomElement(['active', 'inactive', 'suspended']),
        ];
    }
}
