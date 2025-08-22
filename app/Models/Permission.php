<?php

namespace App\Models;

use App\Traits\BelongsToOrganization;
use App\Traits\HasStatus;
use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Permission extends Model
{
    use HasFactory, HasUuid, BelongsToOrganization, HasStatus;

    protected $table = 'permissions';

    protected $fillable = [
        'organization_id',
        'name',
        'code',
        'display_name',
        'description',
        'resource',
        'action',
        'scope',
        'conditions',
        'constraints',
        'category',
        'group_name',
        'is_system_permission',
        'is_dangerous',
        'requires_approval',
        'sort_order',
        'is_visible',
        'metadata',
        'status',
    ];

    protected $casts = [
        'conditions' => 'array',
        'constraints' => 'array',
        'is_system_permission' => 'boolean',
        'is_dangerous' => 'boolean',
        'requires_approval' => 'boolean',
        'is_visible' => 'boolean',
        'metadata' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the roles that have this permission.
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'role_permissions')
                    ->withPivot(['is_granted', 'is_inherited', 'conditions', 'constraints', 'granted_by', 'granted_at'])
                    ->withTimestamps();
    }

    /**
     * Get the role permissions for this permission.
     */
    public function rolePermissions(): HasMany
    {
        return $this->hasMany(RolePermission::class);
    }

    /**
     * Get the permission groups that contain this permission.
     */
    public function permissionGroups(): BelongsToMany
    {
        return $this->belongsToMany(PermissionGroup::class, 'permission_group_permissions');
    }

    /**
     * Check if permission is system-defined.
     */
    public function isSystemPermission(): bool
    {
        return $this->is_system_permission;
    }

    /**
     * Check if permission is dangerous.
     */
    public function isDangerous(): bool
    {
        return $this->is_dangerous;
    }

    /**
     * Check if permission requires approval.
     */
    public function requiresApproval(): bool
    {
        return $this->requires_approval;
    }

    /**
     * Check if permission is visible in UI.
     */
    public function isVisible(): bool
    {
        return $this->is_visible;
    }

    /**
     * Get full permission identifier.
     */
    public function getFullIdentifierAttribute(): string
    {
        return $this->resource . '.' . $this->action . '.' . $this->scope;
    }

    /**
     * Get permission category display name.
     */
    public function getCategoryDisplayNameAttribute(): string
    {
        return match ($this->category) {
            'user_management' => 'User Management',
            'content_management' => 'Content Management',
            'customer_service' => 'Customer Service',
            'analytics' => 'Analytics & Reports',
            'system_administration' => 'System Administration',
            'billing' => 'Billing & Payments',
            'api_management' => 'API Management',
            default => ucwords(str_replace('_', ' ', $this->category ?? 'General')),
        };
    }

    /**
     * Get resource display name.
     */
    public function getResourceDisplayNameAttribute(): string
    {
        return match ($this->resource) {
            'users' => 'Users',
            'agents' => 'Agents',
            'customers' => 'Customers',
            'chat_sessions' => 'Chat Sessions',
            'messages' => 'Messages',
            'knowledge_articles' => 'Knowledge Articles',
            'knowledge_categories' => 'Knowledge Categories',
            'bot_personalities' => 'Bot Personalities',
            'channel_configs' => 'Channel Configurations',
            'ai_models' => 'AI Models',
            'workflows' => 'Workflows',
            'analytics' => 'Analytics',
            'billing' => 'Billing',
            'subscriptions' => 'Subscriptions',
            'api_keys' => 'API Keys',
            'webhooks' => 'Webhooks',
            'system_logs' => 'System Logs',
            'organizations' => 'Organizations',
            'roles' => 'Roles',
            'permissions' => 'Permissions',
            default => ucwords(str_replace('_', ' ', $this->resource)),
        };
    }

    /**
     * Get action display name.
     */
    public function getActionDisplayNameAttribute(): string
    {
        return match ($this->action) {
            'create' => 'Create',
            'read' => 'Read',
            'update' => 'Update',
            'delete' => 'Delete',
            'execute' => 'Execute',
            'approve' => 'Approve',
            'publish' => 'Publish',
            'export' => 'Export',
            'import' => 'Import',
            'manage' => 'Manage',
            'view_all' => 'View All',
            'view_own' => 'View Own',
            'edit_all' => 'Edit All',
            'edit_own' => 'Edit Own',
            default => ucwords(str_replace('_', ' ', $this->action)),
        };
    }

    /**
     * Check if permission has specific condition.
     */
    public function hasCondition(string $condition): bool
    {
        $conditions = $this->conditions ?? [];
        return isset($conditions[$condition]);
    }

    /**
     * Get condition value.
     */
    public function getCondition(string $condition, $default = null)
    {
        $conditions = $this->conditions ?? [];
        return $conditions[$condition] ?? $default;
    }

    /**
     * Check if permission has specific constraint.
     */
    public function hasConstraint(string $constraint): bool
    {
        $constraints = $this->constraints ?? [];
        return isset($constraints[$constraint]);
    }

    /**
     * Get constraint value.
     */
    public function getConstraint(string $constraint, $default = null)
    {
        $constraints = $this->constraints ?? [];
        return $constraints[$constraint] ?? $default;
    }

    /**
     * Create a new permission.
     */
    public static function createPermission(
        string $organizationId,
        string $name,
        string $code,
        string $resource,
        string $action,
        string $scope = 'organization',
        array $options = []
    ): self {
        return static::create(array_merge([
            'organization_id' => $organizationId,
            'name' => $name,
            'code' => $code,
            'resource' => $resource,
            'action' => $action,
            'scope' => $scope,
        ], $options));
    }

    /**
     * Scope for specific resource.
     */
    public function scopeForResource($query, string $resource)
    {
        return $query->where('resource', $resource);
    }

    /**
     * Scope for specific action.
     */
    public function scopeForAction($query, string $action)
    {
        return $query->where('action', $action);
    }

    /**
     * Scope for specific scope.
     */
    public function scopeForScope($query, string $scope)
    {
        return $query->where('scope', $scope);
    }

    /**
     * Scope for specific category.
     */
    public function scopeForCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Scope for system permissions.
     */
    public function scopeSystemPermissions($query)
    {
        return $query->where('is_system_permission', true);
    }

    /**
     * Scope for custom permissions.
     */
    public function scopeCustomPermissions($query)
    {
        return $query->where('is_system_permission', false);
    }

    /**
     * Scope for dangerous permissions.
     */
    public function scopeDangerous($query)
    {
        return $query->where('is_dangerous', true);
    }

    /**
     * Scope for visible permissions.
     */
    public function scopeVisible($query)
    {
        return $query->where('is_visible', true);
    }

    /**
     * Scope for permissions requiring approval.
     */
    public function scopeRequiringApproval($query)
    {
        return $query->where('requires_approval', true);
    }

    /**
     * Order by sort order.
     */
    public function scopeBySortOrder($query)
    {
        return $query->orderBy('sort_order')->orderBy('name');
    }

    /**
     * Search permissions.
     */
    public function scopeSearch($query, string $term)
    {
        return $query->where(function ($query) use ($term) {
            $query->where('name', 'LIKE', "%{$term}%")
                  ->orWhere('display_name', 'LIKE', "%{$term}%")
                  ->orWhere('description', 'LIKE', "%{$term}%")
                  ->orWhere('code', 'LIKE', "%{$term}%");
        });
    }
}
