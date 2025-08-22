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
  Label
} from '@/components/ui';
import { 
  Plus, 
  FileText, 
  MessageSquare, 
  Phone,
  Video,
  Mail,
  Calendar,
  User,
  Edit,
  Trash2,
  Search,
  Filter,
  Eye,
  SortAsc,
  SortDesc,
  Clock,
  Tag
} from 'lucide-react';

const ClientNotes = ({ clientData }) => {
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    content: '',
    tags: '',
    followUp: ''
  });

  // Sample notes data
  const [notes, setNotes] = useState([
    {
      id: 1,
      type: 'call',
      title: 'Weekly Check-in Call',
      content: 'Discussed platform usage and upcoming feature requests. Client is very satisfied with current performance and looking forward to new AI chatbot features.',
      author: 'Sarah Johnson',
      date: '2024-03-20 14:30',
      tags: ['check-in', 'satisfaction', 'feature-request'],
      followUp: 'Schedule demo for AI chatbot v2.0'
    },
    {
      id: 2,
      type: 'email',
      title: 'Support Ticket Resolution',
      content: 'Resolved SSO integration issue. Client was experiencing login problems with their Azure AD. Provided step-by-step configuration guide.',
      author: 'Mike Chen',
      date: '2024-03-19 16:45',
      tags: ['support', 'sso', 'resolved'],
      followUp: 'Follow up in 1 week to ensure no further issues'
    },
    {
      id: 3,
      type: 'meeting',
      title: 'Quarterly Business Review',
      content: 'Q1 performance review meeting. Client achieved 95% of their usage goals. Discussed expansion opportunities and potential upsell.',
      author: 'Sarah Johnson',
      date: '2024-03-18 10:00',
      tags: ['qbr', 'performance', 'upsell'],
      followUp: 'Prepare proposal for additional user licenses'
    },
    {
      id: 4,
      type: 'call',
      title: 'Technical Implementation Support',
      content: 'Helped client set up webhook integrations for their CRM system. Provided API documentation and sample code.',
      author: 'David Kim',
      date: '2024-03-17 11:20',
      tags: ['technical', 'integration', 'api'],
      followUp: 'Send follow-up email with additional resources'
    }
  ]);

  const getTypeIcon = (type) => {
    switch (type) {
      case 'call': return <Phone className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'meeting': return <Video className="w-4 h-4" />;
      case 'note': return <FileText className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'call': return 'bg-green-100 text-green-600';
      case 'email': return 'bg-blue-100 text-blue-600';
      case 'meeting': return 'bg-purple-100 text-purple-600';
      case 'note': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
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
    
    // Create new note
    const newNote = {
      id: Date.now(),
      ...formData,
      author: 'Current User', // In real app, get from auth context
      date: new Date().toLocaleString(),
      tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
    };
    
    setNotes(prev => [newNote, ...prev]);
    
    // Reset form and close dialog
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      type: '',
      content: '',
      tags: '',
      followUp: ''
    });
    setIsAddNoteOpen(false);
  };

  const deleteNote = (noteId) => {
    setNotes(prev => prev.filter(note => note.id !== noteId));
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const sortNotes = (notesToSort) => {
    return [...notesToSort].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'author':
          aValue = a.author.toLowerCase();
          bValue = b.author.toLowerCase();
          break;
        case 'type':
          aValue = a.type.toLowerCase();
          bValue = b.type.toLowerCase();
          break;
        default:
          aValue = new Date(a.date);
          bValue = new Date(b.date);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || note.type === filterType;
    const matchesTab = activeTab === 'all' || note.type === activeTab;
    return matchesSearch && matchesType && matchesTab;
  });

  const sortedNotes = sortNotes(filteredNotes);

  const getNotesByType = (type) => {
    return notes.filter(note => type === 'all' || note.type === type);
  };

  const getAllTags = () => {
    const allTags = notes.flatMap(note => note.tags);
    return [...new Set(allTags)];
  };

  const getNotesByTag = (tag) => {
    return notes.filter(note => note.tags.includes(tag));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Notes & Communication Log</h2>
          <p className="text-gray-600">Track all interactions and notes for {clientData.name}</p>
        </div>
        <Dialog open={isAddNoteOpen} onOpenChange={setIsAddNoteOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Note
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Note</DialogTitle>
              <DialogDescription>
                Record a new interaction or note for {clientData.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="noteTitle">Title</Label>
                  <Input 
                    id="noteTitle" 
                    placeholder="Enter note title" 
                    value={formData.title}
                    onChange={(e) => handleFormChange('title', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="noteType">Type</Label>
                  <Select value={formData.type} onValueChange={(value) => handleFormChange('type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="call">Phone Call</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="note">General Note</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="noteContent">Content</Label>
                  <Textarea 
                    id="noteContent" 
                    placeholder="Enter note content" 
                    rows={4} 
                    value={formData.content}
                    onChange={(e) => handleFormChange('content', e.target.value)}
                    required
                    className="resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="noteTags">Tags (comma separated)</Label>
                  <Input 
                    id="noteTags" 
                    placeholder="e.g., support, follow-up, important" 
                    value={formData.tags}
                    onChange={(e) => handleFormChange('tags', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="noteFollowUp">Follow-up Action</Label>
                  <Input 
                    id="noteFollowUp" 
                    placeholder="What needs to be done next?" 
                    value={formData.followUp}
                    onChange={(e) => handleFormChange('followUp', e.target.value)}
                  />
                </div>
                <div className="flex gap-3 pt-4 border-t">
                  <Button type="submit" className="flex-1">
                    Save Note
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Enhanced Tabs for different note types */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'all', label: 'All Notes', count: notes.length },
            { key: 'call', label: 'Phone Calls', count: getNotesByType('call').length },
            { key: 'email', label: 'Emails', count: getNotesByType('email').length },
            { key: 'meeting', label: 'Meetings', count: getNotesByType('meeting').length },
            { key: 'note', label: 'General Notes', count: getNotesByType('note').length }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Enhanced Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search notes by title, content, author, or tags..."
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
                  <SelectItem value="call">Phone Calls</SelectItem>
                  <SelectItem value="email">Emails</SelectItem>
                  <SelectItem value="meeting">Meetings</SelectItem>
                  <SelectItem value="note">General Notes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="author">Author</SelectItem>
                  <SelectItem value="type">Type</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSortOrder}
              className="w-full md:w-auto"
            >
              {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Popular Tags */}
      {getAllTags().length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Tag className="w-4 h-4 mr-2" />
              Popular Tags
            </CardTitle>
            <CardDescription>Quick filter by common tags</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {getAllTags().slice(0, 10).map((tag) => (
                <Button
                  key={tag}
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchTerm(tag)}
                  className="text-xs"
                >
                  {tag} ({getNotesByTag(tag).length})
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes List */}
      <div className="space-y-4">
        {sortedNotes.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notes found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || filterType !== 'all' || activeTab !== 'all'
                  ? 'Try adjusting your search, filters, or tabs'
                  : 'Get started by adding your first note'
                }
              </p>
              {!searchTerm && filterType === 'all' && activeTab === 'all' && (
                <Button onClick={() => setIsAddNoteOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Note
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          sortedNotes.map((note) => (
            <Card key={note.id} className="hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className={`p-2 rounded-full ${getTypeColor(note.type)}`}>
                      {getTypeIcon(note.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-lg">{note.title}</h3>
                        <Badge variant="outline" className="capitalize">{note.type}</Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {note.author}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {note.date}
                        </div>
                      </div>
                      <div className="text-gray-700 mb-4 leading-relaxed">
                        {note.content}
                      </div>
                      {note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {note.tags.map((tag, index) => (
                            <Badge 
                              key={index} 
                              variant="outline" 
                              className="text-xs cursor-pointer hover:bg-blue-50"
                              onClick={() => setSearchTerm(tag)}
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {note.followUp && (
                        <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                          <div className="text-sm font-medium text-blue-800 mb-1">Follow-up Required:</div>
                          <div className="text-sm text-blue-700">{note.followUp}</div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" title="View Details">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" title="Edit">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      title="Delete"
                      onClick={() => deleteNote(note.id)}
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

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Communication Summary</CardTitle>
          <CardDescription>Overview of recent interactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{notes.length}</div>
              <p className="text-sm text-muted-foreground">Total Notes</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {notes.filter(n => n.type === 'call').length}
              </div>
              <p className="text-sm text-muted-foreground">Phone Calls</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {notes.filter(n => n.type === 'meeting').length}
              </div>
              <p className="text-sm text-muted-foreground">Meetings</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {notes.filter(n => n.type === 'email').length}
              </div>
              <p className="text-sm text-muted-foreground">Emails</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientNotes;
