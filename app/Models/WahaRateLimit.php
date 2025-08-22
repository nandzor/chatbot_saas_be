<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class WahaRateLimit extends Model
{
    use HasFactory, HasUuid;

    protected $table = 'waha_rate_limits';

    protected $fillable = [
        'session_id',
        'limit_type',
        'window_start',
        'window_duration_seconds',
        'current_count',
        'limit_threshold',
        'is_exceeded',
        'reset_at',
    ];

    protected $casts = [
        'window_start' => 'datetime',
        'window_duration_seconds' => 'integer',
        'current_count' => 'integer',
        'limit_threshold' => 'integer',
        'is_exceeded' => 'boolean',
        'reset_at' => 'datetime',
    ];

    public function session(): BelongsTo
    {
        return $this->belongsTo(WahaSession::class, 'session_id');
    }
}
