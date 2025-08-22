<?php

namespace Database\Factories;

use App\Models\Organization;
use App\Models\Webhook;
use Illuminate\Database\Eloquent\Factories\Factory;

class WebhookFactory extends Factory
{
    protected $model = Webhook::class;

    public function definition(): array
    {
        $events = $this->faker->randomElements([
            'message.sent', 'message.received', 'session.started', 'session.ended',
            'agent.assigned', 'agent.transferred', 'customer.created', 'customer.updated',
            'chat.escalated', 'chat.resolved', 'bot.fallback', 'ai.response',
            'payment.completed', 'payment.failed', 'subscription.created', 'subscription.updated',
            'user.created', 'user.updated', 'user.deleted', 'role.assigned',
            'knowledge.published', 'knowledge.updated', 'workflow.executed', 'webhook.test'
        ], $this->faker->numberBetween(2, 8));

        return [
            'organization_id' => Organization::factory(),
            'name' => $this->faker->words(3, true) . ' Webhook',
            'url' => $this->faker->url() . '/webhook',
            'events' => $events,
            'secret' => Webhook::generateSecret(),
            'headers' => $this->generateHeaders(),
            'is_active' => $this->faker->boolean(80),
            'last_triggered_at' => $this->faker->optional(60)->dateTimeBetween('-30 days', 'now'),
            'last_success_at' => $this->faker->optional(50)->dateTimeBetween('-30 days', 'now'),
            'last_failure_at' => $this->faker->optional(20)->dateTimeBetween('-7 days', 'now'),
            'failure_count' => $this->faker->numberBetween(0, 10),
            'max_retries' => $this->faker->randomElement([3, 5, 10]),
            'status' => $this->faker->randomElement(['active', 'inactive', 'suspended']),
        ];
    }

    private function generateHeaders(): array
    {
        $headers = [
            'Content-Type' => 'application/json',
            'User-Agent' => 'ChatBot-SAAS-Webhook/1.0',
        ];

        if ($this->faker->boolean(30)) {
            $headers['Authorization'] = 'Bearer ' . $this->faker->sha256();
        }

        if ($this->faker->boolean(20)) {
            $headers['X-API-Key'] = $this->faker->uuid();
        }

        if ($this->faker->boolean(15)) {
            $headers['X-Custom-Header'] = $this->faker->word();
        }

        return $headers;
    }

    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
            'status' => 'active',
        ]);
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
            'status' => 'inactive',
        ]);
    }

    public function healthy(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
            'status' => 'active',
            'last_success_at' => $this->faker->dateTimeBetween('-1 hour', 'now'),
            'failure_count' => 0,
            'last_failure_at' => null,
        ]);
    }

    public function failing(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
            'failure_count' => $this->faker->numberBetween(5, 20),
            'last_failure_at' => $this->faker->dateTimeBetween('-1 hour', 'now'),
            'last_success_at' => $this->faker->dateTimeBetween('-7 days', '-1 hour'),
        ]);
    }

    public function withRecentActivity(): static
    {
        return $this->state(fn (array $attributes) => [
            'last_triggered_at' => $this->faker->dateTimeBetween('-1 hour', 'now'),
            'last_success_at' => $this->faker->dateTimeBetween('-1 hour', 'now'),
        ]);
    }

    public function withoutActivity(): static
    {
        return $this->state(fn (array $attributes) => [
            'last_triggered_at' => null,
            'last_success_at' => null,
            'last_failure_at' => null,
            'failure_count' => 0,
        ]);
    }

    public function forChatEvents(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Chat Events Webhook',
            'events' => [
                'message.sent', 'message.received', 'session.started',
                'session.ended', 'agent.assigned', 'chat.escalated'
            ],
        ]);
    }

    public function forPaymentEvents(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Payment Events Webhook',
            'events' => [
                'payment.completed', 'payment.failed', 'subscription.created',
                'subscription.updated', 'subscription.cancelled'
            ],
        ]);
    }

    public function forUserEvents(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'User Events Webhook',
            'events' => [
                'user.created', 'user.updated', 'user.deleted',
                'role.assigned', 'permission.granted'
            ],
        ]);
    }

    public function withCustomHeaders(): static
    {
        return $this->state(fn (array $attributes) => [
            'headers' => array_merge($attributes['headers'] ?? [], [
                'X-Organization-ID' => $this->faker->uuid(),
                'X-Environment' => $this->faker->randomElement(['production', 'staging', 'development']),
                'X-Source' => 'chatbot-saas',
            ]),
        ]);
    }

    public function withAuthentication(): static
    {
        return $this->state(fn (array $attributes) => [
            'headers' => array_merge($attributes['headers'] ?? [], [
                'Authorization' => 'Bearer ' . $this->faker->sha256(),
            ]),
        ]);
    }

    public function highRetry(): static
    {
        return $this->state(fn (array $attributes) => [
            'max_retries' => 10,
        ]);
    }

    public function lowRetry(): static
    {
        return $this->state(fn (array $attributes) => [
            'max_retries' => 1,
        ]);
    }
}
