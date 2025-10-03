import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useEcho } from './useEcho';
import { inboxService } from '@/services/InboxService';
import { authService } from '@/services/AuthService';
import { debounce } from '@/utils/helpers';

/**
 * Custom hook for Agent Inbox functionality with real-time Laravel Echo integration
 * Uses Laravel Echo and Reverb for real-time messaging and session management
 */
export const useAgentInbox = () => {
  // State management
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    priority: 'all',
    category: 'all'
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 15
  });
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Map());

  // Refs for cleanup and optimization
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const organizationIdRef = useRef(null);
  const selectedSessionRef = useRef(null);

  // Get organization ID from auth service
  const getOrganizationId = useCallback(async () => {
    try {
      const user = await authService.getCurrentUser();
      const orgId = user?.organization_id || user?.organization?.id;
      organizationIdRef.current = orgId;
      return orgId;
    } catch (error) {
      // console.error('Failed to get organization ID:', error);
      return null;
    }
  }, []);

  // Initialize organization ID
  useEffect(() => {
    getOrganizationId();
  }, [getOrganizationId]);

  // Echo message handler
  const handleEchoMessage = useCallback((data) => {
    try {
      // console.log('📨 Echo message received:', data);

      // Validate data
      if (!data || typeof data !== 'object') {
        console.warn('Invalid Echo message data:', data);
        return;
      }

      switch (data.type || data.event) {
      case 'message.sent':
      case 'MessageSent':
        // Add new message to current session
        if (data.session_id === selectedSessionRef.current?.id) {
          const messageData = {
            id: data.message_id || data.id,
            content: data.content || data.message_content || data.text || data.body,
            sender_type: data.sender_type,
            sender_name: data.sender_name,
            message_type: data.message_type || data.type,
            is_read: data.is_read || false,
            created_at: data.created_at || data.sent_at || data.timestamp,
            ...data
          };
          setMessages(prev => [...prev, messageData]);
        }
        // Update session last message
        setSessions(prev => prev.map(session =>
          session.id === data.session_id
            ? { ...session, last_message: data, last_activity_at: new Date().toISOString() }
            : session
        ));
        break;

      case 'message.processed':
      case 'MessageProcessed':
        // Add new message to current session (incoming messages from customers)
        if (data.session_id === selectedSessionRef.current?.id) {
          const messageData = {
            id: data.message_id || data.id,
            content: data.content || data.message_content || data.text || data.body,
            sender_type: data.sender_type,
            sender_name: data.sender_name,
            message_type: data.message_type || data.type,
            is_read: data.is_read || false,
            created_at: data.created_at || data.sent_at || data.timestamp,
            ...data
          };
          setMessages(prev => [...prev, messageData]);
        }
        // Update session last message
        setSessions(prev => prev.map(session =>
          session.id === data.session_id
            ? { ...session, last_message: data, last_activity_at: new Date().toISOString() }
            : session
        ));
        break;

      case 'message.read':
      case 'MessageRead':
        // Update message read status
        if (data.session_id === selectedSessionRef.current?.id) {
          setMessages(prev => prev.map(msg =>
            msg.id === data.message_id
              ? { ...msg, is_read: true, read_at: data.read_at }
              : msg
          ));
        }
        break;

      case 'session.updated':
      case 'SessionUpdated':
        // Update session data
        setSessions(prev => prev.map(session =>
          session.id === data.session_id
            ? { ...session, ...data.session }
            : session
        ));
        break;

      case 'session.assigned':
      case 'SessionAssigned':
        // Update session assignment
        setSessions(prev => prev.map(session =>
          session.id === data.session_id
            ? { ...session, agent_id: data.agent_id, status: 'active' }
            : session
        ));
        break;

      case 'session.transferred':
      case 'SessionTransferred':
        // Remove transferred session from current agent's queue
        setSessions(prev => prev.filter(session => session.id !== data.session_id));
        if (selectedSessionRef.current?.id === data.session_id) {
          setSelectedSession(null);
          setMessages([]);
        }
        break;

      case 'session.ended':
      case 'SessionEnded':
        // Update session status
        setSessions(prev => prev.map(session =>
          session.id === data.session_id
            ? { ...session, status: 'ended', ended_at: data.ended_at }
            : session
        ));
        if (selectedSessionRef.current?.id === data.session_id) {
          setSelectedSession(prev => ({ ...prev, status: 'ended', ended_at: data.ended_at }));
        }
        break;

      default:
        // console.log('Unhandled Echo message type:', data.type || data.event);
    }
    } catch (error) {
      console.error('Error handling Echo message:', error, data);
    }
  }, []);

  // Echo typing handler
  const handleEchoTyping = useCallback((data) => {
    try {
      // console.log('⌨️ Echo typing indicator received:', data);

      // Validate data
      if (!data || typeof data !== 'object') {
        console.warn('Invalid Echo typing data:', data);
        return;
      }

      if (data.session_id === selectedSessionRef.current?.id) {
      setTypingUsers(prev => {
        const newMap = new Map(prev);
        if (data.is_typing) {
          newMap.set(data.user_id, {
            user_id: data.user_id,
            user_name: data.user_name,
            timestamp: Date.now()
          });
        } else {
          newMap.delete(data.user_id);
        }
        return newMap;
      });

      // Auto-clear typing indicator after 3 seconds
      if (data.is_typing) {
        setTimeout(() => {
          setTypingUsers(prev => {
            const newMap = new Map(prev);
            newMap.delete(data.user_id);
            return newMap;
          });
        }, 3000);
      }
    }
    } catch (error) {
      console.error('Error handling Echo typing:', error, data);
    }
  }, []);

  // Echo connection handler
  const handleConnectionChange = useCallback((connected) => {
    try {
      // console.log('🔌 Echo connection status:', connected);
      setIsConnected(connected);
    } catch (error) {
      console.error('Error handling Echo connection change:', error);
    }
  }, []);

  // Initialize Laravel Echo connection
  const {
    isConnected: echoConnected,
    subscribeToConversation,
    unsubscribeFromConversation,
    sendTypingIndicator,
    markMessageAsRead
  } = useEcho({
    organizationId: organizationIdRef.current,
        onMessage: handleEchoMessage,
        onTyping: handleEchoTyping,
    onConnectionChange: handleConnectionChange
  });

  // Update connection status
  useEffect(() => {
    setIsConnected(echoConnected);
  }, [echoConnected]);

  // Filtered sessions with memoization for performance
  const filteredSessions = useMemo(() => {
    return sessions.filter(session => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const customerName = (session.customer?.name ||
          `${session.customer?.first_name || ''} ${session.customer?.last_name || ''}`.trim() ||
          'Unknown Customer').toLowerCase();
        const customerEmail = (session.customer?.email || '').toLowerCase();
        const lastMessage = (session.last_message?.body || session.last_message || '').toLowerCase();

        if (!customerName.includes(searchTerm) &&
            !customerEmail.includes(searchTerm) &&
            !lastMessage.includes(searchTerm)) {
          return false;
        }
      }

      // Status filter
      if (filters.status !== 'all' && session.status !== filters.status) {
        return false;
      }

      // Priority filter
      if (filters.priority !== 'all' && session.priority !== filters.priority) {
        return false;
      }

      // Category filter
      if (filters.category !== 'all' && session.category !== filters.category) {
        return false;
      }

      return true;
    });
  }, [sessions, filters]);

  // Load sessions
  const loadSessions = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);

    try {
      const result = await inboxService.getSessions({
        page: pagination.currentPage,
        per_page: pagination.itemsPerPage,
        ...params
      });

      if (result.success) {
        setSessions(result.data || []);
        setPagination(prev => ({
          ...prev,
          currentPage: result.pagination?.current_page || result.pagination?.page || prev.currentPage,
          totalPages: result.pagination?.last_page || result.pagination?.total_pages || 1,
          totalItems: result.pagination?.total || result.pagination?.total_items || 0
        }));
      } else {
        setError(result.error || 'Failed to load sessions');
      }
    } catch (err) {
      setError(err.message || 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.itemsPerPage]);

  // Load active sessions
  const loadActiveSessions = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);

    try {
      const result = await inboxService.getActiveSessions({
        page: pagination.currentPage,
        per_page: pagination.itemsPerPage,
        ...params
      });

      if (result.success) {
        setSessions(result.data || []);
        setPagination(prev => ({
          ...prev,
          currentPage: result.pagination?.current_page || result.pagination?.page || prev.currentPage,
          totalPages: result.pagination?.last_page || result.pagination?.total_pages || 1,
          totalItems: result.pagination?.total || result.pagination?.total_items || 0
        }));
      } else {
        setError(result.error || 'Failed to load active sessions');
      }
    } catch (err) {
      setError(err.message || 'Failed to load active sessions');
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.itemsPerPage]);

  // Load pending sessions
  const loadPendingSessions = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);

    try {
      const result = await inboxService.getPendingSessions({
        page: pagination.currentPage,
        per_page: pagination.itemsPerPage,
        ...params
      });

      if (result.success) {
        setSessions(result.data || []);
        setPagination(prev => ({
          ...prev,
          currentPage: result.pagination?.current_page || result.pagination?.page || prev.currentPage,
          totalPages: result.pagination?.last_page || result.pagination?.total_pages || 1,
          totalItems: result.pagination?.total || result.pagination?.total_items || 0
        }));
      } else {
        setError(result.error || 'Failed to load pending sessions');
      }
    } catch (err) {
      setError(err.message || 'Failed to load pending sessions');
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.itemsPerPage]);

  // Select session
  const selectSession = useCallback(async (session) => {
    if (!session) return;

    // Unsubscribe from previous session channel
    if (selectedSessionRef.current?.id && isConnected) {
      unsubscribeFromConversation(selectedSessionRef.current.id);
    }

    setSelectedSession(session);
    selectedSessionRef.current = session;
    setMessages([]);
    setError(null);

    try {
      // Load session messages
      const result = await inboxService.getSessionMessages(session.id);
      if (result.success) {
        // Reverse the order so latest messages appear at the bottom
        const messages = (result.data || []).reverse();
        setMessages(messages);
      } else {
        setError(result.error || 'Failed to load messages');
      }

      // Subscribe to session-specific Echo channel
      if (isConnected && session.id) {
        subscribeToConversation(session.id);
      }
    } catch (err) {
      setError(err.message || 'Failed to select session');
    }
  }, [isConnected, subscribeToConversation, unsubscribeFromConversation]);

  // Handle typing indicator
  const handleTyping = useCallback((sessionId, isTyping) => {
    if (!sessionId) return;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Send typing indicator via Echo
    sendTypingIndicator(sessionId, isTyping);

    // Auto-stop typing after 1 second
    if (isTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        sendTypingIndicator(sessionId, false);
      }, 1000);
    }
  }, [sendTypingIndicator]);

  // Send message
  const sendMessage = useCallback(async (sessionId, message, type = 'text') => {
    if (!sessionId || !message) return;

    setSendingMessage(true);
    setError(null);

    try {
      const result = await inboxService.sendMessage(sessionId, message, type);
      if (result.success) {
        // Message will be added via Echo event
        // Clear typing indicator
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        handleTyping(sessionId, false);
      } else {
        setError(result.error || 'Failed to send message');
      }
    } catch (err) {
      setError(err.message || 'Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  }, [handleTyping]);

  // Transfer session
  const transferSession = useCallback(async (sessionId, transferData) => {
    if (!sessionId || !transferData.agent_id) return;

    setLoading(true);
    setError(null);

    try {
      const result = await inboxService.transferSession(sessionId, transferData);
      if (result.success) {
        // Session will be removed via Echo event
        if (selectedSessionRef.current?.id === sessionId) {
          setSelectedSession(null);
          setMessages([]);
        }
      } else {
        setError(result.error || 'Failed to transfer session');
      }
    } catch (err) {
      setError(err.message || 'Failed to transfer session');
    } finally {
      setLoading(false);
    }
  }, []);

  // End session
  const endSession = useCallback(async (sessionId, endData) => {
    if (!sessionId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await inboxService.endSession(sessionId, endData);
      if (result.success) {
        // Session status will be updated via Echo event
      } else {
        setError(result.error || 'Failed to end session');
      }
    } catch (err) {
      setError(err.message || 'Failed to end session');
    } finally {
      setLoading(false);
    }
  }, []);

  // Assign session
  const assignSession = useCallback(async (sessionId) => {
    if (!sessionId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await inboxService.assignSession(sessionId);
      if (result.success) {
        // Session assignment will be updated via Echo event
      } else {
        setError(result.error || 'Failed to assign session');
      }
    } catch (err) {
      setError(err.message || 'Failed to assign session');
    } finally {
      setLoading(false);
    }
  }, []);

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Refresh sessions
  const refreshSessions = useCallback(() => {
    loadSessions();
  }, [loadSessions]);

  // Debounced search
  const debouncedSearch = useCallback((searchTerm) => {
    const debouncedFn = debounce((term) => {
      updateFilters({ search: term });
    }, 300);
    debouncedFn(searchTerm);
  }, [updateFilters]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      // Unsubscribe from current session channel
      if (selectedSessionRef.current?.id && isConnected) {
        unsubscribeFromConversation(selectedSessionRef.current.id);
      }
    };
  }, [isConnected, unsubscribeFromConversation]);

  // Load initial sessions
  useEffect(() => {
    if (organizationIdRef.current) {
      loadSessions();
    }
  }, [loadSessions]);

  return {
    // State
    sessions,
    selectedSession,
    messages,
    loading,
    sendingMessage,
    error,
    filters,
    pagination,
    isConnected,
    filteredSessions,
    typingUsers,

    // Actions
    loadSessions,
    loadActiveSessions,
    loadPendingSessions,
    selectSession,
    sendMessage,
    transferSession,
    endSession,
    assignSession,
    updateFilters,
    refreshSessions,
    handleTyping,
    debouncedSearch,

    // Refs for component use
    messagesEndRef,
    typingTimeoutRef,

    // Echo methods
    markMessageAsRead
  };
};

export default useAgentInbox;
