<?php

namespace Database\Factories;

use App\Models\Customer;
use App\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;

class CustomerFactory extends Factory
{
    protected $model = Customer::class;

    public function definition(): array
    {
        $firstName = $this->faker->firstName();
        $lastName = $this->faker->lastName();
        $fullName = $firstName . ' ' . $lastName;
        $channel = $this->faker->randomElement(['whatsapp', 'webchat', 'telegram', 'facebook']);

        return [
            'organization_id' => Organization::factory(),
            'external_id' => $this->faker->optional()->uuid(),
            'name' => $fullName,
            'first_name' => $firstName,
            'last_name' => $lastName,
            'email' => $this->faker->optional(70)->email(),
            'phone' => $this->faker->optional(80)->phoneNumber(),
            'channel' => $channel,
            'channel_user_id' => $this->generateChannelUserId($channel),
            'avatar_url' => $this->faker->optional()->imageUrl(100, 100, 'people'),
            'language' => $this->faker->randomElement(['indonesia', 'english', 'javanese']),
            'timezone' => 'Asia/Jakarta',
            'profile_data' => [
                'age_range' => $this->faker->randomElement(['18-25', '26-35', '36-45', '46-55', '55+']),
                'gender' => $this->faker->randomElement(['male', 'female', 'other']),
                'city' => $this->faker->city(),
                'occupation' => $this->faker->optional()->jobTitle(),
            ],
            'preferences' => [
                'communication_style' => $this->faker->randomElement(['formal', 'casual', 'friendly']),
                'preferred_language' => $this->faker->randomElement(['id', 'en']),
                'notification_frequency' => $this->faker->randomElement(['immediate', 'hourly', 'daily']),
            ],
            'tags' => $this->faker->optional()->randomElements([
                'vip', 'new_customer', 'returning', 'high_value', 'potential_churn',
                'satisfied', 'needs_attention', 'tech_savvy', 'prefers_human'
            ], $this->faker->numberBetween(0, 3)),
            'segments' => $this->faker->optional()->randomElements([
                'high_value', 'frequent_user', 'new_user', 'at_risk', 'champions', 'loyalists'
            ], $this->faker->numberBetween(0, 2)),
            'source' => $this->faker->randomElement([
                'website', 'social_media', 'referral', 'advertising', 'direct', 'search'
            ]),
            'utm_data' => [
                'utm_source' => $this->faker->optional()->randomElement(['google', 'facebook', 'instagram', 'direct']),
                'utm_medium' => $this->faker->optional()->randomElement(['organic', 'cpc', 'social', 'email']),
                'utm_campaign' => $this->faker->optional()->slug(2),
            ],
            'last_interaction_at' => $this->faker->optional()->dateTimeBetween('-30 days', 'now'),
            'total_interactions' => $this->faker->numberBetween(0, 50),
            'total_messages' => $this->faker->numberBetween(0, 200),
            'avg_response_time' => $this->faker->optional()->numberBetween(30, 300), // seconds
            'satisfaction_score' => $this->faker->optional()->randomFloat(2, 1, 5),
            'interaction_patterns' => [
                'most_active_hour' => $this->faker->numberBetween(8, 20),
                'most_active_day' => $this->faker->randomElement(['monday', 'tuesday', 'wednesday', 'thursday', 'friday']),
                'session_duration_avg' => $this->faker->numberBetween(300, 1800), // seconds
            ],
            'interests' => $this->faker->optional()->randomElements([
                'technology', 'finance', 'travel', 'food', 'sports', 'entertainment',
                'education', 'health', 'shopping', 'gaming'
            ], $this->faker->numberBetween(0, 4)),
            'purchase_history' => [
                'total_orders' => $this->faker->numberBetween(0, 10),
                'total_value' => $this->faker->optional()->randomFloat(2, 100000, 5000000),
                'last_purchase' => $this->faker->optional()->dateTimeBetween('-365 days', 'now'),
                'favorite_category' => $this->faker->optional()->randomElement(['electronics', 'fashion', 'home', 'books']),
            ],
            'sentiment_history' => $this->generateSentimentHistory(),
            'intent_patterns' => [
                'most_common_intent' => $this->faker->randomElement([
                    'support', 'information', 'complaint', 'compliment', 'purchase_inquiry'
                ]),
                'resolution_preference' => $this->faker->randomElement(['self_service', 'human_agent', 'chatbot']),
            ],
            'engagement_score' => $this->faker->randomFloat(2, 0, 1),
            'notes' => $this->faker->optional()->sentence(),
            'status' => 'active',
        ];
    }

    private function generateChannelUserId(string $channel): string
    {
        return match ($channel) {
            'whatsapp' => '+62' . $this->faker->numerify('8##########'),
            'telegram' => '@' . $this->faker->userName(),
            'facebook' => 'fb_' . $this->faker->numerify('##############'),
            'webchat' => 'web_' . $this->faker->uuid(),
            default => $this->faker->uuid(),
        };
    }

    private function generateSentimentHistory(): array
    {
        $history = [];
        $count = $this->faker->numberBetween(0, 10);

        for ($i = 0; $i < $count; $i++) {
            $history[] = [
                'sentiment' => $this->faker->randomElement(['positive', 'negative', 'neutral']),
                'score' => $this->faker->randomFloat(2, -1, 1),
                'timestamp' => $this->faker->dateTimeBetween('-30 days', 'now')->toISOString(),
                'context' => $this->faker->optional()->sentence(),
            ];
        }

        return $history;
    }

    public function vip(): static
    {
        return $this->state(fn (array $attributes) => [
            'tags' => array_merge($attributes['tags'] ?? [], ['vip']),
            'segments' => array_merge($attributes['segments'] ?? [], ['high_value', 'champions']),
            'satisfaction_score' => $this->faker->randomFloat(2, 4, 5),
            'engagement_score' => $this->faker->randomFloat(2, 0.8, 1),
            'purchase_history' => [
                'total_orders' => $this->faker->numberBetween(10, 50),
                'total_value' => $this->faker->randomFloat(2, 5000000, 50000000),
                'last_purchase' => $this->faker->dateTimeBetween('-30 days', 'now'),
            ],
        ]);
    }

    public function newCustomer(): static
    {
        return $this->state(fn (array $attributes) => [
            'tags' => ['new_customer'],
            'segments' => ['new_user'],
            'total_interactions' => $this->faker->numberBetween(1, 3),
            'total_messages' => $this->faker->numberBetween(1, 10),
            'last_interaction_at' => $this->faker->dateTimeBetween('-7 days', 'now'),
        ]);
    }

    public function highEngagement(): static
    {
        return $this->state(fn (array $attributes) => [
            'engagement_score' => $this->faker->randomFloat(2, 0.8, 1),
            'total_interactions' => $this->faker->numberBetween(20, 50),
            'total_messages' => $this->faker->numberBetween(100, 300),
            'last_interaction_at' => $this->faker->dateTimeBetween('-3 days', 'now'),
        ]);
    }

    public function atRisk(): static
    {
        return $this->state(fn (array $attributes) => [
            'tags' => array_merge($attributes['tags'] ?? [], ['potential_churn', 'needs_attention']),
            'segments' => ['at_risk'],
            'satisfaction_score' => $this->faker->randomFloat(2, 1, 2.5),
            'last_interaction_at' => $this->faker->dateTimeBetween('-30 days', '-7 days'),
            'engagement_score' => $this->faker->randomFloat(2, 0, 0.3),
        ]);
    }

    public function whatsapp(): static
    {
        return $this->state(fn (array $attributes) => [
            'channel' => 'whatsapp',
            'channel_user_id' => '+62' . $this->faker->numerify('8##########'),
        ]);
    }

    public function webchat(): static
    {
        return $this->state(fn (array $attributes) => [
            'channel' => 'webchat',
            'channel_user_id' => 'web_' . $this->faker->uuid(),
        ]);
    }

    public function telegram(): static
    {
        return $this->state(fn (array $attributes) => [
            'channel' => 'telegram',
            'channel_user_id' => '@' . $this->faker->userName(),
        ]);
    }
}
