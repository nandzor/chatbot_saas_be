<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserSession;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;
use Tymon\JWTAuth\Exceptions\TokenExpiredException;
use Tymon\JWTAuth\Exceptions\TokenInvalidException;
use Laravel\Sanctum\PersonalAccessToken;

class AuthService extends BaseService
{
    /**
     * Get the model for the service.
     */
    protected function getModel(): \Illuminate\Database\Eloquent\Model
    {
        return new User();
    }

    /**
     * Default token TTL in minutes.
     */
    const DEFAULT_TTL = 60; // 1 hour

    /**
     * Refresh token TTL in minutes.
     */
    const REFRESH_TTL = 10080; // 7 days

    /**
     * Login rate limit key.
     */
    const LOGIN_RATE_LIMIT_KEY = 'login-attempts';

    /**
     * Maximum login attempts per minute.
     */
    const MAX_LOGIN_ATTEMPTS = 5;

    /**
     * Authenticate user with email/password.
     */
    public function login(string $email, string $password, Request $request, bool $remember = false): array
    {
        // Check rate limiting
        $this->checkRateLimit($request);

        // Find user
        $user = User::where('email', $email)
                   ->whereNull('deleted_at')
                   ->first();

        if (!$user) {
            $this->handleFailedLogin($request, 'User not found');
            throw ValidationException::withMessages([
                'email' => ['Invalid credentials provided.'],
            ]);
        }

        // Check if user is active
        if (!$this->isUserActive($user)) {
            $this->handleFailedLogin($request, 'User account is not active');
            throw ValidationException::withMessages([
                'email' => ['Your account is not active. Please contact support.'],
            ]);
        }

        // Verify password
        if (!Hash::check($password, $user->password_hash)) {
            $this->handleFailedLogin($request, 'Invalid password', $user);
            throw ValidationException::withMessages([
                'email' => ['Invalid credentials provided.'],
            ]);
        }

        // Check if user is locked
        if ($this->isUserLocked($user)) {
            throw ValidationException::withMessages([
                'email' => ['Your account is temporarily locked due to too many failed attempts.'],
            ]);
        }

        // Generate tokens
        $tokenData = $this->generateTokens($user, $remember);

        // Create user session
        $session = $this->createUserSession($user, $request, $tokenData);

        // Update user login info
        $this->updateUserLoginInfo($user, $request);

        // Clear rate limiting
        $this->clearRateLimit($request);

        // Log successful login
        $this->logAuthEvent('login_success', $user, $request);

        // Load user with roles and permissions for complete response
        $userWithRelations = $user->fresh()->load(['roles.permissions', 'organization']);

        return array_merge($tokenData, [
            'user' => $userWithRelations,
            'session' => $session,
            'expires_in' => $this->getTokenTTL($remember),
        ]);
    }

    /**
     * Logout user.
     */
    public function logout(Request $request): bool
    {
        try {
            $user = $this->getCurrentUser();

            if ($user) {
                // Invalidate current session
                $this->invalidateCurrentSession($request);

                // Revoke Sanctum tokens
                $this->revokeSanctumTokens($user);

                // Log logout
                $this->logAuthEvent('logout', $user, $request);
            }

            // Invalidate JWT token
            JWTAuth::invalidate(JWTAuth::getToken());

            return true;
        } catch (JWTException $e) {
            Log::warning('JWT logout error', ['error' => $e->getMessage()]);
            return false;
        }
    }

    /**
     * Refresh JWT token.
     */
    public function refresh(Request $request): array
    {
        try {
            $newToken = JWTAuth::refresh(JWTAuth::getToken());
            $user = $this->getCurrentUser();

            if (!$user) {
                throw new \Exception('User not found');
            }

            // Update session with new token
            $this->updateSessionToken($request, $newToken);

            return [
                'access_token' => $newToken,
                'token_type' => 'bearer',
                'expires_in' => $this->getTokenTTL(),
                'user' => $user,
            ];
        } catch (TokenExpiredException $e) {
            throw ValidationException::withMessages([
                'token' => ['Token has expired and cannot be refreshed'],
            ]);
        } catch (JWTException $e) {
            throw ValidationException::withMessages([
                'token' => ['Token is invalid'],
            ]);
        }
    }

    /**
     * Validate JWT token.
     */
    public function validateToken(?string $token = null): ?User
    {
        try {
            if ($token) {
                JWTAuth::setToken($token);
            }

            $user = JWTAuth::authenticate();

            if (!$user) {
                return null;
            }

            // Additional user validation
            if (!$this->isUserActive($user) || $this->isUserLocked($user)) {
                return null;
            }

            return $user;
        } catch (TokenExpiredException $e) {
            Log::info('Token expired', ['error' => $e->getMessage()]);
            return null;
        } catch (TokenInvalidException $e) {
            Log::warning('Invalid token', ['token' => substr($token, 0, 20) . '...']);
            return null;
        } catch (JWTException $e) {
            Log::error('JWT validation error', ['error' => $e->getMessage()]);
            return null;
        }
    }

    /**
     * Generate unified tokens (JWT + Sanctum + Refresh).
     */
    protected function generateTokens(User $user, bool $remember = false): array
    {
        $ttl = $this->getTokenTTL($remember);

        // Set custom TTL for JWT
        config(['jwt.ttl' => $ttl]);

        // Generate JWT token (1 hour)
        $jwtToken = JWTAuth::fromUser($user);

        // Generate Sanctum token (1 year)
        $sanctumToken = $user->createToken(
            'api-token',
            ['*'],
            now()->addYear()
        );

        // Generate Refresh token (7 days)
        $refreshToken = $this->createRefreshToken($user);

        return [
            'access_token' => $jwtToken,
            'refresh_token' => $refreshToken,
            'token_type' => 'Bearer',
            'sanctum_token' => $sanctumToken->plainTextToken,
            'expires_in' => $ttl * 60, // Convert to seconds
            'refresh_expires_in' => 7 * 24 * 60 * 60, // 7 days in seconds
        ];
    }

    /**
     * Create user session record.
     */
    protected function createUserSession(User $user, Request $request, array $tokenData): UserSession
    {
        // Clean old sessions if limit exceeded
        $this->cleanOldSessions($user);

        return UserSession::create([
            'user_id' => $user->id,
            'session_token' => hash('sha256', $tokenData['access_token']),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'device_info' => $this->getDeviceInfo($request),
            'location_info' => $this->getLocationInfo($request),
            'expires_at' => now()->addMinutes($this->getTokenTTL()),
            'is_active' => true,
        ]);
    }

    /**
     * Update user login information.
     */
    protected function updateUserLoginInfo(User $user, Request $request): void
    {
        $user->update([
            'last_login_at' => now(),
            'last_login_ip' => $request->ip(),
            'login_count' => $user->login_count + 1,
            'failed_login_attempts' => 0, // Reset failed attempts
        ]);
    }

    /**
     * Check if user is active.
     */
    protected function isUserActive(User $user): bool
    {
        return $user->status === 'active' &&
               $user->is_email_verified &&
               is_null($user->deleted_at);
    }

    /**
     * Check if user is locked.
     */
    protected function isUserLocked(User $user): bool
    {
        return !is_null($user->locked_until) &&
               $user->locked_until > now();
    }

    /**
     * Handle failed login attempt.
     */
    protected function handleFailedLogin(Request $request, string $reason, ?User $user = null): void
    {
        // Increment rate limiting
        RateLimiter::hit($this->getRateLimitKey($request));

        // Update user failed attempts if user exists
        if ($user) {
            $failedAttempts = $user->failed_login_attempts + 1;
            $updateData = ['failed_login_attempts' => $failedAttempts];

            // Lock user if too many failed attempts
            if ($failedAttempts >= 5) {
                $updateData['locked_until'] = now()->addMinutes(30);
            }

            $user->update($updateData);
        }

        // Log failed login
        $this->logAuthEvent('login_failed', $user, $request, ['reason' => $reason]);
    }

    /**
     * Check rate limiting.
     */
    protected function checkRateLimit(Request $request): void
    {
        $key = $this->getRateLimitKey($request);

        if (RateLimiter::tooManyAttempts($key, self::MAX_LOGIN_ATTEMPTS)) {
            $seconds = RateLimiter::availableIn($key);

            throw ValidationException::withMessages([
                'email' => ['Too many login attempts. Please try again in ' . ceil($seconds / 60) . ' minutes.'],
            ]);
        }
    }

    /**
     * Clear rate limiting.
     */
    protected function clearRateLimit(Request $request): void
    {
        RateLimiter::clear($this->getRateLimitKey($request));
    }

    /**
     * Get rate limit key.
     */
    protected function getRateLimitKey(Request $request): string
    {
        return self::LOGIN_RATE_LIMIT_KEY . ':' . $request->ip();
    }

    /**
     * Get current authenticated user.
     */
    protected function getCurrentUser(): ?User
    {
        return Auth::user() ?? JWTAuth::user();
    }

    /**
     * Invalidate current user session.
     */
    protected function invalidateCurrentSession(Request $request): void
    {
        $user = $this->getCurrentUser();
        if (!$user) return;

        $sessionToken = hash('sha256', JWTAuth::getToken());

        UserSession::where('user_id', $user->id)
                  ->where('session_token', $sessionToken)
                  ->update(['is_active' => false]);
    }

    /**
     * Revoke Sanctum tokens.
     */
    protected function revokeSanctumTokens(User $user): void
    {
        $user->tokens()->delete();
    }

    /**
     * Clean old sessions if limit exceeded.
     */
    protected function cleanOldSessions(User $user): void
    {
        $maxSessions = $user->max_concurrent_sessions ?? 3;
        $activeSessions = UserSession::where('user_id', $user->id)
                                   ->where('is_active', true)
                                   ->count();

        if ($activeSessions >= $maxSessions) {
            UserSession::where('user_id', $user->id)
                      ->where('is_active', true)
                      ->orderBy('created_at', 'asc')
                      ->limit($activeSessions - $maxSessions + 1)
                      ->update(['is_active' => false]);
        }
    }

    /**
     * Update session token.
     */
    protected function updateSessionToken(Request $request, string $newToken): void
    {
        $user = $this->getCurrentUser();
        if (!$user) return;

        $oldToken = hash('sha256', JWTAuth::getToken());
        $newTokenHash = hash('sha256', $newToken);

        UserSession::where('user_id', $user->id)
                  ->where('session_token', $oldToken)
                  ->update([
                      'session_token' => $newTokenHash,
                      'last_activity_at' => now(),
                  ]);
    }

    /**
     * Get token TTL based on remember option.
     */
    protected function getTokenTTL(bool $remember = false): int
    {
        return $remember ? self::REFRESH_TTL : self::DEFAULT_TTL;
    }

    /**
     * Get device information from request.
     */
    protected function getDeviceInfo(Request $request): array
    {
        $userAgent = $request->userAgent();

        return [
            'browser' => $this->getBrowser($userAgent),
            'platform' => $this->getPlatform($userAgent),
            'device' => $this->getDevice($userAgent),
            'is_mobile' => $request->header('X-Mobile-App') ? true : false,
        ];
    }

    /**
     * Get location information from request.
     */
    protected function getLocationInfo(Request $request): array
    {
        // You can integrate with IP geolocation services here
        return [
            'ip' => $request->ip(),
            'country' => null,
            'city' => null,
            'timezone' => null,
        ];
    }

    /**
     * Extract browser from user agent.
     */
    protected function getBrowser(string $userAgent): string
    {
        if (str_contains($userAgent, 'Chrome')) return 'Chrome';
        if (str_contains($userAgent, 'Firefox')) return 'Firefox';
        if (str_contains($userAgent, 'Safari')) return 'Safari';
        if (str_contains($userAgent, 'Edge')) return 'Edge';
        return 'Unknown';
    }

    /**
     * Extract platform from user agent.
     */
    protected function getPlatform(string $userAgent): string
    {
        if (str_contains($userAgent, 'Windows')) return 'Windows';
        if (str_contains($userAgent, 'Mac')) return 'macOS';
        if (str_contains($userAgent, 'Linux')) return 'Linux';
        if (str_contains($userAgent, 'Android')) return 'Android';
        if (str_contains($userAgent, 'iOS')) return 'iOS';
        return 'Unknown';
    }

    /**
     * Extract device type from user agent.
     */
    protected function getDevice(string $userAgent): string
    {
        if (str_contains($userAgent, 'Mobile')) return 'Mobile';
        if (str_contains($userAgent, 'Tablet')) return 'Tablet';
        return 'Desktop';
    }

    /**
     * Log authentication events.
     */
    protected function logAuthEvent(string $event, ?User $user, Request $request, array $extra = []): void
    {
        Log::info("Auth Event: {$event}", array_merge([
            'user_id' => $user?->id,
            'email' => $user?->email,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'timestamp' => now()->toISOString(),
        ], $extra));
    }

    /**
     * Logout from all devices.
     */
    public function logoutFromAllDevices(User $user): bool
    {
        try {
            // Invalidate all user sessions
            UserSession::where('user_id', $user->id)
                      ->update(['is_active' => false]);

            // Revoke all Sanctum tokens
            $user->tokens()->delete();

            // Log event
            Log::info('User logged out from all devices', ['user_id' => $user->id]);

            return true;
        } catch (\Exception $e) {
            Log::error('Error logging out from all devices', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Verify two-factor authentication.
     */
    public function verifyTwoFactor(User $user, string $code): bool
    {
        if (!$user->two_factor_enabled) {
            return true;
        }

        // Implement 2FA verification logic here
        // This could be TOTP, SMS, or email-based
        return true; // Placeholder
    }

    /**
     * Check if password needs to be changed.
     */
    public function needsPasswordChange(User $user): bool
    {
        $lastChanged = $user->password_changed_at;
        $maxAge = config('auth.password_max_age', 90); // days

        return $lastChanged &&
               $lastChanged->addDays($maxAge)->isPast();
    }

    /**
     * Create refresh token for user.
     */
    protected function createRefreshToken(User $user): string
    {
        // Generate random refresh token
        $refreshToken = \Illuminate\Support\Str::random(64);

        // Store hashed token in database
        \Illuminate\Support\Facades\DB::table('refresh_tokens')->insert([
            'user_id' => $user->id,
            'token' => hash('sha256', $refreshToken),
            'expires_at' => now()->addDays(7),
            'is_revoked' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return $refreshToken;
    }

    /**
     * Validate refresh token.
     */
    public function validateRefreshToken(string $refreshToken): ?object
    {
        $hashedToken = hash('sha256', $refreshToken);

        $tokenRecord = \Illuminate\Support\Facades\DB::table('refresh_tokens')
            ->where('token', $hashedToken)
            ->where('expires_at', '>', now())
            ->where('is_revoked', false)
            ->first();

        if (!$tokenRecord) {
            return null;
        }

        return (object) $tokenRecord;
    }

    /**
     * Rotate refresh token (for security).
     */
    public function rotateRefreshToken(object $tokenRecord): string
    {
        // Revoke old token
        \Illuminate\Support\Facades\DB::table('refresh_tokens')
            ->where('id', $tokenRecord->id)
            ->update(['is_revoked' => true]);

        // Create new refresh token
        $user = User::find($tokenRecord->user_id);
        return $this->createRefreshToken($user);
    }

    /**
     * Revoke refresh token.
     */
    public function revokeRefreshToken(string $refreshToken): bool
    {
        $hashedToken = hash('sha256', $refreshToken);

        $updated = \Illuminate\Support\Facades\DB::table('refresh_tokens')
            ->where('token', $hashedToken)
            ->update(['is_revoked' => true]);

        return $updated > 0;
    }

    /**
     * Refresh JWT token using refresh token.
     */
    public function refreshWithToken(string $refreshToken): array
    {
        // Validate refresh token
        $tokenRecord = $this->validateRefreshToken($refreshToken);
        if (!$tokenRecord) {
            throw ValidationException::withMessages([
                'refresh_token' => ['Invalid or expired refresh token'],
            ]);
        }

        // Get user
        $user = User::find($tokenRecord->user_id);
        if (!$user) {
            throw ValidationException::withMessages([
                'refresh_token' => ['User not found'],
            ]);
        }

        // Generate new JWT token
        $newJwtToken = JWTAuth::fromUser($user);

        // Rotate refresh token for security
        $newRefreshToken = $this->rotateRefreshToken($tokenRecord);

        return [
            'access_token' => $newJwtToken,
            'refresh_token' => $newRefreshToken,
            'token_type' => 'Bearer',
            'expires_in' => self::DEFAULT_TTL * 60,
            'refresh_expires_in' => 7 * 24 * 60 * 60,
        ];
    }

    /**
     * Register new user.
     */
    public function register(array $userData): User
    {
        // Validate organization code
        $organization = \App\Models\Organization::where('org_code', $userData['organization_code'])->first();
        if (!$organization) {
            throw ValidationException::withMessages([
                'organization_code' => ['Invalid organization code'],
            ]);
        }

        // Create user
        $user = User::create([
            'organization_id' => $organization->id,
            'email' => $userData['email'],
            'username' => $userData['username'] ?? $this->generateUsername($userData['email']),
            'password_hash' => Hash::make($userData['password']),
            'full_name' => $userData['first_name'] . ' ' . $userData['last_name'],
            'first_name' => $userData['first_name'],
            'last_name' => $userData['last_name'],
            'role' => 'customer', // Default role
            'status' => 'active',
        ]);

        // Assign default role
        $this->assignDefaultRole($user, $organization);

        // Send welcome email
        $this->sendWelcomeEmail($user);

        // Log registration
        $this->logAuthEvent('user_registered', $user, request());

        return $user;
    }

    /**
     * Send password reset link.
     */
    public function sendPasswordResetLink(string $email): bool
    {
        $user = User::where('email', $email)->first();
        if (!$user) {
            return false; // Don't reveal if user exists
        }

        // Generate reset token
        $token = \Illuminate\Support\Str::random(64);

        // Store reset token in database
        \Illuminate\Support\Facades\DB::table('password_resets')->updateOrInsert(
            ['email' => $email],
            [
                'email' => $email,
                'token' => $token,
                'created_at' => now()
            ]
        );

        // Send email with reset link
        $this->sendPasswordResetEmail($user, $token);

        // Log password reset request
        $this->logAuthEvent('password_reset_requested', $user, request());

        return true;
    }

    /**
     * Reset password using token.
     */
    public function resetPassword(string $email, string $token, string $newPassword): bool
    {
        // Find reset record
        $resetRecord = \Illuminate\Support\Facades\DB::table('password_resets')
            ->where('email', $email)
            ->where('token', $token)
            ->first();

        if (!$resetRecord) {
            throw ValidationException::withMessages([
                'token' => ['Invalid password reset token'],
            ]);
        }

        // Check if token is expired (24 hours)
        $tokenAge = now()->diffInHours($resetRecord->created_at);
        if ($tokenAge > 24) {
            // Remove expired token
            \Illuminate\Support\Facades\DB::table('password_resets')
                ->where('email', $email)
                ->delete();

            throw ValidationException::withMessages([
                'token' => ['Password reset token has expired. Please request a new one.'],
            ]);
        }

        // Update user password
        $user = User::where('email', $email)->first();
        if (!$user) {
            throw ValidationException::withMessages([
                'email' => ['User not found'],
            ]);
        }

        $user->update([
            'password_hash' => Hash::make($newPassword),
            'password_changed_at' => now(),
            'failed_login_attempts' => 0, // Reset failed attempts
            'locked_until' => null, // Unlock if was locked
        ]);

        // Remove used token
        \Illuminate\Support\Facades\DB::table('password_resets')
            ->where('email', $email)
            ->delete();

        // Log password reset
        $this->logAuthEvent('password_reset_successful', $user, request());

        return true;
    }

    /**
     * Update user profile.
     */
    public function updateProfile(User $user, array $profileData): User
    {
        // Validate profile data
        $validatedData = collect($profileData)->only([
            'first_name', 'last_name', 'phone', 'timezone', 'language',
            'bio', 'location', 'department', 'job_title'
        ])->filter()->toArray();

        // Update full_name if first_name or last_name changed
        if (isset($validatedData['first_name']) || isset($validatedData['last_name'])) {
            $firstName = $validatedData['first_name'] ?? $user->first_name;
            $lastName = $validatedData['last_name'] ?? $user->last_name;
            $validatedData['full_name'] = trim($firstName . ' ' . $lastName);
        }

        // Update user
        $user->update($validatedData);

        // Log profile update
        $this->logAuthEvent('profile_updated', $user, request());

        return $user->fresh();
    }

    /**
     * Change user password.
     */
    public function changePassword(User $user, string $currentPassword, string $newPassword): bool
    {
        // Verify current password
        if (!Hash::check($currentPassword, $user->password_hash)) {
            throw ValidationException::withMessages([
                'current_password' => ['Current password is incorrect'],
            ]);
        }

        // Check if new password is different
        if (Hash::check($newPassword, $user->password_hash)) {
            throw ValidationException::withMessages([
                'new_password' => ['New password must be different from current password'],
            ]);
        }

        // Update password
        $user->update([
            'password_hash' => Hash::make($newPassword),
            'password_changed_at' => now(),
        ]);

        // Log password change
        $this->logAuthEvent('password_changed', $user, request());

        return true;
    }

    /**
     * Force logout user from all devices (admin only).
     */
    public function forceLogout(string $userId): bool
    {
        $user = User::findOrFail($userId);

        // Invalidate all user sessions
        UserSession::where('user_id', $user->id)
                  ->update(['is_active' => false]);

        // Revoke all Sanctum tokens
        $user->tokens()->delete();

        // Revoke all refresh tokens
        \Illuminate\Support\Facades\DB::table('refresh_tokens')
            ->where('user_id', $user->id)
            ->update(['is_revoked' => true]);

        // Log force logout
        $this->logAuthEvent('force_logout', $user, request(), ['admin_action' => true]);

        return true;
    }

    /**
     * Lock user account (admin only).
     */
    public function lockUser(string $userId, ?string $reason = null, ?int $durationMinutes = 30): bool
    {
        $user = User::findOrFail($userId);

        // Set lock duration
        $lockUntil = now()->addMinutes($durationMinutes ?? 30);

        // Update user
        $user->update([
            'locked_until' => $lockUntil,
            'status' => 'locked',
        ]);

        // Invalidate all active sessions
        UserSession::where('user_id', $user->id)
                  ->update(['is_active' => false]);

        // Revoke all tokens
        $user->tokens()->delete();

        // Log account lock
        $this->logAuthEvent('account_locked', $user, request(), [
            'admin_action' => true,
            'reason' => $reason,
            'locked_until' => $lockUntil->toISOString(),
        ]);

        return true;
    }

    /**
     * Unlock user account (admin only).
     */
    public function unlockUser(string $userId): bool
    {
        $user = User::findOrFail($userId);

        // Update user
        $user->update([
            'locked_until' => null,
            'status' => 'active',
            'failed_login_attempts' => 0, // Reset failed attempts
        ]);

        // Log account unlock
        $this->logAuthEvent('account_unlocked', $user, request(), [
            'admin_action' => true,
        ]);

        return true;
    }

    /**
     * Generate username from email.
     */
    protected function generateUsername(string $email): string
    {
        $baseUsername = strtolower(explode('@', $email)[0]);
        $username = $baseUsername;
        $counter = 1;

        while (User::where('username', $username)->exists()) {
            $username = $baseUsername . $counter;
            $counter++;
        }

        return $username;
    }

    /**
     * Assign default role to user.
     */
    protected function assignDefaultRole(User $user, \App\Models\Organization $organization): void
    {
        // Get default role for organization
        $defaultRole = Role::where('organization_id', $organization->id)
                          ->where('is_default', true)
                          ->first();

        if ($defaultRole) {
            $user->roles()->attach($defaultRole->id, [
                'is_active' => true,
                'is_primary' => true,
                'scope' => 'organization',
                'scope_context' => $organization->id,
                'effective_from' => now(),
            ]);
        }
    }

    /**
     * Send welcome email to new user.
     */
    protected function sendWelcomeEmail(User $user): void
    {
        // TODO: Implement email sending logic
        // This would typically involve:
        // 1. Creating email template
        // 2. Sending welcome email
        // 3. Logging email sent

        Log::info('Welcome email should be sent', [
            'user_id' => $user->id,
            'email' => $user->email,
        ]);
    }

    /**
     * Send password reset email.
     */
    protected function sendPasswordResetEmail(User $user, string $token): void
    {
        // TODO: Implement email sending logic
        // This would typically involve:
        // 1. Creating email template
        // 2. Sending reset email with link
        // 3. Logging email sent

        Log::info('Password reset email should be sent', [
            'user_id' => $user->id,
            'email' => $user->email,
            'token' => $token,
        ]);
    }


}
