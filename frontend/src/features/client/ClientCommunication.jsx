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
  Textarea,
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
  Label,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui';
import { 
  Plus, 
  Send, 
  Mail, 
  Phone, 
  MessageSquare,
  Calendar,
  Clock,
  User,
  FileText,
  Video,
  Edit,
  Trash2,
  Reply,
  Eye,
  Filter,
  Search,
  MoreHorizontal
} from 'lucide-react';

const ClientCommunication = ({ clientData }) => {
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('history');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  
  // Form state
  const [formData, setFormData] = useState({
    type: '',
    subject: '',
    recipient: '',
    message: '',
    priority: '',
    schedule: ''
  });

  // Sample communication data with state management
  const [communicationData, setCommunicationData] = useState({
    recentCommunications: [
      {
        id: 1,
        type: 'email',
        subject: 'Weekly Check-in: Platform Usage Review',
        from: 'Sarah Johnson (CSM)',
        to: 'John Doe (Admin)',
        date: '2024-03-20 10:30',
        status: 'sent',
        preview: 'Hi John, I wanted to follow up on our last conversation about increasing your team\'s adoption...'
      },
      {
        id: 2,
        type: 'call',
        subject: 'Technical Setup Call',
        from: 'Mike Chen (Support)',
        to: 'Jane Smith (IT Manager)',
        date: '2024-03-18 14:00',
        duration: '45 minutes',
        status: 'completed',
        notes: 'Discussed SSO integration and API configuration. Follow-up required for testing phase.'
      },
      {
        id: 3,
        type: 'meeting',
        subject: 'Quarterly Business Review',
        from: 'Sarah Johnson (CSM)',
        to: 'ABC Corporation Team',
        date: '2024-03-15 09:00',
        duration: '60 minutes',
        status: 'completed',
        notes: 'Reviewed Q1 performance, discussed expansion opportunities, scheduled next QBR for June.'
      },
      {
        id: 4,
        type: 'email',
        subject: 'Feature Update: AI Chatbot v2.0',
        from: 'Product Team',
        to: 'All Users',
        date: '2024-03-12 16:00',
        status: 'delivered',
        preview: 'We\'re excited to announce the latest updates to our AI chatbot capabilities...'
      }
    ],
    upcomingCommunications: [
      {
        id: 1,
        type: 'call',
        subject: 'Monthly Success Review',
        scheduled: '2024-03-25 10:00',
        attendees: ['Sarah Johnson', 'John Doe'],
        status: 'scheduled'
      },
      {
        id: 2,
        type: 'email',
        subject: 'Invoice Reminder',
        scheduled: '2024-03-30 09:00',
        status: 'scheduled'
      }
    ],
    templates: [
      {
        id: 1,
        name: 'Weekly Check-in',
        type: 'email',
        description: 'Weekly status update template',
        content: 'Hi [Name], I hope this email finds you well. I wanted to check in on how things are going with [Product/Service]...'
      },
      {
        id: 2,
        name: 'Support Follow-up',
        type: 'call',
        description: 'Post-support call template',
        content: 'Thank you for taking the time to speak with us today. I wanted to follow up on the support call we had...'
      },
      {
        id: 3,
        name: 'QBR Preparation',
        type: 'meeting',
        description: 'Quarterly review template',
        content: 'I\'m looking forward to our Quarterly Business Review next week. Here\'s what we\'ll be covering...'
      },
      {
        id: 4,
        name: 'Feature Announcement',
        type: 'email',
        description: 'New feature notification',
        content: 'We\'re excited to announce a new feature that we believe will significantly improve your experience...'
      }
    ]
  });

  const getTypeIcon = (type) => {
    switch (type) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'call': return <Phone className="w-4 h-4" />;
      case 'meeting': return <Video className="w-4 h-4" />;
      case 'message': return <MessageSquare className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'email': return 'bg-blue-100 text-blue-600';
      case 'call': return 'bg-green-100 text-green-600';
      case 'meeting': return 'bg-purple-100 text-purple-600';
      case 'message': return 'bg-yellow-100 text-yellow-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create new communication
    const newComm = {
      id: Date.now(),
      ...formData,
      from: 'Current User (CSM)',
      to: formData.recipient === 'admin' ? 'John Doe (Admin)' : 
          formData.recipient === 'it' ? 'Jane Smith (IT Manager)' : 'All Users',
      date: new Date().toLocaleString(),
      status: formData.schedule ? 'scheduled' : 'sent',
      preview: formData.message.substring(0, 100) + '...'
    };
    
    if (formData.schedule) {
      setCommunicationData(prev => ({
        ...prev,
        upcomingCommunications: [newComm, ...prev.upcomingCommunications]
      }));
    } else {
      setCommunicationData(prev => ({
        ...prev,
        recentCommunications: [newComm, ...prev.recentCommunications]
      }));
    }
    
    // Reset form and close dialog
    resetForm();
  };

  const handleUseTemplate = (template) => {
    setFormData(prev => ({
      ...prev,
      type: template.type,
      message: template.content
    }));
    setIsNewMessageOpen(true);
  };

  const resetForm = () => {
    setFormData({
      type: '',
      subject: '',
      recipient: '',
      message: '',
      priority: '',
      schedule: ''
    });
    setIsNewMessageOpen(false);
  };

  const deleteCommunication = (id, type) => {
    if (type === 'upcoming') {
      setCommunicationData(prev => ({
        ...prev,
        upcomingCommunications: prev.upcomingCommunications.filter(comm => comm.id !== id)
      }));
    } else {
      setCommunicationData(prev => ({
        ...prev,
        recentCommunications: prev.recentCommunications.filter(comm => comm.id !== id)
      }));
    }
  };

  const filteredCommunications = communicationData.recentCommunications.filter(comm => {
    const matchesSearch = comm.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comm.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comm.to.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || comm.status === filterStatus;
    const matchesType = filterType === 'all' || comm.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const filteredUpcoming = communicationData.upcomingCommunications.filter(comm => {
    const matchesSearch = comm.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || comm.type === filterType;
    return matchesSearch && matchesType;
  });

  const getCommunicationsByType = (type) => {
    return communicationData.recentCommunications.filter(comm => type === 'all' || comm.type === type);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Communication Center</h2>
          <p className="text-gray-600">All communication history with {clientData.name}</p>
        </div>
        <Dialog open={isNewMessageOpen} onOpenChange={setIsNewMessageOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Communication
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>New Communication</DialogTitle>
              <DialogDescription>
                Send a message or schedule a communication with {clientData.name}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 py-4">
              {/* Communication Type */}
              <div className="space-y-3">
                <Label htmlFor="commType" className="text-sm font-medium text-gray-700">
                  Communication Type *
                </Label>
                <Select value={formData.type} onValueChange={(value) => handleFormChange('type', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select communication type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">📧 Email</SelectItem>
                    <SelectItem value="call">📞 Phone Call</SelectItem>
                    <SelectItem value="meeting">🤝 Meeting</SelectItem>
                    <SelectItem value="message">💬 Internal Message</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Subject */}
              <div className="space-y-3">
                <Label htmlFor="subject" className="text-sm font-medium text-gray-700">
                  Subject *
                </Label>
                <Input 
                  id="subject" 
                  placeholder="Enter communication subject" 
                  value={formData.subject}
                  onChange={(e) => handleFormChange('subject', e.target.value)}
                  required
                  className="w-full"
                />
              </div>

              {/* Recipient */}
              <div className="space-y-3">
                <Label htmlFor="recipient" className="text-sm font-medium text-gray-700">
                  Recipient *
                </Label>
                <Select value={formData.recipient} onValueChange={(value) => handleFormChange('recipient', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select recipient" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">👤 John Doe (Admin)</SelectItem>
                    <SelectItem value="it">👨‍💻 Jane Smith (IT Manager)</SelectItem>
                    <SelectItem value="team">👥 All Users</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Message */}
              <div className="space-y-3">
                <Label htmlFor="message" className="text-sm font-medium text-gray-700">
                  Message *
                </Label>
                <Textarea 
                  id="message" 
                  placeholder="Enter your detailed message here..." 
                  rows={6} 
                  value={formData.message}
                  onChange={(e) => handleFormChange('message', e.target.value)}
                  required
                  className="resize-none w-full"
                />
              </div>

              {/* Priority & Schedule Row */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="priority" className="text-sm font-medium text-gray-700">
                    Priority
                  </Label>
                  <Select value={formData.priority} onValueChange={(value) => handleFormChange('priority', value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">🔴 High</SelectItem>
                      <SelectItem value="medium">🟡 Medium</SelectItem>
                      <SelectItem value="low">🟢 Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="schedule" className="text-sm font-medium text-gray-700">
                    Schedule (Optional)
                  </Label>
                  <Input 
                    id="schedule" 
                    type="datetime-local" 
                    value={formData.schedule}
                    onChange={(e) => handleFormChange('schedule', e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                  <Send className="w-4 h-4 mr-2" />
                  {formData.schedule ? 'Schedule Communication' : 'Send Now'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetForm} 
                  className="flex-1 border-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Enhanced Communication Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="history" className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4" />
            <span>Communication History</span>
            <Badge variant="secondary" className="ml-2">
              {communicationData.recentCommunications.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>Upcoming</span>
            <Badge variant="secondary" className="ml-2">
              {communicationData.upcomingCommunications.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Templates</span>
            <Badge variant="secondary" className="ml-2">
              {communicationData.templates.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* Communication History */}
        <TabsContent value="history" className="space-y-4 mt-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search communications..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="w-full md:w-48">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full md:w-48">
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="call">Phone Call</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Communications List */}
          <div className="space-y-4">
            {filteredCommunications.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No communications found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm || filterStatus !== 'all' || filterType !== 'all'
                      ? 'Try adjusting your search or filters'
                      : 'Get started by sending your first communication'
                    }
                  </p>
                  {!searchTerm && filterStatus === 'all' && filterType === 'all' && (
                    <Button onClick={() => setIsNewMessageOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Send First Communication
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              filteredCommunications.map((comm) => (
                <Card key={comm.id} className="hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className={`p-2 rounded-full ${getTypeColor(comm.type)}`}>
                          {getTypeIcon(comm.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold text-lg">{comm.subject}</h3>
                            <Badge className={getStatusColor(comm.status)}>
                              {comm.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 mb-2">
                            <span className="font-medium">From:</span> {comm.from} → 
                            <span className="font-medium"> To:</span> {comm.to}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {comm.date}
                            </div>
                            {comm.duration && (
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {comm.duration}
                              </div>
                            )}
                          </div>
                          {comm.preview && (
                            <p className="text-sm text-gray-700 mb-3 italic bg-gray-50 p-3 rounded-lg">
                              "{comm.preview}"
                            </p>
                          )}
                          {comm.notes && (
                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <div className="text-sm font-medium text-blue-700 mb-1">Notes:</div>
                              <div className="text-sm text-blue-600">{comm.notes}</div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" title="View Details">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" title="Reply">
                          <Reply className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" title="Edit">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          title="Delete"
                          onClick={() => deleteCommunication(comm.id, 'history')}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Upcoming Communications */}
        <TabsContent value="upcoming" className="space-y-4 mt-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search upcoming communications..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="w-full md:w-48">
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="call">Phone Call</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming List */}
          <div className="space-y-4">
            {filteredUpcoming.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming communications</h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm || filterType !== 'all'
                      ? 'Try adjusting your search or filters'
                      : 'Schedule your first communication'
                    }
                  </p>
                  {!searchTerm && filterType === 'all' && (
                    <Button onClick={() => setIsNewMessageOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Schedule Communication
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              filteredUpcoming.map((comm) => (
                <Card key={comm.id} className="hover:shadow-md transition-shadow border-l-4 border-l-yellow-500">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-full ${getTypeColor(comm.type)}`}>
                          {getTypeIcon(comm.type)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{comm.subject}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {comm.scheduled}
                            </div>
                            {comm.attendees && (
                              <div className="flex items-center">
                                <User className="w-4 h-4 mr-1" />
                                {comm.attendees.join(', ')}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-red-600 hover:text-red-700"
                          onClick={() => deleteCommunication(comm.id, 'upcoming')}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Message Templates */}
        <TabsContent value="templates" className="space-y-4 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Quick Templates</h3>
            <Badge variant="secondary">{communicationData.templates.length} templates</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {communicationData.templates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-full ${getTypeColor(template.type)}`}>
                      {getTypeIcon(template.type)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{template.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg mb-4">
                        {template.content.substring(0, 100)}...
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleUseTemplate(template)}
                        className="w-full"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Use Template
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientCommunication;
