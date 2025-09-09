<?php

namespace Database\Factories;

use App\Models\Organization;
use App\Models\PermissionGroup;
use Illuminate\Database\Eloquent\Factories\Factory;

class PermissionGroupFactory extends Factory
{
    protected $model = PermissionGroup::class;

    public function definition(): array
    {
        $name = $this->faker->randomElement([
            'User Management', 'Content Management', 'Customer Service',
            'Analytics & Reports', 'System Administration', 'Security',
            'Billing & Finance', 'API Management', 'Integrations',
            'Notifications', 'Settings', 'Support'
        ]);

        $code = strtolower(str_replace([' ', '&'], ['_', 'and'], $name));
        $category = $this->faker->randomElement([
            'administration', 'content', 'operations', 'insights',
            'security', 'billing', 'api', 'general'
        ]);

        return [
            'organization_id' => Organization::factory(),
            'name' => $name,
            'code' => $code,
            'display_name' => $name,
            'description' => $this->faker->sentence(),
            'category' => $category,
            'icon' => $this->faker->randomElement(['users', 'content', 'service', 'analytics', 'settings', 'security']),
            'color' => $this->faker->hexColor(),
            'sort_order' => $this->faker->numberBetween(0, 100),
            'status' => 'active',
        ];
    }

    public function administration(): static
    {
        return $this->state(fn (array $attributes) => [
            'category' => 'administration',
            'name' => 'System Administration',
            'code' => 'system_admin',
        ]);
    }

    public function content(): static
    {
        return $this->state(fn (array $attributes) => [
            'category' => 'content',
            'name' => 'Content Management',
            'code' => 'content_mgmt',
        ]);
    }

    public function operations(): static
    {
        return $this->state(fn (array $attributes) => [
            'category' => 'operations',
            'name' => 'Customer Service',
            'code' => 'customer_service',
        ]);
    }

    public function insights(): static
    {
        return $this->state(fn (array $attributes) => [
            'category' => 'insights',
            'name' => 'Analytics & Reports',
            'code' => 'analytics',
        ]);
    }

    public function security(): static
    {
        return $this->state(fn (array $attributes) => [
            'category' => 'security',
            'name' => 'Security',
            'code' => 'security',
        ]);
    }

    public function billing(): static
    {
        return $this->state(fn (array $attributes) => [
            'category' => 'billing',
            'name' => 'Billing & Finance',
            'code' => 'billing',
        ]);
    }

    public function api(): static
    {
        return $this->state(fn (array $attributes) => [
            'category' => 'api',
            'name' => 'API Management',
            'code' => 'api_mgmt',
        ]);
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'inactive',
        ]);
    }
}