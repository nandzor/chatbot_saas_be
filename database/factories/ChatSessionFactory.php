<?php

namespace Database\Factories;

use App\Models\Agent;
use App\Models\ChannelConfig;
use App\Models\ChatSession;
use App\Models\Customer;
use App\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;

class ChatSessionFactory extends Factory
{
    protected $model = ChatSession::class;

    public function definition(): array
    {
        $startedAt = $this->faker->dateTimeBetween('-30 days', 'now');
        $isActive = $this->faker->boolean(30);
        $endedAt = $isActive ? null : $this->faker->dateTimeBetween($startedAt, 'now');
        $isBotSession = $this->faker->boolean(70);

        return [
            'organization_id' => Organization::factory(),
            'customer_id' => Customer::factory(),
            'channel_config_id' => ChannelConfig::factory(),
            'agent_id' => $isBotSession ? null : Agent::factory(),
            'session_token' => 'sess_' . $this->faker->uuid(),
            'session_type' => $this->faker->randomElement(['customer_initiated', 'agent_initiated', 'bot_initiated']),
            'started_at' => $startedAt,
            'ended_at' => $endedAt,
            'last_activity_at' => $endedAt ?? $this->faker->dateTimeBetween($startedAt, 'now'),
            'first_response_at' => $this->faker->optional()->dateTimeBetween($startedAt, $endedAt ?? 'now'),
            'is_active' => $isActive,
            'is_bot_session' => $isBotSession,
            'handover_reason' => $isBotSession ? null : $this->faker->optional()->randomElement([
                'customer_request', 'bot_limitation', 'complex_issue', 'escalation_required'
            ]),
            'handover_at' => $isBotSession ? null : $this->faker->optional()->dateTimeBetween($startedAt, $endedAt ?? 'now'),
            'total_messages' => $this->faker->numberBetween(1, 50),
            'customer_messages' => $this->faker->numberBetween(1, 25),
            'bot_messages' => $isBotSession ? $this->faker->numberBetween(1, 25) : 0,
            'agent_messages' => $isBotSession ? 0 : $this->faker->numberBetween(1, 25),
            'response_time_avg' => $this->faker->numberBetween(30, 300), // seconds
            'resolution_time' => $endedAt ? (int)($endedAt->getTimestamp() - $startedAt->getTimestamp()) / 60 : null,
            'wait_time' => $this->faker->numberBetween(0, 600), // seconds
            'satisfaction_rating' => $endedAt ? $this->faker->optional(70)->numberBetween(1, 5) : null,
            'feedback_text' => $endedAt ? $this->faker->optional()->sentence() : null,
            'feedback_tags' => $endedAt ? $this->faker->optional()->randomElements([
                'helpful', 'quick_response', 'knowledgeable', 'friendly', 'patient',
                'slow_response', 'unhelpful', 'rude', 'unclear'
            ], $this->faker->numberBetween(0, 3)) : null,
            'csat_submitted_at' => $endedAt ? $this->faker->optional()->dateTimeBetween($endedAt, 'now') : null,
            'intent' => $this->faker->randomElement([
                'support', 'information', 'complaint', 'compliment', 'purchase_inquiry',
                'technical_help', 'billing_question', 'general_inquiry'
            ]),
            'category' => $this->faker->randomElement([
                'general', 'technical', 'billing', 'product', 'service', 'complaint'
            ]),
            'subcategory' => $this->faker->optional()->randomElement([
                'account_issue', 'payment_problem', 'feature_request', 'bug_report', 'how_to'
            ]),
            'priority' => $this->faker->randomElement(['low', 'normal', 'high', 'urgent']),
            'tags' => $this->faker->optional()->randomElements([
                'urgent', 'vip_customer', 'technical', 'billing', 'follow_up_needed',
                'escalated', 'resolved', 'pending'
            ], $this->faker->numberBetween(0, 3)),
            'is_resolved' => $endedAt ? $this->faker->boolean(80) : false,
            'resolved_at' => $endedAt ? $this->faker->optional()->dateTimeBetween($endedAt, 'now') : null,
            'resolution_type' => $endedAt ? $this->faker->optional()->randomElement([
                'self_service', 'agent_resolved', 'escalated', 'transferred', 'abandoned'
            ]) : null,
            'resolution_notes' => $endedAt ? $this->faker->optional()->sentence() : null,
            'sentiment_analysis' => [
                'overall_sentiment' => $this->faker->randomElement(['positive', 'negative', 'neutral']),
                'sentiment_score' => $this->faker->randomFloat(2, -1, 1),
                'emotion_detected' => $this->faker->randomElement(['happy', 'frustrated', 'confused', 'satisfied', 'angry']),
                'confidence' => $this->faker->randomFloat(2, 0.5, 1),
                'analysis_timestamp' => now()->toISOString(),
            ],
            'ai_summary' => $this->faker->optional()->sentence(),
            'topics_discussed' => $this->faker->optional()->randomElements([
                'account_setup', 'payment_issue', 'technical_problem', 'feature_question',
                'billing_inquiry', 'product_information', 'service_complaint'
            ], $this->faker->numberBetween(1, 3)),
            'session_data' => [
                'browser' => $this->faker->optional()->userAgent(),
                'device' => $this->faker->optional()->randomElement(['desktop', 'mobile', 'tablet']),
                'referrer' => $this->faker->optional()->url(),
                'utm_source' => $this->faker->optional()->randomElement(['google', 'facebook', 'direct']),
            ],
            'metadata' => [
                'created_via' => $this->faker->randomElement(['widget', 'api', 'mobile_app']),
                'session_quality' => $this->faker->randomElement(['good', 'average', 'poor']),
                'automated_actions' => $this->faker->optional()->randomElements([
                    'knowledge_base_suggested', 'agent_assigned', 'escalation_triggered'
                ], $this->faker->numberBetween(0, 2)),
            ],
        ];
    }

    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
            'ended_at' => null,
            'last_activity_at' => $this->faker->dateTimeBetween('-1 hour', 'now'),
            'satisfaction_rating' => null,
            'feedback_text' => null,
            'is_resolved' => false,
        ]);
    }

    public function botSession(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_bot_session' => true,
            'agent_id' => null,
            'handover_reason' => null,
            'handover_at' => null,
            'agent_messages' => 0,
            'bot_messages' => $this->faker->numberBetween(1, 15),
        ]);
    }

    public function agentSession(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_bot_session' => false,
            'agent_id' => Agent::factory(),
            'handover_reason' => $this->faker->randomElement([
                'customer_request', 'bot_limitation', 'complex_issue'
            ]),
            'handover_at' => $this->faker->dateTimeBetween($attributes['started_at'] ?? '-1 hour', 'now'),
            'bot_messages' => $this->faker->numberBetween(0, 5),
            'agent_messages' => $this->faker->numberBetween(1, 20),
        ]);
    }

    public function resolved(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_resolved' => true,
            'resolved_at' => $this->faker->dateTimeBetween($attributes['started_at'] ?? '-1 hour', 'now'),
            'resolution_type' => $this->faker->randomElement(['agent_resolved', 'self_service']),
            'resolution_notes' => $this->faker->sentence(),
            'is_active' => false,
            'ended_at' => $this->faker->dateTimeBetween($attributes['started_at'] ?? '-1 hour', 'now'),
        ]);
    }

    public function withHighSatisfaction(): static
    {
        return $this->state(fn (array $attributes) => [
            'satisfaction_rating' => $this->faker->numberBetween(4, 5),
            'feedback_text' => $this->faker->randomElement([
                'Very helpful and quick response!',
                'Excellent service, thank you!',
                'Problem solved quickly and efficiently.',
                'Great customer service experience.',
            ]),
            'feedback_tags' => ['helpful', 'quick_response', 'friendly'],
            'sentiment_analysis' => [
                'overall_sentiment' => 'positive',
                'sentiment_score' => $this->faker->randomFloat(2, 0.5, 1),
                'emotion_detected' => 'satisfied',
                'confidence' => $this->faker->randomFloat(2, 0.8, 1),
            ],
        ]);
    }

    public function withLowSatisfaction(): static
    {
        return $this->state(fn (array $attributes) => [
            'satisfaction_rating' => $this->faker->numberBetween(1, 2),
            'feedback_text' => $this->faker->randomElement([
                'Very slow response time.',
                'Could not resolve my issue.',
                'Unhelpful and confusing.',
                'Poor service quality.',
            ]),
            'feedback_tags' => ['slow_response', 'unhelpful'],
            'sentiment_analysis' => [
                'overall_sentiment' => 'negative',
                'sentiment_score' => $this->faker->randomFloat(2, -1, -0.3),
                'emotion_detected' => 'frustrated',
                'confidence' => $this->faker->randomFloat(2, 0.7, 1),
            ],
        ]);
    }

    public function urgent(): static
    {
        return $this->state(fn (array $attributes) => [
            'priority' => 'urgent',
            'tags' => array_merge($attributes['tags'] ?? [], ['urgent']),
            'response_time_avg' => $this->faker->numberBetween(10, 60), // faster response
        ]);
    }

    public function vipCustomer(): static
    {
        return $this->state(fn (array $attributes) => [
            'tags' => array_merge($attributes['tags'] ?? [], ['vip_customer']),
            'priority' => $this->faker->randomElement(['high', 'urgent']),
            'response_time_avg' => $this->faker->numberBetween(15, 90),
        ]);
    }

    public function technical(): static
    {
        return $this->state(fn (array $attributes) => [
            'category' => 'technical',
            'intent' => 'technical_help',
            'tags' => array_merge($attributes['tags'] ?? [], ['technical']),
            'topics_discussed' => ['technical_problem', 'troubleshooting'],
        ]);
    }
}
