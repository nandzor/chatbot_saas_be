import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  Download,
  Upload,
  RefreshCw,
  Database,
  ArrowUpDown
} from 'lucide-react';
import { AdvancedPagination } from '@/components/ui/AdvancedPagination';
import { LoadingStates } from '@/components/ui/LoadingStates';
import { ErrorStates } from '@/components/ui/ErrorStates';

/**
 * Data table column definition
 */
export const DataTableColumn = ({
  key,
  title,
  dataIndex,
  render,
  sorter,
  filterable = false,
  sortable = true,
  width,
  align = 'left',
  fixed,
  className = ''
}) => {
  return {
    key,
    title,
    dataIndex,
    render,
    sorter,
    filterable,
    sortable,
    width,
    align,
    fixed,
    className
  };
};

/**
 * Data table component
 */
export const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  error = null,
  pagination = true,
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  onItemsPerPageChange,
  onSort,
  onFilter,
  onRefresh,
  onExport,
  onImport,
  onRowClick,
  onRowSelect,
  onRowAction,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  searchable = true,
  searchPlaceholder = 'Search...',
  searchValue = '',
  onSearchChange,
  sortable = true,
  filterable = true,
  showHeader = true,
  showFooter = true,
  showPagination = true,
  showSearch = true,
  showActions = true,
  showTotal = true,
  showPageSize = true,
  pageSizeOptions = [10, 25, 50, 100],
  maxVisiblePages = 5,
  className = '',
  rowClassName = '',
  headerClassName = '',
  bodyClassName = '',
  footerClassName = '',
  emptyText = 'No data available',
  emptyIcon: EmptyIcon = Database,
  onError,
  onRetry,
  ...props
}) => {
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filters, setFilters] = useState({});
  const [searchTerm, setSearchTerm] = useState(searchValue);

  // Handle sorting
  const handleSort = (column) => {
    if (!column.sortable) return;

    const newDirection = sortField === column.key && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(column.key);
    setSortDirection(newDirection);
    onSort?.(column.key, newDirection);
  };

  // Handle filtering
  const handleFilter = (column, value) => {
    const newFilters = { ...filters, [column.key]: value };
    setFilters(newFilters);
    onFilter?.(newFilters);
  };

  // Handle search
  const handleSearch = (value) => {
    setSearchTerm(value);
    onSearchChange?.(value);
  };

  // Handle row selection
  const handleRowSelect = (row, checked) => {
    if (!selectable) return;

    const newSelection = checked
      ? [...selectedRows, row]
      : selectedRows.filter(item => item.id !== row.id);

    onSelectionChange?.(newSelection);
  };

  // Handle select all
  const handleSelectAll = (checked) => {
    if (!selectable) return;

    const newSelection = checked ? [...data] : [];
    onSelectionChange?.(newSelection);
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

    return row[column.dataIndex];
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
          {onRowAction && (
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
            <td colSpan={columns.length + (selectable ? 1 : 0) + (onRowAction ? 1 : 0)}>
              <LoadingStates.TableLoadingSkeleton rows={5} columns={columns.length} />
            </td>
          </tr>
        </tbody>
      );
    }

    if (error) {
      return (
        <tbody>
          <tr>
            <td colSpan={columns.length + (selectable ? 1 : 0) + (onRowAction ? 1 : 0)}>
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
            <td colSpan={columns.length + (selectable ? 1 : 0) + (onRowAction ? 1 : 0)}>
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
            {onRowAction && (
              <td className="p-4">
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
          <td colSpan={columns.length + (selectable ? 1 : 0) + (onRowAction ? 1 : 0)}>
            <div className="p-4 border-t">
              {showPagination && (
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
                    value={searchTerm}
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
 * Simple data table
 */
export const SimpleDataTable = ({
  columns = [],
  data = [],
  loading = false,
  error = null,
  onRowClick,
  className = '',
  ...props
}) => {
  return (
    <DataTable
      columns={columns}
      data={data}
      loading={loading}
      error={error}
      onRowClick={onRowClick}
      showSearch={false}
      showActions={false}
      showPagination={false}
      showTotal={false}
      showPageSize={false}
      className={className}
      {...props}
    />
  );
};

/**
 * Data table with selection
 */
export const SelectableDataTable = ({
  columns = [],
  data = [],
  selectedRows = [],
  onSelectionChange,
  onRowClick,
  className = '',
  ...props
}) => {
  return (
    <DataTable
      columns={columns}
      data={data}
      selectedRows={selectedRows}
      onSelectionChange={onSelectionChange}
      onRowClick={onRowClick}
      selectable={true}
      className={className}
      {...props}
    />
  );
};

/**
 * Data table with actions
 */
export const ActionableDataTable = ({
  columns = [],
  data = [],
  onRowAction,
  onRefresh,
  onExport,
  onImport,
  className = '',
  ...props
}) => {
  return (
    <DataTable
      columns={columns}
      data={data}
      onRowAction={onRowAction}
      onRefresh={onRefresh}
      onExport={onExport}
      onImport={onImport}
      showActions={true}
      className={className}
      {...props}
    />
  );
};

export default {
  DataTable,
  DataTableColumn,
  SimpleDataTable,
  SelectableDataTable,
  ActionableDataTable
};
