/**
 * Data Table
 * Tabel data dengan semua optimizations dan best practices
 */

import React, { useMemo, useCallback, useState } from 'react';
import {
  useDebounce,
  useVirtualScroll,
  withPerformanceOptimization,
  LazyComponent
} from '@/utils/performanceOptimization';
import {
  useKeyboardNavigation,
  getAriaAttributes,
  useAnnouncement
} from '@/utils/accessibilityUtils';
import {
  useLoadingStates,
  LoadingWrapper,
  SkeletonTable
} from '@/utils/loadingStates';
import { handleError } from '@/utils/errorHandler';
import { sanitizeInput } from '@/utils/securityUtils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Checkbox
} from '@/components/ui';
import { Input } from '@/components/ui';
import { Button } from '@/components/ui';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

const DataTable = ({
  data = [],
  columns = [],
  actions = [],
  loading = false,
  error = null,
  onSort = null,
  onFilter = null,
  onRowClick = null,
  pagination = null,
  searchable = true,
  virtualScroll = false,
  className = '',
  ariaLabel = 'Data table',
  // Checkbox selection props
  selectable = false,
  selectedItems = [],
  onSelectionChange = null,
  selectAll = false,
  onSelectAll = null
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [selectedRow, setSelectedRow] = useState(null);

  const { announce } = useAnnouncement();
  const { setLoading, isLoading } = useLoadingStates();

  // Handle individual item selection
  const handleItemSelect = useCallback((item, checked) => {
    if (!onSelectionChange) return;

    if (checked) {
      onSelectionChange([...selectedItems, item]);
    } else {
      onSelectionChange(selectedItems.filter(selected => selected.id !== item.id));
    }
  }, [selectedItems, onSelectionChange]);

  // Handle select all
  const handleSelectAll = useCallback((checked) => {
    if (!onSelectAll) return;
    onSelectAll(checked);
  }, [onSelectAll]);

  // Check if item is selected
  const isItemSelected = useCallback((item) => {
    return selectedItems.some(selected => selected.id === item.id);
  }, [selectedItems]);

  // Debounce search input
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!debouncedSearch) return data;

    const sanitizedQuery = sanitizeInput(debouncedSearch.toLowerCase());

    return data.filter(row =>
      columns.some(column => {
        const cellValue = row[column.key];
        if (cellValue == null) return false;
        return String(cellValue).toLowerCase().includes(sanitizedQuery);
      })
    );
  }, [data, debouncedSearch, columns]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Virtual scrolling setup
  const virtualScrollConfig = useVirtualScroll({
    items: sortedData,
    itemHeight: 48,
    containerHeight: 400,
    overscan: 5
  });

  // Handle search input
  const handleSearch = useCallback((e) => {
    const value = sanitizeInput(e.target.value);
    setSearchQuery(value);

    if (onFilter) {
      onFilter(value);
    }
  }, [onFilter]);

  // Handle sorting
  const handleSort = useCallback((columnKey) => {
    try {
      const newDirection =
        sortConfig.key === columnKey && sortConfig.direction === 'asc'
          ? 'desc'
          : 'asc';

      const newSortConfig = { key: columnKey, direction: newDirection };
      setSortConfig(newSortConfig);

      if (onSort) {
        onSort(newSortConfig);
      }

      announce(`Table sorted by ${columnKey} in ${newDirection}ending order`);
    } catch (error) {
      handleError(error, { context: 'Table Sorting' });
    }
  }, [sortConfig, onSort, announce]);

  // Handle row click
  const handleRowClick = useCallback((row, index) => {
    try {
      setSelectedRow(index);

      if (onRowClick) {
        onRowClick(row, index);
      }

      announce(`Row ${index + 1} selected`);
    } catch (error) {
      handleError(error, { context: 'Table Row Click' });
    }
  }, [onRowClick, announce]);

  // Keyboard navigation
  const { handleKeyDown } = useKeyboardNavigation({
    onArrowUp: () => {
      setSelectedRow(prev => prev !== null ? Math.max(0, prev - 1) : 0);
    },
    onArrowDown: () => {
      const maxIndex = (virtualScroll ? virtualScrollConfig.visibleItems : sortedData).length - 1;
      setSelectedRow(prev => prev !== null ? Math.min(maxIndex, prev + 1) : 0);
    },
    onEnter: () => {
      if (selectedRow !== null) {
        const currentData = virtualScroll ? virtualScrollConfig.visibleItems : sortedData;
        handleRowClick(currentData[selectedRow], selectedRow);
      }
    }
  });

  // Get sort icon
  const getSortIcon = useCallback((columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <ArrowUpDown className="w-4 h-4" />;
    }
    return sortConfig.direction === 'asc'
      ? <ArrowUp className="w-4 h-4" />
      : <ArrowDown className="w-4 h-4" />;
  }, [sortConfig]);

  // Render table content
  const renderTableContent = () => {
    const dataToRender = virtualScroll ? virtualScrollConfig.visibleItems : sortedData;

    if (dataToRender.length === 0) {
      return (
        <TableBody>
          <TableRow>
            <TableCell colSpan={columns.length + (actions.length > 0 ? 1 : 0) + (selectable ? 1 : 0)} className="text-center py-8">
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="text-gray-400">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500">No data available</p>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      );
    }

    return (
      <TableBody>
        {dataToRender.map((row, index) => {
          const actualIndex = virtualScroll ? virtualScrollConfig.startIndex + index : index;
          const isSelected = selectedRow === actualIndex;

          return (
            <TableRow
              key={row.id || actualIndex}
              className={`
                cursor-pointer transition-colors hover:bg-muted/50
                ${isSelected ? 'bg-accent' : ''}
              `}
              onClick={() => handleRowClick(row, actualIndex)}
              onKeyDown={handleKeyDown}
              tabIndex={0}
              {...getAriaAttributes({
                selected: isSelected,
                posinset: actualIndex + 1,
                setsize: sortedData.length
              })}
            >
              {selectable && (
                <TableCell className="w-12">
                  <Checkbox
                    checked={isItemSelected(row)}
                    onCheckedChange={(checked) => handleItemSelect(row, checked)}
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Select ${row.name || row.id || 'item'}`}
                  />
                </TableCell>
              )}
              {columns.map((column) => (
                <TableCell key={column.key}>
                  {column.render
                    ? column.render(row[column.key], row, actualIndex)
                    : row[column.key]
                  }
                </TableCell>
              ))}
              {actions.length > 0 && (
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-2">
                    {actions.map((action, actionIndex) => {
                      const Icon = action.icon;
                      return (
                        <button
                          key={actionIndex}
                          onClick={(e) => {
                            e.stopPropagation();
                            action.onClick?.(row);
                          }}
                          className={`p-2 rounded-md hover:bg-gray-100 transition-colors ${action.className || ''}`}
                          title={action.label}
                        >
                          <Icon className="w-4 h-4" />
                        </button>
                      );
                    })}
                  </div>
                </TableCell>
              )}
            </TableRow>
          );
        })}
      </TableBody>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search */}
      {searchable && (
        <div className="flex items-center space-x-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search table..."
            value={searchQuery}
            onChange={handleSearch}
            className="max-w-sm"
            aria-label="Search table data"
          />
        </div>
      )}

      {/* Table */}
      <LoadingWrapper
        isLoading={loading || isLoading('search')}
        error={error}
        loadingComponent={<SkeletonTable rows={5} columns={columns.length} />}
        onRetry={() => window.location.reload()}
      >
        <div className="rounded-md border">
          <div
            style={{
              height: virtualScroll ? 400 : 'auto',
              overflow: virtualScroll ? 'auto' : 'visible'
            }}
            onScroll={virtualScroll ? virtualScrollConfig.handleScroll : undefined}
          >
            <Table
              {...getAriaAttributes({
                label: ariaLabel,
                rowcount: sortedData.length
              })}
            >
              <TableHeader>
                <TableRow>
                  {selectable && (
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectAll}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all items"
                      />
                    </TableHead>
                  )}
                  {columns.map((column) => (
                    <TableHead
                      key={column.key}
                      className={column.sortable ? 'cursor-pointer hover:bg-muted/50' : ''}
                      onClick={column.sortable ? () => handleSort(column.key) : undefined}
                      {...getAriaAttributes({
                        sort: sortConfig.key === column.key
                          ? sortConfig.direction === 'asc' ? 'ascending' : 'descending'
                          : 'none'
                      })}
                    >
                      <div className="flex items-center space-x-2">
                        <span>{column.header || column.title}</span>
                        {column.sortable && getSortIcon(column.key)}
                      </div>
                    </TableHead>
                  ))}
                  {actions.length > 0 && (
                    <TableHead className="text-right">
                      <span>Actions</span>
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>

              {virtualScroll ? (
                <div
                  style={{
                    height: virtualScrollConfig.totalHeight,
                    position: 'relative'
                  }}
                >
                  <div
                    style={{
                      transform: `translateY(${virtualScrollConfig.offsetY}px)`
                    }}
                  >
                    {renderTableContent()}
                  </div>
                </div>
              ) : (
                renderTableContent()
              )}
            </Table>
          </div>
        </div>
      </LoadingWrapper>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {pagination.from}-{pagination.to} of {pagination.total} results
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={pagination.onPrevious}
              disabled={!pagination.hasPrevious}
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <span className="text-sm">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={pagination.onNext}
              disabled={!pagination.hasNext}
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default withPerformanceOptimization(DataTable, {
  memoize: true,
  monitorPerformance: true
});
