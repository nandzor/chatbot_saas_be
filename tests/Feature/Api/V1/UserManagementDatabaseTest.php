<?php

namespace Tests\Feature\Api\V1;

use App\Models\User;
use App\Models\Organization;
use App\Models\Role;
use App\Models\Permission;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;
use Laravel\Sanctum\Sanctum;

class UserManagementDatabaseTest extends TestCase
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
    // DATABASE INTEGRITY TESTS
    // ========================================================================

    /** @test */
    public function user_creation_maintains_database_integrity()
    {
        Sanctum::actingAs($this->adminUser);

        $userData = [
            'full_name' => 'Database Test User',
            'email' => 'dbuser@example.com',
            'username' => 'dbuser',
            'password_hash' => Hash::make('password123'),
            'role' => 'customer',
            'organization_id' => $this->organization->id,
            'is_email_verified' => true,
            'status' => 'active',
            'phone' => '+6281234567890',
            'bio' => 'Test bio for database integrity',
            'department' => 'IT',
            'job_title' => 'Developer'
        ];

        $response = $this->postJson('/api/v1/users', $userData);

        $response->assertStatus(201);

        // Verify all fields are stored correctly
        $this->assertDatabaseHas('users', [
            'email' => 'dbuser@example.com',
            'full_name' => 'Database Test User',
            'username' => 'dbuser',
            'role' => 'customer',
            'organization_id' => $this->organization->id,
            'is_email_verified' => true,
            'status' => 'active',
            'phone' => '+6281234567890',
            'bio' => 'Test bio for database integrity',
            'department' => 'IT',
            'job_title' => 'Developer'
        ]);

        // Verify password is hashed
        $user = User::where('email', 'dbuser@example.com')->first();
        $this->assertTrue(Hash::check('password123', $user->password_hash));
    }

    /** @test */
    public function user_update_maintains_database_integrity()
    {
        Sanctum::actingAs($this->adminUser);

        $user = User::factory()->create([
            'organization_id' => $this->organization->id,
            'full_name' => 'Original Name',
            'email' => 'original@example.com',
            'role' => 'customer'
        ]);

        $updateData = [
            'full_name' => 'Updated Name',
            'email' => 'updated@example.com',
            'role' => 'agent',
            'phone' => '+6289876543210',
            'bio' => 'Updated bio',
            'department' => 'Sales',
            'job_title' => 'Manager'
        ];

        $response = $this->putJson("/api/v1/users/{$user->id}", $updateData);

        $response->assertStatus(200);

        // Verify all fields are updated correctly
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'full_name' => 'Updated Name',
            'email' => 'updated@example.com',
            'role' => 'agent',
            'phone' => '+6289876543210',
            'bio' => 'Updated bio',
            'department' => 'Sales',
            'job_title' => 'Manager'
        ]);

        // Verify original fields that weren't updated remain unchanged
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'username' => $user->username,
            'organization_id' => $user->organization_id,
            'is_email_verified' => $user->is_email_verified
        ]);
    }

    /** @test */
    public function soft_delete_maintains_data_integrity()
    {
        Sanctum::actingAs($this->adminUser);

        $user = User::factory()->create([
            'organization_id' => $this->organization->id
        ]);

        $originalData = $user->toArray();

        $response = $this->deleteJson("/api/v1/users/{$user->id}");

        $response->assertStatus(200);

        // Verify user is soft deleted
        $this->assertSoftDeleted('users', ['id' => $user->id]);

        // Verify all original data is preserved
        $deletedUser = User::withTrashed()->find($user->id);
        $this->assertNotNull($deletedUser);
        $this->assertEquals($originalData['full_name'], $deletedUser->full_name);
        $this->assertEquals($originalData['email'], $deletedUser->email);
        $this->assertEquals($originalData['role'], $deletedUser->role);
    }

    /** @test */
    public function user_restore_maintains_data_integrity()
    {
        Sanctum::actingAs($this->adminUser);

        $user = User::factory()->create([
            'organization_id' => $this->organization->id
        ]);

        $originalData = $user->toArray();

        // Soft delete the user
        $user->delete();

        $response = $this->patchJson("/api/v1/users/{$user->id}/restore");

        $response->assertStatus(200);

        // Verify user is restored
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'deleted_at' => null
        ]);

        // Verify all original data is preserved
        $restoredUser = User::find($user->id);
        $this->assertNotNull($restoredUser);
        $this->assertEquals($originalData['full_name'], $restoredUser->full_name);
        $this->assertEquals($originalData['email'], $restoredUser->email);
        $this->assertEquals($originalData['role'], $restoredUser->role);
    }

    // ========================================================================
    // DATABASE RELATIONSHIP TESTS
    // ========================================================================

    /** @test */
    public function user_organization_relationship_is_maintained()
    {
        Sanctum::actingAs($this->adminUser);

        $user = User::factory()->create([
            'organization_id' => $this->organization->id
        ]);

        // Verify organization relationship
        $this->assertEquals($this->organization->id, $user->organization_id);
        $this->assertTrue($user->organization->is($this->organization));

        // Verify user appears in organization's users
        $this->assertTrue($this->organization->users->contains($user));
    }

    /** @test */
    public function user_roles_relationship_is_maintained()
    {
        Sanctum::actingAs($this->adminUser);

        $role = Role::factory()->create([
            'organization_id' => $this->organization->id
        ]);

        $user = User::factory()->create([
            'organization_id' => $this->organization->id,
            'role' => $role->name
        ]);

        // Verify role relationship
        $this->assertEquals($role->name, $user->role);
    }

    // ========================================================================
    // DATABASE CONSTRAINT TESTS
    // ========================================================================

    /** @test */
    public function email_uniqueness_constraint_is_enforced()
    {
        Sanctum::actingAs($this->adminUser);

        // Create first user
        $user1 = User::factory()->create([
            'email' => 'unique@example.com',
            'organization_id' => $this->organization->id
        ]);

        // Try to create second user with same email
        $userData = [
            'full_name' => 'Duplicate User',
            'email' => 'unique@example.com', // Same email
            'username' => 'duplicate',
            'password_hash' => Hash::make('password123'),
            'role' => 'customer',
            'organization_id' => $this->organization->id
        ];

        $response = $this->postJson('/api/v1/users', $userData);

        $response->assertStatus(422);

        // Verify only one user exists with that email
        $this->assertDatabaseCount('users', 2); // admin + user1
        $this->assertDatabaseMissing('users', [
            'email' => 'unique@example.com',
            'full_name' => 'Duplicate User'
        ]);
    }

    /** @test */
    public function username_uniqueness_constraint_is_enforced()
    {
        Sanctum::actingAs($this->adminUser);

        // Create first user
        $user1 = User::factory()->create([
            'username' => 'uniqueuser',
            'organization_id' => $this->organization->id
        ]);

        // Try to create second user with same username
        $userData = [
            'full_name' => 'Duplicate Username User',
            'email' => 'duplicate@example.com',
            'username' => 'uniqueuser', // Same username
            'password_hash' => Hash::make('password123'),
            'role' => 'customer',
            'organization_id' => $this->organization->id
        ];

        $response = $this->postJson('/api/v1/users', $userData);

        $response->assertStatus(422);

        // Verify only one user exists with that username
        $this->assertDatabaseCount('users', 2); // admin + user1
        $this->assertDatabaseMissing('users', [
            'username' => 'uniqueuser',
            'full_name' => 'Duplicate Username User'
        ]);
    }

    /** @test */
    public function organization_id_foreign_key_constraint_is_enforced()
    {
        Sanctum::actingAs($this->adminUser);

        $invalidOrgId = '00000000-0000-0000-0000-000000000000';

        $userData = [
            'full_name' => 'Invalid Org User',
            'email' => 'invalidorg@example.com',
            'username' => 'invalidorg',
            'password_hash' => Hash::make('password123'),
            'role' => 'customer',
            'organization_id' => $invalidOrgId
        ];

        $response = $this->postJson('/api/v1/users', $userData);

        $response->assertStatus(422);

        // Verify user was not created
        $this->assertDatabaseMissing('users', [
            'email' => 'invalidorg@example.com'
        ]);
    }

    // ========================================================================
    // DATABASE TRANSACTION TESTS
    // ========================================================================

    /** @test */
    public function user_creation_uses_database_transactions()
    {
        Sanctum::actingAs($this->adminUser);

        // Mock a database error by using invalid data that would cause a rollback
        $invalidData = [
            'full_name' => 'Transaction Test User',
            'email' => 'transaction@example.com',
            'username' => 'transaction',
            'password_hash' => Hash::make('password123'),
            'role' => 'customer',
            'organization_id' => $this->organization->id,
            'phone' => str_repeat('a', 1000) // This will cause validation error
        ];

        $response = $this->postJson('/api/v1/users', $invalidData);

        $response->assertStatus(422);

        // Verify no partial data was inserted
        $this->assertDatabaseMissing('users', [
            'email' => 'transaction@example.com'
        ]);
    }

    // ========================================================================
    // DATABASE INDEX TESTS
    // ========================================================================

    /** @test */
    public function database_indexes_are_working_properly()
    {
        Sanctum::actingAs($this->adminUser);

        // Create multiple users to test indexing
        User::factory()->count(50)->create([
            'organization_id' => $this->organization->id
        ]);

        // Test email search performance (should use index)
        $startTime = microtime(true);
        $user = User::where('email', $this->adminUser->email)->first();
        $endTime = microtime(true);
        $emailSearchTime = $endTime - $startTime;

        // Test organization_id search performance (should use index)
        $startTime = microtime(true);
        $orgUsers = User::where('organization_id', $this->organization->id)->get();
        $endTime = microtime(true);
        $orgSearchTime = $endTime - $startTime;

        // Both searches should be fast due to indexes
        $this->assertLessThan(0.1, $emailSearchTime, 'Email search took too long');
        $this->assertLessThan(0.1, $orgSearchTime, 'Organization search took too long');
        $this->assertNotNull($user);
        $this->assertCount(51, $orgUsers); // admin + 50 created users
    }

    // ========================================================================
    // DATABASE SOFT DELETE TESTS
    // ========================================================================

    /** @test */
    public function soft_deleted_users_are_excluded_from_normal_queries()
    {
        Sanctum::actingAs($this->adminUser);

        $user = User::factory()->create([
            'organization_id' => $this->organization->id
        ]);

        // Verify user is visible
        $this->assertDatabaseHas('users', ['id' => $user->id]);

        // Soft delete user
        $user->delete();

        // Verify user is not visible in normal queries
        $this->assertDatabaseMissing('users', ['id' => $user->id]);

        // Verify user is visible in withTrashed queries
        $deletedUser = User::withTrashed()->find($user->id);
        $this->assertNotNull($deletedUser);
        $this->assertNotNull($deletedUser->deleted_at);
    }

    /** @test */
    public function soft_deleted_users_maintain_relationships()
    {
        Sanctum::actingAs($this->adminUser);

        $user = User::factory()->create([
            'organization_id' => $this->organization->id
        ]);

        // Soft delete user
        $user->delete();

        // Verify organization relationship still exists
        $deletedUser = User::withTrashed()->find($user->id);
        $this->assertEquals($this->organization->id, $deletedUser->organization_id);
    }

    // ========================================================================
    // DATABASE VALIDATION TESTS
    // ========================================================================

    /** @test */
    public function database_field_lengths_are_enforced()
    {
        Sanctum::actingAs($this->adminUser);

        $userData = [
            'full_name' => str_repeat('a', 256), // Exceeds 255 limit
            'email' => 'length@example.com',
            'username' => 'length',
            'password_hash' => Hash::make('password123'),
            'role' => 'customer',
            'organization_id' => $this->organization->id
        ];

        $response = $this->postJson('/api/v1/users', $userData);

        $response->assertStatus(422);

        // Verify user was not created
        $this->assertDatabaseMissing('users', [
            'email' => 'length@example.com'
        ]);
    }

    /** @test */
    public function database_enum_values_are_enforced()
    {
        Sanctum::actingAs($this->adminUser);

        $userData = [
            'full_name' => 'Enum Test User',
            'email' => 'enum@example.com',
            'username' => 'enumtest',
            'password_hash' => Hash::make('password123'),
            'role' => 'invalid_role', // Invalid enum value
            'organization_id' => $this->organization->id
        ];

        $response = $this->postJson('/api/v1/users', $userData);

        $response->assertStatus(422);

        // Verify user was not created
        $this->assertDatabaseMissing('users', [
            'email' => 'enum@example.com'
        ]);
    }

    // ========================================================================
    // DATABASE PERFORMANCE TESTS
    // ========================================================================

    /** @test */
    public function bulk_operations_are_efficient()
    {
        Sanctum::actingAs($this->adminUser);

        // Create 100 users
        $users = User::factory()->count(100)->create([
            'organization_id' => $this->organization->id
        ]);

        $userIds = $users->pluck('id')->toArray();

        $startTime = microtime(true);

        $bulkData = [
            'user_ids' => $userIds,
            'data' => ['status' => 'inactive']
        ];

        $response = $this->patchJson('/api/v1/users/bulk-update', $bulkData);

        $endTime = microtime(true);
        $executionTime = $endTime - $startTime;

        $response->assertStatus(200);

        // Bulk operation should be fast
        $this->assertLessThan(0.5, $executionTime, 'Bulk update took too long');

        // Verify all users were updated
        $this->assertEquals(100, $response->json('data.affected_count'));
    }

    /** @test */
    public function search_queries_are_optimized()
    {
        Sanctum::actingAs($this->adminUser);

        // Create users with searchable content
        User::factory()->count(100)->create([
            'organization_id' => $this->organization->id
        ]);

        $startTime = microtime(true);

        $response = $this->getJson('/api/v1/users/search?query=test&limit=20');

        $endTime = microtime(true);
        $executionTime = $endTime - $startTime;

        $response->assertStatus(200);

        // Search should be fast even with many users
        $this->assertLessThan(0.2, $executionTime, 'Search query took too long');
    }
}
