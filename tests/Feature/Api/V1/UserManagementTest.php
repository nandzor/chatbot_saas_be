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

class UserManagementTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected User $adminUser;
    protected User $regularUser;
    protected Organization $organization;

    protected function setUp(): void
    {
        parent::setUp();

        // Create test organization
        $this->organization = Organization::factory()->create([
            'name' => 'Test Organization',
            'status' => 'active'
        ]);

        // Create roles (optional - not needed for basic user management tests)
        // $this->adminRole = Role::factory()->create([
        //     'name' => 'admin',
        //     'display_name' => 'Administrator',
        //     'organization_id' => $this->organization->id
        // ]);

        // $this->userRole = Role::factory()->create([
        //     'name' => 'user',
        //     'display_name' => 'Regular User',
        //     'organization_id' => $this->organization->id
        // ]);

        // Create admin user with permissions
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

        // Create regular user
        $this->regularUser = User::factory()->create([
            'organization_id' => $this->organization->id,
            'role' => 'customer',
            'is_email_verified' => true,
            'status' => 'active',
            'permissions' => ['users.view']
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
    // AUTHENTICATION & AUTHORIZATION TESTS
    // ========================================================================

    /** @test */
    public function unauthenticated_users_cannot_access_user_management_endpoints()
    {
        $endpoints = [
            ['method' => 'GET', 'endpoint' => '/api/v1/users'],
            ['method' => 'POST', 'endpoint' => '/api/v1/users'],
            ['method' => 'GET', 'endpoint' => '/api/v1/users/1'],
            ['method' => 'PUT', 'endpoint' => '/api/v1/users/1'],
            ['method' => 'DELETE', 'endpoint' => '/api/v1/users/1'],
            ['method' => 'PATCH', 'endpoint' => '/api/v1/users/1/toggle-status'],
            ['method' => 'GET', 'endpoint' => '/api/v1/users/statistics'],
            ['method' => 'GET', 'endpoint' => '/api/v1/users/search'],
            ['method' => 'PATCH', 'endpoint' => '/api/v1/users/bulk-update'],
            ['method' => 'PATCH', 'endpoint' => '/api/v1/users/1/restore'],
        ];

        foreach ($endpoints as $endpoint) {
            $response = $this->json($endpoint['method'], $endpoint['endpoint']);
            $response->assertStatus(401);
        }
    }

    /** @test */
    public function users_without_permissions_cannot_access_protected_endpoints()
    {
        Sanctum::actingAs($this->regularUser);

        // Regular user only has 'users.view' permission
        $response = $this->getJson('/api/v1/users');
        $response->assertStatus(200); // Can view

        $response = $this->postJson('/api/v1/users', []);
        $response->assertStatus(403); // Cannot create

        $response = $this->putJson('/api/v1/users/1', []);
        $response->assertStatus(403); // Cannot update

        $response = $this->deleteJson('/api/v1/users/1');
        $response->assertStatus(403); // Cannot delete
    }

    // ========================================================================
    // USER LISTING TESTS
    // ========================================================================

    /** @test */
    public function admin_can_list_users_with_pagination()
    {
        Sanctum::actingAs($this->adminUser);

        // Create additional test users
        User::factory()->count(15)->create([
            'organization_id' => $this->organization->id
        ]);

        $response = $this->getJson('/api/v1/users?page=1&per_page=10');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'message',
                    'data' => [
                        'data' => [
                            '*' => [
                                'id', 'email', 'full_name', 'role', 'status',
                                'is_email_verified', 'created_at'
                            ]
                        ],
                        'current_page',
                        'per_page',
                        'total'
                    ]
                ]);

        $this->assertEquals(10, count($response->json('data.data')));
        $this->assertTrue($response->json('success'));
    }

    /** @test */
    public function admin_can_filter_users_by_status()
    {
        Sanctum::actingAs($this->adminUser);

        // Create users with different statuses
        User::factory()->create(['status' => 'active', 'organization_id' => $this->organization->id]);
        User::factory()->create(['status' => 'inactive', 'organization_id' => $this->organization->id]);

        $response = $this->getJson('/api/v1/users?filters[status]=active');

        $response->assertStatus(200);
        $users = $response->json('data.data');

        foreach ($users as $user) {
            $this->assertEquals('active', $user['status']);
        }
    }

    /** @test */
    public function admin_can_search_users_by_name_or_email()
    {
        Sanctum::actingAs($this->adminUser);

        // Create users with specific names/emails
        User::factory()->create([
            'full_name' => 'John Doe',
            'email' => 'john.doe@example.com',
            'organization_id' => $this->organization->id
        ]);

        User::factory()->create([
            'full_name' => 'Jane Smith',
            'email' => 'jane.smith@example.com',
            'organization_id' => $this->organization->id
        ]);

        $response = $this->getJson('/api/v1/users?search=John');

        $response->assertStatus(200);
        $users = $response->json('data.data');

        $this->assertCount(1, $users);
        $this->assertEquals('John Doe', $users[0]['full_name']);
    }

    /** @test */
    public function admin_can_sort_users_by_different_fields()
    {
        Sanctum::actingAs($this->adminUser);

        // Create users with different creation dates
        User::factory()->create([
            'full_name' => 'Alice',
            'created_at' => now()->subDays(2),
            'organization_id' => $this->organization->id
        ]);

        User::factory()->create([
            'full_name' => 'Bob',
            'created_at' => now()->subDays(1),
            'organization_id' => $this->organization->id
        ]);

        User::factory()->create([
            'full_name' => 'Charlie',
            'created_at' => now(),
            'organization_id' => $this->organization->id
        ]);

        $response = $this->getJson('/api/v1/users?sort=created_at&order=desc');

        $response->assertStatus(200);
        $users = $response->json('data.data');

        $this->assertEquals('Charlie', $users[0]['full_name']);
        $this->assertEquals('Bob', $users[1]['full_name']);
        $this->assertEquals('Alice', $users[2]['full_name']);
    }

    // ========================================================================
    // USER CREATION TESTS
    // ========================================================================

    /** @test */
    public function admin_can_create_new_user()
    {
        Sanctum::actingAs($this->adminUser);

        $userData = [
            'full_name' => 'New Test User',
            'email' => 'newuser@example.com',
            'username' => 'newuser',
            'password_hash' => Hash::make('password123'),
            'role' => 'customer',
            'organization_id' => $this->organization->id,
            'is_email_verified' => true,
            'status' => 'active'
        ];

        $response = $this->postJson('/api/v1/users', $userData);

        $response->assertStatus(201)
                ->assertJsonStructure([
                    'success',
                    'message',
                    'data' => [
                        'id', 'full_name', 'email', 'username', 'role', 'status'
                    ]
                ]);

        $this->assertDatabaseHas('users', [
            'email' => 'newuser@example.com',
            'full_name' => 'New Test User',
            'organization_id' => $this->organization->id
        ]);
    }

    /** @test */
    public function user_creation_validates_required_fields()
    {
        Sanctum::actingAs($this->adminUser);

        $response = $this->postJson('/api/v1/users', []);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['full_name', 'email', 'username', 'password_hash']);
    }

    /** @test */
    public function user_creation_validates_email_uniqueness()
    {
        Sanctum::actingAs($this->adminUser);

        // Create user with existing email
        User::factory()->create([
            'email' => 'existing@example.com',
            'organization_id' => $this->organization->id
        ]);

        $userData = [
            'full_name' => 'Test User',
            'email' => 'existing@example.com', // Duplicate email
            'username' => 'testuser',
            'password_hash' => Hash::make('password123'),
            'role' => 'customer',
            'organization_id' => $this->organization->id
        ];

        $response = $this->postJson('/api/v1/users', $userData);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['email']);
    }

    // ========================================================================
    // USER RETRIEVAL TESTS
    // ========================================================================

    /** @test */
    public function admin_can_view_specific_user_details()
    {
        Sanctum::actingAs($this->adminUser);

        $user = User::factory()->create([
            'organization_id' => $this->organization->id
        ]);

        $response = $this->getJson("/api/v1/users/{$user->id}");

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'message',
                    'data' => [
                        'id', 'full_name', 'email', 'username', 'role', 'status',
                        'is_email_verified', 'created_at', 'updated_at'
                    ]
                ]);

        $this->assertEquals($user->id, $response->json('data.id'));
    }

    /** @test */
    public function admin_cannot_view_user_from_different_organization()
    {
        Sanctum::actingAs($this->adminUser);

        $otherOrg = Organization::factory()->create();
        $otherUser = User::factory()->create([
            'organization_id' => $otherOrg->id
        ]);

        $response = $this->getJson("/api/v1/users/{$otherUser->id}");

        $response->assertStatus(404);
    }

    /** @test */
    public function returns_404_for_nonexistent_user()
    {
        Sanctum::actingAs($this->adminUser);

        $response = $this->getJson('/api/v1/users/999999');

        $response->assertStatus(404);
    }

    // ========================================================================
    // USER UPDATE TESTS
    // ========================================================================

    /** @test */
    public function admin_can_update_user_profile()
    {
        Sanctum::actingAs($this->adminUser);

        $user = User::factory()->create([
            'organization_id' => $this->organization->id
        ]);

        $updateData = [
            'full_name' => 'Updated Name',
            'email' => 'updated@example.com',
            'role' => 'agent'
        ];

        $response = $this->putJson("/api/v1/users/{$user->id}", $updateData);

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'message',
                    'data' => [
                        'id', 'full_name', 'email', 'role'
                    ]
                ]);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'full_name' => 'Updated Name',
            'email' => 'updated@example.com',
            'role' => 'agent'
        ]);
    }

    /** @test */
    public function user_update_validates_email_uniqueness_excluding_current_user()
    {
        Sanctum::actingAs($this->adminUser);

        $user1 = User::factory()->create([
            'email' => 'user1@example.com',
            'organization_id' => $this->organization->id
        ]);

        $user2 = User::factory()->create([
            'email' => 'user2@example.com',
            'organization_id' => $this->organization->id
        ]);

        // Try to update user1 with user2's email
        $updateData = [
            'email' => 'user2@example.com'
        ];

        $response = $this->putJson("/api/v1/users/{$user1->id}", $updateData);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['email']);
    }

    /** @test */
    public function admin_can_toggle_user_status()
    {
        Sanctum::actingAs($this->adminUser);

        $user = User::factory()->create([
            'status' => 'active',
            'organization_id' => $this->organization->id
        ]);

        $response = $this->patchJson("/api/v1/users/{$user->id}/toggle-status");

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'message',
                    'data' => [
                        'id', 'status'
                    ]
                ]);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'status' => 'inactive'
        ]);

        // Toggle back to active
        $response = $this->patchJson("/api/v1/users/{$user->id}/toggle-status");

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'status' => 'active'
        ]);
    }

    // ========================================================================
    // USER DELETION TESTS
    // ========================================================================

    /** @test */
    public function admin_can_soft_delete_user()
    {
        Sanctum::actingAs($this->adminUser);

        $user = User::factory()->create([
            'organization_id' => $this->organization->id
        ]);

        $response = $this->deleteJson("/api/v1/users/{$user->id}");

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'message'
                ]);

        $this->assertSoftDeleted('users', ['id' => $user->id]);
    }

    /** @test */
    public function admin_can_restore_soft_deleted_user()
    {
        Sanctum::actingAs($this->adminUser);

        $user = User::factory()->create([
            'organization_id' => $this->organization->id
        ]);

        // Soft delete the user first
        $user->delete();

        $response = $this->patchJson("/api/v1/users/{$user->id}/restore");

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'message',
                    'data' => [
                        'id', 'full_name', 'email'
                    ]
                ]);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'deleted_at' => null
        ]);
    }

    // ========================================================================
    // USER SEARCH TESTS
    // ========================================================================

    /** @test */
    public function admin_can_search_users_by_query()
    {
        Sanctum::actingAs($this->adminUser);

        // Create users with specific names
        User::factory()->create([
            'full_name' => 'John Developer',
            'email' => 'john@example.com',
            'organization_id' => $this->organization->id
        ]);

        User::factory()->create([
            'full_name' => 'Jane Designer',
            'email' => 'jane@example.com',
            'organization_id' => $this->organization->id
        ]);

        User::factory()->create([
            'full_name' => 'Bob Manager',
            'email' => 'bob@example.com',
            'organization_id' => $this->organization->id
        ]);

        $response = $this->getJson('/api/v1/users/search?query=Developer');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'message',
                    'data' => [
                        '*' => ['id', 'full_name', 'email']
                    ]
                ]);

        $users = $response->json('data');
        $this->assertCount(1, $users);
        $this->assertEquals('John Developer', $users[0]['full_name']);
    }

    /** @test */
    public function search_validates_minimum_query_length()
    {
        Sanctum::actingAs($this->adminUser);

        $response = $this->getJson('/api/v1/users/search?query=a');

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['query']);
    }

    // ========================================================================
    // USER STATISTICS TESTS
    // ========================================================================

    /** @test */
    public function admin_can_view_user_statistics()
    {
        Sanctum::actingAs($this->adminUser);

        // Create users with different statuses
        User::factory()->count(5)->create([
            'status' => 'active',
            'organization_id' => $this->organization->id
        ]);

        User::factory()->count(3)->create([
            'status' => 'inactive',
            'organization_id' => $this->organization->id
        ]);

        User::factory()->count(2)->create([
            'is_email_verified' => false,
            'organization_id' => $this->organization->id
        ]);

        $response = $this->getJson('/api/v1/users/statistics');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'message',
                    'data' => [
                        'total_users',
                        'active_users',
                        'verified_users',
                        'inactive_users',
                        'unverified_users'
                    ]
                ]);

        $stats = $response->json('data');
        $this->assertEquals(10, $stats['total_users']);
        $this->assertEquals(5, $stats['active_users']);
        $this->assertEquals(8, $stats['verified_users']);
        $this->assertEquals(3, $stats['inactive_users']);
        $this->assertEquals(2, $stats['unverified_users']);
    }

    // ========================================================================
    // BULK OPERATIONS TESTS
    // ========================================================================

    /** @test */
    public function admin_can_bulk_update_users()
    {
        Sanctum::actingAs($this->adminUser);

        // Create multiple users
        $users = User::factory()->count(5)->create([
            'organization_id' => $this->organization->id
        ]);

        $userIds = $users->pluck('id')->toArray();

        $bulkData = [
            'user_ids' => $userIds,
            'data' => [
                'status' => 'inactive'
            ]
        ];

        $response = $this->patchJson('/api/v1/users/bulk-update', $bulkData);

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'message',
                    'data' => [
                        'affected_count'
                    ]
                ]);

        $this->assertEquals(5, $response->json('data.affected_count'));

        // Verify all users were updated
        foreach ($users as $user) {
            $this->assertDatabaseHas('users', [
                'id' => $user->id,
                'status' => 'inactive'
            ]);
        }
    }

    /** @test */
    public function bulk_update_validates_required_fields()
    {
        Sanctum::actingAs($this->adminUser);

        $response = $this->patchJson('/api/v1/users/bulk-update', []);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['user_ids', 'data']);
    }

    /** @test */
    public function bulk_update_validates_user_ids_exist()
    {
        Sanctum::actingAs($this->adminUser);

        $bulkData = [
            'user_ids' => [999999, 999998], // Non-existent IDs
            'data' => ['status' => 'inactive']
        ];

        $response = $this->patchJson('/api/v1/users/bulk-update', $bulkData);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['user_ids.0', 'user_ids.1']);
    }

    // ========================================================================
    // ERROR HANDLING TESTS
    // ========================================================================

    /** @test */
    public function handles_database_errors_gracefully()
    {
        Sanctum::actingAs($this->adminUser);

        // Mock database error by using invalid data
        $invalidData = [
            'full_name' => str_repeat('a', 1000), // Exceeds max length
            'email' => 'invalid-email',
            'organization_id' => 'invalid-uuid'
        ];

        $response = $this->postJson('/api/v1/users', $invalidData);

        $response->assertStatus(422);
    }

    /** @test */
    public function returns_proper_error_messages_for_validation_failures()
    {
        Sanctum::actingAs($this->adminUser);

        $response = $this->postJson('/api/v1/users', [
            'email' => 'not-an-email',
            'full_name' => '',
            'username' => 'a', // Too short
        ]);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['email', 'full_name', 'username']);
    }

    // ========================================================================
    // ORGANIZATION ISOLATION TESTS
    // ========================================================================

    /** @test */
    public function users_are_properly_isolated_by_organization()
    {
        Sanctum::actingAs($this->adminUser);

        // Create users in different organizations
        $otherOrg = Organization::factory()->create();
        $otherUser = User::factory()->create([
            'organization_id' => $otherOrg->id
        ]);

        // Admin should not see users from other organizations
        $response = $this->getJson('/api/v1/users');
        $users = $response->json('data.data');

        $otherOrgUserIds = collect($users)->pluck('id')->toArray();
        $this->assertNotContains($otherUser->id, $otherOrgUserIds);
    }

    // ========================================================================
    // PERFORMANCE TESTS
    // ========================================================================

    /** @test */
    public function user_listing_performs_well_with_large_datasets()
    {
        Sanctum::actingAs($this->adminUser);

        // Create 100 users
        User::factory()->count(100)->create([
            'organization_id' => $this->organization->id
        ]);

        $startTime = microtime(true);

        $response = $this->getJson('/api/v1/users?per_page=50');

        $endTime = microtime(true);
        $executionTime = $endTime - $startTime;

        $response->assertStatus(200);

        // Should complete within reasonable time (adjust threshold as needed)
        $this->assertLessThan(1.0, $executionTime, 'User listing took too long');
    }

    // ========================================================================
    // EDGE CASES TESTS
    // ========================================================================

    /** @test */
    public function handles_empty_user_list_gracefully()
    {
        Sanctum::actingAs($this->adminUser);

        // Delete all users except admin
        User::where('id', '!=', $this->adminUser->id)->delete();

        $response = $this->getJson('/api/v1/users');

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data.data')); // Only admin user
    }

    /** @test */
    public function handles_special_characters_in_search_query()
    {
        Sanctum::actingAs($this->adminUser);

        // Create user with special characters
        User::factory()->create([
            'full_name' => 'José María O\'Connor-Smith',
            'email' => 'jose.maria@example.com',
            'organization_id' => $this->organization->id
        ]);

        $response = $this->getJson('/api/v1/users/search?query=José');

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));
    }

    /** @test */
    public function handles_very_long_search_queries()
    {
        Sanctum::actingAs($this->adminUser);

        $longQuery = str_repeat('a', 1000);

        $response = $this->getJson("/api/v1/users/search?query={$longQuery}");

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['query']);
    }
}
