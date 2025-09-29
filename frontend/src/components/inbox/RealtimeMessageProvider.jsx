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
        console.log('User data:', user);
        console.log('Organization ID:', orgId);
        setOrganizationId(orgId);
      } catch (error) {
        console.error('Failed to get organization ID:', error);
      }
    };

    getOrganizationId();
  }, []);

  // Handle incoming messages
  const handleMessage = useCallback((data) => {
    console.log('Received message:', data);

    // Notify all registered message handlers
    messageHandlers.forEach((handler, sessionId) => {
      if (data.session_id === sessionId || !sessionId) {
        handler(data);
      }
    });
  }, [messageHandlers]);

  // Handle typing indicators
  const handleTyping = useCallback((data) => {
    console.log('Received typing indicator:', data);

    // Notify all registered typing handlers
    typingHandlers.forEach((handler, sessionId) => {
      if (data.session_id === sessionId || !sessionId) {
        handler(data);
      }
    });
  }, [typingHandlers]);

  // Handle connection changes
  const handleConnectionChange = useCallback((connected) => {
    console.log('WebSocket connection status:', connected);
    console.log('Organization ID when connection changed:', organizationId);
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
    setMessageHandlers(prev => new Map(prev.set(sessionId, handler)));

    // Subscribe to session-specific channel
    if (isConnected && sessionId) {
      subscribe(`conversation.${sessionId}`);
    }

    return () => {
      setMessageHandlers(prev => {
        const newMap = new Map(prev);
        newMap.delete(sessionId);
        return newMap;
      });

      // Unsubscribe from session-specific channel
      if (sessionId) {
        unsubscribe(`conversation.${sessionId}`);
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
