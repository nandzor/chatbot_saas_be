import React, { forwardRef, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { Button, Select, SelectItem } from './index';
import { cn } from '@/lib/utils';

/**
 * Simple and Functional Pagination Component
 *
 * Features:
 * - Clean, simple implementation
 * - Multiple variants (compact, full, minimal, table)
 * - Accessibility support
 * - Loading states
 * - Responsive design
 */

const Pagination = forwardRef(({
  // Core props
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  perPage = 10,
  onPageChange,
  onPerPageChange,

  // Configuration
  perPageOptions = [10, 15, 25, 50, 100],
  maxVisiblePages = 5,
  variant = 'full',
  size = 'default',

  // Display options
  showPerPageSelector = true,
  showPageInfo = true,
  showFirstLast = true,
  showPrevNext = true,
  showPageNumbers = true,

  // States
  loading = false,
  disabled = false,

  // Styling
  className = '',
  pageInfoClassName = '',
  controlsClassName = '',

  // Accessibility
  ariaLabel = 'Pagination navigation',

  // Event handlers
  onFirstPage,
  onLastPage,
  onPrevPage,
  onNextPage,

  ...props
}, ref) => {
  // Size classes
  const sizeClasses = {
    sm: {
      button: 'h-8 px-2 text-xs',
      pageButton: 'w-7 h-7 text-xs',
      icon: 'w-3 h-3',
      text: 'text-xs'
    },
    default: {
      button: 'h-9 px-3 text-sm',
      pageButton: 'w-8 h-8 text-sm',
      icon: 'w-4 h-4',
      text: 'text-sm'
    },
    lg: {
      button: 'h-10 px-4 text-base',
      pageButton: 'w-10 h-10 text-base',
      icon: 'w-5 h-5',
      text: 'text-base'
    }
  };

  const currentSize = sizeClasses[size];

  // Don't render if only one page and no page info
  if (totalPages <= 1 && !showPageInfo) return null;

  // Memoized calculations
  const pageInfo = useMemo(() => {
    const startItem = totalItems > 0 ? ((currentPage - 1) * perPage) + 1 : 0;
    const endItem = Math.min(currentPage * perPage, totalItems);
    return { startItem, endItem };
  }, [currentPage, perPage, totalItems]);

  // Memoized visible pages
  const visiblePages = useMemo(() => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const halfVisible = Math.floor(maxVisiblePages / 2);
    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
    const result = [];

    if (startPage > 1) {
      result.push(1);
      if (startPage > 2) result.push('...');
    }

    result.push(...pages);

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) result.push('...');
      result.push(totalPages);
    }

    return result;
  }, [currentPage, totalPages, maxVisiblePages]);

  // Event handlers
  const handlePageChange = (page) => {
    if (onPageChange && typeof onPageChange === 'function' && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const handlePerPageChange = (newPerPage) => {
    if (onPerPageChange && typeof onPerPageChange === 'function') {
      onPerPageChange(newPerPage);
    }
  };

  // Navigation button component
  const NavButton = ({ onClick, disabled: btnDisabled, children, icon: Icon, label, variant = "outline" }) => (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled || loading || btnDisabled}
      className={cn(currentSize.button, 'flex items-center gap-1')}
      aria-label={label}
    >
      {Icon && <Icon className={currentSize.icon} />}
      {children}
    </Button>
  );

  // Page number button
  const PageButton = ({ pageNum, isActive = false }) => {
    if (pageNum === '...') {
      return (
        <span className="px-2 text-gray-500">
          <MoreHorizontal className={currentSize.icon} />
        </span>
      );
    }

    return (
      <Button
        variant={isActive ? "default" : "outline"}
        size={size}
        onClick={() => handlePageChange(pageNum)}
        disabled={disabled || loading}
        className={cn(currentSize.pageButton, 'p-0')}
        aria-label={`Go to page ${pageNum}`}
        aria-current={isActive ? 'page' : undefined}
      >
        {pageNum}
      </Button>
    );
  };

  // Page info component
  const PageInfo = () => {
    if (!showPageInfo) return null;

    return (
      <div className={cn('flex items-center space-x-4', pageInfoClassName)}>
        <div className={cn('text-gray-700', currentSize.text)}>
          Showing {pageInfo.startItem} to {pageInfo.endItem} of {totalItems} results
        </div>
      </div>
    );
  };

  // Per page selector component
  const PerPageSelector = () => {
    if (!showPerPageSelector || !onPerPageChange) return null;

    return (
      <div className="flex items-center space-x-2">
        <span className={cn('text-gray-500', currentSize.text)}>Per page:</span>
        <Select
          value={perPage.toString()}
          onValueChange={(value) => handlePerPageChange(parseInt(value))}
          disabled={disabled || loading}
          placeholder="Select"
          className={cn('w-20', currentSize.button)}
        >
          {perPageOptions.map(option => (
            <SelectItem key={option} value={option.toString()}>
              {option}
            </SelectItem>
          ))}
        </Select>
      </div>
    );
  };

  // Navigation controls component
  const NavigationControls = () => (
    <div className={cn('flex items-center gap-1', controlsClassName)}>
      {showFirstLast && (
        <NavButton
          onClick={() => onFirstPage?.() || handlePageChange(1)}
          disabled={currentPage === 1}
          icon={ChevronsLeft}
          label="Go to first page"
        />
      )}

      {showPrevNext && (
        <NavButton
          onClick={() => onPrevPage?.() || handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          icon={ChevronLeft}
          label="Go to previous page"
        />
      )}

      {showPageNumbers && (
        <div className="flex items-center gap-1">
          {visiblePages.map((pageNum, index) => (
            <PageButton key={pageNum === '...' ? `ellipsis-${index}` : pageNum} pageNum={pageNum} isActive={pageNum === currentPage} />
          ))}
        </div>
      )}

      {showPrevNext && (
        <NavButton
          onClick={() => onNextPage?.() || handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          icon={ChevronRight}
          label="Go to next page"
        />
      )}

      {showFirstLast && (
        <NavButton
          onClick={() => onLastPage?.() || handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          icon={ChevronsRight}
          label="Go to last page"
        />
      )}
    </div>
  );

  // Render based on variant
  const renderVariant = () => {
    const commonProps = { className, ref, ...props };

    switch (variant) {
      case 'compact':
        return (
          <div className={cn('flex items-center justify-between')} {...commonProps}>
            <PageInfo />
            <div className="flex items-center gap-1">
              <span className={cn('px-3 text-gray-700', currentSize.text)}>
                {currentPage} of {totalPages}
              </span>
            </div>
            <NavigationControls />
          </div>
        );

      case 'minimal':
        return (
          <div className={cn('flex items-center justify-center gap-2')} {...commonProps}>
            <NavigationControls />
            <span className={cn('px-3 text-gray-700', currentSize.text)}>
              Page {currentPage} of {totalPages}
            </span>
          </div>
        );

      case 'table':
        return (
          <div className={cn('flex items-center justify-between')} {...commonProps}>
            <div className="flex items-center space-x-4">
              <PageInfo />
              <PerPageSelector />
            </div>
            <NavigationControls />
          </div>
        );

      default: // 'full'
        return (
          <div className={cn('flex items-center justify-between')} {...commonProps}>
            <div className="flex items-center space-x-4">
              <PageInfo />
              <PerPageSelector />
            </div>
            <NavigationControls />
          </div>
        );
    }
  };

  return (
    <nav
      role="navigation"
      aria-label={ariaLabel}
      aria-live="polite"
    >
      {renderVariant()}
    </nav>
  );
});

Pagination.displayName = 'Pagination';

export default Pagination;
