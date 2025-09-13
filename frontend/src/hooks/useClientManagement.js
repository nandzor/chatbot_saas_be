import { useState, useEffect, useCallback, useRef } from 'react';
import clientManagementService from '@/services/ClientManagementService';
import { toast } from 'react-hot-toast';

export const useClientManagement = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 15
  });
  const [filters, setFilters] = useState({
    search: '',
    status: 'active',
    businessType: 'all',
    industry: 'all',
    companySize: 'all'
  });
  const [sorting, setSorting] = useState({
    sortBy: 'created_at',
    sortOrder: 'desc'
  });

  // Refs to prevent unnecessary re-renders
  const isInitialLoad = useRef(true);
  const lastLoadParams = useRef(null);

  // Load organizations with current filters, pagination, and sorting
  const loadOrganizations = useCallback(async (forceReload = false) => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: pagination.currentPage,
        per_page: pagination.itemsPerPage,
        sort_by: sorting.sortBy,
        sort_order: sorting.sortOrder,
        ...filters
      };

      // Remove 'all' values from filters
      Object.keys(params).forEach(key => {
        if (params[key] === 'all') {
          delete params[key];
        }
      });

      // Check if params have changed to prevent unnecessary API calls
      const paramsString = JSON.stringify(params);
      if (!forceReload && lastLoadParams.current === paramsString) {
        setLoading(false);
        return;
      }

      lastLoadParams.current = paramsString;

      const response = await clientManagementService.getOrganizations(params);

      if (response.success) {

        // Handle different response structures
        const organizationsData = response.data.data || response.data.organizations || response.data || [];
        const paginationData = response.data.pagination || response.data;


        const finalOrganizations = Array.isArray(organizationsData) ? organizationsData : [];

        setOrganizations(finalOrganizations);
        setPagination(prev => ({
          ...prev,
          currentPage: paginationData.current_page || paginationData.currentPage || 1,
          itemsPerPage: paginationData.per_page || paginationData.itemsPerPage || 15,
          totalItems: paginationData.total || paginationData.totalItems || 0,
          totalPages: paginationData.last_page || paginationData.totalPages || 1
        }));

        // Clear any previous errors if we have data
        if (finalOrganizations.length > 0) {
          setError(null);
        }
      } else {
        // API response failed
        setError(response.message);
        toast.error(response.message);
      }
    } catch (err) {
      const errorMessage = 'Failed to load organizations';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.itemsPerPage, filters, sorting]);

  // Load organizations when filters, pagination, or sorting changes
  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      loadOrganizations(true); // Force initial load
    } else {
      loadOrganizations(false); // Check for duplicates
    }
  }, [pagination.currentPage, pagination.itemsPerPage, filters, sorting]);

  // Create organization
  const createOrganization = useCallback(async (organizationData) => {
    try {
      setLoading(true);
      const response = await clientManagementService.createOrganization(organizationData);

      if (response.success) {
        toast.success(response.message || 'Organization created successfully');
        await loadOrganizations(); // Refresh the list
        return { success: true, data: response.data };
      } else {
        toast.error(response.message || 'Failed to create organization');
        return { success: false, errors: response.errors };
      }
    } catch (err) {
      const errorMessage = 'Failed to create organization';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [loadOrganizations]);

  // Update organization
  const updateOrganization = useCallback(async (id, organizationData) => {
    try {
      setLoading(true);
      const response = await clientManagementService.updateOrganization(id, organizationData);

      if (response.success) {
        toast.success(response.message || 'Organization updated successfully');
        await loadOrganizations(); // Refresh the list
        return { success: true, data: response.data };
      } else {
        toast.error(response.message || 'Failed to update organization');
        return { success: false, errors: response.errors };
      }
    } catch (err) {
      const errorMessage = 'Failed to update organization';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [loadOrganizations]);

  // Delete organization
  const deleteOrganization = useCallback(async (id) => {
    try {
      setLoading(true);
      const response = await clientManagementService.deleteOrganization(id);

      if (response.success) {
        toast.success(response.message || 'Organization deleted successfully');
        await loadOrganizations(); // Refresh the list
        return { success: true };
      } else {
        toast.error(response.message || 'Failed to delete organization');
        return { success: false };
      }
    } catch (err) {
      const errorMessage = 'Failed to delete organization';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [loadOrganizations]);

  // Get organization by ID
  const getOrganizationById = useCallback(async (id) => {
    try {
      setLoading(true);
      const response = await clientManagementService.getOrganizationById(id);

      if (response.success) {
        return { success: true, data: response.data };
      } else {
        toast.error(response.message || 'Failed to fetch organization');
        return { success: false, error: response.message };
      }
    } catch (err) {
      const errorMessage = 'Failed to fetch organization';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Update organization status
  const updateOrganizationStatus = useCallback(async (id, status) => {
    try {
      setLoading(true);
      const response = await clientManagementService.updateOrganizationStatus(id, status);

      if (response.success) {
        toast.success(response.message || 'Organization status updated successfully');
        await loadOrganizations(); // Refresh the list
        return { success: true, data: response.data };
      } else {
        toast.error(response.message || 'Failed to update organization status');
        return { success: false, errors: response.errors };
      }
    } catch (err) {
      const errorMessage = 'Failed to update organization status';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [loadOrganizations]);

  // Get organization statistics
  const getOrganizationStatistics = useCallback(async () => {
    try {
      const response = await clientManagementService.getOrganizationStatistics();

      if (response.success) {
        return { success: true, data: response.data };
      } else {
        // Statistics API failed
        return { success: false, error: response.message };
      }
    } catch (err) {
      return { success: false, error: 'Failed to fetch organization statistics' };
    }
  }, []);

  // Get organizations by status
  const getOrganizationsByStatus = useCallback(async (status) => {
    try {
      setLoading(true);
      const response = await clientManagementService.getOrganizationsByStatus(status);

      if (response.success) {
        return { success: true, data: response.data };
      } else {
        toast.error(response.message || 'Failed to fetch organizations by status');
        return { success: false };
      }
    } catch (err) {
      const errorMessage = 'Failed to fetch organizations by status';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Search organizations
  const searchOrganizations = useCallback(async (searchTerm, additionalFilters = {}) => {
    try {
      setLoading(true);
      const response = await clientManagementService.searchOrganizations(searchTerm, additionalFilters);

      if (response.success) {
        setOrganizations(response.data);
        return { success: true, data: response.data };
      } else {
        toast.error(response.message || 'Failed to search organizations');
        return { success: false };
      }
    } catch (err) {
      const errorMessage = 'Failed to search organizations';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => {
      const updated = { ...prev, ...newFilters };
      // Only update if filters actually changed
      if (JSON.stringify(prev) === JSON.stringify(updated)) {
        return prev;
      }
      return updated;
    });
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page
  }, []);

  // Update pagination
  const updatePagination = useCallback((newPagination) => {
    setPagination(prev => {
      const updated = { ...prev, ...newPagination };
      // Only update if pagination actually changed
      if (JSON.stringify(prev) === JSON.stringify(updated)) {
        return prev;
      }
      return updated;
    });
  }, []);

  // Update sorting
  const updateSorting = useCallback((newSorting) => {
    setSorting(prev => {
      const updated = { ...prev, ...newSorting };
      // Only update if sorting actually changed
      if (JSON.stringify(prev) === JSON.stringify(updated)) {
        return prev;
      }
      return updated;
    });
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      status: 'active',
      businessType: 'all',
      industry: 'all',
      companySize: 'all'
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  // Reset sorting
  const resetSorting = useCallback(() => {
    setSorting({
      sortBy: 'created_at',
      sortOrder: 'desc'
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  return {
    // State
    organizations,
    loading,
    error,
    pagination,
    filters,
    sorting,

    // Actions
    loadOrganizations,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    getOrganizationById,
    updateOrganizationStatus,
    getOrganizationStatistics,
    getOrganizationsByStatus,
    searchOrganizations,

    // Utilities
    updateFilters,
    updatePagination,
    updateSorting,
    resetFilters,
    resetSorting
  };
};
