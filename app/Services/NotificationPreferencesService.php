<?php

namespace App\Services;

use App\Models\Organization;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class NotificationPreferencesService
{
    /**
     * Get notification preferences for organization
     */
    public function getOrganizationPreferences(int $organizationId): array
    {
        $cacheKey = "notification_preferences_org_{$organizationId}";

        return Cache::remember($cacheKey, 3600, function () use ($organizationId) {
            $organization = Organization::findOrFail($organizationId);

            return array_merge($this->getDefaultPreferences(), $organization->notification_preferences ?? []);
        });
    }

    /**
     * Get notification preferences for user
     */
    public function getUserPreferences(int $userId): array
    {
        $cacheKey = "notification_preferences_user_{$userId}";

        return Cache::remember($cacheKey, 3600, function () use ($userId) {
            $user = User::findOrFail($userId);

            return array_merge($this->getDefaultUserPreferences(), $user->notification_preferences ?? []);
        });
    }

    /**
     * Update organization notification preferences
     */
    public function updateOrganizationPreferences(int $organizationId, array $preferences): array
    {
        try {
            $organization = Organization::findOrFail($organizationId);

            // Validate preferences
            $validatedPreferences = $this->validatePreferences($preferences, 'organization');

            // Merge with existing preferences
            $currentPreferences = $organization->notification_preferences ?? [];
            $newPreferences = array_merge($currentPreferences, $validatedPreferences);

            // Update organization
            $organization->update([
                'notification_preferences' => $newPreferences
            ]);

            // Clear cache
            Cache::forget("notification_preferences_org_{$organizationId}");

            Log::info('Organization notification preferences updated', [
                'organization_id' => $organizationId,
                'preferences' => $newPreferences
            ]);

            return $newPreferences;

        } catch (\Exception $e) {
            Log::error('Failed to update organization notification preferences', [
                'organization_id' => $organizationId,
                'error' => $e->getMessage()
            ]);

            throw $e;
        }
    }

    /**
     * Update user notification preferences
     */
    public function updateUserPreferences(int $userId, array $preferences): array
    {
        try {
            $user = User::findOrFail($userId);

            // Validate preferences
            $validatedPreferences = $this->validatePreferences($preferences, 'user');

            // Merge with existing preferences
            $currentPreferences = $user->notification_preferences ?? [];
            $newPreferences = array_merge($currentPreferences, $validatedPreferences);

            // Update user
            $user->update([
                'notification_preferences' => $newPreferences
            ]);

            // Clear cache
            Cache::forget("notification_preferences_user_{$userId}");

            Log::info('User notification preferences updated', [
                'user_id' => $userId,
                'preferences' => $newPreferences
            ]);

            return $newPreferences;

        } catch (\Exception $e) {
            Log::error('Failed to update user notification preferences', [
                'user_id' => $userId,
                'error' => $e->getMessage()
            ]);

            throw $e;
        }
    }

    /**
     * Check if notification should be sent based on preferences
     */
    public function shouldSendNotification(string $type, string $channel, int $organizationId, int $userId = null): bool
    {
        try {
            // Get organization preferences
            $orgPreferences = $this->getOrganizationPreferences($organizationId);

            // Check organization-level preferences
            if (!$this->isChannelEnabledForOrganization($channel, $type, $orgPreferences)) {
                return false;
            }

            // Check user-level preferences if user is specified
            if ($userId) {
                $userPreferences = $this->getUserPreferences($userId);
                if (!$this->isChannelEnabledForUser($channel, $type, $userPreferences)) {
                    return false;
                }
            }

            // Check quiet hours
            if (!$this->isWithinAllowedHours($orgPreferences, $userId)) {
                return false;
            }

            // Check rate limiting
            if (!$this->isWithinRateLimit($type, $channel, $organizationId, $userId)) {
                return false;
            }

            return true;

        } catch (\Exception $e) {
            Log::error('Error checking notification preferences', [
                'type' => $type,
                'channel' => $channel,
                'organization_id' => $organizationId,
                'user_id' => $userId,
                'error' => $e->getMessage()
            ]);

            // Default to allowing notification on error
            return true;
        }
    }

    /**
     * Get default organization preferences
     */
    private function getDefaultPreferences(): array
    {
        return [
            'channels' => [
                'in_app' => [
                    'enabled' => true,
                    'types' => ['welcome', 'urgent', 'system', 'reminder', 'feature_update']
                ],
                'email' => [
                    'enabled' => true,
                    'types' => ['welcome', 'urgent', 'system', 'newsletter', 'subscription_expiring', 'payment_failed']
                ],
                'webhook' => [
                    'enabled' => true,
                    'types' => ['urgent', 'system', 'payment_failed', 'security_alert']
                ],
                'sms' => [
                    'enabled' => false,
                    'types' => ['urgent', 'security_alert']
                ],
                'push' => [
                    'enabled' => false,
                    'types' => ['urgent', 'reminder', 'security_alert']
                ]
            ],
            'quiet_hours' => [
                'enabled' => false,
                'start' => '22:00',
                'end' => '08:00',
                'timezone' => 'UTC'
            ],
            'rate_limiting' => [
                'enabled' => true,
                'max_per_hour' => 50,
                'max_per_day' => 200
            ],
            'priority_override' => [
                'urgent_ignore_quiet_hours' => true,
                'security_ignore_rate_limit' => true
            ]
        ];
    }

    /**
     * Get default user preferences
     */
    private function getDefaultUserPreferences(): array
    {
        return [
            'channels' => [
                'in_app' => [
                    'enabled' => true,
                    'types' => ['welcome', 'urgent', 'system', 'reminder', 'feature_update']
                ],
                'email' => [
                    'enabled' => true,
                    'types' => ['welcome', 'urgent', 'system', 'newsletter', 'reminder']
                ],
                'sms' => [
                    'enabled' => false,
                    'types' => ['urgent', 'security_alert']
                ],
                'push' => [
                    'enabled' => true,
                    'types' => ['urgent', 'reminder', 'feature_update']
                ]
            ],
            'quiet_hours' => [
                'enabled' => false,
                'start' => '22:00',
                'end' => '08:00',
                'timezone' => 'UTC'
            ],
            'digest' => [
                'enabled' => false,
                'frequency' => 'daily', // hourly, daily, weekly
                'time' => '09:00'
            ]
        ];
    }

    /**
     * Validate preferences structure
     */
    private function validatePreferences(array $preferences, string $type): array
    {
        $defaultPreferences = $type === 'organization'
            ? $this->getDefaultPreferences()
            : $this->getDefaultUserPreferences();

        $validated = [];

        // Validate channels
        if (isset($preferences['channels']) && is_array($preferences['channels'])) {
            foreach ($preferences['channels'] as $channel => $settings) {
                if (isset($defaultPreferences['channels'][$channel]) && is_array($settings)) {
                    $validated['channels'][$channel] = [
                        'enabled' => $settings['enabled'] ?? true,
                        'types' => is_array($settings['types'] ?? []) ? $settings['types'] : []
                    ];
                }
            }
        }

        // Validate quiet hours
        if (isset($preferences['quiet_hours']) && is_array($preferences['quiet_hours'])) {
            $validated['quiet_hours'] = [
                'enabled' => $preferences['quiet_hours']['enabled'] ?? false,
                'start' => $preferences['quiet_hours']['start'] ?? '22:00',
                'end' => $preferences['quiet_hours']['end'] ?? '08:00',
                'timezone' => $preferences['quiet_hours']['timezone'] ?? 'UTC'
            ];
        }

        // Validate rate limiting (organization only)
        if ($type === 'organization' && isset($preferences['rate_limiting']) && is_array($preferences['rate_limiting'])) {
            $validated['rate_limiting'] = [
                'enabled' => $preferences['rate_limiting']['enabled'] ?? true,
                'max_per_hour' => max(1, min(1000, $preferences['rate_limiting']['max_per_hour'] ?? 50)),
                'max_per_day' => max(1, min(10000, $preferences['rate_limiting']['max_per_day'] ?? 200))
            ];
        }

        // Validate digest settings (user only)
        if ($type === 'user' && isset($preferences['digest']) && is_array($preferences['digest'])) {
            $validated['digest'] = [
                'enabled' => $preferences['digest']['enabled'] ?? false,
                'frequency' => in_array($preferences['digest']['frequency'] ?? 'daily', ['hourly', 'daily', 'weekly'])
                    ? $preferences['digest']['frequency']
                    : 'daily',
                'time' => $preferences['digest']['time'] ?? '09:00'
            ];
        }

        return $validated;
    }

    /**
     * Check if channel is enabled for organization
     */
    private function isChannelEnabledForOrganization(string $channel, string $type, array $preferences): bool
    {
        if (!isset($preferences['channels'][$channel])) {
            return false;
        }

        $channelSettings = $preferences['channels'][$channel];

        if (!($channelSettings['enabled'] ?? true)) {
            return false;
        }

        $allowedTypes = $channelSettings['types'] ?? [];
        return empty($allowedTypes) || in_array($type, $allowedTypes);
    }

    /**
     * Check if channel is enabled for user
     */
    private function isChannelEnabledForUser(string $channel, string $type, array $preferences): bool
    {
        if (!isset($preferences['channels'][$channel])) {
            return false;
        }

        $channelSettings = $preferences['channels'][$channel];

        if (!($channelSettings['enabled'] ?? true)) {
            return false;
        }

        $allowedTypes = $channelSettings['types'] ?? [];
        return empty($allowedTypes) || in_array($type, $allowedTypes);
    }

    /**
     * Check if notification is within allowed hours
     */
    private function isWithinAllowedHours(array $orgPreferences, int $userId = null): bool
    {
        // Check organization quiet hours
        if ($orgPreferences['quiet_hours']['enabled'] ?? false) {
            $timezone = $orgPreferences['quiet_hours']['timezone'] ?? 'UTC';
            $start = $orgPreferences['quiet_hours']['start'] ?? '22:00';
            $end = $orgPreferences['quiet_hours']['end'] ?? '08:00';

            if (!$this->isWithinTimeRange($start, $end, $timezone)) {
                return false;
            }
        }

        // Check user quiet hours if user is specified
        if ($userId) {
            $userPreferences = $this->getUserPreferences($userId);
            if ($userPreferences['quiet_hours']['enabled'] ?? false) {
                $timezone = $userPreferences['quiet_hours']['timezone'] ?? 'UTC';
                $start = $userPreferences['quiet_hours']['start'] ?? '22:00';
                $end = $userPreferences['quiet_hours']['end'] ?? '08:00';

                if (!$this->isWithinTimeRange($start, $end, $timezone)) {
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Check if current time is within allowed range
     */
    private function isWithinTimeRange(string $start, string $end, string $timezone): bool
    {
        try {
            $now = now($timezone);
            $startTime = $now->copy()->setTimeFromTimeString($start);
            $endTime = $now->copy()->setTimeFromTimeString($end);

            // Handle overnight range (e.g., 22:00 to 08:00)
            if ($startTime->greaterThan($endTime)) {
                return $now->lessThan($endTime) || $now->greaterThanOrEqualTo($startTime);
            }

            // Handle same-day range (e.g., 09:00 to 17:00)
            return $now->between($startTime, $endTime);
        } catch (\Exception $e) {
            Log::error('Error checking time range', [
                'start' => $start,
                'end' => $end,
                'timezone' => $timezone,
                'error' => $e->getMessage()
            ]);

            return true; // Default to allowing on error
        }
    }

    /**
     * Check rate limiting
     */
    private function isWithinRateLimit(string $type, string $channel, int $organizationId, int $userId = null): bool
    {
        $orgPreferences = $this->getOrganizationPreferences($organizationId);

        if (!($orgPreferences['rate_limiting']['enabled'] ?? true)) {
            return true;
        }

        $maxPerHour = $orgPreferences['rate_limiting']['max_per_hour'] ?? 50;
        $maxPerDay = $orgPreferences['rate_limiting']['max_per_day'] ?? 200;

        // Check hourly rate limit
        $hourlyKey = "notification_rate_limit_org_{$organizationId}_hour_" . now()->format('Y-m-d_H');
        $hourlyCount = Cache::get($hourlyKey, 0);

        if ($hourlyCount >= $maxPerHour) {
            // Check if priority override applies
            if ($type === 'urgent' || $type === 'security_alert') {
                if ($orgPreferences['priority_override']['security_ignore_rate_limit'] ?? true) {
                    return true;
                }
            }
            return false;
        }

        // Check daily rate limit
        $dailyKey = "notification_rate_limit_org_{$organizationId}_day_" . now()->format('Y-m-d');
        $dailyCount = Cache::get($dailyKey, 0);

        if ($dailyCount >= $maxPerDay) {
            // Check if priority override applies
            if ($type === 'urgent' || $type === 'security_alert') {
                if ($orgPreferences['priority_override']['security_ignore_rate_limit'] ?? true) {
                    return true;
                }
            }
            return false;
        }

        // Increment counters
        Cache::increment($hourlyKey, 1);
        Cache::put($hourlyKey, Cache::get($hourlyKey, 1), 3600); // 1 hour TTL

        Cache::increment($dailyKey, 1);
        Cache::put($dailyKey, Cache::get($dailyKey, 1), 86400); // 24 hours TTL

        return true;
    }

    /**
     * Clear preferences cache
     */
    public function clearPreferencesCache(int $organizationId = null, int $userId = null): void
    {
        if ($organizationId) {
            Cache::forget("notification_preferences_org_{$organizationId}");
        }

        if ($userId) {
            Cache::forget("notification_preferences_user_{$userId}");
        }

        Log::info('Notification preferences cache cleared', [
            'organization_id' => $organizationId,
            'user_id' => $userId
        ]);
    }
}
