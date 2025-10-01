/**
 * OAuth File Selection Page
 * Page untuk memilih file Google Sheets dan Docs dengan OAuth
 */

import { useState, useEffect, useCallback } from 'react';
import { useOAuth, useOAuthFiles, useOAuthWorkflow } from '@/hooks/useOAuth';
import FileBrowser from '@/components/ui/FileBrowser';
import FilePreview from '@/components/ui/FilePreview';
import WorkflowConfig from '@/components/ui/WorkflowConfig';
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { Search, Grid, List, Settings, RefreshCw, AlertCircle, ExternalLink } from 'lucide-react';

const OAuthFileSelectionPage = () => {
  const { oauthStatus, initiateOAuth, testOAuthConnection, revokeCredential, loading: oauthLoading, error: oauthError } = useOAuth();
  const { createWorkflow, loading: workflowLoading, error: workflowError } = useOAuthWorkflow();

  const [selectedService] = useState('google-sheets');
  const [organizationId] = useState('org_123'); // This should come from context

  const {
    files,
    loading: filesLoading,
    error: filesError,
    pagination,
    getFiles,
    searchFiles,
    loadMoreFiles,
    refreshFiles
  } = useOAuthFiles(selectedService, organizationId);

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchQuery, setSearchQuery] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState('all'); // 'all', 'sheets', 'docs'
  const [showPreview, setShowPreview] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [showWorkflowConfig, setShowWorkflowConfig] = useState(false);
  const [workflowConfig, setWorkflowConfig] = useState({
    syncInterval: 300,
    includeMetadata: true,
    autoProcess: true,
    notificationEnabled: true,
    retryAttempts: 3,
    retryDelay: 1000
  });

  // Load files when service changes
  useEffect(() => {
    if (oauthStatus[selectedService]?.status === 'connected') {
      getFiles();
    }
  }, [selectedService, oauthStatus, getFiles]);

  // Handle file selection
  const handleFileSelect = useCallback((file) => {
    setSelectedFiles(prev => {
      const exists = prev.find(f => f.id === file.id);
      if (exists) {
        return prev.filter(f => f.id !== file.id);
      } else {
        return [...prev, { ...file, selected: true }];
      }
    });
  }, []);

  // Handle file preview
  const handleFilePreview = useCallback((file) => {
    setPreviewFile(file);
    setShowPreview(true);
  }, []);

  // Handle service connection
  const handleConnectService = useCallback(async (service) => {
    try {
      await initiateOAuth(service, organizationId);
    } catch (error) {
      // Error handling is done in the hook
    }
  }, [initiateOAuth, organizationId]);

  // Handle service disconnection
  const handleDisconnectService = useCallback(async (service) => {
    try {
      await revokeCredential(service, organizationId);
    } catch (error) {
      // Error handling is done in the hook
    }
  }, [revokeCredential, organizationId]);

  // Handle workflow creation
  const handleCreateWorkflow = useCallback(async () => {
    try {
      const result = await createWorkflow(
        selectedService,
        organizationId,
        selectedFiles,
        workflowConfig
      );

      if (result.success) {
        // Show success message
        alert(`Successfully created ${result.totalCreated} workflows!`);

        // Clear selected files
        setSelectedFiles([]);
        setShowWorkflowConfig(false);

        // Refresh files
        await refreshFiles();
      }
    } catch (error) {
      // Error handling is done in the hook
    }
  }, [createWorkflow, selectedService, organizationId, selectedFiles, workflowConfig, refreshFiles]);

  // Handle search
  const handleSearch = useCallback(async (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      await searchFiles(query);
    } else {
      await refreshFiles();
    }
  }, [searchFiles, refreshFiles]);

  // Filter files based on type
  const filteredFiles = files.filter(file => {
    if (fileTypeFilter === 'all') return true;
    if (fileTypeFilter === 'sheets') return file.mimeType.includes('sheet');
    if (fileTypeFilter === 'docs') return file.mimeType.includes('document');
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                OAuth File Selection
              </h1>
              <Badge variant="default" className="ml-3">
                {selectedFiles.length} selected
              </Badge>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
              </Button>

              <Button
                onClick={() => setShowWorkflowConfig(true)}
                disabled={selectedFiles.length === 0}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Settings className="w-4 h-4 mr-2" />
                Configure Workflow ({selectedFiles.length})
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Error Alerts */}
        {(oauthError || filesError || workflowError) && (
          <div className="mb-6">
            {oauthError && (
              <Alert variant="error" className="mb-2">
                <AlertCircle className="w-4 h-4" />
                OAuth Error: {oauthError}
              </Alert>
            )}
            {filesError && (
              <Alert variant="error" className="mb-2">
                <AlertCircle className="w-4 h-4" />
                Files Error: {filesError}
              </Alert>
            )}
            {workflowError && (
              <Alert variant="error" className="mb-2">
                <AlertCircle className="w-4 h-4" />
                Workflow Error: {workflowError}
              </Alert>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Service Selection</h3>

              {/* Service Selection */}
              <div className="space-y-3 mb-6">
                {['google-sheets', 'google-docs', 'google-drive'].map((service) => (
                  <div key={service} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${
                        oauthStatus[service]?.status === 'connected' ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                      <span className="text-sm font-medium capitalize">
                        {service.replace('-', ' ')}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {oauthStatus[service]?.status === 'connected' ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => testOAuthConnection(service, organizationId)}
                            disabled={oauthLoading}
                          >
                            <RefreshCw className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDisconnectService(service)}
                            disabled={oauthLoading}
                          >
                            Disconnect
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleConnectService(service)}
                          disabled={oauthLoading}
                        >
                          Connect
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Service Status */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Connection Status</h4>
                <div className="space-y-2">
                  {Object.entries(oauthStatus).map(([service, status]) => (
                    <div key={service} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 capitalize">
                        {service.replace('-', ' ')}
                      </span>
                      <Badge variant={status?.status === 'connected' ? 'success' : 'danger'}>
                        {status?.status === 'connected' ? 'Connected' : 'Not Connected'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Filters */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-4">Filters</h3>

                {/* Search */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Files
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      placeholder="Search files..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* File Type Filter */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    File Type
                  </label>
                  <select
                    value={fileTypeFilter}
                    onChange={(e) => setFileTypeFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Files</option>
                    <option value="sheets">Google Sheets</option>
                    <option value="docs">Google Docs</option>
                  </select>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshFiles}
                  disabled={filesLoading}
                  className="w-full"
                >
                  <RefreshCw className={`w-3 h-3 mr-2 ${filesLoading ? 'animate-spin' : ''}`} />
                  Refresh Files
                </Button>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* File Browser */}
            <FileBrowser
              files={filteredFiles}
              loading={filesLoading}
              viewMode={viewMode}
              selectedFiles={selectedFiles}
              onFileSelect={handleFileSelect}
              onFilePreview={handleFilePreview}
              searchQuery={searchQuery}
              fileTypeFilter={fileTypeFilter}
            />

            {/* Load More Button */}
            {pagination.hasMore && (
              <div className="mt-4 text-center">
                <Button
                  variant="outline"
                  onClick={loadMoreFiles}
                  disabled={filesLoading}
                >
                  {filesLoading ? 'Loading...' : 'Load More Files'}
                </Button>
              </div>
            )}

            {/* Selected Files Summary */}
            {selectedFiles.length > 0 && (
              <Card className="mt-6 p-4">
                <h3 className="text-lg font-semibold mb-4">Selected Files</h3>
                <div className="space-y-2">
                  {selectedFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                          {file.mimeType.includes('sheet') ? (
                            <Grid className="w-4 h-4 text-blue-600" />
                          ) : (
                            <ExternalLink className="w-4 h-4 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{file.name}</p>
                          <p className="text-sm text-gray-500">{file.mimeType}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleFilePreview(file)}
                        >
                          Preview
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleFileSelect(file)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* File Preview Modal */}
      {showPreview && previewFile && (
        <FilePreview
          file={previewFile}
          onClose={() => setShowPreview(false)}
        />
      )}

      {/* Workflow Configuration Modal */}
      {showWorkflowConfig && (
        <WorkflowConfig
          selectedFiles={selectedFiles}
          config={workflowConfig}
          onConfigChange={setWorkflowConfig}
          onSave={handleCreateWorkflow}
          onCancel={() => setShowWorkflowConfig(false)}
          loading={workflowLoading}
        />
      )}
    </div>
  );
};

export default OAuthFileSelectionPage;
