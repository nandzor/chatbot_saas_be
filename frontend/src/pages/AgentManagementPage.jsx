import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  useToast
} from '@/components/ui';
import { PlusCircle, RefreshCw } from 'lucide-react';
import { useAgentManagement } from '@/hooks/useAgentManagement';
import AgentForm from '@/components/agent-management/AgentForm';
import AgentStatistics from '@/components/agent-management/AgentStatistics';
import AgentDatatable from '@/components/agent-management/AgentDatatable';

const AgentManagementPage = () => {
  const { loading, error, fetchAgents, createAgent, updateAgent, deleteAgent } = useAgentManagement();
  const { toast } = useToast();
  const [agents, setAgents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      const data = await fetchAgents();
      setAgents(data);
    } catch (err) {
      console.error("Failed to load agents:", err);
      toast({
        title: "Error",
        description: "Failed to load agents",
        variant: "destructive",
      });
    }
  };

  const handleAddAgent = () => {
    setEditingAgent(null);
    setShowForm(true);
  };

  const handleEditAgent = (agent) => {
    setEditingAgent(agent);
    setShowForm(true);
  };

  const handleDeleteAgent = async (agentId) => {
    try {
      await deleteAgent(agentId);
      toast({
        title: "Success",
        description: "Agent deleted successfully",
      });
      await loadAgents();
    } catch (err) {
      console.error("Failed to delete agent:", err);
      toast({
        title: "Error",
        description: "Failed to delete agent",
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (agent, newStatus) => {
    try {
      await updateAgent(agent.id, { status: newStatus });
      toast({
        title: "Success",
        description: `Agent ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`,
      });
      await loadAgents();
    } catch (err) {
      console.error("Failed to update agent status:", err);
      toast({
        title: "Error",
        description: "Failed to update agent status",
        variant: "destructive",
      });
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingAgent) {
        await updateAgent(editingAgent.id, formData);
        toast({
          title: "Success",
          description: "Agent updated successfully",
        });
      } else {
        await createAgent(formData);
        toast({
          title: "Success",
          description: "Agent created successfully",
        });
      }
      setShowForm(false);
      setEditingAgent(null);
      await loadAgents();
    } catch (err) {
      console.error("Failed to save agent:", err);
      toast({
        title: "Error",
        description: "Failed to save agent",
        variant: "destructive",
      });
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingAgent(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Agent Management</h1>
          <p className="text-muted-foreground">Manage your human agents and their configurations.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={loadAgents} disabled={loading} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" /> {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button onClick={handleAddAgent} size="sm">
            <PlusCircle className="h-4 w-4 mr-2" /> Add New Agent
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg border border-red-200 bg-red-50">
          <p className="font-medium text-red-800">Error: {error}</p>
        </div>
      )}

      <AgentStatistics />

      <Card>
        <CardHeader>
          <CardTitle>Agent List</CardTitle>
          <CardDescription>Overview of all registered agents.</CardDescription>
        </CardHeader>
        <CardContent>
          <AgentDatatable
            agents={agents}
            loading={loading}
            onEdit={handleEditAgent}
            onDelete={handleDeleteAgent}
            onView={(agent) => {
              setEditingAgent(agent);
              setShowForm(true);
            }}
            onStatusChange={handleToggleStatus}
            onRefresh={loadAgents}
          />
        </CardContent>
      </Card>

      {showForm && (
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingAgent ? 'Edit Agent' : 'Add New Agent'}</DialogTitle>
              <DialogDescription>
                {editingAgent ? `Editing ${editingAgent.display_name}` : 'Fill in the details for the new agent.'}
              </DialogDescription>
            </DialogHeader>
            <AgentForm
              agent={editingAgent}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AgentManagementPage;
