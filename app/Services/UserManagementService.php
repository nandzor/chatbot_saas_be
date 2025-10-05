<?php

namespace App\Services;

use App\Models\User;
use App\Models\Organization;
use App\Models\OAuthCredential;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Exception;

/**
 * User Management Service
 * Service untuk mengelola user operations dalam OAuth flow
 */
class UserManagementService
{
    /**
     * Find or create user from Google OAuth data
     * NOTE: This method is for OAuth authentication flow (login)
     */
    public function findOrCreateUser(GoogleOAuthUserService $googleUser, string $organizationId): User
    {
        $email = $googleUser->getEmail();

        // Validate organization exists
        $organization = Organization::find($organizationId);
        if (!$organization) {
            throw new Exception('Organization not found');
        }

        // Try to find existing user by email and organization
        $user = User::where('email', $email)
            ->where('organization_id', $organizationId)
            ->first();

        if ($user) {
            return $this->updateExistingUser($user, $googleUser);
        }

        return $this->createNewUser($googleUser, $organizationId);
    }

    /**
     * Get existing user for Google Drive integration
     * NOTE: This method is for Google Drive integration only (no user creation)
     */
    public function getExistingUserForIntegration(string $userId, string $organizationId): User
    {
        // Validate organization exists
        $organization = Organization::find($organizationId);
        if (!$organization) {
            throw new Exception('Organization not found');
        }

        // Find existing user by ID and organization
        $user = User::where('id', $userId)
            ->where('organization_id', $organizationId)
            ->first();

        if (!$user) {
            throw new Exception('User not found in organization');
        }

        return $user;
    }

    /**
     * Update existing user with Google data
     */
    private function updateExistingUser(User $user, GoogleOAuthUserService $googleUser): User
    {
        $user->update([
            'full_name' => $googleUser->getName(),
            'avatar_url' => $googleUser->getAvatar(),
            'google_id' => $googleUser->getId(),
            'is_email_verified' => true,
            'last_login_at' => now()
        ]);

        Log::info('Updated existing user from Google OAuth', [
            'user_id' => $user->id,
            'email' => $user->email,
            'google_id' => $googleUser->getId()
        ]);

        return $user;
    }

    /**
     * Create new user from Google OAuth data
     */
    private function createNewUser(GoogleOAuthUserService $googleUser, string $organizationId): User
    {
        $user = User::create([
            'full_name' => $googleUser->getName(),
            'email' => $googleUser->getEmail(),
            'username' => $this->generateUsername($googleUser->getEmail(), $googleUser->getName()),
            'password_hash' => Hash::make(bin2hex(random_bytes(32))), // Random password
            'avatar_url' => $googleUser->getAvatar(),
            'google_id' => $googleUser->getId(),
            'organization_id' => $organizationId,
            'is_email_verified' => true,
            'last_login_at' => now(),
            'status' => 'active'
        ]);

        // Assign default role to user
        $this->assignDefaultRole($user, $organizationId);

        Log::info('Created new user from Google OAuth', [
            'user_id' => $user->id,
            'email' => $user->email,
            'google_id' => $googleUser->getId(),
            'organization_id' => $organizationId
        ]);

        return $user;
    }

    /**
     * Assign default role to user
     */
    private function assignDefaultRole(User $user, string $organizationId): void
    {
        try {
            // Get default role for organization
            $defaultRole = DB::table('roles')
                ->where('organization_id', $organizationId)
                ->where('is_default', true)
                ->first();

            if ($defaultRole) {
                DB::table('user_roles')->insert([
                    'user_id' => $user->id,
                    'role_id' => $defaultRole->id,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);

                Log::info('Assigned default role to user', [
                    'user_id' => $user->id,
                    'role_id' => $defaultRole->id,
                    'role_name' => $defaultRole->name
                ]);
            }
        } catch (Exception $e) {
            Log::warning('Failed to assign default role to user', [
                'user_id' => $user->id,
                'organization_id' => $organizationId,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Create or update OAuth credential for Google Drive integration
     * NOTE: This method is for Google Drive integration only (no user creation)
     */
    public function createOrUpdateOAuthCredentialForIntegration(string $userId, GoogleOAuthUserService $googleUser, string $organizationId): OAuthCredential
    {
        // Get existing user (no creation)
        $user = $this->getExistingUserForIntegration($userId, $organizationId);

        $credential = OAuthCredential::forService('google')
            ->forOrganization($organizationId)
            ->forUser($user->id)
            ->first();

        $credentialData = [
            'organization_id' => $organizationId,
            'user_id' => $user->id,
            'service' => 'google',
            'n8n_credential_id' => $this->generateN8nCredentialId($user->id, $organizationId),
            'access_token' => $googleUser->getAccessToken(),
            'refresh_token' => $googleUser->getRefreshToken(),
            'expires_at' => $googleUser->getExpiresIn() ? now()->addSeconds($googleUser->getExpiresIn()) : null,
            'scope' => $googleUser->getScope(),
        ];

        if ($credential) {
            $credential->update($credentialData);
            Log::info('Updated OAuth credential for integration', [
                'credential_id' => $credential->id,
                'user_id' => $user->id,
                'service' => 'google'
            ]);
        } else {
            $credential = OAuthCredential::create($credentialData);
            Log::info('Created OAuth credential for integration', [
                'credential_id' => $credential->id,
                'user_id' => $user->id,
                'service' => 'google'
            ]);
        }

        return $credential;
    }

    /**
     * Create or update OAuth credential
     * NOTE: This method is for OAuth authentication flow (login)
     */
    public function createOrUpdateOAuthCredential(User $user, GoogleOAuthUserService $googleUser, string $organizationId): OAuthCredential
    {
        $credential = OAuthCredential::forService('google')
            ->forOrganization($organizationId)
            ->forUser($user->id)
            ->first();

        $credentialData = [
            'organization_id' => $organizationId,
            'user_id' => $user->id,
            'service' => 'google',
            'n8n_credential_id' => $this->generateN8nCredentialId($user->id, $organizationId),
            'access_token' => $googleUser->getAccessToken(),
            'refresh_token' => $googleUser->getRefreshToken(),
            'expires_at' => $googleUser->getExpiresIn() ? now()->addSeconds($googleUser->getExpiresIn()) : null,
            'scope' => $googleUser->getScope(),
        ];

        if ($credential) {
            $credential->update($credentialData);
            Log::info('Updated OAuth credential', [
                'credential_id' => $credential->id,
                'user_id' => $user->id,
                'service' => 'google'
            ]);
        } else {
            $credential = OAuthCredential::create($credentialData);
            Log::info('Created OAuth credential', [
                'credential_id' => $credential->id,
                'user_id' => $user->id,
                'service' => 'google'
            ]);
        }

        return $credential;
    }

    /**
     * Generate JWT token for user
     * NOTE: This method is for OAuth authentication flow (login)
     */
    public function generateToken(User $user): string
    {
        try {
            // Generate JWT token using Laravel Sanctum
            $token = $user->createToken('google-oauth-token')->plainTextToken;

            Log::info('JWT token generated successfully', [
                'user_id' => $user->id,
                'token_preview' => substr($token, 0, 20) . '...'
            ]);

            return $token;

        } catch (Exception $e) {
            Log::error('Failed to generate JWT token', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);

            // Fallback: try Auth::login
            $token = Auth::login($user);
            return $token ?? '';
        }
    }

    /**
     * Handle Google Drive integration without user creation or token generation
     * NOTE: This method is for Google Drive integration only
     */
    public function handleGoogleDriveIntegration(string $userId, GoogleOAuthUserService $googleUser, string $organizationId): array
    {
        try {
            // Get existing user (no creation)
            $user = $this->getExistingUserForIntegration($userId, $organizationId);

            // Create or update OAuth credential
            $credential = $this->createOrUpdateOAuthCredentialForIntegration($userId, $googleUser, $organizationId);

            Log::info('Google Drive integration successful', [
                'user_id' => $user->id,
                'organization_id' => $organizationId,
                'google_id' => $googleUser->getId(),
                'email' => $googleUser->getEmail()
            ]);

            return [
                'success' => true,
                'user' => $user,
                'credential' => $credential
            ];

        } catch (Exception $e) {
            Log::error('Google Drive integration failed', [
                'user_id' => $userId,
                'organization_id' => $organizationId,
                'error' => $e->getMessage()
            ]);

            throw $e;
        }
    }

    /**
     * Generate unique username from email and name
     */
    private function generateUsername(string $email, string $name): string
    {
        // Extract username from email (part before @)
        $emailUsername = explode('@', $email)[0];

        // Clean username (remove special characters, keep only alphanumeric and dots)
        $cleanUsername = preg_replace('/[^a-zA-Z0-9.]/', '', $emailUsername);

        // If name is available, try to use first name + last name initial
        if (!empty($name)) {
            $nameParts = explode(' ', trim($name));
            if (count($nameParts) >= 2) {
                $firstName = strtolower(preg_replace('/[^a-zA-Z]/', '', $nameParts[0]));
                $lastName = strtolower(preg_replace('/[^a-zA-Z]/', '', $nameParts[1]));
                if (!empty($firstName) && !empty($lastName)) {
                    $cleanUsername = $firstName . '.' . substr($lastName, 0, 1);
                }
            }
        }

        // Ensure username is not empty and has minimum length
        if (empty($cleanUsername) || strlen($cleanUsername) < 3) {
            $cleanUsername = 'user' . substr(md5($email), 0, 6);
        }

        // Check if username already exists and make it unique
        $originalUsername = $cleanUsername;
        $counter = 1;

        while (User::where('username', $cleanUsername)->exists()) {
            $cleanUsername = $originalUsername . $counter;
            $counter++;

            // Prevent infinite loop
            if ($counter > 999) {
                $cleanUsername = 'user' . substr(md5($email . time()), 0, 8);
                break;
            }
        }

        return $cleanUsername;
    }

    /**
     * Generate N8N credential ID
     */
    private function generateN8nCredentialId(string $userId, string $organizationId): string
    {
        // Generate a unique credential ID for N8N integration
        // Format: google_{user_id}_{organization_id}_{timestamp}
        $timestamp = time();
        $credentialId = 'google_' . substr($userId, 0, 8) . '_' . substr($organizationId, 0, 8) . '_' . $timestamp;

        return $credentialId;
    }
}
