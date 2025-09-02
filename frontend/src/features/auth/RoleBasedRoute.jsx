import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { canAccessSettings } from '@/utils/permissionUtils';

const RoleBasedRoute = ({
  children,
  requiredRole,
  requiredPermission,
  fallbackPath = '/unauthorized'
}) => {
  const { isAuthenticated, isLoading, user, hasPermission, isRole } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (requiredRole && !isRole(requiredRole)) {
    console.log('🚫 Role access denied:', {
      requiredRole,
      userRole: user?.role,
      userRoles: user?.roles,
      isAuthenticated,
      user,
      location: location.pathname
    });

    // Fallback: Super admin can access org_admin routes
    if (requiredRole === 'org_admin' && user?.role === 'super_admin') {
      console.log('✅ Super admin access granted to org_admin routes');
      return children;
    }

    // Additional fallback: Check if user has any of the required roles
    if (user?.roles && Array.isArray(user.roles)) {
      const hasRequiredRole = user.roles.some(role => {
        const roleName = typeof role === 'object' ? role.name : role;
        return roleName === requiredRole;
      });

      if (hasRequiredRole) {
        console.log('✅ User has required role in roles array');
        return children;
      }
    }

    return <Navigate to={fallbackPath} replace />;
  }

  // Check permission-based access
  if (requiredPermission && !hasPermission(requiredPermission)) {
    console.log('🚫 Permission access denied:', {
      requiredPermission,
      userRole: user?.role,
      userPermissions: user?.permissions,
      isAuthenticated,
      user,
      location: location.pathname
    });

    // Fallback: Super admin can access all routes
    if (user?.role === 'super_admin') {
      console.log('✅ Super admin access granted to all routes');
      return children;
    }

    // Fallback: Org admin can access org_admin specific routes
    if (user?.role === 'org_admin' && requiredPermission === 'manage_settings') {
      console.log('✅ Org admin access granted to settings route');
      return children;
    }

    // Use utility function for settings access
    if (requiredPermission === 'manage_settings' && canAccessSettings(user)) {
      console.log('✅ User has settings access via utility function');
      return children;
    }

    // Additional fallback: Check if user has wildcard permission
    if (user?.permissions && user.permissions.includes('*')) {
      console.log('✅ User has wildcard permission');
      return children;
    }

    // Additional fallback: Check role-based permissions
    if (user?.role === 'org_admin') {
      const orgAdminPermissions = [
        'manage_organization',
        'manage_users',
        'manage_agents',
        'manage_chatbots',
        'view_analytics',
        'manage_billing',
        'manage_automations',
        'manage_knowledge_base',
        'manage_settings',
        'roles.view',
        'permissions.view',
        'users.view_all'
      ];

      if (orgAdminPermissions.includes(requiredPermission)) {
        console.log('✅ Org admin has required permission via role');
        return children;
      }
    }

    return <Navigate to={fallbackPath} replace />;
  }

  return children;
};

export default RoleBasedRoute;
