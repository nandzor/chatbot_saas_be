import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
  Badge,
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
  Progress,
  Separator
} from '@/components/ui';
import {
  Plus,
  Play,
  Square,
  Trash2,
  QrCode,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Clock,
  Smartphone,
  Settings,
  Eye,
  EyeOff,
  MoreVertical
} from 'lucide-react';
import { wahaApi } from '@/services/wahaService';
import { useWahaSessions } from '@/hooks/useWahaSessions';
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
  const [qrCode, setQrCode] = useState('');
  const [isLoadingQR, setIsLoadingQR] = useState(false);
  const [refreshingSessions, setRefreshingSessions] = useState(new Set());

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
      setIsLoadingQR(true);
      const response = await getQrCode(sessionId);
      setQrCode(response.data?.qr || '');
      setShowQRDialog(true);
    } catch (error) {
      toast.error('Gagal memuat QR Code');
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

  const getStatusBadge = (session) => {
    const status = session.status || 'unknown';
    const isConnected = session.connected || false;

    if (isConnected) {
      return <Badge variant="success" className="flex items-center gap-1">
        <CheckCircle className="w-3 h-3" />
        Terhubung
      </Badge>;
    }

    switch (status) {
      case 'ready':
        return <Badge variant="secondary" className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Siap
        </Badge>;
      case 'error':
        return <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          Error
        </Badge>;
      case 'starting':
        return <Badge variant="outline" className="flex items-center gap-1">
          <RefreshCw className="w-3 h-3 animate-spin" />
          Memulai
        </Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getActionButtons = (session, index = 0) => {
    const isConnected = session.connected || false;
    const status = session.status || 'unknown';
    const isRefreshing = refreshingSessions.has(session.id);
    const sessionKey = session.id || `session-${index}`;

    return (
      <div className="flex items-center gap-2">
        {!isConnected && status === 'ready' && (
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

        {status === 'ready' && !isConnected && (
          <Button
            key={`qr-${sessionKey}`}
            size="sm"
            variant="outline"
            onClick={() => handleShowQR(session.id)}
            disabled={isLoadingQR}
            className="flex items-center gap-1"
          >
            <QrCode className="w-3 h-3" />
            QR Code
          </Button>
        )}

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
      {/* Header dengan tombol buat sesi */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Kelola Sesi WAHA</h2>
          <p className="text-muted-foreground">
            Kelola koneksi WhatsApp melalui WAHA (WhatsApp HTTP API)
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Buat Sesi Baru
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

      {/* Statistik Sesi */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Sesi</p>
                <p className="text-2xl font-bold">{sessions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Terhubung</p>
                <p className="text-2xl font-bold text-green-600">{connectedSessions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">Siap</p>
                <p className="text-2xl font-bold text-yellow-600">{readySessions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Error</p>
                <p className="text-2xl font-bold text-red-600">{errorSessions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
              <h3 className="text-lg font-medium mb-2">Belum ada sesi WAHA</h3>
              <p className="text-muted-foreground mb-4">
                Buat sesi baru untuk mulai menggunakan WhatsApp API
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
                  <TableHead>Dibuat</TableHead>
                  <TableHead>Terakhir Update</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session, index) => (
                  <TableRow key={session.id || `session-${index}`}>
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
                      {session.createdAt ? new Date(session.createdAt).toLocaleString('id-ID') : '-'}
                    </TableCell>
                    <TableCell>
                      {session.updatedAt ? new Date(session.updatedAt).toLocaleString('id-ID') : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {getActionButtons(session, index)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog Buat Sesi Baru */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buat Sesi WAHA Baru</DialogTitle>
            <DialogDescription>
              Masukkan ID unik untuk sesi WhatsApp baru. ID ini akan digunakan untuk mengidentifikasi sesi.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="sessionId">Session ID</Label>
              <Input
                id="sessionId"
                value={newSessionId}
                onChange={(e) => setNewSessionId(e.target.value)}
                placeholder="contoh: whatsapp-session-1"
                className="mt-1"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Batal
              </Button>
              <Button onClick={handleCreateSession} disabled={loading}>
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
                <div className="p-4 bg-white rounded-lg border">
                  <img src={qrCode} alt="QR Code" className="w-64 h-64" />
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Buka WhatsApp → Menu → Perangkat Tertaut → Tautkan Perangkat → Pindai QR Code
                </p>
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
