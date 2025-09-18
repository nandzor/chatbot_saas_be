import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Input,
  Label,
  Alert,
  AlertDescription,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Progress
} from '@/components/ui';
import {
  Plus,
  Play,
  Square,
  Trash2,
  RefreshCw,
  QrCode,
  MessageSquare,
  Users,
  MoreVertical,
  CheckCircle,
  AlertTriangle,
  Clock,
  Smartphone,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useWahaSessions } from '@/hooks/useWahaSessions';
import WhatsAppQRConnector from '@/features/shared/WhatsAppQRConnector';
import toast from 'react-hot-toast';

const WahaSessionManager = () => {
  const {
    sessions,
    loading,
    error,
    connectedSessions,
    readySessions,
    errorSessions,
    createSession,
    startSession,
    stopSession,
    deleteSession,
    getSessionStatus,
    checkSessionConnection,
    startMonitoring,
    stopMonitoring,
    getQrCode,
    loadSessions
  } = useWahaSessions();

  const [showQRDialog, setShowQRDialog] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [newSessionId, setNewSessionId] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const handleCreateSession = async () => {
    if (!newSessionId.trim()) {
      toast.error('Session ID wajib diisi');
      return;
    }

    try {
      await createSession(newSessionId.trim());
      setNewSessionId('');
      setShowCreateDialog(false);
    } catch (error) {
      // Error already handled in hook
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
      setSelectedSession(sessionId);
      await getQrCode(sessionId);
      setShowQRDialog(true);
    } catch (error) {
      // Error already handled in hook
    }
  };

  const handleRefreshStatus = async (sessionId) => {
    try {
      await getSessionStatus(sessionId);
      await checkSessionConnection(sessionId);
    } catch (error) {
      // Error already handled in hook
    }
  };

  const getStatusBadge = (session) => {
    if (session.connected) {
      return (
        <Badge variant="outline" className="text-green-600 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Terhubung
        </Badge>
      );
    }

    switch (session.status) {
      case 'ready':
        return (
          <Badge variant="outline" className="text-blue-600 border-blue-200">
            <Clock className="w-3 h-3 mr-1" />
            Siap
          </Badge>
        );
      case 'starting':
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-200">
            <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
            Memulai
          </Badge>
        );
      case 'stopped':
        return (
          <Badge variant="outline" className="text-gray-600 border-gray-200">
            <Square className="w-3 h-3 mr-1" />
            Dihentikan
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="outline" className="text-red-600 border-red-200">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Error
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-gray-600 border-gray-200">
            <Clock className="w-3 h-3 mr-1" />
            {session.status || 'Unknown'}
          </Badge>
        );
    }
  };

  const getConnectionIcon = (session) => {
    if (session.connected) {
      return <Wifi className="w-4 h-4 text-green-600" />;
    }
    return <WifiOff className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">WAHA Session Manager</h2>
          <p className="text-muted-foreground">
            Kelola sesi WhatsApp menggunakan WAHA (WhatsApp HTTP API)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={loadSessions}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Buat Sesi Baru
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Buat Sesi WAHA Baru</DialogTitle>
                <DialogDescription>
                  Masukkan ID unik untuk sesi WhatsApp baru
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sessionId">Session ID</Label>
                  <Input
                    id="sessionId"
                    placeholder="contoh: whatsapp_business_1"
                    value={newSessionId}
                    onChange={(e) => setNewSessionId(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Gunakan ID yang unik dan mudah diingat
                  </p>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateDialog(false)}
                  >
                    Batal
                  </Button>
                  <Button
                    onClick={handleCreateSession}
                    disabled={loading || !newSessionId.trim()}
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Membuat...
                      </>
                    ) : (
                      'Buat Sesi'
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sesi</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Terhubung</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{connectedSessions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Siap</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{readySessions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{errorSessions.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Sessions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sesi WAHA</CardTitle>
          <CardDescription>
            Daftar semua sesi WhatsApp yang telah dibuat
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Belum Ada Sesi</h3>
              <p className="text-muted-foreground mb-4">
                Buat sesi WAHA pertama Anda untuk mulai menggunakan WhatsApp
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Buat Sesi Pertama
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Session ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Koneksi</TableHead>
                  <TableHead>Dibuat</TableHead>
                  <TableHead>Terakhir Diperbarui</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-muted-foreground" />
                        {session.id}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(session)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getConnectionIcon(session)}
                        <span className="text-sm">
                          {session.connected ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {session.createdAt ? new Date(session.createdAt).toLocaleString('id-ID') : '-'}
                    </TableCell>
                    <TableCell>
                      {session.lastUpdated ? new Date(session.lastUpdated).toLocaleString('id-ID') : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {!session.connected && session.status === 'ready' && (
                            <DropdownMenuItem onClick={() => handleStartSession(session.id)}>
                              <Play className="w-4 h-4 mr-2" />
                              Mulai Sesi
                            </DropdownMenuItem>
                          )}
                          {session.connected && (
                            <DropdownMenuItem onClick={() => handleStopSession(session.id)}>
                              <Square className="w-4 h-4 mr-2" />
                              Hentikan Sesi
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleShowQR(session.id)}>
                            <QrCode className="w-4 h-4 mr-2" />
                            Lihat QR Code
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleRefreshStatus(session.id)}>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Refresh Status
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteSession(session.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Hapus Sesi
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* QR Code Dialog */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>QR Code untuk Sesi {selectedSession}</DialogTitle>
            <DialogDescription>
              Pindai QR code ini dengan WhatsApp untuk menghubungkan sesi
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedSession && (
              <div className="text-center">
                <div className="bg-white p-6 rounded-lg border-2 border-dashed border-gray-300 mb-4">
                  <QrCode className="w-32 h-32 mx-auto text-gray-400" />
                  <p className="text-xs text-muted-foreground mt-2">
                    QR Code akan muncul di sini
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Session ID: <code className="bg-gray-100 px-2 py-1 rounded">{selectedSession}</code>
                </p>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowQRDialog(false)}>
                Tutup
              </Button>
              <Button onClick={() => handleStartSession(selectedSession)}>
                <Play className="w-4 h-4 mr-2" />
                Mulai Sesi
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WahaSessionManager;
