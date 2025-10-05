/**
 * Custom hook untuk handle OAuth callback logic
 * Memisahkan business logic dari UI component
 */

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  OAUTH_FORMATS,
  FALLBACK_USER_DATA,
  storeToken,
  storeUserData,
  logStorageSuccess,
  extractOAuthParams,
  logOAuthDebug,
  determineOAuthFormat,
  createUserData
} from '../utils/oauthUtils';
import { callGoogleOAuthCallback, fetchUserProfile } from '../services/oauthApiService';

export const useOAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Memproses autentikasi Google Drive...');

  // Extract URL parameters using utility function
  const params = extractOAuthParams(searchParams);

  // Handle Google OAuth format (code & state)
  const handleGoogleOAuthFormat = async () => {
    try {
      setStatus('processing');
      setMessage('Memproses autentikasi Google Drive...');

      // Decode state to get organization_id
      const stateData = JSON.parse(atob(params.state));

      // Call backend POST API using service
      const result = await callGoogleOAuthCallback(params.code, stateData);

      if (result.success) {
        setStatus('success');
        setMessage('Google Drive berhasil terhubung!');

        const { user, token: apiToken } = result.data;

        // Store token and user data using utility functions
        storeToken(apiToken);
        const userData = createUserData(user);
        storeUserData(userData);
        logStorageSuccess(apiToken, userData, 'POST API');

        // Redirect after delay
        setTimeout(() => {
          console.log('Redirecting to /dashboard/google-drive');
          navigate('/dashboard/google-drive');
        }, 2000);
      } else {
        setStatus('error');
        setMessage(result.message);
      }
    } catch (apiError) {
      console.error('API Error:', apiError);
      setStatus('error');
      setMessage('Terjadi kesalahan saat memproses autentikasi');
    }
  };

  // Handle backend redirect format (success & token) or Google Drive integration (success only)
  const handleBackendRedirectFormat = async () => {
    setStatus('success');
    setMessage('Google Drive berhasil terhubung!');

    // For Google Drive integration, no token is needed
    if (!params.token) {
      // Just redirect to Google Drive page
      setTimeout(() => {
        console.log('Redirecting to /dashboard/google-drive');
        navigate('/dashboard/google-drive');
      }, 2000);
      return;
    }

    // Store token using utility function (for legacy OAuth)
    storeToken(params.token);

    // Fetch user profile using service
    const userResult = await fetchUserProfile(params.token);

    if (userResult.success) {
      const userData = createUserData(userResult.data);
      storeUserData(userData);
      logStorageSuccess(params.token, userData, 'Legacy');
    } else {
      console.warn('Could not fetch user profile, using fallback data:', userResult.message);
      storeUserData(FALLBACK_USER_DATA);
    }

    // Redirect after delay
    setTimeout(() => {
      console.log('Redirecting to /dashboard/google-drive');
      navigate('/dashboard/google-drive');
    }, 2000);
  };

  // Determine OAuth format and handle accordingly
  const determineOAuthFormatAndHandle = () => {
    const oauthFormat = determineOAuthFormat(params);
    return oauthFormat;
  };

  // Main OAuth callback handler
  const handleOAuthCallback = async () => {
    try {
      logOAuthDebug(params, searchParams);

      // Handle OAuth errors
      if (params.error) {
        setStatus('error');
        setMessage(`Error: ${params.error}`);
        return;
      }

      // Determine OAuth format and handle accordingly
      const oauthFormat = determineOAuthFormatAndHandle();

      switch (oauthFormat) {
        case OAUTH_FORMATS.GOOGLE_OAUTH:
          await handleGoogleOAuthFormat();
          break;
        case OAUTH_FORMATS.BACKEND_REDIRECT:
          await handleBackendRedirectFormat();
          break;
        default:
          setStatus('error');
          setMessage('Parameter OAuth tidak lengkap. Silakan coba lagi dengan mengklik "Connect Google Drive" dari halaman Google Drive.');
      }
    } catch (error) {
      console.error('OAuth Callback Error:', error);
      setStatus('error');
      setMessage('Terjadi kesalahan saat memproses autentikasi');
    }
  };

  // Navigation handlers
  const handleRetry = () => {
    navigate('/dashboard/google-drive');
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  // Initialize OAuth callback
  useEffect(() => {
    handleOAuthCallback();
  }, [searchParams, navigate]);

  return {
    status,
    message,
    handleRetry,
    handleGoToDashboard,
  };
};
