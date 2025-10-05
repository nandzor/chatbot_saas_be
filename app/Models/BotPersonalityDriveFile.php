<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BotPersonalityDriveFile extends Model
{
    use HasFactory;

    protected $table = 'bot_personality_drive_files';

    protected $fillable = [
        'organization_id',
        'bot_personality_id',
        'file_id',
        'file_name',
        'mime_type',
        'web_view_link',
        'icon_link',
        'size',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    public function personality(): BelongsTo
    {
        return $this->belongsTo(BotPersonality::class, 'bot_personality_id');
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class, 'organization_id');
    }
}


