import apiClient from '@/api/axios';
import { handleError } from '@/utils/errorHandler';

class WahaService {
  constructor() {
    this.baseURL = '/api/waha';
    this.timeout = 30000; // 30 seconds default timeout
    this.retryAttempts = 3;
    this.retryDelay = 1000; // 1 second
  }

  /**
   * Generic method to make API calls with retry logic
   */
  async _makeRequest(method, endpoint, data = null, config = {}) {
    let lastError;

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const requestConfig = {
          method,
          url: `${this.baseURL}${endpoint}`,
          timeout: this.timeout,
          ...config
        };

        if (data) {
          if (method.toLowerCase() === 'get') {
            requestConfig.params = data;
          } else {
            requestConfig.data = data;
          }
        }

        const response = await apiClient(requestConfig);
        return response.data;
      } catch (error) {
        lastError = error;

        // Don't retry on certain errors
        if (error.response?.status === 401 || error.response?.status === 403) {
          throw handleError(error);
        }

        // If this is the last attempt, throw the error
        if (attempt === this.retryAttempts) {
          throw handleError(error);
        }

        // Wait before retrying
        if (attempt < this.retryAttempts) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
        }
      }
    }

    throw handleError(lastError);
  }

  /**
   * Test WAHA connection
   */
  async testConnection() {
    try {
      return await this._makeRequest('GET', '/test');
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error testing WAHA connection:', error);
      }
      throw error;
    }
  }

  /**
   * Get all WAHA sessions
   */
  async getSessions() {
    try {
      return await this._makeRequest('GET', '/sessions');
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error getting WAHA sessions:', error);
      }
      throw error;
    }
  }

  /**
   * Start a WAHA session
   */
  async startSession(sessionId) {
    try {
      return await this._makeRequest('POST', `/sessions/${sessionId}/start`);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error starting WAHA session:', error);
      }
      throw error;
    }
  }

  /**
   * Stop a WAHA session
   */
  async stopSession(sessionId) {
    try {
      return await this._makeRequest('POST', `/sessions/${sessionId}/stop`);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error stopping WAHA session:', error);
      }
      throw error;
    }
  }

  /**
   * Get session status
   */
  async getSessionStatus(sessionId) {
    try {
      return await this._makeRequest('GET', `/sessions/${sessionId}/status`);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error getting session status:', error);
      }
      throw error;
    }
  }

  /**
   * Get session info
   */
  async getSessionInfo(sessionId) {
    try {
      return await this._makeRequest('GET', `/sessions/${sessionId}/info`);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error getting session info:', error);
      }
      throw error;
    }
  }

  /**
   * Delete a WAHA session
   */
  async deleteSession(sessionId) {
    try {
      return await this._makeRequest('DELETE', `/sessions/${sessionId}`);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error deleting WAHA session:', error);
      }
      throw error;
    }
  }

  /**
   * Get QR code for session
   */
  async getQrCode(sessionId) {
    try {
      return await this._makeRequest('GET', `/sessions/${sessionId}/qr`);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error getting QR code:', error);
      }
      throw error;
    }
  }

  /**
   * Send text message
   */
  async sendTextMessage(sessionId, messageData) {
    try {
      // Validate message data
      if (!messageData.to) {
        throw new Error('Recipient (to) is required');
      }
      if (!messageData.text) {
        throw new Error('Message text is required');
      }

      return await this._makeRequest('POST', `/sessions/${sessionId}/send-text`, messageData);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error sending text message:', error);
      }
      throw error;
    }
  }

  /**
   * Send media message
   */
  async sendMediaMessage(sessionId, messageData) {
    try {
      // Validate message data
      if (!messageData.to) {
        throw new Error('Recipient (to) is required');
      }
      if (!messageData.media) {
        throw new Error('Media file is required');
      }

      // Handle FormData for file uploads
      const formData = new FormData();
      formData.append('to', messageData.to);
      formData.append('media', messageData.media);
      if (messageData.caption) {
        formData.append('caption', messageData.caption);
      }

      return await this._makeRequest('POST', `/sessions/${sessionId}/send-media`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error sending media message:', error);
      }
      throw error;
    }
  }

  /**
   * Get messages for session
   */
  async getMessages(sessionId, params = {}) {
    try {
      return await this._makeRequest('GET', `/sessions/${sessionId}/messages`, params);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error getting messages:', error);
      }
      throw error;
    }
  }

  /**
   * Get contacts for session
   */
  async getContacts(sessionId) {
    try {
      return await this._makeRequest('GET', `/sessions/${sessionId}/contacts`);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error getting contacts:', error);
      }
      throw error;
    }
  }

  /**
   * Get groups for session
   */
  async getGroups(sessionId) {
    try {
      return await this._makeRequest('GET', `/sessions/${sessionId}/groups`);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error getting groups:', error);
      }
      throw error;
    }
  }

  /**
   * Check if session is connected
   */
  async isSessionConnected(sessionId) {
    try {
      return await this._makeRequest('GET', `/sessions/${sessionId}/connected`);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error checking session connection:', error);
      }
      throw error;
    }
  }

  /**
   * Get session health
   */
  async getSessionHealth(sessionId) {
    try {
      return await this._makeRequest('GET', `/sessions/${sessionId}/health`);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error getting session health:', error);
      }
      throw error;
    }
  }

  /**
   * Create a new session with QR code generation
   */
  async createSession(sessionId) {
    try {
      // Validate session ID
      if (!sessionId || typeof sessionId !== 'string') {
        throw new Error('Valid session ID is required');
      }

      // Start the session
      await this.startSession(sessionId);

      // Wait a bit for session to initialize
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Get QR code
      const qrResponse = await this.getQrCode(sessionId);

      return {
        sessionId,
        qrCode: qrResponse.qrCode || qrResponse.data?.qrCode,
        status: 'ready',
        createdAt: new Date().toISOString()
      };
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error creating WAHA session:', error);
      }
      throw error;
    }
  }

  /**
   * Monitor session connection status
   */
  async monitorSession(sessionId, onStatusChange, interval = 2000) {
    let isMonitoring = true;

    const monitor = setInterval(async () => {
      if (!isMonitoring) return;

      try {
        const statusResponse = await this.getSessionStatus(sessionId);
        const isConnected = await this.isSessionConnected(sessionId);

        const status = {
          sessionId,
          status: statusResponse.status || statusResponse.data?.status,
          connected: isConnected.connected || isConnected.data?.connected,
          timestamp: new Date()
        };

        onStatusChange(status);

        // Stop monitoring if connected
        if (status.connected) {
          isMonitoring = false;
          clearInterval(monitor);
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Error monitoring session:', error);
        }
        onStatusChange({
          sessionId,
          status: 'error',
          connected: false,
          error: error.message,
          timestamp: new Date()
        });
        isMonitoring = false;
        clearInterval(monitor);
      }
    }, interval);

    return () => {
      isMonitoring = false;
      clearInterval(monitor);
    };
  }

  /**
   * Bulk operations for multiple sessions
   */
  async bulkStartSessions(sessionIds) {
    const results = [];
    for (const sessionId of sessionIds) {
      try {
        const result = await this.startSession(sessionId);
        results.push({ sessionId, success: true, data: result });
      } catch (error) {
        results.push({ sessionId, success: false, error: error.message });
      }
    }
    return results;
  }

  async bulkStopSessions(sessionIds) {
    const results = [];
    for (const sessionId of sessionIds) {
      try {
        const result = await this.stopSession(sessionId);
        results.push({ sessionId, success: true, data: result });
      } catch (error) {
        results.push({ sessionId, success: false, error: error.message });
      }
    }
    return results;
  }

  /**
   * Get session statistics
   */
  async getSessionStats(sessionId) {
    try {
      const [status, health, messages, contacts] = await Promise.allSettled([
        this.getSessionStatus(sessionId),
        this.getSessionHealth(sessionId),
        this.getMessages(sessionId, { limit: 1 }),
        this.getContacts(sessionId)
      ]);

      return {
        sessionId,
        status: status.status === 'fulfilled' ? status.value : null,
        health: health.status === 'fulfilled' ? health.value : null,
        messageCount: messages.status === 'fulfilled' ? (messages.value?.length || 0) : 0,
        contactCount: contacts.status === 'fulfilled' ? (contacts.value?.length || 0) : 0,
        lastChecked: new Date().toISOString()
      };
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error getting session stats:', error);
      }
      throw error;
    }
  }

  /**
   * Validate phone number format
   */
  validatePhoneNumber(phoneNumber) {
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');

    // Check if it starts with country code
    if (cleaned.length < 10) {
      return { valid: false, error: 'Phone number too short' };
    }

    // Check if it's a valid format (basic validation)
    if (cleaned.length > 15) {
      return { valid: false, error: 'Phone number too long' };
    }

    return { valid: true, cleaned };
  }

  /**
   * Format phone number for WhatsApp
   */
  formatPhoneNumber(phoneNumber) {
    const validation = this.validatePhoneNumber(phoneNumber);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    let cleaned = validation.cleaned;

    // Add country code if not present
    if (!cleaned.startsWith('62') && cleaned.length <= 12) {
      cleaned = '62' + cleaned;
    }

    return cleaned;
  }

  /**
   * Set service configuration
   */
  setConfig(config) {
    if (config.timeout) this.timeout = config.timeout;
    if (config.retryAttempts) this.retryAttempts = config.retryAttempts;
    if (config.retryDelay) this.retryDelay = config.retryDelay;
  }

  /**
   * Get service configuration
   */
  getConfig() {
    return {
      baseURL: this.baseURL,
      timeout: this.timeout,
      retryAttempts: this.retryAttempts,
      retryDelay: this.retryDelay
    };
  }
}

export const wahaService = new WahaService();
export default WahaService;
