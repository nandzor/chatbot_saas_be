/**
 * Workflow Configuration Component
 * Component untuk configure workflow settings dengan OAuth
 */

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import Switch from '@/components/ui/Switch';
import { Badge } from '@/components/ui/Badge';
import { Settings, Play, Pause, RotateCcw, AlertCircle, CheckCircle, Clock, Bell, RefreshCw } from 'lucide-react';

const WorkflowConfig = ({
  selectedFiles,
  config,
  onConfigChange,
  onSave,
  onCancel,
  loading = false
}) => {
  const [localConfig, setLocalConfig] = useState(config);
  const [errors, setErrors] = useState({});

  const handleConfigChange = (key, value) => {
    setLocalConfig(prev => ({ ...prev, [key]: value }));

    // Clear error when user changes value
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: '' }));
    }
  };

  const validateConfig = () => {
    const newErrors = {};

    if (localConfig.syncInterval < 60) {
      newErrors.syncInterval = 'Sync interval must be at least 60 seconds';
    }

    if (localConfig.retryAttempts < 1 || localConfig.retryAttempts > 10) {
      newErrors.retryAttempts = 'Retry attempts must be between 1 and 10';
    }

    if (localConfig.retryDelay < 100 || localConfig.retryDelay > 10000) {
      newErrors.retryDelay = 'Retry delay must be between 100ms and 10000ms';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateConfig()) {
      onConfigChange(localConfig);
      onSave();
    }
  };

  const getFileTypeIcon = (file) => {
    if (file.mimeType.includes('sheet')) return '📊';
    if (file.mimeType.includes('document')) return '📄';
    if (file.mimeType.includes('drive')) return '📁';
    return '📄';
  };

  const getFileTypeName = (file) => {
    if (file.mimeType.includes('sheet')) return 'Google Sheets';
    if (file.mimeType.includes('document')) return 'Google Docs';
    if (file.mimeType.includes('drive')) return 'Google Drive';
    return 'File';
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Settings className="w-5 h-5 mr-2 text-gray-600" />
            Workflow Configuration
            <Badge variant="default" className="ml-3">
              {selectedFiles.length} files
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Configure settings for your OAuth workflow integration
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8">
          {/* Sync Settings */}
          <div>
            <div className="flex items-center mb-4">
              <Clock className="w-4 h-4 mr-2 text-blue-600" />
              <h4 className="font-medium text-gray-900">Sync Settings</h4>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sync Interval (seconds)
                </label>
                <Select
                  value={localConfig.syncInterval}
                  onChange={(value) => handleConfigChange('syncInterval', parseInt(value))}
                  options={[
                    { value: 60, label: '1 minute' },
                    { value: 300, label: '5 minutes' },
                    { value: 900, label: '15 minutes' },
                    { value: 1800, label: '30 minutes' },
                    { value: 3600, label: '1 hour' },
                    { value: 7200, label: '2 hours' },
                    { value: 14400, label: '4 hours' }
                  ]}
                />
                {errors.syncInterval && (
                  <p className="text-red-500 text-xs mt-1">{errors.syncInterval}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  How often to check for changes in the selected files
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Include Metadata</label>
                  <p className="text-xs text-gray-500">Include file metadata in processing</p>
                </div>
                <Switch
                  checked={localConfig.includeMetadata}
                  onChange={(checked) => handleConfigChange('includeMetadata', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Auto Process</label>
                  <p className="text-xs text-gray-500">Automatically process changes when detected</p>
                </div>
                <Switch
                  checked={localConfig.autoProcess}
                  onChange={(checked) => handleConfigChange('autoProcess', checked)}
                />
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div>
            <div className="flex items-center mb-4">
              <Bell className="w-4 h-4 mr-2 text-green-600" />
              <h4 className="font-medium text-gray-900">Notification Settings</h4>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Enable Notifications</label>
                <p className="text-xs text-gray-500">Receive notifications for workflow events</p>
              </div>
              <Switch
                checked={localConfig.notificationEnabled}
                onChange={(checked) => handleConfigChange('notificationEnabled', checked)}
              />
            </div>
          </div>

          {/* Error Handling */}
          <div>
            <div className="flex items-center mb-4">
              <AlertCircle className="w-4 h-4 mr-2 text-red-600" />
              <h4 className="font-medium text-gray-900">Error Handling</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Retry Attempts
                </label>
                <Input
                  type="number"
                  value={localConfig.retryAttempts}
                  onChange={(e) => handleConfigChange('retryAttempts', parseInt(e.target.value))}
                  min="1"
                  max="10"
                />
                {errors.retryAttempts && (
                  <p className="text-red-500 text-xs mt-1">{errors.retryAttempts}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Number of retry attempts for failed operations
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Retry Delay (ms)
                </label>
                <Input
                  type="number"
                  value={localConfig.retryDelay}
                  onChange={(e) => handleConfigChange('retryDelay', parseInt(e.target.value))}
                  min="100"
                  max="10000"
                />
                {errors.retryDelay && (
                  <p className="text-red-500 text-xs mt-1">{errors.retryDelay}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Delay between retry attempts in milliseconds
                </p>
              </div>
            </div>
          </div>

          {/* Selected Files Summary */}
          <div>
            <div className="flex items-center mb-4">
              <CheckCircle className="w-4 h-4 mr-2 text-blue-600" />
              <h4 className="font-medium text-gray-900">Selected Files ({selectedFiles.length})</h4>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-4 bg-gray-50">
              {selectedFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-2 bg-white rounded border">
                  <div className="flex items-center">
                    <span className="text-lg mr-2">{getFileTypeIcon(file)}</span>
                    <div>
                      <span className="text-sm font-medium text-gray-700 truncate block max-w-xs">
                        {file.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {getFileTypeName(file)}
                      </span>
                    </div>
                  </div>
                  <Badge variant="default" className="text-xs">
                    {file.mimeType.includes('sheet') ? 'Sheets' :
                     file.mimeType.includes('document') ? 'Docs' :
                     file.mimeType.includes('drive') ? 'Drive' : 'File'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Workflow Preview */}
          <div>
            <div className="flex items-center mb-4">
              <RefreshCw className="w-4 h-4 mr-2 text-purple-600" />
              <h4 className="font-medium text-gray-900">Workflow Preview</h4>
            </div>
            <div className="bg-gray-50 border rounded-lg p-4">
              <div className="text-sm text-gray-600">
                <p className="mb-2">
                  <strong>Workflow Type:</strong> OAuth-based file monitoring
                </p>
                <p className="mb-2">
                  <strong>Monitoring:</strong> {selectedFiles.length} file(s) will be monitored for changes
                </p>
                <p className="mb-2">
                  <strong>Sync Frequency:</strong> Every {localConfig.syncInterval / 60} minute(s)
                </p>
                <p className="mb-2">
                  <strong>Auto Processing:</strong> {localConfig.autoProcess ? 'Enabled' : 'Disabled'}
                </p>
                <p className="mb-2">
                  <strong>Notifications:</strong> {localConfig.notificationEnabled ? 'Enabled' : 'Disabled'}
                </p>
                <p>
                  <strong>Error Handling:</strong> {localConfig.retryAttempts} retry attempts with {localConfig.retryDelay}ms delay
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Creating Workflow...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Create Workflow ({selectedFiles.length})
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WorkflowConfig;
