# User Management Service Separation

## Overview
Pemisahan UserManagement dan UserManagementService untuk memastikan tidak ada konflik antara role `org_admin` dan `super_admin`.

## Service Separation

### 1. UserManagementService (Org Admin)
**File:** `frontend/src/services/UserManagementService.jsx`
**API Endpoints:** Organization-scoped
- `GET /api/v1/organizations/{{organization}}/users`
- `POST /api/v1/organizations/{{organization}}/users`
- `GET /api/v1/organizations/{{organization}}/users/{{userId}}`
- `PUT /api/v1/organizations/{{organization}}/users/{{userId}}`
- `DELETE /api/v1/organizations/{{organization}}/users/{{userId}}`

**Usage:** Role `org_admin` - hanya dapat mengelola user dalam organisasinya sendiri

### 2. SuperAdminUserManagementService (Super Admin)
**File:** `frontend/src/services/SuperAdminUserManagementService.jsx`
**API Endpoints:** Global-scoped
- `GET /api/v1/users`
- `POST /api/v1/users`
- `GET /api/v1/users/{{userId}}`
- `PUT /api/v1/users/{{userId}}`
- `DELETE /api/v1/users/{{userId}}`

**Usage:** Role `super_admin` - dapat mengelola semua user di seluruh sistem

## Hook Separation

### 1. useUserManagement (Org Admin)
**File:** `frontend/src/hooks/useUserManagement.js`
**Service:** `UserManagementService`
**Scope:** Organization-scoped

### 2. useSuperAdminUserManagement (Super Admin)
**File:** `frontend/src/hooks/useSuperAdminUserManagement.js`
**Service:** `SuperAdminUserManagementService`
**Scope:** Global-scoped

## Component Separation

### 1. Org Admin User Management
**File:** `frontend/src/features/user-management/UserManagement.jsx`
**Hook:** `useUserManagement`
**Route:** `/dashboard/users`
**Permission:** `users.view`

### 2. Super Admin User Management
**File:** `frontend/src/pages/superadmin/UserManagement.jsx`
**Hook:** `useSuperAdminUserManagement`
**Route:** `/superadmin/users`
**Permission:** `super_admin` role

## Key Differences

| Aspect | Org Admin | Super Admin |
|--------|-----------|-------------|
| **API Scope** | Organization-scoped | Global-scoped |
| **User Access** | Only users in their organization | All users across all organizations |
| **API Endpoints** | `/api/v1/organizations/{org}/users` | `/api/v1/users` |
| **Service** | `UserManagementService` | `SuperAdminUserManagementService` |
| **Hook** | `useUserManagement` | `useSuperAdminUserManagement` |
| **Component** | `features/user-management/UserManagement` | `pages/superadmin/UserManagement` |
| **Route** | `/dashboard/users` | `/superadmin/users` |
| **Permission** | `users.view` | `super_admin` role |

## File Structure

```
frontend/src/
├── services/
│   ├── UserManagementService.jsx              # Org Admin
│   └── SuperAdminUserManagementService.jsx    # Super Admin
├── hooks/
│   ├── useUserManagement.js                   # Org Admin
│   └── useSuperAdminUserManagement.js         # Super Admin
├── features/
│   └── user-management/
│       ├── UserManagement.jsx                 # Org Admin Component
│       ├── UserForm.jsx
│       └── UserDetails.jsx
└── pages/
    └── superadmin/
        ├── UserManagement.jsx                 # Super Admin Component
        ├── ViewUserPermissionsDialog.jsx
        └── UserBulkActions.jsx
```

## Benefits of Separation

1. **No Conflicts:** Org admin dan super admin menggunakan service dan hook yang berbeda
2. **Clear Scope:** API endpoints yang berbeda sesuai dengan level akses
3. **Maintainability:** Mudah untuk maintain dan update masing-masing service
4. **Security:** Org admin tidak dapat mengakses user dari organisasi lain
5. **Scalability:** Mudah untuk menambah fitur khusus untuk masing-masing role

## Usage Examples

### Org Admin Usage
```jsx
import { useUserManagement } from '@/hooks/useUserManagement';

const OrgUserManagement = () => {
  const { users, createUser, updateUser, deleteUser } = useUserManagement();
  // Only manages users within the organization
};
```

### Super Admin Usage
```jsx
import { useSuperAdminUserManagement } from '@/hooks/useSuperAdminUserManagement';

const SuperAdminUserManagement = () => {
  const { users, createUser, updateUser, deleteUser } = useSuperAdminUserManagement();
  // Manages all users across all organizations
};
```

## Migration Notes

- Semua file superadmin telah diupdate untuk menggunakan `SuperAdminUserManagementService`
- Import statements telah diubah dari `UserManagementService` ke `SuperAdminUserManagementService`
- Hook usage telah diubah dari `useUserManagement` ke `useSuperAdminUserManagement`
- Tidak ada breaking changes untuk org admin functionality
