# PermissionList Component

## Overview
`PermissionList` adalah komponen halaman untuk mengelola permissions sistem yang sudah direfactor menggunakan komponen UI reusable dari design system.

## Route
```
/superadmin/system/permissions
```

## Features
- ✅ **Header**: PageHeaderWithActions dengan CTA Create Permission
- ✅ **Filters**: FilterBar dengan search, category, type, dan status
- ✅ **Statistics**: 4 cards statistik (Total, Active, System, Custom)
- ✅ **Table**: DataTable dengan columns configurable dan row actions
- ✅ **Pagination**: Pagination component dengan per-page selector
- ✅ **States**: Loading skeleton, empty state, error handling
- ✅ **CRUD**: Create, Edit, View, Clone, Delete operations

## Components Used
```jsx
import {
  PageHeaderWithActions,    // Header dengan actions
  DataContainer,            // Container dengan border/padding
  FilterBar,                // Search + filter dropdowns
  DataTable,                // Table dengan columns config
  Pagination,               // Pagination controls
  DeleteConfirmDialog,      // Konfirmasi delete
  EmptyState,               // State kosong dengan CTA
  ErrorMessage,             // Error display
  Skeleton                  // Loading skeleton
} from '@/components/ui';
```

## Usage Example
```jsx
// Di routes/index.jsx
{
  path: 'system/permissions', 
  element: <PermissionList />
}

// Di layout atau komponen lain
import PermissionList from '@/pages/permissions/PermissionList';
```

## Data Structure
```jsx
// Permission object
{
  id: string,
  name: string,
  code: string,
  description: string,
  category: 'system' | 'user_management' | 'role_management' | ...,
  resource: string,
  action: string,
  is_system: boolean,
  is_visible: boolean,
  status: 'active' | 'inactive',
  metadata: object
}

// Pagination object
{
  current_page: number,
  last_page: number,
  per_page: number,
  total: number
}
```

## Hooks Used
- `usePermissionManagement()` - State management dan CRUD operations
- `usePermissionCheck()` - Authorization checks

## Responsive Design
- Mobile: Single column layout
- Tablet: 2-column grid untuk statistics
- Desktop: 4-column grid untuk statistics

## Error Handling
- Non-blocking errors via ErrorMessage component
- Toast notifications untuk CRUD operations
- Loading states untuk async operations
- Empty state dengan CTA untuk create permission

## Best Practices Applied
1. **Reusable Components**: Semua UI dari shared library
2. **Performance**: useCallback, useMemo, useRef untuk optimization
3. **Accessibility**: Proper ARIA labels dan keyboard navigation
4. **State Management**: Clean separation dengan custom hooks
5. **Error Boundaries**: Graceful error handling
6. **Loading States**: Skeleton loading untuk better UX

## Testing
```bash
# Build check
npm run build

# Lint check
npm run lint

# Development server
npm run dev
```

## Troubleshooting
- **404 Error**: Pastikan mengakses `/superadmin/system/permissions` bukan `/src/pages/permissions/PermissionList`
- **Import Error**: Pastikan semua dependencies terinstall dan paths benar
- **Build Error**: Cek syntax dan dependencies di package.json
