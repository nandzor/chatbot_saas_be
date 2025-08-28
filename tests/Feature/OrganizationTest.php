<?php

namespace Tests\Feature;

use App\Models\Organization;
use App\Models\User;
use App\Models\SubscriptionPlan;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class OrganizationTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected User $user;
    protected Organization $organization;

    protected function setUp(): void
    {
        parent::setUp();

        // Create organization
        $this->organization = Organization::factory()->create();

        // Create user with admin permissions
        $this->user = User::factory()->create([
            'organization_id' => $this->organization->id,
            'role' => 'admin'
        ]);
    }

    /** @test */
    public function it_can_list_all_organizations()
    {
        Organization::factory()->count(3)->create();

        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/organizations');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    '*' => [
                        'id',
                        'org_code',
                        'name',
                        'email',
                        'business_type',
                        'industry',
                        'company_size',
                        'status',
                        'subscription_status',
                        'created_at',
                        'updated_at'
                    ]
                ],
                'meta' => [
                    'total',
                    'business_types',
                    'industries',
                    'company_sizes',
                    'subscription_statuses',
                    'active_organizations',
                    'trial_organizations',
                    'organizations_with_users'
                ]
            ]);
    }

    /** @test */
    public function it_can_list_active_organizations()
    {
        Organization::factory()->active()->count(2)->create();
        Organization::factory()->inactive()->count(1)->create();

        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/organizations/active');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    '*' => [
                        'id',
                        'org_code',
                        'name',
                        'status',
                        'subscription_status'
                    ]
                ]
            ]);

        $this->assertEquals(2, count($response->json('data')));
    }

    /** @test */
    public function it_can_list_trial_organizations()
    {
        Organization::factory()->trial()->count(2)->create();
        Organization::factory()->active()->count(1)->create();

        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/organizations/trial');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    '*' => [
                        'id',
                        'org_code',
                        'name',
                        'subscription_status'
                    ]
                ]
            ]);

        $this->assertEquals(2, count($response->json('data')));
    }

    /** @test */
    public function it_can_list_organizations_by_business_type()
    {
        Organization::factory()->startup()->count(2)->create();
        Organization::factory()->largeEnterprise()->count(1)->create();

        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/organizations/business-type/startup');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    '*' => [
                        'id',
                        'org_code',
                        'name',
                        'business_type'
                    ]
                ]
            ]);

        $this->assertEquals(2, count($response->json('data')));
    }

    /** @test */
    public function it_can_list_organizations_by_industry()
    {
        Organization::factory()->technology()->count(2)->create();
        Organization::factory()->healthcare()->count(1)->create();

        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/organizations/industry/technology');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    '*' => [
                        'id',
                        'org_code',
                        'name',
                        'industry'
                    ]
                ]
            ]);

        $this->assertEquals(2, count($response->json('data')));
    }

    /** @test */
    public function it_can_show_organization_details()
    {
        $organization = Organization::factory()->create();

        $response = $this->actingAs($this->user)
            ->getJson("/api/v1/organizations/{$organization->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'id',
                    'org_code',
                    'name',
                    'display_name',
                    'email',
                    'phone',
                    'address',
                    'business_type',
                    'industry',
                    'company_size',
                    'subscription' => [
                        'status',
                        'is_active',
                        'is_in_trial',
                        'has_trial_expired'
                    ],
                    'usage' => [
                        'current',
                        'limits'
                    ],
                    'configuration' => [
                        'theme',
                        'branding',
                        'feature_flags',
                        'ui_preferences',
                        'business_hours',
                        'contact_info',
                        'social_media',
                        'security_settings',
                        'settings'
                    ],
                    'api' => [
                        'enabled',
                        'webhook_url'
                    ],
                    'status',
                    'created_at',
                    'updated_at'
                ]
            ]);
    }

    /** @test */
    public function it_can_show_organization_by_code()
    {
        $organization = Organization::factory()->create();

        $response = $this->actingAs($this->user)
            ->getJson("/api/v1/organizations/code/{$organization->org_code}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'id',
                    'org_code',
                    'name',
                    'email'
                ]
            ]);
    }

    /** @test */
    public function it_can_create_organization()
    {
        $subscriptionPlan = SubscriptionPlan::factory()->create();

        $organizationData = [
            'name' => 'Test Organization',
            'display_name' => 'Test Org',
            'email' => 'test@organization.com',
            'phone' => '+62-21-1234-5678',
            'address' => 'Jl. Test No. 123, Jakarta',
            'business_type' => 'technology',
            'industry' => 'technology',
            'company_size' => '11-50',
            'subscription_plan_id' => $subscriptionPlan->id,
            'subscription_status' => 'trial',
            'currency' => 'IDR',
            'timezone' => 'Asia/Jakarta',
            'locale' => 'id'
        ];

        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/organizations', $organizationData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'id',
                    'org_code',
                    'name',
                    'email',
                    'business_type',
                    'industry',
                    'subscription_status'
                ]
            ]);

        $this->assertDatabaseHas('organizations', [
            'name' => 'Test Organization',
            'email' => 'test@organization.com',
            'business_type' => 'technology'
        ]);
    }

    /** @test */
    public function it_validates_required_fields_when_creating_organization()
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/organizations', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'email']);
    }

    /** @test */
    public function it_validates_unique_email_when_creating_organization()
    {
        $existingOrg = Organization::factory()->create();

        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/organizations', [
                'name' => 'Test Organization',
                'email' => $existingOrg->email
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    /** @test */
    public function it_can_update_organization()
    {
        $organization = Organization::factory()->create();

        $updateData = [
            'name' => 'Updated Organization',
            'display_name' => 'Updated Org',
            'phone' => '+62-21-9876-5432',
            'business_type' => 'healthcare',
            'industry' => 'healthcare'
        ];

        $response = $this->actingAs($this->user)
            ->putJson("/api/v1/organizations/{$organization->id}", $updateData);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'id',
                    'name',
                    'display_name',
                    'phone',
                    'business_type',
                    'industry'
                ]
            ]);

        $this->assertDatabaseHas('organizations', [
            'id' => $organization->id,
            'name' => 'Updated Organization',
            'business_type' => 'healthcare'
        ]);
    }

    /** @test */
    public function it_can_delete_organization()
    {
        $organization = Organization::factory()->create();

        $response = $this->actingAs($this->user)
            ->deleteJson("/api/v1/organizations/{$organization->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Organisasi berhasil dihapus'
            ]);

        $this->assertSoftDeleted('organizations', [
            'id' => $organization->id
        ]);
    }

    /** @test */
    public function it_cannot_delete_organization_with_users()
    {
        $organization = Organization::factory()->create();
        User::factory()->create(['organization_id' => $organization->id]);

        $response = $this->actingAs($this->user)
            ->deleteJson("/api/v1/organizations/{$organization->id}");

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Gagal menghapus organisasi: Cannot delete organization that has users'
            ]);
    }

    /** @test */
    public function it_can_get_organization_statistics()
    {
        Organization::factory()->active()->count(3)->create();
        Organization::factory()->trial()->count(2)->create();
        Organization::factory()->inactive()->count(1)->create();

        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/organizations/statistics');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'total_organizations',
                    'active_organizations',
                    'inactive_organizations',
                    'trial_organizations',
                    'expired_trial_organizations',
                    'organizations_with_users',
                    'organizations_without_users',
                    'business_type_stats',
                    'industry_stats',
                    'company_size_stats',
                    'subscription_status_stats'
                ]
            ]);

        $data = $response->json('data');
        $this->assertEquals(6, $data['total_organizations']);
        $this->assertEquals(3, $data['active_organizations']);
        $this->assertEquals(2, $data['trial_organizations']);
    }

    /** @test */
    public function it_can_get_organization_users()
    {
        $organization = Organization::factory()->create();
        $users = User::factory()->count(3)->create(['organization_id' => $organization->id]);

        $response = $this->actingAs($this->user)
            ->getJson("/api/v1/organizations/{$organization->id}/users");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'organization' => [
                        'id',
                        'name',
                        'org_code'
                    ],
                    'users' => [
                        '*' => [
                            'id',
                            'email',
                            'full_name',
                            'username',
                            'role',
                            'status',
                            'created_at'
                        ]
                    ],
                    'total_users'
                ]
            ]);

        $this->assertEquals(3, $response->json('data.total_users'));
    }

    /** @test */
    public function it_can_add_user_to_organization()
    {
        $organization = Organization::factory()->create();
        $user = User::factory()->create(['organization_id' => null]);

        $response = $this->actingAs($this->user)
            ->postJson("/api/v1/organizations/{$organization->id}/users", [
                'user_id' => $user->id,
                'role' => 'member'
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Pengguna berhasil ditambahkan ke organisasi'
            ]);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'organization_id' => $organization->id
        ]);
    }

    /** @test */
    public function it_can_remove_user_from_organization()
    {
        $organization = Organization::factory()->create();
        $user = User::factory()->create(['organization_id' => $organization->id]);

        $response = $this->actingAs($this->user)
            ->deleteJson("/api/v1/organizations/{$organization->id}/users/{$user->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Pengguna berhasil dihapus dari organisasi'
            ]);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'organization_id' => null
        ]);
    }

    /** @test */
    public function it_can_update_organization_subscription()
    {
        $organization = Organization::factory()->create();
        $subscriptionPlan = SubscriptionPlan::factory()->create();

        $subscriptionData = [
            'subscription_plan_id' => $subscriptionPlan->id,
            'subscription_status' => 'active',
            'billing_cycle' => 'monthly',
            'subscription_starts_at' => now()->toDateString(),
            'subscription_ends_at' => now()->addYear()->toDateString()
        ];

        $response = $this->actingAs($this->user)
            ->patchJson("/api/v1/organizations/{$organization->id}/subscription", $subscriptionData);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'id',
                    'subscription' => [
                        'status',
                        'is_active'
                    ]
                ]
            ]);

        $this->assertDatabaseHas('organizations', [
            'id' => $organization->id,
            'subscription_status' => 'active',
            'billing_cycle' => 'monthly'
        ]);
    }

    /** @test */
    public function it_returns_404_for_nonexistent_organization()
    {
        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/organizations/nonexistent-id');

        $response->assertStatus(404)
            ->assertJson([
                'success' => false,
                'message' => 'Organisasi tidak ditemukan'
            ]);
    }

    /** @test */
    public function it_requires_authentication()
    {
        $response = $this->getJson('/api/v1/organizations');

        $response->assertStatus(401);
    }

    /** @test */
    public function it_requires_permission_to_create_organization()
    {
        $user = User::factory()->create(['role' => 'user']);

        $response = $this->actingAs($user)
            ->postJson('/api/v1/organizations', [
                'name' => 'Test Organization',
                'email' => 'test@organization.com'
            ]);

        $response->assertStatus(403);
    }

    /** @test */
    public function it_requires_permission_to_update_organization()
    {
        $user = User::factory()->create(['role' => 'user']);
        $organization = Organization::factory()->create();

        $response = $this->actingAs($user)
            ->putJson("/api/v1/organizations/{$organization->id}", [
                'name' => 'Updated Organization'
            ]);

        $response->assertStatus(403);
    }

    /** @test */
    public function it_requires_permission_to_delete_organization()
    {
        $user = User::factory()->create(['role' => 'user']);
        $organization = Organization::factory()->create();

        $response = $this->actingAs($user)
            ->deleteJson("/api/v1/organizations/{$organization->id}");

        $response->assertStatus(403);
    }
}
