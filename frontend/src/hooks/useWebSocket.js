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

  // Authenticate channel subscription with specific socket ID
  const authenticateChannelWithSocketId = useCallback(async (channelName, token, socketId) => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000';

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
      throw error;
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
  const subscribe = useCallback((channel, auth = null) => {
    const subscribeData = { channel };
    if (auth) {
      subscribeData.auth = auth;
    }
    // console.log('📡 Subscribing to channel:', channel, auth ? 'with auth' : 'without auth');
    return sendMessage(null, 'pusher:subscribe', subscribeData);
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
  const handleMessage = useCallback(async (event) => {
    try {
      const data = JSON.parse(event.data);
      const { event: eventType, data: eventData } = data;

      // Parse eventData if it's a string (for pusher:connection_established and message.processed)
      let parsedEventData = eventData;
      if (typeof eventData === 'string') {
        try {
          parsedEventData = JSON.parse(eventData);
        } catch (e) {
          console.error('Failed to parse eventData:', e);
          parsedEventData = eventData;
        }
      }

      // console.log('🌐 WebSocket raw event:', eventType, parsedEventData);

      switch (eventType) {
        case 'pusher:connection_established':
          // console.log('✅ WebSocket connection established');
          setIsConnected(true);
          setConnectionError(null);
          setReconnectAttempts(0);
          onConnectionChange?.(true);

          // Store socket_id from connection established event
          const socketId = parsedEventData?.socket_id;
          if (socketId) {
            // Store socket_id for use in channel authentication
            wsRef.current.socketId = socketId;
            window.wsSocketId = socketId; // Make it globally available
          }

          // Auto-subscribe to organization channels with authentication
          if (organizationId && socketId) {
            // console.log('📡 Auto-subscribing to organization channels:', organizationId);

            // Get fresh token for authentication
            const authToken = await getAuthToken();
            if (authToken) {
              // Subscribe to organization channel
              const orgChannel = getOrganizationChannel(organizationId);
              try {
                const orgAuthData = await authenticateChannelWithSocketId(orgChannel, authToken, socketId);
                if (orgAuthData?.auth) {
                  subscribe(orgChannel, orgAuthData.auth);
                }
              } catch (error) {
                // console.error('❌ Failed to authenticate organization channel:', error);
              }

              // Subscribe to inbox channel
              const inboxChannel = getInboxChannel(organizationId);
              try {
                const inboxAuthData = await authenticateChannelWithSocketId(inboxChannel, authToken, socketId);
                if (inboxAuthData?.auth) {
                  subscribe(inboxChannel, inboxAuthData.auth);
                }
              } catch (error) {
                // console.error('❌ Failed to authenticate inbox channel:', error);
              }
            } else {
              // console.error('❌ No auth token available for channel subscription');
            }
          }
          break;

        case 'pusher:connection_failed':
          setConnectionError(parsedEventData);
          setIsConnected(false);
          onConnectionChange?.(false);
          break;

        case 'pusher:error':
          setConnectionError(parsedEventData);
          break;

        case 'MessageSent':
        case 'MessageProcessed':
        case 'MessageRead':
        case 'message.processed':
        case 'message.sent':
        case 'message.read':
          // console.log('📨 Message event received:', eventType, parsedEventData);
          // parsedEventData should already be parsed object at this point
          onMessage?.(parsedEventData);
          break;

        case 'typing':
          // console.log('⌨️ Typing event received:', eventType, parsedEventData);
          onTyping?.(parsedEventData);
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
  }, [organizationId, subscribe, onMessage, onTyping, onConnectionChange, authenticateChannelWithSocketId, getAuthToken]);

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
      // console.log('🔗 Connecting to WebSocket:', wsUrl);
      // console.log('🔑 Using auth token:', token ? 'Present' : 'Missing');

      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = async () => {
        // console.log('🔌 WebSocket connection opened, waiting for pusher:connection_established');
        isConnectingRef.current = false;
        // Don't set isConnected=true yet, wait for pusher:connection_established

        // Start heartbeat
        heartbeatIntervalRef.current = setInterval(() => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ event: 'pusher:ping', data: {} }));
          }
        }, 30000);
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
  }, [organizationId, getAuthToken, getWebSocketUrlFromConfig, handleMessage, handleClose, handleError, startHeartbeat]);

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

