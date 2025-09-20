import { useState, useEffect, useCallback } from 'react';
import { wahaApi } from '@/services/wahaService';
import { handleError } from '@/utils/errorHandler';
import toast from 'react-hot-toast';

export const useWahaSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [monitoringSessions, setMonitoringSessions] = useState(new Set());

  // Load all sessions
  const loadSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await wahaApi.getSessions();

      if (response.success) {
        // Enhanced response format with organization context
        const sessionsData = response.data;

        if (sessionsData && Array.isArray(sessionsData.sessions)) {
          // Format sessions for display
          const formattedSessions = sessionsData.sessions.map(session =>
            wahaApi.formatSessionForDisplay(session)
          );

          setSessions(formattedSessions);
        } else {
          setSessions([]);
        }
      } else {
        throw new Error(response.error || 'Gagal memuat sesi');
      }
    } catch (err) {
      // Handle organization-specific errors
      const organizationError = wahaApi.handleOrganizationError(err);
      setError(organizationError);

      if (organizationError.type === 'organization_error') {
        toast.error('Anda harus menjadi anggota organization untuk mengakses fitur WAHA');
      } else if (organizationError.type === 'auth_error') {
        toast.error('Sesi Anda telah berakhir. Silakan login kembali.');
      } else {
        toast.error(`Gagal memuat sesi WAHA: ${organizationError.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new session
  const createSession = useCallback(async (sessionId, config = {}) => {
    try {
      setLoading(true);
      setError(null);

      const result = await wahaApi.createSession(sessionId, config);

      if (result.success) {
        // Enhanced session data with organization context
        const newSession = wahaApi.formatSessionForDisplay({
          id: result.data.local_session_id,
          session_name: result.data.session_name || sessionId,
          status: result.data.status || 'connecting',
          organization_id: result.data.organization_id,
          phone_number: config.phone_number || '+6281234567890',
          business_name: config.business_name,
          business_description: config.business_description,
          business_category: config.business_category,
          business_website: config.business_website,
          business_email: config.business_email,
          is_connected: false,
          is_authenticated: false,
          health_status: 'unknown',
          error_count: 0,
          total_messages_sent: 0,
          total_messages_received: 0,
          total_media_sent: 0,
          total_media_received: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        // Add to sessions list
        setSessions(prev => Array.isArray(prev) ? [...prev, newSession] : [newSession]);

        toast.success('Sesi WAHA berhasil dibuat');
        return result;
      } else {
        throw new Error(result.error || 'Gagal membuat sesi');
      }
    } catch (err) {
      // Handle organization-specific errors
      const organizationError = wahaApi.handleOrganizationError(err);
      setError(organizationError);

      if (organizationError.type === 'organization_error') {
        toast.error('Anda harus menjadi anggota organization untuk membuat sesi WAHA');
      } else {
        toast.error(`Gagal membuat sesi WAHA: ${organizationError.message}`);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Start session
  const startSession = useCallback(async (sessionId, config = {}) => {
    try {
      setLoading(true);
      setError(null);

      const result = await wahaApi.startSession(sessionId, config);

      if (result.success) {
        // Update session status
        setSessions(prev => Array.isArray(prev) ? prev.map(session =>
          session.id === sessionId
            ? { ...session, status: 'starting', connected: false }
            : session
        ) : []);

        toast.success('Sesi WAHA berhasil dimulai');
        return result;
      } else {
        throw new Error(result.error || 'Gagal memulai sesi');
      }
    } catch (err) {
      const errorMessage = handleError(err);
      setError(errorMessage);
      toast.error(`Gagal memulai sesi WAHA: ${errorMessage.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Start monitoring session
  const startMonitoring = useCallback((sessionId) => {
    setMonitoringSessions(prev => new Set([...prev, sessionId]));
  }, []);

  // Stop monitoring session
  const stopMonitoring = useCallback((sessionId) => {
    setMonitoringSessions(prev => {
      const newSet = new Set(prev);
      newSet.delete(sessionId);
      return newSet;
    });
  }, []);

  // Stop session
  const stopSession = useCallback(async (sessionId) => {
    try {
      setLoading(true);
      setError(null);

      const result = await wahaApi.stopSession(sessionId);

      if (result.success) {
        // Update session status
        setSessions(prev => Array.isArray(prev) ? prev.map(session =>
          session.id === sessionId
            ? { ...session, status: 'stopped', connected: false }
            : session
        ) : []);

        // Stop monitoring this session
        stopMonitoring(sessionId);

        toast.success('Sesi WAHA berhasil dihentikan');
        return result;
      } else {
        throw new Error(result.error || 'Gagal menghentikan sesi');
      }
    } catch (err) {
      const errorMessage = handleError(err);
      setError(errorMessage);
      toast.error(`Gagal menghentikan sesi WAHA: ${errorMessage.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [stopMonitoring]);

  // Delete session
  const deleteSession = useCallback(async (sessionId) => {
    try {
      setLoading(true);
      setError(null);

      const result = await wahaApi.deleteSession(sessionId);

      if (result.success) {
        // Remove from sessions list
        setSessions(prev => Array.isArray(prev) ? prev.filter(session => session.id !== sessionId) : []);

        // Stop monitoring this session
        stopMonitoring(sessionId);

        toast.success('Sesi WAHA berhasil dihapus');
        return result;
      } else {
        throw new Error(result.error || 'Gagal menghapus sesi');
      }
    } catch (err) {
      const errorMessage = handleError(err);
      setError(errorMessage);
      toast.error(`Gagal menghapus sesi WAHA: ${errorMessage.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [stopMonitoring]);

  // Get session status
  const getSessionStatus = useCallback(async (sessionId) => {
    try {
      const result = await wahaApi.getSessionStatus(sessionId);
      return result;
    } catch (err) {
      const errorMessage = handleError(err);
      toast.error(`Gagal mendapatkan status sesi: ${errorMessage.message}`);
      throw err;
    }
  }, []);

  // Check session connection
  const checkSessionConnection = useCallback(async (sessionId) => {
    try {
      const result = await wahaApi.isSessionConnected(sessionId);
      return result;
    } catch (err) {
      const errorMessage = handleError(err);
      toast.error(`Gagal mengecek koneksi sesi: ${errorMessage.message}`);
      throw err;
    }
  }, []);

  // Get QR Code
  const getQrCode = useCallback(async (sessionId) => {
    try {
      const result = await wahaApi.getQrCode(sessionId);
      return result;
    } catch (err) {
      const errorMessage = handleError(err);
      toast.error(`Gagal mendapatkan QR Code: ${errorMessage.message}`);
      throw err;
    }
  }, []);

  // Send message
  const sendMessage = useCallback(async (sessionId, to, text) => {
    try {
      const result = await wahaApi.sendTextMessage(sessionId, to, text);
      return result;
    } catch (err) {
      const errorMessage = handleError(err);
      toast.error(`Gagal mengirim pesan: ${errorMessage.message}`);
      throw err;
    }
  }, []);

  // Send media message
  const sendMediaMessage = useCallback(async (sessionId, to, mediaUrl, caption = '') => {
    try {
      const result = await wahaApi.sendMediaMessage(sessionId, to, mediaUrl, caption);
      return result;
    } catch (err) {
      const errorMessage = handleError(err);
      toast.error(`Gagal mengirim pesan media: ${errorMessage.message}`);
      throw err;
    }
  }, []);

  // Get messages
  const getMessages = useCallback(async (sessionId, params = {}) => {
    try {
      const result = await wahaApi.getMessages(sessionId, params);
      return result;
    } catch (err) {
      const errorMessage = handleError(err);
      toast.error(`Gagal mendapatkan pesan: ${errorMessage.message}`);
      throw err;
    }
  }, []);

  // Get contacts
  const getContacts = useCallback(async (sessionId) => {
    try {
      const result = await wahaApi.getContacts(sessionId);
      return result;
    } catch (err) {
      const errorMessage = handleError(err);
      toast.error(`Gagal mendapatkan kontak: ${errorMessage.message}`);
      throw err;
    }
  }, []);

  // Get groups
  const getGroups = useCallback(async (sessionId) => {
    try {
      const result = await wahaApi.getGroups(sessionId);
      return result;
    } catch (err) {
      const errorMessage = handleError(err);
      toast.error(`Gagal mendapatkan grup: ${errorMessage.message}`);
      throw err;
    }
  }, []);

  // Get session stats
  const getSessionStats = useCallback(async (sessionId) => {
    try {
      const result = await wahaApi.getSessionStats(sessionId);
      return result;
    } catch (err) {
      const errorMessage = handleError(err);
      toast.error(`Gagal mendapatkan statistik sesi: ${errorMessage.message}`);
      throw err;
    }
  }, []);

  // Bulk start sessions
  const bulkStartSessions = useCallback(async (sessionIds, config = {}) => {
    try {
      const result = await wahaApi.bulkStartSessions(sessionIds, config);
      return result;
    } catch (err) {
      const errorMessage = handleError(err);
      toast.error(`Gagal memulai sesi secara massal: ${errorMessage.message}`);
      throw err;
    }
  }, []);

  // Bulk stop sessions
  const bulkStopSessions = useCallback(async (sessionIds) => {
    try {
      const result = await wahaApi.bulkStopSessions(sessionIds);
      return result;
    } catch (err) {
      const errorMessage = handleError(err);
      toast.error(`Gagal menghentikan sesi secara massal: ${errorMessage.message}`);
      throw err;
    }
  }, []);

  // Validate phone number
  const validatePhoneNumber = useCallback((phoneNumber) => {
    return wahaApi.validatePhoneNumber(phoneNumber);
  }, []);

  // Format phone number
  const formatPhoneNumber = useCallback((phoneNumber) => {
    return wahaApi.formatPhoneNumber(phoneNumber);
  }, []);

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Cleanup monitoring on unmount
  useEffect(() => {
    return () => {
      monitoringSessions.forEach(sessionId => {
        stopMonitoring(sessionId);
      });
    };
  }, [monitoringSessions, stopMonitoring]);

  // Get session statistics
  const getSessionStatistics = useCallback((sessionId) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return null;
    return wahaApi.getSessionStatistics(session);
  }, [sessions]);

  // Check if session is healthy
  const isSessionHealthy = useCallback((sessionId) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return false;
    return wahaApi.isSessionHealthy(session);
  }, [sessions]);

  // Get session status badge
  const getSessionStatusBadge = useCallback((sessionId) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return { variant: 'outline', text: 'Tidak Diketahui' };
    return wahaApi.getSessionStatusBadge(session);
  }, [sessions]);

  // Get organization context
  const getOrganizationContext = useCallback(() => {
    if (sessions.length > 0) {
      return wahaApi.getOrganizationFromSession(sessions[0]);
    }
    return null;
  }, [sessions]);

  // Filter sessions by health status
  const getHealthySessions = useCallback(() => {
    return Array.isArray(sessions) ? sessions.filter(session => wahaApi.isSessionHealthy(session)) : [];
  }, [sessions]);

  // Filter sessions by organization
  const getSessionsByOrganization = useCallback((organizationId) => {
    return Array.isArray(sessions) ? sessions.filter(session =>
      wahaApi.isSessionOwnedByOrganization(session, organizationId)
    ) : [];
  }, [sessions]);

  return {
    // State
    sessions,
    loading,
    error,
    monitoringSessions: Array.from(monitoringSessions),

    // Actions
    loadSessions,
    createSession,
    startSession,
    stopSession,
    deleteSession,
    getSessionStatus,
    checkSessionConnection,
    startMonitoring,
    stopMonitoring,
    getQrCode,
    sendMessage,
    sendMediaMessage,
    getMessages,
    getContacts,
    getGroups,
    getSessionStats,
    bulkStartSessions,
    bulkStopSessions,
    validatePhoneNumber,
    formatPhoneNumber,

    // Enhanced Actions
    getSessionStatistics,
    isSessionHealthy,
    getSessionStatusBadge,
    getOrganizationContext,
    getHealthySessions,
    getSessionsByOrganization,

    // Computed
    connectedSessions: Array.isArray(sessions) ? sessions.filter(session => session.is_connected) : [],
    readySessions: Array.isArray(sessions) ? sessions.filter(session => session.status === 'ready') : [],
    errorSessions: Array.isArray(sessions) ? sessions.filter(session => session.status === 'error') : [],
    healthySessions: getHealthySessions(),
  };
};
