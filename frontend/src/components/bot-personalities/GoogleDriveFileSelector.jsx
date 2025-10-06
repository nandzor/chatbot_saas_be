/**
 * Google Drive File Selector Component
 * Simplified component untuk memilih file Google Drive langsung di bot personality dialogs
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Search,
  FileText,
  Table,
  Loader2,
  ExternalLink,
  RefreshCw,
  HardDrive,
  Zap,
  File
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useGoogleDrive, useGoogleDriveFiles } from '@/hooks/useGoogleDrive';
import { useOrganizationIdFromToken } from '@/hooks/useOrganizationIdFromToken';

const GoogleDriveFileSelector = ({
  open,
  onOpenChange,
  onFileSelected,
  selectedFiles = [],
  fileType = 'all'
}) => {
  // Get organizationId from JWT token (no OrganizationProvider required)
  const { organizationId, loading: orgLoading } = useOrganizationIdFromToken();

  const { initiateOAuth, loading: oauthLoading, isConnected } = useGoogleDrive();
  const {
    files,
    loading: filesLoading,
    getFiles,
    refreshFiles
  } = useGoogleDriveFiles();

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFileType, setSelectedFileType] = useState(fileType);
  const [selectedFileIds, setSelectedFileIds] = useState(
    selectedFiles.map(file => file.id) || []
  );
  const [lastRefreshTime, setLastRefreshTime] = useState(null);

  // Load files when connected
  useEffect(() => {
    if (isConnected && organizationId) {
      getFiles();
    }
  }, [isConnected, organizationId, getFiles]);

  // Load files when dialog opens - force refresh to get latest files
  useEffect(() => {
    if (open && isConnected && organizationId) {
      // Force refresh by calling getFiles with pageToken=null to replace existing files
      getFiles(10, null).then(() => {
        setLastRefreshTime(new Date());
      });
    }
  }, [open, isConnected, organizationId, getFiles]);

  // Filtered files based on search and type - Only show relevant files for bot personalities
  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());

    // Only show files that are relevant for bot personalities: Sheets, Docs, PDF, and Text files
    const isRelevantFile =
      file.mimeType === 'application/vnd.google-apps.spreadsheet' ||  // Google Sheets
      file.mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || // Excel Files
      file.mimeType === 'application/vnd.google-apps.document' ||    // Google Docs
      file.mimeType === 'application/pdf' ||                         // PDF Files
      file.mimeType === 'text/plain';                                // Text Files

    // If 'all' is selected, show only relevant files
    if (selectedFileType === 'all') {
      return matchesSearch && isRelevantFile;
    }

    // Filter by specific file types
    const matchesType =
      (selectedFileType === 'sheet' && (file.mimeType === 'application/vnd.google-apps.spreadsheet' || file.mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) ||
      (selectedFileType === 'doc' && file.mimeType === 'application/vnd.google-apps.document') ||
      (selectedFileType === 'pdf' && file.mimeType === 'application/pdf') ||
      (selectedFileType === 'text' && file.mimeType === 'text/plain');

    return matchesSearch && matchesType;
  });

  // Handle file selection (multiple files)
  const handleFileSelect = (file) => {
    const isSelected = selectedFileIds.includes(file.id);
    if (isSelected) {
      setSelectedFileIds(prev => prev.filter(id => id !== file.id));
    } else {
      setSelectedFileIds(prev => [...prev, file.id]);
    }
  };

  // Handle Google Drive connection
  const handleConnectGoogleDrive = useCallback(async () => {
    try {
      // Check if organizationId is still loading
      if (orgLoading) {
        toast.error('Loading organization information...');
        return;
      }

      // Check if organizationId is available
      if (!organizationId) {
        toast.error('Organization ID is required for Google Drive integration');
        return;
      }

      // Priority 1: Get userId from JWT token first (most reliable)
      const token = localStorage.getItem('jwt_token') || localStorage.getItem('token') || sessionStorage.getItem('token');
      let userId = null;

      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          userId = payload.user_id; // Use user_id from JWT token (confirmed from login response)
        } catch (jwtError) {
          // Silent fail for JWT decode
        }
      }

      // Priority 2: Fallback to localStorage if JWT token doesn't have userId
      if (!userId) {
        const userData = JSON.parse(localStorage.getItem('chatbot_user') || '{}');
        userId = userData.id;
      }

      if (!userId) {
        toast.error('User ID is required for Google Drive integration. Please login again.');
        return;
      }

      await initiateOAuth(organizationId, userId);
    } catch (error) {
      // Error handling is done in the hook
    }
  }, [initiateOAuth, organizationId, orgLoading]);

  // Handle file selection confirmation
  const handleConfirmSelection = () => {
    const selectedFilesData = files.filter(file => selectedFileIds.includes(file.id)).map(file => ({
      ...file,
      type: getFileTypeFromMimeType(file.mimeType)
    }));
    onFileSelected(selectedFilesData);
    onOpenChange(false);
    toast.success(`${selectedFilesData.length} files selected`);
  };

  // Handle refresh with timestamp
  const handleRefresh = async () => {
    try {
      await refreshFiles();
      setLastRefreshTime(new Date());
      toast.success('Files refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh files');
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Get file icon and label based on mimeType - Only for bot personality relevant files
  const getFileIconAndLabel = (mimeType) => {
    if (mimeType === 'application/vnd.google-apps.spreadsheet') {
      return { icon: Table, label: 'Google Sheets', color: 'text-green-600' };
    }
    if (mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      return { icon: Table, label: 'Excel File', color: 'text-green-700' };
    }
    if (mimeType === 'application/vnd.google-apps.document') {
      return { icon: FileText, label: 'Google Docs', color: 'text-blue-600' };
    }
    if (mimeType === 'application/pdf') {
      return { icon: FileText, label: 'PDF File', color: 'text-red-600' };
    }
    if (mimeType === 'text/plain') {
      return { icon: FileText, label: 'Text File', color: 'text-gray-600' };
    }
    // Default for unknown file types (should not happen with our filtering)
    return { icon: File, label: 'File', color: 'text-gray-600' };
  };

  // Get file type from mimeType for bot personality integration
  const getFileTypeFromMimeType = (mimeType) => {
    if (mimeType === 'application/vnd.google-apps.spreadsheet' ||
        mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      return 'sheets';
    }
    if (mimeType === 'application/vnd.google-apps.document') {
      return 'doc';
    }
    if (mimeType === 'application/pdf') {
      return 'pdf';
    }
    if (mimeType === 'text/plain') {
      return 'text';
    }
    return 'unknown';
  };

  // Check if Google Drive is connected
  const isGoogleDriveConnected = isConnected;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <HardDrive className="w-6 h-6 text-blue-600 mr-2" />
            Google Drive Integration
            <Badge variant="default" className="ml-3">
              {selectedFileIds.length} selected
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Connect to Google Drive and select files to integrate with your bot personality. Only Google Sheets, Excel, Docs, PDF, and Text files are shown.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Connection Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Connection Status</CardTitle>
            </CardHeader>
            <CardContent>
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
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={filesLoading}
                      >
                        <RefreshCw className={`w-3 h-3 ${filesLoading ? 'animate-spin' : ''}`} />
                      </Button>
                      {lastRefreshTime && (
                        <span className="text-xs text-gray-500">
                          Last updated: {lastRefreshTime.toLocaleTimeString()}
                        </span>
                      )}
                    </div>
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
            </CardContent>
          </Card>

          {!isGoogleDriveConnected ? (
            <Card className="text-center py-12">
              <CardContent>
                <HardDrive className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Connect to Google Drive
                </h3>
                <p className="text-gray-600 mb-6">
                  Connect your Google Drive account to start selecting files
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
              {/* Search and Filters */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Search & Filter</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          type="text"
                          placeholder="Search files..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <select
                        value={selectedFileType}
                        onChange={(e) => setSelectedFileType(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">All Files</option>
                        <option value="sheet">Sheets & Excel</option>
                        <option value="doc">Google Docs</option>
                        <option value="pdf">PDF Files</option>
                        <option value="text">Text Files</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* File List */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Select Files</CardTitle>
                  <CardDescription>
                    Select files to integrate with your bot personality. Only Google Sheets, Excel, Docs, PDF, and Text files are available.
                    <br />
                    Showing {filteredFiles.length} of {files.length} files
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {filesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                      <span className="ml-3 text-gray-600">Loading files...</span>
                    </div>
                  ) : filteredFiles.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No files found</h3>
                      <p className="text-gray-600">
                        {searchQuery ? 'Try adjusting your search terms' : 'No files available in your Google Drive'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {filteredFiles.map((file) => {
                        const isSelected = selectedFileIds.includes(file.id);
                        const { icon: FileIcon, label, color } = getFileIconAndLabel(file.mimeType);

                        return (
                          <div
                            key={file.id}
                            className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-blue-50 border-blue-200'
                                : 'hover:bg-gray-50 border-gray-200'
                            }`}
                            onClick={() => handleFileSelect(file)}
                          >
                            <div className="flex items-center flex-1">
                              <FileIcon className={`w-5 h-5 ${color} mr-3`} />
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{file.name}</h4>
                                <p className="text-sm text-gray-500">
                                  {label}
                                  {file.modifiedTime && (
                                    <span className="ml-2">
                                      • Modified {new Date(file.modifiedTime).toLocaleDateString()}
                                    </span>
                                  )}
                                  {file.size && (
                                    <span className="ml-2">
                                      • {formatFileSize(file.size)}
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {file.webViewLink && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(file.webViewLink, '_blank');
                                  }}
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </Button>
                              )}
                              <div className={`w-4 h-4 rounded border-2 ${
                                isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                              }`}>
                                {isSelected && (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmSelection}
                  disabled={selectedFileIds.length === 0}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Select {selectedFileIds.length} Files
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GoogleDriveFileSelector;
