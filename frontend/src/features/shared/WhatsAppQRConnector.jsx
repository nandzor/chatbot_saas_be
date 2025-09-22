import { useState, useEffect, useCallback, useRef } from 'react';
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
  DialogTitle,
  Card,
  CardContent,
  Badge
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
  Copy,
  Smartphone as PhoneIcon,
  ArrowRight,
  Sparkles,
  Eye,
  EyeOff
} from 'lucide-react';
import { wahaApi } from '@/services/wahaService';
import { handleError } from '@/utils/errorHandler';
import toast from 'react-hot-toast';

const WhatsAppQRConnector = ({ onClose, onSuccess, sessionId: providedSessionId }) => {
  const [connectionStep, setConnectionStep] = useState('initializing'); // initializing, qr-ready, scanning, connected, naming, completed
  const [qrCode, setQrCode] = useState('');
  const [inboxName, setInboxName] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [connectionTimeout] = useState(120); // 2 minutes
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [monitoringInterval, setMonitoringInterval] = useState(null);
  const [progress, setProgress] = useState(0);
  const [showQRCode, setShowQRCode] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(connectionTimeout);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const qrRequestRef = useRef(null); // Prevent duplicate QR requests
  const initializationRef = useRef(false); // Prevent duplicate initialization
  const inboxNameInputRef = useRef(null); // For auto focus
  const namingSectionRef = useRef(null); // For auto scroll

  // Regenerate QR code when timeout occurs
  const regenerateQrCode = useCallback(async () => {
    if (isRegenerating) return;

    try {
      setIsRegenerating(true);
      setError(null);
      setProgress(50);

      console.log('🔄 Regenerating QR code for session:', sessionId);
      const response = await wahaApi.regenerateQrCode(sessionId);

      if (response.success && response.data) {
        let qrCodeData = '';

        // Handle the new base64 QR code format
        if (response.data.data) {
          qrCodeData = response.data.data;
        } else if (response.data.qr_code) {
          qrCodeData = response.data.qr_code;
        } else if (typeof response.data === 'string') {
          qrCodeData = response.data;
        }

        if (qrCodeData) {
          setQrCode(qrCodeData);
          setConnectionStep('scanning');
          setProgress(70);
          setTimeRemaining(connectionTimeout); // Reset timer
          toast.success('QR Code berhasil diperbarui');
        } else {
          throw new Error('QR Code tidak tersedia');
        }
      } else {
        throw new Error(response.error || 'Gagal memperbarui QR Code');
      }
    } catch (error) {
      console.error('Failed to regenerate QR code:', error);
      const errorMessage = handleError(error);
      setError(errorMessage);
      setConnectionStep('error');
    } finally {
      setIsRegenerating(false);
    }
  }, [sessionId, isRegenerating, connectionTimeout]);

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
    if (connectionStep === 'initializing' && !initializationRef.current) {
      initializationRef.current = true;

      const initializeSession = async () => {
        try {
          setIsLoading(true);
          setError(null);
          setProgress(10);

          // Use provided session ID or generate new one
          const actualSessionId = providedSessionId || `whatsapp-connector-${Date.now()}`;
          setSessionId(actualSessionId);

          // Only create session if not provided
          if (!providedSessionId) {
            // Create and start session
            const response = await wahaApi.createSession(actualSessionId, {
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

            if (!response.success) {
              throw new Error(response.error || 'Gagal membuat sesi WAHA');
            }
          }

          setProgress(30);
          setConnectionStep('qr-ready');

          // Get QR code directly here to avoid circular dependency
          try {
            setProgress(50);

            // Prevent duplicate QR requests (React StrictMode protection)
            if (qrRequestRef.current) {
              return;
            }

            qrRequestRef.current = true;
            const qrResponse = await wahaApi.getQrCode(actualSessionId);

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
              startConnectionMonitoring(actualSessionId);
            } else {
              throw new Error('QR Code tidak tersedia');
            }
          } catch (qrErr) {
            const errorMessage = handleError(qrErr);
            setError(errorMessage.message || 'Gagal mendapatkan QR Code');
            setConnectionStep('error');
          } finally {
            qrRequestRef.current = false; // Reset QR request flag
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
  }, [connectionStep, providedSessionId]);

  // Cleanup refs when component unmounts or dialog closes
  useEffect(() => {
    return () => {
      initializationRef.current = false;
      qrRequestRef.current = null;
    };
  }, []);

  // Timer countdown effect
  useEffect(() => {
    if (connectionStep === 'scanning') {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            // Auto regenerate QR code when time runs out
            regenerateQrCode();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    } else {
      setTimeRemaining(connectionTimeout);
    }
  }, [connectionStep, connectionTimeout]);

  // Auto scroll and focus when reaching naming step
  useEffect(() => {
    if (connectionStep === 'naming') {
      // Smooth scroll to naming section
      if (namingSectionRef.current) {
        setTimeout(() => {
          namingSectionRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
          });
        }, 300); // Small delay to ensure DOM is ready
      }

      // Auto focus to input field
      if (inboxNameInputRef.current) {
        setTimeout(() => {
          inboxNameInputRef.current.focus();
        }, 500); // Delay to ensure scroll completes first
      }
    }
  }, [connectionStep, regenerateQrCode]);

  // Cleanup monitoring on unmount
  useEffect(() => {
    return () => {
      if (monitoringInterval) {
        clearInterval(monitoringInterval);
      }
      // Reset QR request flag on unmount
      qrRequestRef.current = false;
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

  // Step configuration for progress indicator
  const steps = [
    { id: 'initializing', label: 'Inisialisasi', icon: RefreshCw, completed: ['qr-ready', 'scanning', 'connected', 'naming', 'completed'].includes(connectionStep) },
    { id: 'qr-ready', label: 'QR Code', icon: QrCode, completed: ['scanning', 'connected', 'naming', 'completed'].includes(connectionStep) },
    { id: 'scanning', label: 'Pindai', icon: Smartphone, completed: ['connected', 'naming', 'completed'].includes(connectionStep) },
    { id: 'connected', label: 'Terhubung', icon: CheckCircle, completed: ['naming', 'completed'].includes(connectionStep) },
    { id: 'naming', label: 'Konfigurasi', icon: MessageSquare, completed: connectionStep === 'completed' },
    { id: 'completed', label: 'Selesai', icon: CheckCircle, completed: connectionStep === 'completed' }
  ];

  // const currentStepIndex = steps.findIndex(step => step.id === connectionStep);

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto p-0">
        <DialogHeader className="text-center px-12 pt-12 pb-10 bg-gradient-to-br from-blue-50/50 to-green-50/50 border-b border-gray-100">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-full blur-xl opacity-20"></div>
            <div className="relative bg-white rounded-full p-8 w-28 h-28 mx-auto mb-8 shadow-xl border-4 border-white">
              {getStepIcon()}
            </div>
          </div>
          <DialogTitle className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
            {getStepTitle()}
          </DialogTitle>
          <DialogDescription className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {getStepDescription()}
          </DialogDescription>
        </DialogHeader>

        <div className="px-12 py-12 space-y-12">
          {/* Step Progress Indicator */}
          <div className="relative bg-white rounded-3xl p-12 shadow-xl border border-gray-100">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = step.id === connectionStep;
                const isCompleted = step.completed;

                return (
                  <div key={step.id} className="flex flex-col items-center relative flex-1">
                    <div className={`
                      w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl border-4 border-white
                      ${isCompleted ? 'bg-green-500 text-white shadow-green-200' :
                        isActive ? 'bg-blue-500 text-white shadow-blue-200 animate-pulse' :
                        'bg-gray-100 text-gray-400 shadow-gray-100'}
                    `}>
                      <Icon className={`w-9 h-9 ${isActive && !isCompleted ? 'animate-spin' : ''}`} />
                    </div>
                    <span className={`text-base mt-6 font-semibold text-center px-3 ${
                      isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {step.label}
                    </span>
                    {index < steps.length - 1 && (
                      <div className={`
                        absolute top-10 left-20 w-full h-1.5 transition-all duration-300 rounded-full
                        ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}
                      `} style={{ width: 'calc(100% - 5rem)' }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Enhanced Progress Bar */}
          <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-50 to-green-50">
            <CardContent className="p-12">
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-800">Progress Koneksi</span>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 px-6 py-3 text-base font-bold">
                    {progress}%
                  </Badge>
                </div>
                <Progress value={progress} className="w-full h-5 bg-gray-200" />
                <div className="flex justify-between text-base text-gray-600 font-semibold">
                  <span>Mulai</span>
                  <span>Koneksi WhatsApp</span>
                </div>
              </div>
            </CardContent>
          </Card>

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
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-green-50">
              <CardContent className="p-8 text-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-green-400 rounded-full blur-2xl opacity-30"></div>
                  <div className="relative bg-white rounded-full p-6 w-24 h-24 mx-auto shadow-lg">
                    <QrCode className="w-12 h-12 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">QR Code Siap!</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  QR Code telah berhasil dibuat. Klik tombol di bawah untuk melihat dan memindai QR Code dengan WhatsApp Anda.
                </p>
                <Button
                  onClick={() => {
                    setConnectionStep('scanning');
                    setShowQRCode(true);
                  }}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                  size="lg"
                >
                  <Eye className="w-5 h-5" />
                  Tampilkan QR Code
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          )}

          {(connectionStep === 'scanning' || connectionStep === 'connected') && qrCode && (
            <div className="space-y-12">
              {/* QR Code Display */}
              <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-gray-50">
                <CardContent className="p-16">
                  <div className="text-center">
                    <div className="relative inline-block">
                      <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-400 rounded-3xl blur-2xl opacity-30"></div>
                      <div className="relative bg-white p-12 rounded-3xl shadow-2xl border-8 border-gray-100">
                        <img
                          src={qrCode}
                          alt="WhatsApp QR Code"
                          className="w-96 h-96 mx-auto rounded-2xl shadow-xl"
                        />
                      </div>
                    </div>
                    <div className="mt-12">
                      <h3 className="text-3xl font-bold text-gray-800 mb-4">QR Code WhatsApp</h3>
                      <p className="text-gray-600 text-xl leading-relaxed">Pindai QR Code ini dengan WhatsApp untuk menghubungkan sesi</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Instructions */}
              <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-50 to-green-50">
                <CardContent className="p-16">
                  <div className="text-center mb-16">
                    <div className="flex items-center justify-center gap-4 mb-6">
                      <PhoneIcon className="w-10 h-10 text-blue-600" />
                      <h3 className="text-3xl font-bold text-gray-800">Langkah-langkah:</h3>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="flex items-start gap-6 p-8 bg-white rounded-3xl shadow-xl border border-gray-100">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                          <span className="text-blue-600 font-bold text-xl">1</span>
                        </div>
                        <p className="text-lg text-gray-700 font-semibold leading-relaxed pt-2">Buka WhatsApp di ponsel Anda</p>
                      </div>
                      <div className="flex items-start gap-6 p-8 bg-white rounded-3xl shadow-xl border border-gray-100">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                          <span className="text-blue-600 font-bold text-xl">2</span>
                        </div>
                        <p className="text-lg text-gray-700 font-semibold leading-relaxed pt-2">Ketuk Menu (⋮) atau Pengaturan</p>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="flex items-start gap-6 p-8 bg-white rounded-3xl shadow-xl border border-gray-100">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                          <span className="text-green-600 font-bold text-xl">3</span>
                        </div>
                        <p className="text-lg text-gray-700 font-semibold leading-relaxed pt-2">Pilih &quot;Perangkat Tertaut&quot; atau &quot;Linked Devices&quot;</p>
                      </div>
                      <div className="flex items-start gap-6 p-8 bg-white rounded-3xl shadow-xl border border-gray-100">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                          <span className="text-green-600 font-bold text-xl">4</span>
                        </div>
                        <p className="text-lg text-gray-700 font-semibold leading-relaxed pt-2">Ketuk &quot;Tautkan Perangkat&quot; atau &quot;Link a Device&quot;</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-12 text-center">
                    <div className="flex items-center justify-center gap-6 p-10 bg-white rounded-3xl shadow-xl border border-gray-100">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                        <span className="text-white font-bold text-xl">5</span>
                      </div>
                      <p className="text-xl text-gray-700 font-bold leading-relaxed">Pindai QR Code di atas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-center gap-6">
                <Button
                  variant="outline"
                  onClick={copyQRCode}
                  className="flex items-center gap-4 border-2 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 px-8 py-4 rounded-2xl font-bold text-base"
                >
                  <Copy className="w-6 h-6" />
                  Salin URL
                </Button>
                <Button
                  variant="outline"
                  onClick={downloadQRCode}
                  className="flex items-center gap-4 border-2 hover:bg-green-50 hover:border-green-300 transition-all duration-300 px-8 py-4 rounded-2xl font-bold text-base"
                >
                  <Download className="w-6 h-6" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowQRCode(!showQRCode)}
                  className="flex items-center gap-4 border-2 hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 px-8 py-4 rounded-2xl font-bold text-base"
                >
                  {showQRCode ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                  {showQRCode ? 'Sembunyikan' : 'Tampilkan'}
                </Button>
              </div>

              {/* Connection Status */}
              {connectionStep === 'scanning' && (
                <Card className="border-0 shadow-xl bg-gradient-to-r from-yellow-50 to-orange-50">
                  <CardContent className="p-12">
                    <div className="flex items-center justify-center gap-6 mb-4">
                      <div className="w-6 h-6 bg-yellow-500 rounded-full animate-pulse shadow-xl"></div>
                      <Clock className="w-8 h-8 text-yellow-600" />
                      <span className="text-yellow-800 font-bold text-xl">
                        Menunggu koneksi... ({timeRemaining}s tersisa)
                      </span>
                    </div>
                    <div className="text-center">
                      <Button
                        onClick={regenerateQrCode}
                        disabled={isRegenerating}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg transition-all duration-200 hover:shadow-xl"
                      >
                        {isRegenerating ? (
                          <>
                            <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                            Memperbarui QR Code...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-5 h-5 mr-2" />
                            Perbarui QR Code
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {connectionStep === 'connected' && (
                <Card className="border-0 shadow-xl bg-gradient-to-r from-green-50 to-emerald-50">
                  <CardContent className="p-12">
                    <div className="flex items-center justify-center gap-6">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                      <span className="text-green-800 font-bold text-xl">
                        WhatsApp berhasil terhubung! 🎉
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {connectionStep === 'naming' && (
            <div ref={namingSectionRef} className="space-y-6">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
                <CardContent className="p-8 text-center">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full blur-2xl opacity-30"></div>
                    <div className="relative bg-white rounded-full p-6 w-24 h-24 mx-auto shadow-lg">
                      <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">WhatsApp Berhasil Terhubung! 🎉</h3>
                  <p className="text-gray-600 mb-6">
                    Sekarang berikan nama untuk inbox WhatsApp ini agar mudah dikenali
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="inboxName" className="text-base font-semibold text-gray-700">
                        Nama Inbox WhatsApp
                      </Label>
                      <Input
                        ref={inboxNameInputRef}
                        id="inboxName"
                        value={inboxName}
                        onChange={(e) => setInboxName(e.target.value)}
                        placeholder="Contoh: Customer Service, Sales Team, Support, dll."
                        className="mt-2 h-12 text-lg border-2 focus:border-green-500 focus:ring-green-500"
                      />
                      <p className="text-sm text-gray-500 mt-2">
                        Nama ini akan membantu Anda mengidentifikasi inbox WhatsApp di dashboard
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-emerald-50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-green-100 rounded-full p-3 flex-shrink-0">
                      <Shield className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-green-800 text-lg mb-2">Keamanan Terjamin</h4>
                      <p className="text-green-700 leading-relaxed">
                        Koneksi WhatsApp Anda aman dan terenkripsi end-to-end. Data pribadi tidak akan disimpan di server kami.
                        Semua komunikasi dilindungi dengan standar keamanan tertinggi.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {connectionStep === 'completed' && (
            <div className="space-y-6">
              <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50">
                <CardContent className="p-8 text-center">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full blur-3xl opacity-30"></div>
                    <div className="relative bg-white rounded-full p-8 w-32 h-32 mx-auto shadow-2xl">
                      <CheckCircle className="w-16 h-16 text-green-600" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-800 mb-3">Setup Berhasil! 🎉</h3>
                  <p className="text-lg text-gray-600 mb-6">
                    Inbox WhatsApp <span className="font-bold text-green-600">&quot;{inboxName}&quot;</span> telah siap digunakan
                  </p>

                  <div className="grid md:grid-cols-3 gap-4 mt-8">
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-green-200">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Zap className="w-6 h-6 text-green-600" />
                      </div>
                      <h4 className="font-semibold text-gray-800 mb-1">Siap Digunakan</h4>
                      <p className="text-sm text-gray-600">Inbox siap untuk mengirim dan menerima pesan</p>
                    </div>

                    <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-200">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <MessageSquare className="w-6 h-6 text-blue-600" />
                      </div>
                      <h4 className="font-semibold text-gray-800 mb-1">Auto Reply</h4>
                      <p className="text-sm text-gray-600">Sistem dapat merespons pesan secara otomatis</p>
                    </div>

                    <div className="bg-white rounded-lg p-4 shadow-sm border border-purple-200">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Sparkles className="w-6 h-6 text-purple-600" />
                      </div>
                      <h4 className="font-semibold text-gray-800 mb-1">AI Powered</h4>
                      <p className="text-sm text-gray-600">Dilengkapi dengan kecerdasan buatan</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {connectionStep === 'error' && (
            <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-orange-50">
              <CardContent className="p-8 text-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-orange-400 rounded-full blur-2xl opacity-30"></div>
                  <div className="relative bg-white rounded-full p-6 w-24 h-24 mx-auto shadow-lg">
                    <AlertTriangle className="w-12 h-12 text-red-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Koneksi Gagal</h3>
                <p className="text-gray-600 mb-6">
                  Terjadi kesalahan saat menghubungkan WhatsApp. Silakan coba lagi.
                </p>
                <Button
                  onClick={handleRetry}
                  className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                  size="lg"
                >
                  <RefreshCw className="w-5 h-5" />
                  Coba Lagi
                </Button>
              </CardContent>
            </Card>
          )}

          <Separator className="my-12" />

          {/* Enhanced Action Buttons */}
          <div className="flex justify-between items-center px-8 py-10 bg-gray-50/50 rounded-3xl">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex items-center gap-4 border-2 hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 px-8 py-4 rounded-2xl font-bold text-base"
            >
              <X className="w-6 h-6" />
              Batal
            </Button>

            {connectionStep === 'naming' && (
              <Button
                onClick={handleComplete}
                disabled={isLoading || !inboxName.trim()}
                className="flex items-center gap-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-10 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-base"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-6 h-6 animate-spin" />
                    Menyelesaikan...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-6 h-6" />
                    Selesai
                  </>
                )}
              </Button>
            )}

            {connectionStep === 'completed' && (
              <Button
                onClick={handleClose}
                className="flex items-center gap-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-10 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 font-bold text-base"
                size="lg"
              >
                <CheckCircle className="w-6 h-6" />
                Tutup
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WhatsAppQRConnector;

