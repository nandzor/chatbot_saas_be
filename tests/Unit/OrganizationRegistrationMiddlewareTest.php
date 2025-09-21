<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Http\Middleware\OrganizationRegistrationThrottle;
use App\Http\Middleware\SecurityHeaders;
use App\Http\Middleware\InputSanitization;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Cache\RateLimiter;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Config;

class OrganizationRegistrationMiddlewareTest extends TestCase
{
    protected OrganizationRegistrationThrottle $throttleMiddleware;
    protected SecurityHeaders $securityHeadersMiddleware;
    protected InputSanitization $inputSanitizationMiddleware;

    protected function setUp(): void
    {
        parent::setUp();

        $this->throttleMiddleware = new OrganizationRegistrationThrottle(
            app(RateLimiter::class)
        );

        $this->securityHeadersMiddleware = new SecurityHeaders();
        $this->inputSanitizationMiddleware = new InputSanitization();
    }

    /**
     * Test organization registration throttle middleware.
     */
    public function test_organization_registration_throttle_middleware(): void
    {
        // Clear cache to avoid rate limiting
        Cache::flush();

        $request = Request::create('/api/register-organization', 'POST', [
            'organization_name' => 'Test Organization',
            'organization_email' => 'org@test.com',
            'admin_email' => 'admin@test.com',
        ]);

        $request->setLaravelSession($this->app['session.store']);

        $response = $this->throttleMiddleware->handle($request, function ($req) {
            return new Response('Success', 200);
        }, 3, 15);

        $this->assertEquals(200, $response->getStatusCode());
        $this->assertTrue($response->headers->has('X-RateLimit-Limit'));
        $this->assertTrue($response->headers->has('X-RateLimit-Remaining'));
        $this->assertTrue($response->headers->has('X-RateLimit-Reset'));
    }

    /**
     * Test organization registration throttle middleware rate limiting.
     */
    public function test_organization_registration_throttle_rate_limiting(): void
    {
        $request = Request::create('/api/register-organization', 'POST', [
            'organization_name' => 'Test Organization',
            'organization_email' => 'org@test.com',
            'admin_email' => 'admin@test.com',
        ]);

        $request->setLaravelSession($this->app['session.store']);

        // Make multiple requests to trigger rate limiting
        for ($i = 0; $i < 5; $i++) {
            $response = $this->throttleMiddleware->handle($request, function ($req) {
                return new Response('Success', 200);
            }, 3, 15);

            if ($i >= 3) {
                $this->assertEquals(429, $response->getStatusCode());
                $this->assertTrue($response->headers->has('Retry-After'));
            }
        }
    }

    /**
     * Test security headers middleware.
     */
    public function test_security_headers_middleware(): void
    {
        $request = Request::create('/api/register-organization', 'POST');

        $response = $this->securityHeadersMiddleware->handle($request, function ($req) {
            return new Response('Success', 200);
        });

        $this->assertEquals(200, $response->getStatusCode());

        // Test security headers
        $this->assertEquals('nosniff', $response->headers->get('X-Content-Type-Options'));
        $this->assertEquals('DENY', $response->headers->get('X-Frame-Options'));
        $this->assertEquals('1; mode=block', $response->headers->get('X-XSS-Protection'));
        $this->assertEquals('strict-origin-when-cross-origin', $response->headers->get('Referrer-Policy'));
        $this->assertStringContainsString('default-src \'self\'', $response->headers->get('Content-Security-Policy'));

        // Test that server information is removed
        $this->assertNull($response->headers->get('Server'));
        $this->assertNull($response->headers->get('X-Powered-By'));
    }

    /**
     * Test security headers middleware for sensitive endpoints.
     */
    public function test_security_headers_middleware_sensitive_endpoints(): void
    {
        $sensitiveEndpoints = [
            '/api/register-organization',
            '/api/verify-organization-email',
            '/api/resend-verification',
        ];

        foreach ($sensitiveEndpoints as $endpoint) {
            $request = Request::create($endpoint, 'POST');

            $response = $this->securityHeadersMiddleware->handle($request, function ($req) {
                return new Response('Success', 200);
            });

            $cacheControl = $response->headers->get('Cache-Control');
            $this->assertStringContainsString('no-cache', $cacheControl);
            $this->assertStringContainsString('no-store', $cacheControl);
            $this->assertStringContainsString('must-revalidate', $cacheControl);
            $this->assertEquals('no-cache', $response->headers->get('Pragma'));
            $this->assertEquals('0', $response->headers->get('Expires'));
        }
    }

    /**
     * Test input sanitization middleware.
     */
    public function test_input_sanitization_middleware(): void
    {
        $request = Request::create('/api/register-organization', 'POST', [
            'organization_name' => '<script>alert("xss")</script>Test Organization',
            'organization_email' => '  ORG@TEST.COM  ',
            'admin_first_name' => '  John  ',
            'admin_last_name' => 'Doe',
            'admin_email' => '  ADMIN@TEST.COM  ',
            'organization_phone' => '+62 812 3456 7890',
            'admin_phone' => '+62 812 3456 7891',
            'tax_id' => '12.3456.789.0-123.000',
            'terms_accepted' => 'true',
            'privacy_policy_accepted' => 'false',
        ]);

        $response = $this->inputSanitizationMiddleware->handle($request, function ($req) {
            return new Response('Success', 200);
        });

        $this->assertEquals(200, $response->getStatusCode());

        // Test that input was sanitized
        $this->assertEquals('Test Organization', $request->input('organization_name'));
        $this->assertEquals('org@test.com', $request->input('organization_email'));
        $this->assertEquals('John', $request->input('admin_first_name'));
        $this->assertEquals('admin@test.com', $request->input('admin_email'));
        $this->assertEquals('+6281234567890', $request->input('organization_phone'));
        $this->assertEquals('+6281234567891', $request->input('admin_phone'));
        $this->assertEquals('1234567890123000', $request->input('tax_id'));
        $this->assertTrue($request->input('terms_accepted'));
        $this->assertFalse($request->input('privacy_policy_accepted'));
    }

    /**
     * Test input sanitization middleware with non-organization endpoints.
     */
    public function test_input_sanitization_middleware_non_organization_endpoints(): void
    {
        $request = Request::create('/api/other-endpoint', 'POST', [
            'organization_name' => '<script>alert("xss")</script>Test Organization',
            'organization_email' => '  ORG@TEST.COM  ',
        ]);

        $response = $this->inputSanitizationMiddleware->handle($request, function ($req) {
            return new Response('Success', 200);
        });

        $this->assertEquals(200, $response->getStatusCode());

        // Input should not be sanitized for non-organization endpoints
        $this->assertEquals('<script>alert("xss")</script>Test Organization', $request->input('organization_name'));
        $this->assertEquals('  ORG@TEST.COM  ', $request->input('organization_email'));
    }

    /**
     * Test input sanitization middleware with null bytes.
     */
    public function test_input_sanitization_middleware_null_bytes(): void
    {
        $request = Request::create('/api/register-organization', 'POST', [
            'organization_name' => "Test\x00Organization",
            'admin_first_name' => "John\x00Doe",
        ]);

        $response = $this->inputSanitizationMiddleware->handle($request, function ($req) {
            return new Response('Success', 200);
        });

        $this->assertEquals(200, $response->getStatusCode());

        // Null bytes should be removed
        $this->assertEquals('TestOrganization', $request->input('organization_name'));
        $this->assertEquals('JohnDoe', $request->input('admin_first_name'));
    }

    /**
     * Test input sanitization middleware with long strings.
     */
    public function test_input_sanitization_middleware_long_strings(): void
    {
        $longString = str_repeat('a', 15000); // 15KB string

        $request = Request::create('/api/register-organization', 'POST', [
            'organization_name' => $longString,
            'description' => $longString,
        ]);

        $response = $this->inputSanitizationMiddleware->handle($request, function ($req) {
            return new Response('Success', 200);
        });

        $this->assertEquals(200, $response->getStatusCode());

        // Long strings should be truncated
        $this->assertEquals(10000, strlen($request->input('organization_name')));
        $this->assertEquals(10000, strlen($request->input('description')));
    }

    /**
     * Test input sanitization middleware with invalid URLs.
     */
    public function test_input_sanitization_middleware_invalid_urls(): void
    {
        $request = Request::create('/api/register-organization', 'POST', [
            'organization_website' => 'not-a-valid-url',
        ]);

        $response = $this->inputSanitizationMiddleware->handle($request, function ($req) {
            return new Response('Success', 200);
        });

        $this->assertEquals(200, $response->getStatusCode());

        // Invalid URLs should be filtered
        $this->assertEquals('', $request->input('organization_website'));
    }

    /**
     * Test input sanitization middleware with invalid boolean values.
     */
    public function test_input_sanitization_middleware_invalid_booleans(): void
    {
        $request = Request::create('/api/register-organization', 'POST', [
            'terms_accepted' => 'invalid-boolean',
            'privacy_policy_accepted' => 'yes',
            'marketing_consent' => 'no',
        ]);

        $response = $this->inputSanitizationMiddleware->handle($request, function ($req) {
            return new Response('Success', 200);
        });

        $this->assertEquals(200, $response->getStatusCode());

        // Invalid boolean values should be null
        $this->assertNull($request->input('terms_accepted'));
        $this->assertTrue($request->input('privacy_policy_accepted'));
        $this->assertFalse($request->input('marketing_consent'));
    }

    /**
     * Test middleware chain.
     */
    public function test_middleware_chain(): void
    {
        // Clear cache to avoid rate limiting
        Cache::flush();

        $request = Request::create('/api/register-organization', 'POST', [
            'organization_name' => '<script>alert("xss")</script>Test Organization',
            'organization_email' => '  ORG@TEST.COM  ',
            'admin_first_name' => 'John',
            'admin_last_name' => 'Doe',
            'admin_username' => 'johndoe',
            'admin_email' => 'admin@test.com',
            'admin_password' => 'Password123!',
            'admin_password_confirmation' => 'Password123!',
            'terms_accepted' => true,
            'privacy_policy_accepted' => true,
        ]);

        $request->setLaravelSession($this->app['session.store']);

        // Apply all middleware in sequence
        $response = $this->inputSanitizationMiddleware->handle($request, function ($req) {
            return $this->securityHeadersMiddleware->handle($req, function ($req) {
                return $this->throttleMiddleware->handle($req, function ($req) {
                    return new Response('Success', 200);
                }, 3, 15);
            });
        });

        $this->assertEquals(200, $response->getStatusCode());

        // Test that input was sanitized
        $this->assertEquals('Test Organization', $request->input('organization_name'));
        $this->assertEquals('org@test.com', $request->input('organization_email'));

        // Test that security headers were applied
        $this->assertEquals('nosniff', $response->headers->get('X-Content-Type-Options'));
        $this->assertEquals('DENY', $response->headers->get('X-Frame-Options'));

        // Test that rate limiting headers were applied
        $this->assertTrue($response->headers->has('X-RateLimit-Limit'));
        $this->assertTrue($response->headers->has('X-RateLimit-Remaining'));
        $this->assertTrue($response->headers->has('X-RateLimit-Reset'));
    }

    /**
     * Test middleware error handling.
     */
    public function test_middleware_error_handling(): void
    {
        // Test with invalid request
        $request = Request::create('/api/register-organization', 'POST', []);

        $response = $this->inputSanitizationMiddleware->handle($request, function ($req) {
            return new Response('Success', 200);
        });

        $this->assertEquals(200, $response->getStatusCode());

        // Test with empty request
        $request = Request::create('/api/register-organization', 'POST');

        $response = $this->securityHeadersMiddleware->handle($request, function ($req) {
            return new Response('Success', 200);
        });

        $this->assertEquals(200, $response->getStatusCode());
    }
}
