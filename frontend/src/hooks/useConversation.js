import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import conversationService from '../services/ConversationService';
import { handleError } from '../utils/errorHandler';

/**
 * Custom hook for conversation management
 * Provides easy access to conversation API endpoints with loading states and error handling
 */
export const useConversation = (sessionId) => {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [summary, setSummary] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Load conversation details with messages
   */
  const loadConversation = useCallback(async () => {
    if (!sessionId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await conversationService.getConversation(sessionId);
      setConversation(response.data);
      setMessages(response.data.messages || []);
    } catch (err) {
      const errorResult = handleError(err);
      setError(errorResult.message);
      toast.error(`Gagal memuat percakapan: ${errorResult.message}`);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  /**
   * Load conversation summary
   */
  const loadSummary = useCallback(async () => {
    if (!sessionId) return;

    try {
      const response = await conversationService.getConversationSummary(sessionId);
      setSummary(response.data);
    } catch (err) {
      const errorResult = handleError(err);
      console.error('Error loading conversation summary:', errorResult.message);
    }
  }, [sessionId]);

  /**
   * Load unread message count
   */
  const loadUnreadCount = useCallback(async () => {
    if (!sessionId) return;

    try {
      const response = await conversationService.getUnreadCount(sessionId);
      setUnreadCount(response.data.unread_count || 0);
    } catch (err) {
      const errorResult = handleError(err);
      console.error('Error loading unread count:', errorResult.message);
    }
  }, [sessionId]);

  /**
   * Search messages in conversation
   */
  const searchMessages = useCallback(async (query, filters = {}) => {
    if (!sessionId || !query) return [];

    try {
      const response = await conversationService.searchMessages(sessionId, query, filters);
      return response.data.messages || [];
    } catch (err) {
      const errorResult = handleError(err);
      toast.error(`Gagal mencari pesan: ${errorResult.message}`);
      return [];
    }
  }, [sessionId]);

  /**
   * Load conversation with recent messages
   */
  const loadRecentMessages = useCallback(async (limit = 10) => {
    if (!sessionId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await conversationService.getConversationWithRecent(sessionId, limit);
      setConversation(response.data.conversation);
      setMessages(response.data.conversation.messages || []);
    } catch (err) {
      const errorResult = handleError(err);
      setError(errorResult.message);
      toast.error(`Gagal memuat pesan terbaru: ${errorResult.message}`);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  /**
   * Send a message
   */
  const sendMessage = useCallback(async (messageData) => {
    if (!sessionId) return null;

    try {
      const response = await conversationService.sendMessage(sessionId, messageData);

      // Refresh messages after sending
      await loadConversation();

      return response.data;
    } catch (err) {
      const errorResult = handleError(err);
      toast.error(`Gagal mengirim pesan: ${errorResult.message}`);
      throw err;
    }
  }, [sessionId, loadConversation]);

  /**
   * Mark messages as read
   */
  const markAsRead = useCallback(async (messageIds = []) => {
    if (!sessionId) return;

    try {
      await conversationService.markAsRead(sessionId, messageIds);

      // Refresh unread count
      await loadUnreadCount();

      // Update messages in state
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          messageIds.includes(msg.id)
            ? { ...msg, status: { ...msg.status, is_read: true, read_at: new Date().toISOString() } }
            : msg
        )
      );
    } catch (err) {
      const errorResult = handleError(err);
      console.error('Error marking messages as read:', errorResult.message);
    }
  }, [sessionId, loadUnreadCount]);

  /**
   * Assign session to current user
   */
  const assignToMe = useCallback(async () => {
    if (!sessionId) return;

    try {
      const response = await conversationService.assignToMe(sessionId);
      toast.success('Sesi berhasil ditugaskan kepada Anda');
      return response.data;
    } catch (err) {
      const errorResult = handleError(err);
      toast.error(`Gagal menugaskan sesi: ${errorResult.message}`);
      throw err;
    }
  }, [sessionId]);

  /**
   * Transfer session to another agent
   */
  const transferSession = useCallback(async (transferData) => {
    if (!sessionId) return;

    try {
      const response = await conversationService.transferSession(sessionId, transferData);
      toast.success('Sesi berhasil ditransfer');
      return response.data;
    } catch (err) {
      const errorResult = handleError(err);
      toast.error(`Gagal mentransfer sesi: ${errorResult.message}`);
      throw err;
    }
  }, [sessionId]);

  /**
   * Resolve/End session
   */
  const resolveSession = useCallback(async (resolutionData) => {
    if (!sessionId) return;

    try {
      const response = await conversationService.resolveSession(sessionId, resolutionData);
      toast.success('Sesi berhasil diselesaikan');
      return response.data;
    } catch (err) {
      const errorResult = handleError(err);
      toast.error(`Gagal menyelesaikan sesi: ${errorResult.message}`);
      throw err;
    }
  }, [sessionId]);

  /**
   * Load initial data when sessionId changes
   */
  useEffect(() => {
    if (sessionId) {
      loadConversation();
      loadSummary();
      loadUnreadCount();
    }
  }, [sessionId, loadConversation, loadSummary, loadUnreadCount]);

  return {
    // Data
    conversation,
    messages,
    summary,
    unreadCount,

    // Loading states
    loading,
    error,

    // Actions
    loadConversation,
    loadSummary,
    loadUnreadCount,
    loadRecentMessages,
    searchMessages,
    sendMessage,
    markAsRead,
    assignToMe,
    transferSession,
    resolveSession,

    // Helper functions
    refresh: () => {
      loadConversation();
      loadSummary();
      loadUnreadCount();
    }
  };
};

/**
 * Hook for conversation list management
 * Useful for displaying multiple conversations
 */
export const useConversationList = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Load conversation summaries for multiple sessions
   */
  const loadConversationSummaries = useCallback(async (sessionIds) => {
    if (!sessionIds || sessionIds.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const promises = sessionIds.map(sessionId =>
        conversationService.getConversationSummary(sessionId)
      );

      const responses = await Promise.all(promises);
      const summaries = responses.map(response => response.data);

      setConversations(summaries);
    } catch (err) {
      const errorResult = handleError(err);
      setError(errorResult.message);
      toast.error(`Gagal memuat daftar percakapan: ${errorResult.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load unread counts for multiple sessions
   */
  const loadUnreadCounts = useCallback(async (sessionIds) => {
    if (!sessionIds || sessionIds.length === 0) return {};

    try {
      const promises = sessionIds.map(sessionId =>
        conversationService.getUnreadCount(sessionId)
      );

      const responses = await Promise.all(promises);
      const unreadCounts = {};

      responses.forEach((response, index) => {
        unreadCounts[sessionIds[index]] = response.data.unread_count || 0;
      });

      return unreadCounts;
    } catch (err) {
      const errorResult = handleError(err);
      console.error('Error loading unread counts:', errorResult.message);
      return {};
    }
  }, []);

  return {
    conversations,
    loading,
    error,
    loadConversationSummaries,
    loadUnreadCounts
  };
};

export default useConversation;
