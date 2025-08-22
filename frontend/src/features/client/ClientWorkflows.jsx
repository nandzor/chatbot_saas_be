import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Badge,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui';
import { 
  Settings, 
  Play, 
  Pause, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  Zap
} from 'lucide-react';

const ClientWorkflows = ({ clientData }) => {

  // Sample workflows data
  const [workflows] = React.useState([
    {
      id: 1,
      name: 'Customer Support Ticket',
      description: 'Automated workflow for handling customer support tickets',
      status: 'active',
      lastExecuted: '2024-03-20 15:30',
      executionCount: 156,
      successRate: 98.5,
      avgExecutionTime: '2.3s',
      triggers: ['new_ticket', 'ticket_update']
    },
    {
      id: 2,
      name: 'Lead Qualification',
      description: 'Workflow for qualifying and scoring new leads',
      status: 'active',
      lastExecuted: '2024-03-20 14:15',
      executionCount: 89,
      successRate: 94.2,
      avgExecutionTime: '1.8s',
      triggers: ['new_lead', 'lead_interaction']
    },
    {
      id: 3,
      name: 'Invoice Generation',
      description: 'Automated invoice generation and sending',
      status: 'paused',
      lastExecuted: '2024-03-19 09:00',
      executionCount: 23,
      successRate: 100,
      avgExecutionTime: '5.2s',
      triggers: ['billing_cycle', 'manual_trigger']
    },
    {
      id: 4,
      name: 'User Onboarding',
      description: 'Welcome workflow for new user registrations',
      status: 'active',
      lastExecuted: '2024-03-20 16:45',
      executionCount: 234,
      successRate: 96.8,
      avgExecutionTime: '3.1s',
      triggers: ['user_registration']
    }
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <Play className="w-4 h-4" />;
      case 'paused': return <Pause className="w-4 h-4" />;
      case 'error': return <AlertTriangle className="w-4 h-4" />;
      case 'draft': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">N8N Workflows</h2>
          <p className="text-gray-600">Monitor and manage automated workflows for {clientData.name}</p>
        </div>
        <Button>
          <Zap className="w-4 h-4 mr-2" />
          Create Workflow
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{workflows.length}</div>
            <p className="text-sm text-muted-foreground">Total Workflows</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {workflows.filter(w => w.status === 'active').length}
            </div>
            <p className="text-sm text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {workflows.reduce((sum, w) => sum + w.executionCount, 0)}
            </div>
            <p className="text-sm text-muted-foreground">Total Executions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {(workflows.reduce((sum, w) => sum + w.successRate, 0) / workflows.length).toFixed(1)}%
            </div>
            <p className="text-sm text-muted-foreground">Avg Success Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Workflows Table */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow Management</CardTitle>
          <CardDescription>View and manage all automated workflows</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Workflow</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Executed</TableHead>
                <TableHead>Executions</TableHead>
                <TableHead>Success Rate</TableHead>
                <TableHead>Avg Time</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workflows.map((workflow) => (
                <TableRow key={workflow.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{workflow.name}</div>
                      <div className="text-sm text-gray-500">{workflow.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(workflow.status)}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(workflow.status)}
                        <span>{workflow.status}</span>
                      </div>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{workflow.lastExecuted}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">{workflow.executionCount.toLocaleString()}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="text-sm font-medium">{workflow.successRate}%</div>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            workflow.successRate >= 95 ? 'bg-green-500' :
                            workflow.successRate >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${workflow.successRate}%` }}
                        ></div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{workflow.avgExecutionTime}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Activity className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Settings className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        {workflow.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Execution Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Executions</CardTitle>
          <CardDescription>Latest workflow execution logs and results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {workflows.slice(0, 3).map((workflow) => (
              <div key={workflow.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-full ${
                    workflow.status === 'active' ? 'bg-green-100 text-green-600' :
                    workflow.status === 'paused' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-medium">{workflow.name}</div>
                    <div className="text-sm text-gray-500">
                      Last executed: {workflow.lastExecuted}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{workflow.executionCount} executions</div>
                  <div className="text-xs text-gray-500">
                    Success rate: {workflow.successRate}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common workflow management tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto p-4 flex-col">
              <Zap className="w-6 h-6 mb-2" />
              <span className="font-medium">Import Workflow</span>
              <span className="text-xs text-gray-500">From JSON file</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col">
              <Settings className="w-6 h-6 mb-2" />
              <span className="font-medium">Workflow Templates</span>
              <span className="text-xs text-gray-500">Pre-built workflows</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col">
              <Activity className="w-6 h-6 mb-2" />
              <span className="font-medium">Performance Analytics</span>
              <span className="text-xs text-gray-500">Execution metrics</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col">
              <AlertTriangle className="w-6 h-6 mb-2" />
              <span className="font-medium">Error Logs</span>
              <span className="text-xs text-gray-500">View failures</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientWorkflows;
