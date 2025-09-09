<?php

namespace Database\Factories;

use App\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Role>
 */
class RoleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = $this->faker->jobTitle();
        $code = strtolower(str_replace(' ', '_', $name));

        return [
            'id' => Str::uuid(),
            'name' => $name,
            'code' => $code,
            'display_name' => $this->faker->sentence(3),
            'description' => $this->faker->paragraph(),
            'organization_id' => Organization::factory(),
            'level' => $this->faker->numberBetween(1, 10),
            'is_system_role' => false,
            'is_default' => false,
            'inherits_permissions' => true,
            'max_users' => null,
            'current_users' => 0,
            'color' => $this->faker->hexColor(),
            'icon' => $this->faker->randomElement(['user', 'admin', 'manager', 'supervisor', 'viewer']),
            'badge_text' => null,
            'metadata' => [],
            'status' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }

    /**
     * Indicate that the role is a system role.
     */
    public function system(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_system_role' => true,
        ]);
    }

    /**
     * Indicate that the role is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'inactive',
        ]);
    }

    /**
     * Indicate that the role is a default role.
     */
    public function default(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_default' => true,
        ]);
    }

    /**
     * Set a specific level for the role.
     */
    public function level(int $level): static
    {
        return $this->state(fn (array $attributes) => [
            'level' => $level,
        ]);
    }
}
