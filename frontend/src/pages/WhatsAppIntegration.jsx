import React, { useState, useEffect } from 'react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Alert,
  AlertDescription,
  Badge,
  Button,
  Progress
} from '@/components/ui';
import {
  MessageSquare,
  Settings,
  BarChart3,
  Smartphone,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Users,
  Send,
  QrCode,
  Activity,
  Zap,
  Shield,
  Globe
} from 'lucide-react';
import WahaSessionManager from '@/components/whatsapp/WahaSessionManager';
import WhatsAppMessageManager from '@/components/whatsapp/WhatsAppMessageManager';
import WhatsAppQRConnector from '@/features/shared/WhatsAppQRConnector';
import { useWahaSessions } from '@/hooks/useWahaSessions';
import { wahaApi } from '@/services/wahaService';
import toast from 'react-hot-toast';

const WhatsAppIntegration = () => {
  const {
    connectedSessions,
    readySessions,
    errorSessions,
    sessions,
    loading,
    loadSessions
  } = useWahaSessions();

  const [activeTab, setActiveTab] = useState('sessions');
  const [showQRConnector, setShowQRConnector] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('unknown');
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Auto-refresh sessions every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadSessions();
      setLastUpdate(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, [loadSessions]);

  // Test WAHA connection on mount
  useEffect(() => {
    testWahaConnection();
  }, []);

  const testWahaConnection = async () => {
    try {
      const response = await wahaApi.testConnection();
      if (response.success) {
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('error');
      }
    } catch (error) {
      setConnectionStatus('error');
    }
  };

  const handleQRSuccess = (inboxData) => {
    toast.success(`Inbox "${inboxData.name}" berhasil dibuat!`);
    setShowQRConnector(false);
    loadSessions(); // Refresh sessions
  };

  const getStatusSummary = () => {
    const total = sessions.length;
    const connected = connectedSessions.length;
    const ready = readySessions.length;
    const error = errorSessions.length;

    return { total, connected, ready, error };
  };

  const getConnectionStatusBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return (
          <Badge variant="success" className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            WAHA Terhubung
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            WAHA Error
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Mengecek...
          </Badge>
        );
    }
  };

  const status = getStatusSummary();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <MessageSquare className="h-8 w-8 mr-3 text-green-600" />
            WhatsApp Integration
          </h1>
          <p className="text-muted-foreground">
            Kelola koneksi WhatsApp menggunakan WAHA (WhatsApp HTTP API)
          </p>
        </div>
        <div className="flex items-center gap-2">
          {getConnectionStatusBadge()}
          <Button
            onClick={() => setShowQRConnector(true)}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Smartphone className="w-4 h-4 mr-2" />
            Hubungkan WhatsApp
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Sesi</p>
                <p className="text-2xl font-bold">{status.total}</p>
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
                <p className="text-2xl font-bold text-green-600">{status.connected}</p>
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
                <p className="text-2xl font-bold text-yellow-600">{status.ready}</p>
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
                <p className="text-2xl font-bold text-red-600">{status.error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* WAHA Connection Status */}
      {connectionStatus === 'error' && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            WAHA server tidak dapat diakses. Pastikan server WAHA berjalan dan konfigurasi benar.
            <Button
              variant="outline"
              size="sm"
              onClick={testWahaConnection}
              className="ml-2"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Coba Lagi
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Akses cepat ke fitur-fitur utama WhatsApp Integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center gap-2"
              onClick={() => setActiveTab('sessions')}
            >
              <Settings className="w-6 h-6" />
              <span>Kelola Sesi</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center gap-2"
              onClick={() => setActiveTab('messages')}
            >
              <Send className="w-6 h-6" />
              <span>Kirim Pesan</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center gap-2"
              onClick={() => setShowQRConnector(true)}
            >
              <QrCode className="w-6 h-6" />
              <span>Hubungkan Baru</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sessions" className="flex items-center">
            <Settings className="h-4 w-4 mr-2" />
            Kelola Sesi
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center">
            <MessageSquare className="h-4 w-4 mr-2" />
            Kirim Pesan
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Sessions Tab */}
        <TabsContent value="sessions">
          <WahaSessionManager />
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages">
          <WhatsAppMessageManager />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="space-y-6">
            {/* Analytics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Pesan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">-</div>
                  <p className="text-xs text-muted-foreground">
                    Data akan tersedia setelah ada aktivitas
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Pesan Hari Ini</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">-</div>
                  <p className="text-xs text-muted-foreground">
                    Data akan tersedia setelah ada aktivitas
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Kontak Aktif</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">-</div>
                  <p className="text-xs text-muted-foreground">
                    Data akan tersedia setelah ada aktivitas
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Analytics Chart Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>WhatsApp Analytics</CardTitle>
                <CardDescription>
                  Statistik dan analisis penggunaan WhatsApp melalui WAHA
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Analytics Coming Soon</h3>
                  <p className="text-muted-foreground mb-4">
                    Fitur analitik akan segera tersedia untuk melacak penggunaan WhatsApp.
                  </p>
                  <div className="flex justify-center gap-2">
                    <Badge variant="outline">Pesan per Hari</Badge>
                    <Badge variant="outline">Kontak Aktif</Badge>
                    <Badge variant="outline">Response Time</Badge>
                    <Badge variant="outline">Success Rate</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  Aktivitas terbaru dari sesi WhatsApp
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Belum ada aktivitas</h3>
                  <p className="text-muted-foreground">
                    Aktivitas akan muncul setelah Anda mulai menggunakan WhatsApp Integration
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* QR Connector Modal */}
      {showQRConnector && (
        <WhatsAppQRConnector
          onClose={() => setShowQRConnector(false)}
          onSuccess={handleQRSuccess}
        />
      )}

      {/* Footer Info */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Shield className="w-4 h-4" />
                <span>Terenskripsi End-to-End</span>
              </div>
              <div className="flex items-center gap-1">
                <Globe className="w-4 h-4" />
                <span>WAHA API v2.0</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <RefreshCw className="w-3 h-3" />
              <span>Terakhir update: {lastUpdate.toLocaleTimeString('id-ID')}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WhatsAppIntegration;
