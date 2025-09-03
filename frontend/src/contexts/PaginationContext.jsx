import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';
import {
  calculatePaginationInfo,
  validatePaginationParams,
  transformApiResponse,
  createPaginationParams,
  hasPaginationChanged
} from '@/utils/pagination';

/**
 * Pagination Context for Global State Management
 *
 * Provides centralized pagination state management across the application
 * with support for multiple pagination instances and global configuration.
 */

// Action types
const PAGINATION_ACTIONS = {
  SET_PAGINATION: 'SET_PAGINATION',
  UPDATE_PAGINATION: 'UPDATE_PAGINATION',
  RESET_PAGINATION: 'RESET_PAGINATION',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_CONFIG: 'SET_CONFIG',
  REGISTER_INSTANCE: 'REGISTER_INSTANCE',
  UNREGISTER_INSTANCE: 'UNREGISTER_INSTANCE'
};

// Initial state
const initialState = {
  instances: {},
  globalConfig: {
    defaultPerPage: 15,
    perPageOptions: [10, 15, 25, 50, 100],
    maxVisiblePages: 5,
    enableUrlSync: false,
    enableLocalStorage: false,
    debounceMs: 300
  },
  loading: false,
  error: null
};

// Reducer function
const paginationReducer = (state, action) => {
  switch (action.type) {
    case PAGINATION_ACTIONS.SET_PAGINATION:
      return {
        ...state,
        instances: {
          ...state.instances,
          [action.instanceId]: {
            ...state.instances[action.instanceId],
            pagination: action.pagination,
            lastUpdated: Date.now()
          }
        }
      };

    case PAGINATION_ACTIONS.UPDATE_PAGINATION:
      return {
        ...state,
        instances: {
          ...state.instances,
          [action.instanceId]: {
            ...state.instances[action.instanceId],
            pagination: {
              ...state.instances[action.instanceId]?.pagination,
              ...action.updates
            },
            lastUpdated: Date.now()
          }
        }
      };

    case PAGINATION_ACTIONS.RESET_PAGINATION:
      return {
        ...state,
        instances: {
          ...state.instances,
          [action.instanceId]: {
            ...state.instances[action.instanceId],
            pagination: {
              current_page: 1,
              last_page: 1,
              per_page: state.globalConfig.defaultPerPage,
              total: 0,
              from: 0,
              to: 0
            },
            lastUpdated: Date.now()
          }
        }
      };

    case PAGINATION_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.loading
      };

    case PAGINATION_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.error
      };

    case PAGINATION_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    case PAGINATION_ACTIONS.SET_CONFIG:
      return {
        ...state,
        globalConfig: {
          ...state.globalConfig,
          ...action.config
        }
      };

    case PAGINATION_ACTIONS.REGISTER_INSTANCE:
      return {
        ...state,
        instances: {
          ...state.instances,
          [action.instanceId]: {
            pagination: {
              current_page: 1,
              last_page: 1,
              per_page: action.config?.defaultPerPage || state.globalConfig.defaultPerPage,
              total: 0,
              from: 0,
              to: 0
            },
            config: {
              ...state.globalConfig,
              ...action.config
            },
            lastUpdated: Date.now()
          }
        }
      };

    case PAGINATION_ACTIONS.UNREGISTER_INSTANCE:
      const { [action.instanceId]: removed, ...remainingInstances } = state.instances;
      return {
        ...state,
        instances: remainingInstances
      };

    default:
      return state;
  }
};

// Create context
const PaginationContext = createContext(null);

// Provider component
export const PaginationProvider = ({
  children,
  initialConfig = {},
  enableDevTools = false
}) => {
  const [state, dispatch] = useReducer(paginationReducer, {
    ...initialState,
    globalConfig: {
      ...initialState.globalConfig,
      ...initialConfig
    }
  });

  // Dev tools integration
  if (enableDevTools && typeof window !== 'undefined') {
    window.__PAGINATION_STATE__ = state;
  }

  // Register pagination instance
  const registerInstance = useCallback((instanceId, config = {}) => {
    dispatch({
      type: PAGINATION_ACTIONS.REGISTER_INSTANCE,
      instanceId,
      config
    });
  }, []);

  // Unregister pagination instance
  const unregisterInstance = useCallback((instanceId) => {
    dispatch({
      type: PAGINATION_ACTIONS.UNREGISTER_INSTANCE,
      instanceId
    });
  }, []);

  // Set pagination for instance
  const setPagination = useCallback((instanceId, pagination) => {
    dispatch({
      type: PAGINATION_ACTIONS.SET_PAGINATION,
      instanceId,
      pagination
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

  // Reset pagination for instance
  const resetPagination = useCallback((instanceId) => {
    dispatch({
      type: PAGINATION_ACTIONS.RESET_PAGINATION,
      instanceId
    });
  }, []);

  // Set loading state
  const setLoading = useCallback((loading) => {
    dispatch({
      type: PAGINATION_ACTIONS.SET_LOADING,
      loading
    });
  }, []);

  // Set error state
  const setError = useCallback((error) => {
    dispatch({
      type: PAGINATION_ACTIONS.SET_ERROR,
      error
    });
  }, []);

  // Clear error state
  const clearError = useCallback(() => {
    dispatch({
      type: PAGINATION_ACTIONS.CLEAR_ERROR
    });
  }, []);

  // Update global config
  const updateGlobalConfig = useCallback((config) => {
    dispatch({
      type: PAGINATION_ACTIONS.SET_CONFIG,
      config
    });
  }, []);

  // Get pagination for instance
  const getPagination = useCallback((instanceId) => {
    return state.instances[instanceId]?.pagination || null;
  }, [state.instances]);

  // Get config for instance
  const getConfig = useCallback((instanceId) => {
    return state.instances[instanceId]?.config || state.globalConfig;
  }, [state.instances, state.globalConfig]);

  // Get all instances
  const getAllInstances = useCallback(() => {
    return Object.keys(state.instances);
  }, [state.instances]);

  // Get instance count
  const getInstanceCount = useCallback(() => {
    return Object.keys(state.instances).length;
  }, [state.instances]);

  // Context value
  const contextValue = useMemo(() => ({
    // State
    state,
    globalConfig: state.globalConfig,
    loading: state.loading,
    error: state.error,

    // Actions
    registerInstance,
    unregisterInstance,
    setPagination,
    updatePagination,
    resetPagination,
    setLoading,
    setError,
    clearError,
    updateGlobalConfig,

    // Getters
    getPagination,
    getConfig,
    getAllInstances,
    getInstanceCount
  }), [
    state,
    registerInstance,
    unregisterInstance,
    setPagination,
    updatePagination,
    resetPagination,
    setLoading,
    setError,
    clearError,
    updateGlobalConfig,
    getPagination,
    getConfig,
    getAllInstances,
    getInstanceCount
  ]);

  return (
    <PaginationContext.Provider value={contextValue}>
      {children}
    </PaginationContext.Provider>
  );
};

// Hook to use pagination context
export const usePaginationContext = () => {
  const context = useContext(PaginationContext);

  if (!context) {
    throw new Error('usePaginationContext must be used within a PaginationProvider');
  }

  return context;
};

// Hook for specific pagination instance
export const usePaginationInstance = (instanceId, config = {}) => {
  const context = usePaginationContext();
  const {
    registerInstance,
    unregisterInstance,
    setPagination,
    updatePagination,
    resetPagination,
    getPagination,
    getConfig
  } = context;

  // Register instance on mount
  React.useEffect(() => {
    if (instanceId) {
      registerInstance(instanceId, config);

      return () => {
        unregisterInstance(instanceId);
      };
    }
  }, [instanceId, config, registerInstance, unregisterInstance]);

  // Get current pagination and config
  const pagination = getPagination(instanceId);
  const instanceConfig = getConfig(instanceId);

  // Enhanced actions for this instance
  const instanceActions = useMemo(() => ({
    setPagination: (newPagination) => setPagination(instanceId, newPagination),
    updatePagination: (updates) => updatePagination(instanceId, updates),
    resetPagination: () => resetPagination(instanceId),

    // Enhanced update from API response
    updateFromApiResponse: (apiResponse) => {
      const transformedPagination = transformApiResponse(apiResponse);
      setPagination(instanceId, transformedPagination);
    },

    // Change page with validation
    changePage: (page) => {
      if (!pagination) return;

      const validation = validatePaginationParams({
        page,
        perPage: pagination.per_page,
        total: pagination.total,
        allowedPerPage: instanceConfig.perPageOptions
      });

      if (validation.isValid) {
        updatePagination(instanceId, { current_page: page });
      } else {
        console.warn('Invalid page change:', validation.errors);
      }
    },

    // Change per page with validation
    changePerPage: (perPage) => {
      if (!pagination) return;

      const validation = validatePaginationParams({
        page: pagination.current_page,
        perPage,
        total: pagination.total,
        allowedPerPage: instanceConfig.perPageOptions
      });

      if (validation.isValid) {
        updatePagination(instanceId, {
          per_page: perPage,
          current_page: 1 // Reset to first page
        });
      } else {
        console.warn('Invalid per page change:', validation.errors);
      }
    },

    // Create API params
    createApiParams: (additionalParams = {}) => {
      if (!pagination) return {};

      return createPaginationParams(pagination, {
        customParams: additionalParams
      });
    }
  }), [
    instanceId,
    pagination,
    instanceConfig,
    setPagination,
    updatePagination,
    resetPagination
  ]);

  // Computed values
  const computedValues = useMemo(() => {
    if (!pagination) {
      return {
        paginationInfo: null,
        hasData: false,
        isEmpty: true
      };
    }

    const paginationInfo = calculatePaginationInfo({
      currentPage: pagination.current_page,
      totalItems: pagination.total,
      itemsPerPage: pagination.per_page
    });

    return {
      paginationInfo,
      hasData: pagination.total > 0,
      isEmpty: pagination.total === 0,
      hasChanged: (prevPagination) => hasPaginationChanged(prevPagination, pagination)
    };
  }, [pagination]);

  return {
    // State
    pagination,
    config: instanceConfig,
    ...computedValues,

    // Actions
    ...instanceActions
  };
};

// Higher-order component for pagination context
export const withPaginationContext = (WrappedComponent, config = {}) => {
  const WithPaginationContext = (props) => {
    return (
      <PaginationProvider {...config}>
        <WrappedComponent {...props} />
      </PaginationProvider>
    );
  };

  WithPaginationContext.displayName = `withPaginationContext(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithPaginationContext;
};

// Export action types for external use
export { PAGINATION_ACTIONS };

export default PaginationContext;
