import React, { useState, useCallback, useMemo } from 'react';
import {
  Building2,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Users,
  Calendar,
  Globe,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Settings,
  Filter,
  X
} from 'lucide-react';
import {
  Button,
  Input,
  Select,
  SelectItem,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Skeleton
} from '@/components/ui';
import { Pagination } from '@/components/ui';

// Constants
const STATUS_MAP = {
  active: { icon: CheckCircle, color: 'bg-green-100 text-green-800', label: 'Active' },
  inactive: { icon: XCircle, color: 'bg-gray-100 text-gray-800', label: 'Inactive' },
  suspended: { icon: AlertCircle, color: 'bg-red-100 text-red-800', label: 'Suspended' }
};

const SUBSCRIPTION_STATUS_MAP = {
  trial: { icon: Clock, color: 'bg-yellow-100 text-yellow-800', label: 'Trial' },
  active: { icon: CheckCircle, color: 'bg-green-100 text-green-800', label: 'Active' },
  inactive: { icon: XCircle, color: 'bg-gray-100 text-gray-800', label: 'Inactive' },
  suspended: { icon: AlertCircle, color: 'bg-red-100 text-red-800', label: 'Suspended' },
  cancelled: { icon: XCircle, color: 'bg-red-100 text-red-800', label: 'Cancelled' }
};

const BUSINESS_TYPE_OPTIONS = [
  { value: 'all', label: 'All Business Types' },
  { value: 'startup', label: 'Startup' },
  { value: 'small_business', label: 'Small Business' },
  { value: 'medium_business', label: 'Medium Business' },
  { value: 'enterprise', label: 'Enterprise' },
  { value: 'non_profit', label: 'Non-Profit' },
  { value: 'government', label: 'Government' }
];

const INDUSTRY_OPTIONS = [
  { value: 'all', label: 'All Industries' },
  { value: 'technology', label: 'Technology' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'finance', label: 'Finance' },
  { value: 'education', label: 'Education' },
  { value: 'retail', label: 'Retail' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'other', label: 'Other' }
];

const COMPANY_SIZE_OPTIONS = [
  { value: 'all', label: 'All Sizes' },
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '500+', label: '500+ employees' }
];

const DEFAULT_STATUS_INFO = { icon: Settings, color: 'bg-gray-100 text-gray-800', label: 'Unknown' };

const OrganizationList = ({
  organizations = [],
  loading = false,
  pagination = {},
  filters = {},
  onFiltersChange,
  onPaginationChange,
  onViewDetails,
  onEdit,
  onDelete,
  onAddUser,
  onRemoveUser,
  onUpdateSubscription,
  showActions = true
}) => {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [showFilters, setShowFilters] = useState(false);

  // Debounced search
  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
    const timeoutId = setTimeout(() => {
      onFiltersChange({ search: value });
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [onFiltersChange]);

  // Filter handlers
  const handleFilterChange = useCallback((key, value) => {
    onFiltersChange({ [key]: value });
  }, [onFiltersChange]);

  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    onFiltersChange({
      search: '',
      status: 'all',
      subscriptionStatus: 'all',
      businessType: 'all',
      industry: 'all',
      companySize: 'all'
    });
  }, [onFiltersChange]);

  // Get status info
  const getStatusInfo = useCallback((status) => {
    return STATUS_MAP[status] || DEFAULT_STATUS_INFO;
  }, []);

  const getSubscriptionStatusInfo = useCallback((status) => {
    return SUBSCRIPTION_STATUS_MAP[status] || DEFAULT_STATUS_INFO;
  }, []);

  // Format date
  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }, []);

  // Format trial end date
  const formatTrialEndDate = useCallback((dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: 'Expired', color: 'text-red-600' };
    } else if (diffDays <= 7) {
      return { text: `${diffDays} days left`, color: 'text-yellow-600' };
    } else {
      return { text: `${diffDays} days left`, color: 'text-green-600' };
    }
  }, []);

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.status && filters.status !== 'all') count++;
    if (filters.subscriptionStatus && filters.subscriptionStatus !== 'all') count++;
    if (filters.businessType && filters.businessType !== 'all') count++;
    if (filters.industry && filters.industry !== 'all') count++;
    if (filters.companySize && filters.companySize !== 'all') count++;
    return count;
  }, [filters]);

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[...Array(5)].map((_, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search organizations..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="relative"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
          {activeFiltersCount > 0 && (
            <Button variant="ghost" onClick={handleClearFilters}>
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select
                  value={filters.status || 'all'}
                  onValueChange={(value) => handleFilterChange('status', value)}
                  placeholder="Select status"
                >
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Subscription</label>
                <Select
                  value={filters.subscriptionStatus || 'all'}
                  onValueChange={(value) => handleFilterChange('subscriptionStatus', value)}
                  placeholder="Select subscription"
                >
                  <SelectItem value="all">All Subscriptions</SelectItem>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Business Type</label>
                <Select
                  value={filters.businessType || 'all'}
                  onValueChange={(value) => handleFilterChange('businessType', value)}
                  placeholder="Select business type"
                >
                  {BUSINESS_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Industry</label>
                <Select
                  value={filters.industry || 'all'}
                  onValueChange={(value) => handleFilterChange('industry', value)}
                  placeholder="Select industry"
                >
                  {INDUSTRY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Company Size</label>
                <Select
                  value={filters.companySize || 'all'}
                  onValueChange={(value) => handleFilterChange('companySize', value)}
                  placeholder="Select company size"
                >
                  {COMPANY_SIZE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Organizations List */}
      {organizations.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No organizations found</h3>
            <p className="text-gray-500">
              {Object.values(filters).some(f => f && f !== 'all') || searchTerm
                ? 'Try adjusting your filters or search terms.'
                : 'Get started by creating your first organization.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {organizations.map((organization) => {
            const statusInfo = getStatusInfo(organization.status);
            const subscriptionStatusInfo = getSubscriptionStatusInfo(organization.subscriptionStatus);
            const trialInfo = formatTrialEndDate(organization.trialEndsAt);

            return (
              <Card key={organization.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {organization.name}
                          </h3>
                          <Badge variant="outline" className="text-xs">
                            {organization.orgCode}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                          {organization.email && (
                            <div className="flex items-center space-x-1">
                              <Mail className="h-3 w-3" />
                              <span>{organization.email}</span>
                            </div>
                          )}
                          {organization.phone && (
                            <div className="flex items-center space-x-1">
                              <Phone className="h-3 w-3" />
                              <span>{organization.phone}</span>
                            </div>
                          )}
                          {organization.website && (
                            <div className="flex items-center space-x-1">
                              <Globe className="h-3 w-3" />
                              <span>{organization.website}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center space-x-1">
                            <Users className="h-3 w-3" />
                            <span>{organization.usersCount || 0} users</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>Created {formatDate(organization.createdAt)}</span>
                          </div>
                          {organization.businessType && (
                            <Badge variant="secondary" className="text-xs">
                              {organization.businessType.replace('_', ' ')}
                            </Badge>
                          )}
                          {organization.industry && (
                            <Badge variant="secondary" className="text-xs">
                              {organization.industry}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      {/* Status Badges */}
                      <div className="flex flex-col space-y-1">
                        <Badge className={`${statusInfo.color} text-xs`}>
                          <statusInfo.icon className="h-3 w-3 mr-1" />
                          {statusInfo.label}
                        </Badge>
                        <Badge className={`${subscriptionStatusInfo.color} text-xs`}>
                          <subscriptionStatusInfo.icon className="h-3 w-3 mr-1" />
                          {subscriptionStatusInfo.label}
                        </Badge>
                        {trialInfo && (
                          <Badge variant="outline" className={`text-xs ${trialInfo.color}`}>
                            {trialInfo.text}
                          </Badge>
                        )}
                      </div>

                      {/* Actions */}
                      {showActions && (
                        <TooltipProvider>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => onViewDetails(organization)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onEdit(organization)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Organization
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onAddUser(organization)}>
                                <Users className="h-4 w-4 mr-2" />
                                Manage Users
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onUpdateSubscription(organization)}>
                                <Settings className="h-4 w-4 mr-2" />
                                Update Subscription
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => onDelete(organization)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Organization
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TooltipProvider>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={(page) => onPaginationChange({ currentPage: page })}
            showInfo={true}
            totalItems={pagination.totalItems}
            itemsPerPage={pagination.itemsPerPage}
          />
        </div>
      )}
    </div>
  );
};

export default OrganizationList;
