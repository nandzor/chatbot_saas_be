import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

// Constants for better maintainability
const STORAGE_KEYS = {
  USER: 'chatbot_user',
  SESSION: 'chatbot_session',
  THEME: 'chatbot_theme'
};

const USER_ROLES = {
  SUPERADMIN: 'superadmin',
  ORGANIZATION_ADMIN: 'organization_admin',
  AGENT: 'agent'
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

// Avatar utility with fallback
const getUserAvatarData = (email, name) => {
  try {
    const { getUserAvatarData: avatarFn } = safeImport('@/utils/avatarUtils', {});
    if (avatarFn) {
      return avatarFn(email, name);
    }
  } catch {
    // Fallback avatar generation
  }

  // Default fallback
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
  const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  return {
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128`,
    initials,
    color: randomColor
  };
};

// Test users data
export const testUsers = [
  {
    id: 1,
    username: 'superadmin',
    password: 'super123',
    name: 'Super Administrator',
    email: 'superadmin@system.com',
    role: USER_ROLES.SUPERADMIN,
    avatar: getUserAvatarData('superadmin@system.com', 'Super Administrator').avatar,
    permissions: ['*'], // All permissions
    description: 'Full system access across all organizations',
    organizationId: null,
    organizationName: null
  },
  {
    id: 2,
    username: 'orgadmin',
    password: 'admin123',
    name: 'Ahmad Rahman',
    email: 'ahmad.rahman@company.com',
    role: USER_ROLES.ORGANIZATION_ADMIN,
    organizationId: 'org-001',
    organizationName: 'PT Teknologi Nusantara',
    avatar: getUserAvatarData('ahmad.rahman@company.com', 'Ahmad Rahman').avatar,
    permissions: ['handle_chats', 'manage_users', 'manage_agents', 'manage_settings', 'view_analytics', 'manage_billing', 'manage_automations'],
    description: 'Organization administrator with full org management access'
  },
  {
    id: 3,
    username: 'agent1',
    password: 'agent123',
    name: 'Sari Dewi',
    email: 'sari.dewi@company.com',
    role: USER_ROLES.AGENT,
    organizationId: 'org-001',
    organizationName: 'PT Teknologi Nusantara',
    avatar: getUserAvatarData('sari.dewi@company.com', 'Sari Dewi').avatar,
    specialization: 'Customer Support',
    permissions: ['handle_chats', 'view_conversations', 'update_profile'],
    description: 'Customer support agent with chat handling capabilities'
  }
];

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
      isRole: () => false,
      testUsers: []
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

  // Login function with comprehensive error handling
  const login = useCallback(async (username, password) => {
    setIsLoading(true);
    setError(null);

    try {
      // Input validation
      if (!username || !password) {
        throw new Error('Username and password are required');
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Find user in test users
      const foundUser = testUsers.find(
        u => u.username === username && u.password === password
      );

      if (foundUser) {
        // Remove password from user object for security
        const { password: _, ...userWithoutPassword } = foundUser;

        // Add session metadata
        const userWithSession = {
          ...userWithoutPassword,
          lastLogin: new Date().toISOString(),
          sessionId: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        };

        setUser(userWithSession);
        setIsAuthenticated(true);

        // Save to localStorage with error handling
        try {
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userWithSession));
          localStorage.setItem(STORAGE_KEYS.SESSION, userWithSession.sessionId);
        } catch (storageError) {
          console.warn('⚠️ Failed to save to localStorage:', storageError);
          // Continue without storage - user is still logged in
        }

        toaster.addToast(`Welcome back, ${userWithSession.name}!`, 'success');
        console.log('✅ Login successful:', userWithSession.username);

        return { success: true, user: userWithSession };
      } else {
        throw new Error('Invalid username or password');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      setError(error.message || 'Login failed');
      toaster.addToast(error.message || 'Login failed', 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toaster]);

  // Logout function
  const logout = useCallback(() => {
    try {
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

  // Check authentication status
  const checkAuth = useCallback(async () => {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
      const sessionId = localStorage.getItem(STORAGE_KEYS.SESSION);

      if (savedUser && sessionId) {
        const userData = JSON.parse(savedUser);

        // Basic session validation
        if (userData.sessionId === sessionId) {
          setUser(userData);
          setIsAuthenticated(true);
          return true;
        } else {
          // Session mismatch, clear everything
          console.warn('⚠️ Session mismatch detected, clearing auth');
          logout();
          return false;
        }
      }
      return false;
    } catch (error) {
      console.error('❌ Check auth error:', error);
      logout();
      return false;
    }
  }, [logout]);

  // Permission checking
  const hasPermission = useCallback((permission) => {
    if (!user || !user.permissions) return false;
    return user.permissions.includes('*') || user.permissions.includes(permission);
  }, [user]);

  // Role checking
  const isRole = useCallback((role) => {
    return user?.role === role;
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
    isRole,
    testUsers
  }), [user, isLoading, isAuthenticated, error, login, logout, updateUser, checkAuth, hasPermission, isRole]);

  // Development logging
  if (import.meta.env.DEV) {
    console.log('🔐 AuthContext state:', {
      user: user?.username,
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
