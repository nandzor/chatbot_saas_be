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
        // Ensure sessions is always an array
        const sessionsData = response.data;
        if (Array.isArray(sessionsData)) {
          setSessions(sessionsData);
        } else if (sessionsData && Array.isArray(sessionsData.sessions)) {
          setSessions(sessionsData.sessions);
        } else if (sessionsData && Array.isArray(sessionsData.data)) {
          setSessions(sessionsData.data);
        } else {
          console.warn('Unexpected sessions data format:', sessionsData);
          setSessions([]);
        }
      } else {
        throw new Error(response.error || 'Gagal memuat sesi');
      }
    } catch (err) {
      const errorMessage = handleError(err);
      setError(errorMessage);
      toast.error(`Gagal memuat sesi WAHA: ${errorMessage.message}`);
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
        // Add to sessions list
        setSessions(prev => Array.isArray(prev) ? [...prev, {
          id: sessionId,
          status: 'ready',
          qrCode: result.data?.qr || '',
          createdAt: new Date(),
          connected: false
        }] : [{
          id: sessionId,
          status: 'ready',
          qrCode: result.data?.qr || '',
          createdAt: new Date(),
          connected: false
        }]);

        toast.success('Sesi WAHA berhasil dibuat');
        return result;
      } else {
        throw new Error(result.error || 'Gagal membuat sesi');
      }
    } catch (err) {
      const errorMessage = handleError(err);
      setError(errorMessage);
      toast.error(`Gagal membuat sesi WAHA: ${errorMessage.message}`);
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
  }, []);

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
  }, []);

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

    // Computed
    connectedSessions: Array.isArray(sessions) ? sessions.filter(session => session.connected) : [],
    readySessions: Array.isArray(sessions) ? sessions.filter(session => session.status === 'ready') : [],
    errorSessions: Array.isArray(sessions) ? sessions.filter(session => session.status === 'error') : [],
  };
};
