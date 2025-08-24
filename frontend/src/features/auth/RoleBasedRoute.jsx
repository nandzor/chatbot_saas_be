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
      user
    });

    // Fallback: Super admin can access org_admin routes
    if (requiredRole === 'org_admin' && user?.role === 'super_admin') {
      console.log('✅ Super admin access granted to org_admin routes');
      return children;
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
      user
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

    return <Navigate to={fallbackPath} replace />;
  }

  return children;
};

export default RoleBasedRoute;
