<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

/**
 * Google OAuth Service
 * Service untuk mengelola Google OAuth 2.0 authentication flow
 */
class GoogleOAuthService
{
    private string $clientId;
    private string $clientSecret;
    private string $redirectUri;

    public function __construct()
    {
        $this->clientId = config('services.google.client_id');
        $this->clientSecret = config('services.google.client_secret');
        $this->redirectUri = config('services.google.redirect');
    }

    /**
     * Exchange authorization code for access token
     */
    public function exchangeCodeForToken(string $code): array
    {
        try {
            $response = Http::post('https://oauth2.googleapis.com/token', [
                'client_id' => $this->clientId,
                'client_secret' => $this->clientSecret,
                'code' => $code,
                'grant_type' => 'authorization_code',
                'redirect_uri' => $this->redirectUri,
            ]);

            if (!$response->successful()) {
                throw new Exception('Failed to exchange code for token: ' . $response->body());
            }

            return $response->json();

        } catch (Exception $e) {
            Log::error('Failed to exchange code for token', [
                'error' => $e->getMessage(),
                'code' => substr($code, 0, 10) . '...' // Log partial code for debugging
            ]);
            throw $e;
        }
    }

    /**
     * Get user information from Google API
     */
    public function getUserInfo(string $accessToken): array
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $accessToken,
            ])->get('https://www.googleapis.com/oauth2/v2/userinfo');

            if (!$response->successful()) {
                throw new Exception('Failed to get user info: ' . $response->body());
            }

            return $response->json();

        } catch (Exception $e) {
            Log::error('Failed to get user info from Google', [
                'error' => $e->getMessage(),
                'access_token' => substr($accessToken, 0, 10) . '...'
            ]);
            throw $e;
        }
    }

    /**
     * Create Google OAuth user object compatible with Socialite
     */
    public function createGoogleUser(array $userData, array $tokenData): GoogleOAuthUserService
    {
        return new GoogleOAuthUserService($userData, $tokenData);
    }

    /**
     * Generate OAuth authorization URL
     */
    public function generateAuthUrl(string $organizationId, string $redirectUrl = 'http://localhost:3001/oauth/callback', ?string $userId = null): array
    {
        $state = $this->generateState($organizationId, $redirectUrl, $userId);

        $scopes = 'openid profile email https://www.googleapis.com/auth/drive';

        $authUrl = 'https://accounts.google.com/o/oauth2/v2/auth?' . http_build_query([
            'client_id' => $this->clientId,
            'redirect_uri' => $this->redirectUri,
            'scope' => $scopes,
            'response_type' => 'code',
            'state' => $state,
            'access_type' => 'offline',
            'prompt' => 'consent',
            'include_granted_scopes' => 'true',
        ]);

        return [
            'auth_url' => $authUrl,
            'state' => $state,
            'organization_id' => $organizationId,
            'redirect_url' => $redirectUrl,
            'user_id' => $userId
        ];
    }

    /**
     * Generate secure state parameter
     */
    private function generateState(string $organizationId, string $redirectUrl, ?string $userId = null): string
    {
        $stateData = [
            'organization_id' => $organizationId,
            'redirect_url' => $redirectUrl,
            'timestamp' => time(),
            'nonce' => bin2hex(random_bytes(16))
        ];

        // Add user_id if provided (for Google Drive integration)
        if ($userId) {
            $stateData['user_id'] = $userId;
        }

        return base64_encode(json_encode($stateData));
    }

    /**
     * Validate and decode state parameter
     */
    public function validateState(string $state): ?array
    {
        try {
            $decoded = json_decode(base64_decode($state), true);

            if (!$decoded || !isset($decoded['organization_id'])) {
                return null;
            }

            // Check if state is not too old (10 minutes)
            if (time() - $decoded['timestamp'] > 600) {
                Log::warning('State validation failed: expired', [
                    'age_seconds' => time() - $decoded['timestamp'],
                    'max_age_seconds' => 600
                ]);
                return null;
            }

            return $decoded;

        } catch (Exception $e) {
            Log::warning('Invalid state parameter', [
                'state' => substr($state, 0, 20) . '...',
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }
}
