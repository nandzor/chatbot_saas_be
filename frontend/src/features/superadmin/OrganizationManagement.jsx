import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Badge,
  Alert,
  AlertDescription,
  Skeleton,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Label,
  Select,
  SelectItem,
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
  Checkbox,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui';
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Building2,
  Users,
  CreditCard,
  Activity,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Settings,
  BarChart3,
  TrendingUp,
  Globe,
  Mail,
  Phone,
  MapPin,
  ExternalLink
} from 'lucide-react';
import superAdminService from '@/api/superAdminService';

const OrganizationManagement = () => {
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [filteredOrganizations, setFilteredOrganizations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [businessTypeFilter, setBusinessTypeFilter] = useState('all');
  const [selectedOrganizations, setSelectedOrganizations] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState(null);

  // Form states
  const [organizationForm, setOrganizationForm] = useState({
    name: '',
    code: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postal_code: '',
    business_type: '',
    industry: '',
    company_size: '',
    description: '',
    status: 'active',
    trial_ends_at: '',
    subscription_plan_id: ''
  });

  // Statistics
  const [statistics, setStatistics] = useState({
    totalOrganizations: 0,
    activeOrganizations: 0,
    trialOrganizations: 0,
    expiredTrialOrganizations: 0,
    newOrganizationsThisMonth: 0
  });

  // Organization details
  const [organizationDetails, setOrganizationDetails] = useState({
    users: [],
    analytics: {},
    subscription: null,
    activityLogs: []
  });

  // Load organizations data
  const loadOrganizations = async (page = 1, search = '', status = 'all', businessType = 'all') => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        per_page: pagination.itemsPerPage,
        search: search || undefined,
        status: status !== 'all' ? status : undefined,
        business_type: businessType !== 'all' ? businessType : undefined
      };

      const [orgsResult, statsResult] = await Promise.allSettled([
        superAdminService.getOrganizations(params),
        superAdminService.getOrganizationStatistics()
      ]);

      if (orgsResult.status === 'fulfilled' && orgsResult.value.success) {
        const data = orgsResult.value.data.data;
        setOrganizations(data.organizations || []);
        setFilteredOrganizations(data.organizations || []);
        setPagination({
          currentPage: data.current_page || 1,
          totalPages: data.last_page || 1,
          totalItems: data.total || 0,
          itemsPerPage: data.per_page || 10
        });
      }

      if (statsResult.status === 'fulfilled' && statsResult.value.success) {
        const stats = statsResult.value.data.data;
        setStatistics({
          totalOrganizations: stats.total_organizations || 0,
          activeOrganizations: stats.active_organizations || 0,
          trialOrganizations: stats.trial_organizations || 0,
          expiredTrialOrganizations: stats.expired_trial_organizations || 0,
          newOrganizationsThisMonth: stats.new_organizations_this_month || 0
        });
      }

    } catch (err) {
      setError('Failed to load organizations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load organization details
  const loadOrganizationDetails = async (organizationId) => {
    try {
      const [orgResult, usersResult, analyticsResult] = await Promise.allSettled([
        superAdminService.getOrganization(organizationId),
        superAdminService.getOrganizationUsers(organizationId),
        superAdminService.getOrganizationAnalytics(organizationId)
      ]);

      const details = {
        users: [],
        analytics: {},
        subscription: null,
        activityLogs: []
      };

      if (orgResult.status === 'fulfilled' && orgResult.value.success) {
        const orgData = orgResult.value.data.data;
        details.subscription = orgData.subscription;
        details.activityLogs = orgData.activity_logs || [];
      }

      if (usersResult.status === 'fulfilled' && usersResult.value.success) {
        details.users = usersResult.value.data.data.users || [];
      }

      if (analyticsResult.status === 'fulfilled' && analyticsResult.value.success) {
        details.analytics = analyticsResult.value.data.data;
      }

      setOrganizationDetails(details);
    } catch (err) {
    }
  };

  // Search and filter organizations
  const filterOrganizations = () => {
    let filtered = [...organizations];

    if (searchQuery) {
      filtered = filtered.filter(org =>
        org.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.code?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(org => org.status === statusFilter);
    }

    if (businessTypeFilter !== 'all') {
      filtered = filtered.filter(org => org.business_type === businessTypeFilter);
    }

    setFilteredOrganizations(filtered);
  };

  // Create organization
  const handleCreateOrganization = async () => {
    try {
      const result = await superAdminService.createOrganization(organizationForm);

      if (result.success) {
        setCreateDialogOpen(false);
        resetForm();
        loadOrganizations(pagination.currentPage, searchQuery, statusFilter, businessTypeFilter);
      } else {
        setError(result.error || 'Failed to create organization');
      }
    } catch (err) {
      setError('Failed to create organization. Please try again.');
    }
  };

  // Update organization
  const handleUpdateOrganization = async () => {
    try {
      const result = await superAdminService.updateOrganization(selectedOrganization.id, organizationForm);

      if (result.success) {
        setEditDialogOpen(false);
        resetForm();
        loadOrganizations(pagination.currentPage, searchQuery, statusFilter, businessTypeFilter);
      } else {
        setError(result.error || 'Failed to update organization');
      }
    } catch (err) {
      setError('Failed to update organization. Please try again.');
    }
  };

  // Delete organization
  const handleDeleteOrganization = async () => {
    try {
      const result = await superAdminService.deleteOrganization(selectedOrganization.id);

      if (result.success) {
        setDeleteDialogOpen(false);
        setSelectedOrganization(null);
        loadOrganizations(pagination.currentPage, searchQuery, statusFilter, businessTypeFilter);
      } else {
        setError(result.error || 'Failed to delete organization');
      }
    } catch (err) {
      setError('Failed to delete organization. Please try again.');
    }
  };

  // Reset form
  const resetForm = () => {
    setOrganizationForm({
      name: '',
      code: '',
      email: '',
      phone: '',
      website: '',
      address: '',
      city: '',
      state: '',
      country: '',
      postal_code: '',
      business_type: '',
      industry: '',
      company_size: '',
      description: '',
      status: 'active',
      trial_ends_at: '',
      subscription_plan_id: ''
    });
    setSelectedOrganization(null);
  };

  // Open edit dialog
  const openEditDialog = (organization) => {
    setSelectedOrganization(organization);
    setOrganizationForm({
      name: organization.name || '',
      code: organization.code || '',
      email: organization.email || '',
      phone: organization.phone || '',
      website: organization.website || '',
      address: organization.address || '',
      city: organization.city || '',
      state: organization.state || '',
      country: organization.country || '',
      postal_code: organization.postal_code || '',
      business_type: organization.business_type || '',
      industry: organization.industry || '',
      company_size: organization.company_size || '',
      description: organization.description || '',
      status: organization.status || 'active',
      trial_ends_at: organization.trial_ends_at || '',
      subscription_plan_id: organization.subscription_plan_id || ''
    });
    setEditDialogOpen(true);
  };

  // Open view dialog
  const openViewDialog = async (organization) => {
    setSelectedOrganization(organization);
    await loadOrganizationDetails(organization.id);
    setViewDialogOpen(true);
  };

  // Open delete dialog
  const openDeleteDialog = (organization) => {
    setSelectedOrganization(organization);
    setDeleteDialogOpen(true);
  };

  // Handle search
  const handleSearch = (value) => {
    setSearchQuery(value);
    filterOrganizations();
  };

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    if (filterType === 'status') {
      setStatusFilter(value);
    } else if (filterType === 'businessType') {
      setBusinessTypeFilter(value);
    }
    filterOrganizations();
  };

  // Handle select all
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedOrganizations([...filteredOrganizations]);
    } else {
      setSelectedOrganizations([]);
    }
  };

  // Handle select organization
  const handleSelectOrganization = (organization, checked) => {
    if (checked) {
      setSelectedOrganizations([...selectedOrganizations, organization]);
    } else {
      setSelectedOrganizations(selectedOrganizations.filter(o => o.id !== organization.id));
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'inactive':
        return 'secondary';
      case 'suspended':
        return 'destructive';
      case 'trial':
        return 'outline';
      default:
        return 'outline';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'inactive':
        return <XCircle className="w-4 h-4 text-gray-500" />;
      case 'suspended':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'trial':
        return <Activity className="w-4 h-4 text-blue-500" />;
      default:
        return <Circle className="w-4 h-4 text-gray-500" />;
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadOrganizations();
  }, []);

  // Filter organizations when search or filters change
  useEffect(() => {
    filterOrganizations();
  }, [searchQuery, statusFilter, businessTypeFilter, organizations]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Organization Management</h1>
          <p className="text-muted-foreground">Manage organizations, subscriptions, and user access</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Organization
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button
              variant="outline"
              size="sm"
              className="ml-4"
              onClick={() => setError(null)}
            >
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Organizations</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalOrganizations.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{statistics.activeOrganizations.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trial</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{statistics.trialOrganizations.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired Trial</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{statistics.expiredTrialOrganizations.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{statistics.newOrganizationsThisMonth.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search organizations by name, email, or code..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={(value) => handleFilterChange('status', value)} placeholder="Filter by status" className="w-full md:w-48">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="trial">Trial</SelectItem>
            </Select>
            <Select value={businessTypeFilter} onValueChange={(value) => handleFilterChange('businessType', value)} placeholder="Filter by business type" className="w-full md:w-48">
              <SelectItem value="all">All Business Types</SelectItem>
              <SelectItem value="startup">Startup</SelectItem>
              <SelectItem value="sme">SME</SelectItem>
              <SelectItem value="enterprise">Enterprise</SelectItem>
              <SelectItem value="nonprofit">Non-profit</SelectItem>
            </Select>
            <Button variant="outline" onClick={() => loadOrganizations()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Organizations Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Organizations ({filteredOrganizations.length})</CardTitle>
              <CardDescription>Manage organization accounts and settings</CardDescription>
            </div>
            {selectedOrganizations.length > 0 && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {/* Handle bulk action */}}
                >
                  Export Selected
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedOrganizations.length === filteredOrganizations.length && filteredOrganizations.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Business Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrganizations.map((organization) => (
                  <TableRow key={organization.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedOrganizations.some(o => o.id === organization.id)}
                        onCheckedChange={(checked) => handleSelectOrganization(organization, checked)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-medium">{organization.name || 'No Name'}</div>
                          <div className="text-sm text-muted-foreground">Code: {organization.code || 'N/A'}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Mail className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm">{organization.email || 'No email'}</span>
                        </div>
                        {organization.phone && (
                          <div className="flex items-center space-x-2">
                            <Phone className="w-3 h-3 text-muted-foreground" />
                            <span className="text-sm">{organization.phone}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{organization.business_type || 'Unknown'}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(organization.status)}
                        <Badge variant={getStatusBadgeVariant(organization.status)}>
                          {organization.status || 'Unknown'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {organization.created_at ? formatDate(organization.created_at) : 'Unknown'}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => openViewDialog(organization)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEditDialog(organization)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => openDeleteDialog(organization)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* View Organization Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              {selectedOrganization?.name}
            </DialogTitle>
            <DialogDescription>
              Organization details, users, and analytics
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Organization Name</Label>
                  <p className="text-sm text-muted-foreground">{selectedOrganization?.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Organization Code</Label>
                  <p className="text-sm text-muted-foreground">{selectedOrganization?.code}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm text-muted-foreground">{selectedOrganization?.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Phone</Label>
                  <p className="text-sm text-muted-foreground">{selectedOrganization?.phone || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Business Type</Label>
                  <p className="text-sm text-muted-foreground">{selectedOrganization?.business_type}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(selectedOrganization?.status)}
                    <Badge variant={getStatusBadgeVariant(selectedOrganization?.status)}>
                      {selectedOrganization?.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="users" className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-medium">Organization Users</h4>
                  <Badge variant="outline">{organizationDetails.users.length} users</Badge>
                </div>
                <div className="space-y-2">
                  {organizationDetails.users.map((user) => (
                    <div key={user.id} className="flex items-center space-x-3 p-2 border rounded">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {user.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{user.name}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </div>
                      <Badge variant="outline">{user.role}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Usage Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Total Users</span>
                        <span className="text-sm font-medium">{organizationDetails.analytics.total_users || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Active Users</span>
                        <span className="text-sm font-medium">{organizationDetails.analytics.active_users || 0}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Subscription Info</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Plan</span>
                        <span className="text-sm font-medium">{organizationDetails.subscription?.plan_name || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Status</span>
                        <Badge variant="outline">{organizationDetails.subscription?.status || 'N/A'}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="activity" className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Recent Activity</h4>
                <div className="space-y-2">
                  {organizationDetails.activityLogs.map((log, index) => (
                    <div key={index} className="flex items-start space-x-3 p-2 border rounded">
                      <Activity className="w-4 h-4 mt-1 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{log.action}</div>
                        <div className="text-xs text-muted-foreground">{log.description}</div>
                        <div className="text-xs text-muted-foreground">
                          {log.created_at ? formatDate(log.created_at) : 'Unknown time'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Organization Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Create New Organization</DialogTitle>
            <DialogDescription>
              Add a new organization to the system with appropriate settings.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Organization Name</Label>
              <Input
                id="name"
                value={organizationForm.name}
                onChange={(e) => setOrganizationForm({ ...organizationForm, name: e.target.value })}
                placeholder="Enter organization name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Organization Code</Label>
              <Input
                id="code"
                value={organizationForm.code}
                onChange={(e) => setOrganizationForm({ ...organizationForm, code: e.target.value })}
                placeholder="Enter organization code"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={organizationForm.email}
                onChange={(e) => setOrganizationForm({ ...organizationForm, email: e.target.value })}
                placeholder="Enter email address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={organizationForm.phone}
                onChange={(e) => setOrganizationForm({ ...organizationForm, phone: e.target.value })}
                placeholder="Enter phone number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="business_type">Business Type</Label>
              <Select value={organizationForm.business_type} onValueChange={(value) => setOrganizationForm({ ...organizationForm, business_type: value })} placeholder="Select business type">
                <SelectItem value="startup">Startup</SelectItem>
                <SelectItem value="sme">SME</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
                <SelectItem value="nonprofit">Non-profit</SelectItem>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={organizationForm.status} onValueChange={(value) => setOrganizationForm({ ...organizationForm, status: value })} placeholder="Select status">
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
              </Select>
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={organizationForm.description}
                onChange={(e) => setOrganizationForm({ ...organizationForm, description: e.target.value })}
                placeholder="Enter organization description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateOrganization}>
              Create Organization
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Organization Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit Organization</DialogTitle>
            <DialogDescription>
              Update organization information and settings.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Organization Name</Label>
              <Input
                id="edit-name"
                value={organizationForm.name}
                onChange={(e) => setOrganizationForm({ ...organizationForm, name: e.target.value })}
                placeholder="Enter organization name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-code">Organization Code</Label>
              <Input
                id="edit-code"
                value={organizationForm.code}
                onChange={(e) => setOrganizationForm({ ...organizationForm, code: e.target.value })}
                placeholder="Enter organization code"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={organizationForm.email}
                onChange={(e) => setOrganizationForm({ ...organizationForm, email: e.target.value })}
                placeholder="Enter email address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                value={organizationForm.phone}
                onChange={(e) => setOrganizationForm({ ...organizationForm, phone: e.target.value })}
                placeholder="Enter phone number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-business_type">Business Type</Label>
              <Select value={organizationForm.business_type} onValueChange={(value) => setOrganizationForm({ ...organizationForm, business_type: value })} placeholder="Select business type">
                <SelectItem value="startup">Startup</SelectItem>
                <SelectItem value="sme">SME</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
                <SelectItem value="nonprofit">Non-profit</SelectItem>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select value={organizationForm.status} onValueChange={(value) => setOrganizationForm({ ...organizationForm, status: value })} placeholder="Select status">
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
              </Select>
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={organizationForm.description}
                onChange={(e) => setOrganizationForm({ ...organizationForm, description: e.target.value })}
                placeholder="Enter organization description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateOrganization}>
              Update Organization
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Organization Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Organization</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this organization? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Organization: <strong>{selectedOrganization?.name}</strong> ({selectedOrganization?.email})
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteOrganization}>
              Delete Organization
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrganizationManagement;
