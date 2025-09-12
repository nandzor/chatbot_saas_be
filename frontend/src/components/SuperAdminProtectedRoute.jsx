import { Navigate, useLocation } from 'react-router-dom';
import { useSuperAdminAuth } from '@/contexts/SuperAdminAuthContext';

/**
 * SuperAdminProtectedRoute - Protects routes that require SuperAdmin authentication
 */
export const SuperAdminProtectedRoute = ({ children, requiredPermission = null, requiredRole = null }) => {
    const { isAuthenticated, isLoading, isSuperAdmin, hasPermission, hasRole } = useSuperAdminAuth();
    const location = useLocation();

    // Show loading while checking authentication
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/superadmin/login" state={{ from: location }} replace />;
    }

    // Check if user is SuperAdmin (SuperAdmin bypasses all permission checks)
    if (isSuperAdmin()) {
        return children;
    }

    // Check specific permission if required
    if (requiredPermission && !hasPermission(requiredPermission)) {
        return <Navigate to="/superadmin/unauthorized" replace />;
    }

    // Check specific role if required
    if (requiredRole && !hasRole(requiredRole)) {
        return <Navigate to="/superadmin/unauthorized" replace />;
    }

    // User is authenticated and has required permissions
    return children;
};

/**
 * SuperAdminPublicRoute - For routes that should only be accessible when NOT authenticated
 */
export const SuperAdminPublicRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useSuperAdminAuth();
    const location = useLocation();

    // Show loading while checking authentication
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Redirect to dashboard if already authenticated
    if (isAuthenticated) {
        const from = location.state?.from?.pathname || '/superadmin/dashboard';
        return <Navigate to={from} replace />;
    }

    // User is not authenticated, show the public route
    return children;
};

/**
 * SuperAdminRoleProtectedRoute - Protects routes based on specific roles
 */
export const SuperAdminRoleProtectedRoute = ({ children, roles = [] }) => {
    const { isAuthenticated, isLoading, isSuperAdmin, hasRole } = useSuperAdminAuth();
    const location = useLocation();

    // Show loading while checking authentication
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/superadmin/login" state={{ from: location }} replace />;
    }

    // SuperAdmin bypasses all role checks
    if (isSuperAdmin()) {
        return children;
    }

    // Check if user has any of the required roles
    const hasRequiredRole = roles.some(role => hasRole(role));
    if (!hasRequiredRole) {
        return <Navigate to="/superadmin/unauthorized" replace />;
    }

    // User has required role
    return children;
};

/**
 * SuperAdminPermissionProtectedRoute - Protects routes based on specific permissions
 */
export const SuperAdminPermissionProtectedRoute = ({ children, permissions = [] }) => {
    const { isAuthenticated, isLoading, isSuperAdmin, hasPermission } = useSuperAdminAuth();
    const location = useLocation();

    // Show loading while checking authentication
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/superadmin/login" state={{ from: location }} replace />;
    }

    // SuperAdmin bypasses all permission checks
    if (isSuperAdmin()) {
        return children;
    }

    // Check if user has all required permissions
    const hasRequiredPermissions = permissions.every(permission => hasPermission(permission));
    if (!hasRequiredPermissions) {
        return <Navigate to="/superadmin/unauthorized" replace />;
    }

    // User has required permissions
    return children;
};

export default SuperAdminProtectedRoute;
