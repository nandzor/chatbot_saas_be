<?php

namespace Database\Factories;

use App\Models\Role;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Database\Eloquent\Factories\Factory;

class UserRoleFactory extends Factory
{
    protected $model = UserRole::class;

    public function definition(): array
    {
        $effectiveFrom = $this->faker->optional(70)->dateTimeBetween('-30 days', 'now');
        $isTemporary = $this->faker->boolean(30);
        $effectiveUntil = $isTemporary ?
            $this->faker->dateTimeBetween($effectiveFrom ?? 'now', '+90 days') :
            null;

        return [
            'user_id' => User::factory(),
            'role_id' => Role::factory(),
            'is_active' => $this->faker->boolean(90),
            'is_primary' => $this->faker->boolean(20),
            'scope' => $this->faker->randomElement([
                'global', 'organization', 'department', 'team', 'personal'
            ]),
            'scope_context' => $this->generateScopeContext(),
            'effective_from' => $effectiveFrom ?? now(),
            'effective_until' => $effectiveUntil,
            'assigned_by' => $this->faker->optional()->randomElement([User::factory()]),
            'assigned_reason' => $this->faker->optional()->randomElement([
                'New employee onboarding',
                'Role change promotion',
                'Department transfer',
                'Temporary project assignment',
                'Coverage for absence',
                'Security requirement',
                'System migration',
                'Compliance update'
            ]),
            'metadata' => [
                'assignment_type' => $this->faker->randomElement(['manual', 'automatic', 'imported']),
                'source' => $this->faker->randomElement(['admin_panel', 'api', 'bulk_import', 'system']),
                'notes' => $this->faker->optional()->sentence(),
            ],
        ];
    }

    private function generateScopeContext(): array
    {
        $scope = $this->faker->randomElement([
            'global', 'organization', 'department', 'team', 'personal'
        ]);

        return match ($scope) {
            'department' => [
                'department_id' => $this->faker->uuid(),
                'department_name' => $this->faker->randomElement([
                    'Sales', 'Marketing', 'Customer Service', 'Technical', 'Operations'
                ]),
            ],
            'team' => [
                'team_id' => $this->faker->uuid(),
                'team_name' => $this->faker->randomElement([
                    'Support Team A', 'Development Team', 'QA Team', 'Design Team'
                ]),
            ],
            'personal' => [
                'restrictions' => $this->faker->randomElements([
                    'read_only', 'limited_hours', 'specific_projects'
                ], $this->faker->numberBetween(0, 2)),
            ],
            default => [],
        };
    }

    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
            'effective_from' => now()->subDays($this->faker->numberBetween(1, 30)),
            'effective_until' => null,
        ]);
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    public function primary(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_primary' => true,
            'is_active' => true,
        ]);
    }

    public function temporary(): static
    {
        return $this->state(fn (array $attributes) => [
            'effective_from' => now(),
            'effective_until' => $this->faker->dateTimeBetween('+1 week', '+3 months'),
            'assigned_reason' => 'Temporary assignment',
        ]);
    }

    public function permanent(): static
    {
        return $this->state(fn (array $attributes) => [
            'effective_until' => null,
            'assigned_reason' => 'Permanent role assignment',
        ]);
    }

    public function expired(): static
    {
        return $this->state(fn (array $attributes) => [
            'effective_from' => $this->faker->dateTimeBetween('-60 days', '-30 days'),
            'effective_until' => $this->faker->dateTimeBetween('-30 days', '-1 day'),
            'is_active' => true,
        ]);
    }

    public function future(): static
    {
        return $this->state(fn (array $attributes) => [
            'effective_from' => $this->faker->dateTimeBetween('+1 day', '+30 days'),
            'effective_until' => $this->faker->dateTimeBetween('+30 days', '+90 days'),
            'is_active' => true,
        ]);
    }

    public function organizationScope(): static
    {
        return $this->state(fn (array $attributes) => [
            'scope' => 'organization',
            'scope_context' => [],
        ]);
    }

    public function departmentScope(): static
    {
        return $this->state(fn (array $attributes) => [
            'scope' => 'department',
            'scope_context' => [
                'department_id' => $this->faker->uuid(),
                'department_name' => $this->faker->randomElement([
                    'Sales', 'Marketing', 'Customer Service', 'Technical'
                ]),
            ],
        ]);
    }

    public function teamScope(): static
    {
        return $this->state(fn (array $attributes) => [
            'scope' => 'team',
            'scope_context' => [
                'team_id' => $this->faker->uuid(),
                'team_name' => $this->faker->words(2, true) . ' Team',
            ],
        ]);
    }

    public function withUser(User $user): static
    {
        return $this->state(fn (array $attributes) => [
            'user_id' => $user->id,
        ]);
    }

    public function withRole(Role $role): static
    {
        return $this->state(fn (array $attributes) => [
            'role_id' => $role->id,
        ]);
    }

    public function assignedBy(User $assignedBy): static
    {
        return $this->state(fn (array $attributes) => [
            'assigned_by' => $assignedBy->id,
            'assigned_reason' => 'Assigned by ' . $assignedBy->full_name,
        ]);
    }
}
