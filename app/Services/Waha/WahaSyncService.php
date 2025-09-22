<?php

namespace App\Services\Waha;

use App\Models\WahaSession;
use App\Models\Organization;
use App\Services\Waha\WahaService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Exception;

/**
 * WAHA Synchronization Service
 *
 * Handles synchronization between WAHA 3rd party service and local database
 * Ensures data consistency and organization isolation
 */
class WahaSyncService
{
    protected WahaService $wahaService;

    public function __construct(WahaService $wahaService)
    {
        $this->wahaService = $wahaService;
    }

    /**
     * Sync sessions for a specific organization
     */
    public function syncSessionsForOrganization(string $organizationId): array
    {
        try {
            $organization = Organization::findOrFail($organizationId);

            // Get sessions from WAHA server
            $wahaSessions = $this->wahaService->getSessions();

            // Debug: Log WAHA sessions
            Log::info('WAHA sessions from server', [
                'organization_id' => $organizationId,
                'waha_sessions' => $wahaSessions
            ]);

            // Get local sessions for this organization
            $localSessions = WahaSession::where('organization_id', $organizationId)
                ->with(['organization', 'channelConfig'])
                ->get()
                ->keyBy('session_name');

            // Debug: Log local sessions
            Log::info('Local sessions from database', [
                'organization_id' => $organizationId,
                'local_sessions' => $localSessions->toArray()
            ]);

            $syncedSessions = [];
            $createdCount = 0;
            $updatedCount = 0;

            // Process WAHA server sessions
            // WAHA server returns {success: true, data: [...], message: "..."}
            $sessionsToProcess = [];
            if (isset($wahaSessions['data']) && is_array($wahaSessions['data'])) {
                $sessionsToProcess = $wahaSessions['data'];
            } elseif (is_array($wahaSessions)) {
                $sessionsToProcess = $wahaSessions;
            }

            if (is_array($sessionsToProcess)) {
                foreach ($sessionsToProcess as $wahaSession) {
                    $sessionName = $wahaSession['name'] ?? $wahaSession['id'] ?? null;

                    if (!$sessionName) {
                        Log::warning('WAHA session without name/id', ['waha_session' => $wahaSession]);
                        continue;
                    }

                    $localSession = $localSessions->get($sessionName);

                    if ($localSession) {
                        // Update existing session
                        Log::info('Updating existing session', [
                            'organization_id' => $organizationId,
                            'session_name' => $sessionName,
                            'local_session_id' => $localSession->id
                        ]);
                        $this->updateLocalSession($localSession, $wahaSession);
                        $updatedCount++;
                    } else {
                        // Create new session for this organization
                        Log::info('Creating new session', [
                            'organization_id' => $organizationId,
                            'session_name' => $sessionName,
                            'waha_session' => $wahaSession
                        ]);
                        try {
                            $localSession = $this->createLocalSession($organizationId, $sessionName, $wahaSession);
                            $createdCount++;
                            Log::info('Session created successfully', [
                                'organization_id' => $organizationId,
                                'session_name' => $sessionName,
                                'local_session_id' => $localSession->id
                            ]);
                        } catch (Exception $e) {
                            Log::error('Failed to create local session', [
                                'organization_id' => $organizationId,
                                'session_name' => $sessionName,
                                'error' => $e->getMessage(),
                                'trace' => $e->getTraceAsString()
                            ]);
                            continue;
                        }
                    }

                    $syncedSessions[] = $this->mergeSessionData($localSession, $wahaSession);
                }
            } else {
                Log::warning('No WAHA sessions found or invalid format', [
                    'organization_id' => $organizationId,
                    'waha_sessions' => $wahaSessions
                ]);
            }

            // Mark local sessions not in WAHA as disconnected
            foreach ($localSessions as $localSession) {
                $existsInWaha = collect($syncedSessions)->contains('id', $localSession->id);
                if (!$existsInWaha) {
                    $this->markSessionAsDisconnected($localSession);
                    $syncedSessions[] = $this->mergeSessionData($localSession, [
                        'status' => 'NOT_WORKING',
                        'name' => $localSession->session_name,
                    ]);
                }
            }

            Log::info('WAHA sessions synced for organization', [
                'organization_id' => $organizationId,
                'total_sessions' => count($syncedSessions),
                'created' => $createdCount,
                'updated' => $updatedCount,
            ]);

            return [
                'sessions' => $syncedSessions,
                'organization_id' => $organizationId,
                'total' => count($syncedSessions),
                'created' => $createdCount,
                'updated' => $updatedCount,
            ];

        } catch (Exception $e) {
            Log::error('Failed to sync WAHA sessions for organization', [
                'organization_id' => $organizationId,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Sync a specific session
     */
    public function syncSession(string $organizationId, string $sessionName): ?WahaSession
    {
        try {
            // Get session from WAHA server
            $wahaSession = $this->wahaService->getSessionInfo($sessionName);

            // Get or create local session
            $localSession = WahaSession::where('session_name', $sessionName)
                ->where('organization_id', $organizationId)
                ->first();

            if ($localSession) {
                $this->updateLocalSession($localSession, $wahaSession);
            } else {
                // Create session for this organization even if it exists in WAHA
                $localSession = $this->createLocalSession($organizationId, $sessionName, $wahaSession);
            }

            Log::info('WAHA session synced', [
                'organization_id' => $organizationId,
                'session_name' => $sessionName,
                'local_session_id' => $localSession->id,
            ]);

            return $localSession;

        } catch (Exception $e) {
            Log::error('Failed to sync WAHA session', [
                'organization_id' => $organizationId,
                'session_name' => $sessionName,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Create local session from WAHA data
     */
    protected function createLocalSession(string $organizationId, string $sessionName, array $wahaData, ?string $n8nWorkflowId = null): WahaSession
    {
        Log::info('Creating local session with data', [
            'organization_id' => $organizationId,
            'session_name' => $sessionName,
            'waha_data' => $wahaData,
            'mapped_status' => $this->mapWahaStatus($wahaData['status'] ?? 'UNKNOWN'),
            'mapped_health' => $this->mapHealthStatus($wahaData)
        ]);

        $sessionData = [
            'organization_id' => $organizationId,
            'n8n_workflow_id' => $n8nWorkflowId,
            'channel_config_id' => '00000000-0000-0000-0000-000000000000', // Default channel config
            'session_name' => $sessionName,
            'phone_number' => $this->extractPhoneNumber($wahaData),
            'instance_id' => $sessionName, // Use session name as instance ID
            'status' => $this->mapWahaStatus($wahaData['status'] ?? 'UNKNOWN'),
            'is_authenticated' => ($wahaData['status'] ?? '') === 'WORKING',
            'is_connected' => ($wahaData['status'] ?? '') === 'WORKING',
            'health_status' => $this->mapHealthStatus($wahaData),
            'last_health_check' => now(),
            'error_count' => 0,
            'total_messages_sent' => 0,
            'total_messages_received' => 0,
            'total_media_sent' => 0,
            'total_media_received' => 0,
        ];

        Log::info('Session data to create', ['session_data' => $sessionData]);

        try {
            $session = WahaSession::create($sessionData);
            Log::info('Local session created successfully', [
                'session_id' => $session->id,
                'session_name' => $session->session_name
            ]);
            return $session;
        } catch (Exception $e) {
            Log::error('Failed to create WahaSession', [
                'organization_id' => $organizationId,
                'session_name' => $sessionName,
                'session_data' => $sessionData,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    /**
     * Update local session with WAHA data
     */
    protected function updateLocalSession(WahaSession $localSession, array $wahaData): void
    {
        $wahaStatus = $wahaData['status'] ?? $localSession->status;
        $mappedStatus = $this->mapWahaStatus($wahaStatus);

        // Extract phone number from WAHA response
        $phoneNumber = $this->extractPhoneNumber($wahaData);

        $localSession->update([
            'phone_number' => $phoneNumber ?? $localSession->phone_number,
            'status' => $mappedStatus,
            'is_authenticated' => ($wahaStatus === 'WORKING'),
            'is_connected' => ($wahaStatus === 'WORKING'),
            'health_status' => $this->mapHealthStatus($wahaData),
            'last_health_check' => now(),
        ]);

        Log::info('Updated local session', [
            'session_id' => $localSession->id,
            'session_name' => $localSession->session_name,
            'waha_status' => $wahaStatus,
            'mapped_status' => $mappedStatus,
            'is_connected' => ($wahaStatus === 'WORKING'),
            'is_authenticated' => ($wahaStatus === 'WORKING'),
            'phone_number' => $phoneNumber,
        ]);
    }

    /**
     * Extract phone number from WAHA response data
     *
     * @param array $wahaData The WAHA response data
     * @return string|null The formatted phone number or null if not found
     */
    protected function extractPhoneNumber(array $wahaData): ?string
    {
        // Try to get phone number from me.id field (WAHA Plus format)
        if (isset($wahaData['me']['id'])) {
            $meId = $wahaData['me']['id'];

            // Extract phone number from format like "6285123945816@c.us"
            if (str_contains($meId, '@c.us')) {
                $phoneNumber = str_replace('@c.us', '', $meId);

                // Add + prefix if not present
                if (!str_starts_with($phoneNumber, '+')) {
                    $phoneNumber = '+' . $phoneNumber;
                }

                Log::info('Extracted phone number from me.id', [
                    'me_id' => $meId,
                    'extracted_phone' => $phoneNumber
                ]);

                return $phoneNumber;
            }
        }

        // Fallback to legacy phone field
        if (isset($wahaData['phone'])) {
            $phoneNumber = $wahaData['phone'];

            // Ensure proper formatting
            if (!str_starts_with($phoneNumber, '+')) {
                $phoneNumber = '+' . $phoneNumber;
            }

            Log::info('Extracted phone number from phone field', [
                'phone' => $phoneNumber
            ]);

            return $phoneNumber;
        }

        Log::info('No phone number found in WAHA data', [
            'waha_data_keys' => array_keys($wahaData)
        ]);

        return null;
    }

    /**
     * Mark session as disconnected
     */
    protected function markSessionAsDisconnected(WahaSession $localSession): void
    {
        $localSession->update([
            'status' => 'disconnected',
            'is_connected' => false,
            'is_authenticated' => false,
            'last_health_check' => now(),
        ]);
    }

    /**
     * Merge WAHA data with local session data
     */
    protected function mergeSessionData(WahaSession $localSession, array $wahaData): array
    {
        return array_merge($wahaData, [
            'id' => $localSession->id,
            'organization_id' => $localSession->organization_id,
            'session_name' => $localSession->session_name,
            'status' => $localSession->status, // Use local session status (already mapped)
            'phone_number' => $localSession->phone_number,
            'business_name' => $localSession->business_name,
            'business_description' => $localSession->business_description,
            'business_category' => $localSession->business_category,
            'business_website' => $localSession->business_website,
            'business_email' => $localSession->business_email,
            'is_authenticated' => $localSession->is_authenticated,
            'is_connected' => $localSession->is_connected,
            'health_status' => $localSession->health_status,
            'last_health_check' => $localSession->last_health_check,
            'error_count' => $localSession->error_count,
            'last_error' => $localSession->last_error,
            'total_messages_sent' => $localSession->total_messages_sent,
            'total_messages_received' => $localSession->total_messages_received,
            'total_media_sent' => $localSession->total_media_sent,
            'total_media_received' => $localSession->total_media_received,
            'created_at' => $localSession->created_at,
            'updated_at' => $localSession->updated_at,
        ]);
    }

    /**
     * Map WAHA status to local status
     */
    protected function mapWahaStatus(string $wahaStatus): string
    {
        return match (strtoupper($wahaStatus)) {
            'WORKING' => 'working',
            'NOT_WORKING' => 'disconnected',
            'STARTING' => 'connecting',
            'SCAN_QR_CODE' => 'connecting', // QR scan is part of connecting process
            'STOPPED' => 'disconnected',
            'FAILED' => 'error',
            default => 'connecting', // Default to connecting instead of unknown
        };
    }

    /**
     * Map health status based on WAHA data
     */
    protected function mapHealthStatus(array $wahaData): string
    {
        $status = $wahaData['status'] ?? '';
        $battery = $wahaData['battery'] ?? null;

        if ($status === 'WORKING') {
            if ($battery !== null && $battery < 20) {
                return 'warning';
            }
            return 'healthy';
        }

        if ($status === 'NOT_WORKING' || $status === 'FAILED') {
            return 'critical';
        }

        return 'unknown';
    }

    /**
     * Get sessions for organization with sync
     */
    public function getSessionsForOrganization(string $organizationId): array
    {
        return $this->syncSessionsForOrganization($organizationId);
    }

    /**
     * Get sessions for organization with pagination and filters
     * Standardized implementation following UserService pattern
     */
    public function getSessionsForOrganizationWithPagination(
        string $organizationId,
        int $page = 1,
        int $perPage = 10,
        string $search = '',
        string $status = 'all',
        string $healthStatus = 'all',
        string $sortBy = 'created_at',
        string $sortOrder = 'desc'
    ): array {
        try {
            // First sync sessions to ensure we have latest data
            $this->syncSessionsForOrganization($organizationId);

            // Build query for local sessions
            $query = WahaSession::where('organization_id', $organizationId)
                ->with(['organization', 'channelConfig']);

            // Apply search filter (standardized like UserService)
            if (!empty($search)) {
                $query->where(function ($q) use ($search) {
                    $q->where('session_name', 'ILIKE', "%{$search}%")
                      ->orWhere('phone_number', 'ILIKE', "%{$search}%")
                      ->orWhere('business_name', 'ILIKE', "%{$search}%");
                });
            }

            // Apply status filter (standardized approach)
            if ($status !== 'all') {
                switch ($status) {
                    case 'connected':
                        $query->where(function ($q) {
                            $q->where('is_connected', true)
                              ->where('is_authenticated', true);
                        });
                        break;
                    case 'connecting':
                        $query->where('is_connected', true)
                              ->where('is_authenticated', false);
                        break;
                    case 'disconnected':
                        $query->where('is_connected', false);
                        break;
                    case 'error':
                        $query->where('status', 'error');
                        break;
                }
            }

            // Apply health status filter
            if ($healthStatus !== 'all') {
                $query->where('health_status', $healthStatus);
            }

            // Apply sorting (standardized validation)
            $allowedSortFields = ['created_at', 'updated_at', 'session_name', 'status', 'health_status'];
            if (in_array($sortBy, $allowedSortFields)) {
                $query->orderBy($sortBy, $sortOrder);
            } else {
                $query->orderBy('created_at', 'desc');
            }

            // Get paginated results using Laravel's standard pagination
            $sessions = $query->paginate($perPage, ['*'], 'page', $page);

            // Format sessions for display
            $formattedSessions = $sessions->map(function ($session) {
                return $this->formatSessionForDisplay($session);
            });

            // Return standardized pagination response format
            return [
                'sessions' => $formattedSessions,
                'pagination' => [
                    'current_page' => $sessions->currentPage(),
                    'last_page' => $sessions->lastPage(),
                    'per_page' => $sessions->perPage(),
                    'total' => $sessions->total(),
                    'from' => $sessions->firstItem(),
                    'to' => $sessions->lastItem(),
                    'has_more_pages' => $sessions->hasMorePages(),
                ]
            ];
        } catch (Exception $e) {
            Log::error('Failed to get paginated WAHA sessions', [
                'organization_id' => $organizationId,
                'page' => $page,
                'per_page' => $perPage,
                'search' => $search,
                'status' => $status,
                'health_status' => $healthStatus,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Format session for display
     */
    protected function formatSessionForDisplay($session): array
    {
        return [
            'id' => $session->id,
            'session_name' => $session->session_name,
            'phone_number' => $session->phone_number,
            'status' => $session->status,
            'is_connected' => $session->is_connected,
            'is_authenticated' => $session->is_authenticated,
            'is_ready' => $session->is_ready,
            'health_status' => $session->health_status,
            'error_count' => $session->error_count,
            'last_error' => $session->last_error,
            'total_messages_sent' => $session->total_messages_sent,
            'total_messages_received' => $session->total_messages_received,
            'total_media_sent' => $session->total_media_sent,
            'total_media_received' => $session->total_media_received,
            'business_name' => $session->business_name,
            'business_description' => $session->business_description,
            'business_category' => $session->business_category,
            'created_at' => $session->created_at,
            'updated_at' => $session->updated_at,
            'last_health_check' => $session->last_health_check,
            'last_message_at' => $session->last_message_at,
            'organization_id' => $session->organization_id,
        ];
    }

    /**
     * Get session for organization with sync
     */
    public function getSessionForOrganization(string $organizationId, string $sessionName): ?array
    {
        $localSession = $this->syncSession($organizationId, $sessionName);

        if (!$localSession) {
            return null;
        }

        // Get fresh data from WAHA
        $wahaData = $this->wahaService->getSessionInfo($sessionName);

        return $this->mergeSessionData($localSession, $wahaData);
    }

    /**
     * Verify session belongs to organization by session name
     */
    public function verifySessionAccess(string $organizationId, string $sessionName): ?WahaSession
    {
        Log::info('Verifying session access by name', [
            'organization_id' => $organizationId,
            'session_name' => $sessionName
        ]);

        $session = WahaSession::where('session_name', $sessionName)
            ->where('organization_id', $organizationId)
            ->first();

        Log::info('Session verification result by name', [
            'found' => $session !== null,
            'session_id' => $session ? $session->id : null
        ]);

        return $session;
    }

    /**
     * Verify session belongs to organization by UUID
     */
    public function verifySessionAccessById(string $organizationId, string $sessionId): ?WahaSession
    {
        Log::info('Verifying session access by ID', [
            'organization_id' => $organizationId,
            'session_id' => $sessionId
        ]);

        $session = WahaSession::where('id', $sessionId)
            ->where('organization_id', $organizationId)
            ->first();

        Log::info('Session verification result', [
            'found' => $session !== null,
            'session_name' => $session ? $session->session_name : null
        ]);

        return $session;
    }

    /**
     * Create session with organization validation
     */
    public function createSessionForOrganization(string $organizationId, string $sessionName, array $config = [], ?string $n8nWorkflowId = null): WahaSession
    {
        // Check if session already exists locally
        $existingSession = WahaSession::where('organization_id', $organizationId)
            ->where('session_name', $sessionName)
            ->first();

        if ($existingSession) {
            // Update existing session
            $existingSession->update([
                'n8n_workflow_id' => $n8nWorkflowId ?? $existingSession->n8n_workflow_id,
                'business_name' => $config['business_name'] ?? $existingSession->business_name,
                'business_description' => $config['business_description'] ?? $existingSession->business_description,
                'business_category' => $config['business_category'] ?? $existingSession->business_category,
                'business_website' => $config['business_website'] ?? $existingSession->business_website,
                'business_email' => $config['business_email'] ?? $existingSession->business_email,
                'status' => 'connecting',
                'is_authenticated' => false,
                'is_connected' => false,
                'health_status' => 'unknown',
            ]);
            return $existingSession;
        }

        // Skip WAHA server check for now - just create local session
        Log::info('Creating local session without WAHA server check', [
            'session_name' => $sessionName,
            'organization_id' => $organizationId,
            'n8n_workflow_id' => $n8nWorkflowId
        ]);

        // Get default channel config
        $channelConfig = \App\Models\ChannelConfig::first();
        if (!$channelConfig) {
            throw new Exception('No channel config found');
        }

        // Create or update local session record
        try {
            $session = WahaSession::updateOrCreate(
                [
                    'organization_id' => $organizationId,
                    'session_name' => $sessionName,
                ],
                [
                    'n8n_workflow_id' => $n8nWorkflowId,
                    'channel_config_id' => $channelConfig->id,
                    'phone_number' => $config['phone_number'] ?? substr($sessionName, 0, 20),
                    'instance_id' => $sessionName,
                    'business_name' => $config['business_name'] ?? null,
                    'business_description' => $config['business_description'] ?? null,
                    'business_category' => $config['business_category'] ?? null,
                    'business_website' => $config['business_website'] ?? null,
                    'business_email' => $config['business_email'] ?? null,
                    'status' => 'connecting',
                    'is_authenticated' => false,
                    'is_connected' => false,
                    'health_status' => 'unknown',
                    'error_count' => 0,
                    'total_messages_sent' => 0,
                    'total_messages_received' => 0,
                    'total_media_sent' => 0,
                    'total_media_received' => 0,
                ]
            );

            Log::info('Session created/updated successfully', [
                'session_id' => $session->id,
                'session_name' => $sessionName,
                'n8n_workflow_id' => $n8nWorkflowId,
                'organization_id' => $organizationId
            ]);

            return $session;
        } catch (Exception $e) {
            Log::error('Failed to create/update session', [
                'session_name' => $sessionName,
                'n8n_workflow_id' => $n8nWorkflowId,
                'organization_id' => $organizationId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    /**
     * Create or update local session from 3rd party response
     */
    public function createOrUpdateLocalSession(string $organizationId, string $sessionName, array $thirdPartyResponse): WahaSession
    {
        // Check if session already exists locally
        $existingSession = WahaSession::where('organization_id', $organizationId)
            ->where('session_name', $sessionName)
            ->first();

        if ($existingSession) {
            // Update existing session with 3rd party data
            $existingSession->update([
                'status' => $this->mapWahaStatus($thirdPartyResponse['session']['status'] ?? 'UNKNOWN'),
                'is_authenticated' => ($thirdPartyResponse['session']['status'] ?? '') === 'WORKING',
                'is_connected' => ($thirdPartyResponse['session']['status'] ?? '') === 'WORKING',
                'is_ready' => ($thirdPartyResponse['session']['status'] ?? '') === 'WORKING',
                'health_status' => $this->mapHealthStatus($thirdPartyResponse),
                'last_health_check' => now(),
                'metadata' => array_merge($existingSession->metadata ?? [], [
                    'last_sync_at' => now()->toISOString(),
                    'sync_source' => '3rd_party_create_response',
                    'third_party_response' => $thirdPartyResponse,
                    'created_via_api' => true
                ])
            ]);
            return $existingSession;
        }

        // Get existing channel config for this organization
        $channelConfig = \App\Models\ChannelConfig::where('organization_id', $organizationId)->first();
        if (!$channelConfig) {
            throw new Exception('No channel config found for organization');
        }

        // Create new session from 3rd party response
        $sessionData = [
            'organization_id' => $organizationId,
            'channel_config_id' => $channelConfig->id, // Use existing channel config
            'session_name' => $sessionName,
            'phone_number' => $this->generateUniquePhoneNumber($sessionName), // Unique phone number based on session name
            'instance_id' => $sessionName,
            'status' => $this->mapWahaStatus($thirdPartyResponse['session']['status'] ?? 'UNKNOWN'),
            'is_authenticated' => ($thirdPartyResponse['session']['status'] ?? '') === 'WORKING',
            'is_connected' => ($thirdPartyResponse['session']['status'] ?? '') === 'WORKING',
            'is_ready' => ($thirdPartyResponse['session']['status'] ?? '') === 'WORKING',
            'health_status' => $this->mapHealthStatus($thirdPartyResponse),
            'last_health_check' => now(),
            'error_count' => 0,
            'has_business_features' => false,
            'features' => [
                'media_upload' => true,
                'group_messaging' => true,
                'broadcast_messaging' => true,
                'webhook_support' => true,
                'qr_code_auth' => true
            ],
            'rate_limits' => [
                'messages_per_minute' => 60,
                'messages_per_hour' => 1000,
                'media_per_hour' => 100
            ],
            'total_messages_sent' => 0,
            'total_messages_received' => 0,
            'total_media_sent' => 0,
            'total_media_received' => 0,
            'total_contacts' => 0,
            'total_groups' => 0,
            'session_config' => [
                'webhook_url' => null,
                'webhook_events' => ['message', 'status', 'qr'],
                'auto_reply' => false,
                'business_hours' => [
                    'enabled' => false,
                    'timezone' => 'Asia/Jakarta'
                ]
            ],
            'webhook_config' => [
                'enabled' => false,
                'url' => null,
                'events' => ['message', 'status'],
                'secret' => null
            ],
            'metadata' => [
                'created_by' => 'api',
                'purpose' => 'Session created via 3rd party API',
                'sync_with_3rd_party' => true,
                'third_party_response' => $thirdPartyResponse,
                'created_via_api' => true,
                'created_at' => now()->toISOString()
            ],
            'status_type' => 'active'
        ];

        Log::info('Creating new local session from 3rd party response', [
            'organization_id' => $organizationId,
            'session_name' => $sessionName,
            'session_data' => $sessionData
        ]);

        return WahaSession::create($sessionData);
    }

    /**
     * Update session status
     */
    public function updateSessionStatus(string $organizationId, string $sessionName, string $status): bool
    {
        $localSession = $this->verifySessionAccess($organizationId, $sessionName);

        if (!$localSession) {
            return false;
        }

        $localSession->update([
            'status' => $this->mapWahaStatus($status),
            'is_connected' => $status === 'WORKING',
            'is_authenticated' => $status === 'WORKING',
            'last_health_check' => now(),
        ]);

        return true;
    }

    /**
     * Delete session with organization validation and N8N workflow cleanup
     */
    public function deleteSessionForOrganization(string $organizationId, string $sessionName): bool
    {
        $localSession = $this->verifySessionAccess($organizationId, $sessionName);

        if (!$localSession) {
            return false;
        }

        // Get N8N workflow ID from session metadata before deleting
        $n8nWorkflowId = $this->extractN8nWorkflowIdFromSession($localSession);

        // Delete from WAHA server using session name
        $result = $this->wahaService->deleteSession($sessionName);

        // For DELETE operations, WAHA server returns empty response on success (HTTP 200)
        // Check if the result is not an error (no exception thrown means success)
        if (is_array($result) && !isset($result['error'])) {
            // Delete N8N workflow if exists
            if ($n8nWorkflowId) {
                $this->deleteN8nWorkflowForSession($n8nWorkflowId, $organizationId, $sessionName);
            }

            // Delete local record
            $localSession->delete();
            Log::info('Session deleted successfully', [
                'organization_id' => $organizationId,
                'session_name' => $sessionName,
                'local_session_id' => $localSession->id,
                'n8n_workflow_id' => $n8nWorkflowId
            ]);
            return true;
        }

        Log::warning('Failed to delete session from WAHA server', [
            'organization_id' => $organizationId,
            'session_name' => $sessionName,
            'result' => $result
        ]);
        return false;
    }

    /**
     * Extract N8N workflow ID from session
     *
     * @param object $session WahaSession model
     * @return string|null
     */
    private function extractN8nWorkflowIdFromSession($session): ?string
    {
        try {
            // Use direct relationship - n8n_workflow_id should be populated
            if ($session->n8n_workflow_id) {
                Log::info('Using n8n_workflow_id from direct relationship', [
                    'session_id' => $session->id,
                    'session_name' => $session->session_name,
                    'n8n_workflow_id' => $session->n8n_workflow_id
                ]);
                return $session->n8n_workflow_id;
            }

            Log::warning('No n8n_workflow_id found for session', [
                'session_id' => $session->id,
                'session_name' => $session->session_name
            ]);

            return null;
        } catch (Exception $e) {
            Log::error('Failed to extract N8N workflow ID from session', [
                'session_id' => $session->id,
                'session_name' => $session->session_name,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Delete N8N workflow for session
     *
     * @param string $workflowId N8N workflow ID
     * @param string $organizationId Organization ID
     * @param string $sessionName Session name
     * @return void
     */
    private function deleteN8nWorkflowForSession(string $workflowId, string $organizationId, string $sessionName): void
    {
        try {
            // Get the workflow from database to get the correct workflow_id for N8N API
            $workflow = \App\Models\N8nWorkflow::find($workflowId);
            if (!$workflow) {
                Log::warning('N8N workflow not found in database', [
                    'workflow_id' => $workflowId,
                    'organization_id' => $organizationId,
                    'session_name' => $sessionName
                ]);
                return;
            }

            $n8nService = app(\App\Services\N8n\N8nService::class);

            // Delete workflow from N8N using the correct workflow_id
            $result = $n8nService->deleteWorkflowWithDatabase($workflow->workflow_id);

            if ($result['success']) {
                Log::info('N8N workflow deleted successfully for session', [
                    'database_id' => $workflowId,
                    'workflow_id' => $workflow->workflow_id,
                    'organization_id' => $organizationId,
                    'session_name' => $sessionName
                ]);
            } else {
                Log::warning('Failed to delete N8N workflow for session', [
                    'database_id' => $workflowId,
                    'workflow_id' => $workflow->workflow_id,
                    'organization_id' => $organizationId,
                    'session_name' => $sessionName,
                    'error' => $result['error'] ?? 'Unknown error'
                ]);
            }
        } catch (Exception $e) {
            Log::error('Exception while deleting N8N workflow for session', [
                'workflow_id' => $workflowId,
                'organization_id' => $organizationId,
                'session_name' => $sessionName,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Generate a unique phone number based on session name
     *
     * @param string $sessionName The session name
     * @return string Unique phone number
     */
    private function generateUniquePhoneNumber(string $sessionName): string
    {
        // Return "-" as requested for phone number in database
        return '-';
    }
}
