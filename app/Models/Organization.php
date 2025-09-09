<?php

namespace App\Models;

use App\Traits\HasStatus;
use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\SoftDeletes;

class Organization extends Model
{
    use HasFactory, HasUuid, HasStatus, SoftDeletes;

    protected $fillable = [
        'org_code',
        'name',
        'display_name',
        'email',
        'phone',
        'address',
        'logo_url',
        'favicon_url',
        'website',
        'tax_id',
        'business_type',
        'industry',
        'company_size',
        'timezone',
        'locale',
        'currency',
        'subscription_plan_id',
        'subscription_status',
        'trial_ends_at',
        'subscription_starts_at',
        'subscription_ends_at',
        'billing_cycle',
        'current_usage',
        'theme_config',
        'branding_config',
        'feature_flags',
        'ui_preferences',
        'business_hours',
        'contact_info',
        'social_media',
        'security_settings',
        'api_enabled',
        'webhook_url',
        'webhook_secret',
        'settings',
        'metadata',
        'status',
        // New fields for organization settings
        'description',
        'logo',
        'founded_year',
        'employee_count',
        'annual_revenue',
        'api_key',
        'rate_limit',
        'allowed_origins',
        'webhook_enabled',
        'two_factor_enabled',
        'sso_enabled',
        'sso_provider',
        'password_policy',
        'session_timeout',
        'ip_whitelist',
        'allowed_domains',
        'email_notifications',
        'push_notifications',
        'webhook_notifications',
        'chatbot_settings',
        'analytics_settings',
        'integrations_settings',
        'custom_branding_settings',
        'features',
        'limits',
        'auto_renew',
    ];

    protected $casts = [
        'trial_ends_at' => 'datetime',
        'subscription_starts_at' => 'datetime',
        'subscription_ends_at' => 'datetime',
        'current_usage' => 'array',
        'theme_config' => 'array',
        'branding_config' => 'array',
        'feature_flags' => 'array',
        'ui_preferences' => 'array',
        'business_hours' => 'array',
        'contact_info' => 'array',
        'social_media' => 'array',
        'security_settings' => 'array',
        'api_enabled' => 'boolean',
        'settings' => 'array',
        'metadata' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
        // New casts for organization settings
        'annual_revenue' => 'decimal:2',
        'allowed_origins' => 'array',
        'webhook_enabled' => 'boolean',
        'two_factor_enabled' => 'boolean',
        'sso_enabled' => 'boolean',
        'password_policy' => 'array',
        'ip_whitelist' => 'array',
        'allowed_domains' => 'array',
        'email_notifications' => 'array',
        'push_notifications' => 'array',
        'webhook_notifications' => 'array',
        'chatbot_settings' => 'array',
        'analytics_settings' => 'array',
        'integrations_settings' => 'array',
        'custom_branding_settings' => 'array',
        'features' => 'array',
        'limits' => 'array',
        'auto_renew' => 'boolean',
    ];

    /**
     * Get the subscription plan for this organization.
     */
    public function subscriptionPlan(): BelongsTo
    {
        return $this->belongsTo(SubscriptionPlan::class, 'subscription_plan_id');
    }

    /**
     * Get the users for this organization.
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /**
     * Get the agents for this organization.
     */
    public function agents(): HasMany
    {
        return $this->hasMany(Agent::class);
    }

    /**
     * Get the customers for this organization.
     */
    public function customers(): HasMany
    {
        return $this->hasMany(Customer::class);
    }

    /**
     * Get the subscriptions for this organization.
     */
    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    /**
     * Get the current active subscription.
     */
    public function activeSubscription(): HasMany
    {
        return $this->subscriptions()->where('status', 'success');
    }

    /**
     * Get the API keys for this organization.
     */
    public function apiKeys(): HasMany
    {
        return $this->hasMany(ApiKey::class);
    }

    /**
     * Get the billing invoices for this organization.
     */
    public function billingInvoices(): HasMany
    {
        return $this->hasMany(BillingInvoice::class);
    }

    /**
     * Get the usage tracking records for this organization.
     */
    public function usageTracking(): HasMany
    {
        return $this->hasMany(UsageTracking::class);
    }

    /**
     * Get the AI models for this organization.
     */
    public function aiModels(): HasMany
    {
        return $this->hasMany(AiModel::class);
    }

    /**
     * Get the knowledge base categories for this organization.
     */
    public function knowledgeBaseCategories(): HasMany
    {
        return $this->hasMany(KnowledgeBaseCategory::class);
    }

    /**
     * Get the knowledge base items for this organization.
     */
    public function knowledgeBaseItems(): HasMany
    {
        return $this->hasMany(KnowledgeBaseItem::class);
    }

    /**
     * Get the knowledge base tags for this organization.
     */
    public function knowledgeBaseTags(): HasMany
    {
        return $this->hasMany(KnowledgeBaseTag::class);
    }

    /**
     * Get the bot personalities for this organization.
     */
    public function botPersonalities(): HasMany
    {
        return $this->hasMany(BotPersonality::class);
    }

    /**
     * Get the channel configs for this organization.
     */
    public function channelConfigs(): HasMany
    {
        return $this->hasMany(ChannelConfig::class);
    }

    /**
     * Get the chat sessions for this organization.
     */
    public function chatSessions(): HasMany
    {
        return $this->hasMany(ChatSession::class);
    }

    /**
     * Get the messages through chat sessions.
     */
    public function messages(): HasManyThrough
    {
        return $this->hasManyThrough(Message::class, ChatSession::class);
    }

    /**
     * Get the AI training data for this organization.
     */
    public function aiTrainingData(): HasMany
    {
        return $this->hasMany(AiTrainingData::class);
    }

    /**
     * Get the AI conversations log for this organization.
     */
    public function aiConversationsLog(): HasMany
    {
        return $this->hasMany(AiConversationLog::class);
    }

    /**
     * Get the audit logs for this organization.
     */
    public function auditLogs(): HasMany
    {
        return $this->hasMany(AuditLog::class);
    }

    /**
     * Get the analytics daily records for this organization.
     */
    public function analyticsDaily(): HasMany
    {
        return $this->hasMany(AnalyticsDaily::class);
    }

    /**
     * Get the webhooks for this organization.
     */
    public function webhooks(): HasMany
    {
        return $this->hasMany(Webhook::class);
    }

    /**
     * Get the N8N workflows for this organization.
     */
    public function n8nWorkflows(): HasMany
    {
        return $this->hasMany(N8nWorkflow::class);
    }

    /**
     * Get the payment transactions for this organization.
     */
    public function paymentTransactions(): HasMany
    {
        return $this->hasMany(PaymentTransaction::class);
    }

    /**
     * Get the roles for this organization.
     */
    public function roles(): HasMany
    {
        return $this->hasMany(Role::class);
    }

    /**
     * Get the permissions for this organization.
     */
    public function permissions(): HasMany
    {
        return $this->hasMany(Permission::class);
    }

    /**
     * Get the permission groups for this organization.
     */
    public function permissionGroups(): HasMany
    {
        return $this->hasMany(PermissionGroup::class);
    }

    /**
     * Check if the organization has a specific feature.
     */
    public function hasFeature(string $feature): bool
    {
        // Check feature flags first
        if (isset($this->feature_flags[$feature])) {
            return $this->feature_flags[$feature] === true;
        }

        // Check subscription plan features
        return $this->subscriptionPlan?->hasFeature($feature) ?? false;
    }

    /**
     * Get current usage for a specific quota type.
     */
    public function getCurrentUsage(string $quotaType): int
    {
        return $this->current_usage[$quotaType] ?? 0;
    }

    /**
     * Check if subscription is active.
     */
    public function hasActiveSubscription(): bool
    {
        return in_array($this->subscription_status, ['active', 'trial']);
    }

    /**
     * Check if organization is in trial period.
     */
    public function isInTrial(): bool
    {
        return $this->subscription_status === 'trial' &&
               $this->trial_ends_at &&
               $this->trial_ends_at->isFuture();
    }

    /**
     * Check if trial has expired.
     */
    public function hasTrialExpired(): bool
    {
        return $this->subscription_status === 'trial' &&
               $this->trial_ends_at &&
               $this->trial_ends_at->isPast();
    }

    /**
     * Scope for organizations with active subscriptions.
     */
    public function scopeWithActiveSubscription($query)
    {
        return $query->whereIn('subscription_status', ['active', 'trial']);
    }

    /**
     * Scope for organizations in trial.
     */
    public function scopeInTrial($query)
    {
        return $query->where('subscription_status', 'trial')
                    ->where('trial_ends_at', '>', now());
    }

    /**
     * Scope for organizations with expired trial.
     */
    public function scopeTrialExpired($query)
    {
        return $query->where('subscription_status', 'trial')
                    ->where('trial_ends_at', '<=', now());
    }
}
