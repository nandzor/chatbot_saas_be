<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Organization;
use App\Models\EmailVerificationToken;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Cache;

class OrganizationRegistrationTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected function setUp(): void
    {
        parent::setUp();
        Mail::fake();
    }

    /**
     * Test successful organization registration.
     */
    public function test_successful_organization_registration(): void
    {
        $data = [
            'organization_name' => 'Test Organization',
            'organization_email' => 'org@test.com',
            'organization_phone' => '+6281234567890',
            'organization_address' => 'Test Address',
            'organization_website' => 'https://test.com',
            'business_type' => 'startup',
            'industry' => 'Technology',
            'company_size' => '11-50',
            'tax_id' => '123456789012345',
            'description' => 'Test organization description',
            'admin_first_name' => 'John',
            'admin_last_name' => 'Doe',
            'admin_email' => 'admin@test.com',
            'admin_username' => 'johndoe',
            'admin_password' => 'Password123!',
            'admin_password_confirmation' => 'Password123!',
            'admin_phone' => '+6281234567891',
            'timezone' => 'Asia/Jakarta',
            'locale' => 'id',
            'currency' => 'IDR',
            'terms_accepted' => true,
            'privacy_policy_accepted' => true,
            'marketing_consent' => false,
        ];

        $response = $this->postJson('/api/register-organization', $data);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Organization registration successful. Please check your email for verification.',
            ])
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'organization' => [
                        'id',
                        'name',
                        'org_code',
                        'status',
                        'email',
                    ],
                    'admin_user' => [
                        'id',
                        'email',
                        'full_name',
                        'username',
                        'status',
                    ],
                ],
            ]);

        // Assert organization was created
        $this->assertDatabaseHas('organizations', [
            'name' => 'Test Organization',
            'email' => 'org@test.com',
            'status' => 'pending_approval',
        ]);

        // Assert admin user was created
        $this->assertDatabaseHas('users', [
            'email' => 'admin@test.com',
            'full_name' => 'John Doe',
            'status' => 'pending_verification',
        ]);

        // Assert email verification token was created
        $this->assertDatabaseHas('email_verification_tokens', [
            'email' => 'admin@test.com',
            'type' => 'organization_verification',
        ]);
    }

    /**
     * Test organization registration with validation errors.
     */
    public function test_organization_registration_validation_errors(): void
    {
        $data = [
            'organization_name' => '', // Required field missing
            'organization_email' => 'invalid-email', // Invalid email
            'admin_email' => 'admin@test.com',
            'admin_password' => 'weak', // Weak password
            'terms_accepted' => false, // Terms not accepted
        ];

        $response = $this->postJson('/api/register-organization', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'organization_name',
                'organization_email',
                'admin_password',
                'terms_accepted',
            ]);
    }

    /**
     * Test organization registration with duplicate email.
     */
    public function test_organization_registration_duplicate_email(): void
    {
        // Create existing organization
        Organization::factory()->create(['email' => 'org@test.com']);

        $data = [
            'organization_name' => 'Test Organization',
            'organization_email' => 'org@test.com', // Duplicate email
            'admin_first_name' => 'John',
            'admin_last_name' => 'Doe',
            'admin_email' => 'admin@test.com',
            'admin_password' => 'Password123!',
            'admin_password_confirmation' => 'Password123!',
            'terms_accepted' => true,
            'privacy_policy_accepted' => true,
        ];

        $response = $this->postJson('/api/register-organization', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['organization_email']);
    }

    /**
     * Test organization registration with same email for org and admin.
     */
    public function test_organization_registration_same_email_org_admin(): void
    {
        $data = [
            'organization_name' => 'Test Organization',
            'organization_email' => 'same@test.com',
            'admin_first_name' => 'John',
            'admin_last_name' => 'Doe',
            'admin_email' => 'same@test.com', // Same as organization email
            'admin_password' => 'Password123!',
            'admin_password_confirmation' => 'Password123!',
            'terms_accepted' => true,
            'privacy_policy_accepted' => true,
        ];

        $response = $this->postJson('/api/register-organization', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['admin_email']);
    }

    /**
     * Test organization registration with reserved username.
     */
    public function test_organization_registration_reserved_username(): void
    {
        $data = [
            'organization_name' => 'Test Organization',
            'organization_email' => 'org@test.com',
            'admin_first_name' => 'John',
            'admin_last_name' => 'Doe',
            'admin_email' => 'admin@test.com',
            'admin_username' => 'admin', // Reserved username
            'admin_password' => 'Password123!',
            'admin_password_confirmation' => 'Password123!',
            'terms_accepted' => true,
            'privacy_policy_accepted' => true,
        ];

        $response = $this->postJson('/api/register-organization', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['admin_username']);
    }

    /**
     * Test email verification.
     */
    public function test_email_verification(): void
    {
        // Create organization and user
        $organization = Organization::factory()->create(['status' => 'pending_approval']);
        $user = User::factory()->create([
            'organization_id' => $organization->id,
            'status' => 'pending_verification',
            'is_email_verified' => false,
        ]);

        // Create verification token
        $token = EmailVerificationToken::factory()->create([
            'user_id' => $user->id,
            'organization_id' => $organization->id,
            'email' => $user->email,
            'type' => 'organization_verification',
            'is_used' => false,
        ]);

        $response = $this->postJson('/api/verify-organization-email', [
            'token' => $token->token,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Organization email verified successfully.',
            ]);

        // Assert user is verified and active
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'is_email_verified' => true,
            'status' => 'active',
        ]);

        // Assert organization is active
        $this->assertDatabaseHas('organizations', [
            'id' => $organization->id,
            'status' => 'active',
        ]);

        // Assert token is marked as used
        $this->assertDatabaseHas('email_verification_tokens', [
            'id' => $token->id,
            'is_used' => true,
        ]);
    }

    /**
     * Test email verification with invalid token.
     */
    public function test_email_verification_invalid_token(): void
    {
        $response = $this->postJson('/api/verify-organization-email', [
            'token' => 'invalid-token',
        ]);

        $response->assertStatus(400)
            ->assertJson([
                'success' => false,
                'message' => 'Invalid or expired verification token.',
            ]);
    }

    /**
     * Test email verification with expired token.
     */
    public function test_email_verification_expired_token(): void
    {
        // Create expired token
        $token = EmailVerificationToken::factory()->create([
            'expires_at' => now()->subHour(),
            'is_used' => false,
        ]);

        $response = $this->postJson('/api/verify-organization-email', [
            'token' => $token->token,
        ]);

        $response->assertStatus(400)
            ->assertJson([
                'success' => false,
                'message' => 'Invalid or expired verification token.',
            ]);
    }

    /**
     * Test resend verification email.
     */
    public function test_resend_verification_email(): void
    {
        // Create user
        $user = User::factory()->create([
            'email' => 'admin@test.com',
            'status' => 'pending_verification',
            'is_email_verified' => false,
        ]);

        $response = $this->postJson('/api/resend-verification', [
            'email' => 'admin@test.com',
            'type' => 'organization_verification',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Verification email sent successfully.',
            ]);

        // Assert new verification token was created
        $this->assertDatabaseHas('email_verification_tokens', [
            'email' => 'admin@test.com',
            'type' => 'organization_verification',
        ]);
    }

    /**
     * Test rate limiting.
     */
    public function test_rate_limiting(): void
    {
        $data = [
            'organization_name' => 'Test Organization',
            'organization_email' => 'org@test.com',
            'admin_first_name' => 'John',
            'admin_last_name' => 'Doe',
            'admin_email' => 'admin@test.com',
            'admin_password' => 'Password123!',
            'admin_password_confirmation' => 'Password123!',
            'terms_accepted' => true,
            'privacy_policy_accepted' => true,
        ];

        // Make multiple requests to trigger rate limiting
        for ($i = 0; $i < 5; $i++) {
            $response = $this->postJson('/api/register-organization', $data);

            if ($i >= 3) { // After 3 attempts, should be rate limited
                $response->assertStatus(429);
            }
        }
    }

    /**
     * Test input sanitization.
     */
    public function test_input_sanitization(): void
    {
        $data = [
            'organization_name' => '<script>alert("xss")</script>Test Organization',
            'organization_email' => '  ORG@TEST.COM  ', // Should be lowercased and trimmed
            'admin_first_name' => '  John  ',
            'admin_last_name' => 'Doe',
            'admin_email' => '  ADMIN@TEST.COM  ',
            'admin_password' => 'Password123!',
            'admin_password_confirmation' => 'Password123!',
            'terms_accepted' => true,
            'privacy_policy_accepted' => true,
        ];

        $response = $this->postJson('/api/register-organization', $data);

        $response->assertStatus(201);

        // Assert data was sanitized
        $this->assertDatabaseHas('organizations', [
            'name' => 'Test Organization', // Script tags removed
            'email' => 'org@test.com', // Lowercased and trimmed
        ]);

        $this->assertDatabaseHas('users', [
            'email' => 'admin@test.com', // Lowercased and trimmed
        ]);
    }

    /**
     * Test security headers.
     */
    public function test_security_headers(): void
    {
        $response = $this->postJson('/api/register-organization', []);

        $response->assertHeader('X-Content-Type-Options', 'nosniff')
            ->assertHeader('X-Frame-Options', 'DENY')
            ->assertHeader('X-XSS-Protection', '1; mode=block')
            ->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    }

    /**
     * Test database transaction rollback on failure.
     */
    public function test_database_transaction_rollback(): void
    {
        // Mock a database error
        $this->mock(\App\Services\OrganizationService::class, function ($mock) {
            $mock->shouldReceive('selfRegisterOrganization')
                ->andThrow(new \Exception('Database error'));
        });

        $data = [
            'organization_name' => 'Test Organization',
            'organization_email' => 'org@test.com',
            'admin_first_name' => 'John',
            'admin_last_name' => 'Doe',
            'admin_email' => 'admin@test.com',
            'admin_password' => 'Password123!',
            'admin_password_confirmation' => 'Password123!',
            'terms_accepted' => true,
            'privacy_policy_accepted' => true,
        ];

        $response = $this->postJson('/api/register-organization', $data);

        $response->assertStatus(500);

        // Assert no data was created due to rollback
        $this->assertDatabaseMissing('organizations', [
            'email' => 'org@test.com',
        ]);

        $this->assertDatabaseMissing('users', [
            'email' => 'admin@test.com',
        ]);
    }

    /**
     * Test organization code generation.
     */
    public function test_organization_code_generation(): void
    {
        $data = [
            'organization_name' => 'Test Organization',
            'organization_email' => 'org@test.com',
            'admin_first_name' => 'John',
            'admin_last_name' => 'Doe',
            'admin_email' => 'admin@test.com',
            'admin_password' => 'Password123!',
            'admin_password_confirmation' => 'Password123!',
            'terms_accepted' => true,
            'privacy_policy_accepted' => true,
        ];

        $response = $this->postJson('/api/register-organization', $data);

        $response->assertStatus(201);

        $organization = Organization::where('email', 'org@test.com')->first();
        $this->assertNotNull($organization->org_code);
        $this->assertMatchesRegularExpression('/^[A-Z0-9]+$/', $organization->org_code);
    }

    /**
     * Test trial period setup.
     */
    public function test_trial_period_setup(): void
    {
        $data = [
            'organization_name' => 'Test Organization',
            'organization_email' => 'org@test.com',
            'admin_first_name' => 'John',
            'admin_last_name' => 'Doe',
            'admin_email' => 'admin@test.com',
            'admin_password' => 'Password123!',
            'admin_password_confirmation' => 'Password123!',
            'terms_accepted' => true,
            'privacy_policy_accepted' => true,
        ];

        $response = $this->postJson('/api/register-organization', $data);

        $response->assertStatus(201);

        $organization = Organization::where('email', 'org@test.com')->first();
        $this->assertEquals('trial', $organization->subscription_status);
        $this->assertNotNull($organization->trial_ends_at);
        $this->assertTrue($organization->trial_ends_at->isAfter(now()->addDays(13)));
        $this->assertTrue($organization->trial_ends_at->isBefore(now()->addDays(15)));
    }
}
