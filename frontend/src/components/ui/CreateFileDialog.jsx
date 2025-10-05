/**
 * Create File Dialog Component
 * Dialog untuk membuat file baru di Google Drive
 */

import { useState } from 'react';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { FileText, X } from 'lucide-react';

const CreateFileDialog = ({ onCreateFile, onCancel }) => {
  const [fileName, setFileName] = useState('');
  const [content, setContent] = useState('');
  const [mimeType, setMimeType] = useState('text/plain');
  const [loading, setLoading] = useState(false);

  const mimeTypes = [
    { value: 'text/plain', label: 'Plain Text (.txt)' },
    { value: 'text/html', label: 'HTML (.html)' },
    { value: 'application/json', label: 'JSON (.json)' },
    { value: 'text/csv', label: 'CSV (.csv)' },
    { value: 'application/xml', label: 'XML (.xml)' },
    { value: 'text/markdown', label: 'Markdown (.md)' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fileName.trim()) {
      return;
    }

    setLoading(true);
    try {
      await onCreateFile(fileName.trim(), content, mimeType);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-600" />
              <CardTitle>Create New File</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="p-1"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <CardDescription>
            Create a new file in your Google Drive
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="fileName" className="block text-sm font-medium text-gray-700 mb-1">
                File Name
              </label>
              <Input
                id="fileName"
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="Enter file name..."
                required
              />
            </div>

            <div>
              <label htmlFor="mimeType" className="block text-sm font-medium text-gray-700 mb-1">
                File Type
              </label>
              <Select value={mimeType} onValueChange={setMimeType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select file type" />
                </SelectTrigger>
                <SelectContent>
                  {mimeTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                Content
              </label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter file content..."
                rows={6}
                className="resize-none"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !fileName.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? 'Creating...' : 'Create File'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateFileDialog;
