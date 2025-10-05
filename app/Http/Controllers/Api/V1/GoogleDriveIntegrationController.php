<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Services\GoogleOAuthService;
use App\Services\UserManagementService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Exception;

/**
 * Google Drive Integration Controller
 * Controller khusus untuk integrasi Google Drive (tidak membuat user baru)
 */
class GoogleDriveIntegrationController extends BaseApiController
{
    protected GoogleOAuthService $googleOAuthService;
    protected UserManagementService $userManagementService;

    public function __construct(GoogleOAuthService $googleOAuthService, UserManagementService $userManagementService)
    {
        $this->googleOAuthService = $googleOAuthService;
        $this->userManagementService = $userManagementService;
    }

    /**
     * Redirect ke Google OAuth untuk integrasi Google Drive
     */
    public function redirectToGoogle(Request $request)
    {
        try {
            $organizationId = $request->input('organization_id');
            $userId = $request->input('user_id'); // Get user_id for Google Drive integration
            $redirectUrl = $request->input('redirect_url', 'http://localhost:3001/oauth/callback');

            // Validate organization_id
            if (!$organizationId) {
                return $this->errorResponse('Organization ID is required', 400);
            }

            // Validate user_id for Google Drive integration
            if (!$userId) {
                return $this->errorResponse('User ID is required for Google Drive integration', 400);
            }

            // Check if organization exists
            $organization = \App\Models\Organization::find($organizationId);
            if (!$organization) {
                return $this->errorResponse('Organization not found', 404);
            }

            $authUrlData = $this->googleOAuthService->generateAuthUrl($organizationId, $redirectUrl, $userId);

            return $this->successResponse('Google OAuth URL generated successfully', $authUrlData);

        } catch (Exception $e) {
            Log::error('Failed to redirect to Google OAuth for integration', [
                'organization_id' => $request->input('organization_id'),
                'user_id' => $request->input('user_id'),
                'redirect_url' => $request->input('redirect_url'),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponse('Failed to redirect to Google OAuth: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Handle Google OAuth callback untuk integrasi Google Drive
     */
    public function handleGoogleCallback(Request $request)
    {
        try {
            $code = $request->input('code');
            $state = $request->input('state');
            $error = $request->input('error');

            // Handle OAuth errors
            if ($error) {
                Log::error('Google OAuth error', [
                    'error' => $error,
                    'error_description' => $request->input('error_description')
                ]);
                return redirect('http://localhost:3001/oauth/callback?error=' . urlencode($error));
            }

            if (!$code) {
                return redirect('http://localhost:3001/oauth/callback?error=' . urlencode('Authorization code is required'));
            }

            // Validate state parameter
            $stateData = $this->googleOAuthService->validateState($state);
            if (!$stateData) {
                return redirect('http://localhost:3001/oauth/callback?error=' . urlencode('Invalid state parameter'));
            }

            // Get Google user data using manual OAuth flow (stateless)
            $tokenData = $this->googleOAuthService->exchangeCodeForToken($code);
            $userInfo = $this->googleOAuthService->getUserInfo($tokenData['access_token']);
            $googleUser = $this->googleOAuthService->createGoogleUser($userInfo, $tokenData);

            // Get user ID from state (should be provided by frontend)
            $userId = $stateData['user_id'] ?? null;
            if (!$userId) {
                return redirect(($stateData['redirect_url'] ?? 'http://localhost:3001/oauth/callback') . '?error=' . urlencode('User ID is required for Google Drive integration'));
            }

            // Handle Google Drive integration (no user creation, no token generation)
            $result = $this->userManagementService->handleGoogleDriveIntegration(
                $userId,
                $googleUser,
                $stateData['organization_id']
            );

            // Log successful integration
            Log::info('Google Drive integration successful', [
                'user_id' => $userId,
                'organization_id' => $stateData['organization_id'],
                'google_id' => $googleUser->getId(),
                'email' => $googleUser->getEmail()
            ]);

            // Redirect to frontend with success (no token needed)
            return redirect(($stateData['redirect_url'] ?? 'http://localhost:3001/oauth/callback') . '?success=true');

        } catch (Exception $e) {
            Log::error('Google Drive integration callback failed', [
                'code' => $request->input('code'),
                'state' => $request->input('state'),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect('http://localhost:3001/oauth/callback?error=' . urlencode('Google Drive integration failed: ' . $e->getMessage()));
        }
    }

    /**
     * Handle Google OAuth callback untuk integrasi Google Drive (POST - untuk frontend API call)
     */
    public function handleGoogleCallbackPost(Request $request)
    {
        try {
            $code = $request->input('code');
            $stateData = $request->input('state');
            $error = $request->input('error');

            // Handle OAuth errors
            if ($error) {
                Log::error('Google OAuth error', [
                    'error' => $error,
                    'error_description' => $request->input('error_description')
                ]);
                return $this->errorResponse('OAuth error: ' . $error, 400);
            }

            if (!$code) {
                return $this->errorResponse('Authorization code is required', 400);
            }

            if (!$stateData || !isset($stateData['organization_id'])) {
                return $this->errorResponse('Invalid state parameter', 400);
            }

            // Get user ID from state (should be provided by frontend)
            $userId = $stateData['user_id'] ?? null;
            if (!$userId) {
                return $this->errorResponse('User ID is required for Google Drive integration', 400);
            }

            // Get Google user data using the code (stateless for API)
            $tokenData = $this->googleOAuthService->exchangeCodeForToken($code);
            $userInfo = $this->googleOAuthService->getUserInfo($tokenData['access_token']);
            $googleUser = $this->googleOAuthService->createGoogleUser($userInfo, $tokenData);

            // Handle Google Drive integration (no user creation, no token generation)
            $result = $this->userManagementService->handleGoogleDriveIntegration(
                $userId,
                $googleUser,
                $stateData['organization_id']
            );

            return $this->successResponse('Google Drive integration successful', [
                'user' => [
                    'id' => $result['user']->id,
                    'name' => $result['user']->full_name,
                    'email' => $result['user']->email,
                    'avatar' => $result['user']->avatar_url,
                    'role' => $result['user']->role,
                    'organization_id' => $result['user']->organization_id,
                ],
                'credential' => [
                    'id' => $result['credential']->id,
                    'service' => $result['credential']->service,
                    'expires_at' => $result['credential']->expires_at,
                ],
                'redirect_url' => $stateData['redirect_url'] ?? '/dashboard/google-drive'
            ]);

        } catch (Exception $e) {
            Log::error('Google Drive integration callback POST failed', [
                'code' => $request->input('code'),
                'state' => $request->input('state'),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponse('Google Drive integration failed: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get OAuth status untuk Google Drive integration
     */
    public function getOAuthStatus(Request $request)
    {
        try {
            $user = $request->user();
            $organizationId = $user->organization_id;

            // Get OAuth credential first
            $credential = \App\Models\OAuthCredential::forService('google')
                ->forOrganization($organizationId)
                ->forUser($user->id)
                ->first();

            if (!$credential) {
                return $this->successResponse('OAuth status retrieved', [
                    'has_oauth' => false,
                    'service' => 'google',
                    'connected' => false,
                    'message' => 'Google Drive belum terhubung. Silakan hubungkan akun Google Drive Anda terlebih dahulu.',
                    'action_required' => 'connect',
                    'connect_url' => '/auth/google-drive/redirect'
                ]);
            }

            // Create GoogleDriveService instance with credentials
            $googleDriveService = new \App\Services\GoogleDriveService($credential->access_token, $credential->refresh_token);
            $status = $googleDriveService->getOAuthStatus($user->id, $organizationId);

            return $this->successResponse('OAuth status retrieved', $status);

        } catch (Exception $e) {
            Log::error('Failed to get OAuth status', [
                'user_id' => $request->user()->id,
                'error' => $e->getMessage()
            ]);

            return $this->errorResponse('Failed to get OAuth status: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Revoke OAuth credential untuk Google Drive integration
     */
    public function revokeOAuth(Request $request)
    {
        try {
            $user = $request->user();
            $organizationId = $user->organization_id;

            // Revoke OAuth credential by deleting it
            \App\Models\OAuthCredential::forService('google')
                ->forOrganization($organizationId)
                ->forUser($user->id)
                ->delete();

            return $this->successResponse('Google Drive integration revoked successfully');

        } catch (Exception $e) {
            Log::error('Failed to revoke Google Drive integration', [
                'user_id' => $request->user()->id,
                'error' => $e->getMessage()
            ]);

            return $this->errorResponse('Failed to revoke Google Drive integration: ' . $e->getMessage(), 500);
        }
    }
}
