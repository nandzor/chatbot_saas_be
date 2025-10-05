<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use App\Models\OAuthCredential;
use Exception;

/**
 * Google Drive Service
 * Service untuk mengelola file di Google Drive menggunakan OAuth credentials
 * Berdasarkan Google Drive API v3: https://www.googleapis.com/discovery/v1/apis/drive/v3/rest
 */
class GoogleDriveService
{
    private $accessToken;
    private $refreshToken;
    private $baseUrl = 'https://www.googleapis.com/drive/v3';

    public function __construct($accessToken, $refreshToken = null)
    {
        $this->accessToken = $accessToken;
        $this->refreshToken = $refreshToken;
    }

    /**
     * Get files from Google Drive
     */
    public function getFiles($pageSize = 10, $pageToken = null)
    {
        try {
            $url = 'https://www.googleapis.com/drive/v3/files';
            $params = [
                'pageSize' => $pageSize,
                'fields' => 'nextPageToken, files(id, name, mimeType, size, createdTime, modifiedTime, webViewLink)',
                'orderBy' => 'modifiedTime desc'
            ];

            if ($pageToken) {
                $params['pageToken'] = $pageToken;
            }

            $response = Http::withToken($this->accessToken)
                ->get($url, $params);

            if ($response->successful()) {
                return $response->json();
            }

            throw new Exception('Failed to get files: ' . $response->body());

        } catch (Exception $e) {
            Log::error('Google Drive getFiles failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    /**
     * Get file details by ID
     */
    public function getFileDetails($fileId)
    {
        try {
            $url = "https://www.googleapis.com/drive/v3/files/{$fileId}";
            $params = [
                'fields' => 'id, name, mimeType, size, createdTime, modifiedTime, webViewLink, description'
            ];

            $response = Http::withToken($this->accessToken)
                ->get($url, $params);

            if ($response->successful()) {
                return $response->json();
            }

            throw new Exception('Failed to get file details: ' . $response->body());

        } catch (Exception $e) {
            Log::error('Google Drive getFileDetails failed', [
                'file_id' => $fileId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    /**
     * Create a new file in Google Drive
     */
    public function createFile($fileName, $content, $mimeType = 'text/plain')
    {
        try {
            $url = 'https://www.googleapis.com/drive/v3/files';

            $metadata = [
                'name' => $fileName,
                'mimeType' => $mimeType
            ];

            $response = Http::withToken($this->accessToken)
                ->attach('metadata', json_encode($metadata), 'application/json')
                ->attach('file', $content, $mimeType)
                ->post($url);

            if ($response->successful()) {
                return $response->json();
            }

            throw new Exception('Failed to create file: ' . $response->body());

        } catch (Exception $e) {
            Log::error('Google Drive createFile failed', [
                'file_name' => $fileName,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    /**
     * Update file content
     */
    public function updateFile($fileId, $content, $mimeType = 'text/plain')
    {
        try {
            $url = "https://www.googleapis.com/drive/v3/files/{$fileId}";

            $response = Http::withToken($this->accessToken)
                ->attach('file', $content, $mimeType)
                ->patch($url);

            if ($response->successful()) {
                return $response->json();
            }

            throw new Exception('Failed to update file: ' . $response->body());

        } catch (Exception $e) {
            Log::error('Google Drive updateFile failed', [
                'file_id' => $fileId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    /**
     * Delete file from Google Drive
     */
    public function deleteFile($fileId)
    {
        try {
            $url = "https://www.googleapis.com/drive/v3/files/{$fileId}";

            $response = Http::withToken($this->accessToken)
                ->delete($url);

            if ($response->successful()) {
                return true;
            }

            throw new Exception('Failed to delete file: ' . $response->body());

        } catch (Exception $e) {
            Log::error('Google Drive deleteFile failed', [
                'file_id' => $fileId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    /**
     * Download file content
     */
    public function downloadFile($fileId)
    {
        try {
            $url = "https://www.googleapis.com/drive/v3/files/{$fileId}";
            $params = ['alt' => 'media'];

            $response = Http::withToken($this->accessToken)
                ->get($url, $params);

            if ($response->successful()) {
                return $response->body();
            }

            throw new Exception('Failed to download file: ' . $response->body());

        } catch (Exception $e) {
            Log::error('Google Drive downloadFile failed', [
                'file_id' => $fileId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    /**
     * Search files by name
     */
    public function searchFiles($query, $pageSize = 10)
    {
        try {
            $url = 'https://www.googleapis.com/drive/v3/files';
            $params = [
                'q' => "name contains '{$query}'",
                'pageSize' => $pageSize,
                'fields' => 'nextPageToken, files(id, name, mimeType, size, createdTime, modifiedTime, webViewLink)',
                'orderBy' => 'modifiedTime desc'
            ];

            $response = Http::withToken($this->accessToken)
                ->get($url, $params);

            if ($response->successful()) {
                return $response->json();
            }

            throw new Exception('Failed to search files: ' . $response->body());

        } catch (Exception $e) {
            Log::error('Google Drive searchFiles failed', [
                'query' => $query,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    /**
     * Get user's drive storage info
     */
    public function getStorageInfo()
    {
        try {
            $url = 'https://www.googleapis.com/drive/v3/about';
            $params = [
                'fields' => 'storageQuota, user'
            ];

            $response = Http::withToken($this->accessToken)
                ->get($url, $params);

            if ($response->successful()) {
                return $response->json();
            }

            throw new Exception('Failed to get storage info: ' . $response->body());

        } catch (Exception $e) {
            Log::error('Google Drive getStorageInfo failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    /**
     * Get OAuth status and credential information
     */
    public function getOAuthStatus($userId, $organizationId)
    {
        try {
            $credential = OAuthCredential::forService('google')
                ->forOrganization($organizationId)
                ->forUser($userId)
                ->first();

            if (!$credential) {
                return [
                    'has_oauth' => false,
                    'service' => 'google',
                    'connected' => false,
                    'message' => 'No OAuth credential found'
                ];
            }

            // Check if token is expired
            $isExpired = $credential->isExpired();
            $needsRefresh = $isExpired && $credential->canRefresh();

            // Test connection if token is not expired
            $connectionTest = false;
            if (!$isExpired) {
                try {
                    $response = Http::withToken($credential->access_token)
                        ->get('https://www.googleapis.com/drive/v3/about', [
                            'fields' => 'user, storageQuota'
                        ]);
                    $connectionTest = $response->successful();
                } catch (Exception $e) {
                    $connectionTest = false;
                }
            }

            return [
                'has_oauth' => true,
                'service' => 'google',
                'connected' => !$isExpired && $connectionTest,
                'is_expired' => $isExpired,
                'needs_refresh' => $needsRefresh,
                'expires_at' => $credential->expires_at,
                'scope' => $credential->scope,
                'connection_test' => $connectionTest,
                'last_checked' => now()
            ];

        } catch (Exception $e) {
            Log::error('Google Drive getOAuthStatus failed', [
                'user_id' => $userId,
                'organization_id' => $organizationId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }
}
