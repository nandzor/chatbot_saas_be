import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import {Select, SelectItem} from './select';
import { Checkbox } from './checkbox';
import { Badge } from './badge';
import {
  Search,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  Calendar,
  SlidersHorizontal,
  RotateCcw,
  Download,
  Upload
} from 'lucide-react';

/**
 * Advanced search input with suggestions
 */
export const AdvancedSearchInput = ({
  value,
  onChange,
  placeholder = 'Search...',
  suggestions = [],
  onSuggestionSelect,
  className = ''
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState(suggestions);

  useEffect(() => {
    if (value && suggestions.length > 0) {
      const filtered = suggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [value, suggestions]);

  const handleSuggestionClick = (suggestion) => {
    onChange(suggestion);
    onSuggestionSelect?.(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="pl-10"
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        />
      </div>
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border rounded-md shadow-lg">
          {filteredSuggestions.map((suggestion, index) => (
            <div
              key={index}
              className="px-3 py-2 hover:bg-muted cursor-pointer text-sm"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Filter dropdown component
 */
export const FilterDropdown = ({
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Select...',
  multiple = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (optionValue) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      const newValues = currentValues.includes(optionValue)
        ? currentValues.filter(v => v !== optionValue)
        : [...currentValues, optionValue];
      onChange(newValues);
    } else {
      onChange(optionValue);
      setIsOpen(false);
    }
  };

  const handleRemove = (optionValue) => {
    if (multiple && Array.isArray(value)) {
      onChange(value.filter(v => v !== optionValue));
    }
  };

  const getDisplayValue = () => {
    if (multiple && Array.isArray(value)) {
      return value.length > 0 ? `${value.length} selected` : placeholder;
    }
    const option = options.find(opt => opt.value === value);
    return option ? option.label : placeholder;
  };

  return (
    <div className={`relative ${className}`}>
      <Label className="text-sm font-medium mb-2 block">{label}</Label>
      <div className="relative">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full justify-between"
        >
          <span className="truncate">{getDisplayValue()}</span>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
        {isOpen && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border rounded-md shadow-lg">
            <div className="p-2">
              {options.map((option) => (
                <div key={option.value} className="flex items-center space-x-2 p-2 hover:bg-muted rounded">
                  {multiple && (
                    <Checkbox
                      checked={Array.isArray(value) && value.includes(option.value)}
                      onCheckedChange={() => handleSelect(option.value)}
                    />
                  )}
                  <span
                    className={`flex-1 text-sm cursor-pointer ${!multiple ? 'hover:bg-muted p-1 rounded' : ''}`}
                    onClick={() => !multiple && handleSelect(option.value)}
                  >
                    {option.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {multiple && Array.isArray(value) && value.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {value.map((val) => {
            const option = options.find(opt => opt.value === val);
            return (
              <Badge key={val} variant="secondary" className="text-xs">
                {option ? option.label : val}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(val)}
                  className="h-4 w-4 p-0 ml-1"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
};

/**
 * Date range filter
 */
export const DateRangeFilter = ({
  label,
  value,
  onChange,
  className = ''
}) => {
  const [startDate, setStartDate] = useState(value?.start || '');
  const [endDate, setEndDate] = useState(value?.end || '');

  useEffect(() => {
    onChange({ start: startDate, end: endDate });
  }, [startDate, endDate, onChange]);

  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="text-sm font-medium">{label}</Label>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs text-muted-foreground">From</Label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="text-sm"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">To</Label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="text-sm"
          />
        </div>
      </div>
    </div>
  );
};

/**
 * Number range filter
 */
export const NumberRangeFilter = ({
  label,
  value,
  onChange,
  min = 0,
  max = 1000,
  step = 1,
  className = ''
}) => {
  const [minValue, setMinValue] = useState(value?.min || min);
  const [maxValue, setMaxValue] = useState(value?.max || max);

  useEffect(() => {
    onChange({ min: minValue, max: maxValue });
  }, [minValue, maxValue, onChange]);

  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="text-sm font-medium">{label}</Label>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs text-muted-foreground">Min</Label>
          <Input
            type="number"
            value={minValue}
            onChange={(e) => setMinValue(Number(e.target.value))}
            min={min}
            max={max}
            step={step}
            className="text-sm"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Max</Label>
          <Input
            type="number"
            value={maxValue}
            onChange={(e) => setMaxValue(Number(e.target.value))}
            min={min}
            max={max}
            step={step}
            className="text-sm"
          />
        </div>
      </div>
    </div>
  );
};

/**
 * Advanced filters panel
 */
export const AdvancedFiltersPanel = ({
  filters = [],
  onFiltersChange,
  onClearAll,
  onApply,
  onReset,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (filterKey, value) => {
    const newFilters = localFilters.map(filter =>
      filter.key === filterKey ? { ...filter, value } : filter
    );
    setLocalFilters(newFilters);
  };

  const handleApply = () => {
    onFiltersChange?.(localFilters);
    onApply?.(localFilters);
  };

  const handleReset = () => {
    const resetFilters = localFilters.map(filter => ({ ...filter, value: filter.defaultValue }));
    setLocalFilters(resetFilters);
    onFiltersChange?.(resetFilters);
    onReset?.(resetFilters);
  };

  const handleClearAll = () => {
    const clearedFilters = localFilters.map(filter => ({ ...filter, value: null }));
    setLocalFilters(clearedFilters);
    onFiltersChange?.(clearedFilters);
    onClearAll?.(clearedFilters);
  };

  const activeFiltersCount = localFilters.filter(filter =>
    filter.value !== null && filter.value !== undefined && filter.value !== ''
  ).length;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <SlidersHorizontal className="h-5 w-5" />
            <CardTitle className="text-lg">Filters</CardTitle>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary">{activeFiltersCount}</Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
        <CardDescription>
          Apply filters to narrow down your results
        </CardDescription>
      </CardHeader>
      {isExpanded && (
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {localFilters.map((filter) => (
              <div key={filter.key}>
                {filter.type === 'search' && (
                  <AdvancedSearchInput
                    value={filter.value || ''}
                    onChange={(value) => handleFilterChange(filter.key, value)}
                    placeholder={filter.placeholder}
                    suggestions={filter.suggestions}
                  />
                )}
                {filter.type === 'select' && (
                  <FilterDropdown
                    label={filter.label}
                    value={filter.value}
                    onChange={(value) => handleFilterChange(filter.key, value)}
                    options={filter.options}
                    placeholder={filter.placeholder}
                    multiple={filter.multiple}
                  />
                )}
                {filter.type === 'dateRange' && (
                  <DateRangeFilter
                    label={filter.label}
                    value={filter.value}
                    onChange={(value) => handleFilterChange(filter.key, value)}
                  />
                )}
                {filter.type === 'numberRange' && (
                  <NumberRangeFilter
                    label={filter.label}
                    value={filter.value}
                    onChange={(value) => handleFilterChange(filter.key, value)}
                    min={filter.min}
                    max={filter.max}
                    step={filter.step}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between pt-4 border-t">
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleClearAll}>
                <X className="h-4 w-4 mr-2" />
                Clear All
              </Button>
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
            <Button onClick={handleApply}>
              Apply Filters
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

/**
 * Quick filter chips
 */
export const QuickFilterChips = ({
  filters = [],
  onFilterChange,
  onClearAll,
  className = ''
}) => {
  const handleFilterClick = (filterKey, value) => {
    onFilterChange?.(filterKey, value);
  };

  const handleClearAll = () => {
    onClearAll?.();
  };

  const activeFiltersCount = filters.filter(filter =>
    filter.value !== null && filter.value !== undefined && filter.value !== ''
  ).length;

  if (activeFiltersCount === 0) return null;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {filters.map((filter) => {
        if (!filter.value || filter.value === '') return null;

        return (
          <Badge key={filter.key} variant="secondary" className="text-sm">
            {filter.label}: {Array.isArray(filter.value) ? filter.value.join(', ') : filter.value}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleFilterClick(filter.key, null)}
              className="h-4 w-4 p-0 ml-2"
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        );
      })}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClearAll}
        className="text-xs"
      >
        Clear All
      </Button>
    </div>
  );
};

/**
 * Export/Import filters
 */
export const FilterExportImport = ({
  onExport,
  onImport,
  className = ''
}) => {
  const handleExport = () => {
    onExport?.();
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const filters = JSON.parse(e.target.result);
          onImport?.(filters);
        } catch (error) {
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className={`flex space-x-2 ${className}`}>
      <Button variant="outline" size="sm" onClick={handleExport}>
        <Download className="h-4 w-4 mr-2" />
        Export
      </Button>
      <Button variant="outline" size="sm" asChild>
        <label>
          <Upload className="h-4 w-4 mr-2" />
          Import
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </label>
      </Button>
    </div>
  );
};

export default {
  AdvancedSearchInput,
  FilterDropdown,
  DateRangeFilter,
  NumberRangeFilter,
  AdvancedFiltersPanel,
  QuickFilterChips,
  FilterExportImport
};
