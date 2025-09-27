<?php

namespace App\Services\Waha;

use App\Models\WahaSession;
use App\Models\Organization;
use App\Services\N8n\N8nService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class WahaSessionManagementService
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
     * Create session with automatic defaults
     */
    public function createSessionWithDefaults($organization): array
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

                return [
                    'success' => true,
                    'message' => 'Session created successfully with automatic defaults and N8N workflow',
                    'data' => [
                        'local_session_id' => $localSession->id ?? 'N/A',
                        'organization_id' => $organization->id,
                        'session_name' => $result['session_name'],
                        'auto_created' => true,
                        'n8n_workflow' => $result['n8n_workflow'],
                        'webhook_id' => $result['webhook_id'],
                        'webhook_url' => $result['webhook_url'],
                        'status' => $localSession->status ?? 'unknown',
                        'third_party_response' => $result['waha_session'],
                    ]
                ];
            }

            return [
                'success' => false,
                'message' => 'Failed to create session in 3rd party WAHA'
            ];

        } catch (\Exception $e) {
            Log::error('Failed to create WAHA session with defaults', [
                'organization_id' => $organization->id,
                'error' => $e->getMessage()
            ]);
            return [
                'success' => false,
                'message' => 'Failed to create session with defaults'
            ];
        }
    }

    /**
     * Create session with custom configuration
     */
    public function createSessionWithConfig(array $validatedData, string $organizationId): array
    {
        try {
            $organization = Organization::find($organizationId);
            if (!$organization) {
                return [
                    'success' => false,
                    'message' => 'Organization not found'
                ];
            }

            // Add organization metadata to the config
            $this->addOrganizationMetadata($validatedData, $organization);

            // Use service to create session with N8N integration
            $result = $this->wahaSessionService->createSessionWithN8nIntegration($validatedData, $organizationId);

            // Check if result is successful
            $isSuccess = ($result['waha_session']['success'] ?? false) ||
                isset($result['waha_session']['name']) ||
                isset($result['waha_session']['session']);

            if ($isSuccess) {
                // Create or update local session record
                $localSession = $this->wahaSyncService->createOrUpdateLocalSession(
                    $organizationId,
                    $result['session_name'],
                    $result['waha_session']
                );

                return [
                    'success' => true,
                    'message' => 'Session created successfully with N8N workflow',
                    'data' => [
                        'local_session_id' => $localSession->id,
                        'organization_id' => $organizationId,
                        'session_name' => $result['session_name'],
                        'n8n_workflow' => $result['n8n_workflow'],
                        'webhook_id' => $result['webhook_id'],
                        'webhook_url' => $result['webhook_url'],
                        'third_party_response' => $result['waha_session'],
                        'status' => $localSession->status,
                    ]
                ];
            }

            return [
                'success' => false,
                'message' => 'Failed to create session in 3rd party WAHA'
            ];

        } catch (\Exception $e) {
            Log::error('Failed to create WAHA session', [
                'organization_id' => $organizationId,
                'error' => $e->getMessage()
            ]);
            return [
                'success' => false,
                'message' => 'Failed to create session'
            ];
        }
    }

    /**
     * Start a session
     */
    public function startSession(string $sessionId, array $config, string $organizationId): array
    {
        try {
            // Check if session already exists by ID
            $existingSession = $this->wahaSyncService->verifySessionAccessById($organizationId, $sessionId);

            if (!$existingSession) {
                return [
                    'success' => false,
                    'message' => 'Session not found. Please create the session first.',
                    'code' => 404
                ];
            }

            // Check if already running
            if ($existingSession->is_connected && $existingSession->is_authenticated) {
                return [
                    'success' => false,
                    'message' => 'Session is already running and connected',
                    'code' => 409
                ];
            }

            // Check if session exists on WAHA server
            try {
                $sessionInfo = $this->wahaService->getSessionInfo($existingSession->session_name);

                // Update database first with connecting status
                $this->wahaSyncService->updateSessionStatus($organizationId, $existingSession->session_name, 'STARTING');

                // Then try to start session on WAHA server
                $result = $this->wahaService->startSession($existingSession->session_name, $config);

                // If no exception thrown, start session was successful
                // Now check actual status from WAHA server and update database accordingly
                try {
                    $updatedSessionInfo = $this->wahaService->getSessionInfo($existingSession->session_name);
                    $actualStatus = $updatedSessionInfo['status'] ?? 'connecting';

                    // Update database with actual status from WAHA server
                    $this->wahaSyncService->updateSessionStatus($organizationId, $existingSession->session_name, $actualStatus);
                } catch (\Exception $e) {
                    // If we can't get updated status, keep as connecting
                    $this->wahaSyncService->updateSessionStatus($organizationId, $existingSession->session_name, 'STARTING');
                }

                // Get the updated session status from database
                $updatedLocalSession = $this->wahaSyncService->verifySessionAccessById($organizationId, $sessionId);

                return [
                    'success' => true,
                    'message' => 'Session started successfully',
                    'data' => [
                        'local_session_id' => $existingSession->id,
                        'organization_id' => $organizationId,
                        'session_name' => $existingSession->session_name,
                        'status' => $updatedLocalSession->status ?? 'connecting',
                    ]
                ];

            } catch (\App\Services\Waha\Exceptions\WahaException $e) {
                // Session doesn't exist on WAHA server, return error
                Log::warning('Session not found on WAHA server, cannot start', [
                    'session_id' => $sessionId,
                    'session_name' => $existingSession->session_name,
                    'organization_id' => $organizationId,
                    'error' => $e->getMessage()
                ]);

                return [
                    'success' => false,
                    'message' => 'Session not found on WAHA server. Please create the session first.',
                    'code' => 404
                ];
            } catch (\Exception $e) {
                // Other error
                Log::error('Unexpected error checking WAHA session', [
                    'session_id' => $sessionId,
                    'session_name' => $existingSession->session_name,
                    'organization_id' => $organizationId,
                    'error' => $e->getMessage()
                ]);

                return [
                    'success' => false,
                    'message' => 'Failed to check session status on WAHA server',
                    'code' => 500
                ];
            }

        } catch (\Exception $e) {
            Log::error('Failed to start WAHA session', [
                'session_id' => $sessionId,
                'organization_id' => $organizationId,
                'error' => $e->getMessage()
            ]);
            return [
                'success' => false,
                'message' => 'Failed to start session',
                'code' => 500
            ];
        }
    }

    /**
     * Stop a session
     */
    public function stopSession(string $sessionId, string $organizationId): array
    {
        try {
            // Verify session belongs to current organization
            $localSession = $this->wahaSyncService->verifySessionAccessById($organizationId, $sessionId);
            if (!$localSession) {
                return [
                    'success' => false,
                    'message' => 'Session not found',
                    'code' => 404
                ];
            }

            // Stop session in WAHA server
            $result = $this->wahaService->stopSession($localSession->session_name);

            // Check if the result contains session data (WAHA API returns session info on success)
            if (isset($result['name']) && isset($result['status'])) {
                // Update session status using sync service
                $this->wahaSyncService->updateSessionStatus($organizationId, $localSession->session_name, 'STOPPED');

                return [
                    'success' => true,
                    'message' => 'Session stopped successfully',
                    'data' => array_merge($result, [
                        'local_session_id' => $localSession->id,
                        'organization_id' => $organizationId,
                    ])
                ];
            }

            return [
                'success' => false,
                'message' => 'Failed to stop session',
                'code' => 500
            ];

        } catch (\Exception $e) {
            Log::error('Failed to stop WAHA session', [
                'session_id' => $sessionId,
                'organization_id' => $organizationId,
                'error' => $e->getMessage()
            ]);
            return [
                'success' => false,
                'message' => 'Failed to stop session',
                'code' => 500
            ];
        }
    }

    /**
     * Delete a session
     */
    public function deleteSession(string $sessionName, string $organizationId): array
    {
        try {
            // Use sync service to delete session with organization validation
            $success = $this->wahaSyncService->deleteSessionForOrganization($organizationId, $sessionName);

            if (!$success) {
                return [
                    'success' => false,
                    'message' => 'Session not found',
                    'code' => 404
                ];
            }

            return [
                'success' => true,
                'message' => 'Session deleted successfully',
                'data' => [
                    'organization_id' => $organizationId,
                ]
            ];

        } catch (\Exception $e) {
            Log::error('Failed to delete WAHA session', [
                'session_name' => $sessionName,
                'organization_id' => $organizationId,
                'error' => $e->getMessage()
            ]);
            return [
                'success' => false,
                'message' => 'Failed to delete session',
                'code' => 500
            ];
        }
    }

    /**
     * Sync session status from WAHA server to database
     */
    public function syncSessionStatus(string $sessionId, string $organizationId): array
    {
        try {
            // Verify session belongs to current organization
            $localSession = $this->wahaSyncService->verifySessionAccessById($organizationId, $sessionId);
            if (!$localSession) {
                return [
                    'success' => false,
                    'message' => 'Session not found',
                    'code' => 404
                ];
            }

            // Get session status from WAHA server
            $sessionInfo = $this->wahaService->getSessionInfo($localSession->session_name);

            if ($sessionInfo && isset($sessionInfo['status'])) {
                // Update local database with current WAHA server status
                $updated = $this->wahaSyncService->updateSessionStatus(
                    $organizationId,
                    $localSession->session_name,
                    $sessionInfo['status']
                );

                if ($updated) {
                    Log::info('Session status synced from WAHA server', [
                        'session_id' => $sessionId,
                        'session_name' => $localSession->session_name,
                        'status' => $sessionInfo['status'],
                        'organization_id' => $organizationId
                    ]);

                    return [
                        'success' => true,
                        'message' => 'Session status synced successfully',
                        'data' => [
                            'session_id' => $sessionId,
                            'session_name' => $localSession->session_name,
                            'status' => $sessionInfo['status'],
                            'is_connected' => $sessionInfo['status'] === 'WORKING',
                            'is_authenticated' => $sessionInfo['status'] === 'WORKING'
                        ]
                    ];
                } else {
                    return [
                        'success' => false,
                        'message' => 'Failed to update session status in database',
                        'code' => 500
                    ];
                }
            } else {
                return [
                    'success' => false,
                    'message' => 'Failed to get session status from WAHA server',
                    'code' => 500
                ];
            }

        } catch (\Exception $e) {
            Log::error('Failed to sync session status', [
                'session_id' => $sessionId,
                'organization_id' => $organizationId,
                'error' => $e->getMessage()
            ]);
            return [
                'success' => false,
                'message' => 'Failed to sync session status',
                'code' => 500
            ];
        }
    }

    /**
     * Get QR code with retry logic
     */
    public function getQrCodeWithRetry(string $sessionId, string $organizationId): array
    {
        try {
            // Verify session belongs to current organization
            $localSession = $this->wahaSyncService->verifySessionAccessById($organizationId, $sessionId);
            if (!$localSession) {
                return [
                    'success' => false,
                    'message' => 'Session not found',
                    'code' => 404
                ];
            }

            // Check if session is already connected
            if ($localSession->is_connected && $localSession->is_authenticated) {
                return [
                    'success' => true,
                    'message' => 'Session is already connected',
                    'data' => [
                        'connected' => true,
                        'status' => $localSession->status,
                        'phone_number' => $localSession->phone_number,
                        'message' => 'QR code is not needed as session is already connected'
                    ]
                ];
            }

            // Try to get QR code from WAHA server
            try {
                $qrCode = $this->wahaService->getQrCode($localSession->session_name);
                return [
                    'success' => true,
                    'message' => 'QR code retrieved successfully',
                    'data' => $qrCode
                ];
            } catch (\Exception $e) {
                // If QR code is not available (404), return appropriate message
                if (str_contains($e->getMessage(), '404') || str_contains($e->getMessage(), 'Not found')) {
                    return [
                        'success' => true,
                        'message' => 'QR code not available',
                        'data' => [
                            'connected' => false,
                            'status' => $localSession->status,
                            'message' => 'QR code is not available. Session may be in connecting state or QR code endpoint is not supported.',
                            'qr_code' => null
                        ]
                    ];
                }
                throw $e;
            }

        } catch (\Exception $e) {
            Log::error('Failed to get WAHA QR code', [
                'session_id' => $sessionId,
                'organization_id' => $organizationId,
                'error' => $e->getMessage()
            ]);
            return [
                'success' => false,
                'message' => 'Failed to retrieve QR code',
                'code' => 500
            ];
        }
    }

    /**
     * Regenerate QR code with restart logic
     */
    public function regenerateQrCode(string $sessionId, string $organizationId): array
    {
        try {
            // Verify session belongs to current organization
            $localSession = $this->wahaSyncService->verifySessionAccessById($organizationId, $sessionId);
            if (!$localSession) {
                return [
                    'success' => false,
                    'message' => 'Session not found',
                    'code' => 404
                ];
            }

            // If already connected, no need to generate QR
            if ($localSession->is_connected && $localSession->is_authenticated) {
                return [
                    'success' => true,
                    'message' => 'Session is already connected',
                    'data' => [
                        'connected' => true,
                        'status' => $localSession->status,
                        'message' => 'QR code regeneration is not needed.'
                    ]
                ];
            }

            // Ensure session is running
            $this->ensureSessionIsRunning($localSession);

            // Get QR code with restart logic
            $qrCode = $this->fetchQrCodeWithRestart($localSession);

            return [
                'success' => true,
                'message' => 'QR code retrieved successfully',
                'data' => $qrCode
            ];

        } catch (\Exception $e) {
            Log::error('Failed to regenerate WAHA QR code', [
                'session_id' => $sessionId,
                'organization_id' => $organizationId,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'message' => $e->getMessage(),
                'code' => 500
            ];
        }
    }

    /**
     * Ensure session is running, start if stopped
     */
    private function ensureSessionIsRunning($localSession): void
    {
        $sessionInfo = $this->wahaService->getSessionInfo($localSession->session_name);

        if (!$sessionInfo || !isset($sessionInfo['status'])) {
            throw new \Exception('Failed to get session info: ' . ($sessionInfo['error'] ?? 'Unknown error'));
        }

        $status = $sessionInfo['status'] ?? 'UNKNOWN';

        if ($status === 'STOPPED') {
            Log::info('Session is stopped, attempting to start it.', ['session_name' => $localSession->session_name]);
            try {
                $startResult = $this->wahaService->startSession($localSession->session_name);
                // If no exception thrown, start was successful
                Log::info('Session started successfully', ['session_name' => $localSession->session_name]);

                // Give time for session to initialize
                sleep(2);
            } catch (\Exception $e) {
                throw new \Exception('Failed to start a stopped session: ' . $e->getMessage());
            }
        }
    }

    /**
     * Fetch QR code with restart logic
     */
    private function fetchQrCodeWithRestart($localSession): array
    {
        try {
            // Try to get QR code first time
            return $this->wahaService->getQrCode($localSession->session_name);
        } catch (\Exception $initialException) {
            Log::warning('Initial QR code fetch failed, attempting session restart.', [
                'session_name' => $localSession->session_name,
                'error' => $initialException->getMessage()
            ]);

            // If failed, try to restart session
            try {
                $restartResult = $this->wahaService->restartSession($localSession->session_name);
                Log::info('Session restarted successfully after QR fetch failure', [
                    'session_name' => $localSession->session_name
                ]);
            } catch (\Exception $restartException) {
                throw new \Exception('Failed to restart session after QR fetch failure: ' . $restartException->getMessage());
            }

            // Give time for session to restart
            sleep(3);

            // Try again to get QR code after restart
            try {
                return $this->wahaService->getQrCode($localSession->session_name);
            } catch (\Exception $retryException) {
                // If second attempt still fails, give up
                throw new \Exception('Failed to get QR code even after restarting session.');
            }
        }
    }

    /**
     * Add organization metadata to session configuration
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
     * Flatten nested metadata objects to string key-value pairs for WAHA API compatibility
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
     * Generate a unique session name using UUID
     */
    public function generateUuidSessionName(string $organizationId, ?string $customName = null): string
    {
        $sessionUuid = Str::uuid()->toString();
        $orgIdPrefix = substr($organizationId, 0, 7); // Get first 7 characters of organization ID

        if ($customName) {
            return "{$customName}-{$orgIdPrefix}-{$sessionUuid}";
        }

        return "session-{$orgIdPrefix}-{$sessionUuid}";
    }
}
