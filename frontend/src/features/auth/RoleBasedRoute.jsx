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
    console.log('Role access denied:', {
      requiredRole,
      userRole: user?.role,
      userRoles: user?.roles,
      isAuthenticated,
      user,
      location: location.pathname
    });

    // Fallback: Super admin can access org_admin routes
    if (requiredRole === 'org_admin' && user?.role === 'super_admin') {
      return children;
    }

    // Additional fallback: Check if user has any of the required roles
    if (user?.roles && Array.isArray(user.roles)) {
      const hasRequiredRole = user.roles.some(role => {
        const roleName = typeof role === 'object' ? role.name : role;
        return roleName === requiredRole;
      });

      if (hasRequiredRole) {
        return children;
      }
    }

    // Additional fallback: Check role aliases
    if (requiredRole === 'org_admin') {
      const orgAdminRoles = ['org_admin', 'organization_admin', 'admin'];
      if (orgAdminRoles.includes(user?.role)) {
        return children;
      }
    }

    return <Navigate to={fallbackPath} replace />;
  }

  // Check permission-based access
  if (requiredPermission && !hasPermission(requiredPermission)) {
    console.log('Permission access denied:', {
      requiredPermission,
      userRole: user?.role,
      userPermissions: user?.permissions,
      isAuthenticated,
      user,
      location: location.pathname
    });

    // Fallback: Super admin can access all routes
    if (user?.role === 'super_admin') {
      return children;
    }

    // Fallback: Org admin can access org_admin specific routes
    if (user?.role === 'org_admin' && requiredPermission === 'manage_settings') {
      return children;
    }

    // Use utility function for settings access
    if (requiredPermission === 'manage_settings' && canAccessSettings(user)) {
      return children;
    }

    // Additional fallback: Check if user has wildcard permission
    if (user?.permissions && user.permissions.includes('*')) {
      return children;
    }

    // Additional fallback: Check role-based permissions
    const orgAdminRoles = ['org_admin', 'organization_admin', 'admin'];
    if (orgAdminRoles.includes(user?.role)) {
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
        'users.view_all',
        'knowledge.view',
        'knowledge_articles.view',
        'knowledge_articles.create',
        'knowledge_articles.update',
        'knowledge_articles.delete',
        'knowledge_articles.publish'
      ];

      if (orgAdminPermissions.includes(requiredPermission)) {
        return children;
      }
    }

    return <Navigate to={fallbackPath} replace />;
  }

  return children;
};

export default RoleBasedRoute;
