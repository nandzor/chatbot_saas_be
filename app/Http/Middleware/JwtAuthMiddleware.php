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
use App\Traits\Api\ApiResponseTrait;

class JwtAuthMiddleware
{
    use ApiResponseTrait;

    protected AuthService $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, ?string $guard = null): Response
    {
        try {
            // Get token from request
            $token = $this->getTokenFromRequest($request);

            if (!$token) {
                return $this->unauthorizedResponse('Token not provided');
            }

            // Validate token and get user
            $user = $this->authService->validateToken($token);

            if (!$user) {
                return $this->unauthorizedResponse('Invalid or expired token');
            }

            // Set authenticated user
            Auth::setUser($user);

            // Add user to request for easy access
            $request->merge(['auth_user' => $user]);

            // Log API access
            $this->logApiAccess($request, $user);

            return $next($request);

        } catch (TokenExpiredException $e) {
            return $this->unauthorizedResponse('Token has expired', 'TOKEN_EXPIRED');
        } catch (TokenInvalidException $e) {
            return $this->unauthorizedResponse('Invalid token', 'TOKEN_INVALID');
        } catch (JWTException $e) {
            return $this->unauthorizedResponse('Token error: ' . $e->getMessage(), 'TOKEN_ERROR');
        } catch (\Exception $e) {
            Log::error('JWT Middleware Error', [
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
     * Get token from request.
     */
    protected function getTokenFromRequest(Request $request): ?string
    {
        // Try Authorization header first (Bearer token)
        $authHeader = $request->header('Authorization');
        if ($authHeader && str_starts_with($authHeader, 'Bearer ')) {
            return substr($authHeader, 7);
        }

        // Try X-Auth-Token header
        $authToken = $request->header('X-Auth-Token');
        if ($authToken) {
            return $authToken;
        }

        // Try query parameter (less secure, but useful for some scenarios)
        $queryToken = $request->query('token');
        if ($queryToken) {
            return $queryToken;
        }

        // Try cookie (for web sessions)
        $cookieToken = $request->cookie('auth_token');
        if ($cookieToken) {
            return $cookieToken;
        }

        return null;
    }

    /**
     * Log API access for audit purposes.
     */
    protected function logApiAccess(Request $request, $user): void
    {
        // Only log if enabled in config
        if (!config('auth.log_api_access', false)) {
            return;
        }

        try {
            Log::info('API Access', [
                'user_id' => $user->id,
                'email' => $user->email,
                'organization_id' => $user->organization_id,
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
