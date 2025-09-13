import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
  RefreshCw,
  Download,
  Upload,
  Filter,
  X
} from 'lucide-react';

/**
 * Advanced pagination component
 */
export const AdvancedPagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  onItemsPerPageChange,
  showItemsPerPage = true,
  showTotalItems = true,
  showPageInfo = true,
  showQuickJump = true,
  showPageSizeOptions = true,
  pageSizeOptions = [10, 25, 50, 100],
  maxVisiblePages = 5,
  className = '',
  disabled = false,
  loading = false
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getVisiblePages = () => {
    const pages = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, currentPage + halfVisible);

    if (endPage - startPage + 1 < maxVisiblePages) {
      if (startPage === 1) {
        endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      } else {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage && !disabled && !loading) {
      onPageChange?.(page);
    }
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    if (newItemsPerPage !== itemsPerPage && !disabled && !loading) {
      onItemsPerPageChange?.(newItemsPerPage);
    }
  };

  const handleQuickJump = (e) => {
    const page = parseInt(e.target.value);
    if (page >= 1 && page <= totalPages) {
      handlePageChange(page);
    }
  };

  const visiblePages = getVisiblePages();
  const showFirstEllipsis = visiblePages[0] > 1;
  const showLastEllipsis = visiblePages[visiblePages.length - 1] < totalPages;

  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center justify-between space-x-4 ${className}`}>
      {/* Left side - Items info and page size */}
      <div className="flex items-center space-x-4">
        {showTotalItems && (
          <div className="text-sm text-muted-foreground">
            Showing {startItem.toLocaleString('id-ID')} to {endItem.toLocaleString('id-ID')} of {totalItems.toLocaleString('id-ID')} items
          </div>
        )}

        {showItemsPerPage && showPageSizeOptions && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Show:</span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => handleItemsPerPageChange(parseInt(value))}
              disabled={disabled || loading}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">per page</span>
          </div>
        )}
      </div>

      {/* Center - Page navigation */}
      <div className="flex items-center space-x-1">
        {/* First page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1 || disabled || loading}
          className="h-8 w-8 p-0"
        >
          <ChevronsLeft className="w-4 h-4" />
        </Button>

        {/* Previous page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || disabled || loading}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {/* First page if not visible */}
        {showFirstEllipsis && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(1)}
              disabled={disabled || loading}
              className="h-8 w-8 p-0"
            >
              1
            </Button>
            <div className="flex items-center justify-center h-8 w-8">
              <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
            </div>
          </>
        )}

        {/* Visible pages */}
        {visiblePages.map((page) => (
          <Button
            key={page}
            variant={page === currentPage ? "default" : "outline"}
            size="sm"
            onClick={() => handlePageChange(page)}
            disabled={disabled || loading}
            className="h-8 w-8 p-0"
          >
            {page}
          </Button>
        ))}

        {/* Last page if not visible */}
        {showLastEllipsis && (
          <>
            <div className="flex items-center justify-center h-8 w-8">
              <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(totalPages)}
              disabled={disabled || loading}
              className="h-8 w-8 p-0"
            >
              {totalPages}
            </Button>
          </>
        )}

        {/* Next page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || disabled || loading}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>

        {/* Last page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages || disabled || loading}
          className="h-8 w-8 p-0"
        >
          <ChevronsRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Right side - Quick jump */}
      {showQuickJump && (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Go to:</span>
          <Input
            type="number"
            min="1"
            max={totalPages}
            placeholder="Page"
            className="w-20 h-8"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleQuickJump(e);
              }
            }}
            disabled={disabled || loading}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const input = document.querySelector('input[type="number"]');
              if (input) {
                handleQuickJump({ target: input });
              }
            }}
            disabled={disabled || loading}
            className="h-8 px-2"
          >
            Go
          </Button>
        </div>
      )}
    </div>
  );
};

/**
 * Simple pagination component
 */
export const SimplePagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  className = '',
  disabled = false,
  loading = false
}) => {
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage && !disabled && !loading) {
      onPageChange?.(page);
    }
  };

  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1 || disabled || loading}
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Previous
      </Button>

      <span className="text-sm text-muted-foreground px-4">
        Page {currentPage} of {totalPages}
      </span>

      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages || disabled || loading}
      >
        Next
        <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );
};

/**
 * Compact pagination component
 */
export const CompactPagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  className = '',
  disabled = false,
  loading = false
}) => {
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage && !disabled && !loading) {
      onPageChange?.(page);
    }
  };

  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1 || disabled || loading}
        className="h-8 w-8 p-0"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      <div className="flex items-center space-x-1">
        <span className="text-sm text-muted-foreground px-2">
          {currentPage} / {totalPages}
        </span>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages || disabled || loading}
        className="h-8 w-8 p-0"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
};

/**
 * Pagination with page size selector
 */
export const PaginationWithSize = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  onItemsPerPageChange,
  pageSizeOptions = [10, 25, 50, 100],
  className = '',
  disabled = false,
  loading = false
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="text-sm text-muted-foreground">
        Showing {startItem.toLocaleString('id-ID')} to {endItem.toLocaleString('id-ID')} of {totalItems.toLocaleString('id-ID')} items
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Show:</span>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => onItemsPerPageChange?.(parseInt(value))}
            disabled={disabled || loading}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <SimplePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          disabled={disabled}
          loading={loading}
        />
      </div>
    </div>
  );
};

/**
 * Pagination with quick actions
 */
export const PaginationWithActions = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  onItemsPerPageChange,
  onRefresh,
  onExport,
  onImport,
  pageSizeOptions = [10, 25, 50, 100],
  className = '',
  disabled = false,
  loading = false
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {totalItems.toLocaleString('id-ID')} total items
        </div>

        <div className="flex items-center space-x-2">
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={disabled || loading}
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
              disabled={disabled || loading}
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
              disabled={disabled || loading}
            >
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
          )}
        </div>
      </div>

      <PaginationWithSize
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={onPageChange}
        onItemsPerPageChange={onItemsPerPageChange}
        pageSizeOptions={pageSizeOptions}
        disabled={disabled}
        loading={loading}
      />
    </div>
  );
};

/**
 * Pagination with filters
 */
export const PaginationWithFilters = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  onItemsPerPageChange,
  onFilterChange,
  onSortChange,
  filters = [],
  sortOptions = [],
  className = '',
  disabled = false,
  loading = false
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-sm text-muted-foreground">
            {totalItems.toLocaleString('id-ID')} total items
          </div>

          {filters.length > 0 && (
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Filters:</span>
              {filters.map((filter, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => onFilterChange?.(filter)}
                  className="h-6 px-2"
                >
                  {filter.label}
                  <X className="w-3 h-3 ml-1" />
                </Button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {sortOptions.length > 0 && (
            <Select onValueChange={onSortChange} disabled={disabled || loading}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <PaginationWithSize
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={onPageChange}
        onItemsPerPageChange={onItemsPerPageChange}
        disabled={disabled}
        loading={loading}
      />
    </div>
  );
};

export default {
  AdvancedPagination,
  SimplePagination,
  CompactPagination,
  PaginationWithSize,
  PaginationWithActions,
  PaginationWithFilters
};
