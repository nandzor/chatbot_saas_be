<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\BotPersonality\CreateBotPersonalityRequest;
use App\Http\Requests\BotPersonality\UpdateBotPersonalityRequest;
use App\Http\Resources\BotPersonalityResource;
use App\Services\BotPersonalityService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Exception;
use Illuminate\Http\Request;

class BotPersonalityController extends BaseApiController
{
    protected BotPersonalityService $service;

    public function __construct(BotPersonalityService $service)
    {
        parent::__construct();
        $this->service = $service;
    }

    /**
     * List personalities for current organization (org_admin required).
     */
    public function index(Request $request): JsonResponse
    {
        $user = $this->getCurrentUser();
        if (!$user || !in_array($user->role, ['org_admin', 'super_admin'])) {
            return $this->handleForbiddenAccess('list bot personalities');
        }

        $organizationId = $user->organization_id;

        $list = $this->service->getPersonalitiesForInbox($request, $organizationId);

        return $this->successResponse(
            'Bot personalities retrieved successfully',
            $list,
            200
        );
    }

    /**
     * Create new personality.
     */
    public function store(CreateBotPersonalityRequest $request): JsonResponse
    {
        $user = $this->getCurrentUser();

        $data = $request->getSanitizedData();
        $data['organization_id'] = $user->organization_id;

        // Handle RAG files jika ada
        if ($request->has('rag_files') && !empty($request->input('rag_files'))) {
            $data['rag_files'] = $request->input('rag_files');
            $data['rag_settings'] = $request->input('rag_settings', []);

            $result = $this->service->createPersonalityWithRag($data);

            if (!$result['success']) {
                return $this->errorResponse($result['error'], 500);
            }

            $created = $result['data']['personality'];
        } else {
            $created = $this->service->createForOrganization($data, $user->organization_id);
        }

        $this->logApiAction('bot_personality_created', [
            'id' => $created->id,
            'organization_id' => $created->organization_id,
            'user_id' => $user->id,
        ]);

        return $this->successResponse(
            'Bot personality created successfully',
            new BotPersonalityResource($created),
            201
        );
    }

    /**
     * Show details.
     */
    public function show(string $id): JsonResponse
    {
        $user = $this->getCurrentUser();
        if (!$user) {
            return $this->unauthorizedResponse('Authentication required');
        }

        $resource = $this->service->getForOrganization($id, $user->organization_id);
        if (!$resource) {
            return $this->handleResourceNotFound('BotPersonality', $id);
        }

        return $this->successResponse(
            'Bot personality retrieved successfully',
            new BotPersonalityResource($resource)
        );
    }

    /**
     * Update.
     */
    public function update(UpdateBotPersonalityRequest $request, string $id): JsonResponse
    {
        $user = $this->getCurrentUser();
        if (!$user) {
            return $this->unauthorizedResponse('Authentication required');
        }

        $data = $request->getSanitizedData();

        // Handle RAG files jika ada
        if ($request->has('rag_files')) {
            $data['rag_files'] = $request->input('rag_files');
            $data['rag_settings'] = $request->input('rag_settings', []);

            $result = $this->service->updatePersonalityWithRag($id, $data);

            if (!$result['success']) {
                return $this->errorResponse($result['error'], 500);
            }

            $updated = $result['data']['personality'];
        } else {
            $updated = $this->service->updateForOrganization($id, $data, $user->organization_id);
        }

        if (!$updated) {
            return $this->handleResourceNotFound('BotPersonality', $id);
        }

        $this->logApiAction('bot_personality_updated', [
            'id' => $id,
            'organization_id' => $user->organization_id,
            'user_id' => $user->id,
        ]);

        return $this->successResponse(
            'Bot personality updated successfully',
            new BotPersonalityResource($updated)
        );
    }

    /**
     * Delete.
     */
    public function destroy(string $id): JsonResponse
    {
        $user = $this->getCurrentUser();
        if (!$user) {
            return $this->unauthorizedResponse('Authentication required');
        }

        $deleted = $this->service->deleteForOrganization($id, $user->organization_id);

        if (!$deleted) {
            return $this->handleResourceNotFound('BotPersonality', $id);
        }

        $this->logApiAction('bot_personality_deleted', [
            'id' => $id,
            'organization_id' => $user->organization_id,
            'user_id' => $user->id,
        ]);

        return $this->successResponse('Bot personality deleted successfully');
    }

    /**
     * Get Google Drive files for bot personality
     */
    public function getDriveFiles(string $id): JsonResponse
    {
        $user = $this->getCurrentUser();
        if (!$user) {
            return $this->unauthorizedResponse('Authentication required');
        }

        $personality = $this->service->getForOrganization($id, $user->organization_id);
        if (!$personality) {
            return $this->handleResourceNotFound('BotPersonality', $id);
        }

        $driveFiles = $personality->driveFiles()->get();

        return $this->successResponse(
            'Google Drive files retrieved successfully',
            [
                'personality_id' => $id,
                'files' => $driveFiles->map(function ($file) {
                    return [
                        'id' => $file->id,
                        'file_id' => $file->file_id,
                        'file_name' => $file->file_name,
                        'mime_type' => $file->mime_type,
                        'web_view_link' => $file->web_view_link,
                        'icon_link' => $file->icon_link,
                        'size' => $file->size,
                        'metadata' => $file->metadata,
                        'created_at' => $file->created_at,
                        'updated_at' => $file->updated_at,
                    ];
                })
            ]
        );
    }

    /**
     * Test Google Drive integration for a bot personality
     */
    public function testGoogleDriveIntegration(string $id): JsonResponse
    {
        $user = $this->getCurrentUser();
        if (!$user) {
            return $this->unauthorizedResponse('Authentication required');
        }

        $personality = $this->service->getForOrganization($id, $user->organization_id);
        if (!$personality) {
            return $this->handleResourceNotFound('BotPersonality', $id);
        }

        if (!$personality->n8n_workflow_id) {
            return $this->errorResponse('No n8n workflow associated with this bot personality', 400);
        }

        try {
            $n8nService = app(\App\Services\N8n\N8nService::class);
            $testResult = $n8nService->testGoogleDriveIntegration($personality->n8n_workflow_id);

            if ($testResult['success']) {
                return $this->successResponse($testResult['message'], [
                    'tested_file' => $testResult['tested_file'] ?? null,
                    'file_id' => $testResult['file_id'] ?? null,
                    'status' => 'working'
                ]);
            } else {
                return $this->errorResponse($testResult['error'], 400);
            }

        } catch (Exception $e) {
            Log::error('Failed to test Google Drive integration', [
                'bot_personality_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponse('Failed to test Google Drive integration: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Create workflow from template for a bot personality
     */
    public function createWorkflowFromTemplate(string $id): JsonResponse
    {
        $user = $this->getCurrentUser();
        if (!$user) {
            return $this->unauthorizedResponse('Authentication required');
        }

        $personality = $this->service->getForOrganization($id, $user->organization_id);
        if (!$personality) {
            return $this->handleResourceNotFound('BotPersonality', $id);
        }

        // Get Google Drive files
        $driveFiles = $personality->driveFiles()->get();
        if ($driveFiles->isEmpty()) {
            return $this->errorResponse('No Google Drive files found for this bot personality', 400);
        }

        // Get Google Drive credentials
        $oauthCredential = \App\Models\OAuthCredential::where('organization_id', $personality->organization_id)
            ->where('service', 'google-drive')
            ->where('status', 'active')
            ->first();

        if (!$oauthCredential) {
            return $this->errorResponse('No active Google Drive credentials found', 400);
        }

        try {
            // Prepare template data
            $templateData = [
                'name' => $personality->name . ' - Google Drive Integration',
                'webhook_id' => 'webhook-' . $personality->id,
                'system_message' => $personality->system_message ?? 'You are a helpful AI assistant.',
                'waha_credential_id' => 'waha-credential', // This should be configured
                'gemini_credential_id' => 'gemini-credential', // This should be configured
                'google_drive_credential_id' => 'google-drive-credential', // This should be configured
                'instance_id' => 'instance-' . $personality->id,
            ];

            // Prepare Google Drive data
            $googleDriveData = [
                'files' => $driveFiles->map(function ($file) {
                    return [
                        'file_id' => $file->file_id,
                        'file_name' => $file->file_name,
                        'mime_type' => $file->mime_type,
                        'web_view_link' => $file->web_view_link,
                        'size' => $file->size,
                    ];
                })->toArray(),
                'organization_id' => $personality->organization_id,
                'personality_id' => $personality->id,
                'credentials' => [
                    'access_token' => $oauthCredential->access_token,
                    'refresh_token' => $oauthCredential->refresh_token,
                    'expires_at' => $oauthCredential->expires_at,
                    'scope' => $oauthCredential->scope,
                    'credential_id' => $oauthCredential->id,
                ]
            ];

            $n8nService = app(\App\Services\N8n\N8nService::class);
            $workflowResult = $n8nService->createWorkflowFromTemplate($templateData, $googleDriveData);

            if ($workflowResult['success']) {
                // Update bot personality with new workflow ID
                $personality->update([
                    'n8n_workflow_id' => $workflowResult['workflow_id']
                ]);

                return $this->successResponse('Workflow created successfully from template', [
                    'workflow_id' => $workflowResult['workflow_id'],
                    'workflow_data' => $workflowResult['data'] ?? null
                ]);
            } else {
                return $this->errorResponse($workflowResult['error'], 400);
            }

        } catch (Exception $e) {
            Log::error('Failed to create workflow from template', [
                'bot_personality_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponse('Failed to create workflow from template: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Enhance workflow with RAG capabilities for Google Drive files
     */
    public function enhanceWorkflowWithRag(string $id): JsonResponse
    {
        $user = $this->getCurrentUser();
        if (!$user) {
            return $this->unauthorizedResponse('Authentication required');
        }

        $personality = $this->service->getForOrganization($id, $user->organization_id);
        if (!$personality) {
            return $this->handleResourceNotFound('BotPersonality', $id);
        }

        if (!$personality->n8n_workflow_id) {
            return $this->errorResponse('No n8n workflow associated with this bot personality', 400);
        }

        // Get Google Drive files
        $driveFiles = $personality->driveFiles()->get();
        if ($driveFiles->isEmpty()) {
            return $this->errorResponse('No Google Drive files found for this bot personality', 400);
        }

        // Get Google Drive credentials
        $oauthCredential = \App\Models\OAuthCredential::where('organization_id', $personality->organization_id)
            ->where('service', 'google-drive')
            ->where('status', 'active')
            ->first();

        if (!$oauthCredential) {
            return $this->errorResponse('No active Google Drive credentials found', 400);
        }

        try {
            // Prepare Google Drive data for RAG
            $googleDriveData = [
                'files' => $driveFiles->map(function ($file) {
                    return [
                        'file_id' => $file->file_id,
                        'file_name' => $file->file_name,
                        'mime_type' => $file->mime_type,
                        'web_view_link' => $file->web_view_link,
                        'size' => $file->size,
                    ];
                })->toArray(),
                'organization_id' => $personality->organization_id,
                'personality_id' => $personality->id,
                'credentials' => [
                    'access_token' => $oauthCredential->access_token,
                    'refresh_token' => $oauthCredential->refresh_token,
                    'expires_at' => $oauthCredential->expires_at,
                    'scope' => $oauthCredential->scope,
                    'credential_id' => $oauthCredential->id,
                ]
            ];

            $n8nService = app(\App\Services\N8n\N8nService::class);
            $ragResult = $n8nService->enhanceWorkflowWithRag($personality->n8n_workflow_id, $googleDriveData);

            if ($ragResult['success']) {
                return $this->successResponse('Workflow enhanced with RAG capabilities', [
                    'workflow_id' => $personality->n8n_workflow_id,
                    'rag_nodes' => $ragResult['rag_nodes'] ?? [],
                    'files_processed' => count($googleDriveData['files']),
                    'workflow_data' => $ragResult['data'] ?? null
                ]);
            } else {
                return $this->errorResponse($ragResult['error'], 400);
            }

        } catch (Exception $e) {
            Log::error('Failed to enhance workflow with RAG', [
                'bot_personality_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponse('Failed to enhance workflow with RAG: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Ensure Google Drive credentials are created for RAG integration
     */
    public function ensureGoogleDriveCredentials(string $id): JsonResponse
    {
        $user = $this->getCurrentUser();
        if (!$user) {
            return $this->unauthorizedResponse('Authentication required');
        }

        $personality = $this->service->getForOrganization($id, $user->organization_id);
        if (!$personality) {
            return $this->handleResourceNotFound('BotPersonality', $id);
        }

        try {
            $credentials = $this->service->ensureGoogleDriveCredentialsForRag($personality->organization_id);

            if ($credentials) {
                return $this->successResponse('Google Drive credentials ensured successfully', [
                    'credential_id' => $credentials['credential_id'],
                    'n8n_credential_id' => $credentials['n8n_credential_id'],
                    'has_access_token' => !empty($credentials['access_token']),
                    'has_refresh_token' => !empty($credentials['refresh_token']),
                    'scope' => $credentials['scope'],
                    'expires_at' => $credentials['expires_at']
                ]);
            } else {
                return $this->errorResponse('No Google Drive credentials found for this organization', 404);
            }

        } catch (Exception $e) {
            Log::error('Failed to ensure Google Drive credentials', [
                'bot_personality_id' => $id,
                'organization_id' => $personality->organization_id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponse('Failed to ensure Google Drive credentials: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Create credentials for workflow
     */
    public function createCredentialsForWorkflow(string $id): JsonResponse
    {
        $user = $this->getCurrentUser();
        if (!$user) {
            return $this->unauthorizedResponse('Authentication required');
        }

        $personality = $this->service->getForOrganization($id, $user->organization_id);
        if (!$personality) {
            return $this->handleResourceNotFound('BotPersonality', $id);
        }

        try {
            $workflowData = [
                'organization_id' => $personality->organization_id,
                'personality_id' => $personality->id,
            ];

            // Add Google Drive OAuth data if available
            $oauthCredential = \App\Models\OAuthCredential::where('organization_id', $personality->organization_id)
                ->where('service', 'google-drive')
                ->where('status', 'active')
                ->first();

            if ($oauthCredential) {
                $workflowData['google_drive_oauth'] = [
                    'organization_id' => $personality->organization_id,
                    'access_token' => $oauthCredential->access_token,
                    'refresh_token' => $oauthCredential->refresh_token,
                    'expires_at' => $oauthCredential->expires_at,
                    'scope' => $oauthCredential->scope,
                ];
            }

            // Add WAHA data if available
            if (config('services.waha.api_url') && config('services.waha.api_key')) {
                $workflowData['waha_data'] = [
                    'organization_id' => $personality->organization_id,
                    'api_url' => config('services.waha.api_url'),
                    'api_key' => config('services.waha.api_key'),
                    'session_id' => $personality->waha_session_id ?? 'default-session',
                ];
            }

            // Add Gemini data if available
            if (config('services.google.gemini_api_key')) {
                $workflowData['gemini_data'] = [
                    'organization_id' => $personality->organization_id,
                    'api_key' => config('services.google.gemini_api_key'),
                    'model' => 'models/gemini-2.0-flash',
                ];
            }

            $n8nService = app(\App\Services\N8n\N8nService::class);
            $credentialsResult = $n8nService->createAllCredentialsForWorkflow($workflowData);

            if ($credentialsResult['success']) {
                return $this->successResponse('Credentials created successfully', [
                    'credentials' => $credentialsResult['credentials'],
                    'message' => $credentialsResult['message']
                ]);
            } else {
                return $this->errorResponse($credentialsResult['message'] ?? 'Failed to create credentials', 400);
            }

        } catch (Exception $e) {
            Log::error('Failed to create credentials for workflow', [
                'bot_personality_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponse('Failed to create credentials: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Sync bot personality with its workflow
     */
    public function syncWorkflow(string $id): JsonResponse
    {
        $user = $this->getCurrentUser();
        if (!$user) {
            return $this->unauthorizedResponse('Authentication required');
        }

        $result = $this->service->syncWorkflow($id, $user->organization_id);

        if ($result['success']) {
            $this->logApiAction('bot_personality_workflow_synced', [
                'bot_personality_id' => $id,
                'organization_id' => $user->organization_id,
                'user_id' => $user->id,
            ]);

            return $this->successResponse(
                $result['message'],
                $result['results'] ?? null
            );
        }

        return $this->errorResponse($result['message'], 500);
    }

    /**
     * Get sync status for bot personality
     */
    public function getSyncStatus(string $id): JsonResponse
    {
        $user = $this->getCurrentUser();
        if (!$user) {
            return $this->unauthorizedResponse('Authentication required');
        }

        $result = $this->service->getSyncStatus($id, $user->organization_id);

        if ($result['success']) {
            return $this->successResponse(
                'Sync status retrieved successfully',
                $result['data']
            );
        }

        return $this->errorResponse($result['message'], 404);
    }

    /**
     * Bulk sync multiple bot personalities
     */
    public function bulkSyncWorkflows(Request $request): JsonResponse
    {
        $user = $this->getCurrentUser();
        if (!$user) {
            return $this->unauthorizedResponse('Authentication required');
        }

        $request->validate([
            'bot_personality_ids' => 'required|array|min:1',
            'bot_personality_ids.*' => 'uuid|exists:bot_personalities,id',
        ]);

        $result = $this->service->bulkSyncWorkflows(
            $request->input('bot_personality_ids'),
            $user->organization_id
        );

        $this->logApiAction('bot_personalities_bulk_sync', [
            'bot_personality_ids' => $request->input('bot_personality_ids'),
            'organization_id' => $user->organization_id,
            'user_id' => $user->id,
            'summary' => $result['summary'] ?? null,
        ]);

        if ($result['success']) {
            return $this->successResponse(
                $result['message'],
                $result['summary']
            );
        }

        return $this->errorResponse($result['message'], 500);
    }

    /**
     * Sync all bot personalities for organization
     */
    public function syncOrganizationWorkflows(): JsonResponse
    {
        $user = $this->getCurrentUser();
        if (!$user) {
            return $this->unauthorizedResponse('Authentication required');
        }

        $result = $this->service->syncOrganizationWorkflows($user->organization_id);

        $this->logApiAction('organization_bot_personalities_sync', [
            'organization_id' => $user->organization_id,
            'user_id' => $user->id,
            'summary' => $result['summary'] ?? null,
        ]);

        if ($result['success']) {
            return $this->successResponse(
                $result['message'],
                $result['summary']
            );
        }

        return $this->errorResponse($result['message'], 500);
    }
}


