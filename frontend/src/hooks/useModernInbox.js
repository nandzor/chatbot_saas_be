import { useState, useCallback } from 'react';
import { useApiEndpoint } from './useApi';

/**
 * Custom hook for Modern Inbox API operations
 * Provides reusable functions for all modern inbox features
 */
export const useModernInbox = () => {
  const [loading, setLoading] = useState(false);

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
      const response = await getDashboard();
      return response;
    } catch (error) {
      console.error('Error loading dashboard:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [getDashboard]);

  // Agent operations
  const loadAvailableAgents = useCallback(async (filters = {}) => {
    try {
      const response = await getAvailableAgents(filters);
      return response;
    } catch (error) {
      console.error('Error loading available agents:', error);
      console.error('Failed to load available agents');
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

      if (response.success) {
      console.log('Conversation assigned successfully');
      } else {
      console.error(response.message || 'Failed to assign conversation');
      }

      return response;
    } catch (error) {
      console.error('Error assigning conversation:', error);
      console.error('Failed to assign conversation');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [assignConversation]);

  // Conversation operations
  const loadConversations = useCallback(async (filters = {}) => {
    try {
      const response = await getConversations(filters);
      return response;
    } catch (error) {
      console.error('Error loading conversations:', error);
      console.error('Failed to load conversations');
      throw error;
    }
  }, [getConversations]);

  const loadConversationFilters = useCallback(async () => {
    try {
      const response = await getConversationFilters();
      return response;
    } catch (error) {
      console.error('Error loading conversation filters:', error);
      console.error('Failed to load conversation filters');
      throw error;
    }
  }, [getConversationFilters]);

  const performBulkActions = useCallback(async (conversationIds, action, actionData = {}) => {
    try {
      setLoading(true);
      const response = await applyBulkActions({
        conversation_ids: conversationIds,
        action: action,
        action_data: actionData
      });

      if (response.success) {
      console.log(`Bulk action completed: ${response.data.success_count} successful, ${response.data.error_count} failed`);
      } else {
      console.error(response.message || 'Failed to apply bulk action');
      }

      return response;
    } catch (error) {
      console.error('Error applying bulk action:', error);
      console.error('Failed to apply bulk action');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [applyBulkActions]);

  // Template operations
  const loadTemplates = useCallback(async (category = 'all') => {
    try {
      const response = await getTemplates({ category });
      return response;
    } catch (error) {
      console.error('Error loading templates:', error);
      console.error('Failed to load templates');
      throw error;
    }
  }, [getTemplates]);

  const saveConversationTemplate = useCallback(async (templateData) => {
    try {
      setLoading(true);
      const response = await saveTemplate(templateData);

      if (response.success) {
      console.log('Template saved successfully');
      } else {
        console.error(response.message || 'Failed to save template');
      }

      return response;
    } catch (error) {
      console.error('Error saving template:', error);
      console.error('Failed to save template');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [saveTemplate]);

  // Performance operations
  const loadAgentPerformance = useCallback(async (agentId = null) => {
    try {
      const response = await getAgentPerformance({ agent_id: agentId });
      return response;
    } catch (error) {
      console.error('Error loading agent performance:', error);
      console.error('Failed to load agent performance');
      throw error;
    }
  }, [getAgentPerformance]);

  // AI operations
  const getAiSuggestionsForConversation = useCallback(async (sessionId) => {
    try {
      const response = await getAiSuggestions({ session_id: sessionId });
      return response;
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
      console.error('Failed to get AI suggestions');
      throw error;
    }
  }, [getAiSuggestions]);

  const sendMessageToConversation = useCallback(async (sessionId, content, messageType = 'text') => {
    try {
      setLoading(true);
      const response = await sendMessage({
        session_id: sessionId,
        content: content,
        message_type: messageType
      });

      if (response.success) {
        console.log('Message sent successfully');
      } else {
        console.error(response.message || 'Failed to send message');
      }

      return response;
    } catch (error) {
      console.error('Error sending message:', error);
      console.error('Failed to send message');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [sendMessage]);

  // Analytics operations
  const loadCostStatistics = useCallback(async () => {
    try {
      const response = await getCostStatistics();
      return response;
    } catch (error) {
      console.error('Error loading cost statistics:', error);
      console.error('Failed to load cost statistics');
      throw error;
    }
  }, [getCostStatistics]);

  const loadAssignmentRules = useCallback(async () => {
    try {
      const response = await getAssignmentRules();
      return response;
    } catch (error) {
      console.error('Error loading assignment rules:', error);
      console.error('Failed to load assignment rules');
      throw error;
    }
  }, [getAssignmentRules]);

  return {
    loading,

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
