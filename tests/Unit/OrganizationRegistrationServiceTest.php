<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\User;
use App\Models\Organization;
use App\Models\EmailVerificationToken;
use App\Services\OrganizationService;
use App\Services\EmailVerificationService;
use App\Services\OrganizationRegistrationLogger;
use App\Services\OrganizationApprovalService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Hash;

class OrganizationRegistrationServiceTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected OrganizationService $organizationService;
    protected EmailVerificationService $emailVerificationService;
    protected OrganizationRegistrationLogger $logger;
    protected OrganizationApprovalService $approvalService;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->logger = $this->createMock(OrganizationRegistrationLogger::class);
        $this->approvalService = $this->createMock(OrganizationApprovalService::class);
        
        $this->organizationService = new OrganizationService(
            $this->createMock(\App\Services\OrganizationAuditService::class),
            $this->logger
        );
        
        $this->emailVerificationService = new EmailVerificationService($this->logger);
        
        Mail::fake();
    }

    /**
     * Test organization service self registration.
     */
    public function test_organization_service_self_registration(): void
    {
        $data = [
            'organization_name' => 'Test Organization',
            'organization_email' => 'org@test.com',
            'admin_first_name' => 'John',
            'admin_last_name' => 'Doe',
            'admin_email' => 'admin@test.com',
            'admin_password' => 'Password123!',
            'terms_accepted' => true,
            'privacy_policy_accepted' => true,
        ];

        $result = $this->organizationService->selfRegisterOrganization($data);

        $this->assertTrue($result['success']);
        $this->assertEquals('Organization registration successful. Please check your email for verification.', $result['message']);
        $this->assertArrayHasKey('data', $result);
        $this->assertArrayHasKey('organization', $result['data']);
        $this->assertArrayHasKey('admin_user', $result['data']);

        // Assert organization was created
        $organization = Organization::where('email', 'org@test.com')->first();
        $this->assertNotNull($organization);
        $this->assertEquals('Test Organization', $organization->name);
        $this->assertEquals('pending_approval', $organization->status);

        // Assert admin user was created
        $user = User::where('email', 'admin@test.com')->first();
        $this->assertNotNull($user);
        $this->assertEquals('John Doe', $user->full_name);
        $this->assertEquals('pending_verification', $user->status);
    }

    /**
     * Test organization service registration failure.
     */
    public function test_organization_service_registration_failure(): void
    {
        // Mock database error
        DB::shouldReceive('beginTransaction')->andThrow(new \Exception('Database error'));

        $data = [
            'organization_name' => 'Test Organization',
            'organization_email' => 'org@test.com',
            'admin_first_name' => 'John',
            'admin_last_name' => 'Doe',
            'admin_email' => 'admin@test.com',
            'admin_password' => 'Password123!',
            'terms_accepted' => true,
            'privacy_policy_accepted' => true,
        ];

        $result = $this->organizationService->selfRegisterOrganization($data);

        $this->assertFalse($result['success']);
        $this->assertEquals('Organization registration failed. Please try again.', $result['message']);
        $this->assertArrayHasKey('error', $result);
    }

    /**
     * Test email verification service.
     */
    public function test_email_verification_service(): void
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

        $result = $this->emailVerificationService->verifyOrganizationEmail($token->token);

        $this->assertTrue($result['success']);
        $this->assertEquals('Organization email verified successfully.', $result['message']);

        // Assert user is verified
        $user->refresh();
        $this->assertTrue($user->is_email_verified);
        $this->assertEquals('active', $user->status);

        // Assert organization is active
        $organization->refresh();
        $this->assertEquals('active', $organization->status);

        // Assert token is used
        $token->refresh();
        $this->assertTrue($token->is_used);
    }

    /**
     * Test email verification service with invalid token.
     */
    public function test_email_verification_service_invalid_token(): void
    {
        $result = $this->emailVerificationService->verifyOrganizationEmail('invalid-token');

        $this->assertFalse($result['success']);
        $this->assertEquals('Invalid or expired verification token.', $result['message']);
    }

    /**
     * Test email verification service with expired token.
     */
    public function test_email_verification_service_expired_token(): void
    {
        $token = EmailVerificationToken::factory()->create([
            'expires_at' => now()->subHour(),
            'is_used' => false,
        ]);

        $result = $this->emailVerificationService->verifyOrganizationEmail($token->token);

        $this->assertFalse($result['success']);
        $this->assertEquals('Invalid or expired verification token.', $result['message']);
    }

    /**
     * Test send organization email verification.
     */
    public function test_send_organization_email_verification(): void
    {
        $organization = Organization::factory()->create();
        $user = User::factory()->create(['organization_id' => $organization->id]);

        $result = $this->emailVerificationService->sendOrganizationEmailVerification($user, $organization);

        $this->assertTrue($result);

        // Assert verification token was created
        $this->assertDatabaseHas('email_verification_tokens', [
            'user_id' => $user->id,
            'organization_id' => $organization->id,
            'email' => $user->email,
            'type' => 'organization_verification',
        ]);
    }

    /**
     * Test resend email verification.
     */
    public function test_resend_email_verification(): void
    {
        $user = User::factory()->create([
            'email' => 'admin@test.com',
            'status' => 'pending_verification',
            'is_email_verified' => false,
        ]);

        $result = $this->emailVerificationService->resendEmailVerification('admin@test.com', 'organization_verification');

        $this->assertTrue($result['success']);
        $this->assertEquals('Verification email sent successfully.', $result['message']);

        // Assert new verification token was created
        $this->assertDatabaseHas('email_verification_tokens', [
            'email' => 'admin@test.com',
            'type' => 'organization_verification',
        ]);
    }

    /**
     * Test resend email verification for non-existent user.
     */
    public function test_resend_email_verification_non_existent_user(): void
    {
        $result = $this->emailVerificationService->resendEmailVerification('nonexistent@test.com', 'organization_verification');

        $this->assertFalse($result['success']);
        $this->assertEquals('User not found.', $result['message']);
    }

    /**
     * Test resend email verification for already verified user.
     */
    public function test_resend_email_verification_already_verified(): void
    {
        $user = User::factory()->create([
            'email' => 'admin@test.com',
            'status' => 'active',
            'is_email_verified' => true,
        ]);

        $result = $this->emailVerificationService->resendEmailVerification('admin@test.com', 'organization_verification');

        $this->assertFalse($result['success']);
        $this->assertEquals('Email is already verified.', $result['message']);
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
            'terms_accepted' => true,
            'privacy_policy_accepted' => true,
        ];

        $result = $this->organizationService->selfRegisterOrganization($data);

        $this->assertTrue($result['success']);

        $organization = Organization::where('email', 'org@test.com')->first();
        $this->assertNotNull($organization->org_code);
        $this->assertMatchesRegularExpression('/^[A-Z0-9]+$/', $organization->org_code);
    }

    /**
     * Test unique organization code generation.
     */
    public function test_unique_organization_code_generation(): void
    {
        // Create first organization
        $data1 = [
            'organization_name' => 'Test Organization 1',
            'organization_email' => 'org1@test.com',
            'admin_first_name' => 'John',
            'admin_last_name' => 'Doe',
            'admin_email' => 'admin1@test.com',
            'admin_password' => 'Password123!',
            'terms_accepted' => true,
            'privacy_policy_accepted' => true,
        ];

        $result1 = $this->organizationService->selfRegisterOrganization($data1);
        $this->assertTrue($result1['success']);

        // Create second organization
        $data2 = [
            'organization_name' => 'Test Organization 2',
            'organization_email' => 'org2@test.com',
            'admin_first_name' => 'Jane',
            'admin_last_name' => 'Doe',
            'admin_email' => 'admin2@test.com',
            'admin_password' => 'Password123!',
            'terms_accepted' => true,
            'privacy_policy_accepted' => true,
        ];

        $result2 = $this->organizationService->selfRegisterOrganization($data2);
        $this->assertTrue($result2['success']);

        $org1 = Organization::where('email', 'org1@test.com')->first();
        $org2 = Organization::where('email', 'org2@test.com')->first();

        $this->assertNotEquals($org1->org_code, $org2->org_code);
    }

    /**
     * Test username generation.
     */
    public function test_username_generation(): void
    {
        $data = [
            'organization_name' => 'Test Organization',
            'organization_email' => 'org@test.com',
            'admin_first_name' => 'John',
            'admin_last_name' => 'Doe',
            'admin_email' => 'admin@test.com',
            'admin_password' => 'Password123!',
            'terms_accepted' => true,
            'privacy_policy_accepted' => true,
        ];

        $result = $this->organizationService->selfRegisterOrganization($data);

        $this->assertTrue($result['success']);

        $user = User::where('email', 'admin@test.com')->first();
        $this->assertNotNull($user->username);
        $this->assertMatchesRegularExpression('/^[a-zA-Z0-9._-]+$/', $user->username);
    }

    /**
     * Test password hashing.
     */
    public function test_password_hashing(): void
    {
        $data = [
            'organization_name' => 'Test Organization',
            'organization_email' => 'org@test.com',
            'admin_first_name' => 'John',
            'admin_last_name' => 'Doe',
            'admin_email' => 'admin@test.com',
            'admin_password' => 'Password123!',
            'terms_accepted' => true,
            'privacy_policy_accepted' => true,
        ];

        $result = $this->organizationService->selfRegisterOrganization($data);

        $this->assertTrue($result['success']);

        $user = User::where('email', 'admin@test.com')->first();
        $this->assertTrue(Hash::check('Password123!', $user->password_hash));
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
            'terms_accepted' => true,
            'privacy_policy_accepted' => true,
        ];

        $result = $this->organizationService->selfRegisterOrganization($data);

        $this->assertTrue($result['success']);

        $organization = Organization::where('email', 'org@test.com')->first();
        $this->assertEquals('trial', $organization->subscription_status);
        $this->assertNotNull($organization->trial_ends_at);
        $this->assertTrue($organization->trial_ends_at->isAfter(now()->addDays(13)));
        $this->assertTrue($organization->trial_ends_at->isBefore(now()->addDays(15)));
    }

    /**
     * Test organization settings initialization.
     */
    public function test_organization_settings_initialization(): void
    {
        $data = [
            'organization_name' => 'Test Organization',
            'organization_email' => 'org@test.com',
            'admin_first_name' => 'John',
            'admin_last_name' => 'Doe',
            'admin_email' => 'admin@test.com',
            'admin_password' => 'Password123!',
            'terms_accepted' => true,
            'privacy_policy_accepted' => true,
        ];

        $result = $this->organizationService->selfRegisterOrganization($data);

        $this->assertTrue($result['success']);

        $organization = Organization::where('email', 'org@test.com')->first();
        
        // Test default settings
        $this->assertFalse($organization->api_enabled);
        $this->assertFalse($organization->webhook_enabled);
        $this->assertFalse($organization->two_factor_enabled);
        $this->assertFalse($organization->sso_enabled);
        
        // Test JSON settings
        $this->assertIsArray(json_decode($organization->email_notifications ?? '{}', true));
        $this->assertIsArray(json_decode($organization->push_notifications ?? '{}', true));
        $this->assertIsArray(json_decode($organization->webhook_notifications ?? '{}', true));
        $this->assertIsArray(json_decode($organization->chatbot_settings ?? '{}', true));
        $this->assertIsArray(json_decode($organization->analytics_settings ?? '{}', true));
        $this->assertIsArray(json_decode($organization->integrations_settings ?? '{}', true));
        $this->assertIsArray(json_decode($organization->custom_branding_settings ?? '{}', true));
    }

    /**
     * Test user preferences initialization.
     */
    public function test_user_preferences_initialization(): void
    {
        $data = [
            'organization_name' => 'Test Organization',
            'organization_email' => 'org@test.com',
            'admin_first_name' => 'John',
            'admin_last_name' => 'Doe',
            'admin_email' => 'admin@test.com',
            'admin_password' => 'Password123!',
            'timezone' => 'Asia/Jakarta',
            'locale' => 'id',
            'terms_accepted' => true,
            'privacy_policy_accepted' => true,
        ];

        $result = $this->organizationService->selfRegisterOrganization($data);

        $this->assertTrue($result['success']);

        $user = User::where('email', 'admin@test.com')->first();
        
        // Test UI preferences
        $uiPreferences = json_decode($user->ui_preferences ?? '{}', true);
        $this->assertEquals('light', $uiPreferences['theme']);
        $this->assertEquals('id', $uiPreferences['language']);
        $this->assertEquals('Asia/Jakarta', $uiPreferences['timezone']);
        $this->assertTrue($uiPreferences['notifications']['email']);
        $this->assertTrue($uiPreferences['notifications']['push']);
    }
}
