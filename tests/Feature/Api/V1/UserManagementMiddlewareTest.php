<?php

namespace Tests\Feature\Api\V1;

use App\Models\User;
use App\Models\Organization;
use App\Models\Role;
use App\Models\Permission;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;
use Laravel\Sanctum\Sanctum;

class UserManagementMiddlewareTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected User $adminUser;
    protected User $regularUser;
    protected User $viewOnlyUser;
    protected Organization $organization;
    protected Organization $otherOrganization;

    protected function setUp(): void
    {
        parent::setUp();

        $this->organization = Organization::factory()->create([
            'name' => 'Test Organization',
            'status' => 'active'
        ]);

        $this->otherOrganization = Organization::factory()->create([
            'name' => 'Other Organization',
            'status' => 'active'
        ]);

        // Create permissions
        Permission::factory()->create(['code' => 'users.view', 'name' => 'View Users']);
        Permission::factory()->create(['code' => 'users.create', 'name' => 'Create Users']);
        Permission::factory()->create(['code' => 'users.update', 'name' => 'Update Users']);
        Permission::factory()->create(['code' => 'users.delete', 'name' => 'Delete Users']);
        Permission::factory()->create(['code' => 'users.restore', 'name' => 'Restore Users']);
        Permission::factory()->create(['code' => 'users.bulk_update', 'name' => 'Bulk Update Users']);

        // Create admin user with all permissions
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

        // Create regular user with limited permissions
        $this->regularUser = User::factory()->create([
            'organization_id' => $this->organization->id,
            'role' => 'agent',
            'is_email_verified' => true,
            'status' => 'active',
            'permissions' => ['users.view', 'users.update']
        ]);

        // Create view-only user
        $this->viewOnlyUser = User::factory()->create([
            'organization_id' => $this->organization->id,
            'role' => 'viewer',
            'is_email_verified' => true,
            'status' => 'active',
            'permissions' => ['users.view']
        ]);
    }

    // ========================================================================
    // AUTHENTICATION MIDDLEWARE TESTS
    // ========================================================================

    /** @test */
    public function unauthenticated_requests_are_rejected()
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
    public function authenticated_users_can_access_protected_endpoints()
    {
        Sanctum::actingAs($this->adminUser);

        $response = $this->getJson('/api/v1/users');
        $response->assertStatus(200);
    }

    // ========================================================================
    // PERMISSION MIDDLEWARE TESTS
    // ========================================================================

    /** @test */
    public function users_without_permissions_cannot_access_protected_endpoints()
    {
        // Create user with no permissions
        $noPermissionUser = User::factory()->create([
            'organization_id' => $this->organization->id,
            'permissions' => []
        ]);

        Sanctum::actingAs($noPermissionUser);

        // Should not be able to access any user management endpoints
        $response = $this->getJson('/api/v1/users');
        $response->assertStatus(403);

        $response = $this->postJson('/api/v1/users', []);
        $response->assertStatus(403);

        $response = $this->getJson('/api/v1/users/1');
        $response->assertStatus(403);
    }

    /** @test */
    public function users_with_view_permission_can_only_view()
    {
        Sanctum::actingAs($this->viewOnlyUser);

        // Can view users
        $response = $this->getJson('/api/v1/users');
        $response->assertStatus(200);

        $response = $this->getJson('/api/v1/users/statistics');
        $response->assertStatus(200);

        $response = $this->getJson('/api/v1/users/search?query=test');
        $response->assertStatus(200);

        // Cannot create users
        $response = $this->postJson('/api/v1/users', []);
        $response->assertStatus(403);

        // Cannot update users
        $response = $this->putJson('/api/v1/users/1', []);
        $response->assertStatus(403);

        // Cannot delete users
        $response = $this->deleteJson('/api/v1/users/1');
        $response->assertStatus(403);

        // Cannot bulk update
        $response = $this->patchJson('/api/v1/users/bulk-update', []);
        $response->assertStatus(403);
    }

    /** @test */
    public function users_with_update_permission_can_update_but_not_delete()
    {
        Sanctum::actingAs($this->regularUser);

        // Can view users
        $response = $this->getJson('/api/v1/users');
        $response->assertStatus(200);

        // Can update users
        $user = User::factory()->create([
            'organization_id' => $this->organization->id
        ]);

        $response = $this->putJson("/api/v1/users/{$user->id}", [
            'full_name' => 'Updated Name'
        ]);
        $response->assertStatus(200);

        // Cannot delete users
        $response = $this->deleteJson("/api/v1/users/{$user->id}");
        $response->assertStatus(403);

        // Cannot bulk update
        $response = $this->patchJson('/api/v1/users/bulk-update', []);
        $response->assertStatus(403);
    }

    /** @test */
    public function admin_users_with_all_permissions_can_access_everything()
    {
        Sanctum::actingAs($this->adminUser);

        // Can view users
        $response = $this->getJson('/api/v1/users');
        $response->assertStatus(200);

        // Can create users
        $userData = [
            'full_name' => 'Admin Test User',
            'email' => 'admintest@example.com',
            'username' => 'admintest',
            'password_hash' => Hash::make('password123'),
            'role' => 'customer',
            'organization_id' => $this->organization->id
        ];

        $response = $this->postJson('/api/v1/users', $userData);
        $response->assertStatus(201);

        // Can update users
        $userId = $response->json('data.id');
        $response = $this->putJson("/api/v1/users/{$userId}", [
            'full_name' => 'Updated Admin Test User'
        ]);
        $response->assertStatus(200);

        // Can delete users
        $response = $this->deleteJson("/api/v1/users/{$userId}");
        $response->assertStatus(200);

        // Can bulk update
        $users = User::factory()->count(3)->create([
            'organization_id' => $this->organization->id
        ]);

        $userIds = $users->pluck('id')->toArray();
        $response = $this->patchJson('/api/v1/users/bulk-update', [
            'user_ids' => $userIds,
            'data' => ['status' => 'inactive']
        ]);
        $response->assertStatus(200);
    }

    // ========================================================================
    // ORGANIZATION MIDDLEWARE TESTS
    // ========================================================================

    /** @test */
    public function users_cannot_access_data_from_other_organizations()
    {
        Sanctum::actingAs($this->adminUser);

        // Create user in other organization
        $otherOrgUser = User::factory()->create([
            'organization_id' => $this->otherOrganization->id
        ]);

        // Should not be able to view user from other organization
        $response = $this->getJson("/api/v1/users/{$otherOrgUser->id}");
        $response->assertStatus(404);

        // Should not be able to update user from other organization
        $response = $this->putJson("/api/v1/users/{$otherOrgUser->id}", [
            'full_name' => 'Updated Name'
        ]);
        $response->assertStatus(404);

        // Should not be able to delete user from other organization
        $response = $this->deleteJson("/api/v1/users/{$otherOrgUser->id}");
        $response->assertStatus(404);
    }

    /** @test */
    public function users_can_only_see_users_from_their_organization()
    {
        Sanctum::actingAs($this->adminUser);

        // Create users in both organizations
        User::factory()->count(3)->create([
            'organization_id' => $this->organization->id
        ]);

        User::factory()->count(2)->create([
            'organization_id' => $this->otherOrganization->id
        ]);

        $response = $this->getJson('/api/v1/users');

        $response->assertStatus(200);
        $users = $response->json('data.data');

        // Should only see users from their organization (3 + admin = 4)
        $this->assertCount(4, $users);

        // Verify all users belong to the same organization
        foreach ($users as $user) {
            $this->assertEquals($this->organization->id, $user['organization_id']);
        }
    }

    /** @test */
    public function organization_isolation_works_for_search()
    {
        Sanctum::actingAs($this->adminUser);

        // Create users with similar names in different organizations
        User::factory()->create([
            'full_name' => 'John Developer',
            'organization_id' => $this->organization->id
        ]);

        User::factory()->create([
            'full_name' => 'John Developer',
            'organization_id' => $this->otherOrganization->id
        ]);

        $response = $this->getJson('/api/v1/users/search?query=John');

        $response->assertStatus(200);
        $results = $response->json('data');

        // Should only see results from their organization
        $this->assertCount(1, $results);
        $this->assertEquals($this->organization->id, $results[0]['organization_id']);
    }

    /** @test */
    public function organization_isolation_works_for_statistics()
    {
        Sanctum::actingAs($this->adminUser);

        // Create users in both organizations
        User::factory()->count(5)->create([
            'organization_id' => $this->organization->id
        ]);

        User::factory()->count(10)->create([
            'organization_id' => $this->otherOrganization->id
        ]);

        $response = $this->getJson('/api/v1/users/statistics');

        $response->assertStatus(200);
        $stats = $response->json('data');

        // Should only count users from their organization (5 + admin = 6)
        $this->assertEquals(6, $stats['total_users']);
    }

    // ========================================================================
    // ROLE-BASED ACCESS CONTROL TESTS
    // ========================================================================

    /** @test */
    public function super_admin_has_access_to_all_organizations()
    {
        // Create super admin user
        $superAdmin = User::factory()->create([
            'organization_id' => null, // Global access
            'role' => 'super_admin',
            'permissions' => [
                'users.view', 'users.create', 'users.update',
                'users.delete', 'users.restore', 'users.bulk_update'
            ]
        ]);

        Sanctum::actingAs($superAdmin);

        // Create users in different organizations
        User::factory()->create([
            'organization_id' => $this->organization->id
        ]);

        User::factory()->create([
            'organization_id' => $this->otherOrganization->id
        ]);

        $response = $this->getJson('/api/v1/users');

        $response->assertStatus(200);
        $users = $response->json('data.data');

        // Super admin should see users from all organizations
        $this->assertGreaterThan(1, count($users));
    }

    /** @test */
    public function org_admin_has_access_only_to_their_organization()
    {
        Sanctum::actingAs($this->adminUser);

        // Create users in different organizations
        User::factory()->create([
            'organization_id' => $this->organization->id
        ]);

        User::factory()->create([
            'organization_id' => $this->otherOrganization->id
        ]);

        $response = $this->getJson('/api/v1/users');

        $response->assertStatus(200);
        $users = $response->json('data.data');

        // Org admin should only see users from their organization
        foreach ($users as $user) {
            $this->assertEquals($this->organization->id, $user['organization_id']);
        }
    }

    // ========================================================================
    // PERMISSION COMBINATION TESTS
    // ========================================================================

    /** @test */
    public function multiple_permissions_work_correctly()
    {
        // Create user with multiple specific permissions
        $multiPermissionUser = User::factory()->create([
            'organization_id' => $this->organization->id,
            'permissions' => ['users.view', 'users.create', 'users.delete']
        ]);

        Sanctum::actingAs($multiPermissionUser);

        // Can view users
        $response = $this->getJson('/api/v1/users');
        $response->assertStatus(200);

        // Can create users
        $userData = [
            'full_name' => 'Multi Permission User',
            'email' => 'multipermission@example.com',
            'username' => 'multipermission',
            'password_hash' => Hash::make('password123'),
            'role' => 'customer',
            'organization_id' => $this->organization->id
        ];

        $response = $this->postJson('/api/v1/users', $userData);
        $response->assertStatus(201);

        // Can delete users
        $userId = $response->json('data.id');
        $response = $this->deleteJson("/api/v1/users/{$userId}");
        $response->assertStatus(200);

        // Cannot update users (no update permission)
        $user = User::factory()->create([
            'organization_id' => $this->organization->id
        ]);

        $response = $this->putJson("/api/v1/users/{$user->id}", [
            'full_name' => 'Updated Name'
        ]);
        $response->assertStatus(403);
    }

    // ========================================================================
    // EDGE CASE PERMISSION TESTS
    // ========================================================================

    /** @test */
    public function users_without_organization_cannot_access_user_management()
    {
        // Create user without organization
        $noOrgUser = User::factory()->create([
            'organization_id' => null,
            'permissions' => ['users.view']
        ]);

        Sanctum::actingAs($noOrgUser);

        $response = $this->getJson('/api/v1/users');
        $response->assertStatus(403);
    }

    /** @test */
    public function inactive_users_cannot_access_user_management()
    {
        // Create inactive user
        $inactiveUser = User::factory()->create([
            'organization_id' => $this->organization->id,
            'status' => 'inactive',
            'permissions' => ['users.view']
        ]);

        Sanctum::actingAs($inactiveUser);

        $response = $this->getJson('/api/v1/users');
        $response->assertStatus(403);
    }

    /** @test */
    public function unverified_users_cannot_access_user_management()
    {
        // Create unverified user
        $unverifiedUser = User::factory()->create([
            'organization_id' => $this->organization->id,
            'is_email_verified' => false,
            'permissions' => ['users.view']
        ]);

        Sanctum::actingAs($unverifiedUser);

        $response = $this->getJson('/api/v1/users');
        $response->assertStatus(403);
    }

    // ========================================================================
    // MIDDLEWARE CHAINING TESTS
    // ========================================================================

    /** @test */
    public function middleware_chain_works_correctly()
    {
        // Test that all middleware in the chain work together
        Sanctum::actingAs($this->adminUser);

        // This should pass through:
        // 1. unified.auth (authentication)
        // 2. permission:users.view (permission check)
        // 3. organization (organization isolation)

        $response = $this->getJson('/api/v1/users');
        $response->assertStatus(200);
    }

    /** @test */
    public function middleware_failures_are_handled_correctly()
    {
        // Test authentication failure
        $response = $this->getJson('/api/v1/users');
        $response->assertStatus(401);

        // Test permission failure
        $noPermissionUser = User::factory()->create([
            'organization_id' => $this->organization->id,
            'permissions' => []
        ]);

        Sanctum::actingAs($noPermissionUser);
        $response = $this->getJson('/api/v1/users');
        $response->assertStatus(403);
    }

    // ========================================================================
    // PERMISSION INHERITANCE TESTS
    // ========================================================================

    /** @test */
    public function role_based_permissions_work_correctly()
    {
        // Create role with permissions
        $role = Role::factory()->create([
            'name' => 'user_manager',
            'organization_id' => $this->organization->id,
            'permissions' => ['users.view', 'users.create', 'users.update']
        ]);

        // Create user with that role
        $roleUser = User::factory()->create([
            'organization_id' => $this->organization->id,
            'role' => 'user_manager',
            'permissions' => [] // No direct permissions, only role-based
        ]);

        Sanctum::actingAs($roleUser);

        // Should be able to access based on role permissions
        $response = $this->getJson('/api/v1/users');
        $response->assertStatus(200);

        // Should be able to create users
        $userData = [
            'full_name' => 'Role Permission User',
            'email' => 'rolepermission@example.com',
            'username' => 'rolepermission',
            'password_hash' => Hash::make('password123'),
            'role' => 'customer',
            'organization_id' => $this->organization->id
        ];

        $response = $this->postJson('/api/v1/users', $userData);
        $response->assertStatus(201);
    }
}
