import React, { useState, useMemo } from 'react';
import {
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Button,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Switch,
  Label,
  Separator
} from '@/components/ui';
import {
  Search,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  Calendar as CalendarIcon,
  SlidersHorizontal,
  RefreshCw,
  Download,
  Upload
} from 'lucide-react';

/**
 * Professional FilterBar Component
 * Provides comprehensive filtering capabilities with advanced options and professional UI
 */
export const FilterBar = ({
  // Core props
  filters = {},
  onFilterChange,
  onReset,
  onExport,
  onImport,

  // Configuration
  filterConfig = [],
  searchPlaceholder = "Search...",
  showClearButton = true,
  showAdvancedFilters = false,
  showExportImport = false,

  // Styling
  className = "",
  size = 'default',
  variant = 'default',
  collapsible = false,
  defaultCollapsed = false,

  // Advanced features
  enableDateRange = false,
  enableQuickFilters = false,
  quickFilters = [],
  onQuickFilter,

  // State
  loading = false,
  hasActiveFilters = false,
  activeFilterCount = 0,

  // Callbacks
  onFilterApply,
  onFilterCancel,
  onFilterSave,
  onFilterLoad,

  // Custom renderers
  renderCustomFilter,
  renderFilterValue
}) => {

  // Local state
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [showAdvanced, setShowAdvanced] = useState(showAdvancedFilters);
  const [localFilters, setLocalFilters] = useState(filters);
  const [isApplying, setIsApplying] = useState(false);

  // Size configurations
  const sizeConfig = {
    sm: {
      padding: 'p-3',
      gap: 'gap-2',
      inputHeight: 'h-8',
      buttonHeight: 'h-8',
      textSize: 'text-sm',
      iconSize: 'w-4 h-4'
    },
    default: {
      padding: 'p-4',
      gap: 'gap-3',
      inputHeight: 'h-10',
      buttonHeight: 'h-10',
      textSize: 'text-sm',
      iconSize: 'w-4 h-4'
    },
    lg: {
      padding: 'p-6',
      gap: 'gap-4',
      inputHeight: 'h-12',
      buttonHeight: 'h-12',
      textSize: 'text-base',
      iconSize: 'w-5 h-5'
    }
  };

  const config = sizeConfig[size];

  // Variant configurations
  const variantConfig = {
    default: {
      container: 'bg-white border border-gray-200 rounded-lg shadow-sm',
      header: 'border-b border-gray-200',
      content: 'bg-gray-50'
    },
    elevated: {
      container: 'bg-white border border-gray-300 rounded-lg shadow-md',
      header: 'border-b border-gray-300',
      content: 'bg-gray-100'
    },
    minimal: {
      container: 'bg-transparent',
      header: 'border-b border-gray-200',
      content: 'bg-gray-50'
    }
  };

  const variantStyles = variantConfig[variant];

  // Memoized values
  const hasFilters = useMemo(() => {
    return Object.values(localFilters).some(value =>
      value !== '' && value !== null && value !== undefined && value !== false
    );
  }, [localFilters]);

  const hasChanges = useMemo(() => {
    return JSON.stringify(localFilters) !== JSON.stringify(filters);
  }, [localFilters, filters]);

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  // Handle multiple filter changes
  const handleMultipleChanges = (changes) => {
    setLocalFilters(prev => ({ ...prev, ...changes }));
  };

  // Apply filters
  const handleApplyFilters = async () => {
    setIsApplying(true);
    try {
      if (onFilterApply) {
        await onFilterApply(localFilters);
      } else {
        onFilterChange(localFilters);
      }
    } finally {
      setIsApplying(false);
    }
  };

  // Cancel changes
  const handleCancelChanges = () => {
    setLocalFilters(filters);
    setShowAdvanced(showAdvancedFilters);
  };

  // Reset filters
  const handleReset = () => {
    const resetFilters = {};
    filterConfig.forEach(config => {
      resetFilters[config.key] = config.defaultValue || '';
    });

    setLocalFilters(resetFilters);

    if (onReset) {
      onReset(resetFilters);
    } else {
      onFilterChange(resetFilters);
    }
  };

  // Handle quick filter
  const handleQuickFilter = (filter) => {
    if (onQuickFilter) {
      onQuickFilter(filter);
    }
  };

  // Render filter input based on type
  const renderFilterInput = (filterConfig) => {
    const { key, type, label, placeholder, options = [], ...config } = filterConfig;
    const value = localFilters[key] || '';

    switch (type) {
      case 'search':
        return (
          <div key={key} className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${config.iconSize} text-gray-400`} />
              <Input
                placeholder={placeholder || `Search ${label}...`}
                value={value}
                onChange={(e) => handleFilterChange(key, e.target.value)}
                className={`pl-10 ${config.inputHeight} ${config.textSize}`}
                disabled={loading}
              />
            </div>
          </div>
        );

      case 'select':
        return (
          <div key={key} className="min-w-[150px]">
            <Select value={value} onValueChange={(val) => handleFilterChange(key, val)} disabled={loading}>
              <SelectTrigger className={`${config.inputHeight} ${config.textSize}`}>
                <SelectValue placeholder={placeholder || `Select ${label}`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All {label}</SelectItem>
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'multiselect':
        return (
          <div key={key} className="min-w-[200px]">
            <Select
              value={Array.isArray(value) ? value.join(',') : ''}
              onValueChange={(val) => handleFilterChange(key, val ? val.split(',') : [])}
              disabled={loading}
            >
              <SelectTrigger className={`${config.inputHeight} ${config.textSize}`}>
                <SelectValue placeholder={placeholder || `Select ${label}`} />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'boolean':
        return (
          <div key={key} className="flex items-center space-x-2">
            <Switch
              checked={Boolean(value)}
              onCheckedChange={(checked) => handleFilterChange(key, checked)}
              disabled={loading}
            />
            <Label className={config.textSize}>{label}</Label>
          </div>
        );

      case 'date':
        return (
          <div key={key} className="min-w-[150px]">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`justify-start text-left font-normal ${config.buttonHeight} ${config.textSize}`}
                  disabled={loading}
                >
                  <CalendarIcon className={`mr-2 ${config.iconSize}`} />
                  {value ? new Date(value).toLocaleDateString() : placeholder || 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={value ? new Date(value) : undefined}
                  onSelect={(date) => handleFilterChange(key, date ? date.toISOString() : '')}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        );

      case 'daterange':
        return (
          <div key={key} className="min-w-[200px]">
            <div className="flex space-x-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`justify-start text-left font-normal ${config.buttonHeight} ${config.textSize}`}
                    disabled={loading}
                  >
                    <CalendarIcon className={`mr-2 ${config.iconSize}`} />
                    {value?.from ? new Date(value.from).toLocaleDateString() : 'From'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={value?.from ? new Date(value.from) : undefined}
                    onSelect={(date) => handleFilterChange(key, { ...value, from: date ? date.toISOString() : '' })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`justify-start text-left font-normal ${config.buttonHeight} ${config.textSize}`}
                    disabled={loading}
                  >
                    <CalendarIcon className={`mr-2 ${config.iconSize}`} />
                    {value?.to ? new Date(value.to).toLocaleDateString() : 'To'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={value?.to ? new Date(value.to) : undefined}
                    onSelect={(date) => handleFilterChange(key, { ...value, to: date ? date.toISOString() : '' })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        );

      case 'number':
        return (
          <div key={key} className="min-w-[120px]">
            <Input
              type="number"
              placeholder={placeholder || label}
              value={value}
              onChange={(e) => handleFilterChange(key, e.target.value)}
              className={`${config.inputHeight} ${config.textSize}`}
              disabled={loading}
              min={config.min}
              max={config.max}
              step={config.step}
            />
          </div>
        );

      case 'range':
        return (
          <div key={key} className="min-w-[200px]">
            <div className="flex space-x-2">
              <Input
                type="number"
                placeholder="Min"
                value={value?.min || ''}
                onChange={(e) => handleFilterChange(key, { ...value, min: e.target.value })}
                className={`${config.inputHeight} ${config.textSize}`}
                disabled={loading}
                min={config.min}
                max={config.max}
              />
              <Input
                type="number"
                placeholder="Max"
                value={value?.max || ''}
                onChange={(e) => handleFilterChange(key, { ...value, max: e.target.value })}
                className={`${config.inputHeight} ${config.textSize}`}
                disabled={loading}
                min={config.min}
                max={config.max}
              />
            </div>
          </div>
        );

      case 'custom':
        if (renderCustomFilter) {
          return renderCustomFilter(filterConfig, value, handleFilterChange, loading);
        }
        return null;

      default:
        return (
          <div key={key} className="min-w-[150px]">
            <Input
              placeholder={placeholder || label}
              value={value}
              onChange={(e) => handleFilterChange(key, e.target.value)}
              className={`${config.inputHeight} ${config.textSize}`}
              disabled={loading}
            />
          </div>
        );
    }
  };

  // Render filter value for display
  const renderFilterValueDisplay = (key, value) => {
    if (!value || value === '') return null;

    const config = filterConfig.find(f => f.key === key);
    if (!config) return value;

    switch (config.type) {
      case 'select':
      case 'multiselect':
        const option = config.options?.find(opt => opt.value === value);
        return option?.label || value;
      case 'boolean':
        return value ? 'Yes' : 'No';
      case 'date':
        return new Date(value).toLocaleDateString();
      case 'daterange':
        return `${new Date(value.from).toLocaleDateString()} - ${new Date(value.to).toLocaleDateString()}`;
      default:
        return value;
    }
  };

  const FilterContent = () => (
    <div className={`${config.padding} ${config.gap}`}>
      {/* Basic Filters */}
      <div className="flex flex-wrap items-end gap-3">
        {filterConfig.map(renderFilterInput)}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 ml-auto">
          {hasChanges && (
            <>
              <Button
                onClick={handleApplyFilters}
                disabled={loading || isApplying}
                size={size}
                className={config.buttonHeight}
              >
                {isApplying ? (
                  <RefreshCw className={`${config.iconSize} mr-2 animate-spin`} />
                ) : (
                  <Filter className={`${config.iconSize} mr-2`} />
                )}
                Apply
              </Button>
              <Button
                onClick={handleCancelChanges}
                variant="outline"
                size={size}
                className={config.buttonHeight}
                disabled={loading}
              >
                Cancel
              </Button>
            </>
          )}

          {showClearButton && hasFilters && (
            <Button
              onClick={handleReset}
              variant="outline"
              size={size}
              className={config.buttonHeight}
              disabled={loading}
            >
              <X className={`${config.iconSize} mr-2`} />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Quick Filters */}
      {enableQuickFilters && quickFilters.length > 0 && (
        <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
          <span className={`${config.textSize} text-gray-600 font-medium`}>Quick Filters:</span>
          {quickFilters.map((filter, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => handleQuickFilter(filter)}
              className={config.textSize}
              disabled={loading}
            >
              {filter.label}
            </Button>
          ))}
        </div>
      )}

      {/* Export/Import */}
      {showExportImport && (
        <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
          {onExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              className={config.textSize}
              disabled={loading}
            >
              <Download className={`${config.iconSize} mr-2`} />
              Export
            </Button>
          )}
          {onImport && (
            <Button
              variant="outline"
              size="sm"
              onClick={onImport}
              className={config.textSize}
              disabled={loading}
            >
              <Upload className={`${config.iconSize} mr-2`} />
              Import
            </Button>
          )}
        </div>
      )}

      {/* Active Filters Display */}
      {hasFilters && (
        <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
          <span className={`${config.textSize} text-gray-600 font-medium`}>Active Filters:</span>
          {Object.entries(localFilters).map(([key, value]) => {
            const displayValue = renderFilterValue(key, value);
            if (!displayValue) return null;

            return (
              <Badge key={key} variant="secondary" className={config.textSize}>
                {filterConfig.find(f => f.key === key)?.label || key}: {displayValue}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFilterChange(key, '')}
                  className="ml-1 h-auto p-0 hover:bg-transparent"
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );

  if (collapsible) {
    return (
      <Card className={`${variantStyles.container} ${className}`}>
        <Collapsible open={!isCollapsed} onOpenChange={setIsCollapsed}>
          <CollapsibleTrigger asChild>
            <CardHeader className={`${variantStyles.header} ${config.padding} cursor-pointer hover:bg-gray-50`}>
              <div className="flex items-center justify-between">
                <CardTitle className={`${config.textSize} flex items-center gap-2`}>
                  <Filter className={config.iconSize} />
                  Filters
                  {hasFilters && (
                    <Badge variant="secondary" className={config.textSize}>
                      {activeFilterCount || Object.keys(localFilters).filter(key => localFilters[key]).length}
                    </Badge>
                  )}
                </CardTitle>
                {isCollapsed ? (
                  <ChevronDown className={config.iconSize} />
                ) : (
                  <ChevronUp className={config.iconSize} />
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="p-0">
              <FilterContent />
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    );
  }

  return (
    <Card className={`${variantStyles.container} ${className}`}>
      <CardContent className="p-0">
        <FilterContent />
      </CardContent>
    </Card>
  );
};

export default FilterBar;
