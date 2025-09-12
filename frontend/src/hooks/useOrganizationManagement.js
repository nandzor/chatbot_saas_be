import { useState, useEffect, useCallback, useRef } from 'react';
import organizationManagementService from '@/services/OrganizationManagementService';
import toast from 'react-hot-toast';

export const useOrganizationManagement = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    subscriptionStatus: 'all',
    businessType: 'all',
    industry: 'all',
    companySize: 'all'
  });

  // Refs to prevent unnecessary re-renders
  const isInitialLoad = useRef(true);
  const lastLoadParams = useRef(null);

  // Load organizations with current filters and pagination
  const loadOrganizations = useCallback(async (forceReload = false) => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: pagination.currentPage,
        per_page: pagination.itemsPerPage,
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

      const response = await organizationManagementService.getOrganizations(params);

      if (response.success) {

        // Handle different response structures
        const organizationsData = response.data.data || response.data.organizations || response.data || [];
        const paginationData = response.data.pagination || response.data;


        setOrganizations(Array.isArray(organizationsData) ? organizationsData : []);
        setPagination(prev => ({
          ...prev,
          currentPage: paginationData.current_page || paginationData.currentPage || 1,
          itemsPerPage: paginationData.per_page || paginationData.itemsPerPage || 10,
          totalItems: paginationData.total || paginationData.totalItems || 0,
          totalPages: paginationData.last_page || paginationData.totalPages || 1
        }));
      } else {
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
  }, [pagination.currentPage, pagination.itemsPerPage, filters]);

  // Load organizations when filters or pagination changes
  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      loadOrganizations(true); // Force initial load
    } else {
      loadOrganizations(false); // Check for duplicates
    }
  }, [pagination.currentPage, pagination.itemsPerPage, filters]);

  // Create organization
  const createOrganization = useCallback(async (organizationData) => {
    try {
      setLoading(true);
      const response = await organizationManagementService.createOrganization(organizationData);

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
      const response = await organizationManagementService.updateOrganization(id, organizationData);

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
      const response = await organizationManagementService.deleteOrganization(id);

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
      const response = await organizationManagementService.getOrganizationById(id);

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

  // Get organization by code
  const getOrganizationByCode = useCallback(async (orgCode) => {
    try {
      setLoading(true);
      const response = await organizationManagementService.getOrganizationByCode(orgCode);

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

  // Get organization statistics (memoized to prevent unnecessary re-renders)
  const getOrganizationStatistics = useCallback(async () => {
    try {
      const response = await organizationManagementService.getOrganizationStatistics();

      if (response.success) {
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.message };
      }
    } catch (err) {
      return { success: false, error: 'Failed to fetch organization statistics' };
    }
  }, []); // Empty dependency array - this function should be stable

  // Get organization users
  const getOrganizationUsers = useCallback(async (id) => {
    try {
      const response = await organizationManagementService.getOrganizationUsers(id);

      if (response.success) {
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.message };
      }
    } catch (err) {
      return { success: false, error: 'Failed to fetch organization users' };
    }
  }, []);

  // Add user to organization
  const addUserToOrganization = useCallback(async (organizationId, userId, role = 'member') => {
    try {
      setLoading(true);
      const response = await organizationManagementService.addUserToOrganization(organizationId, userId, role);

      if (response.success) {
        toast.success(response.message || 'User added to organization successfully');
        await loadOrganizations(); // Refresh the list
        return { success: true, data: response.data };
      } else {
        toast.error(response.message || 'Failed to add user to organization');
        return { success: false, errors: response.errors };
      }
    } catch (err) {
      const errorMessage = 'Failed to add user to organization';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [loadOrganizations]);

  // Remove user from organization
  const removeUserFromOrganization = useCallback(async (organizationId, userId) => {
    try {
      setLoading(true);
      const response = await organizationManagementService.removeUserFromOrganization(organizationId, userId);

      if (response.success) {
        toast.success(response.message || 'User removed from organization successfully');
        await loadOrganizations(); // Refresh the list
        return { success: true };
      } else {
        toast.error(response.message || 'Failed to remove user from organization');
        return { success: false };
      }
    } catch (err) {
      const errorMessage = 'Failed to remove user from organization';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [loadOrganizations]);

  // Update organization subscription
  const updateOrganizationSubscription = useCallback(async (id, subscriptionData) => {
    try {
      setLoading(true);
      const response = await organizationManagementService.updateOrganizationSubscription(id, subscriptionData);

      if (response.success) {
        toast.success(response.message || 'Organization subscription updated successfully');
        await loadOrganizations(); // Refresh the list
        return { success: true, data: response.data };
      } else {
        toast.error(response.message || 'Failed to update organization subscription');
        return { success: false, errors: response.errors };
      }
    } catch (err) {
      const errorMessage = 'Failed to update organization subscription';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [loadOrganizations]);

  // Get organizations by business type
  const getOrganizationsByBusinessType = useCallback(async (businessType) => {
    try {
      setLoading(true);
      const response = await organizationManagementService.getOrganizationsByBusinessType(businessType);

      if (response.success) {
        return { success: true, data: response.data };
      } else {
        toast.error(response.message || 'Failed to fetch organizations by business type');
        return { success: false };
      }
    } catch (err) {
      const errorMessage = 'Failed to fetch organizations by business type';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Get organizations by industry
  const getOrganizationsByIndustry = useCallback(async (industry) => {
    try {
      setLoading(true);
      const response = await organizationManagementService.getOrganizationsByIndustry(industry);

      if (response.success) {
        return { success: true, data: response.data };
      } else {
        toast.error(response.message || 'Failed to fetch organizations by industry');
        return { success: false };
      }
    } catch (err) {
      const errorMessage = 'Failed to fetch organizations by industry';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Get organizations by company size
  const getOrganizationsByCompanySize = useCallback(async (companySize) => {
    try {
      setLoading(true);
      const response = await organizationManagementService.getOrganizationsByCompanySize(companySize);

      if (response.success) {
        return { success: true, data: response.data };
      } else {
        toast.error(response.message || 'Failed to fetch organizations by company size');
        return { success: false };
      }
    } catch (err) {
      const errorMessage = 'Failed to fetch organizations by company size';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Get active organizations
  const getActiveOrganizations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await organizationManagementService.getActiveOrganizations();

      if (response.success) {
        return { success: true, data: response.data };
      } else {
        toast.error(response.message || 'Failed to fetch active organizations');
        return { success: false };
      }
    } catch (err) {
      const errorMessage = 'Failed to fetch active organizations';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Get trial organizations
  const getTrialOrganizations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await organizationManagementService.getTrialOrganizations();

      if (response.success) {
        return { success: true, data: response.data };
      } else {
        toast.error(response.message || 'Failed to fetch trial organizations');
        return { success: false };
      }
    } catch (err) {
      const errorMessage = 'Failed to fetch trial organizations';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Get expired trial organizations
  const getExpiredTrialOrganizations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await organizationManagementService.getExpiredTrialOrganizations();

      if (response.success) {
        return { success: true, data: response.data };
      } else {
        toast.error(response.message || 'Failed to fetch expired trial organizations');
        return { success: false };
      }
    } catch (err) {
      const errorMessage = 'Failed to fetch expired trial organizations';
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

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      status: 'all',
      subscriptionStatus: 'all',
      businessType: 'all',
      industry: 'all',
      companySize: 'all'
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

    // Actions
    loadOrganizations,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    getOrganizationById,
    getOrganizationByCode,
    getOrganizationStatistics,
    getOrganizationUsers,
    addUserToOrganization,
    removeUserFromOrganization,
    updateOrganizationSubscription,
    getOrganizationsByBusinessType,
    getOrganizationsByIndustry,
    getOrganizationsByCompanySize,
    getActiveOrganizations,
    getTrialOrganizations,
    getExpiredTrialOrganizations,

    // Utilities
    updateFilters,
    updatePagination,
    resetFilters
  };
};
