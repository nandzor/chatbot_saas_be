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

class UserManagementResponseTest extends TestCase
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
    // RESPONSE STRUCTURE TESTS
    // ========================================================================

    /** @test */
    public function all_responses_follow_consistent_structure()
    {
        Sanctum::actingAs($this->adminUser);

        // Test user listing response structure
        $response = $this->getJson('/api/v1/users');
        $response->assertJsonStructure([
            'success',
            'message',
            'data' => [
                'data' => [
                    '*' => [
                        'id', 'full_name', 'email', 'username', 'role', 'status',
                        'is_email_verified', 'created_at', 'updated_at'
                    ]
                ],
                'current_page',
                'per_page',
                'total',
                'last_page',
                'from',
                'to'
            ]
        ]);

        // Test user creation response structure
        $userData = [
            'full_name' => 'Response Test User',
            'email' => 'response@example.com',
            'username' => 'responsetest',
            'password_hash' => Hash::make('password123'),
            'role' => 'customer',
            'organization_id' => $this->organization->id
        ];

        $response = $this->postJson('/api/v1/users', $userData);
        $response->assertJsonStructure([
            'success',
            'message',
            'data' => [
                'id', 'full_name', 'email', 'username', 'role', 'status',
                'is_email_verified', 'created_at', 'updated_at'
            ]
        ]);

        // Test user update response structure
        $userId = $response->json('data.id');
        $updateResponse = $this->putJson("/api/v1/users/{$userId}", [
            'full_name' => 'Updated Response User'
        ]);

        $updateResponse->assertJsonStructure([
            'success',
            'message',
            'data' => [
                'id', 'full_name', 'email', 'username', 'role', 'status',
                'is_email_verified', 'created_at', 'updated_at'
            ]
        ]);
    }

    /** @test */
    public function success_responses_have_correct_format()
    {
        Sanctum::actingAs($this->adminUser);

        $response = $this->getJson('/api/v1/users');

        $response->assertStatus(200)
                ->assertJson([
                    'success' => true,
                    'message' => 'Users retrieved successfully'
                ]);

        $this->assertIsBool($response->json('success'));
        $this->assertIsString($response->json('message'));
        $this->assertArrayHasKey('data', $response->json());
    }

    /** @test */
    public function error_responses_have_correct_format()
    {
        Sanctum::actingAs($this->adminUser);

        // Test 404 response
        $response = $this->getJson('/api/v1/users/999999');
        $response->assertStatus(404)
                ->assertJsonStructure([
                    'success',
                    'message',
                    'error'
                ]);

        $this->assertFalse($response->json('success'));
        $this->assertIsString($response->json('message'));
        $this->assertIsString($response->json('error'));
    }

    /** @test */
    public function validation_error_responses_have_correct_format()
    {
        Sanctum::actingAs($this->adminUser);

        $response = $this->postJson('/api/v1/users', []);

        $response->assertStatus(422)
                ->assertJsonStructure([
                    'success',
                    'message',
                    'errors'
                ]);

        $this->assertFalse($response->json('success'));
        $this->assertIsString($response->json('message'));
        $this->assertIsArray($response->json('errors'));
    }

    // ========================================================================
    // RESPONSE CONTENT TESTS
    // ========================================================================

    /** @test */
    public function user_listing_includes_all_required_fields()
    {
        Sanctum::actingAs($this->adminUser);

        // Create test user
        User::factory()->create([
            'organization_id' => $this->organization->id,
            'full_name' => 'Test User',
            'email' => 'testuser@example.com',
            'username' => 'testuser',
            'role' => 'agent',
            'status' => 'active'
        ]);

        $response = $this->getJson('/api/v1/users');

        $response->assertStatus(200);

        $users = $response->json('data.data');
        $this->assertNotEmpty($users);

        $testUser = collect($users)->firstWhere('email', 'testuser@example.com');
        $this->assertNotNull($testUser);

        // Verify all required fields are present
        $requiredFields = [
            'id', 'full_name', 'email', 'username', 'role', 'status',
            'is_email_verified', 'created_at', 'updated_at'
        ];

        foreach ($requiredFields as $field) {
            $this->assertArrayHasKey($field, $testUser, "Missing field: {$field}");
        }

        // Verify field types
        $this->assertIsString($testUser['id']);
        $this->assertIsString($testUser['full_name']);
        $this->assertIsString($testUser['email']);
        $this->assertIsString($testUser['username']);
        $this->assertIsString($testUser['role']);
        $this->assertIsString($testUser['status']);
        $this->assertIsBool($testUser['is_email_verified']);
        $this->assertIsString($testUser['created_at']);
        $this->assertIsString($testUser['updated_at']);
    }

    /** @test */
    public function user_creation_response_includes_created_user_data()
    {
        Sanctum::actingAs($this->adminUser);

        $userData = [
            'full_name' => 'Created User',
            'email' => 'created@example.com',
            'username' => 'createduser',
            'password_hash' => Hash::make('password123'),
            'role' => 'customer',
            'organization_id' => $this->organization->id,
            'is_email_verified' => true,
            'status' => 'active'
        ];

        $response = $this->postJson('/api/v1/users', $userData);

        $response->assertStatus(201);

        $createdUser = $response->json('data');
        
        // Verify all submitted data is returned
        $this->assertEquals('Created User', $createdUser['full_name']);
        $this->assertEquals('created@example.com', $createdUser['email']);
        $this->assertEquals('createduser', $createdUser['username']);
        $this->assertEquals('customer', $createdUser['role']);
        $this->assertEquals('active', $createdUser['status']);
        $this->assertTrue($createdUser['is_email_verified']);

        // Verify generated fields
        $this->assertNotEmpty($createdUser['id']);
        $this->assertNotEmpty($createdUser['created_at']);
        $this->assertNotEmpty($createdUser['updated_at']);
    }

    /** @test */
    public function user_update_response_includes_updated_user_data()
    {
        Sanctum::actingAs($this->adminUser);

        $user = User::factory()->create([
            'organization_id' => $this->organization->id,
            'full_name' => 'Original Name',
            'email' => 'original@example.com'
        ]);

        $updateData = [
            'full_name' => 'Updated Name',
            'email' => 'updated@example.com',
            'role' => 'agent'
        ];

        $response = $this->putJson("/api/v1/users/{$user->id}", $updateData);

        $response->assertStatus(200);

        $updatedUser = $response->json('data');
        
        // Verify updated fields
        $this->assertEquals('Updated Name', $updatedUser['full_name']);
        $this->assertEquals('updated@example.com', $updatedUser['email']);
        $this->assertEquals('agent', $updatedUser['role']);

        // Verify unchanged fields
        $this->assertEquals($user->username, $updatedUser['username']);
        $this->assertEquals($user->organization_id, $updatedUser['organization_id']);
    }

    // ========================================================================
    // PAGINATION RESPONSE TESTS
    // ========================================================================

    /** @test */
    public function pagination_response_has_correct_structure()
    {
        Sanctum::actingAs($this->adminUser);

        // Create multiple users
        User::factory()->count(25)->create([
            'organization_id' => $this->organization->id
        ]);

        $response = $this->getJson('/api/v1/users?page=1&per_page=10');

        $response->assertStatus(200);

        $pagination = $response->json('data');
        
        // Verify pagination structure
        $this->assertArrayHasKey('current_page', $pagination);
        $this->assertArrayHasKey('per_page', $pagination);
        $this->assertArrayHasKey('total', $pagination);
        $this->assertArrayHasKey('last_page', $pagination);
        $this->assertArrayHasKey('from', $pagination);
        $this->assertArrayHasKey('to', $pagination);
        $this->assertArrayHasKey('data', $pagination);

        // Verify pagination values
        $this->assertEquals(1, $pagination['current_page']);
        $this->assertEquals(10, $pagination['per_page']);
        $this->assertEquals(26, $pagination['total']); // 25 + admin user
        $this->assertEquals(3, $pagination['last_page']);
        $this->assertEquals(1, $pagination['from']);
        $this->assertEquals(10, $pagination['to']);
        $this->assertCount(10, $pagination['data']);
    }

    /** @test */
    public function pagination_parameters_work_correctly()
    {
        Sanctum::actingAs($this->adminUser);

        // Create multiple users
        User::factory()->count(30)->create([
            'organization_id' => $this->organization->id
        ]);

        // Test first page
        $response1 = $this->getJson('/api/v1/users?page=1&per_page=15');
        $response1->assertStatus(200);
        $this->assertEquals(1, $response1->json('data.current_page'));
        $this->assertEquals(15, $response1->json('data.per_page'));
        $this->assertCount(15, $response1->json('data.data'));

        // Test second page
        $response2 = $this->getJson('/api/v1/users?page=2&per_page=15');
        $response2->assertStatus(200);
        $this->assertEquals(2, $response2->json('data.current_page'));
        $this->assertEquals(15, $response2->json('data.per_page'));
        $this->assertCount(16, $response2->json('data.data')); // 15 + admin user

        // Test custom per_page
        $response3 = $this->getJson('/api/v1/users?page=1&per_page=5');
        $response3->assertStatus(200);
        $this->assertEquals(5, $response3->json('data.per_page'));
        $this->assertCount(5, $response3->json('data.data'));
    }

    // ========================================================================
    // SEARCH RESPONSE TESTS
    // ========================================================================

    /** @test */
    public function search_response_has_correct_structure()
    {
        Sanctum::actingAs($this->adminUser);

        // Create test users
        User::factory()->create([
            'full_name' => 'John Developer',
            'email' => 'john@example.com',
            'organization_id' => $this->organization->id
        ]);

        $response = $this->getJson('/api/v1/users/search?query=Developer');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'message',
                    'data' => [
                        '*' => [
                            'id', 'full_name', 'email', 'username', 'role', 'status'
                        ]
                    ]
                ]);

        $this->assertTrue($response->json('success'));
        $this->assertEquals('Users search completed successfully', $response->json('message'));
    }

    /** @test */
    public function search_response_includes_relevant_results()
    {
        Sanctum::actingAs($this->adminUser);

        // Create test users
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

        // Search for "Developer"
        $response = $this->getJson('/api/v1/users/search?query=Developer');

        $response->assertStatus(200);
        $results = $response->json('data');

        $this->assertCount(1, $results);
        $this->assertEquals('John Developer', $results[0]['full_name']);

        // Search for "Designer"
        $response = $this->getJson('/api/v1/users/search?query=Designer');

        $response->assertStatus(200);
        $results = $response->json('data');

        $this->assertCount(1, $results);
        $this->assertEquals('Jane Designer', $results[0]['full_name']);
    }

    // ========================================================================
    // STATISTICS RESPONSE TESTS
    // ========================================================================

    /** @test */
    public function statistics_response_has_correct_structure()
    {
        Sanctum::actingAs($this->adminUser);

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

        $this->assertTrue($response->json('success'));
        $this->assertEquals('User statistics retrieved successfully', $response->json('message'));
    }

    /** @test */
    public function statistics_response_includes_correct_counts()
    {
        Sanctum::actingAs($this->adminUser);

        // Create users with different statuses
        User::factory()->count(3)->create([
            'status' => 'active',
            'is_email_verified' => true,
            'organization_id' => $this->organization->id
        ]);

        User::factory()->count(2)->create([
            'status' => 'inactive',
            'is_email_verified' => true,
            'organization_id' => $this->organization->id
        ]);

        User::factory()->count(1)->create([
            'status' => 'active',
            'is_email_verified' => false,
            'organization_id' => $this->organization->id
        ]);

        $response = $this->getJson('/api/v1/users/statistics');

        $response->assertStatus(200);

        $stats = $response->json('data');
        
        // Verify counts (including admin user)
        $this->assertEquals(7, $stats['total_users']); // 3 + 2 + 1 + admin
        $this->assertEquals(4, $stats['active_users']); // 3 + 1 + admin
        $this->assertEquals(5, $stats['verified_users']); // 3 + 2 + admin
        $this->assertEquals(2, $stats['inactive_users']); // 2
        $this->assertEquals(1, $stats['unverified_users']); // 1
    }

    // ========================================================================
    // BULK OPERATIONS RESPONSE TESTS
    // ========================================================================

    /** @test */
    public function bulk_update_response_has_correct_structure()
    {
        Sanctum::actingAs($this->adminUser);

        // Create test users
        $users = User::factory()->count(3)->create([
            'organization_id' => $this->organization->id
        ]);

        $userIds = $users->pluck('id')->toArray();

        $bulkData = [
            'user_ids' => $userIds,
            'data' => ['status' => 'inactive']
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

        $this->assertTrue($response->json('success'));
        $this->assertEquals('Users updated successfully', $response->json('message'));
        $this->assertEquals(3, $response->json('data.affected_count'));
    }

    // ========================================================================
    // ERROR RESPONSE TESTS
    // ========================================================================

    /** @test */
    public function not_found_responses_have_correct_format()
    {
        Sanctum::actingAs($this->adminUser);

        $response = $this->getJson('/api/v1/users/999999');

        $response->assertStatus(404)
                ->assertJson([
                    'success' => false,
                    'message' => 'User not found',
                    'error' => 'The requested user could not be found'
                ]);
    }

    /** @test */
    public function forbidden_responses_have_correct_format()
    {
        // Create user without permissions
        $regularUser = User::factory()->create([
            'organization_id' => $this->organization->id,
            'permissions' => [] // No permissions
        ]);

        Sanctum::actingAs($regularUser);

        $response = $this->postJson('/api/v1/users', []);

        $response->assertStatus(403)
                ->assertJson([
                    'success' => false
                ]);
    }

    /** @test */
    public function validation_error_responses_include_field_errors()
    {
        Sanctum::actingAs($this->adminUser);

        $response = $this->postJson('/api/v1/users', [
            'email' => 'not-an-email',
            'full_name' => '',
            'username' => 'a'
        ]);

        $response->assertStatus(422)
                ->assertJson([
                    'success' => false
                ]);

        $errors = $response->json('errors');
        
        $this->assertArrayHasKey('email', $errors);
        $this->assertArrayHasKey('full_name', $errors);
        $this->assertArrayHasKey('username', $errors);
    }

    // ========================================================================
    // RESPONSE CONSISTENCY TESTS
    // ========================================================================

    /** @test */
    public function response_messages_are_consistent()
    {
        Sanctum::actingAs($this->adminUser);

        // Test user listing
        $response = $this->getJson('/api/v1/users');
        $this->assertEquals('Users retrieved successfully', $response->json('message'));

        // Test user creation
        $userData = [
            'full_name' => 'Consistency Test User',
            'email' => 'consistency@example.com',
            'username' => 'consistency',
            'password_hash' => Hash::make('password123'),
            'role' => 'customer',
            'organization_id' => $this->organization->id
        ];

        $response = $this->postJson('/api/v1/users', $userData);
        $this->assertEquals('User created successfully', $response->json('message'));

        // Test user update
        $userId = $response->json('data.id');
        $response = $this->putJson("/api/v1/users/{$userId}", [
            'full_name' => 'Updated Consistency User'
        ]);
        $this->assertEquals('User updated successfully', $response->json('message'));

        // Test user deletion
        $response = $this->deleteJson("/api/v1/users/{$userId}");
        $this->assertEquals('User deleted successfully', $response->json('message'));
    }

    /** @test */
    public function response_status_codes_are_consistent()
    {
        Sanctum::actingAs($this->adminUser);

        // Test user listing (200)
        $response = $this->getJson('/api/v1/users');
        $response->assertStatus(200);

        // Test user creation (201)
        $userData = [
            'full_name' => 'Status Test User',
            'email' => 'status@example.com',
            'username' => 'statustest',
            'password_hash' => Hash::make('password123'),
            'role' => 'customer',
            'organization_id' => $this->organization->id
        ];

        $response = $this->postJson('/api/v1/users', $userData);
        $response->assertStatus(201);

        // Test user update (200)
        $userId = $response->json('data.id');
        $response = $this->putJson("/api/v1/users/{$userId}", [
            'full_name' => 'Updated Status User'
        ]);
        $response->assertStatus(200);

        // Test user deletion (200)
        $response = $this->deleteJson("/api/v1/users/{$userId}");
        $response->assertStatus(200);
    }
}
