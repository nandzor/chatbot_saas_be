import React, { createContext, useEffect, useCallback, useState } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { authService } from '@/services/AuthService';

export const RealtimeMessageContext = createContext();

export const RealtimeMessageProvider = ({ children }) => {
  const [organizationId, setOrganizationId] = useState(null);
  const [messageHandlers, setMessageHandlers] = useState(new Map());
  const [typingHandlers, setTypingHandlers] = useState(new Map());

  // Get organization ID from auth service
  useEffect(() => {
    const getOrganizationId = async () => {
      try {
        const user = await authService.getCurrentUser();
        const orgId = user?.organization_id || user?.organization?.id;
        // console.log('User data:', user);
        // console.log('Organization ID:', orgId);
        setOrganizationId(orgId);
      } catch (error) {
        console.error('Failed to get organization ID:', error);
      }
    };

    getOrganizationId();
  }, []);

  // Handle incoming messages
  const handleMessage = useCallback((data) => {
    // console.log('🔔 RealtimeMessageProvider received message:', data);
    // console.log('📋 Current message handlers:', Array.from(messageHandlers.keys()));

    // Notify all registered message handlers
    messageHandlers.forEach((handler, sessionId) => {
      // console.log(`🎯 Checking handler for session: ${sessionId}, message session: ${data.session_id}`);
      if (data.session_id === sessionId || !sessionId) {
        // console.log(`✅ Calling handler for session: ${sessionId}`);
        handler(data);
      }
    });
  }, [messageHandlers]);

  // Handle typing indicators
  const handleTyping = useCallback((data) => {
    // console.log('Received typing indicator:', data);

    // Notify all registered typing handlers
    typingHandlers.forEach((handler, sessionId) => {
      if (data.session_id === sessionId || !sessionId) {
        handler(data);
      }
    });
  }, [typingHandlers]);

  // Handle connection changes
  const handleConnectionChange = useCallback((connected) => {
    // console.log('WebSocket connection status:', connected);
    // console.log('Organization ID when connection changed:', organizationId);
  }, [organizationId]);

  // Initialize WebSocket connection
  const {
    isConnected,
    connectionError,
    sendMessage,
    subscribe,
    unsubscribe,
    sendTypingIndicator,
    markMessageAsRead
  } = useWebSocket(organizationId, handleMessage, handleTyping, handleConnectionChange);

  // Register message handler for a specific session
  const registerMessageHandler = useCallback((sessionId, handler) => {
    // console.log('🔗 Registering message handler for session:', sessionId);
    setMessageHandlers(prev => new Map(prev.set(sessionId, handler)));

    // Subscribe to session-specific channel
    if (isConnected && sessionId) {
      const channelName = `conversation.${sessionId}`;
      // console.log('📡 Subscribing to channel:', channelName);

      // Get auth token and socket_id for proper authentication
      const authToken = localStorage.getItem('jwt_token') || localStorage.getItem('sanctum_token');
      if (authToken && window.wsSocketId) {
        // Use authenticated subscription
        fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000'}/broadcasting/auth`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Bearer ${authToken}`,
            'Accept': 'application/json',
          },
          body: new URLSearchParams({
            channel_name: channelName,
            socket_id: window.wsSocketId
          })
        })
        .then(response => response.json())
        .then(authData => {
          if (authData.auth || (authData.success && authData.data?.auth)) {
            const auth = authData.auth || authData.data.auth;
            subscribe(channelName, auth);
          } else {
            subscribe(channelName);
          }
        })
        .catch(() => {
          subscribe(channelName);
        });
      } else {
        subscribe(channelName);
      }
    }

    return () => {
      // console.log('🔌 Unregistering message handler for session:', sessionId);
      setMessageHandlers(prev => {
        const newMap = new Map(prev);
        newMap.delete(sessionId);
        return newMap;
      });

      // Unsubscribe from session-specific channel
      if (sessionId) {
        const channelName = `conversation.${sessionId}`;
        // console.log('📡 Unsubscribing from channel:', channelName);
        unsubscribe(channelName);
      }
    };
  }, [isConnected, subscribe, unsubscribe]);

  // Register typing handler for a specific session
  const registerTypingHandler = useCallback((sessionId, handler) => {
    setTypingHandlers(prev => new Map(prev.set(sessionId, handler)));

    return () => {
      setTypingHandlers(prev => {
        const newMap = new Map(prev);
        newMap.delete(sessionId);
        return newMap;
      });
    };
  }, []);

  // Send typing indicator
  const sendTyping = useCallback((sessionId, isTyping) => {
    return sendTypingIndicator(sessionId, isTyping);
  }, [sendTypingIndicator]);

  // Mark message as read
  const markAsRead = useCallback((messageId, sessionId) => {
    return markMessageAsRead(messageId, sessionId);
  }, [markMessageAsRead]);

  // Broadcast message to all sessions
  const broadcastMessage = useCallback((data) => {
    return sendMessage(`organization.${organizationId}`, 'message.broadcast', data);
  }, [sendMessage, organizationId]);

  const value = {
    isConnected,
    connectionError,
    organizationId,
    registerMessageHandler,
    registerTypingHandler,
    sendTyping,
    markAsRead,
    broadcastMessage,
    subscribe,
    unsubscribe
  };

  return (
    <RealtimeMessageContext.Provider value={value}>
      {children}
    </RealtimeMessageContext.Provider>
  );
};

export default RealtimeMessageProvider;
