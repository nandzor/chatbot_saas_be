import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  Calendar,
  User,
  Building2,
  CreditCard,
  Settings,
  Tag,
  Clock,
  CheckCircle,
  RefreshCw,
  Trash2,
  RotateCcw
} from 'lucide-react';

/**
 * Search input with advanced features
 */
export const AdvancedSearchInput = ({
  value,
  onChange,
  placeholder = "Search...",
  onSearch,
  onClear,
  suggestions = [],
  onSuggestionSelect,
  loading = false,
  className = ''
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);

  useEffect(() => {
    if (suggestions.length > 0 && value.length > 0) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [suggestions, value]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedSuggestionIndex >= 0 && suggestions[selectedSuggestionIndex]) {
        onSuggestionSelect?.(suggestions[selectedSuggestionIndex]);
      } else {
        onSearch?.(value);
      }
      setShowSuggestions(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev =>
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev =>
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    onSuggestionSelect?.(suggestion);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          {loading && (
            <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />
          )}
          {value && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="h-6 w-6 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50">
          <CardContent className="p-0">
            <div className="max-h-60 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className={`p-3 hover:bg-muted cursor-pointer transition-colors ${
                    index === selectedSuggestionIndex ? 'bg-muted' : ''
                  }`}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <div className="flex items-center space-x-2">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{suggestion.text}</span>
                    {suggestion.type && (
                      <Badge variant="outline" className="text-xs">
                        {suggestion.type}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

/**
 * Filter chip component
 */
export const FilterChip = ({
  filter,
  onRemove,
  onEdit,
  className = ''
}) => {
  const getFilterIcon = (type) => {
    switch (type) {
      case 'date':
        return <Calendar className="w-3 h-3" />;
      case 'user':
        return <User className="w-3 h-3" />;
      case 'organization':
        return <Building2 className="w-3 h-3" />;
      case 'payment':
        return <CreditCard className="w-3 h-3" />;
      case 'status':
        return <CheckCircle className="w-3 h-3" />;
      case 'tag':
        return <Tag className="w-3 h-3" />;
      default:
        return <Filter className="w-3 h-3" />;
    }
  };

  return (
    <div className={`inline-flex items-center space-x-1 bg-muted px-2 py-1 rounded-full text-sm ${className}`}>
      {getFilterIcon(filter.type)}
      <span>{filter.label}:</span>
      <span className="font-medium">{filter.value}</span>
      {onEdit && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(filter)}
          className="h-4 w-4 p-0"
        >
          <Settings className="w-3 h-3" />
        </Button>
      )}
      {onRemove && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(filter.id)}
          className="h-4 w-4 p-0"
        >
          <X className="w-3 h-3" />
        </Button>
      )}
    </div>
  );
};

/**
 * Filter chips container
 */
export const FilterChipsContainer = ({
  filters = [],
  onRemove,
  onEdit,
  onClearAll,
  className = ''
}) => {
  if (filters.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-2 items-center ${className}`}>
      {filters.map((filter) => (
        <FilterChip
          key={filter.id}
          filter={filter}
          onRemove={onRemove}
          onEdit={onEdit}
        />
      ))}
      {onClearAll && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4 mr-1" />
          Clear All
        </Button>
      )}
    </div>
  );
};

/**
 * Search filters panel
 */
export const SearchFiltersPanel = ({
  filters = [],
  onFilterChange,
  onFilterAdd,
  onFilterRemove,
  onFiltersClear,
  onFiltersApply,
  onFiltersReset,
  loading = false,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const filterTypes = [
    { type: 'date', label: 'Date Range', icon: Calendar },
    { type: 'user', label: 'User', icon: User },
    { type: 'organization', label: 'Organization', icon: Building2 },
    { type: 'payment', label: 'Payment', icon: CreditCard },
    { type: 'status', label: 'Status', icon: CheckCircle },
    { type: 'tag', label: 'Tag', icon: Tag }
  ];

  const handleFilterAdd = (type) => {
    onFilterAdd?.(type);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Search Filters</span>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </div>
        <CardDescription>
          Add filters to refine your search results
        </CardDescription>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {filterTypes.map((filterType) => (
              <Button
                key={filterType.type}
                variant="outline"
                size="sm"
                onClick={() => handleFilterAdd(filterType.type)}
                className="justify-start"
              >
                <filterType.icon className="w-4 h-4 mr-2" />
                {filterType.label}
              </Button>
            ))}
          </div>

          <FilterChipsContainer
            filters={filters}
            onRemove={onFilterRemove}
            onClearAll={onFiltersClear}
          />

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={onFiltersReset}
              disabled={loading}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button
              onClick={onFiltersApply}
              disabled={loading}
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Filter className="w-4 h-4 mr-2" />
              )}
              Apply Filters
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

/**
 * Search history component
 */
export const SearchHistory = ({
  searches = [],
  onSearchSelect,
  onSearchRemove,
  onClearHistory,
  maxItems = 10,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (searches.length === 0) return null;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Recent Searches</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearHistory}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent>
          <div className="space-y-2">
            {searches.slice(0, maxItems).map((search, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                onClick={() => onSearchSelect?.(search)}
              >
                <div className="flex items-center space-x-2">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{search.query}</span>
                  {search.filters && search.filters.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {search.filters.length} filters
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-muted-foreground">
                    {new Date(search.timestamp).toLocaleDateString('id-ID')}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSearchRemove?.(index);
                    }}
                    className="h-6 w-6 p-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

/**
 * Search suggestions component
 */
export const SearchSuggestions = ({
  suggestions = [],
  onSuggestionSelect,
  onSuggestionDismiss,
  className = ''
}) => {
  if (suggestions.length === 0) return null;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Search className="w-5 h-5" />
          <span>Suggestions</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
              onClick={() => onSuggestionSelect?.(suggestion)}
            >
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{suggestion.text}</span>
                {suggestion.type && (
                  <Badge variant="outline" className="text-xs">
                    {suggestion.type}
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onSuggestionDismiss?.(index);
                }}
                className="h-6 w-6 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Search results summary
 */
export const SearchResultsSummary = ({
  totalResults,
  searchTime,
  filters = [],
  onFiltersClear,
  className = ''
}) => {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center space-x-4">
        <span className="text-sm text-muted-foreground">
          {totalResults.toLocaleString('id-ID')} results
        </span>
        {searchTime && (
          <span className="text-sm text-muted-foreground">
            in {searchTime}ms
          </span>
        )}
        {filters.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              with {filters.length} filter{filters.length > 1 ? 's' : ''}
            </span>
            {onFiltersClear && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onFiltersClear}
                className="text-xs"
              >
                Clear filters
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default {
  AdvancedSearchInput,
  FilterChip,
  FilterChipsContainer,
  SearchFiltersPanel,
  SearchHistory,
  SearchSuggestions,
  SearchResultsSummary
};
