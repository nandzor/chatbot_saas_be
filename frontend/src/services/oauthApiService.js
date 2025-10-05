/**
 * OAuth API Service
 * Service untuk handle OAuth API calls
 */

import { handleApiError } from '../utils/oauthUtils';

/**
 * Call backend POST API untuk Google OAuth callback
 */
export const callGoogleOAuthCallback = async (code, stateData) => {
  try {
    const response = await fetch('/api/auth/google/callback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        code: code,
        state: stateData
      })
    });

    const result = await response.json();

    if (result.success && result.data) {
      return {
        success: true,
        data: result.data
      };
    } else {
      return {
        success: false,
        message: result.message || 'Gagal menghubungkan Google Drive'
      };
    }
  } catch (error) {
    return handleApiError(error, 'Google OAuth Callback');
  }
};

/**
 * Fetch user profile dari backend menggunakan token
 */
export const fetchUserProfile = async (token) => {
  try {
    const response = await fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      }
    });

    if (response.ok) {
      const userResult = await response.json();
      if (userResult.success && userResult.data) {
        return {
          success: true,
          data: userResult.data
        };
      }
    }

    return {
      success: false,
      message: 'Failed to fetch user profile'
    };
  } catch (error) {
    return handleApiError(error, 'User Profile Fetch');
  }
};
