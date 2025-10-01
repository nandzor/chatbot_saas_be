<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class AgentPreferencesService extends BaseService
{
    /**
     * Get the model for the service.
     */
    protected function getModel(): \Illuminate\Database\Eloquent\Model
    {
        return new User();
    }

    /**
     * Get notification preferences for current agent
     */
    public function getNotificationPreferences(): array
    {
        try {
            $user = Auth::user();

            // Try to get from cache first
            $cacheKey = "agent_notification_preferences_{$user->id}";
            $preferences = Cache::get($cacheKey);

            if (!$preferences) {
                // Return default notification preferences
                $preferences = [
                    'new_message' => ['desktop' => true, 'sound' => true, 'email' => false, 'mobile' => true],
                    'session_assigned' => ['desktop' => true, 'sound' => true, 'email' => true, 'mobile' => true],
                    'urgent_message' => ['desktop' => true, 'sound' => true, 'email' => true, 'mobile' => true],
                    'team_mention' => ['desktop' => true, 'sound' => false, 'email' => false, 'mobile' => true],
                    'system_alert' => ['desktop' => true, 'sound' => false, 'email' => true, 'mobile' => false],
                    'sound_volume' => 75,
                    'quiet_hours' => ['enabled' => true, 'start' => '22:00', 'end' => '07:00'],
                    'email_digest' => ['enabled' => true, 'frequency' => 'daily', 'time' => '18:00']
                ];

                // Cache for 1 hour
                Cache::put($cacheKey, $preferences, 3600);
            }

            return $preferences;
        } catch (\Exception $e) {
            Log::error('Error in getNotificationPreferences: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Update notification preferences for current agent
     */
    public function updateNotificationPreferences(array $preferences): array
    {
        try {
            $user = Auth::user();

            // Validate preferences structure
            $this->validateNotificationPreferences($preferences);

            // Store in cache (in real implementation, this would be stored in database)
            $cacheKey = "agent_notification_preferences_{$user->id}";
            Cache::put($cacheKey, $preferences, 3600);

            // Log the update
            Log::info("Notification preferences updated for user {$user->id}");

            return $preferences;
        } catch (\Exception $e) {
            Log::error('Error in updateNotificationPreferences: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get UI preferences for current agent
     */
    public function getUIPreferences(): array
    {
        try {
            $user = Auth::user();

            // Try to get from cache first
            $cacheKey = "agent_ui_preferences_{$user->id}";
            $preferences = Cache::get($cacheKey);

            if (!$preferences) {
                // Return default UI preferences
                $preferences = [
                    'theme' => 'light',
                    'language' => 'id',
                    'font_size' => 'medium',
                    'density' => 'comfortable',
                    'show_avatars' => true,
                    'show_timestamps' => true,
                    'auto_refresh' => true,
                    'refresh_interval' => 30,
                    'chat_layout' => 'bubbles',
                    'sidebar_collapsed' => false
                ];

                // Cache for 1 hour
                Cache::put($cacheKey, $preferences, 3600);
            }

            return $preferences;
        } catch (\Exception $e) {
            Log::error('Error in getUIPreferences: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Update UI preferences for current agent
     */
    public function updateUIPreferences(array $preferences): array
    {
        try {
            $user = Auth::user();

            // Validate preferences structure
            $this->validateUIPreferences($preferences);

            // Store in cache (in real implementation, this would be stored in database)
            $cacheKey = "agent_ui_preferences_{$user->id}";
            Cache::put($cacheKey, $preferences, 3600);

            // Log the update
            Log::info("UI preferences updated for user {$user->id}");

            return $preferences;
        } catch (\Exception $e) {
            Log::error('Error in updateUIPreferences: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Validate notification preferences structure
     */
    private function validateNotificationPreferences(array $preferences): void
    {
        $requiredKeys = [
            'new_message', 'session_assigned', 'urgent_message',
            'team_mention', 'system_alert', 'sound_volume',
            'quiet_hours', 'email_digest'
        ];

        foreach ($requiredKeys as $key) {
            if (!array_key_exists($key, $preferences)) {
                throw new \Exception("Missing required preference key: {$key}");
            }
        }

        // Validate sound volume
        if (!is_numeric($preferences['sound_volume']) || $preferences['sound_volume'] < 0 || $preferences['sound_volume'] > 100) {
            throw new \Exception('Sound volume must be a number between 0 and 100');
        }

        // Validate quiet hours
        if (!isset($preferences['quiet_hours']['enabled']) || !is_bool($preferences['quiet_hours']['enabled'])) {
            throw new \Exception('Quiet hours enabled must be a boolean');
        }

        // Validate email digest
        if (!isset($preferences['email_digest']['enabled']) || !is_bool($preferences['email_digest']['enabled'])) {
            throw new \Exception('Email digest enabled must be a boolean');
        }
    }

    /**
     * Validate UI preferences structure
     */
    private function validateUIPreferences(array $preferences): void
    {
        $requiredKeys = [
            'theme', 'language', 'font_size', 'density',
            'show_avatars', 'show_timestamps', 'auto_refresh',
            'refresh_interval', 'chat_layout', 'sidebar_collapsed'
        ];

        foreach ($requiredKeys as $key) {
            if (!array_key_exists($key, $preferences)) {
                throw new \Exception("Missing required preference key: {$key}");
            }
        }

        // Validate theme
        if (!in_array($preferences['theme'], ['light', 'dark', 'auto'])) {
            throw new \Exception('Theme must be light, dark, or auto');
        }

        // Validate language
        if (!in_array($preferences['language'], ['id', 'en'])) {
            throw new \Exception('Language must be id or en');
        }

        // Validate font size
        if (!in_array($preferences['font_size'], ['small', 'medium', 'large'])) {
            throw new \Exception('Font size must be small, medium, or large');
        }

        // Validate density
        if (!in_array($preferences['density'], ['compact', 'comfortable', 'spacious'])) {
            throw new \Exception('Density must be compact, comfortable, or spacious');
        }

        // Validate refresh interval
        if (!is_numeric($preferences['refresh_interval']) || $preferences['refresh_interval'] < 10 || $preferences['refresh_interval'] > 300) {
            throw new \Exception('Refresh interval must be a number between 10 and 300 seconds');
        }

        // Validate chat layout
        if (!in_array($preferences['chat_layout'], ['bubbles', 'compact', 'threaded'])) {
            throw new \Exception('Chat layout must be bubbles, compact, or threaded');
        }
    }
}
