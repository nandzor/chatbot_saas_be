import { useState, useEffect, useCallback, useMemo } from 'react';
import { wahaApi } from '@/services/wahaService';
import { handleError } from '@/utils/errorHandler';
import toast from 'react-hot-toast';

// Constants
const ERROR_MESSAGES = {
  LOAD_SESSIONS: 'Gagal memuat sesi WAHA',
  CREATE_SESSION: 'Gagal membuat sesi',
  START_SESSION: 'Gagal memulai sesi',
  STOP_SESSION: 'Gagal menghentikan sesi',
  DELETE_SESSION: 'Gagal menghapus sesi',
  GET_STATUS: 'Gagal mendapatkan status sesi',
  GET_QR: 'Gagal mendapatkan QR code',
  SEND_MESSAGE: 'Gagal mengirim pesan',
  GET_MESSAGES: 'Gagal mendapatkan pesan',
  GET_CONTACTS: 'Gagal mendapatkan kontak',
  GET_GROUPS: 'Gagal mendapatkan grup',
  GET_STATS: 'Gagal mendapatkan statistik sesi'
};


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
        toast.error(`${ERROR_MESSAGES.LOAD_SESSIONS}: ${organizationError.message}`);
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
        toast.error(`${ERROR_MESSAGES.CREATE_SESSION}: ${organizationError.message}`);
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
      toast.error(`${ERROR_MESSAGES.START_SESSION}: ${errorMessage.message}`);
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
      toast.error(`${ERROR_MESSAGES.STOP_SESSION}: ${errorMessage.message}`);
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
      toast.error(`${ERROR_MESSAGES.DELETE_SESSION}: ${errorMessage.message}`);
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
      toast.error(`${ERROR_MESSAGES.GET_STATUS}: ${errorMessage.message}`);
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
      toast.error(`${ERROR_MESSAGES.GET_STATUS}: ${errorMessage.message}`);
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
      toast.error(`${ERROR_MESSAGES.GET_QR}: ${errorMessage.message}`);
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
      toast.error(`${ERROR_MESSAGES.SEND_MESSAGE}: ${errorMessage.message}`);
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
      toast.error(`${ERROR_MESSAGES.SEND_MESSAGE}: ${errorMessage.message}`);
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
      toast.error(`${ERROR_MESSAGES.GET_MESSAGES}: ${errorMessage.message}`);
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
      toast.error(`${ERROR_MESSAGES.GET_CONTACTS}: ${errorMessage.message}`);
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
      toast.error(`${ERROR_MESSAGES.GET_GROUPS}: ${errorMessage.message}`);
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
      toast.error(`${ERROR_MESSAGES.GET_STATS}: ${errorMessage.message}`);
      throw err;
    }
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

    // Computed - memoized for performance
    connectedSessions: useMemo(() =>
      Array.isArray(sessions) ? sessions.filter(session => session.is_connected) : [],
      [sessions]
    ),
    readySessions: useMemo(() =>
      Array.isArray(sessions) ? sessions.filter(session => session.status === 'ready') : [],
      [sessions]
    ),
    errorSessions: useMemo(() =>
      Array.isArray(sessions) ? sessions.filter(session => session.status === 'error') : [],
      [sessions]
    ),
  };
};
