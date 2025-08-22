<?php

namespace App\Models;

use App\Traits\HasUuid;
use App\Traits\HasStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class WahaContact extends Model
{
    use HasFactory, HasUuid, HasStatus;

    protected $table = 'waha_contacts';

    protected $fillable = [
        'organization_id',
        'session_id',
        'customer_id',
        'wa_id',
        'wa_jid',
        'name',
        'display_name',
        'short_name',
        'push_name',
        'profile_picture_url',
        'profile_status',
        'business_name',
        'business_category',
        'is_business',
        'is_enterprise',
        'is_blocked',
        'is_contact',
        'is_user',
        'is_wa_contact',
        'profile_picture_type',
        'last_seen_privacy',
        'status_privacy',
        'last_seen_at',
        'last_message_at',
        'presence_status',
        'is_online',
        'total_messages_sent',
        'total_messages_received',
        'total_media_sent',
        'total_media_received',
        'first_interaction_at',
        'last_interaction_at',
        'labels',
        'tags',
        'notes',
        'metadata',
        'status',
    ];

    protected $casts = [
        'is_business' => 'boolean',
        'is_enterprise' => 'boolean',
        'is_blocked' => 'boolean',
        'is_contact' => 'boolean',
        'is_user' => 'boolean',
        'is_wa_contact' => 'boolean',
        'is_online' => 'boolean',
        'last_seen_at' => 'datetime',
        'last_message_at' => 'datetime',
        'first_interaction_at' => 'datetime',
        'last_interaction_at' => 'datetime',
        'total_messages_sent' => 'integer',
        'total_messages_received' => 'integer',
        'total_media_sent' => 'integer',
        'total_media_received' => 'integer',
        'labels' => 'array',
        'tags' => 'array',
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

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }
}
