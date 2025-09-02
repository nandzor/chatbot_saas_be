/**
 * Authentication Test Utilities
 * Helper functions to test authentication flow
 */

import { authService } from '@/services/AuthService';
import api from '@/services/api';

export const testAuthentication = async () => {
  console.log('🧪 Testing Authentication Flow...');
  console.log('================================');

  // Test 1: Check if user is authenticated
  console.log('1️⃣ Checking authentication status...');
  const isAuthenticated = authService.isAuthenticated();
  console.log('   Is Authenticated:', isAuthenticated);

  // Test 2: Check tokens
  console.log('2️⃣ Checking tokens...');
  const tokens = authService.getTokens();
  console.log('   Tokens:', tokens);

  // Test 3: Test API call to /auth/me
  console.log('3️⃣ Testing API call to /auth/me...');
  try {
    const response = await api.get('/v1/auth/me');
    console.log('   ✅ API call successful:', response.data);
  } catch (error) {
    console.log('   ❌ API call failed:', error.response?.status, error.response?.data);
  }

  // Test 4: Test API call to /users
  console.log('4️⃣ Testing API call to /users...');
  try {
    const response = await api.get('/v1/users');
    console.log('   ✅ Users API call successful:', response.data);
  } catch (error) {
    console.log('   ❌ Users API call failed:', error.response?.status, error.response?.data);
  }

  console.log('================================');
};

export const testRoleManagement = async () => {
  console.log('🧪 Testing Role Management Access...');
  console.log('================================');

  // Test role management API
  console.log('1️⃣ Testing role management API...');
  try {
    const response = await api.get('/v1/roles');
    console.log('   ✅ Roles API call successful:', response.data);
  } catch (error) {
    console.log('   ❌ Roles API call failed:', error.response?.status, error.response?.data);
  }

  console.log('================================');
};

export const testPermissionManagement = async () => {
  console.log('🧪 Testing Permission Management Access...');
  console.log('================================');

  // Test permission management API
  console.log('1️⃣ Testing permission management API...');
  try {
    const response = await api.get('/v1/permissions');
    console.log('   ✅ Permissions API call successful:', response.data);
  } catch (error) {
    console.log('   ❌ Permissions API call failed:', error.response?.status, error.response?.data);
  }

  console.log('================================');
};

export const testUserManagement = async () => {
  console.log('🧪 Testing User Management Access...');
  console.log('================================');

  // Test user management API
  console.log('1️⃣ Testing user management API...');
  try {
    const response = await api.get('/v1/users');
    console.log('   ✅ Users API call successful:', response.data);
  } catch (error) {
    console.log('   ❌ Users API call failed:', error.response?.status, error.response?.data);
  }

  // Test user statistics API
  console.log('2️⃣ Testing user statistics API...');
  try {
    const response = await api.get('/v1/users/statistics');
    console.log('   ✅ User statistics API call successful:', response.data);
  } catch (error) {
    console.log('   ❌ User statistics API call failed:', error.response?.status, error.response?.data);
  }

  console.log('================================');
};

// Make functions available globally for debugging
if (typeof window !== 'undefined') {
  window.testAuthentication = testAuthentication;
  window.testRoleManagement = testRoleManagement;
  window.testPermissionManagement = testPermissionManagement;
  window.testUserManagement = testUserManagement;
}
