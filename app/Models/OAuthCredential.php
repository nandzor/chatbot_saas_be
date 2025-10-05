<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class OAuthCredential extends Model
{
    use HasFactory;

    protected $table = 'oauth_credentials';

    protected $fillable = [
        'organization_id',
        'user_id',
        'service',
        'n8n_credential_id',
        'access_token',
        'refresh_token',
        'expires_at',
        'scope',
        'status',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'access_token' => 'encrypted',
        'refresh_token' => 'encrypted',
    ];

    protected $hidden = [
        'access_token',
        'refresh_token',
    ];

    /**
     * Get the organization that owns the credential
     */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class, 'organization_id');
    }

    /**
     * Get the user that owns the credential
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Check if the credential is expired
     */
    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    /**
     * Check if the credential can be refreshed
     */
    public function canRefresh(): bool
    {
        return !empty($this->refresh_token);
    }

    /**
     * Scope for specific service
     */
    public function scopeForService($query, string $service)
    {
        return $query->where('service', $service);
    }

    /**
     * Scope for specific organization
     */
    public function scopeForOrganization($query, $organizationId)
    {
        return $query->where('organization_id', $organizationId);
    }

    /**
     * Scope for specific user
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }
}
