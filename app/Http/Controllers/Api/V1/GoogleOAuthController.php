<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Services\GoogleOAuthService;
use App\Services\UserManagementService;
use App\Models\Organization;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Exception;

/**
 * Google OAuth Controller
 * Controller untuk mengelola Google OAuth 2.0 authentication
 */
class GoogleOAuthController extends BaseApiController
{
    private GoogleOAuthService $googleOAuthService;
    private UserManagementService $userManagementService;

    public function __construct(
        GoogleOAuthService $googleOAuthService,
        UserManagementService $userManagementService
    ) {
        $this->googleOAuthService = $googleOAuthService;
        $this->userManagementService = $userManagementService;
    }

    /**
     * Redirect ke Google OAuth
     */
    public function redirectToGoogle(Request $request)
    {
        try {
            $organizationId = $request->input('organization_id');
            $redirectUrl = $request->input('redirect_url', 'http://localhost:3001/oauth/callback');

            $this->validateRedirectRequest($organizationId);

            $authData = $this->googleOAuthService->generateAuthUrl($organizationId, $redirectUrl);

            return $this->successResponse('Google OAuth URL generated successfully', $authData);

        } catch (Exception $e) {
            Log::error('Failed to redirect to Google OAuth', [
                'organization_id' => $request->input('organization_id'),
                'error' => $e->getMessage()
            ]);

            return $this->errorResponse('Failed to redirect to Google OAuth: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Handle Google OAuth callback (GET - for direct browser redirect)
     */
    public function handleGoogleCallback(Request $request)
    {
        try {
            $code = $request->input('code');
            $state = $request->input('state');
            $error = $request->input('error');

            if ($error) {
                return $this->handleOAuthError($error, $state);
            }

            $this->validateCallbackRequest($code, $state);

            $stateData = $this->googleOAuthService->validateState($state);
            if (!$stateData) {
                return $this->redirectToFrontendWithError('Invalid state parameter');
            }

            $googleUser = $this->processOAuthCallback($code, $stateData);
            $token = $this->userManagementService->generateToken($googleUser['user']);

            Log::info('Google OAuth successful', [
                'user_id' => $googleUser['user']->id,
                'organization_id' => $stateData['organization_id'],
                'google_id' => $googleUser['googleUser']->getId(),
                'email' => $googleUser['googleUser']->getEmail()
            ]);

            return $this->redirectToFrontendWithSuccess($token, $stateData['redirect_url']);

        } catch (Exception $e) {
            Log::error('Google OAuth callback failed', [
                'code' => $request->input('code'),
                'state' => $request->input('state'),
                'error' => $e->getMessage()
            ]);

            return $this->redirectToFrontendWithError('OAuth callback failed: ' . $e->getMessage());
        }
    }

    /**
     * Handle Google OAuth callback (POST - for frontend API call)
     */
    public function handleGoogleCallbackPost(Request $request)
    {
        try {
            $code = $request->input('code');
            $stateData = $request->input('state');
            $error = $request->input('error');

            if ($error) {
                return $this->handleOAuthError($error, null, true);
            }

            $this->validatePostCallbackRequest($code, $stateData);

            $googleUser = $this->processOAuthCallback($code, $stateData);
            $token = $this->userManagementService->generateToken($googleUser['user']);

            // Get user roles and permissions
            $userRoles = $googleUser['user']->roles;
            $userPermissions = [];
            foreach ($userRoles as $role) {
                $rolePermissions = $role->permissions;
                foreach ($rolePermissions as $permission) {
                    $userPermissions[] = $permission->name;
                }
            }
            $userPermissions = array_unique($userPermissions);

            return $this->successResponse('Google OAuth authentication successful', [
                'user' => [
                    'id' => $googleUser['user']->id,
                    'name' => $googleUser['user']->full_name,
                    'email' => $googleUser['user']->email,
                    'avatar' => $googleUser['user']->avatar_url,
                    'role' => $userRoles->first()?->name ?? 'customer',
                    'roles' => $userRoles->pluck('name')->toArray(),
                    'permissions' => $userPermissions,
                    'organization_id' => $googleUser['user']->organization_id,
                ],
                'token' => $token,
                'redirect_url' => $stateData['redirect_url'] ?? '/dashboard/google-drive'
            ]);

        } catch (Exception $e) {
            Log::error('Google OAuth callback POST failed', [
                'code' => $request->input('code'),
                'state' => $request->input('state'),
                'error' => $e->getMessage()
            ]);

            return $this->errorResponse('OAuth callback failed: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get OAuth status for current user
     */
    public function getOAuthStatus(Request $request)
    {
        try {
            $user = $request->user();
            $organizationId = $user->organization_id;

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
                    'connect_url' => '/auth/google/redirect'
                ]);
            }

            return $this->successResponse('OAuth status retrieved', [
                'has_oauth' => true,
                'service' => 'google',
                'connected' => true,
                'expires_at' => $credential->expires_at,
                'scope' => $credential->scope,
                'message' => 'Google Drive sudah terhubung'
            ]);

        } catch (Exception $e) {
            Log::error('Failed to get OAuth status', [
                'user_id' => $request->user()->id,
                'error' => $e->getMessage()
            ]);

            return $this->errorResponse('Failed to get OAuth status: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Revoke OAuth credential
     */
    public function revokeOAuth(Request $request)
    {
        try {
            $user = $request->user();
            $organizationId = $user->organization_id;

            $credential = \App\Models\OAuthCredential::forService('google')
                ->forOrganization($organizationId)
                ->forUser($user->id)
                ->first();

            if (!$credential) {
                return $this->errorResponse('No OAuth credential found to revoke', 404);
            }

            $credential->delete();

            Log::info('OAuth credential revoked', [
                'user_id' => $user->id,
                'credential_id' => $credential->id,
                'service' => 'google'
            ]);

            return $this->successResponse('OAuth credential revoked successfully');

        } catch (Exception $e) {
            Log::error('Failed to revoke OAuth credential', [
                'user_id' => $request->user()->id,
                'error' => $e->getMessage()
            ]);

            return $this->errorResponse('Failed to revoke OAuth credential: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Process OAuth callback and return user data
     */
    private function processOAuthCallback(string $code, array $stateData): array
    {
        $tokenData = $this->googleOAuthService->exchangeCodeForToken($code);
        $userData = $this->googleOAuthService->getUserInfo($tokenData['access_token']);

        $googleUser = $this->googleOAuthService->createGoogleUser($userData, $tokenData);
        $user = $this->userManagementService->findOrCreateUser($googleUser, $stateData['organization_id']);

        $this->userManagementService->createOrUpdateOAuthCredential($user, $googleUser, $stateData['organization_id']);

        return [
            'googleUser' => $googleUser,
            'user' => $user
        ];
    }

    /**
     * Validate redirect request
     */
    private function validateRedirectRequest(?string $organizationId): void
    {
        if (!$organizationId) {
            throw new Exception('Organization ID is required');
        }

        if (!Organization::find($organizationId)) {
            throw new Exception('Organization not found');
        }
    }

    /**
     * Validate callback request
     */
    private function validateCallbackRequest(?string $code, ?string $state): void
    {
        if (!$code) {
            throw new Exception('Authorization code is required');
        }

        if (!$state) {
            throw new Exception('State parameter is required');
        }
    }

    /**
     * Validate POST callback request
     */
    private function validatePostCallbackRequest(?string $code, ?array $stateData): void
    {
        if (!$code) {
            throw new Exception('Authorization code is required');
        }

        if (!$stateData || !isset($stateData['organization_id'])) {
            throw new Exception('Invalid state parameter');
        }
    }

    /**
     * Handle OAuth errors
     */
    private function handleOAuthError(string $error, ?string $state, bool $isPost = false): mixed
    {
        Log::error('Google OAuth error', [
            'error' => $error,
            'state' => $state
        ]);

        $message = 'OAuth error: ' . $error;
        $redirectUrl = $state ? $this->getRedirectUrlFromState($state) : 'http://localhost:3001/oauth/callback';

        if ($isPost) {
            return $this->errorResponse($message, 400);
        }

        return $this->redirectToFrontendWithError($message, $redirectUrl);
    }

    /**
     * Get redirect URL from state
     */
    private function getRedirectUrlFromState(?string $state): string
    {
        if (!$state) {
            return 'http://localhost:3001/oauth/callback';
        }

        $stateData = $this->googleOAuthService->validateState($state);
        return $stateData['redirect_url'] ?? 'http://localhost:3001/oauth/callback';
    }

    /**
     * Redirect to frontend with success
     */
    private function redirectToFrontendWithSuccess(string $token, string $redirectUrl): mixed
    {
        // Redirect to frontend with success parameters
        $url = $redirectUrl . '?success=true&token=' . urlencode($token);
        return redirect($url);
    }

    /**
     * Redirect to frontend with error
     */
    private function redirectToFrontendWithError(string $message, string $redirectUrl = 'http://localhost:3001/oauth/callback'): mixed
    {
        $url = $redirectUrl . '?success=false&error=' . urlencode($message);
        return redirect($url);
    }
}
