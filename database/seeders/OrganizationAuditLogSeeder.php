<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\OrganizationAuditLog;
use App\Models\Organization;
use App\Models\User;

class OrganizationAuditLogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get sample organizations and users
        $organizations = Organization::take(5)->get();
        $users = User::take(10)->get();

        if ($organizations->isEmpty() || $users->isEmpty()) {
            $this->command->warn('No organizations or users found. Please run organization and user seeders first.');
            return;
        }

        $actions = [
            'created', 'updated', 'deleted', 'restored',
            'status_changed', 'permissions_updated', 'settings_updated',
            'user_added', 'user_removed', 'role_assigned', 'role_removed'
        ];

        $resourceTypes = [
            'organization', 'user', 'organization_settings', 'organization_permissions',
            'user_role', 'organization_role', 'organization_analytics'
        ];

        $auditLogs = [];

        // Generate audit logs for the last 30 days
        for ($i = 0; $i < 200; $i++) {
            $organization = $organizations->random();
            $user = $users->random();
            $action = $actions[array_rand($actions)];
            $resourceType = $resourceTypes[array_rand($resourceTypes)];
            $createdAt = now()->subDays(rand(0, 30))->subHours(rand(0, 23))->subMinutes(rand(0, 59));

            $oldValues = null;
            $newValues = null;

            // Generate realistic old and new values based on action
            if (in_array($action, ['updated', 'settings_updated', 'permissions_updated'])) {
                $oldValues = $this->generateOldValues($resourceType);
                $newValues = $this->generateNewValues($resourceType, $oldValues);
            } elseif (in_array($action, ['created', 'user_added', 'role_assigned'])) {
                $newValues = $this->generateNewValues($resourceType);
            } elseif (in_array($action, ['deleted', 'user_removed', 'role_removed'])) {
                $oldValues = $this->generateOldValues($resourceType);
            }

            $auditLogs[] = [
                'organization_id' => $organization->id,
                'user_id' => $user->id,
                'action' => $action,
                'resource_type' => $resourceType,
                'resource_id' => rand(1, 100),
                'old_values' => $oldValues ? json_encode($oldValues) : null,
                'new_values' => $newValues ? json_encode($newValues) : null,
                'ip_address' => $this->generateRandomIP(),
                'user_agent' => $this->generateRandomUserAgent(),
                'metadata' => json_encode([
                    'browser' => $this->getRandomBrowser(),
                    'os' => $this->getRandomOS(),
                    'device' => $this->getRandomDevice(),
                    'location' => $this->getRandomLocation()
                ]),
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ];
        }

        // Insert audit logs in batches
        $chunks = array_chunk($auditLogs, 50);
        foreach ($chunks as $chunk) {
            OrganizationAuditLog::insert($chunk);
        }

        $this->command->info('Organization audit logs seeded successfully!');
    }

    /**
     * Generate old values for audit log
     */
    private function generateOldValues(string $resourceType): array
    {
        switch ($resourceType) {
            case 'organization':
                return [
                    'name' => 'Old Organization Name',
                    'email' => 'old@example.com',
                    'status' => 'inactive',
                    'updated_at' => now()->subHours(2)->toISOString()
                ];
            case 'organization_settings':
                return [
                    'general' => [
                        'name' => 'Old Name',
                        'email' => 'old@example.com'
                    ],
                    'api' => [
                        'rateLimit' => 1000,
                        'enableApiAccess' => false
                    ]
                ];
            case 'user':
                return [
                    'name' => 'Old User Name',
                    'email' => 'olduser@example.com',
                    'status' => 'inactive'
                ];
            default:
                return [
                    'old_value' => 'Previous value',
                    'updated_at' => now()->subHours(1)->toISOString()
                ];
        }
    }

    /**
     * Generate new values for audit log
     */
    private function generateNewValues(string $resourceType, ?array $oldValues = null): array
    {
        switch ($resourceType) {
            case 'organization':
                return [
                    'name' => 'Updated Organization Name',
                    'email' => 'updated@example.com',
                    'status' => 'active',
                    'updated_at' => now()->toISOString()
                ];
            case 'organization_settings':
                return [
                    'general' => [
                        'name' => 'Updated Name',
                        'email' => 'updated@example.com'
                    ],
                    'api' => [
                        'rateLimit' => 2000,
                        'enableApiAccess' => true
                    ]
                ];
            case 'user':
                return [
                    'name' => 'New User Name',
                    'email' => 'newuser@example.com',
                    'status' => 'active'
                ];
            default:
                return [
                    'new_value' => 'Updated value',
                    'updated_at' => now()->toISOString()
                ];
        }
    }

    /**
     * Generate random IP address
     */
    private function generateRandomIP(): string
    {
        return rand(1, 255) . '.' . rand(1, 255) . '.' . rand(1, 255) . '.' . rand(1, 255);
    }

    /**
     * Generate random user agent
     */
    private function generateRandomUserAgent(): string
    {
        $browsers = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15'
        ];

        return $browsers[array_rand($browsers)];
    }

    /**
     * Get random browser
     */
    private function getRandomBrowser(): string
    {
        $browsers = ['Chrome', 'Firefox', 'Safari', 'Edge', 'Opera'];
        return $browsers[array_rand($browsers)];
    }

    /**
     * Get random OS
     */
    private function getRandomOS(): string
    {
        $os = ['Windows', 'macOS', 'Linux', 'iOS', 'Android'];
        return $os[array_rand($os)];
    }

    /**
     * Get random device
     */
    private function getRandomDevice(): string
    {
        $devices = ['Desktop', 'Mobile', 'Tablet', 'Laptop'];
        return $devices[array_rand($devices)];
    }

    /**
     * Get random location
     */
    private function getRandomLocation(): string
    {
        $locations = ['New York', 'London', 'Tokyo', 'Singapore', 'Sydney', 'Berlin', 'Paris', 'Toronto'];
        return $locations[array_rand($locations)];
    }
}
