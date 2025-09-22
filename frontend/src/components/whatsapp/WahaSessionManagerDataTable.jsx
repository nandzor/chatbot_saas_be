import { useState, useCallback, useMemo, useRef } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Alert,
  AlertDescription,
  Input,
  Select,
  SelectItem,
  Pagination
} from '@/components/ui';
import DataTable from '@/components/ui/DataTable';
import {
  Play,
  Square,
  Trash2,
  QrCode,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Clock,
  Smartphone,
  MessageSquare,
  Heart,
  Wifi,
  WifiOff,
  MessageCircle,
  Search
} from 'lucide-react';
import { useWahaSessions } from '@/hooks/useWahaSessions';
import WhatsAppQRConnector from '@/features/shared/WhatsAppQRConnector';
import WhatsAppChatDialog from './WhatsAppChatDialog';
import toast from 'react-hot-toast';

// Helper function to get organization ID from JWT token in localStorage
const getOrganizationIdFromToken = () => {
  try {
    const jwtToken = localStorage.getItem('jwt_token');
    if (jwtToken) {
      // Decode JWT token to get organization_id
      const payload = JSON.parse(atob(jwtToken.split('.')[1]));
      return payload.organization_id || null;
    }
    return null;
  } catch (error) {
    console.warn('Failed to decode JWT token:', error);
    return null;
  }
};

// Constants
const SESSION_STATUS = {
  CONNECTED: 'connected',
  CONNECTING: 'connecting',
  DISCONNECTED: 'disconnected',
  SCAN_QR_CODE: 'SCAN_QR_CODE',
  WORKING: 'WORKING',
  READY: 'ready',
  ERROR: 'error'
};

const HEALTH_STATUS = {
  HEALTHY: 'healthy',
  UNHEALTHY: 'unhealthy',
  UNKNOWN: 'unknown'
};

const TOAST_MESSAGES = {
  SESSION_CREATED: 'Sesi berhasil dibuat',
  SESSION_STARTED: 'Sesi berhasil dimulai',
  SESSION_STOPPED: 'Sesi berhasil dihentikan',
  QR_LOADED: 'QR Code berhasil dimuat',
  QR_ERROR: 'Gagal memuat QR Code',
  REFRESH_SUCCESS: 'Data sesi berhasil diperbarui'
};

const WahaSessionManager = () => {
  const {
    sessions,
    loading,
    paginationLoading,
    error,
    pagination,
    filters,
    createSession,
    startSession,
    stopSession,
    deleteSession,
    startMonitoring,
    loadSessions,
    searchSessions,
    updateFilters,
    handlePageChange,
    handlePerPageChange
  } = useWahaSessions();

  // Debug logging
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log('WahaSessionManager - pagination:', pagination);
    // eslint-disable-next-line no-console
    console.log('WahaSessionManager - sessions:', sessions);
  }

  const [showQRConnector, setShowQRConnector] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [createdSessionId, setCreatedSessionId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const isCreatingRef = useRef(false);

  const handleCreateSession = useCallback(async () => {

    // Simple protection using ref - prevents multiple calls
    if (isCreatingRef.current) {
      return;
    }

    try {
      isCreatingRef.current = true;
      setIsCreatingSession(true);

      // Generate a unique session name with same format as backend (max 54 chars for WAHA API)
      const organizationId = getOrganizationIdFromToken() || '42712bc4-9623-46eb-9ff7-87c625c082e4'; // JWT token fallback to default
      const randomId = Math.random().toString(36).substring(2, 6); // 4 character random string (shorter)
      const sessionName = `${organizationId}_session-${randomId}`;

      await createSession(sessionName);

      // Store the session ID and show QR connector
      setCreatedSessionId(sessionName);
      setShowQRConnector(true);

      await loadSessions(); // Refresh sessions after creation
    } catch (error) {
      // Error already handled in hook
    } finally {
      isCreatingRef.current = false;
      setIsCreatingSession(false);
    }
  }, [createSession, loadSessions]);

  const handleStartSession = useCallback(async (sessionId) => {
    try {
      await startSession(sessionId);
      startMonitoring(sessionId);
      toast.success(TOAST_MESSAGES.SESSION_STARTED);
      await loadSessions(); // Refresh sessions after starting
    } catch (error) {
      // Error already handled in hook
    }
  }, [startSession, startMonitoring, loadSessions]);

  const handleStopSession = useCallback(async (sessionId) => {
    try {
      await stopSession(sessionId);
      toast.success(TOAST_MESSAGES.SESSION_STOPPED);
      await loadSessions(); // Refresh sessions after stopping
    } catch (error) {
      // Error already handled in hook
    }
  }, [stopSession, loadSessions]);

  const handleDeleteSession = useCallback(async (sessionId) => {
    try {
      await deleteSession(sessionId);
      // Toast notification is handled in the hook
      await loadSessions(); // Refresh sessions after deletion
    } catch (error) {
      // Error already handled in hook
    }
  }, [deleteSession, loadSessions]);

  const handleShowQR = useCallback((session) => {
    // Pass the session_name to show QR for existing session
    setCreatedSessionId(session.session_name || session.name || session.id);
    setShowQRConnector(true);
  }, []);

  const handleQRConnectorClose = useCallback(() => {
    setShowQRConnector(false);
    setCreatedSessionId(null);
  }, []);

  const handleQRConnectorSuccess = useCallback(async (inboxData) => {
    setShowQRConnector(false);
    setCreatedSessionId(null);
    await loadSessions(); // Refresh sessions after successful connection
    toast.success(`Inbox "${inboxData.name}" berhasil dibuat!`);
  }, [loadSessions]);

  const handleRefreshSessions = useCallback(async () => {
    try {
      await loadSessions();
      toast.success(TOAST_MESSAGES.REFRESH_SUCCESS);
    } catch (error) {
      // Error already handled in hook
    }
  }, [loadSessions]);

  // Handle search
  const handleSearch = useCallback(async (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      await searchSessions(query);
    } else {
      await loadSessions();
    }
  }, [searchSessions, loadSessions]);

  // Handle filter change
  const handleFilterChange = useCallback((key, value) => {
    updateFilters({ [key]: value });
  }, [updateFilters]);

  // Helper functions - memoized for performance
  const getHealthStatusIcon = useCallback((session) => {
    const healthStatus = session.health_status || HEALTH_STATUS.UNKNOWN;
    const isConnected = session.is_connected || false;
    const isAuthenticated = session.is_authenticated || false;

    if (isConnected && isAuthenticated) {
      return <Heart className="w-3 h-3 text-green-500" />;
    } else if (healthStatus === HEALTH_STATUS.UNHEALTHY) {
      return <AlertTriangle className="w-3 h-3 text-red-500" />;
    }
    return <Clock className="w-3 h-3 text-yellow-500" />;
  }, []);

  const getConnectionIcon = useCallback((session) => {
    const isConnected = session.is_connected || false;
    const isAuthenticated = session.is_authenticated || false;

    if (isConnected && isAuthenticated) {
      return <Wifi className="w-4 h-4 text-green-500" />;
    } else if (isConnected) {
      return <Wifi className="w-4 h-4 text-yellow-500" />;
    } else {
      return <WifiOff className="w-4 h-4 text-red-500" />;
    }
  }, []);

  const formatSessionStats = useCallback((session) => {
    const messagesSent = session.total_messages_sent || 0;
    const messagesReceived = session.total_messages_received || 0;
    const mediaSent = session.total_media_sent || 0;
    const mediaReceived = session.total_media_received || 0;
    const errorCount = session.error_count || 0;

    return {
      messagesSent,
      messagesReceived,
      mediaSent,
      mediaReceived,
      errorCount,
      totalMessages: messagesSent + messagesReceived,
      totalMedia: mediaSent + mediaReceived
    };
  }, []);

  const getStatusBadge = useCallback((session) => {
    const status = session.status || 'unknown';
    const isConnected = session.is_connected || session.connected || false;
    const isAuthenticated = session.is_authenticated || false;

    let variant = 'outline';
    let text = status;

    if (status === SESSION_STATUS.READY || status === SESSION_STATUS.WORKING) {
      variant = 'default';
      text = 'Ready';
    } else if (status === SESSION_STATUS.CONNECTING || status === SESSION_STATUS.SCAN_QR_CODE) {
      variant = 'secondary';
      text = 'Connecting Scan QR';
    } else if (status === 'stopped' || status === 'STOPPED') {
      variant = 'destructive';
      text = 'Stopped';
    } else if (status === SESSION_STATUS.ERROR) {
      variant = 'destructive';
      text = 'Error';
    } else if (isConnected && isAuthenticated) {
      variant = 'default';
      text = 'Connected';
    }

    return <Badge variant={variant}>{text}</Badge>;
  }, []);

  // Define columns for DataTable - memoized for performance
  const columns = useMemo(() => [
    {
      key: 'session_name',
      header: 'Session Name',
      sortable: true,
      render: (value, session) => (
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-muted-foreground" />
          <div>
            <div className="font-medium">
              {session.session_name || session.name || session.id}
            </div>
            <div className="text-xs text-muted-foreground">
              ID: {session.id}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'phone_number',
      header: 'Phone Number',
      sortable: true,
      render: (value, session) => (
        <div className="text-sm">
          {session.phone_number ? (
            <div className="flex items-center gap-1">
              <span className="font-mono">{session.phone_number}</span>
              {session.is_authenticated && (
                <CheckCircle className="w-3 h-3 text-green-500" />
              )}
            </div>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (value, session) => getStatusBadge(session)
    },
    {
      key: 'connection',
      header: 'Connection',
      sortable: false,
      render: (value, session) => (
        <div className="flex items-center gap-1">
          {getConnectionIcon(session)}
          <span className="text-xs">
            {session.is_connected && session.is_authenticated ? 'Connected' :
             session.is_connected ? 'Connecting' : 'Disconnected'}
          </span>
        </div>
      )
    },
    {
      key: 'health',
      header: 'Health',
      sortable: true,
      render: (value, session) => (
        <div className="flex items-center gap-1">
          {getHealthStatusIcon(session)}
          <span className="text-xs capitalize">
            {session.health_status || 'unknown'}
          </span>
        </div>
      )
    },
    {
      key: 'messages',
      header: 'Messages',
      sortable: true,
      render: (value, session) => {
        const stats = formatSessionStats(session);
        return (
          <div className="flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            <span>{stats.totalMessages}</span>
          </div>
        );
      }
    },
    {
      key: 'created_at',
      header: 'Dibuat',
      sortable: true,
      render: (value) => (
        <div className="text-sm">
          {new Date(value).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      )
    }
  ], [getHealthStatusIcon, getConnectionIcon, formatSessionStats, getStatusBadge]);

  // Define actions for DataTable - memoized for performance
  const actions = useMemo(() => {
    const actionsList = [
    {
      icon: QrCode,
      label: 'Show QR Code',
      onClick: (session) => handleShowQR(session),
      className: 'text-blue-600 hover:text-blue-700',
      disabled: (session) => {
        // Disable QR button if session is disconnected, working, or connected
        const isDisconnected = session.status === 'disconnected' || session.status === 'DISCONNECTED';
        const isWorking = session.status === 'working' || session.status === 'WORKING';
        const isConnected = session.is_connected && session.is_authenticated;
        return isDisconnected || isWorking || isConnected;
      }
    },
    {
      icon: Play,
      label: 'Start Session',
      onClick: (session) => handleStartSession(session.id),
      className: 'text-green-600 hover:text-green-700',
      disabled: (session) => {
        // Disable start button if session is connecting, working, or connected
        const isConnecting = session.status === 'connecting' || session.status === 'CONNECTING';
        const isWorking = session.status === 'working' || session.status === 'WORKING';
        const isConnected = session.is_connected && session.is_authenticated;
        return isConnecting || isWorking || isConnected;
      }
    },
    {
      icon: Square,
      label: 'Stop Session',
      onClick: (session) => handleStopSession(session.id),
      className: 'text-orange-600 hover:text-orange-700',
      disabled: (session) => {
        // Enable stop button if session is connecting, working, or connected
        // Disable stop button if session is stopped/disconnected
        const isConnecting = session.status === 'connecting' || session.status === 'CONNECTING';
        const isWorking = session.status === 'working' || session.status === 'WORKING';
        const isConnected = session.is_connected && session.is_authenticated;
        const isStopped = session.status === 'stopped' || session.status === 'STOPPED' || session.status === 'disconnected';

        // Stop button should be enabled when session is active (connecting, working, connected)
        // Stop button should be disabled when session is stopped/disconnected
        return isStopped && !isConnecting && !isWorking && !isConnected;
      }
    },
    {
      icon: MessageSquare,
      label: 'Open Chat',
      onClick: () => {}, // Will be handled by WhatsAppChatDialog
      className: 'text-green-600 hover:text-green-700',
      disabled: (session) => {
        // Only enable chat for connected sessions
        const isConnected = session.is_connected && session.is_authenticated;
        return !isConnected;
      },
      customComponent: (session) => (
        <WhatsAppChatDialog
          sessionId={session.id}
          sessionName={session.name || session.session_name}
          isConnected={session.is_connected && session.is_authenticated}
          phoneNumber={session.phone_number}
          onSendMessage={async (_sessionId, _message) => {
            // Mock send message function
            toast.success('Message sent successfully!');
          }}
          onLoadMessages={async (_sessionId) => {
            // Mock load messages function
            // Load messages logic will be implemented here
          }}
        />
      )
    },
    {
      icon: Trash2,
      label: 'Delete Session',
      onClick: (session) => handleDeleteSession(session.session_name || session.name),
      className: 'text-red-600 hover:text-red-700'
    }
  ];
    // console.log('Actions array created with', actionsList.length, 'actions:', actionsList.map(a => a.label));
    return actionsList;
  }, [handleShowQR, handleStartSession, handleStopSession, handleDeleteSession]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground">
            Kelola sesi WhatsApp HTTP API (WAHA)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshSessions}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={handleCreateSession}
            disabled={isCreatingSession || loading}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            {isCreatingSession ? 'Membuat...' : 'Hubungkan WhatsApp Baru'}
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error.message || 'Terjadi kesalahan saat memuat sesi WAHA'}
          </AlertDescription>
        </Alert>
      )}

      {/* Session Statistics Summary */}
      {pagination && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="text-2xl font-bold">{pagination?.totalItems || 0}</div>
                  <div className="text-sm text-muted-foreground">Total Sessions</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <div className="text-2xl font-bold">
                    {sessions.filter(s => s.is_connected && s.is_authenticated).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Connected (Current Page)</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-purple-500" />
                <div>
                  <div className="text-2xl font-bold">
                    {sessions.reduce((total, s) => total + (s.total_messages_sent || 0) + (s.total_messages_received || 0), 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Messages (Current Page)</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <div>
                  <div className="text-2xl font-bold">
                    {sessions.reduce((total, s) => total + (s.error_count || 0), 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Errors (Current Page)</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sessions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sessions</CardTitle>
          <CardDescription>
            Daftar semua sesi WAHA yang tersedia
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Cari sesi..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange('status', value)}
              className="w-40"
            >
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="connected">Connected</SelectItem>
              <SelectItem value="connecting">Connecting</SelectItem>
              <SelectItem value="disconnected">Disconnected</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </Select>

            <Select
              value={filters.health_status}
              onValueChange={(value) => handleFilterChange('health_status', value)}
              className="w-40"
            >
              <SelectItem value="all">Semua Health</SelectItem>
              <SelectItem value="healthy">Healthy</SelectItem>
              <SelectItem value="unhealthy">Unhealthy</SelectItem>
              <SelectItem value="unknown">Unknown</SelectItem>
            </Select>
          </div>

          {sessions.length === 0 && !loading ? (
            <div className="text-center py-8">
              <Smartphone className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Sessions</h3>
              <p className="text-muted-foreground">
                No WhatsApp sessions available
              </p>
            </div>
          ) : (
            <>
              <DataTable
                data={sessions}
                columns={columns}
                actions={actions}
                loading={loading}
                error={error}
                searchable={false}
                ariaLabel="WAHA Sessions Table"
              />

              {/* Pagination - Same as Knowledge Base */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <Pagination
                    currentPage={pagination?.currentPage || 1}
                    totalPages={pagination?.totalPages || 1}
                    totalItems={pagination?.totalItems || 0}
                    perPage={pagination?.perPage || 10}
                    onPageChange={handlePageChange}
                    onPerPageChange={handlePerPageChange}
                    perPageOptions={[5, 10, 25, 50, 100]}
                    variant="table"
                    size="default"
                    loading={paginationLoading}
                    showPageInfo={true}
                    showPerPageSelector={true}
                    showFirstLast={true}
                    showPrevNext={true}
                    showPageNumbers={true}
                    className="w-full max-w-4xl"
                    ariaLabel="WAHA Sessions table pagination"
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      {/* WhatsApp QR Connector Dialog */}
      {showQRConnector && (
        <WhatsAppQRConnector
          onClose={handleQRConnectorClose}
          onSuccess={handleQRConnectorSuccess}
          sessionId={createdSessionId}
        />
      )}
    </div>
  );
};

export default WahaSessionManager;
