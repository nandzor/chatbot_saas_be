<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class EmailVerificationToken extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'email',
        'token',
        'type',
        'user_id',
        'organization_id',
        'expires_at',
        'is_used',
        'used_at',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'used_at' => 'datetime',
        'is_used' => 'boolean',
    ];

    /**
     * Get the user that owns the verification token.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the organization that owns the verification token.
     */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    /**
     * Check if the token is expired.
     */
    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    /**
     * Check if the token is valid (not used and not expired).
     */
    public function isValid(): bool
    {
        return !$this->is_used && !$this->isExpired();
    }

    /**
     * Mark the token as used.
     */
    public function markAsUsed(): void
    {
        $this->update([
            'is_used' => true,
            'used_at' => now(),
        ]);
    }

    /**
     * Scope to get valid tokens.
     */
    public function scopeValid($query)
    {
        return $query->where('is_used', false)
                    ->where('expires_at', '>', now());
    }

    /**
     * Scope to get tokens by type.
     */
    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope to get tokens by email.
     */
    public function scopeByEmail($query, string $email)
    {
        return $query->where('email', $email);
    }

    /**
     * Generate a new verification token.
     */
    public static function generateToken(string $email, string $type = 'organization_verification', ?string $userId = null, ?string $organizationId = null): self
    {
        // Delete any existing tokens for this email and type
        self::where('email', $email)
            ->where('type', $type)
            ->delete();

        return self::create([
            'email' => $email,
            'token' => \Illuminate\Support\Str::random(64),
            'type' => $type,
            'user_id' => $userId,
            'organization_id' => $organizationId,
            'expires_at' => now()->addHours(24), // Token expires in 24 hours
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }

    /**
     * Find a valid token by token string and type.
     */
    public static function findValidToken(string $token, string $type = 'organization_verification'): ?self
    {
        return self::where('token', $token)
                   ->where('type', $type)
                   ->valid()
                   ->first();
    }
}
