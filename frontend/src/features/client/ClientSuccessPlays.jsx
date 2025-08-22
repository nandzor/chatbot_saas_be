import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Badge,
  Button,
  Progress,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Label,
  Checkbox,
  Input,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from '@/components/ui';
import { 
  Play, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Target,
  TrendingUp,
  Users,
  Calendar,
  Plus,
  BookOpen,
  Activity,
  Zap,
  Edit
} from 'lucide-react';

const ClientSuccessPlays = ({ clientData }) => {
  const [isAddPlayOpen, setIsAddPlayOpen] = useState(false);
  const [error, setError] = useState(null);

  // Debug logging
  useEffect(() => {
    console.log('ClientSuccessPlays component mounted with clientData:', clientData);
  }, [clientData]);

  // Error boundary
  if (error) {
    return (
      <div className="p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Success Plays</h3>
        <p className="text-gray-500 mb-4">{error.message}</p>
        <Button onClick={() => setError(null)}>Try Again</Button>
      </div>
    );
  }

  try {
    // Sample success plays data
    const [successPlays] = useState([
      {
        id: 1,
        name: 'Onboarding Excellence Play',
        description: 'Comprehensive onboarding process for new Enterprise clients',
        category: 'onboarding',
        status: 'in-progress',
        progress: 75,
        steps: [
          { id: 1, title: 'Kickoff Meeting', completed: true, dueDate: '2024-03-15' },
          { id: 2, title: 'Technical Setup', completed: true, dueDate: '2024-03-18' },
          { id: 3, title: 'User Training', completed: true, dueDate: '2024-03-20' },
          { id: 4, title: 'Go-Live Support', completed: false, dueDate: '2024-03-25' },
          { id: 5, title: '30-Day Review', completed: false, dueDate: '2024-04-15' }
        ],
        assignedTo: 'Sarah Johnson',
        startDate: '2024-03-15',
        estimatedDuration: '4 weeks',
        successMetrics: ['User Adoption > 80%', 'Support Tickets < 5', 'Health Score > 85']
      },
      {
        id: 2,
        name: 'At-Risk Client Rescue',
        description: 'Strategic intervention for clients showing signs of churn',
        category: 'retention',
        status: 'completed',
        progress: 100,
        steps: [
          { id: 1, title: 'Health Score Assessment', completed: true, dueDate: '2024-03-01' },
          { id: 2, title: 'Root Cause Analysis', completed: true, dueDate: '2024-03-05' },
          { id: 3, title: 'Solution Implementation', completed: true, dueDate: '2024-03-10' },
          { id: 4, title: 'Follow-up Monitoring', completed: true, dueDate: '2024-03-15' }
        ],
        assignedTo: 'Mike Chen',
        startDate: '2024-03-01',
        estimatedDuration: '2 weeks',
        successMetrics: ['Health Score Improved', 'No Churn', 'Client Satisfaction > 4.0']
      },
      {
        id: 3,
        name: 'Feature Adoption Accelerator',
        description: 'Increase usage of advanced platform features',
        category: 'adoption',
        status: 'not-started',
        progress: 0,
        steps: [
          { id: 1, title: 'Usage Analysis', completed: false, dueDate: '2024-04-01' },
          { id: 2, title: 'Feature Training', completed: false, dueDate: '2024-04-05' },
          { id: 3, title: 'Implementation Support', completed: false, dueDate: '2024-04-10' },
          { id: 4, title: 'Success Measurement', completed: false, dueDate: '2024-04-15' }
        ],
        assignedTo: 'Lisa Wang',
        startDate: '2024-04-01',
        estimatedDuration: '2 weeks',
        successMetrics: ['Feature Usage > 60%', 'User Engagement +25%', 'Support Tickets -15%']
      }
    ]);

    const getStatusColor = (status) => {
      switch (status) {
        case 'completed': return 'bg-green-100 text-green-800';
        case 'in-progress': return 'bg-blue-100 text-blue-800';
        case 'not-started': return 'bg-gray-100 text-gray-800';
        case 'paused': return 'bg-yellow-100 text-yellow-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    const getCategoryColor = (category) => {
      switch (category) {
        case 'onboarding': return 'bg-blue-100 text-blue-800';
        case 'retention': return 'bg-red-100 text-red-800';
        case 'adoption': return 'bg-green-100 text-green-800';
        case 'upsell': return 'bg-purple-100 text-purple-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    const getProgressColor = (progress) => {
      if (progress >= 80) return 'bg-green-500';
      if (progress >= 50) return 'bg-blue-500';
      if (progress >= 25) return 'bg-yellow-500';
      return 'bg-gray-500';
    };

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Success Plays</h2>
            <p className="text-gray-600">Strategic playbooks and success initiatives for {clientData?.name || 'Client'}</p>
          </div>
          <Dialog open={isAddPlayOpen} onOpenChange={setIsAddPlayOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Success Play
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Success Play</DialogTitle>
                <DialogDescription>
                  Define a new strategic initiative for {clientData?.name || 'Client'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="playName">Play Name</Label>
                  <Input id="playName" placeholder="Enter play name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="playDescription">Description</Label>
                  <Input id="playDescription" placeholder="Describe the success play" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="playCategory">Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="onboarding">Onboarding</SelectItem>
                      <SelectItem value="retention">Retention</SelectItem>
                      <SelectItem value="adoption">Adoption</SelectItem>
                      <SelectItem value="upsell">Upsell</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="playAssignee">Assign To</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sarah">Sarah Johnson</SelectItem>
                      <SelectItem value="mike">Mike Chen</SelectItem>
                      <SelectItem value="lisa">Lisa Wang</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-3 pt-4 border-t">
                  <Button className="flex-1">Create Play</Button>
                  <Button variant="outline" onClick={() => setIsAddPlayOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{successPlays.length}</div>
              <p className="text-sm text-muted-foreground">Total Plays</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {successPlays.filter(p => p.status === 'completed').length}
              </div>
              <p className="text-sm text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {successPlays.filter(p => p.status === 'in-progress').length}
              </div>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {successPlays.filter(p => p.status === 'not-started').length}
              </div>
              <p className="text-sm text-muted-foreground">Not Started</p>
            </CardContent>
          </Card>
        </div>

        {/* Success Plays List */}
        <div className="space-y-4">
          {successPlays.map((play) => (
            <Card key={play.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-lg">{play.name}</h3>
                      <Badge className={getStatusColor(play.status)}>
                        {play.status}
                      </Badge>
                      <Badge className={getCategoryColor(play.category)}>
                        {play.category}
                      </Badge>
                    </div>
                    <p className="text-gray-600 mb-3">{play.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{play.assignedTo}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{play.startDate}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{play.estimatedDuration}</span>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Progress</span>
                        <span className="text-sm font-medium text-gray-700">{play.progress}%</span>
                      </div>
                      <Progress value={play.progress} className="h-2" />
                    </div>

                    {/* Steps */}
                    <div className="mb-4">
                      <h4 className="font-medium mb-3">Steps</h4>
                      <div className="space-y-2">
                        {play.steps.map((step) => (
                          <div key={step.id} className="flex items-center space-x-3">
                            <Checkbox 
                              checked={step.completed}
                              onChange={() => {}} // Empty handler to prevent warning
                              className="w-4 h-4"
                            />
                            <div className="flex-1">
                              <span className={`text-sm ${step.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                                {step.title}
                              </span>
                              {!step.completed && (
                                <div className="text-xs text-gray-500">Due: {step.dueDate}</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Success Metrics */}
                    <div>
                      <h4 className="font-medium mb-2">Success Metrics</h4>
                      <div className="flex flex-wrap gap-2">
                        {play.successMetrics.map((metric, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {metric}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <Button size="sm" variant="outline">
                      <BookOpen className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Activity className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common success play tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-auto p-4 flex-col">
                <BookOpen className="w-6 h-6 mb-2" />
                <span className="font-medium">Playbook Library</span>
                <span className="text-xs text-gray-500">Browse templates</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex-col">
                <TrendingUp className="w-6 h-6 mb-2" />
                <span className="font-medium">Success Metrics</span>
                <span className="text-xs text-gray-500">View KPIs</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex-col">
                <Users className="w-6 h-6 mb-2" />
                <span className="font-medium">Team Assignment</span>
                <span className="text-xs text-gray-500">Manage CSM</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex-col">
                <Zap className="w-6 h-6 mb-2" />
                <span className="font-medium">Automation</span>
                <span className="text-xs text-gray-500">Set triggers</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  } catch (err) {
    console.error('Error in ClientSuccessPlays:', err);
    setError(err);
    return (
      <div className="p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Success Plays</h3>
        <p className="text-gray-500 mb-4">{err.message}</p>
        <Button onClick={() => setError(null)}>Try Again</Button>
      </div>
    );
  }
};

export default ClientSuccessPlays;
