/**
 * Authentication Debug Utilities
 * Helper functions to debug authentication issues
 */

export const debugAuth = () => {
  console.log('🔐 Authentication Debug Info:');
  console.log('================================');

  // Check localStorage tokens
  const jwtToken = localStorage.getItem('jwt_token');
  const sanctumToken = localStorage.getItem('sanctum_token');
  const refreshToken = localStorage.getItem('refresh_token');
  const userData = localStorage.getItem('chatbot_user');

  console.log('📱 Local Storage:');
  console.log('  JWT Token:', jwtToken ? `${jwtToken.substring(0, 20)}...` : 'Not found');
  console.log('  Sanctum Token:', sanctumToken ? `${sanctumToken.substring(0, 20)}...` : 'Not found');
  console.log('  Refresh Token:', refreshToken ? `${refreshToken.substring(0, 20)}...` : 'Not found');
  console.log('  User Data:', userData ? 'Found' : 'Not found');

  // Check token expiration
  const tokenExpiresAt = localStorage.getItem('token_expires_at');
  const refreshExpiresAt = localStorage.getItem('refresh_expires_at');

  console.log('⏰ Token Expiration:');
  console.log('  JWT Expires:', tokenExpiresAt ? new Date(tokenExpiresAt).toLocaleString() : 'Not set');
  console.log('  Refresh Expires:', refreshExpiresAt ? new Date(refreshExpiresAt).toLocaleString() : 'Not set');
  console.log('  JWT Valid:', tokenExpiresAt ? new Date(tokenExpiresAt) > new Date() : 'Unknown');

  // Parse user data
  if (userData) {
    try {
      const user = JSON.parse(userData);
      console.log('👤 User Info:');
      console.log('  ID:', user.id);
      console.log('  Name:', user.name || user.full_name);
      console.log('  Email:', user.email);
      console.log('  Username:', user.username);
      console.log('  Role:', user.role);
      console.log('  Roles:', user.roles);
      console.log('  Permissions:', user.permissions);
    } catch (error) {
      console.error('❌ Error parsing user data:', error);
    }
  }

  // Check auth method
  const authMethod = localStorage.getItem('auth_method');
  const unifiedAuth = localStorage.getItem('unified_auth_enabled');

  console.log('🔧 Auth Configuration:');
  console.log('  Auth Method:', authMethod || 'Not set');
  console.log('  Unified Auth:', unifiedAuth || 'Not set');

  console.log('================================');
};

export const clearAuthDebug = () => {
  console.log('🧹 Clearing all authentication data...');

  const authKeys = [
    'jwt_token', 'refresh_token', 'sanctum_token',
    'token_expires_at', 'refresh_expires_at', 'auth_method',
    'unified_auth_enabled', 'last_auth_update', 'chatbot_user',
    'chatbot_session'
  ];

  authKeys.forEach(key => {
    localStorage.removeItem(key);
    console.log(`  Removed: ${key}`);
  });

  console.log('✅ Authentication data cleared');
};

export const testApiAuth = async () => {
  console.log('🧪 Testing API Authentication...');

  try {
    const response = await fetch('http://localhost:9000/api/v1/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    console.log('📡 API Response:');
    console.log('  Status:', response.status);
    console.log('  Status Text:', response.statusText);

    if (response.ok) {
      const data = await response.json();
      console.log('  Data:', data);
    } else {
      const errorText = await response.text();
      console.log('  Error:', errorText);
    }
  } catch (error) {
    console.error('❌ API Test Error:', error);
  }
};

// Make functions available globally for debugging
if (typeof window !== 'undefined') {
  window.debugAuth = debugAuth;
  window.clearAuthDebug = clearAuthDebug;
  window.testApiAuth = testApiAuth;
}
