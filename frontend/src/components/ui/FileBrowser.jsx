/**
 * File Browser Component
 * Component untuk browse dan select files dengan OAuth
 */
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { FileText, Grid, Calendar, User, Eye, Check, ExternalLink, Loader } from 'lucide-react';

// Utility functions for file type detection
const getFileTypeInfo = (file) => {
  const isSheet = file.mimeType.includes('sheet');
  const isDoc = file.mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    file.mimeType === 'application/msword' ||
    file.name.toLowerCase().endsWith('.docx') ||
    file.name.toLowerCase().endsWith('.doc');
  const isDrive = file.mimeType.includes('drive') || file.mimeType.includes('folder');

  return { isSheet, isDoc, isDrive };
};

const getFileIcon = (fileTypeInfo, size = 'w-6 h-6') => {
  const { isSheet, isDoc, isDrive } = fileTypeInfo;
  if (isSheet) return <Grid className={`${size} text-green-600`} />;
  if (isDoc) return <FileText className={`${size} text-blue-600`} />;
  if (isDrive) return <ExternalLink className={`${size} text-purple-600`} />;
  return <FileText className={`${size} text-gray-600`} />;
};

const getFileTypeColor = (fileTypeInfo) => {
  const { isSheet, isDoc, isDrive } = fileTypeInfo;
  if (isSheet) return 'bg-green-100';
  if (isDoc) return 'bg-blue-100';
  if (isDrive) return 'bg-purple-100';
  return 'bg-gray-100';
};

const getFileTypeName = (fileTypeInfo) => {
  const { isSheet, isDoc, isDrive } = fileTypeInfo;
  if (isSheet) return 'Google Sheets';
  if (isDoc) return 'Microsoft Word';
  if (isDrive) return 'Google Drive';
  return 'File';
};

// Shared action buttons component
const FileActionButtons = ({ _file, isSelected, onSelect, onPreview, variant = 'grid' }) => {
  const isGridVariant = variant === 'grid';

  return (
    <div className={isGridVariant ? "mt-3 flex space-x-2" : "flex items-center space-x-2"}>
      <Button
        variant="outline"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onPreview();
        }}
        className={isGridVariant ? "flex-1" : ""}
      >
        <Eye className="w-3 h-3 mr-1" />
        Preview
      </Button>
      <Button
        variant={isSelected ? "destructive" : "default"}
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        className={isGridVariant ? "flex-1" : ""}
      >
        {isSelected ? 'Remove' : 'Select'}
      </Button>
    </div>
  );
};

const FileBrowser = ({
  files,
  loading,
  viewMode,
  selectedFiles,
  onFileSelect,
  onFilePreview,
  searchQuery,
  fileTypeFilter
}) => {
  // Filter files based on search and type
  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    const { isSheet, isDoc } = getFileTypeInfo(file);
    const matchesType = fileTypeFilter === 'all' ||
      (fileTypeFilter === 'sheets' && isSheet) ||
      (fileTypeFilter === 'docs' && isDoc);

    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600">Loading files...</span>
        </div>
      </Card>
    );
  }

  if (filteredFiles.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No files found</h3>
          <p className="text-gray-500">
            {searchQuery ? 'Try adjusting your search terms' : 'Connect your Google account to see files'}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          Files ({filteredFiles.length})
        </h3>
        <div className="flex items-center space-x-2">
          <Badge variant="default">
            {fileTypeFilter === 'all' ? 'All Types' : fileTypeFilter}
          </Badge>
          {searchQuery && (
            <Badge variant="default">
              Search: &ldquo;{searchQuery}&rdquo;
            </Badge>
          )}
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFiles.map((file) => (
            <FileCard
              key={file.id}
              file={file}
              isSelected={selectedFiles.some(f => f.id === file.id)}
              onSelect={() => onFileSelect(file)}
              onPreview={() => onFilePreview(file)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredFiles.map((file) => (
            <FileListItem
              key={file.id}
              file={file}
              isSelected={selectedFiles.some(f => f.id === file.id)}
              onSelect={() => onFileSelect(file)}
              onPreview={() => onFilePreview(file)}
            />
          ))}
        </div>
      )}
    </Card>
  );
};

// File Card Component (Grid View)
const FileCard = ({ file, isSelected, onSelect, onPreview }) => {
  const fileTypeInfo = getFileTypeInfo(file);

  return (
    <div className={`relative p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
      isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
    }`}>
      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2">
          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
            <Check className="w-4 h-4 text-white" />
          </div>
        </div>
      )}

      {/* File Icon */}
      <div className="flex items-center justify-center mb-3">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getFileTypeColor(fileTypeInfo)}`}>
          {getFileIcon(fileTypeInfo)}
        </div>
      </div>

      {/* File Info */}
      <div className="text-center">
        <h4 className="font-medium text-gray-900 mb-1 truncate" title={file.name}>
          {file.name}
        </h4>
        <p className="text-sm text-gray-500 mb-2">
          {getFileTypeName(fileTypeInfo)}
        </p>
        <p className="text-xs text-gray-400">
          Modified: {new Date(file.modifiedTime).toLocaleDateString()}
        </p>
      </div>

      {/* Actions */}
      <FileActionButtons
        _file={file}
        isSelected={isSelected}
        onSelect={onSelect}
        onPreview={onPreview}
        variant="grid"
      />
    </div>
  );
};

// File List Item Component (List View)
const FileListItem = ({ file, isSelected, onSelect, onPreview }) => {
  const fileTypeInfo = getFileTypeInfo(file);

  return (
    <div className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
      isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
    }`}>
      {/* Selection Checkbox */}
      <div className="mr-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
      </div>

      {/* File Icon */}
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${getFileTypeColor(fileTypeInfo)}`}>
        {getFileIcon(fileTypeInfo, 'w-4 h-4')}
      </div>

      {/* File Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 truncate">{file.name}</h4>
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <span>{getFileTypeName(fileTypeInfo)}</span>
          <span className="flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            {new Date(file.modifiedTime).toLocaleDateString()}
          </span>
          {file.owners && file.owners[0] && (
            <span className="flex items-center">
              <User className="w-3 h-3 mr-1" />
              {file.owners[0].displayName}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <FileActionButtons
        _file={file}
        isSelected={isSelected}
        onSelect={onSelect}
        onPreview={onPreview}
        variant="list"
      />
    </div>
  );
};

export default FileBrowser;
