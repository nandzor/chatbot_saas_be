# User Management Integration

## Overview
Implementasi User Management untuk role `org_admin` yang terintegrasi dengan backend API.

## API Endpoints
- `GET /api/v1/organizations/{{organization}}/users` - List users
- `POST /api/v1/organizations/{{organization}}/users` - Create user
- `GET /api/v1/organizations/{{organization}}/users/{{userId}}` - Get user details
- `PUT /api/v1/organizations/{{organization}}/users/{{userId}}` - Update user
- `DELETE /api/v1/organizations/{{organization}}/users/{{userId}}` - Delete user

## Components

### 1. UserManagementService (`/services/UserManagementService.jsx`)
Service layer yang menangani semua API calls untuk user management.

**Key Methods:**
- `getUsers(params)` - Get list of users with pagination and filters
- `createUser(userData)` - Create new user
- `updateUser(userId, userData)` - Update existing user
- `deleteUser(userId)` - Delete user
- `getUserById(userId)` - Get user details
- `toggleUserStatus(userId)` - Toggle user active/inactive status
- `searchUsers(query, params)` - Search users
- `bulkUpdateUsers(updates)` - Bulk update multiple users

### 2. useUserManagement Hook (`/hooks/useUserManagement.js`)
Custom hook untuk state management dan business logic.

**State:**
- `users` - Array of users
- `loading` - Loading state
- `error` - Error state
- `pagination` - Pagination info
- `filters` - Current filters

**Actions:**
- `loadUsers()` - Load users with current filters
- `searchUsers(query)` - Search users
- `createUser(userData)` - Create new user
- `updateUser(userId, userData)` - Update user
- `deleteUser(userId)` - Delete user
- `toggleUserStatus(userId)` - Toggle user status

### 3. UserManagement Component (`/features/user-management/UserManagement.jsx`)
Main component untuk user management interface.

**Features:**
- User list with pagination
- Search and filtering
- Bulk actions (activate, deactivate, delete)
- User statistics cards
- Tabbed interface (List, Statistics, Settings)

### 4. UserForm Component (`/features/user-management/UserForm.jsx`)
Form component untuk create/edit user.

**Fields:**
- Full name (required)
- Email (required)
- Username (required)
- Phone (optional)
- Role (agent/org_admin)
- Status (active/inactive/pending)
- Password (required for new users)

### 5. UserDetails Component (`/features/user-management/UserDetails.jsx`)
Detail view component untuk user information.

**Tabs:**
- Overview - Basic user info and permissions
- Activity - User activity logs
- Sessions - Active user sessions

## Navigation
Menu "User Management" ditambahkan di sidebar untuk role `org_admin` dengan route `/dashboard/users`.

## Permissions
Route dilindungi dengan permission `users.view` menggunakan `RoleBasedRoute`.

## Error Handling
Semua komponen menggunakan `withErrorHandling` HOC untuk error boundary dan `handleError` utility untuk error processing.

## Toast Notifications
Menggunakan `react-hot-toast` untuk user feedback pada semua actions.

## Accessibility
Menggunakan `useAnnouncement` dan `useFocusManagement` hooks untuk accessibility support.

## Loading States
Menggunakan `useLoadingStates` hook dan `LoadingWrapper` component untuk loading indicators.

## Usage Example

```jsx
import { useUserManagement } from '@/hooks/useUserManagement';

const MyComponent = () => {
  const {
    users,
    loading,
    createUser,
    updateUser,
    deleteUser
  } = useUserManagement();

  const handleCreateUser = async (userData) => {
    try {
      await createUser(userData);
      // User created successfully
    } catch (error) {
      // Handle error
    }
  };

  return (
    <div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div>
          {users.map(user => (
            <div key={user.id}>{user.full_name}</div>
          ))}
        </div>
      )}
    </div>
  );
};
```

## File Structure
```
frontend/src/
├── services/
│   └── UserManagementService.jsx
├── hooks/
│   └── useUserManagement.js
├── features/
│   └── user-management/
│       ├── UserManagement.jsx
│       ├── UserForm.jsx
│       └── UserDetails.jsx
├── components/
│   └── layout/
│       └── Sidebar.jsx (updated)
└── routes/
    └── index.jsx (updated)
```
