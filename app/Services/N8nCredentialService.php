<?php

namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Config;

/**
 * N8N Credential Service
 * Service untuk mengelola credentials di N8N credential service
 */
class N8nCredentialService
{
    protected $n8nApiUrl;
    protected $n8nApiKey;
    protected $httpClient;

    public function __construct()
    {
        $this->n8nApiUrl = Config::get('services.n8n.api_url');
        $this->n8nApiKey = Config::get('services.n8n.api_key');
        $this->httpClient = new Client(['timeout' => 30]);
    }

    /**
     * Create OAuth credential in N8N credential service
     */
    public function createOAuthCredential($service, $accessToken, $refreshToken, $expiresAt)
    {
        try {
            $credentialData = $this->buildOAuthCredentialData($service, $accessToken, $refreshToken, $expiresAt);

            $response = $this->httpClient->post("{$this->n8nApiUrl}/api/v1/credentials", [
                'json' => $credentialData,
                'headers' => [
                    'X-N8N-API-KEY' => $this->n8nApiKey,
                    'Content-Type' => 'application/json'
                ]
            ]);

            $credential = json_decode($response->getBody(), true);

            return [
                'success' => true,
                'data' => [
                    'id' => $credential['id'],
                    'name' => $credential['name'],
                    'type' => $credential['type'],
                    'status' => 'active'
                ]
            ];

        } catch (RequestException $e) {
            Log::error('Failed to create N8N credential', [
                'service' => $service,
                'error' => $e->getMessage(),
                'response' => $e->getResponse() ? $e->getResponse()->getBody()->getContents() : null
            ]);

            return [
                'success' => false,
                'error' => 'Failed to create N8N credential: ' . $e->getMessage()
            ];
        } catch (\Exception $e) {
            Log::error('Unexpected error creating N8N credential', [
                'service' => $service,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => 'Unexpected error: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Update OAuth credential when token is refreshed
     */
    public function updateOAuthCredential($credentialId, $newAccessToken, $newExpiresAt)
    {
        try {
            $updateData = [
                'data' => [
                    'accessToken' => $newAccessToken,
                    'expiresAt' => $newExpiresAt,
                    'tokenType' => 'Bearer'
                ]
            ];

            $response = $this->httpClient->patch("{$this->n8nApiUrl}/api/v1/credentials/{$credentialId}", [
                'json' => $updateData,
                'headers' => [
                    'X-N8N-API-KEY' => $this->n8nApiKey,
                    'Content-Type' => 'application/json'
                ]
            ]);

            return [
                'success' => true,
                'data' => json_decode($response->getBody(), true)
            ];

        } catch (RequestException $e) {
            Log::error('Failed to update N8N credential', [
                'credentialId' => $credentialId,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => 'Failed to update N8N credential: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Test credential connection
     */
    public function testCredential($credentialId)
    {
        try {
            $response = $this->httpClient->post("{$this->n8nApiUrl}/api/v1/credentials/{$credentialId}/test", [
                'headers' => [
                    'X-N8N-API-KEY' => $this->n8nApiKey,
                    'Content-Type' => 'application/json'
                ]
            ]);

            $result = json_decode($response->getBody(), true);

            return [
                'success' => true,
                'data' => $result
            ];

        } catch (RequestException $e) {
            Log::error('Credential test failed', [
                'credentialId' => $credentialId,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => 'Credential test failed: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Delete credential
     */
    public function deleteCredential($credentialId)
    {
        try {
            $response = $this->httpClient->delete("{$this->n8nApiUrl}/api/v1/credentials/{$credentialId}", [
                'headers' => [
                    'X-N8N-API-KEY' => $this->n8nApiKey
                ]
            ]);

            return [
                'success' => true,
                'data' => ['deleted' => true]
            ];

        } catch (RequestException $e) {
            Log::error('Failed to delete N8N credential', [
                'credentialId' => $credentialId,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => 'Failed to delete N8N credential: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Get credential details
     */
    public function getCredential($credentialId)
    {
        try {
            $response = $this->httpClient->get("{$this->n8nApiUrl}/api/v1/credentials/{$credentialId}", [
                'headers' => [
                    'X-N8N-API-KEY' => $this->n8nApiKey
                ]
            ]);

            return [
                'success' => true,
                'data' => json_decode($response->getBody(), true)
            ];

        } catch (RequestException $e) {
            Log::error('Failed to get N8N credential', [
                'credentialId' => $credentialId,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => 'Failed to get N8N credential: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Build credential data for N8N credential service
     */
    private function buildOAuthCredentialData($service, $accessToken, $refreshToken, $expiresAt)
    {
        $credentialTypes = [
            'google-sheets' => 'googleSheetsOAuth2Api',
            'google-docs' => 'googleDocsOAuth2Api',
            'google-drive' => 'googleDriveOAuth2Api'
        ];

        $credentialType = $credentialTypes[$service] ?? 'googleOAuth2Api';

        return [
            'name' => "Google {$service} OAuth - " . now()->format('Y-m-d H:i:s'),
            'type' => $credentialType,
            'data' => [
                'accessToken' => $accessToken,
                'refreshToken' => $refreshToken,
                'expiresAt' => $expiresAt,
                'tokenType' => 'Bearer',
                'scope' => $this->getScopesForService($service)
            ],
            'nodesAccess' => [
                [
                    'nodeType' => $this->getNodeTypeForService($service),
                    'date' => now()->toISOString()
                ]
            ]
        ];
    }

    /**
     * Get scopes for service
     */
    private function getScopesForService($service)
    {
        return match($service) {
            'google-sheets' => 'https://www.googleapis.com/auth/spreadsheets.readonly https://www.googleapis.com/auth/drive.readonly',
            'google-docs' => 'https://www.googleapis.com/auth/documents.readonly https://www.googleapis.com/auth/drive.readonly',
            'google-drive' => 'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.metadata.readonly',
            default => ''
        };
    }

    /**
     * Get node type for service
     */
    private function getNodeTypeForService($service)
    {
        return match($service) {
            'google-sheets' => '@n8n/n8n-nodes-base.googleSheets',
            'google-docs' => '@n8n/n8n-nodes-base.googleDocs',
            'google-drive' => '@n8n/n8n-nodes-base.googleDrive',
            default => null
        };
    }
}
