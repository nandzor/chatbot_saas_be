import React, { useState, useEffect } from 'react';
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
  Progress,
  Separator
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
  Zap
} from 'lucide-react';
import { wahaService } from '@/services/WahaService';
import { handleError } from '@/utils/errorHandler';
import toast from 'react-hot-toast';

const WhatsAppQRConnector = ({ onClose, onSuccess }) => {
  const [connectionStep, setConnectionStep] = useState('initializing'); // initializing, qr-ready, scanning, connected, naming, completed
  const [qrCode, setQrCode] = useState('');
  const [inboxName, setInboxName] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [connectionTimeout, setConnectionTimeout] = useState(120); // 2 minutes
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [monitoringInterval, setMonitoringInterval] = useState(null);

  // Initialize WAHA session and get QR code
  useEffect(() => {
    if (connectionStep === 'initializing') {
      initializeWahaSession();
    }
  }, [connectionStep]);

  const initializeWahaSession = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Generate unique session ID
      const generatedSessionId = `whatsapp_${Date.now()}`;
      setSessionId(generatedSessionId);

      // Create WAHA session
      const result = await wahaService.createSession(generatedSessionId);

      if (result.qrCode) {
        setQrCode(result.qrCode);
        setConnectionStep('qr-ready');
        startConnectionTimer();
        startMonitoring();
      } else {
        throw new Error('QR code tidak tersedia');
      }
    } catch (err) {
      const errorMessage = handleError(err);
      setError(errorMessage);
      toast.error(`Gagal membuat sesi WAHA: ${errorMessage.message}`);
      setConnectionStep('error');
    } finally {
      setIsLoading(false);
    }
  };

  // Connection timeout timer
  const startConnectionTimer = () => {
    const interval = setInterval(() => {
      setConnectionTimeout(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          if (connectionStep !== 'connected' && connectionStep !== 'completed') {
            setConnectionStep('timeout');
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  };

  // Start monitoring session connection
  const startMonitoring = () => {
    if (!sessionId) return;

    const stopMonitoring = wahaService.monitorSession(sessionId, (status) => {
      if (status.connected) {
        setConnectionStep('connected');
        toast.success('WhatsApp berhasil terhubung!');
        stopMonitoring();
      } else if (status.status === 'error') {
        setError(status.error);
        setConnectionStep('error');
        stopMonitoring();
      }
    }, 2000);

    setMonitoringInterval(() => stopMonitoring);
  };

  const handleRetry = () => {
    // Clean up monitoring
    if (monitoringInterval) {
      monitoringInterval();
      setMonitoringInterval(null);
    }

    setConnectionStep('initializing');
    setConnectionTimeout(120);
    setQrCode('');
    setSessionId('');
    setError(null);
  };

  const handleSaveInbox = async () => {
    if (!inboxName.trim()) {
      toast.error('Nama inbox wajib diisi');
      return;
    }

    try {
      setIsLoading(true);

      // Here you would typically save the inbox configuration to your backend
      // For now, we'll just simulate the success
      setConnectionStep('completed');

      // Call success callback
      setTimeout(() => {
        onSuccess?.({
          id: sessionId,
          name: inboxName,
          platform: 'whatsapp',
          status: 'connected',
          method: 'qr_scan',
          wahaSessionId: sessionId
        });
      }, 2000);
    } catch (err) {
      const errorMessage = handleError(err);
      toast.error(`Gagal menyimpan inbox: ${errorMessage.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (monitoringInterval) {
        monitoringInterval();
      }
    };
  }, [monitoringInterval]);

  const getStepProgress = () => {
    const steps = {
      'initializing': 0,
      'qr-ready': 25,
      'scanning': 50,
      'connected': 75,
      'naming': 90,
      'completed': 100,
      'error': 0,
      'timeout': 0
    };
    return steps[connectionStep] || 0;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold">Hubungkan WhatsApp</h2>
            <p className="text-sm text-muted-foreground">WAHA Session - QR Code</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium">Progress:</span>
            <span className="text-sm text-muted-foreground">{getStepProgress()}%</span>
          </div>
          <Progress value={getStepProgress()} className="mb-4" />
        </div>

        {/* Warning Alert */}
        <div className="px-6 mb-4">
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Penting:</strong> Metode WAHA Session bersifat tidak resmi dan memiliki risiko pemblokiran oleh WhatsApp.
              Cocok untuk skala kecil atau masa percobaan.
            </AlertDescription>
          </Alert>
        </div>

        {/* Main Content */}
        <div className="px-6 pb-6">
          {/* Initializing Step */}
          {connectionStep === 'initializing' && (
            <div className="text-center space-y-4">
              <div className="animate-spin mx-auto">
                <RefreshCw className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Memulai Sesi WAHA</h3>
                <p className="text-sm text-muted-foreground">
                  Platform sedang membuat sesi baru di latar belakang...
                </p>
              </div>
            </div>
          )}

          {/* QR Ready Step */}
          {connectionStep === 'qr-ready' && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="font-semibold mb-2">Pindai QR Code</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Gunakan aplikasi WhatsApp Anda untuk memindai QR code di bawah ini
                </p>
              </div>

              {/* QR Code Display */}
              <div className="bg-white p-6 rounded-lg border-2 border-dashed border-gray-300 text-center">
                {qrCode ? (
                  <div className="space-y-2">
                    <img
                      src={qrCode}
                      alt="WhatsApp QR Code"
                      className="w-32 h-32 mx-auto border rounded"
                    />
                    <p className="text-xs text-green-600 font-medium">QR Code siap dipindai</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <QrCode className="w-32 h-32 mx-auto text-gray-400" />
                    <p className="text-xs text-muted-foreground">Memuat QR Code...</p>
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-2">Session ID: {sessionId}</p>
              </div>

              {/* Instructions */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Langkah-langkah:</h4>
                <ol className="text-sm space-y-2 list-decimal list-inside text-muted-foreground">
                  <li>Buka aplikasi WhatsApp di ponsel Anda</li>
                  <li>Masuk ke <strong>Setelan</strong> → <strong>Perangkat Tertaut</strong></li>
                  <li>Klik <strong>"Tautkan Perangkat"</strong></li>
                  <li>Arahkan kamera untuk memindai QR code di atas</li>
                </ol>
              </div>

              {/* Timer */}
              <div className="flex items-center justify-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>QR Code kedaluwarsa dalam: </span>
                <Badge variant="outline">{formatTime(connectionTimeout)}</Badge>
              </div>

              <Button
                variant="outline"
                onClick={handleRetry}
                className="w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Generate QR Baru
              </Button>
            </div>
          )}

          {/* Scanning Step */}
          {connectionStep === 'scanning' && (
            <div className="text-center space-y-4">
              <div className="animate-pulse">
                <Smartphone className="w-12 h-12 mx-auto text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Mendeteksi Koneksi...</h3>
                <p className="text-sm text-muted-foreground">
                  QR Code telah dipindai. Tunggu konfirmasi koneksi...
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>Timeout dalam: {formatTime(connectionTimeout)}</span>
              </div>
            </div>
          )}

          {/* Connected Step */}
          {connectionStep === 'connected' && (
            <div className="text-center space-y-4">
              <CheckCircle className="w-12 h-12 mx-auto text-green-500" />
              <div>
                <h3 className="font-semibold mb-2 text-green-700">Koneksi Berhasil!</h3>
                <p className="text-sm text-muted-foreground">
                  WhatsApp telah terhubung dengan platform. Berikan nama untuk inbox ini.
                </p>
              </div>
              <Button
                onClick={() => setConnectionStep('naming')}
                className="w-full"
              >
                Lanjutkan
              </Button>
            </div>
          )}

          {/* Naming Step */}
          {connectionStep === 'naming' && (
            <div className="space-y-4">
              <div className="text-center">
                <MessageSquare className="w-8 h-8 mx-auto text-primary mb-2" />
                <h3 className="font-semibold mb-2">Beri Nama Inbox</h3>
                <p className="text-sm text-muted-foreground">
                  Berikan nama yang mudah dikenali untuk koneksi WhatsApp ini
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="inboxName">Nama Inbox</Label>
                <Input
                  id="inboxName"
                  placeholder="Contoh: CS Tim Marketing, Nomor Admin 1"
                  value={inboxName}
                  onChange={(e) => setInboxName(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Nama ini akan muncul di daftar inbox Anda
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Ringkasan Koneksi:</h4>
                <div className="bg-muted p-3 rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Platform:</span>
                    <span className="font-medium">WhatsApp</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Metode:</span>
                    <span className="font-medium">QR Scan (WAHA)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Session ID:</span>
                    <span className="font-mono text-xs">{sessionId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant="outline" className="text-green-600">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Terhubung
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setConnectionStep('connected')}
                  className="flex-1"
                >
                  Kembali
                </Button>
                <Button
                  onClick={handleSaveInbox}
                  disabled={!inboxName.trim() || isLoading}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Simpan Inbox
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Completed Step */}
          {connectionStep === 'completed' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-green-700">Inbox Berhasil Dibuat!</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  "{inboxName}" telah terhubung dan siap digunakan.
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg text-left">
                <h4 className="font-medium text-sm mb-2 text-blue-800">Langkah Selanjutnya:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Atur AI Agent untuk otomatisasi respon</li>
                  <li>• Konfigurasi metode distribusi pesan</li>
                  <li>• Tetapkan divisi dan human agent</li>
                  <li>• Mulai menangani percakapan pelanggan</li>
                </ul>
              </div>

              <Button onClick={onClose} className="w-full">
                <Zap className="w-4 h-4 mr-2" />
                Mulai Menggunakan Inbox
              </Button>
            </div>
          )}

          {/* Error Step */}
          {connectionStep === 'error' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-red-700">Terjadi Kesalahan</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {error?.message || 'Gagal membuat sesi WAHA. Silakan coba lagi.'}
                </p>
                {error?.details && (
                  <p className="text-xs text-muted-foreground">
                    Detail: {error.details}
                  </p>
                )}
              </div>
              <Button onClick={handleRetry} className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Coba Lagi
              </Button>
            </div>
          )}

          {/* Timeout Step */}
          {connectionStep === 'timeout' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                <X className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-red-700">Koneksi Timeout</h3>
                <p className="text-sm text-muted-foreground">
                  QR Code telah kedaluwarsa. Silakan coba lagi untuk membuat koneksi baru.
                </p>
              </div>
              <Button onClick={handleRetry} className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Coba Lagi
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WhatsAppQRConnector;
