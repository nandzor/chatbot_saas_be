import { useState, useCallback } from 'react';
import { useApiEndpoint } from './useApi';

/**
 * Custom hook for Modern Inbox API operations
 * Provides reusable functions for all modern inbox features
 */
export const useModernInbox = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // API hooks for different endpoints
  const { get: getDashboard } = useApiEndpoint('/modern-inbox/dashboard');
  const { get: getAvailableAgents } = useApiEndpoint('/modern-inbox/agents/available');
  const { get: getConversationFilters } = useApiEndpoint('/modern-inbox/conversations/filters');
  const { get: getConversations } = useApiEndpoint('/modern-inbox/conversations');
  const { get: getTemplates } = useApiEndpoint('/modern-inbox/templates');
  const { get: getAgentPerformance } = useApiEndpoint('/modern-inbox/agents/performance');
  const { get: getAssignmentRules } = useApiEndpoint('/modern-inbox/assignment-rules');
  const { get: getCostStatistics } = useApiEndpoint('/modern-inbox/cost-statistics');

  const { post: assignConversation } = useApiEndpoint('/modern-inbox/conversations/assign', { method: 'POST' });
  const { post: applyBulkActions } = useApiEndpoint('/modern-inbox/conversations/bulk-actions', { method: 'POST' });
  const { post: saveTemplate } = useApiEndpoint('/modern-inbox/templates', { method: 'POST' });
  const { post: sendMessage } = useApiEndpoint('/modern-inbox/conversations/send-message', { method: 'POST' });
  const { post: getAiSuggestions } = useApiEndpoint('/modern-inbox/conversations/ai-suggestions', { method: 'POST' });

  // Dashboard operations
  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getDashboard();
      return response;
    } catch (error) {
      setError(error.message || 'Failed to load dashboard data');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [getDashboard]);

  // Agent operations
  const loadAvailableAgents = useCallback(async (filters = {}) => {
    try {
      setError(null);
      const response = await getAvailableAgents(filters);
      return response;
    } catch (error) {
      setError(error.message || 'Failed to load available agents');
      throw error;
    }
  }, [getAvailableAgents]);

  const assignConversationToAgent = useCallback(async (conversationId, agentId, reason = '') => {
    try {
      setLoading(true);
      const response = await assignConversation({
        conversation_id: conversationId,
        agent_id: agentId,
        assignment_reason: reason
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to assign conversation');
      }

      return response;
    } finally {
      setLoading(false);
    }
  }, [assignConversation]);

  // Conversation operations
  const loadConversations = useCallback(async (filters = {}) => {
    try {
      setError(null);
      const response = await getConversations(filters);
      return response;
    } catch (error) {
      setError(error.message || 'Failed to load conversations');
      throw error;
    }
  }, [getConversations]);

  const loadConversationFilters = useCallback(async () => {
    const response = await getConversationFilters();
    return response;
  }, [getConversationFilters]);

  const performBulkActions = useCallback(async (conversationIds, action, actionData = {}) => {
    try {
      setLoading(true);
      const response = await applyBulkActions({
        conversation_ids: conversationIds,
        action: action,
        action_data: actionData
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to apply bulk action');
      }

      return response;
    } finally {
      setLoading(false);
    }
  }, [applyBulkActions]);

  // Template operations
  const loadTemplates = useCallback(async (category = 'all') => {
    try {
      setError(null);
      const response = await getTemplates({ category });
      return response;
    } catch (error) {
      setError(error.message || 'Failed to load templates');
      throw error;
    }
  }, [getTemplates]);

  const saveConversationTemplate = useCallback(async (templateData) => {
    try {
      setLoading(true);
      const response = await saveTemplate(templateData);

      if (!response.success) {
        throw new Error(response.message || 'Failed to save template');
      }

      return response;
    } finally {
      setLoading(false);
    }
  }, [saveTemplate]);

  // Performance operations
  const loadAgentPerformance = useCallback(async (agentId = null) => {
    const response = await getAgentPerformance({ agent_id: agentId });
    return response;
  }, [getAgentPerformance]);

  // AI operations
  const getAiSuggestionsForConversation = useCallback(async (sessionId) => {
    const response = await getAiSuggestions({ session_id: sessionId });
    return response;
  }, [getAiSuggestions]);

  const sendMessageToConversation = useCallback(async (sessionId, content, messageType = 'text') => {
    try {
      setLoading(true);
      const response = await sendMessage({
        session_id: sessionId,
        content: content,
        message_type: messageType
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to send message');
      }

      return response;
    } finally {
      setLoading(false);
    }
  }, [sendMessage]);

  // Analytics operations
  const loadCostStatistics = useCallback(async () => {
    const response = await getCostStatistics();
    return response;
  }, [getCostStatistics]);

  const loadAssignmentRules = useCallback(async () => {
    const response = await getAssignmentRules();
    return response;
  }, [getAssignmentRules]);

  return {
    loading,
    error,

    // Dashboard
    loadDashboard,

    // Agents
    loadAvailableAgents,
    assignConversationToAgent,

    // Conversations
    loadConversations,
    loadConversationFilters,
    performBulkActions,

    // Templates
    loadTemplates,
    saveConversationTemplate,

    // Performance
    loadAgentPerformance,

    // AI
    getAiSuggestionsForConversation,
    sendMessageToConversation,

    // Analytics
    loadCostStatistics,
    loadAssignmentRules
  };
};

export default useModernInbox;
