<?php

namespace Database\Factories;

use App\Models\OrganizationAuditLog;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\OrganizationAuditLog>
 */
class OrganizationAuditLogFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = OrganizationAuditLog::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $actions = [
            'created', 'updated', 'deleted', 'restored',
            'status_changed', 'permissions_updated', 'settings_updated',
            'user_added', 'user_removed', 'role_assigned', 'role_removed'
        ];

        $resourceTypes = [
            'organization', 'user', 'organization_settings', 'organization_permissions',
            'user_role', 'organization_role', 'organization_analytics'
        ];

        $action = $this->faker->randomElement($actions);
        $resourceType = $this->faker->randomElement($resourceTypes);

        return [
            'organization_id' => Organization::factory(),
            'user_id' => User::factory(),
            'action' => $action,
            'resource_type' => $resourceType,
            'resource_id' => $this->faker->numberBetween(1, 100),
            'old_values' => $this->generateOldValues($resourceType, $action),
            'new_values' => $this->generateNewValues($resourceType, $action),
            'ip_address' => $this->faker->ipv4(),
            'user_agent' => $this->faker->userAgent(),
            'metadata' => [
                'browser' => $this->faker->randomElement(['Chrome', 'Firefox', 'Safari', 'Edge']),
                'os' => $this->faker->randomElement(['Windows', 'macOS', 'Linux', 'iOS', 'Android']),
                'device' => $this->faker->randomElement(['Desktop', 'Mobile', 'Tablet', 'Laptop']),
                'location' => $this->faker->city(),
                'session_id' => $this->faker->uuid(),
                'request_id' => $this->faker->uuid(),
            ],
        ];
    }

    /**
     * Generate old values based on resource type and action
     */
    private function generateOldValues(string $resourceType, string $action): ?array
    {
        if (in_array($action, ['created', 'user_added', 'role_assigned'])) {
            return null;
        }

        switch ($resourceType) {
            case 'organization':
                return [
                    'name' => $this->faker->company(),
                    'email' => $this->faker->companyEmail(),
                    'status' => $this->faker->randomElement(['active', 'inactive', 'suspended']),
                    'updated_at' => $this->faker->dateTimeBetween('-1 month', '-1 hour')->format('c'),
                ];
            case 'organization_settings':
                return [
                    'general' => [
                        'name' => $this->faker->company(),
                        'email' => $this->faker->companyEmail(),
                        'phone' => $this->faker->phoneNumber(),
                    ],
                    'api' => [
                        'rateLimit' => $this->faker->numberBetween(100, 1000),
                        'enableApiAccess' => $this->faker->boolean(),
                    ],
                ];
            case 'user':
                return [
                    'name' => $this->faker->name(),
                    'email' => $this->faker->email(),
                    'status' => $this->faker->randomElement(['active', 'inactive', 'suspended']),
                ];
            default:
                return [
                    'old_value' => $this->faker->sentence(),
                    'updated_at' => $this->faker->dateTimeBetween('-1 month', '-1 hour')->format('c'),
                ];
        }
    }

    /**
     * Generate new values based on resource type and action
     */
    private function generateNewValues(string $resourceType, string $action): ?array
    {
        if (in_array($action, ['deleted', 'user_removed', 'role_removed'])) {
            return null;
        }

        switch ($resourceType) {
            case 'organization':
                return [
                    'name' => $this->faker->company(),
                    'email' => $this->faker->companyEmail(),
                    'status' => $this->faker->randomElement(['active', 'inactive', 'suspended']),
                    'updated_at' => now()->format('c'),
                ];
            case 'organization_settings':
                return [
                    'general' => [
                        'name' => $this->faker->company(),
                        'email' => $this->faker->companyEmail(),
                        'phone' => $this->faker->phoneNumber(),
                    ],
                    'api' => [
                        'rateLimit' => $this->faker->numberBetween(100, 2000),
                        'enableApiAccess' => $this->faker->boolean(),
                    ],
                ];
            case 'user':
                return [
                    'name' => $this->faker->name(),
                    'email' => $this->faker->email(),
                    'status' => $this->faker->randomElement(['active', 'inactive', 'suspended']),
                ];
            default:
                return [
                    'new_value' => $this->faker->sentence(),
                    'updated_at' => now()->format('c'),
                ];
        }
    }

    /**
     * Indicate that the audit log is for a specific action
     */
    public function forAction(string $action): static
    {
        return $this->state(fn (array $attributes) => [
            'action' => $action,
        ]);
    }

    /**
     * Indicate that the audit log is for a specific resource type
     */
    public function forResourceType(string $resourceType): static
    {
        return $this->state(fn (array $attributes) => [
            'resource_type' => $resourceType,
        ]);
    }

    /**
     * Indicate that the audit log is for a specific organization
     */
    public function forOrganization(int $organizationId): static
    {
        return $this->state(fn (array $attributes) => [
            'organization_id' => $organizationId,
        ]);
    }

    /**
     * Indicate that the audit log is for a specific user
     */
    public function forUser(int $userId): static
    {
        return $this->state(fn (array $attributes) => [
            'user_id' => $userId,
        ]);
    }

    /**
     * Indicate that the audit log has changes
     */
    public function withChanges(): static
    {
        return $this->state(function (array $attributes) {
            $resourceType = $attributes['resource_type'] ?? 'organization';
            return [
                'old_values' => $this->generateOldValues($resourceType, 'updated'),
                'new_values' => $this->generateNewValues($resourceType, 'updated'),
            ];
        });
    }

    /**
     * Indicate that the audit log is recent
     */
    public function recent(): static
    {
        return $this->state(fn (array $attributes) => [
            'created_at' => $this->faker->dateTimeBetween('-1 week', 'now'),
            'updated_at' => $this->faker->dateTimeBetween('-1 week', 'now'),
        ]);
    }

    /**
     * Indicate that the audit log is old
     */
    public function old(): static
    {
        return $this->state(fn (array $attributes) => [
            'created_at' => $this->faker->dateTimeBetween('-1 year', '-1 month'),
            'updated_at' => $this->faker->dateTimeBetween('-1 year', '-1 month'),
        ]);
    }
}
