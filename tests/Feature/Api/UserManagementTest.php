<?php

namespace Tests\Feature\Api;

use Tests\TestCase;
use App\Models\User;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;

class UserManagementTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected User $user;
    protected Role $adminRole;

    protected function setUp(): void
    {
        parent::setUp();

        $this->adminRole = Role::create(['name' => 'admin']);
        $this->user = User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'role' => 'admin'
        ]);
    }

    public function test_can_access_users_endpoint()
    {
        $response = $this->get('/api/v1/users');

        // Should return 401 (unauthorized) since no auth
        $response->assertStatus(401);
    }

    public function test_users_endpoint_exists()
    {
        $response = $this->get('/api/v1/users');

        // Endpoint exists but requires authentication
        $this->assertTrue($response->status() === 401 || $response->status() === 200);
    }
}
