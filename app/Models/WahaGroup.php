<?php

namespace App\Models;

use App\Traits\HasUuid;
use App\Traits\HasStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class WahaGroup extends Model
{
    use HasFactory, HasUuid, HasStatus;

    protected $table = 'waha_groups';

    protected $fillable = [
        'organization_id',
        'session_id',
        'wa_group_id',
        'wa_jid',
        'name',
        'description',
        'subject',
        'is_announcement',
        'is_locked',
        'is_ephemeral',
        'ephemeral_duration',
        'created_by',
        'owner',
        'admins',
        'participant_count',
        'max_participants',
        'profile_picture_url',
        'invite_code',
        'invite_link',
        'last_activity_at',
        'total_messages',
        'metadata',
        'status',
    ];

    protected $casts = [
        'is_announcement' => 'boolean',
        'is_locked' => 'boolean',
        'is_ephemeral' => 'boolean',
        'ephemeral_duration' => 'integer',
        'admins' => 'array',
        'participant_count' => 'integer',
        'max_participants' => 'integer',
        'last_activity_at' => 'datetime',
        'total_messages' => 'integer',
        'metadata' => 'array',
    ];

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function session(): BelongsTo
    {
        return $this->belongsTo(WahaSession::class, 'session_id');
    }

}
