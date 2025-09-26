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
  const [paginationLoading, setPaginationLoading] = useState(false);
  const [error, setError] = useState(null);
  const [monitoringSessions, setMonitoringSessions] = useState(new Set());
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    perPage: 10
  });
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    health_status: 'all',
    sortBy: 'created_at',
    sortOrder: 'desc'
  });

  // Load all sessions with pagination support
  const loadSessions = useCallback(async (params = {}) => {
    try {
      // Check if this is a pagination change (not initial load)
      const isPaginationChange = params.page || params.per_page;

      if (isPaginationChange) {
        setPaginationLoading(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const queryParams = {
        page: params.page || pagination.currentPage,
        per_page: params.per_page || pagination.perPage,
        ...filters,
        ...params
      };

      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log('=== LOAD SESSIONS DEBUG ===');
        // eslint-disable-next-line no-console
        console.log('Input params:', params);
        // eslint-disable-next-line no-console
        console.log('Current pagination state:', pagination);
        // eslint-disable-next-line no-console
        console.log('Current filters:', filters);
        // eslint-disable-next-line no-console
        console.log('Final queryParams:', queryParams);
        // eslint-disable-next-line no-console
        console.log('========================');
      }

      const response = await wahaApi.getSessions(queryParams);

      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log('WAHA API Response:', response);
      }

      if (response.success) {
        // Handle non-nested data structure: response.data, response.pagination, response.meta
        const sessionsData = response.data;
        const paginationData = response.pagination;

        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.log('Sessions Data:', sessionsData);
          // eslint-disable-next-line no-console
          console.log('Pagination Data:', paginationData);
        }

        if (Array.isArray(sessionsData)) {
          // Format sessions for display
          const formattedSessions = sessionsData.map(session =>
            wahaApi.formatSessionForDisplay(session)
          );

          if (import.meta.env.DEV) {
            // eslint-disable-next-line no-console
            console.log('Formatted Sessions:', formattedSessions);
          }

          setSessions(formattedSessions);

          // Update pagination if available
          if (paginationData) {
            const newPagination = {
              currentPage: paginationData.current_page || 1,
              totalPages: paginationData.last_page || 1,
              totalItems: paginationData.total || 0,
              perPage: paginationData.per_page || 10
            };

            setPagination(prev => ({
              ...prev,
              ...newPagination
            }));

            if (import.meta.env.DEV) {
              // eslint-disable-next-line no-console
              console.log('Updated pagination:', newPagination);
              // eslint-disable-next-line no-console
              console.log('Meta data:', response.meta);
            }
          } else {
            if (import.meta.env.DEV) {
              // eslint-disable-next-line no-console
              console.warn('No pagination data received');
            }
          }
        } else {
          setSessions([]);
          setPagination(prev => ({
            ...prev,
            currentPage: 1,
            totalPages: 1,
            totalItems: 0,
            perPage: 10
          }));
        }
      } else {
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.error('WAHA API Error:', response);
        }
        throw new Error(response.error || 'Gagal memuat sesi');
      }
    } catch (err) {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.error('WAHA Sessions Error:', err);
      }
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

      // Reset pagination on error
      setPagination(prev => ({
        ...prev,
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        perPage: 10
      }));
    } finally {
      setLoading(false);
      setPaginationLoading(false);
    }
  }, [pagination, filters]);

  // Search sessions
  const searchSessions = useCallback(async (query) => {
    try {
      setLoading(true);
      setError(null);

      const response = await wahaApi.searchSessions(query, {
        page: pagination.currentPage,
        per_page: pagination.perPage,
        ...filters
      });

      if (response.success) {
        // Handle non-nested data structure: response.data, response.pagination, response.meta
        const sessionsData = response.data;
        const paginationData = response.pagination;

        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.log('Search - Sessions Data:', sessionsData);
          // eslint-disable-next-line no-console
          console.log('Search - Pagination Data:', paginationData);
        }

        if (Array.isArray(sessionsData)) {
          const formattedSessions = sessionsData.map(session =>
            wahaApi.formatSessionForDisplay(session)
          );

          setSessions(formattedSessions);

          if (paginationData) {
            const newPagination = {
              currentPage: paginationData.current_page || 1,
              totalPages: paginationData.last_page || 1,
              totalItems: paginationData.total || 0,
              perPage: paginationData.per_page || 10
            };

            setPagination(prev => ({
              ...prev,
              ...newPagination
            }));

            if (import.meta.env.DEV) {
              // eslint-disable-next-line no-console
              console.log('Search - Updated pagination:', newPagination);
            }
          } else {
            if (import.meta.env.DEV) {
              // eslint-disable-next-line no-console
              console.warn('Search - No pagination data received');
            }
          }
        } else {
          setSessions([]);
          setPagination(prev => ({
            ...prev,
            currentPage: 1,
            totalPages: 1,
            totalItems: 0,
            perPage: 10
          }));
        }
      } else {
        throw new Error(response.error || 'Gagal mencari sesi');
      }
    } catch (err) {
      const errorResult = handleError(err);
      setError(errorResult.message);
      toast.error(`Gagal mencari sesi: ${errorResult.message}`);
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.error('Error searching sessions:', err);
      }

      // Reset pagination on error
      setPagination(prev => ({
        ...prev,
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        perPage: 10
      }));
    } finally {
      setLoading(false);
      setPaginationLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Update pagination
  const updatePagination = useCallback((newPagination) => {
    setPagination(prev => ({ ...prev, ...newPagination }));
  }, []);

  // Handle page change
  const handlePageChange = useCallback(async (page) => {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log('handlePageChange called with page:', page, 'currentPage:', pagination.currentPage, 'totalPages:', pagination.totalPages);
    }

    if (page >= 1 && page <= pagination.totalPages && page !== pagination.currentPage) {
      try {
        // Call loadSessions directly without dependency
        await loadSessions({ page });
      } catch (error) {
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.error('Error changing page:', error);
        }
        toast.error('Gagal mengubah halaman');
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.totalPages, pagination.currentPage]);

  // Handle per page change
  const handlePerPageChange = useCallback(async (perPage) => {
    try {
      if (perPage > 0 && perPage <= 100) {
        await loadSessions({ per_page: perPage, page: 1 });
      } else {
        toast.error('Jumlah item per halaman harus antara 1-100');
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.error('Error changing per page:', error);
      }
      toast.error('Gagal mengubah jumlah item per halaman');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Go to first page
  const goToFirstPage = useCallback(async () => {
    await loadSessions({ page: 1 });
  }, [loadSessions]);

  // Go to last page
  const goToLastPage = useCallback(async () => {
    await loadSessions({ page: pagination.totalPages });
  }, [pagination.totalPages, loadSessions]);

  // Go to previous page
  const goToPreviousPage = useCallback(async () => {
    if (pagination.currentPage > 1) {
      const newPage = pagination.currentPage - 1;
      await loadSessions({ page: newPage });
    }
  }, [pagination.currentPage, loadSessions]);

  // Go to next page
  const goToNextPage = useCallback(async () => {
    if (pagination.currentPage < pagination.totalPages) {
      const newPage = pagination.currentPage + 1;
      await loadSessions({ page: newPage });
    }
  }, [pagination.currentPage, pagination.totalPages, loadSessions]);

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
        // Update session status immediately
        setSessions(prev => Array.isArray(prev) ? prev.map(session =>
          session.id === sessionId
            ? { ...session, status: result.data?.status || 'starting', connected: result.data?.status === 'working' }
            : session
        ) : []);

        return result;
      } else {
        throw new Error(result.error || 'Gagal memulai sesi');
      }
    } catch (err) {
      const errorResult = handleError(err);
      setError(errorResult.message);
      toast.error(`${ERROR_MESSAGES.START_SESSION}: ${errorResult.message}`);
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
      const errorResult = handleError(err);
      setError(errorResult.message);
      toast.error(`${ERROR_MESSAGES.STOP_SESSION}: ${errorResult.message}`);
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
      const errorResult = handleError(err);
      setError(errorResult.message);
      toast.error(`${ERROR_MESSAGES.DELETE_SESSION}: ${errorResult.message}`);
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
      const errorResult = handleError(err);
      toast.error(`${ERROR_MESSAGES.GET_STATUS}: ${errorResult.message}`);
      throw err;
    }
  }, []);

  // Check session connection
  const checkSessionConnection = useCallback(async (sessionId) => {
    try {
      const result = await wahaApi.isSessionConnected(sessionId);
      return result;
    } catch (err) {
      const errorResult = handleError(err);
      toast.error(`${ERROR_MESSAGES.GET_STATUS}: ${errorResult.message}`);
      throw err;
    }
  }, []);

  // Get QR Code
  const getQrCode = useCallback(async (sessionId) => {
    try {
      const result = await wahaApi.getQrCode(sessionId);
      return result;
    } catch (err) {
      const errorResult = handleError(err);
      toast.error(`${ERROR_MESSAGES.GET_QR}: ${errorResult.message}`);
      throw err;
    }
  }, []);

  // Send message
  const sendMessage = useCallback(async (sessionId, to, text) => {
    try {
      const result = await wahaApi.sendTextMessage(sessionId, to, text);
      return result;
    } catch (err) {
      const errorResult = handleError(err);
      toast.error(`${ERROR_MESSAGES.SEND_MESSAGE}: ${errorResult.message}`);
      throw err;
    }
  }, []);

  // Send media message
  const sendMediaMessage = useCallback(async (sessionId, to, mediaUrl, caption = '') => {
    try {
      const result = await wahaApi.sendMediaMessage(sessionId, to, mediaUrl, caption);
      return result;
    } catch (err) {
      const errorResult = handleError(err);
      toast.error(`${ERROR_MESSAGES.SEND_MESSAGE}: ${errorResult.message}`);
      throw err;
    }
  }, []);

  // Get messages
  const getMessages = useCallback(async (sessionId, params = {}) => {
    try {
      const result = await wahaApi.getMessages(sessionId, params);
      return result;
    } catch (err) {
      const errorResult = handleError(err);
      toast.error(`${ERROR_MESSAGES.GET_MESSAGES}: ${errorResult.message}`);
      throw err;
    }
  }, []);

  // Get contacts
  const getContacts = useCallback(async (sessionId) => {
    try {
      const result = await wahaApi.getContacts(sessionId);
      return result;
    } catch (err) {
      const errorResult = handleError(err);
      toast.error(`${ERROR_MESSAGES.GET_CONTACTS}: ${errorResult.message}`);
      throw err;
    }
  }, []);

  // Get groups
  const getGroups = useCallback(async (sessionId) => {
    try {
      const result = await wahaApi.getGroups(sessionId);
      return result;
    } catch (err) {
      const errorResult = handleError(err);
      toast.error(`${ERROR_MESSAGES.GET_GROUPS}: ${errorResult.message}`);
      throw err;
    }
  }, []);

  // Get session stats
  const getSessionStats = useCallback(async (sessionId) => {
    try {
      const result = await wahaApi.getSessionStats(sessionId);
      return result;
    } catch (err) {
      const errorResult = handleError(err);
      toast.error(`${ERROR_MESSAGES.GET_STATS}: ${errorResult.message}`);
      throw err;
    }
  }, []);


  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    paginationLoading,
    error,
    pagination,
    filters,
    monitoringSessions: Array.from(monitoringSessions),

    // Actions
    loadSessions,
    searchSessions,
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
    updateFilters,
    updatePagination,

    // Pagination actions
    handlePageChange,
    handlePerPageChange,
    goToFirstPage,
    goToLastPage,
    goToPreviousPage,
    goToNextPage,

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
    totalSessions: sessions.length
  };
};
