import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Button,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  Badge
} from '@/components/ui';
import { AlertTriangle, UserPlus, CheckCircle, AlertCircle, Tag } from 'lucide-react';

const BulkActionsDialog = ({
  isOpen,
  onClose,
  selectedCount,
  availableAgents,
  onBulkAction
}) => {
  const [selectedAction, setSelectedAction] = useState('');
  const [actionData, setActionData] = useState({});
  const [loading, setLoading] = useState(false);

  const handleAction = async () => {
    if (!selectedAction) {
      alert('Please select an action');
      return;
    }

    setLoading(true);
    try {
      await onBulkAction(selectedAction, actionData);
      onClose();
      setSelectedAction('');
      setActionData({});
    } catch (error) {
      console.error('Bulk action error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedAction('');
    setActionData({});
    onClose();
  };

  const renderActionForm = () => {
    switch (selectedAction) {
      case 'assign':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="assign-agent">Assign to Agent</Label>
              <Select
                value={actionData.agent_id || ''}
                onValueChange={(value) => setActionData({ ...actionData, agent_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select agent..." />
                </SelectTrigger>
                <SelectContent>
                  {availableAgents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{agent.display_name}</span>
                        <Badge variant="outline" className="ml-2">
                          {agent.current_active_chats}/{agent.max_concurrent_chats}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="assign-reason">Assignment Reason</Label>
              <Textarea
                id="assign-reason"
                value={actionData.reason || ''}
                onChange={(e) => setActionData({ ...actionData, reason: e.target.value })}
                placeholder="Reason for bulk assignment..."
                rows={2}
              />
            </div>
          </div>
        );

      case 'change_priority':
        return (
          <div>
            <Label htmlFor="priority-select">New Priority</Label>
            <Select
              value={actionData.priority || ''}
              onValueChange={(value) => setActionData({ ...actionData, priority: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case 'escalate':
        return (
          <div>
            <Label htmlFor="escalate-reason">Escalation Reason</Label>
            <Textarea
              id="escalate-reason"
              value={actionData.reason || ''}
              onChange={(e) => setActionData({ ...actionData, reason: e.target.value })}
              placeholder="Reason for escalation..."
              rows={3}
            />
          </div>
        );

      case 'add_tag':
        return (
          <div>
            <Label htmlFor="tag-input">Add Tag</Label>
            <input
              id="tag-input"
              type="text"
              value={actionData.tag || ''}
              onChange={(e) => setActionData({ ...actionData, tag: e.target.value })}
              placeholder="Enter tag name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        );

      default:
        return null;
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'assign':
        return <UserPlus className="h-4 w-4" />;
      case 'close':
        return <CheckCircle className="h-4 w-4" />;
      case 'escalate':
        return <AlertTriangle className="h-4 w-4" />;
      case 'change_priority':
        return <AlertCircle className="h-4 w-4" />;
      case 'add_tag':
        return <Tag className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getActionDescription = (action) => {
    switch (action) {
      case 'assign':
        return 'Assign selected conversations to a specific agent';
      case 'close':
        return 'Close selected conversations';
      case 'escalate':
        return 'Escalate selected conversations for higher priority handling';
      case 'change_priority':
        return 'Change priority level of selected conversations';
      case 'add_tag':
        return 'Add a tag to selected conversations';
      default:
        return '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Bulk Actions</DialogTitle>
          <DialogDescription>
            Apply actions to {selectedCount} selected conversations
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Action Selection */}
          <div>
            <Label htmlFor="action-select">Select Action</Label>
            <Select value={selectedAction} onValueChange={setSelectedAction}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an action..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="assign">
                  <div className="flex items-center space-x-2">
                    {getActionIcon('assign')}
                    <span>Assign to Agent</span>
                  </div>
                </SelectItem>
                <SelectItem value="close">
                  <div className="flex items-center space-x-2">
                    {getActionIcon('close')}
                    <span>Close Conversations</span>
                  </div>
                </SelectItem>
                <SelectItem value="escalate">
                  <div className="flex items-center space-x-2">
                    {getActionIcon('escalate')}
                    <span>Escalate</span>
                  </div>
                </SelectItem>
                <SelectItem value="change_priority">
                  <div className="flex items-center space-x-2">
                    {getActionIcon('change_priority')}
                    <span>Change Priority</span>
                  </div>
                </SelectItem>
                <SelectItem value="add_tag">
                  <div className="flex items-center space-x-2">
                    {getActionIcon('add_tag')}
                    <span>Add Tag</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {selectedAction && (
              <p className="text-sm text-muted-foreground mt-2">
                {getActionDescription(selectedAction)}
              </p>
            )}
          </div>

          {/* Action Form */}
          {selectedAction && renderActionForm()}

          {/* Warning for destructive actions */}
          {(selectedAction === 'close' || selectedAction === 'escalate') && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <p className="text-sm text-yellow-800">
                  This action will affect {selectedCount} conversations. This cannot be undone.
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={handleAction}
              disabled={!selectedAction || loading}
              variant={selectedAction === 'close' || selectedAction === 'escalate' ? 'destructive' : 'default'}
            >
              {loading ? 'Processing...' : `Apply to ${selectedCount} Conversations`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BulkActionsDialog;
