<?php

namespace App\Services;

use App\Models\Organization;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class NotificationTemplateService
{
    /**
     * Get notification template
     */
    public function getTemplate(string $type, Organization $organization = null): array
    {
        $cacheKey = "notification_template_{$type}";

        if ($organization) {
            $cacheKey .= "_org_{$organization->id}";
        }

        return Cache::remember($cacheKey, 3600, function () use ($type, $organization) {
            return $this->buildTemplate($type, $organization);
        });
    }

    /**
     * Build notification template
     */
    private function buildTemplate(string $type, Organization $organization = null): array
    {
        $templates = [
            'welcome' => [
                'title' => 'Welcome to {{app_name}}!',
                'message' => 'Thank you for joining {{organization_name}}. We\'re excited to have you on board!',
                'channels' => ['in_app', 'email'],
                'priority' => 'normal',
                'email_template' => 'welcome',
                'email_subject' => 'Welcome to {{app_name}}!',
                'data' => [
                    'action_url' => '{{dashboard_url}}',
                    'action_text' => 'Get Started',
                    'trial_info' => [
                        'duration' => '30 days',
                        'features' => ['Unlimited chatbots', 'Analytics dashboard', 'API access']
                    ]
                ]
            ],
            'urgent' => [
                'title' => 'Urgent: {{title}}',
                'message' => '{{message}}',
                'channels' => ['in_app', 'email', 'webhook'],
                'priority' => 'urgent',
                'email_template' => 'urgent',
                'email_subject' => 'URGENT: {{title}}',
                'data' => [
                    'urgency' => 'high',
                    'requires_action' => true
                ]
            ],
            'system' => [
                'title' => 'System Notification: {{title}}',
                'message' => '{{message}}',
                'channels' => ['in_app', 'email'],
                'priority' => 'high',
                'email_template' => 'default',
                'email_subject' => 'System Update: {{title}}',
                'data' => [
                    'system_notification' => true,
                    'category' => 'system'
                ]
            ],
            'newsletter' => [
                'title' => '{{title}}',
                'message' => '{{message}}',
                'channels' => ['email'],
                'priority' => 'low',
                'email_template' => 'newsletter',
                'email_subject' => '{{title}}',
                'data' => [
                    'newsletter' => true,
                    'unsubscribe_url' => '{{unsubscribe_url}}'
                ]
            ],
            'reminder' => [
                'title' => 'Reminder: {{title}}',
                'message' => '{{message}}',
                'channels' => ['in_app', 'email'],
                'priority' => 'normal',
                'email_template' => 'default',
                'email_subject' => 'Reminder: {{title}}',
                'data' => [
                    'reminder' => true,
                    'reminder_type' => '{{reminder_type}}'
                ]
            ],
            'subscription_expiring' => [
                'title' => 'Subscription Expiring Soon',
                'message' => 'Your {{subscription_plan}} subscription will expire on {{expiry_date}}. Renew now to continue enjoying our services.',
                'channels' => ['in_app', 'email', 'webhook'],
                'priority' => 'high',
                'email_template' => 'subscription',
                'email_subject' => 'Subscription Expiring - Action Required',
                'data' => [
                    'subscription_reminder' => true,
                    'action_url' => '{{renewal_url}}',
                    'action_text' => 'Renew Now',
                    'expiry_date' => '{{expiry_date}}',
                    'subscription_plan' => '{{subscription_plan}}'
                ]
            ],
            'payment_failed' => [
                'title' => 'Payment Failed',
                'message' => 'We were unable to process your payment. Please update your payment method to continue using our services.',
                'channels' => ['in_app', 'email', 'webhook'],
                'priority' => 'urgent',
                'email_template' => 'payment',
                'email_subject' => 'Payment Failed - Immediate Action Required',
                'data' => [
                    'payment_issue' => true,
                    'action_url' => '{{payment_url}}',
                    'action_text' => 'Update Payment Method',
                    'retry_count' => '{{retry_count}}'
                ]
            ],
            'feature_update' => [
                'title' => 'New Feature: {{feature_name}}',
                'message' => 'We\'ve added a new feature: {{feature_name}}. {{feature_description}}',
                'channels' => ['in_app', 'email'],
                'priority' => 'normal',
                'email_template' => 'feature',
                'email_subject' => 'New Feature Available: {{feature_name}}',
                'data' => [
                    'feature_update' => true,
                    'feature_name' => '{{feature_name}}',
                    'feature_description' => '{{feature_description}}',
                    'action_url' => '{{feature_url}}',
                    'action_text' => 'Try It Now'
                ]
            ],
            'security_alert' => [
                'title' => 'Security Alert: {{alert_type}}',
                'message' => 'We detected {{alert_description}}. Please review your account security settings.',
                'channels' => ['in_app', 'email', 'webhook', 'sms'],
                'priority' => 'urgent',
                'email_template' => 'security',
                'email_subject' => 'SECURITY ALERT: {{alert_type}}',
                'data' => [
                    'security_alert' => true,
                    'alert_type' => '{{alert_type}}',
                    'alert_description' => '{{alert_description}}',
                    'action_url' => '{{security_url}}',
                    'action_text' => 'Review Security'
                ]
            ]
        ];

        $template = $templates[$type] ?? $templates['system'];

        // Replace placeholders if organization is provided
        if ($organization) {
            $template = $this->replacePlaceholders($template, $organization);
        }

        return $template;
    }

    /**
     * Replace placeholders in template
     */
    private function replacePlaceholders(array $template, Organization $organization): array
    {
        $placeholders = [
            '{{app_name}}' => config('app.name', 'ChatBot SaaS'),
            '{{organization_name}}' => $organization->name,
            '{{organization_code}}' => $organization->code,
            '{{organization_email}}' => $organization->email,
            '{{dashboard_url}}' => config('app.url') . '/dashboard',
            '{{unsubscribe_url}}' => config('app.url') . '/unsubscribe/' . $organization->id,
            '{{renewal_url}}' => config('app.url') . '/billing/renew',
            '{{payment_url}}' => config('app.url') . '/billing/payment',
            '{{security_url}}' => config('app.url') . '/security',
            '{{subscription_plan}}' => $organization->subscription_plan ?? 'Trial',
            '{{expiry_date}}' => $organization->subscription_expires_at?->format('M j, Y') ?? 'N/A'
        ];

        $replaceInArray = function ($value) use ($placeholders, &$replaceInArray) {
            if (is_string($value)) {
                return str_replace(array_keys($placeholders), array_values($placeholders), $value);
            } elseif (is_array($value)) {
                return array_map($replaceInArray, $value);
            }
            return $value;
        };

        return array_map($replaceInArray, $template);
    }

    /**
     * Get available notification types
     */
    public function getAvailableTypes(): array
    {
        return [
            'welcome' => 'Welcome Notification',
            'urgent' => 'Urgent Notification',
            'system' => 'System Notification',
            'newsletter' => 'Newsletter',
            'reminder' => 'Reminder',
            'subscription_expiring' => 'Subscription Expiring',
            'payment_failed' => 'Payment Failed',
            'feature_update' => 'Feature Update',
            'security_alert' => 'Security Alert'
        ];
    }

    /**
     * Validate notification data against template
     */
    public function validateNotificationData(array $data, string $type): array
    {
        $template = $this->getTemplate($type);
        $errors = [];

        // Check required fields
        $requiredFields = ['title', 'message'];
        foreach ($requiredFields as $field) {
            if (empty($data[$field])) {
                $errors[] = "Field '{$field}' is required for notification type '{$type}'";
            }
        }

        // Validate channels
        if (isset($data['channels']) && is_array($data['channels'])) {
            $allowedChannels = ['in_app', 'email', 'webhook', 'sms', 'push'];
            $invalidChannels = array_diff($data['channels'], $allowedChannels);
            if (!empty($invalidChannels)) {
                $errors[] = "Invalid channels: " . implode(', ', $invalidChannels);
            }
        }

        // Validate priority
        if (isset($data['priority'])) {
            $allowedPriorities = ['low', 'normal', 'high', 'urgent'];
            if (!in_array($data['priority'], $allowedPriorities)) {
                $errors[] = "Invalid priority. Must be one of: " . implode(', ', $allowedPriorities);
            }
        }

        return $errors;
    }

    /**
     * Clear template cache
     */
    public function clearTemplateCache(string $type = null, Organization $organization = null): void
    {
        if ($type) {
            $cacheKey = "notification_template_{$type}";
            if ($organization) {
                $cacheKey .= "_org_{$organization->id}";
            }
            Cache::forget($cacheKey);
        } else {
            // Clear all template caches
            Cache::flush();
        }

        Log::info('Notification template cache cleared', [
            'type' => $type,
            'organization_id' => $organization?->id
        ]);
    }
}
