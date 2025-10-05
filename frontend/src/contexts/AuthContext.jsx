import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { authService } from '@/services/AuthService';
import { hasPermission as checkPermission, hasRole as checkRole } from '@/utils/permissionUtils';

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

  // Get current location to avoid API calls on login page
  const location = useLocation();
  const isLoginPage = location.pathname === '/auth/login' || location.pathname === '/login';


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
        // In production, you might want to use a different notification system
      }
    };
  }, []); // Empty dependency array to prevent recreation

  // Check for existing session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Don't make API calls on login page
        if (isLoginPage) {
          setIsLoading(false);
          return;
        }

        // First check if we have valid tokens
        const hasValidTokens = authService.isAuthenticated();
        if (hasValidTokens) {
          // Try to validate with API
          try {
            const userData = await authService.getCurrentUser();
            if (userData) {
              setUser(userData);
              setIsAuthenticated(true);
              setError(null);
            } else {
              throw new Error('No user data from API');
            }
          } catch (apiError) {
            // Check if it's a token expired or unauthorized error
            if (apiError.response?.status === 401) {// Clear auth data and redirect to login
              authService.clearTokens();
              setUser(null);
              setIsAuthenticated(false);
              setError('Session expired, please login again');

              // Redirect to login if not already there
              if (window.location.pathname !== '/auth/login') {
                window.location.href = '/auth/login';
              }
              return;
            }

            // Fallback to local storage for other errors
            const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
            if (savedUser) {
              const userData = JSON.parse(savedUser);
              if (userData && userData.id && userData.role) {
                setUser(userData);
                setIsAuthenticated(true);
              } else {
                throw new Error('Invalid user data in storage');
              }
            } else {
              throw new Error('No user data in storage');
            }
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('⚠️ Error initializing auth:', error);
        localStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem(STORAGE_KEYS.SESSION);
        setUser(null);
        setIsAuthenticated(false);
        setError('Failed to restore user session');

        // Redirect to login if not already there and not on login page
        if (!isLoginPage && window.location.pathname !== '/auth/login') {
          window.location.href = '/auth/login';
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [isLoginPage]);

  // Login function with unified auth support
  const login = useCallback(async (usernameOrEmail, password) => {
    console.log('🔐 AuthContext: Starting login process');
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

      console.log('🔐 AuthContext: Calling authService.login with credentials:', { ...credentials, password: '[HIDDEN]' });

      // Call unified auth service
      const response = await authService.login(credentials);

      console.log('🔐 AuthContext: Received response from authService:', response);

      if (response.success) {
        const userData = response.data.user;

        // Normalize user data to ensure consistency
        const normalizedUserData = {
          id: userData.id,
          email: userData.email,
          name: userData.full_name || userData.name,
          username: userData.username,
          avatar: userData.avatar,
          role: userData.role,
          roles: userData.roles || [userData.role],
          permissions: userData.permissions || ['automations.manage'],
          organization_id: userData.organization_id
        };

        // Add session metadata
        const userWithSession = {
          ...normalizedUserData,
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

        return { success: true, user: userWithSession };
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.log('🔐 AuthContext: Login error caught:', error);

      // Handle unified auth errors
      if (error.response?.data) {
        const authError = authService.handleAuthError(error);
        console.log('🔐 AuthContext: Auth error handled:', authError);
        setError(authError.message);
        toaster.addToast(authError.message, 'error');
      } else {
        console.log('🔐 AuthContext: Generic error:', error.message);
        setError(error.message || 'Login failed');
        toaster.addToast(error.message || 'Login failed', 'error');
      }

      throw error;
    } finally {
      console.log('🔐 AuthContext: Setting isLoading to false');
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
    } catch (error) {
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
    } catch (error) {
      toaster.addToast('Failed to update profile', 'error');
    }
  }, [user, toaster]);

  // Check authentication status with unified auth
  const checkAuth = useCallback(async () => {
    try {
      // Check if user has valid tokens
      if (!authService.isAuthenticated()) {
        setUser(null);
        setIsAuthenticated(false);
        return false;
      }

      // Try to get current user from API
      try {
        const userData = await authService.getCurrentUser();

        if (userData) {
          // Normalize user data to ensure consistency
          const normalizedUserData = {
            id: userData.id,
            email: userData.email,
            name: userData.full_name || userData.name,
            username: userData.username,
            avatar: userData.avatar,
            role: userData.role,
            roles: userData.roles || [userData.role],
            permissions: userData.permissions || ['automations.manage'],
            organization_id: userData.organization_id
          };

          // Update user data with latest info
          const updatedUser = {
            ...normalizedUserData,
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

          return true;
        }
      } catch (apiError) {
        console.warn('⚠️ API validation failed, checking local storage');

        // Check if it's a token expired error
        if (apiError.response?.status === 401) {
          console.log('🔒 Token expired during checkAuth, redirecting to login');
          // Clear auth data and redirect to login
          localStorage.removeItem(STORAGE_KEYS.USER);
          localStorage.removeItem(STORAGE_KEYS.SESSION);
          setUser(null);
          setIsAuthenticated(false);
          setError('Session expired, please login again');

          // Redirect to login if not already there
          if (window.location.pathname !== '/auth/login') {
            window.location.href = '/auth/login';
          }
          return false;
        }

        // Fallback to local storage validation for other errors
        const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          setIsAuthenticated(true);
          return true;
        }
      }

      // If we get here, authentication failed
      setUser(null);
      setIsAuthenticated(false);
      return false;
    } catch (error) {
      console.error('⚠️ Error checking auth:', error);
      logout();
      return false;
    }
  }, [logout]);

    // Permission checking - integrated with backend permissions (using codes)
  const hasPermission = useCallback((permissionCode) => {
    if (!user) return false;

    // Debug permission checking in development
    if (import.meta.env.DEV) {
      console.log('Checking permission:', {
        required: permissionCode,
        userRole: user.role,
        userPermissions: user.permissions
      });
    }

    // Use utility function for permission checking
    const hasPermission = checkPermission(user, permissionCode);

    return hasPermission;
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


    // Use utility function for role checking
    const hasRole = checkRole(user, role);

    return hasRole;
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
  }), [user, isLoading, isAuthenticated, error]); // Only include state variables, not functions

  // Development logging
  if (import.meta.env.DEV) {
    console.log('Auth context state:', {
      user: user?.username || user?.name,
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

export default AuthProvider;
