/**
 * File Preview Component
 * Component untuk preview file details dengan OAuth
 */

import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { X, ExternalLink, Calendar, User, FileText, Grid, Folder, Download, Share2 } from 'lucide-react';

const FilePreview = ({ file, onClose }) => {
  const isSheet = file.mimeType.includes('sheet');
  const isDoc = file.mimeType.includes('document');
  const isDrive = file.mimeType.includes('drive') || file.mimeType.includes('folder');

  const getFileIcon = () => {
    if (isSheet) return <Grid className="w-5 h-5 text-green-600" />;
    if (isDoc) return <FileText className="w-5 h-5 text-blue-600" />;
    if (isDrive) return <Folder className="w-5 h-5 text-purple-600" />;
    return <FileText className="w-5 h-5 text-gray-600" />;
  };

  const getFileTypeColor = () => {
    if (isSheet) return 'bg-green-100';
    if (isDoc) return 'bg-blue-100';
    if (isDrive) return 'bg-purple-100';
    return 'bg-gray-100';
  };

  const getFileTypeName = () => {
    if (isSheet) return 'Google Sheets';
    if (isDoc) return 'Google Docs';
    if (isDrive) return 'Google Drive';
    return 'File';
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${getFileTypeColor()}`}>
              {getFileIcon()}
            </div>
            <div>
              <span className="text-lg font-semibold text-gray-900">{file.name}</span>
              <Badge variant="default" className="ml-2">
                {getFileTypeName()}
              </Badge>
            </div>
          </DialogTitle>
          <DialogDescription>
            File details and metadata information
          </DialogDescription>
        </DialogHeader>

        {/* File Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="space-y-3">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              <span>Created: {formatDate(file.createdTime)}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              <span>Modified: {formatDate(file.modifiedTime)}</span>
            </div>
            {file.owners && file.owners[0] && (
              <div className="flex items-center text-sm text-gray-600">
                <User className="w-4 h-4 mr-2" />
                <span>Owner: {file.owners[0].displayName}</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="text-sm text-gray-600">
              <span className="font-medium">File ID:</span>
              <code className="ml-2 bg-gray-100 px-2 py-1 rounded text-xs break-all">
                {file.id}
              </code>
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-medium">MIME Type:</span>
              <span className="ml-2">{file.mimeType}</span>
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-medium">Size:</span>
              <span className="ml-2">{formatFileSize(file.size)}</span>
            </div>
            {file.version && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">Version:</span>
                <span className="ml-2">{file.version}</span>
              </div>
            )}
          </div>
        </div>

        {/* File Description */}
        {file.description && (
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-2">Description</h4>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              {file.description}
            </p>
          </div>
        )}

        {/* File Permissions */}
        {file.permissions && file.permissions.length > 0 && (
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-2">Permissions</h4>
            <div className="space-y-2">
              {file.permissions.map((permission, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-700">
                    {permission.role} - {permission.displayName || permission.emailAddress}
                  </span>
                  <Badge variant="default" className="text-xs">
                    {permission.type}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Preview Content */}
        <div className="border rounded-lg p-4 bg-gray-50 mb-6">
          <h4 className="font-medium text-gray-900 mb-2">Preview</h4>
          <div className="text-sm text-gray-600">
            {isSheet ? (
              <div>
                <p className="mb-2">This is a Google Sheets file.</p>
                <p className="text-xs text-gray-500">
                  Content preview will be available after workflow activation.
                  The workflow will monitor changes and process data automatically.
                </p>
              </div>
            ) : isDoc ? (
              <div>
                <p className="mb-2">This is a Google Docs file.</p>
                <p className="text-xs text-gray-500">
                  Content preview will be available after workflow activation.
                  The workflow will monitor changes and process text content automatically.
                </p>
              </div>
            ) : isDrive ? (
              <div>
                <p className="mb-2">This is a Google Drive folder.</p>
                <p className="text-xs text-gray-500">
                  Folder monitoring will track changes to all files within this folder.
                  The workflow will process new and modified files automatically.
                </p>
              </div>
            ) : (
              <div>
                <p className="mb-2">This is a file from Google Drive.</p>
                <p className="text-xs text-gray-500">
                  Content preview will be available after workflow activation.
                  The workflow will monitor changes and process the file automatically.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* File Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-lg font-semibold text-blue-600">
              {file.viewedByMeTime ? 'Yes' : 'No'}
            </div>
            <div className="text-xs text-blue-600">Viewed</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-lg font-semibold text-green-600">
              {file.shared ? 'Yes' : 'No'}
            </div>
            <div className="text-xs text-green-600">Shared</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-lg font-semibold text-purple-600">
              {file.starred ? 'Yes' : 'No'}
            </div>
            <div className="text-xs text-purple-600">Starred</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-lg font-semibold text-orange-600">
              {file.trashed ? 'Yes' : 'No'}
            </div>
            <div className="text-xs text-orange-600">Trashed</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3">
          {file.webViewLink && (
            <Button
              variant="outline"
              onClick={() => window.open(file.webViewLink, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open in Google
            </Button>
          )}
          {file.webContentLink && (
            <Button
              variant="outline"
              onClick={() => window.open(file.webContentLink, '_blank')}
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          )}
          <Button onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FilePreview;
