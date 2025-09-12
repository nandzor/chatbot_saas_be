/**
 * Generic Table Component
 * Reusable table component dengan berbagai konfigurasi
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Plus,
  ArrowUpDown
} from 'lucide-react';
import { AdvancedPagination } from '@/components/ui/AdvancedPagination';
import { LoadingStates } from '@/components/ui/LoadingStates';
import { ErrorStates } from '@/components/ui/ErrorStates';
import { formatDate, formatNumber, getStatusColor, getStatusIcon } from '@/utils/helpers';

/**
 * Generic Table Component
 */
export const GenericTable = ({
  // Data
  data = [],
  columns = [],

  // Loading & Error States
  loading = false,
  error = null,

  // Pagination
  pagination = true,
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  onItemsPerPageChange,

  // Sorting
  sortable = true,
  sortField = '',
  sortDirection = 'asc',
  onSort,

  // Filtering
  filterable = true,
  filters = {},
  onFilterChange,

  // Search
  searchable = true,
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search...',

  // Selection
  selectable = false,
  selectedRows = [],
  onSelectionChange,

  // Actions
  onRefresh,
  onExport,
  onImport,
  onRowClick,
  onRowAction,
  rowActions = [],

  // UI Configuration
  showHeader = true,
  showFooter = true,
  showSearch = true,
  showActions = true,
  showTotal = true,
  showPageSize = true,
  pageSizeOptions = [10, 25, 50, 100],
  maxVisiblePages = 5,

  // Styling
  className = '',
  rowClassName = '',
  headerClassName = '',
  bodyClassName = '',
  footerClassName = '',

  // Content
  emptyText = 'No data available',
  emptyIcon: EmptyIcon = 'Database',

  // Callbacks
  onError,
  onRetry,

  ...props
}) => {
  const [localSearch, setLocalSearch] = useState(searchValue);
  const [localFilters, setLocalFilters] = useState(filters);

  // Handle search
  const handleSearch = (value) => {
    setLocalSearch(value);
    onSearchChange?.(value);
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  // Handle sorting
  const handleSort = (column) => {
    if (!column.sortable || !onSort) return;

    const newDirection = sortField === column.key && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(column.key, newDirection);
  };

  // Handle row selection
  const handleRowSelect = (row, checked) => {
    if (!selectable || !onSelectionChange) return;

    const newSelection = checked
      ? [...selectedRows, row]
      : selectedRows.filter(item => item.id !== row.id);

    onSelectionChange(newSelection);
  };

  // Handle select all
  const handleSelectAll = (checked) => {
    if (!selectable || !onSelectionChange) return;

    const newSelection = checked ? [...data] : [];
    onSelectionChange(newSelection);
  };

  // Get sort icon
  const getSortIcon = (column) => {
    if (!column.sortable) return null;

    if (sortField === column.key) {
      return sortDirection === 'asc' ?
        <ChevronUp className="w-4 h-4" /> :
        <ChevronDown className="w-4 h-4" />;
    }

    return <ArrowUpDown className="w-4 h-4 text-muted-foreground" />;
  };

  // Render cell content
  const renderCell = (column, row, index) => {
    if (column.render) {
      return column.render(row[column.dataIndex], row, index);
    }

    const value = row[column.dataIndex];

    // Format based on column type
    switch (column.type) {
      case 'date':
        return formatDate(value, column.dateFormat);
      case 'number':
        return formatNumber(value);
      case 'currency':
        return formatNumber(value, 'id-ID', 'currency', column.currency);
      case 'percentage':
        return `${Number(value).toFixed(column.decimals || 1)}%`;
      case 'status':
        return (
          <Badge variant="outline" className={`text-${getStatusColor(value)}-600`}>
            {value}
          </Badge>
        );
      case 'boolean':
        return value ? 'Yes' : 'No';
      case 'array':
        return Array.isArray(value) ? value.join(', ') : value;
      default:
        return value;
    }
  };

  // Render header
  const renderHeader = () => {
    if (!showHeader) return null;

    return (
      <thead className={headerClassName}>
        <tr>
          {selectable && (
            <th className="w-12 p-4">
              <Checkbox
                checked={selectedRows.length === data.length && data.length > 0}
                onCheckedChange={handleSelectAll}
                disabled={loading}
              />
            </th>
          )}
          {columns.map((column) => (
            <th
              key={column.key}
              className={`
                p-4 text-left font-medium text-muted-foreground
                ${column.sortable ? 'cursor-pointer hover:bg-muted/50' : ''}
                ${column.fixed === 'left' ? 'sticky left-0 bg-background z-10' : ''}
                ${column.fixed === 'right' ? 'sticky right-0 bg-background z-10' : ''}
                ${column.className || ''}
              `}
              style={{ width: column.width }}
              onClick={() => handleSort(column)}
            >
              <div className="flex items-center space-x-2">
                <span>{column.title}</span>
                {getSortIcon(column)}
              </div>
            </th>
          ))}
          {(onRowAction || rowActions.length > 0) && (
            <th className="w-12 p-4">
              <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
            </th>
          )}
        </tr>
      </thead>
    );
  };

  // Render body
  const renderBody = () => {
    if (loading) {
      return (
        <tbody>
          <tr>
            <td colSpan={columns.length + (selectable ? 1 : 0) + ((onRowAction || rowActions.length > 0) ? 1 : 0)}>
              <LoadingStates.TableLoadingSkeleton
                rows={5}
                columns={columns.length}
              />
            </td>
          </tr>
        </tbody>
      );
    }

    if (error) {
      return (
        <tbody>
          <tr>
            <td colSpan={columns.length + (selectable ? 1 : 0) + ((onRowAction || rowActions.length > 0) ? 1 : 0)}>
              <ErrorStates.GenericErrorState
                title="Failed to load data"
                message={error.message || 'An error occurred while loading the data'}
                onRetry={onRetry}
              />
            </td>
          </tr>
        </tbody>
      );
    }

    if (data.length === 0) {
      return (
        <tbody>
          <tr>
            <td colSpan={columns.length + (selectable ? 1 : 0) + ((onRowAction || rowActions.length > 0) ? 1 : 0)}>
              <div className="flex flex-col items-center justify-center py-12">
                <EmptyIcon className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No data available</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  {emptyText}
                </p>
              </div>
            </td>
          </tr>
        </tbody>
      );
    }

    return (
      <tbody className={bodyClassName}>
        {data.map((row, index) => (
          <tr
            key={row.id || index}
            className={`
              border-b hover:bg-muted/50 transition-colors
              ${onRowClick ? 'cursor-pointer' : ''}
              ${rowClassName}
            `}
            onClick={() => onRowClick?.(row, index)}
          >
            {selectable && (
              <td className="p-4">
                <Checkbox
                  checked={selectedRows.some(item => item.id === row.id)}
                  onCheckedChange={(checked) => handleRowSelect(row, checked)}
                  disabled={loading}
                />
              </td>
            )}
            {columns.map((column) => (
              <td
                key={column.key}
                className={`
                  p-4 text-sm
                  ${column.align === 'center' ? 'text-center' : ''}
                  ${column.align === 'right' ? 'text-right' : ''}
                  ${column.fixed === 'left' ? 'sticky left-0 bg-background z-10' : ''}
                  ${column.fixed === 'right' ? 'sticky right-0 bg-background z-10' : ''}
                  ${column.className || ''}
                `}
                style={{ width: column.width }}
              >
                {renderCell(column, row, index)}
              </td>
            ))}
            {(onRowAction || rowActions.length > 0) && (
              <td className="p-4">
                <div className="flex items-center space-x-1">
                  {rowActions.map((action, actionIndex) => (
                    <Button
                      key={actionIndex}
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        action.onClick(row, index);
                      }}
                      className="h-8 w-8 p-0"
                      disabled={action.disabled?.(row, index)}
                    >
                      {action.icon}
                    </Button>
                  ))}
                  {onRowAction && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRowAction(row, index);
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    );
  };

  // Render footer
  const renderFooter = () => {
    if (!showFooter) return null;

    return (
      <tfoot className={footerClassName}>
        <tr>
          <td colSpan={columns.length + (selectable ? 1 : 0) + ((onRowAction || rowActions.length > 0) ? 1 : 0)}>
            <div className="p-4 border-t">
              {pagination && (
                <AdvancedPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  onPageChange={onPageChange}
                  onItemsPerPageChange={onItemsPerPageChange}
                  showItemsPerPage={showPageSize}
                  showTotalItems={showTotal}
                  pageSizeOptions={pageSizeOptions}
                  maxVisiblePages={maxVisiblePages}
                  disabled={loading}
                  loading={loading}
                />
              )}
            </div>
          </td>
        </tr>
      </tfoot>
    );
  };

  return (
    <Card className={className}>
      {/* Header with search and actions */}
      {(showSearch || showActions) && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {showSearch && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder={searchPlaceholder}
                    value={localSearch}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10 w-64"
                    disabled={loading}
                  />
                </div>
              )}
            </div>

            {showActions && (
              <div className="flex items-center space-x-2">
                {onRefresh && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onRefresh}
                    disabled={loading}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                )}

                {onExport && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onExport}
                    disabled={loading}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                )}

                {onImport && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onImport}
                    disabled={loading}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Import
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardHeader>
      )}

      {/* Table */}
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            {renderHeader()}
            {renderBody()}
            {renderFooter()}
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Generic Form Component
 */
export const GenericForm = ({
  fields = [],
  data = {},
  onSubmit,
  onCancel,
  loading = false,
  error = null,
  className = '',
  ...props
}) => {
  const [formData, setFormData] = useState(data);
  const [errors, setErrors] = useState({});

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(formData);
  };

  const renderField = (field) => {
    const { name, type, label, placeholder, required, options, ...fieldProps } = field;
    const value = formData[name] || '';
    const error = errors[name];

    switch (type) {
      case 'text':
      case 'email':
      case 'password':
      case 'number':
        return (
          <div key={name} className="space-y-2">
            <label className="text-sm font-medium">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
            <Input
              type={type}
              name={name}
              value={value}
              onChange={(e) => handleInputChange(name, e.target.value)}
              placeholder={placeholder}
              className={error ? 'border-red-500' : ''}
              {...fieldProps}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );

      case 'textarea':
        return (
          <div key={name} className="space-y-2">
            <label className="text-sm font-medium">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
            <textarea
              name={name}
              value={value}
              onChange={(e) => handleInputChange(name, e.target.value)}
              placeholder={placeholder}
              className={`w-full px-3 py-2 border rounded-md ${error ? 'border-red-500' : ''}`}
              rows={field.rows || 3}
              {...fieldProps}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );

      case 'select':
        return (
          <div key={name} className="space-y-2">
            <label className="text-sm font-medium">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
            <Select
              value={value}
              onValueChange={(value) => handleInputChange(name, value)}
            >
              <SelectTrigger className={error ? 'border-red-500' : ''}>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );

      case 'checkbox':
        return (
          <div key={name} className="flex items-center space-x-2">
            <Checkbox
              id={name}
              checked={value}
              onCheckedChange={(checked) => handleInputChange(name, checked)}
              {...fieldProps}
            />
            <label htmlFor={name} className="text-sm font-medium">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`} {...props}>
      {fields.map(renderField)}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="flex justify-end space-x-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </form>
  );
};

export default {
  GenericTable,
  GenericForm
};
