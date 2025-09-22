<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Services\Waha\WahaService;
use App\Services\Waha\WahaSyncService;
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
    protected N8nService $n8nService;

    public function __construct(WahaService $wahaService, WahaSyncService $wahaSyncService, N8nService $n8nService)
    {
        $this->wahaService = $wahaService;
        $this->wahaSyncService = $wahaSyncService;
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
     * Get all sessions for current organization
     */
    public function getSessions(): JsonResponse
    {
        try {
            // Get current organization
            $organization = $this->getCurrentOrganization();
            if (!$organization) {
                return $this->handleUnauthorizedAccess('access WAHA sessions');
            }

            // Use sync service to get sessions with automatic synchronization
            $result = $this->wahaSyncService->getSessionsForOrganization($organization->id);

            $this->logApiAction('get_waha_sessions', [
                'organization_id' => $organization->id,
                'sessions_count' => $result['total'],
                'created' => $result['created'] ?? 0,
                'updated' => $result['updated'] ?? 0,
            ]);

            return $this->successResponse('Sessions retrieved successfully', $result);
        } catch (Exception $e) {
            Log::error('Failed to get WAHA sessions', [
                'organization_id' => $this->getCurrentOrganization()?->id,
                'error' => $e->getMessage()
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

            // Check if request has any data, if not use defaults
            $hasPayload = $request->hasAny(['name', 'start', 'config']) || !empty($request->all());

            if (!$hasPayload) {
                // Create session with automatic defaults - no frontend payload needed
                return $this->createSessionWithDefaults($organization);
            }

            // Validate the request payload if provided
            $validatedData = $request->validate([
                'name' => 'nullable|string|max:255', // Made nullable since we'll generate it
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

            // Generate session name using UUID for better uniqueness
            $localSessionName = isset($validatedData['name']) ? $validatedData['name'] : $this->generateUuidSessionName($organization->id);

            // For WAHA Plus, we can use the actual session name (not forced to 'default')
            // Keep the original session name for WAHA Plus compatibility
            $wahaSessionName = isset($validatedData['name']) ? $validatedData['name'] : $localSessionName;

            // Ensure the 'name' key is always present for WahaService
            $validatedData['name'] = $wahaSessionName;

            // Add organization metadata to the config
            if (!isset($validatedData['config'])) {
                $validatedData['config'] = [];
            }
            if (!isset($validatedData['config']['metadata'])) {
                $validatedData['config']['metadata'] = [];
            }

            // Add organization information to metadata
            $validatedData['config']['metadata']['organization.id'] = $organization->id;
            $validatedData['config']['metadata']['organization.name'] = $organization->name;
            $validatedData['config']['metadata']['organization.code'] = $organization->org_code;

            // Flatten nested metadata objects to string key-value pairs for WAHA API compatibility
            $validatedData['config']['metadata'] = $this->flattenMetadata($validatedData['config']['metadata']);

            // Create N8N workflow first to get webhookId
            $n8nWorkflowResult = $this->createN8nWorkflowForWaha($organization->id, $localSessionName);
            $n8nWebhookId = $n8nWorkflowResult['webhook_id'] ?? null;

            // Update webhook configuration with N8N webhook if available
            if ($n8nWebhookId && isset($validatedData['config']['webhooks'])) {
                foreach ($validatedData['config']['webhooks'] as &$webhook) {
                    if (empty($webhook['url']) || $webhook['url'] === config('waha.webhooks.default_url', '')) {
                        $webhook['url'] = $this->generateN8nWebhookUrl($n8nWebhookId);
                        $webhook['customHeaders'] = array_merge($webhook['customHeaders'] ?? [], [
                            'X-Webhook-Source' => 'WAHA-Session',
                            'X-Organization-ID' => $organization->id,
                            'X-N8N-Webhook-ID' => $n8nWebhookId
                        ]);
                    }
                }
            }

            // Create session in 3rd party WAHA instance
            $result = $this->wahaService->createSession($validatedData);

            // Check if result is successful (either has 'success' field or has session data)
            $isSuccess = ($result['success'] ?? false) || isset($result['name']) || isset($result['session']);

            if ($isSuccess) {
                // Create or update local session record with enhanced session name
                $localSession = $this->wahaSyncService->createOrUpdateLocalSession(
                    $organization->id,
                    $localSessionName,
                    $result
                );

                // Add N8N workflow info to the response (already created above)
                $result['n8n_workflow'] = $n8nWorkflowResult;

                $this->logApiAction('create_waha_session', [
                    'session_name' => $localSessionName,
                    'waha_session_name' => $wahaSessionName, // Actual session name for WAHA Plus
                    'organization_id' => $organization->id,
                    'local_session_id' => $localSession->id,
                    'n8n_workflow_created' => $n8nWorkflowResult['success'] ?? false,
                    'n8n_workflow_id' => $n8nWorkflowResult['n8n_workflow']['data']['id'] ?? null,
                    'third_party_response' => $result,
                ]);

                return $this->successResponse('Session created successfully with N8N workflow', [
                    'local_session_id' => $localSession->id,
                    'organization_id' => $organization->id,
                    'session_name' => $localSessionName,
                    'waha_session_name' => $wahaSessionName, // Actual session name for WAHA Plus
                    'n8n_workflow' => $n8nWorkflowResult,
                    'third_party_response' => $result,
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

            // Check if session already exists and is working
            $existingSession = $this->wahaSyncService->verifySessionAccess($organization->id, $sessionId);
            if ($existingSession && $existingSession->is_connected && $existingSession->is_authenticated) {
                return $this->errorResponse('Session is already running and connected', 409);
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

            // Use sync service to create session with organization validation
            $localSession = $this->wahaSyncService->createSessionForOrganization(
                $organization->id,
                $sessionId,
                $config
            );

            $this->logApiAction('start_waha_session', [
                'session_id' => $sessionId,
                'organization_id' => $organization->id,
                'local_session_id' => $localSession->id,
            ]);

            return $this->successResponse('Session started successfully', [
                'local_session_id' => $localSession->id,
                'organization_id' => $organization->id,
                'session_name' => $sessionId,
                'status' => 'connecting',
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
            $localSession = $this->wahaSyncService->verifySessionAccess($organization->id, $sessionId);
            if (!$localSession) {
                return $this->handleResourceNotFound('WAHA session', $sessionId);
            }

            // Stop session in WAHA server
            $result = $this->wahaService->stopSession($sessionId);

            if ($result['success'] ?? false) {
                // Update session status using sync service
                $this->wahaSyncService->updateSessionStatus($organization->id, $sessionId, 'STOPPED');

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

            // Use sync service to get session with automatic sync
            $sessionData = $this->wahaSyncService->getSessionForOrganization($organization->id, $sessionId);

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
     * Create N8N workflow for WAHA session
     *
     * @param string $organizationId The organization ID
     * @param string $sessionName The WAHA session name
     * @return array
     */
    private function createN8nWorkflowForWaha(string $organizationId, string $sessionName): array
    {
        try {
            // Get workflow payload
            $workflowPayload = $this->getWahaWorkflowPayload($organizationId);

            // Update webhook ID in the first node to include session name for uniqueness
            if (isset($workflowPayload['nodes'][0]['webhookId'])) {
                $workflowPayload['nodes'][0]['webhookId'] = $organizationId . '_' . $sessionName;
            }

            // Create workflow using N8N service
            $result = $this->n8nService->createWorkflowWithDatabase(
                $workflowPayload,
                $organizationId,
                Auth::id(),
                'waha_' . $sessionName
            );

            // Extract webhookId from the created workflow
            $webhookId = null;
            if (isset($result['n8n_workflow']['data']['nodes'][0]['webhookId'])) {
                $webhookId = $result['n8n_workflow']['data']['nodes'][0]['webhookId'];
            } elseif (isset($result['n8n_workflow']['nodes'][0]['webhookId'])) {
                $webhookId = $result['n8n_workflow']['nodes'][0]['webhookId'];
            }

            // Add webhookId to the result
            $result['webhook_id'] = $webhookId;
            $result['webhook_url'] = $webhookId ? $this->generateN8nWebhookUrl($webhookId) : null;

            Log::info('N8N workflow created for WAHA session', [
                'organization_id' => $organizationId,
                'session_name' => $sessionName,
                'webhook_id' => $webhookId,
                'webhook_url' => $result['webhook_url'],
                'workflow_result' => $result
            ]);

            return $result;
        } catch (Exception $e) {
            Log::error('Failed to create N8N workflow for WAHA session', [
                'organization_id' => $organizationId,
                'session_name' => $sessionName,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
                'workflow_creation' => 'failed'
            ];
        }
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
            // Generate unique session name
            $localSessionName = $this->generateUuidSessionName($organization->id);
            $wahaSessionName = $localSessionName;

            // Create N8N workflow first to get webhookId
            $n8nWorkflowResult = $this->createN8nWorkflowForWaha($organization->id, $localSessionName);
            $n8nWebhookId = $n8nWorkflowResult['webhook_id'] ?? null;

            // Build session data with sensible defaults including N8N webhook
            $sessionData = [
                'name' => $wahaSessionName,
                'start' => true, // Auto-start the session
                'config' => $this->getDefaultSessionConfig($organization, $n8nWebhookId)
            ];

            Log::info('Creating WAHA session with automatic defaults', [
                'organization_id' => $organization->id,
                'session_name' => $localSessionName,
                'auto_start' => true
            ]);

            // Create session in 3rd party WAHA instance
            $result = $this->wahaService->createSession($sessionData);

            // Check if result is successful
            $isSuccess = ($result['success'] ?? false) || isset($result['name']) || isset($result['session']);

            if ($isSuccess) {
                // Create or update local session record
                $localSession = $this->wahaSyncService->createOrUpdateLocalSession(
                    $organization->id,
                    $localSessionName,
                    $result
                );

                // Add N8N workflow info to the response (already created above)
                $result['n8n_workflow'] = $n8nWorkflowResult;

                $this->logApiAction('create_waha_session_auto', [
                    'session_name' => $localSessionName,
                    'waha_session_name' => $wahaSessionName,
                    'organization_id' => $organization->id,
                    'local_session_id' => $localSession->id,
                    'auto_created' => true,
                    'n8n_workflow_created' => $n8nWorkflowResult['success'] ?? false,
                    'n8n_workflow_id' => $n8nWorkflowResult['n8n_workflow']['data']['id'] ?? null,
                    'third_party_response' => $result,
                ]);

                return $this->successResponse('Session created successfully with automatic defaults and N8N workflow', [
                    'local_session_id' => $localSession->id,
                    'organization_id' => $organization->id,
                    'session_name' => $localSessionName,
                    'waha_session_name' => $wahaSessionName,
                    'auto_created' => true,
                    'n8n_workflow' => $n8nWorkflowResult,
                    'status' => $localSession->status,
                    'third_party_response' => $result,
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
     * Generate webhook URL for N8N workflow
     *
     * @param string $webhookId The N8N webhook ID
     * @return string The complete webhook URL
     */
    private function generateN8nWebhookUrl(string $webhookId): string
    {
        $n8nBaseUrl = config('n8n.server.url', 'http://localhost:5678');
        return rtrim($n8nBaseUrl, '/') . '/webhook/' . $webhookId;
    }

    /**
     * Get default session configuration for automatic session creation
     *
     * @param object $organization The organization object
     * @param string|null $n8nWebhookId Optional N8N webhook ID
     * @return array Default session configuration
     */
    private function getDefaultSessionConfig($organization, ?string $n8nWebhookId = null): array
    {
        // Determine webhook URL - prioritize N8N webhook if available
        $webhookUrl = $n8nWebhookId
            ? $this->generateN8nWebhookUrl($n8nWebhookId)
            : config('waha.webhooks.default_url', '');

        return [
            'metadata' => $this->flattenMetadata([
                'organization.id' => $organization->id,
                'organization.name' => $organization->name,
                'organization.code' => $organization->org_code,
                'user.id' => 'system-auto',
                'user.email' => 'system@auto.com',
                'created_by' => 'backend-auto',
                'created_at' => now()->toISOString(),
                'n8n_webhook_id' => $n8nWebhookId,
            ]),
            'webhook_by_events' => false,
            'events' => ['message', 'session.status'],
            'reject_calls' => false,
            'mark_online_on_chat' => true,
            'debug' => true,
            'proxy' => null,
            'noweb' => [
                'store' => [
                    'enabled' => true,
                    'fullSync' => false
                ]
            ],
            'webhooks' => [
                [
                    'url' => $webhookUrl,
                    'events' => ['message', 'session.status'],
                    'hmac' => null,
                    'retries' => 3,
                    'customHeaders' => [
                        'X-Webhook-Source' => 'WAHA-Session',
                        'X-Organization-ID' => $organization->id,
                        'X-N8N-Webhook-ID' => $n8nWebhookId ?? 'none'
                    ]
                ]
            ]
        ];
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
}
