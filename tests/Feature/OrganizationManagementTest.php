<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Organization;
use App\Models\OrganizationAuditLog;
use App\Services\OrganizationService;
use App\Services\OrganizationAuditService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;

class OrganizationManagementTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected User $user;
    protected Organization $organization;
    protected OrganizationService $organizationService;
    protected OrganizationAuditService $auditService;

    protected function setUp(): void
    {
        parent::setUp();

        // Create test user and organization
        $this->user = User::factory()->create();
        $this->organization = Organization::factory()->create();

        // Assign user to organization
        $this->user->update(['organization_id' => $this->organization->id]);

        // Initialize services
        $this->organizationService = app(OrganizationService::class);
        $this->auditService = app(OrganizationAuditService::class);
    }

    /** @test */
    public function it_can_get_organization_settings()
    {
        $response = $this->actingAs($this->user)
            ->getJson("/api/v1/organizations/{$this->organization->id}/settings");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'general',
                    'system',
                    'api',
                    'subscription',
                    'security',
                    'notifications',
                    'features'
                ]
            ]);
    }

    /** @test */
    public function it_can_save_organization_settings()
    {
        $settings = [
            'general' => [
                'name' => 'Updated Organization Name',
                'displayName' => 'Updated Display Name',
                'email' => 'updated@example.com',
                'phone' => '+1234567890',
                'website' => 'https://example.com',
                'address' => '123 Main St, City, State 12345',
                'description' => 'Updated description',
                'timezone' => 'UTC',
                'locale' => 'en',
                'currency' => 'USD'
            ],
            'system' => [
                'status' => 'active',
                'businessType' => 'saas',
                'industry' => 'technology',
                'companySize' => 'medium',
                'foundedYear' => 2020,
                'employeeCount' => 50,
                'annualRevenue' => 1000000
            ]
        ];

        $response = $this->actingAs($this->user)
            ->putJson("/api/v1/organizations/{$this->organization->id}/settings", $settings);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Organization settings saved successfully'
            ]);

        // Verify settings were saved
        $this->organization->refresh();
        $this->assertEquals('Updated Organization Name', $this->organization->name);
        $this->assertEquals('updated@example.com', $this->organization->email);
    }

    /** @test */
    public function it_validates_organization_settings()
    {
        $invalidSettings = [
            'general' => [
                'name' => '', // Empty name should fail
                'email' => 'invalid-email', // Invalid email should fail
                'website' => 'not-a-url', // Invalid URL should fail
            ],
            'system' => [
                'status' => 'invalid-status', // Invalid status should fail
                'employeeCount' => -5, // Negative employee count should fail
            ]
        ];

        $response = $this->actingAs($this->user)
            ->putJson("/api/v1/organizations/{$this->organization->id}/settings", $invalidSettings);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'general.name',
                'general.email',
                'general.website',
                'system.status',
                'system.employeeCount'
            ]);
    }

    /** @test */
    public function it_can_get_organization_analytics()
    {
        $response = $this->actingAs($this->user)
            ->getJson("/api/v1/organizations/{$this->organization->id}/analytics");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'growth',
                    'trends',
                    'metrics',
                    'topFeatures',
                    'activityLog'
                ]
            ]);
    }

    /** @test */
    public function it_can_get_organization_roles()
    {
        $response = $this->actingAs($this->user)
            ->getJson("/api/v1/organizations/{$this->organization->id}/roles");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    '*' => [
                        'id',
                        'name',
                        'description',
                        'permissions',
                        'userCount',
                        'isSystem'
                    ]
                ]
            ]);
    }

    /** @test */
    public function it_can_save_role_permissions()
    {
        $permissions = [
            'users.create',
            'users.read',
            'users.update',
            'settings.read',
            'settings.update'
        ];

        $response = $this->actingAs($this->user)
            ->putJson("/api/v1/organizations/{$this->organization->id}/roles/1/permissions", [
                'permissions' => $permissions
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Role permissions saved successfully'
            ]);
    }

    /** @test */
    public function it_can_test_webhook()
    {
        $webhookUrl = 'https://httpbin.org/post';

        $response = $this->actingAs($this->user)
            ->postJson("/api/v1/organizations/{$this->organization->id}/webhook/test", [
                'webhookUrl' => $webhookUrl
            ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'url',
                    'response_time',
                    'status_code',
                    'response_body',
                    'test_passed'
                ]
            ]);
    }

    /** @test */
    public function it_can_get_audit_logs()
    {
        // Create some audit logs
        OrganizationAuditLog::factory()->count(5)->create([
            'organization_id' => $this->organization->id
        ]);

        $response = $this->actingAs($this->user)
            ->getJson("/api/v1/organizations/{$this->organization->id}/audit-logs");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    '*' => [
                        'id',
                        'organization_id',
                        'user_id',
                        'action',
                        'resource_type',
                        'resource_id',
                        'old_values',
                        'new_values',
                        'ip_address',
                        'user_agent',
                        'created_at'
                    ]
                ]
            ]);
    }

    /** @test */
    public function it_can_get_audit_log_statistics()
    {
        // Create some audit logs
        OrganizationAuditLog::factory()->count(10)->create([
            'organization_id' => $this->organization->id
        ]);

        $response = $this->actingAs($this->user)
            ->getJson("/api/v1/organizations/{$this->organization->id}/audit-logs/statistics");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'total_actions',
                    'unique_users',
                    'unique_actions',
                    'unique_resource_types',
                    'action_breakdown',
                    'resource_type_breakdown'
                ]
            ]);
    }

    /** @test */
    public function it_can_get_notifications()
    {
        $response = $this->actingAs($this->user)
            ->getJson("/api/v1/organizations/{$this->organization->id}/notifications");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'data',
                    'current_page',
                    'last_page',
                    'per_page',
                    'total'
                ]
            ]);
    }

    /** @test */
    public function it_can_send_notification()
    {
        $notificationData = [
            'type' => 'organization_update',
            'title' => 'Test Notification',
            'message' => 'This is a test notification',
            'priority' => 'normal',
            'data' => [
                'update_type' => 'settings',
                'updated_by' => $this->user->id
            ]
        ];

        $response = $this->actingAs($this->user)
            ->postJson("/api/v1/organizations/{$this->organization->id}/notifications", $notificationData);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Notification sent successfully'
            ]);
    }

    /** @test */
    public function it_creates_audit_log_when_settings_are_updated()
    {
        $initialAuditCount = OrganizationAuditLog::where('organization_id', $this->organization->id)->count();

        $settings = [
            'general' => [
                'name' => 'Updated Organization Name',
                'email' => 'updated@example.com'
            ]
        ];

        $this->actingAs($this->user)
            ->putJson("/api/v1/organizations/{$this->organization->id}/settings", $settings);

        $finalAuditCount = OrganizationAuditLog::where('organization_id', $this->organization->id)->count();

        $this->assertGreaterThan($initialAuditCount, $finalAuditCount);

        // Verify audit log was created
        $auditLog = OrganizationAuditLog::where('organization_id', $this->organization->id)
            ->where('action', 'settings_updated')
            ->latest()
            ->first();

        $this->assertNotNull($auditLog);
        $this->assertEquals('settings_updated', $auditLog->action);
        $this->assertEquals('organization_settings', $auditLog->resource_type);
    }

    /** @test */
    public function it_requires_authentication()
    {
        $response = $this->getJson("/api/v1/organizations/{$this->organization->id}/settings");

        $response->assertStatus(401);
    }

    /** @test */
    public function it_requires_organization_access()
    {
        $otherUser = User::factory()->create();
        $otherOrganization = Organization::factory()->create();
        $otherUser->update(['organization_id' => $otherOrganization->id]);

        $response = $this->actingAs($otherUser)
            ->getJson("/api/v1/organizations/{$this->organization->id}/settings");

        $response->assertStatus(403);
    }

    /** @test */
    public function it_can_generate_admin_token()
    {
        $response = $this->actingAs($this->user)
            ->postJson("/api/v1/superadmin/login-as-admin", [
                'organization_id' => $this->organization->id,
                'organization_name' => $this->organization->name
            ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'token',
                    'organization_id',
                    'organization_name',
                    'expires_at'
                ]
            ]);
    }

    /** @test */
    public function it_can_force_password_reset()
    {
        $response = $this->actingAs($this->user)
            ->postJson("/api/v1/superadmin/force-password-reset", [
                'organization_id' => $this->organization->id,
                'email' => $this->user->email,
                'organization_name' => $this->organization->name
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Password reset email sent successfully'
            ]);
    }
}
