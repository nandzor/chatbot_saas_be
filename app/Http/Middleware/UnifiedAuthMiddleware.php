<?php

namespace App\Http\Middleware;

use App\Services\AuthService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;
use Tymon\JWTAuth\Exceptions\TokenExpiredException;
use Tymon\JWTAuth\Exceptions\TokenInvalidException;
use Laravel\Sanctum\PersonalAccessToken;
use App\Traits\Api\ApiResponseTrait;

class UnifiedAuthMiddleware
{
    use ApiResponseTrait;

    protected AuthService $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    /**
     * Handle an incoming request with unified JWT + Sanctum authentication.
     * Strategy: Try JWT first (fast), fallback to Sanctum (reliable).
     */
    public function handle(Request $request, Closure $next, ?string $guard = null): Response
    {
        try {
            // Strategy 1: Try JWT authentication first (fast)
            $jwtUser = $this->authenticateWithJWT($request);
            if ($jwtUser) {
                Auth::setUser($jwtUser);
                $request->merge(['auth_user' => $jwtUser, 'auth_method' => 'jwt']);
                $this->logApiAccess($request, $jwtUser, 'JWT');
                return $next($request);
            }

            // Strategy 2: Fallback to Sanctum authentication (reliable)
            $sanctumUser = $this->authenticateWithSanctum($request);
            if ($sanctumUser) {
                Auth::setUser($sanctumUser);
                $request->merge(['auth_user' => $sanctumUser, 'auth_method' => 'sanctum']);

                // Log that we're using fallback
                Log::info('Using Sanctum fallback for user', [
                    'user_id' => $sanctumUser->id,
                    'endpoint' => $request->url(),
                    'method' => $request->method()
                ]);

                $this->logApiAccess($request, $sanctumUser, 'Sanctum');
                return $next($request);
            }

            // If neither authentication method works, return unauthorized
            return $this->unauthorizedResponse('No valid authentication token provided');

        } catch (TokenExpiredException $e) {
            // JWT expired, try Sanctum as fallback
            $sanctumUser = $this->authenticateWithSanctum($request);
            if ($sanctumUser) {
                Auth::setUser($sanctumUser);
                $request->merge(['auth_user' => $sanctumUser, 'auth_method' => 'sanctum']);
                $this->logApiAccess($request, $sanctumUser, 'Sanctum (JWT Expired)');
                return $next($request);
            }

            return $this->unauthorizedResponse('Token has expired', 'TOKEN_EXPIRED');
        } catch (TokenInvalidException $e) {
            return $this->unauthorizedResponse('Invalid token', 'TOKEN_INVALID');
        } catch (JWTException $e) {
            return $this->unauthorizedResponse('JWT Token error: ' . $e->getMessage(), 'JWT_ERROR');
        } catch (\Exception $e) {
            Log::error('Unified Auth Middleware Error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request' => [
                    'url' => $request->url(),
                    'method' => $request->method(),
                    'ip' => $request->ip(),
                ]
            ]);

            return $this->unauthorizedResponse('Authentication failed', 'AUTH_ERROR');
        }
    }

    /**
     * Authenticate using JWT token (fast, stateless).
     */
    protected function authenticateWithJWT(Request $request): ?object
    {
        try {
            $token = $this->getJWTTokenFromRequest($request);

            if (!$token) {
                return null;
            }

            // Validate JWT token and get user
            $user = $this->authService->validateToken($token);

            return $user;
        } catch (\Exception $e) {
            // JWT authentication failed, return null to try Sanctum
            return null;
        }
    }

    /**
     * Authenticate using Sanctum token (reliable, database-backed).
     */
    protected function authenticateWithSanctum(Request $request): ?object
    {
        try {
            $token = $this->getSanctumTokenFromRequest($request);

            if (!$token) {
                return null;
            }

            // Find Sanctum token in database
            $accessToken = PersonalAccessToken::findToken($token);

            if (!$accessToken) {
                return null;
            }

            // Check if token is valid and not expired
            if ($accessToken->expires_at && $accessToken->expires_at->isPast()) {
                return null;
            }

            // Get user from token
            $user = $accessToken->tokenable;

            if (!$user) {
                return null;
            }

            // Update last used timestamp
            $accessToken->update(['last_used_at' => now()]);

            return $user;
        } catch (\Exception $e) {
            // Sanctum authentication failed
            return null;
        }
    }

    /**
     * Get JWT token from request.
     */
    protected function getJWTTokenFromRequest(Request $request): ?string
    {
        // Try Authorization header first (Bearer token)
        $authHeader = $request->header('Authorization');
        if ($authHeader && str_starts_with($authHeader, 'Bearer ')) {
            $token = substr($authHeader, 7);
            // Check if it looks like a JWT token (contains dots)
            if (str_contains($token, '.')) {
                return $token;
            }
        }

        // Try X-JWT-Token header
        $jwtToken = $request->header('X-JWT-Token');
        if ($jwtToken) {
            return $jwtToken;
        }

        // Try query parameter
        $queryToken = $request->query('jwt_token');
        if ($queryToken) {
            return $queryToken;
        }

        return null;
    }

    /**
     * Get Sanctum token from request.
     */
    protected function getSanctumTokenFromRequest(Request $request): ?string
    {
        // Try Authorization header (if not JWT)
        $authHeader = $request->header('Authorization');
        if ($authHeader && str_starts_with($authHeader, 'Bearer ')) {
            $token = substr($authHeader, 7);
            // If it doesn't look like JWT, treat as Sanctum
            if (!str_contains($token, '.')) {
                return $token;
            }
        }

        // Try X-Sanctum-Token header
        $sanctumToken = $request->header('X-Sanctum-Token');
        if ($sanctumToken) {
            return $sanctumToken;
        }

        // Try query parameter
        $queryToken = $request->query('sanctum_token');
        if ($queryToken) {
            return $queryToken;
        }

        return null;
    }

    /**
     * Log API access for audit purposes.
     */
    protected function logApiAccess(Request $request, $user, string $authMethod): void
    {
        // Only log if enabled in config
        if (!config('auth.log_api_access', false)) {
            return;
        }

        try {
            Log::info('API Access', [
                'user_id' => $user->id,
                'email' => $user->email,
                'organization_id' => $user->organization_id ?? null,
                'auth_method' => $authMethod,
                'url' => $request->url(),
                'method' => $request->method(),
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'timestamp' => now()->toISOString(),
            ]);
        } catch (\Exception $e) {
            // Don't let logging errors break the request
            Log::error('Failed to log API access', ['error' => $e->getMessage()]);
        }
    }

    /**
     * Return unauthorized response.
     */
    protected function unauthorizedResponse(string $message, string $code = 'UNAUTHORIZED'): JsonResponse
    {
        return $this->errorResponse($message, null, 401, $code);
    }
}
