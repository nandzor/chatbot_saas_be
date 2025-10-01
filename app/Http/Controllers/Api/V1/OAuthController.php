<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Services\GoogleOAuthService;
use App\Services\N8nCredentialService;
use App\Services\OAuthErrorHandler;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Log;
use Exception;

/**
 * OAuth Controller
 * Controller untuk mengelola OAuth flow dan credential management
 */
class OAuthController extends BaseApiController
{
    protected $googleOAuthService;
    protected $n8nCredentialService;
    protected $errorHandler;

    public function __construct(
        GoogleOAuthService $googleOAuthService,
        N8nCredentialService $n8nCredentialService,
        OAuthErrorHandler $errorHandler
    ) {
        $this->googleOAuthService = $googleOAuthService;
        $this->n8nCredentialService = $n8nCredentialService;
        $this->errorHandler = $errorHandler;
    }

    /**
     * Generate OAuth authorization URL
     */
    public function generateAuthUrl(Request $request)
    {
        try {
            $service = $request->input('service');
            $organizationId = $request->input('organizationId');

            // Validate input
            if (!$service || !$organizationId) {
                return $this->errorResponse('Service and organization ID are required', 400);
            }

            // Validate service
            $allowedServices = ['google-sheets', 'google-docs', 'google-drive'];
            if (!in_array($service, $allowedServices)) {
                return $this->errorResponse('Invalid service. Allowed services: ' . implode(', ', $allowedServices), 400);
            }

            // Generate OAuth URL
            $authUrl = $this->googleOAuthService->generateAuthUrl($service, $organizationId);

            return $this->successResponse(
                'OAuth authorization URL generated successfully',
                [
                    'authUrl' => $authUrl,
                    'service' => $service,
                    'organizationId' => $organizationId,
                    'expiresIn' => 600, // 10 minutes
                    'state' => json_encode([
                        'service' => $service,
                        'organization_id' => $organizationId,
                        'timestamp' => time()
                    ])
                ]
            );

        } catch (Exception $e) {
            $errorResult = $this->errorHandler->handleOAuthError($e, 'Generate OAuth URL');

            return $this->errorResponse(
                $errorResult['user_message'],
                $this->getHttpStatusCode($errorResult['error_code']),

            );
        }
    }

    /**
     * Handle OAuth callback and create N8N credential
     */
    public function handleCallback(Request $request)
    {
        try {
            $code = $request->input('code');
            $state = $request->input('state');
            $service = $request->input('service');
            $organizationId = $request->input('organizationId');

            if (!$code) {
                return $this->errorResponse('Authorization code is required', 400);
            }

            // Parse state if provided
            if ($state) {
                $stateData = json_decode($state, true);
                $service = $service ?: $stateData['service'] ?? null;
                $organizationId = $organizationId ?: $stateData['organization_id'] ?? null;
            }

            if (!$service || !$organizationId) {
                return $this->errorResponse('Service and organization ID are required', 400);
            }

            // Step 1: Exchange code for tokens
            $tokenData = $this->googleOAuthService->exchangeCodeForToken($code);

            // Step 2: Test OAuth connection
            $connectionTest = $this->googleOAuthService->testOAuthConnection(
                $service,
                $tokenData['access_token']
            );

            if (!$connectionTest['success']) {
                return $this->errorResponse('OAuth connection test failed: ' . $connectionTest['error'], 400);
            }

            // Step 3: Create credential in N8N credential service
            $credentialResult = $this->n8nCredentialService->createOAuthCredential(
                $service,
                $tokenData['access_token'],
                $tokenData['refresh_token'],
                now()->addSeconds($tokenData['expires_in'])
            );

            if (!$credentialResult['success']) {
                return $this->errorResponse('Failed to create N8N credential: ' . $credentialResult['error'], 500);
            }

            // Step 4: Store credential reference in database
            $credentialRef = $this->storeCredentialReference(
                $organizationId,
                $service,
                $credentialResult['data']['id'],
                $tokenData
            );

            // Step 5: Test N8N credential
            $credentialTest = $this->n8nCredentialService->testCredential($credentialResult['data']['id']);

            return $this->successResponse(
                'OAuth integration completed successfully',
                [
                    'credential' => $credentialResult['data'],
                    'credentialRef' => $credentialRef,
                    'connectionTest' => $connectionTest['data'],
                    'credentialTest' => $credentialTest['success'] ? $credentialTest['data'] : null,
                    'service' => $service,
                    'organizationId' => $organizationId
                ]
            );

        } catch (Exception $e) {
            Log::error('OAuth callback failed', [
                'code' => $request->input('code'),
                'state' => $request->input('state'),
                'service' => $request->input('service'),
                'organizationId' => $request->input('organizationId'),
                'error' => $e->getMessage()
            ]);

            return $this->errorResponse('OAuth callback failed: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get files from Google service
     */
    public function getFiles(Request $request)
    {
        try {
            $service = $request->input('service');
            $organizationId = $request->input('organizationId');
            $pageSize = $request->input('pageSize', 100);
            $pageToken = $request->input('pageToken');

            if (!$service || !$organizationId) {
                return $this->errorResponse('Service and organization ID are required', 400);
            }

            // Get credential from database
            $credential = $this->getCredentialFromDatabase($organizationId, $service);
            if (!$credential) {
                return $this->errorResponse('No OAuth credential found for this service', 404);
            }

            // Check if token is expired and refresh if needed
            $accessToken = $this->ensureValidToken($credential);

            // Get files from Google
            $filesResult = $this->googleOAuthService->getFiles($accessToken, $service, $pageSize, $pageToken);

            if (!$filesResult['success']) {
                return $this->errorResponse('Failed to get files: ' . $filesResult['error'], 500);
            }

            return $this->successResponse(
                'Files retrieved successfully',
                $filesResult['data']
            );

        } catch (Exception $e) {
            Log::error('Failed to get files', [
                'service' => $request->input('service'),
                'organizationId' => $request->input('organizationId'),
                'error' => $e->getMessage()
            ]);

            return $this->errorResponse('Failed to get files: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get file details
     */
    public function getFileDetails(Request $request)
    {
        try {
            $service = $request->input('service');
            $organizationId = $request->input('organizationId');
            $fileId = $request->input('fileId');

            if (!$service || !$organizationId || !$fileId) {
                return $this->errorResponse('Service, organization ID, and file ID are required', 400);
            }

            // Get credential from database
            $credential = $this->getCredentialFromDatabase($organizationId, $service);
            if (!$credential) {
                return $this->errorResponse('No OAuth credential found for this service', 404);
            }

            // Check if token is expired and refresh if needed
            $accessToken = $this->ensureValidToken($credential);

            // Get file details from Google
            $fileResult = $this->googleOAuthService->getFileDetails($accessToken, $fileId, $service);

            if (!$fileResult['success']) {
                return $this->errorResponse('Failed to get file details: ' . $fileResult['error'], 500);
            }

            return $this->successResponse(
                'File details retrieved successfully',
                $fileResult['data']
            );

        } catch (Exception $e) {
            Log::error('Failed to get file details', [
                'service' => $request->input('service'),
                'organizationId' => $request->input('organizationId'),
                'fileId' => $request->input('fileId'),
                'error' => $e->getMessage()
            ]);

            return $this->errorResponse('Failed to get file details: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Test OAuth connection
     */
    public function testConnection(Request $request)
    {
        try {
            $service = $request->input('service');
            $organizationId = $request->input('organizationId');

            if (!$service || !$organizationId) {
                return $this->errorResponse('Service and organization ID are required', 400);
            }

            // Get credential from database
            $credential = $this->getCredentialFromDatabase($organizationId, $service);
            if (!$credential) {
                return $this->errorResponse('No OAuth credential found for this service', 404);
            }

            // Check if token is expired and refresh if needed
            $accessToken = $this->ensureValidToken($credential);

            // Test connection
            $testResult = $this->googleOAuthService->testOAuthConnection($service, $accessToken);

            return $this->successResponse(
                'Connection test completed',
                $testResult
            );

        } catch (Exception $e) {
            Log::error('OAuth connection test failed', [
                'service' => $request->input('service'),
                'organizationId' => $request->input('organizationId'),
                'error' => $e->getMessage()
            ]);

            return $this->errorResponse('Connection test failed: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Create workflow with OAuth credential
     */
    public function createWorkflow(Request $request)
    {
        try {
            $service = $request->input('service');
            $organizationId = $request->input('organizationId');
            $selectedFiles = $request->input('selectedFiles', []);
            $workflowConfig = $request->input('workflowConfig', []);

            if (!$service || !$organizationId) {
                return $this->errorResponse('Service and organization ID are required', 400);
            }

            // Get credential from database
            $credential = $this->getCredentialFromDatabase($organizationId, $service);
            if (!$credential) {
                return $this->errorResponse('No OAuth credential found for this service', 404);
            }

            // Create workflow for each selected file
            $workflows = [];
            foreach ($selectedFiles as $file) {
                // Create workflow via N8N (simplified for now, just store reference)
                $workflowData = [
                    'name' => "OAuth_{$service}_{$file['id']}_Workflow",
                    'type' => 'oauth_google_' . $service,
                    'credentialId' => $credential->n8n_credential_id,
                    'organizationId' => $organizationId,
                    'fileId' => $file['id'],
                    'fileName' => $file['name'],
                    'config' => $workflowConfig,
                    'active' => true
                ];

                // For now, just add to workflows array
                // TODO: Implement actual workflow creation in N8N
                $workflows[] = $workflowData;

                Log::info('Workflow created for file', [
                    'fileId' => $file['id'],
                    'fileName' => $file['name'],
                    'workflowName' => $workflowData['name']
                ]);
            }

            return $this->successResponse(
                'Workflows created successfully',
                [
                    'workflows' => $workflows,
                    'totalCreated' => count($workflows),
                    'totalRequested' => count($selectedFiles)
                ]
            );

        } catch (Exception $e) {
            Log::error('Failed to create workflows', [
                'service' => $request->input('service'),
                'organizationId' => $request->input('organizationId'),
                'selectedFiles' => $request->input('selectedFiles'),
                'error' => $e->getMessage()
            ]);

            return $this->errorResponse('Failed to create workflows: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Revoke OAuth credential
     */
    public function revokeCredential(Request $request)
    {
        try {
            $service = $request->input('service');
            $organizationId = $request->input('organizationId');

            if (!$service || !$organizationId) {
                return $this->errorResponse('Service and organization ID are required', 400);
            }

            // Get credential from database
            $credential = $this->getCredentialFromDatabase($organizationId, $service);
            if (!$credential) {
                return $this->errorResponse('No OAuth credential found for this service', 404);
            }

            // Delete credential from N8N
            $deleteResult = $this->n8nCredentialService->deleteCredential($credential->n8n_credential_id);

            if (!$deleteResult['success']) {
                Log::warning('Failed to delete N8N credential', [
                    'credentialId' => $credential->n8n_credential_id,
                    'error' => $deleteResult['error']
                ]);
            }

            // Delete credential from database
            DB::table('oauth_credentials')
                ->where('organization_id', $organizationId)
                ->where('service', $service)
                ->delete();

            return $this->successResponse(
                'OAuth credential revoked successfully',
                [
                    'service' => $service,
                    'organizationId' => $organizationId,
                    'revoked' => true
                ]
            );

        } catch (Exception $e) {
            Log::error('Failed to revoke OAuth credential', [
                'service' => $request->input('service'),
                'organizationId' => $request->input('organizationId'),
                'error' => $e->getMessage()
            ]);

            return $this->errorResponse('Failed to revoke credential: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Store credential reference in database
     */
    private function storeCredentialReference($organizationId, $service, $credentialId, $tokenData)
    {
        $credentialRef = [
            'organization_id' => $organizationId,
            'service' => $service,
            'n8n_credential_id' => $credentialId,
            'access_token' => Crypt::encrypt($tokenData['access_token']),
            'refresh_token' => Crypt::encrypt($tokenData['refresh_token']),
            'expires_at' => now()->addSeconds($tokenData['expires_in']),
            'scope' => $tokenData['scope'] ?? '',
            'created_at' => now(),
            'updated_at' => now()
        ];

        DB::table('oauth_credentials')->updateOrInsert(
            [
                'organization_id' => $organizationId,
                'service' => $service
            ],
            $credentialRef
        );

        return $credentialRef;
    }

    /**
     * Get credential from database
     */
    private function getCredentialFromDatabase($organizationId, $service)
    {
        return DB::table('oauth_credentials')
            ->where('organization_id', $organizationId)
            ->where('service', $service)
            ->first();
    }

    /**
     * Ensure token is valid and refresh if needed
     */
    private function ensureValidToken($credential)
    {
        // Check if token is expired
        if (now()->gt($credential->expires_at)) {
            // Refresh token
            $refreshToken = Crypt::decrypt($credential->refresh_token);
            $newTokenData = $this->googleOAuthService->refreshAccessToken($refreshToken);

            // Update credential in N8N
            $this->n8nCredentialService->updateOAuthCredential(
                $credential->n8n_credential_id,
                $newTokenData['access_token'],
                now()->addSeconds($newTokenData['expires_in'])
            );

            // Update database
            DB::table('oauth_credentials')
                ->where('id', $credential->id)
                ->update([
                    'access_token' => Crypt::encrypt($newTokenData['access_token']),
                    'expires_at' => now()->addSeconds($newTokenData['expires_in']),
                    'updated_at' => now()
                ]);

            return $newTokenData['access_token'];
        }

        return Crypt::decrypt($credential->access_token);
    }

    /**
     * Get HTTP status code berdasarkan error code
     */
    private function getHttpStatusCode(string $errorCode): int
    {
        return match($errorCode) {
            'invalid_request', 'invalid_scope', 'unsupported_grant_type' => 400,
            'invalid_client', 'invalid_credentials', 'invalid_token' => 401,
            'access_denied', 'unauthorized_client', 'insufficient_permissions' => 403,
            'invalid_grant', 'token_expired', 'refresh_token_expired' => 401,
            'quota_exceeded', 'rate_limit_exceeded' => 429,
            'server_error', 'temporarily_unavailable', 'service_unavailable' => 503,
            'network_timeout', 'network_unreachable' => 408,
            'database_connection_failed', 'credential_storage_failed' => 503,
            'n8n_connection_failed', 'n8n_credential_creation_failed' => 503,
            'configuration_error', 'feature_disabled' => 503,
            'maintenance_mode' => 503,
            default => 500
        };
    }

    /**
     * Validate OAuth callback parameters
     */
    private function validateCallbackParameters(Request $request): array
    {
        $code = $request->input('code');
        $state = $request->input('state');
        $error = $request->input('error');
        $errorDescription = $request->input('error_description');

        // Check for OAuth errors
        if ($error) {
            return [
                'valid' => false,
                'error' => $error,
                'error_description' => $errorDescription,
                'message' => $this->getUserFriendlyErrorMessage($error)
            ];
        }

        // Validate required parameters
        if (!$code) {
            return [
                'valid' => false,
                'error' => 'missing_code',
                'message' => 'Authorization code is required'
            ];
        }

        // Parse and validate state
        $stateData = null;
        if ($state) {
            try {
                $stateData = json_decode($state, true);
                if (json_last_error() !== JSON_ERROR_NONE) {
                    return [
                        'valid' => false,
                        'error' => 'invalid_state',
                        'message' => 'Invalid state parameter'
                    ];
                }
            } catch (Exception $e) {
                return [
                    'valid' => false,
                    'error' => 'invalid_state',
                    'message' => 'Invalid state parameter'
                ];
            }
        }

        return [
            'valid' => true,
            'code' => $code,
            'state' => $state,
            'stateData' => $stateData
        ];
    }

    /**
     * Get user-friendly error message
     */
    private function getUserFriendlyErrorMessage($error)
    {
        $errorMessages = [
            'access_denied' => 'Access was denied. Please try again.',
            'invalid_request' => 'Invalid request. Please check your parameters.',
            'invalid_client' => 'Invalid client configuration.',
            'invalid_grant' => 'Invalid authorization grant.',
            'unsupported_grant_type' => 'Unsupported grant type.',
            'invalid_scope' => 'Invalid scope requested.',
            'server_error' => 'Server error occurred. Please try again later.',
            'temporarily_unavailable' => 'Service temporarily unavailable.',
            'quota_exceeded' => 'API quota exceeded. Please try again later.',
            'rate_limit_exceeded' => 'Rate limit exceeded. Please try again later.',
        ];

        return $errorMessages[$error] ?? 'An error occurred during OAuth process.';
    }
    public function getErrorStatistics(Request $request)
    {
        try {
            $context = $request->input('context');
            $hours = $request->input('hours', 24);

            $statistics = $this->errorHandler->getErrorStatistics($context, $hours);

            return $this->successResponse(
                'Error statistics retrieved successfully',
                [
                    'statistics' => $statistics,
                    'context' => $context,
                    'hours' => $hours,
                    'total_errors' => array_sum(array_column($statistics, 'total_count'))
                ]
            );

        } catch (Exception $e) {
            $errorResult = $this->errorHandler->handleOAuthError($e, 'Get Error Statistics');

            return $this->errorResponse(
                $errorResult['user_message'],
                $this->getHttpStatusCode($errorResult['error_code']),

            );
        }
    }

    /**
     * Clear error statistics
     */
    public function clearErrorStatistics(Request $request)
    {
        try {
            $this->errorHandler->clearErrorStatistics();

            return $this->successResponse(
                'Error statistics cleared successfully',
                ['cleared_at' => now()->toISOString()]
            );

        } catch (Exception $e) {
            $errorResult = $this->errorHandler->handleOAuthError($e, 'Clear Error Statistics');

            return $this->errorResponse(
                $errorResult['user_message'],
                $this->getHttpStatusCode($errorResult['error_code']),

            );
        }
    }
}
