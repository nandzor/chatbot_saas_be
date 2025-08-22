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
  Checkbox,
  Separator
} from '@/components/ui';
import { 
  Plus, 
  Send, 
  Clock, 
  Users, 
  Mail,
  MessageSquare,
  Calendar,
  Target,
  Filter,
  Eye,
  Edit,
  Trash2,
  Copy,
  BarChart3,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock3,
  Zap
} from 'lucide-react';

const ClientCommunicationCenter = () => {
  const [isCreateCampaignOpen, setIsCreateCampaignOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('campaigns');
  const [selectedSegments, setSelectedSegments] = useState([]);

  // Sample campaigns data
  const [campaigns] = useState([
    {
      id: 1,
      name: 'Feature Update: AI Chatbot v2.0',
      description: 'Announcing major improvements to our AI chatbot capabilities',
      type: 'feature-announcement',
      status: 'scheduled',
      scheduledDate: '2024-04-01 10:00',
      segments: ['enterprise', 'professional', 'active-users'],
      estimatedRecipients: 89,
      sentCount: 0,
      openRate: 0,
      clickRate: 0,
      createdAt: '2024-03-25'
    },
    {
      id: 2,
      name: 'Maintenance Notice: System Upgrade',
      description: 'Scheduled maintenance for platform improvements',
      type: 'maintenance',
      status: 'sent',
      scheduledDate: '2024-03-20 02:00',
      segments: ['all-clients'],
      estimatedRecipients: 156,
      sentCount: 156,
      openRate: 78.2,
      clickRate: 12.5,
      createdAt: '2024-03-18'
    },
    {
      id: 3,
      name: 'Tips: Maximize Your Platform Usage',
      description: 'Best practices and tips for getting the most out of our platform',
      type: 'tips',
      status: 'draft',
      scheduledDate: null,
      segments: ['basic', 'trial'],
      estimatedRecipients: 67,
      sentCount: 0,
      openRate: 0,
      clickRate: 0,
      createdAt: '2024-03-22'
    }
  ]);

  // Sample segments data
  const [segments] = useState([
    {
      id: 'enterprise',
      name: 'Enterprise Clients',
      description: 'All clients on Enterprise plan',
      criteria: 'plan = "enterprise"',
      clientCount: 23,
      lastUpdated: '2024-03-20'
    },
    {
      id: 'professional',
      name: 'Professional Clients',
      description: 'All clients on Professional plan',
      criteria: 'plan = "professional"',
      clientCount: 45,
      lastUpdated: '2024-03-20'
    },
    {
      id: 'basic',
      name: 'Basic Plan Clients',
      description: 'All clients on Basic plan',
      criteria: 'plan = "basic"',
      clientCount: 34,
      lastUpdated: '2024-03-20'
    },
    {
      id: 'trial',
      name: 'Trial Users',
      description: 'All clients currently in trial period',
      criteria: 'status = "trial"',
      clientCount: 28,
      lastUpdated: '2024-03-20'
    },
    {
      id: 'at-risk',
      name: 'At-Risk Clients',
      description: 'Clients with health score below 50',
      criteria: 'health_score < 50',
      clientCount: 12,
      lastUpdated: '2024-03-20'
    },
    {
      id: 'high-usage',
      name: 'High Usage Clients',
      description: 'Clients using 80%+ of their quota',
      criteria: 'usage_percentage > 80',
      clientCount: 18,
      lastUpdated: '2024-03-20'
    },
    {
      id: 'inactive',
      name: 'Inactive Clients',
      description: 'Clients with no activity in 30 days',
      criteria: 'last_activity < 30 days',
      clientCount: 8,
      lastUpdated: '2024-03-20'
    }
  ]);

  // Sample templates data
  const [templates] = useState([
    {
      id: 1,
      name: 'Feature Announcement',
      subject: 'New Feature: {feature_name}',
      content: `Hi {client_name},

We're excited to announce our latest feature: {feature_name}!

{feature_description}

This feature will help you {benefit_description}.

Best regards,
Your Customer Success Team`,
      variables: ['client_name', 'feature_name', 'feature_description', 'benefit_description'],
      category: 'feature-announcement'
    },
    {
      id: 2,
      name: 'Maintenance Notice',
      subject: 'Scheduled Maintenance: {maintenance_type}',
      content: `Hi {client_name},

We wanted to let you know about scheduled maintenance on {maintenance_date}.

Maintenance Type: {maintenance_type}
Duration: {duration}
Impact: {impact_description}

We apologize for any inconvenience.

Best regards,
Your Technical Team`,
      variables: ['client_name', 'maintenance_date', 'maintenance_type', 'duration', 'impact_description'],
      category: 'maintenance'
    },
    {
      id: 3,
      name: 'Usage Tips',
      subject: 'Tips to Maximize Your {plan_name} Plan',
      content: `Hi {client_name},

Here are some tips to get the most out of your {plan_name} plan:

{tip_list}

If you have any questions, don't hesitate to reach out!

Best regards,
Your Customer Success Team`,
      variables: ['client_name', 'plan_name', 'tip_list'],
      category: 'tips'
    }
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'sending': return 'bg-yellow-100 text-yellow-800';
      case 'sent': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'feature-announcement': return <Zap className="w-4 h-4" />;
      case 'maintenance': return <AlertCircle className="w-4 h-4" />;
      case 'tips': return <Lightbulb className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const CampaignCard = ({ campaign }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                {getTypeIcon(campaign.type)}
              </div>
              <h3 className="font-semibold text-lg">{campaign.name}</h3>
              <Badge className={getStatusColor(campaign.status)}>
                {campaign.status}
              </Badge>
            </div>
            <p className="text-muted-foreground mb-3">{campaign.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline">
              <Eye className="w-4 h-4" />
            </Button>
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

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-sm font-medium text-muted-foreground">Segments</div>
            <div className="flex flex-wrap gap-1 mt-1">
              {campaign.segments.map((segment) => (
                <Badge key={segment} variant="outline" className="text-xs">
                  {segment}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">Recipients</div>
            <div className="text-lg font-bold">{campaign.estimatedRecipients}</div>
          </div>
        </div>

        {campaign.status === 'sent' && (
          <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">{campaign.sentCount}</div>
              <div className="text-xs text-muted-foreground">Sent</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{campaign.openRate}%</div>
              <div className="text-xs text-muted-foreground">Open Rate</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">{campaign.clickRate}%</div>
              <div className="text-xs text-muted-foreground">Click Rate</div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div>Created: {campaign.createdAt}</div>
          {campaign.scheduledDate && (
            <div>Scheduled: {campaign.scheduledDate}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const SegmentCard = ({ segment }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-1">{segment.name}</h3>
            <p className="text-xs text-muted-foreground mb-2">{segment.description}</p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-blue-600">{segment.clientCount}</div>
            <div className="text-xs text-muted-foreground">clients</div>
          </div>
        </div>
        
        <div className="mb-3">
          <div className="text-xs font-medium text-muted-foreground mb-1">Criteria</div>
          <code className="text-xs bg-gray-100 px-2 py-1 rounded">{segment.criteria}</code>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Updated: {segment.lastUpdated}</span>
          <div className="flex gap-1">
            <Button size="sm" variant="outline">
              <Edit className="w-3 h-3" />
            </Button>
            <Button size="sm" variant="outline">
              <Users className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Client Communication Center</h1>
          <p className="text-muted-foreground">Manage segmented mass communications to clients</p>
        </div>
        <Dialog open={isCreateCampaignOpen} onOpenChange={setIsCreateCampaignOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Create New Communication Campaign</DialogTitle>
              <DialogDescription>
                Create and schedule a new communication campaign for specific client segments
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="campaignName">Campaign Name</Label>
                  <Input id="campaignName" placeholder="Enter campaign name" />
                </div>
                <div>
                  <Label htmlFor="campaignType">Campaign Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="feature-announcement">Feature Announcement</SelectItem>
                      <SelectItem value="maintenance">Maintenance Notice</SelectItem>
                      <SelectItem value="tips">Usage Tips</SelectItem>
                      <SelectItem value="newsletter">Newsletter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="campaignDescription">Description</Label>
                <Textarea id="campaignDescription" placeholder="Describe the campaign purpose" />
              </div>

              <div>
                <Label htmlFor="campaignSubject">Email Subject</Label>
                <Input id="campaignSubject" placeholder="Enter email subject line" />
              </div>

              <div>
                <Label htmlFor="campaignContent">Email Content</Label>
                <Textarea id="campaignContent" placeholder="Enter email content" rows={8} />
              </div>

              <div>
                <Label>Target Segments</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {segments.map((segment) => (
                    <div key={segment.id} className="flex items-center space-x-2">
                      <Checkbox id={segment.id} />
                      <Label htmlFor={segment.id} className="text-sm">
                        {segment.name} ({segment.clientCount} clients)
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="scheduledDate">Schedule Date (Optional)</Label>
                  <Input id="scheduledDate" type="datetime-local" />
                </div>
                <div>
                  <Label htmlFor="template">Use Template</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button className="flex-1">Create Campaign</Button>
                <Button variant="outline" onClick={() => setIsCreateCampaignOpen(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="segments">Segments</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {campaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        </TabsContent>

        {/* Segments Tab */}
        <TabsContent value="segments" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {segments.map((segment) => (
              <SegmentCard key={segment.id} segment={segment} />
            ))}
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{template.name}</h3>
                      <Badge className="bg-blue-100 text-blue-800 mb-3">
                        {template.category}
                      </Badge>
                      <div className="mb-3">
                        <div className="text-sm font-medium text-muted-foreground mb-1">Subject</div>
                        <div className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                          {template.subject}
                        </div>
                      </div>
                      <div className="mb-3">
                        <div className="text-sm font-medium text-muted-foreground mb-1">Variables</div>
                        <div className="flex flex-wrap gap-1">
                          {template.variables.map((variable) => (
                            <Badge key={variable} variant="outline" className="text-xs">
                              {variable}
                            </Badge>
                          ))}
                        </div>
                      </div>
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
                  
                  <div className="border-t pt-4">
                    <div className="text-sm font-medium text-muted-foreground mb-2">Preview</div>
                    <div className="text-sm bg-gray-50 p-3 rounded max-h-32 overflow-y-auto">
                      {template.content}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{campaigns.length}</div>
                <p className="text-sm text-muted-foreground">Total Campaigns</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">1,234</div>
                <p className="text-sm text-muted-foreground">Total Emails Sent</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">78.5%</div>
                <p className="text-sm text-muted-foreground">Average Open Rate</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">12.3%</div>
                <p className="text-sm text-muted-foreground">Average Click Rate</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Campaign Performance</CardTitle>
              <CardDescription>Recent campaign metrics and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Campaign performance charts will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientCommunicationCenter;
