<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class NotificationTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'type',
        'category',
        'subject',
        'body',
        'variables',
        'settings',
        'is_active',
        'language',
        'version',
        'description',
        'metadata',
    ];

    protected $casts = [
        'variables' => 'array',
        'settings' => 'array',
        'metadata' => 'array',
        'is_active' => 'boolean',
    ];

    // Cache key prefix
    protected static string $cachePrefix = 'notification_template_';

    // Cache TTL in minutes
    protected static int $cacheTtl = 120;

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopeByCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    public function scopeByLanguage($query, string $language)
    {
        return $query->where('language', $language);
    }

    public function scopeEmail($query)
    {
        return $query->where('type', 'email');
    }

    public function scopeSms($query)
    {
        return $query->where('type', 'sms');
    }

    public function scopePush($query)
    {
        return $query->where('type', 'push');
    }

    public function scopeWebhook($query)
    {
        return $query->where('type', 'webhook');
    }

    // Static Methods
    public static function getTemplate(string $name, string $type = null, string $language = 'id'): ?self
    {
        $cacheKey = self::$cachePrefix . $name . '_' . $type . '_' . $language;

        return Cache::remember($cacheKey, self::$cacheTtl, function () use ($name, $type, $language) {
            $query = self::where('name', $name)
                ->where('language', $language)
                ->active();

            if ($type) {
                $query->where('type', $type);
            }

            return $query->first();
        });
    }

    public static function getTemplatesByCategory(string $category, string $type = null, string $language = 'id'): array
    {
        $cacheKey = self::$cachePrefix . 'category_' . $category . '_' . $type . '_' . $language;

        return Cache::remember($cacheKey, self::$cacheTtl, function () use ($category, $type, $language) {
            $query = self::byCategory($category)
                ->byLanguage($language)
                ->active();

            if ($type) {
                $query->byType($type);
            }

            return $query->get()->toArray();
        });
    }

    public static function clearCache(?string $name = null): void
    {
        if ($name) {
            // Clear specific template cache
            $languages = ['id', 'en'];
            $types = ['email', 'sms', 'push', 'webhook'];

            foreach ($languages as $language) {
                foreach ($types as $type) {
                    Cache::forget(self::$cachePrefix . $name . '_' . $type . '_' . $language);
                }
            }
        } else {
            // Clear all notification template cache
            Cache::flush();
        }
    }

    // Helper Methods
    public function render(array $data = []): array
    {
        $subject = $this->subject;
        $body = $this->body;

        // Replace variables in subject and body
        foreach ($data as $key => $value) {
            $placeholder = '{{' . $key . '}}';
            $subject = str_replace($placeholder, $value, $subject);
            $body = str_replace($placeholder, $value, $body);
        }

        return [
            'subject' => $subject,
            'body' => $body,
            'type' => $this->type,
            'category' => $this->category,
        ];
    }

    public function validateData(array $data): array
    {
        $errors = [];
        $requiredVariables = $this->variables ?? [];

        foreach ($requiredVariables as $variable) {
            if (!isset($data[$variable]) || empty($data[$variable])) {
                $errors[] = "Variable '{$variable}' is required";
            }
        }

        return $errors;
    }

    public function getAvailableVariables(): array
    {
        return $this->variables ?? [];
    }

    public function hasVariable(string $variable): bool
    {
        return in_array($variable, $this->getAvailableVariables());
    }

    public function getPreviewData(): array
    {
        $previewData = [];
        $variables = $this->getAvailableVariables();

        foreach ($variables as $variable) {
            $previewData[$variable] = $this->getPreviewValue($variable);
        }

        return $previewData;
    }

    protected function getPreviewValue(string $variable): string
    {
        $previewValues = [
            'organization_name' => 'Sample Organization',
            'amount' => 'Rp 1.000.000',
            'currency' => 'IDR',
            'payment_method' => 'Credit Card',
            'transaction_id' => 'TXN-12345678',
            'date' => now()->format('d/m/Y H:i'),
            'invoice_number' => 'INV-2024-001',
            'due_date' => now()->addDays(30)->format('d/m/Y'),
            'billing_period' => 'January 2024',
            'plan_name' => 'Premium Plan',
            'billing_cycle' => 'Monthly',
            'start_date' => now()->format('d/m/Y'),
            'end_date' => now()->addMonth()->format('d/m/Y'),
            'cancellation_reason' => 'Customer request',
            'refund_amount' => 'Rp 500.000',
            'expiry_date' => now()->addDays(7)->format('d/m/Y'),
            'renewal_options' => 'Monthly, Yearly',
            'maintenance_date' => now()->addDays(1)->format('d/m/Y H:i'),
            'maintenance_duration' => '2 hours',
            'affected_services' => 'Payment processing',
            'alert_type' => 'Suspicious activity',
            'alert_description' => 'Multiple failed login attempts',
            'action_required' => 'Change password immediately',
            'timestamp' => now()->format('d/m/Y H:i:s'),
            'failure_reason' => 'Insufficient funds',
            'refund_reason' => 'Service not provided',
            'payment_date' => now()->format('d/m/Y'),
            'overdue_days' => '5',
        ];

        return $previewValues[$variable] ?? "{{$variable}}";
    }

    // Accessors & Mutators
    public function getTypeDisplayNameAttribute(): string
    {
        return match ($this->type) {
            'email' => 'Email',
            'sms' => 'SMS',
            'push' => 'Push Notification',
            'webhook' => 'Webhook',
            default => ucfirst($this->type),
        };
    }

    public function getCategoryDisplayNameAttribute(): string
    {
        return match ($this->category) {
            'payment' => 'Payment',
            'billing' => 'Billing',
            'subscription' => 'Subscription',
            'system' => 'System',
            'security' => 'Security',
            default => ucfirst($this->category),
        };
    }

    public function getLanguageDisplayNameAttribute(): string
    {
        return match ($this->language) {
            'id' => 'Bahasa Indonesia',
            'en' => 'English',
            default => ucfirst($this->language),
        };
    }

    public function getIsEmailAttribute(): bool
    {
        return $this->type === 'email';
    }

    public function getIsSmsAttribute(): bool
    {
        return $this->type === 'sms';
    }

    public function getIsPushAttribute(): bool
    {
        return $this->type === 'push';
    }

    public function getIsWebhookAttribute(): bool
    {
        return $this->type === 'webhook';
    }

    public function getBodyPreviewAttribute(): string
    {
        return substr(strip_tags($this->body), 0, 100) . '...';
    }

    public function getVariableCountAttribute(): int
    {
        return count($this->getAvailableVariables());
    }

    public function getStatusColorAttribute(): string
    {
        return $this->is_active ? 'green' : 'red';
    }

    public function getStatusIconAttribute(): string
    {
        return $this->is_active ? 'check-circle' : 'x-circle';
    }

    // Events
    protected static function boot()
    {
        parent::boot();

        static::saved(function ($template) {
            self::clearCache($template->name);
        });

        static::deleted(function ($template) {
            self::clearCache($template->name);
        });
    }
}
