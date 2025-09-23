/**
 * Bot Personality List Page
 * CRUD management untuk bot personalities dengan DataTable dan enhanced components
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  useLoadingStates
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
  sanitizeInput
} from '@/utils/securityUtils';
import { toast } from 'react-hot-toast';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Alert,
  AlertDescription,
  Badge,
  Select,
  SelectItem,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DataTable,
  Pagination,
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@/components/ui';
import {
  Bot,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Eye,
  Copy,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  AlertCircle,
  BotCheck,
  BotX,
  Settings,
  Download,
  RefreshCw,
  Shield,
  Clock,
  Activity,
  Monitor,
  MessageSquare,
  Database,
  Workflow,
  Star,
  StarOff
} from 'lucide-react';
import CreateBotPersonalityDialog from './CreateBotPersonalityDialog';
import EditBotPersonalityDialog from './EditBotPersonalityDialog';
import ViewBotPersonalityDetailsDialog from './ViewBotPersonalityDetailsDialog';
import BotPersonalityBulkActions from './BotPersonalityBulkActions';
import { useBotPersonalityManagement } from '@/hooks/useBotPersonalityManagement';

const BotPersonalityList = React.memo(() => {
  const { announce } = useAnnouncement();
  const { focusRef, setFocus } = useFocusManagement();
  const { setLoading, getLoadingState } = useLoadingStates();

  // Use bot personality management hook
  const {
    botPersonalities,
    loading,
    error,
    pagination,
    statistics,
    loadBotPersonalities,
    createBotPersonality,
    updateBotPersonality,
    deleteBotPersonality,
    toggleBotPersonalityStatus,
    updateFilters,
    handlePageChange,
    handlePerPageChange
  } = useBotPersonalityManagement();

  // Local UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [formalityFilter, setFormalityFilter] = useState('all');
  const [selectedPersonalities, setSelectedPersonalities] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedPersonality, setSelectedPersonality] = useState(null);

  // Bulk selection handlers
  const handleSelectionChange = useCallback((selectedItems) => {
    setSelectedPersonalities(selectedItems);
  }, []);

  const handleSelectAll = useCallback((checked) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedPersonalities(botPersonalities);
    } else {
      setSelectedPersonalities([]);
    }
  }, [botPersonalities]);

  // Handle search
  const handleSearch = useCallback((e) => {
    const value = sanitizeInput(e.target.value);
    setSearchQuery(value);
    updateFilters({ search: value });
  }, [updateFilters]);

  // Handle status filter change
  const handleStatusFilterChange = useCallback((value) => {
    setStatusFilter(value);
    updateFilters({ status: value === 'all' ? '' : value });
    announce(`Filtering by status: ${value}`);
  }, [updateFilters, announce]);

  // Handle language filter change
  const handleLanguageFilterChange = useCallback((value) => {
    setLanguageFilter(value);
    updateFilters({ language: value === 'all' ? '' : value });
    announce(`Filtering by language: ${value}`);
  }, [updateFilters, announce]);

  // Handle formality filter change
  const handleFormalityFilterChange = useCallback((value) => {
    setFormalityFilter(value);
    updateFilters({ formality_level: value === 'all' ? '' : value });
    announce(`Filtering by formality level: ${value}`);
  }, [updateFilters, announce]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    try {
      setLoading('refresh', true);
      await loadBotPersonalities();
      announce('Bot personalities refreshed successfully');
    } catch (err) {
      handleError(err, { context: 'Bot Personality Refresh' });
    } finally {
      setLoading('refresh', false);
    }
  }, [loadBotPersonalities, setLoading, announce]);

  // Handle export
  const handleExport = useCallback(async () => {
    try {
      setLoading('export', true);

      // Create CSV content
      const csvContent = [
        ['Name', 'Code', 'Language', 'Status', 'Default', 'Created At'],
        ...botPersonalities.map(personality => [
          personality.name || '',
          personality.code || '',
          personality.language || '',
          personality.status || '',
          personality.is_default ? 'Yes' : 'No',
          personality.created_at ? new Date(personality.created_at).toLocaleDateString() : ''
        ])
      ].map(row => row.join(',')).join('\n');

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bot-personalities-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      announce('Bot personalities exported successfully');
      toast.success('Bot personalities exported successfully');
    } catch (err) {
      handleError(err, { context: 'Bot Personality Export' });
    } finally {
      setLoading('export', false);
    }
  }, [setLoading, announce, botPersonalities]);

  // Handle bot personality actions
  const handleViewPersonality = useCallback((personality, e) => {
    e?.stopPropagation();
    setSelectedPersonality(personality);
    setIsViewDialogOpen(true);
    announce(`Viewing bot personality: ${personality.name}`);
  }, [announce]);

  const handleEditPersonality = useCallback((personality, e) => {
    e?.stopPropagation();
    setSelectedPersonality(personality);
    setIsEditDialogOpen(true);
    announce(`Editing bot personality: ${personality.name}`);
  }, [announce]);

  const handleDeletePersonality = useCallback(async (personality) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the bot personality "${personality.name}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setLoading('delete', true);
      await deleteBotPersonality(personality.id);
      announce(`Bot personality ${personality.name} deleted successfully`);
    } catch (err) {
      handleError(err, { context: 'Bot Personality Delete' });
    } finally {
      setLoading('delete', false);
    }
  }, [setLoading, announce, deleteBotPersonality]);

  const handleToggleStatus = useCallback(async (personality) => {
    try {
      setLoading('toggle', true);
      await toggleBotPersonalityStatus(personality.id);
      announce(`Bot personality ${personality.name} status toggled successfully`);
    } catch (err) {
      handleError(err, { context: 'Bot Personality Status Toggle' });
    } finally {
      setLoading('toggle', false);
    }
  }, [setLoading, announce, toggleBotPersonalityStatus]);

  const handleSetAsDefault = useCallback(async (personality) => {
    try {
      setLoading('default', true);
      await updateBotPersonality(personality.id, { is_default: true });
      announce(`Bot personality ${personality.name} set as default successfully`);
    } catch (err) {
      handleError(err, { context: 'Set Default Bot Personality' });
    } finally {
      setLoading('default', false);
    }
  }, [setLoading, announce, updateBotPersonality]);

  const handleCopyPersonality = useCallback((personality) => {
    navigator.clipboard.writeText(personality.code);
    announce(`Bot personality code copied: ${personality.code}`);
  }, [announce]);

  // DataTable columns configuration
  const columns = useMemo(() => [
    {
      key: 'personality',
      title: 'Bot Personality',
      sortable: true,
      render: (value, personality) => (
        <div className="flex items-center space-x-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
            style={{ backgroundColor: personality.color_scheme?.primary || '#3B82F6' }}
          >
            {personality.name?.charAt(0)?.toUpperCase() || 'B'}
          </div>
          <div>
            <div className="font-medium text-gray-900 flex items-center space-x-2">
              {personality.name}
              {personality.is_default && (
                <Badge variant="secondary" className="text-xs">
                  <Star className="w-3 h-3 mr-1" />
                  Default
                </Badge>
              )}
            </div>
            <div className="text-sm text-gray-500">{personality.code}</div>
          </div>
        </div>
      )
    },
    {
      key: 'language',
      title: 'Language',
      sortable: true,
      render: (value) => (
        <Badge variant="outline">
          {value ? value.charAt(0).toUpperCase() + value.slice(1) : 'Unknown'}
        </Badge>
      )
    },
    {
      key: 'formality_level',
      title: 'Formality',
      sortable: true,
      render: (value) => (
        <Badge variant={value === 'formal' ? 'default' : 'outline'}>
          {value ? value.charAt(0).toUpperCase() + value.slice(1) : 'Unknown'}
        </Badge>
      )
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      render: (value) => {
        const getStatusConfig = (status) => {
          switch (status) {
            case 'active':
              return { variant: 'default', icon: <CheckCircle className="w-3 h-3 mr-1" />, className: 'bg-green-100 text-green-700' };
            case 'inactive':
              return { variant: 'destructive', icon: <XCircle className="w-3 h-3 mr-1" />, className: 'bg-red-100 text-red-700' };
            default:
              return { variant: 'secondary', icon: <XCircle className="w-3 h-3 mr-1" />, className: 'bg-gray-100 text-gray-700' };
          }
        };

        const config = getStatusConfig(value);
        return (
          <Badge variant={config.variant} className={config.className}>
            {config.icon}
            {value ? value.charAt(0).toUpperCase() + value.slice(1) : 'Unknown'}
          </Badge>
        );
      }
    },
    {
      key: 'integrations',
      title: 'Integrations',
      sortable: false,
      render: (value, personality) => (
        <div className="flex items-center space-x-2">
          {personality.n8n_workflow_id && (
            <Badge variant="outline" className="text-xs">
              <Workflow className="w-3 h-3 mr-1" />
              N8N
            </Badge>
          )}
          {personality.waha_session_id && (
            <Badge variant="outline" className="text-xs">
              <MessageSquare className="w-3 h-3 mr-1" />
              WhatsApp
            </Badge>
          )}
          {personality.knowledge_base_item_id && (
            <Badge variant="outline" className="text-xs">
              <Database className="w-3 h-3 mr-1" />
              KB
            </Badge>
          )}
          {!personality.n8n_workflow_id && !personality.waha_session_id && !personality.knowledge_base_item_id && (
            <span className="text-xs text-gray-400">None</span>
          )}
        </div>
      )
    },
    {
      key: 'created_at',
      title: 'Created',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-500">
            {value ? new Date(value).toLocaleDateString() : 'Unknown'}
          </span>
        </div>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      sortable: false,
      render: (value, personality) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleViewPersonality(personality)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEditPersonality(personality)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Personality
            </DropdownMenuItem>
            {!personality.is_default && (
              <DropdownMenuItem onClick={() => handleSetAsDefault(personality)}>
                <Star className="mr-2 h-4 w-4" />
                Set as Default
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => handleToggleStatus(personality)}>
              {personality.status === 'active' ? (
                <>
                  <BotX className="mr-2 h-4 w-4" />
                  Deactivate
                </>
              ) : (
                <>
                  <BotCheck className="mr-2 h-4 w-4" />
                  Activate
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleCopyPersonality(personality)}>
              <Copy className="mr-2 h-4 w-4" />
              Copy Code
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleDeletePersonality(personality)}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Personality
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ], [handleViewPersonality, handleEditPersonality, handleDeletePersonality, handleToggleStatus, handleSetAsDefault, handleCopyPersonality]);

  // Focus management on mount
  useEffect(() => {
    setFocus();
  }, [setFocus]);

  // Loading state (skeleton) - AFTER all hooks
  if (loading && botPersonalities.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-16 w-full bg-gray-200 rounded animate-pulse" />
          <div className="h-32 w-full bg-gray-200 rounded animate-pulse" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 w-full bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const showEmpty = !loading && botPersonalities.length === 0;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6" ref={focusRef}>
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Bot Personality Management</h1>
            <p className="text-muted-foreground">
              Kelola bot personalities dan konfigurasi AI assistant dalam organisasi Anda
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={getLoadingState('refresh')}
              aria-label="Refresh bot personalities"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${getLoadingState('refresh') ? 'animate-spin' : ''}`} />
              Refresh
            </Button>

            <Button
              variant="outline"
              onClick={handleExport}
              disabled={getLoadingState('export')}
              aria-label="Export bot personalities"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>

            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              aria-label="Create new bot personality"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Bot Personality
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Personalities</CardTitle>
              <Bot className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.total}</div>
              <p className="text-xs text-muted-foreground">
                All bot personalities in organization
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Personalities</CardTitle>
              <BotCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.active}</div>
              <p className="text-xs text-muted-foreground">
                Currently active personalities
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive Personalities</CardTitle>
              <BotX className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.inactive}</div>
              <p className="text-xs text-muted-foreground">
                Inactive personalities
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">With N8N Workflow</CardTitle>
              <Workflow className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.withN8nWorkflow}</div>
              <p className="text-xs text-muted-foreground">
                Connected to N8N workflows
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">With WhatsApp</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.withWahaSession}</div>
              <p className="text-xs text-muted-foreground">
                Connected to WhatsApp sessions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">With Knowledge Base</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.withKnowledgeBaseItem}</div>
              <p className="text-xs text-muted-foreground">
                Connected to knowledge base items
              </p>
            </CardContent>
          </Card>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search Personalities</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, code, or description..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={statusFilter}
                  onValueChange={handleStatusFilterChange}
                  placeholder="All statuses"
                >
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Language</label>
                <Select
                  value={languageFilter}
                  onValueChange={handleLanguageFilterChange}
                  placeholder="All languages"
                >
                  <SelectItem value="all">All Languages</SelectItem>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="indonesia">Indonesia</SelectItem>
                  <SelectItem value="javanese">Javanese</SelectItem>
                  <SelectItem value="sundanese">Sundanese</SelectItem>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Formality Level</label>
                <Select
                  value={formalityFilter}
                  onValueChange={handleFormalityFilterChange}
                  placeholder="All levels"
                >
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedPersonalities.length > 0 && (
          <BotPersonalityBulkActions
            selectedPersonalities={selectedPersonalities}
            onClearSelection={() => setSelectedPersonalities([])}
            onBulkAction={(action) => {
              announce(`Bulk action ${action} applied to ${selectedPersonalities.length} personalities`);
            }}
          />
        )}

        {/* Table or Empty */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Bot Personalities Overview</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {pagination.total} personalities found • Showing {pagination.currentPage} of {pagination.lastPage} pages
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {showEmpty ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Bot className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No bot personalities found</h3>
                <p className="text-sm text-gray-500 mb-4">Try adjusting filters or create a new bot personality.</p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Bot Personality
                </Button>
              </div>
            ) : (
              <DataTable
                data={botPersonalities}
                columns={columns}
                loading={loading}
                error={error}
                searchable={false}
                ariaLabel="Bot personalities management table"
                pagination={null}
                selectable={true}
                selectedItems={selectedPersonalities}
                onSelectionChange={handleSelectionChange}
                selectAll={selectAll}
                onSelectAll={handleSelectAll}
              />
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {!showEmpty && pagination.total > pagination.perPage && (
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.lastPage}
            totalItems={pagination.total}
            perPage={pagination.perPage}
            onPageChange={handlePageChange}
            onPerPageChange={handlePerPageChange}
            variant="table"
            showPageNumbers={true}
            showFirstLast={true}
            showPrevNext={true}
            showPerPageSelector={true}
            perPageOptions={[5, 10, 15, 25, 50]}
            maxVisiblePages={5}
            ariaLabel="Bot personalities table pagination"
          />
        )}

        {/* Dialogs */}
        <CreateBotPersonalityDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onPersonalityCreated={async (newPersonality) => {
            try {
              await createBotPersonality(newPersonality);
              announce('New bot personality created successfully');
              setIsCreateDialogOpen(false);
            } catch (err) {
              // Error already handled in hook
            }
          }}
        />

        <EditBotPersonalityDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          personality={selectedPersonality}
          onPersonalityUpdated={async (updatedPersonality) => {
            try {
              await updateBotPersonality(updatedPersonality.id, updatedPersonality);
              announce('Bot personality updated successfully');
              setIsEditDialogOpen(false);
            } catch (err) {
              // Error already handled in hook
            }
          }}
        />

        <ViewBotPersonalityDetailsDialog
          open={isViewDialogOpen}
          onOpenChange={setIsViewDialogOpen}
          personality={selectedPersonality}
        />
      </div>
    </div>
  );
});

BotPersonalityList.displayName = 'BotPersonalityList';

const EnhancedBotPersonalityList = withErrorHandling(BotPersonalityList, {
  context: 'Bot Personality List Page'
});

export default EnhancedBotPersonalityList;
