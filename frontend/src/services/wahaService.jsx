import { BaseApiService } from '@/api/BaseApiService';

/**
 * WAHA (WhatsApp HTTP API) Service
 * Service untuk mengintegrasikan frontend dengan backend WAHA
 * Menggunakan BaseApiService untuk konsistensi dengan service lainnya
 */
export class WahaApiService extends BaseApiService {
  constructor() {
    super('/waha');
  }

  /**
   * Test koneksi ke WAHA server
   */
  async testConnection() {
    return this.get('/test');
  }

  /**
   * Mendapatkan semua sesi WAHA
   */
  async getSessions() {
    return this.get('/sessions');
  }

  /**
   * Membuat sesi baru (alias untuk startSession)
   */
  async createSession(sessionId, config = {}) {
    return this.startSession(sessionId, config);
  }

  /**
   * Memulai sesi WAHA
   */
  async startSession(sessionId, config = {}) {
    return this.post(`/sessions/${sessionId}/start`, config);
  }

  /**
   * Menghentikan sesi WAHA
   */
  async stopSession(sessionId) {
    return this.post(`/sessions/${sessionId}/stop`);
  }

  /**
   * Menghapus sesi WAHA
   */
  async deleteSession(sessionId) {
    return this.delete(`/sessions/${sessionId}`);
  }

  /**
   * Mendapatkan status sesi
   */
  async getSessionStatus(sessionId) {
    return this.get(`/sessions/${sessionId}/status`);
  }

  /**
   * Mendapatkan informasi sesi
   */
  async getSessionInfo(sessionId) {
    return this.get(`/sessions/${sessionId}/info`);
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
}

// Export service instance
export const wahaApi = new WahaApiService();
export default wahaApi;
