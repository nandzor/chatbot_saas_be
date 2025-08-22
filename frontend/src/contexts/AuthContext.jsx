import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/AuthService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Initialize authentication state
   */
  useEffect(() => {
    initializeAuth();
  }, []);

  /**
   * Initialize authentication on app start
   */
  const initializeAuth = async () => {
    try {
      setIsLoading(true);

      // Check if user is authenticated
      if (authService.isAuthenticated()) {
        // Try to get current user
        try {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        } catch (error) {
          console.error('Failed to get current user:', error);
          // Clear invalid tokens
          await authService.logout();
        }
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Login user
   */
  const login = async (email, password, remember = false) => {
    try {
      setIsLoading(true);

      const response = await authService.login({
        email,
        password,
        remember,
      });

      if (response.success && response.data.user) {
        setUser(response.data.user);
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Clear user state even if API call fails
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Refresh user data
   */
  const refreshUser = async () => {
    try {
      if (authService.isAuthenticated()) {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      // If refresh fails, user might be logged out
      setUser(null);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user && authService.isAuthenticated(),
    isLoading,
    login,
    logout,
    refreshUser,
    authService,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to use authentication context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * Hook to check if user is authenticated
 */
export const useIsAuthenticated = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
};

/**
 * Hook to get current user
 */
export const useCurrentUser = () => {
  const { user } = useAuth();
  return user;
};
