import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Badge,
  Alert,
  AlertDescription,
  Skeleton,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
  Checkbox,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui';
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  CreditCard,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Settings,
  BarChart3,
  Activity,
  Building2,
  Users,
  ExternalLink,
  Play,
  Pause,
  RotateCcw,
  Clock,
  Circle
} from 'lucide-react';
import superAdminService from '@/api/superAdminService';

const FinancialManagement = () => {
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('subscriptions');

  // Subscriptions state
  const [subscriptions, setSubscriptions] = useState([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState([]);
  const [subscriptionSearch, setSubscriptionSearch] = useState('');
  const [subscriptionStatusFilter, setSubscriptionStatusFilter] = useState('all');

  // Payment transactions state
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [transactionSearch, setTransactionSearch] = useState('');
  const [transactionStatusFilter, setTransactionStatusFilter] = useState('all');

  // Subscription plans state
  const [plans, setPlans] = useState([]);
  const [filteredPlans, setFilteredPlans] = useState([]);

  // Statistics
  const [subscriptionStats, setSubscriptionStats] = useState({
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    trialSubscriptions: 0,
    cancelledSubscriptions: 0,
    monthlyRevenue: 0,
    totalRevenue: 0
  });

  const [transactionStats, setTransactionStats] = useState({
    totalTransactions: 0,
    successfulTransactions: 0,
    failedTransactions: 0,
    pendingTransactions: 0,
    totalAmount: 0,
    refundedAmount: 0
  });

  // Load subscriptions data
  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const [subsResult, statsResult] = await Promise.allSettled([
        superAdminService.getSubscriptions(),
        superAdminService.getSubscriptionStatistics()
      ]);

      if (subsResult.status === 'fulfilled' && subsResult.value.success) {
        const data = subsResult.value.data.data;
        setSubscriptions(data.subscriptions || []);
        setFilteredSubscriptions(data.subscriptions || []);
      }

      if (statsResult.status === 'fulfilled' && statsResult.value.success) {
        const stats = statsResult.value.data.data;
        setSubscriptionStats({
          totalSubscriptions: stats.total_subscriptions || 0,
          activeSubscriptions: stats.active_subscriptions || 0,
          trialSubscriptions: stats.trial_subscriptions || 0,
          cancelledSubscriptions: stats.cancelled_subscriptions || 0,
          monthlyRevenue: stats.monthly_revenue || 0,
          totalRevenue: stats.total_revenue || 0
        });
      }
    } catch (err) {
      setError('Failed to load subscriptions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load payment transactions data
  const loadTransactions = async () => {
    try {
      setLoading(true);
      const [transResult, statsResult] = await Promise.allSettled([
        superAdminService.getPaymentTransactions(),
        superAdminService.getPaymentTransactionStatistics()
      ]);

      if (transResult.status === 'fulfilled' && transResult.value.success) {
        const data = transResult.value.data.data;
        setTransactions(data.transactions || []);
        setFilteredTransactions(data.transactions || []);
      }

      if (statsResult.status === 'fulfilled' && statsResult.value.success) {
        const stats = statsResult.value.data.data;
        setTransactionStats({
          totalTransactions: stats.total_transactions || 0,
          successfulTransactions: stats.successful_transactions || 0,
          failedTransactions: stats.failed_transactions || 0,
          pendingTransactions: stats.pending_transactions || 0,
          totalAmount: stats.total_amount || 0,
          refundedAmount: stats.refunded_amount || 0
        });
      }
    } catch (err) {
      setError('Failed to load transactions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load subscription plans data
  const loadPlans = async () => {
    try {
      setLoading(true);
      const result = await superAdminService.getSubscriptionPlans();

      if (result.success) {
        const data = result.data.data;
        setPlans(data.plans || []);
        setFilteredPlans(data.plans || []);
      }
    } catch (err) {
      setError('Failed to load subscription plans. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter subscriptions
  const filterSubscriptions = () => {
    let filtered = [...subscriptions];

    if (subscriptionSearch) {
      filtered = filtered.filter(sub =>
        sub.organization?.name?.toLowerCase().includes(subscriptionSearch.toLowerCase()) ||
        sub.plan?.name?.toLowerCase().includes(subscriptionSearch.toLowerCase())
      );
    }

    if (subscriptionStatusFilter !== 'all') {
      filtered = filtered.filter(sub => sub.status === subscriptionStatusFilter);
    }

    setFilteredSubscriptions(filtered);
  };

  // Filter transactions
  const filterTransactions = () => {
    let filtered = [...transactions];

    if (transactionSearch) {
      filtered = filtered.filter(trans =>
        trans.organization?.name?.toLowerCase().includes(transactionSearch.toLowerCase()) ||
        trans.transaction_id?.toLowerCase().includes(transactionSearch.toLowerCase())
      );
    }

    if (transactionStatusFilter !== 'all') {
      filtered = filtered.filter(trans => trans.status === transactionStatusFilter);
    }

    setFilteredTransactions(filtered);
  };

  // Handle subscription actions
  const handleSubscriptionAction = async (subscriptionId, action) => {
    try {
      let result;
      switch (action) {
        case 'activate':
          result = await superAdminService.activateSubscription(subscriptionId);
          break;
        case 'suspend':
          result = await superAdminService.suspendSubscription(subscriptionId);
          break;
        case 'cancel':
          result = await superAdminService.cancelSubscription(subscriptionId);
          break;
        default:
          return;
      }

      if (result.success) {
        loadSubscriptions();
      } else {
        setError(result.error || `Failed to ${action} subscription`);
      }
    } catch (err) {
      setError(`Failed to ${action} subscription. Please try again.`);
    }
  };

  // Handle transaction refund
  const handleTransactionRefund = async (transactionId) => {
    try {
      const result = await superAdminService.refundPaymentTransaction(transactionId);

      if (result.success) {
        loadTransactions();
      } else {
        setError(result.error || 'Failed to refund transaction');
      }
    } catch (err) {
      setError('Failed to refund transaction. Please try again.');
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'trial':
        return 'outline';
      case 'cancelled':
        return 'destructive';
      case 'suspended':
        return 'secondary';
      case 'success':
        return 'default';
      case 'failed':
        return 'destructive';
      case 'pending':
        return 'outline';
      default:
        return 'outline';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'trial':
        return <Activity className="w-4 h-4 text-blue-500" />;
      case 'cancelled':
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'suspended':
        return <Pause className="w-4 h-4 text-yellow-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-orange-500" />;
      default:
        return <Circle className="w-4 h-4 text-gray-500" />;
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadSubscriptions();
  }, []);

  // Filter data when search or filters change
  useEffect(() => {
    filterSubscriptions();
  }, [subscriptionSearch, subscriptionStatusFilter, subscriptions]);

  useEffect(() => {
    filterTransactions();
  }, [transactionSearch, transactionStatusFilter, transactions]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Financial Management</h1>
          <p className="text-muted-foreground">Manage subscriptions, payments, and billing</p>
        </div>
        <Button onClick={() => loadSubscriptions()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button
              variant="outline"
              size="sm"
              className="ml-4"
              onClick={() => setError(null)}
            >
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
        </TabsList>

        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions" className="space-y-6">
          {/* Subscription Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{subscriptionStats.totalSubscriptions.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {subscriptionStats.activeSubscriptions} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(subscriptionStats.monthlyRevenue)}</div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="inline w-3 h-3 mr-1" />
                  +12.5% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Trial Subscriptions</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{subscriptionStats.trialSubscriptions.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {subscriptionStats.cancelledSubscriptions} cancelled
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Subscription Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters & Search</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search subscriptions by organization or plan..."
                      value={subscriptionSearch}
                      onChange={(e) => setSubscriptionSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={subscriptionStatusFilter} onValueChange={setSubscriptionStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="trial">Trial</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Subscriptions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Subscriptions ({filteredSubscriptions.length})</CardTitle>
              <CardDescription>Manage subscription accounts and billing</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Organization</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Next Billing</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubscriptions.map((subscription) => (
                      <TableRow key={subscription.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <Building2 className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-medium">{subscription.organization?.name || 'Unknown'}</div>
                              <div className="text-sm text-muted-foreground">{subscription.organization?.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{subscription.plan?.name || 'Unknown Plan'}</div>
                            <div className="text-sm text-muted-foreground">{subscription.plan?.tier || 'N/A'}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(subscription.status)}
                            <Badge variant={getStatusBadgeVariant(subscription.status)}>
                              {subscription.status || 'Unknown'}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{formatCurrency(subscription.amount || 0)}</div>
                          <div className="text-sm text-muted-foreground">{subscription.billing_cycle || 'N/A'}</div>
                        </TableCell>
                        <TableCell>
                          {subscription.next_billing_date ? formatDate(subscription.next_billing_date) : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {subscription.created_at ? formatDate(subscription.created_at) : 'Unknown'}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleSubscriptionAction(subscription.id, 'activate')}>
                                <Play className="mr-2 h-4 w-4" />
                                Activate
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleSubscriptionAction(subscription.id, 'suspend')}>
                                <Pause className="mr-2 h-4 w-4" />
                                Suspend
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleSubscriptionAction(subscription.id, 'cancel')}>
                                <XCircle className="mr-2 h-4 w-4" />
                                Cancel
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-6">
          {/* Transaction Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{transactionStats.totalTransactions.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Successful</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{transactionStats.successfulTransactions.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Failed</CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{transactionStats.failedTransactions.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(transactionStats.totalAmount)}</div>
              </CardContent>
            </Card>
          </div>

          {/* Transaction Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters & Search</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search transactions by organization or ID..."
                      value={transactionSearch}
                      onChange={(e) => setTransactionSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={transactionStatusFilter} onValueChange={setTransactionStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={() => loadTransactions()}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Transactions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Transactions ({filteredTransactions.length})</CardTitle>
              <CardDescription>View and manage payment transactions</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Organization</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <div className="font-mono text-sm">{transaction.transaction_id || 'N/A'}</div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{transaction.organization?.name || 'Unknown'}</div>
                            <div className="text-sm text-muted-foreground">{transaction.organization?.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{formatCurrency(transaction.amount || 0)}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(transaction.status)}
                            <Badge variant={getStatusBadgeVariant(transaction.status)}>
                              {transaction.status || 'Unknown'}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{transaction.payment_method || 'N/A'}</div>
                        </TableCell>
                        <TableCell>
                          {transaction.created_at ? formatDate(transaction.created_at) : 'Unknown'}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleTransactionRefund(transaction.id)}>
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Refund
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Plans Tab */}
        <TabsContent value="plans" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Plans</CardTitle>
              <CardDescription>Manage subscription plans and pricing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {plans.map((plan) => (
                  <Card key={plan.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="text-3xl font-bold">{formatCurrency(plan.price)}</div>
                        <div className="text-sm text-muted-foreground">per {plan.billing_cycle}</div>
                        <div className="space-y-1">
                          {plan.features?.map((feature, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-sm">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialManagement;
