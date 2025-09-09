# Frontend Architecture Guide

*Design Patterns, Best Practices, and Architectural Decisions for Chatbot SaaS Frontend*

## 🎯 Architecture Principles

### 1. Scalability First
- **Feature-based organization** for easy team collaboration
- **Modular component design** for reusability
- **Lazy loading** for optimal performance
- **Code splitting** for efficient bundling

### 2. Maintainability Focus
- **Consistent naming conventions** across the codebase
- **Clear separation of concerns** between UI and business logic
- **Comprehensive documentation** for all components
- **Type safety** with PropTypes and JSDoc

### 3. Performance Optimization
- **React.memo** for preventing unnecessary re-renders
- **useMemo/useCallback** for expensive computations
- **Virtual scrolling** for large datasets
- **Image optimization** and lazy loading

### 4. Developer Experience
- **Hot reloading** for fast development
- **Comprehensive error boundaries** for debugging
- **Consistent API patterns** for easy integration
- **Automated testing** for reliability

## 🏗️ Design Patterns

### 1. Feature-First Architecture

**Pattern Description**: Organize code by business features rather than technical layers.

**Implementation**:
```javascript
// ✅ Feature-based structure
src/features/
├── client/
│   ├── components/
│   │   ├── ClientOverview.jsx
│   │   ├── ClientUsers.jsx
│   │   └── ClientBilling.jsx
│   ├── hooks/
│   │   ├── useClientManagement.js
│   │   └── useClientAnalytics.js
│   ├── services/
│   │   └── clientApi.js
│   └── index.js

// ❌ Technical-based structure
src/
├── components/
├── hooks/
├── services/
└── pages/
```

**Benefits**:
- Easier feature development and maintenance
- Clear ownership boundaries
- Better code discoverability
- Reduced coupling between features

### 2. Component Composition Pattern

**Pattern Description**: Build complex UIs by composing smaller, focused components.

**Implementation**:
```javascript
// Base components
const Card = ({ children, className, ...props }) => (
  <div className={cn("rounded-lg border bg-card", className)} {...props}>
    {children}
  </div>
);

const CardHeader = ({ children, className }) => (
  <div className={cn("flex flex-col space-y-1.5 p-6", className)}>
    {children}
  </div>
);

const CardTitle = ({ children, className }) => (
  <h3 className={cn("text-2xl font-semibold leading-none tracking-tight", className)}>
    {children}
  </h3>
);

// Composed component
const ClientCard = ({ client, onEdit, onDelete }) => (
  <Card>
    <CardHeader>
      <CardTitle>{client.name}</CardTitle>
      <CardDescription>{client.plan}</CardDescription>
    </CardHeader>
    <CardContent>
      <ClientMetrics client={client} />
      <ClientActions onEdit={onEdit} onDelete={onDelete} />
    </CardContent>
  </Card>
);
```

### 3. Custom Hook Pattern

**Pattern Description**: Extract component logic into reusable custom hooks.

**Implementation**:
```javascript
// Custom hook for client management
const useClientManagement = (clientId) => {
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchClient = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await clientApi.getClient(clientId);
      setClient(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  const updateClient = useCallback(async (updateData) => {
    try {
      setIsUpdating(true);
      setError(null);
      const updatedClient = await clientApi.updateClient(clientId, updateData);
      setClient(updatedClient);
      return updatedClient;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, [clientId]);

  const deleteClient = useCallback(async () => {
    try {
      setIsUpdating(true);
      setError(null);
      await clientApi.deleteClient(clientId);
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchClient();
  }, [fetchClient]);

  return {
    client,
    loading,
    error,
    isUpdating,
    refetch: fetchClient,
    updateClient,
    deleteClient
  };
};

// Usage in component
const ClientOverview = ({ clientId }) => {
  const { client, loading, error, updateClient } = useClientManagement(clientId);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      <ClientInfo client={client} />
      <ClientActions onUpdate={updateClient} />
    </div>
  );
};
```

### 4. Context + Reducer Pattern

**Pattern Description**: Manage complex global state with React Context and useReducer.

**Implementation**:
```javascript
// Auth Context
const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload,
        isAuthenticated: false
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };
    default:
      return state;
  }
};

const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    isAuthenticated: false,
    user: null,
    token: null,
    loading: false,
    error: null
  });

  const login = useCallback(async (credentials) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await authApi.login(credentials);
      dispatch({ type: 'LOGIN_SUCCESS', payload: response });
      localStorage.setItem('auth_token', response.token);
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE', payload: error.message });
    }
  }, []);

  const logout = useCallback(() => {
    dispatch({ type: 'LOGOUT' });
    localStorage.removeItem('auth_token');
  }, []);

  const updateUser = useCallback((userData) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
  }, []);

  const value = {
    ...state,
    login,
    logout,
    updateUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

### 5. Higher-Order Component (HOC) Pattern

**Pattern Description**: Create reusable components that enhance other components.

**Implementation**:
```javascript
// HOC for role-based access control
const withRoleCheck = (WrappedComponent, requiredRole) => {
  return (props) => {
    const { user } = useAuth();
    
    if (!user) {
      return <Navigate to="/auth/login" replace />;
    }
    
    if (user.role !== requiredRole) {
      return <UnauthorizedPage />;
    }
    
    return <WrappedComponent {...props} />;
  };
};

// HOC for permission checking
const withPermission = (WrappedComponent, requiredPermission) => {
  return (props) => {
    const { hasPermission } = usePermissionCheck();
    
    if (!hasPermission(requiredPermission)) {
      return <UnauthorizedPage />;
    }
    
    return <WrappedComponent {...props} />;
  };
};

// Usage
const AdminDashboard = withRoleCheck(Dashboard, 'super_admin');
const ClientManagement = withPermission(ClientList, 'manage_clients');
```

### 6. Render Props Pattern

**Pattern Description**: Share code between components using a prop whose value is a function.

**Implementation**:
```javascript
// Data fetching component
const DataFetcher = ({ url, children }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(url);
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return children({ data, loading, error });
};

// Usage
const ClientList = () => (
  <DataFetcher url="/api/clients">
    {({ data, loading, error }) => {
      if (loading) return <LoadingSpinner />;
      if (error) return <ErrorMessage error={error} />;
      return (
        <div>
          {data.map(client => (
            <ClientCard key={client.id} client={client} />
          ))}
        </div>
      );
    }}
  </DataFetcher>
);
```

## 🎨 UI/UX Design Patterns

### 1. Design System Architecture

**Component Hierarchy**:
```
Design System
├── Tokens (Colors, Typography, Spacing)
├── Base Components (Button, Input, Card)
├── Composite Components (DataTable, Modal, Form)
├── Layout Components (Header, Sidebar, Footer)
└── Page Templates (Dashboard, Settings, Client Management)
```

**Implementation**:
```javascript
// Design tokens
const tokens = {
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      900: '#1e3a8a'
    },
    semantic: {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    }
  },
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace']
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem'
    }
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem'
  }
};

// Base component with design tokens
const Button = ({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  className,
  ...props 
}) => {
  const baseClasses = 'font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
```

### 2. Responsive Design Patterns

**Mobile-First Approach**:
```javascript
// Responsive grid component
const ResponsiveGrid = ({ children, cols = { sm: 1, md: 2, lg: 3, xl: 4 } }) => {
  const gridClasses = cn(
    'grid gap-4',
    `grid-cols-${cols.sm}`,
    `md:grid-cols-${cols.md}`,
    `lg:grid-cols-${cols.lg}`,
    `xl:grid-cols-${cols.xl}`
  );
  
  return <div className={gridClasses}>{children}</div>;
};

// Responsive card component
const ResponsiveCard = ({ children, className }) => (
  <div className={cn(
    'w-full',
    'sm:w-1/2',
    'md:w-1/3',
    'lg:w-1/4',
    'xl:w-1/5',
    'p-4 sm:p-6 lg:p-8',
    className
  )}>
    {children}
  </div>
);
```

### 3. Loading States Pattern

**Implementation**:
```javascript
// Loading skeleton component
const Skeleton = ({ className, ...props }) => (
  <div
    className={cn(
      'animate-pulse rounded-md bg-gray-200',
      className
    )}
    {...props}
  />
);

// Loading states for different components
const ClientCardSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </CardContent>
  </Card>
);

// Loading wrapper component
const LoadingWrapper = ({ loading, skeleton: SkeletonComponent, children }) => {
  if (loading) {
    return <SkeletonComponent />;
  }
  return children;
};

// Usage
const ClientList = ({ clients, loading }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {loading ? (
      Array.from({ length: 6 }).map((_, index) => (
        <ClientCardSkeleton key={index} />
      ))
    ) : (
      clients.map(client => (
        <ClientCard key={client.id} client={client} />
      ))
    )}
  </div>
);
```

## 🔐 Security Patterns

### 1. Authentication Flow

**Implementation**:
```javascript
// Authentication service
class AuthService {
  constructor() {
    this.token = localStorage.getItem('auth_token');
    this.refreshToken = localStorage.getItem('refresh_token');
  }

  async login(credentials) {
    try {
      const response = await api.post('/auth/login', credentials);
      const { token, refreshToken, user } = response.data;
      
      this.setTokens(token, refreshToken);
      return { user, token };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }

  async refreshAccessToken() {
    try {
      const response = await api.post('/auth/refresh', {
        refreshToken: this.refreshToken
      });
      
      const { token } = response.data;
      this.setTokens(token, this.refreshToken);
      return token;
    } catch (error) {
      this.logout();
      throw error;
    }
  }

  setTokens(token, refreshToken) {
    this.token = token;
    this.refreshToken = refreshToken;
    localStorage.setItem('auth_token', token);
    localStorage.setItem('refresh_token', refreshToken);
  }

  logout() {
    this.token = null;
    this.refreshToken = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
  }

  isAuthenticated() {
    return !!this.token;
  }
}
```

### 2. Permission-Based Access Control

**Implementation**:
```javascript
// Permission checking hook
const usePermissionCheck = () => {
  const { user } = useAuth();
  
  const hasPermission = useCallback((permission) => {
    if (!user?.permissions) return false;
    return user.permissions.includes(permission);
  }, [user?.permissions]);
  
  const hasRole = useCallback((role) => {
    return user?.role === role;
  }, [user?.role]);
  
  const hasAnyRole = useCallback((roles) => {
    return roles.includes(user?.role);
  }, [user?.role]);
  
  const canAccess = useCallback((requiredRole, requiredPermission) => {
    if (requiredRole && !hasRole(requiredRole)) return false;
    if (requiredPermission && !hasPermission(requiredPermission)) return false;
    return true;
  }, [hasRole, hasPermission]);
  
  return {
    hasPermission,
    hasRole,
    hasAnyRole,
    canAccess
  };
};

// Permission-based component wrapper
const PermissionGate = ({ 
  permission, 
  role, 
  fallback = null, 
  children 
}) => {
  const { canAccess } = usePermissionCheck();
  
  if (!canAccess(role, permission)) {
    return fallback;
  }
  
  return children;
};

// Usage
const ClientManagement = () => (
  <PermissionGate 
    permission="manage_clients" 
    role="super_admin"
    fallback={<UnauthorizedPage />}
  >
    <ClientList />
  </PermissionGate>
);
```

## 🚀 Performance Patterns

### 1. Code Splitting Strategy

**Implementation**:
```javascript
// Route-based code splitting
const Dashboard = lazy(() => import('@/pages/dashboard/Dashboard'));
const ClientManagement = lazy(() => import('@/pages/superadmin/ClientManagement'));
const Analytics = lazy(() => import('@/pages/analytics/Analytics'));

// Component-based code splitting
const HeavyChart = lazy(() => import('@/components/HeavyChart'));
const DataTable = lazy(() => import('@/components/DataTable'));

// Usage with Suspense
const App = () => (
  <Router>
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/clients" element={<ClientManagement />} />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>
    </Suspense>
  </Router>
);
```

### 2. Pagination Architecture Pattern

**Pattern Description**: Standardized pagination system with comprehensive state management, URL synchronization, and performance optimization.

**Core Components**:
- **usePagination Hook**: Advanced pagination state management
- **PaginationContext**: Global pagination state with multiple instances
- **Pagination Component**: Reusable UI component with multiple variants
- **Pagination Utilities**: Helper functions for calculations and transformations

**Implementation**:
```javascript
// Enhanced Pagination Hook
const usePagination = (options = {}) => {
  const {
    initialPerPage = 15,
    perPageOptions = [10, 15, 25, 50, 100],
    maxVisiblePages = 5,
    enableUrlSync = false,
    enableLocalStorage = false,
    debounceMs = 300
  } = options;

  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: initialPerPage,
    total: 0,
    from: 0,
    to: 0
  });

  // URL synchronization
  useEffect(() => {
    if (enableUrlSync && typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const page = parseInt(urlParams.get('page')) || 1;
      const perPage = parseInt(urlParams.get('per_page')) || initialPerPage;

      if (page !== pagination.current_page || perPage !== pagination.per_page) {
        setPagination(prev => ({
          ...prev,
          current_page: page,
          per_page: perPage
        }));
      }
    }
  }, [enableUrlSync, initialPerPage]);

  // Update pagination from API response
  const updatePagination = useCallback((apiResponse) => {
    try {
      setError(null);

      if (!apiResponse) return;

      // Support multiple response formats
      let paginationData = null;
      if (apiResponse?.meta?.pagination) {
        paginationData = apiResponse.meta.pagination;
      } else if (apiResponse?.pagination) {
        paginationData = apiResponse.pagination;
      } else if (apiResponse?.meta) {
        paginationData = apiResponse.meta;
      }

      if (paginationData) {
        const newPagination = {
          current_page: Math.max(1, paginationData.current_page || 1),
          last_page: Math.max(1, paginationData.last_page || 1),
          per_page: Math.max(1, paginationData.per_page || initialPerPage),
          total: Math.max(0, paginationData.total || 0),
          from: paginationData.from || 0,
          to: paginationData.to || 0
        };

        setPagination(prev => ({ ...prev, ...newPagination }));
      }
    } catch (error) {
      console.error('Error updating pagination:', error);
      setError('Failed to update pagination data');
    }
  }, [initialPerPage]);

  // Debounced page change
  const changePage = useCallback((page, immediate = false) => {
    const targetPage = Math.max(1, Math.min(page, pagination.last_page));
    if (targetPage === pagination.current_page) return;

    const performChange = () => {
      setPagination(prev => ({ ...prev, current_page: targetPage }));
    };

    if (immediate || debounceMs === 0) {
      performChange();
    } else {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(performChange, debounceMs);
    }
  }, [pagination.current_page, pagination.last_page, debounceMs]);

  return {
    pagination,
    paginationLoading,
    error,
    updatePagination,
    changePage,
    changePerPage,
    resetPagination
  };
};

// Pagination Context for Global State
const PaginationProvider = ({ children, initialConfig = {} }) => {
  const [state, dispatch] = useReducer(paginationReducer, {
    instances: {},
    globalConfig: { ...initialState.globalConfig, ...initialConfig },
    loading: false,
    error: null
  });

  const registerInstance = useCallback((instanceId, config = {}) => {
    dispatch({
      type: PAGINATION_ACTIONS.REGISTER_INSTANCE,
      instanceId,
      config
    });
  }, []);

  const updatePagination = useCallback((instanceId, updates) => {
    dispatch({
      type: PAGINATION_ACTIONS.UPDATE_PAGINATION,
      instanceId,
      updates
    });
  }, []);

  return (
    <PaginationContext.Provider value={{
      state,
      registerInstance,
      updatePagination,
      // ... other methods
    }}>
      {children}
    </PaginationContext.Provider>
  );
};

// Reusable Pagination Component
const Pagination = forwardRef(({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  perPage = 10,
  onPageChange,
  onPerPageChange,
  variant = 'full',
  size = 'default',
  showPerPageSelector = true,
  showPageInfo = true,
  loading = false,
  disabled = false,
  ...props
}, ref) => {
  const sizeClasses = {
    sm: { button: 'h-8 px-2 text-xs', pageButton: 'w-7 h-7 text-xs' },
    default: { button: 'h-9 px-3 text-sm', pageButton: 'w-8 h-8 text-sm' },
    lg: { button: 'h-10 px-4 text-base', pageButton: 'w-10 h-10 text-base' }
  };

  const visiblePages = useMemo(() => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const halfVisible = Math.floor(maxVisiblePages / 2);
    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
    const result = [];

    if (startPage > 1) {
      result.push(1);
      if (startPage > 2) result.push('...');
    }

    result.push(...pages);

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) result.push('...');
      result.push(totalPages);
    }

    return result;
  }, [currentPage, totalPages, maxVisiblePages]);

  return (
    <nav role="navigation" aria-label="Pagination navigation" aria-live="polite">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {showPageInfo && (
            <div className="text-sm text-gray-700">
              Showing {((currentPage - 1) * perPage) + 1} to {Math.min(currentPage * perPage, totalItems)} of {totalItems} results
            </div>
          )}
          {showPerPageSelector && onPerPageChange && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Per page:</span>
              <Select value={perPage.toString()} onValueChange={(value) => onPerPageChange(parseInt(value))}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {perPageOptions.map(option => (
                    <SelectItem key={option} value={option.toString()}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          {/* Navigation buttons */}
        </div>
      </div>
    </nav>
  );
});
```

**Pagination Best Practices**:

1. **Standardized API Response Handling**:
```javascript
// Transform API response to standardized format
const transformApiResponse = (apiResponse, format = 'auto') => {
  if (!apiResponse) return defaultPaginationState;

  let paginationData = null;
  if (apiResponse?.meta?.pagination) {
    paginationData = apiResponse.meta.pagination;
  } else if (apiResponse?.pagination) {
    paginationData = apiResponse.pagination;
  } else if (apiResponse?.meta) {
    paginationData = apiResponse.meta;
  }

  return {
    current_page: Math.max(1, paginationData?.current_page || 1),
    last_page: Math.max(1, paginationData?.last_page || 1),
    per_page: Math.max(1, paginationData?.per_page || 15),
    total: Math.max(0, paginationData?.total || 0),
    from: paginationData?.from || 0,
    to: paginationData?.to || 0
  };
};
```

2. **URL Synchronization**:
```javascript
// URL synchronization for bookmarkable pagination
useEffect(() => {
  if (enableUrlSync && typeof window !== 'undefined') {
    const url = new URL(window.location);
    url.searchParams.set('page', pagination.current_page.toString());
    url.searchParams.set('per_page', pagination.per_page.toString());

    if (url.toString() !== window.location.toString()) {
      window.history.replaceState({}, '', url);
    }
  }
}, [pagination.current_page, pagination.per_page, enableUrlSync]);
```

3. **Performance Optimization**:
```javascript
// Debounced pagination changes
const changePage = useCallback((page, immediate = false) => {
  const performChange = () => {
    setPagination(prev => ({ ...prev, current_page: page }));
  };

  if (immediate || debounceMs === 0) {
    performChange();
  } else {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(performChange, debounceMs);
  }
}, [debounceMs]);
```

4. **Accessibility Support**:
```javascript
// Accessible pagination component
<nav
  role="navigation"
  aria-label="Pagination navigation"
  aria-live="polite"
>
  <Button
    onClick={() => handlePageChange(pageNum)}
    aria-label={`Go to page ${pageNum}`}
    aria-current={isActive ? 'page' : undefined}
  >
    {pageNum}
  </Button>
</nav>
```

5. **Multiple Variants**:
```javascript
// Pagination variants for different use cases
const variants = {
  full: 'Complete pagination with all controls',
  compact: 'Condensed version for limited space',
  minimal: 'Basic navigation only',
  table: 'Optimized for data tables'
};
```

### 2. Memoization Patterns

**Implementation**:
```javascript
// Component memoization
const ClientCard = memo(({ client, onUpdate, onDelete }) => {
  const handleUpdate = useCallback((data) => {
    onUpdate(client.id, data);
  }, [client.id, onUpdate]);
  
  const handleDelete = useCallback(() => {
    onDelete(client.id);
  }, [client.id, onDelete]);
  
  return (
    <Card>
      <ClientInfo client={client} />
      <ClientActions 
        onUpdate={handleUpdate} 
        onDelete={handleDelete} 
      />
    </Card>
  );
});

// List memoization
const ClientList = ({ clients, onUpdate, onDelete }) => {
  const memoizedClients = useMemo(() => 
    clients.map(client => ({
      ...client,
      onUpdate: (data) => onUpdate(client.id, data),
      onDelete: () => onDelete(client.id)
    }))
  , [clients, onUpdate, onDelete]);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {memoizedClients.map(client => (
        <ClientCard key={client.id} client={client} />
      ))}
    </div>
  );
};
```

### 3. Virtual Scrolling Pattern

**Implementation**:
```javascript
// Virtual scrolling hook
const useVirtualScrolling = (items, itemHeight, containerHeight) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );
  
  const visibleItems = items.slice(visibleStart, visibleEnd);
  const totalHeight = items.length * itemHeight;
  const offsetY = visibleStart * itemHeight;
  
  return {
    visibleItems,
    totalHeight,
    offsetY,
    setScrollTop
  };
};

// Virtual scrolling component
const VirtualList = ({ items, itemHeight, renderItem }) => {
  const containerRef = useRef();
  const [containerHeight, setContainerHeight] = useState(0);
  
  const { visibleItems, totalHeight, offsetY, setScrollTop } = useVirtualScrolling(
    items,
    itemHeight,
    containerHeight
  );
  
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight);
      }
    };
    
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);
  
  const handleScroll = (e) => {
    setScrollTop(e.target.scrollTop);
  };
  
  return (
    <div
      ref={containerRef}
      className="overflow-auto"
      onScroll={handleScroll}
      style={{ height: '400px' }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => (
            <div key={item.id} style={{ height: itemHeight }}>
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
```

## 🧪 Testing Patterns

### 1. Component Testing Strategy

**Implementation**:
```javascript
// Test utilities
const renderWithProviders = (ui, { initialState = {}, ...renderOptions } = {}) => {
  const AllTheProviders = ({ children }) => (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          {children}
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
  
  return render(ui, { wrapper: AllTheProviders, ...renderOptions });
};

// Component test example
describe('ClientCard', () => {
  const mockClient = {
    id: 1,
    name: 'Test Client',
    plan: 'enterprise',
    status: 'active',
    healthScore: 95
  };
  
  it('renders client information correctly', () => {
    renderWithProviders(<ClientCard client={mockClient} />);
    
    expect(screen.getByText('Test Client')).toBeInTheDocument();
    expect(screen.getByText('enterprise')).toBeInTheDocument();
    expect(screen.getByText('active')).toBeInTheDocument();
  });
  
  it('calls onUpdate when edit button is clicked', () => {
    const mockOnUpdate = jest.fn();
    renderWithProviders(
      <ClientCard client={mockClient} onUpdate={mockOnUpdate} />
    );
    
    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    expect(mockOnUpdate).toHaveBeenCalledWith(mockClient.id);
  });
});
```

### 2. Hook Testing Strategy

**Implementation**:
```javascript
// Hook test example
describe('useClientManagement', () => {
  it('fetches client data on mount', async () => {
    const mockClient = { id: 1, name: 'Test Client' };
    jest.spyOn(clientApi, 'getClient').mockResolvedValue(mockClient);
    
    const { result } = renderHook(() => useClientManagement(1));
    
    expect(result.current.loading).toBe(true);
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });
    
    expect(result.current.loading).toBe(false);
    expect(result.current.client).toEqual(mockClient);
  });
  
  it('handles update client successfully', async () => {
    const mockClient = { id: 1, name: 'Test Client' };
    const updatedClient = { id: 1, name: 'Updated Client' };
    
    jest.spyOn(clientApi, 'getClient').mockResolvedValue(mockClient);
    jest.spyOn(clientApi, 'updateClient').mockResolvedValue(updatedClient);
    
    const { result } = renderHook(() => useClientManagement(1));
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });
    
    await act(async () => {
      await result.current.updateClient({ name: 'Updated Client' });
    });
    
    expect(result.current.client).toEqual(updatedClient);
  });
});
```

## 📱 Mobile-First Patterns

### 1. Responsive Navigation

**Implementation**:
```javascript
// Mobile navigation component
const MobileNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="lg:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
      >
        <Menu className="h-6 w-6" />
      </button>
      
      {isOpen && (
        <div className="absolute top-0 inset-x-0 p-2 transition transform origin-top-right md:hidden">
          <div className="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 divide-y-2 divide-gray-50">
            <div className="px-5 pt-5 pb-6 space-y-1">
              <NavigationItems />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
```

### 2. Touch-Friendly Interactions

**Implementation**:
```javascript
// Touch-friendly button component
const TouchButton = ({ children, className, ...props }) => (
  <button
    className={cn(
      'min-h-[44px] min-w-[44px]', // Minimum touch target size
      'active:scale-95 transition-transform', // Touch feedback
      'focus:outline-none focus:ring-2 focus:ring-blue-500', // Focus states
      className
    )}
    {...props}
  >
    {children}
  </button>
);

// Swipe gesture hook
const useSwipeGesture = (onSwipeLeft, onSwipeRight) => {
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  
  const minSwipeDistance = 50;
  
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  
  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe && onSwipeLeft) onSwipeLeft();
    if (isRightSwipe && onSwipeRight) onSwipeRight();
  };
  
  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd
  };
};
```

---

*This architecture guide provides comprehensive patterns and best practices for building scalable, maintainable React applications.*
