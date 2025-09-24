/**
 * Bot Personality Bulk Actions
 * Component untuk melakukan bulk actions pada bot personalities
 */

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Select,
  SelectItem,
  Alert,
  AlertDescription,
  Badge
} from '@/components/ui';
import {
  Trash2,
  CheckCircle2,
  XCircle,
  Star,
  StarOff,
  Download,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const BotPersonalityBulkActions = ({
  selectedPersonalities,
  onClearSelection,
  onBulkAction
}) => {
  const [selectedAction, setSelectedAction] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBulkAction = async (action) => {
    if (!selectedAction) {
      toast.error('Please select an action first');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${selectedPersonalities.length} bot personalities?`
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success(`Successfully ${action} ${selectedPersonalities.length} bot personalities`);
      onBulkAction(action);
      onClearSelection();
      setSelectedAction('');
    } catch (error) {
      toast.error(`Failed to ${action} bot personalities`);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'activate':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'deactivate':
        return <XCircle className="w-4 h-4" />;
        return <StarOff className="w-4 h-4" />;
      case 'delete':
        return <Trash2 className="w-4 h-4" />;
      case 'export':
        return <Download className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getActionLabel = (action) => {
    switch (action) {
      case 'activate':
        return 'Activate Selected';
      case 'deactivate':
        return 'Deactivate Selected';
        return 'Remove Default';
      case 'delete':
        return 'Delete Selected';
      case 'export':
        return 'Export Selected';
      default:
        return 'Select Action';
    }
  };

  const activeCount = selectedPersonalities.filter(p => p.status === 'active').length;
  const inactiveCount = selectedPersonalities.filter(p => p.status === 'inactive').length;

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              Bulk Actions
            </CardTitle>
            <CardDescription>
              {selectedPersonalities.length} bot personalities selected
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selection Summary */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="bg-white">
            Total: {selectedPersonalities.length}
          </Badge>
          {activeCount > 0 && (
            <Badge variant="outline" className="bg-green-100 text-green-700">
              Active: {activeCount}
            </Badge>
          )}
          {inactiveCount > 0 && (
            <Badge variant="outline" className="bg-red-100 text-red-700">
              Inactive: {inactiveCount}
            </Badge>
          )}
          {defaultCount > 0 && (
            <Badge variant="outline" className="bg-yellow-100 text-yellow-700">
              Default: {defaultCount}
            </Badge>
          )}
        </div>

        {/* Action Selection */}
        <div className="space-y-3">
          <Select
            value={selectedAction}
            onValueChange={setSelectedAction}
            placeholder="Select bulk action"
          >
            <SelectItem value="activate">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Activate Selected
              </div>
            </SelectItem>
            <SelectItem value="deactivate">
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                Deactivate Selected
              </div>
            </SelectItem>
            <SelectItem value="remove-default">
              <div className="flex items-center gap-2">
                <StarOff className="w-4 h-4" />
                Remove Default Status
              </div>
            </SelectItem>
            <SelectItem value="export">
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Selected
              </div>
            </SelectItem>
            <SelectItem value="delete">
              <div className="flex items-center gap-2 text-red-600">
                <Trash2 className="w-4 h-4" />
                Delete Selected
              </div>
            </SelectItem>
          </Select>

          {/* Warning for destructive actions */}
          {(selectedAction === 'delete' || selectedAction === 'deactivate') && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {selectedAction === 'delete'
                  ? 'This action cannot be undone. All selected bot personalities will be permanently deleted.'
                  : 'Selected bot personalities will be deactivated and unavailable for use.'
                }
              </AlertDescription>
            </Alert>
          )}

          {/* Action Button */}
          <Button
            onClick={() => handleBulkAction(selectedAction)}
            disabled={!selectedAction || loading}
            variant={selectedAction === 'delete' ? 'destructive' : 'default'}
            className="w-full"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                {getActionIcon(selectedAction)}
                <span className="ml-2">{getActionLabel(selectedAction)}</span>
              </>
            )}
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="pt-4 border-t border-blue-200">
          <p className="text-sm font-medium text-gray-700 mb-2">Quick Actions:</p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedAction('activate');
                handleBulkAction('activate');
              }}
              disabled={loading || inactiveCount === 0}
            >
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Activate All Inactive
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedAction('deactivate');
                handleBulkAction('deactivate');
              }}
              disabled={loading || activeCount === 0}
            >
              <XCircle className="w-4 h-4 mr-1" />
              Deactivate All Active
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedAction('export');
                handleBulkAction('export');
              }}
              disabled={loading}
            >
              <Download className="w-4 h-4 mr-1" />
              Export All Selected
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BotPersonalityBulkActions;
