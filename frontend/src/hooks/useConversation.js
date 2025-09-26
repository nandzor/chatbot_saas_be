import { useState, useEffect, useCallback } from 'react';
import conversationService from '../services/conversationService';
import { useWebSocket } from './useWebSocket';

export const useConversation = (sessionId) => {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);

  const {
    isConnected,
    registerMessageHandler,
    registerTypingHandler,
    sendTyping,
    markAsRead
  } = useWebSocket();

  // Load conversation details
  const loadConversation = useCallback(async () => {
    if (!sessionId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await conversationService.getConversation(sessionId);
      setConversation(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load conversation');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  // Load messages with pagination
  const loadMessages = useCallback(async (options = {}) => {
    if (!sessionId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await conversationService.getMessages(sessionId, options);
      setMessages(response.data.messages);
      setPagination(response.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  // Send message
  const sendMessage = useCallback(async (messageText, options = {}) => {
    if (!sessionId || !messageText.trim()) return;

    try {
      const messageData = conversationService.formatMessageData(messageText, options);
      const response = await conversationService.sendMessage(sessionId, messageData);

      // Add new message to local state
      setMessages(prev => [...prev, response.data]);

      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message');
      throw err;
    }
  }, [sessionId]);

  // Update session
  const updateSession = useCallback(async (updateData) => {
    if (!sessionId) return;

    try {
      const response = await conversationService.updateSession(sessionId, updateData);
      setConversation(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update session');
      throw err;
    }
  }, [sessionId]);

  // Assign session to current user
  const assignToMe = useCallback(async () => {
    if (!sessionId) return;

    try {
      const response = await conversationService.assignToMe(sessionId);
      setConversation(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign session');
      throw err;
    }
  }, [sessionId]);

  // Transfer session
  const transferSession = useCallback(async (agentId, options = {}) => {
    if (!sessionId || !agentId) return;

    try {
      const transferData = conversationService.formatTransferData(agentId, options);
      const response = await conversationService.transferSession(sessionId, transferData);
      setConversation(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to transfer session');
      throw err;
    }
  }, [sessionId]);

  // Resolve session
  const resolveSession = useCallback(async (resolutionType, options = {}) => {
    if (!sessionId || !resolutionType) return;

    try {
      const resolutionData = conversationService.formatResolutionData(resolutionType, options);
      const response = await conversationService.resolveSession(sessionId, resolutionData);
      setConversation(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resolve session');
      throw err;
    }
  }, [sessionId]);

  // Mark messages as read
  const markMessagesAsRead = useCallback(async (messageIds = []) => {
    if (!sessionId) return;

    try {
      await conversationService.markAsRead(sessionId, messageIds);

      // Update local state
      setMessages(prev => prev.map(msg =>
        messageIds.length === 0 || messageIds.includes(msg.id)
          ? { ...msg, status: { ...msg.status, is_read: true, read_at: new Date().toISOString() } }
          : msg
      ));
    } catch (err) {
      console.error('Failed to mark messages as read:', err);
    }
  }, [sessionId]);

  // Send typing indicator
  const sendTypingIndicator = useCallback(async (isTyping = true) => {
    if (!sessionId) return;

    try {
      await conversationService.sendTypingIndicator(sessionId, isTyping);
    } catch (err) {
      console.error('Failed to send typing indicator:', err);
    }
  }, [sessionId]);

  // Get typing status
  const getTypingStatus = useCallback(async () => {
    if (!sessionId) return;

    try {
      const response = await conversationService.getTypingStatus(sessionId);
      setTypingUsers(response.data.typing_users || []);
    } catch (err) {
      console.error('Failed to get typing status:', err);
    }
  }, [sessionId]);

  // WebSocket message handler
  useEffect(() => {
    if (!isConnected || !sessionId) return;

    const handleNewMessage = (message) => {
      if (message.session_id === sessionId) {
        setMessages(prev => {
          // Check if message already exists
          const exists = prev.some(msg => msg.id === message.id);
          if (exists) return prev;

          return [...prev, message];
        });
      }
    };

    const handleMessageRead = (data) => {
      if (data.session_id === sessionId) {
        setMessages(prev => prev.map(msg =>
          msg.id === data.message_id
            ? { ...msg, status: { ...msg.status, is_read: true, read_at: data.read_at } }
            : msg
        ));
      }
    };

    const handleTypingIndicator = (data) => {
      if (data.session_id === sessionId) {
        setTypingUsers(prev => {
          if (data.is_typing) {
            return [...prev.filter(user => user.user_id !== data.user_id), {
              user_id: data.user_id,
              user_name: data.user_name,
              started_at: data.started_at
            }];
          } else {
            return prev.filter(user => user.user_id !== data.user_id);
          }
        });
      }
    };

    // Register handlers
    registerMessageHandler(handleNewMessage);
    registerTypingHandler(handleTypingIndicator);

    // Cleanup
    return () => {
      // Unregister handlers if needed
    };
  }, [isConnected, sessionId, registerMessageHandler, registerTypingHandler]);

  // Load initial data
  useEffect(() => {
    if (sessionId) {
      loadConversation();
      loadMessages();
      getTypingStatus();
    }
  }, [sessionId, loadConversation, loadMessages, getTypingStatus]);

  return {
    // State
    conversation,
    messages,
    loading,
    error,
    pagination,
    typingUsers,
    isConnected,

    // Actions
    loadConversation,
    loadMessages,
    sendMessage,
    updateSession,
    assignToMe,
    transferSession,
    resolveSession,
    markMessagesAsRead,
    sendTypingIndicator,
    getTypingStatus,

    // Utilities
    clearError: () => setError(null),
    refresh: () => {
      loadConversation();
      loadMessages();
    }
  };
};
