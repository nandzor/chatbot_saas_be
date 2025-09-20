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
    protected function createLocalSession(string $organizationId, string $sessionName, array $wahaData): WahaSession
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
            'channel_config_id' => '00000000-0000-0000-0000-000000000000', // Default channel config
            'session_name' => $sessionName,
            'phone_number' => $wahaData['phone'] ?? null,
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

        $localSession->update([
            'phone_number' => $wahaData['phone'] ?? $localSession->phone_number,
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
        ]);
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
    public function createSessionForOrganization(string $organizationId, string $sessionName, array $config = []): WahaSession
    {
        // Check if session already exists locally
        $existingSession = WahaSession::where('organization_id', $organizationId)
            ->where('session_name', $sessionName)
            ->first();

        if ($existingSession) {
            // Update existing session
            $existingSession->update([
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

        // Check if session exists in WAHA server first
        $wahaSessions = $this->wahaService->getSessions();
        $sessionExists = false;

        Log::info('Checking WAHA sessions', [
            'session_name' => $sessionName,
            'waha_sessions' => $wahaSessions
        ]);

        if (isset($wahaSessions['success']) && $wahaSessions['success']) {
            $sessions = $wahaSessions['data'] ?? [];
            foreach ($sessions as $session) {
                if (($session['name'] ?? '') === $sessionName) {
                    $sessionExists = true;
                    break;
                }
            }
        } else {
            // If no success flag, check if it's a direct array
            if (is_array($wahaSessions)) {
                foreach ($wahaSessions as $session) {
                    if (($session['name'] ?? '') === $sessionName) {
                        $sessionExists = true;
                        break;
                    }
                }
            }
        }

        Log::info('Session exists check', [
            'session_name' => $sessionName,
            'session_exists' => $sessionExists
        ]);

        // Only start session if it doesn't exist
        if (!$sessionExists) {
            $result = $this->wahaService->startSession($sessionName, $config);
            if (!($result['success'] ?? false)) {
                throw new Exception('Failed to start session in WAHA server');
            }
        }

        // Get default channel config
        $channelConfig = \App\Models\ChannelConfig::first();
        if (!$channelConfig) {
            throw new Exception('No channel config found');
        }

        // Create or update local session record
        return WahaSession::updateOrCreate(
            [
                'organization_id' => $organizationId,
                'session_name' => $sessionName,
            ],
            [
                'channel_config_id' => $channelConfig->id,
                'phone_number' => $config['phone_number'] ?? '',
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
     * Delete session with organization validation
     */
    public function deleteSessionForOrganization(string $organizationId, string $sessionName): bool
    {
        $localSession = $this->verifySessionAccess($organizationId, $sessionName);

        if (!$localSession) {
            return false;
        }

        // Delete from WAHA server using session name
        $result = $this->wahaService->deleteSession($sessionName);

        // For DELETE operations, WAHA server returns empty response on success (HTTP 200)
        // Check if the result is not an error (no exception thrown means success)
        if (is_array($result) && !isset($result['error'])) {
            // Delete local record
            $localSession->delete();
            Log::info('Session deleted successfully', [
                'organization_id' => $organizationId,
                'session_name' => $sessionName,
                'local_session_id' => $localSession->id
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
     * Generate a unique phone number based on session name
     *
     * @param string $sessionName The session name
     * @return string Unique phone number
     */
    private function generateUniquePhoneNumber(string $sessionName): string
    {
        // Create a hash of the session name to ensure uniqueness
        $hash = substr(md5($sessionName), 0, 4);

        // Convert hash to numeric format for phone number
        $numericHash = '';
        for ($i = 0; $i < strlen($hash); $i++) {
            $numericHash .= ord($hash[$i]) % 10;
        }

        // Ensure we have at least 4 digits
        $numericHash = str_pad($numericHash, 4, '0', STR_PAD_RIGHT);

        return '+628123456' . $numericHash;
    }
}
