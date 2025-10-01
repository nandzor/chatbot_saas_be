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
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  RefreshCw,
  HardDrive,
  X,
  Plus,
  Zap
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useOAuth } from '@/hooks/useOAuth';

const GoogleDriveFileSelector = ({
  open,
  onOpenChange,
  onFileSelected,
  selectedFiles = [],
  fileType = 'all'
}) => {
  const { oauthStatus, initiateOAuth, testOAuthConnection } = useOAuth();

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFileType, setSelectedFileType] = useState(fileType);
  const [selectedFileIds, setSelectedFileIds] = useState(
    selectedFiles.map(file => file.id) || []
  );
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  // Mock data untuk development
  const mockFiles = [
    {
      id: '1ABC123def456GHI789jkl012MNO345pqr678STU901vwx234YZA567bcd890EFG123hij456KLM789nop012PQR345stu678VWX901yz',
      name: 'Sales Data Q4 2024',
      type: 'sheets',
      mimeType: 'application/vnd.google-apps.spreadsheet',
      webViewLink: 'https://docs.google.com/spreadsheets/d/1ABC123.../edit',
      modifiedTime: '2024-01-02T10:30:00.000Z',
      size: '245KB'
    },
    {
      id: '2DEF456ghi789JKL012mno345PQR678stu901VWX234yza567BCD890efg123HIJ456klm789NOP012pqr345STU678vwx901YZA234bcd567EFG890hij123KLM456nop789PQR012stu345VWX678yz',
      name: 'Product Catalog 2024',
      type: 'docs',
      mimeType: 'application/vnd.google-apps.document',
      webViewLink: 'https://docs.google.com/document/d/2DEF456.../edit',
      modifiedTime: '2024-01-01T15:45:00.000Z',
      size: '1.2MB'
    },
    {
      id: '3GHI789jkl012MNO345pqr678STU901vwx234YZA567bcd890EFG123hij456KLM789nop012PQR345stu678VWX901yz',
      name: 'Company Policies',
      type: 'pdf',
      mimeType: 'application/pdf',
      webViewLink: 'https://drive.google.com/file/d/3GHI789.../view',
      modifiedTime: '2023-12-15T09:20:00.000Z',
      size: '856KB'
    }
  ];

  // Load files function
  const loadFiles = useCallback(async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setFiles(mockFiles);
      setIsConnected(true);
    } catch (error) {
      toast.error('Failed to load files');
    } finally {
      setLoading(false);
    }
  }, []);

  // Filtered files based on search and type
  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedFileType === 'all' || file.type === selectedFileType;
    return matchesSearch && matchesType;
  });

  // Load files when dialog opens
  useEffect(() => {
    if (open) {
      loadFiles();
    }
  }, [open, loadFiles]);

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
  const handleConnectGoogleDrive = async () => {
    try {
      await initiateOAuth('google-drive', '6a9f9f22-ef84-4375-a793-dd1af45ccdc0');
    } catch (error) {
      toast.error('Failed to connect to Google Drive');
    }
  };

  // Handle file selection confirmation
  const handleConfirmSelection = () => {
    const selectedFilesData = files.filter(file => selectedFileIds.includes(file.id));
    onFileSelected(selectedFilesData);
    onOpenChange(false);
    toast.success(`${selectedFilesData.length} files selected`);
  };

  // Check if Google Drive is connected
  const isGoogleDriveConnected = oauthStatus['google-drive']?.status === 'connected' || isConnected;

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
                      onClick={() => testOAuthConnection('google-drive', '6a9f9f22-ef84-4375-a793-dd1af45ccdc0')}
                    >
                      <RefreshCw className="w-3 h-3" />
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleConnectGoogleDrive}
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
                  Connect your Google Drive account to start selecting files for your bot personality
                </p>
                <Button
                  onClick={handleConnectGoogleDrive}
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
                <CardContent className="p-4">
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
                  <CardTitle className="text-lg">
                    Files ({filteredFiles.length})
                  </CardTitle>
                  <CardDescription>
                    Select files to integrate with your bot personality
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                      <span className="ml-3 text-gray-600">Loading files...</span>
                    </div>
                  ) : filteredFiles.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No files found</h3>
                      <p className="text-gray-500">
                        {searchQuery ? 'Try adjusting your search terms' : 'No files available'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredFiles.map((file) => (
                        <div
                          key={file.id}
                          className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                            selectedFileIds.includes(file.id)
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => handleFileSelect(file)}
                        >
                          {/* Selection Checkbox */}
                          <div className="mr-3">
                            <input
                              type="checkbox"
                              checked={selectedFileIds.includes(file.id)}
                              onChange={() => handleFileSelect(file)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                          </div>

                          {/* File Icon */}
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                            file.type === 'sheets' ? 'bg-green-100' :
                            file.type === 'docs' ? 'bg-blue-100' :
                            'bg-gray-100'
                          }`}>
                            {file.type === 'sheets' ? (
                              <Table className="w-4 h-4 text-green-600" />
                            ) : (
                              <FileText className="w-4 h-4 text-blue-600" />
                            )}
                          </div>

                          {/* File Info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 truncate">{file.name}</h4>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>
                                {file.type === 'sheets' ? 'Google Sheets' :
                                 file.type === 'docs' ? 'Google Docs' :
                                 'PDF File'}
                              </span>
                              <span>{file.size}</span>
                              <span>{new Date(file.modifiedTime).toLocaleDateString()}</span>
                            </div>
                          </div>

                          {/* External Link */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(file.webViewLink, '_blank');
                            }}
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Dialog Footer */}
        <div className="flex items-center justify-end space-x-3 pt-6 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          {isGoogleDriveConnected && selectedFileIds.length > 0 && (
            <Button
              onClick={handleConfirmSelection}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Zap className="w-4 h-4 mr-2" />
              Select {selectedFileIds.length} Files
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GoogleDriveFileSelector;
