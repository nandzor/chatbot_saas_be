import { Search, Filter, X } from 'lucide-react';
import { Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Button, Badge } from './index';

export const FilterBar = ({
  filters,
  onFilterChange,
  onClearFilters,
  searchPlaceholder = "Search...",
  filterOptions = [],
  showClearButton = true,
  className = '',
  size = 'default'
}) => {
  const hasActiveFilters = Object.values(filters).some(value =>
    value !== '' && value !== null && value !== undefined
  );

  const sizeClasses = {
    sm: 'p-3 gap-3',
    default: 'p-4 gap-4',
    lg: 'p-6 gap-6'
  };

  const inputSizes = {
    sm: 'h-8 text-sm',
    default: 'h-10 text-sm',
    lg: 'h-12 text-base'
  };

  const buttonSizes = {
    sm: 'h-8 px-3 text-xs',
    default: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base'
  };

  const handleClearFilters = () => {
    const clearedFilters = {};
    Object.keys(filters).forEach(key => {
      clearedFilters[key] = '';
    });
    onClearFilters(clearedFilters);
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value =>
      value !== '' && value !== null && value !== undefined
    ).length;
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${sizeClasses[size]} ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-2">
              {getActiveFiltersCount()} active
            </Badge>
          )}
        </div>

        {showClearButton && hasActiveFilters && (
          <Button
            variant="ghost"
            size={size}
            onClick={handleClearFilters}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {/* Filter Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Search Input */}
        <div className="lg:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder={searchPlaceholder}
              value={filters.search || ''}
              onChange={(e) => onFilterChange('search', e.target.value)}
              className={`pl-10 ${inputSizes[size]}`}
            />
          </div>
        </div>

        {/* Dynamic Filter Options */}
        {filterOptions.map((option) => (
          <div key={option.key} className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {option.label}
            </label>
            <Select
              value={filters[option.key] || ''}
              onValueChange={(value) => onFilterChange(option.key, value)}
            >
              <SelectTrigger className={inputSizes[size]}>
                <SelectValue placeholder={option.placeholder || `All ${option.label}`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{option.placeholder || `All ${option.label}`}</SelectItem>
                {option.options.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
          {Object.entries(filters).map(([key, value]) => {
            if (!value || value === '') return null;

            const option = filterOptions.find(opt => opt.key === key);
            const label = option?.label || key;
            const displayValue = option?.options?.find(opt => opt.value === value)?.label || value;

            return (
              <Badge
                key={key}
                variant="outline"
                className="flex items-center gap-1"
              >
                {label}: {displayValue}
                <button
                  onClick={() => onFilterChange(key, '')}
                  className="ml-1 hover:text-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FilterBar;
