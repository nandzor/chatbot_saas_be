import React, { useState } from 'react';
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
  AlertDescription
} from '@/components/ui';
import {
  MessageSquare,
  Settings,
  BarChart3,
  Smartphone,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import WahaSessionManager from '@/components/whatsapp/WahaSessionManager';
import WhatsAppMessageManager from '@/components/whatsapp/WhatsAppMessageManager';
import WhatsAppQRConnector from '@/features/shared/WhatsAppQRConnector';
import { useWahaSessions } from '@/hooks/useWahaSessions';
import toast from 'react-hot-toast';

const WhatsAppIntegration = () => {
  const { connectedSessions, readySessions, errorSessions, sessions } = useWahaSessions();
  const [activeTab, setActiveTab] = useState('sessions');
  const [showQRConnector, setShowQRConnector] = useState(false);

  const handleQRSuccess = (inboxData) => {
    toast.success(`Inbox "${inboxData.name}" berhasil dibuat!`);
    setShowQRConnector(false);
    // You can add additional logic here to refresh sessions or navigate
  };

  const getStatusSummary = () => {
    const total = sessions.length;
    const connected = connectedSessions.length;
    const ready = readySessions.length;
    const error = errorSessions.length;

    return { total, connected, ready, error };
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
          <button
            onClick={() => setShowQRConnector(true)}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Smartphone className="w-4 h-4 mr-2" />
            Hubungkan WhatsApp
          </button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sesi</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{status.total}</div>
            <p className="text-xs text-muted-foreground">
              Semua sesi WAHA
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Terhubung</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{status.connected}</div>
            <p className="text-xs text-muted-foreground">
              Sesi aktif dan siap digunakan
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Siap</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{status.ready}</div>
            <p className="text-xs text-muted-foreground">
              Menunggu koneksi WhatsApp
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{status.error}</div>
            <p className="text-xs text-muted-foreground">
              Sesi dengan masalah
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Warning Alert */}
      <Alert className="border-orange-200 bg-orange-50">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          <strong>Peringatan:</strong> WAHA menggunakan metode tidak resmi untuk mengakses WhatsApp.
          Ada risiko akun WhatsApp Anda dapat diblokir oleh WhatsApp. Gunakan dengan hati-hati dan
          pertimbangkan untuk menggunakan WhatsApp Business API resmi untuk produksi.
        </AlertDescription>
      </Alert>

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
          <Card>
            <CardHeader>
              <CardTitle>WhatsApp Analytics</CardTitle>
              <CardDescription>
                Statistik dan analisis penggunaan WhatsApp melalui WAHA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Analytics Coming Soon</h3>
                <p className="text-muted-foreground">
                  Fitur analitik akan segera tersedia untuk melacak penggunaan WhatsApp.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* QR Connector Modal */}
      {showQRConnector && (
        <WhatsAppQRConnector
          onClose={() => setShowQRConnector(false)}
          onSuccess={handleQRSuccess}
        />
      )}
    </div>
  );
};

export default WhatsAppIntegration;
