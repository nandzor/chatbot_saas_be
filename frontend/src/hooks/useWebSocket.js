import { useEffect, useRef, useCallback, useState } from 'react';
import { authService } from '@/services/AuthService';
import {
  getWebSocketUrl,
  getOrganizationChannel,
  getInboxChannel,
  getConversationChannel,
  isDebugMode
} from '@/config/websocket';

/**
 * Custom hook for WebSocket connection with Laravel Reverb
 * Handles real-time messaging, typing indicators, and connection management
 */
export const useWebSocket = (organizationId, onMessage, onTyping, onConnectionChange) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const heartbeatIntervalRef = useRef(null);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000;

  // Get WebSocket URL from configuration
  const getWebSocketUrlFromConfig = useCallback(() => {
    return getWebSocketUrl();
  }, []);

  // Get authentication token (optimized)
  const getAuthToken = useCallback(async () => {
    try {
      // Priority order: JWT -> Sanctum -> User service
      const jwtToken = localStorage.getItem('jwt_token');
      if (jwtToken) return jwtToken;

      const sanctumToken = localStorage.getItem('sanctum_token');
      if (sanctumToken) return sanctumToken;

      // Fallback to user service
      const user = await authService.getCurrentUser();
      return user?.access_token || user?.token || null;
    } catch (error) {
      return null;
    }
  }, []);

  // Authenticate channel subscription (optimized)
  const authenticateChannel = useCallback(async (channelName, token) => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000';
    const socketId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    const makeAuthRequest = async (authToken) => {
      const response = await fetch(`${baseUrl}/broadcasting/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/json',
        },
        body: new URLSearchParams({
          channel_name: channelName,
          socket_id: socketId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const authData = await response.json();

      // Handle both direct auth response and ApiResponse format
      if (authData.auth) {
        return authData; // Direct auth response
      } else if (authData.success && authData.data) {
        return authData.data; // ApiResponse format
      }

      throw new Error('Invalid auth response format');
    };

    try {
      // Try with current token
      return await makeAuthRequest(token);
    } catch (error) {
      // If 401, try token refresh
      if (error.message.includes('401')) {
        try {
          await authService.refreshTokens();
          const newToken = await getAuthToken();

          if (newToken && newToken !== token) {
            return await makeAuthRequest(newToken);
          }
        } catch (refreshError) {
          // Token refresh failed
        }
      }
      return null;
    }
  }, [getAuthToken]);

  // Send message through WebSocket
  const sendMessage = useCallback((channel, event, data) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const message = {
        event: event,
        data: data,
        channel: channel
      };
      wsRef.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, []);

  // Subscribe to a channel
  const subscribe = useCallback((channel) => {
    return sendMessage(null, 'pusher:subscribe', { channel });
  }, [sendMessage]);

  // Unsubscribe from a channel
  const unsubscribe = useCallback((channel) => {
    return sendMessage(null, 'pusher:unsubscribe', { channel });
  }, [sendMessage]);

  // Send typing indicator
  const sendTypingIndicator = useCallback((sessionId, isTyping) => {
    return sendMessage(getConversationChannel(sessionId), 'typing', {
      session_id: sessionId,
      is_typing: isTyping,
      timestamp: new Date().toISOString()
    });
  }, [sendMessage]);

  // Send message read status
  const markMessageAsRead = useCallback((messageId, sessionId) => {
    return sendMessage(getConversationChannel(sessionId), 'message.read', {
      message_id: messageId,
      session_id: sessionId,
      read_at: new Date().toISOString()
    });
  }, [sendMessage]);

  // Handle incoming messages (optimized)
  const handleMessage = useCallback((event) => {
    try {
      const data = JSON.parse(event.data);
      const { event: eventType, data: eventData } = data;

      switch (eventType) {
        case 'pusher:connection_established':
          setIsConnected(true);
          setConnectionError(null);
          setReconnectAttempts(0);
          onConnectionChange?.(true);

          // Auto-subscribe to organization channels
          if (organizationId) {
            subscribe(getOrganizationChannel(organizationId));
            subscribe(getInboxChannel(organizationId));
          }
          break;

        case 'pusher:connection_failed':
          setConnectionError(eventData);
          setIsConnected(false);
          onConnectionChange?.(false);
          break;

        case 'pusher:error':
          setConnectionError(eventData);
          break;

        case 'MessageSent':
        case 'MessageProcessed':
        case 'MessageRead':
          onMessage?.(eventData);
          break;

        case 'TypingIndicator':
          onTyping?.(eventData);
          break;

        case 'pusher:subscription_succeeded':
        case 'pusher:subscription_error':
          // Handle silently
          break;

        default:
          // Handle Laravel events
          if (eventType?.startsWith('App\\Events\\')) {
            onMessage?.(eventData);
          }
          break;
      }
    } catch (error) {
      // Silently handle JSON parse errors
    }
  }, [organizationId, subscribe, onMessage, onTyping, onConnectionChange]);

  // Handle connection close
  const handleClose = useCallback((event) => {
    setIsConnected(false);
    onConnectionChange?.(false);

    // Clear heartbeat
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }

    // Attempt to reconnect if not a manual close
    if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
      setReconnectAttempts(prev => prev + 1);
      setConnectionError(`Connection lost. Reconnecting... (${reconnectAttempts + 1}/${maxReconnectAttempts})`);

      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, reconnectDelay * Math.pow(2, reconnectAttempts)); // Exponential backoff
    }
  }, [reconnectAttempts, maxReconnectAttempts, reconnectDelay]);

  // Handle connection error
  const handleError = useCallback((error) => {
    setConnectionError('Connection error occurred');
    setIsConnected(false);
    onConnectionChange?.(false);
  }, [onConnectionChange]);

  // Start heartbeat
  const startHeartbeat = useCallback(() => {
    heartbeatIntervalRef.current = setInterval(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ event: 'pusher:ping' }));
      }
    }, 30000); // Send ping every 30 seconds
  }, []);

  // Connect to WebSocket (optimized)
  const connect = useCallback(async () => {
    // Prevent duplicate connections
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    if (!organizationId) return;

    try {
      const token = await getAuthToken();
      if (!token) {
        setConnectionError('No authentication token available');
        return;
      }

      const wsUrl = getWebSocketUrlFromConfig();
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = async () => {
        setIsConnected(true);
        setConnectionError(null);
        onConnectionChange?.(true);

        // Authenticate and subscribe to organization channel
        const channelName = getOrganizationChannel(organizationId);

        try {
          const authData = await authenticateChannel(channelName, token);

          if (authData?.auth) {
            const subscribeMessage = {
              event: 'pusher:subscribe',
              data: {
                channel: channelName,
                auth: authData.auth,
                channel_data: authData.channel_data || null
              }
            };

            wsRef.current?.send(JSON.stringify(subscribeMessage));
          } else {
            setConnectionError('Failed to authenticate WebSocket channel');
          }
        } catch (error) {
          setConnectionError('Channel authentication failed');
        }
      };

      wsRef.current.onmessage = handleMessage;
      wsRef.current.onclose = handleClose;
      wsRef.current.onerror = handleError;

      startHeartbeat();
    } catch (error) {
      setConnectionError('Failed to connect to WebSocket');
    }
  }, [organizationId, getAuthToken, getWebSocketUrlFromConfig, handleMessage, handleClose, handleError, startHeartbeat, authenticateChannel, onConnectionChange]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect');
      wsRef.current = null;
    }

    setIsConnected(false);
    setConnectionError(null);
    setReconnectAttempts(0);
    onConnectionChange?.(false);
  }, [onConnectionChange]);

  // Connect on mount and when organizationId changes
  useEffect(() => {
    if (organizationId) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [organizationId, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    connectionError,
    reconnectAttempts,
    sendMessage,
    subscribe,
    unsubscribe,
    sendTypingIndicator,
    markMessageAsRead,
    connect,
    disconnect
  };
};

export default useWebSocket;

