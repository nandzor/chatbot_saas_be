import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Badge,
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Textarea,
  Label
} from '@/components/ui';
import { 
  Plus, 
  Users, 
  Calendar, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  Settings,
  MessageSquare,
  Phone,
  Mail,
  BookOpen,
  Target,
  TrendingUp
} from 'lucide-react';

const OnboardingPipeline = () => {
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [newClient, setNewClient] = useState({
    name: '',
    plan: '',
    csm: '',
    expectedGoLive: ''
  });

  // Sample data for onboarding pipeline
  const [pipelineData] = useState({
    'pre-kickoff': {
      title: 'Pra-Kickoff',
      description: 'Initial client contact and requirements gathering',
      color: 'bg-blue-100 text-blue-800',
      clients: [
        {
          id: 1,
          name: 'TechStart Inc',
          plan: 'Professional',
          csm: 'Mike Chen',
          expectedGoLive: '2024-04-15',
          progress: 25,
          lastActivity: '2 hours ago',
          nextStep: 'Schedule kickoff meeting',
          priority: 'high'
        },
        {
          id: 2,
          name: 'Digital Solutions Ltd',
          plan: 'Enterprise',
          csm: 'Sarah Johnson',
          expectedGoLive: '2024-04-20',
          progress: 15,
          lastActivity: '1 day ago',
          nextStep: 'Send welcome package',
          priority: 'medium'
        }
      ]
    },
    'technical-config': {
      title: 'Konfigurasi Teknis',
      description: 'Technical setup and configuration',
      color: 'bg-yellow-100 text-yellow-800',
      clients: [
        {
          id: 3,
          name: 'Global Innovations',
          plan: 'Enterprise',
          csm: 'David Kim',
          expectedGoLive: '2024-04-10',
          progress: 60,
          lastActivity: '4 hours ago',
          nextStep: 'Configure SSO integration',
          priority: 'high'
        }
      ]
    },
    'training-session': {
      title: 'Sesi Pelatihan',
      description: 'User training and onboarding sessions',
      color: 'bg-green-100 text-green-800',
      clients: [
        {
          id: 4,
          name: 'ABC Corporation',
          plan: 'Enterprise',
          csm: 'Lisa Wang',
          expectedGoLive: '2024-04-05',
          progress: 80,
          lastActivity: '6 hours ago',
          nextStep: 'Schedule final training session',
          priority: 'medium'
        }
      ]
    },
    'go-live': {
      title: 'Go-Live',
      description: 'Final preparation and launch',
      color: 'bg-purple-100 text-purple-800',
      clients: [
        {
          id: 5,
          name: 'StartupXYZ',
          plan: 'Professional',
          csm: 'Alex Rodriguez',
          expectedGoLive: '2024-04-01',
          progress: 95,
          lastActivity: '1 hour ago',
          nextStep: 'Final system check',
          priority: 'high'
        }
      ]
    },
    'onboarding-complete': {
      title: 'Selesai Onboarding',
      description: 'Successfully onboarded clients',
      color: 'bg-emerald-100 text-emerald-800',
      clients: [
        {
          id: 6,
          name: 'Innovation Labs',
          plan: 'Professional',
          csm: 'Emma Thompson',
          expectedGoLive: '2024-03-25',
          progress: 100,
          lastActivity: '3 days ago',
          nextStep: 'Schedule 30-day check-in',
          priority: 'low'
        }
      ]
    }
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const handleAddClient = () => {
    // Add client logic here
    console.log('Adding new client:', newClient);
    setIsAddClientOpen(false);
    setNewClient({ name: '', plan: '', csm: '', expectedGoLive: '' });
  };

  const ClientCard = ({ client }) => (
    <Card className="mb-4 cursor-pointer hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="font-semibold text-sm mb-1">{client.name}</h4>
            <Badge variant="outline" className="text-xs mb-2">{client.plan}</Badge>
          </div>
          <Badge className={`text-xs ${getPriorityColor(client.priority)}`}>
            {client.priority}
          </Badge>
        </div>
        
        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Users className="w-3 h-3" />
            <span>{client.csm}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-3 h-3" />
            <span>Go-Live: {client.expectedGoLive}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3" />
            <span>{client.lastActivity}</span>
          </div>
        </div>

        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">Progress</span>
            <span className="text-xs font-medium">{client.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${getProgressColor(client.progress)}`}
              style={{ width: `${client.progress}%` }}
            ></div>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t">
          <p className="text-xs text-muted-foreground mb-2">Next Step:</p>
          <p className="text-xs font-medium">{client.nextStep}</p>
        </div>

        <div className="flex gap-2 mt-3">
          <Button size="sm" variant="outline" className="flex-1">
            <MessageSquare className="w-3 h-3 mr-1" />
            Contact
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            <BookOpen className="w-3 h-3 mr-1" />
            Playbook
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Onboarding Pipeline</h1>
          <p className="text-muted-foreground">Manage structured client onboarding process</p>
        </div>
        <Dialog open={isAddClientOpen} onOpenChange={setIsAddClientOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add New Client
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Client to Pipeline</DialogTitle>
              <DialogDescription>
                Add a new client to the onboarding pipeline
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Client Name</Label>
                <Input
                  id="name"
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  placeholder="Enter client name"
                />
              </div>
              <div>
                <Label htmlFor="plan">Plan</Label>
                <Select value={newClient.plan} onValueChange={(value) => setNewClient({ ...newClient, plan: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="csm">Assigned CSM</Label>
                <Select value={newClient.csm} onValueChange={(value) => setNewClient({ ...newClient, csm: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select CSM" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mike-chen">Mike Chen</SelectItem>
                    <SelectItem value="sarah-johnson">Sarah Johnson</SelectItem>
                    <SelectItem value="david-kim">David Kim</SelectItem>
                    <SelectItem value="lisa-wang">Lisa Wang</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="expectedGoLive">Expected Go-Live Date</Label>
                <Input
                  id="expectedGoLive"
                  type="date"
                  value={newClient.expectedGoLive}
                  onChange={(e) => setNewClient({ ...newClient, expectedGoLive: e.target.value })}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleAddClient} className="flex-1">Add Client</Button>
                <Button variant="outline" onClick={() => setIsAddClientOpen(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pipeline Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {Object.entries(pipelineData).map(([key, stage]) => (
          <Card key={key}>
            <CardContent className="p-4 text-center">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${stage.color} mb-3`}>
                <span className="text-lg font-bold">{stage.clients.length}</span>
              </div>
              <h3 className="font-semibold text-sm mb-1">{stage.title}</h3>
              <p className="text-xs text-muted-foreground">{stage.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {Object.entries(pipelineData).map(([key, stage]) => (
          <div key={key} className="space-y-4">
            <div className={`p-3 rounded-lg ${stage.color}`}>
              <h3 className="font-semibold text-sm">{stage.title}</h3>
              <p className="text-xs opacity-80">{stage.clients.length} clients</p>
            </div>
            
            <div className="space-y-3">
              {stage.clients.map((client) => (
                <ClientCard key={client.id} client={client} />
              ))}
              
              {stage.clients.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                    <Plus className="w-6 h-6" />
                  </div>
                  <p className="text-sm">No clients in this stage</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common onboarding tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto p-4 flex-col">
              <BookOpen className="w-6 h-6 mb-2" />
              <span className="text-sm">View Playbooks</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col">
              <Users className="w-6 h-6 mb-2" />
              <span className="text-sm">CSM Assignment</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col">
              <Calendar className="w-6 h-6 mb-2" />
              <span className="text-sm">Schedule Training</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col">
              <TrendingUp className="w-6 h-6 mb-2" />
              <span className="text-sm">Pipeline Analytics</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingPipeline;
