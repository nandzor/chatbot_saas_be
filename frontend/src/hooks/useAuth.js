import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '@/api/authService';
import { ROLES, ROUTES } from '@/config/constants';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const storedUser = authService.getStoredUser();
          if (storedUser) {
            setUser(storedUser);
            setIsAuthenticated(true);
          } else {
            // Try to get fresh user data from API
            const result = await authService.getCurrentUser();
            if (result.success) {
              setUser(result.user);
              setIsAuthenticated(true);
            } else {
              // Clear invalid auth data
              await authService.logout();
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        await authService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = useCallback(async (credentials) => {
    setIsLoading(true);
    try {
      const result = await authService.login(credentials);
      
      if (result.success) {
        setUser(result.user);
        setIsAuthenticated(true);
        
        // Redirect based on role
        const redirectPath = getRedirectPath(result.user.role);
        navigate(redirectPath);
        
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  // Logout function
  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      navigate(ROUTES.LOGIN);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  // Register function
  const register = useCallback(async (userData) => {
    setIsLoading(true);
    try {
      const result = await authService.register(userData);
      return result;
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, error: 'Registration failed' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update profile function
  const updateProfile = useCallback(async (userData) => {
    try {
      const result = await authService.updateProfile(userData);
      if (result.success) {
        setUser(result.user);
      }
      return result;
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: 'Profile update failed' };
    }
  }, []);

  // Check if user has specific role
  const isRole = useCallback((role) => {
    return user?.role === role;
  }, [user]);

  // Check if user has specific permission
  const hasPermission = useCallback((permission) => {
    if (!user || !user.permissions) return false;
    return user.permissions.includes('*') || user.permissions.includes(permission);
  }, [user]);

  // Check if user has any of the specified permissions
  const hasAnyPermission = useCallback((permissions) => {
    if (!user || !user.permissions) return false;
    if (user.permissions.includes('*')) return true;
    return permissions.some(permission => user.permissions.includes(permission));
  }, [user]);

  // Check if user has all of the specified permissions
  const hasAllPermissions = useCallback((permissions) => {
    if (!user || !user.permissions) return false;
    if (user.permissions.includes('*')) return true;
    return permissions.every(permission => user.permissions.includes(permission));
  }, [user]);

  // Get redirect path based on user role
  const getRedirectPath = useCallback((role) => {
    switch (role) {
      case ROLES.SUPERADMIN:
        return ROUTES.SUPERADMIN;
      case ROLES.ORGANIZATION_ADMIN:
        return ROUTES.DASHBOARD;
      case ROLES.AGENT:
        return ROUTES.AGENT;
      default:
        return ROUTES.LOGIN;
    }
  }, []);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
    updateProfile,
    isRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getRedirectPath
  };
};
