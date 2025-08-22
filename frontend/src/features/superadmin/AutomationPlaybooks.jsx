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
  Label,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Switch,
  Separator
} from '@/components/ui';
import { 
  Plus, 
  Settings, 
  Play, 
  Pause, 
  Trash2,
  Edit,
  Copy,
  Zap,
  BookOpen,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  MessageSquare,
  Mail,
  Phone,
  Calendar,
  TrendingUp,
  Shield,
  Lightbulb
} from 'lucide-react';

const AutomationPlaybooks = () => {
  const [isAddPlaybookOpen, setIsAddPlaybookOpen] = useState(false);
  const [isAddAutomationOpen, setIsAddAutomationOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('playbooks');

  // Sample playbooks data
  const [playbooks] = useState([
    {
      id: 1,
      name: 'Onboarding Klien Enterprise',
      description: 'Playbook lengkap untuk onboarding klien Enterprise dengan fitur advanced',
      category: 'onboarding',
      steps: [
        'Kickoff meeting dengan stakeholder',
        'Technical configuration review',
        'User training session (3 sessions)',
        'Go-live preparation',
        '30-day success review'
      ],
      estimatedDuration: '4-6 weeks',
      successRate: 95,
      isActive: true,
      lastUpdated: '2024-03-15'
    },
    {
      id: 2,
      name: 'Playbook Penyelamatan Klien Berisiko',
      description: 'Strategi untuk mengembalikan klien yang berisiko churn',
      category: 'retention',
      steps: [
        'Health score assessment',
        'Root cause analysis',
        'Custom solution development',
        'Implementation support',
        'Follow-up and monitoring'
      ],
      estimatedDuration: '2-4 weeks',
      successRate: 78,
      isActive: true,
      lastUpdated: '2024-03-10'
    },
    {
      id: 3,
      name: 'Feature Adoption Accelerator',
      description: 'Meningkatkan adopsi fitur platform untuk klien existing',
      category: 'adoption',
      steps: [
        'Usage analysis',
        'Feature recommendation',
        'Training session',
        'Implementation support',
        'Success measurement'
      ],
      estimatedDuration: '2-3 weeks',
      successRate: 82,
      isActive: true,
      lastUpdated: '2024-03-08'
    }
  ]);

  // Sample automations data
  const [automations] = useState([
    {
      id: 1,
      name: 'Auto-Rescue At-Risk Clients',
      description: 'Automatically apply rescue playbook when health score drops',
      trigger: 'Health Score &lt; 40',
      actions: [
        'Apply "Playbook Penyelamatan Klien Berisiko"',
        'Create task for assigned CSM',
        'Send notification to CSM manager',
        'Schedule health check meeting'
      ],
      isActive: true,
      lastTriggered: '2024-03-20',
      triggerCount: 3
    },
    {
      id: 2,
      name: 'Usage Quota Alert',
      description: 'Notify when client usage reaches 95% of package limit',
      trigger: 'Usage &gt;= 95% of quota',
      actions: [
        'Send email notification to client',
        'Send notification to assigned CSM',
        'Create upgrade opportunity task',
        'Schedule usage review call'
      ],
      isActive: true,
      lastTriggered: '2024-03-19',
      triggerCount: 12
    },
    {
      id: 3,
      name: 'Trial Expiration Warning',
      description: 'Alert CSM 7 days before trial expires',
      trigger: 'Trial expires in 7 days',
      actions: [
        'Create conversion task for CSM',
        'Send trial expiration email to client',
        'Schedule conversion call',
        'Apply "Trial to Paid" playbook'
      ],
      isActive: true,
      lastTriggered: '2024-03-18',
      triggerCount: 8
    }
  ]);

  const getCategoryColor = (category) => {
    switch (category) {
      case 'onboarding': return 'bg-blue-100 text-blue-800';
      case 'retention': return 'bg-red-100 text-red-800';
      case 'adoption': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSuccessRateColor = (rate) => {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 80) return 'text-blue-600';
    if (rate >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const PlaybookCard = ({ playbook }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg">{playbook.name}</h3>
              <Badge className={getCategoryColor(playbook.category)}>
                {playbook.category}
              </Badge>
            </div>
            <p className="text-muted-foreground mb-3">{playbook.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline">
              <Edit className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline">
              <Copy className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">Duration: {playbook.estimatedDuration}</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">Success Rate: <span className={getSuccessRateColor(playbook.successRate)}>{playbook.successRate}%</span></span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">Last Updated: {playbook.lastUpdated}</span>
          </div>
        </div>

        <div className="mb-4">
          <h4 className="font-medium mb-2">Steps:</h4>
          <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
            {playbook.steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Switch checked={playbook.isActive} />
            <span className="text-sm">{playbook.isActive ? 'Active' : 'Inactive'}</span>
          </div>
          <Button size="sm">
            <Play className="w-4 h-4 mr-2" />
            Execute
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const AutomationCard = ({ automation }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg">{automation.name}</h3>
              <Badge variant={automation.isActive ? 'green' : 'default'}>
                {automation.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <p className="text-muted-foreground mb-3">{automation.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline">
              <Edit className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline">
              <Pause className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-sm">Trigger</span>
            </div>
            <p className="text-sm text-blue-800">{automation.trigger}</p>
          </div>

          <div className="p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="font-medium text-sm">Actions</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-sm text-green-800">
              {automation.actions.map((action, index) => (
                <li key={index}>{action}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div>Last triggered: {automation.lastTriggered}</div>
          <div>Triggered {automation.triggerCount} times</div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Automation & Playbooks</h1>
          <p className="text-muted-foreground">Scale Customer Success operations through automation and structured playbooks</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddPlaybookOpen} onOpenChange={setIsAddPlaybookOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <BookOpen className="w-4 h-4 mr-2" />
                Add Playbook
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Playbook</DialogTitle>
                <DialogDescription>
                  Build a structured playbook for Customer Success Managers
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="playbookName">Playbook Name</Label>
                  <Input id="playbookName" placeholder="Enter playbook name" />
                </div>
                <div>
                  <Label htmlFor="playbookDescription">Description</Label>
                  <Textarea id="playbookDescription" placeholder="Describe the playbook purpose" />
                </div>
                <div>
                  <Label htmlFor="playbookCategory">Category</Label>
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
                <div>
                  <Label htmlFor="playbookSteps">Steps (one per line)</Label>
                  <Textarea id="playbookSteps" placeholder="Enter each step on a new line" rows={5} />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button className="flex-1">Create Playbook</Button>
                  <Button variant="outline" onClick={() => setIsAddPlaybookOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddAutomationOpen} onOpenChange={setIsAddAutomationOpen}>
            <DialogTrigger asChild>
              <Button>
                <Zap className="w-4 h-4 mr-2" />
                Add Automation
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Automation Rule</DialogTitle>
                <DialogDescription>
                  Set up IF-THEN automation rules for Customer Success
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="automationName">Automation Name</Label>
                  <Input id="automationName" placeholder="Enter automation name" />
                </div>
                <div>
                  <Label htmlFor="automationDescription">Description</Label>
                  <Textarea id="automationDescription" placeholder="Describe what this automation does" />
                </div>
                <div>
                  <Label htmlFor="automationTrigger">Trigger Condition (IF)</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select trigger condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="health-score-low">Health Score &lt; 40</SelectItem>
                      <SelectItem value="usage-high">Usage &gt;= 95% of quota</SelectItem>
                      <SelectItem value="trial-expiring">Trial expires in 7 days</SelectItem>
                      <SelectItem value="no-activity">No activity for 14 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="automationActions">Actions (THEN)</Label>
                  <Textarea id="automationActions" placeholder="Enter each action on a new line" rows={4} />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button className="flex-1">Create Automation</Button>
                  <Button variant="outline" onClick={() => setIsAddAutomationOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="playbooks">Playbook Builder</TabsTrigger>
          <TabsTrigger value="automation">Automation Engine</TabsTrigger>
        </TabsList>

        {/* Playbook Builder Tab */}
        <TabsContent value="playbooks" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {playbooks.map((playbook) => (
              <PlaybookCard key={playbook.id} playbook={playbook} />
            ))}
          </div>
        </TabsContent>

        {/* Automation Engine Tab */}
        <TabsContent value="automation" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {automations.map((automation) => (
              <AutomationCard key={automation.id} automation={automation} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{playbooks.length}</div>
            <p className="text-sm text-muted-foreground">Total Playbooks</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{automations.length}</div>
            <p className="text-sm text-muted-foreground">Active Automations</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">156</div>
            <p className="text-sm text-muted-foreground">Playbooks Executed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">89%</div>
            <p className="text-sm text-muted-foreground">Success Rate</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AutomationPlaybooks;
