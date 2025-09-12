import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PERMISSIONS } from '@/constants/permissions';

/**
 * ProtectedRoute - Route protection with permission-based access control
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Component to render if authorized
 * @param {string} props.permission - Required permission code
 * @param {string[]} props.permissions - Required permissions (any)
 * @param {string[]} props.allPermissions - Required permissions (all)
 * @param {string} props.role - Required role
 * @param {string[]} props.roles - Required roles (any)
 * @param {string} props.redirectTo - Redirect path if unauthorized
 * @param {React.ReactNode} props.fallback - Component to render if unauthorized
 * @param {boolean} props.requireAuth - Require authentication only (default: true)
 */
const ProtectedRoute = ({
  children,
  permission,
  permissions = [],
  allPermissions = [],
  role,
  roles = [],
  redirectTo = '/auth/login',
  fallback = null,
  requireAuth = true
}) => {
  const { user, isAuthenticated, isLoading, hasPermission, hasAnyPermission, hasAllPermissions, isRole } = useAuth();
  const location = useLocation();

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Check authentication requirement
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check single permission
  if (permission && !hasPermission(permission)) {
    if (fallback) return fallback;
    return <Navigate to="/unauthorized" replace />;
  }

  // Check any of the permissions
  if (permissions.length > 0 && !hasAnyPermission(permissions)) {
    if (fallback) return fallback;
    return <Navigate to="/unauthorized" replace />;
  }

  // Check all permissions
  if (allPermissions.length > 0 && !hasAllPermissions(allPermissions)) {
    if (fallback) return fallback;
    return <Navigate to="/unauthorized" replace />;
  }

  // Check single role
  if (role && !isRole(role)) {
    if (fallback) return fallback;
    return <Navigate to="/unauthorized" replace />;
  }

  // Check any of the roles
  if (roles.length > 0 && !roles.some(r => isRole(r))) {
    if (fallback) return fallback;
    return <Navigate to="/unauthorized" replace />;
  }

  // All checks passed, render children
  return <>{children}</>;
};

/**
 * PublicRoute - Route that should only be accessible when NOT authenticated
 * Useful for login, register pages
 */
export const PublicRoute = ({
  children,
  redirectTo = '/dashboard',
  requireGuest = true
}) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect authenticated users
  if (requireGuest && isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

/**
 * AdminRoute - Route protection for admin users only
 */
export const AdminRoute = ({ children, ...props }) => {
  return (
    <ProtectedRoute
      roles={['super_admin', 'org_admin']}
      {...props}
    >
      {children}
    </ProtectedRoute>
  );
};

/**
 * SuperAdminRoute - Route protection for super admin users only
 */
export const SuperAdminRoute = ({ children, ...props }) => {
  return (
    <ProtectedRoute
      role="super_admin"
      {...props}
    >
      {children}
    </ProtectedRoute>
  );
};

/**
 * PermissionRoute - Convenient wrapper for permission-based routes
 */
export const PermissionRoute = ({ children, permissionCode, ...props }) => {
  return (
    <ProtectedRoute
      permission={permissionCode}
      {...props}
    >
      {children}
    </ProtectedRoute>
  );
};

// Specific permission routes for common use cases
export const UserManagementRoute = ({ children, ...props }) => (
  <PermissionRoute permissionCode={PERMISSIONS.USERS.VIEW} {...props}>
    {children}
  </PermissionRoute>
);

export const AgentManagementRoute = ({ children, ...props }) => (
  <PermissionRoute permissionCode={PERMISSIONS.AGENTS.VIEW} {...props}>
    {children}
  </PermissionRoute>
);

export const AnalyticsRoute = ({ children, ...props }) => (
  <PermissionRoute permissionCode={PERMISSIONS.ANALYTICS.VIEW} {...props}>
    {children}
  </PermissionRoute>
);

export const BillingRoute = ({ children, ...props }) => (
  <PermissionRoute permissionCode={PERMISSIONS.BILLING.VIEW} {...props}>
    {children}
  </PermissionRoute>
);

export default ProtectedRoute;
