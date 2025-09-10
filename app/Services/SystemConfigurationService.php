<?php

namespace App\Services;

use App\Models\SystemConfiguration;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class SystemConfigurationService
{
    protected string $cachePrefix = 'system_config_';
    protected int $cacheTtl = 60; // minutes

    /**
     * Get configuration value by key
     */
    public function get(string $key, $default = null)
    {
        try {
            return SystemConfiguration::get($key, $default);
        } catch (\Exception $e) {
            Log::error('Failed to get system configuration', [
                'key' => $key,
                'error' => $e->getMessage(),
            ]);
            return $default;
        }
    }

    /**
     * Set configuration value
     */
    public function set(string $key, $value, string $type = 'string', array $options = []): bool
    {
        try {
            $config = SystemConfiguration::where('key', $key)->first();

            $data = array_merge([
                'key' => $key,
                'value' => $this->prepareValue($value, $type),
                'type' => $type,
            ], $options);

            if ($config) {
                $config->update($data);
            } else {
                $data['category'] = $data['category'] ?? 'custom';
                $data['is_public'] = $data['is_public'] ?? false;
                $data['is_editable'] = $data['is_editable'] ?? true;

                SystemConfiguration::create($data);
            }

            // Clear cache
            $this->clearCache($key);

            Log::info('System configuration updated', [
                'key' => $key,
                'type' => $type,
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('Failed to set system configuration', [
                'key' => $key,
                'value' => $value,
                'type' => $type,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Get all configurations by category
     */
    public function getByCategory(string $category): array
    {
        try {
            return SystemConfiguration::getByCategory($category);
        } catch (\Exception $e) {
            Log::error('Failed to get system configurations by category', [
                'category' => $category,
                'error' => $e->getMessage(),
            ]);
            return [];
        }
    }

    /**
     * Get all public configurations
     */
    public function getPublicConfigs(): array
    {
        try {
            return SystemConfiguration::getPublicConfigs();
        } catch (\Exception $e) {
            Log::error('Failed to get public system configurations', [
                'error' => $e->getMessage(),
            ]);
            return [];
        }
    }

    /**
     * Get payment gateway configurations
     */
    public function getPaymentGatewayConfigs(): array
    {
        return $this->getByCategory('payment_gateways');
    }

    /**
     * Get billing configurations
     */
    public function getBillingConfigs(): array
    {
        return $this->getByCategory('billing');
    }

    /**
     * Get email configurations
     */
    public function getEmailConfigs(): array
    {
        return $this->getByCategory('email');
    }

    /**
     * Get system configurations
     */
    public function getSystemConfigs(): array
    {
        return $this->getByCategory('system');
    }

    /**
     * Get queue configurations
     */
    public function getQueueConfigs(): array
    {
        return $this->getByCategory('queue');
    }

    /**
     * Get cache configurations
     */
    public function getCacheConfigs(): array
    {
        return $this->getByCategory('cache');
    }

    /**
     * Get security configurations
     */
    public function getSecurityConfigs(): array
    {
        return $this->getByCategory('security');
    }

    /**
     * Get AI/ML configurations
     */
    public function getAiConfigs(): array
    {
        return $this->getByCategory('ai');
    }

    /**
     * Get monitoring configurations
     */
    public function getMonitoringConfigs(): array
    {
        return $this->getByCategory('monitoring');
    }

    /**
     * Check if a configuration exists
     */
    public function exists(string $key): bool
    {
        return SystemConfiguration::where('key', $key)->exists();
    }

    /**
     * Delete a configuration
     */
    public function delete(string $key): bool
    {
        try {
            $config = SystemConfiguration::where('key', $key)->first();

            if ($config) {
                $config->delete();
                $this->clearCache($key);

                Log::info('System configuration deleted', [
                    'key' => $key,
                ]);

                return true;
            }

            return false;
        } catch (\Exception $e) {
            Log::error('Failed to delete system configuration', [
                'key' => $key,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Bulk update configurations
     */
    public function bulkUpdate(array $configurations): array
    {
        $results = [];

        foreach ($configurations as $key => $data) {
            if (is_array($data) && isset($data['value'])) {
                $type = $data['type'] ?? 'string';
                $options = array_diff_key($data, ['value' => null, 'type' => null]);

                $results[$key] = $this->set($key, $data['value'], $type, $options);
            } else {
                $results[$key] = $this->set($key, $data);
            }
        }

        return $results;
    }

    /**
     * Get configuration with validation
     */
    public function getValidated(string $key, $default = null, array $validationRules = [])
    {
        $value = $this->get($key, $default);

        if (!empty($validationRules)) {
            $validator = validator(['value' => $value], ['value' => $validationRules]);

            if ($validator->fails()) {
                Log::warning('System configuration validation failed', [
                    'key' => $key,
                    'value' => $value,
                    'errors' => $validator->errors()->toArray(),
                ]);

                return $default;
            }
        }

        return $value;
    }

    /**
     * Get configuration as boolean
     */
    public function getBoolean(string $key, bool $default = false): bool
    {
        $value = $this->get($key, $default);
        return filter_var($value, FILTER_VALIDATE_BOOLEAN);
    }

    /**
     * Get configuration as integer
     */
    public function getInteger(string $key, int $default = 0): int
    {
        $value = $this->get($key, $default);
        return (int) $value;
    }

    /**
     * Get configuration as float
     */
    public function getFloat(string $key, float $default = 0.0): float
    {
        $value = $this->get($key, $default);
        return (float) $value;
    }

    /**
     * Get configuration as array
     */
    public function getArray(string $key, array $default = []): array
    {
        $value = $this->get($key, $default);

        if (is_string($value)) {
            $decoded = json_decode($value, true);
            return $decoded !== null ? $decoded : $default;
        }

        return is_array($value) ? $value : $default;
    }

    /**
     * Clear cache for specific key or all
     */
    public function clearCache(?string $key = null): void
    {
        try {
            SystemConfiguration::clearCache($key);
        } catch (\Exception $e) {
            Log::error('Failed to clear system configuration cache', [
                'key' => $key,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Warm up cache for all configurations
     */
    public function warmUpCache(): void
    {
        try {
            $categories = SystemConfiguration::distinct()->pluck('category');

            foreach ($categories as $category) {
                $this->getByCategory($category);
            }

            $this->getPublicConfigs();

            Log::info('System configuration cache warmed up');
        } catch (\Exception $e) {
            Log::error('Failed to warm up system configuration cache', [
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Export configurations
     */
    public function export(array $categories = []): array
    {
        try {
            $query = SystemConfiguration::query();

            if (!empty($categories)) {
                $query->whereIn('category', $categories);
            }

            $configurations = $query->get();

            $export = [];
            foreach ($configurations as $config) {
                $export[$config->category][$config->key] = [
                    'value' => $config->value,
                    'type' => $config->type,
                    'description' => $config->description,
                    'is_public' => $config->is_public,
                    'is_editable' => $config->is_editable,
                ];
            }

            return $export;
        } catch (\Exception $e) {
            Log::error('Failed to export system configurations', [
                'categories' => $categories,
                'error' => $e->getMessage(),
            ]);
            return [];
        }
    }

    /**
     * Import configurations
     */
    public function import(array $configurations): array
    {
        $results = [];

        try {
            foreach ($configurations as $category => $configs) {
                foreach ($configs as $key => $data) {
                    $value = $data['value'] ?? null;
                    $type = $data['type'] ?? 'string';
                    $options = array_diff_key($data, ['value' => null, 'type' => null]);
                    $options['category'] = $category;

                    $results[$key] = $this->set($key, $value, $type, $options);
                }
            }

            Log::info('System configurations imported', [
                'count' => count($results),
            ]);

            return $results;
        } catch (\Exception $e) {
            Log::error('Failed to import system configurations', [
                'error' => $e->getMessage(),
            ]);
            return [];
        }
    }

    /**
     * Prepare value for storage
     */
    protected function prepareValue($value, string $type): string
    {
        return match ($type) {
            'boolean' => $value ? 'true' : 'false',
            'json', 'array' => is_string($value) ? $value : json_encode($value),
            default => (string) $value,
        };
    }
}
