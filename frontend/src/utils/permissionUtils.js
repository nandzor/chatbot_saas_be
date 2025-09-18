import { PERMISSIONS, ROLE_PERMISSIONS } from '@/constants/permissions';

/**
 * Utility functions for permission checking
 */

/**
 * Check if user has specific permission
 * @param {Object} user - User object with role and permissions
 * @param {string} permission - Permission code to check
 * @returns {boolean} - True if user has permission
 */
export const hasPermission = (user, permission) => {
  if (!user) return false;

  // Super admin has all permissions
  if (user.role === 'super_admin') return true;

  // Check if user has wildcard permission
  if (user.permissions && user.permissions.includes('*')) return true;

  // Check direct permission
  if (user.permissions && user.permissions.includes(permission)) return true;

  // Check role-based permissions
  const rolePermissions = ROLE_PERMISSIONS[user.role?.toUpperCase()];
  if (rolePermissions && rolePermissions.includes(permission)) return true;

  // Check role-based permissions with fallback
  if (user.role === 'org_admin') {
    const orgAdminPermissions = [
      'manage_organization',
      'manage_users',
      'users.view',
      'users.create',
      'users.update',
      'users.delete',
      'manage_agents',
      'manage_chatbots',
      'view_analytics',
      'manage_billing',
      'manage_automations',
      'manage_knowledge_base',
      'manage_settings'
    ];

    return orgAdminPermissions.includes(permission);
  }

  return false;
};

/**
 * Check if user has any of the specified permissions
 * @param {Object} user - User object
 * @param {Array} permissions - Array of permission codes
 * @returns {boolean} - True if user has any of the permissions
 */
export const hasAnyPermission = (user, permissions) => {
  if (!user || !Array.isArray(permissions)) return false;
  return permissions.some(permission => hasPermission(user, permission));
};

/**
 * Check if user has all of the specified permissions
 * @param {Object} user - User object
 * @param {Array} permissions - Array of permission codes
 * @returns {boolean} - True if user has all permissions
 */
export const hasAllPermissions = (user, permissions) => {
  if (!user || !Array.isArray(permissions)) return false;
  return permissions.every(permission => hasPermission(user, permission));
};

/**
 * Check if user has specific role
 * @param {Object} user - User object
 * @param {string} role - Role to check
 * @returns {boolean} - True if user has role
 */
export const hasRole = (user, role) => {
  if (!user) return false;

  // Check direct role
  if (user.role === role) return true;

  // Check roles array
  if (user.roles && Array.isArray(user.roles)) {
    return user.roles.some(userRole => {
      const roleName = typeof userRole === 'object' ? userRole.name : userRole;
      return roleName === role;
    });
  }

  // Role mapping
  const roleEquivalents = {
    'org_admin': ['organization_admin', 'org_admin'],
    'super_admin': ['superadmin', 'super_admin'],
    'agent': ['agent'],
    'customer': ['customer', 'client']
  };

  const equivalents = roleEquivalents[role] || [role];
  return equivalents.includes(user.role);
};

/**
 * Get all permissions for a specific role
 * @param {string} role - Role name
 * @returns {Array} - Array of permission codes
 */
export const getRolePermissions = (role) => {
  const roleKey = role?.toUpperCase();
  return ROLE_PERMISSIONS[roleKey] || [];
};

/**
 * Check if user can access settings
 * @param {Object} user - User object
 * @returns {boolean} - True if user can access settings
 */
export const canAccessSettings = (user) => {
  return hasPermission(user, 'manage_settings') ||
         hasPermission(user, 'settings.manage') ||
         hasRole(user, 'super_admin') ||
         hasRole(user, 'org_admin');
};

/**
 * Check if user can manage organization
 * @param {Object} user - User object
 * @returns {boolean} - True if user can manage organization
 */
export const canManageOrganization = (user) => {
  return hasPermission(user, 'manage_organization') ||
         hasPermission(user, 'organization.manage') ||
         hasRole(user, 'super_admin') ||
         hasRole(user, 'org_admin');
};

/**
 * Check if user can manage users
 * @param {Object} user - User object
 * @returns {boolean} - True if user can manage users
 */
export const canManageUsers = (user) => {
  return hasPermission(user, 'manage_users') ||
         hasPermission(user, 'users.manage') ||
         hasRole(user, 'super_admin') ||
         hasRole(user, 'org_admin');
};

export default {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  hasRole,
  getRolePermissions,
  canAccessSettings,
  canManageOrganization,
  canManageUsers
};
