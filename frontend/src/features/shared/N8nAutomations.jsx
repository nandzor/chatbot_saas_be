/**
 * Enhanced N8N Automations Component
 * N8N Automations dengan DataTable dan enhanced components
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  useLoadingStates,
  LoadingWrapper,
  SkeletonCard
} from '@/utils/loadingStates';
import {
  handleError,
  withErrorHandling
} from '@/utils/errorHandler';
import {
  useAnnouncement,
  useFocusManagement
} from '@/utils/accessibilityUtils';
import {
  sanitizeInput,
  validateInput
} from '@/utils/securityUtils';
import {Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge, Input, Label, Textarea, Select, SelectItem, Switch, Tabs, TabsContent, TabsList, TabsTrigger, Alert, AlertDescription, DataTable, Form} from '@/components/ui';
import {
  Plus,
  Play,
  Pause,
  Edit,
  Trash,
  Copy,
  ExternalLink,
  Workflow,
  Webhook,
  Zap,
  Clock,
  Activity,
  Settings,
  TestTube,
  MoreHorizontal,
  RefreshCw,
  Download,
  Filter,
  Search,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { workflowsData } from '@/data/sampleData';

const N8nAutomations = () => {
  const { announce } = useAnnouncement();
  const { focusRef, setFocus } = useFocusManagement();
  const { setLoading, getLoadingState } = useLoadingStates();

  // State management
  const [workflows, setWorkflows] = useState([]);
  const [filteredWorkflows, setFilteredWorkflows] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [error, setError] = useState(null);

  // Dialog states
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [activeTab, setActiveTab] = useState('workflows');

  // Sample data - in production, this would come from API
  const sampleWorkflows = useMemo(() => [
    {
      id: 1,
      name: 'Welcome New Users',
      description: 'Automatically greet new users and provide onboarding',
      type: 'welcome',
      status: 'active',
      trigger: 'user_registration',
      actions: ['send_welcome_email', 'create_user_profile', 'assign_default_role'],
      lastRun: '2024-01-15T10:30:00Z',
      nextRun: '2024-01-16T10:30:00Z',
      executions: 1247,
      successRate: 98.5,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T10:30:00Z'
    },
    {
      id: 2,
      name: 'Escalate Complex Queries',
      description: 'Route complex customer queries to human agents',
      type: 'escalation',
      status: 'active',
      trigger: 'complex_query_detected',
      actions: ['assign_to_agent', 'send_notification', 'update_priority'],
      lastRun: '2024-01-15T09:15:00Z',
      nextRun: '2024-01-15T11:15:00Z',
      executions: 89,
      successRate: 94.2,
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-14T15:45:00Z'
    },
    {
      id: 3,
      name: 'Follow-up Survey',
      description: 'Send satisfaction survey after ticket resolution',
      type: 'followup',
      status: 'inactive',
      trigger: 'ticket_resolved',
      actions: ['send_survey_email', 'schedule_reminder'],
      lastRun: '2024-01-10T14:20:00Z',
      nextRun: null,
      executions: 456,
      successRate: 87.3,
      createdAt: '2024-01-03T00:00:00Z',
      updatedAt: '2024-01-10T14:20:00Z'
    }
  ], []);

  // Load workflows data
  const loadWorkflows = useCallback(async () => {
    try {
      setLoading('initial', true);
      setError(null);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setWorkflows(sampleWorkflows);
      setFilteredWorkflows(sampleWorkflows);
      announce('Workflows loaded successfully');
    } catch (err) {
      const errorResult = handleError(err, {
        context: 'Workflows Data Loading',
        showToast: true
      });
      setError(errorResult.message);
    } finally {
      setLoading('initial', false);
    }
  }, [sampleWorkflows, setLoading, announce]);

  // Filter workflows based on search and filters
  const filterWorkflows = useCallback(() => {
    let filtered = workflows;

    // Search filter
    if (searchQuery) {
      const sanitizedQuery = sanitizeInput(searchQuery.toLowerCase());
      filtered = filtered.filter(workflow =>
        workflow.name.toLowerCase().includes(sanitizedQuery) ||
        workflow.description.toLowerCase().includes(sanitizedQuery)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(workflow => workflow.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(workflow => workflow.type === typeFilter);
    }

    setFilteredWorkflows(filtered);
  }, [workflows, searchQuery, statusFilter, typeFilter]);

  // Load data on mount
  useEffect(() => {
    loadWorkflows();
  }, [loadWorkflows]);

  // Filter workflows when filters change
  useEffect(() => {
    filterWorkflows();
  }, [filterWorkflows]);

  // Handle search
  const handleSearch = useCallback((e) => {
    const value = sanitizeInput(e.target.value);
    setSearchQuery(value);
  }, []);

  // Handle status filter change
  const handleStatusFilterChange = useCallback((value) => {
    setStatusFilter(value);
    announce(`Filtering by status: ${value}`);
  }, [announce]);

  // Handle type filter change
  const handleTypeFilterChange = useCallback((value) => {
    setTypeFilter(value);
    announce(`Filtering by type: ${value}`);
  }, [announce]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    try {
      setLoading('refresh', true);
      await loadWorkflows();
      announce('Workflows refreshed successfully');
    } catch (err) {
      handleError(err, { context: 'Workflows Refresh' });
    } finally {
      setLoading('refresh', false);
    }
  }, [loadWorkflows, setLoading, announce]);

  // Handle export
  const handleExport = useCallback(async () => {
    try {
      setLoading('export', true);

      // Simulate export
      await new Promise(resolve => setTimeout(resolve, 2000));

      announce('Workflows exported successfully');
    } catch (err) {
      handleError(err, { context: 'Workflows Export' });
    } finally {
      setLoading('export', false);
    }
  }, [setLoading, announce]);

  // Handle workflow actions
  const handleToggleWorkflow = useCallback(async (workflow) => {
    try {
      setLoading('toggle', true);

      // Simulate toggle
      await new Promise(resolve => setTimeout(resolve, 500));

      setWorkflows(prev => prev.map(w =>
        w.id === workflow.id
          ? { ...w, status: w.status === 'active' ? 'inactive' : 'active' }
          : w
      ));

      announce(`Workflow ${workflow.name} ${workflow.status === 'active' ? 'paused' : 'activated'}`);
    } catch (err) {
      handleError(err, { context: 'Workflow Toggle' });
    } finally {
      setLoading('toggle', false);
    }
  }, [setLoading, announce]);

  const handleEditWorkflow = useCallback((workflow) => {
    setSelectedWorkflow(workflow);
    setIsEditing(true);
    announce(`Editing workflow: ${workflow.name}`);
  }, [announce]);

  const handleDeleteWorkflow = useCallback(async (workflow) => {
    try {
      setLoading('delete', true);

      // Simulate delete
      await new Promise(resolve => setTimeout(resolve, 1000));

      setWorkflows(prev => prev.filter(w => w.id !== workflow.id));
      announce(`Workflow ${workflow.name} deleted successfully`);
    } catch (err) {
      handleError(err, { context: 'Workflow Delete' });
    } finally {
      setLoading('delete', false);
    }
  }, [setLoading, announce]);

  const handleTestWorkflow = useCallback((workflow) => {
    setSelectedWorkflow(workflow);
    setIsTesting(true);
    announce(`Testing workflow: ${workflow.name}`);
  }, [announce]);

  const handleCopyWorkflow = useCallback((workflow) => {
    navigator.clipboard.writeText(workflow.name);
    announce(`Workflow name copied: ${workflow.name}`);
  }, [announce]);

  // DataTable columns configuration
  const columns = [
    {
      key: 'name',
      title: 'Workflow',
      sortable: true,
      render: (value, workflow) => (
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
            <Workflow className="h-4 w-4 text-purple-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">{workflow.description}</div>
          </div>
        </div>
      )
    },
    {
      key: 'type',
      title: 'Type',
      sortable: true,
      render: (value) => (
        <Badge variant="outline">
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </Badge>
      )
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      render: (value, workflow) => (
        <div className="flex items-center space-x-2">
          <Switch
            checked={value === 'active'}
            onCheckedChange={() => handleToggleWorkflow(workflow)}
            disabled={getLoadingState('toggle')}
          />
          <Badge variant={value === 'active' ? 'default' : 'secondary'}>
            {value === 'active' ? (
              <Play className="w-3 h-3 mr-1" />
            ) : (
              <Pause className="w-3 h-3 mr-1" />
            )}
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </Badge>
        </div>
      )
    },
    {
      key: 'executions',
      title: 'Executions',
      sortable: true,
      render: (value) => (
        <div className="text-sm font-medium text-gray-900">
          {value.toLocaleString()}
        </div>
      )
    },
    {
      key: 'successRate',
      title: 'Success Rate',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-green-500" />
          <span className="text-sm text-gray-900">{value}%</span>
        </div>
      )
    },
    {
      key: 'lastRun',
      title: 'Last Run',
      sortable: true,
      render: (value) => (
        <div className="text-sm text-gray-500">
          {value ? new Date(value).toLocaleDateString() : 'Never'}
        </div>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      sortable: false,
      render: (value, workflow) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleTestWorkflow(workflow)}
            aria-label="Test workflow"
          >
            <TestTube className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditWorkflow(workflow)}
            aria-label="Edit workflow"
          >
            <Edit className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleCopyWorkflow(workflow)}
            aria-label="Copy workflow"
          >
            <Copy className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteWorkflow(workflow)}
            className="text-red-600 hover:text-red-700"
            aria-label="Delete workflow"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  // Focus management on mount
  useEffect(() => {
    setFocus();
  }, [setFocus]);

  return (
    <div className="space-y-6" ref={focusRef}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">N8N Automations</h1>
          <p className="text-muted-foreground">
            Manage automated workflows and processes
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={getLoadingState('refresh')}
            aria-label="Refresh workflows"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${getLoadingState('refresh') ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            variant="outline"
            onClick={handleExport}
            disabled={getLoadingState('export')}
            aria-label="Export workflows"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>

          <Button
            onClick={() => setIsCreating(true)}
            aria-label="Create new workflow"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Workflow
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search Workflows</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or description..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={handleStatusFilterChange} placeholder="All statuses">
              <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
</Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select value={typeFilter} onValueChange={handleTypeFilterChange} placeholder="All types">
              <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="welcome">Welcome</SelectItem>
                  <SelectItem value="escalation">Escalation</SelectItem>
                  <SelectItem value="followup">Follow-up</SelectItem>
</Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workflows Table */}
      <DataTable
        data={filteredWorkflows}
        columns={columns}
        loading={getLoadingState('initial')}
        error={error}
        searchable={false} // We handle search in filters
        ariaLabel="Workflows management table"
        pagination={{
          currentPage: 1,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
          onNext: () => {},
          onPrevious: () => {}
        }}
      />

      {/* Create/Edit Workflow Dialog */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Workflow</CardTitle>
            <CardDescription>
              Set up a new automation workflow
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form
              title=""
              description=""
              fields={[
                {
                  name: 'name',
                  type: 'text',
                  label: 'Workflow Name',
                  placeholder: 'Enter workflow name',
                  required: true
                },
                {
                  name: 'description',
                  type: 'textarea',
                  label: 'Description',
                  placeholder: 'Describe what this workflow does',
                  required: true
                },
                {
                  name: 'type',
                  type: 'select',
                  label: 'Type',
                  required: true,
                  options: [
                    { value: 'welcome', label: 'Welcome' },
                    { value: 'escalation', label: 'Escalation' },
                    { value: 'followup', label: 'Follow-up' }
                  ]
                },
                {
                  name: 'trigger',
                  type: 'select',
                  label: 'Trigger',
                  required: true,
                  options: [
                    { value: 'user_registration', label: 'User Registration' },
                    { value: 'complex_query_detected', label: 'Complex Query Detected' },
                    { value: 'ticket_resolved', label: 'Ticket Resolved' }
                  ]
                }
              ]}
              validationRules={{
                name: { required: true, minLength: 3, maxLength: 50 },
                description: { required: true, minLength: 10, maxLength: 200 },
                type: { required: true },
                trigger: { required: true }
              }}
              onSubmit={async (values) => {
                try {
                  setLoading('create', true);

                  // Simulate create
                  await new Promise(resolve => setTimeout(resolve, 1000));

                  const newWorkflow = {
                    id: Date.now(),
                    ...values,
                    status: 'inactive',
                    executions: 0,
                    successRate: 0,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    lastRun: null,
                    nextRun: null,
                    actions: []
                  };

                  setWorkflows(prev => [...prev, newWorkflow]);
                  setIsCreating(false);
                  announce('Workflow created successfully');
                } catch (err) {
                  handleError(err, { context: 'Workflow Create' });
                } finally {
                  setLoading('create', false);
                }
              }}
              submitText="Create Workflow"
              showProgress={true}
              autoSave={false}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default withErrorHandling(N8nAutomations, {
  context: 'N8N Automations Component'
});
