<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;
use App\Traits\Api\ApiResponseTrait;

class SuperAdminMiddleware
{
    use ApiResponseTrait;

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if user is authenticated
        if (!Auth::check()) {
            return $this->unauthorizedResponse('Unauthenticated. Please login first.');
        }

        // Check if user is super admin
        if (Auth::user()->role !== 'super_admin') {
            return $this->forbiddenResponse('Unauthorized. Super admin access required.');
        }

        return $next($request);
    }
}
