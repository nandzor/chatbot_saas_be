<?php

namespace App\Services\Waha;

use App\Services\N8n\N8nService;
use App\Services\Waha\WahaService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Exception;

/**
 * Service for handling WAHA session creation and management
 *
 * This service encapsulates all business logic related to WAHA session creation,
 * N8N workflow integration, and webhook configuration.
 */
class WahaSessionService
{
    protected WahaService $wahaService;
    protected N8nService $n8nService;

    public function __construct(WahaService $wahaService, N8nService $n8nService)
    {
        $this->wahaService = $wahaService;
        $this->n8nService = $n8nService;
    }

    /**
     * Create a new WAHA session with N8N workflow integration
     *
     * @param array $validatedData Validated session data
     * @param string $organizationId Organization ID
     * @return array
     * @throws Exception
     */
    public function createSessionWithN8nIntegration(array $validatedData, string $organizationId): array
    {
        try {
            // Generate session name
            $sessionName = $this->generateSessionName($organizationId, $validatedData['name'] ?? null);

            // Create N8N workflow first
            $n8nResult = $this->createN8nWorkflowForWaha($organizationId, $sessionName);

            // Extract webhook information
            $n8nWebhookId = $n8nResult['webhook_id'] ?? null;
            $n8nWebhookUrl = $n8nResult['webhook_url'] ?? null;

            // Get organization object
            $organization = \App\Models\Organization::find($organizationId);
            if (!$organization) {
                throw new Exception('Organization not found');
            }

            // Get default session configuration with webhook
            $sessionConfig = $this->getDefaultSessionConfig($organization, $n8nWebhookId);

            // Add session name to the configuration
            $sessionConfig['name'] = $sessionName;

            // Create WAHA session
            $wahaResult = $this->wahaService->createSession($sessionConfig);

            // Save session to database with N8N workflow ID for cascade delete
            $workflowId = $this->extractWorkflowIdFromN8nResult($n8nResult);
            $this->saveSessionToDatabase($organizationId, $sessionName, $wahaResult, $workflowId);

            // Combine results
            return [
                'waha_session' => $wahaResult,
                'n8n_workflow' => $n8nResult['n8n_workflow'] ?? null,
                'webhook_id' => $n8nWebhookId,
                'webhook_url' => $n8nWebhookUrl,
                'session_name' => $sessionName
            ];

        } catch (Exception $e) {
            Log::error('Failed to create WAHA session with N8N integration', [
                'organization_id' => $organizationId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    /**
     * Create a default WAHA session with N8N workflow integration
     *
     * @param object $organization Organization object
     * @return array
     * @throws Exception
     */
    public function createDefaultSessionWithN8nIntegration($organization): array
    {
        try {
            // Generate session name
            $sessionName = $this->generateSessionName($organization->id);

            // Create N8N workflow first
            $n8nResult = $this->createN8nWorkflowForWaha($organization->id, $sessionName);

            // Extract webhook information
            $n8nWebhookId = $n8nResult['webhook_id'] ?? null;
            $n8nWebhookUrl = $n8nResult['webhook_url'] ?? null;

            // Get default session configuration
            $sessionConfig = $this->getDefaultSessionConfig($organization, $n8nWebhookId);

            // Add session name to the configuration
            $sessionConfig['name'] = $sessionName;

            // Create WAHA session
            $wahaResult = $this->wahaService->createSession($sessionConfig);

            // Save session to database with N8N workflow ID for cascade delete
            $workflowId = $this->extractWorkflowIdFromN8nResult($n8nResult);
            $this->saveSessionToDatabase($organization->id, $sessionName, $wahaResult, $workflowId);

            // Combine results
            return [
                'waha_session' => $wahaResult,
                'n8n_workflow' => $n8nResult['n8n_workflow'] ?? null,
                'webhook_id' => $n8nWebhookId,
                'webhook_url' => $n8nWebhookUrl,
                'session_name' => $sessionName
            ];

        } catch (Exception $e) {
            Log::error('Failed to create default WAHA session with N8N integration', [
                'organization_id' => $organization->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    /**
     * Create N8N workflow for WAHA session
     *
     * @param string $organizationId Organization ID
     * @param string $sessionName Session name
     * @return array
     * @throws Exception
     */
    protected function createN8nWorkflowForWaha(string $organizationId, string $sessionName): array
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
            $webhookId = $this->extractWebhookIdFromWorkflow($result);

            // Add webhook information to the result
            $result['webhook_id'] = $webhookId;
            $result['webhook_url'] = $webhookId ? $this->generateN8nWebhookUrl($webhookId) : null;

            Log::info('N8N workflow created for WAHA session', [
                'organization_id' => $organizationId,
                'session_name' => $sessionName,
                'webhook_id' => $webhookId,
                'webhook_url' => $result['webhook_url']
            ]);

            return $result;

        } catch (Exception $e) {
            Log::error('Failed to create N8N workflow for WAHA session', [
                'organization_id' => $organizationId,
                'session_name' => $sessionName,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Get WAHA workflow payload from JSON file
     *
     * @param string $organizationId Organization ID
     * @return array
     * @throws Exception
     */
    protected function getWahaWorkflowPayload(string $organizationId): array
    {
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
     * Extract workflow ID from N8N result for database storage
     *
     * @param array $n8nResult Result from N8N service
     * @return string|null Valid UUID for database storage
     */
    private function extractWorkflowIdFromN8nResult(array $n8nResult): ?string
    {
        // Priority 1: Use database_id (always a valid UUID)
        if (isset($n8nResult['database_id']) && !empty($n8nResult['database_id'])) {
            return $n8nResult['database_id'];
        }

        // Priority 2: Use stored_workflow ID (if database storage was successful)
        if (isset($n8nResult['stored_workflow']['id']) && !empty($n8nResult['stored_workflow']['id'])) {
            return $n8nResult['stored_workflow']['id'];
        }

        // Priority 3: Fallback to N8N workflow ID (may not be UUID)
        if (isset($n8nResult['n8n_workflow']['data']['id'])) {
            return $n8nResult['n8n_workflow']['data']['id'];
        }

        if (isset($n8nResult['n8n_workflow']['id'])) {
            return $n8nResult['n8n_workflow']['id'];
        }

        Log::warning('No valid workflow ID found in N8N result', [
            'available_keys' => array_keys($n8nResult),
            'n8n_result' => $n8nResult
        ]);

        return null;
    }

    /**
     * Extract webhook ID from N8N workflow result
     *
     * @param array $workflowResult N8N workflow creation result
     * @return string|null
     */
    protected function extractWebhookIdFromWorkflow(array $workflowResult): ?string
    {
        // Check if n8n_workflow is array (from N8N API response)
        if (isset($workflowResult['n8n_workflow']) && is_array($workflowResult['n8n_workflow'])) {
            if (isset($workflowResult['n8n_workflow']['nodes'][0]['webhookId'])) {
                return $workflowResult['n8n_workflow']['nodes'][0]['webhookId'];
            }
        }

        // Check if n8n_workflow is object (from database)
        if (isset($workflowResult['n8n_workflow']) && is_object($workflowResult['n8n_workflow'])) {
            if (isset($workflowResult['n8n_workflow']->data['nodes'][0]['webhookId'])) {
                return $workflowResult['n8n_workflow']->data['nodes'][0]['webhookId'];
            }
        }

        return null;
    }

    /**
     * Generate N8N webhook URL
     *
     * @param string $webhookId Webhook ID
     * @return string
     */
    protected function generateN8nWebhookUrl(string $webhookId): string
    {
        $n8nBaseUrl = config('n8n.server.base_url', 'http://localhost:5678');
        return rtrim($n8nBaseUrl, '/') . '/webhook/' . $webhookId;
    }

    /**
     * Generate N8N webhook URLs for test and production
     *
     * @param string $webhookId Webhook ID
     * @return array
     */
    protected function generateN8nWebhookUrls(string $webhookId): array
    {
        $n8nBaseUrl = config('n8n.server.base_url', 'http://localhost:5678');
        $baseUrl = rtrim($n8nBaseUrl, '/');

        return [
            'test' => $baseUrl . '/webhook-test/' . $webhookId . '/waha',
            'production' => $baseUrl . '/webhook/' . $webhookId . '/waha'
        ];
    }

    /**
     * Update session configuration with N8N webhook
     *
     * @param array $validatedData Session data
     * @param string|null $n8nWebhookUrl N8N webhook URL
     * @param string $organizationId Organization ID
     * @return void
     */
    protected function updateSessionConfigWithN8nWebhook(array &$validatedData, ?string $n8nWebhookUrl, string $organizationId): void
    {
        if (!$n8nWebhookUrl) {
            return;
        }

        $webhookId = $this->extractWebhookIdFromUrl($n8nWebhookUrl);
        $webhookUrls = $this->generateN8nWebhookUrls($webhookId);

        // Update webhook configuration using both array and single format for compatibility
        if (isset($validatedData['webhooks']) && is_array($validatedData['webhooks'])) {
            // Update existing webhooks array
            foreach ($validatedData['webhooks'] as &$webhook) {
                if (empty($webhook['url']) || $webhook['url'] === config('waha.webhooks.default_url', '')) {
                    $webhook['url'] = $n8nWebhookUrl;
                    $webhook['events'] = $webhook['events'] ?? ['message', 'session.status'];
                    $webhook['hmac'] = $webhook['hmac'] ?? null;
                    $webhook['retries'] = $webhook['retries'] ?? null;
                    $webhook['customHeaders'] = array_merge($webhook['customHeaders'] ?? [], [
                        'X-Webhook-Source' => 'WAHA-Session',
                        'X-Organization-ID' => $organizationId,
                        'X-N8N-Webhook-ID' => $webhookId
                    ]);
                }
            }
        } else {
            // Add webhook configuration using both formats for maximum compatibility
            $validatedData['webhooks'] = [
                [
                    'url' => $webhookUrls['test'],
                    'events' => ['message', 'session.status'],
                    'hmac' => null,
                    'retries' => null,
                    'customHeaders' => [
                        'X-Webhook-Source' => 'WAHA-Session-Test',
                        'X-Organization-ID' => $organizationId,
                        'X-N8N-Webhook-ID' => $webhookId,
                        'X-Environment' => 'test'
                    ]
                ],
                [
                    'url' => $webhookUrls['production'],
                    'events' => ['message', 'session.status'],
                    'hmac' => null,
                    'retries' => null,
                    'customHeaders' => [
                        'X-Webhook-Source' => 'WAHA-Session-Production',
                        'X-Organization-ID' => $organizationId,
                        'X-N8N-Webhook-ID' => $webhookId,
                        'X-Environment' => 'production'
                    ]
                ]
            ];
        }

        // Also add single webhook format for backwards compatibility
        $validatedData['webhook'] = $webhookUrls['production']; // Use production as primary
        $validatedData['events'] = ['message', 'session.status'];
        $validatedData['webhookByEvents'] = true;
    }

    /**
     * Extract webhook ID from URL
     *
     * @param string $webhookUrl Webhook URL
     * @return string
     */
    protected function extractWebhookIdFromUrl(string $webhookUrl): string
    {
        return basename(parse_url($webhookUrl, PHP_URL_PATH));
    }

    /**
     * Prepare session data for WAHA API
     *
     * @param array $validatedData Validated session data
     * @param string $sessionName Session name
     * @param string $organizationId Organization ID
     * @return array
     */
    protected function prepareSessionData(array $validatedData, string $sessionName, string $organizationId): array
    {
        // Get user name instead of ID
        $user = Auth::user();
        $createdByName = $user ? ($user->first_name . ' ' . $user->last_name) : 'System';

        // Merge organization metadata into config (avoid duplication)
        $config = $validatedData['config'] ?? [];
        if (!isset($config['metadata'])) {
            $config['metadata'] = [];
        }

        // Only add if not already present to avoid duplication
        if (!isset($config['metadata']['organization_id'])) {
            $config['metadata']['organization_id'] = $organizationId;
        }
        if (!isset($config['metadata']['created_by'])) {
            $config['metadata']['created_by'] = $createdByName;
        }
        if (!isset($config['metadata']['created_at'])) {
            $config['metadata']['created_at'] = now()->toISOString();
        }

        return [
            'name' => $sessionName,
            'start' => $validatedData['start'] ?? true,
            'config' => $config
        ];
    }

    /**
     * Get default session configuration
     *
     * @param object $organization Organization object
     * @param string|null $n8nWebhookId N8N webhook ID
     * @return array
     */
    protected function getDefaultSessionConfig($organization, ?string $n8nWebhookId = null): array
    {
        // Get user name instead of ID
        $user = Auth::user();
        $createdByName = $user ? ($user->first_name . ' ' . $user->last_name) : 'System';

        $sessionData = [
            'name' => $this->generateSessionName($organization->id),
            'start' => true,
            'config' => [
                'metadata' => $this->flattenMetadata([
                    'organization.id' => $organization->id,
                    'organization.name' => $organization->name,
                    'organization.code' => $organization->org_code,
                    'created_by' => $createdByName,
                    'created_at' => now()->toISOString(),
                    'n8n_webhook_id' => $n8nWebhookId,
                ]),
                'proxy' => null,
                'debug' => false,
                'ignore' => [
                    'status' => null,
                    'groups' => null,
                    'channels' => null
                ],
                'noweb' => [
                    'store' => [
                        'enabled' => true,
                        'fullSync' => false
                    ]
                ],
                'webjs' => [
                    'tagsEventsOn' => false
                ]
            ]
        ];

        if ($n8nWebhookId) {
            $webhookUrls = $this->generateN8nWebhookUrls($n8nWebhookId);

            // Configure webhooks array inside config for WAHA 3rd party compatibility
            $sessionData['config']['webhooks'] = [
                [
                    'url' => $webhookUrls['test'],
                    'events' => ['message', 'session.status'],
                    'hmac' => null,
                    'retries' => null,
                    'customHeaders' => null
                ],
                [
                    'url' => $webhookUrls['production'],
                    'events' => ['message', 'session.status'],
                    'hmac' => null,
                    'retries' => null,
                    'customHeaders' => null
                ]
            ];

        } else {
            // Fallback to default webhook if no N8N webhook ID
            $defaultUrl = config('waha.webhooks.default_url', '');
            if ($defaultUrl) {
                $sessionData['config']['webhooks'] = [
                    [
                        'url' => $defaultUrl,
                        'events' => ['message', 'session.status'],
                        'hmac' => null,
                        'retries' => null,
                        'customHeaders' => null
                    ]
                ];
            }
        }

        return $sessionData;
    }

    /**
     * Flatten metadata array
     *
     * @param array $metadata Metadata array
     * @return array
     */
    protected function flattenMetadata(array $metadata, int $depth = 0): array
    {
        // Prevent infinite recursion by limiting depth
        if ($depth > 5) {
            return ['error' => 'Maximum recursion depth exceeded'];
        }

        $flattened = [];
        foreach ($metadata as $key => $value) {
            if (is_array($value)) {
                // Recursively flatten nested arrays
                $nested = $this->flattenMetadata($value, $depth + 1);
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
     * Generate unique session name
     *
     * @param string $organizationId Organization ID
     * @param string|null $customName Custom name
     * @return string
     */
    protected function generateSessionName(string $organizationId, ?string $customName = null): string
    {
        if ($customName) {
            $cleanName = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $customName));
            return $organizationId . '_' . $cleanName . '_' . substr(md5(uniqid()), 0, 8);
        }

        return $organizationId . '_session-' . substr(md5(uniqid()), 0, 8);
    }

    /**
     * Save session to database with N8N workflow ID
     *
     * @param string $organizationId
     * @param string $sessionName
     * @param array $wahaResult
     * @param string|null $n8nWorkflowId
     * @return void
     */
    protected function saveSessionToDatabase(string $organizationId, string $sessionName, array $wahaResult, ?string $n8nWorkflowId = null): void
    {
        try {
            Log::info('Starting saveSessionToDatabase', [
                'organization_id' => $organizationId,
                'session_name' => $sessionName,
                'n8n_workflow_id' => $n8nWorkflowId
            ]);

            $wahaSyncService = app(\App\Services\Waha\WahaSyncService::class);

            // Extract webhook configuration from WAHA result
            $webhookConfig = [];
            Log::info('Extracting webhook configuration from WAHA result', [
                'waha_result_structure' => array_keys($wahaResult),
                'session_config_exists' => isset($wahaResult['session']['config']),
                'webhooks_exists' => isset($wahaResult['session']['config']['webhooks']),
                'webhooks_count' => isset($wahaResult['session']['config']['webhooks']) ? count($wahaResult['session']['config']['webhooks']) : 0
            ]);

            if (isset($wahaResult['session']['config']['webhooks'])) {
                $webhookConfig = [
                    'enabled' => true,
                    'url' => $wahaResult['session']['config']['webhooks'][0]['url'] ?? null,
                    'events' => $wahaResult['session']['config']['webhooks'][0]['events'] ?? ['message', 'session.status'],
                    'secret' => $wahaResult['session']['config']['webhooks'][0]['hmac'] ?? null,
                    'webhooks' => $wahaResult['session']['config']['webhooks'] // Store full webhooks array
                ];
                Log::info('Webhook configuration extracted successfully', ['webhook_config' => $webhookConfig]);
            } else {
                Log::warning('No webhooks found in WAHA result', ['waha_result' => $wahaResult]);
            }

            // Use the existing method to create/update session in database
            $session = $wahaSyncService->createSessionForOrganization($organizationId, $sessionName, $webhookConfig, $n8nWorkflowId);

            Log::info('Session saved to database with N8N workflow ID', [
                'organization_id' => $organizationId,
                'session_name' => $sessionName,
                'n8n_workflow_id' => $n8nWorkflowId,
                'session_id' => $session->id ?? 'N/A',
                'webhook_config' => $webhookConfig
            ]);
        } catch (Exception $e) {
            Log::error('Failed to save session to database', [
                'organization_id' => $organizationId,
                'session_name' => $sessionName,
                'n8n_workflow_id' => $n8nWorkflowId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }
}
