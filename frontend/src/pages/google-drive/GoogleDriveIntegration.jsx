/**
 * Google Drive Integration Page
 * User-friendly interface untuk mengintegrasikan Google Drive dengan bot personalities
 */

import { useState, useEffect, useCallback } from 'react';
import { useOAuth, useOAuthFiles, useOAuthWorkflow } from '@/hooks/useOAuth';
import FileBrowser from '@/components/ui/FileBrowser';
import FilePreview from '@/components/ui/FilePreview';
import WorkflowConfig from '@/components/ui/WorkflowConfig';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Search,
  Grid,
  List,
  RefreshCw,
  HardDrive,
  FileText,
  Table,
  CheckCircle,
  Plus,
  Zap
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const GoogleDriveIntegration = () => {
  const { oauthStatus, initiateOAuth, testOAuthConnection, revokeCredential, loading: oauthLoading } = useOAuth();
  const { createWorkflow } = useOAuthWorkflow();

  const [selectedService] = useState('google-drive');
  const [organizationId] = useState('6a9f9f22-ef84-4375-a793-dd1af45ccdc0'); // admin@test.com organization

  const {
    files,
    loading: filesLoading,
    pagination,
    getFiles,
    searchFiles,
    loadMoreFiles,
    refreshFiles
  } = useOAuthFiles(selectedService, organizationId);

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState('all');
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

  // Handle Google Drive connection
  const handleConnectGoogleDrive = useCallback(async () => {
    try {
      await initiateOAuth('google-drive', organizationId);
    } catch (error) {
      // Error handling is done in the hook
    }
  }, [initiateOAuth, organizationId]);

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
        toast.success(`Successfully created ${result.totalCreated} workflows!`);
        setSelectedFiles([]);
        setShowWorkflowConfig(false);
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

  // Handle file type filter
  const handleFileTypeFilter = useCallback((type) => {
    setFileTypeFilter(type);
  }, []);

  // Handle view mode toggle
  const handleViewModeToggle = useCallback(() => {
    setViewMode(prev => prev === 'grid' ? 'list' : 'grid');
  }, []);

  // Check if Google Drive is connected
  const isGoogleDriveConnected = oauthStatus['google-drive']?.status === 'connected';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <HardDrive className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Google Drive Integration
                </h1>
                <p className="text-sm text-gray-600">
                  Connect and integrate your Google Drive files with bot personalities
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Badge variant="default" className="ml-3">
                {selectedFiles.length} selected
              </Badge>
              {selectedFiles.length > 0 && (
                <Button
                  onClick={() => setShowWorkflowConfig(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Configure Workflow ({selectedFiles.length})
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Connection Status */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                  Connection Status
                </CardTitle>
                <CardDescription>
                  Manage your Google Drive connection
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Google Drive Connection */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center">
                    <HardDrive className="w-6 h-6 text-blue-600 mr-3" />
                    <div>
                      <h3 className="font-medium text-gray-900">Google Drive</h3>
                      <p className="text-sm text-gray-500">
                        {isGoogleDriveConnected ? 'Connected' : 'Not Connected'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isGoogleDriveConnected ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => testOAuthConnection('google-drive', organizationId)}
                          disabled={oauthLoading}
                        >
                          <RefreshCw className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => revokeCredential('google-drive', organizationId)}
                          disabled={oauthLoading}
                        >
                          Disconnect
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={handleConnectGoogleDrive}
                        disabled={oauthLoading}
                      >
                        Connect
                      </Button>
                    )}
                  </div>
                </div>

                {/* Quick Stats */}
                {isGoogleDriveConnected && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-lg font-semibold text-blue-600">
                        {files.length}
                      </div>
                      <div className="text-xs text-blue-600">Total Files</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-lg font-semibold text-green-600">
                        {selectedFiles.length}
                      </div>
                      <div className="text-xs text-green-600">Selected</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* File Type Filters */}
            {isGoogleDriveConnected && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">File Types</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[
                      { id: 'all', label: 'All Files', icon: FileText },
                      { id: 'sheets', label: 'Google Sheets', icon: Table },
                      { id: 'docs', label: 'Google Docs', icon: FileText }
                    ].map((type) => (
                      <button
                        key={type.id}
                        onClick={() => handleFileTypeFilter(type.id)}
                        className={`w-full flex items-center p-2 rounded-lg transition-colors ${
                          fileTypeFilter === type.id
                            ? 'bg-blue-100 text-blue-700'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        <type.icon className="w-4 h-4 mr-2" />
                        {type.label}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content - File Browser */}
          <div className="lg:col-span-2">
            {!isGoogleDriveConnected ? (
              <Card className="text-center py-12">
                <CardContent>
                  <HardDrive className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Connect to Google Drive
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Connect your Google Drive account to start integrating files with your bot personalities
                  </p>
                  <Button
                    onClick={handleConnectGoogleDrive}
                    disabled={oauthLoading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <HardDrive className="w-4 h-4 mr-2" />
                    Connect Google Drive
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Search and Controls */}
                <Card className="mb-6">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="text"
                            placeholder="Search files..."
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleViewModeToggle}
                        >
                          {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={refreshFiles}
                          disabled={filesLoading}
                        >
                          <RefreshCw className={`w-4 h-4 ${filesLoading ? 'animate-spin' : ''}`} />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* File Browser */}
                <FileBrowser
                  files={files}
                  loading={filesLoading}
                  viewMode={viewMode}
                  selectedFiles={selectedFiles}
                  onFileSelect={handleFileSelect}
                  onFilePreview={handleFilePreview}
                  searchQuery={searchQuery}
                  fileTypeFilter={fileTypeFilter}
                />

                {/* Load More Button */}
                {pagination?.nextPageToken && (
                  <div className="text-center mt-6">
                    <Button
                      variant="outline"
                      onClick={loadMoreFiles}
                      disabled={filesLoading}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Load More Files
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* File Preview Dialog */}
      {showPreview && previewFile && (
        <FilePreview
          file={previewFile}
          onClose={() => setShowPreview(false)}
        />
      )}

      {/* Workflow Configuration Dialog */}
      {showWorkflowConfig && (
        <WorkflowConfig
          selectedFiles={selectedFiles}
          config={workflowConfig}
          onConfigChange={setWorkflowConfig}
          onSave={handleCreateWorkflow}
          onCancel={() => setShowWorkflowConfig(false)}
        />
      )}
    </div>
  );
};

export default GoogleDriveIntegration;
