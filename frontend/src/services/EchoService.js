/**
 * Laravel Echo Service
 * Service for managing WebSocket connections using Laravel Echo
 */

import { initializeEcho, disconnectEcho, updateEchoAuth, getChannelNames, EventNames } from '@/config/echo';
import { authService } from './AuthService';

class EchoService {
  constructor() {
    this.echo = null;
    this.channels = new Map();
    this.listeners = new Map();
    this.isConnected = false;
    this.organizationId = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.reconnectTimeout = null;
  }

  /**
   * Initialize Echo service
   */
  async initialize(organizationId = null, token = null) {
    // Check if already initialized for the same organization
    if (this.echo && this.isConnected && this.organizationId === organizationId) {
      return true;
    }

    try {
      // Get organization ID
      if (!organizationId) {
        const user = await authService.getCurrentUser();
        organizationId = user?.organization_id || user?.organization?.id;
      }

      if (!organizationId) {
        throw new Error('Organization ID not found');
      }

      this.organizationId = organizationId;

      // Get token if not provided
      if (!token) {
        token = localStorage.getItem('jwt_token') || localStorage.getItem('sanctum_token');
        if (!token) {
          const user = await authService.getCurrentUser();
          token = user?.access_token || user?.token || null;
        }
      }

      if (!token) {
        throw new Error('Authentication token not available for Echo initialization.');
      }

      // Initialize Echo with token
      this.echo = initializeEcho(token);
      if (!this.echo) {
        throw new Error('Failed to initialize Echo');
      }

      // Set up connection listeners
      this.setupConnectionListeners();

      // Subscribe to organization channels
      await this.subscribeToOrganizationChannels();

      this.isConnected = true;
      console.log('✅ EchoService initialized successfully');

      return true;
    } catch (error) {
      console.error('❌ EchoService initialization failed:', error);
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Setup connection event listeners
   */
  setupConnectionListeners() {
    if (!this.echo) return;

    const pusher = this.echo.connector.pusher;

    pusher.connection.bind('connected', () => {
      console.log('🔌 Echo connected successfully');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.onConnectionChange?.(true);
    });

    pusher.connection.bind('disconnected', () => {
      console.log('🔌 Echo disconnected');
      this.isConnected = false;
      this.onConnectionChange?.(false);
      this.handleReconnection();
    });

    pusher.connection.bind('error', (error) => {
      console.error('❌ Echo connection error:', error);
      this.isConnected = false;
      this.onConnectionError?.(error);
      this.handleReconnection();
    });

    pusher.connection.bind('state_change', (states) => {
      console.log('🔄 Echo state change:', states.previous, '->', states.current);
      this.onStateChange?.(states);
    });

    // Add additional error handling
    pusher.connection.bind('unavailable', () => {
      console.warn('⚠️ Echo connection unavailable');
      this.isConnected = false;
      this.onConnectionError?.('Connection unavailable');
    });

    pusher.connection.bind('failed', () => {
      console.error('❌ Echo connection failed');
      this.isConnected = false;
      this.onConnectionError?.('Connection failed');
    });
  }

  /**
   * Handle reconnection logic
   */
  handleReconnection() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached');
      this.onConnectionError?.('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 30000); // Exponential backoff with max 30s
    console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`);

    this.reconnectTimeout = setTimeout(() => {
      this.reconnect();
    }, delay);
  }

  /**
   * Reconnect to Echo
   */
  async reconnect() {
    try {
      // Update auth token
      const token = localStorage.getItem('jwt_token') || localStorage.getItem('sanctum_token');
      if (token) {
        updateEchoAuth(token);
      }

      // Reinitialize
      await this.initialize();
    } catch (error) {
      // console.error('❌ Reconnection failed:', error);
      this.handleReconnection();
    }
  }

  /**
   * Subscribe to organization channels
   */
  async subscribeToOrganizationChannels() {
    if (!this.organizationId || !this.echo) return;

    try {
      // Subscribe to organization channel
      const orgChannel = this.echo.private(getChannelNames.organization(this.organizationId));
      this.channels.set('organization', orgChannel);

      // Subscribe to inbox channel
      const inboxChannel = this.echo.private(getChannelNames.inbox(this.organizationId));
      this.channels.set('inbox', inboxChannel);

      // Subscribe to presence channel for user status
      const presenceChannel = this.echo.join(getChannelNames.presence(this.organizationId));
      this.channels.set('presence', presenceChannel);

      // Set up presence channel listeners
      presenceChannel
        .here((users) => {
          // console.log('👥 Users currently online:', users);
          this.onUsersOnline?.(users);
        })
        .joining((user) => {
          // console.log('👤 User joined:', user);
          this.onUserJoined?.(user);
        })
        .leaving((user) => {
          // console.log('👤 User left:', user);
          this.onUserLeft?.(user);
        });

      // console.log('📡 Subscribed to organization channels');
    } catch (error) {
      // console.error('❌ Failed to subscribe to organization channels:', error);
    }
  }

  /**
   * Subscribe to conversation channel
   */
  subscribeToConversation(sessionId, onMessage, onTyping) {
    if (!this.echo || !sessionId) return null;

    try {
      const channelName = getChannelNames.conversation(sessionId);
      const channel = this.echo.private(channelName);

      // Store channel
      this.channels.set(`conversation-${sessionId}`, channel);

      // Set up message listeners with error handling
      channel
        .listen(EventNames.MESSAGE_SENT, (data) => {
          try {
            // console.log('📨 Message sent event:', data);
            onMessage?.(data);
          } catch (error) {
            console.error('Error handling MESSAGE_SENT event:', error, data);
          }
        })
        .listen(EventNames.MESSAGE_PROCESSED, (data) => {
          try {
            // console.log('📨 Message processed event:', data);
            onMessage?.(data);
          } catch (error) {
            console.error('Error handling MESSAGE_PROCESSED event:', error, data);
          }
        })
        .listen(EventNames.MESSAGE_READ, (data) => {
          try {
            // console.log('📨 Message read event:', data);
            onMessage?.(data);
          } catch (error) {
            console.error('Error handling MESSAGE_READ event:', error, data);
          }
        })
        .listen(EventNames.TYPING_START, (data) => {
          try {
            // console.log('⌨️ Typing start event:', data);
            onTyping?.(data);
          } catch (error) {
            console.error('Error handling TYPING_START event:', error, data);
          }
        })
        .listen(EventNames.TYPING_STOP, (data) => {
          try {
            // console.log('⌨️ Typing stop event:', data);
            onTyping?.(data);
          } catch (error) {
            console.error('Error handling TYPING_STOP event:', error, data);
          }
        });

      // console.log(`📡 Subscribed to conversation channel: ${channelName}`);
      return channel;
    } catch (error) {
      // console.error('❌ Failed to subscribe to conversation channel:', error);
      return null;
    }
  }

  /**
   * Unsubscribe from conversation channel
   */
  unsubscribeFromConversation(sessionId) {
    const channelKey = `conversation-${sessionId}`;
    const channel = this.channels.get(channelKey);

    if (channel) {
      this.echo.leave(channel.name);
      this.channels.delete(channelKey);
      // console.log(`📡 Unsubscribed from conversation channel: ${sessionId}`);
    }
  }

  /**
   * Send typing indicator
   */
  sendTypingIndicator(sessionId, isTyping, userId = null) {
    if (!this.echo || !sessionId) return false;

    try {
      const channelName = getChannelNames.conversation(sessionId);
      const eventName = isTyping ? EventNames.TYPING_START : EventNames.TYPING_STOP;

      this.echo.private(channelName).whisper(eventName, {
        session_id: sessionId,
        user_id: userId,
        is_typing: isTyping,
        timestamp: new Date().toISOString()
      });

      return true;
    } catch (error) {
      // console.error('❌ Failed to send typing indicator:', error);
      return false;
    }
  }

  /**
   * Send message read status
   */
  sendMessageReadStatus(sessionId, messageId) {
    if (!this.echo || !sessionId || !messageId) return false;

    try {
      const channelName = getChannelNames.conversation(sessionId);

      this.echo.private(channelName).whisper(EventNames.MESSAGE_READ, {
        session_id: sessionId,
        message_id: messageId,
        read_at: new Date().toISOString()
      });

      return true;
    } catch (error) {
      // console.error('❌ Failed to send message read status:', error);
      return false;
    }
  }

  /**
   * Broadcast message to organization
   */
  broadcastToOrganization(eventName, data) {
    if (!this.echo || !this.organizationId) return false;

    try {
      const channelName = getChannelNames.organization(this.organizationId);
      this.echo.private(channelName).whisper(eventName, data);
      return true;
    } catch (error) {
      // console.error('❌ Failed to broadcast to organization:', error);
      return false;
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      organizationId: this.organizationId,
      channels: Array.from(this.channels.keys())
    };
  }

  /**
   * Update authentication token
   */
  updateAuthToken(token) {
    if (token) {
      try {
        updateEchoAuth(token);
        console.log('🔑 Updated Echo authentication token');
      } catch (error) {
        console.warn('⚠️ Failed to update Echo auth token:', error);
      }
    }
  }

  /**
   * Disconnect from all channels
   */
  disconnect() {
    try {
      // Clear reconnect timeout
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }

      // Leave all channels
      this.channels.forEach((channel, _key) => {
        if (this.echo) {
          this.echo.leave(channel.name);
        }
      });

      // Clear channels
      this.channels.clear();

      // Disconnect Echo
      disconnectEcho();
      this.echo = null;
      this.isConnected = false;

      // console.log('🔌 EchoService disconnected');
    } catch (error) {
      // console.error('❌ Error disconnecting EchoService:', error);
    }
  }

  // Event handlers (to be set by components)
  onConnectionChange = null;
  onConnectionError = null;
  onStateChange = null;
  onUsersOnline = null;
  onUserJoined = null;
  onUserLeft = null;
}

// Create and export singleton instance
const echoService = new EchoService();

export { echoService };
export default echoService;
