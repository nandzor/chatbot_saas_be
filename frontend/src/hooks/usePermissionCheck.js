import { useAuth } from '@/contexts/AuthContext';

/**
 * Custom hook for permission checking
 * Provides convenient methods for checking user permissions
 */
export const usePermissionCheck = () => {
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
      'users.create', 'users.update', 'users.delete',
      'roles.create', 'roles.update', 'roles.delete',
      'permissions.create', 'permissions.update', 'permissions.delete'
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

    // Role checking
    isAdmin,
    isSuperAdmin,
    canManageAny
  };
};

export default usePermissionCheck;
