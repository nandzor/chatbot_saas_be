import { useEffect, useRef, useCallback, useState } from 'react';
import { authService } from '@/services/AuthService';
import {
  getWebSocketUrl,
  getOrganizationChannel,
  getInboxChannel,
  getConversationChannel
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
  const connectRef = useRef(null); // Ref to avoid circular dependency
  const isConnectingRef = useRef(false); // Flag to prevent multiple connection attempts
  const lastConnectAttemptRef = useRef(0); // Throttle connection attempts
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000;  const connectThrottleMs = 1000; // Minimum time between connection attempts

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

  // Handle connection close (fixed looping)
  const handleClose = useCallback((event) => {
    setIsConnected(false);
    onConnectionChange?.(false);

    // Clear heartbeat
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }

    // Only reconnect for unexpected closures and within retry limits
    const shouldReconnect = event.code !== 1000 && // Not manual close
                           event.code !== 1001 && // Not going away
                           reconnectAttempts < maxReconnectAttempts &&
                           wsRef.current !== null; // Not manually disconnected

    if (shouldReconnect) {
      setReconnectAttempts(prev => prev + 1);
      setConnectionError(`Connection lost. Reconnecting... (${reconnectAttempts + 1}/${maxReconnectAttempts})`);

      // Clear any existing reconnect timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      reconnectTimeoutRef.current = setTimeout(() => {
        // Double-check we still need to reconnect
        if (wsRef.current === null || wsRef.current.readyState === WebSocket.CLOSED) {
          // Use ref to avoid circular dependency
          connectRef.current?.();
        }
      }, reconnectDelay * Math.pow(2, reconnectAttempts)); // Exponential backoff
    } else if (reconnectAttempts >= maxReconnectAttempts) {
      setConnectionError('Maximum reconnection attempts reached. Please refresh the page.');
    }
  }, [reconnectAttempts, maxReconnectAttempts, reconnectDelay, onConnectionChange]);

  // Handle connection error
  const handleError = useCallback((_error) => {
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

  // Connect to WebSocket (fixed looping and circular dependency)
  const connect = useCallback(async () => {
    const now = Date.now();

    // Prevent duplicate connections and loops
    if (isConnectingRef.current ||
        wsRef.current?.readyState === WebSocket.OPEN ||
        wsRef.current?.readyState === WebSocket.CONNECTING) {
      return;
    }

    // Throttle connection attempts
    if (now - lastConnectAttemptRef.current < connectThrottleMs) {
      return;
    }

    if (!organizationId) return;

    lastConnectAttemptRef.current = now;

    isConnectingRef.current = true;

    try {
      const token = await getAuthToken();
      if (!token) {
        setConnectionError('No authentication token available');
        isConnectingRef.current = false;
        return;
      }

      // Clear any existing connection
      if (wsRef.current) {
        wsRef.current.onopen = null;
        wsRef.current.onmessage = null;
        wsRef.current.onclose = null;
        wsRef.current.onerror = null;
        wsRef.current.close();
      }

      const wsUrl = getWebSocketUrlFromConfig();
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = async () => {
        isConnectingRef.current = false;
        // Reset reconnect attempts on successful connection
        setReconnectAttempts(0);
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

            // Check if connection is still open before sending
            if (wsRef.current?.readyState === WebSocket.OPEN) {
              wsRef.current.send(JSON.stringify(subscribeMessage));
            }
          } else {
            setConnectionError('Failed to authenticate WebSocket channel');
          }
        } catch (error) {
          setConnectionError('Channel authentication failed');
        }
      };

      wsRef.current.onclose = (event) => {
        isConnectingRef.current = false;
        handleClose(event);
      };

      wsRef.current.onerror = (error) => {
        isConnectingRef.current = false;
        handleError(error);
      };

      wsRef.current.onmessage = handleMessage;

      startHeartbeat();
    } catch (error) {
      isConnectingRef.current = false;
      setConnectionError('Failed to connect to WebSocket');
    }
  }, [organizationId, getAuthToken, getWebSocketUrlFromConfig, handleMessage, handleClose, handleError, startHeartbeat, authenticateChannel, onConnectionChange]);

  // Assign connect function to ref to avoid circular dependency
  connectRef.current = connect;

  // Disconnect from WebSocket (improved cleanup)
  const disconnect = useCallback(() => {
    // Clear all timers
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }

    // Reset connecting flag
    isConnectingRef.current = false;

    // Clean disconnect
    if (wsRef.current) {
      // Remove event listeners to prevent callbacks during close
      wsRef.current.onopen = null;
      wsRef.current.onmessage = null;
      wsRef.current.onclose = null;
      wsRef.current.onerror = null;

      // Close with proper code
      if (wsRef.current.readyState === WebSocket.OPEN ||
          wsRef.current.readyState === WebSocket.CONNECTING) {
        wsRef.current.close(1000, 'Manual disconnect');
      }
      wsRef.current = null;
    }

    // Reset state
    setIsConnected(false);
    setConnectionError(null);
    setReconnectAttempts(0);
    onConnectionChange?.(false);
  }, [onConnectionChange]);

  // Connect on mount and when organizationId changes (fixed looping)
  useEffect(() => {
    if (!organizationId) return;

    // Only connect if not already connected or connecting
    if (wsRef.current?.readyState === WebSocket.OPEN ||
        wsRef.current?.readyState === WebSocket.CONNECTING ||
        isConnectingRef.current) {
      return;
    }

    // Debounce connection attempts with longer delay to prevent loops
    const connectTimeout = setTimeout(() => {
      // Double check before connecting
      if (!isConnectingRef.current &&
          wsRef.current?.readyState !== WebSocket.OPEN &&
          wsRef.current?.readyState !== WebSocket.CONNECTING) {
        connectRef.current?.();
      }
    }, 500); // Increased delay

    return () => {
      clearTimeout(connectTimeout);
      // Don't disconnect on every effect cleanup, only on unmount
    };
  }, [organizationId]); // Remove connect/disconnect from dependencies

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

