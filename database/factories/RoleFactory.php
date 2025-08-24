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
        return [
            'id' => Str::uuid(),
            'name' => $this->faker->unique()->word(),
            'display_name' => $this->faker->sentence(3),
            'description' => $this->faker->paragraph(),
            'organization_id' => Organization::factory(),
            'permissions' => [],
            'is_system_role' => false,
            'sort_order' => $this->faker->numberBetween(1, 100),
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
}
