<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Services\SettingsService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SettingsController extends BaseApiController
{
    public function __construct(
        private SettingsService $settingsService
    ) {}

    /**
     * Get all client management settings
     */
    public function getClientManagementSettings(Request $request): JsonResponse
    {
        try {
            $settings = $this->settingsService->getClientManagementSettings();

            return $this->successResponse(
                'Client management settings retrieved successfully',
                $settings
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithDebug(
                message: 'Failed to retrieve client management settings',
                statusCode: 500,
                errors: $e->getMessage(),
                exception: $e
            );
        }
    }

    /**
     * Update client management settings
     */
    public function updateClientManagementSettings(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'general' => 'sometimes|array',
                'general.default_organization_status' => 'sometimes|string|in:active,pending,suspended,trial',
                'general.auto_approve_organizations' => 'sometimes|boolean',
                'general.require_email_verification' => 'sometimes|boolean',
                'general.allow_self_registration' => 'sometimes|boolean',
                'general.max_organizations_per_user' => 'sometimes|integer|min:1|max:50',
                'general.default_trial_days' => 'sometimes|integer|min:1|max:365',
                'general.organization_name_pattern' => 'sometimes|string',
                'general.organization_description_max_length' => 'sometimes|integer|min:50|max:2000',

                'user_management' => 'sometimes|array',
                'user_management.allow_user_invitations' => 'sometimes|boolean',
                'user_management.require_admin_approval' => 'sometimes|boolean',
                'user_management.default_user_role' => 'sometimes|string|in:member,admin,viewer',
                'user_management.allow_role_changes' => 'sometimes|boolean',
                'user_management.max_users_per_organization' => 'sometimes|integer|min:1|max:1000',
                'user_management.user_session_timeout' => 'sometimes|integer|min:1|max:168',
                'user_management.require_strong_passwords' => 'sometimes|boolean',
                'user_management.password_min_length' => 'sometimes|integer|min:6|max:32',
                'user_management.enable_two_factor_auth' => 'sometimes|boolean',
                'user_management.allow_password_reset' => 'sometimes|boolean',

                'security' => 'sometimes|array',
                'security.enable_api_rate_limiting' => 'sometimes|boolean',
                'security.api_rate_limit_per_minute' => 'sometimes|integer|min:10|max:1000',
                'security.enable_ip_whitelisting' => 'sometimes|boolean',
                'security.allowed_ip_addresses' => 'sometimes|string',
                'security.enable_audit_logging' => 'sometimes|boolean',
                'security.log_retention_days' => 'sometimes|integer|min:7|max:365',
                'security.enable_data_encryption' => 'sometimes|boolean',
                'security.require_https' => 'sometimes|boolean',
                'security.enable_cors' => 'sometimes|boolean',
                'security.cors_origins' => 'sometimes|string',

                'notifications' => 'sometimes|array',
                'notifications.enable_email_notifications' => 'sometimes|boolean',
                'notifications.notify_on_new_organization' => 'sometimes|boolean',
                'notifications.notify_on_user_registration' => 'sometimes|boolean',
                'notifications.notify_on_suspicious_activity' => 'sometimes|boolean',
                'notifications.notify_on_system_maintenance' => 'sometimes|boolean',
                'notifications.email_from_address' => 'sometimes|email',
                'notifications.email_from_name' => 'sometimes|string',
                'notifications.enable_sms_notifications' => 'sometimes|boolean',
                'notifications.sms_provider' => 'sometimes|string|in:twilio,aws-sns,sendgrid',

                'data_management' => 'sometimes|array',
                'data_management.enable_data_backup' => 'sometimes|boolean',
                'data_management.backup_frequency' => 'sometimes|string|in:hourly,daily,weekly,monthly',
                'data_management.backup_retention_days' => 'sometimes|integer|min:1|max:365',
                'data_management.enable_data_export' => 'sometimes|boolean',
                'data_management.allow_bulk_operations' => 'sometimes|boolean',
                'data_management.enable_soft_delete' => 'sometimes|boolean',
                'data_management.data_retention_policy' => 'sometimes|string|in:standard,extended,minimal,custom',
                'data_management.enable_gdpr_compliance' => 'sometimes|boolean',
                'data_management.allow_data_anonymization' => 'sometimes|boolean',

                'integrations' => 'sometimes|array',
                'integrations.enable_webhooks' => 'sometimes|boolean',
                'integrations.webhook_timeout' => 'sometimes|integer|min:5|max:300',
                'integrations.enable_api_keys' => 'sometimes|boolean',
                'integrations.api_key_expiration_days' => 'sometimes|integer|min:1|max:3650',
                'integrations.enable_sso' => 'sometimes|boolean',
                'integrations.sso_provider' => 'sometimes|string|in:oauth2,saml,ldap,openid',
                'integrations.enable_third_party_integrations' => 'sometimes|boolean',
                'integrations.allowed_integrations' => 'sometimes|array',
                'integrations.allowed_integrations.*' => 'string|in:slack,microsoft-teams,discord,telegram,whatsapp,facebook,twitter,linkedin'
            ]);

            $updatedSettings = $this->settingsService->updateClientManagementSettings($validated);

            return $this->successResponse(
                'Client management settings updated successfully',
                $updatedSettings
            );
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->errorResponse(
                message: 'Validation failed',
                statusCode: 422,
                errors: $e->errors()
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithDebug(
                message: 'Failed to update client management settings',
                statusCode: 500,
                errors: $e->getMessage(),
                exception: $e
            );
        }
    }

    /**
     * Reset settings to defaults
     */
    public function resetToDefaults(Request $request): JsonResponse
    {
        try {
            $defaultSettings = $this->settingsService->resetClientManagementSettingsToDefaults();

            return $this->successResponse(
                'Settings reset to defaults successfully',
                $defaultSettings
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithDebug(
                message: 'Failed to reset settings to defaults',
                statusCode: 500,
                errors: $e->getMessage(),
                exception: $e
            );
        }
    }

    /**
     * Export settings configuration
     */
    public function exportSettings(Request $request): JsonResponse
    {
        try {
            $settings = $this->settingsService->getClientManagementSettings();
            $exportData = $this->settingsService->exportSettings($settings);

            return $this->successResponse(
                'Settings exported successfully',
                $exportData
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithDebug(
                message: 'Failed to export settings',
                statusCode: 500,
                errors: $e->getMessage(),
                exception: $e
            );
        }
    }

    /**
     * Import settings configuration
     */
    public function importSettings(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'settings_file' => 'required|file|mimes:json|max:1024'
            ]);

            $importedSettings = $this->settingsService->importSettings($validated['settings_file']);

            return $this->successResponse(
                'Settings imported successfully',
                $importedSettings
            );
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->errorResponse(
                message: 'Validation failed',
                statusCode: 422,
                errors: $e->errors()
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithDebug(
                message: 'Failed to import settings',
                statusCode: 500,
                errors: $e->getMessage(),
                exception: $e
            );
        }
    }
}
