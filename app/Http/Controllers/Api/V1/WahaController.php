<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\WahaSession;
use App\Services\Waha\WahaService;
use App\Services\Waha\WahaSyncService;
use App\Services\Waha\WahaSessionService;
use App\Services\Waha\WahaWebhookService;
use App\Services\Waha\WahaSessionManagementService;
use App\Services\Waha\WahaMessageService;
use App\Services\Waha\WahaWebhookConfigService;
use App\Services\N8n\N8nService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Exception;

class WahaController extends BaseApiController
{
    protected WahaService $wahaService;
    protected WahaSyncService $wahaSyncService;
    protected WahaSessionService $wahaSessionService;
    protected WahaWebhookService $wahaWebhookService;
    protected WahaSessionManagementService $wahaSessionManagementService;
    protected WahaMessageService $wahaMessageService;
    protected WahaWebhookConfigService $wahaWebhookConfigService;
    protected N8nService $n8nService;

    public function __construct(
        WahaService $wahaService,
        WahaSyncService $wahaSyncService,
        WahaSessionService $wahaSessionService,
        WahaWebhookService $wahaWebhookService,
        WahaSessionManagementService $wahaSessionManagementService,
        WahaMessageService $wahaMessageService,
        WahaWebhookConfigService $wahaWebhookConfigService,
        N8nService $n8nService
    ) {
        $this->wahaService = $wahaService;
        $this->wahaSyncService = $wahaSyncService;
        $this->wahaSessionService = $wahaSessionService;
        $this->wahaWebhookService = $wahaWebhookService;
        $this->wahaSessionManagementService = $wahaSessionManagementService;
        $this->wahaMessageService = $wahaMessageService;
        $this->wahaWebhookConfigService = $wahaWebhookConfigService;
        $this->n8nService = $n8nService;
    }

    /**
     * Test WAHA server connection
     */
    public function testConnection(): JsonResponse
    {
        try {
            $result = $this->wahaService->testConnection();
            return $this->successResponse('WAHA connection test completed', $result);
        } catch (Exception $e) {
            Log::error('Failed to test WAHA connection', ['error' => $e->getMessage()]);
            return $this->errorResponse('Failed to test WAHA connection', 500);
        }
    }

    /**
     * Get all sessions for current organization with pagination and filters
     */
    public function getSessions(Request $request): JsonResponse
    {
        try {
            // Get current organization
            $organization = $this->getCurrentOrganization();
            if (!$organization) {
                return $this->handleUnauthorizedAccess('access WAHA sessions');
            }

            // Use standardized pagination and filter methods from BaseApiController
            $pagination = $this->getPaginationParams($request);
            $filters = $this->getFilterParams($request, ['status', 'health_status']);
            $search = $this->getSearchParams($request);
            $sort = $this->getSortParams($request, ['created_at', 'updated_at', 'session_name', 'status', 'health_status'], 'created_at');

            // Get sessions with pagination and filters using standardized approach
            $result = $this->wahaSyncService->getSessionsForOrganizationWithPagination(
                $organization->id,
                $pagination['page'],
                $pagination['per_page'],
                $search['search'] ?? '',
                $filters['status'] ?? 'all',
                $filters['health_status'] ?? 'all',
                $sort['sort_by'],
                $sort['sort_direction']
            );

            $this->logApiAction('get_waha_sessions', [
                'organization_id' => $organization->id,
                'pagination' => $pagination,
                'filters' => $filters,
                'search' => $search,
                'sort' => $sort,
                'total_sessions' => $result['pagination']['total'] ?? 0,
            ]);

            // Create response with pagination and meta
            $response = [
                'success' => true,
                'message' => 'Sessions retrieved successfully',
                'data' => $result['sessions'],
                'pagination' => $result['pagination'],
                'meta' => [
                    'api_version' => config('app.api_version', '1.0'),
                    'environment' => app()->environment(),
                    'execution_time_ms' => round((microtime(true) - LARAVEL_START) * 1000, 2),
                    'memory_usage_mb' => round(memory_get_usage(true) / 1024 / 1024, 2),
                    'queries_count' => \Illuminate\Support\Facades\DB::getQueryLog() ? count(\Illuminate\Support\Facades\DB::getQueryLog()) : 0
                ],
                'timestamp' => now()->toISOString(),
                'request_id' => request()->header('X-Request-ID') ?? $this->generateRequestId(),
            ];

            return response()->json($response, 200);
        } catch (Exception $e) {
            Log::error('Failed to get WAHA sessions', [
                'organization_id' => $this->getCurrentOrganization()?->id,
                'error' => $e->getMessage(),
                'request_data' => $request->all()
            ]);
            return $this->errorResponse('Failed to retrieve sessions', 500);
        }
    }

    /**
     * Create a new session in 3rd party WAHA instance
     * Enhanced to work without frontend payload - uses sensible defaults
     */
    public function createSession(Request $request): JsonResponse
    {
        try {
            // Get current organization
            $organization = $this->getCurrentOrganization();
            if (!$organization) {
                return $this->handleUnauthorizedAccess('create WAHA session');
            }

            // Check if request has meaningful data, ignore frontend default payloads
            $requestData = $request->all();

            // Extract only the original frontend payload (exclude middleware-added data)
            $frontendPayload = array_intersect_key($requestData, array_flip(['name', 'start', 'config']));

            // Check if frontend provided a custom name (not empty and not just default pattern)
            $hasCustomName = isset($frontendPayload['name']) &&
                !empty($frontendPayload['name']) &&
                !preg_match('/^whatsapp-connector-\d+$/', $frontendPayload['name']);

            // Check if frontend provided meaningful config (not just empty config)
            $hasMeaningfulConfig = isset($frontendPayload['config']) &&
                !empty($frontendPayload['config']);

            // Only use defaults if no custom name and no meaningful config
            $shouldUseDefaults = empty($frontendPayload) ||
                (!empty($frontendPayload) && !$hasCustomName && !$hasMeaningfulConfig);

            if ($shouldUseDefaults) {
                // Create session with automatic defaults - no frontend payload needed
                Log::info('Using createSessionWithDefaults due to no custom name or config');
                $result = $this->wahaSessionManagementService->createSessionWithDefaults($organization);

                if ($result['success']) {
                    $this->logApiAction('create_waha_session_auto', [
                        'session_name' => $result['data']['session_name'],
                        'organization_id' => $organization->id,
                        'local_session_id' => $result['data']['local_session_id'],
                        'auto_created' => true,
                        'n8n_workflow_created' => $result['data']['n8n_workflow']['success'] ?? false,
                        'n8n_workflow_id' => $result['data']['n8n_workflow']['data']['id'] ?? null,
                        'webhook_id' => $result['data']['webhook_id'],
                        'webhook_url' => $result['data']['webhook_url'],
                    ]);
                }

                return $result['success']
                    ? $this->successResponse($result['message'], $result['data'])
                    : $this->errorResponse($result['message'], 500);
            }

            // Validate the request payload if provided
            $validatedData = $request->validate([
                'name' => 'nullable|string|max:255',
                'start' => 'boolean',
                'config' => 'nullable|array',
                'config.metadata' => 'nullable|array',
                'config.metadata.user.id' => 'nullable|string',
                'config.metadata.user.email' => 'nullable|email',
                'config.proxy' => 'nullable|string',
                'config.debug' => 'boolean',
                'config.noweb' => 'nullable|array',
                'config.noweb.store' => 'nullable|array',
                'config.noweb.store.enabled' => 'boolean',
                'config.noweb.store.fullSync' => 'boolean',
                'config.webhooks' => 'nullable|array',
                'config.webhooks.*.url' => 'nullable|url',
                'config.webhooks.*.events' => 'nullable|array',
                'config.webhooks.*.hmac' => 'nullable|string',
                'config.webhooks.*.retries' => 'nullable|integer',
                'config.webhooks.*.customHeaders' => 'nullable|array',
            ]);

            $result = $this->wahaSessionManagementService->createSessionWithConfig($validatedData, $organization->id);

            if ($result['success']) {
                $this->logApiAction('create_waha_session', [
                    'session_name' => $result['data']['session_name'],
                    'organization_id' => $organization->id,
                    'local_session_id' => $result['data']['local_session_id'],
                    'n8n_workflow_created' => $result['data']['n8n_workflow']['success'] ?? false,
                    'n8n_workflow_id' => $result['data']['n8n_workflow']['data']['id'] ?? null,
                    'webhook_id' => $result['data']['webhook_id'],
                    'webhook_url' => $result['data']['webhook_url'],
                ]);
            }

            return $result['success']
                ? $this->successResponse($result['message'], $result['data'])
                : $this->errorResponse($result['message'], 500);

        } catch (Exception $e) {
            Log::error('Failed to create WAHA session', [
                'organization_id' => $this->getCurrentOrganization()?->id,
                'error' => $e->getMessage(),
                'request_data' => $request->all()
            ]);
            return $this->errorResponse('Failed to create session', 500);
        }
    }

    /**
     * Start a new session
     */
    public function startSession(Request $request, string $sessionId): JsonResponse
    {
        try {
            // Get current organization
            $organization = $this->getCurrentOrganization();
            if (!$organization) {
                return $this->handleUnauthorizedAccess('start WAHA session');
            }

            $config = $request->validate([
                'webhook' => 'nullable|string|url',
                'webhook_by_events' => 'boolean',
                'events' => 'array',
                'reject_calls' => 'boolean',
                'mark_online_on_chat' => 'boolean',
                'session_name' => 'nullable|string|max:255',
                'phone_number' => 'nullable|string|max:20',
                'business_name' => 'nullable|string|max:255',
                'business_description' => 'nullable|string',
                'business_category' => 'nullable|string|max:100',
                'business_website' => 'nullable|string|max:255',
                'business_email' => 'nullable|email|max:255',
            ]);

            $result = $this->wahaSessionManagementService->startSession($sessionId, $config, $organization->id);

            if ($result['success']) {
                $this->logApiAction('start_waha_session', [
                    'session_id' => $sessionId,
                    'organization_id' => $organization->id,
                    'local_session_id' => $result['data']['local_session_id'],
                ]);
            }

            return $result['success']
                ? $this->successResponse($result['message'], $result['data'])
                : $this->errorResponse($result['message'], $result['code'] ?? 500);

        } catch (Exception $e) {
            Log::error('Failed to start WAHA session', [
                'session_id' => $sessionId,
                'organization_id' => $this->getCurrentOrganization()?->id,
                'error' => $e->getMessage()
            ]);
            return $this->errorResponse('Failed to start session', 500);
        }
    }

    /**
     * Stop a session
     */
    public function stopSession(string $sessionId): JsonResponse
    {
        try {
            // Get current organization
            $organization = $this->getCurrentOrganization();
            if (!$organization) {
                return $this->handleUnauthorizedAccess('stop WAHA session');
            }

            $result = $this->wahaSessionManagementService->stopSession($sessionId, $organization->id);

            if ($result['success']) {
                $this->logApiAction('stop_waha_session', [
                    'session_id' => $sessionId,
                    'organization_id' => $organization->id,
                    'local_session_id' => $result['data']['local_session_id'],
                ]);
            }

            return $result['success']
                ? $this->successResponse($result['message'], $result['data'])
                : $this->errorResponse($result['message'], $result['code'] ?? 500);

        } catch (Exception $e) {
            Log::error('Failed to stop WAHA session', [
                'session_id' => $sessionId,
                'organization_id' => $this->getCurrentOrganization()?->id,
                'error' => $e->getMessage()
            ]);
            return $this->errorResponse('Failed to stop session', 500);
        }
    }

    /**
     * Get session status
     */
    public function getSessionStatus(string $sessionId): JsonResponse
    {
        try {
            // Get current organization
            $organization = $this->getCurrentOrganization();
            if (!$organization) {
                return $this->handleUnauthorizedAccess('get WAHA session status');
            }

            // Use sync service to get session with automatic sync
            $sessionData = $this->wahaSyncService->getSessionForOrganization($organization->id, $sessionId);

            if (!$sessionData) {
                return $this->handleResourceNotFound('WAHA session', $sessionId);
            }

            $this->logApiAction('get_waha_session_status', [
                'session_id' => $sessionId,
                'organization_id' => $organization->id,
                'local_session_id' => $sessionData['id'],
            ]);

            return $this->successResponse('Session status retrieved successfully', $sessionData);
        } catch (Exception $e) {
            Log::error('Failed to get WAHA session status', [
                'session_id' => $sessionId,
                'organization_id' => $this->getCurrentOrganization()?->id,
                'error' => $e->getMessage()
            ]);
            return $this->errorResponse('Failed to retrieve session status', 500);
        }
    }

    /**
     * Send a text message
     */
    public function sendTextMessage(Request $request, string $sessionId): JsonResponse
    {
        try {
            // Get current organization
            $organization = $this->getCurrentOrganization();
            if (!$organization) {
                return $this->handleUnauthorizedAccess('send WAHA message');
            }

            $data = $request->validate([
                'to' => 'required|string',
                'text' => 'required|string|max:4096',
            ]);

            $result = $this->wahaMessageService->sendTextMessage(
                $sessionId,
                $data['to'],
                $data['text'],
                $organization->id
            );

            if ($result['success']) {
                $this->logApiAction('send_waha_text_message', [
                    'session_id' => $sessionId,
                    'organization_id' => $organization->id,
                    'recipient' => $data['to'],
                ]);
            }

            return $result['success']
                ? $this->successResponse($result['message'], $result['data'])
                : $this->errorResponse($result['message'], $result['code'] ?? 500);

        } catch (Exception $e) {
            Log::error('Failed to send WAHA text message', [
                'session_id' => $sessionId,
                'organization_id' => $this->getCurrentOrganization()?->id,
                'error' => $e->getMessage()
            ]);
            return $this->errorResponse('Failed to send message', 500);
        }
    }

    /**
     * Send a media message
     */
    public function sendMediaMessage(Request $request, string $sessionId): JsonResponse
    {
        try {
            // Get current organization
            $organization = $this->getCurrentOrganization();
            if (!$organization) {
                return $this->handleUnauthorizedAccess('send WAHA media message');
            }

            // Verify session belongs to current organization
            $localSession = $this->wahaSyncService->verifySessionAccess($organization->id, $sessionId);
            if (!$localSession) {
                return $this->handleResourceNotFound('WAHA session', $sessionId);
            }

            $data = $request->validate([
                'to' => 'required|string',
                'media_url' => 'required|string|url',
                'caption' => 'nullable|string|max:1024',
            ]);

            $result = $this->wahaService->sendMediaMessage(
                $sessionId,
                $data['to'],
                $data['media_url'],
                $data['caption'] ?? ''
            );

            // Update media count in local session
            if ($result['success'] ?? false) {
                $localSession->increment('total_media_sent');
            }

            $this->logApiAction('send_waha_media_message', [
                'session_id' => $sessionId,
                'organization_id' => $organization->id,
                'recipient' => $data['to'],
                'media_url' => $data['media_url'],
            ]);

            return $this->successResponse('Media message sent successfully', $result);
        } catch (Exception $e) {
            Log::error('Failed to send WAHA media message', [
                'session_id' => $sessionId,
                'organization_id' => $this->getCurrentOrganization()?->id,
                'error' => $e->getMessage()
            ]);
            return $this->errorResponse('Failed to send media message', 500);
        }
    }

    /**
     * Get messages
     */
    public function getMessages(Request $request, string $sessionId): JsonResponse
    {
        try {
            // Get current organization
            $organization = $this->getCurrentOrganization();
            if (!$organization) {
                return $this->handleUnauthorizedAccess('get WAHA messages');
            }

            // Verify session belongs to current organization
            $localSession = $this->wahaSyncService->verifySessionAccess($organization->id, $sessionId);
            if (!$localSession) {
                return $this->handleResourceNotFound('WAHA session', $sessionId);
            }

            $data = $request->validate([
                'limit' => 'integer|min:1|max:100',
                'page' => 'integer|min:1',
            ]);

            $messages = $this->wahaService->getMessages(
                $sessionId,
                $data['limit'] ?? 50,
                $data['page'] ?? 1
            );

            $this->logApiAction('get_waha_messages', [
                'session_id' => $sessionId,
                'organization_id' => $organization->id,
                'limit' => $data['limit'] ?? 50,
                'page' => $data['page'] ?? 1,
            ]);

            return $this->successResponse('Messages retrieved successfully', $messages);
        } catch (Exception $e) {
            Log::error('Failed to get WAHA messages', [
                'session_id' => $sessionId,
                'organization_id' => $this->getCurrentOrganization()?->id,
                'error' => $e->getMessage()
            ]);
            return $this->errorResponse('Failed to retrieve messages', 500);
        }
    }

    /**
     * Get contacts
     */
    public function getContacts(string $sessionId): JsonResponse
    {
        try {
            // Get current organization
            $organization = $this->getCurrentOrganization();
            if (!$organization) {
                return $this->handleUnauthorizedAccess('get WAHA contacts');
            }

            // Verify session belongs to current organization
            $localSession = $this->wahaSyncService->verifySessionAccess($organization->id, $sessionId);
            if (!$localSession) {
                return $this->handleResourceNotFound('WAHA session', $sessionId);
            }

            $contacts = $this->wahaService->getContacts($sessionId);

            $this->logApiAction('get_waha_contacts', [
                'session_id' => $sessionId,
                'organization_id' => $organization->id,
            ]);

            return $this->successResponse('Contacts retrieved successfully', $contacts);
        } catch (Exception $e) {
            Log::error('Failed to get WAHA contacts', [
                'session_id' => $sessionId,
                'organization_id' => $this->getCurrentOrganization()?->id,
                'error' => $e->getMessage()
            ]);
            return $this->errorResponse('Failed to retrieve contacts', 500);
        }
    }

    /**
     * Get groups
     */
    public function getGroups(string $sessionId): JsonResponse
    {
        try {
            // Get current organization
            $organization = $this->getCurrentOrganization();
            if (!$organization) {
                return $this->handleUnauthorizedAccess('get WAHA groups');
            }

            // Verify session belongs to current organization
            $localSession = $this->wahaSyncService->verifySessionAccess($organization->id, $sessionId);
            if (!$localSession) {
                return $this->handleResourceNotFound('WAHA session', $sessionId);
            }

            $groups = $this->wahaService->getGroups($sessionId);

            $this->logApiAction('get_waha_groups', [
                'session_id' => $sessionId,
                'organization_id' => $organization->id,
            ]);

            return $this->successResponse('Groups retrieved successfully', $groups);
        } catch (Exception $e) {
            Log::error('Failed to get WAHA groups', [
                'session_id' => $sessionId,
                'organization_id' => $this->getCurrentOrganization()?->id,
                'error' => $e->getMessage()
            ]);
            return $this->errorResponse('Failed to retrieve groups', 500);
        }
    }

    /**
     * Get QR code
     */
    public function getQrCode(string $sessionId): JsonResponse
    {
        try {
            // Get current organization
            $organization = $this->getCurrentOrganization();
            if (!$organization) {
                return $this->handleUnauthorizedAccess('get WAHA QR code');
            }

            // Verify session belongs to current organization
            $localSession = $this->wahaSyncService->verifySessionAccess($organization->id, $sessionId);
            if (!$localSession) {
                return $this->handleResourceNotFound('WAHA session', $sessionId);
            }

            // Check if session is already connected
            if ($localSession->is_connected && $localSession->is_authenticated) {
                return $this->successResponse('Session is already connected', [
                    'connected' => true,
                    'status' => $localSession->status,
                    'phone_number' => $localSession->phone_number,
                    'message' => 'QR code is not needed as session is already connected'
                ]);
            }

            // Try to get QR code from WAHA server
            try {
                $qrCode = $this->wahaService->getQrCode($localSession->session_name);
            } catch (Exception $e) {
                // If QR code is not available (404), return appropriate message
                if (str_contains($e->getMessage(), '404') || str_contains($e->getMessage(), 'Not found')) {
                    return $this->successResponse('QR code not available', [
                        'connected' => false,
                        'status' => $localSession->status,
                        'message' => 'QR code is not available. Session may be in connecting state or QR code endpoint is not supported.',
                        'qr_code' => null
                    ]);
                }
                throw $e;
            }

            $this->logApiAction('get_waha_qr_code', [
                'session_id' => $sessionId,
                'organization_id' => $organization->id,
            ]);

            return $this->successResponse('QR code retrieved successfully', $qrCode);
        } catch (Exception $e) {
            Log::error('Failed to get WAHA QR code', [
                'session_id' => $sessionId,
                'organization_id' => $this->getCurrentOrganization()?->id,
                'error' => $e->getMessage()
            ]);
            return $this->errorResponse('Failed to retrieve QR code', 500);
        }
    }

    /**
     * Regenerate QR code for session
     */
    public function regenerateQrCode(string $sessionId): JsonResponse
    {
        try {
            // Get current organization
            $organization = $this->getCurrentOrganization();
            if (!$organization) {
                return $this->handleUnauthorizedAccess('regenerate WAHA QR code');
            }

            $result = $this->wahaSessionManagementService->regenerateQrCode($sessionId, $organization->id);

            if ($result['success']) {
                $this->logApiAction('regenerate_waha_qr_code', [
                    'session_id' => $sessionId,
                    'organization_id' => $organization->id
                ]);
            }

            return $result['success']
                ? $this->successResponse($result['message'], $result['data'])
                : $this->errorResponse($result['message'], $result['code'] ?? 500);

        } catch (Exception $e) {
            Log::error('Failed to regenerate WAHA QR code', [
                'session_id' => $sessionId,
                'organization_id' => $this->getCurrentOrganization()?->id,
                'error' => $e->getMessage()
            ]);
            return $this->errorResponse($e->getMessage(), 500);
        }
    }


    /**
     * Delete session
     */
    public function deleteSession(string $sessionName): JsonResponse
    {
        try {
            // Get current organization
            $organization = $this->getCurrentOrganization();
            if (!$organization) {
                return $this->handleUnauthorizedAccess('delete WAHA session');
            }

            // Use sync service to delete session with organization validation
            $success = $this->wahaSyncService->deleteSessionForOrganization($organization->id, $sessionName);

            if (!$success) {
                return $this->handleResourceNotFound('WAHA session', $sessionName);
            }

            $this->logApiAction('delete_waha_session', [
                'session_name' => $sessionName,
                'organization_id' => $organization->id,
            ]);

            return $this->successResponse('Session deleted successfully', [
                'organization_id' => $organization->id,
            ]);
        } catch (Exception $e) {
            Log::error('Failed to delete WAHA session', [
                'session_name' => $sessionName,
                'organization_id' => $this->getCurrentOrganization()?->id,
                'error' => $e->getMessage()
            ]);
            return $this->errorResponse('Failed to delete session', 500);
        }
    }

    /**
     * Get session info
     */
    public function getSessionInfo(string $sessionId): JsonResponse
    {
        try {
            // Get current organization
            $organization = $this->getCurrentOrganization();
            if (!$organization) {
                return $this->handleUnauthorizedAccess('get WAHA session info');
            }

            // First verify session access by ID to get session name
            $localSession = $this->wahaSyncService->verifySessionAccessById($organization->id, $sessionId);
            if (!$localSession) {
                return $this->handleResourceNotFound('WAHA session', $sessionId);
            }

            // Use database-only method to get session data
            $sessionData = $this->wahaSyncService->getSessionForOrganizationFromDatabase($organization->id, $localSession->session_name);

            if (!$sessionData) {
                return $this->handleResourceNotFound('WAHA session', $sessionId);
            }

            $this->logApiAction('get_waha_session_info', [
                'session_id' => $sessionId,
                'organization_id' => $organization->id,
                'local_session_id' => $sessionData['id'],
            ]);

            return $this->successResponse('Session info retrieved successfully', $sessionData);
        } catch (Exception $e) {
            Log::error('Failed to get WAHA session info', [
                'session_id' => $sessionId,
                'organization_id' => $this->getCurrentOrganization()?->id,
                'error' => $e->getMessage()
            ]);
            return $this->errorResponse('Failed to retrieve session info', 500);
        }
    }

    /**
     * Handle WAHA webhook for session status updates
     */
    public function handleWebhook(Request $request, string $sessionName): JsonResponse
    {
        try {
            $payload = $request->all();

            Log::info('WAHA webhook received', [
                'session_name' => $sessionName,
                'payload' => $payload
            ]);

            // Use sessionName from route parameter
            $status = $payload['status'] ?? $payload['state'] ?? null;
            $organizationId = $payload['organization_id'] ?? null;

            if (!$status) {
                return $this->errorResponse('Invalid webhook payload: missing status', 400);
            }

            // If organization_id is not in payload, try to find it by session name
            if (!$organizationId) {
                $localSession = \App\Models\WahaSession::where('session_name', $sessionName)->first();
                if (!$localSession) {
                    return $this->errorResponse('Session not found in database', 404);
                }
                $organizationId = $localSession->organization_id;
            }

            // Update session status in database
            $updated = $this->wahaSyncService->updateSessionStatus($organizationId, $sessionName, $status);

            if ($updated) {
                Log::info('Session status updated via webhook', [
                    'session_name' => $sessionName,
                    'status' => $status,
                    'organization_id' => $organizationId
                ]);

                return $this->successResponse('Session status updated successfully', [
                    'session_name' => $sessionName,
                    'status' => $status,
                    'organization_id' => $organizationId
                ]);
            } else {
                return $this->errorResponse('Failed to update session status', 500);
            }

        } catch (Exception $e) {
            Log::error('WAHA webhook processing failed', [
                'error' => $e->getMessage(),
                'payload' => $request->all()
            ]);
            return $this->errorResponse('Webhook processing failed', 500);
        }
    }

    /**
     * Handle incoming WhatsApp webhooks from WAHA (all event types)
     */
    public function handleMessageWebhook(Request $request, string $sessionName): JsonResponse
    {
        try {
            $payload = $request->all();

            Log::info('WAHA webhook received', [
                'event' => $payload['event'] ?? 'unknown',
                'session_name' => $sessionName,
                'timestamp' => now()
            ]);

            // Validate webhook signature if configured
            if (!$this->wahaWebhookService->validateWahaWebhookSignature($request)) {
                Log::warning('Invalid WAHA webhook signature', [
                    'payload' => $payload
                ]);
                return $this->errorResponse('Invalid webhook signature', 401);
            }

            // Extract organization ID from session name
            $organizationId = $this->wahaWebhookService->extractOrganizationFromSession($sessionName);

            if (!$organizationId) {
                Log::error('Organization ID not found for WAHA webhook', [
                    'session' => $sessionName,
                    'event' => $payload['event'] ?? 'unknown'
                ]);
                return $this->errorResponse('Organization not found', 400);
            }

            // Handle different webhook event types
            $result = $this->wahaWebhookService->handleWahaWebhookEvent($payload, $organizationId);

            if (!$result['success']) {
                return $this->errorResponse($result['message'], $result['code'] ?? 400);
            }

            Log::info('WAHA webhook processed successfully', [
                'event' => $payload['event'] ?? 'unknown',
                'session' => $payload['session'] ?? 'unknown',
                'organization_id' => $organizationId,
                'result' => $result
            ]);

            // Return immediate response to WAHA
            return $this->successResponse('Webhook processed successfully', [
                'event' => $payload['event'] ?? 'unknown',
                'session' => $payload['session'] ?? 'unknown',
                'organization_id' => $organizationId,
                'status' => 'accepted'
            ]);

        } catch (Exception $e) {
            Log::error('WAHA webhook processing failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'payload' => $request->all()
            ]);
            return $this->errorResponse('Webhook processing failed', 500);
        }
    }

    /**
     * Sync session status from WAHA server to database
     */
    public function syncSessionStatus(string $sessionId): JsonResponse
    {
        try {
            // Get current organization
            $organization = $this->getCurrentOrganization();
            if (!$organization) {
                return $this->handleUnauthorizedAccess('sync WAHA session status');
            }

            // Verify session belongs to current organization
            $localSession = $this->wahaSyncService->verifySessionAccessById($organization->id, $sessionId);
            if (!$localSession) {
                return $this->handleResourceNotFound('WAHA session', $sessionId);
            }

            // Get session status from WAHA server
            $sessionInfo = $this->wahaService->getSessionInfo($localSession->session_name);

            if ($sessionInfo && isset($sessionInfo['status'])) {
                // Update local database with current WAHA server status
                $updated = $this->wahaSyncService->updateSessionStatus(
                    $organization->id,
                    $localSession->session_name,
                    $sessionInfo['status']
                );

                if ($updated) {
                    Log::info('Session status synced from WAHA server', [
                        'session_id' => $sessionId,
                        'session_name' => $localSession->session_name,
                        'status' => $sessionInfo['status'],
                        'organization_id' => $organization->id
                    ]);

                    return $this->successResponse('Session status synced successfully', [
                        'session_id' => $sessionId,
                        'session_name' => $localSession->session_name,
                        'status' => $sessionInfo['status'],
                        'is_connected' => $sessionInfo['status'] === 'WORKING',
                        'is_authenticated' => $sessionInfo['status'] === 'WORKING'
                    ]);
                } else {
                    return $this->errorResponse('Failed to update session status in database', 500);
                }
            } else {
                return $this->errorResponse('Failed to get session status from WAHA server', 500);
            }

        } catch (Exception $e) {
            Log::error('Failed to sync session status', [
                'session_id' => $sessionId,
                'organization_id' => $this->getCurrentOrganization()?->id,
                'error' => $e->getMessage()
            ]);
            return $this->errorResponse('Failed to sync session status', 500);
        }
    }

    /**
     * Check if session is connected
     */
    public function isSessionConnected(string $sessionId): JsonResponse
    {
        try {
            // Get current organization
            $organization = $this->getCurrentOrganization();
            if (!$organization) {
                return $this->handleUnauthorizedAccess('check WAHA session connection');
            }

            // Verify session belongs to current organization
            $localSession = $this->wahaSyncService->verifySessionAccess($organization->id, $sessionId);
            if (!$localSession) {
                return $this->handleResourceNotFound('WAHA session', $sessionId);
            }

            $connected = $this->wahaService->isSessionConnected($sessionId);

            $this->logApiAction('check_waha_session_connection', [
                'session_id' => $sessionId,
                'organization_id' => $organization->id,
                'connected' => $connected,
            ]);

            return $this->successResponse('Session connection status retrieved successfully', ['connected' => $connected]);
        } catch (Exception $e) {
            Log::error('Failed to check WAHA session connection', [
                'session_id' => $sessionId,
                'organization_id' => $this->getCurrentOrganization()?->id,
                'error' => $e->getMessage()
            ]);
            return $this->errorResponse('Failed to check session connection', 500);
        }
    }

    /**
     * Get session health status
     */
    public function getSessionHealth(string $sessionId): JsonResponse
    {
        try {
            // Get current organization
            $organization = $this->getCurrentOrganization();
            if (!$organization) {
                return $this->handleUnauthorizedAccess('get WAHA session health');
            }

            // Verify session belongs to current organization
            $localSession = $this->wahaSyncService->verifySessionAccess($organization->id, $sessionId);
            if (!$localSession) {
                return $this->handleResourceNotFound('WAHA session', $sessionId);
            }

            $health = $this->wahaService->getSessionHealth($sessionId);

            $this->logApiAction('get_waha_session_health', [
                'session_id' => $sessionId,
                'organization_id' => $organization->id,
            ]);

            return $this->successResponse('Session health status retrieved successfully', $health);
        } catch (Exception $e) {
            Log::error('Failed to get WAHA session health', [
                'session_id' => $sessionId,
                'organization_id' => $this->getCurrentOrganization()?->id,
                'error' => $e->getMessage()
            ]);
            return $this->errorResponse('Failed to retrieve session health', 500);
        }
    }


    /**
     * Get chat list for a session
     */
    public function getChatList(Request $request, string $sessionId): JsonResponse
    {
        try {
            $limit = $request->query('limit', 20);
            $limit = max(1, min(100, (int) $limit)); // Limit between 1-100

            // Get session name from database
            $session = $this->wahaSyncService->verifySessionAccessById($request->user()->organization_id, $sessionId);
            if (!$session) {
                return $this->errorResponse('Session not found', 404);
            }

            $sessionName = $session->session_name;
            $result = $this->wahaService->getChatList($sessionName, $limit);

            return $this->successResponse(
                $result['message'] ?? 'Chat list retrieved successfully',
                [
                    'chats' => $result['data']['chats'] ?? [],
                    'total' => $result['data']['total'] ?? 0,
                    'limit' => $limit,
                    'session_id' => $sessionId,
                    'session_name' => $sessionName
                ]
            );
        } catch (Exception $e) {
            Log::error('Failed to get chat list', [
                'session_id' => $sessionId,
                'error' => $e->getMessage()
            ]);
            return $this->errorResponse('Failed to get chat list: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get chat overview for a session
     */
    public function getChatOverview(Request $request, string $sessionId): JsonResponse
    {
        try {
            $limit = $request->query('limit', 20);
            $limit = max(1, min(100, (int) $limit)); // Limit between 1-100

            // Get session name from database
            $session = $this->wahaSyncService->verifySessionAccessById($request->user()->organization_id, $sessionId);
            if (!$session) {
                return $this->errorResponse('Session not found', 404);
            }

            $sessionName = $session->session_name;
            $result = $this->wahaService->getChatOverview($sessionName, $limit);

            return $this->successResponse(
                $result['message'] ?? 'Chat overview retrieved successfully',
                [
                    'chats' => $result['data']['chats'] ?? [],
                    'total' => $result['data']['total'] ?? 0,
                    'limit' => $limit,
                    'session_id' => $sessionId,
                    'session_name' => $sessionName
                ]
            );
        } catch (Exception $e) {
            Log::error('Failed to get chat overview', [
                'session_id' => $sessionId,
                'error' => $e->getMessage()
            ]);
            return $this->errorResponse('Failed to get chat overview: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get profile picture for a contact
     */
    public function getProfilePicture(Request $request, string $sessionId, string $contactId): JsonResponse
    {
        try {
            // Get session name from database
            $session = $this->wahaSyncService->verifySessionAccessById($request->user()->organization_id, $sessionId);
            if (!$session) {
                return $this->errorResponse('Session not found', 404);
            }

            $sessionName = $session->session_name;
            $result = $this->wahaService->getProfilePicture($sessionName, $contactId);

            return $this->successResponse(
                $result['message'] ?? 'Profile picture retrieved successfully',
                $result['data'] ?? []
            );
        } catch (Exception $e) {
            Log::error('Failed to get profile picture', [
                'session_id' => $sessionId,
                'contact_id' => $contactId,
                'error' => $e->getMessage()
            ]);
            return $this->errorResponse('Failed to get profile picture: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get messages for a specific chat
     */
    public function getChatMessages(Request $request, string $sessionId, string $contactId): JsonResponse
    {
        try {
            $limit = $request->query('limit', 50);
            $page = $request->query('page', 1);
            $limit = max(1, min(100, (int) $limit)); // Limit between 1-100
            $page = max(1, (int) $page);

            // Get session name from database
            $session = $this->wahaSyncService->verifySessionAccessById($request->user()->organization_id, $sessionId);
            if (!$session) {
                return $this->errorResponse('Session not found', 404);
            }

            $sessionName = $session->session_name;
            $result = $this->wahaService->getChatMessages($sessionName, $contactId, $limit, $page);

            return $this->successResponse(
                $result['message'] ?? 'Chat messages retrieved successfully',
                $result['data'] ?? []
            );
        } catch (Exception $e) {
            Log::error('Failed to get chat messages', [
                'session_id' => $sessionId,
                'contact_id' => $contactId,
                'error' => $e->getMessage()
            ]);
            return $this->errorResponse('Failed to get chat messages: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Send message to a specific chat
     */
    public function sendChatMessage(Request $request, string $sessionId, string $contactId): JsonResponse
    {
        try {
            $request->validate([
                'message' => 'required|string|max:4096',
                'type' => 'sometimes|string|in:text,image,video,audio,document'
            ]);

            // Get session name from database
            $session = $this->wahaSyncService->verifySessionAccessById($request->user()->organization_id, $sessionId);
            if (!$session) {
                return $this->errorResponse('Session not found', 404);
            }

            $sessionName = $session->session_name;
            $message = $request->input('message');
            $type = $request->input('type', 'text');

            $result = $this->wahaService->sendChatMessage($sessionName, $contactId, $message, $type);

            return $this->successResponse(
                $result['message'] ?? 'Message sent successfully',
                $result['data'] ?? []
            );
        } catch (Exception $e) {
            Log::error('Failed to send chat message', [
                'session_id' => $sessionId,
                'contact_id' => $contactId,
                'error' => $e->getMessage()
            ]);
            return $this->errorResponse('Failed to send chat message: ' . $e->getMessage(), 500);
        }
    }


    /**
     * Get webhook configuration for a session
     */
    public function getWebhookConfig(string $sessionId): JsonResponse
    {
        try {
            // Get current organization
            $organization = $this->getCurrentOrganization();
            if (!$organization) {
                return $this->handleUnauthorizedAccess('get webhook config');
            }

            $result = $this->wahaWebhookConfigService->getWebhookConfig($sessionId, $organization->id);

            return $result['success']
                ? $this->successResponse($result['message'], $result['data'])
                : $this->errorResponse($result['message'], $result['code'] ?? 500);

        } catch (Exception $e) {
            Log::error('Failed to get webhook config', [
                'session_id' => $sessionId,
                'error' => $e->getMessage()
            ]);
            return $this->errorResponse('Failed to get webhook config: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Configure webhook for a session
     */
    public function configureWebhook(Request $request, string $sessionId): JsonResponse
    {
        try {
            // Get current organization
            $organization = $this->getCurrentOrganization();
            if (!$organization) {
                return $this->handleUnauthorizedAccess('configure webhook');
            }

            // Validate request
            $webhookData = $request->validate([
                'webhook_url' => 'required|url',
                'events' => 'array',
                'events.*' => 'string|in:message,session.status,message.status',
                'webhook_by_events' => 'boolean',
            ]);

            $result = $this->wahaWebhookConfigService->configureWebhook($sessionId, $webhookData, $organization->id);

            return $result['success']
                ? $this->successResponse($result['message'], $result['data'])
                : $this->errorResponse($result['message'], $result['code'] ?? 500);

        } catch (Exception $e) {
            Log::error('Failed to configure webhook', [
                'session_id' => $sessionId,
                'error' => $e->getMessage()
            ]);
            return $this->errorResponse('Failed to configure webhook: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update webhook configuration for a session
     */
    public function updateWebhookConfig(Request $request, string $sessionId): JsonResponse
    {
        try {
            // Get current organization
            $organization = $this->getCurrentOrganization();
            if (!$organization) {
                return $this->handleUnauthorizedAccess('update webhook config');
            }

            // Validate request
            $webhookData = $request->validate([
                'webhook_url' => 'sometimes|url',
                'events' => 'sometimes|array',
                'events.*' => 'string|in:message,session.status,message.status',
                'webhook_by_events' => 'sometimes|boolean',
            ]);

            $result = $this->wahaWebhookConfigService->updateWebhookConfig($sessionId, $webhookData, $organization->id);

            return $result['success']
                ? $this->successResponse($result['message'], $result['data'])
                : $this->errorResponse($result['message'], $result['code'] ?? 500);

        } catch (Exception $e) {
            Log::error('Failed to update webhook config', [
                'session_id' => $sessionId,
                'error' => $e->getMessage()
            ]);
            return $this->errorResponse('Failed to update webhook config: ' . $e->getMessage(), 500);
        }
    }

}
