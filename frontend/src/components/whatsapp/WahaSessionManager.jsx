import { useState } from 'react';
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
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui';
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
  Image,
  Activity,
  Heart,
  Wifi,
  WifiOff,
  Info,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';
import { useWahaSessions } from '@/hooks/useWahaSessions';
import toast from 'react-hot-toast';

const WahaSessionManager = () => {
  const {
    sessions,
    loading,
    error,
    createSession,
    startSession,
    stopSession,
    deleteSession,
    checkSessionConnection,
    startMonitoring,
    getQrCode,
    loadSessions
  } = useWahaSessions();


  const [showQRDialog, setShowQRDialog] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [isLoadingQR, setIsLoadingQR] = useState(false);
  const [refreshingSessions, setRefreshingSessions] = useState(new Set());
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [expandedSessions, setExpandedSessions] = useState(new Set());

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

  const handleStartSession = async (sessionId) => {
    try {
      await startSession(sessionId);
      startMonitoring(sessionId);
    } catch (error) {
      // Error already handled in hook
    }
  };

  const handleStopSession = async (sessionId) => {
    try {
      await stopSession(sessionId);
    } catch (error) {
      // Error already handled in hook
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus sesi ini?')) {
      return;
    }

    try {
      await deleteSession(sessionId);
    } catch (error) {
      // Error already handled in hook
    }
  };

  const handleShowQR = async (sessionId) => {
    try {
      setIsLoadingQR(true);
      const response = await getQrCode(sessionId);

      // Handle the new base64 QR code format
      if (response.success && response.data) {
        if (response.data.data) {
          // New format: base64 encoded image data
          setQrCode(`data:${response.data.mimetype || 'image/png'};base64,${response.data.data}`);
        } else if (response.data.qr_code) {
          // Fallback: direct QR code data
          setQrCode(response.data.qr_code);
        } else {
          throw new Error('QR code data not available');
        }
        setShowQRDialog(true);
      } else {
        throw new Error(response.message || 'QR code not available');
      }
    } catch (error) {
      toast.error(`Gagal memuat QR Code: ${error.message}`);
    } finally {
      setIsLoadingQR(false);
    }
  };

  const handleRefreshStatus = async (sessionId) => {
    setRefreshingSessions(prev => new Set([...prev, sessionId]));
    try {
      await checkSessionConnection(sessionId);
      await loadSessions();
    } catch (error) {
      toast.error('Gagal memperbarui status sesi');
    } finally {
      setRefreshingSessions(prev => {
        const newSet = new Set(prev);
        newSet.delete(sessionId);
        return newSet;
      });
    }
  };

  const toggleSessionExpansion = (sessionId) => {
    setExpandedSessions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sessionId)) {
        newSet.delete(sessionId);
      } else {
        newSet.add(sessionId);
      }
      return newSet;
    });
  };

  const getHealthStatusIcon = (session) => {
    const healthStatus = session.health_status || 'unknown';
    const isConnected = session.is_connected || false;
    const isAuthenticated = session.is_authenticated || false;

    if (isConnected && isAuthenticated) {
      return <Heart className="w-4 h-4 text-green-500" />;
    }

    switch (healthStatus.toLowerCase()) {
      case 'healthy':
        return <Heart className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getConnectionIcon = (session) => {
    const isConnected = session.is_connected || false;
    const isAuthenticated = session.is_authenticated || false;

    if (isConnected && isAuthenticated) {
      return <Wifi className="w-4 h-4 text-green-500" />;
    } else if (isConnected) {
      return <Wifi className="w-4 h-4 text-yellow-500" />;
    } else {
      return <WifiOff className="w-4 h-4 text-red-500" />;
    }
  };

  const formatSessionStats = (session) => {
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
  };

  const getStatusBadge = (session) => {
    const status = session.status || 'unknown';
    const isConnected = session.is_connected || session.connected || false;
    const isAuthenticated = session.is_authenticated || false;

    // Handle WAHA Plus specific statuses
    if (status === 'SCAN_QR_CODE') {
      return <Badge variant="warning" className="flex items-center gap-1">
        <QrCode className="w-3 h-3" />
        Scan QR Code
      </Badge>;
    }

    if (isConnected && isAuthenticated) {
      return <Badge variant="success" className="flex items-center gap-1">
        <CheckCircle className="w-3 h-3" />
        Terhubung
      </Badge>;
    }

    switch (status.toLowerCase()) {
      case 'working':
        return <Badge variant="success" className="flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Bekerja
        </Badge>;
      case 'connecting':
        return <Badge variant="warning" className="flex items-center gap-1">
          <RefreshCw className="w-3 h-3 animate-spin" />
          Menghubungkan
        </Badge>;
      case 'disconnected':
        return <Badge variant="secondary" className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Terputus
        </Badge>;
      case 'error':
        return <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          Error
        </Badge>;
      case 'ready':
        return <Badge variant="secondary" className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Siap
        </Badge>;
      case 'starting':
        return <Badge variant="outline" className="flex items-center gap-1">
          <RefreshCw className="w-3 h-3 animate-spin" />
          Memulai
        </Badge>;
      case 'stopped':
        return <Badge variant="secondary" className="flex items-center gap-1">
          <Square className="w-3 h-3" />
          Dihentikan
        </Badge>;
      default:
        return <Badge variant="outline" className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {status}
        </Badge>;
    }
  };

  const getActionButtons = (session, index = 0) => {
    const isConnected = session.is_connected || session.connected || false;
    const status = session.status || 'unknown';
    const isRefreshing = refreshingSessions.has(session.id);
    const isExpanded = expandedSessions.has(session.id);
    const sessionKey = session.id || `session-${index}`;

    return (
      <div className="flex items-center gap-2">
        {/* Session Details Toggle */}
        <Button
          key={`details-${sessionKey}`}
          size="sm"
          variant="outline"
          onClick={() => toggleSessionExpansion(session.id)}
          className="flex items-center gap-1"
        >
          {isExpanded ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          {isExpanded ? 'Sembunyikan' : 'Detail'}
        </Button>

        {/* Show QR Code button for connecting or SCAN_QR_CODE status */}
        {(status === 'connecting' || status === 'SCAN_QR_CODE') && (
          <Button
            key={`qr-${sessionKey}`}
            size="sm"
            variant="outline"
            onClick={() => handleShowQR(session.id)}
            disabled={isLoadingQR}
            className="flex items-center gap-1"
          >
            <QrCode className="w-3 h-3" />
            {isLoadingQR ? 'Loading...' : 'QR Code'}
          </Button>
        )}

        {/* Start session button for ready/disconnected sessions */}
        {!isConnected && (status === 'ready' || status === 'disconnected' || status === 'stopped') && (
          <Button
            key={`start-${sessionKey}`}
            size="sm"
            onClick={() => handleStartSession(session.id)}
            disabled={loading}
            className="flex items-center gap-1"
          >
            <Play className="w-3 h-3" />
            Mulai
          </Button>
        )}

        {/* Stop session button for connected sessions */}
        {isConnected && (
          <Button
            key={`stop-${sessionKey}`}
            size="sm"
            variant="outline"
            onClick={() => handleStopSession(session.id)}
            disabled={loading}
            className="flex items-center gap-1"
          >
            <Square className="w-3 h-3" />
            Hentikan
          </Button>
        )}

        {/* Refresh status button */}
        <Button
          key={`refresh-${sessionKey}`}
          size="sm"
          variant="outline"
          onClick={() => handleRefreshStatus(session.id)}
          disabled={isRefreshing}
          className="flex items-center gap-1"
        >
          <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>

        {/* Delete session button */}
        <Button
          key={`delete-${sessionKey}`}
          size="sm"
          variant="outline"
          onClick={() => handleDeleteSession(session.id)}
          disabled={loading}
          className="flex items-center gap-1 text-red-600 hover:text-red-700"
        >
          <Trash2 className="w-3 h-3" />
          Hapus
        </Button>
      </div>
    );
  };

  if (loading && sessions.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Memuat sesi WAHA...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">WAHA Sessions</h2>
          <p className="text-muted-foreground">
            WhatsApp HTTP API Management
          </p>
        </div>
        <Button
          onClick={handleCreateSession}
          disabled={isCreatingSession || loading}
          className="flex items-center gap-2"
        >
          {isCreatingSession ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Smartphone className="w-4 h-4" />
          )}
          {isCreatingSession ? 'Membuat...' : 'Buat Session'}
        </Button>
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

      {/* Tabel Sesi */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Sesi WAHA</CardTitle>
          <CardDescription>
            Kelola dan monitor semua sesi WhatsApp yang terhubung
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="text-center py-8">
              <Smartphone className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No WAHA Sessions</h3>
              <p className="text-muted-foreground">
                No WhatsApp sessions available
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Session Name</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Connection</TableHead>
                  <TableHead>Health</TableHead>
                  <TableHead>Messages</TableHead>
                  <TableHead>Dibuat</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session, index) => {
                  const isExpanded = expandedSessions.has(session.id);
                  const stats = formatSessionStats(session);

                  return (
                    <>
                      <TableRow key={session.id || `session-${index}`}>
                        <TableCell className="font-medium">
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
                        </TableCell>
                        <TableCell>
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
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(session)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {getConnectionIcon(session)}
                            <span className="text-xs">
                              {session.is_connected ? 'Connected' : 'Disconnected'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {getHealthStatusIcon(session)}
                            <span className="text-xs capitalize">
                              {session.health_status || 'unknown'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs">
                            <div className="flex items-center gap-1">
                              <MessageSquare className="w-3 h-3" />
                              <span>{stats.totalMessages}</span>
                            </div>
                            {stats.totalMedia > 0 && (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Image className="w-3 h-3" />
                                <span>{stats.totalMedia}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {session.created_at ? new Date(session.created_at).toLocaleString('id-ID') : '-'}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {getActionButtons(session, index)}
                        </TableCell>
                      </TableRow>

                      {/* Expanded Session Details */}
                      {isExpanded && (
                        <TableRow>
                          <TableCell colSpan={8} className="p-0">
                            <div className="bg-muted/50 p-4 border-t">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* Session Configuration */}
                                <div className="space-y-2">
                                  <h4 className="font-medium flex items-center gap-2">
                                    <Settings className="w-4 h-4" />
                                    Configuration
                                  </h4>
                                  <div className="text-sm space-y-1">
                                    <div><strong>Debug:</strong> {session.config?.debug ? 'Enabled' : 'Disabled'}</div>
                                    <div><strong>Proxy:</strong> {session.config?.proxy || 'None'}</div>
                                    <div><strong>Webhooks:</strong> {session.config?.webhooks?.length || 0} configured</div>
                                    <div><strong>Events:</strong> {session.config?.events?.join(', ') || 'None'}</div>
                                  </div>
                                </div>

                                {/* Session Statistics */}
                                <div className="space-y-2">
                                  <h4 className="font-medium flex items-center gap-2">
                                    <Activity className="w-4 h-4" />
                                    Statistics
                                  </h4>
                                  <div className="text-sm space-y-1">
                                    <div><strong>Messages Sent:</strong> {stats.messagesSent}</div>
                                    <div><strong>Messages Received:</strong> {stats.messagesReceived}</div>
                                    <div><strong>Media Sent:</strong> {stats.mediaSent}</div>
                                    <div><strong>Media Received:</strong> {stats.mediaReceived}</div>
                                    <div><strong>Errors:</strong> {stats.errorCount}</div>
                                  </div>
                                </div>

                                {/* Session Metadata */}
                                <div className="space-y-2">
                                  <h4 className="font-medium flex items-center gap-2">
                                    <Info className="w-4 h-4" />
                                    Metadata
                                  </h4>
                                  <div className="text-sm space-y-1">
                                    {session.config?.metadata && Object.entries(session.config.metadata).map(([key, value]) => (
                                      <div key={key}>
                                        <strong>{key}:</strong> {value}
                                      </div>
                                    ))}
                                    <div><strong>Last Health Check:</strong> {session.last_health_check ? new Date(session.last_health_check).toLocaleString('id-ID') : 'Never'}</div>
                                    <div><strong>Last Error:</strong> {session.last_error || 'None'}</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  );
                })}
              </TableBody>
            </Table>
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
          <div className="space-y-4">
            {isLoadingQR ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Memuat QR Code...</span>
                </div>
              </div>
            ) : qrCode ? (
              <div className="flex flex-col items-center space-y-4">
                <div className="p-4 bg-white rounded-lg border shadow-sm">
                  <img
                    src={qrCode}
                    alt="QR Code WhatsApp"
                    className="w-64 h-64 object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-sm font-medium">Cara Menghubungkan WhatsApp:</p>
                  <ol className="text-sm text-muted-foreground text-left space-y-1">
                    <li>1. Buka aplikasi WhatsApp di smartphone</li>
                    <li>2. Tap Menu (⋮) → Perangkat Tertaut</li>
                    <li>3. Tap &quot;Tautkan Perangkat&quot;</li>
                    <li>4. Pindai QR Code di atas</li>
                  </ol>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">QR Code tidak tersedia</p>
              </div>
            )}
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowQRDialog(false)}>
                Tutup
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WahaSessionManager;
