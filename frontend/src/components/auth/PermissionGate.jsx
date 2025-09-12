import { usePermissions } from '@/hooks/usePermissions';

/**
 * PermissionGate - Conditional rendering based on permissions
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to render if permission granted
 * @param {string} props.permission - Required permission code
 * @param {string[]} props.permissions - Required permissions (any)
 * @param {string[]} props.allPermissions - Required permissions (all)
 * @param {string} props.role - Required role
 * @param {string[]} props.roles - Required roles (any)
 * @param {React.ReactNode} props.fallback - Content to render if permission denied
 * @param {boolean} props.requireAuth - Require authentication (default: true)
 * @param {boolean} props.invert - Invert the permission check (show when permission NOT granted)
 */
const PermissionGate = ({
  children,
  permission,
  permissions = [],
  allPermissions = [],
  role,
  roles = [],
  fallback = null,
  requireAuth = true,
  invert = false
}) => {
  const { user, can, canAny, canAll } = usePermissions();

  // Check authentication requirement
  if (requireAuth && !user) {
    return fallback;
  }

  let hasAccess = true;

  // Check single permission
  if (permission) {
    hasAccess = hasAccess && can(permission);
  }

  // Check any of the permissions
  if (permissions.length > 0) {
    hasAccess = hasAccess && canAny(permissions);
  }

  // Check all permissions
  if (allPermissions.length > 0) {
    hasAccess = hasAccess && canAll(allPermissions);
  }

  // Check single role
  if (role) {
    hasAccess = hasAccess && (user?.role === role);
  }

  // Check any of the roles
  if (roles.length > 0) {
    hasAccess = hasAccess && roles.includes(user?.role);
  }

  // Apply inversion if needed
  if (invert) {
    hasAccess = !hasAccess;
  }

  // Render based on access
  return hasAccess ? <>{children}</> : fallback;
};

/**
 * AdminGate - Show content only to admin users
 */
export const AdminGate = ({ children, fallback = null }) => (
  <PermissionGate roles={['super_admin', 'org_admin']} fallback={fallback}>
    {children}
  </PermissionGate>
);

/**
 * SuperAdminGate - Show content only to super admin users
 */
export const SuperAdminGate = ({ children, fallback = null }) => (
  <PermissionGate role="super_admin" fallback={fallback}>
    {children}
  </PermissionGate>
);

/**
 * AgentGate - Show content only to agent users
 */
export const AgentGate = ({ children, fallback = null }) => (
  <PermissionGate role="agent" fallback={fallback}>
    {children}
  </PermissionGate>
);

/**
 * CustomerGate - Show content only to customer users
 */
export const CustomerGate = ({ children, fallback = null }) => (
  <PermissionGate role="customer" fallback={fallback}>
    {children}
  </PermissionGate>
);

/**
 * ConditionalWrapper - Conditionally wrap children with a wrapper component
 */
export const ConditionalWrapper = ({
  condition,
  wrapper,
  children,
  fallback = null
}) => {
  if (condition) {
    return wrapper(children);
  }

  return fallback || children;
};

/**
 * PermissionButton - Button that's only visible with proper permissions
 */
export const PermissionButton = ({
  permission,
  permissions,
  allPermissions,
  role,
  roles,
  children,
  disabled = false,
  className = '',
  onClick,
  ...props
}) => {
  const { can, canAny, canAll, user } = usePermissions();

  let hasAccess = true;

  // Check permissions
  if (permission) hasAccess = hasAccess && can(permission);
  if (permissions?.length > 0) hasAccess = hasAccess && canAny(permissions);
  if (allPermissions?.length > 0) hasAccess = hasAccess && canAll(allPermissions);
  if (role) hasAccess = hasAccess && (user?.role === role);
  if (roles?.length > 0) hasAccess = hasAccess && roles.includes(user?.role);

  if (!hasAccess) {
    return null;
  }

  return (
    <button
      className={className}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

/**
 * PermissionLink - Link that's only visible with proper permissions
 */
export const PermissionLink = ({
  permission,
  permissions,
  allPermissions,
  role,
  roles,
  children,
  className = '',
  to,
  ...props
}) => {
  const { can, canAny, canAll, user } = usePermissions();

  let hasAccess = true;

  // Check permissions
  if (permission) hasAccess = hasAccess && can(permission);
  if (permissions?.length > 0) hasAccess = hasAccess && canAny(permissions);
  if (allPermissions?.length > 0) hasAccess = hasAccess && canAll(allPermissions);
  if (role) hasAccess = hasAccess && (user?.role === role);
  if (roles?.length > 0) hasAccess = hasAccess && roles.includes(user?.role);

  if (!hasAccess) {
    return null;
  }

  return (
    <a
      className={className}
      href={to}
      {...props}
    >
      {children}
    </a>
  );
};

export default PermissionGate;
