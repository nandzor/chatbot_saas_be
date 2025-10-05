/**
 * Google Drive Hook
 * Custom hook untuk mengelola Google Drive API dengan backend yang baru
 */

import { useState, useCallback, useEffect } from 'react';
import { googleDriveService } from '@/services/GoogleDriveService';
import { toast } from 'react-hot-toast';

export const useGoogleDrive = () => {
  const [oauthStatus, setOauthStatus] = useState({
    has_oauth: false,
    service: 'google',
    is_expired: false,
    needs_refresh: false,
    expires_at: null,
    scope: null
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get OAuth status
  const getOAuthStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await googleDriveService.getOAuthStatus();

      if (result.success) {
        setOauthStatus(result.data);
        return result.data;
      } else {
        setError(result.error);
        throw new Error(result.error);
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to get OAuth status';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Initiate Google OAuth flow untuk Google Drive integration
  const initiateOAuth = useCallback(async (organizationId, userId, redirectUrl = 'http://localhost:3001/oauth/callback') => {
    try {
      setLoading(true);
      setError(null);

      const result = await googleDriveService.generateAuthUrl(organizationId, userId, redirectUrl);

      if (result.success) {
        // Redirect to Google OAuth
        window.location.href = result.data.auth_url;
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to initiate Google OAuth';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Revoke OAuth credential
  const revokeOAuthCredential = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await googleDriveService.revokeOAuthCredential();

      if (result.success) {
        setOauthStatus({
          has_oauth: false,
          service: 'google',
          is_expired: false,
          needs_refresh: false,
          expires_at: null,
          scope: null
        });
        toast.success('Google Drive connection revoked successfully');
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to revoke OAuth credential';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Check if Google Drive is connected
  const isConnected = oauthStatus.has_oauth && !oauthStatus.is_expired;

  // Load OAuth status on mount
  useEffect(() => {
    getOAuthStatus();
  }, [getOAuthStatus]);

  return {
    // State
    oauthStatus,
    loading,
    error,
    isConnected,

    // Actions
    getOAuthStatus,
    initiateOAuth,
    revokeOAuthCredential,

    // Utilities
    setError
  };
};

/**
 * Hook untuk file management dengan Google Drive
 */
export const useGoogleDriveFiles = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    nextPageToken: null,
    hasMore: true
  });

  // Get files
  const getFiles = useCallback(async (pageSize = 10, pageToken = null) => {
    try {
      setLoading(true);
      setError(null);

      const result = await googleDriveService.getFiles(pageSize, pageToken);

      if (result.success) {
        const newFiles = result.files || [];

        if (pageToken) {
          // Append to existing files
          setFiles(prev => [...prev, ...newFiles]);
        } else {
          // Replace files
          setFiles(newFiles);
        }

        setPagination({
          nextPageToken: result.nextPageToken,
          hasMore: !!result.nextPageToken
        });

        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to get files';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get file details
  const getFileDetails = useCallback(async (fileId) => {
    try {
      setLoading(true);
      setError(null);

      const result = await googleDriveService.getFileDetails(fileId);

      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to get file details';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Search files
  const searchFiles = useCallback(async (query, pageSize = 10) => {
    try {
      setLoading(true);
      setError(null);

      const result = await googleDriveService.searchFiles(query, pageSize);

      if (result.success) {
        setFiles(result.files || []);
        setPagination({
          nextPageToken: result.nextPageToken,
          hasMore: !!result.nextPageToken
        });

        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to search files';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Load more files
  const loadMoreFiles = useCallback(async () => {
    if (!pagination.hasMore || loading) return;

    try {
      await getFiles(10, pagination.nextPageToken);
    } catch (error) {
      // Error is already handled in getFiles
    }
  }, [getFiles, pagination.hasMore, pagination.nextPageToken, loading]);

  // Refresh files - force reload from beginning
  const refreshFiles = useCallback(async () => {
    try {
      // Always call with pageToken=null to replace existing files
      await getFiles(10, null);
    } catch (error) {
      // Error is already handled in getFiles
    }
  }, [getFiles]);

  // Create file
  const createFile = useCallback(async (fileName, content, mimeType = 'text/plain') => {
    try {
      setLoading(true);
      setError(null);

      const result = await googleDriveService.createFile(fileName, content, mimeType);

      if (result.success) {
        toast.success('File created successfully');
        await refreshFiles(); // Refresh the file list
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to create file';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [refreshFiles]);

  // Update file
  const updateFile = useCallback(async (fileId, content, mimeType = 'text/plain') => {
    try {
      setLoading(true);
      setError(null);

      const result = await googleDriveService.updateFile(fileId, content, mimeType);

      if (result.success) {
        toast.success('File updated successfully');
        await refreshFiles(); // Refresh the file list
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to update file';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [refreshFiles]);

  // Delete file
  const deleteFile = useCallback(async (fileId) => {
    try {
      setLoading(true);
      setError(null);

      const result = await googleDriveService.deleteFile(fileId);

      if (result.success) {
        toast.success('File deleted successfully');
        await refreshFiles(); // Refresh the file list
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to delete file';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [refreshFiles]);

  // Download file
  const downloadFile = useCallback(async (fileId, fileName) => {
    try {
      setLoading(true);
      setError(null);

      const result = await googleDriveService.downloadFile(fileId);

      if (result.success) {
        // Create download link
        const url = window.URL.createObjectURL(result.data);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName || 'download';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast.success('File downloaded successfully');
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to download file';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get storage info
  const getStorageInfo = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await googleDriveService.getStorageInfo();

      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to get storage info';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // State
    files,
    loading,
    error,
    pagination,

    // Actions
    getFiles,
    getFileDetails,
    searchFiles,
    loadMoreFiles,
    refreshFiles,
    createFile,
    updateFile,
    deleteFile,
    downloadFile,
    getStorageInfo,

    // Utilities
    setError,
    setFiles
  };
};

export default useGoogleDrive;
