import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Button,
  Input,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Checkbox,
  Alert,
  AlertDescription
} from '@/components/ui';
import { 
  ArrowLeft,
  Plus,
  Users,
  Search,
  MoreHorizontal,
  UserPlus,
  UserMinus,
  Settings,
  Activity,
  Clock,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Trash2,
  Shield,
  Eye
} from 'lucide-react';

const PlatformAgentManagement = ({ platformId, onBack }) => {
  // Sample data - in real app this would come from API
  const [assignedAgents, setAssignedAgents] = useState([
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah@company.com',
      role: 'senior_agent',
      status: 'online',
      assignedChats: 3,
      maxChats: 5,
      totalResolved: 156,
      avgResponseTime: '1.2 min',
      satisfactionScore: 4.8,
      permissions: ['chat', 'transfer', 'close'],
      assignedAt: '2024-03-15 10:30:00',
      lastActivity: '2024-03-20 14:25:12'
    },
    {
      id: 2,
      name: 'Mike Chen',
      email: 'mike@company.com',
      role: 'agent',
      status: 'away',
      assignedChats: 2,
      maxChats: 4,
      totalResolved: 89,
      avgResponseTime: '2.1 min',
      satisfactionScore: 4.5,
      permissions: ['chat', 'transfer'],
      assignedAt: '2024-03-12 09:15:00',
      lastActivity: '2024-03-20 13:50:45'
    },
    {
      id: 3,
      name: 'Lisa Wong',
      email: 'lisa@company.com',
      role: 'agent',
      status: 'offline',
      assignedChats: 0,
      maxChats: 3,
      totalResolved: 67,
      avgResponseTime: '3.5 min',
      satisfactionScore: 4.2,
      permissions: ['chat'],
      assignedAt: '2024-03-10 14:20:00',
      lastActivity: '2024-03-19 17:30:22'
    }
  ]);

  const [availableAgents, setAvailableAgents] = useState([
    {
      id: 4,
      name: 'David Kim',
      email: 'david@company.com',
      role: 'senior_agent',
      department: 'Support',
      totalResolved: 234,
      avgResponseTime: '1.8 min',
      satisfactionScore: 4.6
    },
    {
      id: 5,
      name: 'Emma Wilson',
      email: 'emma@company.com',
      role: 'agent',
      department: 'Sales',
      totalResolved: 123,
      avgResponseTime: '2.3 min',
      satisfactionScore: 4.4
    },
    {
      id: 6,
      name: 'Alex Rodriguez',
      email: 'alex@company.com',
      role: 'agent',
      department: 'Support',
      totalResolved: 89,
      avgResponseTime: '2.8 min',
      satisfactionScore: 4.1
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [selectedAgents, setSelectedAgents] = useState([]);

  const getStatusBadge = (status) => {
    const variants = {
      online: { variant: 'green', color: 'text-green-600', icon: CheckCircle },
      away: { variant: 'yellow', color: 'text-yellow-600', icon: AlertCircle },
      offline: { variant: 'default', color: 'text-gray-600', icon: XCircle }
    };
    
    const config = variants[status] || variants.offline;
    const IconComponent = config.icon;
    
    return (
      <Badge variant={config.variant} className="capitalize">
        <IconComponent className="w-3 h-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const getRoleBadge = (role) => {
    const variants = {
      senior_agent: { color: 'bg-blue-100 text-blue-700', label: 'Senior Agent' },
      agent: { color: 'bg-green-100 text-green-700', label: 'Agent' },
      supervisor: { color: 'bg-purple-100 text-purple-700', label: 'Supervisor' }
    };
    
    const config = variants[role] || variants.agent;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const handleAddAgent = (agentId, permissions = ['chat']) => {
    const agent = availableAgents.find(a => a.id === agentId);
    if (agent) {
      const newAssignedAgent = {
        ...agent,
        status: 'offline',
        assignedChats: 0,
        maxChats: agent.role === 'senior_agent' ? 5 : 3,
        permissions,
        assignedAt: new Date().toISOString(),
        lastActivity: new Date().toISOString()
      };
      
      setAssignedAgents(prev => [...prev, newAssignedAgent]);
      setAvailableAgents(prev => prev.filter(a => a.id !== agentId));
      setShowAddDialog(false);
      setSelectedAgents([]);
    }
  };

  const handleRemoveAgent = (agentId) => {
    const agent = assignedAgents.find(a => a.id === agentId);
    if (agent) {
      const { assignedChats, maxChats, permissions, assignedAt, lastActivity, status, ...availableAgent } = agent;
      
      setAvailableAgents(prev => [...prev, availableAgent]);
      setAssignedAgents(prev => prev.filter(a => a.id !== agentId));
      setShowRemoveDialog(false);
      setSelectedAgent(null);
    }
  };

  const handleBulkAdd = () => {
    selectedAgents.forEach(agentId => {
      handleAddAgent(agentId, ['chat']);
    });
  };

  const filteredAvailableAgents = availableAgents.filter(agent =>
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAssignedAgents = assignedAgents.filter(agent =>
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Agent Management</h1>
            <p className="text-muted-foreground">Manage agents assigned to this platform</p>
          </div>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              Add Agents
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Add Agents to Platform</DialogTitle>
              <DialogDescription>
                Select agents to assign to this platform. They will be able to handle conversations from this channel.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search agents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="border rounded-lg max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedAgents.length === filteredAvailableAgents.length}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedAgents(filteredAvailableAgents.map(a => a.id));
                            } else {
                              setSelectedAgents([]);
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead>Agent</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Performance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAvailableAgents.map((agent) => (
                      <TableRow key={agent.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedAgents.includes(agent.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedAgents(prev => [...prev, agent.id]);
                              } else {
                                setSelectedAgents(prev => prev.filter(id => id !== agent.id));
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-xs font-medium text-primary">
                                {agent.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{agent.name}</p>
                              <p className="text-sm text-muted-foreground">{agent.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getRoleBadge(agent.role)}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{agent.department}</span>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-sm">
                            <div>Resolved: <span className="font-medium">{agent.totalResolved}</span></div>
                            <div>Rating: <span className="font-medium">{agent.satisfactionScore}/5</span></div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleBulkAdd} disabled={selectedAgents.length === 0}>
                Add {selectedAgents.length} Agent{selectedAgents.length !== 1 ? 's' : ''}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignedAgents.length}</div>
            <p className="text-xs text-muted-foreground">
              {assignedAgents.filter(a => a.status === 'online').length} online
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Chats</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {assignedAgents.reduce((sum, a) => sum + a.assignedChats, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently handling
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.1 min</div>
            <p className="text-xs text-muted-foreground">
              Average response time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.5/5</div>
            <p className="text-xs text-muted-foreground">
              Average rating
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Assigned Agents Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Assigned Agents</CardTitle>
              <CardDescription>Agents currently assigned to handle conversations from this platform</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search agents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredAssignedAgents.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Workload</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssignedAgents.map((agent) => (
                  <TableRow key={agent.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {agent.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{agent.name}</p>
                          <p className="text-sm text-muted-foreground">{agent.email}</p>
                          {getRoleBadge(agent.role)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(agent.status)}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{agent.assignedChats}/{agent.maxChats}</span>
                          <div className="flex-1 bg-muted rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${(agent.assignedChats / agent.maxChats) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">Active chats</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        <div>Resolved: <span className="font-medium">{agent.totalResolved}</span></div>
                        <div>Avg time: <span className="font-medium">{agent.avgResponseTime}</span></div>
                        <div>Rating: <span className="font-medium">{agent.satisfactionScore}/5</span></div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {agent.permissions.map((permission) => (
                          <Badge key={permission} variant="outline" className="text-xs">
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Settings className="w-4 h-4 mr-2" />
                            Edit Permissions
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Shield className="w-4 h-4 mr-2" />
                            Change Role
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => {
                              setSelectedAgent(agent);
                              setShowRemoveDialog(true);
                            }}
                            className="text-red-600"
                          >
                            <UserMinus className="w-4 h-4 mr-2" />
                            Remove from Platform
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Agents Assigned</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'No agents match your search criteria.' : 'No agents are currently assigned to this platform.'}
              </p>
              {!searchTerm && (
                <Button onClick={() => setShowAddDialog(true)}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Agents
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Remove Agent Dialog */}
      <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Agent from Platform</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove <strong>{selectedAgent?.name}</strong> from this platform? 
              They will no longer be able to handle conversations from this channel.
            </DialogDescription>
          </DialogHeader>
          
          {selectedAgent?.assignedChats > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This agent currently has {selectedAgent.assignedChats} active chat{selectedAgent.assignedChats !== 1 ? 's' : ''}. 
                These conversations will need to be reassigned to other agents.
              </AlertDescription>
            </Alert>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRemoveDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => handleRemoveAgent(selectedAgent?.id)}
            >
              Remove Agent
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlatformAgentManagement;
