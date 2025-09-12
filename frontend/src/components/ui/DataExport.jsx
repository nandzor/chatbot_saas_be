import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import {
  Download,
  Upload,
  FileText,
  FileSpreadsheet,
  FileJson,
  FileCsv,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Trash2,
  Database,
  X
} from 'lucide-react';

/**
 * Export format selector
 */
export const ExportFormatSelector = ({
  selectedFormat,
  onFormatChange,
  availableFormats = ['csv', 'xlsx', 'json', 'pdf'],
  className = ''
}) => {
  const formatOptions = [
    { value: 'csv', label: 'CSV', icon: FileCsv, description: 'Comma-separated values' },
    { value: 'xlsx', label: 'Excel', icon: FileSpreadsheet, description: 'Excel spreadsheet' },
    { value: 'json', label: 'JSON', icon: FileJson, description: 'JavaScript Object Notation' },
    { value: 'pdf', label: 'PDF', icon: FileText, description: 'Portable Document Format' }
  ];

  const selectedOption = formatOptions.find(option => option.value === selectedFormat);

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <Label className="text-base font-medium">Export Format</Label>
        <p className="text-sm text-muted-foreground mb-3">
          Choose the format for your exported data
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {formatOptions
          .filter(option => availableFormats.includes(option.value))
          .map((option) => (
            <div
              key={option.value}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedFormat === option.value
                  ? 'border-primary bg-primary/5'
                  : 'border-muted hover:border-primary/50'
              }`}
              onClick={() => onFormatChange(option.value)}
            >
              <div className="flex items-center space-x-3">
                <option.icon className="w-5 h-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">{option.label}</div>
                  <div className="text-sm text-muted-foreground">
                    {option.description}
                  </div>
                </div>
                {selectedFormat === option.value && (
                  <CheckCircle className="w-5 h-5 text-primary ml-auto" />
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

/**
 * Export options panel
 */
export const ExportOptionsPanel = ({
  options = {},
  onOptionsChange,
  className = ''
}) => {
  const handleOptionChange = (key, value) => {
    onOptionsChange({
      ...options,
      [key]: value
    });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <Label className="text-base font-medium">Export Options</Label>
        <p className="text-sm text-muted-foreground mb-3">
          Configure your export settings
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Date Range</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="date"
              value={options.startDate || ''}
              onChange={(e) => handleOptionChange('startDate', e.target.value)}
              placeholder="Start date"
            />
            <Input
              type="date"
              value={options.endDate || ''}
              onChange={(e) => handleOptionChange('endDate', e.target.value)}
              placeholder="End date"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Columns to Include</Label>
          <div className="space-y-2">
            {options.availableColumns?.map((column) => (
              <div key={column.key} className="flex items-center space-x-2">
                <Checkbox
                  id={column.key}
                  checked={options.selectedColumns?.includes(column.key) || false}
                  onCheckedChange={(checked) => {
                    const currentColumns = options.selectedColumns || [];
                    if (checked) {
                      handleOptionChange('selectedColumns', [...currentColumns, column.key]);
                    } else {
                      handleOptionChange('selectedColumns', currentColumns.filter(c => c !== column.key));
                    }
                  }}
                />
                <Label htmlFor={column.key} className="text-sm">
                  {column.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>File Name</Label>
          <Input
            value={options.fileName || ''}
            onChange={(e) => handleOptionChange('fileName', e.target.value)}
            placeholder="Enter file name"
          />
        </div>

        <div className="space-y-2">
          <Label>Include Headers</Label>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeHeaders"
              checked={options.includeHeaders !== false}
              onCheckedChange={(checked) => handleOptionChange('includeHeaders', checked)}
            />
            <Label htmlFor="includeHeaders" className="text-sm">
              Include column headers in export
            </Label>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Data Format</Label>
          <Select
            value={options.dataFormat || 'formatted'}
            onValueChange={(value) => handleOptionChange('dataFormat', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="formatted">Formatted (Human readable)</SelectItem>
              <SelectItem value="raw">Raw (Database values)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

/**
 * Export progress indicator
 */
export const ExportProgressIndicator = ({
  progress = 0,
  status = 'idle',
  message = '',
  onCancel,
  className = ''
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'processing':
        return <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Database className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'processing':
        return 'text-blue-600';
      case 'completed':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-muted-foreground';
    }
  };

  if (status === 'idle') return null;

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            {getStatusIcon()}
            <div className="flex-1">
              <div className={`font-medium ${getStatusColor()}`}>
                {status === 'processing' && 'Exporting data...'}
                {status === 'completed' && 'Export completed'}
                {status === 'error' && 'Export failed'}
              </div>
              {message && (
                <div className="text-sm text-muted-foreground">
                  {message}
                </div>
              )}
            </div>
            {status === 'processing' && onCancel && (
              <Button variant="outline" size="sm" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>

          {status === 'processing' && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <div className="text-sm text-muted-foreground text-center">
                {Math.round(progress)}% complete
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Export history
 */
export const ExportHistory = ({
  exports = [],
  onDownload,
  onDelete,
  className = ''
}) => {
  const getFormatIcon = (format) => {
    switch (format) {
      case 'csv':
        return <FileCsv className="w-4 h-4" />;
      case 'xlsx':
        return <FileSpreadsheet className="w-4 h-4" />;
      case 'json':
        return <FileJson className="w-4 h-4" />;
      case 'pdf':
        return <FileText className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Download className="w-5 h-5" />
          <span>Export History</span>
        </CardTitle>
        <CardDescription>
          Your recent data exports
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {exports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No exports yet
            </div>
          ) : (
            exports.map((exportItem) => (
              <div
                key={exportItem.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  {getFormatIcon(exportItem.format)}
                  <div>
                    <div className="font-medium">{exportItem.fileName}</div>
                    <div className="text-sm text-muted-foreground">
                      {exportItem.format.toUpperCase()} • {formatFileSize(exportItem.size)} •
                      {new Date(exportItem.createdAt).toLocaleString('id-ID')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDownload?.(exportItem)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete?.(exportItem.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Import data component
 */
export const ImportDataComponent = ({
  onFileSelect,
  onImport,
  acceptedFormats = ['.csv', '.xlsx', '.json'],
  maxFileSize = 10 * 1024 * 1024, // 10MB
  className = ''
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    setError('');

    // Check file size
    if (file.size > maxFileSize) {
      setError(`File size must be less than ${formatFileSize(maxFileSize)}`);
      return;
    }

    // Check file format
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (!acceptedFormats.includes(fileExtension)) {
      setError(`File format must be one of: ${acceptedFormats.join(', ')}`);
      return;
    }

    setSelectedFile(file);
    onFileSelect?.(file);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Upload className="w-5 h-5" />
          <span>Import Data</span>
        </CardTitle>
        <CardDescription>
          Upload a file to import data into the system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-primary bg-primary/5'
                : 'border-muted hover:border-primary/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <div className="space-y-2">
              <p className="text-lg font-medium">
                {selectedFile ? selectedFile.name : 'Drop your file here'}
              </p>
              <p className="text-sm text-muted-foreground">
                or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                Accepted formats: {acceptedFormats.join(', ')} (max {formatFileSize(maxFileSize)})
              </p>
            </div>
            <input
              type="file"
              accept={acceptedFormats.join(',')}
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {selectedFile && (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{selectedFile.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatFileSize(selectedFile.size)}
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <Button
                onClick={() => onImport?.(selectedFile)}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                Import Data
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Data export modal
 */
export const DataExportModal = ({
  isOpen,
  onClose,
  onExport,
  data = [],
  columns = [],
  loading = false,
  className = ''
}) => {
  const [selectedFormat, setSelectedFormat] = useState('csv');
  const [options, setOptions] = useState({
    includeHeaders: true,
    dataFormat: 'formatted',
    selectedColumns: columns.map(col => col.key)
  });

  const handleExport = () => {
    onExport?.({
      format: selectedFormat,
      options,
      data,
      columns
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Download className="w-5 h-5" />
            <span>Export Data</span>
          </CardTitle>
          <CardDescription>
            Choose format and options for your data export
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ExportFormatSelector
            selectedFormat={selectedFormat}
            onFormatChange={setSelectedFormat}
          />

          <ExportOptionsPanel
            options={{
              ...options,
              availableColumns: columns
            }}
            onOptionsChange={setOptions}
          />

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleExport} disabled={loading}>
              {loading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Export Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default {
  ExportFormatSelector,
  ExportOptionsPanel,
  ExportProgressIndicator,
  ExportHistory,
  ImportDataComponent,
  DataExportModal
};
