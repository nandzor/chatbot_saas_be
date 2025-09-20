<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Services\Waha\WahaService;
use App\Services\Waha\WahaSyncService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Exception;

class WahaController extends BaseApiController
{
    protected WahaService $wahaService;
    protected WahaSyncService $wahaSyncService;

    public function __construct(WahaService $wahaService, WahaSyncService $wahaSyncService)
    {
        $this->wahaService = $wahaService;
        $this->wahaSyncService = $wahaSyncService;
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

                $this->logApiAction('create_waha_session', [
                    'session_name' => $localSessionName,
                    'waha_session_name' => $wahaSessionName, // Actual session name for WAHA Plus
                    'organization_id' => $organization->id,
                    'local_session_id' => $localSession->id,
                    'third_party_response' => $result,
                ]);

                return $this->successResponse('Session created successfully', [
                    'local_session_id' => $localSession->id,
                    'organization_id' => $organization->id,
                    'session_name' => $localSessionName,
                    'waha_session_name' => $wahaSessionName, // Actual session name for WAHA Plus
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
            $localSession = $this->wahaSyncService->verifySessionAccessById($organization->id, $sessionId);
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
                'session_id' => $sessionId,
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

            // Build session data with sensible defaults
            $sessionData = [
                'name' => $wahaSessionName,
                'start' => true, // Auto-start the session
                'config' => $this->getDefaultSessionConfig($organization)
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

                $this->logApiAction('create_waha_session_auto', [
                    'session_name' => $localSessionName,
                    'waha_session_name' => $wahaSessionName,
                    'organization_id' => $organization->id,
                    'local_session_id' => $localSession->id,
                    'auto_created' => true,
                    'third_party_response' => $result,
                ]);

                return $this->successResponse('Session created successfully with automatic defaults', [
                    'local_session_id' => $localSession->id,
                    'organization_id' => $organization->id,
                    'session_name' => $localSessionName,
                    'waha_session_name' => $wahaSessionName,
                    'auto_created' => true,
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
     * Get default session configuration for automatic session creation
     *
     * @param object $organization The organization object
     * @return array Default session configuration
     */
    private function getDefaultSessionConfig($organization): array
    {
        return [
            'metadata' => $this->flattenMetadata([
                'organization.id' => $organization->id,
                'organization.name' => $organization->name,
                'organization.code' => $organization->org_code,
                'user.id' => 'system-auto',
                'user.email' => 'system@auto.com',
                'created_by' => 'backend-auto',
                'created_at' => now()->toISOString(),
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
                    'url' => config('waha.webhooks.default_url', ''),
                    'events' => ['message', 'session.status'],
                    'hmac' => null,
                    'retries' => 3,
                    'customHeaders' => null
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
}
