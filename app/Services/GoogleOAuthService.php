<?php

namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Config;

/**
 * Google OAuth Service
 * Service untuk mengelola Google OAuth flow dan token management
 */
class GoogleOAuthService
{
    protected $clientId;
    protected $clientSecret;
    protected $redirectUri;
    protected $httpClient;

    public function __construct()
    {
        $this->clientId = Config::get('services.google.client_id');
        $this->clientSecret = Config::get('services.google.client_secret');
        $this->redirectUri = Config::get('services.google.redirect_uri');
        $this->httpClient = new Client(['timeout' => 30]);
    }

    /**
     * Generate OAuth authorization URL
     */
    public function generateAuthUrl($service, $organizationId, $state = null)
    {
        $scopes = $this->getScopesForService($service);

        $params = [
            'client_id' => $this->clientId,
            'redirect_uri' => $this->redirectUri,
            'response_type' => 'code',
            'scope' => implode(' ', $scopes),
            'state' => $state ?: json_encode([
                'service' => $service,
                'organization_id' => $organizationId,
                'timestamp' => time()
            ]),
            'access_type' => 'offline',
            'prompt' => 'consent'
        ];

        return 'https://accounts.google.com/o/oauth2/v2/auth?' . http_build_query($params);
    }

    /**
     * Exchange authorization code for access token
     */
    public function exchangeCodeForToken($code)
    {
        try {
            $response = $this->httpClient->post('https://oauth2.googleapis.com/token', [
                'form_params' => [
                    'client_id' => $this->clientId,
                    'client_secret' => $this->clientSecret,
                    'code' => $code,
                    'grant_type' => 'authorization_code',
                    'redirect_uri' => $this->redirectUri
                ]
            ]);

            $tokenData = json_decode($response->getBody(), true);

            if (isset($tokenData['error'])) {
                throw new \Exception('Token exchange failed: ' . $tokenData['error_description']);
            }

            return $tokenData;

        } catch (RequestException $e) {
            Log::error('OAuth token exchange failed', [
                'error' => $e->getMessage(),
                'response' => $e->getResponse() ? $e->getResponse()->getBody()->getContents() : null
            ]);

            throw new \Exception('Token exchange failed: ' . $e->getMessage());
        }
    }

    /**
     * Refresh access token using refresh token
     */
    public function refreshAccessToken($refreshToken)
    {
        try {
            $response = $this->httpClient->post('https://oauth2.googleapis.com/token', [
                'form_params' => [
                    'client_id' => $this->clientId,
                    'client_secret' => $this->clientSecret,
                    'refresh_token' => $refreshToken,
                    'grant_type' => 'refresh_token'
                ]
            ]);

            $tokenData = json_decode($response->getBody(), true);

            if (isset($tokenData['error'])) {
                throw new \Exception('Token refresh failed: ' . $tokenData['error_description']);
            }

            return $tokenData;

        } catch (RequestException $e) {
            Log::error('OAuth token refresh failed', [
                'error' => $e->getMessage(),
                'response' => $e->getResponse() ? $e->getResponse()->getBody()->getContents() : null
            ]);

            throw new \Exception('Token refresh failed: ' . $e->getMessage());
        }
    }

    /**
     * Test OAuth connection with access token
     */
    public function testOAuthConnection($service, $accessToken)
    {
        try {
            switch ($service) {
                case 'google-sheets':
                    return $this->testGoogleSheetsConnection($accessToken);
                case 'google-docs':
                    return $this->testGoogleDocsConnection($accessToken);
                case 'google-drive':
                    return $this->testGoogleDriveConnection($accessToken);
                default:
                    throw new \Exception('Unsupported service: ' . $service);
            }
        } catch (\Exception $e) {
            Log::error('OAuth connection test failed', [
                'service' => $service,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Test Google Sheets connection
     */
    private function testGoogleSheetsConnection($accessToken)
    {
        try {
            $response = $this->httpClient->get('https://sheets.googleapis.com/v4/spreadsheets', [
                'headers' => [
                    'Authorization' => 'Bearer ' . $accessToken
                ],
                'query' => ['pageSize' => 1]
            ]);

            $data = json_decode($response->getBody(), true);

            return [
                'success' => true,
                'data' => [
                    'service' => 'google-sheets',
                    'status' => 'connected',
                    'filesCount' => count($data['files'] ?? []),
                    'message' => 'Google Sheets connection successful'
                ]
            ];

        } catch (RequestException $e) {
            return [
                'success' => false,
                'error' => 'Google Sheets connection failed: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Test Google Docs connection
     */
    private function testGoogleDocsConnection($accessToken)
    {
        try {
            $response = $this->httpClient->get('https://docs.googleapis.com/v1/documents', [
                'headers' => [
                    'Authorization' => 'Bearer ' . $accessToken
                ],
                'query' => ['pageSize' => 1]
            ]);

            $data = json_decode($response->getBody(), true);

            return [
                'success' => true,
                'data' => [
                    'service' => 'google-docs',
                    'status' => 'connected',
                    'filesCount' => count($data['documents'] ?? []),
                    'message' => 'Google Docs connection successful'
                ]
            ];

        } catch (RequestException $e) {
            return [
                'success' => false,
                'error' => 'Google Docs connection failed: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Test Google Drive connection
     */
    private function testGoogleDriveConnection($accessToken)
    {
        try {
            $response = $this->httpClient->get('https://www.googleapis.com/drive/v3/files', [
                'headers' => [
                    'Authorization' => 'Bearer ' . $accessToken
                ],
                'query' => ['pageSize' => 1]
            ]);

            $data = json_decode($response->getBody(), true);

            return [
                'success' => true,
                'data' => [
                    'service' => 'google-drive',
                    'status' => 'connected',
                    'filesCount' => count($data['files'] ?? []),
                    'message' => 'Google Drive connection successful'
                ]
            ];

        } catch (RequestException $e) {
            return [
                'success' => false,
                'error' => 'Google Drive connection failed: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Get files from Google Drive
     */
    public function getFiles($accessToken, $service, $pageSize = 100, $pageToken = null)
    {
        try {
            $endpoint = $this->getEndpointForService($service);
            $query = ['pageSize' => $pageSize];

            if ($pageToken) {
                $query['pageToken'] = $pageToken;
            }

            // Add service-specific filters
            if ($service === 'google-sheets') {
                $query['q'] = "mimeType='application/vnd.google-apps.spreadsheet'";
            } elseif ($service === 'google-docs') {
                $query['q'] = "mimeType='application/vnd.google-apps.document'";
            }

            $response = $this->httpClient->get($endpoint, [
                'headers' => [
                    'Authorization' => 'Bearer ' . $accessToken
                ],
                'query' => $query
            ]);

            $data = json_decode($response->getBody(), true);

            return [
                'success' => true,
                'data' => [
                    'files' => $data['files'] ?? $data['documents'] ?? [],
                    'nextPageToken' => $data['nextPageToken'] ?? null,
                    'totalCount' => count($data['files'] ?? $data['documents'] ?? [])
                ]
            ];

        } catch (RequestException $e) {
            Log::error('Failed to get files from Google', [
                'service' => $service,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => 'Failed to get files: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Get file details
     */
    public function getFileDetails($accessToken, $fileId, $service)
    {
        try {
            $endpoint = $this->getFileEndpointForService($service, $fileId);

            $response = $this->httpClient->get($endpoint, [
                'headers' => [
                    'Authorization' => 'Bearer ' . $accessToken
                ]
            ]);

            $data = json_decode($response->getBody(), true);

            return [
                'success' => true,
                'data' => $data
            ];

        } catch (RequestException $e) {
            Log::error('Failed to get file details', [
                'fileId' => $fileId,
                'service' => $service,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => 'Failed to get file details: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Get scopes for service
     */
    private function getScopesForService($service)
    {
        return match($service) {
            'google-sheets' => [
                'https://www.googleapis.com/auth/spreadsheets.readonly',
                'https://www.googleapis.com/auth/drive.readonly'
            ],
            'google-docs' => [
                'https://www.googleapis.com/auth/documents.readonly',
                'https://www.googleapis.com/auth/drive.readonly'
            ],
            'google-drive' => [
                'https://www.googleapis.com/auth/drive.readonly',
                'https://www.googleapis.com/auth/drive.metadata.readonly'
            ],
            default => []
        };
    }

    /**
     * Get API endpoint for service
     */
    private function getEndpointForService($service)
    {
        return match($service) {
            'google-sheets' => 'https://sheets.googleapis.com/v4/spreadsheets',
            'google-docs' => 'https://docs.googleapis.com/v1/documents',
            'google-drive' => 'https://www.googleapis.com/drive/v3/files',
            default => 'https://www.googleapis.com/drive/v3/files'
        };
    }

    /**
     * Get file endpoint for service
     */
    private function getFileEndpointForService($service, $fileId)
    {
        return match($service) {
            'google-sheets' => "https://sheets.googleapis.com/v4/spreadsheets/{$fileId}",
            'google-docs' => "https://docs.googleapis.com/v1/documents/{$fileId}",
            'google-drive' => "https://www.googleapis.com/drive/v3/files/{$fileId}",
            default => "https://www.googleapis.com/drive/v3/files/{$fileId}"
        };
    }
}
