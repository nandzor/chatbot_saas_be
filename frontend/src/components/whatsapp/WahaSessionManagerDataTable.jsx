import { useState, useCallback, useMemo } from 'react';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
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
  WifiOff
} from 'lucide-react';
import { useWahaSessions } from '@/hooks/useWahaSessions';
import toast from 'react-hot-toast';

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
  SESSION_DELETED: 'Sesi berhasil dihapus',
  QR_LOADED: 'QR Code berhasil dimuat',
  QR_ERROR: 'Gagal memuat QR Code',
  REFRESH_SUCCESS: 'Data sesi berhasil diperbarui'
};

const WahaSessionManager = () => {
  const {
    sessions,
    loading,
    error,
    createSession,
    startSession,
    stopSession,
    deleteSession,
    startMonitoring,
    getQrCode,
    loadSessions
  } = useWahaSessions();

  const [showQRDialog, setShowQRDialog] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [isLoadingQR, setIsLoadingQR] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);

  const handleCreateSession = async () => {
    try {
      setIsCreatingSession(true);

      // Generate a unique session name with timestamp
      const timestamp = Date.now();
      const sessionName = `session-${timestamp}`;

      await createSession(sessionName, {
        metadata: {
          'user.id': 'frontend-user',
          'user.email': 'user@frontend.com'
        },
        proxy: null,
        debug: true,
        noweb: {
          store: {
            enabled: true,
            fullSync: false
          }
        },
        webhooks: [
          {
            url: 'https://webhook.site/11111111-1111-1111-1111-11111111',
            events: ['message', 'session.status'],
            hmac: null,
            retries: null,
            customHeaders: null
          }
        ]
      });
      await loadSessions(); // Refresh sessions after creation
    } catch (error) {
      // Error already handled in hook
    } finally {
      setIsCreatingSession(false);
    }
  };

  const handleStartSession = useCallback(async (sessionId) => {
    try {
      await startSession(sessionId);
      startMonitoring(sessionId);
      toast.success(TOAST_MESSAGES.SESSION_STARTED);
    } catch (error) {
      // Error already handled in hook
    }
  }, [startSession, startMonitoring]);

  const handleStopSession = useCallback(async (sessionId) => {
    try {
      await stopSession(sessionId);
      toast.success(TOAST_MESSAGES.SESSION_STOPPED);
    } catch (error) {
      // Error already handled in hook
    }
  }, [stopSession]);

  const handleDeleteSession = useCallback(async (sessionId) => {
    try {
      await deleteSession(sessionId);
      toast.success(TOAST_MESSAGES.SESSION_DELETED);
    } catch (error) {
      // Error already handled in hook
    }
  }, [deleteSession]);

  const handleShowQR = useCallback(async (sessionId) => {
    try {
      setIsLoadingQR(true);
      const response = await getQrCode(sessionId);

      if (response.success && response.data) {
        // Handle base64 QR code data
        const qrData = response.data.qr_code || response.data.qr || response.data.data;
        if (qrData) {
          const qrImageUrl = `data:image/png;base64,${qrData}`;
          setQrCode(qrImageUrl);
          setShowQRDialog(true);
          toast.success(TOAST_MESSAGES.QR_LOADED);
        } else {
          throw new Error('QR code not available');
        }
      } else {
        throw new Error(response.message || 'QR code not available');
      }
    } catch (error) {
      toast.error(`${TOAST_MESSAGES.QR_ERROR}: ${error.message}`);
    } finally {
      setIsLoadingQR(false);
    }
  }, [getQrCode]);

  const handleRefreshSessions = useCallback(async () => {
    try {
      await loadSessions();
      toast.success(TOAST_MESSAGES.REFRESH_SUCCESS);
    } catch (error) {
      // Error already handled in hook
    }
  }, [loadSessions]);

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
      text = 'Connecting';
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
  const actions = useMemo(() => [
    {
      icon: QrCode,
      label: 'Show QR Code',
      onClick: (session) => handleShowQR(session.id),
      className: 'text-blue-600 hover:text-blue-700'
    },
    {
      icon: Play,
      label: 'Start Session',
      onClick: (session) => handleStartSession(session.id),
      className: 'text-green-600 hover:text-green-700'
    },
    {
      icon: Square,
      label: 'Stop Session',
      onClick: (session) => handleStopSession(session.id),
      className: 'text-red-600 hover:text-red-700'
    },
    {
      icon: Trash2,
      label: 'Delete Session',
      onClick: (session) => handleDeleteSession(session.id),
      className: 'text-red-600 hover:text-red-700'
    }
  ], [handleShowQR, handleStartSession, handleStopSession, handleDeleteSession]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">WAHA Sessions</h2>
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
          >
            {isCreatingSession ? 'Creating...' : 'Create Session'}
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
      {sessions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="text-2xl font-bold">{sessions.length}</div>
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
                  <div className="text-sm text-muted-foreground">Connected</div>
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
                  <div className="text-sm text-muted-foreground">Total Messages</div>
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
                  <div className="text-sm text-muted-foreground">Total Errors</div>
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
          {sessions.length === 0 && !loading ? (
            <div className="text-center py-8">
              <Smartphone className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Sessions</h3>
              <p className="text-muted-foreground">
                No WhatsApp sessions available
              </p>
            </div>
          ) : (
            <DataTable
              data={sessions}
              columns={columns}
              actions={actions}
              loading={loading}
              error={error}
              searchable={true}
              ariaLabel="WAHA Sessions Table"
            />
          )}
        </CardContent>
      </Card>

      {/* Dialog QR Code */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>QR Code Koneksi WhatsApp</DialogTitle>
            <DialogDescription>
              Pindai QR Code ini dengan WhatsApp untuk menghubungkan sesi
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4">
            {isLoadingQR ? (
              <div className="flex items-center justify-center p-8">
                <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : qrCode ? (
              <div className="space-y-4">
                <img
                  src={qrCode}
                  alt="QR Code WhatsApp"
                  className="w-64 h-64 mx-auto border rounded-lg"
                />
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Langkah-langkah:
                  </p>
                  <ol className="text-sm text-left space-y-1">
                    <li>1. Buka WhatsApp di ponsel Anda</li>
                    <li>2. Ketuk Menu (⋮) atau Pengaturan</li>
                    <li>3. Pilih &quot;Perangkat Tertaut&quot; atau &quot;Linked Devices&quot;</li>
                    <li>4. Ketuk &quot;Tautkan Perangkat&quot; atau &quot;Link a Device&quot;</li>
                    <li>5. Pindai QR Code di atas</li>
                  </ol>
                </div>
              </div>
            ) : (
              <div className="text-center p-8">
                <AlertTriangle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">QR Code tidak tersedia</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WahaSessionManager;
