import { useState, useEffect, useCallback } from 'react';
import {
  Button,
  Input,
  Label,
  Alert,
  AlertDescription,
  Progress,
  Separator,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui';
import {
  QrCode,
  Smartphone,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  X,
  MessageSquare,
  Shield,
  Clock,
  Zap,
  Download,
  Copy
} from 'lucide-react';
import { wahaApi } from '@/services/wahaService';
import { handleError } from '@/utils/errorHandler';
import toast from 'react-hot-toast';

const WhatsAppQRConnector = ({ onClose, onSuccess }) => {
  const [connectionStep, setConnectionStep] = useState('initializing'); // initializing, qr-ready, scanning, connected, naming, completed
  const [qrCode, setQrCode] = useState('');
  const [inboxName, setInboxName] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [connectionTimeout] = useState(120); // 2 minutes
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [monitoringInterval, setMonitoringInterval] = useState(null);
  const [progress, setProgress] = useState(0);

  // Define startConnectionMonitoring function first
  const startConnectionMonitoring = useCallback((sessionId) => {
    const interval = setInterval(async () => {
      try {
        const statusResponse = await wahaApi.getSessionStatus(sessionId);

        if (statusResponse.success) {
          const status = statusResponse.data?.status;
          const isConnected = statusResponse.data?.is_connected;
          const isAuthenticated = statusResponse.data?.is_authenticated;

          // Check for connected status (WAHA Plus format)
          if (status === 'WORKING' || status === 'CONNECTED' || (isConnected && isAuthenticated)) {
            setProgress(90);
            setConnectionStep('connected');
            clearInterval(interval);
            setMonitoringInterval(null);

            // Wait a moment then move to naming step
            setTimeout(() => {
              setConnectionStep('naming');
              setProgress(100);
            }, 2000);
          } else if (status === 'FAILED' || status === 'STOPPED' || status === 'error') {
            throw new Error('Koneksi gagal');
          }
          // Continue monitoring for other statuses like 'connecting', 'SCAN_QR_CODE', etc.
        }
      } catch (err) {
        setError('Gagal memantau status koneksi');
        clearInterval(interval);
        setMonitoringInterval(null);
        setConnectionStep('error');
      }
    }, 3000); // Check every 3 seconds

    setMonitoringInterval(interval);

    // Set timeout
    setTimeout(() => {
      if (connectionStep === 'scanning') {
        clearInterval(interval);
        setMonitoringInterval(null);
        setError('Timeout: QR Code tidak dipindai dalam waktu yang ditentukan');
        setConnectionStep('error');
      }
    }, connectionTimeout * 1000);
  }, [connectionStep, connectionTimeout]);

  // Initialize WAHA session and get QR code
  useEffect(() => {
    if (connectionStep === 'initializing') {
      const initializeSession = async () => {
        try {
          setIsLoading(true);
          setError(null);
          setProgress(10);

          // Generate unique session ID for WAHA Plus compatibility
          const timestamp = Date.now();
          const newSessionId = `whatsapp-connector-${timestamp}`;
          setSessionId(newSessionId);

          // Create and start session
          const response = await wahaApi.createSession(newSessionId, {
            metadata: {
              'user.id': 'frontend-user',
              'user.email': 'user@frontend.com'
            },
            webhook_by_events: false,
            events: ['message', 'session.status'],
            reject_calls: false,
            mark_online_on_chat: true,
            debug: true,
          });

          if (response.success) {
            setProgress(30);
            setConnectionStep('qr-ready');

            // Get QR code directly here to avoid circular dependency
            try {
              setProgress(50);
              const qrResponse = await wahaApi.getQrCode(newSessionId);

              if (qrResponse.success && qrResponse.data) {
                let qrCodeData = '';

                // Handle the new base64 QR code format
                if (qrResponse.data.data) {
                  // New format: base64 encoded image data
                  qrCodeData = `data:${qrResponse.data.mimetype || 'image/png'};base64,${qrResponse.data.data}`;
                } else if (qrResponse.data.qr_code) {
                  // Fallback: direct QR code data
                  qrCodeData = qrResponse.data.qr_code;
                } else if (qrResponse.data.qr) {
                  // Legacy format
                  qrCodeData = qrResponse.data.qr;
                } else {
                  throw new Error('QR Code data not available');
                }

                setQrCode(qrCodeData);
                setConnectionStep('scanning');
                setProgress(70);

                // Start monitoring connection status
                startConnectionMonitoring(newSessionId);
              } else {
                throw new Error('QR Code tidak tersedia');
              }
            } catch (qrErr) {
              const errorMessage = handleError(qrErr);
              setError(errorMessage.message || 'Gagal mendapatkan QR Code');
              setConnectionStep('error');
            }
          } else {
            throw new Error(response.error || 'Gagal membuat sesi WAHA');
          }
        } catch (err) {
          const errorMessage = handleError(err);
          setError(errorMessage.message || 'Gagal menginisialisasi sesi WAHA');
          setConnectionStep('error');
        } finally {
          setIsLoading(false);
        }
      };

      initializeSession();
    }
  }, [connectionStep, startConnectionMonitoring]);

  // Cleanup monitoring on unmount
  useEffect(() => {
    return () => {
      if (monitoringInterval) {
        clearInterval(monitoringInterval);
      }
    };
  }, [monitoringInterval]);

  const handleComplete = async () => {
    if (!inboxName.trim()) {
      toast.error('Nama inbox wajib diisi');
      return;
    }

    try {
      setIsLoading(true);

      // Here you would typically save the inbox configuration
      // For now, we'll just simulate success
      const inboxData = {
        id: sessionId,
        name: inboxName.trim(),
        sessionId: sessionId,
        status: 'connected',
        createdAt: new Date().toISOString(),
      };

      setConnectionStep('completed');
      setProgress(100);

      // Call success callback
      if (onSuccess) {
        onSuccess(inboxData);
      }

      toast.success(`Inbox "${inboxName}" berhasil dibuat!`);
    } catch (err) {
      const errorMessage = handleError(err);
      setError(errorMessage.message || 'Gagal menyelesaikan setup');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setConnectionStep('initializing');
    setProgress(0);
    setQrCode('');
    setInboxName('');
    setSessionId('');
  };

  const handleClose = () => {
    // Cleanup monitoring
    if (monitoringInterval) {
      clearInterval(monitoringInterval);
    }

    // Stop session if not completed
    if (sessionId && connectionStep !== 'completed') {
      wahaApi.stopSession(sessionId).catch(() => {
        // Ignore errors when stopping session
      });
    }

    if (onClose) {
      onClose();
    }
  };

  const copyQRCode = () => {
    if (qrCode) {
      navigator.clipboard.writeText(qrCode);
      toast.success('QR Code URL disalin ke clipboard');
    }
  };

  const downloadQRCode = () => {
    if (qrCode) {
      const link = document.createElement('a');
      link.href = qrCode;
      link.download = `whatsapp-qr-${sessionId}.png`;
      link.click();
    }
  };

  const getStepIcon = () => {
    switch (connectionStep) {
      case 'initializing':
        return <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />;
      case 'qr-ready':
      case 'scanning':
        return <QrCode className="w-8 h-8 text-blue-600" />;
      case 'connected':
        return <CheckCircle className="w-8 h-8 text-green-600" />;
      case 'naming':
        return <MessageSquare className="w-8 h-8 text-green-600" />;
      case 'completed':
        return <CheckCircle className="w-8 h-8 text-green-600" />;
      case 'error':
        return <AlertTriangle className="w-8 h-8 text-red-600" />;
      default:
        return <Smartphone className="w-8 h-8 text-gray-600" />;
    }
  };

  const getStepTitle = () => {
    switch (connectionStep) {
      case 'initializing':
        return 'Menginisialisasi Sesi WAHA';
      case 'qr-ready':
        return 'QR Code Siap';
      case 'scanning':
        return 'Pindai QR Code';
      case 'connected':
        return 'Berhasil Terhubung';
      case 'naming':
        return 'Beri Nama Inbox';
      case 'completed':
        return 'Setup Selesai';
      case 'error':
        return 'Terjadi Kesalahan';
      default:
        return 'Koneksi WhatsApp';
    }
  };

  const getStepDescription = () => {
    switch (connectionStep) {
      case 'initializing':
        return 'Membuat sesi WAHA dan mempersiapkan koneksi...';
      case 'qr-ready':
        return 'QR Code telah siap. Klik tombol di bawah untuk melihat QR Code.';
      case 'scanning':
        return 'Pindai QR Code dengan WhatsApp untuk menghubungkan perangkat.';
      case 'connected':
        return 'WhatsApp berhasil terhubung! Mengatur konfigurasi...';
      case 'naming':
        return 'Berikan nama untuk inbox WhatsApp ini.';
      case 'completed':
        return 'Setup inbox WhatsApp berhasil diselesaikan!';
      case 'error':
        return 'Terjadi kesalahan saat menghubungkan WhatsApp.';
      default:
        return 'Menghubungkan WhatsApp melalui WAHA API.';
    }
  };

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {getStepIcon()}
            {getStepTitle()}
          </DialogTitle>
          <DialogDescription>
            {getStepDescription()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Content based on step */}
          {connectionStep === 'initializing' && (
            <div className="text-center py-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                <span className="text-lg font-medium">Menginisialisasi...</span>
              </div>
              <p className="text-muted-foreground">
                Membuat sesi WAHA dan mempersiapkan koneksi WhatsApp
              </p>
            </div>
          )}

          {connectionStep === 'qr-ready' && (
            <div className="text-center py-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <QrCode className="w-6 h-6 text-blue-600" />
                <span className="text-lg font-medium">QR Code Siap</span>
              </div>
              <p className="text-muted-foreground mb-4">
                Klik tombol di bawah untuk melihat QR Code
              </p>
              <Button onClick={() => setConnectionStep('scanning')} className="flex items-center gap-2">
                <QrCode className="w-4 h-4" />
                Tampilkan QR Code
              </Button>
            </div>
          )}

          {(connectionStep === 'scanning' || connectionStep === 'connected') && qrCode && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="p-4 bg-white rounded-lg border inline-block">
                  <img src={qrCode} alt="QR Code" className="w-64 h-64" />
                </div>
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm font-medium">Cara Menghubungkan:</p>
                <ol className="text-sm text-muted-foreground space-y-1">
                  <li>1. Buka WhatsApp di ponsel Anda</li>
                  <li>2. Ketuk Menu (⋮) → Perangkat Tertaut</li>
                  <li>3. Ketuk &quot;Tautkan Perangkat&quot;</li>
                  <li>4. Pindai QR Code di atas</li>
                </ol>
              </div>

              <div className="flex justify-center gap-2">
                <Button variant="outline" size="sm" onClick={copyQRCode}>
                  <Copy className="w-4 h-4 mr-2" />
                  Salin URL
                </Button>
                <Button variant="outline" size="sm" onClick={downloadQRCode}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>

              {connectionStep === 'scanning' && (
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Menunggu koneksi... ({connectionTimeout}s)</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {connectionStep === 'naming' && (
            <div className="space-y-4">
              <div className="text-center">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">WhatsApp Berhasil Terhubung!</h3>
                <p className="text-muted-foreground">
                  Berikan nama untuk inbox WhatsApp ini
                </p>
              </div>

              <div>
                <Label htmlFor="inboxName">Nama Inbox</Label>
                <Input
                  id="inboxName"
                  value={inboxName}
                  onChange={(e) => setInboxName(e.target.value)}
                  placeholder="Contoh: Customer Service, Sales Team, dll."
                  className="mt-1"
                />
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-800">Keamanan Terjamin</h4>
                    <p className="text-sm text-green-700 mt-1">
                      Koneksi WhatsApp Anda aman dan terenkripsi. Data tidak akan disimpan di server kami.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {connectionStep === 'completed' && (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Setup Berhasil!</h3>
              <p className="text-muted-foreground mb-4">
                Inbox WhatsApp &quot;{inboxName}&quot; telah siap digunakan
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-800">
                  <Zap className="w-4 h-4" />
                  <span className="font-medium">Siap untuk mengirim pesan!</span>
                </div>
              </div>
            </div>
          )}

          {connectionStep === 'error' && (
            <div className="text-center py-8">
              <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Koneksi Gagal</h3>
              <p className="text-muted-foreground mb-4">
                Terjadi kesalahan saat menghubungkan WhatsApp
              </p>
              <Button onClick={handleRetry} className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Coba Lagi
              </Button>
            </div>
          )}

          <Separator />

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={handleClose}>
              <X className="w-4 h-4 mr-2" />
              Batal
            </Button>

            {connectionStep === 'naming' && (
              <Button
                onClick={handleComplete}
                disabled={isLoading || !inboxName.trim()}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Menyelesaikan...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Selesai
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WhatsAppQRConnector;
