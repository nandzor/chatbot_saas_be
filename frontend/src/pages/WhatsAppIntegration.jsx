import { useState } from 'react';
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
  Badge,
  Button
} from '@/components/ui';
import {
  MessageSquare,
  Settings,
  BarChart3,
  Smartphone,
  Clock,
  RefreshCw,
  Activity,
  Zap,
  Shield,
  Globe
} from 'lucide-react';
import WahaSessionManager from '@/components/whatsapp/WahaSessionManagerDataTable';
import WhatsAppQRConnector from '@/features/shared/WhatsAppQRConnector';

const WhatsAppIntegration = () => {
  const [activeTab, setActiveTab] = useState('sessions');
  const [showQRConnector, setShowQRConnector] = useState(false);


  const handleQRSuccess = (_inboxData) => {
    setShowQRConnector(false);
  };




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
      </div>



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
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sessions" className="flex items-center">
            <Settings className="h-4 w-4 mr-2" />
            Kelola Sesi
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
              <span>Terakhir update: {new Date().toLocaleTimeString('id-ID')}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WhatsAppIntegration;
