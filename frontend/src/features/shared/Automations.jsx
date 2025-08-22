import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Button,
  Badge,
  Input,
  Label,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui';
import { 
  Plus, 
  Play, 
  Pause, 
  Edit, 
  Trash, 
  Copy, 
  ExternalLink,
  Workflow,
  Webhook,
  Zap,
  Clock,
  Activity,
  Settings,
  TestTube
} from 'lucide-react';
import { workflowsData } from '@/data/sampleData';

const Automations = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      case 'draft': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'active': return <Play className="w-4 h-4 text-green-500" />;
      case 'inactive': return <Pause className="w-4 h-4 text-gray-500" />;
      case 'draft': return <Edit className="w-4 h-4 text-blue-500" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Automations</h2>
          <p className="text-muted-foreground">Manage automated workflows and integrations</p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Workflow
        </Button>
      </div>

      <Tabs defaultValue="workflows" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
        </TabsList>

        <TabsContent value="workflows" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Workflows List */}
            <Card>
              <CardHeader>
                <CardTitle>Active Workflows</CardTitle>
                <CardDescription>Manage your automated workflows</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {workflowsData.map(workflow => (
                    <div
                      key={workflow.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedWorkflow?.id === workflow.id 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedWorkflow(workflow)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Workflow className="w-5 h-5 text-primary" />
                          <h4 className="font-medium">{workflow.name}</h4>
                        </div>
                        <Badge variant={getStatusColor(workflow.status)}>
                          {workflow.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Webhook className="w-4 h-4" />
                          <span className="truncate">{workflow.webhook}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4" />
                          <span>{workflow.executions} executions</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-3">
                        <Button variant="ghost" size="sm" onClick={(e) => {
                          e.stopPropagation();
                          setEditingWorkflow(workflow);
                        }}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Workflow Details */}
            <Card>
              <CardHeader>
                <CardTitle>Workflow Details</CardTitle>
                <CardDescription>
                  {selectedWorkflow ? 'Configure and monitor workflow' : 'Select a workflow to view details'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedWorkflow ? (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Name</Label>
                      <p className="text-sm text-muted-foreground mt-1">{selectedWorkflow.name}</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Status</Label>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusIcon(selectedWorkflow.status)}
                        <Badge variant={getStatusColor(selectedWorkflow.status)}>
                          {selectedWorkflow.status}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Webhook URL</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input 
                          value={selectedWorkflow.webhook} 
                          readOnly 
                          className="font-mono text-xs"
                        />
                        <Button variant="outline" size="sm">
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Triggers</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedWorkflow.triggers.map(trigger => (
                          <Badge key={trigger} variant="outline" className="text-xs">
                            {trigger}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Executions</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedWorkflow.executions} total executions
                      </p>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button variant="outline" className="flex-1">
                        <TestTube className="w-4 h-4 mr-2" />
                        Test
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Activity className="w-4 h-4 mr-2" />
                        Monitor
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Workflow className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Select a workflow to view details</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Webhook Management</CardTitle>
              <CardDescription>Configure and monitor webhook endpoints</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Webhook className="w-5 h-5 text-primary" />
                    <div>
                      <h4 className="font-medium">Order Status Webhook</h4>
                      <p className="text-sm text-muted-foreground">https://n8n.company.com/webhook/order-status</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default">Active</Badge>
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Webhook className="w-5 h-5 text-primary" />
                    <div>
                      <h4 className="font-medium">Refund Processing Webhook</h4>
                      <p className="text-sm text-muted-foreground">https://n8n.company.com/webhook/refund</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default">Active</Badge>
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <Button variant="outline" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Webhook
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Testing</CardTitle>
              <CardDescription>Test your workflows with sample data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="workflow-select">Select Workflow</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose workflow to test" />
                    </SelectTrigger>
                    <SelectContent>
                      {workflowsData.map(workflow => (
                        <SelectItem key={workflow.id} value={workflow.id}>
                          {workflow.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="test-data">Test Data (JSON)</Label>
                  <Textarea 
                    id="test-data" 
                    placeholder='{"order_id": "12345", "customer_email": "test@example.com"}'
                    rows={6}
                  />
                </div>

                <div className="flex gap-2">
                  <Button>
                    <TestTube className="w-4 h-4 mr-2" />
                    Run Test
                  </Button>
                  <Button variant="outline">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Sample Data
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Workflow Modal */}
      {(isCreating || editingWorkflow) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                {isCreating ? 'Create New Workflow' : 'Edit Workflow'}
              </CardTitle>
              <CardDescription>
                {isCreating ? 'Configure a new automated workflow' : 'Update workflow configuration'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Workflow Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g., Order Status Check"
                  defaultValue={editingWorkflow?.name}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="webhook">Webhook URL</Label>
                <Input 
                  id="webhook" 
                  placeholder="https://your-webhook-url.com/endpoint"
                  defaultValue={editingWorkflow?.webhook}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="triggers">Triggers</Label>
                <Input 
                  id="triggers" 
                  placeholder="Enter triggers separated by commas"
                  defaultValue={editingWorkflow?.triggers?.join(', ')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select defaultValue={editingWorkflow?.status || 'draft'}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsCreating(false);
                    setEditingWorkflow(null);
                  }}
                >
                  Cancel
                </Button>
                <Button>
                  {isCreating ? 'Create Workflow' : 'Update Workflow'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Automations;
