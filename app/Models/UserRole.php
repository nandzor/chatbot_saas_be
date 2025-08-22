<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserRole extends Model
{
    use HasFactory, HasUuid;

    protected $table = 'user_roles';

    protected $fillable = [
        'user_id',
        'role_id',
        'is_active',
        'is_primary',
        'scope',
        'scope_context',
        'effective_from',
        'effective_until',
        'assigned_by',
        'assigned_reason',
        'metadata',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_primary' => 'boolean',
        'scope_context' => 'array',
        'effective_from' => 'datetime',
        'effective_until' => 'datetime',
        'metadata' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the user that owns this role assignment.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the role assigned to the user.
     */
    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    /**
     * Get the user who assigned this role.
     */
    public function assignedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }

    /**
     * Check if role assignment is currently active.
     */
    public function isCurrentlyActive(): bool
    {
        if (!$this->is_active) {
            return false;
        }

        $now = now();

        if ($this->effective_from && $this->effective_from->isFuture()) {
            return false;
        }

        if ($this->effective_until && $this->effective_until->isPast()) {
            return false;
        }

        return true;
    }

    /**
     * Check if role assignment is primary.
     */
    public function isPrimary(): bool
    {
        return $this->is_primary;
    }

    /**
     * Check if role assignment is temporary.
     */
    public function isTemporary(): bool
    {
        return !is_null($this->effective_until);
    }

    /**
     * Check if role assignment is expired.
     */
    public function isExpired(): bool
    {
        return $this->effective_until && $this->effective_until->isPast();
    }

    /**
     * Check if role assignment is future-dated.
     */
    public function isFutureDated(): bool
    {
        return $this->effective_from && $this->effective_from->isFuture();
    }

    /**
     * Get days until expiration.
     */
    public function getDaysUntilExpirationAttribute(): ?int
    {
        if (!$this->effective_until) {
            return null;
        }

        return now()->diffInDays($this->effective_until, false);
    }

    /**
     * Get days until activation.
     */
    public function getDaysUntilActivationAttribute(): ?int
    {
        if (!$this->effective_from || $this->effective_from->isPast()) {
            return null;
        }

        return now()->diffInDays($this->effective_from);
    }

    /**
     * Get role assignment status.
     */
    public function getStatusAttribute(): string
    {
        if (!$this->is_active) {
            return 'inactive';
        }

        if ($this->isFutureDated()) {
            return 'pending';
        }

        if ($this->isExpired()) {
            return 'expired';
        }

        return 'active';
    }

    /**
     * Get role assignment status color.
     */
    public function getStatusColorAttribute(): string
    {
        return match ($this->status) {
            'active' => 'green',
            'pending' => 'yellow',
            'expired' => 'red',
            'inactive' => 'gray',
            default => 'gray',
        };
    }

    /**
     * Get scope display name.
     */
    public function getScopeDisplayNameAttribute(): string
    {
        return match ($this->scope) {
            'global' => 'Global',
            'organization' => 'Organization',
            'department' => 'Department',
            'team' => 'Team',
            'personal' => 'Personal',
            default => ucfirst($this->scope ?? 'Organization'),
        };
    }

    /**
     * Activate role assignment.
     */
    public function activate(): void
    {
        $this->update(['is_active' => true]);
    }

    /**
     * Deactivate role assignment.
     */
    public function deactivate(): void
    {
        $this->update(['is_active' => false]);
    }

    /**
     * Set as primary role.
     */
    public function setAsPrimary(): void
    {
        // Remove primary flag from other roles for this user
        static::where('user_id', $this->user_id)
              ->where('id', '!=', $this->id)
              ->update(['is_primary' => false]);

        $this->update(['is_primary' => true]);
    }

    /**
     * Extend role assignment.
     */
    public function extend(\DateTimeInterface $newEndDate): void
    {
        $this->update(['effective_until' => $newEndDate]);
    }

    /**
     * Add assignment reason.
     */
    public function addReason(string $reason): void
    {
        $this->update(['assigned_reason' => $reason]);
    }

    /**
     * Assign role to user.
     */
    public static function assignRole(
        User $user,
        Role $role,
        bool $isPrimary = false,
        string $scope = 'organization',
        array $scopeContext = [],
        \DateTimeInterface $effectiveFrom = null,
        \DateTimeInterface $effectiveUntil = null,
        User $assignedBy = null,
        string $reason = null
    ): self {
        // Check if role is already assigned
        $existingAssignment = static::where('user_id', $user->id)
                                   ->where('role_id', $role->id)
                                   ->where('scope', $scope)
                                   ->first();

        if ($existingAssignment) {
            $existingAssignment->update([
                'is_active' => true,
                'is_primary' => $isPrimary,
                'scope_context' => $scopeContext,
                'effective_from' => $effectiveFrom,
                'effective_until' => $effectiveUntil,
                'assigned_by' => $assignedBy?->id,
                'assigned_reason' => $reason,
            ]);

            if ($isPrimary) {
                $existingAssignment->setAsPrimary();
            }

            return $existingAssignment;
        }

        $assignment = static::create([
            'user_id' => $user->id,
            'role_id' => $role->id,
            'is_active' => true,
            'is_primary' => $isPrimary,
            'scope' => $scope,
            'scope_context' => $scopeContext,
            'effective_from' => $effectiveFrom ?? now(),
            'effective_until' => $effectiveUntil,
            'assigned_by' => $assignedBy?->id,
            'assigned_reason' => $reason,
        ]);

        if ($isPrimary) {
            $assignment->setAsPrimary();
        }

        return $assignment;
    }

    /**
     * Scope for active assignments.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for currently effective assignments.
     */
    public function scopeCurrentlyEffective($query)
    {
        $now = now();

        return $query->where('is_active', true)
                    ->where(function ($query) use ($now) {
                        $query->whereNull('effective_from')
                              ->orWhere('effective_from', '<=', $now);
                    })
                    ->where(function ($query) use ($now) {
                        $query->whereNull('effective_until')
                              ->orWhere('effective_until', '>', $now);
                    });
    }

    /**
     * Scope for primary assignments.
     */
    public function scopePrimary($query)
    {
        return $query->where('is_primary', true);
    }

    /**
     * Scope for temporary assignments.
     */
    public function scopeTemporary($query)
    {
        return $query->whereNotNull('effective_until');
    }

    /**
     * Scope for expired assignments.
     */
    public function scopeExpired($query)
    {
        return $query->whereNotNull('effective_until')
                    ->where('effective_until', '<', now());
    }

    /**
     * Scope for future assignments.
     */
    public function scopeFuture($query)
    {
        return $query->whereNotNull('effective_from')
                    ->where('effective_from', '>', now());
    }

    /**
     * Scope for specific user.
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope for specific role.
     */
    public function scopeForRole($query, $roleId)
    {
        return $query->where('role_id', $roleId);
    }

    /**
     * Scope for specific scope.
     */
    public function scopeForScope($query, string $scope)
    {
        return $query->where('scope', $scope);
    }

    /**
     * Scope for assignments expiring soon.
     */
    public function scopeExpiringSoon($query, int $days = 7)
    {
        return $query->whereNotNull('effective_until')
                    ->whereBetween('effective_until', [now(), now()->addDays($days)]);
    }

    /**
     * Order by effective date.
     */
    public function scopeByEffectiveDate($query, string $direction = 'desc')
    {
        return $query->orderBy('effective_from', $direction);
    }
}
