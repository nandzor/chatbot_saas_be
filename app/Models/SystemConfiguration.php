<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class SystemConfiguration extends Model
{
    use HasFactory;

    protected $fillable = [
        'category',
        'key',
        'value',
        'type',
        'description',
        'is_public',
        'is_editable',
        'validation_rules',
        'options',
        'default_value',
        'sort_order',
    ];

    protected $casts = [
        'is_public' => 'boolean',
        'is_editable' => 'boolean',
        'validation_rules' => 'array',
        'options' => 'array',
        'sort_order' => 'integer',
    ];

    // Cache key prefix
    protected static string $cachePrefix = 'system_config_';

    // Cache TTL in minutes
    protected static int $cacheTtl = 60;

    // Scopes
    public function scopeByCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    public function scopeEditable($query)
    {
        return $query->where('is_editable', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('key');
    }

    // Static Methods
    public static function get(string $key, $default = null)
    {
        $cacheKey = self::$cachePrefix . $key;

        return Cache::remember($cacheKey, self::$cacheTtl, function () use ($key, $default) {
            $config = self::where('key', $key)->first();

            if (!$config) {
                return $default;
            }

            return self::castValue($config->value, $config->type);
        });
    }

    public static function set(string $key, $value, string $type = 'string'): bool
    {
        $config = self::where('key', $key)->first();

        if ($config) {
            $config->update([
                'value' => self::prepareValue($value, $type),
                'type' => $type,
            ]);
        } else {
            self::create([
                'key' => $key,
                'value' => self::prepareValue($value, $type),
                'type' => $type,
                'category' => 'custom',
                'is_public' => false,
                'is_editable' => true,
            ]);
        }

        // Clear cache
        self::clearCache($key);

        return true;
    }

    public static function getByCategory(string $category): array
    {
        $cacheKey = self::$cachePrefix . 'category_' . $category;

        return Cache::remember($cacheKey, self::$cacheTtl, function () use ($category) {
            $configs = self::byCategory($category)->ordered()->get();

            $result = [];
            foreach ($configs as $config) {
                $result[$config->key] = self::castValue($config->value, $config->type);
            }

            return $result;
        });
    }

    public static function getPublicConfigs(): array
    {
        $cacheKey = self::$cachePrefix . 'public';

        return Cache::remember($cacheKey, self::$cacheTtl, function () {
            $configs = self::public()->ordered()->get();

            $result = [];
            foreach ($configs as $config) {
                $result[$config->key] = self::castValue($config->value, $config->type);
            }

            return $result;
        });
    }

    public static function clearCache(?string $key = null): void
    {
        if ($key) {
            Cache::forget(self::$cachePrefix . $key);
        } else {
            // Clear all system config cache
            Cache::flush();
        }
    }

    // Helper Methods
    protected static function castValue($value, string $type)
    {
        return match ($type) {
            'boolean' => filter_var($value, FILTER_VALIDATE_BOOLEAN),
            'integer' => (int) $value,
            'float' => (float) $value,
            'json', 'array' => is_string($value) ? json_decode($value, true) : $value,
            default => (string) $value,
        };
    }

    protected static function prepareValue($value, string $type): string
    {
        return match ($type) {
            'boolean' => $value ? 'true' : 'false',
            'json', 'array' => is_string($value) ? $value : json_encode($value),
            default => (string) $value,
        };
    }

    // Accessors & Mutators
    public function getTypedValueAttribute()
    {
        return self::castValue($this->value, $this->type);
    }

    public function getIsBooleanAttribute(): bool
    {
        return $this->type === 'boolean';
    }

    public function getIsNumericAttribute(): bool
    {
        return in_array($this->type, ['integer', 'float']);
    }

    public function getIsJsonAttribute(): bool
    {
        return in_array($this->type, ['json', 'array']);
    }

    public function getDisplayValueAttribute(): string
    {
        if ($this->is_boolean) {
            return $this->typed_value ? 'Yes' : 'No';
        }

        if ($this->is_json) {
            return json_encode($this->typed_value, JSON_PRETTY_PRINT);
        }

        return (string) $this->typed_value;
    }

    public function getCategoryDisplayNameAttribute(): string
    {
        return str_replace('_', ' ', ucwords($this->category, '_'));
    }

    public function getKeyDisplayNameAttribute(): string
    {
        return str_replace('_', ' ', ucwords($this->key, '_'));
    }

    // Validation
    public function validateValue($value): bool
    {
        if (!$this->validation_rules) {
            return true;
        }

        // Basic validation based on type
        switch ($this->type) {
            case 'boolean':
                return is_bool($value) || in_array($value, ['true', 'false', '1', '0', 'yes', 'no']);
            case 'integer':
                return is_numeric($value) && is_int($value + 0);
            case 'float':
                return is_numeric($value);
            case 'json':
            case 'array':
                if (is_string($value)) {
                    json_decode($value);
                    return json_last_error() === JSON_ERROR_NONE;
                }
                return is_array($value);
            default:
                return is_string($value);
        }
    }

    // Events
    protected static function boot()
    {
        parent::boot();

        static::saved(function ($config) {
            self::clearCache($config->key);
        });

        static::deleted(function ($config) {
            self::clearCache($config->key);
        });
    }
}
