# React Router Implementation

This document describes the routing structure and best practices implemented in the ChatBot UI/UX application.

## Overview

The application uses React Router v6 with a structured approach that includes:
- **Layout-based routing** with nested routes
- **Role-based access control** with protected routes
- **Error boundaries** for handling navigation errors
- **Custom hooks** for navigation utilities
- **Breadcrumb navigation** for better UX

## File Structure

```
src/
├── routes/
│   └── index.jsx              # Main router configuration
├── layouts/
│   ├── RootLayout.jsx         # Root layout with providers
│   ├── AuthLayout.jsx         # Authentication pages layout
│   ├── DashboardLayout.jsx    # Main dashboard layout
│   ├── SuperAdminLayout.jsx   # Super admin layout
│   └── AgentLayout.jsx        # Agent layout
├── pages/
│   ├── auth/                  # Authentication pages
│   ├── dashboard/             # Dashboard pages
│   ├── superadmin/            # Super admin pages
│   ├── agent/                 # Agent pages
│   └── errors/                # Error pages
├── components/
│   ├── auth/
│   │   ├── ProtectedRoute.jsx # Basic route protection
│   │   └── RoleBasedRoute.jsx # Role-based protection
│   └── ui/
│       └── Breadcrumb.jsx     # Navigation breadcrumbs
└── hooks/
    └── useNavigation.js       # Navigation utilities
```

## Route Structure

### Authentication Routes (`/auth`)
- `/auth/login` - User login
- `/auth/register` - User registration
- `/auth/forgot-password` - Password recovery
- `/auth/reset-password` - Password reset

### Dashboard Routes (`/dashboard`)
- `/dashboard` - Main dashboard (index)
- `/dashboard/inbox` - Message inbox
- `/dashboard/analytics` - Analytics and reports
- `/dashboard/knowledge` - Knowledge base
- `/dashboard/automations` - Automation settings
- `/dashboard/settings` - Application settings

### Super Admin Routes (`/superadmin`)
- `/superadmin` - Super admin dashboard
- `/superadmin/financials` - Financial management
- `/superadmin/clients` - Client management
- `/superadmin/system` - System settings

### Agent Routes (`/agent`)
- `/agent` - Agent dashboard
- `/agent/inbox` - Agent inbox
- `/agent/profile` - Agent profile

### Error Routes
- `/unauthorized` - Access denied page
- `/server-error` - Server error page
- `/*` - 404 Not Found (handled by error boundary)

## Route Protection

### ProtectedRoute
Basic authentication protection that redirects unauthenticated users to login.

```jsx
<ProtectedRoute>
  <Component />
</ProtectedRoute>
```

### RoleBasedRoute
Advanced protection that checks both authentication and role/permission requirements.

```jsx
<RoleBasedRoute requiredRole="superadmin">
  <Component />
</RoleBasedRoute>

<RoleBasedRoute requiredPermission="manage_settings">
  <Component />
</RoleBasedRoute>
```

## Layout System

### RootLayout
- Wraps the entire application
- Provides context providers (Auth, Role)
- Includes global error boundary
- Renders the Toaster component

### AuthLayout
- Centered layout for authentication pages
- Redirects authenticated users to dashboard
- Clean, minimal design

### DashboardLayout
- Main application layout
- Includes sidebar navigation
- User profile in header
- Content area with padding

### SuperAdminLayout & AgentLayout
- Role-specific layouts
- Custom navigation menus
- Role-appropriate styling

## Navigation Utilities

### useNavigation Hook
Custom hook providing navigation utilities:

```jsx
const { navigate, goTo, goBack, goHome, isCurrentPath } = useNavigation();
```

### Breadcrumb Component
Automatic breadcrumb generation based on current route:

```jsx
<Breadcrumb />
```

## Best Practices

### 1. Route Organization
- Group related routes under common paths
- Use descriptive route names
- Implement lazy loading for better performance

### 2. Access Control
- Always protect sensitive routes
- Use role-based access control
- Provide clear error messages for unauthorized access

### 3. Error Handling
- Implement error boundaries at layout level
- Provide user-friendly error pages
- Include navigation options in error states

### 4. Navigation
- Use semantic route names
- Implement breadcrumb navigation
- Provide clear navigation feedback

### 5. Performance
- Use React.lazy() for code splitting
- Implement proper loading states
- Optimize route matching

## Usage Examples

### Adding a New Route
1. Create the page component in appropriate directory
2. Add route to router configuration
3. Implement proper protection if needed
4. Add navigation link in sidebar

### Creating Protected Routes
```jsx
<RoleBasedRoute requiredRole="admin" requiredPermission="manage_users">
  <UserManagement />
</RoleBasedRoute>
```

### Navigation Between Routes
```jsx
const { goTo } = useNavigation();
goTo('/dashboard/settings');
```

## Error Handling

The application includes comprehensive error handling:
- **404 Not Found** - Custom 404 page with navigation options
- **Unauthorized Access** - Clear message with alternative actions
- **Server Errors** - User-friendly error page with retry options
- **Network Errors** - Graceful handling of connectivity issues

## Future Enhancements

- [ ] Implement route-based code splitting
- [ ] Add route transition animations
- [ ] Implement route-based analytics
- [ ] Add route caching for better performance
- [ ] Implement route-based SEO optimization
