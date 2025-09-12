/**
 * Authentication Debug Utilities
 * Helper functions to debug authentication issues
 */

export const debugAuth = () => {

  // Check localStorage tokens
  const jwtToken = localStorage.getItem('jwt_token');
  const sanctumToken = localStorage.getItem('sanctum_token');
  const refreshToken = localStorage.getItem('refresh_token');
  const userData = localStorage.getItem('chatbot_user');


  // Check token expiration
  const tokenExpiresAt = localStorage.getItem('token_expires_at');
  const refreshExpiresAt = localStorage.getItem('refresh_expires_at');


  // Parse user data
  if (userData) {
    try {
      const user = JSON.parse(userData);
    } catch (error) {
    }
  }

  // Check auth method
  const authMethod = localStorage.getItem('auth_method');
  const unifiedAuth = localStorage.getItem('unified_auth_enabled');


};

export const clearAuthDebug = () => {

  const authKeys = [
    'jwt_token', 'refresh_token', 'sanctum_token',
    'token_expires_at', 'refresh_expires_at', 'auth_method',
    'unified_auth_enabled', 'last_auth_update', 'chatbot_user',
    'chatbot_session'
  ];

  authKeys.forEach(key => {
    localStorage.removeItem(key);
  });

};

export const testApiAuth = async () => {

  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/v1/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });


    if (response.ok) {
      const data = await response.json();
    } else {
      const errorText = await response.text();
    }
  } catch (error) {
  }
};

// Make functions available globally for debugging
if (typeof window !== 'undefined') {
  window.debugAuth = debugAuth;
  window.clearAuthDebug = clearAuthDebug;
  window.testApiAuth = testApiAuth;
}
