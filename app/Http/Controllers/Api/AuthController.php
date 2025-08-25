<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RefreshTokenRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Http\Requests\Auth\UpdateProfileRequest;
use App\Http\Requests\Auth\ChangePasswordRequest;
use App\Http\Requests\Auth\LockUserRequest;
use App\Http\Resources\Auth\AuthResource;
use App\Http\Resources\User\UserResource;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Token;
use App\Models\User;

class AuthController extends BaseApiController
{
    protected AuthService $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    /**
     * Login user and return JWT token.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        try {
            $credentials = $request->validated();

            $authData = $this->authService->login(
                $credentials['email'],
                $credentials['password'],
                $request,
                $credentials['remember'] ?? false
            );

            return $this->successResponse(
                'Login successful',
                new AuthResource($authData),
                201
            );
        } catch (ValidationException $e) {
            return $this->errorResponse(
                'Authentication failed',
                $e->errors(),
                401
            );
        } catch (\Exception $e) {
            Log::error('Login error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponseWithDebug(
                'Login failed',
                500,
                ['error' => 'An unexpected error occurred. Please try again.'],
                $e
            );
        }
    }

    /**
     * Register new user.
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        try {
            $userData = $request->validated();
            $user = $this->authService->register($userData);

            return $this->successResponse(
                'User registered successfully',
                new UserResource($user),
                201
            );
        } catch (ValidationException $e) {
            return $this->errorResponse(
                'Validation failed',
                $e->errors(),
                422
            );
        } catch (\Exception $e) {
            Log::error('Registration error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponseWithDebug(
                'Failed to register user',
                500,
                ['error' => 'An unexpected error occurred'],
                $e
            );
        }
    }

    /**
     * Logout user and invalidate token.
     */
    public function logout(Request $request): JsonResponse
    {
        try {
            $success = $this->authService->logout($request);

            if ($success) {
                return $this->successResponse(
                    'Successfully logged out',
                    null,
                    200
                );
            }

            return $this->errorResponse(
                'Logout failed',
                ['error' => 'Could not logout user'],
                500
            );
        } catch (\Exception $e) {
            Log::error('Logout error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponseWithDebug(
                'Logout failed',
                500,
                ['error' => 'An unexpected error occurred'],
                $e
            );
        }
    }

    /**
     * Refresh JWT token using refresh token.
     */
    public function refresh(Request $request)
    {
        try {
            // Validasi input
            $request->validate([
                'refresh_token' => 'required|string'
            ]);

            // Pastikan refresh_token ada dalam request
            if (!$request->has('refresh_token') || empty($request->input('refresh_token'))) {
                return response()->json([
                    'success' => false,
                    'message' => 'Refresh token is required'
                ], 400);
            }

            $refreshToken = $request->input('refresh_token');

            // Verifikasi refresh token
            try {
                $payload = JWTAuth::manager()->decode(
                    new Token($refreshToken),
                    JWTAuth::manager()->getJWTProvider()->getSecret()
                );

                // Ambil user berdasarkan payload
                $user = User::find($payload->get('sub'));

                if (!$user) {
                    return response()->json([
                        'success' => false,
                        'message' => 'User not found'
                    ], 404);
                }

                // Generate token baru
                $token = JWTAuth::fromUser($user);

                // Generate refresh token baru
                $newRefreshToken = JWTAuth::manager()->encode(
                    JWTAuth::manager()->getJWTProvider()->encode([
                        'sub' => $user->id,
                        'iat' => time(),
                        'exp' => time() + (60 * 60 * 24 * 7), // 7 days
                        'type' => 'refresh'
                    ])
                );

                return response()->json([
                    'success' => true,
                    'message' => 'Token refreshed successfully',
                    'data' => [
                        'user' => $user,
                        'access_token' => $token,
                        'refresh_token' => $newRefreshToken,
                        'token_type' => 'bearer',
                        'expires_in' => config('jwt.ttl') * 60
                    ]
                ]);

            } catch (\Tymon\JWTAuth\Exceptions\TokenExpiredException $e) {
                return response()->json([
                    'success' => false,
                    'message' => 'Refresh token has expired'
                ], 401);
            } catch (\Tymon\JWTAuth\Exceptions\TokenInvalidException $e) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid refresh token'
                ], 401);
            } catch (\Exception $e) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid refresh token format'
                ], 400);
            }

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while refreshing token',
                'debug' => [
                    'exception_message' => $e->getMessage(),
                    'exception_file' => $e->getFile(),
                    'exception_line' => $e->getLine()
                ]
            ], 500);
        }
    }

    /**
     * Send password reset link to user's email.
     */
    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        try {
            $email = $request->validated()['email'];
            $success = $this->authService->sendPasswordResetLink($email);

            if ($success) {
                return $this->successResponse(
                    'Password reset link sent to your email',
                    [
                        'email' => $email,
                        'message' => 'Check your email for password reset instructions'
                    ],
                    200
                );
            }

            return $this->errorResponse(
                'Failed to send password reset link',
                ['error' => 'Could not process password reset request'],
                500
            );
        } catch (ValidationException $e) {
            return $this->errorResponse(
                'Validation failed',
                $e->errors(),
                422
            );
        } catch (\Exception $e) {
            Log::error('Forgot password error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponseWithDebug(
                'Failed to process password reset request',
                500,
                ['error' => 'An unexpected error occurred'],
                $e
            );
        }
    }

    /**
     * Reset password using reset token.
     */
    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        try {
            $data = $request->validated();
            $email = $data['email'];
            $token = $data['token'];
            $password = $data['password'];

            $success = $this->authService->resetPassword($email, $token, $password);

            if ($success) {
                return $this->successResponse(
                    'Password reset successfully',
                    [
                        'email' => $email,
                        'message' => 'Your password has been reset successfully. You can now login with your new password.'
                    ],
                    200
                );
            }

            return $this->errorResponse(
                'Failed to reset password',
                ['error' => 'Could not reset password'],
                500
            );
        } catch (ValidationException $e) {
            return $this->errorResponse(
                'Validation failed',
                $e->errors(),
                422
            );
        } catch (\Exception $e) {
            Log::error('Reset password error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponseWithDebug(
                'Failed to reset password',
                500,
                ['error' => 'An unexpected error occurred'],
                $e
            );
        }
    }

    /**
     * Get current authenticated user.
     */
    public function me(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return $this->errorResponse(
                    'User not found',
                    ['error' => 'Authenticated user not found'],
                    404
                );
            }

            // Load relationships if user supports them
            if ($user instanceof \Illuminate\Database\Eloquent\Model) {
                $user->load([
                    'organization',
                    'sessions' => function ($query) {
                        $query->where('is_active', true)->latest();
                    }
                ]);
            }

            return $this->successResponse(
                'User data retrieved successfully',
                new UserResource($user),
                200
            );
        } catch (\Exception $e) {
            Log::error('Get user data error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponseWithDebug(
                'Failed to retrieve user data',
                500,
                ['error' => 'Could not retrieve user information'],
                $e
            );
        }
    }

    /**
     * Logout from all devices.
     */
    public function logoutAll(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return $this->errorResponse(
                    'User not found',
                    ['error' => 'Authenticated user not found'],
                    404
                );
            }

            $success = $this->authService->logoutFromAllDevices($user);

            if ($success) {
                return $this->successResponse(
                    'Successfully logged out from all devices',
                    null,
                    200
                );
            }

            return $this->errorResponse(
                'Logout failed',
                ['error' => 'Could not logout from all devices'],
                500
            );
        } catch (\Exception $e) {
            Log::error('Logout all devices error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponseWithDebug(
                'Logout failed',
                500,
                ['error' => 'An unexpected error occurred'],
                $e
            );
        }
    }

    /**
     * Get active sessions for current user.
     */
    public function sessions(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return $this->errorResponse(
                    'User not found',
                    ['error' => 'Authenticated user not found'],
                    404
                );
            }

            $sessions = collect();
            if ($user instanceof \Illuminate\Database\Eloquent\Model && method_exists($user, 'sessions')) {
                $sessions = $user->sessions()
                               ->where('is_active', true)
                               ->orderBy('last_activity_at', 'desc')
                               ->get();
            }

            return $this->successResponse(
                'Sessions retrieved successfully',
                $sessions->map(function ($session) {
                    return [
                        'id' => $session->id,
                        'ip_address' => $session->ip_address,
                        'device_info' => $session->device_info,
                        'location_info' => $session->location_info,
                        'last_activity' => $session->last_activity_at?->diffForHumans(),
                        'created_at' => $session->created_at,
                        'is_current' => $this->isCurrentSession($session),
                    ];
                }),
                200
            );
        } catch (\Exception $e) {
            Log::error('Get sessions error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponseWithDebug(
                'Failed to retrieve sessions',
                500,
                ['error' => 'Could not retrieve session information'],
                $e
            );
        }
    }

    /**
     * Revoke a specific session.
     */
    public function revokeSession(Request $request, string $sessionId): JsonResponse
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return $this->errorResponse(
                    'User not found',
                    ['error' => 'Authenticated user not found'],
                    404
                );
            }

            $session = null;
            if ($user instanceof \Illuminate\Database\Eloquent\Model && method_exists($user, 'sessions')) {
                $session = $user->sessions()
                              ->where('id', $sessionId)
                              ->where('is_active', true)
                              ->first();
            }

            if (!$session) {
                return $this->errorResponse(
                    'Session not found',
                    ['error' => 'Session not found or already revoked'],
                    404
                );
            }

            // Don't allow revoking current session
            if ($this->isCurrentSession($session)) {
                return $this->errorResponse(
                    'Cannot revoke current session',
                    ['error' => 'Use logout endpoint to end current session'],
                    400
                );
            }

            $session->update(['is_active' => false]);

            return $this->successResponse(
                'Session revoked successfully',
                null,
                200
            );
        } catch (\Exception $e) {
            Log::error('Revoke session error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponseWithDebug(
                'Failed to revoke session',
                500,
                ['error' => 'Could not revoke session'],
                $e
            );
        }
    }

    /**
     * Validate current token.
     */
    public function validate(Request $request): JsonResponse
    {
        try {
            $user = $this->authService->validateToken();

            if (!$user) {
                return $this->errorResponse(
                    'Invalid token',
                    ['error' => 'Token is invalid or expired'],
                    401
                );
            }

            return $this->successResponse(
                'Token is valid',
                [
                    'valid' => true,
                    'user' => new UserResource($user),
                    'expires_in' => config('jwt.ttl', 60) * 60,
                ],
                200
            );
        } catch (\Exception $e) {
            Log::error('Token validation error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponseWithDebug(
                'Token validation failed',
                500,
                ['error' => 'Could not validate token'],
                $e
            );
        }
    }

    /**
     * Check if session is current session.
     */
    protected function isCurrentSession($session): bool
    {
        try {
            $currentToken = request()->bearerToken();
            if (!$currentToken) {
                return false;
            }

            $currentTokenHash = hash('sha256', $currentToken);
            return $session->session_token === $currentTokenHash;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Update user profile.
     */
    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return $this->errorResponse(
                    'User not found',
                    ['error' => 'Authenticated user not found'],
                    404
                );
            }

            $profileData = $request->validated();
            $updatedUser = $this->authService->updateProfile($user, $profileData);

            return $this->successResponse(
                'Profile updated successfully',
                new UserResource($updatedUser),
                200
            );
        } catch (ValidationException $e) {
            return $this->errorResponse(
                'Validation failed',
                $e->errors(),
                422
            );
        } catch (\Exception $e) {
            Log::error('Profile update error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponseWithDebug(
                'Failed to update profile',
                500,
                ['error' => 'An unexpected error occurred'],
                $e
            );
        }
    }

    /**
     * Change user password.
     */
    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return $this->errorResponse(
                    'User not found',
                    ['error' => 'Authenticated user not found'],
                    404
                );
            }

            $data = $request->validated();
            $currentPassword = $data['current_password'];
            $newPassword = $data['new_password'];

            $success = $this->authService->changePassword($user, $currentPassword, $newPassword);

            if ($success) {
                return $this->successResponse(
                    'Password changed successfully',
                    null,
                    200
                );
            }

            return $this->errorResponse(
                'Failed to change password',
                ['error' => 'Could not change password'],
                500
            );
        } catch (ValidationException $e) {
            return $this->errorResponse(
                'Validation failed',
                $e->errors(),
                422
            );
        } catch (\Exception $e) {
            Log::error('Password change error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponseWithDebug(
                'Failed to change password',
                500,
                ['error' => 'An unexpected error occurred'],
                $e
            );
        }
    }

    /**
     * Force logout user from all devices (admin only).
     */
    public function forceLogout(string $userId): JsonResponse
    {
        try {
            $success = $this->authService->forceLogout($userId);

            if ($success) {
                return $this->successResponse(
                    'User force logged out successfully',
                    ['user_id' => $userId],
                    200
                );
            }

            return $this->errorResponse(
                'Failed to force logout user',
                ['error' => 'Could not force logout user'],
                500
            );
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->errorResponse(
                'User not found',
                ['error' => 'User not found'],
                404
            );
        } catch (\Exception $e) {
            Log::error('Force logout error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponseWithDebug(
                'Failed to force logout user',
                500,
                ['error' => 'An unexpected error occurred'],
                $e
            );
        }
    }

    /**
     * Lock user account (admin only).
     */
    public function lockUser(LockUserRequest $request, string $userId): JsonResponse
    {
        try {
            $data = $request->validated();
            $reason = $data['reason'] ?? null;
            $durationMinutes = $data['duration_minutes'] ?? 30;

            $success = $this->authService->lockUser($userId, $reason, $durationMinutes);

            if ($success) {
                return $this->successResponse(
                    'User account locked successfully',
                    [
                        'user_id' => $userId,
                        'locked_until' => now()->addMinutes($durationMinutes)->toISOString(),
                        'reason' => $reason
                    ],
                    200
                );
            }

            return $this->errorResponse(
                'Failed to lock user account',
                ['error' => 'Could not lock user account'],
                500
            );
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->errorResponse(
                'User not found',
                ['error' => 'User not found'],
                404
            );
        } catch (ValidationException $e) {
            return $this->errorResponse(
                'Validation failed',
                $e->errors(),
                422
            );
        } catch (\Exception $e) {
            Log::error('Lock user error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponseWithDebug(
                'Failed to lock user account',
                500,
                ['error' => 'An unexpected error occurred'],
                $e
            );
        }
    }

    /**
     * Unlock user account (admin only).
     */
    public function unlockUser(string $userId): JsonResponse
    {
        try {
            $success = $this->authService->unlockUser($userId);

            if ($success) {
                return $this->successResponse(
                    'User account unlocked successfully',
                    ['user_id' => $userId],
                    200
                );
            }

            return $this->errorResponse(
                'Failed to unlock user account',
                ['error' => 'Could not unlock user account'],
                500
            );
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->errorResponse(
                'User not found',
                ['error' => 'User not found'],
                404
            );
        } catch (\Exception $e) {
            Log::error('Unlock user error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponseWithDebug(
                'Failed to unlock user account',
                500,
                ['error' => 'An unexpected error occurred'],
                $e
            );
        }
    }


}
