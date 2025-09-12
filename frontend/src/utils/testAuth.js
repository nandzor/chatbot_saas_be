/**
 * Authentication Test Utilities
 * Helper functions to test authentication flow
 */

import { authService } from '@/services/AuthService';
import api from '@/services/api';

export const testAuthentication = async () => {

  // Test 1: Check if user is authenticated
  const isAuthenticated = authService.isAuthenticated();

  // Test 2: Check tokens
  const tokens = authService.getTokens();

  // Test 3: Test API call to /auth/me
  try {
    const response = await api.get('/v1/auth/me');
  } catch (error) {
  }

  // Test 4: Test API call to /users
  try {
    const response = await api.get('/v1/users');
  } catch (error) {
  }

};

export const testRoleManagement = async () => {

  // Test role management API
  try {
    const response = await api.get('/v1/roles');
  } catch (error) {
  }

};

export const testPermissionManagement = async () => {

  // Test permission management API
  try {
    const response = await api.get('/v1/permissions');
  } catch (error) {
  }

};

export const testUserManagement = async () => {

  // Test user management API
  try {
    const response = await api.get('/v1/users');
  } catch (error) {
  }

  // Test user statistics API
  try {
    const response = await api.get('/v1/users/statistics');
  } catch (error) {
  }

};

// Make functions available globally for debugging
if (typeof window !== 'undefined') {
  window.testAuthentication = testAuthentication;
  window.testRoleManagement = testRoleManagement;
  window.testPermissionManagement = testPermissionManagement;
  window.testUserManagement = testUserManagement;
}
