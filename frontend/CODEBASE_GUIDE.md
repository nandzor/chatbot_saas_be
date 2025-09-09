# Frontend Codebase Guide

*Comprehensive guide to the Chatbot SaaS Frontend Architecture*

## 📁 Project Structure Overview

```
frontend/
├── src/
│   ├── api/                    # API service layer
│   ├── components/             # Reusable UI components
│   │   ├── auth/              # Authentication components
│   │   ├── client/            # Client-specific components
│   │   ├── common/            # Shared business components
│   │   ├── layout/            # Layout components
│   │   ├── organization/      # Organization management components
│   │   └── ui/                # Design system components
│   ├── config/                # Application configuration
│   ├── constants/             # Application constants
│   ├── contexts/              # React Context providers
│   ├── data/                  # Mock data and samples
│   ├── examples/              # Code examples and demos
│   ├── features/              # Feature-based modules
│   │   ├── admin/             # Admin feature components
│   │   ├── agent/             # Agent feature components
│   │   ├── auth/              # Authentication features
│   │   ├── client/            # Client management features
│   │   ├── dashboard/         # Dashboard features
│   │   ├── platform/          # Platform management features
│   │   ├── shared/            # Shared feature components
│   │   └── superadmin/        # SuperAdmin features
│   ├── hooks/                 # Custom React hooks
│   ├── layouts/               # Page layout components
│   ├── lib/                   # Utility libraries
│   ├── pages/                 # Page components
│   ├── pagination/            # Pagination components
│   ├── routes/                # Routing configuration
│   ├── services/              # Business logic services
│   ├── styles/                # Global styles and CSS
│   └── utils/                 # Utility functions
├── public/                    # Static assets
├── dist/                      # Build output
└── docs/                      # Documentation
```

## 🏗️ Architecture Patterns

### 1. Feature-First Architecture

**Pattern**: Organize code by business features rather than technical concerns.

**Implementation**:
```javascript
// ✅ Good: Feature-based organization
src/features/client/
├── ClientOverview.jsx
├── ClientUsers.jsx
├── ClientBilling.jsx
└── ClientCommunication.jsx

// ❌ Avoid: Technical-based organization
src/components/
├── ClientOverview.jsx
├── UserList.jsx
├── BillingForm.jsx
└── ChatInterface.jsx
```

**Benefits**:
- Easier to locate feature-related code
- Better team collaboration on features
- Clearer separation of concerns
- Easier maintenance and testing

### 2. Component Composition Pattern

**Pattern**: Build complex UIs by composing smaller, reusable components.

**Implementation**:
```javascript
// Base UI Component
const Card = ({ children, className, ...props }) => (
  <div className={cn("rounded-lg border bg-card", className)} {...props}>
    {children}
  </div>
);

// Composed Components
const ClientCard = ({ client }) => (
  <Card>
    <CardHeader>
      <CardTitle>{client.name}</CardTitle>
      <CardDescription>{client.plan}</CardDescription>
    </CardHeader>
    <CardContent>
      <ClientMetrics client={client} />
      <ClientActions client={client} />
    </CardContent>
  </Card>
);
```

### 3. Custom Hook Pattern

**Pattern**: Extract component logic into reusable custom hooks.

**Implementation**:
```javascript
// Custom Hook
const useClientManagement = (clientId) => {
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        setLoading(true);
        const data = await clientApi.getClient(clientId);
        setClient(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [clientId]);

  return { client, loading, error, refetch: () => fetchClient() };
};

// Component Usage
const ClientOverview = ({ clientId }) => {
  const { client, loading, error } = useClientManagement(clientId);
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return <ClientCard client={client} />;
};
```

### 4. Context + Reducer Pattern

**Pattern**: Manage global state with React Context and useReducer.

**Implementation**:
```javascript
// Context Definition
const AuthContext = createContext();

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return { ...state, user: action.payload, isAuthenticated: true };
    case 'LOGOUT':
      return { ...state, user: null, isAuthenticated: false };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
};

// Provider Component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  
  const value = {
    ...state,
    login: (credentials) => dispatch({ type: 'LOGIN', payload: credentials }),
    logout: () => dispatch({ type: 'LOGOUT' }),
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
```

## 🔐 Security Architecture

### Role-Based Access Control (RBAC)

**Implementation**:
```javascript
// Permission-based route protection
const RoleBasedRoute = ({ requiredRole, requiredPermission, children }) => {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/auth/login" />;
  
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" />;
  }
  
  if (requiredPermission && !user.permissions.includes(requiredPermission)) {
    return <Navigate to="/unauthorized" />;
  }
  
  return children;
};

// Usage in routes
<Route 
  path="/admin" 
  element={
    <RoleBasedRoute requiredRole="super_admin">
      <AdminDashboard />
    </RoleBasedRoute>
  } 
/>
```

### Permission Checking Hook

```javascript
const usePermissionCheck = () => {
  const { user } = useAuth();
  
  const hasPermission = (permission) => {
    return user?.permissions?.includes(permission) || false;
  };
  
  const hasRole = (role) => {
    return user?.role === role;
  };
  
  const canAccess = (requiredRole, requiredPermission) => {
    if (requiredRole && !hasRole(requiredRole)) return false;
    if (requiredPermission && !hasPermission(requiredPermission)) return false;
    return true;
  };
  
  return { hasPermission, hasRole, canAccess };
};
```

## 🎨 Design System Architecture

### Component Hierarchy

```
UI Components (Design System)
├── Base Components
│   ├── Button
│   ├── Input
│   ├── Card
│   └── Badge
├── Composite Components
│   ├── DataTable
│   ├── Modal
│   └── Form
└── Layout Components
    ├── Header
    ├── Sidebar
    └── Footer
```

### Styling Strategy

**Tailwind CSS with Custom Design System**:
```javascript
// Design tokens
const theme = {
  colors: {
    primary: {
      50: '#eff6ff',
      500: '#3b82f6',
      900: '#1e3a8a',
    },
    semantic: {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
    }
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  }
};

// Component styling
const Button = ({ variant = 'primary', size = 'md', ...props }) => {
  const baseClasses = 'font-medium rounded-lg transition-colors';
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
  };
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  return (
    <button
      className={cn(baseClasses, variantClasses[variant], sizeClasses[size])}
      {...props}
    />
  );
};
```

## 📊 State Management Architecture

### State Layers

1. **Local State**: Component-level state with useState
2. **Shared State**: Context API for global state
3. **Server State**: Custom hooks for API data
4. **Form State**: Controlled components with validation

### State Management Patterns

```javascript
// Local State Pattern
const ClientForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    plan: 'basic'
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Component logic...
};

// Server State Pattern
const useClientData = (clientId) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    clientApi.getClient(clientId)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [clientId]);
  
  return { data, loading, error, refetch };
};

// Global State Pattern
const useAppState = () => {
  const { user, isAuthenticated } = useAuth();
  const { currentOrganization } = useOrganization();
  const { theme, setTheme } = useTheme();
  
  return {
    user,
    isAuthenticated,
    currentOrganization,
    theme,
    setTheme
  };
};
```

## 🚀 Performance Optimization

### Code Splitting Strategy

```javascript
// Route-based code splitting
const Dashboard = lazy(() => import('@/pages/dashboard/Dashboard'));
const ClientManagement = lazy(() => import('@/pages/superadmin/ClientManagement'));

// Component-based code splitting
const HeavyChart = lazy(() => import('@/components/HeavyChart'));

// Usage with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <Dashboard />
</Suspense>
```

### Memoization Patterns

```javascript
// Component memoization
const ClientCard = memo(({ client, onUpdate }) => {
  return (
    <Card>
      <ClientInfo client={client} />
      <ClientActions onUpdate={onUpdate} />
    </Card>
  );
});

// Callback memoization
const ClientList = ({ clients }) => {
  const handleUpdate = useCallback((clientId, data) => {
    // Update logic
  }, []);
  
  const memoizedClients = useMemo(() => 
    clients.map(client => ({ ...client, onUpdate: handleUpdate }))
  , [clients, handleUpdate]);
  
  return (
    <div>
      {memoizedClients.map(client => (
        <ClientCard key={client.id} client={client} />
      ))}
    </div>
  );
};
```

## 🔄 API Integration Architecture

### Service Layer Pattern

```javascript
// API Service Base
class ApiService {
  constructor(baseURL) {
    this.client = axios.create({ baseURL });
    this.setupInterceptors();
  }
  
  setupInterceptors() {
    // Request interceptor for auth
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
    
    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle token expiration
          localStorage.removeItem('auth_token');
          window.location.href = '/auth/login';
        }
        return Promise.reject(error);
      }
    );
  }
}

// Specific API Services
class ClientService extends ApiService {
  async getClients(params = {}) {
    const response = await this.client.get('/clients', { params });
    return response.data;
  }
  
  async getClient(id) {
    const response = await this.client.get(`/clients/${id}`);
    return response.data;
  }
  
  async updateClient(id, data) {
    const response = await this.client.put(`/clients/${id}`, data);
    return response.data;
  }
}
```

### Custom Hooks for API Integration

```javascript
const useClientApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const clientService = useMemo(() => new ClientService(), []);
  
  const getClients = useCallback(async (params) => {
    try {
      setLoading(true);
      setError(null);
      const data = await clientService.getClients(params);
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [clientService]);
  
  return { getClients, loading, error };
};
```

## 📄 Pagination Architecture

### Standardized Pagination System

The pagination system provides a comprehensive, reusable solution for handling paginated data across the application with advanced features like URL synchronization, local storage persistence, and performance optimization.

### Core Pagination Components

#### 1. usePagination Hook

**Purpose**: Advanced pagination state management with comprehensive features.

**Features**:
- Smart pagination with configurable options
- URL synchronization for bookmarkable pagination
- Local storage persistence
- Debounced page changes
- Loading states management
- Accessibility support
- Performance optimizations

**Implementation**:
```javascript
// Enhanced Pagination Hook
export const usePagination = (options = {}) => {
  const {
    initialPerPage = 15,
    perPageOptions = [10, 15, 25, 50, 100],
    maxVisiblePages = 5,
    enableUrlSync = false,
    enableLocalStorage = false,
    storageKey = 'pagination',
    debounceMs = 300,
    onPageChange = null,
    onPerPageChange = null
  } = options;

  // Core pagination state
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: initialPerPage,
    total: 0,
    from: 0,
    to: 0
  });

  const [paginationLoading, setPaginationLoading] = useState(false);
  const [error, setError] = useState(null);
  const debounceRef = useRef(null);

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

  // Update pagination from API response with validation
  const updatePagination = useCallback((apiResponse) => {
    try {
      setError(null);

      if (!apiResponse) {
        console.warn('updatePagination: No API response provided');
        return;
      }

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

        // Validate pagination data
        if (newPagination.current_page > newPagination.last_page && newPagination.last_page > 0) {
          newPagination.current_page = newPagination.last_page;
        }

        setPagination(prev => {
          const updated = { ...prev, ...newPagination };
          if (onPageChange && JSON.stringify(prev) !== JSON.stringify(updated)) {
            onPageChange(updated);
          }
          return updated;
        });
      }
    } catch (error) {
      console.error('Error updating pagination:', error);
      setError('Failed to update pagination data');
    }
  }, [initialPerPage, onPageChange]);

  // Debounced page change
  const changePage = useCallback((page, immediate = false) => {
    const targetPage = Math.max(1, Math.min(page, pagination.last_page));
    if (targetPage === pagination.current_page) return;

    const performChange = () => {
      setPagination(prev => {
        const updated = { ...prev, current_page: targetPage };
        if (onPageChange) onPageChange(updated);
        return updated;
      });
    };

    if (immediate || debounceMs === 0) {
      performChange();
    } else {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(performChange, debounceMs);
    }
  }, [pagination.current_page, pagination.last_page, debounceMs, onPageChange]);

  return {
    pagination,
    paginationLoading,
    error,
    updatePagination,
    changePage,
    changePerPage,
    resetPagination,
    setPaginationLoading
  };
};
```

#### 2. PaginationContext for Global State

**Purpose**: Centralized pagination state management across the application with support for multiple pagination instances.

**Implementation**:
```javascript
// Pagination Context Provider
export const PaginationProvider = ({ children, initialConfig = {} }) => {
  const [state, dispatch] = useReducer(paginationReducer, {
    instances: {},
    globalConfig: { ...initialState.globalConfig, ...initialConfig },
    loading: false,
    error: null
  });

  // Register pagination instance
  const registerInstance = useCallback((instanceId, config = {}) => {
    dispatch({
      type: PAGINATION_ACTIONS.REGISTER_INSTANCE,
      instanceId,
      config
    });
  }, []);

  // Update pagination for instance
  const updatePagination = useCallback((instanceId, updates) => {
    dispatch({
      type: PAGINATION_ACTIONS.UPDATE_PAGINATION,
      instanceId,
      updates
    });
  }, []);

  // Get pagination for instance
  const getPagination = useCallback((instanceId) => {
    return state.instances[instanceId]?.pagination || null;
  }, [state.instances]);

  return (
    <PaginationContext.Provider value={{
      state,
      registerInstance,
      updatePagination,
      getPagination,
      // ... other methods
    }}>
      {children}
    </PaginationContext.Provider>
  );
};

// Hook for specific pagination instance
export const usePaginationInstance = (instanceId, config = {}) => {
  const context = usePaginationContext();
  const { registerInstance, unregisterInstance, updatePagination, getPagination } = context;

  // Register instance on mount
  useEffect(() => {
    if (instanceId) {
      registerInstance(instanceId, config);
      return () => unregisterInstance(instanceId);
    }
  }, [instanceId, config, registerInstance, unregisterInstance]);

  const pagination = getPagination(instanceId);

  return {
    pagination,
    updatePagination: (updates) => updatePagination(instanceId, updates),
    // ... other instance-specific methods
  };
};
```

#### 3. Reusable Pagination Component

**Purpose**: Flexible, accessible pagination UI component with multiple variants and configurations.

**Implementation**:
```javascript
const Pagination = forwardRef(({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  perPage = 10,
  onPageChange,
  onPerPageChange,
  perPageOptions = [10, 15, 25, 50, 100],
  maxVisiblePages = 5,
  variant = 'full',
  size = 'default',
  showPerPageSelector = true,
  showPageInfo = true,
  showFirstLast = true,
  showPrevNext = true,
  showPageNumbers = true,
  loading = false,
  disabled = false,
  className = '',
  ...props
}, ref) => {
  // Size classes
  const sizeClasses = {
    sm: { button: 'h-8 px-2 text-xs', pageButton: 'w-7 h-7 text-xs', icon: 'w-3 h-3' },
    default: { button: 'h-9 px-3 text-sm', pageButton: 'w-8 h-8 text-sm', icon: 'w-4 h-4' },
    lg: { button: 'h-10 px-4 text-base', pageButton: 'w-10 h-10 text-base', icon: 'w-5 h-5' }
  };

  const currentSize = sizeClasses[size];

  // Memoized visible pages
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

  // Event handlers
  const handlePageChange = (page) => {
    if (onPageChange && typeof onPageChange === 'function' && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const handlePerPageChange = (newPerPage) => {
    if (onPerPageChange && typeof onPerPageChange === 'function') {
      onPerPageChange(parseInt(newPerPage));
    }
  };

  // Render based on variant
  const renderVariant = () => {
    switch (variant) {
      case 'compact':
        return (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((currentPage - 1) * perPage) + 1} to {Math.min(currentPage * perPage, totalItems)} of {totalItems} results
            </div>
            <div className="flex items-center gap-1">
              <span className="px-3 text-gray-700">
                {currentPage} of {totalPages}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {/* Navigation controls */}
            </div>
          </div>
        );

      case 'minimal':
        return (
          <div className="flex items-center justify-center gap-2">
            <div className="flex items-center gap-1">
              {/* Navigation controls */}
            </div>
            <span className="px-3 text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
          </div>
        );

      default: // 'full'
        return (
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
                  <Select value={perPage.toString()} onValueChange={handlePerPageChange}>
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
              {/* Navigation controls */}
            </div>
          </div>
        );
    }
  };

  return (
    <nav
      ref={ref}
      role="navigation"
      aria-label="Pagination navigation"
      aria-live="polite"
      className={className}
      {...props}
    >
      {renderVariant()}
    </nav>
  );
});
```

#### 4. Pagination Utilities

**Purpose**: Helper functions for pagination calculations, validations, and transformations.

**Implementation**:
```javascript
// Calculate pagination info from raw data
export const calculatePaginationInfo = ({
  currentPage = 1,
  totalItems = 0,
  itemsPerPage = 15
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const validCurrentPage = Math.max(1, Math.min(currentPage, totalPages));
  const startItem = totalItems > 0 ? ((validCurrentPage - 1) * itemsPerPage) + 1 : 0;
  const endItem = Math.min(validCurrentPage * itemsPerPage, totalItems);

  return {
    currentPage: validCurrentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    startItem,
    endItem,
    hasNextPage: validCurrentPage < totalPages,
    hasPrevPage: validCurrentPage > 1,
    isFirstPage: validCurrentPage === 1,
    isLastPage: validCurrentPage === totalPages,
    itemsShown: endItem - startItem + 1
  };
};

// Transform API response to standardized pagination format
export const transformApiResponse = (apiResponse, format = 'auto') => {
  if (!apiResponse) {
    return {
      current_page: 1,
      last_page: 1,
      per_page: 15,
      total: 0,
      from: 0,
      to: 0
    };
  }

  let paginationData = null;
  if (apiResponse?.meta?.pagination) {
    paginationData = apiResponse.meta.pagination;
  } else if (apiResponse?.pagination) {
    paginationData = apiResponse.pagination;
  } else if (apiResponse?.meta) {
    paginationData = apiResponse.meta;
  }

  if (!paginationData) {
    console.warn('No pagination data found in API response');
    return defaultPaginationState;
  }

  return {
    current_page: Math.max(1, paginationData.current_page || 1),
    last_page: Math.max(1, paginationData.last_page || 1),
    per_page: Math.max(1, paginationData.per_page || 15),
    total: Math.max(0, paginationData.total || 0),
    from: paginationData.from || 0,
    to: paginationData.to || 0
  };
};

// Validate pagination parameters
export const validatePaginationParams = ({
  page,
  perPage,
  total = 0,
  allowedPerPage = [10, 15, 25, 50, 100]
}) => {
  const errors = [];
  const warnings = [];

  if (!Number.isInteger(page) || page < 1) {
    errors.push('Page must be a positive integer');
  }

  if (!Number.isInteger(perPage) || perPage < 1) {
    errors.push('Per page must be a positive integer');
  } else if (!allowedPerPage.includes(perPage)) {
    warnings.push(`Per page value ${perPage} is not in allowed values`);
  }

  if (!Number.isInteger(total) || total < 0) {
    errors.push('Total must be a non-negative integer');
  }

  if (total > 0 && page > Math.ceil(total / perPage)) {
    warnings.push(`Page ${page} exceeds total pages`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    hasWarnings: warnings.length > 0
  };
};
```

### Pagination Usage Patterns

#### 1. Basic Pagination Implementation

```javascript
// User Management with Pagination
const UserManagement = () => {
  const {
    pagination,
    paginationLoading,
    error,
    updatePagination,
    changePage,
    changePerPage
  } = usePagination({
    initialPerPage: 15,
    perPageOptions: [10, 15, 25, 50, 100],
    enableUrlSync: true,
    enableLocalStorage: true
  });

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await userManagementService.getUsers({
        page: pagination.current_page,
        per_page: pagination.per_page
      });

      if (response.success) {
        setUsers(response.data.data || []);
        updatePagination(response.data);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.current_page, pagination.per_page, updatePagination]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">User Management</h2>
        <Button onClick={() => setShowCreateUser(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      <UsersTable users={users} loading={loading} />

      <Pagination
        currentPage={pagination.current_page}
        totalPages={pagination.last_page}
        totalItems={pagination.total}
        perPage={pagination.per_page}
        onPageChange={changePage}
        onPerPageChange={changePerPage}
        loading={paginationLoading}
        variant="table"
      />
    </div>
  );
};
```

#### 2. Advanced Pagination with Filters

```javascript
// Client Management with Advanced Pagination
const ClientManagement = () => {
  const {
    pagination,
    updatePagination,
    changePage,
    changePerPage
  } = usePagination({
    initialPerPage: 25,
    perPageOptions: [10, 25, 50, 100, 200],
    maxVisiblePages: 7,
    enableUrlSync: true,
    enableLocalStorage: true,
    debounceMs: 200
  });

  const [clients, setClients] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    plan: 'all'
  });

  const loadClients = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current_page,
        per_page: pagination.per_page,
        ...filters
      };

      // Remove 'all' values from filters
      Object.keys(params).forEach(key => {
        if (params[key] === 'all') {
          delete params[key];
        }
      });

      const response = await clientManagementService.getClients(params);

      if (response.success) {
        setClients(response.data.data || []);
        updatePagination(response.data);
      }
    } catch (err) {
      console.error('Failed to load clients:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.current_page, pagination.per_page, filters, updatePagination]);

  // Debounced search
  const debouncedLoadClients = useMemo(
    () => debounce(loadClients, 300),
    [loadClients]
  );

  useEffect(() => {
    debouncedLoadClients();
  }, [debouncedLoadClients]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Client Management</h2>
        <Button onClick={() => setShowCreateClient(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Client
        </Button>
      </div>

      <div className="flex space-x-4">
        <SearchInput
          value={filters.search}
          onChange={(value) => setFilters(prev => ({ ...prev, search: value }))}
          placeholder="Search clients..."
        />
        <Select
          value={filters.status}
          onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="trial">Trial</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ClientsTable clients={clients} loading={loading} />

      <Pagination
        currentPage={pagination.current_page}
        totalPages={pagination.last_page}
        totalItems={pagination.total}
        perPage={pagination.per_page}
        onPageChange={changePage}
        onPerPageChange={changePerPage}
        variant="full"
        size="default"
      />
    </div>
  );
};
```

#### 3. Global Pagination Context Usage

```javascript
// App with Global Pagination Context
const App = () => {
  return (
    <PaginationProvider
      initialConfig={{
        defaultPerPage: 15,
        perPageOptions: [10, 15, 25, 50, 100],
        maxVisiblePages: 5,
        enableUrlSync: true,
        enableLocalStorage: true
      }}
    >
      <Router>
        <Routes>
          <Route path="/users" element={<UserManagement />} />
          <Route path="/clients" element={<ClientManagement />} />
          <Route path="/organizations" element={<OrganizationManagement />} />
        </Routes>
      </Router>
    </PaginationProvider>
  );
};

// Component using global pagination context
const UserList = () => {
  const { pagination, updatePagination, changePage } = usePaginationInstance('user-list', {
    initialPerPage: 20,
    perPageOptions: [10, 20, 50, 100]
  });

  // Component implementation...
};
```

### Pagination Best Practices

1. **Consistent API Response Handling**: Always use `transformApiResponse` to standardize different API response formats.

2. **URL Synchronization**: Enable URL sync for bookmarkable pagination states.

3. **Performance Optimization**: Use debouncing for search and filter changes.

4. **Accessibility**: Always include proper ARIA labels and keyboard navigation support.

5. **Loading States**: Show loading indicators during pagination changes.

6. **Error Handling**: Implement proper error handling for pagination failures.

7. **Mobile Responsiveness**: Use appropriate variants for different screen sizes.

8. **Caching**: Implement pagination state caching for better performance.

9. **Validation**: Always validate pagination parameters before making API calls.

10. **Testing**: Write comprehensive tests for pagination functionality.

## 🧪 Testing Architecture

### Testing Strategy

1. **Unit Tests**: Individual component and hook testing
2. **Integration Tests**: Feature-level testing
3. **E2E Tests**: Full user journey testing

### Testing Patterns

```javascript
// Component Testing
import { render, screen, fireEvent } from '@testing-library/react';
import { ClientCard } from '@/components/client/ClientCard';

describe('ClientCard', () => {
  const mockClient = {
    id: 1,
    name: 'Test Client',
    plan: 'enterprise',
    status: 'active'
  };
  
  it('renders client information correctly', () => {
    render(<ClientCard client={mockClient} />);
    
    expect(screen.getByText('Test Client')).toBeInTheDocument();
    expect(screen.getByText('enterprise')).toBeInTheDocument();
    expect(screen.getByText('active')).toBeInTheDocument();
  });
  
  it('calls onUpdate when update button is clicked', () => {
    const mockOnUpdate = jest.fn();
    render(<ClientCard client={mockClient} onUpdate={mockOnUpdate} />);
    
    fireEvent.click(screen.getByRole('button', { name: /update/i }));
    expect(mockOnUpdate).toHaveBeenCalledWith(mockClient.id);
  });
});

// Hook Testing
import { renderHook, act } from '@testing-library/react';
import { useClientManagement } from '@/hooks/useClientManagement';

describe('useClientManagement', () => {
  it('fetches client data on mount', async () => {
    const { result } = renderHook(() => useClientManagement(1));
    
    expect(result.current.loading).toBe(true);
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });
    
    expect(result.current.loading).toBe(false);
    expect(result.current.client).toBeDefined();
  });
});
```

## 📱 Responsive Design Architecture

### Breakpoint Strategy

```javascript
// Tailwind breakpoints
const breakpoints = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
  '2xl': '1536px' // Extra large desktop
};

// Responsive component pattern
const ResponsiveGrid = ({ children }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
    {children}
  </div>
);

// Mobile-first approach
const ClientCard = ({ client }) => (
  <div className="
    w-full
    sm:w-1/2
    md:w-1/3
    lg:w-1/4
    xl:w-1/5
    p-4
    sm:p-6
    lg:p-8
  ">
    {/* Card content */}
  </div>
);
```

## 🔧 Development Workflow

### File Naming Conventions

```
components/
├── PascalCase.jsx          # React components
├── kebab-case.jsx          # Page components
└── index.js                # Barrel exports

hooks/
├── useCamelCase.js         # Custom hooks
└── index.js                # Barrel exports

utils/
├── camelCase.js            # Utility functions
└── index.js                # Barrel exports
```

### Import/Export Patterns

```javascript
// Barrel exports
// components/ui/index.js
export { Button } from './Button';
export { Input } from './Input';
export { Card } from './Card';

// Named imports
import { Button, Input, Card } from '@/components/ui';

// Default exports for main components
// ClientOverview.jsx
export default ClientOverview;

// Named exports for utilities
// utils/formatDate.js
export const formatDate = (date) => { /* ... */ };
export const parseDate = (dateString) => { /* ... */ };
```

## 🚀 Deployment Architecture

### Build Configuration

```javascript
// vite.config.js
export default defineConfig(({ command, mode }) => {
  const isProduction = command === 'build' || mode === 'production';
  
  return {
    base: isProduction ? '/chatbot-saas/' : '/',
    build: {
      outDir: 'dist',
      sourcemap: !isProduction,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom'],
            ui: ['lucide-react', 'clsx', 'tailwind-merge'],
          },
        },
      },
    },
  };
});
```

### Environment Configuration

```javascript
// config/environment.js
const environments = {
  development: {
    API_BASE_URL: 'http://localhost:8000/api/v1',
    WS_URL: 'ws://localhost:8000/ws',
    DEBUG: true,
  },
  staging: {
    API_BASE_URL: 'https://staging-api.example.com/api/v1',
    WS_URL: 'wss://staging-api.example.com/ws',
    DEBUG: true,
  },
  production: {
    API_BASE_URL: 'https://api.example.com/api/v1',
    WS_URL: 'wss://api.example.com/ws',
    DEBUG: false,
  },
};

export const config = environments[import.meta.env.MODE] || environments.development;
```

---

*This codebase guide provides comprehensive documentation for understanding and extending the Chatbot SaaS frontend architecture.*
