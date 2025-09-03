import React, { forwardRef, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './index';
import { cn } from '@/lib/utils';

/**
 * Enhanced Pagination Component with Multiple Variants
 *
 * Features:
 * - Multiple display variants (compact, full, minimal, table)
 * - Accessibility support
 * - Loading states
 * - Customizable styling
 * - Responsive design
 * - Keyboard navigation
 */

// Constants
const SIZE_CLASSES = {
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

const DEFAULT_PROPS = {
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  perPage: 15,
  perPageOptions: [10, 15, 25, 50, 100],
  maxVisiblePages: 5,
  variant: 'full',
  size: 'default',
  showPerPageSelector: true,
  showPageInfo: true,
  showFirstLast: true,
  showPrevNext: true,
  showPageNumbers: true,
  showProgress: false,
  loading: false,
  disabled: false,
  className: '',
  pageInfoClassName: '',
  controlsClassName: '',
  ariaLabel: 'Pagination navigation'
};

const Pagination = forwardRef(({
  // Core props
  currentPage,
  totalPages,
  totalItems,
  perPage,
  onPageChange,
  onPerPageChange,

  // Configuration
  perPageOptions,
  maxVisiblePages,
  variant,
  size,

  // Display options
  showPerPageSelector,
  showPageInfo,
  showFirstLast,
  showPrevNext,
  showPageNumbers,
  showProgress,

  // States
  loading,
  disabled,

  // Styling
  className,
  pageInfoClassName,
  controlsClassName,

  // Accessibility
  ariaLabel,

  // Custom renderers
  renderPageInfo,
  renderPerPageSelector,
  renderPageButton,

  // Event handlers
  onFirstPage,
  onLastPage,
  onPrevPage,
  onNextPage,

  ...props
}, ref) => {
  // Merge with defaults
  const config = { ...DEFAULT_PROPS, ...props };
  const {
    currentPage: page,
    totalPages: total,
    totalItems: items,
    perPage: perPageSize,
    variant: variantType,
    size: sizeType,
    showPerPageSelector: showPerPage,
    showPageInfo: showInfo,
    showFirstLast: showFirst,
    showPrevNext: showPrev,
    showPageNumbers: showNumbers,
    showProgress: showProg,
    loading: isLoading,
    disabled: isDisabled,
    className: clsName,
    pageInfoClassName: pageInfoCls,
    controlsClassName: controlsCls,
    ariaLabel: aria
  } = config;

  // Don't render if only one page and no page info
  if (total <= 1 && !showInfo) return null;

  // Memoized calculations
  const pageInfo = useMemo(() => {
    const startItem = items > 0 ? ((page - 1) * perPageSize) + 1 : 0;
    const endItem = Math.min(page * perPageSize, items);
    const progress = total > 0 ? Math.round((page / total) * 100) : 0;
    return { startItem, endItem, progress };
  }, [page, perPageSize, items, total]);

  // Memoized visible pages
  const visiblePages = useMemo(() => {
    if (total <= maxVisiblePages) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const halfVisible = Math.floor(maxVisiblePages / 2);
    let startPage = Math.max(1, page - halfVisible);
    let endPage = Math.min(total, startPage + maxVisiblePages - 1);

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

    if (endPage < total) {
      if (endPage < total - 1) result.push('...');
      result.push(total);
    }

    return result;
  }, [page, total, maxVisiblePages]);

  // Event handlers
  const handlers = useMemo(() => ({
    first: () => onFirstPage?.() || onPageChange?.(1),
    last: () => onLastPage?.() || onPageChange?.(total),
    prev: () => onPrevPage?.() || onPageChange?.(page - 1),
    next: () => onNextPage?.() || onPageChange?.(page + 1)
  }), [onFirstPage, onLastPage, onPrevPage, onNextPage, onPageChange, page, total]);

  const currentSize = SIZE_CLASSES[sizeType];

  // Reusable button component
  const PaginationButton = ({
    onClick,
    disabled: btnDisabled,
    children,
    icon: Icon,
    label,
    variant = "outline",
    showText = false
  }) => (
    <Button
      variant={variant}
      size={sizeType}
      onClick={onClick}
      disabled={isDisabled || isLoading || btnDisabled}
      className={cn(currentSize.button, 'flex items-center gap-1')}
      aria-label={label}
    >
      {Icon && <Icon className={currentSize.icon} />}
      {showText && children}
    </Button>
  );

  // Page number button
  const PageButton = ({ pageNum, isActive = false }) => {
    if (renderPageButton) {
      return renderPageButton({ page: pageNum, isActive, onClick: () => onPageChange(pageNum) });
    }

    if (pageNum === '...') {
      return (
        <span key="ellipsis" className="px-2 text-gray-500">
          <MoreHorizontal className={currentSize.icon} />
        </span>
      );
    }

    return (
      <Button
        key={pageNum}
        variant={isActive ? "default" : "outline"}
        size={sizeType}
        onClick={() => onPageChange(pageNum)}
        disabled={isDisabled || isLoading}
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
    if (renderPageInfo) {
      return renderPageInfo({
        startItem: pageInfo.startItem,
        endItem: pageInfo.endItem,
        totalItems: items,
        currentPage: page,
        totalPages: total
      });
    }

    if (!showInfo) return null;

    return (
      <div className={cn('flex items-center space-x-4', pageInfoCls)}>
        <div className={cn('text-gray-700', currentSize.text)}>
          Showing {pageInfo.startItem} to {pageInfo.endItem} of {items} results
        </div>

        {showProg && total > 1 && (
          <div className="flex items-center space-x-2">
            <div className="w-16 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${pageInfo.progress}%` }}
              />
            </div>
            <span className={cn('text-gray-500', currentSize.text)}>
              {pageInfo.progress}%
            </span>
          </div>
        )}
      </div>
    );
  };

  // Per page selector component
  const PerPageSelector = () => {
    if (renderPerPageSelector) {
      return renderPerPageSelector({ perPage: perPageSize, perPageOptions, onPerPageChange });
    }

    if (!showPerPage || !onPerPageChange) return null;

    return (
      <div className="flex items-center space-x-2">
        <span className={cn('text-gray-500', currentSize.text)}>Per page:</span>
        <Select
          value={perPageSize.toString()}
          onValueChange={(value) => onPerPageChange(parseInt(value))}
          disabled={isDisabled || isLoading}
        >
          <SelectTrigger className={cn('w-20', currentSize.button)}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {perPageOptions.map(option => (
              <SelectItem key={option} value={option.toString()}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  };

  // Navigation controls component
  const NavigationControls = ({ showFirst, showPrev, showNext, showLast, showNumbers, gap = 'gap-1' }) => (
    <div className={cn('flex items-center', gap, controlsCls)}>
      {showFirst && (
        <PaginationButton
          onClick={handlers.first}
          disabled={page === 1}
          icon={ChevronsLeft}
          label="Go to first page"
        />
      )}

      {showPrev && (
        <PaginationButton
          onClick={handlers.prev}
          disabled={page === 1}
          icon={ChevronLeft}
          label="Go to previous page"
          showText={variantType === 'minimal' || variantType === 'table'}
        >
          Previous
        </PaginationButton>
      )}

      {showNumbers && (
        <div className="flex items-center gap-1">
          {visiblePages.map(pageNum => (
            <PageButton key={pageNum} pageNum={pageNum} isActive={pageNum === page} />
          ))}
        </div>
      )}

      {showNext && (
        <PaginationButton
          onClick={handlers.next}
          disabled={page === total}
          icon={ChevronRight}
          label="Go to next page"
          showText={variantType === 'minimal' || variantType === 'table'}
        >
          Next
        </PaginationButton>
      )}

      {showLast && (
        <PaginationButton
          onClick={handlers.last}
          disabled={page === total}
          icon={ChevronsRight}
          label="Go to last page"
        />
      )}
    </div>
  );

  // Variant-specific layouts
  const renderVariant = () => {
    const commonProps = { className: clsName, ref, ...props };

    switch (variantType) {
      case 'compact':
        return (
          <div className={cn('flex items-center justify-between')} {...commonProps}>
            <PageInfo />
            <div className="flex items-center gap-1">
              <span className={cn('px-3 text-gray-700', currentSize.text)}>
                {page} of {total}
              </span>
            </div>
            <NavigationControls
              showFirst={showFirst}
              showPrev={showPrev}
              showNext={showPrev}
              showLast={showFirst}
            />
          </div>
        );

      case 'minimal':
        return (
          <div className={cn('flex items-center justify-center gap-2')} {...commonProps}>
            <NavigationControls
              showPrev={showPrev}
              showNext={showPrev}
              showNumbers={false}
            />
            <span className={cn('px-3 text-gray-700', currentSize.text)}>
              Page {page} of {total}
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
            <NavigationControls
              showPrev={showPrev}
              showNext={showPrev}
              showNumbers={showNumbers}
            />
          </div>
        );

      default: // 'full'
        return (
          <div className={cn('flex items-center justify-between')} {...commonProps}>
            <div className="flex items-center space-x-4">
              <PageInfo />
              <PerPageSelector />
            </div>
            <NavigationControls
              showFirst={showFirst}
              showPrev={showPrev}
              showNext={showPrev}
              showLast={showFirst}
              showNumbers={showNumbers}
              gap="gap-2"
            />
          </div>
        );
    }
  };

  return (
    <nav
      role="navigation"
      aria-label={aria}
      aria-live="polite"
    >
      {renderVariant()}
    </nav>
  );
});

Pagination.displayName = 'Pagination';

export default Pagination;
