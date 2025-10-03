/* eslint-disable no-console */
import { authService } from './AuthService';
import { handleError } from '@/utils/errorHandler';
import { webSocketIntegrationService } from './WebSocketIntegrationService';

class ConversationService {
  constructor() {
    this.authService = authService;
    this.initialized = false;
    this.webSocketService = webSocketIntegrationService;
    this.initializeService();
  }

  /**
   * Initialize the service and verify dependencies
   */
  initializeService() {
    try {
      if (!this.authService) {
        throw new Error('AuthService is not available');
      }

      if (!this.authService.api) {
        throw new Error('AuthService API instance is not available');
      }

      // Test if the API instance is functional
      if (typeof this.authService.api.request !== 'function') {
        throw new Error('AuthService API request method is not available');
      }

      this.initialized = true;
      console.log('✅ ConversationService initialized successfully');
    } catch (error) {
      console.error('❌ ConversationService initialization failed:', error);
      this.initialized = false;
    }
  }

  /**
   * Check if service is ready for API calls
   */
  isReady() {
    return this.initialized && this.authService && this.authService.api;
  }

  /**
   * Wait for service to be ready
   */
  async waitForReady(timeout = 5000) {
    const startTime = Date.now();

    while (!this.isReady() && (Date.now() - startTime) < timeout) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (!this.isReady()) {
      throw new Error('ConversationService failed to initialize within timeout');
    }

    return true;
  }

  /**
   * Get organization ID from auth context
   */
  getOrganizationId() {
    const user = this.authService.getCurrentUserSync();

    // Try multiple possible organization ID fields
    const organizationId = user?.organization_id ||
                          user?.organization?.id ||
                          user?.organization_id ||
                          user?.org_id ||
                          user?.organizationId;

    return organizationId;
  }

  /**
   * Make API call with proper error handling
   */
  async _makeApiCall(apiCall, ...args) {
    try {
      await this.waitForReady();

      if (!this.isReady()) {
        throw new Error('ConversationService is not ready');
      }

      const response = await apiCall(...args);

      if (response.status >= 400) {
        throw new Error(`API call failed with status ${response.status}`);
      }

      return response.data;
    } catch (error) {
      console.error('❌ ConversationService API call failed:', error);
      handleError(error);
      throw error;
    }
  }

  /**
   * Get conversation details with messages
   */
  async getConversation(sessionId) {
    try {
      const url = `/v1/conversations/${sessionId}`;

      return await this._makeApiCall(
        this.authService.api.get,
        url
      );
    } catch (error) {
      console.error('❌ Error fetching conversation:', error);
      throw handleError(error, 'Failed to fetch conversation');
    }
  }

  /**
   * Get session messages with pagination
   */
  async getMessages(sessionId, options = {}) {
    try {
      const queryParams = new URLSearchParams();

      if (options.per_page) queryParams.append('per_page', options.per_page);
      if (options.page) queryParams.append('page', options.page);
      if (options.sort_by) queryParams.append('sort_by', options.sort_by);
      if (options.sort_direction) queryParams.append('sort_direction', options.sort_direction);

      const url = `/v1/conversations/${sessionId}/messages${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

      return await this._makeApiCall(
        this.authService.api.get,
        url
      );
    } catch (error) {
      console.error('❌ Error fetching messages:', error);
      throw handleError(error, 'Failed to fetch messages');
    }
  }

  /**
   * Send a new message
   */
  async sendMessage(sessionId, messageData) {
    try {
      const url = `/v1/conversations/${sessionId}/messages`;

      return await this._makeApiCall(
        this.authService.api.post,
        url,
        messageData
      );
    } catch (error) {
      console.error('❌ Error sending message:', error);
      throw handleError(error, 'Failed to send message');
    }
  }

  /**
   * Update session details
   */
  async updateSession(sessionId, updateData) {
    try {
      const url = `/v1/conversations/${sessionId}`;

      return await this._makeApiCall(
        this.authService.api.put,
        url,
        updateData
      );
    } catch (error) {
      console.error('❌ Error updating session:', error);
      throw handleError(error, 'Failed to update session');
    }
  }

  /**
   * Assign session to current user
   */
  async assignToMe(sessionId) {
    try {
      const url = `/v1/conversations/${sessionId}/assign`;

      return await this._makeApiCall(
        this.authService.api.post,
        url
      );
    } catch (error) {
      console.error('❌ Error assigning session:', error);
      throw handleError(error, 'Failed to assign session');
    }
  }

  /**
   * Transfer session to another agent
   */
  async transferSession(sessionId, transferData) {
    try {
      const url = `/v1/conversations/${sessionId}/transfer`;

      return await this._makeApiCall(
        this.authService.api.post,
        url,
        transferData
      );
    } catch (error) {
      console.error('❌ Error transferring session:', error);
      throw handleError(error, 'Failed to transfer session');
    }
  }

  /**
   * Resolve/End session
   */
  async resolveSession(sessionId, resolutionData) {
    try {
      const url = `/v1/conversations/${sessionId}/resolve`;

      return await this._makeApiCall(
        this.authService.api.post,
        url,
        resolutionData
      );
    } catch (error) {
      console.error('❌ Error resolving session:', error);
      throw handleError(error, 'Failed to resolve session');
    }
  }

  /**
   * Get session analytics
   */
  async getAnalytics(sessionId) {
    try {
      const url = `/v1/conversations/${sessionId}/analytics`;

      return await this._makeApiCall(
        this.authService.api.get,
        url
      );
    } catch (error) {
      console.error('❌ Error fetching analytics:', error);
      throw handleError(error, 'Failed to fetch analytics');
    }
  }

  /**
   * Mark messages as read
   */
  async markAsRead(sessionId, messageIds = []) {
    try {
      const url = `/v1/conversations/${sessionId}/mark-read`;

      return await this._makeApiCall(
        this.authService.api.post,
        url,
        { message_ids: messageIds }
      );
    } catch (error) {
      console.error('❌ Error marking messages as read:', error);
      throw handleError(error, 'Failed to mark messages as read');
    }
  }

  /**
   * Get typing indicators
   */
  async getTypingStatus(sessionId) {
    try {
      const url = `/v1/conversations/${sessionId}/typing`;

      return await this._makeApiCall(
        this.authService.api.get,
        url
      );
    } catch (error) {
      console.error('❌ Error fetching typing status:', error);
      throw handleError(error, 'Failed to fetch typing status');
    }
  }

  /**
   * Send typing indicator
   */
  async sendTypingIndicator(sessionId, isTyping = true) {
    try {
      const url = `/v1/conversations/${sessionId}/typing`;

      return await this._makeApiCall(
        this.authService.api.post,
        url,
        { is_typing: isTyping }
      );
    } catch (error) {
      console.error('❌ Error sending typing indicator:', error);
      throw handleError(error, 'Failed to send typing indicator');
    }
  }

  /**
   * Get conversation summary
   */
  async getConversationSummary(sessionId) {
    try {
      const url = `/v1/conversations/${sessionId}/summary`;

      return await this._makeApiCall(
        this.authService.api.get,
        url
      );
    } catch (error) {
      console.error('❌ Error fetching conversation summary:', error);
      throw handleError(error, 'Failed to fetch conversation summary');
    }
  }

  /**
   * Search messages in conversation
   */
  async searchMessages(sessionId, query, filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('q', query);

      if (filters.sender_type) queryParams.append('sender_type', filters.sender_type);
      if (filters.message_type) queryParams.append('message_type', filters.message_type);
      if (filters.date_from) queryParams.append('date_from', filters.date_from);
      if (filters.date_to) queryParams.append('date_to', filters.date_to);
      if (filters.per_page) queryParams.append('per_page', filters.per_page);

      const url = `/v1/conversations/${sessionId}/search${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

      return await this._makeApiCall(
        this.authService.api.get,
        url
      );
    } catch (error) {
      console.error('❌ Error searching messages:', error);
      throw handleError(error, 'Failed to search messages');
    }
  }

  /**
   * Get unread message count
   */
  async getUnreadCount(sessionId) {
    try {
      const url = `/v1/conversations/${sessionId}/unread-count`;

      return await this._makeApiCall(
        this.authService.api.get,
        url
      );
    } catch (error) {
      console.error('❌ Error fetching unread count:', error);
      throw handleError(error, 'Failed to fetch unread count');
    }
  }

  /**
   * Get conversation with recent messages
   */
  async getConversationWithRecent(sessionId, limit = 10) {
    try {
      const queryParams = new URLSearchParams();
      if (limit) queryParams.append('limit', limit);

      const url = `/v1/conversations/${sessionId}/recent${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

      return await this._makeApiCall(
        this.authService.api.get,
        url
      );
    } catch (error) {
      console.error('❌ Error fetching conversation with recent messages:', error);
      throw handleError(error, 'Failed to fetch conversation with recent messages');
    }
  }

  /**
   * Helper method to format message data for sending
   */
  formatMessageData(messageText, options = {}) {
    return {
      message_text: messageText,
      message_type: options.messageType || 'text',
      sender_type: options.senderType || 'agent',
      sender_id: options.senderId || null,
      sender_name: options.senderName || null,
      media_url: options.mediaUrl || null,
      media_type: options.mediaType || null,
      media_size: options.mediaSize || null,
      thumbnail_url: options.thumbnailUrl || null,
      quick_replies: options.quickReplies || null,
      buttons: options.buttons || null,
      template_data: options.templateData || null,
      reply_to_message_id: options.replyToMessageId || null,
      metadata: options.metadata || {}
    };
  }

  /**
   * Helper method to format transfer data
   */
  formatTransferData(agentId, options = {}) {
    return {
      agent_id: agentId,
      reason: options.reason || null,
      notes: options.notes || null,
      priority: options.priority || 'normal',
      notify_agent: options.notifyAgent !== false
    };
  }

  /**
   * Helper method to format resolution data
   */
  formatResolutionData(resolutionType, options = {}) {
    return {
      resolution_type: resolutionType,
      resolution_notes: options.resolutionNotes || null,
      satisfaction_rating: options.satisfactionRating || null,
      feedback_text: options.feedbackText || null,
      feedback_tags: options.feedbackTags || null,
      follow_up_required: options.followUpRequired || false,
      follow_up_date: options.followUpDate || null,
      escalation_reason: options.escalationReason || null
    };
  }

  /**
   * Initialize WebSocket integration for real-time messaging
   */
  async initializeWebSocket() {
    try {
      const success = await this.webSocketService.initialize();
      if (success) {
        console.log('✅ WebSocket integration initialized for conversations');
      }
      return success;
    } catch (error) {
      console.error('❌ Failed to initialize WebSocket integration:', error);
      return false;
    }
  }

  /**
   * Subscribe to conversation for real-time updates
   */
  subscribeToConversation(sessionId, onMessage, onTyping) {
    if (!this.webSocketService.isInitialized) {
      console.warn('⚠️ WebSocket not initialized, falling back to polling');
      return false;
    }

    try {
      return this.webSocketService.subscribeToConversation(sessionId, onMessage, onTyping);
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
      return this.webSocketService.unsubscribeFromConversation(sessionId);
    } catch (error) {
      console.error('❌ Failed to unsubscribe from conversation:', error);
      return false;
    }
  }

  /**
   * Send typing indicator
   */
  sendTypingIndicator(sessionId, isTyping) {
    if (!this.webSocketService.isInitialized) {
      return false;
    }

    try {
      return this.webSocketService.sendTypingIndicator(sessionId, isTyping);
    } catch (error) {
      console.error('❌ Failed to send typing indicator:', error);
      return false;
    }
  }

  /**
   * Mark message as read with WebSocket notification
   */
  async markMessageAsRead(sessionId, messageId) {
    try {
      // Mark as read via API
      const response = await this.markMessageRead(sessionId, messageId);

      // Send WebSocket notification
      if (this.webSocketService.isInitialized) {
        this.webSocketService.markMessageAsRead(sessionId, messageId);
      }

      return response;
    } catch (error) {
      console.error('❌ Failed to mark message as read:', error);
      throw error;
    }
  }

  /**
   * Send message with WebSocket integration
   */
  async sendMessageWithWebSocket(sessionId, messageData) {
    try {
      if (this.webSocketService.isInitialized) {
        // Use WebSocket service for real-time messaging
        return await this.webSocketService.sendMessage(sessionId, messageData);
      } else {
        // Fallback to regular API call
        return await this.sendMessage(sessionId, messageData);
      }
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      throw error;
    }
  }

  /**
   * Get WebSocket connection status
   */
  getWebSocketStatus() {
    return this.webSocketService.getConnectionStatus();
  }

  /**
   * Test WebSocket connection
   */
  async testWebSocketConnection() {
    try {
      return await this.webSocketService.testConnection();
    } catch (error) {
      console.error('❌ WebSocket connection test failed:', error);
      return { status: 'error', message: error.message };
    }
  }
}

// Create and export singleton instance
const conversationService = new ConversationService();
export default conversationService;
