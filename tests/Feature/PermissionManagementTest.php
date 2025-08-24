<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Organization;
use App\Models\Permission;
use App\Models\Role;
use App\Models\RolePermission;
use App\Services\PermissionManagementService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;

class PermissionManagementTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected User $user;
    protected Organization $organization;
    protected PermissionManagementService $permissionService;

    protected function setUp(): void
    {
        parent::setUp();

        // Create test organization
        $this->organization = Organization::factory()->create();

        // Create test user
        $this->user = User::factory()->create([
            'organization_id' => $this->organization->id,
            'role' => 'org_admin'
        ]);

        // Create permission service
        $this->permissionService = app(PermissionManagementService::class);
    }

    /** @test */
    public function it_can_create_permission()
    {
        $permissionData = [
            'name' => 'Test Permission',
            'code' => 'test_permission',
            'display_name' => 'Test Permission',
            'description' => 'A test permission',
            'resource' => 'test',
            'action' => 'read',
            'scope' => 'organization',
            'category' => 'testing'
        ];

        $permission = $this->permissionService->createPermission(
            $permissionData,
            $this->organization->id
        );

        $this->assertInstanceOf(Permission::class, $permission);
        $this->assertEquals('Test Permission', $permission->name);
        $this->assertEquals('test_permission', $permission->code);
        $this->assertEquals($this->organization->id, $permission->organization_id);
    }

    /** @test */
    public function it_can_update_permission()
    {
        // Create a permission first
        $permission = Permission::factory()->create([
            'organization_id' => $this->organization->id,
            'is_system_permission' => false
        ]);

        $updateData = [
            'display_name' => 'Updated Permission Name',
            'description' => 'Updated description'
        ];

        $updatedPermission = $this->permissionService->updatePermission(
            $permission->id,
            $updateData,
            $this->organization->id
        );

        $this->assertEquals('Updated Permission Name', $updatedPermission->display_name);
        $this->assertEquals('Updated description', $updatedPermission->description);
    }

    /** @test */
    public function it_cannot_update_system_permission()
    {
        // Create a system permission
        $permission = Permission::factory()->create([
            'organization_id' => $this->organization->id,
            'is_system_permission' => true
        ]);

        $this->expectException(\App\Exceptions\InvalidPermissionException::class);

        $this->permissionService->updatePermission(
            $permission->id,
            ['display_name' => 'Updated Name'],
            $this->organization->id
        );
    }

    /** @test */
    public function it_can_delete_permission()
    {
        // Create a permission first
        $permission = Permission::factory()->create([
            'organization_id' => $this->organization->id,
            'is_system_permission' => false
        ]);

        $deleted = $this->permissionService->deletePermission(
            $permission->id,
            $this->organization->id
        );

        $this->assertTrue($deleted);
        $this->assertDatabaseMissing('permissions', ['id' => $permission->id]);
    }

    /** @test */
    public function it_cannot_delete_system_permission()
    {
        // Create a system permission
        $permission = Permission::factory()->create([
            'organization_id' => $this->organization->id,
            'is_system_permission' => true
        ]);

        $this->expectException(\App\Exceptions\InvalidPermissionException::class);

        $this->permissionService->deletePermission(
            $permission->id,
            $this->organization->id
        );
    }

    /** @test */
    public function it_can_check_user_permission()
    {
        // Create a permission
        $permission = Permission::factory()->create([
            'organization_id' => $this->organization->id,
            'resource' => 'users',
            'action' => 'read'
        ]);

        // Create a role
        $role = Role::factory()->create([
            'organization_id' => $this->organization->id
        ]);

        // Assign permission to role
        RolePermission::create([
            'role_id' => $role->id,
            'permission_id' => $permission->id,
            'is_granted' => true
        ]);

        // Assign role to user
        $this->user->roles()->attach($role->id, [
            'is_active' => true,
            'organization_id' => $this->organization->id
        ]);

        // Check permission
        $hasPermission = $this->permissionService->userHasPermission(
            $this->user->id,
            $this->organization->id,
            'users',
            'read'
        );

        $this->assertTrue($hasPermission);
    }

    /** @test */
    public function it_returns_false_for_nonexistent_permission()
    {
        $hasPermission = $this->permissionService->userHasPermission(
            $this->user->id,
            $this->organization->id,
            'nonexistent',
            'read'
        );

        $this->assertFalse($hasPermission);
    }

    /** @test */
    public function it_can_assign_permissions_to_role()
    {
        // Create permissions
        $permission1 = Permission::factory()->create([
            'organization_id' => $this->organization->id
        ]);
        $permission2 = Permission::factory()->create([
            'organization_id' => $this->organization->id
        ]);

        // Create a role
        $role = Role::factory()->create([
            'organization_id' => $this->organization->id
        ]);

        // Assign permissions to role
        $success = $this->permissionService->assignPermissionsToRole(
            $role->id,
            [$permission1->id, $permission2->id],
            $this->organization->id,
            $this->user->id
        );

        $this->assertTrue($success);

        // Verify permissions were assigned
        $rolePermissions = $this->permissionService->getRolePermissions(
            $role->id,
            $this->organization->id
        );

        $this->assertEquals(2, $rolePermissions->count());
    }

    /** @test */
    public function it_can_remove_permissions_from_role()
    {
        // Create permissions
        $permission1 = Permission::factory()->create([
            'organization_id' => $this->organization->id
        ]);
        $permission2 = Permission::factory()->create([
            'organization_id' => $this->organization->id
        ]);

        // Create a role
        $role = Role::factory()->create([
            'organization_id' => $this->organization->id
        ]);

        // Assign permissions first
        $this->permissionService->assignPermissionsToRole(
            $role->id,
            [$permission1->id, $permission2->id],
            $this->organization->id
        );

        // Remove one permission
        $success = $this->permissionService->removePermissionsFromRole(
            $role->id,
            [$permission1->id],
            $this->organization->id
        );

        $this->assertTrue($success);

        // Verify permission was removed
        $rolePermissions = $this->permissionService->getRolePermissions(
            $role->id,
            $this->organization->id
        );

        $this->assertEquals(1, $rolePermissions->count());
    }

    /** @test */
    public function it_can_get_organization_permissions_with_filters()
    {
        // Create permissions with different categories
        Permission::factory()->create([
            'organization_id' => $this->organization->id,
            'category' => 'user_management'
        ]);
        Permission::factory()->create([
            'organization_id' => $this->organization->id,
            'category' => 'content_management'
        ]);

        // Get permissions filtered by category
        $permissions = $this->permissionService->getOrganizationPermissions(
            $this->organization->id,
            ['category' => 'user_management']
        );

        $this->assertEquals(1, $permissions->count());
        $this->assertEquals('user_management', $permissions->first()->category);
    }

    /** @test */
    public function it_can_get_user_permissions()
    {
        // Create a permission
        $permission = Permission::factory()->create([
            'organization_id' => $this->organization->id
        ]);

        // Create a role
        $role = Role::factory()->create([
            'organization_id' => $this->organization->id
        ]);

        // Assign permission to role
        RolePermission::create([
            'role_id' => $role->id,
            'permission_id' => $permission->id,
            'is_granted' => true
        ]);

        // Assign role to user
        $this->user->roles()->attach($role->id, [
            'is_active' => true,
            'organization_id' => $this->organization->id
        ]);

        // Get user permissions
        $permissions = $this->permissionService->getUserPermissions(
            $this->user->id,
            $this->organization->id
        );

        $this->assertEquals(1, $permissions->count());
        $this->assertEquals($permission->id, $permissions->first()->id);
    }

    /** @test */
    public function it_can_check_user_has_any_permission()
    {
        // Create permissions
        $permission1 = Permission::factory()->create([
            'organization_id' => $this->organization->id,
            'resource' => 'users',
            'action' => 'read'
        ]);
        $permission2 = Permission::factory()->create([
            'organization_id' => $this->organization->id,
            'resource' => 'users',
            'action' => 'write'
        ]);

        // Create a role
        $role = Role::factory()->create([
            'organization_id' => $this->organization->id
        ]);

        // Assign only one permission to role
        RolePermission::create([
            'role_id' => $role->id,
            'permission_id' => $permission1->id,
            'is_granted' => true
        ]);

        // Assign role to user
        $this->user->roles()->attach($role->id, [
            'is_active' => true,
            'organization_id' => $this->organization->id
        ]);

        // Check if user has any of the permissions
        $hasAnyPermission = $this->permissionService->userHasAnyPermission(
            $this->user->id,
            $this->organization->id,
            [
                ['resource' => 'users', 'action' => 'read'],
                ['resource' => 'users', 'action' => 'write']
            ]
        );

        $this->assertTrue($hasAnyPermission);
    }

    /** @test */
    public function it_can_check_user_has_all_permissions()
    {
        // Create permissions
        $permission1 = Permission::factory()->create([
            'organization_id' => $this->organization->id,
            'resource' => 'users',
            'action' => 'read'
        ]);
        $permission2 = Permission::factory()->create([
            'organization_id' => $this->organization->id,
            'resource' => 'users',
            'action' => 'write'
        ]);

        // Create a role
        $role = Role::factory()->create([
            'organization_id' => $this->organization->id
        ]);

        // Assign both permissions to role
        RolePermission::create([
            'role_id' => $role->id,
            'permission_id' => $permission1->id,
            'is_granted' => true
        ]);
        RolePermission::create([
            'role_id' => $role->id,
            'permission_id' => $permission2->id,
            'is_granted' => true
        ]);

        // Assign role to user
        $this->user->roles()->attach($role->id, [
            'is_active' => true,
            'organization_id' => $this->organization->id
        ]);

        // Check if user has all permissions
        $hasAllPermissions = $this->permissionService->userHasAllPermissions(
            $this->user->id,
            $this->organization->id,
            [
                ['resource' => 'users', 'action' => 'read'],
                ['resource' => 'users', 'action' => 'write']
            ]
        );

        $this->assertTrue($hasAllPermissions);
    }

    /** @test */
    public function it_validates_permission_data()
    {
        $this->expectException(\App\Exceptions\InvalidPermissionException::class);

        // Try to create permission with invalid data
        $this->permissionService->createPermission([
            'name' => '', // Empty name should fail validation
            'code' => 'test',
            'resource' => 'test',
            'action' => 'read'
        ], $this->organization->id);
    }

    /** @test */
    public function it_prevents_duplicate_permission_codes()
    {
        // Create first permission
        $this->permissionService->createPermission([
            'name' => 'First Permission',
            'code' => 'test_permission',
            'resource' => 'test',
            'action' => 'read'
        ], $this->organization->id);

        // Try to create second permission with same code
        $this->expectException(\App\Exceptions\InvalidPermissionException::class);

        $this->permissionService->createPermission([
            'name' => 'Second Permission',
            'code' => 'test_permission', // Same code should fail
            'resource' => 'test',
            'action' => 'write'
        ], $this->organization->id);
    }
}
