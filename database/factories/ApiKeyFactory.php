<?php

namespace Database\Factories;

use App\Models\Organization;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ApiKeyFactory extends Factory
{
    public function definition(): array
    {
        $keyTypes = ['read', 'write', 'admin', 'webhook', 'integration', 'analytics'];
        $keyType = $this->faker->randomElement($keyTypes);
        
        $permissions = $this->generatePermissions($keyType);
        $scopes = $this->generateScopes($keyType);
        
        $prefix = match($keyType) {
            'read' => 'rk',
            'write' => 'wk',
            'admin' => 'ak',
            'webhook' => 'whk',
            'integration' => 'ik',
            'analytics' => 'ank',
            default => 'apk'
        };
        
        $apiKey = $prefix . '_' . Str::random(32);
        $apiSecret = 'sk_' . Str::random(48);
        
        $rateLimits = $this->generateRateLimits($keyType);
        $usageStats = $this->generateUsageStats($keyType);
        
        return [
            'organization_id' => Organization::factory(),
            'user_id' => User::factory(),
            'name' => $this->generateKeyName($keyType),
            'description' => $this->generateKeyDescription($keyType),
            'key_type' => $keyType,
            'api_key' => $apiKey,
            'api_secret' => $apiSecret,
            'api_key_hash' => hash('sha256', $apiKey),
            'api_secret_hash' => hash('sha256', $apiSecret),
            
            'permissions' => $permissions,
            'scopes' => $scopes,
            'allowed_endpoints' => $this->generateAllowedEndpoints($keyType),
            'restricted_endpoints' => $this->generateRestrictedEndpoints($keyType),
            
            'rate_limit_per_minute' => $rateLimits['per_minute'],
            'rate_limit_per_hour' => $rateLimits['per_hour'],
            'rate_limit_per_day' => $rateLimits['per_day'],
            'rate_limit_burst' => $rateLimits['burst'],
            
            'total_requests' => $usageStats['total_requests'],
            'successful_requests' => $usageStats['successful_requests'],
            'failed_requests' => $usageStats['failed_requests'],
            'last_used_at' => $usageStats['last_used_at'],
            'first_used_at' => $usageStats['first_used_at'],
            'request_count_today' => $usageStats['request_count_today'],
            'request_count_this_month' => $usageStats['request_count_this_month'],
            
            'is_active' => $this->faker->boolean(90),
            'is_restricted' => $this->faker->boolean(20),
            'requires_2fa' => $this->faker->boolean(30),
            'ip_whitelist' => $this->generateIpRestrictions($keyType)['whitelist'],
            'ip_blacklist' => $this->generateIpRestrictions($keyType)['blacklist'],
            
            'webhook_url' => $keyType === 'webhook' ? $this->faker->url() : null,
            'webhook_secret' => $keyType === 'webhook' ? 'wh_' . Str::random(32) : null,
            'webhook_events' => $keyType === 'webhook' ? $this->faker->randomElements([
                'user.created', 'user.updated', 'chat.session.started',
                'chat.session.ended', 'message.sent', 'message.received'
            ], $this->faker->numberBetween(3, 7)) : [],
            
            'expires_at' => $this->faker->optional(0.3)->dateTimeBetween('+1 month', '+1 year'),
            'last_rotated_at' => $this->faker->optional(0.4)->dateTimeBetween('-6 months', 'now'),
            'rotation_interval_days' => $this->faker->optional(0.6)->randomElement([30, 60, 90, 180, 365]),
            'auto_rotate' => $this->faker->boolean(40),
            
            'monitoring_enabled' => $this->faker->boolean(80),
            'alert_threshold' => $this->faker->randomElement([100, 500, 1000, 5000, 10000]),
            'alert_email' => $this->faker->optional(0.7)->email(),
            'alert_webhook' => $this->faker->optional(0.5)->url(),
            
            'metadata' => [
                'created_by' => 'system',
                'last_updated' => now()->toISOString(),
                'key_purpose' => $this->determineKeyPurpose($keyType),
                'security_level' => $this->determineSecurityLevel($keyType),
                'compliance_requirements' => $this->generateComplianceRequirements($keyType),
                'audit_logging' => $this->faker->boolean(90),
                'key_rotation_policy' => $this->generateRotationPolicy($keyType),
                'tags' => $this->generateKeyTags($keyType)
            ],
            
            'status' => 'active',
        ];
    }
    
    private function generateKeyName(string $keyType): string
    {
        $names = [
            'read' => ['Read-Only API Key', 'Analytics Access Key', 'Reporting API Key'],
            'write' => ['Write Access API Key', 'Data Modification Key', 'Content Management Key'],
            'admin' => ['Administrator API Key', 'Full Access Key', 'System Management Key'],
            'webhook' => ['Webhook Integration Key', 'Event Notification Key', 'Callback API Key'],
            'integration' => ['Third-Party Integration Key', 'External Service Key', 'Partner API Key'],
            'analytics' => ['Analytics API Key', 'Metrics Collection Key', 'Data Analytics Key']
        ];
        
        return $this->faker->randomElement($names[$keyType] ?? ['API Key']);
    }
    
    private function generateKeyDescription(string $keyType): string
    {
        $descriptions = [
            'read' => 'API key for read-only access to data and analytics.',
            'write' => 'API key for write operations including data creation and updates.',
            'admin' => 'Full administrative access to all system functions.',
            'webhook' => 'API key specifically for webhook integrations.',
            'integration' => 'API key for third-party service integrations.',
            'analytics' => 'API key for analytics data access and reporting.'
        ];
        
        return $descriptions[$keyType] ?? 'API key for accessing the system.';
    }
    
    private function generatePermissions(string $keyType): array
    {
        $permissionSets = [
            'read' => ['read:users', 'read:organizations', 'read:analytics', 'read:reports'],
            'write' => ['read:users', 'read:organizations', 'write:users', 'write:customers'],
            'admin' => ['read:*', 'write:*', 'delete:*', 'admin:users', 'admin:system'],
            'webhook' => ['read:webhooks', 'write:webhooks', 'read:events', 'write:events'],
            'integration' => ['read:integrations', 'write:integrations', 'read:api_logs'],
            'analytics' => ['read:analytics', 'read:reports', 'read:metrics', 'read:dashboards']
        ];
        
        return $permissionSets[$keyType] ?? ['read:basic'];
    }
    
    private function generateScopes(string $keyType): array
    {
        $scopeSets = [
            'read' => ['public', 'user_data', 'analytics', 'reports'],
            'write' => ['public', 'user_data', 'content', 'interactions'],
            'admin' => ['public', 'user_data', 'system', 'security', 'admin'],
            'webhook' => ['webhooks', 'events', 'notifications'],
            'integration' => ['integrations', 'api', 'webhooks'],
            'analytics' => ['analytics', 'reports', 'metrics', 'insights']
        ];
        
        return $scopeSets[$keyType] ?? ['public'];
    }
    
    private function generateAllowedEndpoints(string $keyType): array
    {
        $endpointSets = [
            'read' => ['/api/v1/users', '/api/v1/organizations', '/api/v1/analytics'],
            'write' => ['/api/v1/users', '/api/v1/customers', '/api/v1/chat-sessions'],
            'admin' => ['/api/v1/*', '/api/v1/admin/*', '/api/v1/system/*'],
            'webhook' => ['/api/v1/webhooks', '/api/v1/events', '/api/v1/notifications'],
            'integration' => ['/api/v1/integrations', '/api/v1/webhooks', '/api/v1/api-logs'],
            'analytics' => ['/api/v1/analytics', '/api/v1/reports', '/api/v1/metrics']
        ];
        
        return $endpointSets[$keyType] ?? ['/api/v1/public'];
    }
    
    private function generateRestrictedEndpoints(string $keyType): array
    {
        $restrictedSets = [
            'read' => ['/api/v1/admin/*', '/api/v1/system/*', '/api/v1/security/*'],
            'write' => ['/api/v1/admin/*', '/api/v1/system/*', '/api/v1/security/*'],
            'admin' => [],
            'webhook' => ['/api/v1/admin/*', '/api/v1/system/*', '/api/v1/users/*'],
            'integration' => ['/api/v1/admin/*', '/api/v1/system/*', '/api/v1/security/*'],
            'analytics' => ['/api/v1/admin/*', '/api/v1/system/*', '/api/v1/security/*']
        ];
        
        return $restrictedSets[$keyType] ?? [];
    }
    
    private function generateRateLimits(string $keyType): array
    {
        $rateLimitSets = [
            'read' => ['per_minute' => 200, 'per_hour' => 10000, 'per_day' => 200000, 'burst' => 100],
            'write' => ['per_minute' => 100, 'per_hour' => 5000, 'per_day' => 100000, 'burst' => 50],
            'admin' => ['per_minute' => 500, 'per_hour' => 25000, 'per_day' => 500000, 'burst' => 250],
            'webhook' => ['per_minute' => 75, 'per_hour' => 3000, 'per_day' => 50000, 'burst' => 25],
            'integration' => ['per_minute' => 150, 'per_hour' => 7500, 'per_day' => 150000, 'burst' => 75],
            'analytics' => ['per_minute' => 125, 'per_hour' => 6000, 'per_day' => 125000, 'burst' => 60]
        ];
        
        return $rateLimitSets[$keyType] ?? ['per_minute' => 100, 'per_hour' => 5000, 'per_day' => 100000, 'burst' => 50];
    }
    
    private function generateUsageStats(string $keyType): array
    {
        $totalRequests = $this->faker->numberBetween(100, 100000);
        $successRate = $this->faker->randomFloat(2, 85, 99.5);
        $successfulRequests = round($totalRequests * ($successRate / 100));
        $failedRequests = $totalRequests - $successfulRequests;
        
        $lastUsedAt = $this->faker->optional(0.8)->dateTimeBetween('-30 days', 'now');
        $firstUsedAt = $lastUsedAt ? $this->faker->dateTimeBetween('-1 year', $lastUsedAt) : null;
        
        return [
            'total_requests' => $totalRequests,
            'successful_requests' => $successfulRequests,
            'failed_requests' => $failedRequests,
            'last_used_at' => $lastUsedAt,
            'first_used_at' => $firstUsedAt,
            'request_count_today' => $this->faker->numberBetween(0, 1000),
            'request_count_this_month' => $this->faker->numberBetween(0, 10000)
        ];
    }
    
    private function generateIpRestrictions(string $keyType): array
    {
        $hasRestrictions = $this->faker->boolean(40);
        
        if (!$hasRestrictions) {
            return ['whitelist' => [], 'blacklist' => []];
        }
        
        $whitelist = $this->faker->optional(0.6)->randomElements([
            '192.168.1.0/24', '10.0.0.0/8', '172.16.0.0/12'
        ], $this->faker->numberBetween(1, 3));
        
        $blacklist = $this->faker->optional(0.3)->randomElements([
            '192.168.2.0/24', '10.1.0.0/16'
        ], $this->faker->numberBetween(1, 2));
        
        return [
            'whitelist' => $whitelist ?? [],
            'blacklist' => $blacklist ?? []
        ];
    }
    
    private function determineKeyPurpose(string $keyType): string
    {
        $purposes = [
            'read' => 'Data retrieval and analytics access',
            'write' => 'Content creation and data modification',
            'admin' => 'System administration and full access',
            'webhook' => 'Webhook delivery and event processing',
            'integration' => 'Third-party service integration',
            'analytics' => 'Analytics data access and reporting'
        ];
        
        return $purposes[$keyType] ?? 'General API access';
    }
    
    private function determineSecurityLevel(string $keyType): string
    {
        return match($keyType) {
            'admin' => 'high',
            'write', 'webhook', 'integration' => 'medium',
            'read', 'analytics' => 'low',
            default => 'medium'
        };
    }
    
    private function generateComplianceRequirements(string $keyType): array
    {
        $complianceStandards = ['gdpr', 'ccpa', 'sox', 'hipaa', 'iso27001'];
        $relevantStandards = $this->faker->randomElements($complianceStandards, $this->faker->numberBetween(0, 3));
        
        return [
            'standards' => $relevantStandards,
            'data_retention_days' => $this->faker->randomElement([30, 90, 180, 365, 730]),
            'audit_logging_required' => $this->faker->boolean(80),
            'encryption_required' => $this->faker->boolean(90),
            'access_logging_required' => $this->faker->boolean(85)
        ];
    }
    
    private function generateRotationPolicy(string $keyType): array
    {
        $rotationIntervals = [
            'admin' => [30, 60, 90],
            'write' => [60, 90, 180],
            'webhook' => [90, 180, 365],
            'integration' => [90, 180, 365],
            'read' => [180, 365],
            'analytics' => [180, 365]
        ];
        
        $interval = $this->faker->randomElement($rotationIntervals[$keyType] ?? [365]);
        
        return [
            'auto_rotation_enabled' => $this->faker->boolean(60),
            'rotation_interval_days' => $interval,
            'rotation_notification_days' => [7, 3, 1],
            'rotation_history_retention' => $this->faker->randomElement([90, 180, 365]),
            'rotation_requires_approval' => $keyType === 'admin'
        ];
    }
    
    private function generateKeyTags(string $keyType): array
    {
        $baseTags = ['api', 'key', 'access'];
        $typeTags = [
            'read' => ['read-only', 'analytics', 'data-access'],
            'write' => ['write-access', 'modification', 'content'],
            'admin' => ['admin', 'full-access', 'system'],
            'webhook' => ['webhook', 'events', 'notifications'],
            'integration' => ['integration', 'third-party', 'external'],
            'analytics' => ['analytics', 'reports', 'metrics']
        ];
        
        $allTags = array_merge($baseTags, $typeTags[$keyType] ?? []);
        
        if ($this->faker->boolean(30)) {
            $allTags[] = 'production';
        }
        
        if ($this->faker->boolean(20)) {
            $allTags[] = 'testing';
        }
        
        return array_unique($allTags);
    }
    
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
            'status' => 'active',
        ]);
    }
    
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
            'status' => 'inactive',
        ]);
    }
    
    public function restricted(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_restricted' => true,
        ]);
    }
    
    public function requires2fa(): static
    {
        return $this->state(fn (array $attributes) => [
            'requires_2fa' => true,
        ]);
    }
    
    public function readOnly(): static
    {
        return $this->state(fn (array $attributes) => [
            'key_type' => 'read',
            'permissions' => $this->generatePermissions('read'),
            'scopes' => $this->generateScopes('read'),
        ]);
    }
    
    public function writeAccess(): static
    {
        return $this->state(fn (array $attributes) => [
            'key_type' => 'write',
            'permissions' => $this->generatePermissions('write'),
            'scopes' => $this->generateScopes('write'),
        ]);
    }
    
    public function adminAccess(): static
    {
        return $this->state(fn (array $attributes) => [
            'key_type' => 'admin',
            'permissions' => $this->generatePermissions('admin'),
            'scopes' => $this->generateScopes('admin'),
        ]);
    }
    
    public function webhookAccess(): static
    {
        return $this->state(fn (array $attributes) => [
            'key_type' => 'webhook',
            'permissions' => $this->generatePermissions('webhook'),
            'scopes' => $this->generateScopes('webhook'),
            'webhook_url' => $this->faker->url(),
            'webhook_secret' => 'wh_' . Str::random(32),
        ]);
    }
    
    public function expired(): static
    {
        return $this->state(fn (array $attributes) => [
            'expires_at' => $this->faker->dateTimeBetween('-1 month', '-1 day'),
            'is_active' => false,
            'status' => 'expired',
        ]);
    }
    
    public function highUsage(): static
    {
        return $this->state(fn (array $attributes) => [
            'total_requests' => $this->faker->numberBetween(100000, 1000000),
            'request_count_today' => $this->faker->numberBetween(1000, 10000),
            'request_count_this_month' => $this->faker->numberBetween(10000, 100000),
        ]);
    }
    
    public function production(): static
    {
        return $this->state(fn (array $attributes) => [
            'metadata' => array_merge($attributes['metadata'] ?? [], [
                'tags' => array_merge($attributes['metadata']['tags'] ?? [], ['production'])
            ]),
        ]);
    }
    
    public function testing(): static
    {
        return $this->state(fn (array $attributes) => [
            'metadata' => array_merge($attributes['metadata'] ?? [], [
                'tags' => array_merge($attributes['metadata']['tags'] ?? [], ['testing'])
            ]),
        ]);
    }
}
