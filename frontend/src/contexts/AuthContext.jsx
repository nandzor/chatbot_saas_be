import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { authService } from '@/services/AuthService';

// Constants for better maintainability
const STORAGE_KEYS = {
  USER: 'chatbot_user',
  SESSION: 'chatbot_session',
  THEME: 'chatbot_theme'
};



// Safe import utilities with fallbacks
const safeImport = (importPath, fallback) => {
  try {
    const module = require(importPath);
    return module;
  } catch {
    return fallback;
  }
};



// Context creation
const AuthContext = createContext();

// Custom hook with proper error handling
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    console.warn('useAuth must be used within an AuthProvider');
    // Return fallback context for graceful degradation
    return {
      user: null,
      isLoading: false,
      isAuthenticated: false,
      login: () => Promise.reject(new Error('Auth context not available')),
      logout: () => {},
      updateUser: () => {},
      checkAuth: () => Promise.resolve(false),
      hasPermission: () => false,
      isRole: () => false
    };
  }
  return context;
};

// Main provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);

  // Safe toaster usage - memoized to prevent infinite loops
  const toaster = useMemo(() => {
    try {
      const { useToaster: useToasterHook } = safeImport('@/components/ui/Toaster', {});
      if (useToasterHook) {
        return useToasterHook();
      }
    } catch {
      // Fallback toaster
    }

    return {
      addToast: (message, type = 'info') => {
        console.log(`[${type.toUpperCase()}] ${message}`);
        // In production, you might want to use a different notification system
      }
    };
  }, []); // Empty dependency array to prevent recreation

  // Check for existing session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
        if (savedUser) {
          const userData = JSON.parse(savedUser);

          // Validate user data structure
          if (userData && userData.id && userData.username && userData.role) {
            setUser(userData);
            setIsAuthenticated(true);
            console.log('✅ User restored from localStorage:', userData.username);
          } else {
            console.warn('⚠️ Invalid user data structure, clearing storage');
            localStorage.removeItem(STORAGE_KEYS.USER);
          }
        }
      } catch (error) {
        console.error('❌ Error parsing saved user data:', error);
        localStorage.removeItem(STORAGE_KEYS.USER);
        setError('Failed to restore user session');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function with unified auth support
  const login = useCallback(async (usernameOrEmail, password) => {
    setIsLoading(true);
    setError(null);

    try {
      // Input validation
      if (!usernameOrEmail || !password) {
        throw new Error('Username/email and password are required');
      }

      // Prepare credentials for unified auth
      const credentials = {
        password,
        ...(usernameOrEmail.includes('@') ? { email: usernameOrEmail } : { username: usernameOrEmail })
      };

      // Call unified auth service
      const response = await authService.login(credentials);

      if (response.success) {
        const userData = response.data.user;

                // Add session metadata
        const userWithSession = {
          ...userData,
          lastLogin: new Date().toISOString(),
          authMethod: response.data.auth_method || 'jwt',
          tokens: {
            access_token: response.data.access_token,
            refresh_token: response.data.refresh_token,
            sanctum_token: response.data.sanctum_token,
          },
          sessionId: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        };

        // Update state
        setUser(userWithSession);
        setIsAuthenticated(true);
        setError(null);

        // Save to localStorage
        try {
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userWithSession));
          localStorage.setItem(STORAGE_KEYS.SESSION, userWithSession.sessionId);
        } catch (storageError) {
          console.warn('⚠️ Failed to save to localStorage:', storageError);
          // Continue without storage - user is still logged in
        }

        toaster.addToast(`Welcome back, ${userWithSession.full_name || userWithSession.name}!`, 'success');
        console.log('✅ Login successful:', userWithSession.username || userWithSession.email);

        return { success: true, user: userWithSession };
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('❌ Login error:', error);

      // Handle unified auth errors
      if (error.response?.data) {
        const authError = authService.handleAuthError(error);
        setError(authError.message);
        toaster.addToast(authError.message, 'error');
      } else {
        setError(error.message || 'Login failed');
        toaster.addToast(error.message || 'Login failed', 'error');
      }

      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toaster]);

  // Logout function with unified auth support
  const logout = useCallback(async () => {
    try {
      // Call unified auth logout
      await authService.logout();

      setUser(null);
      setIsAuthenticated(false);
      setError(null);

      // Clear all auth-related storage
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.SESSION);
      sessionStorage.clear();

      toaster.addToast('Logged out successfully', 'info');
      console.log('✅ User logged out');
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Even if API call fails, clear local state
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.SESSION);
      sessionStorage.clear();
    }
  }, [toaster]);

  // Update user function
  const updateUser = useCallback((updates) => {
    try {
      if (!user) {
        throw new Error('No user to update');
      }

      const updatedUser = { ...user, ...updates, updatedAt: new Date().toISOString() };
      setUser(updatedUser);

      // Update localStorage
      try {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      } catch (storageError) {
        console.warn('⚠️ Failed to update localStorage:', storageError);
      }

      toaster.addToast('Profile updated successfully', 'success');
      console.log('✅ User updated:', updates);
    } catch (error) {
      console.error('❌ Update user error:', error);
      toaster.addToast('Failed to update profile', 'error');
    }
  }, [user, toaster]);

  // Check authentication status with unified auth
  const checkAuth = useCallback(async () => {
    try {
      // Check if user has valid tokens
      if (!authService.isAuthenticated()) {
        console.log('❌ No valid tokens found');
        return false;
      }

      // Try to get current user from API
      try {
        const userData = await authService.getCurrentUser();

        if (userData) {
          // Update user data with latest info
          const updatedUser = {
            ...userData,
            lastLogin: new Date().toISOString(),
            authMethod: localStorage.getItem('auth_method') || 'jwt',
          };

          setUser(updatedUser);
          setIsAuthenticated(true);
          setError(null);

          // Update localStorage
          try {
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
          } catch (storageError) {
            console.warn('⚠️ Failed to update localStorage:', storageError);
          }

          console.log('✅ Authentication validated:', updatedUser.username || updatedUser.email);
          return true;
        }
      } catch (apiError) {
        console.warn('⚠️ API validation failed, checking local storage');

        // Fallback to local storage validation
        const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          setIsAuthenticated(true);
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('❌ Check auth error:', error);
      logout();
      return false;
    }
  }, [logout]);

    // Permission checking - integrated with backend permissions (using codes)
  const hasPermission = useCallback((permissionCode) => {
    if (!user) return false;

    // Check if user has super admin role (all permissions)
    if (user.role === 'super_admin') return true;

    // Check permissions array from backend (codes)
    if (user.permissions && Array.isArray(user.permissions)) {
      // Super admin wildcard
      if (user.permissions.includes('*')) return true;
      return user.permissions.includes(permissionCode);
    }

    return false;
  }, [user]);

  // Multiple permission check (any)
  const hasAnyPermission = useCallback((permissionCodes) => {
    if (!user || !Array.isArray(permissionCodes)) return false;

    // Check if user has super admin role (all permissions)
    if (user.role === 'super_admin') return true;

    // Check permissions array from backend
    if (user.permissions && Array.isArray(user.permissions)) {
      // Super admin wildcard
      if (user.permissions.includes('*')) return true;
      return permissionCodes.some(code => user.permissions.includes(code));
    }

    return false;
  }, [user, hasPermission]);

  // All permissions check
  const hasAllPermissions = useCallback((permissionCodes) => {
    if (!user || !Array.isArray(permissionCodes)) return false;

    // Check if user has super admin role (all permissions)
    if (user.role === 'super_admin') return true;

    // Check permissions array from backend
    if (user.permissions && Array.isArray(user.permissions)) {
      // Super admin wildcard
      if (user.permissions.includes('*')) return true;
      return permissionCodes.every(code => user.permissions.includes(code));
    }

    return false;
  }, [user, hasPermission]);

  // Role checking - integrated with backend roles
  const isRole = useCallback((role) => {
    if (!user) return false;

    console.log('🔍 Checking role:', { required: role, userRole: user.role, userRoles: user.roles });

    // Check direct role assignment
    if (user.role === role) {
      console.log('✅ Direct role match:', { required: role, userRole: user.role });
      return true;
    }

    // Role mapping - using exact backend keys
    const roleEquivalents = {
      'org_admin': ['org_admin'],
      'super_admin': ['super_admin'],
      'agent': ['agent'],
      'customer': ['customer']
    };

    // Check if user role is equivalent to required role
    const equivalents = roleEquivalents[role] || [role];
    if (equivalents.includes(user.role)) {
      console.log('✅ Role equivalent match:', { required: role, userRole: user.role, equivalents });
      return true;
    }

    // Check roles array from backend
    if (user.roles && Array.isArray(user.roles)) {
      const hasRole = user.roles.some(userRole => {
        const roleName = typeof userRole === 'object' ? userRole.name : userRole;
        const match = equivalents.includes(roleName);
        if (match) {
          console.log('✅ Role in array match:', { required: role, found: roleName });
        }
        return match;
      });
      if (!hasRole) {
        console.log('❌ No role match found in roles array:', { required: role, userRoles: user.roles });
      }
      return hasRole;
    }

    console.log('❌ Role check failed:', { required: role, userRole: user.role, userRoles: user.roles });
    return false;
  }, [user]);

  // Get user permissions from backend
  const getUserPermissions = useCallback(() => {
    if (!user) return [];

    // Super admin has all permissions
    if (user.role === 'super_admin') return ['*'];

    // Collect permissions from direct assignment
    let permissions = user.permissions || [];

    // Collect permissions from roles
    if (user.roles && Array.isArray(user.roles)) {
      user.roles.forEach(role => {
        if (role.permissions && Array.isArray(role.permissions)) {
          permissions = [...permissions, ...role.permissions];
        }
      });
    }

    // Remove duplicates
    return [...new Set(permissions)];
  }, [user]);

  // Get user roles from backend
  const getUserRoles = useCallback(() => {
    if (!user) return [];

    let roles = [user.role]; // Primary role

    // Add additional roles
    if (user.roles && Array.isArray(user.roles)) {
      const additionalRoles = user.roles.map(role => role.name || role);
      roles = [...roles, ...additionalRoles];
    }

    // Remove duplicates
    return [...new Set(roles)];
  }, [user]);

  // Context value with memoization
  const value = useMemo(() => ({
    user,
    isLoading,
    isAuthenticated,
    error,
    login,
    logout,
    updateUser,
    checkAuth,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isRole,
    getUserPermissions,
    getUserRoles
  }), [user, isLoading, isAuthenticated, error, login, logout, updateUser, checkAuth, hasPermission, hasAnyPermission, hasAllPermissions, isRole, getUserPermissions, getUserRoles]);

  // Development logging
  if (import.meta.env.DEV) {
    console.log('🔐 AuthContext state:', {
      user: user?.username,
      userRole: user?.role,
      userRoles: user?.roles,
      isAuthenticated,
      isLoading,
      error
    });
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
