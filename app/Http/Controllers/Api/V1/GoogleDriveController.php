<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Services\GoogleDriveService;
use App\Models\OAuthCredential;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;

/**
 * Google Drive Controller
 * Controller untuk mengelola file di Google Drive
 */
class GoogleDriveController extends BaseApiController
{
    /**
     * Get Google Drive service instance
     */
    private function getGoogleDriveService($userId, $organizationId)
    {
        $credential = OAuthCredential::forService('google')
            ->forOrganization($organizationId)
            ->forUser($userId)
            ->first();

        if (!$credential) {
            throw new Exception('Google Drive belum terhubung. Silakan hubungkan akun Google Drive Anda terlebih dahulu.');
        }

        return new GoogleDriveService($credential->access_token, $credential->refresh_token);
    }

    /**
     * Get files from Google Drive
     */
    public function getFiles(Request $request)
    {
        try {
            $user = $request->user();
            $pageSize = $request->input('page_size', 10);
            $pageToken = $request->input('page_token');

            $driveService = $this->getGoogleDriveService($user->id, $user->organization_id);
            $files = $driveService->getFiles($pageSize, $pageToken);

            return $this->successResponse('Files retrieved successfully', $files);

        } catch (Exception $e) {
            Log::error('Failed to get Google Drive files', [
                'user_id' => $request->user()->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponse('Failed to get files: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get file details by ID
     */
    public function getFileDetails(Request $request, $fileId)
    {
        try {
            $user = $request->user();

            $driveService = $this->getGoogleDriveService($user->id, $user->organization_id);
            $fileDetails = $driveService->getFileDetails($fileId);

            return $this->successResponse('File details retrieved successfully', $fileDetails);

        } catch (Exception $e) {
            Log::error('Failed to get Google Drive file details', [
                'user_id' => $request->user()->id,
                'file_id' => $fileId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponse('Failed to get file details: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Create a new file in Google Drive
     */
    public function createFile(Request $request)
    {
        try {
            $user = $request->user();
            $fileName = $request->input('file_name');
            $content = $request->input('content');
            $mimeType = $request->input('mime_type', 'text/plain');

            if (!$fileName || !$content) {
                return $this->errorResponse('File name and content are required', 400);
            }

            $driveService = $this->getGoogleDriveService($user->id, $user->organization_id);
            $file = $driveService->createFile($fileName, $content, $mimeType);

            Log::info('Google Drive file created', [
                'user_id' => $user->id,
                'file_id' => $file['id'],
                'file_name' => $fileName
            ]);

            return $this->successResponse('File created successfully', $file);

        } catch (Exception $e) {
            Log::error('Failed to create Google Drive file', [
                'user_id' => $request->user()->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponse('Failed to create file: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update file content
     */
    public function updateFile(Request $request, $fileId)
    {
        try {
            $user = $request->user();
            $content = $request->input('content');
            $mimeType = $request->input('mime_type', 'text/plain');

            if (!$content) {
                return $this->errorResponse('Content is required', 400);
            }

            $driveService = $this->getGoogleDriveService($user->id, $user->organization_id);
            $file = $driveService->updateFile($fileId, $content, $mimeType);

            Log::info('Google Drive file updated', [
                'user_id' => $user->id,
                'file_id' => $fileId
            ]);

            return $this->successResponse('File updated successfully', $file);

        } catch (Exception $e) {
            Log::error('Failed to update Google Drive file', [
                'user_id' => $request->user()->id,
                'file_id' => $fileId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponse('Failed to update file: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Delete file from Google Drive
     */
    public function deleteFile(Request $request, $fileId)
    {
        try {
            $user = $request->user();

            $driveService = $this->getGoogleDriveService($user->id, $user->organization_id);
            $driveService->deleteFile($fileId);

            Log::info('Google Drive file deleted', [
                'user_id' => $user->id,
                'file_id' => $fileId
            ]);

            return $this->successResponse('File deleted successfully', [
                'file_id' => $fileId,
                'deleted' => true
            ]);

        } catch (Exception $e) {
            Log::error('Failed to delete Google Drive file', [
                'user_id' => $request->user()->id,
                'file_id' => $fileId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponse('Failed to delete file: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Download file content
     */
    public function downloadFile(Request $request, $fileId)
    {
        try {
            $user = $request->user();

            $driveService = $this->getGoogleDriveService($user->id, $user->organization_id);
            $content = $driveService->downloadFile($fileId);

            return response($content)
                ->header('Content-Type', 'application/octet-stream')
                ->header('Content-Disposition', 'attachment');

        } catch (Exception $e) {
            Log::error('Failed to download Google Drive file', [
                'user_id' => $request->user()->id,
                'file_id' => $fileId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponse('Failed to download file: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Search files by name
     */
    public function searchFiles(Request $request)
    {
        try {
            $user = $request->user();
            $query = $request->input('query');
            $pageSize = $request->input('page_size', 10);

            if (!$query) {
                return $this->errorResponse('Search query is required', 400);
            }

            $driveService = $this->getGoogleDriveService($user->id, $user->organization_id);
            $files = $driveService->searchFiles($query, $pageSize);

            return $this->successResponse('Files found successfully', $files);

        } catch (Exception $e) {
            Log::error('Failed to search Google Drive files', [
                'user_id' => $request->user()->id,
                'query' => $request->input('query'),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponse('Failed to search files: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get user's drive storage info
     */
    public function getStorageInfo(Request $request)
    {
        try {
            $user = $request->user();

            $driveService = $this->getGoogleDriveService($user->id, $user->organization_id);
            $storageInfo = $driveService->getStorageInfo();

            return $this->successResponse('Storage info retrieved successfully', $storageInfo);

        } catch (Exception $e) {
            Log::error('Failed to get Google Drive storage info', [
                'user_id' => $request->user()->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponse('Failed to get storage info: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get OAuth status for Google Drive
     */
    public function getOAuthStatus(Request $request)
    {
        try {
            $user = $request->user();
            $organizationId = $user->organization_id;

            // Check if OAuth credential exists first
            $credential = OAuthCredential::forService('google')
                ->forOrganization($organizationId)
                ->forUser($user->id)
                ->first();

            if (!$credential) {
                return $this->successResponse('OAuth status retrieved', [
                    'has_oauth' => false,
                    'service' => 'google',
                    'connected' => false,
                    'message' => 'Google Drive belum terhubung. Silakan hubungkan akun Google Drive Anda terlebih dahulu.',
                    'action_required' => 'connect',
                    'connect_url' => '/auth/google/redirect'
                ]);
            }

            // Use service to get OAuth status
            $status = $this->getGoogleDriveService($user->id, $organizationId)->getOAuthStatus($user->id, $organizationId);

            return $this->successResponse('OAuth status retrieved', $status);

        } catch (Exception $e) {
            Log::error('Failed to get OAuth status', [
                'user_id' => $request->user()->id,
                'error' => $e->getMessage()
            ]);

            return $this->errorResponse('Failed to get OAuth status: ' . $e->getMessage(), 500);
        }
    }
}
