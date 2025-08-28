<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;
use App\Traits\Api\ApiResponseTrait;

class AdminOnly
{
    use ApiResponseTrait;

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        if (!$user) {
            return $this->unauthorizedResponse('User not authenticated');
        }

        // Check if user has admin role
        if (!in_array($user->role, ['super_admin', 'org_admin'])) {
            return $this->forbiddenResponse('Insufficient permissions. Admin access required.');
        }

        return $next($request);
    }
}
