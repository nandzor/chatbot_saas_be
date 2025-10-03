/**
 * WebSocket Integration Service
 * Service for managing WebSocket integration between backend and frontend
 */

import { echoService } from './EchoService';
import { authService } from './AuthService';
import { inboxService } from './InboxService';

class WebSocketIntegrationService {
  constructor() {
    this.isInitialized = false;
    this.organizationId = null;
    this.currentSessionId = null;
    this.messageHandlers = new Map();
    this.typingHandlers = new Map();
  }

  /**
   * Initialize WebSocket integration
   */
  async initialize() {
    try {
      // Get current user and organization
      const user = await authService.getCurrentUser();
      this.organizationId = user?.organization_id || user?.organization?.id;

      if (!this.organizationId) {
        throw new Error('Organization ID not found');
      }

      // Initialize Echo service
      const success = await echoService.initialize(this.organizationId);
      if (!success) {
        throw new Error('Failed to initialize Echo service');
      }

      // Set up global event handlers
      this.setupGlobalEventHandlers();

      this.isInitialized = true;
      console.log('✅ WebSocket Integration Service initialized');

      return true;
    } catch (error) {
      console.error('❌ Failed to initialize WebSocket Integration:', error);
      return false;
    }
  }

  /**
   * Setup global event handlers
   */
  setupGlobalEventHandlers() {
    // Handle connection changes
    echoService.onConnectionChange = (connected) => {
      console.log('🔌 WebSocket connection:', connected ? 'Connected' : 'Disconnected');
      this.onConnectionChange?.(connected);
    };

    // Handle connection errors
    echoService.onConnectionError = (error) => {
      console.error('❌ WebSocket error:', error);
      this.onConnectionError?.(error);
    };

    // Handle users online
    echoService.onUsersOnline = (users) => {
      console.log('👥 Users online:', users);
      this.onUsersOnline?.(users);
    };
  }

  /**
   * Subscribe to conversation
   */
  subscribeToConversation(sessionId, onMessage, onTyping) {
    if (!this.isInitialized) {
      console.error('❌ WebSocket Integration not initialized');
      return false;
    }

    try {
      // Store handlers
      this.messageHandlers.set(sessionId, onMessage);
      this.typingHandlers.set(sessionId, onTyping);

      // Subscribe to conversation channel
      const channel = echoService.subscribeToConversation(
        sessionId,
        (data) => {
          console.log('📨 Message received:', data);
          onMessage?.(data);
        },
        (data) => {
          console.log('⌨️ Typing indicator:', data);
          onTyping?.(data);
        }
      );

      this.currentSessionId = sessionId;
      return channel;
    } catch (error) {
      console.error('❌ Failed to subscribe to conversation:', error);
      return false;
    }
  }

  /**
   * Unsubscribe from conversation
   */
  unsubscribeFromConversation(sessionId) {
    try {
      // Remove handlers
      this.messageHandlers.delete(sessionId);
      this.typingHandlers.delete(sessionId);

      // Unsubscribe from channel
      echoService.unsubscribeFromConversation(sessionId);

      if (this.currentSessionId === sessionId) {
        this.currentSessionId = null;
      }

      console.log('📡 Unsubscribed from conversation:', sessionId);
      return true;
    } catch (error) {
      console.error('❌ Failed to unsubscribe from conversation:', error);
      return false;
    }
  }

  /**
   * Send typing indicator
   */
  sendTypingIndicator(sessionId, isTyping) {
    if (!this.isInitialized) {
      console.error('❌ WebSocket Integration not initialized');
      return false;
    }

    try {
      const success = echoService.sendTypingIndicator(sessionId, isTyping);
      if (success) {
        console.log('⌨️ Typing indicator sent:', { sessionId, isTyping });
      }
      return success;
    } catch (error) {
      console.error('❌ Failed to send typing indicator:', error);
      return false;
    }
  }

  /**
   * Mark message as read
   */
  markMessageAsRead(sessionId, messageId) {
    if (!this.isInitialized) {
      console.error('❌ WebSocket Integration not initialized');
      return false;
    }

    try {
      const success = echoService.sendMessageReadStatus(sessionId, messageId);
      if (success) {
        console.log('📖 Message marked as read:', { sessionId, messageId });
      }
      return success;
    } catch (error) {
      console.error('❌ Failed to mark message as read:', error);
      return false;
    }
  }

  /**
   * Send message via API and handle WebSocket broadcasting
   */
  async sendMessage(sessionId, messageData) {
    try {
      // Send message via API
      const response = await inboxService.sendMessage(sessionId, messageData);

      if (response.success) {
        console.log('📤 Message sent successfully:', response.data);

        // The backend will automatically broadcast the message via WebSocket
        // No need to manually trigger broadcasting

        return response;
      } else {
        throw new Error(response.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('❌ Failed to send message:', error);

      // Fallback: try to send without WebSocket if API fails
      if (this.isInitialized) {
        console.log('🔄 Attempting fallback message sending...');
        try {
          // This would be a direct WebSocket message (if supported)
          return { success: false, message: 'API failed, WebSocket fallback not implemented' };
        } catch (fallbackError) {
          console.error('❌ Fallback also failed:', fallbackError);
        }
      }

      throw error;
    }
  }

  /**
   * Test WebSocket connection
   */
  async testConnection() {
    try {
      const response = await inboxService.testWebSocketConnection();
      console.log('🔍 WebSocket health check:', response);
      return response;
    } catch (error) {
      console.error('❌ WebSocket health check failed:', error);
      return { status: 'error', message: error.message };
    }
  }

  /**
   * Test WebSocket broadcasting
   */
  async testBroadcasting(channel = 'test-channel', message = 'Test message') {
    try {
      // Use the backend WebSocket controller endpoint
      const response = await fetch(`${import.meta.env.VITE_BASE_URL || 'http://localhost:9000'}/api/websocket/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwt_token') || localStorage.getItem('sanctum_token') || ''}`
        },
        body: JSON.stringify({ channel, message })
      });

      const data = await response.json();
      console.log('🧪 Broadcasting test:', data);
      return data;
    } catch (error) {
      console.error('❌ Broadcasting test failed:', error);
      return { status: 'error', message: error.message };
    }
  }

  /**
   * Get WebSocket configuration
   */
  async getConfiguration() {
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL || 'http://localhost:9000'}/api/websocket/config`);
      const data = await response.json();
      console.log('⚙️ WebSocket configuration:', data);
      return data;
    } catch (error) {
      console.error('❌ Failed to get WebSocket configuration:', error);
      return null;
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus() {
    if (!this.isInitialized) {
      return {
        isInitialized: false,
        isConnected: false,
        organizationId: null,
        currentSessionId: null
      };
    }

    const echoStatus = echoService.getConnectionStatus();

    return {
      isInitialized: this.isInitialized,
      isConnected: echoStatus.isConnected,
      organizationId: this.organizationId,
      currentSessionId: this.currentSessionId,
      reconnectAttempts: echoStatus.reconnectAttempts,
      channels: echoStatus.channels
    };
  }

  /**
   * Update authentication token
   */
  updateAuthToken(token) {
    if (this.isInitialized) {
      echoService.updateAuthToken(token);
      console.log('🔑 Authentication token updated');
    }
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect() {
    try {
      // Clear handlers
      this.messageHandlers.clear();
      this.typingHandlers.clear();

      // Disconnect Echo service
      echoService.disconnect();

      this.isInitialized = false;
      this.organizationId = null;
      this.currentSessionId = null;

      console.log('🔌 WebSocket Integration disconnected');
      return true;
    } catch (error) {
      console.error('❌ Failed to disconnect WebSocket Integration:', error);
      return false;
    }
  }

  // Event handlers (to be set by components)
  onConnectionChange = null;
  onConnectionError = null;
  onUsersOnline = null;
}

// Create and export singleton instance
const webSocketIntegrationService = new WebSocketIntegrationService();

export { webSocketIntegrationService };
export default webSocketIntegrationService;
