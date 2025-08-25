import React, { useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Skeleton,
  Button,
  Checkbox,
  Badge,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui';
import {
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

/**
 * Professional DataTable Component
 * Provides comprehensive table functionality with sorting, selection, loading states, and error handling
 */
export const DataTable = ({
  // Data and configuration
  data = [],
  columns = [],
  loading = false,
  error = null,

  // Selection
  selectedItems = [],
  onItemSelect,
  onBulkSelect,
  enableSelection = true,

  // Sorting
  sorting = { field: null, direction: 'asc' },
  onSortChange,
  enableSorting = true,

  // Actions
  actions = [],
  onRowClick,
  onRowDoubleClick,

  // States
  emptyMessage = "No data found",
  emptyActionText,
  onEmptyAction,
  errorMessage = "Failed to load data",
  onRetry,

  // Styling
  className = "",
  size = 'default',
  variant = 'default',
  striped = false,
  hoverable = true,

  // Pagination info
  showPaginationInfo = false,
  pagination = null,

  // Advanced features
  enableRowActions = true,
  rowActions = [],
  onRowAction,
  enableBulkActions = false,
  bulkActions = [],
  onBulkAction,

  // Performance
  virtualized = false,
  rowHeight = 48,
  visibleRows = 10
}) => {

  // Memoized computed values
  const hasData = useMemo(() => data.length > 0, [data.length]);
  const hasSelection = useMemo(() => selectedItems.length > 0, [selectedItems.length]);
  const allSelected = useMemo(() => (
    hasData && selectedItems.length === data.length
  ), [hasData, selectedItems.length, data.length]);
  const someSelected = useMemo(() => (
    selectedItems.length > 0 && selectedItems.length < data.length
  ), [selectedItems.length, data.length]);

  // Size configurations
  const sizeConfig = {
    sm: {
      cellPadding: 'py-2 px-3',
      headerPadding: 'py-2 px-3',
      textSize: 'text-sm',
      iconSize: 'w-4 h-4'
    },
    default: {
      cellPadding: 'py-3 px-4',
      headerPadding: 'py-3 px-4',
      textSize: 'text-sm',
      iconSize: 'w-4 h-4'
    },
    lg: {
      cellPadding: 'py-4 px-6',
      headerPadding: 'py-4 px-6',
      textSize: 'text-base',
      iconSize: 'w-5 h-5'
    }
  };

  const config = sizeConfig[size];

  // Variant configurations
  const variantConfig = {
    default: {
      table: 'border border-gray-200 rounded-lg',
      header: 'bg-gray-50 border-b border-gray-200',
      row: 'border-b border-gray-100',
      hover: 'hover:bg-gray-50'
    },
    bordered: {
      table: 'border border-gray-300 rounded-lg',
      header: 'bg-gray-100 border-b border-gray-300',
      row: 'border-b border-gray-200',
      hover: 'hover:bg-gray-50'
    },
    minimal: {
      table: '',
      header: 'border-b border-gray-200',
      row: 'border-b border-gray-100',
      hover: 'hover:bg-gray-50'
    }
  };

  const variantStyles = variantConfig[variant];

  // Loading state
  if (loading) {
    return (
      <div className={`overflow-x-auto ${className}`}>
        <Table className={variantStyles.table}>
          <TableHeader>
            <TableRow className={variantStyles.header}>
              {enableSelection && (
                <TableHead className={`${config.headerPadding} ${config.textSize}`}>
                  <Skeleton className="h-4 w-4" />
                </TableHead>
              )}
              {columns.map((column, index) => (
                <TableHead key={index} className={`${config.headerPadding} ${config.textSize}`}>
                  <Skeleton className="h-4 w-20" />
                </TableHead>
              ))}
              {enableRowActions && (
                <TableHead className={`${config.headerPadding} ${config.textSize} w-12`}>
                  <Skeleton className="h-4 w-8" />
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, index) => (
              <TableRow key={index} className={variantStyles.row}>
                {enableSelection && (
                  <TableCell className={config.cellPadding}>
                    <Skeleton className="h-4 w-4" />
                  </TableCell>
                )}
                {columns.map((_, colIndex) => (
                  <TableCell key={colIndex} className={config.cellPadding}>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                ))}
                {enableRowActions && (
                  <TableCell className={config.cellPadding}>
                    <Skeleton className="h-8 w-8" />
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="flex flex-col items-center space-y-4">
          <AlertCircle className={`${config.iconSize} text-red-500`} />
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Data</h3>
            <p className="text-gray-500 mb-4">{errorMessage}</p>
            {onRetry && (
              <Button onClick={onRetry} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!hasData) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="flex flex-col items-center space-y-4">
          <div className="text-gray-400">
            <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
            <p className="text-gray-500 mb-4">{emptyMessage}</p>
            {emptyActionText && onEmptyAction && (
              <Button onClick={onEmptyAction} variant="outline">
                {emptyActionText}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Render sort icon
  const renderSortIcon = (column) => {
    if (!enableSorting || !column.sortable) return null;

    const isSorted = sorting.field === column.key;
    const isAsc = sorting.direction === 'asc';

    return (
      <span className="ml-2 inline-flex items-center">
        {isSorted ? (
          isAsc ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )
        ) : (
          <div className="w-4 h-4 opacity-30">
            <ChevronUp className="w-3 h-3 -mb-1" />
            <ChevronDown className="w-3 h-3 -mt-1" />
          </div>
        )}
      </span>
    );
  };

  // Handle sort click
  const handleSortClick = (column) => {
    if (!enableSorting || !column.sortable || !onSortChange) return;

    const newDirection = sorting.field === column.key && sorting.direction === 'asc' ? 'desc' : 'asc';
    onSortChange(column.key, newDirection);
  };

  // Handle row click
  const handleRowClick = (item, event) => {
    // Ignore clicks originating from interactive elements
    if (event && event.target) {
      const target = event.target;
      if (target.closest && target.closest('input[type="checkbox"], button, a, [role="button"]')) {
        return;
      }
    }
    if (onRowClick) {
      onRowClick(item, event);
    }
  };

  // Handle row double click
  const handleRowDoubleClick = (item, event) => {
    if (onRowDoubleClick) {
      onRowDoubleClick(item, event);
    }
  };

  // Handle row action
  const handleRowAction = (action, item, event) => {
    event.stopPropagation();
    if (onRowAction) {
      onRowAction(action, item);
    }
  };

  // Render cell content
  const renderCellContent = (item, column) => {
    const value = column.accessor ? column.accessor(item) : item[column.key];

    if (column.render) {
      return column.render(value, item, column);
    }

    // Default renderers based on type
    switch (column.type) {
      case 'badge':
        return (
          <Badge variant={column.badgeVariant || 'default'}>
            {value}
          </Badge>
        );

      case 'status':
        const statusConfig = column.statusConfig?.[value] || {};
        return (
          <Badge variant={statusConfig.variant || 'default'}>
            {statusConfig.label || value}
          </Badge>
        );

      case 'boolean':
        return (
          <Badge variant={value ? 'success' : 'secondary'}>
            {value ? 'Yes' : 'No'}
          </Badge>
        );

      case 'date':
        return value ? new Date(value).toLocaleDateString() : '-';

      case 'datetime':
        return value ? new Date(value).toLocaleString() : '-';

      case 'number':
        return typeof value === 'number' ? value.toLocaleString() : value;

      case 'currency':
        return typeof value === 'number' ? `$${value.toFixed(2)}` : value;

      case 'percentage':
        return typeof value === 'number' ? `${value}%` : value;

      case 'text':
      default:
        return value || '-';
    }
  };

  // Resolve a stable row id for selection and keys
  const getRowId = (item, index) => {
    return item?.id ?? item?.uuid ?? item?._id ?? item?.code ?? index;
  };

  return (
    <div className={`overflow-x-auto ${className}`}>
      <Table className={variantStyles.table}>
        <TableHeader>
          <TableRow className={variantStyles.header}>
            {enableSelection && (
              <TableHead className={`${config.headerPadding} ${config.textSize} w-12`}>
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected ? true : undefined}
                  onCheckedChange={onBulkSelect}
                  disabled={!hasData}
                />
              </TableHead>
            )}
            {columns.map((column, index) => (
              <TableHead
                key={index}
                className={`${config.headerPadding} ${config.textSize} ${column.sortable && enableSorting ? 'cursor-pointer select-none hover:bg-gray-100' : ''}`}
                onClick={() => handleSortClick(column)}
              >
                <div className="flex items-center">
                  {column.header}
                  {renderSortIcon(column)}
                </div>
              </TableHead>
            ))}
            {enableRowActions && (
              <TableHead className={`${config.headerPadding} ${config.textSize} w-12`}>
                Actions
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => {
            const rowId = getRowId(item, index);
            return (
            <TableRow
              key={rowId}
              className={`${variantStyles.row} ${hoverable ? variantStyles.hover : ''} ${striped && index % 2 === 1 ? 'bg-gray-50' : ''} ${onRowClick ? 'cursor-pointer' : ''}`}
              onClick={(e) => handleRowClick(item, e)}
              onDoubleClick={(e) => handleRowDoubleClick(item, e)}
            >
              {enableSelection && (
                <TableCell className={config.cellPadding} onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedItems.includes(rowId)}
                    onCheckedChange={(checked) => onItemSelect?.(rowId, checked)}
                  />
                </TableCell>
              )}
              {columns.map((column, colIndex) => (
                <TableCell key={colIndex} className={config.cellPadding}>
                  <div className={config.textSize}>
                    {renderCellContent(item, column)}
                  </div>
                </TableCell>
              ))}
              {enableRowActions && (
                <TableCell className={config.cellPadding}>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="flex flex-col space-y-1">
                          {rowActions.map((action, actionIndex) => (
                            <Button
                              key={actionIndex}
                              variant="ghost"
                              size="sm"
                              onClick={(e) => handleRowAction(action, item, e)}
                              className="justify-start"
                            >
                              {action.icon && <action.icon className="w-4 h-4 mr-2" />}
                              {action.label}
                            </Button>
                          ))}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
              )}
            </TableRow>
          );})}
        </TableBody>
      </Table>

      {/* Pagination info */}
      {showPaginationInfo && pagination && (
        <div className="mt-4 text-sm text-gray-500 text-center">
          Showing {pagination.from} to {pagination.to} of {pagination.total} results
        </div>
      )}
    </div>
  );
};

export default DataTable;
