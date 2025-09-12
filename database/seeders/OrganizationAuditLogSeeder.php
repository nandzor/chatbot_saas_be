<?php

namespace Database\Seeders;

use App\Models\Organization;
use App\Models\OrganizationAuditLog;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class OrganizationAuditLogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all organizations
        $organizations = Organization::all();

        if ($organizations->isEmpty()) {
            $this->command->warn('No organizations found. Please run OrganizationSeeder first.');
            return;
        }

        foreach ($organizations as $organization) {
            $this->createAuditLogsForOrganization($organization);
        }

        $this->command->info('Organization audit logs seeded successfully.');
    }

    /**
     * Create audit logs for a specific organization
     */
    private function createAuditLogsForOrganization(Organization $organization): void
    {
        // Get users for this organization
        $users = User::where('organization_id', $organization->id)->get();

        if ($users->isEmpty()) {
            $this->command->warn("No users found for organization: {$organization->name}");
            return;
        }

        // Generate audit logs for the last 30 days
        $startDate = Carbon::now()->subDays(30);
        $endDate = Carbon::now();

        $auditLogs = [];

        // Define possible actions and their frequencies
        $actions = [
            'create' => 20,
            'update' => 35,
            'delete' => 5,
            'login' => 25,
            'logout' => 25,
            'view' => 40,
            'export' => 8,
            'import' => 3,
            'download' => 12,
            'api_call' => 15
        ];

        // Define resource types
        $resourceTypes = [
            'users', 'roles', 'permissions', 'content', 'chats',
            'analytics', 'settings', 'billing', 'api_keys', 'webhooks'
        ];

        // Generate random audit logs
        $totalLogs = rand(500, 1500); // Random number of logs per organization

        for ($i = 0; $i < $totalLogs; $i++) {
            $randomDate = Carbon::createFromTimestamp(
                rand($startDate->timestamp, $endDate->timestamp)
            );

            $action = $this->getRandomWeightedAction($actions);
            $resourceType = $resourceTypes[array_rand($resourceTypes)];
            $user = $users->random();

            $auditLogs[] = [
                'organization_id' => $organization->id,
                'user_id' => $user->id,
                'action' => $action,
                'resource_type' => $resourceType,
                'resource_id' => rand(1, 1000),
                'old_values' => $this->generateOldValues($action, $resourceType),
                'new_values' => $this->generateNewValues($action, $resourceType),
                'ip_address' => $this->generateRandomIP(),
                'user_agent' => $this->generateRandomUserAgent(),
                'metadata' => $this->generateMetadata($action, $resourceType),
                'created_at' => $randomDate,
                'updated_at' => $randomDate
            ];
        }

        // Insert audit logs in batches
        $chunks = array_chunk($auditLogs, 100);
        foreach ($chunks as $chunk) {
            DB::table('organization_audit_logs')->insert($chunk);
        }

        $this->command->info("Created " . count($auditLogs) . " audit logs for organization: {$organization->name}");
    }

    /**
     * Get random action based on weights
     */
    private function getRandomWeightedAction(array $actions): string
    {
        $totalWeight = array_sum($actions);
        $random = rand(1, $totalWeight);

        $currentWeight = 0;
        foreach ($actions as $action => $weight) {
            $currentWeight += $weight;
            if ($random <= $currentWeight) {
                return $action;
            }
        }

        return 'view'; // fallback
    }

    /**
     * Generate old values based on action and resource type
     */
    private function generateOldValues(string $action, string $resourceType): ?array
    {
        if (in_array($action, ['create', 'login', 'logout', 'view'])) {
            return null;
        }

        $oldValues = [];

        switch ($resourceType) {
            case 'users':
                $oldValues = [
                    'name' => 'John Doe',
                    'email' => 'john.doe@example.com',
                    'status' => 'active',
                    'role' => 'user'
                ];
                break;
            case 'roles':
                $oldValues = [
                    'name' => 'Old Role Name',
                    'description' => 'Old role description',
                    'permissions' => ['view', 'edit']
                ];
                break;
            case 'content':
                $oldValues = [
                    'title' => 'Old Content Title',
                    'content' => 'Old content body',
                    'status' => 'draft'
                ];
                break;
            case 'settings':
                $oldValues = [
                    'setting_name' => 'old_value',
                    'enabled' => false
                ];
                break;
            default:
                $oldValues = [
                    'field1' => 'old_value_1',
                    'field2' => 'old_value_2'
                ];
        }

        return $oldValues;
    }

    /**
     * Generate new values based on action and resource type
     */
    private function generateNewValues(string $action, string $resourceType): ?array
    {
        if (in_array($action, ['delete', 'logout', 'view'])) {
            return null;
        }

        $newValues = [];

        switch ($resourceType) {
            case 'users':
                $newValues = [
                    'name' => 'Jane Smith',
                    'email' => 'jane.smith@example.com',
                    'status' => 'active',
                    'role' => 'admin'
                ];
                break;
            case 'roles':
                $newValues = [
                    'name' => 'New Role Name',
                    'description' => 'New role description',
                    'permissions' => ['view', 'edit', 'delete']
                ];
                break;
            case 'content':
                $newValues = [
                    'title' => 'New Content Title',
                    'content' => 'New content body',
                    'status' => 'published'
                ];
                break;
            case 'settings':
                $newValues = [
                    'setting_name' => 'new_value',
                    'enabled' => true
                ];
                break;
            default:
                $newValues = [
                    'field1' => 'new_value_1',
                    'field2' => 'new_value_2'
                ];
        }

        return $newValues;
    }

    /**
     * Generate random IP address
     */
    private function generateRandomIP(): string
    {
        $ips = [
            '192.168.1.100',
            '10.0.0.50',
            '172.16.0.25',
            '203.0.113.1',
            '198.51.100.1',
            '127.0.0.1'
        ];

        return $ips[array_rand($ips)];
    }

    /**
     * Generate random user agent
     */
    private function generateRandomUserAgent(): string
    {
        $userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:89.0) Gecko/20100101 Firefox/89.0',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/91.0.864.59'
        ];

        return $userAgents[array_rand($userAgents)];
    }

    /**
     * Generate metadata based on action and resource type
     */
    private function generateMetadata(string $action, string $resourceType): array
    {
        $metadata = [
            'action_type' => $action,
            'resource_type' => $resourceType,
            'timestamp' => now()->toISOString(),
            'session_id' => 'sess_' . \Illuminate\Support\Str::random(32),
            'request_id' => 'req_' . \Illuminate\Support\Str::random(16)
        ];

        // Add specific metadata based on action
        switch ($action) {
            case 'login':
                $metadata['login_method'] = ['password', 'oauth', 'sso'][array_rand(['password', 'oauth', 'sso'])];
                $metadata['success'] = true;
                break;
            case 'api_call':
                $metadata['endpoint'] = '/api/v1/' . $resourceType;
                $metadata['method'] = ['GET', 'POST', 'PUT', 'DELETE'][array_rand(['GET', 'POST', 'PUT', 'DELETE'])];
                $metadata['response_code'] = rand(200, 299);
                break;
            case 'export':
                $metadata['export_format'] = ['csv', 'xlsx', 'pdf'][array_rand(['csv', 'xlsx', 'pdf'])];
                $metadata['record_count'] = rand(100, 10000);
                break;
            case 'import':
                $metadata['import_format'] = ['csv', 'xlsx'][array_rand(['csv', 'xlsx'])];
                $metadata['record_count'] = rand(50, 5000);
                $metadata['success_count'] = rand(40, 5000);
                $metadata['error_count'] = rand(0, 100);
                break;
        }

        return $metadata;
    }

    /**
     * Create specific audit log patterns for testing
     */
    private function createSpecificAuditLogs(Organization $organization): void
    {
        $users = User::where('organization_id', $organization->id)->get();

        if ($users->isEmpty()) {
            return;
        }

        $specificLogs = [
            // User management activities
            [
                'action' => 'create',
                'resource_type' => 'users',
                'description' => 'New user created',
                'new_values' => ['name' => 'Test User', 'email' => 'test@example.com']
            ],
            [
                'action' => 'update',
                'resource_type' => 'users',
                'description' => 'User profile updated',
                'old_values' => ['name' => 'Old Name'],
                'new_values' => ['name' => 'New Name']
            ],
            [
                'action' => 'delete',
                'resource_type' => 'users',
                'description' => 'User account deleted',
                'old_values' => ['name' => 'Deleted User', 'email' => 'deleted@example.com']
            ],

            // Role management activities
            [
                'action' => 'create',
                'resource_type' => 'roles',
                'description' => 'New role created',
                'new_values' => ['name' => 'New Role', 'permissions' => ['view', 'edit']]
            ],
            [
                'action' => 'update',
                'resource_type' => 'roles',
                'description' => 'Role permissions updated',
                'old_values' => ['permissions' => ['view']],
                'new_values' => ['permissions' => ['view', 'edit', 'delete']]
            ],

            // Content management activities
            [
                'action' => 'create',
                'resource_type' => 'content',
                'description' => 'New content created',
                'new_values' => ['title' => 'New Article', 'status' => 'draft']
            ],
            [
                'action' => 'update',
                'resource_type' => 'content',
                'description' => 'Content published',
                'old_values' => ['status' => 'draft'],
                'new_values' => ['status' => 'published']
            ],

            // System activities
            [
                'action' => 'login',
                'resource_type' => 'system',
                'description' => 'User login',
                'metadata' => ['login_method' => 'password', 'success' => true]
            ],
            [
                'action' => 'logout',
                'resource_type' => 'system',
                'description' => 'User logout',
                'metadata' => ['session_duration' => rand(300, 3600)]
            ]
        ];

        $auditLogs = [];
        foreach ($specificLogs as $logData) {
            $auditLogs[] = [
                'organization_id' => $organization->id,
                'user_id' => $users->random()->id,
                'action' => $logData['action'],
                'resource_type' => $logData['resource_type'],
                'resource_id' => rand(1, 1000),
                'old_values' => $logData['old_values'] ?? null,
                'new_values' => $logData['new_values'] ?? null,
                'ip_address' => $this->generateRandomIP(),
                'user_agent' => $this->generateRandomUserAgent(),
                'metadata' => $logData['metadata'] ?? [],
                'created_at' => now()->subDays(rand(1, 30)),
                'updated_at' => now()->subDays(rand(1, 30))
            ];
        }

        DB::table('organization_audit_logs')->insert($auditLogs);
        $this->command->info("Created " . count($auditLogs) . " specific audit logs for organization: {$organization->name}");
    }
}
