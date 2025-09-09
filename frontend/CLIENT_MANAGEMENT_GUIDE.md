# Client Management Guide

*Comprehensive guide for the Client Management feature in Chatbot SaaS Frontend*

## 📋 Overview

The Client Management feature provides comprehensive tools for SuperAdmins to manage client organizations, monitor their health, and ensure successful onboarding and ongoing success. This feature is designed for B2B SaaS operations with enterprise-level client management capabilities.

## 🏗️ Architecture

### Feature Structure
```
src/features/client/
├── ClientOverview.jsx          # Main client dashboard
├── ClientUsers.jsx            # User and agent management
├── ClientBilling.jsx          # Billing and subscription management
├── ClientWorkflows.jsx        # Workflow and automation management
├── ClientCommunication.jsx    # Communication history and tools
├── ClientNotes.jsx            # Internal notes and documentation
└── ClientSuccessPlays.jsx     # Success playbooks and strategies
```

### Layout Structure
```
src/layouts/
└── ClientLayout.jsx           # Client-specific layout with navigation
```

### Routing Structure
```
/superadmin/clients/:clientId/
├── /                          # Client Overview (default)
├── /users                     # Users & Agents
├── /billing                   # Billing Management
├── /workflows                 # Workflow Management
├── /communication             # Communication Center
├── /notes                     # Internal Notes
└── /success-plays             # Success Playbooks
```

## 🎯 Core Features

### 1. Client Overview Dashboard

**Purpose**: Provides a comprehensive view of client health, usage metrics, and key performance indicators.

**Key Components**:
- Health Score Breakdown
- Key Timeline Events
- Usage Analysis
- Feature Adoption Status

**Implementation**:
```javascript
const ClientOverview = ({ clientData }) => {
  const [overviewData] = useState({
    healthScoreBreakdown: {
      usage: { score: 95, status: 'excellent' },
      satisfaction: { score: 88, status: 'good' },
      billing: { score: 100, status: 'excellent' },
      support: { score: 85, status: 'good' }
    },
    keyTimeline: [
      { date: '2024-01-15', event: 'Account Created', type: 'milestone' },
      { date: '2024-01-20', event: 'First Subscription Activated', type: 'milestone' },
      { date: '2024-03-10', event: 'Support Ticket Resolved', type: 'support' },
      { date: '2024-03-20', event: 'Last Admin Login', type: 'activity' }
    ],
    usageAnalysis: {
      messages: { used: 8500, limit: 10000, percentage: 85 },
      agents: { used: 18, limit: 25, percentage: 72 },
      storage: { used: 4.2, limit: 10, percentage: 42 }
    },
    featureAdoption: [
      { feature: 'AI Chatbot', adopted: true, usage: 95 },
      { feature: 'Live Chat', adopted: true, usage: 78 },
      { feature: 'Analytics', adopted: true, usage: 65 },
      { feature: 'Integrations', adopted: false, usage: 0 },
      { feature: 'API Access', adopted: true, usage: 45 }
    ]
  });

  return (
    <div className="space-y-6">
      <HealthScoreBreakdown data={overviewData.healthScoreBreakdown} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <KeyTimeline events={overviewData.keyTimeline} />
        <UsageAnalysis data={overviewData.usageAnalysis} />
      </div>
      <FeatureAdoption features={overviewData.featureAdoption} />
    </div>
  );
};
```

### 2. Client Users Management

**Purpose**: Manage users, agents, and permissions within a client organization.

**Key Features**:
- User listing with search and filtering
- Role assignment and permission management
- User activity monitoring
- Bulk operations (invite, deactivate, etc.)

**Implementation**:
```javascript
const ClientUsers = ({ clientData }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState([]);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  const handleBulkAction = async (action) => {
    try {
      await clientApi.bulkUserAction(clientData.id, selectedUsers, action);
      await fetchUsers();
      setSelectedUsers([]);
    } catch (error) {
      console.error('Bulk action failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Users & Agents</h2>
        <Button onClick={() => setShowInviteModal(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Invite User
        </Button>
      </div>

      <div className="flex space-x-4">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search users..."
        />
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
            <SelectItem value="agent">Agents</SelectItem>
            <SelectItem value="user">Users</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {selectedUsers.length > 0 && (
        <BulkActions
          selectedCount={selectedUsers.length}
          onBulkAction={handleBulkAction}
        />
      )}

      <UsersTable
        users={filteredUsers}
        selectedUsers={selectedUsers}
        onSelectionChange={setSelectedUsers}
        onUserUpdate={handleUserUpdate}
        onUserDelete={handleUserDelete}
      />
    </div>
  );
};
```

### 3. Client Billing Management

**Purpose**: Monitor and manage client billing, subscriptions, and payment information.

**Key Features**:
- Subscription overview and history
- Payment method management
- Invoice generation and tracking
- Usage-based billing monitoring
- Renewal date tracking

**Implementation**:
```javascript
const ClientBilling = ({ clientData }) => {
  const [billingData, setBillingData] = useState(null);
  const [loading, setLoading] = useState(true);

  const billingMetrics = useMemo(() => {
    if (!billingData) return null;
    
    return {
      currentMRR: billingData.subscription.monthly_revenue,
      totalRevenue: billingData.subscription.total_revenue,
      nextBillingDate: billingData.subscription.next_billing_date,
      paymentStatus: billingData.subscription.payment_status,
      usageThisMonth: billingData.usage.current_month,
      usageLimit: billingData.usage.monthly_limit,
      overageAmount: billingData.usage.overage_amount
    };
  }, [billingData]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="Current MRR"
          value={`$${billingMetrics?.currentMRR?.toLocaleString()}`}
          trend={billingMetrics?.mrrTrend}
        />
        <MetricCard
          title="Total Revenue"
          value={`$${billingMetrics?.totalRevenue?.toLocaleString()}`}
          trend={billingMetrics?.revenueTrend}
        />
        <MetricCard
          title="Next Billing"
          value={billingMetrics?.nextBillingDate}
          status={billingMetrics?.paymentStatus}
        />
        <MetricCard
          title="Usage This Month"
          value={`${billingMetrics?.usageThisMonth}/${billingMetrics?.usageLimit}`}
          percentage={billingMetrics?.usagePercentage}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SubscriptionDetails subscription={billingData?.subscription} />
        <PaymentHistory invoices={billingData?.invoices} />
      </div>

      <UsageBreakdown usage={billingData?.usage} />
    </div>
  );
};
```

### 4. Client Workflows Management

**Purpose**: Configure and manage automated workflows and integrations for the client.

**Key Features**:
- Workflow configuration and management
- Integration status monitoring
- Automation rule management
- Performance analytics

**Implementation**:
```javascript
const ClientWorkflows = ({ clientData }) => {
  const [workflows, setWorkflows] = useState([]);
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);

  const workflowCategories = useMemo(() => {
    return workflows.reduce((acc, workflow) => {
      if (!acc[workflow.category]) {
        acc[workflow.category] = [];
      }
      acc[workflow.category].push(workflow);
      return acc;
    }, {});
  }, [workflows]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Workflows & Integrations</h2>
        <Button onClick={() => setShowCreateWorkflow(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Workflow
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Active Workflows"
          value={workflows.filter(w => w.status === 'active').length}
          subtitle={`of ${workflows.length} total`}
        />
        <MetricCard
          title="Integrations"
          value={integrations.filter(i => i.status === 'connected').length}
          subtitle={`of ${integrations.length} configured`}
        />
        <MetricCard
          title="Success Rate"
          value={`${workflows.reduce((acc, w) => acc + w.successRate, 0) / workflows.length}%`}
          trend="up"
        />
      </div>

      <Tabs defaultValue="workflows" className="w-full">
        <TabsList>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="workflows">
          <WorkflowsList workflows={workflows} onWorkflowUpdate={handleWorkflowUpdate} />
        </TabsContent>
        
        <TabsContent value="integrations">
          <IntegrationsList integrations={integrations} onIntegrationUpdate={handleIntegrationUpdate} />
        </TabsContent>
        
        <TabsContent value="analytics">
          <WorkflowAnalytics workflows={workflows} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
```

### 5. Client Communication Center

**Purpose**: Centralized communication management and history tracking.

**Key Features**:
- Communication history timeline
- Support ticket management
- Email and chat integration
- Communication analytics

**Implementation**:
```javascript
const ClientCommunication = ({ clientData }) => {
  const [communications, setCommunications] = useState([]);
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    dateRange: '30d'
  });

  const filteredCommunications = useMemo(() => {
    return communications.filter(comm => {
      const matchesType = filters.type === 'all' || comm.type === filters.type;
      const matchesStatus = filters.status === 'all' || comm.status === filters.status;
      const matchesDate = isWithinDateRange(comm.date, filters.dateRange);
      return matchesType && matchesStatus && matchesDate;
    });
  }, [communications, filters]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Communication Center</h2>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setShowNewTicket(true)}>
            <MessageSquare className="w-4 h-4 mr-2" />
            New Ticket
          </Button>
          <Button variant="outline" onClick={() => setShowEmailModal(true)}>
            <Mail className="w-4 h-4 mr-2" />
            Send Email
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <FilterSelect
          label="Type"
          value={filters.type}
          onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
          options={[
            { value: 'all', label: 'All Types' },
            { value: 'email', label: 'Email' },
            { value: 'ticket', label: 'Support Ticket' },
            { value: 'call', label: 'Phone Call' },
            { value: 'meeting', label: 'Meeting' }
          ]}
        />
        <FilterSelect
          label="Status"
          value={filters.status}
          onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
          options={[
            { value: 'all', label: 'All Status' },
            { value: 'open', label: 'Open' },
            { value: 'in_progress', label: 'In Progress' },
            { value: 'resolved', label: 'Resolved' },
            { value: 'closed', label: 'Closed' }
          ]}
        />
        <FilterSelect
          label="Date Range"
          value={filters.dateRange}
          onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}
          options={[
            { value: '7d', label: 'Last 7 days' },
            { value: '30d', label: 'Last 30 days' },
            { value: '90d', label: 'Last 90 days' },
            { value: '1y', label: 'Last year' }
          ]}
        />
      </div>

      <CommunicationTimeline communications={filteredCommunications} />
    </div>
  );
};
```

### 6. Client Notes Management

**Purpose**: Internal documentation and note-taking for client management.

**Key Features**:
- Rich text note editor
- Note categorization and tagging
- Search and filtering
- Note sharing and collaboration

**Implementation**:
```javascript
const ClientNotes = ({ clientData }) => {
  const [notes, setNotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showEditor, setShowEditor] = useState(false);

  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          note.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || note.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [notes, searchTerm, selectedCategory]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Internal Notes</h2>
        <Button onClick={() => setShowEditor(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Note
        </Button>
      </div>

      <div className="flex space-x-4">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search notes..."
        />
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger>
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="general">General</SelectItem>
            <SelectItem value="support">Support</SelectItem>
            <SelectItem value="billing">Billing</SelectItem>
            <SelectItem value="technical">Technical</SelectItem>
            <SelectItem value="strategy">Strategy</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNotes.map(note => (
          <NoteCard
            key={note.id}
            note={note}
            onEdit={handleEditNote}
            onDelete={handleDeleteNote}
          />
        ))}
      </div>

      {showEditor && (
        <NoteEditor
          onSave={handleSaveNote}
          onCancel={() => setShowEditor(false)}
        />
      )}
    </div>
  );
};
```

### 7. Client Success Plays

**Purpose**: Manage success playbooks and strategies for client growth.

**Key Features**:
- Playbook templates and customization
- Success metrics tracking
- Automated play execution
- Performance analytics

**Implementation**:
```javascript
const ClientSuccessPlays = ({ clientData }) => {
  const [playbooks, setPlaybooks] = useState([]);
  const [activePlays, setActivePlays] = useState([]);
  const [metrics, setMetrics] = useState(null);

  const playbookCategories = useMemo(() => {
    return playbooks.reduce((acc, playbook) => {
      if (!acc[playbook.category]) {
        acc[playbook.category] = [];
      }
      acc[playbook.category].push(playbook);
      return acc;
    }, {});
  }, [playbooks]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Success Plays</h2>
        <Button onClick={() => setShowCreatePlaybook(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Playbook
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="Active Plays"
          value={activePlays.length}
          subtitle="Currently running"
        />
        <MetricCard
          title="Success Rate"
          value={`${metrics?.successRate || 0}%`}
          trend={metrics?.successTrend}
        />
        <MetricCard
          title="Avg. Completion"
          value={`${metrics?.avgCompletionTime || 0} days`}
          subtitle="Time to complete"
        />
        <MetricCard
          title="ROI Impact"
          value={`+${metrics?.roiImpact || 0}%`}
          trend="up"
        />
      </div>

      <Tabs defaultValue="playbooks" className="w-full">
        <TabsList>
          <TabsTrigger value="playbooks">Playbooks</TabsTrigger>
          <TabsTrigger value="active">Active Plays</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="playbooks">
          <PlaybooksList playbooks={playbooks} onPlaybookRun={handlePlaybookRun} />
        </TabsContent>
        
        <TabsContent value="active">
          <ActivePlaysList plays={activePlays} onPlayUpdate={handlePlayUpdate} />
        </TabsContent>
        
        <TabsContent value="templates">
          <PlaybookTemplates onTemplateSelect={handleTemplateSelect} />
        </TabsContent>
        
        <TabsContent value="analytics">
          <SuccessAnalytics metrics={metrics} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
```

## 🔧 Technical Implementation

### Custom Hooks

**useClientManagement Hook**:
```javascript
const useClientManagement = (clientId) => {
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchClient = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await clientApi.getClient(clientId);
      setClient(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  const updateClient = useCallback(async (updateData) => {
    try {
      const updatedClient = await clientApi.updateClient(clientId, updateData);
      setClient(updatedClient);
      return updatedClient;
    } catch (err) {
      setError(err);
      throw err;
    }
  }, [clientId]);

  useEffect(() => {
    fetchClient();
  }, [fetchClient]);

  return {
    client,
    loading,
    error,
    refetch: fetchClient,
    updateClient
  };
};
```

### API Integration

**Client API Service**:
```javascript
class ClientApiService {
  async getClient(clientId) {
    const response = await api.get(`/clients/${clientId}`);
    return response.data;
  }

  async getClientUsers(clientId, params = {}) {
    const response = await api.get(`/clients/${clientId}/users`, { params });
    return response.data;
  }

  async getClientBilling(clientId) {
    const response = await api.get(`/clients/${clientId}/billing`);
    return response.data;
  }

  async getClientWorkflows(clientId) {
    const response = await api.get(`/clients/${clientId}/workflows`);
    return response.data;
  }

  async getClientCommunications(clientId, params = {}) {
    const response = await api.get(`/clients/${clientId}/communications`, { params });
    return response.data;
  }

  async getClientNotes(clientId) {
    const response = await api.get(`/clients/${clientId}/notes`);
    return response.data;
  }

  async getClientSuccessPlays(clientId) {
    const response = await api.get(`/clients/${clientId}/success-plays`);
    return response.data;
  }

  async updateClient(clientId, data) {
    const response = await api.put(`/clients/${clientId}`, data);
    return response.data;
  }

  async bulkUserAction(clientId, userIds, action) {
    const response = await api.post(`/clients/${clientId}/users/bulk-action`, {
      user_ids: userIds,
      action
    });
    return response.data;
  }
}
```

## 🎨 UI Components

### Client Layout Component

```javascript
const ClientLayout = () => {
  const { clientId } = useParams();
  const location = useLocation();
  
  const [clientData] = useState({
    id: clientId,
    name: 'ABC Corporation',
    plan: 'Enterprise',
    status: 'active',
    healthScore: 92,
    mrr: 2500000,
    renewalDate: '2024-12-15',
    csm: 'Sarah Johnson'
  });

  const clientNavigation = [
    { name: 'Overview', href: `/superadmin/clients/${clientId}`, icon: BarChart3, end: true },
    { name: 'Users & Agents', href: `/superadmin/clients/${clientId}/users`, icon: Users },
    { name: 'Billing', href: `/superadmin/clients/${clientId}/billing`, icon: CreditCard },
    { name: 'Workflows', href: `/superadmin/clients/${clientId}/workflows`, icon: Settings },
    { name: 'Communication', href: `/superadmin/clients/${clientId}/communication`, icon: MessageSquare },
    { name: 'Notes', href: `/superadmin/clients/${clientId}/notes`, icon: BookOpen },
    { name: 'Success Plays', href: `/superadmin/clients/${clientId}/success-plays`, icon: Activity }
  ];

  return (
    <div className="space-y-6">
      <ClientHeader clientData={clientData} />
      <ClientNavigation navigation={clientNavigation} />
      <ClientContent location={location} clientData={clientData} />
    </div>
  );
};
```

## 📊 Data Flow

### State Management

1. **Client Data**: Fetched from API and stored in component state
2. **Navigation State**: Managed by React Router
3. **UI State**: Local component state for modals, filters, etc.
4. **Global State**: Auth context for user permissions

### Data Flow Diagram

```
API Request → Custom Hook → Component State → UI Rendering
     ↓              ↓              ↓
Error Handling → Loading States → User Feedback
```

## 🧪 Testing Strategy

### Component Testing

```javascript
describe('ClientOverview', () => {
  const mockClientData = {
    id: 1,
    name: 'Test Client',
    plan: 'Enterprise',
    status: 'active',
    healthScore: 92
  };

  it('renders client health score correctly', () => {
    render(<ClientOverview clientData={mockClientData} />);
    expect(screen.getByText('92')).toBeInTheDocument();
  });

  it('displays usage analysis', () => {
    render(<ClientOverview clientData={mockClientData} />);
    expect(screen.getByText('Usage Analysis')).toBeInTheDocument();
  });
});
```

### Hook Testing

```javascript
describe('useClientManagement', () => {
  it('fetches client data on mount', async () => {
    const mockClient = { id: 1, name: 'Test Client' };
    jest.spyOn(clientApi, 'getClient').mockResolvedValue(mockClient);
    
    const { result } = renderHook(() => useClientManagement(1));
    
    expect(result.current.loading).toBe(true);
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });
    
    expect(result.current.loading).toBe(false);
    expect(result.current.client).toEqual(mockClient);
  });
});
```

## 🚀 Performance Optimization

### Code Splitting

```javascript
// Lazy load client components
const ClientOverview = lazy(() => import('@/features/client/ClientOverview'));
const ClientUsers = lazy(() => import('@/features/client/ClientUsers'));
const ClientBilling = lazy(() => import('@/features/client/ClientBilling'));
```

### Memoization

```javascript
const ClientCard = memo(({ client, onUpdate }) => {
  const handleUpdate = useCallback((data) => {
    onUpdate(client.id, data);
  }, [client.id, onUpdate]);

  return (
    <Card>
      <ClientInfo client={client} />
      <ClientActions onUpdate={handleUpdate} />
    </Card>
  );
});
```

## 📱 Responsive Design

### Mobile-First Approach

```javascript
const ClientGrid = ({ children }) => (
  <div className="
    grid grid-cols-1
    sm:grid-cols-2
    md:grid-cols-3
    lg:grid-cols-4
    gap-4
  ">
    {children}
  </div>
);
```

### Touch-Friendly Interactions

```javascript
const TouchButton = ({ children, ...props }) => (
  <button
    className="
      min-h-[44px] min-w-[44px]
      active:scale-95 transition-transform
      focus:outline-none focus:ring-2
    "
    {...props}
  >
    {children}
  </button>
);
```

## 🔒 Security Considerations

### Permission Checking

```javascript
const ClientManagement = () => {
  const { hasPermission } = usePermissionCheck();
  
  if (!hasPermission('manage_clients')) {
    return <UnauthorizedPage />;
  }
  
  return <ClientLayout />;
};
```

### Data Validation

```javascript
const validateClientData = (data) => {
  const errors = {};
  
  if (!data.name || data.name.trim().length === 0) {
    errors.name = 'Client name is required';
  }
  
  if (!data.email || !isValidEmail(data.email)) {
    errors.email = 'Valid email is required';
  }
  
  return errors;
};
```

---

*This guide provides comprehensive documentation for implementing and maintaining the Client Management feature in the Chatbot SaaS frontend.*
