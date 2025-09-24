/**
 * View Bot Personality Details Dialog
 * Dialog untuk melihat detail bot personality
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button
} from '@/components/ui';
import {
  Bot,
  MessageSquare,
  Database,
  Star,
  CheckCircle,
  XCircle,
  Clock,
  Settings,
  Activity,
  Zap,
  Copy
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const ViewBotPersonalityDetailsDialog = ({ open, onOpenChange, personality }) => {
  if (!personality) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(personality.code);
    toast.success('Bot personality code copied to clipboard');
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'active':
        return { variant: 'default', icon: <CheckCircle className="w-4 h-4 mr-1" />, className: 'bg-green-100 text-green-700' };
      case 'inactive':
        return { variant: 'destructive', icon: <XCircle className="w-4 h-4 mr-1" />, className: 'bg-red-100 text-red-700' };
      default:
        return { variant: 'secondary', icon: <XCircle className="w-4 h-4 mr-1" />, className: 'bg-gray-100 text-gray-700' };
    }
  };

  const statusConfig = getStatusConfig(personality.status);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
              style={{ backgroundColor: personality.color_scheme?.primary || '#3B82F6' }}
            >
              {personality.name?.charAt(0)?.toUpperCase() || 'B'}
            </div>
            {personality.name}
          </DialogTitle>
          <DialogDescription>
            View detailed information about this bot personality
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8">
          {/* Header Section */}
          <div
            className="rounded-lg p-6 border"
            style={{
              background: `linear-gradient(to right, ${personality.color_scheme?.primary ? `${personality.color_scheme.primary}15` : '#3B82F615'}, ${personality.color_scheme?.secondary ? `${personality.color_scheme.secondary}15` : '#6366F115'})`,
              borderColor: personality.color_scheme?.primary ? `${personality.color_scheme.primary}30` : '#3B82F630'
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg"
                  style={{ backgroundColor: personality.color_scheme?.primary || '#3B82F6' }}
                >
                  {personality.name?.charAt(0)?.toUpperCase() || 'B'}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{personality.name}</h2>
                  <p className="text-gray-600 mt-1">{personality.display_name}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <Badge variant={statusConfig.variant} className={`${statusConfig.className} px-3 py-1`}>
                      {statusConfig.icon}
                      {personality.status ? personality.status.charAt(0).toUpperCase() + personality.status.slice(1) : 'Unknown'}
                    </Badge>
                    <Badge variant="outline" className="px-3 py-1">
                      {personality.language ? personality.language.charAt(0).toUpperCase() + personality.language.slice(1) : 'Unknown'}
                    </Badge>
                    <Badge variant={personality.formality_level === 'formal' ? 'default' : 'outline'} className="px-3 py-1">
                      {personality.formality_level ? personality.formality_level.charAt(0).toUpperCase() + personality.formality_level.slice(1) : 'Unknown'}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-500">Code:</span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">{personality.code}</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyCode}
                    className="h-6 w-6 p-0 hover:bg-gray-200"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            {personality.description && (
              <div
                className="mt-4 pt-4 border-t"
                style={{
                  borderColor: personality.color_scheme?.primary ? `${personality.color_scheme.primary}30` : '#3B82F630'
                }}
              >
                <p className="text-gray-700 leading-relaxed">{personality.description}</p>
              </div>
            )}
          </div>

          {/* Basic Information */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bot
                  className="w-5 h-5"
                  style={{ color: personality.color_scheme?.primary || '#3B82F6' }}
                />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Name</label>
                  <p className="text-lg font-semibold text-gray-900">{personality.name}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Display Name</label>
                  <p className="text-lg text-gray-800">{personality.display_name}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Code</label>
                  <div className="flex items-center gap-2">
                    <code className="bg-gray-100 px-3 py-2 rounded-md text-sm font-mono text-gray-800">{personality.code}</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyCode}
                      className="h-8 w-8 p-0 hover:bg-gray-200"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Integrations & Assignments */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings
                  className="w-5 h-5"
                  style={{ color: personality.color_scheme?.primary || '#3B82F6' }}
                />
                Integrations & Assignments
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* WhatsApp Session */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">WhatsApp Session</h3>
                  </div>
                  {personality.waha_session_id ? (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                          <MessageSquare className="w-3 h-3 mr-1" />
                          Connected
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Session ID</span>
                          <p className="text-sm font-mono text-gray-800 bg-white px-2 py-1 rounded border">
                            {personality.waha_session_id}
                          </p>
                        </div>
                        {personality.waha_session?.phone_number && (
                          <div>
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone Number</span>
                            <p className="text-sm text-gray-800 bg-white px-2 py-1 rounded border">
                              {personality.waha_session.phone_number}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-gray-400" />
                        <p className="text-sm text-gray-500">Not connected</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Knowledge Base Item */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Database className="w-4 h-4 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Knowledge Base Item</h3>
                  </div>
                  {personality.knowledge_base_item_id ? (
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300">
                          <Database className="w-3 h-3 mr-1" />
                          Connected
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Item ID</span>
                          <p className="text-sm font-mono text-gray-800 bg-white px-2 py-1 rounded border">
                            {personality.knowledge_base_item_id}
                          </p>
                        </div>
                        {personality.knowledge_base_item?.title && (
                          <div>
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Title</span>
                            <p className="text-sm text-gray-800 bg-white px-2 py-1 rounded border">
                              {personality.knowledge_base_item.title}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-gray-400" />
                        <p className="text-sm text-gray-500">Not connected</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Advanced Settings */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity
                  className="w-5 h-5"
                  style={{ color: personality.color_scheme?.primary || '#3B82F6' }}
                />
                Advanced Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Max Response Length</label>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-8 bg-blue-100 rounded-full"></div>
                    <p className="text-xl font-bold text-gray-900">{personality.max_response_length || 1000}</p>
                    <span className="text-sm text-gray-500">characters</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Response Delay</label>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-8 bg-green-100 rounded-full"></div>
                    <p className="text-xl font-bold text-gray-900">{personality.response_delay_ms || 1000}</p>
                    <span className="text-sm text-gray-500">ms</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Confidence Threshold</label>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-8 bg-purple-100 rounded-full"></div>
                    <p className="text-xl font-bold text-gray-900">{(personality.confidence_threshold || 0.8) * 100}%</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Typing Indicator</label>
                  <Badge variant={personality.typing_indicator ? 'default' : 'outline'} className="px-3 py-1">
                    {personality.typing_indicator ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Small Talk</label>
                  <Badge variant={personality.enable_small_talk ? 'default' : 'outline'} className="px-3 py-1">
                    {personality.enable_small_talk ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Learning</label>
                  <Badge variant={personality.learning_enabled ? 'default' : 'outline'} className="px-3 py-1">
                    {personality.learning_enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap
                  className="w-5 h-5"
                  style={{ color: personality.color_scheme?.primary || '#3B82F6' }}
                />
                Performance Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <MessageSquare className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{personality.total_conversations || 0}</p>
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Conversations</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-xl border border-green-100">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Star className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    {personality.avg_satisfaction_score ? (personality.avg_satisfaction_score * 20).toFixed(1) : '0'}%
                  </p>
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Avg Satisfaction</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-100">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-6 h-6 text-purple-600" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{personality.success_rate || 0}%</p>
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Success Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock
                  className="w-5 h-5"
                  style={{ color: personality.color_scheme?.primary || '#3B82F6' }}
                />
                Timestamps
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Created At</label>
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    <p className="text-sm text-gray-800">
                      {personality.created_at ? new Date(personality.created_at).toLocaleString() : 'Unknown'}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Last Updated</label>
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    <p className="text-sm text-gray-800">
                      {personality.updated_at ? new Date(personality.updated_at).toLocaleString() : 'Unknown'}
                    </p>
                  </div>
                </div>
                {personality.last_trained_at && (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Last Trained</label>
                    <div className="p-3 bg-gray-50 rounded-lg border">
                      <p className="text-sm text-gray-800">
                        {new Date(personality.last_trained_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewBotPersonalityDetailsDialog;
