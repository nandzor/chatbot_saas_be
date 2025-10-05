/**
 * OAuth Utility Functions
 * Utility functions untuk OAuth operations
 */

// Constants
export const OAUTH_FORMATS = {
  GOOGLE_OAUTH: 'google_oauth',
  BACKEND_REDIRECT: 'backend_redirect',
};

export const STORAGE_KEYS = {
  JWT_TOKEN: 'jwt_token',
  AUTH_TOKEN: 'auth_token',
  ACCESS_TOKEN: 'access_token',
  CHATBOT_USER: 'chatbot_user',
  AUTH_METHOD: 'auth_method',
};

export const FALLBACK_USER_DATA = {
  id: 'unknown',
  email: 'unknown@example.com',
  name: 'Unknown User',
  avatar: null,
  role: 'customer',
  roles: ['customer'],
  permissions: ['automations.manage'],
  organization_id: 'unknown'
};

/**
 * Store token with all possible keys for compatibility
 */
export const storeToken = (token) => {
  localStorage.setItem(STORAGE_KEYS.JWT_TOKEN, token);
  localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  sessionStorage.setItem('token', token);
};

/**
 * Store user data for AuthContext
 */
export const storeUserData = (userData) => {
  localStorage.setItem(STORAGE_KEYS.CHATBOT_USER, JSON.stringify(userData));
  localStorage.setItem(STORAGE_KEYS.AUTH_METHOD, 'sanctum');
};

/**
 * Log successful storage for debugging
 */
export const logStorageSuccess = (token, userData, format) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`Token and user data stored successfully (${format}):`, {
      tokenLength: token.length,
      jwt_token: localStorage.getItem(STORAGE_KEYS.JWT_TOKEN) ? 'stored' : 'not stored',
      auth_token: localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) ? 'stored' : 'not stored',
      access_token: localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) ? 'stored' : 'not stored',
      chatbot_user: localStorage.getItem(STORAGE_KEYS.CHATBOT_USER) ? 'stored' : 'not stored',
      auth_method: localStorage.getItem(STORAGE_KEYS.AUTH_METHOD),
      userData: userData
    });
  }
};

/**
 * Extract URL parameters from search params
 */
export const extractOAuthParams = (searchParams) => ({
  code: searchParams.get('code'),
  state: searchParams.get('state'),
  success: searchParams.get('success'),
  token: searchParams.get('token'),
  error: searchParams.get('error'),
});

/**
 * Log OAuth debug information
 */
export const logOAuthDebug = (params, searchParams) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('OAuth Callback Debug:', {
      code: params.code ? 'present' : 'missing',
      state: params.state ? 'present' : 'missing',
      success: params.success,
      token: params.token ? 'present' : 'missing',
      error: params.error,
      allParams: Object.fromEntries(searchParams.entries())
    });
  }
};

/**
 * Determine OAuth format based on parameters
 */
export const determineOAuthFormat = (params) => {
  if (params.code && params.state) {
    return OAUTH_FORMATS.GOOGLE_OAUTH;
  } else if (params.success === 'true') {
    // For Google Drive integration, success=true is enough (no token needed)
    return OAUTH_FORMATS.BACKEND_REDIRECT;
  }
  return null;
};

/**
 * Create user data object from API response
 */
export const createUserData = (user) => ({
  id: user.id,
  email: user.email,
  name: user.full_name || user.name, // Use full_name first, fallback to name
  username: user.username, // Add username field
  avatar: user.avatar,
  role: user.role,
  roles: user.roles || [user.role],
  permissions: user.permissions || ['automations.manage'],
  organization_id: user.organization_id
});

/**
 * Handle API errors with proper logging
 */
export const handleApiError = (error, context) => {
  if (process.env.NODE_ENV === 'development') {
    console.error(`${context} Error:`, error);
  }
  return {
    status: 'error',
    message: 'Terjadi kesalahan saat memproses autentikasi'
  };
};
