import React, { useState, useCallback, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Select,
  SelectItem,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
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
  Skeleton,
  Alert,
  AlertDescription,
  Pagination
} from '@/components/ui';
import {
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Eye,
  RefreshCw,
  CreditCard,
  Building2,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CheckSquare,
  Square,
  Trash2,
  FileText,
  Settings
} from 'lucide-react';
import { useTransactionHistory } from '@/hooks/useTransactionHistory';
import TransactionDetailsModal from '@/components/modals/TransactionDetailsModal';

// Constants
const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'completed', label: 'Completed' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
  { value: 'partially_refunded', label: 'Partially Refunded' },
  { value: 'cancelled', label: 'Cancelled' }
];

const PAYMENT_METHOD_OPTIONS = [
  { value: 'all', label: 'All Methods' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'debit_card', label: 'Debit Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'e_wallet', label: 'E-Wallet' },
  { value: 'virtual_account', label: 'Virtual Account' },
  { value: 'qris', label: 'QRIS' }
];

const PAYMENT_GATEWAY_OPTIONS = [
  { value: 'all', label: 'All Gateways' },
  { value: 'midtrans', label: 'Midtrans' },
  { value: 'xendit', label: 'Xendit' },
  { value: 'doku', label: 'DOKU' },
  { value: 'bca', label: 'BCA' },
  { value: 'mandiri', label: 'Mandiri' }
];

const CURRENCY_OPTIONS = [
  { value: 'all', label: 'All Currencies' },
  { value: 'IDR', label: 'IDR (Indonesian Rupiah)' },
  { value: 'USD', label: 'USD (US Dollar)' },
  { value: 'EUR', label: 'EUR (Euro)' }
];

const SORT_OPTIONS = [
  { value: 'created_at', label: 'Date' },
  { value: 'amount', label: 'Amount' },
  { value: 'status', label: 'Status' },
  { value: 'organization.name', label: 'Organization' }
];

const TransactionHistory = () => {
  // Custom hook
  const {
    transactions,
    statistics,
    pagination,
    filters,
    sorting,
    loading,
    statisticsLoading,
    error,
    refresh,
    exportTransactions,
    getTransactionById,
    handlePageChange,
    handlePerPageChange,
    handleFilterChange,
    handleSortChange,
    resetFilters,
    isAuthenticated,
    authLoading
  } = useTransactionHistory();

  // Debug authentication status

  // Local state
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [selectedTransactions, setSelectedTransactions] = useState(new Set());
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Format currency
  const formatCurrency = useCallback((amount, currency = 'IDR') => {
    if (!amount) return '-';

    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: currency === 'IDR' ? 0 : 2,
      maximumFractionDigits: currency === 'IDR' ? 0 : 2
    }).format(amount);
  }, []);

  // Get status badge
  const getStatusBadge = useCallback((status) => {
    const statusConfig = {
      completed: { icon: CheckCircle, color: 'bg-green-100 text-green-800', label: 'Completed' },
      pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      processing: { icon: RefreshCw, color: 'bg-blue-100 text-blue-800', label: 'Processing' },
      failed: { icon: XCircle, color: 'bg-red-100 text-red-800', label: 'Failed' },
      refunded: { icon: TrendingDown, color: 'bg-gray-100 text-gray-800', label: 'Refunded' },
      partially_refunded: { icon: TrendingDown, color: 'bg-orange-100 text-orange-800', label: 'Partially Refunded' },
      cancelled: { icon: XCircle, color: 'bg-gray-100 text-gray-800', label: 'Cancelled' }
    };

    const config = statusConfig[status] || { icon: AlertCircle, color: 'bg-gray-100 text-gray-800', label: status };
    const IconComponent = config.icon;

    return (
      <Badge className={config.color}>
        <IconComponent className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  }, []);

  // Get payment method icon
  const getPaymentMethodIcon = useCallback((method) => {
    const iconMap = {
      credit_card: CreditCard,
      debit_card: CreditCard,
      bank_transfer: Building2,
      e_wallet: CreditCard,
      virtual_account: Building2,
      qris: CreditCard
    };

    return iconMap[method] || CreditCard;
  }, []);

  // Handle view details
  const handleViewDetails = useCallback(async (transaction) => {
    try {
      setSelectedTransaction(transaction);
      setShowDetailsModal(true);
    } catch (error) {
    }
  }, []);

  // Handle export
  const handleExport = useCallback(async () => {
    setExportLoading(true);
    try {
      await exportTransactions();
    } catch (error) {
    } finally {
      setExportLoading(false);
    }
  }, [exportTransactions]);

  // Handle sort
  const handleSort = useCallback((field) => {
    const newDirection = sorting.sort_by === field && sorting.sort_direction === 'asc' ? 'desc' : 'asc';
    handleSortChange(field, newDirection);
  }, [sorting, handleSortChange]);

  // Handle bulk selection
  const handleSelectAll = useCallback(() => {
    if (!transactions || !Array.isArray(transactions)) return;

    if (selectedTransactions.size === transactions.length) {
      setSelectedTransactions(new Set());
    } else {
      setSelectedTransactions(new Set(transactions.map(t => t.id)));
    }
  }, [selectedTransactions.size, transactions]);

  const handleSelectTransaction = useCallback((transactionId) => {
    const newSelected = new Set(selectedTransactions);
    if (newSelected.has(transactionId)) {
      newSelected.delete(transactionId);
    } else {
      newSelected.add(transactionId);
    }
    setSelectedTransactions(newSelected);
  }, [selectedTransactions]);

  const handleBulkExport = useCallback(async () => {
    if (selectedTransactions.size === 0) return;

    setExportLoading(true);
    try {
      await exportTransactions({
        transaction_ids: Array.from(selectedTransactions).join(',')
      });
    } catch (error) {
    } finally {
      setExportLoading(false);
    }
  }, [selectedTransactions, exportTransactions]);

  // Get sort icon
  const getSortIcon = useCallback((field) => {
    if (sorting.sort_by !== field) {
      return <ArrowUpDown className="w-4 h-4" />;
    }
    return sorting.sort_direction === 'asc' ?
      <ArrowUp className="w-4 h-4" /> :
      <ArrowDown className="w-4 h-4" />;
  }, [sorting]);

  // Memoized statistics cards
  const statisticsCards = useMemo(() => {
    if (!statistics) return [];

    return [
      {
        title: 'Total Transactions',
        value: statistics.total_transactions || 0,
        icon: CreditCard,
        color: 'blue',
        bgColor: 'bg-blue-100',
        iconColor: 'text-blue-600'
      },
      {
        title: 'Total Revenue',
        value: formatCurrency(statistics.total_amount || 0, statistics.currency || 'IDR'),
        icon: DollarSign,
        color: 'green',
        bgColor: 'bg-green-100',
        iconColor: 'text-green-600'
      },
      {
        title: 'Success Rate',
        value: `${statistics.success_rate || 0}%`,
        icon: TrendingUp,
        color: 'purple',
        bgColor: 'bg-purple-100',
        iconColor: 'text-purple-600'
      },
      {
        title: 'Pending Transactions',
        value: statistics.pending_transactions || 0,
        icon: Clock,
        color: 'yellow',
        bgColor: 'bg-yellow-100',
        iconColor: 'text-yellow-600'
      }
    ];
  }, [statistics, formatCurrency]);

  // Authentication loading state
  if (authLoading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  // Authentication check
  if (!isAuthenticated) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You need to be authenticated to view transaction history. Please log in first.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // Data loading state
  if (loading && (!transactions || transactions.length === 0)) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
              <Button
                variant="outline"
                size="sm"
                onClick={refresh}
                className="ml-4"
              >
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
            <p className="text-gray-600">View and manage payment transactions</p>
          </div>
          <div className="flex items-center gap-3 mt-4 sm:mt-0">
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Advanced Filters
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={exportLoading}
            >
              <Download className="w-4 h-4 mr-2" />
              {exportLoading ? 'Exporting...' : 'Export All'}
            </Button>
            {selectedTransactions.size > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkExport}
                disabled={exportLoading}
                className="bg-blue-50 border-blue-200 text-blue-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Selected ({selectedTransactions.size})
              </Button>
            )}
          </div>
        </div>

        {/* Statistics Cards */}
        {statisticsCards && statisticsCards.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {statisticsCards.map((card, index) => {
              const IconComponent = card.icon;
              return (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className={`p-2 ${card.bgColor} rounded-lg`}>
                        <IconComponent className={`w-6 h-6 ${card.iconColor}`} />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">{card.title}</p>
                        {statisticsLoading ? (
                          <Skeleton className="h-8 w-16 mt-1" />
                        ) : (
                          <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Advanced Filters</CardTitle>
              <CardDescription>
                Use advanced filters to find specific transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount Range</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min Amount"
                      value={filters.amount_min}
                      onChange={(e) => handleFilterChange('amount_min', e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Max Amount"
                      value={filters.amount_max}
                      onChange={(e) => handleFilterChange('amount_max', e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date To</label>
                  <Input
                    type="date"
                    value={filters.date_to}
                    onChange={(e) => handleFilterChange('date_to', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Organization ID</label>
                  <Input
                    type="text"
                    placeholder="Organization ID"
                    value={filters.organization_id}
                    onChange={(e) => handleFilterChange('organization_id', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Plan ID</label>
                  <Input
                    type="text"
                    placeholder="Plan ID"
                    value={filters.plan_id}
                    onChange={(e) => handleFilterChange('plan_id', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Basic Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search transactions..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)} placeholder="All Status">
                  {STATUS_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <Select value={filters.payment_method} onValueChange={(value) => handleFilterChange('payment_method', value)} placeholder="All Methods">
                  {PAYMENT_METHOD_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              {/* Payment Gateway */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Gateway</label>
                <Select value={filters.payment_gateway} onValueChange={(value) => handleFilterChange('payment_gateway', value)} placeholder="All Gateways">
                  {PAYMENT_GATEWAY_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              {/* Currency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                <Select value={filters.currency} onValueChange={(value) => handleFilterChange('currency', value)} placeholder="All Currencies">
                  {CURRENCY_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date From</label>
                <Input
                  type="date"
                  value={filters.date_from}
                  onChange={(e) => handleFilterChange('date_from', e.target.value)}
                />
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    {Object.values(filters).some(filter => filter !== 'all' && filter !== '')
                      ? 'Filters applied'
                      : 'No filters applied'
                    }
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetFilters}
                  className="text-gray-600"
                >
                  Reset Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions Bar */}
        {selectedTransactions.size > 0 && (
          <Card className="mb-4 border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-blue-900">
                    {selectedTransactions.size} transaction{selectedTransactions.size > 1 ? 's' : ''} selected
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedTransactions(new Set())}
                    className="text-blue-700 border-blue-300"
                  >
                    Clear Selection
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkExport}
                    disabled={exportLoading}
                    className="text-blue-700 border-blue-300"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Selected
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Transactions</CardTitle>
                <CardDescription>
                  Payment transaction history and details
                </CardDescription>
              </div>
              <div className="flex items-center gap-4">
                {loading && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    Loading transactions...
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>Per page:</span>
                  <Select
                    value={(pagination.itemsPerPage || 15).toString()}
                    onValueChange={(value) => handlePerPageChange(parseInt(value))}
                    placeholder="10"
                    className="w-20 h-8"
                  >
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="15">15</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {loading && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    Loading transactions...
                  </div>
                )}
                {(pagination.totalPages || 1) > 1 && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePageChange((pagination.currentPage || 1) - 1)}
                      disabled={(pagination.currentPage || 1) <= 1 || loading}
                    >
                      ←
                    </Button>
                    <span className="text-xs">
                      {pagination.currentPage || 1} / {pagination.totalPages || 1}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePageChange((pagination.currentPage || 1) + 1)}
                      disabled={(pagination.currentPage || 1) >= (pagination.totalPages || 1) || loading}
                    >
                      →
                    </Button>
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handlePageChange(1);
                    resetFilters();
                  }}
                  className="text-gray-600"
                >
                  Reset Filters
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSelectAll}
                        className="h-auto p-0"
                      >
                        {transactions && selectedTransactions.size === transactions.length && transactions.length > 0 ? (
                          <CheckSquare className="w-4 h-4" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort('created_at')}
                        className="h-auto p-0 font-medium"
                      >
                        Date {getSortIcon('created_at')}
                      </Button>
                    </TableHead>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort('amount')}
                        className="h-auto p-0 font-medium"
                      >
                        Amount {getSortIcon('amount')}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort('status')}
                        className="h-auto p-0 font-medium"
                      >
                        Status {getSortIcon('status')}
                      </Button>
                    </TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions && transactions.length > 0 ? (
                    transactions.map((transaction) => {
                      const PaymentMethodIcon = getPaymentMethodIcon(transaction.payment_method);

                      return (
                        <TableRow key={transaction.id} className="hover:bg-gray-50">
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSelectTransaction(transaction.id)}
                              className="h-auto p-0"
                            >
                              {selectedTransactions.has(transaction.id) ? (
                                <CheckSquare className="w-4 h-4" />
                              ) : (
                                <Square className="w-4 h-4" />
                              )}
                            </Button>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium">
                                {new Date(transaction.created_at).toLocaleDateString()}
                              </div>
                              <div className="text-gray-500">
                                {new Date(transaction.created_at).toLocaleTimeString()}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-mono text-sm">
                              {transaction.transaction_id}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{transaction.organization?.name || 'N/A'}</div>
                              <div className="text-sm text-gray-500">{transaction.organization?.slug || ''}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {transaction.subscription?.plan?.display_name || 'Subscription Payment'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {transaction.invoice?.invoice_number || transaction.reference_number}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {formatCurrency(transaction.amount, transaction.currency)}
                            </div>
                            {transaction.net_amount && transaction.net_amount !== transaction.amount && (
                              <div className="text-sm text-gray-500">
                                Net: {formatCurrency(transaction.net_amount, transaction.currency)}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(transaction.status)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <PaymentMethodIcon className="w-4 h-4 text-gray-500" />
                              <span className="text-sm capitalize">
                                {transaction.payment_method?.replace('_', ' ')}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <TooltipProvider>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleViewDetails(transaction)}>
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TooltipProvider>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan="9" className="py-12 text-center">
                        <div className="flex flex-col items-center">
                          <CreditCard className="w-12 h-12 text-gray-400 mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
                          <p className="text-gray-500 mb-4">
                            {Object.values(filters).some(filter => filter !== 'all' && filter !== '')
                              ? 'Try adjusting your filters to see more results.'
                              : 'No payment transactions have been recorded yet.'
                            }
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Enhanced Pagination */}
            <div className="mt-6">
              <Pagination
                currentPage={pagination.currentPage || 1}
                totalPages={pagination.totalPages || 1}
                totalItems={pagination.totalItems || 0}
                perPage={pagination.itemsPerPage || 15}
                onPageChange={handlePageChange}
                onPerPageChange={handlePerPageChange}
                variant="table"
                size="sm"
                loading={loading}
                perPageOptions={[10, 15, 25, 50, 100]}
                maxVisiblePages={7}
                className="border-t pt-4"
              />
            </div>
          </CardContent>
        </Card>

        {/* Transaction Details Modal */}
        {showDetailsModal && selectedTransaction && (
          <TransactionDetailsModal
            transaction={selectedTransaction}
            isOpen={showDetailsModal}
            onClose={() => {
              setShowDetailsModal(false);
              setSelectedTransaction(null);
            }}
            onRefresh={refresh}
          />
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;
