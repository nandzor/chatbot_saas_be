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

const WhatsAppQRConnector = ({ onClose, onSuccess }) => {
  const [connectionStep, setConnectionStep] = useState('initializing'); // initializing, qr-ready, scanning, connected, naming, completed
  const [qrCode, setQrCode] = useState('');
  const [inboxName, setInboxName] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [connectionTimeout, setConnectionTimeout] = useState(120); // 2 minutes
  const [isLoading, setIsLoading] = useState(false);

  // Simulate QR generation
  useEffect(() => {
    if (connectionStep === 'initializing') {
      setIsLoading(true);
      // Simulate WAHA session initialization
      const timer = setTimeout(() => {
        const generatedSessionId = `session_${Date.now()}`;
        setSessionId(generatedSessionId);
        // Generate QR code data (in real implementation, this would come from WAHA API)
        setQrCode(`https://wa.me/qr/${generatedSessionId}_${Date.now()}`);
        setConnectionStep('qr-ready');
        setIsLoading(false);
        startConnectionTimer();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [connectionStep]);

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

    // Simulate successful connection after some time
    const connectionTimer = setTimeout(() => {
      if (connectionStep === 'qr-ready' || connectionStep === 'scanning') {
        setConnectionStep('connected');
        clearInterval(interval);
      }
    }, 15000); // Simulate connection after 15 seconds

    return () => {
      clearInterval(interval);
      clearTimeout(connectionTimer);
    };
  };

  const handleRetry = () => {
    setConnectionStep('initializing');
    setConnectionTimeout(120);
    setQrCode('');
    setSessionId('');
  };

  const handleSaveInbox = () => {
    if (!inboxName.trim()) {
      alert('Nama inbox wajib diisi');
      return;
    }

    setIsLoading(true);
    // Simulate saving inbox
    setTimeout(() => {
      setConnectionStep('completed');
      setIsLoading(false);
      
      // Call success callback
      setTimeout(() => {
        onSuccess?.({
          id: sessionId,
          name: inboxName,
          platform: 'whatsapp',
          status: 'connected',
          method: 'qr_scan'
        });
      }, 2000);
    }, 1500);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getStepProgress = () => {
    const steps = {
      'initializing': 0,
      'qr-ready': 25,
      'scanning': 50,
      'connected': 75,
      'naming': 90,
      'completed': 100
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
                <QrCode className="w-32 h-32 mx-auto text-gray-400 mb-4" />
                <p className="text-xs text-muted-foreground">QR Code akan muncul di sini</p>
                <p className="text-xs text-muted-foreground mt-1">Session ID: {sessionId}</p>
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
