import { useState } from 'react';
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
  Badge,
  Progress
} from '@/components/ui';
import { Star } from 'lucide-react';

const AgentAssignmentDialog = ({
  isOpen,
  onClose,
  conversationId,
  availableAgents,
  onAssign
}) => {
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [assignmentReason, setAssignmentReason] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedAgent = availableAgents.find(agent => agent.id === selectedAgentId);

  const handleAssign = async () => {
    if (!selectedAgentId) {
      // Please select an agent
      return;
    }

    setLoading(true);
    try {
      await onAssign(conversationId, selectedAgentId, assignmentReason);
      onClose();
      setSelectedAgentId('');
      setAssignmentReason('');
    } catch (error) {
      // Assignment error
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedAgentId('');
    setAssignmentReason('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assign Conversation to Agent</DialogTitle>
          <DialogDescription>
            Select the best agent for this conversation based on their skills and availability
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Agent Selection */}
          <div>
            <Label htmlFor="agent-select">Select Agent</Label>
            <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an agent..." />
              </SelectTrigger>
              <SelectContent>
                {availableAgents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{agent.display_name}</span>
                      <div className="flex items-center space-x-2 ml-4">
                        <Badge variant={agent.availability_status === 'online' ? 'default' : 'secondary'}>
                          {agent.availability_status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {agent.current_active_chats}/{agent.max_concurrent_chats}
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selected Agent Details */}
          {selectedAgent && (
            <div className="p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">{selectedAgent.display_name}</h3>
                <Badge variant="outline">{selectedAgent.department}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-sm text-muted-foreground">Current Load</p>
                  <div className="flex items-center space-x-2">
                    <Progress
                      value={(selectedAgent.current_active_chats / selectedAgent.max_concurrent_chats) * 100}
                      className="flex-1 h-2"
                    />
                    <span className="text-sm font-medium">
                      {selectedAgent.capacity_utilization}%
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Rating</p>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{selectedAgent.rating || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Skills</p>
                <div className="flex flex-wrap gap-1">
                  {selectedAgent.skills?.slice(0, 5).map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {selectedAgent.skills?.length > 5 && (
                    <Badge variant="outline" className="text-xs">
                      +{selectedAgent.skills.length - 5} more
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Assignment Reason */}
          <div>
            <Label htmlFor="assignment-reason">Assignment Reason (Optional)</Label>
            <Textarea
              id="assignment-reason"
              value={assignmentReason}
              onChange={(e) => setAssignmentReason(e.target.value)}
              placeholder="Explain why this agent is the best choice for this conversation..."
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={handleAssign}
              disabled={!selectedAgentId || loading}
            >
              {loading ? 'Assigning...' : 'Assign Conversation'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AgentAssignmentDialog;
