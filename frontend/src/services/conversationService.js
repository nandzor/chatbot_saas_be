import apiClient from '../utils/apiClient';

class ConversationService {
  /**
   * Get conversation details with messages
   */
  async getConversation(sessionId) {
    try {
      const response = await apiClient.get(`/conversations/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching conversation:', error);
      throw error;
    }
  }

  /**
   * Get session messages with pagination
   */
  async getMessages(sessionId, options = {}) {
    try {
      const params = new URLSearchParams();

      if (options.per_page) params.append('per_page', options.per_page);
      if (options.page) params.append('page', options.page);
      if (options.sort_by) params.append('sort_by', options.sort_by);
      if (options.sort_direction) params.append('sort_direction', options.sort_direction);

      const response = await apiClient.get(`/conversations/${sessionId}/messages?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  /**
   * Send a new message
   */
  async sendMessage(sessionId, messageData) {
    try {
      const response = await apiClient.post(`/conversations/${sessionId}/messages`, messageData);
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Update session details
   */
  async updateSession(sessionId, updateData) {
    try {
      const response = await apiClient.put(`/conversations/${sessionId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating session:', error);
      throw error;
    }
  }

  /**
   * Assign session to current user
   */
  async assignToMe(sessionId) {
    try {
      const response = await apiClient.post(`/conversations/${sessionId}/assign`);
      return response.data;
    } catch (error) {
      console.error('Error assigning session:', error);
      throw error;
    }
  }

  /**
   * Transfer session to another agent
   */
  async transferSession(sessionId, transferData) {
    try {
      const response = await apiClient.post(`/conversations/${sessionId}/transfer`, transferData);
      return response.data;
    } catch (error) {
      console.error('Error transferring session:', error);
      throw error;
    }
  }

  /**
   * Resolve/End session
   */
  async resolveSession(sessionId, resolutionData) {
    try {
      const response = await apiClient.post(`/conversations/${sessionId}/resolve`, resolutionData);
      return response.data;
    } catch (error) {
      console.error('Error resolving session:', error);
      throw error;
    }
  }

  /**
   * Get session analytics
   */
  async getAnalytics(sessionId) {
    try {
      const response = await apiClient.get(`/conversations/${sessionId}/analytics`);
      return response.data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  }

  /**
   * Mark messages as read
   */
  async markAsRead(sessionId, messageIds = []) {
    try {
      const response = await apiClient.post(`/conversations/${sessionId}/mark-read`, {
        message_ids: messageIds
      });
      return response.data;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  }

  /**
   * Get typing indicators
   */
  async getTypingStatus(sessionId) {
    try {
      const response = await apiClient.get(`/conversations/${sessionId}/typing`);
      return response.data;
    } catch (error) {
      console.error('Error fetching typing status:', error);
      throw error;
    }
  }

  /**
   * Send typing indicator
   */
  async sendTypingIndicator(sessionId, isTyping = true) {
    try {
      const response = await apiClient.post(`/conversations/${sessionId}/typing`, {
        is_typing: isTyping
      });
      return response.data;
    } catch (error) {
      console.error('Error sending typing indicator:', error);
      throw error;
    }
  }

  /**
   * Get conversation summary
   */
  async getConversationSummary(sessionId) {
    try {
      const response = await apiClient.get(`/conversations/${sessionId}/summary`);
      return response.data;
    } catch (error) {
      console.error('Error fetching conversation summary:', error);
      throw error;
    }
  }

  /**
   * Search messages in conversation
   */
  async searchMessages(sessionId, query, filters = {}) {
    try {
      const params = new URLSearchParams();
      params.append('q', query);

      if (filters.sender_type) params.append('sender_type', filters.sender_type);
      if (filters.message_type) params.append('message_type', filters.message_type);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      if (filters.per_page) params.append('per_page', filters.per_page);

      const response = await apiClient.get(`/conversations/${sessionId}/search?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error searching messages:', error);
      throw error;
    }
  }

  /**
   * Get unread message count
   */
  async getUnreadCount(sessionId) {
    try {
      const response = await apiClient.get(`/conversations/${sessionId}/unread-count`);
      return response.data;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error;
    }
  }

  /**
   * Get conversation with recent messages
   */
  async getConversationWithRecent(sessionId, limit = 10) {
    try {
      const params = new URLSearchParams();
      if (limit) params.append('limit', limit);

      const response = await apiClient.get(`/conversations/${sessionId}/recent?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching conversation with recent messages:', error);
      throw error;
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
}

export default new ConversationService();
