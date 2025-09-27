import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import conversationService from '../services/conversationService';
import { handleError } from '../utils/errorHandler';

// Action types
const CONVERSATION_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_CONVERSATION: 'SET_CONVERSATION',
  SET_MESSAGES: 'SET_MESSAGES',
  SET_SUMMARY: 'SET_SUMMARY',
  SET_UNREAD_COUNT: 'SET_UNREAD_COUNT',
  ADD_MESSAGE: 'ADD_MESSAGE',
  UPDATE_MESSAGE: 'UPDATE_MESSAGE',
  MARK_MESSAGES_READ: 'MARK_MESSAGES_READ',
  CLEAR_CONVERSATION: 'CLEAR_CONVERSATION'
};

// Initial state
const initialState = {
  conversation: null,
  messages: [],
  summary: null,
  unreadCount: 0,
  loading: false,
  error: null,
  currentSessionId: null
};

// Reducer
const conversationReducer = (state, action) => {
  switch (action.type) {
    case CONVERSATION_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };

    case CONVERSATION_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };

    case CONVERSATION_ACTIONS.SET_CONVERSATION:
      return {
        ...state,
        conversation: action.payload.conversation,
        messages: action.payload.messages || [],
        currentSessionId: action.payload.sessionId,
        loading: false,
        error: null
      };

    case CONVERSATION_ACTIONS.SET_MESSAGES:
      return { ...state, messages: action.payload };

    case CONVERSATION_ACTIONS.SET_SUMMARY:
      return { ...state, summary: action.payload };

    case CONVERSATION_ACTIONS.SET_UNREAD_COUNT:
      return { ...state, unreadCount: action.payload };

    case CONVERSATION_ACTIONS.ADD_MESSAGE:
      return {
        ...state,
        messages: [...state.messages, action.payload]
      };

    case CONVERSATION_ACTIONS.UPDATE_MESSAGE:
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg.id === action.payload.id ? { ...msg, ...action.payload.updates } : msg
        )
      };

    case CONVERSATION_ACTIONS.MARK_MESSAGES_READ:
      return {
        ...state,
        messages: state.messages.map(msg =>
          action.payload.messageIds.includes(msg.id)
            ? {
                ...msg,
                status: {
                  ...msg.status,
                  is_read: true,
                  read_at: new Date().toISOString()
                }
              }
            : msg
        ),
        unreadCount: Math.max(0, state.unreadCount - action.payload.messageIds.length)
      };

    case CONVERSATION_ACTIONS.CLEAR_CONVERSATION:
      return {
        ...initialState
      };

    default:
      return state;
  }
};

// Context
const ConversationContext = createContext();

// Provider component
export const ConversationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(conversationReducer, initialState);

  /**
   * Load conversation details
   */
  const loadConversation = useCallback(async (sessionId) => {
    if (!sessionId) return;

    dispatch({ type: CONVERSATION_ACTIONS.SET_LOADING, payload: true });

    try {
      const response = await conversationService.getConversation(sessionId);
      dispatch({
        type: CONVERSATION_ACTIONS.SET_CONVERSATION,
        payload: {
          conversation: response.data,
          messages: response.data.messages || [],
          sessionId
        }
      });
    } catch (err) {
      const errorResult = handleError(err);
      dispatch({ type: CONVERSATION_ACTIONS.SET_ERROR, payload: errorResult.message });
      toast.error(`Gagal memuat percakapan: ${errorResult.message}`);
    }
  }, []);

  /**
   * Load conversation summary
   */
  const loadSummary = useCallback(async (sessionId) => {
    if (!sessionId) return;

    try {
      const response = await conversationService.getConversationSummary(sessionId);
      dispatch({ type: CONVERSATION_ACTIONS.SET_SUMMARY, payload: response.data });
    } catch (err) {
      const errorResult = handleError(err);
      console.error('Error loading conversation summary:', errorResult.message);
    }
  }, []);

  /**
   * Load unread count
   */
  const loadUnreadCount = useCallback(async (sessionId) => {
    if (!sessionId) return;

    try {
      const response = await conversationService.getUnreadCount(sessionId);
      dispatch({
        type: CONVERSATION_ACTIONS.SET_UNREAD_COUNT,
        payload: response.data.unread_count || 0
      });
    } catch (err) {
      const errorResult = handleError(err);
      console.error('Error loading unread count:', errorResult.message);
    }
  }, []);

  /**
   * Search messages
   */
  const searchMessages = useCallback(async (sessionId, query, filters = {}) => {
    if (!sessionId || !query) return [];

    try {
      const response = await conversationService.searchMessages(sessionId, query, filters);
      return response.data.messages || [];
    } catch (err) {
      const errorResult = handleError(err);
      toast.error(`Gagal mencari pesan: ${errorResult.message}`);
      return [];
    }
  }, []);

  /**
   * Load recent messages
   */
  const loadRecentMessages = useCallback(async (sessionId, limit = 10) => {
    if (!sessionId) return;

    dispatch({ type: CONVERSATION_ACTIONS.SET_LOADING, payload: true });

    try {
      const response = await conversationService.getConversationWithRecent(sessionId, limit);
      dispatch({
        type: CONVERSATION_ACTIONS.SET_CONVERSATION,
        payload: {
          conversation: response.data.conversation,
          messages: response.data.conversation.messages || [],
          sessionId
        }
      });
    } catch (err) {
      const errorResult = handleError(err);
      dispatch({ type: CONVERSATION_ACTIONS.SET_ERROR, payload: errorResult.message });
      toast.error(`Gagal memuat pesan terbaru: ${errorResult.message}`);
    }
  }, []);

  /**
   * Send message
   */
  const sendMessage = useCallback(async (sessionId, messageData) => {
    if (!sessionId) return null;

    try {
      const response = await conversationService.sendMessage(sessionId, messageData);

      // Add the new message to the state
      dispatch({
        type: CONVERSATION_ACTIONS.ADD_MESSAGE,
        payload: response.data
      });

      return response.data;
    } catch (err) {
      const errorResult = handleError(err);
      toast.error(`Gagal mengirim pesan: ${errorResult.message}`);
      throw err;
    }
  }, []);

  /**
   * Mark messages as read
   */
  const markAsRead = useCallback(async (sessionId, messageIds = []) => {
    if (!sessionId) return;

    try {
      await conversationService.markAsRead(sessionId, messageIds);
      dispatch({
        type: CONVERSATION_ACTIONS.MARK_MESSAGES_READ,
        payload: { messageIds }
      });
    } catch (err) {
      const errorResult = handleError(err);
      console.error('Error marking messages as read:', errorResult.message);
    }
  }, []);

  /**
   * Assign session to current user
   */
  const assignToMe = useCallback(async (sessionId) => {
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
  }, []);

  /**
   * Transfer session
   */
  const transferSession = useCallback(async (sessionId, transferData) => {
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
  }, []);

  /**
   * Resolve session
   */
  const resolveSession = useCallback(async (sessionId, resolutionData) => {
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
  }, []);

  /**
   * Clear conversation data
   */
  const clearConversation = useCallback(() => {
    dispatch({ type: CONVERSATION_ACTIONS.CLEAR_CONVERSATION });
  }, []);

  /**
   * Refresh conversation data
   */
  const refreshConversation = useCallback(async (sessionId) => {
    if (!sessionId) return;

    await Promise.all([
      loadConversation(sessionId),
      loadSummary(sessionId),
      loadUnreadCount(sessionId)
    ]);
  }, [loadConversation, loadSummary, loadUnreadCount]);

  const value = {
    // State
    ...state,

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
    clearConversation,
    refreshConversation,

    // Helper functions
    hasUnreadMessages: state.unreadCount > 0,
    isCurrentSession: (sessionId) => state.currentSessionId === sessionId,
    getMessageById: (messageId) => state.messages.find(msg => msg.id === messageId),
    getMessagesBySender: (senderType) => state.messages.filter(msg => msg.sender.type === senderType)
  };

  return (
    <ConversationContext.Provider value={value}>
      {children}
    </ConversationContext.Provider>
  );
};

// Custom hook to use conversation context
export const useConversationContext = () => {
  const context = useContext(ConversationContext);
  if (!context) {
    throw new Error('useConversationContext must be used within a ConversationProvider');
  }
  return context;
};

export default ConversationContext;
