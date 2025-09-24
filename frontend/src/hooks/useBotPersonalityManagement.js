/**
 * Bot Personality Management Hook
 * Hook untuk mengelola bot personalities dengan CRUD operations
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import BotPersonalityService from '@/services/BotPersonalityService';

const botPersonalityService = new BotPersonalityService();

export const useBotPersonalityManagement = () => {
  // State
  const [botPersonalities, setBotPersonalities] = useState([]);
  const [loading, setLoading] = useState(true); // Start with loading true
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    perPage: 15,
    total: 0,
    lastPage: 1,
    from: 0,
    to: 0,
    hasMorePages: false
  });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    language: '',
    formality_level: ''
  });
  const [statistics, setStatistics] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    withN8nWorkflow: 0,
    withWahaSession: 0,
    withKnowledgeBaseItem: 0
  });

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

  // Ref to track if initial load has been done
  const initialLoadDone = useRef(false);

  // Load bot personalities - create completely stable function reference
  const loadBotPersonalities = useRef(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = {
        page: params.page || paginationRef.current.currentPage,
        per_page: params.per_page || paginationRef.current.perPage,
        ...filtersRef.current,
        ...params
      };

      const response = await botPersonalityService.getList(queryParams);

      if (response.success && response.data) {
        // Handle both nested and direct data structure
        const itemsArray = Array.isArray(response.data) ? response.data : (response.data.data || []);

        // Filter out null/invalid items
        const items = itemsArray.filter(item => item && typeof item === 'object' && item.id);
        setBotPersonalities(items);

        // Update pagination - handle both nested and direct structure
        const paginationData = response.data.pagination || response.pagination;
        if (paginationData) {
          setPagination(paginationData);
        }

        // Calculate statistics
        const stats = {
          total: items.length,
          active: items.filter(item => item.status === 'active').length,
          inactive: items.filter(item => item.status === 'inactive').length,
          withN8nWorkflow: items.filter(item => item.n8n_workflow_id).length,
          withWahaSession: items.filter(item => item.waha_session_id).length,
          withKnowledgeBaseItem: items.filter(item => item.knowledge_base_item_id).length
        };
        setStatistics(stats);

        // Bot personalities loaded successfully
      }
    } catch (err) {
      // Error loading bot personalities
      const errorMessage = err.message || 'Failed to load bot personalities';
      setError(errorMessage);
      toast.error(errorMessage);

      // Reset data on error
      setBotPersonalities([]);
      setPagination({
        currentPage: 1,
        perPage: 15,
        total: 0,
        lastPage: 1,
        from: 0,
        to: 0,
        hasMorePages: false
      });
      setStatistics({
        total: 0,
        active: 0,
        inactive: 0,
        withN8nWorkflow: 0,
        withWahaSession: 0,
        withKnowledgeBaseItem: 0
      });
    } finally {
      setLoading(false);
    }
  });

  // Load initial data and handle filter changes with debounce
  useEffect(() => {
    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      loadBotPersonalities.current();
    } else {
      // Debounce filter changes to prevent multiple API calls
      const timeoutId = setTimeout(() => {
        loadBotPersonalities.current();
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]); // Run on mount and when filters change

  // Create bot personality
  const createBotPersonality = useCallback(async (data) => {
    try {
      setLoading(true);
      const response = await botPersonalityService.create(data);

      if (response.success) {
        await loadBotPersonalities.current();
        toast.success('Bot personality created successfully');
        return response.data;
      }

      throw new Error(response.message || 'Failed to create bot personality');
    } catch (err) {
      // Error creating bot personality
      setError(err.message || 'Failed to create bot personality');
      toast.error(err.message || 'Failed to create bot personality');
      throw err;
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update bot personality
  const updateBotPersonality = useCallback(async (id, data) => {
    try {
      setLoading(true);
      const response = await botPersonalityService.update(id, data);

      if (response.success) {
        await loadBotPersonalities.current();
        toast.success('Bot personality updated successfully');
        return response.data;
      }

      throw new Error(response.message || 'Failed to update bot personality');
    } catch (err) {
      // Error updating bot personality
      setError(err.message || 'Failed to update bot personality');
      toast.error(err.message || 'Failed to update bot personality');
      throw err;
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Delete bot personality
  const deleteBotPersonality = useCallback(async (id) => {
    try {
      setLoading(true);
      const response = await botPersonalityService.delete(id);

      if (response.success) {
        await loadBotPersonalities.current();
        toast.success('Bot personality deleted successfully');
        return response.data;
      }

      throw new Error(response.message || 'Failed to delete bot personality');
    } catch (err) {
      // Error deleting bot personality
      setError(err.message || 'Failed to delete bot personality');
      toast.error(err.message || 'Failed to delete bot personality');
      throw err;
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Toggle bot personality status
  const toggleBotPersonalityStatus = useCallback(async (id) => {
    try {
      const botPersonality = botPersonalities.find(bp => bp.id === id);
      if (!botPersonality) {
        throw new Error('Bot personality not found');
      }

      const newStatus = botPersonality.status === 'active' ? 'inactive' : 'active';
      await updateBotPersonality(id, { status: newStatus });
    } catch (err) {
      // Error toggling bot personality status
      toast.error(err.message || 'Failed to toggle bot personality status');
      throw err;
    }
  }, [botPersonalities, updateBotPersonality]);

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => {
      const updated = { ...prev, ...newFilters };
      // Only update if filters actually changed
      if (JSON.stringify(updated) !== JSON.stringify(prev)) {
        return updated;
      }
      return prev;
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  // Handle page change
  const handlePageChange = useCallback(async (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
    await loadBotPersonalities.current({ page });
  }, []);

  // Handle per page change
  const handlePerPageChange = useCallback(async (perPage) => {
    setPagination(prev => ({ ...prev, perPage, currentPage: 1 }));
    await loadBotPersonalities.current({ per_page: perPage, page: 1 });
  }, []);

  // Search bot personalities
  const searchBotPersonalities = useCallback(async (searchTerm) => {
    updateFilters({ search: searchTerm });
    await loadBotPersonalities.current({ search: searchTerm, page: 1 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    // Data
    botPersonalities,
    loading,
    error,
    pagination,
    statistics,
    filters,

    // Actions
    loadBotPersonalities: loadBotPersonalities.current,
    createBotPersonality,
    updateBotPersonality,
    deleteBotPersonality,
    toggleBotPersonalityStatus,
    updateFilters,
    handlePageChange,
    handlePerPageChange,
    searchBotPersonalities,

    // Utilities
    clearError: () => setError(null)
  };
};

export default useBotPersonalityManagement;
