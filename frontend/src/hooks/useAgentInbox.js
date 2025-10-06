import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { inboxService } from '@/services/InboxService';

/**
 * Custom hook for Agent Inbox functionality
 * Provides session management, messaging, and real-time updates with performance optimizations
 */
export const useAgentInbox = () => {
  // State management
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    priority: 'all',
    category: 'all'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 20,
    total: 0,
    last_page: 1
  });

  // Real-time messaging (disabled)
  // const { isConnected, registerMessageHandler, sendTyping } = useRealtimeMessages();

  // Refs
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const lastFetchTimeRef = useRef(0);

  // Memoized filtered sessions for better performance
  const filteredSessions = useMemo(() => {
    return sessions.filter(session => {
      const customer = session.customer || {};
      const matchesSearch = !filters.search ||
        customer.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
        customer.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
        customer.first_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
        customer.last_name?.toLowerCase().includes(filters.search.toLowerCase());

      // Map backend status to frontend status
      const sessionStatus = session.is_active ? 'active' : 'ended';
      const matchesStatus = filters.status === 'all' || sessionStatus === filters.status;

      const matchesPriority = filters.priority === 'all' || session.priority === filters.priority;
      const matchesCategory = filters.category === 'all' || session.category === filters.category;

      return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
    });
  }, [sessions, filters]);

  // Debounced search to prevent excessive API calls
  const debouncedSearch = useCallback((searchTerm) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchTerm }));
    }, 300);
  }, []);

  // Throttled API calls to prevent spam
  const throttledApiCall = useCallback((apiFunction, ...args) => {
    const now = Date.now();
    if (now - lastFetchTimeRef.current < 1000) { // 1 second throttle
      console.log('🚫 API call throttled');
      return Promise.resolve();
    }

    lastFetchTimeRef.current = now;
    console.log('🚀 Making API call:', apiFunction.name, args);
    return apiFunction(...args);
  }, []);

  /**
   * Load sessions from API with throttling
   */
  const loadSessions = useCallback(async (page = 1, newFilters = filters) => {
    try {
      setLoading(true);
      setError(null);

      const response = await throttledApiCall(
        inboxService.getSessions.bind(inboxService),
        {
          page,
          per_page: pagination.per_page,
          ...newFilters
        }
      );

      if (response?.success) {
        // Backend returns sessions directly in data, not data.data
        const sessionsData = response.data || [];
        setSessions(sessionsData);
        setPagination({
          page: response.current_page || 1,
          per_page: response.per_page || 20,
          total: response.total || sessionsData.length,
          last_page: response.last_page || 1
        });
      } else {
        throw new Error(response?.message || 'Failed to load sessions');
      }
    } catch (err) {
      console.error('Error loading sessions:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.per_page, throttledApiCall]);

  /**
   * Load active sessions with throttling
   */
  const loadActiveSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await throttledApiCall(
        inboxService.getActiveSessions.bind(inboxService),
        {
          per_page: 50
        }
      );

      if (response?.success) {
        // Backend returns sessions directly in data, not data.data
        const sessionsData = response.data || [];
        setSessions(sessionsData);
      } else {
        throw new Error(response?.message || 'Failed to load active sessions');
      }
    } catch (err) {
      console.error('Error loading active sessions:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [throttledApiCall]);

  /**
   * Load pending sessions with throttling
   */
  const loadPendingSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await throttledApiCall(
        inboxService.getPendingSessions.bind(inboxService),
        {
          per_page: 50
        }
      );

      if (response?.success) {
        // Backend returns sessions directly in data, not data.data
        const sessionsData = response.data || [];
        setSessions(sessionsData);
      } else {
        throw new Error(response?.message || 'Failed to load pending sessions');
      }
    } catch (err) {
      console.error('Error loading pending sessions:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [throttledApiCall]);

  /**
   * Load session messages with throttling
   */
  const loadSessionMessages = useCallback(async (sessionId, page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const response = await throttledApiCall(
        inboxService.getSessionMessages.bind(inboxService),
        sessionId,
        {
          page,
          per_page: 50,
          sort_by: 'created_at',
          sort_direction: 'desc'
        }
      );

      console.log('🔍 Session messages response:', response);

      if (response?.success) {
        // Backend returns messages directly in data, not data.data
        const messagesData = response.data || [];
        console.log('🔍 Messages data:', messagesData.length, messagesData);

        // Transform backend message format to frontend format
        const transformedMessages = messagesData.map(msg => ({
          id: msg.id,
          session_id: msg.chat_session_id,
          sender_type: msg.sender_type,
          sender_name: msg.sender_name,
          message_text: msg.content,
          text: msg.content,
          content: { text: msg.content },
          message_type: msg.message_type,
          is_read: msg.is_read,
          created_at: msg.created_at,
          sent_at: msg.created_at,
          delivered_at: msg.delivered_at,
          media_url: msg.media_url,
          media_type: msg.media_type,
          metadata: msg.metadata
        }));

        console.log('🔍 Transformed messages:', transformedMessages);

        if (page === 1) {
          setMessages(transformedMessages.reverse()); // Reverse to show oldest first
        } else {
          setMessages(prev => [...transformedMessages.reverse(), ...prev]);
        }
      } else {
        console.error('❌ Response not successful:', response);
        throw new Error(response?.message || 'Failed to load messages');
      }
    } catch (err) {
      console.error('Error loading session messages:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [throttledApiCall]);

  /**
   * Select a session
   */
  const selectSession = useCallback(async (session) => {
    setSelectedSession(session);
    await loadSessionMessages(session.id);

    // Mark messages as read
    if (session.unread_count > 0) {
      // Update local state immediately
      setSessions(prev => prev.map(s =>
        s.id === session.id
          ? { ...s, unread_count: 0 }
          : s
      ));
    }
  }, [loadSessionMessages]);

  /**
   * Send a message
   */
  const sendMessage = useCallback(async (sessionId, content, type = 'text') => {
    try {
      setLoading(true);
      setError(null);

      const response = await inboxService.sendMessage.bind(inboxService)(sessionId, content, type);

      if (response.success) {
        // Add message to local state immediately for better UX
        const newMessage = {
          id: response.data?.id || `msg-${Date.now()}`,
          session_id: sessionId,
          sender_type: 'agent',
          sender_name: 'You',
          message_text: content,
          text: content,
          content: { text: content },
          message_type: type,
          is_read: true,
          created_at: new Date().toISOString(),
          sent_at: new Date().toISOString(),
          delivered_at: null,
          media_url: null,
          media_type: null,
          metadata: {}
        };

        setMessages(prev => [...prev, newMessage]);

        // Update session last message
        setSessions(prev => prev.map(s =>
          s.id === sessionId
            ? {
                ...s,
                last_message_at: new Date().toISOString(),
                last_message: content
              }
            : s
        ));

        return response;
      } else {
        throw new Error(response.message || 'Failed to send message');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Transfer session
   */
  const transferSession = useCallback(async (sessionId, transferData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await inboxService.transferSession.bind(inboxService)(sessionId, transferData);

      if (response.success) {
        // Update session in local state
        setSessions(prev => prev.map(s =>
          s.id === sessionId
            ? { ...s, status: 'transferred', agent_id: transferData.agent_id }
            : s
        ));

        // Clear selected session if it was transferred
        if (selectedSession?.id === sessionId) {
          setSelectedSession(null);
          setMessages([]);
        }

        return response;
      } else {
        throw new Error(response.message || 'Failed to transfer session');
      }
    } catch (err) {
      console.error('Error transferring session:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedSession]);

  /**
   * End session
   */
  const endSession = useCallback(async (sessionId, endData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await inboxService.endSession.bind(inboxService)(sessionId, endData);

      if (response.success) {
        // Update session in local state
        setSessions(prev => prev.map(s =>
          s.id === sessionId
            ? { ...s, status: 'ended', is_active: false }
            : s
        ));

        // Clear selected session if it was ended
        if (selectedSession?.id === sessionId) {
          setSelectedSession(null);
          setMessages([]);
        }

        return response;
      } else {
        throw new Error(response.message || 'Failed to end session');
      }
    } catch (err) {
      console.error('Error ending session:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedSession]);

  /**
   * Assign session to current agent
   */
  const assignSession = useCallback(async (sessionId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await inboxService.assignSession.bind(inboxService)(sessionId, null); // null means assign to current user

      if (response.success) {
        // Update session in local state
        setSessions(prev => prev.map(s =>
          s.id === sessionId
            ? { ...s, status: 'active', agent_id: response.data?.agent_id }
            : s
        ));

        return response;
      } else {
        throw new Error(response.message || 'Failed to assign session');
      }
    } catch (err) {
      console.error('Error assigning session:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update filters with debouncing
   */
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));

    // Debounce API call
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      loadSessions(1, { ...filters, ...newFilters });
    }, 300);
  }, [filters, loadSessions]);

  /**
   * Refresh sessions
   */
  const refreshSessions = useCallback(() => {
    loadSessions(pagination.page, filters);
  }, [loadSessions, pagination.page, filters]);

  /**
   * Auto-scroll to bottom
   */
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  /**
   * Handle typing indicator (disabled - realtime messaging removed)
   */
  const handleTyping = useCallback((_sessionId, _isTyping) => {
    // Realtime messaging disabled
    // if (sessionId) {
    //   sendTyping(sessionId, isTyping);
    // }
  }, []);

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Polling fallback for message updates
  useEffect(() => {
    if (!selectedSession?.id) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await throttledApiCall(
          inboxService.getSessionMessages.bind(inboxService),
          selectedSession.id,
          {
            page: 1,
            per_page: 50,
            sort_by: 'created_at',
            sort_direction: 'desc'
          }
        );

        if (response?.success && response.data) {
          const messagesData = response.data || [];
          const transformedMessages = messagesData.map(msg => ({
            id: msg.id,
            session_id: msg.chat_session_id,
            sender_type: msg.sender_type,
            sender_name: msg.sender_name,
            message_text: msg.content,
            text: msg.content,
            content: { text: msg.content },
            message_type: msg.message_type,
            is_read: msg.is_read,
            created_at: msg.created_at,
            sent_at: msg.created_at,
            delivered_at: msg.delivered_at,
            media_url: msg.media_url,
            media_type: msg.media_type,
            metadata: msg.metadata
          }));

          const reversedMessages = transformedMessages.reverse();

          setMessages(prev => {
            // Only update if there are new messages
            const currentIds = new Set(prev.map(m => m.id));
            const newMessages = reversedMessages.filter(m => !currentIds.has(m.id));

            if (newMessages.length > 0) {
              console.log('🔄 Polling found new messages:', newMessages.length);
              return [...prev, ...newMessages];
            }
            return prev;
          });
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(pollInterval);
  }, [selectedSession?.id, throttledApiCall]);

  // Real-time message handling (disabled - realtime messaging removed)
  // useEffect(() => {
  //   if (!selectedSession?.id) return;
  //   // All realtime messaging functionality removed
  // }, [selectedSession?.id]);

  // Global message handler (disabled - realtime messaging removed)
  // useEffect(() => {
  //   // All realtime messaging functionality removed
  // }, []);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      const typingTimeout = typingTimeoutRef.current;
      const searchTimeout = searchTimeoutRef.current;

      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, []);

  return {
    // State
    sessions,
    selectedSession,
    messages,
    loading,
    error,
    filters,
    pagination,
    // isConnected, // Disabled - realtime messaging removed
    filteredSessions,

    // Actions
    loadSessions,
    loadActiveSessions,
    loadPendingSessions,
    loadSessionMessages,
    selectSession,
    sendMessage,
    transferSession,
    endSession,
    assignSession,
    updateFilters,
    refreshSessions,
    handleTyping,
    debouncedSearch,

    // Refs
    messagesEndRef,
    typingTimeoutRef
  };
};

export default useAgentInbox;
