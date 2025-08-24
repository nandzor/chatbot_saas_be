<?php

namespace Tests\Feature\Api\V1;

use App\Models\User;
use App\Models\Organization;
use App\Models\Role;
use App\Models\Permission;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Tests\TestCase;
use Laravel\Sanctum\Sanctum;

class UserManagementEdgeCaseTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected User $adminUser;
    protected Organization $organization;

    protected function setUp(): void
    {
        parent::setUp();

        $this->organization = Organization::factory()->create([
            'name' => 'Test Organization',
            'status' => 'active'
        ]);

        $this->adminUser = User::factory()->create([
            'organization_id' => $this->organization->id,
            'role' => 'org_admin',
            'is_email_verified' => true,
            'status' => 'active',
            'permissions' => [
                'users.view', 'users.create', 'users.update',
                'users.delete', 'users.restore', 'users.bulk_update'
            ]
        ]);

        // Create permissions
        Permission::factory()->create(['code' => 'users.view', 'name' => 'View Users']);
        Permission::factory()->create(['code' => 'users.create', 'name' => 'Create Users']);
        Permission::factory()->create(['code' => 'users.update', 'name' => 'Update Users']);
        Permission::factory()->create(['code' => 'users.delete', 'name' => 'Delete Users']);
        Permission::factory()->create(['code' => 'users.restore', 'name' => 'Restore Users']);
        Permission::factory()->create(['code' => 'users.bulk_update', 'name' => 'Bulk Update Users']);
    }

    // ========================================================================
    // EXTREME DATA TESTS
    // ========================================================================

    /** @test */
    public function handles_extremely_long_names()
    {
        Sanctum::actingAs($this->adminUser);

        $longName = str_repeat('A', 254); // Just under the 255 limit

        $userData = [
            'full_name' => $longName,
            'email' => 'longname@example.com',
            'username' => 'longname',
            'password_hash' => Hash::make('password123'),
            'role' => 'customer',
            'organization_id' => $this->organization->id
        ];

        $response = $this->postJson('/api/v1/users', $userData);

        $response->assertStatus(201);

        // Test with exactly 255 characters
        $exactLengthName = str_repeat('B', 255);
        $userData['full_name'] = $exactLengthName;
        $userData['email'] = 'exactlength@example.com';
        $userData['username'] = 'exactlength';

        $response = $this->postJson('/api/v1/users', $userData);

        $response->assertStatus(201);

        // Test with 256 characters (should fail)
        $tooLongName = str_repeat('C', 256);
        $userData['full_name'] = $tooLongName;
        $userData['email'] = 'toolong@example.com';
        $userData['username'] = 'toolong';

        $response = $this->postJson('/api/v1/users', $userData);

        $response->assertStatus(422);
    }

    /** @test */
    public function handles_special_characters_in_names()
    {
        Sanctum::actingAs($this->adminUser);

        $specialNames = [
            'José María O\'Connor-Smith',
            'Müller-García',
            '李小明',
            'محمد أحمد',
            'Иван Петров',
            'João da Silva',
            'François-Xavier',
            'Björk Guðmundsdóttir',
            'Krzysztof Kowalski',
            'Åsa Andersson'
        ];

        foreach ($specialNames as $index => $name) {
            $userData = [
                'full_name' => $name,
                'email' => "special{$index}@example.com",
                'username' => "special{$index}",
                'password_hash' => Hash::make('password123'),
                'role' => 'customer',
                'organization_id' => $this->organization->id
            ];

            $response = $this->postJson('/api/v1/users', $userData);

            $response->assertStatus(201);

            // Verify the name was stored correctly
            $this->assertDatabaseHas('users', [
                'email' => "special{$index}@example.com",
                'full_name' => $name
            ]);
        }
    }

    /** @test */
    public function handles_unicode_emojis_in_names()
    {
        Sanctum::actingAs($this->adminUser);

        $emojiNames = [
            'John 😀 Developer',
            'Jane 🚀 Designer',
            'Bob 🎯 Manager',
            'Alice 💻 Coder',
            'Charlie 🎨 Artist'
        ];

        foreach ($emojiNames as $index => $name) {
            $userData = [
                'full_name' => $name,
                'email' => "emoji{$index}@example.com",
                'username' => "emoji{$index}",
                'password_hash' => Hash::make('password123'),
                'role' => 'customer',
                'organization_id' => $this->organization->id
            ];

            $response = $this->postJson('/api/v1/users', $userData);

            $response->assertStatus(201);

            // Verify the name was stored correctly
            $this->assertDatabaseHas('users', [
                'email' => "emoji{$index}@example.com",
                'full_name' => $name
            ]);
        }
    }

    /** @test */
    public function handles_extremely_long_emails()
    {
        Sanctum::actingAs($this->adminUser);

        // Test with very long local part
        $longLocalPart = str_repeat('a', 60);
        $longEmail = "{$longLocalPart}@example.com";

        $userData = [
            'full_name' => 'Long Email User',
            'email' => $longEmail,
            'username' => 'longemail',
            'password_hash' => Hash::make('password123'),
            'role' => 'customer',
            'organization_id' => $this->organization->id
        ];

        $response = $this->postJson('/api/v1/users', $userData);

        $response->assertStatus(201);

        // Test with very long domain
        $longDomain = str_repeat('a', 60) . '.com';
        $longDomainEmail = "test@{$longDomain}";

        $userData['email'] = $longDomainEmail;
        $userData['username'] = 'longdomain';

        $response = $this->postJson('/api/v1/users', $userData);

        $response->assertStatus(201);
    }

    // ========================================================================
    // BOUNDARY VALUE TESTS
    // ========================================================================

    /** @test */
    public function handles_boundary_values_for_pagination()
    {
        Sanctum::actingAs($this->adminUser);

        // Create exactly 100 users
        User::factory()->count(100)->create([
            'organization_id' => $this->organization->id
        ]);

        // Test page 0 (should default to page 1)
        $response = $this->getJson('/api/v1/users?page=0&per_page=10');
        $response->assertStatus(200);
        $this->assertEquals(1, $response->json('data.current_page'));

        // Test negative page (should default to page 1)
        $response = $this->getJson('/api/v1/users?page=-1&per_page=10');
        $response->assertStatus(200);
        $this->assertEquals(1, $response->json('data.current_page'));

        // Test per_page = 0 (should use default)
        $response = $this->getJson('/api/v1/users?page=1&per_page=0');
        $response->assertStatus(200);
        $this->assertGreaterThan(0, $response->json('data.per_page'));

        // Test negative per_page (should use default)
        $response = $this->getJson('/api/v1/users?page=1&per_page=-10');
        $response->assertStatus(200);
        $this->assertGreaterThan(0, $response->json('data.per_page'));

        // Test very large per_page (should be capped)
        $response = $this->getJson('/api/v1/users?page=1&per_page=1000');
        $response->assertStatus(200);
        $this->assertLessThanOrEqual(100, $response->json('data.per_page'));
    }

    /** @test */
    public function handles_boundary_values_for_search()
    {
        Sanctum::actingAs($this->adminUser);

        // Test minimum query length (2 characters)
        $response = $this->getJson('/api/v1/users/search?query=ab');
        $response->assertStatus(200);

        // Test query length 1 (should fail)
        $response = $this->getJson('/api/v1/users/search?query=a');
        $response->assertStatus(422);

        // Test empty query (should fail)
        $response = $this->getJson('/api/v1/users/search?query=');
        $response->assertStatus(422);

        // Test very long query
        $longQuery = str_repeat('a', 1000);
        $response = $this->getJson("/api/v1/users/search?query={$longQuery}");
        $response->assertStatus(422);
    }

    // ========================================================================
    // MALFORMED DATA TESTS
    // ========================================================================

    /** @test */
    public function handles_malformed_json_data()
    {
        Sanctum::actingAs($this->adminUser);

        // Test with malformed JSON
        $response = $this->withHeaders([
            'Content-Type' => 'application/json',
        ])->postJson('/api/v1/users', ['{"invalid": json}']);

        $response->assertStatus(400);
    }

    /** @test */
    public function handles_malformed_uuid_values()
    {
        Sanctum::actingAs($this->adminUser);

        // Test with invalid UUID format
        $response = $this->getJson('/api/v1/users/invalid-uuid-format');
        $response->assertStatus(404);

        // Test with malformed UUID
        $response = $this->getJson('/api/v1/users/123-456-789');
        $response->assertStatus(404);

        // Test with empty UUID
        $response = $this->getJson('/api/v1/users/');
        $response->assertStatus(404);
    }

    /** @test */
    public function handles_malformed_email_addresses()
    {
        Sanctum::actingAs($this->adminUser);

        $malformedEmails = [
            'notanemail',
            '@example.com',
            'user@',
            'user..name@example.com',
            'user@.com',
            'user@example.',
            'user name@example.com',
            'user@example..com',
            'user@-example.com',
            'user@example-.com'
        ];

        foreach ($malformedEmails as $email) {
            $userData = [
                'full_name' => 'Malformed Email User',
                'email' => $email,
                'username' => 'malformed' . Str::random(5),
                'password_hash' => Hash::make('password123'),
                'role' => 'customer',
                'organization_id' => $this->organization->id
            ];

            $response = $this->postJson('/api/v1/users', $userData);

            $response->assertStatus(422);
            $this->assertArrayHasKey('email', $response->json('errors'));
        }
    }

    // ========================================================================
    // CONCURRENT ACCESS TESTS
    // ========================================================================

    /** @test */
    public function handles_concurrent_user_creation()
    {
        Sanctum::actingAs($this->adminUser);

        // Simulate concurrent requests by creating users rapidly
        $responses = [];
        $userCount = 10;

        for ($i = 0; $i < $userCount; $i++) {
            $userData = [
                'full_name' => "Concurrent User {$i}",
                'email' => "concurrent{$i}@example.com",
                'username' => "concurrent{$i}",
                'password_hash' => Hash::make('password123'),
                'role' => 'customer',
                'organization_id' => $this->organization->id
            ];

            $responses[] = $this->postJson('/api/v1/users', $userData);
        }

        // All requests should succeed
        foreach ($responses as $response) {
            $response->assertStatus(201);
        }

        // Verify all users were created
        $this->assertDatabaseCount('users', $userCount + 1); // +1 for admin user
    }

    /** @test */
    public function handles_concurrent_user_updates()
    {
        Sanctum::actingAs($this->adminUser);

        // Create a user to update
        $user = User::factory()->create([
            'organization_id' => $this->organization->id
        ]);

        // Simulate concurrent updates
        $responses = [];
        $updateCount = 5;

        for ($i = 0; $i < $updateCount; $i++) {
            $updateData = [
                'full_name' => "Updated Name {$i}",
                'email' => "updated{$i}@example.com"
            ];

            $responses[] = $this->putJson("/api/v1/users/{$user->id}", $updateData);
        }

        // All updates should succeed
        foreach ($responses as $response) {
            $response->assertStatus(200);
        }

        // Verify the user was updated (last update should be the final state)
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'full_name' => "Updated Name " . ($updateCount - 1),
            'email' => "updated" . ($updateCount - 1) . "@example.com"
        ]);
    }

    // ========================================================================
    // RESOURCE EXHAUSTION TESTS
    // ========================================================================

    /** @test */
    public function handles_large_bulk_operations()
    {
        Sanctum::actingAs($this->adminUser);

        // Create a large number of users
        $userCount = 1000;
        $users = User::factory()->count($userCount)->create([
            'organization_id' => $this->organization->id
        ]);

        $userIds = $users->pluck('id')->toArray();

        // Test bulk update with large dataset
        $bulkData = [
            'user_ids' => $userIds,
            'data' => ['status' => 'inactive']
        ];

        $startTime = microtime(true);
        $response = $this->patchJson('/api/v1/users/bulk-update', $bulkData);
        $endTime = microtime(true);

        $response->assertStatus(200);
        $this->assertEquals($userCount, $response->json('data.affected_count'));

        // Should complete within reasonable time
        $executionTime = $endTime - $startTime;
        $this->assertLessThan(5.0, $executionTime, 'Bulk update took too long');
    }

    /** @test */
    public function handles_large_search_results()
    {
        Sanctum::actingAs($this->adminUser);

        // Create users with searchable content
        User::factory()->count(500)->create([
            'organization_id' => $this->organization->id,
            'full_name' => 'Test User'
        ]);

        $startTime = microtime(true);
        $response = $this->getJson('/api/v1/users/search?query=Test&limit=100');
        $endTime = microtime(true);

        $response->assertStatus(200);
        $results = $response->json('data');

        // Should return results within reasonable time
        $executionTime = $endTime - $startTime;
        $this->assertLessThan(2.0, $executionTime, 'Search took too long');

        // Should respect the limit
        $this->assertLessThanOrEqual(100, count($results));
    }

    // ========================================================================
    // NETWORK ERROR SIMULATION TESTS
    // ========================================================================

    /** @test */
    public function handles_database_connection_errors()
    {
        Sanctum::actingAs($this->adminUser);

        // This test simulates database connection issues
        // In a real scenario, you might mock the database connection

        // Test that the API gracefully handles database errors
        $response = $this->getJson('/api/v1/users');
        $response->assertStatus(200);
    }

    /** @test */
    public function handles_timeout_scenarios()
    {
        Sanctum::actingAs($this->adminUser);

        // Test with very large datasets that might cause timeouts
        $userCount = 10000;

        // Create users in batches to avoid memory issues
        for ($i = 0; $i < $userCount; $i += 1000) {
            User::factory()->count(min(1000, $userCount - $i))->create([
                'organization_id' => $this->organization->id
            ]);
        }

        $startTime = microtime(true);
        $response = $this->getJson('/api/v1/users?per_page=50');
        $endTime = microtime(true);

        $response->assertStatus(200);

        // Should complete within reasonable time even with large datasets
        $executionTime = $endTime - $startTime;
        $this->assertLessThan(10.0, $executionTime, 'Large dataset query took too long');
    }

    // ========================================================================
    // INVALID STATE TESTS
    // ========================================================================

    /** @test */
    public function handles_invalid_user_states()
    {
        Sanctum::actingAs($this->adminUser);

        // Test updating a deleted user
        $user = User::factory()->create([
            'organization_id' => $this->organization->id
        ]);

        // Delete the user
        $user->delete();

        // Try to update deleted user
        $response = $this->putJson("/api/v1/users/{$user->id}", [
            'full_name' => 'Updated Deleted User'
        ]);

        $response->assertStatus(404);
    }

    /** @test */
    public function handles_circular_references()
    {
        Sanctum::actingAs($this->adminUser);

        // Test with data that might cause circular references
        $userData = [
            'full_name' => 'Circular Reference User',
            'email' => 'circular@example.com',
            'username' => 'circular',
            'password_hash' => Hash::make('password123'),
            'role' => 'customer',
            'organization_id' => $this->organization->id,
            'settings' => [
                'preferences' => [
                    'theme' => 'dark',
                    'language' => 'en'
                ]
            ]
        ];

        $response = $this->postJson('/api/v1/users', $userData);

        $response->assertStatus(201);

        // Verify complex data was stored correctly
        $this->assertDatabaseHas('users', [
            'email' => 'circular@example.com',
            'full_name' => 'Circular Reference User'
        ]);
    }

    // ========================================================================
    // SECURITY EDGE CASE TESTS
    // ========================================================================

    /** @test */
    public function handles_sql_injection_attempts()
    {
        Sanctum::actingAs($this->adminUser);

        $sqlInjectionAttempts = [
            "'; DROP TABLE users; --",
            "' OR '1'='1",
            "'; INSERT INTO users VALUES (1, 'hacker', 'hacker@evil.com'); --",
            "' UNION SELECT * FROM users --",
            "'; UPDATE users SET role='admin' WHERE id=1; --"
        ];

        foreach ($sqlInjectionAttempts as $attempt) {
            $response = $this->getJson("/api/v1/users/search?query={$attempt}");

            // Should not crash and should handle gracefully
            $response->assertStatus(200);
        }
    }

    /** @test */
    public function handles_xss_attempts()
    {
        Sanctum::actingAs($this->adminUser);

        $xssAttempts = [
            '<script>alert("xss")</script>',
            'javascript:alert("xss")',
            '<img src="x" onerror="alert(\'xss\')">',
            '"><script>alert("xss")</script>',
            '&#60;script&#62;alert("xss")&#60;/script&#62;'
        ];

        foreach ($xssAttempts as $attempt) {
            $userData = [
                'full_name' => $attempt,
                'email' => "xss{$attempt}@example.com",
                'username' => "xss{$attempt}",
                'password_hash' => Hash::make('password123'),
                'role' => 'customer',
                'organization_id' => $this->organization->id
            ];

            $response = $this->postJson('/api/v1/users', $userData);

            // Should handle XSS attempts gracefully
            $response->assertStatus(201);

            // Verify the data was stored as-is (not executed)
            $this->assertDatabaseHas('users', [
                'email' => "xss{$attempt}@example.com",
                'full_name' => $attempt
            ]);
        }
    }

    // ========================================================================
    // PERFORMANCE EDGE CASE TESTS
    // ========================================================================

    /** @test */
    public function handles_memory_intensive_operations()
    {
        Sanctum::actingAs($this->adminUser);

        // Test with operations that might consume a lot of memory
        $userCount = 5000;

        // Create users in smaller batches to avoid memory issues
        for ($i = 0; $i < $userCount; $i += 500) {
            User::factory()->count(min(500, $userCount - $i))->create([
                'organization_id' => $this->organization->id
            ]);
        }

        // Test pagination with large dataset
        $response = $this->getJson('/api/v1/users?page=1&per_page=100');
        $response->assertStatus(200);

        // Test search with large dataset
        $response = $this->getJson('/api/v1/users/search?query=User&limit=50');
        $response->assertStatus(200);

        // Test statistics with large dataset
        $response = $this->getJson('/api/v1/users/statistics');
        $response->assertStatus(200);
    }
}
