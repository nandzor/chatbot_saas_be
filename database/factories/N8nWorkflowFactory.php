<?php

namespace Database\Factories;

use App\Models\N8nWorkflow;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class N8nWorkflowFactory extends Factory
{
    protected $model = N8nWorkflow::class;

    public function definition(): array
    {
        $name = $this->faker->words(3, true);
        $triggerType = $this->faker->randomElement(['webhook', 'schedule', 'manual', 'event']);

        return [
            'organization_id' => Organization::factory(),
            'workflow_id' => 'wf_' . $this->faker->unique()->numerify('############'),
            'name' => ucwords($name),
            'description' => $this->faker->sentence(),
            'category' => $this->faker->randomElement([
                'automation', 'integration', 'notification', 'data_processing',
                'customer_service', 'marketing', 'analytics', 'workflow'
            ]),
            'tags' => $this->faker->randomElements([
                'production', 'staging', 'test', 'important', 'automated',
                'integration', 'webhook', 'scheduled', 'critical', 'experimental'
            ], $this->faker->numberBetween(1, 4)),
            'workflow_data' => $this->generateWorkflowData(),
            'nodes' => $this->generateNodes(),
            'connections' => $this->generateConnections(),
            'settings' => $this->generateSettings(),
            'trigger_type' => $triggerType,
            'trigger_config' => $this->generateTriggerConfig($triggerType),
            'schedule_expression' => $triggerType === 'schedule' ? $this->generateCronExpression() : null,
            'version' => 1,
            'previous_version_id' => null,
            'is_latest_version' => true,
            'status' => $this->faker->randomElement(['active', 'inactive', 'paused', 'error', 'testing']),
            'is_enabled' => $this->faker->boolean(70),
            'last_execution_at' => $this->faker->optional(60)->dateTimeBetween('-30 days', 'now'),
            'next_execution_at' => $triggerType === 'schedule' ?
                $this->faker->dateTimeBetween('now', '+7 days') : null,
            'total_executions' => $this->faker->numberBetween(0, 1000),
            'successful_executions' => function (array $attributes) {
                return $this->faker->numberBetween(0, $attributes['total_executions']);
            },
            'failed_executions' => function (array $attributes) {
                return $attributes['total_executions'] - $attributes['successful_executions'];
            },
            'avg_execution_time' => $this->faker->numberBetween(500, 30000), // ms
            'created_by' => User::factory(),
            'shared_with' => $this->generateSharedWith(),
            'permissions' => $this->generatePermissions(),
            'webhook_url' => $triggerType === 'webhook' ?
                $this->faker->url() . '/webhook/' . $this->faker->uuid() : null,
            'webhook_secret' => $triggerType === 'webhook' ?
                'whsec_' . $this->faker->sha256() : null,
            'api_endpoints' => $this->generateApiEndpoints(),
            'metadata' => [
                'created_via' => $this->faker->randomElement(['ui', 'api', 'import']),
                'complexity' => $this->faker->randomElement(['simple', 'medium', 'complex']),
                'estimated_runtime' => $this->faker->numberBetween(1, 300), // seconds
            ],
        ];
    }

    private function generateWorkflowData(): array
    {
        return [
            'id' => $this->faker->uuid(),
            'name' => $this->faker->words(3, true),
            'active' => $this->faker->boolean(),
            'createdAt' => now()->toISOString(),
            'updatedAt' => now()->toISOString(),
            'versionId' => $this->faker->uuid(),
        ];
    }

    private function generateNodes(): array
    {
        $nodeCount = $this->faker->numberBetween(2, 8);
        $nodes = [];

        for ($i = 0; $i < $nodeCount; $i++) {
            $nodes[] = [
                'id' => $this->faker->uuid(),
                'name' => $this->faker->randomElement([
                    'Webhook', 'HTTP Request', 'Code', 'Set', 'If', 'Switch',
                    'Merge', 'Split', 'Function', 'Wait', 'Stop and Error'
                ]),
                'type' => $this->faker->randomElement([
                    'n8n-nodes-base.webhook', 'n8n-nodes-base.httpRequest',
                    'n8n-nodes-base.code', 'n8n-nodes-base.set',
                    'n8n-nodes-base.if', 'n8n-nodes-base.switch'
                ]),
                'position' => [
                    $this->faker->numberBetween(100, 800),
                    $this->faker->numberBetween(100, 600)
                ],
                'parameters' => $this->generateNodeParameters(),
            ];
        }

        return $nodes;
    }

    private function generateNodeParameters(): array
    {
        return [
            'httpMethod' => $this->faker->randomElement(['GET', 'POST', 'PUT', 'DELETE']),
            'url' => $this->faker->optional()->url(),
            'authentication' => $this->faker->randomElement(['none', 'basicAuth', 'oauth2']),
            'timeout' => $this->faker->numberBetween(5000, 30000),
            'retry' => $this->faker->numberBetween(0, 3),
        ];
    }

    private function generateConnections(): array
    {
        return [
            'Node1' => [
                'main' => [
                    [
                        ['node' => 'Node2', 'type' => 'main', 'index' => 0]
                    ]
                ]
            ],
            'Node2' => [
                'main' => [
                    [
                        ['node' => 'Node3', 'type' => 'main', 'index' => 0]
                    ]
                ]
            ]
        ];
    }

    private function generateSettings(): array
    {
        return [
            'timezone' => 'Asia/Jakarta',
            'saveExecutionProgress' => $this->faker->boolean(),
            'saveManualExecutions' => $this->faker->boolean(),
            'callerPolicy' => 'workflowsFromSameOwner',
            'errorWorkflow' => $this->faker->optional()->uuid(),
        ];
    }

    private function generateTriggerConfig(string $triggerType): array
    {
        return match ($triggerType) {
            'webhook' => [
                'httpMethod' => $this->faker->randomElement(['GET', 'POST', 'PUT']),
                'path' => $this->faker->slug(),
                'authentication' => $this->faker->randomElement(['none', 'basicAuth', 'headerAuth']),
                'responseMode' => 'onReceived',
            ],
            'schedule' => [
                'rule' => [
                    'interval' => $this->faker->randomElement([
                        ['field' => 'hours', 'value' => 1],
                        ['field' => 'days', 'value' => 1],
                        ['field' => 'weeks', 'value' => 1],
                    ])
                ]
            ],
            'manual' => [
                'description' => 'Manual trigger',
            ],
            default => [],
        };
    }

    private function generateCronExpression(): string
    {
        $expressions = [
            '0 9 * * *',        // Daily at 9 AM
            '0 */6 * * *',      // Every 6 hours
            '0 0 * * 0',        // Weekly on Sunday
            '0 0 1 * *',        // Monthly on 1st
            '*/15 * * * *',     // Every 15 minutes
            '0 12 * * 1-5',     // Weekdays at noon
        ];

        return $this->faker->randomElement($expressions);
    }

    private function generateSharedWith(): array
    {
        if ($this->faker->boolean(30)) {
            return array_map(
                fn() => $this->faker->uuid(),
                range(1, $this->faker->numberBetween(1, 5))
            );
        }
        return [];
    }

    private function generatePermissions(): array
    {
        return [
            'read' => array_map(fn() => $this->faker->uuid(), range(1, $this->faker->numberBetween(1, 3))),
            'write' => array_map(fn() => $this->faker->uuid(), range(1, $this->faker->numberBetween(0, 2))),
            'execute' => array_map(fn() => $this->faker->uuid(), range(1, $this->faker->numberBetween(0, 2))),
        ];
    }

    private function generateApiEndpoints(): array
    {
        if ($this->faker->boolean(40)) {
            return [
                [
                    'method' => 'POST',
                    'path' => '/api/workflows/execute',
                    'description' => 'Execute workflow via API',
                ],
                [
                    'method' => 'GET',
                    'path' => '/api/workflows/status',
                    'description' => 'Get workflow status',
                ]
            ];
        }
        return [];
    }

    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'active',
            'is_enabled' => true,
        ]);
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'inactive',
            'is_enabled' => false,
        ]);
    }

    public function scheduled(): static
    {
        return $this->state(fn (array $attributes) => [
            'trigger_type' => 'schedule',
            'schedule_expression' => $this->generateCronExpression(),
            'next_execution_at' => $this->faker->dateTimeBetween('now', '+1 day'),
        ]);
    }

    public function webhook(): static
    {
        return $this->state(fn (array $attributes) => [
            'trigger_type' => 'webhook',
            'webhook_url' => $this->faker->url() . '/webhook/' . $this->faker->uuid(),
            'webhook_secret' => 'whsec_' . $this->faker->sha256(),
        ]);
    }

    public function manual(): static
    {
        return $this->state(fn (array $attributes) => [
            'trigger_type' => 'manual',
            'webhook_url' => null,
            'schedule_expression' => null,
        ]);
    }

    public function withExecutions(): static
    {
        return $this->state(fn (array $attributes) => [
            'total_executions' => $this->faker->numberBetween(50, 500),
            'last_execution_at' => $this->faker->dateTimeBetween('-7 days', 'now'),
        ]);
    }

    public function highPerformance(): static
    {
        return $this->state(fn (array $attributes) => [
            'avg_execution_time' => $this->faker->numberBetween(100, 2000), // Fast execution
        ]);
    }

    public function complex(): static
    {
        return $this->state(fn (array $attributes) => [
            'nodes' => $this->generateNodes(), // Generate more complex nodes
            'metadata' => array_merge($attributes['metadata'] ?? [], [
                'complexity' => 'complex',
                'estimated_runtime' => $this->faker->numberBetween(60, 300),
            ]),
        ]);
    }
}
