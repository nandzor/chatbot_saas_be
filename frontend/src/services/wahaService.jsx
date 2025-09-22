import { BaseApiService } from '@/api/BaseApiService';

/**
 * WAHA (WhatsApp HTTP API) Service
 * Service untuk mengintegrasikan frontend dengan backend WAHA
 * Menggunakan BaseApiService untuk konsistensi dengan service lainnya
 * Enhanced dengan organization filtering dan data synchronization
 */
export class WahaApiService extends BaseApiService {
  constructor() {
    super('/waha');
  }

  /**
   * Get current organization context
   * This will be automatically handled by the backend middleware
   */
  getOrganizationContext() {
    // Organization context is handled by backend middleware
    // Frontend doesn't need to pass organization_id explicitly
    return null;
  }

  /**
   * Test koneksi ke WAHA server
   */
  async testConnection() {
    return this.get('/test');
  }

  /**
   * Mendapatkan semua sesi WAHA untuk organization saat ini dengan pagination dan filter
   * Response format: { data: [], pagination: {}, meta: {} } - non-nested structure
   */
  async getSessions(params = {}) {
    const response = await this.get('/sessions', params);

    // Return response as-is since backend already provides correct structure
    if (response.success) {
      return response;
    }

    return response;
  }

  /**
   * Mencari sesi WAHA dengan query dan filter
   */
  async searchSessions(query, params = {}) {
    return this.getSessions({
      ...params,
      search: query
    });
  }

  /**
   * Membuat sesi baru menggunakan endpoint /sessions/create
   */
  async createSession(sessionId, config = {}) {
    const response = await this.post('/sessions/create', {
      name: sessionId,
      start: true,
      config: config
    });

    // Enhanced response format with organization context
    if (response.success && response.data) {
      return {
        ...response,
        data: {
          ...response.data,
          local_session_id: response.data.local_session_id,
          organization_id: response.data.organization_id,
          session_name: response.data.session_name || sessionId,
          status: response.data.status || 'connecting',
        }
      };
    }

    return response;
  }

  /**
   * Memulai sesi WAHA untuk organization saat ini
   * Response format: { local_session_id: string, organization_id: string, session_name: string, status: string }
   */
  async startSession(sessionId, config = {}) {
    const response = await this.post(`/sessions/${sessionId}/start`, config);

    // Enhanced response format with organization context
    if (response.success && response.data) {
      return {
        ...response,
        data: {
          ...response.data,
          local_session_id: response.data.local_session_id,
          organization_id: response.data.organization_id,
          session_name: response.data.session_name || sessionId,
          status: response.data.status || 'connecting',
        }
      };
    }

    return response;
  }

  /**
   * Menghentikan sesi WAHA untuk organization saat ini
   * Response format: { local_session_id: string, organization_id: string }
   */
  async stopSession(sessionId) {
    const response = await this.post(`/sessions/${sessionId}/stop`);

    // Enhanced response format with organization context
    if (response.success && response.data) {
      return {
        ...response,
        data: {
          ...response.data,
          local_session_id: response.data.local_session_id,
          organization_id: response.data.organization_id,
        }
      };
    }

    return response;
  }

  /**
   * Menghapus sesi WAHA untuk organization saat ini
   * Response format: { organization_id: string }
   */
  async deleteSession(sessionId) {
    const response = await this.delete(`/sessions/${sessionId}`);

    // Enhanced response format with organization context
    if (response.success && response.data) {
      return {
        ...response,
        data: {
          ...response.data,
          organization_id: response.data.organization_id,
        }
      };
    }

    return response;
  }

  /**
   * Mendapatkan status sesi untuk organization saat ini
   * Response format: { id: string, organization_id: string, status: string, ... }
   */
  async getSessionStatus(sessionId) {
    const response = await this.get(`/sessions/${sessionId}/status`);

    // Enhanced response format with organization context and local session data
    if (response.success && response.data) {
      return {
        ...response,
        data: {
          ...response.data,
          id: response.data.id,
          organization_id: response.data.organization_id,
          session_name: response.data.session_name,
          phone_number: response.data.phone_number,
          business_name: response.data.business_name,
          is_authenticated: response.data.is_authenticated,
          is_connected: response.data.is_connected,
          health_status: response.data.health_status,
          last_health_check: response.data.last_health_check,
          error_count: response.data.error_count,
          last_error: response.data.last_error,
          total_messages_sent: response.data.total_messages_sent,
          total_messages_received: response.data.total_messages_received,
          total_media_sent: response.data.total_media_sent,
          total_media_received: response.data.total_media_received,
          created_at: response.data.created_at,
          updated_at: response.data.updated_at,
        }
      };
    }

    return response;
  }

  /**
   * Mendapatkan informasi sesi untuk organization saat ini
   * Response format: { id: string, organization_id: string, ... }
   */
  async getSessionInfo(sessionId) {
    const response = await this.get(`/sessions/${sessionId}/info`);

    // Enhanced response format with organization context and local session data
    if (response.success && response.data) {
      return {
        ...response,
        data: {
          ...response.data,
          id: response.data.id,
          organization_id: response.data.organization_id,
          session_name: response.data.session_name,
          phone_number: response.data.phone_number,
          business_name: response.data.business_name,
          business_description: response.data.business_description,
          business_category: response.data.business_category,
          business_website: response.data.business_website,
          business_email: response.data.business_email,
          is_authenticated: response.data.is_authenticated,
          is_connected: response.data.is_connected,
          health_status: response.data.health_status,
          last_health_check: response.data.last_health_check,
          error_count: response.data.error_count,
          last_error: response.data.last_error,
          total_messages_sent: response.data.total_messages_sent,
          total_messages_received: response.data.total_messages_received,
          total_media_sent: response.data.total_media_sent,
          total_media_received: response.data.total_media_received,
          created_at: response.data.created_at,
          updated_at: response.data.updated_at,
          organization: response.data.organization,
          channel_config: response.data.channel_config,
        }
      };
    }

    return response;
  }

  /**
   * Mendapatkan QR Code untuk koneksi WhatsApp
   */
  async getQrCode(sessionId) {
    return this.get(`/sessions/${sessionId}/qr`);
  }

  /**
   * Mengecek apakah sesi terhubung
   */
  async isSessionConnected(sessionId) {
    return this.get(`/sessions/${sessionId}/connected`);
  }

  /**
   * Mendapatkan health status sesi
   */
  async getSessionHealth(sessionId) {
    return this.get(`/sessions/${sessionId}/health`);
  }

  /**
   * Mengirim pesan teks
   */
  async sendTextMessage(sessionId, to, text) {
    return this.post(`/sessions/${sessionId}/send-text`, {
      to,
      text,
    });
  }

  /**
   * Mengirim pesan media
   */
  async sendMediaMessage(sessionId, to, mediaUrl, caption = '') {
    return this.post(`/sessions/${sessionId}/send-media`, {
      to,
      media_url: mediaUrl,
      caption,
    });
  }

  /**
   * Mendapatkan pesan dari sesi
   */
  async getMessages(sessionId, params = {}) {
    return this.get(`/sessions/${sessionId}/messages`, { params });
  }

  /**
   * Mendapatkan kontak dari sesi
   */
  async getContacts(sessionId) {
    return this.get(`/sessions/${sessionId}/contacts`);
  }

  /**
   * Mendapatkan grup dari sesi
   */
  async getGroups(sessionId) {
    return this.get(`/sessions/${sessionId}/groups`);
  }

  /**
   * Validasi nomor telepon
   */
  validatePhoneNumber(phoneNumber) {
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');

    // Check if it's a valid Indonesian phone number
    if (cleaned.startsWith('62')) {
      return cleaned;
    } else if (cleaned.startsWith('0')) {
      return '62' + cleaned.substring(1);
    } else if (cleaned.startsWith('8')) {
      return '62' + cleaned;
    }

    return cleaned;
  }

  /**
   * Format nomor telepon untuk WhatsApp
   */
  formatPhoneNumber(phoneNumber) {
    const cleaned = this.validatePhoneNumber(phoneNumber);
    return cleaned + '@c.us';
  }

  /**
   * Mendapatkan statistik sesi
   */
  async getSessionStats(sessionId) {
    const [status, health, messages, contacts, groups] = await Promise.all([
      this.getSessionStatus(sessionId),
      this.getSessionHealth(sessionId),
      this.getMessages(sessionId, { limit: 1 }),
      this.getContacts(sessionId),
      this.getGroups(sessionId),
    ]);

    return {
      status: status.data,
      health: health.data,
      messageCount: messages.data?.length || 0,
      contactCount: contacts.data?.length || 0,
      groupCount: groups.data?.length || 0,
    };
  }

  /**
   * Bulk start sessions
   */
  async bulkStartSessions(sessionIds, config = {}) {
    const promises = sessionIds.map(sessionId =>
      this.startSession(sessionId, config)
    );
    const results = await Promise.allSettled(promises);

    return {
      successful: results.filter(r => r.status === 'fulfilled').map(r => r.value),
      failed: results.filter(r => r.status === 'rejected').map(r => r.reason),
    };
  }

  /**
   * Bulk stop sessions
   */
  async bulkStopSessions(sessionIds) {
    const promises = sessionIds.map(sessionId =>
      this.stopSession(sessionId)
    );
    const results = await Promise.allSettled(promises);

    return {
      successful: results.filter(r => r.status === 'fulfilled').map(r => r.value),
      failed: results.filter(r => r.status === 'rejected').map(r => r.reason),
    };
  }

  /**
   * Handle organization-specific errors
   */
  handleOrganizationError(error) {
    if (error.response?.data?.error_code === 'NO_ORGANIZATION') {
      return {
        type: 'organization_error',
        message: 'Anda harus menjadi anggota organization untuk mengakses fitur WAHA',
        code: 'NO_ORGANIZATION'
      };
    }

    if (error.response?.data?.error_code === 'UNAUTHENTICATED') {
      return {
        type: 'auth_error',
        message: 'Sesi Anda telah berakhir. Silakan login kembali.',
        code: 'UNAUTHENTICATED'
      };
    }

    if (error.response?.status === 404) {
      return {
        type: 'not_found',
        message: 'Sesi WAHA tidak ditemukan atau tidak dapat diakses',
        code: 'SESSION_NOT_FOUND'
      };
    }

    return {
      type: 'unknown_error',
      message: error.message || 'Terjadi kesalahan yang tidak diketahui',
      code: 'UNKNOWN_ERROR'
    };
  }

  /**
   * Check if session belongs to current organization
   */
  isSessionOwnedByOrganization(session, organizationId) {
    return session.organization_id === organizationId;
  }

  /**
   * Get organization context from session data
   */
  getOrganizationFromSession(session) {
    return {
      id: session.organization_id,
      name: session.organization?.name,
      business_name: session.business_name,
      business_category: session.business_category,
    };
  }

  /**
   * Format session data for display
   */
  formatSessionForDisplay(session) {
    return {
      id: session.id,
      session_name: session.session_name || session.name,
      name: session.session_name || session.name,
      status: session.status,
      phone_number: session.phone_number,
      business_name: session.business_name,
      business_description: session.business_description,
      business_category: session.business_category,
      business_website: session.business_website,
      business_email: session.business_email,
      is_connected: session.is_connected,
      is_authenticated: session.is_authenticated,
      health_status: session.health_status,
      last_health_check: session.last_health_check,
      error_count: session.error_count || 0,
      last_error: session.last_error,
      total_messages_sent: session.total_messages_sent || 0,
      total_messages_received: session.total_messages_received || 0,
      total_media_sent: session.total_media_sent || 0,
      total_media_received: session.total_media_received || 0,
      created_at: session.created_at,
      updated_at: session.updated_at,
      organization_id: session.organization_id,
      config: session.config,
      organization: this.getOrganizationFromSession(session),
    };
  }

  /**
   * Get session statistics
   */
  getSessionStatistics(session) {
    return {
      total_messages: (session.total_messages_sent || 0) + (session.total_messages_received || 0),
      total_media: (session.total_media_sent || 0) + (session.total_media_received || 0),
      error_count: session.error_count || 0,
      uptime_percentage: session.uptime_percentage || 0,
      last_activity: session.updated_at || session.created_at,
    };
  }

  /**
   * Check if session is healthy
   */
  isSessionHealthy(session) {
    return session.health_status === 'healthy' &&
           session.is_connected &&
           session.is_authenticated &&
           (session.error_count || 0) < 5;
  }

  /**
   * Get session status badge info
   */
  getSessionStatusBadge(session) {
    if (session.status === 'working' && session.is_connected) {
      return { variant: 'success', text: 'Aktif' };
    } else if (session.status === 'connecting') {
      return { variant: 'warning', text: 'Menghubungkan' };
    } else if (session.status === 'disconnected') {
      return { variant: 'secondary', text: 'Terputus' };
    } else if (session.status === 'error') {
      return { variant: 'destructive', text: 'Error' };
    } else {
      return { variant: 'outline', text: 'Tidak Diketahui' };
    }
  }
}

// Export service instance
export const wahaApi = new WahaApiService();
export default wahaApi;
