import { useState, useEffect, useCallback } from 'react';
import { wahaService } from '@/services/WahaService';
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
      const response = await wahaService.getSessions();
      setSessions(response.data || response || []);
    } catch (err) {
      const errorMessage = handleError(err);
      setError(errorMessage);
      toast.error(`Gagal memuat sesi WAHA: ${errorMessage.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new session
  const createSession = useCallback(async (sessionId) => {
    try {
      setLoading(true);
      setError(null);

      const result = await wahaService.createSession(sessionId);

      // Add to sessions list
      setSessions(prev => [...prev, {
        id: sessionId,
        status: 'ready',
        qrCode: result.qrCode,
        createdAt: new Date(),
        connected: false
      }]);

      toast.success('Sesi WAHA berhasil dibuat');
      return result;
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
  const startSession = useCallback(async (sessionId) => {
    try {
      setLoading(true);
      const result = await wahaService.startSession(sessionId);

      // Update session status
      setSessions(prev => prev.map(session =>
        session.id === sessionId
          ? { ...session, status: 'starting', lastUpdated: new Date() }
          : session
      ));

      toast.success('Sesi WAHA dimulai');
      return result;
    } catch (err) {
      const errorMessage = handleError(err);
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
      const result = await wahaService.stopSession(sessionId);

      // Update session status
      setSessions(prev => prev.map(session =>
        session.id === sessionId
          ? { ...session, status: 'stopped', connected: false, lastUpdated: new Date() }
          : session
      ));

      // Stop monitoring this session
      setMonitoringSessions(prev => {
        const newSet = new Set(prev);
        newSet.delete(sessionId);
        return newSet;
      });

      toast.success('Sesi WAHA dihentikan');
      return result;
    } catch (err) {
      const errorMessage = handleError(err);
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
      const result = await wahaService.deleteSession(sessionId);

      // Remove from sessions list
      setSessions(prev => prev.filter(session => session.id !== sessionId));

      // Stop monitoring this session
      setMonitoringSessions(prev => {
        const newSet = new Set(prev);
        newSet.delete(sessionId);
        return newSet;
      });

      toast.success('Sesi WAHA dihapus');
      return result;
    } catch (err) {
      const errorMessage = handleError(err);
      toast.error(`Gagal menghapus sesi WAHA: ${errorMessage.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get session status
  const getSessionStatus = useCallback(async (sessionId) => {
    try {
      const result = await wahaService.getSessionStatus(sessionId);

      // Update session in list
      setSessions(prev => prev.map(session =>
        session.id === sessionId
          ? { ...session, status: result.status || result.data?.status, lastUpdated: new Date() }
          : session
      ));

      return result;
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Error getting session status:', err);
      }
      throw err;
    }
  }, []);

  // Check if session is connected
  const checkSessionConnection = useCallback(async (sessionId) => {
    try {
      const result = await wahaService.isSessionConnected(sessionId);
      const isConnected = result.connected || result.data?.connected;

      // Update session connection status
      setSessions(prev => prev.map(session =>
        session.id === sessionId
          ? { ...session, connected: isConnected, lastUpdated: new Date() }
          : session
      ));

      return isConnected;
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Error checking session connection:', err);
      }
      return false;
    }
  }, []);

  // Start monitoring session
  const startMonitoring = useCallback((sessionId) => {
    if (monitoringSessions.has(sessionId)) {
      return; // Already monitoring
    }

    setMonitoringSessions(prev => new Set(prev).add(sessionId));

    const stopMonitoring = wahaService.monitorSession(sessionId, (status) => {
      setSessions(prev => prev.map(session =>
        session.id === sessionId
          ? {
              ...session,
              status: status.status,
              connected: status.connected,
              lastUpdated: status.timestamp,
              error: status.error
            }
          : session
      ));

      if (status.connected) {
        toast.success(`Sesi ${sessionId} berhasil terhubung`);
        setMonitoringSessions(prev => {
          const newSet = new Set(prev);
          newSet.delete(sessionId);
          return newSet;
        });
      }
    });

    return stopMonitoring;
  }, [monitoringSessions]);

  // Stop monitoring session
  const stopMonitoring = useCallback((sessionId) => {
    setMonitoringSessions(prev => {
      const newSet = new Set(prev);
      newSet.delete(sessionId);
      return newSet;
    });
  }, []);

  // Get QR code for session
  const getQrCode = useCallback(async (sessionId) => {
    try {
      const result = await wahaService.getQrCode(sessionId);

      // Update session with QR code
      setSessions(prev => prev.map(session =>
        session.id === sessionId
          ? { ...session, qrCode: result.qrCode || result.data?.qrCode, lastUpdated: new Date() }
          : session
      ));

      return result;
    } catch (err) {
      const errorMessage = handleError(err);
      toast.error(`Gagal mendapatkan QR code: ${errorMessage.message}`);
      throw err;
    }
  }, []);

  // Send message
  const sendMessage = useCallback(async (sessionId, messageData) => {
    try {
      // Format phone number
      if (messageData.to) {
        messageData.to = wahaService.formatPhoneNumber(messageData.to);
      }

      const result = await wahaService.sendTextMessage(sessionId, messageData);
      toast.success('Pesan berhasil dikirim');
      return result;
    } catch (err) {
      const errorMessage = handleError(err);
      toast.error(`Gagal mengirim pesan: ${errorMessage.message}`);
      throw err;
    }
  }, []);

  // Send media message
  const sendMediaMessage = useCallback(async (sessionId, messageData) => {
    try {
      // Format phone number
      if (messageData.to) {
        messageData.to = wahaService.formatPhoneNumber(messageData.to);
      }

      const result = await wahaService.sendMediaMessage(sessionId, messageData);
      toast.success('Media berhasil dikirim');
      return result;
    } catch (err) {
      const errorMessage = handleError(err);
      toast.error(`Gagal mengirim media: ${errorMessage.message}`);
      throw err;
    }
  }, []);

  // Get messages
  const getMessages = useCallback(async (sessionId, params = {}) => {
    try {
      const result = await wahaService.getMessages(sessionId, params);
      return result;
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Error getting messages:', err);
      }
      throw err;
    }
  }, []);

  // Get contacts
  const getContacts = useCallback(async (sessionId) => {
    try {
      const result = await wahaService.getContacts(sessionId);
      return result;
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Error getting contacts:', err);
      }
      throw err;
    }
  }, []);

  // Get groups
  const getGroups = useCallback(async (sessionId) => {
    try {
      const result = await wahaService.getGroups(sessionId);
      return result;
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Error getting groups:', err);
      }
      throw err;
    }
  }, []);

  // Get session statistics
  const getSessionStats = useCallback(async (sessionId) => {
    try {
      const result = await wahaService.getSessionStats(sessionId);
      return result;
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Error getting session stats:', err);
      }
      throw err;
    }
  }, []);

  // Bulk start sessions
  const bulkStartSessions = useCallback(async (sessionIds) => {
    try {
      const results = await wahaService.bulkStartSessions(sessionIds);
      const successCount = results.filter(r => r.success).length;
      toast.success(`${successCount} dari ${sessionIds.length} sesi berhasil dimulai`);
      return results;
    } catch (err) {
      const errorMessage = handleError(err);
      toast.error(`Gagal memulai sesi: ${errorMessage.message}`);
      throw err;
    }
  }, []);

  // Bulk stop sessions
  const bulkStopSessions = useCallback(async (sessionIds) => {
    try {
      const results = await wahaService.bulkStopSessions(sessionIds);
      const successCount = results.filter(r => r.success).length;
      toast.success(`${successCount} dari ${sessionIds.length} sesi berhasil dihentikan`);
      return results;
    } catch (err) {
      const errorMessage = handleError(err);
      toast.error(`Gagal menghentikan sesi: ${errorMessage.message}`);
      throw err;
    }
  }, []);

  // Validate phone number
  const validatePhoneNumber = useCallback((phoneNumber) => {
    return wahaService.validatePhoneNumber(phoneNumber);
  }, []);

  // Format phone number
  const formatPhoneNumber = useCallback((phoneNumber) => {
    return wahaService.formatPhoneNumber(phoneNumber);
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
    connectedSessions: sessions.filter(session => session.connected),
    readySessions: sessions.filter(session => session.status === 'ready'),
    errorSessions: sessions.filter(session => session.status === 'error'),
  };
};
