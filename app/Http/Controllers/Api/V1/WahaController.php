<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\WahaSession;
use App\Services\Waha\WahaService;
use App\Services\Waha\WahaSyncService;
use App\Services\Waha\WahaSessionService;
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
    protected N8nService $n8nService;

    public function __construct(
        WahaService $wahaService,
        WahaSyncService $wahaSyncService,
        WahaSessionService $wahaSessionService,
        N8nService $n8nService
    ) {
        $this->wahaService = $wahaService;
        $this->wahaSyncService = $wahaSyncService;
        $this->wahaSessionService = $wahaSessionService;
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
                return $this->createSessionWithDefaults($organization);
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

            // Add organization metadata to the config
            $this->addOrganizationMetadata($validatedData, $organization);

            // Use service to create session with N8N integration
            $result = $this->wahaSessionService->createSessionWithN8nIntegration($validatedData, $organization->id);

            // Check if result is successful
            $isSuccess = ($result['waha_session']['success'] ?? false) ||
                isset($result['waha_session']['name']) ||
                isset($result['waha_session']['session']);

            if ($isSuccess) {
                // Create or update local session record
                $localSession = $this->wahaSyncService->createOrUpdateLocalSession(
                    $organization->id,
                    $result['session_name'],
                    $result['waha_session']
                );

                $this->logApiAction('create_waha_session', [
                    'session_name' => $result['session_name'],
                    'organization_id' => $organization->id,
                    'local_session_id' => $localSession->id,
                    'n8n_workflow_created' => $result['n8n_workflow']['success'] ?? false,
                    'n8n_workflow_id' => $result['n8n_workflow']['data']['id'] ?? null,
                    'webhook_id' => $result['webhook_id'],
                    'webhook_url' => $result['webhook_url'],
                ]);

                return $this->successResponse('Session created successfully with N8N workflow', [
                    'local_session_id' => $localSession->id,
                    'organization_id' => $organization->id,
                    'session_name' => $result['session_name'],
                    'n8n_workflow' => $result['n8n_workflow'],
                    'webhook_id' => $result['webhook_id'],
                    'webhook_url' => $result['webhook_url'],
                    'third_party_response' => $result['waha_session'],
                    'status' => $localSession->status,
                ]);
            }

            return $this->errorResponse('Failed to create session in 3rd party WAHA', 500);
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

            // Check if session already exists by ID
            $existingSession = $this->wahaSyncService->verifySessionAccessById($organization->id, $sessionId);

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

            $localSession = null;

            if ($existingSession) {
                // Session exists locally, check if already running
                if ($existingSession->is_connected && $existingSession->is_authenticated) {
                    return $this->errorResponse('Session is already running and connected', 409);
                }

                // Check if session exists on WAHA server
                try {
                    $sessionInfo = $this->wahaService->getSessionInfo($existingSession->session_name);

                    // Update database first with connecting status
                    $this->wahaSyncService->updateSessionStatus($organization->id, $existingSession->session_name, 'STARTING');

                    // Then try to start session on WAHA server
                    $result = $this->wahaService->startSession($existingSession->session_name, $config);

                    // If no exception thrown, start session was successful
                    // Now check actual status from WAHA server and update database accordingly
                    try {
                        $updatedSessionInfo = $this->wahaService->getSessionInfo($existingSession->session_name);
                        $actualStatus = $updatedSessionInfo['status'] ?? 'connecting';

                        // Update database with actual status from WAHA server
                        $this->wahaSyncService->updateSessionStatus($organization->id, $existingSession->session_name, $actualStatus);
                    } catch (\Exception $e) {
                        // If we can't get updated status, keep as connecting
                        $this->wahaSyncService->updateSessionStatus($organization->id, $existingSession->session_name, 'STARTING');
                    }

                    $localSession = $existingSession;
                } catch (\App\Services\Waha\Exceptions\WahaException $e) {
                    // Session doesn't exist on WAHA server, return error
                    Log::warning('Session not found on WAHA server, cannot start', [
                        'session_id' => $sessionId,
                        'session_name' => $existingSession->session_name,
                        'organization_id' => $organization->id,
                        'error' => $e->getMessage()
                    ]);

                    return $this->errorResponse('Session not found on WAHA server. Please create the session first.', 404);
                } catch (Exception $e) {
                    // Other error
                    Log::error('Unexpected error checking WAHA session', [
                        'session_id' => $sessionId,
                        'session_name' => $existingSession->session_name,
                        'organization_id' => $organization->id,
                        'error' => $e->getMessage()
                    ]);

                    return $this->errorResponse('Failed to check session status on WAHA server', 500);
                }
            } else {
                // Session doesn't exist locally, return error
                return $this->errorResponse('Session not found. Please create the session first.', 404);
            }

            $this->logApiAction('start_waha_session', [
                'session_id' => $sessionId,
                'organization_id' => $organization->id,
                'local_session_id' => $localSession->id,
            ]);

            // Get the updated session status from database
            $updatedLocalSession = $this->wahaSyncService->verifySessionAccessById($organization->id, $sessionId);

            return $this->successResponse('Session started successfully', [
                'local_session_id' => $localSession->id,
                'organization_id' => $organization->id,
                'session_name' => $localSession->session_name,
                'status' => $updatedLocalSession->status ?? 'connecting',
            ]);
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

            // Verify session belongs to current organization
            $localSession = $this->wahaSyncService->verifySessionAccessById($organization->id, $sessionId);
            if (!$localSession) {
                return $this->handleResourceNotFound('WAHA session', $sessionId);
            }

            // Stop session in WAHA server
            $result = $this->wahaService->stopSession($localSession->session_name);

            // Check if the result contains session data (WAHA API returns session info on success)
            if (isset($result['name']) && isset($result['status'])) {
                // Update session status using sync service
                $this->wahaSyncService->updateSessionStatus($organization->id, $localSession->session_name, 'STOPPED');

                $this->logApiAction('stop_waha_session', [
                    'session_id' => $sessionId,
                    'organization_id' => $organization->id,
                    'local_session_id' => $localSession->id,
                ]);

                return $this->successResponse('Session stopped successfully', array_merge($result, [
                    'local_session_id' => $localSession->id,
                    'organization_id' => $organization->id,
                ]));
            }

            return $this->errorResponse('Failed to stop session', 500);
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

            // Verify session belongs to current organization
            $localSession = $this->wahaSyncService->verifySessionAccess($organization->id, $sessionId);
            if (!$localSession) {
                return $this->handleResourceNotFound('WAHA session', $sessionId);
            }

            $data = $request->validate([
                'to' => 'required|string',
                'text' => 'required|string|max:4096',
            ]);

            $result = $this->wahaService->sendTextMessage(
                $sessionId,
                $data['to'],
                $data['text']
            );

            // Update message count in local session
            if ($result['success'] ?? false) {
                $localSession->increment('total_messages_sent');
            }

            $this->logApiAction('send_waha_text_message', [
                'session_id' => $sessionId,
                'organization_id' => $organization->id,
                'recipient' => $data['to'],
            ]);

            return $this->successResponse('Message sent successfully', $result);
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
    // ...

    public function regenerateQrCode(string $sessionId): JsonResponse
    {
        try {
            // 1. Validasi awal (Guard Clauses)
            $organization = $this->getCurrentOrganization();
            if (!$organization) {
                return $this->handleUnauthorizedAccess('regenerate WAHA QR code');
            }

            $localSession = $this->wahaSyncService->verifySessionAccess($organization->id, $sessionId);
            if (!$localSession) {
                return $this->handleResourceNotFound('WAHA session', $sessionId);
            }

            // 2. Jika sudah terhubung, tidak perlu generate QR baru
            if ($localSession->is_connected && $localSession->is_authenticated) {
                return $this->successResponse('Session is already connected', [
                    'connected' => true,
                    'status' => $localSession->status,
                    'message' => 'QR code regeneration is not needed.'
                ]);
            }

            // 3. Pastikan sesi berjalan sebelum meminta QR
            $this->ensureSessionIsRunning($localSession);

            // 4. Ambil QR code, dengan logika retry (restart) jika gagal
            $qrCode = $this->fetchQrCodeWithRestart($localSession);

            $this->logApiAction('regenerate_waha_qr_code', [
                'session_id' => $sessionId,
                'organization_id' => $organization->id
            ]);

            return $this->successResponse('QR code retrieved successfully', $qrCode);
        } catch (Exception $e) {
            Log::error('Failed to regenerate WAHA QR code', [
                'session_id' => $sessionId,
                'organization_id' => $this->getCurrentOrganization()?->id,
                'error' => $e->getMessage()
            ]);

            // Memberikan pesan error yang lebih spesifik kepada client jika memungkinkan
            return $this->errorResponse($e->getMessage(), 500);
        }
    }

    /**
     * Memastikan sesi WAHA dalam keadaan berjalan, jika 'STOPPED' maka akan dijalankan.
     *
     * @param mixed $localSession
     * @throws Exception
     */
    private function ensureSessionIsRunning(mixed $localSession): void
    {
        $sessionInfo = $this->wahaService->getSessionInfo($localSession->session_name);

        if (!$sessionInfo || !isset($sessionInfo['status'])) {
            throw new Exception('Failed to get session info: ' . ($sessionInfo['error'] ?? 'Unknown error'));
        }

        $status = $sessionInfo['status'] ?? 'UNKNOWN';

        if ($status === 'STOPPED') {
            Log::info('Session is stopped, attempting to start it.', ['session_name' => $localSession->session_name]);
            try {
                $startResult = $this->wahaService->startSession($localSession->session_name);
                // If no exception thrown, start was successful
                Log::info('Session started successfully', ['session_name' => $localSession->session_name]);

                // Beri jeda agar sesi sempat terinisialisasi
                sleep(2);
            } catch (Exception $e) {
                throw new Exception('Failed to start a stopped session: ' . $e->getMessage());
            }
        }
    }

    /**
     * Mencoba mengambil QR code. Jika gagal, coba restart sesi dan ambil lagi.
     *
     * @param mixed $localSession
     * @return array
     * @throws Exception
     */
    private function fetchQrCodeWithRestart(mixed $localSession): array
    {
        try {
            // Coba ambil QR code pertama kali
            return $this->wahaService->getQrCode($localSession->session_name);
        } catch (Exception $initialException) {
            Log::warning('Initial QR code fetch failed, attempting session restart.', [
                'session_name' => $localSession->session_name,
                'error' => $initialException->getMessage()
            ]);

            // Jika gagal, coba restart sesi
            try {
                $restartResult = $this->wahaService->restartSession($localSession->session_name);
                Log::info('Session restarted successfully after QR fetch failure', [
                    'session_name' => $localSession->session_name
                ]);
            } catch (Exception $restartException) {
                throw new Exception('Failed to restart session after QR fetch failure: ' . $restartException->getMessage());
            }

            // Beri jeda agar sesi sempat restart
            sleep(3);

            // Coba lagi mengambil QR code setelah restart
            try {
                return $this->wahaService->getQrCode($localSession->session_name);
            } catch (Exception $retryException) {
                // Jika percobaan kedua tetap gagal, menyerah.
                throw new Exception('Failed to get QR code even after restarting session.');
            }
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

            // Use sync service to get session with automatic sync using session name
            $sessionData = $this->wahaSyncService->getSessionForOrganization($organization->id, $localSession->session_name);

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
            if (!$this->validateWahaWebhookSignature($request)) {
                Log::warning('Invalid WAHA webhook signature', [
                    'payload' => $payload
                ]);
                return $this->errorResponse('Invalid webhook signature', 401);
            }

            // Extract organization ID from session name
            $organizationId = $this->extractOrganizationFromSession($sessionName);

            if (!$organizationId) {
                Log::error('Organization ID not found for WAHA webhook', [
                    'session' => $sessionName,
                    'event' => $payload['event'] ?? 'unknown'
                ]);
                return $this->errorResponse('Organization not found', 400);
            }

            // Handle different webhook event types
            $result = $this->handleWahaWebhookEvent($payload, $organizationId);

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
     * Flatten nested metadata objects to string key-value pairs for WAHA API compatibility
     *
     * @param array $metadata The metadata array to flatten
     * @return array Flattened metadata with string values only
     */
    private function flattenMetadata(array $metadata): array
    {
        $flattened = [];

        foreach ($metadata as $key => $value) {
            if (is_array($value)) {
                // Recursively flatten nested arrays
                $nested = $this->flattenMetadata($value);
                foreach ($nested as $nestedKey => $nestedValue) {
                    $flattened["{$key}.{$nestedKey}"] = (string) $nestedValue;
                }
            } else {
                // Convert all values to strings
                $flattened[$key] = (string) $value;
            }
        }

        return $flattened;
    }

    /**
     * Convert WAHA workflow JSON payload to PHP array
     *
     * @param string $organizationId The organization ID
     * @return array
     */
    private function getWahaWorkflowPayload(string $organizationId): array
    {
        // Load the JSON payload from file
        $jsonPath = base_path('waha_workflow_payload.json');

        if (!file_exists($jsonPath)) {
            throw new Exception('WAHA workflow payload file not found');
        }

        $jsonContent = file_get_contents($jsonPath);
        $payload = json_decode($jsonContent, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception('Invalid JSON in WAHA workflow payload: ' . json_last_error_msg());
        }

        // Replace organization_id placeholder with actual organization ID
        $payload['name'] = str_replace('organization_id_(count001)', $organizationId, $payload['name']);

        // Update webhookId in the first node (WAHA Trigger)
        if (isset($payload['nodes'][0]['webhookId'])) {
            $payload['nodes'][0]['webhookId'] = str_replace('organization_id_(count001)', $organizationId, $payload['nodes'][0]['webhookId']);
        }

        return $payload;
    }


    /**
     * Create session with automatic defaults - no frontend payload required
     *
     * @param object $organization The organization object
     * @return JsonResponse
     */
    private function createSessionWithDefaults($organization): JsonResponse
    {
        try {
            // Use service to create default session with N8N integration
            $result = $this->wahaSessionService->createDefaultSessionWithN8nIntegration($organization);

            // Check if result is successful
            $isSuccess = ($result['waha_session']['success'] ?? false) ||
                isset($result['waha_session']['name']) ||
                isset($result['waha_session']['session']);

            if ($isSuccess) {
                // Session already saved to database by createDefaultSessionWithN8nIntegration
                // Just get the local session for response
                $localSession = WahaSession::where('organization_id', $organization->id)
                    ->where('session_name', $result['session_name'])
                    ->first();

                $this->logApiAction('create_waha_session_auto', [
                    'session_name' => $result['session_name'],
                    'organization_id' => $organization->id,
                    'local_session_id' => $localSession->id ?? 'N/A',
                    'auto_created' => true,
                    'n8n_workflow_created' => $result['n8n_workflow']['success'] ?? false,
                    'n8n_workflow_id' => $result['n8n_workflow']['data']['id'] ?? null,
                    'webhook_id' => $result['webhook_id'],
                    'webhook_url' => $result['webhook_url'],
                ]);

                return $this->successResponse('Session created successfully with automatic defaults and N8N workflow', [
                    'local_session_id' => $localSession->id ?? 'N/A',
                    'organization_id' => $organization->id,
                    'session_name' => $result['session_name'],
                    'auto_created' => true,
                    'n8n_workflow' => $result['n8n_workflow'],
                    'webhook_id' => $result['webhook_id'],
                    'webhook_url' => $result['webhook_url'],
                    'status' => $localSession->status ?? 'unknown',
                    'third_party_response' => $result['waha_session'],
                ]);
            }

            return $this->errorResponse('Failed to create session in 3rd party WAHA', 500);
        } catch (Exception $e) {
            Log::error('Failed to create WAHA session with defaults', [
                'organization_id' => $organization->id,
                'error' => $e->getMessage()
            ]);
            return $this->errorResponse('Failed to create session with defaults', 500);
        }
    }

    /**
     * Add organization metadata to session configuration
     *
     * @param array $validatedData Session data
     * @param object $organization Organization object
     * @return void
     */
    private function addOrganizationMetadata(array &$validatedData, $organization): void
    {
        // Ensure config structure exists
        if (!isset($validatedData['config'])) {
            $validatedData['config'] = [];
        }
        if (!isset($validatedData['config']['metadata'])) {
            $validatedData['config']['metadata'] = [];
        }

        // Get user name instead of ID
        $user = Auth::user();
        $createdByName = $user ? ($user->first_name . ' ' . $user->last_name) : 'System';

        // Add organization information to metadata (avoid duplication)
        $validatedData['config']['metadata']['organization.id'] = $organization->id;
        $validatedData['config']['metadata']['organization.name'] = $organization->name;
        $validatedData['config']['metadata']['organization.code'] = $organization->org_code;
        $validatedData['config']['metadata']['created_by'] = $createdByName;
        $validatedData['config']['metadata']['created_at'] = now()->toISOString();

        // Flatten nested metadata objects to string key-value pairs for WAHA API compatibility
        $validatedData['config']['metadata'] = $this->flattenMetadata($validatedData['config']['metadata']);
    }


    /**
     * Generate a unique session name using UUID
     *
     * @param string $organizationId The organization ID
     * @param string|null $customName Optional custom name prefix
     * @return string Generated session name with UUID
     */
    private function generateUuidSessionName(string $organizationId, ?string $customName = null): string
    {
        $sessionUuid = \Illuminate\Support\Str::uuid()->toString();
        $orgIdPrefix = substr($organizationId, 0, 7); // Get first 7 characters of organization ID

        if ($customName) {
            return "{$customName}-{$orgIdPrefix}-{$sessionUuid}";
        }

        return "session-{$orgIdPrefix}-{$sessionUuid}";
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
     * Extract message data from WAHA webhook payload
     */
    private function extractWahaMessageData(array $payload): ?array
    {
        try {

            // Standard WAHA webhook format (from documentation)
            if (isset($payload['event']) && in_array($payload['event'], ['message', 'message.any']) && isset($payload['payload'])) {
                $message = $payload['payload'];

                return [
                    'message_id' => $message['id'] ?? \Illuminate\Support\Str::uuid(),
                    'from' => $message['from'] ?? null,
                    'to' => $message['to'] ?? null,
                    'text' => $message['body'] ?? null,
                    'message_type' => $this->determineMessageType($message),
                    'timestamp' => $message['timestamp'] ?? now()->timestamp,
                    'session_name' => $payload['session'] ?? null,
                    'customer_phone' => $this->extractPhoneNumber($message['from'] ?? null),
                    'customer_name' => $this->extractCustomerName($message),
                    'raw_data' => $payload,
                    'waha_message_id' => $message['id'] ?? null,
                    'waha_session' => $payload['session'] ?? null,
                    'waha_event_id' => $payload['id'] ?? null,
                    'from_me' => $message['fromMe'] ?? false,
                    'source' => $message['source'] ?? 'unknown',
                    'participant' => $message['participant'] ?? null,
                    'has_media' => $message['hasMedia'] ?? false,
                    'media' => $message['media'] ?? null,
                    'ack' => $message['ack'] ?? -1,
                    'ack_name' => $message['ackName'] ?? null,
                    'author' => $message['author'] ?? null,
                    'location' => $message['location'] ?? null,
                    'v_cards' => $message['vCards'] ?? [],
                    'reply_to' => $message['replyTo'] ?? null,
                    'me' => $payload['me'] ?? null,
                    'environment' => $payload['environment'] ?? null,
                ];
            }

            // Legacy WAHA format (backward compatibility)
            if (isset($payload['message']) && isset($payload['session'])) {
                $message = $payload['message'];

                return [
                    'message_id' => $message['id'] ?? \Illuminate\Support\Str::uuid(),
                    'from' => $message['from'] ?? null,
                    'to' => $message['to'] ?? null,
                    'text' => $message['text']['body'] ?? $message['body'] ?? null,
                    'message_type' => $message['type'] ?? 'text',
                    'timestamp' => $message['timestamp'] ?? now()->timestamp,
                    'session_name' => $payload['session'] ?? null,
                    'customer_phone' => $this->extractPhoneNumber($message['from'] ?? null),
                    'customer_name' => $message['contact']['name'] ?? null,
                    'raw_data' => $payload,
                    'waha_message_id' => $message['id'] ?? null,
                    'waha_session' => $payload['session'] ?? null,
                ];
            }

            return null;

        } catch (Exception $e) {
            Log::error('Failed to extract WAHA message data', [
                'error' => $e->getMessage(),
                'payload' => $payload
            ]);
            return null;
        }
    }

    /**
     * Determine message type from WAHA message data
     */
    private function determineMessageType(array $message): string
    {
        if (isset($message['hasMedia']) && $message['hasMedia']) {
            if (isset($message['media']['mimetype'])) {
                $mimetype = $message['media']['mimetype'];
                if (str_starts_with($mimetype, 'image/')) return 'image';
                if (str_starts_with($mimetype, 'video/')) return 'video';
                if (str_starts_with($mimetype, 'audio/')) return 'audio';
                if (str_starts_with($mimetype, 'application/')) return 'document';
            }
            return 'media';
        }

        if (isset($message['location'])) return 'location';
        if (isset($message['vCards']) && !empty($message['vCards'])) return 'contact';
        if (isset($message['body']) && empty($message['body'])) return 'system';

        return 'text';
    }

    /**
     * Extract phone number from WAHA format
     */
    private function extractPhoneNumber(?string $from): ?string
    {
        if (!$from) return null;

        // Remove @c.us suffix if present
        return str_replace('@c.us', '', $from);
    }

    /**
     * Extract customer name from message data
     */
    private function extractCustomerName(array $message): ?string
    {

        // Try different possible locations for customer name
        if (isset($message['contact']['name'])) {
            return $message['contact']['name'];
        }

        if (isset($message['author'])) {
            return $message['author'];
        }

        if (isset($message['pushName'])) {
            return $message['pushName'];
        }

        // Check in _data.notifyName (real WAHA data)
        if (isset($message['_data']['notifyName'])) {
            return $message['_data']['notifyName'];
        }

        // Check in media._data.notifyName (real WAHA data structure)
        if (isset($message['media']['_data']['notifyName'])) {
            return $message['media']['_data']['notifyName'];
        }

        return null;
    }

    /**
     * Extract organization ID from session name
     */
    private function extractOrganizationFromSession(?string $sessionName): ?string
    {
        if (!$sessionName) {
            return null;
        }

        try {
            // Find organization by session name
            $wahaSession = \App\Models\WahaSession::where('session_name', $sessionName)->first();

            if ($wahaSession) {
                return $wahaSession->organization_id;
            }

            // Try to extract from session name pattern (e.g., "session_orgId_kbId")
            if (str_starts_with($sessionName, 'session_')) {
                $parts = explode('_', $sessionName);
                if (count($parts) >= 2) {
                    $potentialOrgId = $parts[1];
                    // Verify if this is a valid organization ID
                    $organization = \App\Models\Organization::find($potentialOrgId);
                    if ($organization) {
                        return $organization->id;
                    }
                }
            }

            return null;

        } catch (Exception $e) {
            Log::error('Failed to extract organization from session', [
                'session_name' => $sessionName,
                'error' => $e->getMessage()
            ]);
            return null;
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

            // Verify session belongs to current organization
            $localSession = $this->wahaSyncService->verifySessionAccessById($organization->id, $sessionId);
            if (!$localSession) {
                return $this->handleResourceNotFound('WAHA session', $sessionId);
            }

            $sessionName = $localSession->session_name;
            $result = $this->wahaService->getWebhookConfig($sessionName);

            return $this->successResponse(
                $result['message'] ?? 'Webhook configuration retrieved successfully',
                $result['data'] ?? []
            );

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

            // Verify session belongs to current organization
            $localSession = $this->wahaSyncService->verifySessionAccessById($organization->id, $sessionId);
            if (!$localSession) {
                return $this->handleResourceNotFound('WAHA session', $sessionId);
            }

            // Validate request
            $request->validate([
                'webhook_url' => 'required|url',
                'events' => 'array',
                'events.*' => 'string|in:message,session.status,message.status',
                'webhook_by_events' => 'boolean',
            ]);

            $sessionName = $localSession->session_name;
            $webhookUrl = $request->input('webhook_url');
            $events = $request->input('events', ['message', 'session.status']);
            $options = $request->only(['webhook_by_events']);

            $result = $this->wahaService->configureWebhook($sessionName, $webhookUrl, $events, $options);

            return $this->successResponse(
                $result['message'] ?? 'Webhook configured successfully',
                $result['data'] ?? []
            );

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

            // Verify session belongs to current organization
            $localSession = $this->wahaSyncService->verifySessionAccessById($organization->id, $sessionId);
            if (!$localSession) {
                return $this->handleResourceNotFound('WAHA session', $sessionId);
            }

            // Validate request
            $request->validate([
                'webhook_url' => 'sometimes|url',
                'events' => 'sometimes|array',
                'events.*' => 'string|in:message,session.status,message.status',
                'webhook_by_events' => 'sometimes|boolean',
            ]);

            $sessionName = $localSession->session_name;
            $webhookUrl = $request->input('webhook_url');
            $events = $request->input('events', ['message', 'session.status']);
            $options = $request->only(['webhook_by_events']);

            $result = $this->wahaService->configureWebhook($sessionName, $webhookUrl, $events, $options);

            return $this->successResponse(
                $result['message'] ?? 'Webhook configuration updated successfully',
                $result['data'] ?? []
            );

        } catch (Exception $e) {
            Log::error('Failed to update webhook config', [
                'session_id' => $sessionId,
                'error' => $e->getMessage()
            ]);
            return $this->errorResponse('Failed to update webhook config: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Handle different types of WAHA webhook events
     */
    private function handleWahaWebhookEvent(array $payload, string $organizationId): array
    {
        $eventType = $payload['event'] ?? 'unknown';

        try {
            switch ($eventType) {
                case 'message':
                case 'message.any':
                    return $this->handleMessageEvent($payload, $organizationId);

                case 'message.reaction':
                    return $this->handleMessageReactionEvent($payload, $organizationId);

                case 'message.ack':
                    return $this->handleMessageAckEvent($payload, $organizationId);

                case 'message.revoked':
                    return $this->handleMessageRevokedEvent($payload, $organizationId);

                case 'message.edited':
                    return $this->handleMessageEditedEvent($payload, $organizationId);

                case 'group.v2.join':
                case 'group.v2.leave':
                case 'group.v2.update':
                case 'group.v2.participants':
                    return $this->handleGroupEvent($payload, $organizationId);

                case 'chat.archive':
                    return $this->handleChatArchiveEvent($payload, $organizationId);

                case 'presence.update':
                    return $this->handlePresenceUpdateEvent($payload, $organizationId);

                case 'poll.vote':
                    return $this->handlePollVoteEvent($payload, $organizationId);

                case 'call.received':
                case 'call.accepted':
                case 'call.rejected':
                    return $this->handleCallEvent($payload, $organizationId);

                default:
                    Log::info('Unhandled WAHA webhook event type', [
                        'event' => $eventType,
                        'organization_id' => $organizationId
                    ]);
                    return [
                        'success' => true,
                        'message' => 'Event type not handled but acknowledged'
                    ];
            }
        } catch (Exception $e) {
            Log::error('Failed to handle WAHA webhook event', [
                'event' => $eventType,
                'organization_id' => $organizationId,
                'error' => $e->getMessage()
            ]);
            return [
                'success' => false,
                'message' => 'Failed to handle webhook event: ' . $e->getMessage(),
                'code' => 500
            ];
        }
    }

    /**
     * Handle message events
     */
    private function handleMessageEvent(array $payload, string $organizationId): array
    {
        // Extract message data from WAHA webhook format
        $messageData = $this->extractWahaMessageData($payload);

        if (!$messageData) {
            return [
                'success' => false,
                'message' => 'Invalid message format',
                'code' => 400
            ];
        }

        // Add organization_id to message data
        $messageData['organization_id'] = $organizationId;

        // Check if this is an outgoing message (from our system)
        $isOutgoing = $messageData['from_me'] ?? false;

        if ($isOutgoing) {
            // Handle outgoing message (from bot/agent)
            Log::info('Outgoing message detected', [
                'message_id' => $messageData['message_id'],
                'to' => $messageData['to'],
                'text' => $messageData['text'],
                'organization_id' => $organizationId
            ]);

            // Save outgoing message to database
            $this->saveOutgoingMessage($messageData, $organizationId);

            return [
                'success' => true,
                'message' => 'Outgoing message processed',
                'data' => [
                    'message_id' => $messageData['message_id'] ?? null,
                    'to' => $messageData['to'] ?? null,
                    'direction' => 'outgoing'
                ]
            ];
        } else {
            // Handle incoming message (from customer)
            Log::info('Incoming message detected', [
                'message_id' => $messageData['message_id'],
                'from' => $messageData['from'],
                'text' => $messageData['text'],
                'organization_id' => $organizationId
            ]);

            // Check if this webhook has already been processed to prevent duplicate events
            $webhookKey = "whatsapp_waha_processed:{$organizationId}:{$messageData['message_id']}";

            if (\Illuminate\Support\Facades\Redis::exists($webhookKey)) {
                Log::warning('WhatsApp WAHA webhook already processed, skipping duplicate', [
                    'organization_id' => $organizationId,
                    'message_id' => $messageData['message_id'] ?? 'unknown',
                    'from' => $messageData['from'] ?? 'unknown',
                    'webhook_key' => $webhookKey,
                ]);

                return [
                    'success' => false,
                    'message' => 'Webhook already processed',
                    'data' => [
                        'message_id' => $messageData['message_id'] ?? null,
                        'from' => $messageData['from'] ?? null,
                        'status' => 'duplicate'
                    ]
                ];
            }

            // Mark webhook as processed (expire in 1 hour)
            \Illuminate\Support\Facades\Redis::setex($webhookKey, 3600, 'processed');

            // Fire event for asynchronous processing
            event(new \App\Events\WhatsAppMessageReceived($messageData, $organizationId));

            return [
                'success' => true,
                'message' => 'Incoming message event processed',
                'data' => [
                    'message_id' => $messageData['message_id'] ?? null,
                    'from' => $messageData['from'] ?? null,
                    'direction' => 'incoming'
                ]
            ];
        }
    }

    /**
     * Save outgoing message to database
     */
    private function saveOutgoingMessage(array $messageData, string $organizationId): void
    {
        try {
            // Find the session based on customer phone number
            $customerPhone = $messageData['to'] ?? null;
            if (!$customerPhone) {
                Log::warning('Cannot save outgoing message: no customer phone found', [
                    'message_data' => $messageData
                ]);
                return;
            }

            // Find customer (try both formats: with and without @c.us)
            $customer = \App\Models\Customer::where('organization_id', $organizationId)
                ->where(function($query) use ($customerPhone) {
                    $query->where('phone', $customerPhone)
                          ->orWhere('phone', str_replace('@c.us', '', $customerPhone))
                          ->orWhere('phone', $customerPhone . '@c.us');
                })
                ->first();

            if (!$customer) {
                Log::warning('Cannot save outgoing message: customer not found', [
                    'phone' => $customerPhone,
                    'organization_id' => $organizationId
                ]);
                return;
            }

            // Find active session
            $session = \App\Models\ChatSession::where('organization_id', $organizationId)
                ->where('customer_id', $customer->id)
                ->where('is_active', true)
                ->first();

            if (!$session) {
                Log::warning('Cannot save outgoing message: no active session found', [
                    'customer_id' => $customer->id,
                    'organization_id' => $organizationId
                ]);
                return;
            }

            // Determine sender type and ID
            $senderType = 'bot'; // Default to bot
            $senderId = null;
            $senderName = 'System Bot';

            // Check if session has an assigned agent
            if ($session->agent_id) {
                $senderType = 'agent';
                $senderId = $session->agent_id;
                $senderName = $session->agent->display_name ?? 'Agent';
            } else {
                // Check if there's a bot personality for this organization
                $botPersonality = \App\Models\BotPersonality::where('organization_id', $organizationId)
                    ->where('status', 'active')
                    ->where('is_default', true)
                    ->first();

                if ($botPersonality) {
                    $senderId = $botPersonality->id;
                    $senderName = $botPersonality->name;
                }
            }

            // Create outgoing message
            $message = \App\Models\Message::create([
                'organization_id' => $organizationId,
                'session_id' => $session->id,
                'waha_session_id' => $messageData['waha_session'] ?? null,
                'sender_type' => $senderType,
                'sender_id' => $senderId,
                'sender_name' => $senderName,
                'message_type' => $messageData['message_type'] ?? 'text',
                'message_text' => $messageData['text'] ?? '',
                'metadata' => [
                    'whatsapp_message_id' => $messageData['message_id'] ?? null,
                    'phone_number' => $messageData['to'] ?? null,
                    'timestamp' => $messageData['timestamp'] ?? now()->timestamp,
                    'raw_data' => $messageData['raw_data'] ?? null,
                    'direction' => 'outgoing',
                    'from_me' => true,
                    'waha_message_id' => $messageData['waha_message_id'] ?? null
                ],
                'is_read' => true, // Outgoing messages are considered read
                'read_at' => now(),
                'delivered_at' => now(),
                'created_at' => now()->addMilliseconds(rand(100, 500))
            ]);

            Log::info('Outgoing message saved successfully', [
                'message_id' => $message->id,
                'session_id' => $session->id,
                'sender_type' => $senderType,
                'sender_name' => $senderName,
                'content' => $message->message_text
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to save outgoing message', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'message_data' => $messageData
            ]);
        }
    }

    /**
     * Handle message reaction events
     */
    private function handleMessageReactionEvent(array $payload, string $organizationId): array
    {
        Log::info('Message reaction event received', [
            'organization_id' => $organizationId,
            'payload' => $payload
        ]);

        // TODO: Implement message reaction handling
        return [
            'success' => true,
            'message' => 'Message reaction event processed'
        ];
    }

    /**
     * Handle message acknowledgment events
     */
    private function handleMessageAckEvent(array $payload, string $organizationId): array
    {
        Log::info('Message ACK event received', [
            'organization_id' => $organizationId,
            'payload' => $payload
        ]);

        // TODO: Implement message ACK handling
        return [
            'success' => true,
            'message' => 'Message ACK event processed'
        ];
    }

    /**
     * Handle message revoked events
     */
    private function handleMessageRevokedEvent(array $payload, string $organizationId): array
    {
        Log::info('Message revoked event received', [
            'organization_id' => $organizationId,
            'payload' => $payload
        ]);

        // TODO: Implement message revocation handling
        return [
            'success' => true,
            'message' => 'Message revoked event processed'
        ];
    }

    /**
     * Handle message edited events
     */
    private function handleMessageEditedEvent(array $payload, string $organizationId): array
    {
        Log::info('Message edited event received', [
            'organization_id' => $organizationId,
            'payload' => $payload
        ]);

        // TODO: Implement message edit handling
        return [
            'success' => true,
            'message' => 'Message edited event processed'
        ];
    }

    /**
     * Handle group events
     */
    private function handleGroupEvent(array $payload, string $organizationId): array
    {
        Log::info('Group event received', [
            'organization_id' => $organizationId,
            'event' => $payload['event'] ?? 'unknown',
            'payload' => $payload
        ]);

        // TODO: Implement group event handling
        return [
            'success' => true,
            'message' => 'Group event processed'
        ];
    }

    /**
     * Handle chat archive events
     */
    private function handleChatArchiveEvent(array $payload, string $organizationId): array
    {
        Log::info('Chat archive event received', [
            'organization_id' => $organizationId,
            'payload' => $payload
        ]);

        // TODO: Implement chat archive handling
        return [
            'success' => true,
            'message' => 'Chat archive event processed'
        ];
    }

    /**
     * Handle presence update events
     */
    private function handlePresenceUpdateEvent(array $payload, string $organizationId): array
    {
        Log::info('Presence update event received', [
            'organization_id' => $organizationId,
            'payload' => $payload
        ]);

        // TODO: Implement presence update handling
        return [
            'success' => true,
            'message' => 'Presence update event processed'
        ];
    }

    /**
     * Handle poll vote events
     */
    private function handlePollVoteEvent(array $payload, string $organizationId): array
    {
        Log::info('Poll vote event received', [
            'organization_id' => $organizationId,
            'payload' => $payload
        ]);

        // TODO: Implement poll vote handling
        return [
            'success' => true,
            'message' => 'Poll vote event processed'
        ];
    }

    /**
     * Handle call events
     */
    private function handleCallEvent(array $payload, string $organizationId): array
    {
        Log::info('Call event received', [
            'organization_id' => $organizationId,
            'event' => $payload['event'] ?? 'unknown',
            'payload' => $payload
        ]);

        // TODO: Implement call event handling
        return [
            'success' => true,
            'message' => 'Call event processed'
        ];
    }

    /**
     * Validate WAHA webhook signature
     */
    private function validateWahaWebhookSignature(Request $request): bool
    {
        // Check if webhook signature validation is enabled
        if (!config('waha.webhook.validate_signature', false)) {
            return true; // Skip validation if not configured
        }

        $signature = $request->header('X-WAHA-Signature');
        $payload = $request->getContent();
        $secret = config('waha.webhook.secret');

        if (!$signature || !$secret) {
            return false;
        }

        $expectedSignature = hash_hmac('sha256', $payload, $secret);
        return hash_equals($expectedSignature, $signature);
    }
}
