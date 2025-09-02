# Permission System Documentation

## Overview
Sistem permission yang robust dan fleksibel untuk mengelola akses user berdasarkan role dan permission yang spesifik.

## Components

### 1. Permission Constants (`constants/permissions.js`)
Berisi definisi semua permission codes dan permission groups yang tersedia dalam sistem.

#### Permission Groups
- **USER_MANAGEMENT**: Permissions untuk manajemen user
- **AGENT_MANAGEMENT**: Permissions untuk manajemen agent
- **CONTENT_MANAGEMENT**: Permissions untuk manajemen konten
- **ORGANIZATION_ADMIN**: Permissions khusus untuk organization admin
- **CHAT_MANAGEMENT**: Permissions untuk manajemen chat
- **AUTOMATION_MANAGEMENT**: Permissions untuk manajemen automation

#### Role-Based Permissions
- **SUPER_ADMIN**: Semua permissions (`*`)
- **ORG_ADMIN**: Permissions untuk organization management
- **AGENT**: Permissions untuk agent operations
- **CUSTOMER**: Permissions untuk customer access

### 2. Permission Utils (`utils/permissionUtils.js`)
Utility functions untuk permission checking yang dapat digunakan di seluruh aplikasi.

#### Core Functions
- `hasPermission(user, permission)`: Check specific permission
- `hasAnyPermission(user, permissions)`: Check if user has any of the permissions
- `hasAllPermissions(user, permissions)`: Check if user has all permissions
- `hasRole(user, role)`: Check specific role

#### Specialized Functions
- `canAccessSettings(user)`: Check if user can access settings
- `canManageOrganization(user)`: Check if user can manage organization
- `canManageUsers(user)`: Check if user can manage users

### 3. AuthContext Integration
AuthContext menggunakan utility functions untuk permission checking yang konsisten.

## Usage Examples

### Basic Permission Check
```jsx
import { useAuth } from '@/contexts/AuthContext';

const MyComponent = () => {
  const { hasPermission } = useAuth();
  
  if (hasPermission('manage_settings')) {
    return <SettingsPanel />;
  }
  
  return <AccessDenied />;
};
```

### Using Utility Functions
```jsx
import { canAccessSettings } from '@/utils/permissionUtils';

const SettingsRoute = ({ user }) => {
  if (canAccessSettings(user)) {
    return <Settings />;
  }
  
  return <Navigate to="/unauthorized" />;
};
```

### Role-Based Access
```jsx
import { useAuth } from '@/contexts/AuthContext';

const AdminPanel = () => {
  const { isRole } = useAuth();
  
  if (isRole('org_admin') || isRole('super_admin')) {
    return <AdminContent />;
  }
  
  return <AccessDenied />;
};
```

## Permission Hierarchy

### Super Admin
- **Access**: Semua routes dan features
- **Permissions**: Wildcard (`*`)

### Organization Admin
- **Access**: Organization-specific routes
- **Key Permissions**:
  - `manage_organization`
  - `manage_users`
  - `manage_agents`
  - `manage_settings`
  - `view_analytics`
  - `manage_billing`

### Agent
- **Access**: Agent-specific routes
- **Key Permissions**:
  - `handle_chats`
  - `view_conversations`
  - `access_knowledge_base`

## Route Protection

### Using RoleBasedRoute
```jsx
<Route
  path="/dashboard/settings"
  element={
    <RoleBasedRoute requiredPermission="manage_settings">
      <Settings />
    </RoleBasedRoute>
  }
/>
```

### Using ProtectedRoute
```jsx
<ProtectedRoute
  requiredPermissions={['manage_settings', 'settings.view']}
  fallback={<AccessDenied />}
>
  <Settings />
</ProtectedRoute>
```

## Testing

### Running Tests
```bash
npm test -- permissionUtils.test.js
```

### Test Coverage
Tests mencakup:
- Permission checking untuk semua roles
- Role validation
- Specialized permission functions
- Edge cases dan error handling

## Best Practices

### 1. Always Use Permission Constants
```jsx
// ✅ Good
import { PERMISSIONS } from '@/constants/permissions';
hasPermission(PERMISSIONS.SETTINGS.MANAGE);

// ❌ Bad
hasPermission('manage_settings');
```

### 2. Use Utility Functions for Complex Checks
```jsx
// ✅ Good
if (canAccessSettings(user)) { ... }

// ❌ Bad
if (hasPermission('manage_settings') || hasRole('super_admin')) { ... }
```

### 3. Implement Fallback Permissions
```jsx
// ✅ Good - Multiple permission checks
if (hasPermission('manage_settings') || 
    hasPermission('settings.manage') || 
    hasRole('org_admin')) {
  return <Settings />;
}
```

### 4. Log Permission Checks in Development
```jsx
if (import.meta.env.DEV) {
  console.log('🔍 Permission check:', { 
    required: permission, 
    user: user?.username, 
    result: hasPermission(permission) 
  });
}
```

## Troubleshooting

### Common Issues

#### 1. Permission Denied for org_admin
**Problem**: org_admin tidak bisa akses settings
**Solution**: Pastikan permission `manage_settings` ada di `ROLE_PERMISSIONS.ORG_ADMIN`

#### 2. Role Not Recognized
**Problem**: Role checking tidak bekerja
**Solution**: Gunakan `hasRole()` utility function yang sudah di-test

#### 3. Permission Inconsistency
**Problem**: Permission berbeda antara frontend dan backend
**Solution**: Gunakan permission codes yang sama dengan backend

### Debug Mode
Aktifkan debug logging di development:
```jsx
// Di AuthContext
console.log('🔍 Permission check:', { 
  required: permissionCode, 
  userRole: user?.role, 
  userPermissions: user?.permissions 
});
```

## Migration Guide

### From Old Permission System
1. Replace direct permission checks with utility functions
2. Update permission constants to use new structure
3. Use `RoleBasedRoute` for route protection
4. Implement comprehensive testing

### Adding New Permissions
1. Add permission code to `PERMISSIONS` object
2. Add to appropriate permission groups
3. Update role permissions if needed
4. Add tests for new permission
5. Update documentation

## Security Considerations

### Frontend vs Backend
- Frontend permission checking hanya untuk UX
- Backend validation tetap wajib
- Never trust frontend permissions alone

### Permission Escalation
- Super admin permissions tidak bisa di-override
- Role-based fallbacks aman dan predictable
- Audit trail untuk permission changes

### Testing Security
- Unit tests untuk permission logic
- Integration tests untuk route protection
- E2E tests untuk user flows
