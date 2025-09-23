/**
 * Enhanced Knowledge List Page
 * Optimized knowledge management dengan DataTable dan enhanced components
 */

import React, { useState, useCallback, useMemo } from 'react';
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
  AvatarFallback
} from '@/components/ui';
import {
  FileText,
  Edit,
  Trash2,
  Plus,
  Filter,
  MoreHorizontal,
  CheckCircle,
  AlertCircle,
  Globe,
  RefreshCw,
  Shield,
  Clock,
  Tag,
  MessageSquare
} from 'lucide-react';
import CreateKnowledgeDialog from './CreateKnowledgeDialog';
import EditKnowledgeDialog from './EditKnowledgeDialog';
import KnowledgeBulkActions from './KnowledgeBulkActions';
import { useKnowledgeManagement } from '@/hooks/useKnowledgeManagement';
import {
  INITIAL_FILTERS,
  STATS_CARDS_CONFIG
} from './constants';

const KnowledgeList = React.memo(() => {
  const { announce } = useAnnouncement();
  const { focusRef } = useFocusManagement();
  const {
    knowledgeItems,
    loading,
    error,
    pagination,
    statistics,
    categories,
    loadKnowledgeItems,
    createKnowledgeItem,
    updateKnowledgeItem,
    deleteKnowledgeItem,
    toggleKnowledgeStatus,
    updateFilters,
    handlePageChange,
    handlePerPageChange
  } = useKnowledgeManagement();

  // Local UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [filters, setFilters] = useState(INITIAL_FILTERS);

  // Initial data loading is handled by useKnowledgeManagement hook

  // Search and filter handlers
  const handleSearch = useCallback((query) => {
    const sanitizedQuery = sanitizeInput(query);
    setSearchQuery(sanitizedQuery);
    updateFilters({ search: sanitizedQuery });
  }, [updateFilters]);

  const handleFilterChange = useCallback((filterType, value) => {
    const sanitizedValue = sanitizeInput(value);
    setFilters(prev => ({ ...prev, [filterType]: sanitizedValue }));
    updateFilters({ [filterType]: sanitizedValue });
  }, [updateFilters]);

  // Selection handlers
  const handleItemSelect = useCallback((itemId, isSelected) => {
    setSelectedItems(prev => {
      const newSelection = isSelected
        ? [...prev, itemId]
        : prev.filter(id => id !== itemId);
      setShowBulkActions(newSelection.length > 0);
      return newSelection;
    });
  }, []);

  const handleSelectAll = useCallback((isSelected) => {
    if (isSelected) {
      const allIds = knowledgeItems.map(item => item.id);
      setSelectedItems(allIds);
      setShowBulkActions(true);
    } else {
      setSelectedItems([]);
      setShowBulkActions(false);
    }
  }, [knowledgeItems]);

  const clearSelection = useCallback(() => {
    setSelectedItems([]);
    setShowBulkActions(false);
  }, []);

  // CRUD handlers
  const handleCreate = useCallback(async (formData) => {
    try {
      await createKnowledgeItem(formData);
      setCreateDialogOpen(false);
      announce('Knowledge item created successfully', 'success');
      toast.success('Knowledge item created successfully');
    } catch (error) {
      handleError(error, 'Failed to create knowledge item');
    }
  }, [createKnowledgeItem, announce]);

  const handleEdit = useCallback(async (formData) => {
    try {
      await updateKnowledgeItem(selectedItem.id, formData);
      setEditDialogOpen(false);
      setSelectedItem(null);
      announce('Knowledge item updated successfully', 'success');
      toast.success('Knowledge item updated successfully');
    } catch (error) {
      handleError(error, 'Failed to update knowledge item');
    }
  }, [updateKnowledgeItem, selectedItem, announce]);

  const handleDelete = useCallback(async (itemId) => {
    try {
      await deleteKnowledgeItem(itemId);
      announce('Knowledge item deleted successfully', 'success');
      toast.success('Knowledge item deleted successfully');
    } catch (error) {
      handleError(error, 'Failed to delete knowledge item');
    }
  }, [deleteKnowledgeItem, announce]);

  const handleEditClick = useCallback((item) => {
    if (item) {
      setSelectedItem(item);
      setEditDialogOpen(true);
    }
  }, []);


  // Bulk actions
  const handleBulkAction = useCallback(async (action) => {
    try {
      const actions = {
        delete: () => Promise.all(selectedItems.map(id => deleteKnowledgeItem(id))),
        activate: () => Promise.all(selectedItems.map(id => toggleKnowledgeStatus(id, 'active'))),
        deactivate: () => Promise.all(selectedItems.map(id => toggleKnowledgeStatus(id, 'inactive')))
      };

      if (actions[action]) {
        await actions[action]();
        clearSelection();
        announce(`Bulk ${action} completed successfully`, 'success');
        toast.success(`Bulk ${action} completed successfully`);
      }
    } catch (error) {
      handleError(error, `Failed to perform bulk ${action}`);
    }
  }, [selectedItems, deleteKnowledgeItem, toggleKnowledgeStatus, announce, clearSelection]);

  // Table columns configuration
  const columns = useMemo(() => [
    {
      key: 'select',
      header: 'Select',
      render: (item) => (
        <input
          type="checkbox"
          checked={item?.id ? selectedItems.includes(item.id) : false}
          onChange={(e) => item?.id && handleItemSelect(item.id, e.target.checked)}
          className="rounded border-gray-300"
        />
      ),
      width: '50px'
    },
    {
      key: 'title',
      header: 'Title',
      render: (item) => (
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {item?.content_type === 'article' ? (
                <FileText className="h-4 w-4" />
              ) : (
                <MessageSquare className="h-4 w-4" />
              )}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-gray-900">{item?.title || 'Untitled'}</div>
            <div className="text-sm text-gray-500 truncate max-w-xs">
              {item?.description || 'No description'}
            </div>
          </div>
        </div>
      ),
      sortable: true
    },
    {
      key: 'category',
      header: 'Category',
      render: (item) => (
        <Badge variant="secondary" className="flex items-center space-x-1">
          <Tag className="h-3 w-3" />
          <span>{item?.category?.name || 'General'}</span>
        </Badge>
      ),
      sortable: true
    },
    {
      key: 'type',
      header: 'Type',
      render: (item) => (
        <Badge
          variant={item?.content_type === 'article' ? 'default' : 'secondary'}
          className="flex items-center space-x-1"
        >
          {item?.content_type === 'article' ? (
            <>
              <FileText className="h-3 w-3" />
              <span>Article</span>
            </>
          ) : (
            <>
              <MessageSquare className="h-3 w-3" />
              <span>Q&A</span>
            </>
          )}
        </Badge>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <Badge
          variant={item?.workflow_status === 'published' ? 'default' : 'secondary'}
          className="flex items-center space-x-1"
        >
          {item?.workflow_status === 'published' ? (
            <>
              <CheckCircle className="h-3 w-3" />
              <span>Published</span>
            </>
          ) : (
            <>
              <Clock className="h-3 w-3" />
              <span>Draft</span>
            </>
          )}
        </Badge>
      ),
      sortable: true
    },
    {
      key: 'visibility',
      header: 'Visibility',
      render: (item) => (
        <Badge
          variant={item?.is_public ? 'default' : 'secondary'}
          className="flex items-center space-x-1"
        >
          {item?.is_public ? (
            <>
              <Globe className="h-3 w-3" />
              <span>Public</span>
            </>
          ) : (
            <>
              <Shield className="h-3 w-3" />
              <span>Private</span>
            </>
          )}
        </Badge>
      )
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (item) => (
        <div className="text-sm text-gray-500">
          {item?.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}
        </div>
      ),
      sortable: true
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleEditClick(item)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                if (item?.id) {
                  handleDelete(item.id);
                }
              }}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      width: '80px'
    }
  ], [selectedItems, handleItemSelect, handleDelete, handleEditClick]);

  // Statistics cards
  const statsCards = useMemo(() =>
    STATS_CARDS_CONFIG.map(config => ({
      ...config,
      value: statistics[config.key]
    })), [statistics]);

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load knowledge items: {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6" ref={focusRef}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Knowledge Management</h1>
          <p className="text-gray-600 mt-1">
            Manage knowledge articles and Q&A collections
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Knowledge Item
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters & Search</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search knowledge items..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </Select>
              <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="article">Articles</SelectItem>
                <SelectItem value="qa_collection">Q&A</SelectItem>
              </Select>
              <Button
                variant="outline"
                onClick={() => loadKnowledgeItems()}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {showBulkActions && (
        <KnowledgeBulkActions
          selectedCount={selectedItems.length}
          onAction={handleBulkAction}
          onClear={clearSelection}
        />
      )}

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Knowledge Items</span>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>{pagination.totalItems} items</span>
              <span>•</span>
              <span>Page {pagination.currentPage} of {pagination.totalPages}</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={knowledgeItems.filter(item => item && item.id)}
            columns={columns}
            loading={loading}
            onSelectAll={handleSelectAll}
            selectAllChecked={selectedItems.length === knowledgeItems.length && knowledgeItems.length > 0}
            selectAllIndeterminate={selectedItems.length > 0 && selectedItems.length < knowledgeItems.length}
          />
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
            onPerPageChange={handlePerPageChange}
            perPage={pagination.perPage}
            totalItems={pagination.totalItems}
          />
        </div>
      )}

      {/* Dialogs */}
      <CreateKnowledgeDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onKnowledgeCreated={handleCreate}
        categories={categories}
      />

      <EditKnowledgeDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        knowledgeItem={selectedItem}
        onKnowledgeUpdated={handleEdit}
        categories={categories}
      />

    </div>
  );
});

KnowledgeList.displayName = 'KnowledgeList';

const KnowledgeListPage = withErrorHandling(KnowledgeList);
export default KnowledgeListPage;
