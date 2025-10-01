/**
 * OAuth Hook
 * Custom hook untuk mengelola OAuth flow dengan Google services
 */

import { useState, useCallback, useEffect } from 'react';
import { useApi } from './useApi';
import { oauthService } from '@/services/OAuthService';
import oauthErrorHandler from '@/utils/OAuthErrorHandler';

export const useOAuth = () => {
  const [oauthStatus, setOauthStatus] = useState({
    googleDocs: null,
    googleSheets: null,
    googleDrive: null
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errorStatistics, setErrorStatistics] = useState([]);
  const [retryCount, setRetryCount] = useState({});

  // Initiate OAuth flow
  const initiateOAuth = useCallback(async (service, organizationId) => {
    try {
      setLoading(true);
      setError(null);

      // Validate input
      if (!service || !organizationId) {
        throw new Error('Service and organization ID are required');
      }

      const allowedServices = ['google-sheets', 'google-docs', 'google-drive'];
      if (!allowedServices.includes(service)) {
        throw new Error(`Invalid service. Allowed services: ${allowedServices.join(', ')}`);
      }

      // Generate OAuth URL dengan error handling
      const result = await oauthService.generateAuthUrl(service, organizationId);
      
      if (!result.success) {
        const errorResult = oauthErrorHandler.handleApiError(result, 'Generate OAuth URL');
        setError(errorResult);
        oauthErrorHandler.showErrorNotification(errorResult);
        return errorResult;
      }

      // Redirect to OAuth URL
      window.location.href = result.data.authUrl;
      
      return result;

    } catch (error) {
      const errorResult = oauthErrorHandler.handleOAuthError(error, 'Initiate OAuth');
      setError(errorResult);
      oauthErrorHandler.showErrorNotification(errorResult);
      
      // Update retry count
      setRetryCount(prev => ({
        ...prev,
        [`${service}_initiate`]: (prev[`${service}_initiate`] || 0) + 1
      }));
      
      return errorResult;
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle OAuth callback
  const handleOAuthCallback = useCallback(async (code, state, service, organizationId) => {
    try {
      setLoading(true);
      setError(null);

      const result = await oauthService.handleCallback(code, state, service, organizationId);

      if (result.success) {
        setOauthStatus(prev => ({
          ...prev,
          [service]: {
            status: 'connected',
            expiresAt: result.data.credentialRef?.expires_at,
            credentialId: result.data.credential?.id,
            service: service
          }
        }));
      } else {
        setError(result.error);
      }

      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle OAuth callback from URL
  const handleOAuthCallbackFromUrl = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await oauthService.handleOAuthCallbackFromUrl();

      if (result.success) {
        const service = result.data.service;
        setOauthStatus(prev => ({
          ...prev,
          [service]: {
            status: 'connected',
            expiresAt: result.data.credentialRef?.expires_at,
            credentialId: result.data.credential?.id,
            service: service
          }
        }));
      } else {
        setError(result.error);
      }

      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Test OAuth connection
  const testOAuthConnection = useCallback(async (service, organizationId) => {
    try {
      setLoading(true);
      setError(null);

      const result = await oauthService.testConnection(service, organizationId);

      if (result.success) {
        setOauthStatus(prev => ({
          ...prev,
          [service]: {
            ...prev[service],
            status: 'connected',
            lastTested: new Date().toISOString()
          }
        }));
      } else {
        setError(result.error);
      }

      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Revoke OAuth credential
  const revokeCredential = useCallback(async (service, organizationId) => {
    try {
      setLoading(true);
      setError(null);

      const result = await oauthService.revokeCredential(service, organizationId);

      if (result.success) {
        setOauthStatus(prev => ({
          ...prev,
          [service]: null
        }));
      } else {
        setError(result.error);
      }

      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Check if OAuth callback is in URL
  const checkOAuthCallback = useCallback(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.has('code') || urlParams.has('error');
  }, []);

  // Auto-handle OAuth callback on mount if present in URL
  useEffect(() => {
    if (checkOAuthCallback()) {
      handleOAuthCallbackFromUrl();
    }
  }, [checkOAuthCallback, handleOAuthCallbackFromUrl]);

  // Get error statistics
  const getErrorStatistics = useCallback((context = null) => {
    const statistics = oauthErrorHandler.getErrorStatistics(context);
    setErrorStatistics(statistics);
    return statistics;
  }, []);

  // Clear error statistics
  const clearErrorStatistics = useCallback(() => {
    oauthErrorHandler.clearErrorStatistics();
    setErrorStatistics([]);
  }, []);

  // Retry operation dengan error handling
  const retryOperation = useCallback(async (operation, maxRetries = 3) => {
    try {
      return await oauthErrorHandler.handleRetry(operation, error, maxRetries);
    } catch (errorResult) {
      setError(errorResult);
      oauthErrorHandler.showErrorNotification(errorResult);
      return errorResult;
    }
  }, [error]);

  // Load error statistics on mount
  useEffect(() => {
    getErrorStatistics();
  }, [getErrorStatistics]);

  return {
    // State
    oauthStatus,
    loading,
    error,
    errorStatistics,
    retryCount,

    // Actions
    initiateOAuth,
    handleOAuthCallback,
    handleOAuthCallbackFromUrl,
    testOAuthConnection,
    revokeCredential,
    checkOAuthCallback,

    // Error Handling
    getErrorStatistics,
    clearErrorStatistics,
    retryOperation,

    // Utilities
    setError,
    setOauthStatus
  };
};

/**
 * Hook untuk file management dengan OAuth
 */
export const useOAuthFiles = (service, organizationId) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    pageToken: null,
    hasMore: true
  });

  // Get files
  const getFiles = useCallback(async (pageSize = 100, pageToken = null) => {
    try {
      setLoading(true);
      setError(null);

      const result = await oauthService.getFiles(service, organizationId, pageSize, pageToken);

      if (result.success) {
        const newFiles = result.data.files || [];

        if (pageToken) {
          // Append to existing files
          setFiles(prev => [...prev, ...newFiles]);
        } else {
          // Replace files
          setFiles(newFiles);
        }

        setPagination({
          pageToken: result.data.nextPageToken,
          hasMore: !!result.data.nextPageToken
        });

        return result.data;
      } else {
        setError(result.error);
        throw new Error(result.error);
      }
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [service, organizationId]);

  // Get file details
  const getFileDetails = useCallback(async (fileId) => {
    try {
      setLoading(true);
      setError(null);

      const result = await oauthService.getFileDetails(service, organizationId, fileId);

      if (result.success) {
        return result.data;
      } else {
        setError(result.error);
        throw new Error(result.error);
      }
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [service, organizationId]);

  // Search files
  const searchFiles = useCallback(async (query, pageSize = 100) => {
    try {
      setLoading(true);
      setError(null);

      // For now, we'll filter client-side
      // In the future, this could be a server-side search
      const result = await oauthService.getFiles(service, organizationId, pageSize);

      if (result.success) {
        const allFiles = result.data.files || [];
        const filteredFiles = allFiles.filter(file =>
          file.name.toLowerCase().includes(query.toLowerCase())
        );

        setFiles(filteredFiles);
        setPagination({
          pageToken: null,
          hasMore: false
        });

        return { files: filteredFiles };
      } else {
        setError(result.error);
        throw new Error(result.error);
      }
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [service, organizationId]);

  // Load more files
  const loadMoreFiles = useCallback(async () => {
    if (!pagination.hasMore || loading) return;

    try {
      await getFiles(100, pagination.pageToken);
    } catch (error) {
      // Error is already handled in getFiles
    }
  }, [getFiles, pagination.hasMore, pagination.pageToken, loading]);

  // Refresh files
  const refreshFiles = useCallback(async () => {
    try {
      await getFiles(100, null);
    } catch (error) {
      // Error is already handled in getFiles
    }
  }, [getFiles]);

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

    // Utilities
    setError,
    setFiles
  };
};

/**
 * Hook untuk workflow creation dengan OAuth
 */
export const useOAuthWorkflow = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [workflows, setWorkflows] = useState([]);

  // Create workflow
  const createWorkflow = useCallback(async (service, organizationId, selectedFiles, workflowConfig) => {
    try {
      setLoading(true);
      setError(null);

      const result = await oauthService.createWorkflow(service, organizationId, selectedFiles, workflowConfig);

      if (result.success) {
        setWorkflows(prev => [...prev, ...result.data.workflows]);
        return result.data;
      } else {
        setError(result.error);
        throw new Error(result.error);
      }
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // State
    workflows,
    loading,
    error,

    // Actions
    createWorkflow,

    // Utilities
    setError,
    setWorkflows
  };
};

export default useOAuth;
