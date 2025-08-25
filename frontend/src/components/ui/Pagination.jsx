import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './index';

export const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  perPage,
  onPageChange,
  onPerPageChange,
  perPageOptions = [10, 15, 25, 50],
  showPerPageSelector = true,
  showPageInfo = true,
  className = '',
  size = 'default'
}) => {
  if (totalPages <= 1) return null;

  const startItem = ((currentPage - 1) * perPage) + 1;
  const endItem = Math.min(currentPage * perPage, totalItems);

  // Get visible page numbers
  const getVisiblePages = () => {
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const halfVisible = Math.floor(maxVisible / 2);
    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    // Adjust if we're near the end
    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  };

  const visiblePages = getVisiblePages();

  return (
    <div className={`flex items-center justify-between ${className}`}>
      {/* Page Information */}
      {showPageInfo && (
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-700">
            Showing {startItem} to {endItem} of {totalItems} results
          </div>

          {/* Per Page Selector */}
          {showPerPageSelector && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Per page:</span>
              <Select
                value={perPage.toString()}
                onValueChange={(value) => onPerPageChange(parseInt(value))}
              >
                <SelectTrigger className="w-20">
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
          )}
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex items-center gap-2">
        {/* Previous Button */}
        <Button
          variant="outline"
          size={size}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {/* First Page */}
          {currentPage > 3 && (
            <>
              <Button
                variant="outline"
                size={size}
                onClick={() => onPageChange(1)}
                className="w-8 h-8 p-0"
              >
                1
              </Button>
              {currentPage > 4 && (
                <span className="px-2 text-gray-500">
                  <MoreHorizontal className="w-4 h-4" />
                </span>
              )}
            </>
          )}

          {/* Visible Page Numbers */}
          {visiblePages.map(page => (
            <Button
              key={page}
              variant={page === currentPage ? "default" : "outline"}
              size={size}
              onClick={() => onPageChange(page)}
              className="w-8 h-8 p-0"
            >
              {page}
            </Button>
          ))}

          {/* Last Page */}
          {currentPage < totalPages - 2 && (
            <>
              {currentPage < totalPages - 3 && (
                <span className="px-2 text-gray-500">
                  <MoreHorizontal className="w-4 h-4" />
                </span>
              )}
              <Button
                variant="outline"
                size={size}
                onClick={() => onPageChange(totalPages)}
                className="w-8 h-8 p-0"
              >
                {totalPages}
              </Button>
            </>
          )}
        </div>

        {/* Next Button */}
        <Button
          variant="outline"
          size={size}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
