import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui';
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  Play,
  Pause,
  LogIn,
  Key
} from 'lucide-react';
import { formatDate } from '@/utils/formatters';

const ClientManagementTable = () => {
  const [organizations, setOrganizations] = useState([]);
  const [filteredOrganizations, setFilteredOrganizations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Sample data untuk organizations
  const sampleOrganizations = [
    {
      id: 1,
      name: 'PT Teknologi Nusantara',
      org_code: 'TN001',
      email: 'admin@teknusantara.com',
      status: 'active',
      plan_id: 'enterprise',
      plan_name: 'Enterprise',
      created_at: '2024-01-15T10:30:00Z',
      agents_count: 25,
      messages_sent: 15420
    },
    {
      id: 2,
      name: 'Digital Agency Pro',
      org_code: 'DAP002',
      email: 'contact@digitalagencypro.com',
      status: 'trial',
      plan_id: 'pro',
      plan_name: 'Professional',
      created_at: '2024-02-20T14:15:00Z',
      agents_count: 8,
      messages_sent: 3240
    },
    {
      id: 3,
      name: 'StartupXYZ',
      org_code: 'SXYZ003',
      email: 'hello@startupxyz.com',
      status: 'suspended',
      plan_id: 'basic',
      plan_name: 'Basic',
      created_at: '2024-01-05T09:00:00Z',
      agents_count: 3,
      messages_sent: 890
    }
  ];

  useEffect(() => {
    setTimeout(() => {
      setOrganizations(sampleOrganizations);
      setFilteredOrganizations(sampleOrganizations);
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = organizations;

    if (searchTerm) {
      filtered = filtered.filter(org => 
        org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.org_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(org => org.status === statusFilter);
    }

    setFilteredOrganizations(filtered);
  }, [organizations, searchTerm, statusFilter]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { variant: 'green', label: 'Active' },
      trial: { variant: 'default', label: 'Trial' },
      suspended: { variant: 'red', label: 'Suspended' }
    };

    const config = statusConfig[status] || { variant: 'default', label: status };
    
    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  const getPlanBadge = (planName) => {
    const planConfig = {
      'Basic': { variant: 'blue', className: '' },
      'Professional': { variant: 'purple', className: '' },
      'Enterprise': { variant: 'green', className: '' }
    };

    const config = planConfig[planName] || { variant: 'default', className: '' };
    
    return (
      <Badge variant={config.variant} className={config.className}>
        {planName}
      </Badge>
    );
  };

  const handleStatusChange = (orgId, newStatus) => {
    setOrganizations(prev => 
      prev.map(org => 
        org.id === orgId ? { ...org, status: newStatus } : org
      )
    );
  };

  const handleLoginAsAdmin = (org) => {
    alert(`Login as admin untuk ${org.name} - Fitur ini akan mengarahkan ke dashboard admin organisasi`);
  };

  const handleForcePasswordReset = (org) => {
    alert(`Reset password telah dikirim ke ${org.email}`);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading organizations...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organizations</CardTitle>
        <CardDescription>
          Manajemen semua klien/tenant yang terdaftar di platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Search and Filter */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search organizations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="trial">Trial</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Organizations Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organization</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrganizations.map((org) => (
                <TableRow key={org.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{org.name}</div>
                      <div className="text-sm text-gray-500">
                        {org.agents_count} agents • {org.messages_sent.toLocaleString()} messages
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                      {org.org_code}
                    </code>
                  </TableCell>
                  <TableCell>{org.email}</TableCell>
                  <TableCell>{getStatusBadge(org.status)}</TableCell>
                  <TableCell>{getPlanBadge(org.plan_name)}</TableCell>
                  <TableCell>{formatDate(org.created_at, { format: 'short' })}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => window.location.href = `/superadmin/clients/${org.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          Client 360° View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleLoginAsAdmin(org)}>
                          <LogIn className="h-4 w-4 mr-2" />
                          Login as Admin
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleForcePasswordReset(org)}>
                          <Key className="h-4 w-4 mr-2" />
                          Force Password Reset
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleStatusChange(org.id, org.status === 'active' ? 'suspended' : 'active')}
                          className={org.status === 'suspended' ? 'text-green-600' : 'text-red-600'}
                        >
                          {org.status === 'suspended' ? (
                            <>
                              <Play className="h-4 w-4 mr-2" />
                              Activate
                            </>
                          ) : (
                            <>
                              <Pause className="h-4 w-4 mr-2" />
                              Suspend
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Summary */}
        <div className="mt-6 flex justify-between items-center text-sm text-gray-500">
          <span>
            Showing {filteredOrganizations.length} of {organizations.length} organizations
          </span>
          <span>
            Total Active: {organizations.filter(org => org.status === 'active').length} • 
            Total Trial: {organizations.filter(org => org.status === 'trial').length} • 
            Total Suspended: {organizations.filter(org => org.status === 'suspended').length}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientManagementTable;
