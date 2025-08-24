import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';

// Constants for role management
const ROLES = {
  SUPERADMIN: 'superadmin',
  ORGANIZATION_ADMIN: 'organization_admin',
  AGENT: 'agent',
  CLIENT: 'client'
};

const PERMISSIONS = {
  // Super Admin permissions
  SUPERADMIN: [
    'manage_system',
    'manage_all_organizations',
    'view_all_data',
    'manage_platform_settings',
    'access_admin_panel'
  ],

  // Organization Admin permissions
  ORGANIZATION_ADMIN: [
    'manage_organization',
    'manage_users',
    'manage_agents',
    'manage_chatbots',
    'view_analytics',
    'manage_billing',
    'manage_automations',
    'manage_knowledge_base',
    'manage_settings'
  ],

  // Agent permissions
  AGENT: [
    'handle_chats',
    'view_conversations',
    'update_profile',
    'access_knowledge_base',
    'create_tickets'
  ],

  // Client permissions
  CLIENT: [
    'view_dashboard',
    'manage_profile',
    'access_support',
    'view_billing'
  ]
};

// Context creation
const RoleContext = createContext();

// Custom hook with proper error handling
export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    console.warn('useRole must be used within a RoleProvider');
    // Return fallback context for graceful degradation
    return {
      currentRole: null,
      setRole: () => {},
      hasPermission: () => false,
      isRole: () => false,
      getRolePermissions: () => [],
      getAvailableRoles: () => [],
      switchRole: () => Promise.reject(new Error('Role context not available'))
    };
  }
  return context;
};

// Main provider component
export const RoleProvider = ({ children }) => {
  const [currentRole, setCurrentRole] = useState(null);
  const [roleHistory, setRoleHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Set role with validation and history tracking
  const setRole = useCallback((role) => {
    try {
      if (!role || !Object.values(ROLES).includes(role)) {
        throw new Error(`Invalid role: ${role}`);
      }

      // Add to history
      setRoleHistory(prev => [...prev, { role: currentRole, timestamp: new Date().toISOString() }]);

      setCurrentRole(role);
      console.log('✅ Role set to:', role);

      // Store in localStorage for persistence
      try {
        localStorage.setItem('chatbot_current_role', role);
      } catch (storageError) {
        console.warn('⚠️ Failed to save role to localStorage:', storageError);
      }

    } catch (error) {
      console.error('❌ Error setting role:', error);
      throw error;
    }
  }, [currentRole]);

  // Check if user has specific permission
  const hasPermission = useCallback((permission) => {
    try {
      if (!currentRole || !permission) return false;

      const rolePermissions = PERMISSIONS[currentRole.toUpperCase()] || [];
      return rolePermissions.includes(permission) || rolePermissions.includes('*');
    } catch (error) {
      console.error('❌ Error checking permission:', error);
      return false;
    }
  }, [currentRole]);

  // Check if user has specific role
  const isRole = useCallback((role) => {
    try {
      return currentRole === role;
    } catch (error) {
      console.error('❌ Error checking role:', error);
      return false;
    }
  }, [currentRole]);

  // Get all permissions for current role
  const getRolePermissions = useCallback(() => {
    try {
      if (!currentRole) return [];
      return PERMISSIONS[currentRole.toUpperCase()] || [];
    } catch (error) {
      console.error('❌ Error getting role permissions:', error);
      return [];
    }
  }, [currentRole]);

  // Get available roles for current user
  const getAvailableRoles = useCallback(() => {
    try {
      // In a real app, this would check user's allowed roles
      // For now, return all roles
      return Object.values(ROLES);
    } catch (error) {
      console.error('❌ Error getting available roles:', error);
      return [];
    }
  }, []);

  // Switch role with validation
  const switchRole = useCallback(async (newRole) => {
    setIsLoading(true);

    try {
      // Validate new role
      if (!Object.values(ROLES).includes(newRole)) {
        throw new Error(`Invalid role: ${newRole}`);
      }

      // Simulate role switch delay
      await new Promise(resolve => setTimeout(resolve, 500));

      setRole(newRole);

      console.log('✅ Role switched to:', newRole);
      return { success: true, role: newRole };

    } catch (error) {
      console.error('❌ Error switching role:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [setRole]);

  // Initialize role from localStorage on mount
  useEffect(() => {
    try {
      const savedRole = localStorage.getItem('chatbot_current_role');
      if (savedRole && Object.values(ROLES).includes(savedRole)) {
        setCurrentRole(savedRole);
        console.log('✅ Role restored from localStorage:', savedRole);
      }
    } catch (error) {
      console.error('❌ Error restoring role from localStorage:', error);
      localStorage.removeItem('chatbot_current_role');
    }
  }, []);

  // Context value with memoization
  const value = useMemo(() => ({
    currentRole,
    setRole,
    hasPermission,
    isRole,
    getRolePermissions,
    getAvailableRoles,
    switchRole,
    isLoading,
    roleHistory,
    ROLES,
    PERMISSIONS
  }), [
    currentRole,
    setRole,
    hasPermission,
    isRole,
    getRolePermissions,
    getAvailableRoles,
    switchRole,
    isLoading,
    roleHistory
  ]);

  // Development logging
  if (import.meta.env.DEV) {
    console.log('👑 RoleContext state:', {
      currentRole,
      permissions: getRolePermissions(),
      isLoading
    });
  }

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  );
};
