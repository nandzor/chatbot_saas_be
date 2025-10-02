import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { inboxService } from '@/services/InboxService';
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages';

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

  // Real-time messaging
  const { isConnected, registerMessageHandler, sendTyping } = useRealtimeMessages();

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
        
        // Add visual indicators for unread messages
        const sessionsWithIndicators = sessionsData.map(session => ({
          ...session,
          has_unread: (session.unread_count || 0) > 0,
          last_message_sender: session.last_message ? 'unknown' : null,
          last_message_time: session.last_message_at || session.last_activity_at
        }));
        
        setSessions(sessionsWithIndicators);
        setPagination({
          page: response.current_page || 1,
          per_page: response.per_page || 20,
          total: response.total || sessionsData.length,
          last_page: response.last_page || 1
        });
        
        console.log('📋 Loaded sessions with unread indicators:', sessionsWithIndicators.length);
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
        
        // Add visual indicators for unread messages
        const sessionsWithIndicators = sessionsData.map(session => ({
          ...session,
          has_unread: (session.unread_count || 0) > 0,
          last_message_sender: session.last_message ? 'unknown' : null,
          last_message_time: session.last_message_at || session.last_activity_at
        }));
        
        setSessions(sessionsWithIndicators);
        console.log('📋 Loaded active sessions with unread indicators:', sessionsWithIndicators.length);
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
        
        // Add visual indicators for unread messages
        const sessionsWithIndicators = sessionsData.map(session => ({
          ...session,
          has_unread: (session.unread_count || 0) > 0,
          last_message_sender: session.last_message ? 'unknown' : null, // Placeholder, will be updated by real-time
          last_message_time: session.last_message_at || session.last_activity_at
        }));
        
        setSessions(sessionsWithIndicators);
        console.log('📋 Loaded pending sessions with unread indicators:', sessionsWithIndicators.length);
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
   * Select a session and mark messages as read
   */
  const selectSession = useCallback(async (session) => {
    setSelectedSession(session);
    await loadSessionMessages(session.id);

    // Mark messages as read - reset unread count and visual indicators
    if (session.unread_count > 0) {
      setSessions(prev => prev.map(s =>
        s.id === session.id
          ? { 
              ...s, 
              unread_count: 0,
              has_unread: false,
              last_read_at: new Date().toISOString()
            }
          : s
      ));
      
      console.log('📖 Marked session as read:', session.id);
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
   * Create message object from event data
   */
  const createMessageFromEventData = useCallback((eventData, sessionId) => {
    const message = {
      id: eventData.message_id || eventData.id || `msg-${Date.now()}`,
      session_id: sessionId || eventData.session_id,
      sender_type: eventData.sender_type || (eventData.from_me ? 'agent' : 'customer'),
      sender_name: eventData.sender_name || (eventData.from_me ? 'You' : 'Customer'),
      message_text: eventData.message_content || eventData.content || eventData.text || eventData.body,
      text: eventData.message_content || eventData.content || eventData.text || eventData.body,
      content: { text: eventData.message_content || eventData.content || eventData.text || eventData.body },
      message_type: eventData.message_type || eventData.type || 'text',
      is_read: eventData.is_read || false,
      created_at: eventData.sent_at || eventData.timestamp || eventData.created_at || new Date().toISOString(),
      sent_at: eventData.sent_at || eventData.timestamp || eventData.created_at || new Date().toISOString(),
      delivered_at: eventData.delivered_at,
      media_url: eventData.media_url,
      media_type: eventData.media_type,
      metadata: eventData.metadata
    };
    
    console.log('🔨 Created message from event data:', {
      messageId: message.id,
      sessionId: message.session_id,
      senderType: message.sender_type,
      messageText: message.message_text,
      createdAt: message.created_at
    });
    
    return message;
  }, []);

  /**
   * Handle typing indicator
   */
  const handleTyping = useCallback((sessionId, isTyping) => {
    if (sessionId) {
      sendTyping(sessionId, isTyping);
    }
  }, [sendTyping]);

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Session-specific message handling (simplified - global handler covers most cases)
  useEffect(() => {
    if (!selectedSession?.id) return;

    const unregisterMessage = registerMessageHandler(selectedSession.id, (data) => {
      console.log('🔔 AgentInbox received session-specific message:', data);

      // Parse JSON string if data is a string
      let eventData = data.data || data;
      if (typeof eventData === 'string') {
        try {
          eventData = JSON.parse(eventData);
        } catch (e) {
          console.error('❌ Failed to parse session event data:', e);
          return;
        }
      }

      // Handle message.processed events for the selected session
      if (eventData.event === 'message.processed' || eventData.event === 'MessageProcessed') {
        console.log('🔔 Session-specific handler processing MessageProcessed:', {
          sessionId: selectedSession.id,
          messageId: eventData.message_id,
          senderType: eventData.sender_type,
          messageText: eventData.message_content || eventData.content || eventData.text
        });
        
        const newMessage = createMessageFromEventData(eventData, selectedSession.id);

        // Add message to the current session's messages
        setMessages(prev => {
          const exists = prev.some(msg => msg.id === newMessage.id);
          if (exists) return prev;
          return [...prev, newMessage];
        });

        // Auto-scroll to bottom when new message arrives
        setTimeout(() => {
          scrollToBottom();
        }, 100);
        
        console.log('✅ Message added to current session messages');
        return;
      }

      // Handle other message events (message.sent, MessageSent, etc.)
      if (eventData.event === 'message.sent' || eventData.event === 'MessageSent' || eventData.type === 'message') {
        const newMessage = createMessageFromEventData(eventData, selectedSession.id);

          setMessages(prev => {
          const exists = prev.some(msg => msg.id === newMessage.id);
          if (exists) return prev;
          return [...prev, newMessage];
        });

        // Auto-scroll to bottom when new message arrives
        setTimeout(() => {
          scrollToBottom();
        }, 100);
      }
    });

    return () => {
      unregisterMessage();
    };
  }, [selectedSession?.id, registerMessageHandler, scrollToBottom, createMessageFromEventData]);

  // Global message handler for all sessions - OPTIMIZED
  useEffect(() => {
    console.log('🔔 Registering global message handler for AgentInbox');
    
    // Track processed message IDs to prevent duplicates
    const processedMessageIds = new Set();
    
    const unregisterGlobalMessage = registerMessageHandler('*', (data) => {
      console.log('🔔 AgentInbox received global message:', data);
      console.log('🔔 Raw data type:', typeof data);
      console.log('🔔 Raw data keys:', Object.keys(data));
      
      // Extract event data from nested structure if needed
      let eventData = data.data || data;
      
      // Parse JSON string if data is a string
      if (typeof eventData === 'string') {
        try {
          eventData = JSON.parse(eventData);
          console.log('🔔 Parsed JSON string:', eventData);
        } catch (e) {
          console.error('❌ Failed to parse event data:', e);
          return;
        }
      }
      
      const eventType = eventData.event || data.event;
      
      console.log('🔔 Event type:', eventType, 'Session ID:', eventData.session_id);
      console.log('🔔 Event data structure:', {
        hasEvent: !!eventData.event,
        hasSessionId: !!eventData.session_id,
        hasMessageId: !!eventData.message_id,
        hasSenderType: !!eventData.sender_type,
        hasMessageContent: !!eventData.message_content
      });

      // Handle message.processed events for all sessions
      if (eventType === 'message.processed' || eventType === 'MessageProcessed') {
        console.log('🔔 Processing message.processed event:', {
          messageId: eventData.message_id,
          sessionId: eventData.session_id,
          senderType: eventData.sender_type,
          messageText: eventData.message_content || eventData.content || eventData.text,
          createdAt: eventData.created_at
        });
        
        // Check for duplicate message processing
        const messageId = eventData.message_id;
        if (processedMessageIds.has(messageId)) {
          console.log('⚠️ Duplicate message.processed event detected, skipping:', messageId);
          return;
        }
        
        // Mark message as processed
        processedMessageIds.add(messageId);
        
        // Clean up old message IDs (keep only last 100)
        if (processedMessageIds.size > 100) {
          const firstId = processedMessageIds.values().next().value;
          processedMessageIds.delete(firstId);
        }
        
        console.log('✅ Processing message.processed event for session:', eventData.session_id);
        
        // Create message object
        const newMessage = createMessageFromEventData(eventData);

        // Update session last message for ALL sessions with proper unread count
        setSessions(prev => {
          console.log('🔄 Updating sessions with new message:', {
            sessionId: eventData.session_id,
            messageText: newMessage.message_text,
            senderType: newMessage.sender_type,
            currentSessionsCount: prev.length
          });
          
          const updated = prev.map(s => {
            if (s.id === eventData.session_id) {
              // Calculate unread count: increment if message is from customer, reset if from agent
              let newUnreadCount = s.unread_count || 0;
              
              if (newMessage.sender_type === 'customer') {
                // Customer message: increment unread count
                newUnreadCount = newUnreadCount + 1;
                console.log('📈 Incrementing unread count for customer message:', {
                  sessionId: s.id,
                  oldCount: s.unread_count || 0,
                  newCount: newUnreadCount
                });
              }
              // Agent/bot message: don't increment (agent replied) - no need to reassign
              
              const updatedSession = {
                ...s,
                last_message_at: newMessage.created_at,
                last_message: newMessage.message_text,
                unread_count: newUnreadCount,
                // Add visual indicators
                has_unread: newUnreadCount > 0,
                last_message_sender: newMessage.sender_type,
                last_message_time: newMessage.created_at
              };
              
              console.log('✅ Session updated:', {
                sessionId: s.id,
                lastMessage: updatedSession.last_message,
                unreadCount: updatedSession.unread_count,
                hasUnread: updatedSession.has_unread
              });
              
              return updatedSession;
            }
            return s;
          });
          
          const updatedSession = updated.find(s => s.id === eventData.session_id);
          console.log('🔄 Session update completed:', {
            sessionId: eventData.session_id,
            unreadCount: updatedSession?.unread_count,
            hasUnread: updatedSession?.has_unread,
            lastMessage: updatedSession?.last_message
          });
          
          return updated;
        });

        // If this is for the currently selected session, also add to messages
        if (selectedSession?.id === eventData.session_id) {
          setMessages(prev => {
            const exists = prev.some(msg => msg.id === newMessage.id);
            if (exists) return prev;
            return [...prev, newMessage];
          });

          // Auto-scroll to bottom when new message arrives
          setTimeout(() => {
            scrollToBottom();
          }, 100);
          
          // If agent is viewing the session, mark as read immediately
          if (newMessage.sender_type === 'customer') {
            setSessions(prev => prev.map(s =>
              s.id === eventData.session_id
                ? { 
                    ...s, 
                    unread_count: 0,
                    has_unread: false,
                    last_read_at: new Date().toISOString()
                  }
                : s
            ));
            console.log('📖 Auto-marked customer message as read (agent viewing)');
          }
        }
        
        console.log('✅ Session list updated in real-time');
      }

      // Handle session updates
      if (eventType === 'session.updated' || eventType === 'session.assigned') {
        setSessions(prev => prev.map(s => {
          if (s.id === eventData.session_id) {
            const updatedSession = { ...s, ...eventData.session_data };
            // Preserve unread count and visual indicators
            updatedSession.has_unread = (updatedSession.unread_count || 0) > 0;
            return updatedSession;
          }
          return s;
        }));
        console.log('🔄 Session updated:', eventData.session_id);
      }

      // Handle session status changes
      if (eventType === 'session.status_changed') {
        setSessions(prev => prev.map(s => {
          if (s.id === eventData.session_id) {
            return { 
              ...s, 
              status: eventData.status,
              // Preserve unread indicators
              has_unread: (s.unread_count || 0) > 0
            };
          }
          return s;
        }));
        console.log('🔄 Session status changed:', eventData.session_id, 'to', eventData.status);
      }
    });

    return () => {
      console.log('🔔 Unregistering global message handler for AgentInbox');
      unregisterGlobalMessage();
    };
  }, [registerMessageHandler, selectedSession?.id, scrollToBottom, createMessageFromEventData]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      // Copy ref values to avoid stale closure issues
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
    isConnected,
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
