<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrganizationRolePermission extends Model
{
    use HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'role_id',
        'permission_id'
    ];

    /**
     * Get the role that owns the permission.
     */
    public function role(): BelongsTo
    {
        return $this->belongsTo(OrganizationRole::class, 'role_id');
    }

    /**
     * Get the permission.
     */
    public function permission(): BelongsTo
    {
        return $this->belongsTo(OrganizationPermission::class, 'permission_id');
    }

}
