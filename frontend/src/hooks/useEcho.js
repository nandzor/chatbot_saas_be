/**
 * Laravel Echo Hook
 * Custom hook for managing Laravel Echo WebSocket connections
 */

import { useEffect, useCallback, useRef, useState } from 'react';
import { echoService } from '@/services/EchoService';
import { authService } from '@/services/AuthService';

/**
 * Custom hook for Laravel Echo WebSocket connection
 * @param {Object} options - Configuration options
 * @param {string} options.organizationId - Organization ID for channel subscription
 * @param {Function} options.onMessage - Message event handler
 * @param {Function} options.onTyping - Typing event handler
 * @param {Function} options.onConnectionChange - Connection status change handler
 * @param {Function} options.onUsersOnline - Users online event handler
 * @param {Function} options.onUserJoined - User joined event handler
 * @param {Function} options.onUserLeft - User left event handler
 * @returns {Object} Echo connection state and methods
 */
export const useEcho = (options = {}) => {
  const {
    organizationId,
    onMessage,
    onTyping,
    onConnectionChange,
    onUsersOnline,
    onUserJoined,
    onUserLeft
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [users, setUsers] = useState([]);
  const [reconnectAttempts] = useState(0);

  const isInitialized = useRef(false);
  const currentSessionId = useRef(null);

  // Set up event handlers
  useEffect(() => {
    echoService.onConnectionChange = (connected) => {
      setIsConnected(connected);
      onConnectionChange?.(connected);
    };

    echoService.onConnectionError = (error) => {
      setConnectionError(error);
    };

    echoService.onUsersOnline = (onlineUsers) => {
      setUsers(onlineUsers);
      onUsersOnline?.(onlineUsers);
    };

    echoService.onUserJoined = (user) => {
      setUsers(prev => [...prev, user]);
      onUserJoined?.(user);
    };

    echoService.onUserLeft = (user) => {
      setUsers(prev => prev.filter(u => u.id !== user.id));
      onUserLeft?.(user);
    };

    return () => {
      // Clean up event handlers
      echoService.onConnectionChange = null;
      echoService.onConnectionError = null;
      echoService.onUsersOnline = null;
      echoService.onUserJoined = null;
      echoService.onUserLeft = null;
    };
  }, [onConnectionChange, onUsersOnline, onUserJoined, onUserLeft]);

  // Initialize Echo service
  const initializeEcho = useCallback(async () => {
    if (isInitialized.current) {
      return;
    }

    try {
      const success = await echoService.initialize(organizationId);
      if (success) {
        isInitialized.current = true;
        setConnectionError(null);
      } else {
        setConnectionError('Failed to initialize Echo service');
      }
    } catch (error) {
      console.error('Failed to initialize Echo:', error);
      setConnectionError(error.message);
    }
  }, [organizationId]);

  // Subscribe to conversation channel
  const subscribeToConversation = useCallback((sessionId) => {
    if (!sessionId || currentSessionId.current === sessionId) return;

    // Unsubscribe from previous conversation
    if (currentSessionId.current) {
      echoService.unsubscribeFromConversation(currentSessionId.current);
    }

    // Subscribe to new conversation
    const channel = echoService.subscribeToConversation(sessionId, onMessage, onTyping);
    if (channel) {
      currentSessionId.current = sessionId;
    }

    return channel;
  }, [onMessage, onTyping]);

  // Unsubscribe from conversation channel
  const unsubscribeFromConversation = useCallback((sessionId) => {
    if (sessionId && currentSessionId.current === sessionId) {
      echoService.unsubscribeFromConversation(sessionId);
      currentSessionId.current = null;
    }
  }, []);

  // Send typing indicator
  const sendTypingIndicator = useCallback((sessionId, isTyping) => {
    if (!sessionId) return false;

    try {
      const user = authService.getCurrentUserSync();
      const userId = user?.id;
      return echoService.sendTypingIndicator(sessionId, isTyping, userId);
    } catch (error) {
      console.error('Failed to send typing indicator:', error);
      return false;
    }
  }, []);

  // Send message read status
  const markMessageAsRead = useCallback((sessionId, messageId) => {
    if (!sessionId || !messageId) return false;

    try {
      return echoService.sendMessageReadStatus(sessionId, messageId);
    } catch (error) {
      console.error('Failed to mark message as read:', error);
      return false;
    }
  }, []);

  // Broadcast to organization
  const broadcastToOrganization = useCallback((eventName, data) => {
    try {
      return echoService.broadcastToOrganization(eventName, data);
    } catch (error) {
      console.error('Failed to broadcast to organization:', error);
      return false;
    }
  }, []);

  // Update authentication token
  const updateAuthToken = useCallback((token) => {
    if (!isInitialized.current || !isConnected) {
      return;
    }

    try {
      echoService.updateAuthToken(token);
    } catch (error) {
      console.error('Failed to update auth token:', error);
    }
  }, [isConnected]);

  // Get connection status
  const getConnectionStatus = useCallback(() => {
    return echoService.getConnectionStatus();
  }, []);

  // Disconnect
  const disconnect = useCallback(() => {
    try {
      echoService.disconnect();
      isInitialized.current = false;
      currentSessionId.current = null;
      setIsConnected(false);
      setConnectionError(null);
      setUsers([]);
    } catch (error) {
      console.error('Failed to disconnect Echo:', error);
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    if (organizationId) {
      initializeEcho();
    }

    return () => {
      // Cleanup on unmount
      if (currentSessionId.current) {
        echoService.unsubscribeFromConversation(currentSessionId.current);
      }
    };
  }, [organizationId, initializeEcho]);

  // Update auth token when Echo is connected
  useEffect(() => {
    if (isConnected && isInitialized.current) {
      const timer = setTimeout(() => {
        const token = localStorage.getItem('jwt_token') || localStorage.getItem('sanctum_token');
        if (token) {
          updateAuthToken(token);
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isConnected, updateAuthToken]);

  return {
    // State
    isConnected,
    connectionError,
    users,
    reconnectAttempts,

    // Methods
    subscribeToConversation,
    unsubscribeFromConversation,
    sendTypingIndicator,
    markMessageAsRead,
    broadcastToOrganization,
    updateAuthToken,
    getConnectionStatus,
    disconnect,

    // Service instance (for advanced usage)
    echoService
  };
};

export default useEcho;
