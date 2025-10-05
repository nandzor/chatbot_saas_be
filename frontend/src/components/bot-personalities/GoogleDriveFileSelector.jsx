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
  Zap
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
  const { organizationId } = useOrganizationIdFromToken();

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

  // Load files when connected
  useEffect(() => {
    if (isConnected && organizationId) {
      getFiles();
    }
  }, [isConnected, organizationId, getFiles]);

  // Load files when dialog opens
  useEffect(() => {
    if (open && isConnected && organizationId) {
      getFiles();
    }
  }, [open, isConnected, organizationId, getFiles]);

  // Filtered files based on search and type
  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedFileType === 'all' ||
      (selectedFileType === 'sheets' && file.mimeType === 'application/vnd.google-apps.spreadsheet') ||
      (selectedFileType === 'docs' && file.mimeType === 'application/vnd.google-apps.document') ||
      (selectedFileType === 'pdf' && file.mimeType === 'application/pdf');
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
    if (!organizationId) {
      toast.error('Organization ID is required');
      return;
    }
    try {
      // Get user ID from localStorage or context
      const userData = JSON.parse(localStorage.getItem('chatbot_user') || '{}');
      const userId = userData.id;

      if (!userId) {
        toast.error('User ID is required for Google Drive integration');
        return;
      }

      await initiateOAuth(organizationId, userId);
    } catch (error) {
      // Error handling is done in the hook
    }
  }, [initiateOAuth, organizationId]);

  // Handle file selection confirmation
  const handleConfirmSelection = () => {
    const selectedFilesData = files.filter(file => selectedFileIds.includes(file.id));
    onFileSelected(selectedFilesData);
    onOpenChange(false);
    toast.success(`${selectedFilesData.length} files selected`);
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
            Connect to Google Drive and select files to integrate with your bot personality
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={refreshFiles}
                      disabled={filesLoading}
                    >
                      <RefreshCw className="w-3 h-3" />
                    </Button>
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
                        <option value="sheets">Google Sheets</option>
                        <option value="docs">Google Docs</option>
                        <option value="pdf">PDF Files</option>
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
                    Select files to integrate with your bot personality
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
                        const isSheet = file.mimeType === 'application/vnd.google-apps.spreadsheet';
                        const isDoc = file.mimeType === 'application/vnd.google-apps.document';

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
                              {isSheet ? (
                                <Table className="w-5 h-5 text-green-600 mr-3" />
                              ) : isDoc ? (
                                <FileText className="w-5 h-5 text-blue-600 mr-3" />
                              ) : (
                                <FileText className="w-5 h-5 text-gray-600 mr-3" />
                              )}
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{file.name}</h4>
                                <p className="text-sm text-gray-500">
                                  {isSheet ? 'Google Sheets' : isDoc ? 'Google Docs' : 'PDF File'}
                                  {file.modifiedTime && (
                                    <span className="ml-2">
                                      • Modified {new Date(file.modifiedTime).toLocaleDateString()}
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
