import { useAuth } from '@/contexts/AuthContext';
import { PERMISSIONS, PERMISSION_GROUPS, hasPermission, hasAnyPermission, hasAllPermissions } from '@/constants/permissions';

/**
 * Custom hook for permission checking
 * Provides convenient methods for checking user permissions
 */
export const usePermissions = () => {
  const { user, hasPermission: contextHasPermission, hasAnyPermission: contextHasAnyPermission, hasAllPermissions: contextHasAllPermissions } = useAuth();

  // Get user permissions array
  const getUserPermissions = () => {
    if (!user || !user.permissions) return [];
    return user.permissions;
  };

  // Check if user has specific permission
  const can = (permissionCode) => {
    return contextHasPermission(permissionCode);
  };

  // Check if user has any of the permissions
  const canAny = (permissionCodes) => {
    return contextHasAnyPermission(permissionCodes);
  };

  // Check if user has all permissions
  const canAll = (permissionCodes) => {
    return contextHasAllPermissions(permissionCodes);
  };

  // Check if user cannot do something
  const cannot = (permissionCode) => {
    return !can(permissionCode);
  };

  // Specific permission checkers for common use cases
  const permissions = {
    // User Management
    users: {
      view: () => can(PERMISSIONS.USERS.VIEW),
      create: () => can(PERMISSIONS.USERS.CREATE),
      update: () => can(PERMISSIONS.USERS.UPDATE),
      delete: () => can(PERMISSIONS.USERS.DELETE),
      manage: () => canAny([
        PERMISSIONS.USERS.CREATE,
        PERMISSIONS.USERS.UPDATE,
        PERMISSIONS.USERS.DELETE
      ])
    },

    // Agent Management
    agents: {
      view: () => can(PERMISSIONS.AGENTS.VIEW),
      create: () => can(PERMISSIONS.AGENTS.CREATE),
      update: () => can(PERMISSIONS.AGENTS.UPDATE),
      delete: () => can(PERMISSIONS.AGENTS.DELETE),
      execute: () => can(PERMISSIONS.AGENTS.EXECUTE),
      manage: () => canAny([
        PERMISSIONS.AGENTS.CREATE,
        PERMISSIONS.AGENTS.UPDATE,
        PERMISSIONS.AGENTS.DELETE
      ])
    },

    // Customer Management
    customers: {
      view: () => can(PERMISSIONS.CUSTOMERS.VIEW),
      create: () => can(PERMISSIONS.CUSTOMERS.CREATE),
      update: () => can(PERMISSIONS.CUSTOMERS.UPDATE),
      delete: () => can(PERMISSIONS.CUSTOMERS.DELETE),
      manage: () => canAny([
        PERMISSIONS.CUSTOMERS.CREATE,
        PERMISSIONS.CUSTOMERS.UPDATE,
        PERMISSIONS.CUSTOMERS.DELETE
      ])
    },

    // Chat Sessions
    chatSessions: {
      view: () => can(PERMISSIONS.CHAT_SESSIONS.VIEW),
      create: () => can(PERMISSIONS.CHAT_SESSIONS.CREATE),
      update: () => can(PERMISSIONS.CHAT_SESSIONS.UPDATE),
      delete: () => can(PERMISSIONS.CHAT_SESSIONS.DELETE),
      manage: () => canAny([
        PERMISSIONS.CHAT_SESSIONS.CREATE,
        PERMISSIONS.CHAT_SESSIONS.UPDATE,
        PERMISSIONS.CHAT_SESSIONS.DELETE
      ])
    },

    // Knowledge Management
    knowledge: {
      view: () => can(PERMISSIONS.KNOWLEDGE.VIEW),
      create: () => can(PERMISSIONS.KNOWLEDGE.CREATE),
      update: () => can(PERMISSIONS.KNOWLEDGE.UPDATE),
      delete: () => can(PERMISSIONS.KNOWLEDGE.DELETE),
      publish: () => can(PERMISSIONS.KNOWLEDGE.PUBLISH),
      manage: () => canAny([
        PERMISSIONS.KNOWLEDGE.CREATE,
        PERMISSIONS.KNOWLEDGE.UPDATE,
        PERMISSIONS.KNOWLEDGE.DELETE
      ])
    },

    // Analytics
    analytics: {
      view: () => can(PERMISSIONS.ANALYTICS.VIEW),
      export: () => can(PERMISSIONS.ANALYTICS.EXPORT)
    },

    // Billing
    billing: {
      view: () => can(PERMISSIONS.BILLING.VIEW),
      manage: () => can(PERMISSIONS.BILLING.MANAGE)
    },

    // API Management
    apiKeys: {
      view: () => can(PERMISSIONS.API_KEYS.VIEW),
      create: () => can(PERMISSIONS.API_KEYS.CREATE),
      update: () => can(PERMISSIONS.API_KEYS.UPDATE),
      delete: () => can(PERMISSIONS.API_KEYS.DELETE),
      manage: () => canAny([
        PERMISSIONS.API_KEYS.CREATE,
        PERMISSIONS.API_KEYS.UPDATE,
        PERMISSIONS.API_KEYS.DELETE
      ])
    },

    // Workflows
    workflows: {
      view: () => can(PERMISSIONS.WORKFLOWS.VIEW),
      create: () => can(PERMISSIONS.WORKFLOWS.CREATE),
      update: () => can(PERMISSIONS.WORKFLOWS.UPDATE),
      delete: () => can(PERMISSIONS.WORKFLOWS.DELETE),
      execute: () => can(PERMISSIONS.WORKFLOWS.EXECUTE),
      manage: () => canAny([
        PERMISSIONS.WORKFLOWS.CREATE,
        PERMISSIONS.WORKFLOWS.UPDATE,
        PERMISSIONS.WORKFLOWS.DELETE
      ])
    },

    // System Administration
    system: {
      viewOrganizations: () => can(PERMISSIONS.ORGANIZATIONS.VIEW),
      manageOrganizations: () => canAny([
        PERMISSIONS.ORGANIZATIONS.CREATE,
        PERMISSIONS.ORGANIZATIONS.UPDATE,
        PERMISSIONS.ORGANIZATIONS.DELETE
      ]),
      viewRoles: () => can(PERMISSIONS.ROLES.VIEW),
      manageRoles: () => canAny([
        PERMISSIONS.ROLES.CREATE,
        PERMISSIONS.ROLES.UPDATE,
        PERMISSIONS.ROLES.DELETE
      ]),
      viewPermissions: () => can(PERMISSIONS.PERMISSIONS.VIEW),
      managePermissions: () => canAny([
        PERMISSIONS.PERMISSIONS.CREATE,
        PERMISSIONS.PERMISSIONS.UPDATE,
        PERMISSIONS.PERMISSIONS.DELETE
      ]),
      viewLogs: () => can(PERMISSIONS.SYSTEM_LOGS.VIEW)
    }
  };

  // Check if user has admin privileges
  const isAdmin = () => {
    return user?.role === 'super_admin' || user?.role === 'org_admin';
  };

  // Check if user is super admin
  const isSuperAdmin = () => {
    return user?.role === 'super_admin';
  };

  // Check if user has management permissions for any resource
  const canManageAny = () => {
    return canAny([
      ...PERMISSION_GROUPS.USER_MANAGEMENT,
      ...PERMISSION_GROUPS.AGENT_MANAGEMENT,
      ...PERMISSION_GROUPS.CONTENT_MANAGEMENT
    ]);
  };

  return {
    // User data
    user,
    getUserPermissions,

    // Basic permission checking
    can,
    cannot,
    canAny,
    canAll,

    // Specific permission objects
    permissions,

    // Role checking
    isAdmin,
    isSuperAdmin,
    canManageAny,

    // Constants for direct access
    PERMISSIONS,
    PERMISSION_GROUPS
  };
};

export default usePermissions;
