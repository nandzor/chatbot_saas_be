/**
 * View Bot Personality Details Dialog
 * Dialog untuk melihat detail bot personality
 */

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button
} from '@/components/ui';
import {
  Bot,
  MessageSquare,
  Database,
  Workflow,
  Star,
  CheckCircle,
  XCircle,
  Clock,
  Settings,
  Activity,
  Zap,
  Shield,
  Edit,
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
            {personality.is_default && (
              <Badge variant="secondary" className="ml-2">
                <Star className="w-3 h-3 mr-1" />
                Default
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            View detailed information about this bot personality
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="text-lg font-semibold">{personality.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Code</label>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-mono">{personality.code}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyCode}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Display Name</label>
                  <p className="text-lg">{personality.display_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <Badge variant={statusConfig.variant} className={statusConfig.className}>
                    {statusConfig.icon}
                    {personality.status ? personality.status.charAt(0).toUpperCase() + personality.status.slice(1) : 'Unknown'}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Language</label>
                  <Badge variant="outline">
                    {personality.language ? personality.language.charAt(0).toUpperCase() + personality.language.slice(1) : 'Unknown'}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Formality Level</label>
                  <Badge variant={personality.formality_level === 'formal' ? 'default' : 'outline'}>
                    {personality.formality_level ? personality.formality_level.charAt(0).toUpperCase() + personality.formality_level.slice(1) : 'Unknown'}
                  </Badge>
                </div>
              </div>

              {personality.description && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Description</label>
                  <p className="text-gray-700 mt-1">{personality.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Integrations & Assignments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Integrations & Assignments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* WhatsApp Session */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-green-600" />
                    WhatsApp Session
                  </label>
                  {personality.waha_session_id ? (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <Badge variant="outline" className="bg-green-100 text-green-700 mb-2">
                        <MessageSquare className="w-3 h-3 mr-1" />
                        Connected
                      </Badge>
                      <p className="text-sm text-gray-700">
                        Session ID: {personality.waha_session_id}
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-sm text-gray-500">Not connected</p>
                    </div>
                  )}
                </div>

                {/* Knowledge Base Item */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Database className="w-4 h-4 text-purple-600" />
                    Knowledge Base Item
                  </label>
                  {personality.knowledge_base_item_id ? (
                    <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <Badge variant="outline" className="bg-purple-100 text-purple-700 mb-2">
                        <Database className="w-3 h-3 mr-1" />
                        Connected
                      </Badge>
                      <p className="text-sm text-gray-700">
                        Item ID: {personality.knowledge_base_item_id}
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-sm text-gray-500">Not connected</p>
                    </div>
                  )}
                </div>

                {/* N8N Workflow */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Workflow className="w-4 h-4 text-orange-600" />
                    N8N Workflow
                  </label>
                  {personality.n8n_workflow_id ? (
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <Badge variant="outline" className="bg-orange-100 text-orange-700 mb-2">
                        <Workflow className="w-3 h-3 mr-1" />
                        Connected
                      </Badge>
                      <p className="text-sm text-gray-700">
                        Workflow ID: {personality.n8n_workflow_id}
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-sm text-gray-500">Not connected</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Advanced Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Advanced Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Max Response Length</label>
                  <p className="text-lg font-semibold">{personality.max_response_length || 1000} characters</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Response Delay</label>
                  <p className="text-lg font-semibold">{personality.response_delay_ms || 1000}ms</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Confidence Threshold</label>
                  <p className="text-lg font-semibold">{(personality.confidence_threshold || 0.8) * 100}%</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Typing Indicator</label>
                  <Badge variant={personality.typing_indicator ? 'default' : 'outline'}>
                    {personality.typing_indicator ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Small Talk</label>
                  <Badge variant={personality.enable_small_talk ? 'default' : 'outline'}>
                    {personality.enable_small_talk ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Learning</label>
                  <Badge variant={personality.learning_enabled ? 'default' : 'outline'}>
                    {personality.learning_enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Performance Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Total Conversations</label>
                  <p className="text-2xl font-bold">{personality.total_conversations || 0}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Avg Satisfaction Score</label>
                  <p className="text-2xl font-bold">
                    {personality.avg_satisfaction_score ? (personality.avg_satisfaction_score * 20).toFixed(1) : '0'}%
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Success Rate</label>
                  <p className="text-2xl font-bold">{personality.success_rate || 0}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Timestamps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Created At</label>
                  <p className="text-gray-700">
                    {personality.created_at ? new Date(personality.created_at).toLocaleString() : 'Unknown'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Updated</label>
                  <p className="text-gray-700">
                    {personality.updated_at ? new Date(personality.updated_at).toLocaleString() : 'Unknown'}
                  </p>
                </div>
                {personality.last_trained_at && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Last Trained</label>
                    <p className="text-gray-700">
                      {new Date(personality.last_trained_at).toLocaleString()}
                    </p>
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
