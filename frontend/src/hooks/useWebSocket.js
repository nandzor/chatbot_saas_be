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

  // Get authentication token
  const getAuthToken = useCallback(async () => {
    try {
      const user = await authService.getCurrentUser();
      return user?.access_token || user?.token;
    } catch (error) {
      console.error('Failed to get auth token:', error);
      return null;
    }
  }, []);

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
    const message = {
      event: 'pusher:subscribe',
      data: {
        channel: channel
      }
    };
    return sendMessage(null, 'pusher:subscribe', { channel });
  }, [sendMessage]);

  // Unsubscribe from a channel
  const unsubscribe = useCallback((channel) => {
    const message = {
      event: 'pusher:unsubscribe',
      data: {
        channel: channel
      }
    };
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

  // Handle incoming messages
  const handleMessage = useCallback((event) => {
    try {
      const data = JSON.parse(event.data);

      switch (data.event) {
        case 'pusher:connection_established':
          if (isDebugMode()) {
            console.log('WebSocket connection established');
          }
          setIsConnected(true);
          setConnectionError(null);
          setReconnectAttempts(0);
          onConnectionChange?.(true);

          // Subscribe to organization channel
          if (organizationId) {
            subscribe(getOrganizationChannel(organizationId));
            subscribe(getInboxChannel(organizationId));
          }
          break;

        case 'pusher:connection_failed':
          console.error('WebSocket connection failed:', data.data);
          setConnectionError(data.data);
          setIsConnected(false);
          onConnectionChange?.(false);
          break;

        case 'pusher:error':
          console.error('WebSocket error:', data.data);
          setConnectionError(data.data);
          break;

        case 'MessageSent':
        case 'MessageProcessed':
          // Handle new message
          onMessage?.(data.data);
          break;

        case 'MessageRead':
          // Handle message read status
          onMessage?.(data.data);
          break;

        case 'TypingIndicator':
          // Handle typing indicator
          onTyping?.(data.data);
          break;

        case 'pusher:subscription_succeeded':
          console.log(`Subscribed to channel: ${data.channel}`);
          break;

        case 'pusher:subscription_error':
          console.error(`Subscription error for channel: ${data.channel}`, data.data);
          break;

        default:
          // Handle custom events
          if (data.event && data.event.startsWith('App\\Events\\')) {
            onMessage?.(data.data);
          }
          break;
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }, [organizationId, subscribe, onMessage, onTyping, onConnectionChange]);

  // Handle connection close
  const handleClose = useCallback((event) => {
    console.log('WebSocket connection closed:', event.code, event.reason);
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
    console.error('WebSocket error:', error);
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

  // Connect to WebSocket
  const connect = useCallback(async () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    try {
      const token = await getAuthToken();
      if (!token) {
        setConnectionError('No authentication token available');
        return;
      }

      const wsUrl = getWebSocketUrlFromConfig();
      if (isDebugMode()) {
        console.log('Connecting to WebSocket:', wsUrl);
      }

      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        if (isDebugMode()) {
          console.log('WebSocket connection opened');
        }
        // Send authentication
        wsRef.current.send(JSON.stringify({
          event: 'pusher:subscribe',
          data: {
            channel: getOrganizationChannel(organizationId),
            auth: token
          }
        }));
      };

      wsRef.current.onmessage = handleMessage;
      wsRef.current.onclose = handleClose;
      wsRef.current.onerror = handleError;

      startHeartbeat();
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      setConnectionError('Failed to connect to WebSocket');
    }
  }, [organizationId, getAuthToken, getWebSocketUrl, handleMessage, handleClose, handleError, startHeartbeat]);

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
