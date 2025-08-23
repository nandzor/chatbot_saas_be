<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RefreshTokenRequest;
use App\Http\Resources\Auth\AuthResource;
use App\Http\Resources\UserResource;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

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
    public function refresh(RefreshTokenRequest $request): JsonResponse
    {
        try {
            $refreshToken = $request->validated()['refresh_token'];

            $authData = $this->authService->refreshWithToken($refreshToken);

            return $this->successResponse(
                'Token refreshed successfully',
                $authData,
                200
            );
        } catch (ValidationException $e) {
            return $this->errorResponse(
                'Token refresh failed',
                $e->errors(),
                401
            );
        } catch (\Exception $e) {
            Log::error('Token refresh error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponseWithDebug(
                'Token refresh failed',
                500,
                ['error' => 'Could not refresh token'],
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


}
