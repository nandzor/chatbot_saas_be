import { useState, useCallback } from 'react';
import { useApiEndpoint } from './useApi';

/**
 * Custom hook for Agent Management API operations
 * Provides reusable functions for all agent management features
 */
export const useAgentManagement = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // API hooks for different endpoints
  const { get: getAgents } = useApiEndpoint('/agent-management/agents');
  const { post: createAgent } = useApiEndpoint('/agent-management/agents', { method: 'POST' });
  const { get: getAgent } = useApiEndpoint('/agent-management/agents');
  const { put: updateAgent } = useApiEndpoint('/agent-management/agents', { method: 'PUT' });
  const { del: deleteAgent } = useApiEndpoint('/agent-management/agents', { method: 'DELETE' });

  const { patch: updateAgentStatus } = useApiEndpoint('/agent-management/agents', { method: 'PATCH' });
  const { patch: updateAgentAvailability } = useApiEndpoint('/agent-management/agents', { method: 'PATCH' });

  const { post: bulkUpdateStatus } = useApiEndpoint('/agent-management/agents/bulk-status', { method: 'POST' });
  const { post: bulkDelete } = useApiEndpoint('/agent-management/agents/bulk-delete', { method: 'POST' });

  const { get: getStatistics } = useApiEndpoint('/agent-management/agents/statistics');
  const { get: getPerformance } = useApiEndpoint('/agent-management/agents');
  const { get: getSkills } = useApiEndpoint('/agent-management/agents');
  const { post: updateSkills } = useApiEndpoint('/agent-management/agents', { method: 'POST' });
  const { get: getWorkload } = useApiEndpoint('/agent-management/agents');
  const { get: searchAgents } = useApiEndpoint('/agent-management/agents/search');
  const { get: getFilters } = useApiEndpoint('/agent-management/agents/filters');

  // Agent CRUD operations
  const loadAgents = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAgents(filters);
      return response;
    } catch (error) {
      setError(error.message || 'Failed to load agents');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [getAgents]);

  const createNewAgent = useCallback(async (agentData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await createAgent(agentData);
      return response;
    } catch (error) {
      setError(error.message || 'Failed to create agent');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [createAgent]);

  const loadAgent = useCallback(async (agentId) => {
    try {
      setError(null);
      const response = await getAgent(`/${agentId}`);
      return response;
    } catch (error) {
      setError(error.message || 'Failed to load agent');
      throw error;
    }
  }, [getAgent]);

  const updateAgentData = useCallback(async (agentId, agentData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await updateAgent(`/${agentId}`, agentData);
      return response;
    } catch (error) {
      setError(error.message || 'Failed to update agent');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [updateAgent]);

  const deleteAgentData = useCallback(async (agentId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await deleteAgent(`/${agentId}`);
      return response;
    } catch (error) {
      setError(error.message || 'Failed to delete agent');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [deleteAgent]);

  // Agent status and availability management
  const updateAgentStatusData = useCallback(async (agentId, status) => {
    try {
      setError(null);
      const response = await updateAgentStatus(`/${agentId}/status`, { status });
      return response;
    } catch (error) {
      setError(error.message || 'Failed to update agent status');
      throw error;
    }
  }, [updateAgentStatus]);

  const updateAgentAvailabilityData = useCallback(async (agentId, availabilityStatus) => {
    try {
      setError(null);
      const response = await updateAgentAvailability(`/${agentId}/availability`, { availability_status: availabilityStatus });
      return response;
    } catch (error) {
      setError(error.message || 'Failed to update agent availability');
      throw error;
    }
  }, [updateAgentAvailability]);

  // Bulk operations
  const bulkUpdateAgentStatus = useCallback(async (agentIds, status) => {
    try {
      setLoading(true);
      setError(null);
      const response = await bulkUpdateStatus({ agent_ids: agentIds, status });
      return response;
    } catch (error) {
      setError(error.message || 'Failed to bulk update agent status');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [bulkUpdateStatus]);

  const bulkDeleteAgents = useCallback(async (agentIds) => {
    try {
      setLoading(true);
      setError(null);
      const response = await bulkDelete({ agent_ids: agentIds });
      return response;
    } catch (error) {
      setError(error.message || 'Failed to bulk delete agents');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [bulkDelete]);

  // Statistics and analytics
  const loadStatistics = useCallback(async () => {
    try {
      setError(null);
      const response = await getStatistics();
      return response;
    } catch (error) {
      setError(error.message || 'Failed to load statistics');
      throw error;
    }
  }, [getStatistics]);

  const loadAgentPerformance = useCallback(async (agentId) => {
    try {
      setError(null);
      const response = await getPerformance(`/${agentId}/performance`);
      return response;
    } catch (error) {
      setError(error.message || 'Failed to load agent performance');
      throw error;
    }
  }, [getPerformance]);

  const loadAgentSkills = useCallback(async (agentId) => {
    try {
      setError(null);
      const response = await getSkills(`/${agentId}/skills`);
      return response;
    } catch (error) {
      setError(error.message || 'Failed to load agent skills');
      throw error;
    }
  }, [getSkills]);

  const updateAgentSkills = useCallback(async (agentId, skills) => {
    try {
      setLoading(true);
      setError(null);
      const response = await updateSkills(`/${agentId}/skills`, { skills });
      return response;
    } catch (error) {
      setError(error.message || 'Failed to update agent skills');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [updateSkills]);

  const loadAgentWorkload = useCallback(async (agentId) => {
    try {
      setError(null);
      const response = await getWorkload(`/${agentId}/workload`);
      return response;
    } catch (error) {
      setError(error.message || 'Failed to load agent workload');
      throw error;
    }
  }, [getWorkload]);

  // Search and filters
  const searchAgentsData = useCallback(async (query) => {
    try {
      setError(null);
      const response = await searchAgents({ q: query });
      return response;
    } catch (error) {
      setError(error.message || 'Failed to search agents');
      throw error;
    }
  }, [searchAgents]);

  const loadFilters = useCallback(async () => {
    try {
      setError(null);
      const response = await getFilters();
      return response;
    } catch (error) {
      setError(error.message || 'Failed to load filters');
      throw error;
    }
  }, [getFilters]);

  return {
    loading,
    error,

    // CRUD operations
    loadAgents,
    createNewAgent,
    loadAgent,
    updateAgentData,
    deleteAgentData,

    // Status and availability
    updateAgentStatusData,
    updateAgentAvailabilityData,

    // Bulk operations
    bulkUpdateAgentStatus,
    bulkDeleteAgents,

    // Analytics and performance
    loadStatistics,
    loadAgentPerformance,
    loadAgentSkills,
    updateAgentSkills,
    loadAgentWorkload,

    // Search and filters
    searchAgentsData,
    loadFilters,
  };
};

export default useAgentManagement;
