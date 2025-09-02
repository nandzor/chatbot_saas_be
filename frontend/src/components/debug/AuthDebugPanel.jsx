import React, { useState, useEffect } from 'react';
import {
  Shield,
  User,
  Key,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  Settings,
  Database,
  Globe,
  Lock,
  Unlock
} from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Input,
  Textarea,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Separator
} from '@/components/ui';
import { authService } from '@/services/AuthService';

const AuthDebugPanel = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showSensitiveData, setShowSensitiveData] = useState(false);
  const [authData, setAuthData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if Auth Debug Panel is enabled - langsung dari .env
  const isAuthDebugPanelEnabled = () => {
    const value = import.meta.env.VITE_ENABLE_AUTH_DEBUG_PANEL;
    if (value === undefined || value === null) return false;

    const lowerValue = String(value).toLowerCase().trim();
    return lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes';
  };

  // Check if we're in development
  const isDevelopment = () => {
    return import.meta.env.MODE === 'development' ||
           import.meta.env.VITE_NODE_ENV === 'development';
  };

  // Load auth data
  const loadAuthData = async () => {
    try {
      setLoading(true);
      setError(null);

      const user = authService.getCurrentUser();
      const token = authService.getToken();
      const isAuthenticated = authService.isAuthenticated();

      setAuthData({
        user,
        token: token ? {
          value: token,
          length: token.length,
          type: typeof token,
          preview: token.substring(0, 20) + '...'
        } : null,
        isAuthenticated,
        timestamp: new Date().toISOString(),
        environment: {
          mode: import.meta.env.MODE,
          nodeEnv: import.meta.env.VITE_NODE_ENV,
          apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
          authTokenKey: import.meta.env.VITE_AUTH_TOKEN_KEY,
          userDataKey: import.meta.env.VITE_USER_DATA_KEY
        }
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount and when visibility changes
  useEffect(() => {
    if (isVisible) {
      loadAuthData();
    }
  }, [isVisible]);

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  // Format JSON for display
  const formatJson = (obj) => {
    return JSON.stringify(obj, null, 2);
  };

  // Don't render if not enabled
  if (!isAuthDebugPanelEnabled()) {
    return null;
  }

  // Don't render if not visible
  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          variant="outline"
          size="sm"
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          <Shield className="w-4 h-4 mr-2" />
          Auth Debug
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-[80vh] overflow-hidden">
      <Card className="shadow-2xl border-2 border-blue-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-lg">Auth Debug Panel</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSensitiveData(!showSensitiveData)}
                className="text-gray-500 hover:text-gray-700"
              >
                {showSensitiveData ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <CardDescription>
            Debug authentication state and data
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-0">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="data">Data</TabsTrigger>
              <TabsTrigger value="env">Environment</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Authentication Status</span>
                  <Badge className={
                    authData?.isAuthenticated
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }>
                    {authData?.isAuthenticated ? (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Authenticated
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3 mr-1" />
                        Not Authenticated
                      </>
                    )}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">User Data</span>
                  <Badge className={
                    authData?.user
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }>
                    {authData?.user ? 'Available' : 'Not Available'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Token</span>
                  <Badge className={
                    authData?.token
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }>
                    {authData?.token ? 'Available' : 'Not Available'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Environment</span>
                  <Badge className={
                    isDevelopment()
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-blue-100 text-blue-800'
                  }>
                    {isDevelopment() ? 'Development' : 'Production'}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="flex gap-2">
                <Button
                  onClick={loadAuthData}
                  disabled={loading}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button
                  onClick={() => authService.logout()}
                  variant="outline"
                  size="sm"
                  className="flex-1 text-red-600 hover:text-red-700"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="data" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm mb-2">User Data</h4>
                  <Textarea
                    value={authData?.user ? formatJson(authData.user) : 'No user data'}
                    readOnly
                    className="min-h-[100px] text-xs font-mono"
                  />
                  {authData?.user && (
                    <Button
                      onClick={() => copyToClipboard(formatJson(authData.user))}
                      variant="ghost"
                      size="sm"
                      className="mt-2"
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </Button>
                  )}
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">Token Information</h4>
                  {authData?.token ? (
                    <div className="space-y-2">
                      <div className="text-xs">
                        <strong>Length:</strong> {authData.token.length} characters
                      </div>
                      <div className="text-xs">
                        <strong>Type:</strong> {authData.token.type}
                      </div>
                      <div className="text-xs">
                        <strong>Preview:</strong> {authData.token.preview}
                      </div>
                      {showSensitiveData && (
                        <div>
                          <Textarea
                            value={authData.token.value}
                            readOnly
                            className="min-h-[60px] text-xs font-mono"
                          />
                          <Button
                            onClick={() => copyToClipboard(authData.token.value)}
                            variant="ghost"
                            size="sm"
                            className="mt-2"
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            Copy Token
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">No token available</div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="env" className="space-y-4 mt-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-sm mb-2">Environment Configuration</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span>Mode:</span>
                      <span className="font-mono">{authData?.environment?.mode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Node Env:</span>
                      <span className="font-mono">{authData?.environment?.nodeEnv}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>API Base URL:</span>
                      <span className="font-mono text-xs">{authData?.environment?.apiBaseUrl}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Auth Token Key:</span>
                      <span className="font-mono">{authData?.environment?.authTokenKey}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>User Data Key:</span>
                      <span className="font-mono">{authData?.environment?.userDataKey}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium text-sm mb-2">Feature Flags</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span>Debug Mode:</span>
                      <Badge className={import.meta.env.VITE_DEBUG === 'true' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {import.meta.env.VITE_DEBUG === 'true' ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Auth Debug Panel:</span>
                      <Badge className={isAuthDebugPanelEnabled() ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {isAuthDebugPanelEnabled() ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Analytics:</span>
                      <Badge className={import.meta.env.VITE_ENABLE_ANALYTICS === 'true' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {import.meta.env.VITE_ENABLE_ANALYTICS === 'true' ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">Last Updated</h4>
                  <div className="text-xs text-gray-500">
                    {authData?.timestamp ? new Date(authData.timestamp).toLocaleString() : 'Never'}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthDebugPanel;
