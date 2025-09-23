/**
 * Knowledge Management Hook
 * Comprehensive knowledge base management following project patterns
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import KnowledgeBaseService from '@/services/KnowledgeBaseService';
import { handleError } from '@/utils/errorHandler';
import toast from 'react-hot-toast';

export const useKnowledgeManagement = () => {
  const [knowledgeItems, setKnowledgeItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paginationLoading, setPaginationLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    perPage: 10
  });
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    category: 'all',
    type: 'all',
    sortBy: 'created_at',
    sortOrder: 'desc'
  });
  const [categories, setCategories] = useState([]);
  const [statistics, setStatistics] = useState({
    total: 0,
    published: 0,
    drafts: 0,
    categories: 0
  });

  // Ref to track if initial load has been done
  const initialLoadDone = useRef(false);

  // Refs to track current values without causing re-renders
  const paginationRef = useRef(pagination);
  const filtersRef = useRef(filters);

  // Update refs when values change
  useEffect(() => {
    paginationRef.current = pagination;
  }, [pagination]);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  // Load knowledge items - create stable function reference
  const loadKnowledgeItems = useCallback(async (params = {}) => {
    try {
      const isPaginationChange = params.page || params.per_page;

      if (isPaginationChange) {
        setPaginationLoading(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const queryParams = {
        page: params.page || paginationRef.current.currentPage,
        per_page: params.per_page || paginationRef.current.perPage,
        ...filtersRef.current,
        ...params
      };

      if (import.meta.env.DEV) {
        console.log('📚 Loading knowledge items with params:', queryParams);
      }

      const response = await KnowledgeBaseService.list(queryParams);

      if (response.success && response.data) {
        const items = (response.data.data || []).filter(item => item && typeof item === 'object');
        setKnowledgeItems(items);

        if (response.data.pagination) {
          setPagination(prev => ({
            ...prev,
            currentPage: response.data.pagination.current_page || 1,
            totalPages: response.data.pagination.last_page || 1,
            totalItems: response.data.pagination.total || 0,
            perPage: response.data.pagination.per_page || 10
          }));
        }

        // Update statistics
        setStatistics(prev => ({
          ...prev,
          total: response.data.pagination?.total || 0,
          published: items.filter(item => item.workflow_status === 'published').length,
          drafts: items.filter(item => item.workflow_status === 'draft').length
        }));
      } else {
        setKnowledgeItems([]);
        setPagination(prev => ({
          ...prev,
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          perPage: 10
        }));
      }
    } catch (err) {
      const errorMessage = handleError(err);
      setError(errorMessage);
      toast.error(`Gagal memuat knowledge base: ${errorMessage.message}`);

      if (import.meta.env.DEV) {
        // console.error('Error loading knowledge items:', err);
      }

      setPagination(prev => ({
        ...prev,
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        perPage: 10
      }));
    } finally {
      setLoading(false);
      setPaginationLoading(false);
    }
  }, []); // No dependencies - uses refs for current values

  // Load categories
  const loadCategories = useCallback(async () => {
    try {
      console.log('📂 Loading categories...');
      const response = await KnowledgeBaseService.getCategories();
      if (response.success && response.data) {
        setCategories(response.data);
        console.log('✅ Categories loaded successfully');
      }
    } catch (err) {
      console.error('❌ Error loading categories:', err);
    }
  }, []);

  // Create knowledge item
  const createKnowledgeItem = useCallback(async (data) => {
    try {
      setLoading(true);
      const response = await KnowledgeBaseService.create(data);

      if (response.success) {
        toast.success('Knowledge item berhasil dibuat');
        await loadKnowledgeItems();
        return { success: true, data: response.data };
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      const errorMessage = handleError(err);
      toast.error(`Gagal membuat knowledge item: ${errorMessage.message}`);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Remove loadKnowledgeItems dependency

  // Update knowledge item
  const updateKnowledgeItem = useCallback(async (id, data) => {
    try {
      setLoading(true);
      const response = await KnowledgeBaseService.update(id, data);

      if (response.success) {
        toast.success('Knowledge item berhasil diperbarui');
        await loadKnowledgeItems();
        return { success: true, data: response.data };
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      const errorMessage = handleError(err);
      toast.error(`Gagal memperbarui knowledge item: ${errorMessage.message}`);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Remove loadKnowledgeItems dependency

  // Delete knowledge item
  const deleteKnowledgeItem = useCallback(async (id) => {
    try {
      setLoading(true);
      const response = await KnowledgeBaseService.remove(id);

      if (response.success) {
        toast.success('Knowledge item berhasil dihapus');
        await loadKnowledgeItems();
        return { success: true };
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      const errorMessage = handleError(err);
      toast.error(`Gagal menghapus knowledge item: ${errorMessage.message}`);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Remove loadKnowledgeItems dependency

  // Toggle knowledge item status
  const toggleKnowledgeItemStatus = useCallback(async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const response = await updateKnowledgeItem(id, { status: newStatus });

      if (response.success) {
        toast.success(`Knowledge item berhasil ${newStatus === 'active' ? 'diaktifkan' : 'dinonaktifkan'}`);
        return { success: true };
      }
      return response;
    } catch (err) {
      const errorMessage = handleError(err);
      toast.error(`Gagal mengubah status: ${errorMessage.message}`);
      return { success: false, error: errorMessage };
    }
  }, [updateKnowledgeItem]);

  // Publish knowledge item
  const publishKnowledgeItem = useCallback(async (id) => {
    try {
      setLoading(true);
      const response = await KnowledgeBaseService.publish(id);

      if (response.success) {
        toast.success('Knowledge item berhasil dipublikasikan');
        await loadKnowledgeItems();
        return { success: true, data: response.data };
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      const errorMessage = handleError(err);
      toast.error(`Gagal mempublikasikan knowledge item: ${errorMessage.message}`);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Remove loadKnowledgeItems dependency

  // Search knowledge items
  const searchKnowledgeItems = useCallback(async (query, searchFilters = {}) => {
    try {
      setLoading(true);
      const response = await KnowledgeBaseService.search(query, {
        ...filters,
        ...searchFilters
      });

      if (response.success && response.data) {
        setKnowledgeItems(response.data);
        return { success: true, data: response.data };
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      const errorMessage = handleError(err);
      toast.error(`Gagal mencari knowledge items: ${errorMessage.message}`);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Remove filters dependency

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    // Reset to first page when filters change
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      status: 'all',
      category: 'all',
      type: 'all',
      sortBy: 'created_at',
      sortOrder: 'desc'
    });
  }, []);

  // Toggle knowledge item status
  const toggleKnowledgeStatus = useCallback(async (id, newStatus) => {
    try {
      setLoading(true);
      const response = await KnowledgeBaseService.update(id, {
        workflow_status: newStatus
      });

      if (response.success) {
        toast.success(`Knowledge item ${newStatus === 'published' ? 'published' : 'moved to draft'}`);
        await loadKnowledgeItems();
        return { success: true, data: response.data };
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      const errorMessage = handleError(err);
      toast.error(`Failed to update knowledge item status: ${errorMessage.message}`);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Remove loadKnowledgeItems dependency

  // Handle page change
  const handlePageChange = useCallback((page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
    loadKnowledgeItems({ page });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Remove loadKnowledgeItems dependency

  // Handle per page change
  const handlePerPageChange = useCallback((perPage) => {
    setPagination(prev => ({ ...prev, perPage, currentPage: 1 }));
    loadKnowledgeItems({ page: 1, per_page: perPage });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Remove loadKnowledgeItems dependency

  // Load initial data - only run once on mount
  useEffect(() => {
    if (!initialLoadDone.current) {
      console.log('🔄 useKnowledgeManagement: useEffect running - loading initial data');
      initialLoadDone.current = true;
      loadCategories();
      loadKnowledgeItems();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  return {
    // State
    knowledgeItems,
    loading,
    paginationLoading,
    error,
    pagination,
    filters,
    categories,
    statistics,

    // Actions
    loadKnowledgeItems,
    createKnowledgeItem,
    updateKnowledgeItem,
    deleteKnowledgeItem,
    toggleKnowledgeStatus,
    toggleKnowledgeItemStatus, // Keep for backward compatibility
    publishKnowledgeItem,
    searchKnowledgeItems,
    updateFilters,
    resetFilters,
    loadCategories,

    // Pagination helpers
    handlePageChange,
    handlePerPageChange,
    setPagination: (newPagination) => {
      setPagination(prev => ({ ...prev, ...newPagination }));
    }
  };
};

