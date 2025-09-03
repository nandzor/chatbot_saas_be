import React, { useState, useEffect, useCallback } from 'react';
import { usePagination } from '@/hooks/usePagination';
import { usePaginationInstance } from '@/contexts/PaginationContext';
import Pagination from '@/components/ui/Pagination';
import paginationService from '@/services/PaginationService';
import {
  calculatePaginationInfo,
  generateVisiblePages,
  getPaginationConfig
} from '@/utils/pagination';
import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui';

/**
 * Comprehensive Pagination Example Component
 *
 * Demonstrates all features of the pagination architecture:
 * - Basic and advanced usePagination usage
 * - Multiple Pagination component variants
 * - Context-based state management
 * - API integration with caching
 * - Utility functions
 * - Performance optimization
 */

const PaginationExample = () => {
  const [activeTab, setActiveTab] = useState('basic');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ search: '', status: 'all' });

  // Example 1: Basic usePagination
  const basicPagination = usePagination({
    initialPerPage: 15,
    perPageOptions: [10, 15, 25, 50],
    enableUrlSync: true,
    enableLocalStorage: true,
    storageKey: 'basic-pagination-example'
  });

  // Example 2: Advanced usePagination with callbacks
  const advancedPagination = usePagination({
    initialPerPage: 25,
    perPageOptions: [10, 25, 50, 100, 200],
    maxVisiblePages: 7,
    enableUrlSync: true,
    enableLocalStorage: true,
    storageKey: 'advanced-pagination-example',
    debounceMs: 200,
    onPageChange: (newPagination) => {
      console.log('Advanced pagination page changed:', newPagination);
    },
    onPerPageChange: (newPagination) => {
      console.log('Advanced pagination per page changed:', newPagination);
    }
  });

  // Example 3: Context-based pagination
  const contextPagination = usePaginationInstance('example-context', {
    defaultPerPage: 20,
    perPageOptions: [10, 20, 50, 100],
    enableUrlSync: true,
    enableLocalStorage: true
  });

  // Mock data generator
  const generateMockData = useCallback((total = 150) => {
    return Array.from({ length: total }, (_, index) => ({
      id: index + 1,
      name: `User ${index + 1}`,
      email: `user${index + 1}@example.com`,
      status: ['active', 'inactive', 'pending'][index % 3],
      role: ['admin', 'user', 'moderator'][index % 3],
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
    }));
  }, []);

  // Mock API response
  const mockApiResponse = useCallback((pagination, filters = {}) => {
    const allData = generateMockData(150);

    // Apply filters
    let filteredData = allData;
    if (filters.search) {
      filteredData = filteredData.filter(item =>
        item.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.email.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    if (filters.status && filters.status !== 'all') {
      filteredData = filteredData.filter(item => item.status === filters.status);
    }

    // Apply pagination
    const startIndex = (pagination.current_page - 1) * pagination.per_page;
    const endIndex = startIndex + pagination.per_page;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    return {
      success: true,
      data: paginatedData,
      meta: {
        pagination: {
          current_page: pagination.current_page,
          last_page: Math.ceil(filteredData.length / pagination.per_page),
          per_page: pagination.per_page,
          total: filteredData.length,
          from: startIndex + 1,
          to: Math.min(endIndex, filteredData.length)
        }
      }
    };
  }, [generateMockData]);

  // Fetch data function
  const fetchData = useCallback(async (pagination, filters = {}) => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const response = mockApiResponse(pagination, filters);

      if (response.success) {
        setData(response.data);
        return response;
      } else {
        throw new Error('Failed to fetch data');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [mockApiResponse]);

  // Load data for basic pagination
  useEffect(() => {
    fetchData(basicPagination.pagination, filters).then(response => {
      if (response.success) {
        basicPagination.updatePagination(response.meta.pagination);
      }
    });
  }, [basicPagination.pagination.current_page, basicPagination.pagination.per_page, filters]);

  // Load data for advanced pagination
  useEffect(() => {
    fetchData(advancedPagination.pagination, filters).then(response => {
      if (response.success) {
        advancedPagination.updatePagination(response.meta.pagination);
      }
    });
  }, [advancedPagination.pagination.current_page, advancedPagination.pagination.per_page, filters]);

  // Load data for context pagination
  useEffect(() => {
    fetchData(contextPagination.pagination, filters).then(response => {
      if (response.success) {
        contextPagination.updateFromApiResponse(response);
      }
    });
  }, [contextPagination.pagination.current_page, contextPagination.pagination.per_page, filters]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    // Reset to first page when filters change
    basicPagination.changePage(1);
    advancedPagination.changePage(1);
    contextPagination.changePage(1);
  };

  // Utility function examples
  const paginationInfo = calculatePaginationInfo({
    currentPage: basicPagination.pagination.current_page,
    totalItems: basicPagination.pagination.total,
    itemsPerPage: basicPagination.pagination.per_page
  });

  const visiblePages = generateVisiblePages({
    currentPage: basicPagination.pagination.current_page,
    totalPages: basicPagination.pagination.last_page,
    maxVisible: 5
  });

  const tableConfig = getPaginationConfig('table');

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pagination Architecture Examples</h1>
        <p className="text-gray-600 mt-2">
          Comprehensive examples demonstrating all pagination features and patterns
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Test pagination with different filter combinations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <Input
                placeholder="Search users..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
            <div className="w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Utility Information */}
      <Card>
        <CardHeader>
          <CardTitle>Utility Functions Demo</CardTitle>
          <CardDescription>Examples of pagination utility functions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Pagination Info</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div>Current Page: {paginationInfo.currentPage}</div>
                <div>Total Pages: {paginationInfo.totalPages}</div>
                <div>Items Shown: {paginationInfo.itemsShown}</div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Visible Pages</h4>
              <div className="text-sm text-gray-600">
                {visiblePages.join(', ')}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Table Config</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div>Default Per Page: {tableConfig.initialPerPage}</div>
                <div>Options: {tableConfig.perPageOptions.join(', ')}</div>
                <div>Max Visible: {tableConfig.maxVisiblePages}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Examples Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="basic">Basic Pagination</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Pagination</TabsTrigger>
          <TabsTrigger value="context">Context Pagination</TabsTrigger>
          <TabsTrigger value="variants">Component Variants</TabsTrigger>
        </TabsList>

        {/* Basic Pagination Example */}
        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Pagination Example</CardTitle>
              <CardDescription>
                Simple pagination with URL sync and localStorage persistence
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Data Display */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3">Data ({data.length} items)</h4>
                  {loading ? (
                    <div className="text-center py-8">Loading...</div>
                  ) : error ? (
                    <div className="text-center py-8 text-red-600">Error: {error}</div>
                  ) : (
                    <div className="space-y-2">
                      {data.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div>
                            <span className="font-medium">{item.name}</span>
                            <span className="text-gray-500 ml-2">({item.email})</span>
                          </div>
                          <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
                            {item.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Pagination */}
                <Pagination
                  currentPage={basicPagination.pagination.current_page}
                  totalPages={basicPagination.pagination.last_page}
                  totalItems={basicPagination.pagination.total}
                  perPage={basicPagination.pagination.per_page}
                  onPageChange={basicPagination.changePage}
                  onPerPageChange={basicPagination.changePerPage}
                  variant="full"
                  loading={loading}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Pagination Example */}
        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Pagination Example</CardTitle>
              <CardDescription>
                Advanced pagination with callbacks, debouncing, and custom configuration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Data Display */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3">Data ({data.length} items)</h4>
                  {loading ? (
                    <div className="text-center py-8">Loading...</div>
                  ) : error ? (
                    <div className="text-center py-8 text-red-600">Error: {error}</div>
                  ) : (
                    <div className="space-y-2">
                      {data.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div>
                            <span className="font-medium">{item.name}</span>
                            <span className="text-gray-500 ml-2">({item.email})</span>
                          </div>
                          <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
                            {item.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Pagination with Progress */}
                <Pagination
                  currentPage={advancedPagination.pagination.current_page}
                  totalPages={advancedPagination.pagination.last_page}
                  totalItems={advancedPagination.pagination.total}
                  perPage={advancedPagination.pagination.per_page}
                  onPageChange={advancedPagination.changePage}
                  onPerPageChange={advancedPagination.changePerPage}
                  variant="full"
                  loading={loading}
                  perPageOptions={[10, 25, 50, 100, 200]}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Context Pagination Example */}
        <TabsContent value="context" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Context Pagination Example</CardTitle>
              <CardDescription>
                Pagination using global context for state management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Data Display */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3">Data ({data.length} items)</h4>
                  {loading ? (
                    <div className="text-center py-8">Loading...</div>
                  ) : error ? (
                    <div className="text-center py-8 text-red-600">Error: {error}</div>
                  ) : (
                    <div className="space-y-2">
                      {data.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div>
                            <span className="font-medium">{item.name}</span>
                            <span className="text-gray-500 ml-2">({item.email})</span>
                          </div>
                          <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
                            {item.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Context Pagination */}
                <Pagination
                  currentPage={contextPagination.pagination.current_page}
                  totalPages={contextPagination.pagination.last_page}
                  totalItems={contextPagination.pagination.total}
                  perPage={contextPagination.pagination.per_page}
                  onPageChange={contextPagination.changePage}
                  onPerPageChange={contextPagination.changePerPage}
                  variant="table"
                  loading={loading}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Component Variants Example */}
        <TabsContent value="variants" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Full Variant */}
            <Card>
              <CardHeader>
                <CardTitle>Full Variant</CardTitle>
                <CardDescription>Complete pagination with all controls</CardDescription>
              </CardHeader>
              <CardContent>
                <Pagination
                  currentPage={2}
                  totalPages={10}
                  totalItems={150}
                  perPage={15}
                  onPageChange={() => {}}
                  onPerPageChange={() => {}}
                  variant="full"
                />
              </CardContent>
            </Card>

            {/* Compact Variant */}
            <Card>
              <CardHeader>
                <CardTitle>Compact Variant</CardTitle>
                <CardDescription>Condensed version with essential controls</CardDescription>
              </CardHeader>
              <CardContent>
                <Pagination
                  currentPage={2}
                  totalPages={10}
                  totalItems={150}
                  perPage={15}
                  onPageChange={() => {}}
                  onPerPageChange={() => {}}
                  variant="compact"
                />
              </CardContent>
            </Card>

            {/* Minimal Variant */}
            <Card>
              <CardHeader>
                <CardTitle>Minimal Variant</CardTitle>
                <CardDescription>Simple previous/next navigation</CardDescription>
              </CardHeader>
              <CardContent>
                <Pagination
                  currentPage={2}
                  totalPages={10}
                  totalItems={150}
                  perPage={15}
                  onPageChange={() => {}}
                  onPerPageChange={() => {}}
                  variant="minimal"
                />
              </CardContent>
            </Card>

            {/* Table Variant */}
            <Card>
              <CardHeader>
                <CardTitle>Table Variant</CardTitle>
                <CardDescription>Optimized for table layouts</CardDescription>
              </CardHeader>
              <CardContent>
                <Pagination
                  currentPage={2}
                  totalPages={10}
                  totalItems={150}
                  perPage={15}
                  onPageChange={() => {}}
                  onPerPageChange={() => {}}
                  variant="table"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>Real-time pagination performance data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {paginationService.getPerformanceMetrics().totalRequests}
              </div>
              <div className="text-sm text-gray-600">Total Requests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(paginationService.getPerformanceMetrics().cacheHitRate * 100)}%
              </div>
              <div className="text-sm text-gray-600">Cache Hit Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(paginationService.getPerformanceMetrics().averageResponseTime)}ms
              </div>
              <div className="text-sm text-gray-600">Avg Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {paginationService.getPerformanceMetrics().cacheSize}
              </div>
              <div className="text-sm text-gray-600">Cache Size</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaginationExample;
