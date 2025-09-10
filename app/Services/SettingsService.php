<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;

class SettingsService
{
    private const CACHE_KEY = 'client_management_settings';
    private const CACHE_TTL = 3600; // 1 hour

    /**
     * Get all client management settings
     */
    public function getClientManagementSettings(): array
    {
        return Cache::remember(self::CACHE_KEY, self::CACHE_TTL, function () {
            return $this->getDefaultSettings();
        });
    }

    /**
     * Update client management settings
     */
    public function updateClientManagementSettings(array $settings): array
    {
        $currentSettings = $this->getClientManagementSettings();
        $updatedSettings = $this->mergeSettings($currentSettings, $settings);

        // Store in cache
        Cache::put(self::CACHE_KEY, $updatedSettings, self::CACHE_TTL);

        // In a real application, you would also store in database
        // $this->storeSettingsInDatabase($updatedSettings);

        return $updatedSettings;
    }

    /**
     * Reset settings to defaults
     */
    public function resetClientManagementSettingsToDefaults(): array
    {
        $defaultSettings = $this->getDefaultSettings();

        // Clear cache and set defaults
        Cache::forget(self::CACHE_KEY);
        Cache::put(self::CACHE_KEY, $defaultSettings, self::CACHE_TTL);

        return $defaultSettings;
    }

    /**
     * Export settings configuration
     */
    public function exportSettings(array $settings): array
    {
        return [
            'exported_at' => now()->toISOString(),
            'version' => '1.0',
            'settings' => $settings,
            'metadata' => [
                'total_sections' => count($settings),
                'exported_by' => \Illuminate\Support\Facades\Auth::user()?->email ?? 'system',
                'environment' => app()->environment()
            ]
        ];
    }

    /**
     * Import settings configuration
     */
    public function importSettings(UploadedFile $file): array
    {
        $content = $file->getContent();
        $importData = json_decode($content, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \InvalidArgumentException('Invalid JSON file format');
        }

        if (!isset($importData['settings'])) {
            throw new \InvalidArgumentException('Invalid settings file format');
        }

        $importedSettings = $importData['settings'];

        // Validate imported settings structure
        $this->validateSettingsStructure($importedSettings);

        // Update settings
        return $this->updateClientManagementSettings($importedSettings);
    }

    /**
     * Get default settings configuration
     */
    private function getDefaultSettings(): array
    {
        return [
            'general' => [
                'default_organization_status' => 'active',
                'auto_approve_organizations' => false,
                'require_email_verification' => true,
                'allow_self_registration' => true,
                'max_organizations_per_user' => 5,
                'default_trial_days' => 14,
                'organization_name_pattern' => '^[a-zA-Z0-9\\s\\-_&.()]+$',
                'organization_description_max_length' => 500
            ],

            'user_management' => [
                'allow_user_invitations' => true,
                'require_admin_approval' => false,
                'default_user_role' => 'member',
                'allow_role_changes' => true,
                'max_users_per_organization' => 100,
                'user_session_timeout' => 24, // hours
                'require_strong_passwords' => true,
                'password_min_length' => 8,
                'enable_two_factor_auth' => false,
                'allow_password_reset' => true
            ],

            'security' => [
                'enable_api_rate_limiting' => true,
                'api_rate_limit_per_minute' => 100,
                'enable_ip_whitelisting' => false,
                'allowed_ip_addresses' => '',
                'enable_audit_logging' => true,
                'log_retention_days' => 90,
                'enable_data_encryption' => true,
                'require_https' => true,
                'enable_cors' => true,
                'cors_origins' => '*'
            ],

            'notifications' => [
                'enable_email_notifications' => true,
                'notify_on_new_organization' => true,
                'notify_on_user_registration' => true,
                'notify_on_suspicious_activity' => true,
                'notify_on_system_maintenance' => true,
                'email_from_address' => 'noreply@chatbot-saas.com',
                'email_from_name' => 'ChatBot SaaS',
                'enable_sms_notifications' => false,
                'sms_provider' => 'twilio'
            ],

            'data_management' => [
                'enable_data_backup' => true,
                'backup_frequency' => 'daily',
                'backup_retention_days' => 30,
                'enable_data_export' => true,
                'allow_bulk_operations' => true,
                'enable_soft_delete' => true,
                'data_retention_policy' => 'standard',
                'enable_gdpr_compliance' => true,
                'allow_data_anonymization' => true
            ],

            'integrations' => [
                'enable_webhooks' => true,
                'webhook_timeout' => 30,
                'enable_api_keys' => true,
                'api_key_expiration_days' => 365,
                'enable_sso' => false,
                'sso_provider' => 'oauth2',
                'enable_third_party_integrations' => true,
                'allowed_integrations' => ['slack', 'microsoft-teams', 'discord']
            ]
        ];
    }

    /**
     * Merge settings arrays recursively
     */
    private function mergeSettings(array $current, array $new): array
    {
        foreach ($new as $section => $settings) {
            if (isset($current[$section]) && is_array($current[$section]) && is_array($settings)) {
                $current[$section] = array_merge($current[$section], $settings);
            } else {
                $current[$section] = $settings;
            }
        }

        return $current;
    }

    /**
     * Validate settings structure
     */
    private function validateSettingsStructure(array $settings): void
    {
        $requiredSections = ['general', 'user_management', 'security', 'notifications', 'data_management', 'integrations'];

        foreach ($requiredSections as $section) {
            if (!isset($settings[$section]) || !is_array($settings[$section])) {
                throw new \InvalidArgumentException("Missing or invalid section: {$section}");
            }
        }
    }

    /**
     * Get specific setting value
     */
    public function getSetting(string $section, string $key, $default = null)
    {
        $settings = $this->getClientManagementSettings();
        return $settings[$section][$key] ?? $default;
    }

    /**
     * Set specific setting value
     */
    public function setSetting(string $section, string $key, $value): void
    {
        $settings = $this->getClientManagementSettings();
        $settings[$section][$key] = $value;

        Cache::put(self::CACHE_KEY, $settings, self::CACHE_TTL);
    }

    /**
     * Clear settings cache
     */
    public function clearCache(): void
    {
        Cache::forget(self::CACHE_KEY);
    }

    /**
     * Get settings metadata
     */
    public function getSettingsMetadata(): array
    {
        return [
            'last_updated' => Cache::get(self::CACHE_KEY . '_updated_at'),
            'cache_ttl' => self::CACHE_TTL,
            'total_sections' => count($this->getClientManagementSettings()),
            'version' => '1.0'
        ];
    }
}
