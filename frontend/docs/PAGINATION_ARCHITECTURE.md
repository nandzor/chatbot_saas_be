# 📄 Pagination Library Architecture

## Overview

This document outlines a lightweight pagination library for the ChatBot SaaS Frontend application. The library provides essential pagination utilities, hooks, and components without complex API services, focusing on simplicity and reusability.

## 🏗️ Library Components

### 1. usePagination Hook (`/src/hooks/usePagination.js`)

A simple React hook for pagination state management.

#### Features:
- **Basic pagination state** management
- **URL synchronization** for bookmarkable pages
- **Local storage persistence** for user preferences
- **Debounced page changes** for performance
- **Loading states management**

#### Basic Usage:
```javascript
import { usePagination } from '@/hooks/usePagination';

const MyComponent = () => {
  const {
    pagination,
    paginationInfo,
    changePage,
    changePerPage,
    updatePagination,
    goToNextPage,
    goToPrevPage
  } = usePagination({
    initialPerPage: 15,
    perPageOptions: [10, 15, 25, 50, 100],
    enableUrlSync: true,
    enableLocalStorage: true
  });

  return (
    <div>
      <Pagination
        currentPage={pagination.current_page}
        totalPages={pagination.last_page}
        totalItems={pagination.total}
        perPage={pagination.per_page}
        onPageChange={changePage}
        onPerPageChange={changePerPage}
      />
    </div>
  );
};
```

#### Configuration:
```javascript
const pagination = usePagination({
  initialPerPage: 25,
  perPageOptions: [10, 25, 50, 100],
  maxVisiblePages: 7,
  enableUrlSync: true,
  enableLocalStorage: true,
  storageKey: 'my-pagination',
  debounceMs: 200
});
```

### 2. Pagination Component (`/src/components/ui/Pagination.jsx`)

A simple, accessible pagination component with multiple display variants.

#### Variants:
- **`full`** - Complete pagination with all controls
- **`compact`** - Condensed version with essential controls
- **`minimal`** - Simple previous/next navigation
- **`table`** - Optimized for table layouts

#### Basic Usage:
```javascript
import Pagination from '@/components/ui/Pagination';

const MyTable = () => {
  return (
    <div>
      {/* Table content */}
      
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        perPage={perPage}
        onPageChange={handlePageChange}
        onPerPageChange={handlePerPageChange}
        variant="table"
        size="sm"
      />
    </div>
  );
};
```

#### Props:
```javascript
<Pagination
  currentPage={pagination.current_page}
  totalPages={pagination.last_page}
  totalItems={pagination.total}
  perPage={pagination.per_page}
  onPageChange={changePage}
  onPerPageChange={changePerPage}
  
  // Configuration
  variant="full"           // full | compact | minimal | table
  size="default"           // sm | default | lg
  perPageOptions={[10, 15, 25, 50, 100]}
  maxVisiblePages={5}
  
  // Display options
  showPerPageSelector={true}
  showPageInfo={true}
  showFirstLast={true}
  showPrevNext={true}
  showPageNumbers={true}
  
  // States
  loading={loading}
  disabled={disabled}
/>
```

### 3. Pagination Utilities (`/src/utils/pagination.js`)

Essential utility functions for pagination calculations and transformations.

#### Key Functions:

##### `calculatePaginationInfo(params)`
```javascript
import { calculatePaginationInfo } from '@/utils/pagination';

const info = calculatePaginationInfo({
  currentPage: 2,
  totalItems: 150,
  itemsPerPage: 25
});

// Returns: { currentPage, totalPages, startItem, endItem, hasNextPage, hasPrevPage, progress }
```

##### `generateVisiblePages(params)`
```javascript
import { generateVisiblePages } from '@/utils/pagination';

const pages = generateVisiblePages({
  currentPage: 5,
  totalPages: 20,
  maxVisible: 5
});

// Returns: [1, '...', 3, 4, 5, 6, 7, '...', 20]
```

##### `transformApiResponse(apiResponse, format)`
```javascript
import { transformApiResponse } from '@/utils/pagination';

// Transform API response to standard format
const standardized = transformApiResponse(apiResponse, 'laravel');
// Returns: { current_page, last_page, per_page, total, from, to }
```

##### `createPaginationParams(pagination, options)`
```javascript
import { createPaginationParams } from '@/utils/pagination';

const params = createPaginationParams(pagination, {
  includeTotal: true,
  customParams: { search: 'query' }
});

// Returns: { page, per_page, total, search: 'query' }
```

### 4. Pagination Context Provider (`/src/contexts/PaginationContext.jsx`) - Optional

Global state management for pagination across the application (optional for simple use cases).

#### Setup:
```javascript
import { PaginationProvider } from '@/contexts/PaginationContext';

function App() {
  return (
    <PaginationProvider
      initialConfig={{
        defaultPerPage: 15,
        perPageOptions: [10, 15, 25, 50, 100],
        enableUrlSync: true,
        enableLocalStorage: true
      }}
    >
      <MyApp />
    </PaginationProvider>
  );
}
```

#### Usage with Context:
```javascript
import { usePaginationInstance } from '@/contexts/PaginationContext';

const MyComponent = () => {
  const {
    pagination,
    changePage,
    changePerPage,
    updateFromApiResponse
  } = usePaginationInstance('user-management', {
    defaultPerPage: 25,
    perPageOptions: [10, 25, 50, 100]
  });

  return (
    <div>
      {/* Component content */}
    </div>
  );
};
```

## 🎯 Usage Patterns

### 1. Basic Table Pagination

Use the `usePagination` hook with `Pagination` component for standard table pagination:

```javascript
const {
  pagination,
  paginationInfo,
  changePage,
  changePerPage,
  updatePagination
} = usePagination({
  initialPerPage: 25,
  perPageOptions: [10, 25, 50, 100],
  enableUrlSync: true
});

// Fetch data with your existing API service
const fetchData = async () => {
  const response = await yourApiService.getUsers({
    page: pagination.current_page,
    per_page: pagination.per_page,
    ...filters
  });
  
  if (response.success) {
    setUsers(response.data);
    updatePagination(response.pagination);
  }
};
```

### 2. With Existing API Service

Integrate with your existing API service:

```javascript
const {
  pagination,
  changePage,
  changePerPage,
  updatePagination
} = usePagination({
  initialPerPage: 50,
  perPageOptions: [25, 50, 100, 200],
  enableUrlSync: true
});

// Use with your existing service
const fetchData = async () => {
  const params = createPaginationParams(pagination, {
    customParams: { search: filters.search, sort: filters.sort }
  });
  
  const response = await userService.getUsers(params);
  updatePagination(response.pagination);
};
```

### 3. Mobile-Optimized Pagination

For mobile devices with minimal pagination controls:

```javascript
const {
  pagination,
  changePage,
  changePerPage
} = usePagination({
  initialPerPage: 10,
  perPageOptions: [5, 10, 20],
  maxVisiblePages: 3,
  enableLocalStorage: true,
  debounceMs: 500
});
```

## 🔧 Configuration Options

### usePagination Hook Options

```javascript
const paginationOptions = {
  // Basic configuration
  initialPerPage: 15,                    // Default items per page
  perPageOptions: [10, 15, 25, 50, 100], // Available per page options
  maxVisiblePages: 5,                    // Maximum visible page numbers
  
  // Features
  enableUrlSync: false,                  // Sync with URL parameters
  enableLocalStorage: false,             // Persist state in localStorage
  storageKey: 'pagination',              // localStorage key
  debounceMs: 300,                       // Debounce delay for page changes
  
  // Callbacks
  onPageChange: (pagination) => {},      // Page change callback
  onPerPageChange: (pagination) => {}    // Per page change callback
};
```

### Pagination Component Props

```javascript
const paginationProps = {
  // Core props
  currentPage: 1,                        // Current page number
  totalPages: 1,                         // Total number of pages
  totalItems: 0,                         // Total number of items
  perPage: 15,                           // Items per page
  onPageChange: (page) => {},            // Page change handler
  onPerPageChange: (perPage) => {},      // Per page change handler
  
  // Configuration
  perPageOptions: [10, 15, 25, 50, 100], // Per page options
  maxVisiblePages: 5,                    // Max visible page numbers
  variant: 'full',                       // Display variant: full | compact | minimal | table
  size: 'default',                       // Component size: sm | default | lg
  
  // Display options
  showPerPageSelector: true,             // Show per page selector
  showPageInfo: true,                    // Show page information
  showFirstLast: true,                   // Show first/last buttons
  showPrevNext: true,                    // Show previous/next buttons
  showPageNumbers: true,                 // Show page numbers
  
  // States
  loading: false,                        // Loading state
  disabled: false                        // Disabled state
};
```

## 🎨 Styling

The pagination components use Tailwind CSS classes and can be customized with additional CSS classes:

```javascript
<Pagination
  className="custom-pagination"
  // ... other props
/>
```

```css
.custom-pagination {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
}
```

## 🧪 Testing

Test pagination components and hooks using React Testing Library:

```javascript
// Test pagination component rendering
expect(screen.getByText('Showing 11 to 20 of 100 results')).toBeInTheDocument();
expect(screen.getByText('Page 2 of 10')).toBeInTheDocument();

// Test page change functionality
fireEvent.click(screen.getByText('3'));
expect(onPageChange).toHaveBeenCalledWith(3);
```

## 🚀 Performance Optimization

### Memoization

Use React.memo, useMemo, and useCallback for optimal performance:

```javascript
// Memoize expensive calculations
const visiblePages = useMemo(() => 
  generateVisiblePages({ currentPage, totalPages, maxVisible: 5 }),
  [currentPage, totalPages]
);

// Memoize event handlers
const handlePageChange = useCallback((page) => {
  onPageChange(page);
}, [onPageChange]);
```

## 📱 Responsive Design

Adapt pagination for different screen sizes:

```javascript
// Detect screen size
const isMobile = useMediaQuery('(max-width: 768px)');
const isTablet = useMediaQuery('(max-width: 1024px)');

// Adapt pagination variant and size
const variant = isMobile ? 'minimal' : isTablet ? 'compact' : 'full';
const size = isMobile ? 'sm' : 'default';
```

## 🎯 Best Practices

### 1. Consistent Configuration

Create configuration constants for different use cases:

```javascript
export const PAGINATION_CONFIGS = {
  TABLE: {
    initialPerPage: 25,
    perPageOptions: [10, 25, 50, 100],
    maxVisiblePages: 7,
    enableUrlSync: true,
    enableLocalStorage: true
  },
  MOBILE: {
    initialPerPage: 10,
    perPageOptions: [5, 10, 20],
    maxVisiblePages: 3,
    enableUrlSync: false,
    enableLocalStorage: true
  }
};
```

### 2. Error Handling

Implement proper error handling for pagination:

```javascript
// Handle API errors
if (response.success) {
  updatePagination(response.pagination);
  setError(null);
} else {
  setError(response.error);
}
```

### 3. Loading States

Manage loading states consistently:

```javascript
// Set loading states
setLoading(true);

// Clear loading states
setLoading(false);
```

## 🔄 Migration Guide

### From Legacy Pagination

1. **Replace custom pagination logic** with `usePagination` hook
2. **Update components** to use standardized `Pagination` component
3. **Integrate with existing API services**
4. **Update styling** to use new CSS classes and variants

### Migration Steps

```javascript
// Before (Legacy)
const [currentPage, setCurrentPage] = useState(1);
const [perPage, setPerPage] = useState(15);

// After (New Library)
const {
  pagination,
  changePage,
  changePerPage,
  updatePagination
} = usePagination({
  initialPerPage: 15,
  enableUrlSync: true
});
```

## 🎉 Conclusion

This pagination library provides a lightweight, reusable solution for handling pagination across the ChatBot SaaS Frontend application. The library focuses on simplicity and integration with existing API services.

The library supports:
- ✅ **Simple state management** with usePagination hook
- ✅ **Multiple display variants** for different use cases
- ✅ **URL synchronization** and localStorage persistence
- ✅ **Integration with existing API services**
- ✅ **Accessibility** and responsive design
- ✅ **Performance optimization** with debouncing and memoization
- ✅ **Easy migration** from legacy implementations

For additional information and advanced usage patterns, refer to the component documentation and implementation files in the codebase.
