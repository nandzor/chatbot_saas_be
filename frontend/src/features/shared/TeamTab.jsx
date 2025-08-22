import React, { useState } from 'react';
import UserAvatar from '@/components/common/UserAvatar';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Button,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Label,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  Switch
} from '@/components/ui';
import { 
  Users,
  Plus,
  Edit,
  Trash2,
  Bot,
  Save,
  X,
  Mail,
  UserPlus,
  AlertTriangle,
  Shield,
  Eye,
  Settings,
  Info
} from 'lucide-react';

const TeamTab = ({ 
  editingAgent, 
  setEditingAgent, 
  updateAgentPersonality 
}) => {
  const [teamTab, setTeamTab] = useState('users');
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showEditUserDialog, setShowEditUserDialog] = useState(false);
  const [showDeleteUserDialog, setShowDeleteUserDialog] = useState(false);
  const [showAddAgentDialog, setShowAddAgentDialog] = useState(false);
  const [showEditAgentDialog, setShowEditAgentDialog] = useState(false);
  const [showDeleteAgentDialog, setShowDeleteAgentDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [editingAgentUser, setEditingAgentUser] = useState(null);
  const [deletingAgentUser, setDeletingAgentUser] = useState(null);
  const [inviteFormData, setInviteFormData] = useState({
    name: '',
    email: '',
    role: 'agent',
    sendInvite: true,
    message: ''
  });
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    role: '',
    isActive: true
  });
  const [agentFormData, setAgentFormData] = useState({
    name: '',
    email: '',
    specialization: '',
    maxConcurrentChats: 5,
    botPersonalityId: 1,
    isActive: true,
    autoAssign: true
  });

  // Sample data untuk Users
  const [users, setUsers] = useState([
    { id: 1, name: 'Ahmad Rahman', email: 'ahmad.rahman@company.com', role: 'Admin', status: 'online', lastSeen: 'Sekarang', isActive: true, joinedDate: '2024-01-15' },
    { id: 2, name: 'Sari Dewi', email: 'sari.dewi@company.com', role: 'Agent', status: 'busy', lastSeen: '5 menit lalu', isActive: true, joinedDate: '2024-02-20' },
    { id: 3, name: 'Budi Santoso', email: 'budi.santoso@company.com', role: 'Agent', status: 'offline', lastSeen: '2 jam lalu', isActive: true, joinedDate: '2024-03-01' },
  ]);

  // Sample data untuk Agents
  const [agents, setAgents] = useState([
    { id: 1, name: 'Sari Dewi', email: 'sari@company.com', specialization: 'Customer Support', status: 'online', activeSessions: 3, totalSessions: 127, avgResponseTime: '2m 30s', personalityName: 'Ramah & Profesional', botPersonalityId: 1, maxConcurrentChats: 5, isActive: true, joinedDate: '2024-02-20' },
    { id: 2, name: 'Budi Santoso', email: 'budi@company.com', specialization: 'Technical Support', status: 'busy', activeSessions: 1, totalSessions: 89, avgResponseTime: '4m 15s', personalityName: 'Casual & Friendly', botPersonalityId: 2, maxConcurrentChats: 3, isActive: true, joinedDate: '2024-03-01' },
    { id: 3, name: 'Rina Sari', email: 'rina@company.com', specialization: 'Sales', status: 'offline', activeSessions: 0, totalSessions: 156, avgResponseTime: '1m 45s', personalityName: 'Ramah & Profesional', botPersonalityId: 1, maxConcurrentChats: 4, isActive: true, joinedDate: '2024-01-15' },
  ]);

  // Sample data untuk Bot Personalities (untuk modal)
  const botPersonalities = [
    { 
      id: 1, 
      name: 'Ramah & Profesional', 
      language: 'ID', 
      tone: 'Formal', 
      greetingMessage: 'Halo! Selamat datang di layanan kami. Ada yang bisa saya bantu?', 
      errorMessage: 'Maaf, saya tidak memahami permintaan Anda. Bisakah Anda menjelaskan lebih detail?' 
    },
    { 
      id: 2, 
      name: 'Casual & Friendly', 
      language: 'ID', 
      tone: 'Informal', 
      greetingMessage: 'Hai! Gimana kabarnya? Ada yang bisa dibantu?', 
      errorMessage: 'Waduh, saya kurang paham nih. Coba dijelasin lagi dong!' 
    },
  ];

  const handleInviteInputChange = (field, value) => {
    setInviteFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEditInputChange = (field, value) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAgentInputChange = (field, value) => {
    setAgentFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetInviteForm = () => {
    setInviteFormData({
      name: '',
      email: '',
      role: 'agent',
      sendInvite: true,
      message: ''
    });
  };

  const resetEditForm = () => {
    setEditFormData({
      name: '',
      email: '',
      role: '',
      isActive: true
    });
  };

  const resetAgentForm = () => {
    setAgentFormData({
      name: '',
      email: '',
      specialization: '',
      maxConcurrentChats: 5,
      botPersonalityId: 1,
      isActive: true,
      autoAssign: true
    });
  };

  const handleInviteUser = () => {
    resetInviteForm();
    setShowInviteDialog(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setEditFormData({
      name: user.name,
      email: user.email,
      role: user.role.toLowerCase(),
      isActive: user.isActive
    });
    setShowEditUserDialog(true);
  };

  const handleDeleteUser = (user) => {
    setDeletingUser(user);
    setShowDeleteUserDialog(true);
  };

  const handleAddAgent = () => {
    resetAgentForm();
    setShowAddAgentDialog(true);
  };

  const handleEditAgentUser = (agent) => {
    setEditingAgentUser(agent);
    setAgentFormData({
      name: agent.name,
      email: agent.email,
      specialization: agent.specialization,
      maxConcurrentChats: agent.maxConcurrentChats,
      botPersonalityId: agent.botPersonalityId,
      isActive: agent.isActive,
      autoAssign: true
    });
    setShowEditAgentDialog(true);
  };

  const handleDeleteAgentUser = (agent) => {
    setDeletingAgentUser(agent);
    setShowDeleteAgentDialog(true);
  };

  const handleSubmitInvite = (e) => {
    e.preventDefault();
    const newUser = {
      id: Date.now(),
      name: inviteFormData.name,
      email: inviteFormData.email,
      role: inviteFormData.role.charAt(0).toUpperCase() + inviteFormData.role.slice(1),
      status: 'offline',
      lastSeen: 'Never',
      isActive: true,
      joinedDate: new Date().toISOString().split('T')[0]
    };
    setUsers(prev => [...prev, newUser]);
    setShowInviteDialog(false);
    resetInviteForm();
  };

  const handleSubmitEditUser = (e) => {
    e.preventDefault();
    setUsers(prev => prev.map(user => 
      user.id === editingUser.id 
        ? {
            ...user,
            name: editFormData.name,
            email: editFormData.email,
            role: editFormData.role.charAt(0).toUpperCase() + editFormData.role.slice(1),
            isActive: editFormData.isActive
          }
        : user
    ));
    setShowEditUserDialog(false);
    setEditingUser(null);
    resetEditForm();
  };

  const handleConfirmDeleteUser = () => {
    setUsers(prev => prev.filter(user => user.id !== deletingUser.id));
    setShowDeleteUserDialog(false);
    setDeletingUser(null);
  };

  const handleSubmitAddAgent = (e) => {
    e.preventDefault();
    const selectedPersonality = botPersonalities.find(p => p.id === agentFormData.botPersonalityId);
    const newAgent = {
      id: Date.now(),
      name: agentFormData.name,
      email: agentFormData.email,
      specialization: agentFormData.specialization,
      status: 'offline',
      activeSessions: 0,
      totalSessions: 0,
      avgResponseTime: '0m 0s',
      personalityName: selectedPersonality?.name || 'Default',
      botPersonalityId: agentFormData.botPersonalityId,
      maxConcurrentChats: agentFormData.maxConcurrentChats,
      isActive: agentFormData.isActive,
      joinedDate: new Date().toISOString().split('T')[0]
    };
    setAgents(prev => [...prev, newAgent]);
    setShowAddAgentDialog(false);
    resetAgentForm();
  };

  const handleSubmitEditAgent = (e) => {
    e.preventDefault();
    const selectedPersonality = botPersonalities.find(p => p.id === agentFormData.botPersonalityId);
    setAgents(prev => prev.map(agent => 
      agent.id === editingAgentUser.id 
        ? {
            ...agent,
            name: agentFormData.name,
            email: agentFormData.email,
            specialization: agentFormData.specialization,
            maxConcurrentChats: agentFormData.maxConcurrentChats,
            personalityName: selectedPersonality?.name || 'Default',
            botPersonalityId: agentFormData.botPersonalityId,
            isActive: agentFormData.isActive
          }
        : agent
    ));
    setShowEditAgentDialog(false);
    setEditingAgentUser(null);
    resetAgentForm();
  };

  const handleConfirmDeleteAgent = () => {
    setAgents(prev => prev.filter(agent => agent.id !== deletingAgentUser.id));
    setShowDeleteAgentDialog(false);
    setDeletingAgentUser(null);
  };

  const closeDialogs = () => {
    setShowInviteDialog(false);
    setShowEditUserDialog(false);
    setShowDeleteUserDialog(false);
    setShowAddAgentDialog(false);
    setShowEditAgentDialog(false);
    setShowDeleteAgentDialog(false);
    setEditingUser(null);
    setDeletingUser(null);
    setEditingAgentUser(null);
    setDeletingAgentUser(null);
    resetInviteForm();
    resetEditForm();
    resetAgentForm();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Team Management
          </CardTitle>
          <CardDescription>Kelola users dan agents dalam organisasi</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={teamTab} onValueChange={setTeamTab}>
            <TabsList>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="agents">Agents</TabsTrigger>
            </TabsList>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Mengundang users baru dan menetapkan role (org_admin, agent, viewer)</p>
                <Button onClick={handleInviteUser}>
                  <Plus className="w-4 h-4 mr-2" />
                  Invite User
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Seen</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <UserAvatar user={user} size="default" showOnlineStatus={true} status={user.status} />
                          <div>
                            <p className="font-medium">{user.name}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            user.status === 'online' ? 'bg-green-500' : 
                            user.status === 'busy' ? 'bg-yellow-500' : 'bg-gray-400'
                          }`}></div>
                          <span className="capitalize">{user.status}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{user.lastSeen}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            title="Edit User"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            title="Delete User"
                            onClick={() => handleDeleteUser(user)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            {/* Agents Tab */}
            <TabsContent value="agents" className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Kelola profil spesifik agents, mengatur specialization dan max_concurrent_chats</p>
                <Button onClick={handleAddAgent}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Agent
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent</TableHead>
                    <TableHead>Specialization</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Active Sessions</TableHead>
                    <TableHead>Avg Response</TableHead>
                    <TableHead>Bot Personality</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agents.map((agent) => (
                    <TableRow key={agent.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            agent.status === 'online' ? 'bg-green-500' : 
                            agent.status === 'busy' ? 'bg-yellow-500' : 'bg-gray-400'
                          }`}></div>
                          <div>
                            <p className="font-medium">{agent.name}</p>
                            <p className="text-sm text-muted-foreground">{agent.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{agent.specialization}</TableCell>
                      <TableCell>
                        <Badge variant={
                          agent.status === 'online' ? 'default' : 
                          agent.status === 'busy' ? 'secondary' : 'outline'
                        }>
                          {agent.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{agent.activeSessions}</TableCell>
                      <TableCell>{agent.avgResponseTime}</TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setEditingAgent && setEditingAgent(agent)}
                        >
                          {agent.personalityName}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            title="Edit Agent"
                            onClick={() => handleEditAgentUser(agent)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            title="Delete Agent"
                            onClick={() => handleDeleteAgentUser(agent)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Edit Agent Bot Personality Modal */}
      {editingAgent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                Setup Bot Personality untuk {editingAgent.name}
              </CardTitle>
              <CardDescription>
                Pilih personality yang akan digunakan oleh agent ini dalam berinteraksi dengan pelanggan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Agent Info */}
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-3 h-3 rounded-full ${
                    editingAgent.status === 'online' ? 'bg-green-500' : 
                    editingAgent.status === 'busy' ? 'bg-yellow-500' : 'bg-gray-400'
                  }`}></div>
                  <div>
                    <h4 className="font-semibold">{editingAgent.name}</h4>
                    <p className="text-sm text-muted-foreground">{editingAgent.specialization}</p>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  <strong>Current Personality:</strong> {editingAgent.personalityName}
                </div>
              </div>

              {/* Personality Selection */}
              <div className="space-y-3">
                <Label>Pilih Bot Personality</Label>
                <div className="space-y-3">
                  {botPersonalities.map((personality) => (
                    <div 
                      key={personality.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        editingAgent.botPersonalityId === personality.id 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setEditingAgent && setEditingAgent({...editingAgent, botPersonalityId: personality.id})}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{personality.name}</h4>
                            <Badge variant="outline">{personality.language}</Badge>
                            <Badge variant="secondary">{personality.tone}</Badge>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div>
                              <strong>Greeting:</strong> 
                              <p className="text-muted-foreground mt-1">{personality.greetingMessage}</p>
                            </div>
                            <div>
                              <strong>Error Message:</strong> 
                              <p className="text-muted-foreground mt-1">{personality.errorMessage}</p>
                            </div>
                          </div>
                        </div>
                        {editingAgent.botPersonalityId === personality.id && (
                          <div className="ml-3">
                            <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-white"></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setEditingAgent && setEditingAgent(null)}
                >
                  Batal
                </Button>
                <Button 
                  onClick={() => {
                    if (updateAgentPersonality && editingAgent) {
                      updateAgentPersonality(editingAgent.id, editingAgent.botPersonalityId);
                    }
                  }}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Simpan Personality
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Invite User Dialog */}
      {showInviteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Invite New User</h2>
                <Button variant="ghost" size="sm" onClick={closeDialogs}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <form onSubmit={handleSubmitInvite} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="invite-name">Full Name *</Label>
                    <Input
                      id="invite-name"
                      placeholder="John Doe"
                      value={inviteFormData.name}
                      onChange={(e) => handleInviteInputChange('name', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="invite-email">Email Address *</Label>
                    <Input
                      id="invite-email"
                      type="email"
                      placeholder="john.doe@company.com"
                      value={inviteFormData.email}
                      onChange={(e) => handleInviteInputChange('email', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invite-role">Role *</Label>
                  <Select value={inviteFormData.role} onValueChange={(value) => handleInviteInputChange('role', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          Admin - Full access to all features
                        </div>
                      </SelectItem>
                      <SelectItem value="agent">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Agent - Handle customer chats
                        </div>
                      </SelectItem>
                      <SelectItem value="viewer">
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          Viewer - Read-only access
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invite-message">Welcome Message (Optional)</Label>
                  <Textarea
                    id="invite-message"
                    placeholder="Welcome to our team! We're excited to have you on board..."
                    value={inviteFormData.message}
                    onChange={(e) => handleInviteInputChange('message', e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Send Invitation Email</Label>
                    <p className="text-sm text-gray-600">User will receive an email with login instructions</p>
                  </div>
                  <Switch
                    checked={inviteFormData.sendInvite}
                    onCheckedChange={(checked) => handleInviteInputChange('sendInvite', checked)}
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-900">Role Permissions</p>
                      <ul className="text-blue-700 mt-2 space-y-1">
                        <li>• <strong>Admin:</strong> Full access, user management, settings</li>
                        <li>• <strong>Agent:</strong> Handle chats, view analytics, manage knowledge</li>
                        <li>• <strong>Viewer:</strong> Read-only access to dashboards and reports</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-6 border-t">
                  <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Send Invitation
                  </Button>
                  <Button type="button" variant="outline" onClick={closeDialogs} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Dialog */}
      {showEditUserDialog && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Edit User</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Editing: <span className="font-medium">{editingUser.name}</span>
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={closeDialogs}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <form onSubmit={handleSubmitEditUser} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Full Name *</Label>
                    <Input
                      id="edit-name"
                      placeholder="John Doe"
                      value={editFormData.name}
                      onChange={(e) => handleEditInputChange('name', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-email">Email Address *</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      placeholder="john.doe@company.com"
                      value={editFormData.email}
                      onChange={(e) => handleEditInputChange('email', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-role">Role *</Label>
                  <Select value={editFormData.role} onValueChange={(value) => handleEditInputChange('role', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          Admin - Full access to all features
                        </div>
                      </SelectItem>
                      <SelectItem value="agent">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Agent - Handle customer chats
                        </div>
                      </SelectItem>
                      <SelectItem value="viewer">
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          Viewer - Read-only access
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Account Status</Label>
                    <p className="text-sm text-gray-600">Enable or disable user access</p>
                  </div>
                  <Switch
                    checked={editFormData.isActive}
                    onCheckedChange={(checked) => handleEditInputChange('isActive', checked)}
                  />
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div className="text-sm">
                      <p className="font-medium text-green-900">User Information</p>
                      <p className="text-green-700">
                        Joined: {new Date(editingUser.joinedDate).toLocaleDateString('id-ID')} • 
                        Last seen: {editingUser.lastSeen}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-6 border-t">
                  <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                    <Save className="w-4 h-4 mr-2" />
                    Update User
                  </Button>
                  <Button type="button" variant="outline" onClick={closeDialogs} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Dialog */}
      {showDeleteUserDialog && deletingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Remove User</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-700 mb-3">
                  Are you sure you want to remove this user from your organization?
                </p>
                <div className="bg-gray-50 border rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <UserAvatar user={deletingUser} size="default" showOnlineStatus={false} />
                    <div>
                      <p className="font-medium text-gray-900">{deletingUser.name}</p>
                      <p className="text-sm text-gray-600">
                        {deletingUser.email} • {deletingUser.role}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-red-900">Warning</p>
                    <p className="text-red-700 mt-1">
                      Removing this user will:
                    </p>
                    <ul className="text-red-700 mt-2 space-y-1">
                      <li>• Revoke access to the organization</li>
                      <li>• Transfer active chats to other agents</li>
                      <li>• Preserve chat history for compliance</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleConfirmDeleteUser}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove User
                </Button>
                <Button
                  variant="outline"
                  onClick={closeDialogs}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Agent Dialog */}
      {showAddAgentDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Add New Agent</h2>
                <Button variant="ghost" size="sm" onClick={closeDialogs}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <form onSubmit={handleSubmitAddAgent} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="agent-name">Full Name *</Label>
                    <Input
                      id="agent-name"
                      placeholder="John Doe"
                      value={agentFormData.name}
                      onChange={(e) => handleAgentInputChange('name', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="agent-email">Email Address *</Label>
                    <Input
                      id="agent-email"
                      type="email"
                      placeholder="john.doe@company.com"
                      value={agentFormData.email}
                      onChange={(e) => handleAgentInputChange('email', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="agent-specialization">Specialization *</Label>
                  <Select value={agentFormData.specialization} onValueChange={(value) => handleAgentInputChange('specialization', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select agent specialization" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Customer Support">Customer Support</SelectItem>
                      <SelectItem value="Technical Support">Technical Support</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="Billing">Billing</SelectItem>
                      <SelectItem value="General">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="max-chats">Max Concurrent Chats</Label>
                    <Input
                      id="max-chats"
                      type="number"
                      min="1"
                      max="10"
                      value={agentFormData.maxConcurrentChats}
                      onChange={(e) => handleAgentInputChange('maxConcurrentChats', parseInt(e.target.value))}
                    />
                    <p className="text-xs text-gray-500">Maximum number of simultaneous chats</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bot-personality">Bot Personality</Label>
                    <Select value={agentFormData.botPersonalityId.toString()} onValueChange={(value) => handleAgentInputChange('botPersonalityId', parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {botPersonalities.map((personality) => (
                          <SelectItem key={personality.id} value={personality.id.toString()}>
                            <div className="flex items-center gap-2">
                              <Bot className="w-4 h-4" />
                              {personality.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Active Status</Label>
                      <p className="text-sm text-gray-600">Enable agent for chat handling</p>
                    </div>
                    <Switch
                      checked={agentFormData.isActive}
                      onCheckedChange={(checked) => handleAgentInputChange('isActive', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto Assignment</Label>
                      <p className="text-sm text-gray-600">Automatically assign new chats</p>
                    </div>
                    <Switch
                      checked={agentFormData.autoAssign}
                      onCheckedChange={(checked) => handleAgentInputChange('autoAssign', checked)}
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-900">Agent Configuration</p>
                      <p className="text-blue-700 mt-1">
                        Agents will be able to handle customer chats based on their specialization. 
                        They can switch between manual and AI-assisted modes during conversations.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-6 border-t">
                  <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Agent
                  </Button>
                  <Button type="button" variant="outline" onClick={closeDialogs} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Agent Dialog */}
      {showEditAgentDialog && editingAgentUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Edit Agent</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Editing: <span className="font-medium">{editingAgentUser.name}</span>
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={closeDialogs}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <form onSubmit={handleSubmitEditAgent} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-agent-name">Full Name *</Label>
                    <Input
                      id="edit-agent-name"
                      placeholder="John Doe"
                      value={agentFormData.name}
                      onChange={(e) => handleAgentInputChange('name', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-agent-email">Email Address *</Label>
                    <Input
                      id="edit-agent-email"
                      type="email"
                      placeholder="john.doe@company.com"
                      value={agentFormData.email}
                      onChange={(e) => handleAgentInputChange('email', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-agent-specialization">Specialization *</Label>
                  <Select value={agentFormData.specialization} onValueChange={(value) => handleAgentInputChange('specialization', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Customer Support">Customer Support</SelectItem>
                      <SelectItem value="Technical Support">Technical Support</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="Billing">Billing</SelectItem>
                      <SelectItem value="General">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-max-chats">Max Concurrent Chats</Label>
                    <Input
                      id="edit-max-chats"
                      type="number"
                      min="1"
                      max="10"
                      value={agentFormData.maxConcurrentChats}
                      onChange={(e) => handleAgentInputChange('maxConcurrentChats', parseInt(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-bot-personality">Bot Personality</Label>
                    <Select value={agentFormData.botPersonalityId.toString()} onValueChange={(value) => handleAgentInputChange('botPersonalityId', parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {botPersonalities.map((personality) => (
                          <SelectItem key={personality.id} value={personality.id.toString()}>
                            <div className="flex items-center gap-2">
                              <Bot className="w-4 h-4" />
                              {personality.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Active Status</Label>
                    <p className="text-sm text-gray-600">Enable or disable agent</p>
                  </div>
                  <Switch
                    checked={agentFormData.isActive}
                    onCheckedChange={(checked) => handleAgentInputChange('isActive', checked)}
                  />
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div className="text-sm">
                      <p className="font-medium text-green-900">Agent Performance</p>
                      <p className="text-green-700">
                        Total Sessions: {editingAgentUser.totalSessions} • 
                        Avg Response: {editingAgentUser.avgResponseTime} • 
                        Joined: {new Date(editingAgentUser.joinedDate).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-6 border-t">
                  <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                    <Save className="w-4 h-4 mr-2" />
                    Update Agent
                  </Button>
                  <Button type="button" variant="outline" onClick={closeDialogs} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Agent Confirmation Dialog */}
      {showDeleteAgentDialog && deletingAgentUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Remove Agent</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-700 mb-3">
                  Are you sure you want to remove this agent from your team?
                </p>
                <div className="bg-gray-50 border rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      deletingAgentUser.status === 'online' ? 'bg-green-500' : 
                      deletingAgentUser.status === 'busy' ? 'bg-yellow-500' : 'bg-gray-400'
                    }`}></div>
                    <div>
                      <p className="font-medium text-gray-900">{deletingAgentUser.name}</p>
                      <p className="text-sm text-gray-600">
                        {deletingAgentUser.email} • {deletingAgentUser.specialization}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-red-900">Warning</p>
                    <p className="text-red-700 mt-1">
                      Removing this agent will:
                    </p>
                    <ul className="text-red-700 mt-2 space-y-1">
                      <li>• Transfer active chats ({deletingAgentUser.activeSessions}) to other agents</li>
                      <li>• Preserve chat history and performance data</li>
                      <li>• Revoke agent access to the system</li>
                      <li>• Remove from auto-assignment rotation</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleConfirmDeleteAgent}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove Agent
                </Button>
                <Button
                  variant="outline"
                  onClick={closeDialogs}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamTab;
