import React from 'react';
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
  SelectValue
} from '@/components/ui';
import { 
  Plus, 
  Users, 
  UserPlus, 
  Shield,
  Activity,
  Mail,
  Phone
} from 'lucide-react';

const ClientUsers = ({ clientData }) => {

  // Sample users data
  const [users] = React.useState([
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@abccorp.com',
      role: 'admin',
      status: 'active',
      lastLogin: '2024-03-20 14:30',
      permissions: ['full_access', 'user_management', 'billing'],
      agentType: 'admin'
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@abccorp.com',
      role: 'user',
      status: 'active',
      lastLogin: '2024-03-19 09:15',
      permissions: ['limited_access', 'chat_support'],
      agentType: 'agent'
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike.johnson@abccorp.com',
      role: 'user',
      status: 'inactive',
      lastLogin: '2024-03-10 11:45',
      permissions: ['limited_access'],
      agentType: 'agent'
    }
  ]);

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'user': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAgentTypeColor = (type) => {
    switch (type) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'agent': return 'bg-green-100 text-green-800';
      case 'supervisor': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Users & Agents</h2>
          <p className="text-gray-600">Manage users and support agents for {clientData.name}</p>
        </div>
        <Button>
          <UserPlus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{users.length}</div>
            <p className="text-sm text-muted-foreground">Total Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {users.filter(u => u.status === 'active').length}
            </div>
            <p className="text-sm text-muted-foreground">Active Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {users.filter(u => u.role === 'admin').length}
            </div>
            <p className="text-sm text-muted-foreground">Admins</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {users.filter(u => u.agentType === 'agent').length}
            </div>
            <p className="text-sm text-muted-foreground">Support Agents</p>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>View and manage all users in this organization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold">{user.name}</h3>
                      <Badge className={getRoleColor(user.role)}>
                        {user.role}
                      </Badge>
                      <Badge className={getStatusColor(user.status)}>
                        {user.status}
                      </Badge>
                      <Badge className={getAgentTypeColor(user.agentType)}>
                        {user.agentType}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">{user.email}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Last login: {user.lastLogin}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="outline">
                    <Mail className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Activity className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Shield className="w-4 h-4" />
                  </Button>
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
          <CardDescription>Common user management tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4 flex-col">
              <UserPlus className="w-6 h-6 mb-2" />
              <span className="font-medium">Bulk Import Users</span>
              <span className="text-xs text-gray-500">Import users from CSV</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col">
              <Shield className="w-6 h-6 mb-2" />
              <span className="font-medium">Permission Templates</span>
              <span className="text-xs text-gray-500">Manage role permissions</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col">
              <Activity className="w-6 h-6 mb-2" />
              <span className="font-medium">User Analytics</span>
              <span className="text-xs text-gray-500">View usage statistics</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientUsers;
