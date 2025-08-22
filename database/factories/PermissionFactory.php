<?php

namespace Database\Factories;

use App\Models\Organization;
use App\Models\Permission;
use Illuminate\Database\Eloquent\Factories\Factory;

class PermissionFactory extends Factory
{
    protected $model = Permission::class;

    public function definition(): array
    {
        $resource = $this->faker->randomElement([
            'users', 'agents', 'customers', 'chat_sessions', 'messages',
            'knowledge_articles', 'knowledge_categories', 'bot_personalities',
            'channel_configs', 'ai_models', 'workflows', 'analytics',
            'billing', 'subscriptions', 'api_keys', 'webhooks', 'system_logs',
            'organizations', 'roles', 'permissions'
        ]);

        $action = $this->faker->randomElement([
            'create', 'read', 'update', 'delete', 'execute', 'approve',
            'publish', 'export', 'import', 'manage', 'view_all', 'view_own',
            'edit_all', 'edit_own'
        ]);

        $scope = $this->faker->randomElement([
            'global', 'organization', 'department', 'team', 'personal'
        ]);

        $name = ucfirst($action) . ' ' . ucfirst(str_replace('_', ' ', $resource));
        $code = $resource . '.' . $action;

        return [
            'organization_id' => Organization::factory(),
            'name' => $name,
            'code' => $code,
            'display_name' => $name,
            'description' => $this->faker->sentence(),
            'resource' => $resource,
            'action' => $action,
            'scope' => $scope,
            'conditions' => $this->generateConditions(),
            'constraints' => $this->generateConstraints(),
            'category' => $this->getCategoryForResource($resource),
            'group_name' => $this->getGroupNameForCategory($this->getCategoryForResource($resource)),
            'is_system_permission' => $this->faker->boolean(30),
            'is_dangerous' => $this->isDangerous($resource, $action),
            'requires_approval' => $this->requiresApproval($resource, $action),
            'sort_order' => $this->faker->numberBetween(0, 100),
            'is_visible' => $this->faker->boolean(90),
            'metadata' => [
                'created_by' => 'system',
                'module' => $this->getModuleForResource($resource),
            ],
            'status' => 'active',
        ];
    }

    private function generateConditions(): array
    {
        if ($this->faker->boolean(30)) {
            return [
                'time_restriction' => $this->faker->randomElement(['business_hours', 'anytime']),
                'ip_restriction' => $this->faker->optional()->ipv4(),
                'location_restriction' => $this->faker->optional()->country(),
            ];
        }
        return [];
    }

    private function generateConstraints(): array
    {
        if ($this->faker->boolean(20)) {
            return [
                'max_records' => $this->faker->numberBetween(10, 1000),
                'fields_editable' => $this->faker->randomElements([
                    'name', 'email', 'phone', 'status'
                ], $this->faker->numberBetween(1, 3)),
                'require_2fa' => $this->faker->boolean(),
            ];
        }
        return [];
    }

    private function getCategoryForResource(string $resource): string
    {
        return match ($resource) {
            'users', 'agents', 'roles', 'permissions' => 'user_management',
            'knowledge_articles', 'knowledge_categories', 'bot_personalities' => 'content_management',
            'customers', 'chat_sessions', 'messages' => 'customer_service',
            'analytics', 'workflows' => 'analytics',
            'billing', 'subscriptions' => 'billing',
            'api_keys', 'webhooks', 'system_logs' => 'system_administration',
            default => 'general',
        };
    }

    private function getGroupNameForCategory(string $category): string
    {
        return match ($category) {
            'user_management' => 'User & Role Management',
            'content_management' => 'Content & Knowledge Base',
            'customer_service' => 'Customer Service Operations',
            'analytics' => 'Analytics & Reporting',
            'billing' => 'Billing & Finance',
            'system_administration' => 'System Administration',
            default => 'General Operations',
        };
    }

    private function getModuleForResource(string $resource): string
    {
        return match ($resource) {
            'users', 'agents', 'roles', 'permissions' => 'auth',
            'knowledge_articles', 'knowledge_categories' => 'knowledge',
            'customers', 'chat_sessions', 'messages' => 'chat',
            'bot_personalities', 'channel_configs' => 'bot',
            'analytics', 'workflows' => 'analytics',
            'billing', 'subscriptions' => 'billing',
            'api_keys', 'webhooks' => 'api',
            default => 'core',
        };
    }

    private function isDangerous(string $resource, string $action): bool
    {
        $dangerousActions = ['delete', 'manage'];
        $sensitiveResources = ['users', 'billing', 'system_logs', 'api_keys'];

        return in_array($action, $dangerousActions) ||
               (in_array($resource, $sensitiveResources) && $action !== 'read');
    }

    private function requiresApproval(string $resource, string $action): bool
    {
        $approvalActions = ['delete', 'manage', 'publish'];
        $sensitiveResources = ['billing', 'system_logs', 'permissions'];

        return in_array($action, $approvalActions) ||
               in_array($resource, $sensitiveResources);
    }

    public function systemPermission(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_system_permission' => true,
            'is_visible' => true,
        ]);
    }

    public function customPermission(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_system_permission' => false,
        ]);
    }

    public function dangerous(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_dangerous' => true,
            'requires_approval' => true,
        ]);
    }

    public function safe(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_dangerous' => false,
            'requires_approval' => false,
        ]);
    }

    public function forResource(string $resource): static
    {
        return $this->state(fn (array $attributes) => [
            'resource' => $resource,
            'category' => $this->getCategoryForResource($resource),
        ]);
    }

    public function forAction(string $action): static
    {
        return $this->state(fn (array $attributes) => [
            'action' => $action,
            'is_dangerous' => $this->isDangerous($attributes['resource'] ?? 'general', $action),
        ]);
    }

    public function readOnly(): static
    {
        return $this->state(fn (array $attributes) => [
            'action' => 'read',
            'is_dangerous' => false,
            'requires_approval' => false,
        ]);
    }

    public function fullAccess(): static
    {
        return $this->state(fn (array $attributes) => [
            'action' => 'manage',
            'is_dangerous' => true,
            'requires_approval' => true,
        ]);
    }
}
