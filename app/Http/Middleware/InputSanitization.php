<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class InputSanitization
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Only apply to organization registration endpoints
        if ($request->is('api/register-organization') || 
            $request->is('api/verify-organization-email') || 
            $request->is('api/resend-verification')) {
            
            $this->sanitizeInput($request);
        }

        return $next($request);
    }

    /**
     * Sanitize input data to prevent XSS and other attacks.
     */
    protected function sanitizeInput(Request $request): void
    {
        $input = $request->all();

        // Sanitize string inputs
        $stringFields = [
            'organization_name',
            'organization_email',
            'organization_phone',
            'organization_address',
            'organization_website',
            'business_type',
            'industry',
            'tax_id',
            'description',
            'admin_first_name',
            'admin_last_name',
            'admin_email',
            'admin_username',
            'admin_phone',
            'timezone',
            'locale',
            'currency',
        ];

        foreach ($stringFields as $field) {
            if (isset($input[$field]) && is_string($input[$field])) {
                // Remove null bytes and control characters
                $input[$field] = str_replace(["\0", "\x00"], '', $input[$field]);
                
                // Trim whitespace
                $input[$field] = trim($input[$field]);
                
                // Normalize line endings
                $input[$field] = str_replace(["\r\n", "\r"], "\n", $input[$field]);
                
                // Limit length to prevent buffer overflow attacks
                if (strlen($input[$field]) > 10000) {
                    $input[$field] = substr($input[$field], 0, 10000);
                }
            }
        }

        // Sanitize email fields specifically
        $emailFields = ['organization_email', 'admin_email'];
        foreach ($emailFields as $field) {
            if (isset($input[$field])) {
                $input[$field] = filter_var($input[$field], FILTER_SANITIZE_EMAIL);
                $input[$field] = strtolower(trim($input[$field]));
            }
        }

        // Sanitize URL fields
        if (isset($input['organization_website'])) {
            $input['organization_website'] = filter_var($input['organization_website'], FILTER_SANITIZE_URL);
        }

        // Sanitize phone numbers
        $phoneFields = ['organization_phone', 'admin_phone'];
        foreach ($phoneFields as $field) {
            if (isset($input[$field])) {
                // Remove all non-digit characters except + at the beginning
                $input[$field] = preg_replace('/[^\d+]/', '', $input[$field]);
                
                // Ensure + is only at the beginning
                if (strpos($input[$field], '+') !== 0 && strpos($input[$field], '+') !== false) {
                    $input[$field] = str_replace('+', '', $input[$field]);
                }
            }
        }

        // Sanitize tax ID
        if (isset($input['tax_id'])) {
            // Remove all non-alphanumeric characters except hyphens
            $input['tax_id'] = preg_replace('/[^A-Z0-9-]/', '', strtoupper($input[$field]));
        }

        // Sanitize boolean fields
        $booleanFields = ['terms_accepted', 'privacy_policy_accepted', 'marketing_consent'];
        foreach ($booleanFields as $field) {
            if (isset($input[$field])) {
                $input[$field] = filter_var($input[$field], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
            }
        }

        // Replace the request input with sanitized data
        $request->replace($input);
    }
}
