import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Button,
  Badge,
  Input,
  Label,
  Textarea,
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui';
import PlanModal from './PlanModal';
import { subscriptionPlansData, subscriptionPlansMetadata } from '@/data/sampleData';
import subscriptionPlansService from '@/api/subscriptionPlansService';
import { 
  CreditCard,
  DollarSign,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  TrendingUp,
  Filter,
  Download,
  RefreshCw,
  Zap,
  CheckCircle
} from 'lucide-react';

const Financials = () => {
  const [activeTab, setActiveTab] = useState('plans');
  const [editingPlan, setEditingPlan] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Subscription plans data from service
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [metadata, setMetadata] = useState(subscriptionPlansMetadata);
  const [isLoading, setIsLoading] = useState(true);

  // Load subscription plans data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [plans, planMetadata] = await Promise.all([
          subscriptionPlansService.getSubscriptionPlans(),
          subscriptionPlansService.getMetadata()
        ]);
        setSubscriptionPlans(plans);
        setMetadata(planMetadata);
      } catch (error) {
        console.error('Error loading subscription plans:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Sample transactions data
  const [transactions] = useState([
    {
      id: 'txn-001',
      date: '2024-03-20',
      organization: 'ABC Corporation',
      orgCode: 'ABC-001',
      description: 'Enterprise Plan - March 2024',
      amount: 2500000,
      status: 'success',
      paymentMethod: 'Credit Card',
      transactionId: 'ch_1234567890'
    },
    {
      id: 'txn-002',
      date: '2024-03-20',
      organization: 'TechStart Inc',
      orgCode: 'TSI-002',
      description: 'Professional Plan - March 2024',
      amount: 1250000,
      status: 'success',
      paymentMethod: 'Bank Transfer',
      transactionId: 'tr_0987654321'
    },
    {
      id: 'txn-003',
      date: '2024-03-19',
      organization: 'Digital Agency Pro',
      orgCode: 'DAP-004',
      description: 'Professional Plan - March 2024',
      amount: 1250000,
      status: 'failed',
      paymentMethod: 'Credit Card',
      transactionId: 'ch_1122334455'
    },
    {
      id: 'txn-004',
      date: '2024-03-18',
      organization: 'StartupXYZ',
      orgCode: 'SXZ-005',
      description: 'Basic Plan - March 2024',
      amount: 500000,
      status: 'refunded',
      paymentMethod: 'Credit Card',
      transactionId: 'ch_5566778899'
    }
  ]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const variants = {
      'success': 'green',
      'failed': 'red',
      'refunded': 'default',
      'pending': 'yellow'
    };
    
    const labels = {
      'success': 'Success',
      'failed': 'Failed',
      'refunded': 'Refunded',
      'pending': 'Pending'
    };

    return (
      <Badge variant={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  const handleTransactionAction = (action, transactionId) => {
    console.log(`${action} for transaction ${transactionId}`);
    // Implement transaction action logic here
  };

  const handleSavePlan = async (planData) => {
    console.log('Saving plan:', planData);
    
    try {
      if (editingPlan) {
        // Update existing plan
        console.log('Updating existing plan:', editingPlan.id, planData);
        const updatedPlan = await subscriptionPlansService.updatePlan(editingPlan.id, planData);
        setSubscriptionPlans(prevPlans => 
          prevPlans.map(plan => 
            plan.id === editingPlan.id ? updatedPlan : plan
          )
        );
      } else {
        // Create new plan
        console.log('Creating new plan:', planData);
        const newPlan = await subscriptionPlansService.createPlan(planData);
        setSubscriptionPlans(prevPlans => [...prevPlans, newPlan]);
      }
      
      // Reload metadata
      const updatedMetadata = await subscriptionPlansService.getMetadata();
      setMetadata(updatedMetadata);
      
      // Close modal and reset states
      setIsModalOpen(false);
      setEditingPlan(null);
    } catch (error) {
      console.error('Error saving plan:', error);
    }
  };

  const handleEditPlan = (plan) => {
    setEditingPlan(plan);
    setIsModalOpen(true);
  };

  const handleCreatePlan = () => {
    setEditingPlan(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPlan(null);
  };



  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Financials</h1>
        <p className="text-muted-foreground">Manage subscription plans and view transaction history</p>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metadata.totalMonthlyRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12.5%</span> dari bulan lalu
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metadata.totalActiveSubscriptions}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8</span> subscription baru
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Revenue Per User</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(142)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+5.2%</span> dari bulan lalu
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Payments</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600">2</span> perlu tindak lanjut
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        {/* Subscription Plans Tab */}
        <TabsContent value="plans" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Subscription Plans</h2>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => subscriptionPlansService.exportToJSON()}>
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
              <Button onClick={handleCreatePlan}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Plan
                </Button>
            </div>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="text-muted-foreground">Loading subscription plans...</div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {subscriptionPlans.map((plan) => (
                  <Card key={plan.id} className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                    plan.tier === 'enterprise' ? 'border-2 border-purple-500 shadow-lg' :
                    plan.tier === 'professional' ? 'border-2 border-blue-500 shadow-md' :
                    'border-2 border-green-500'
                  }`}>
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${
                              plan.tier === 'enterprise' ? 'bg-purple-500' :
                              plan.tier === 'professional' ? 'bg-blue-500' :
                              'bg-green-500'
                            }`}></div>
                            <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                          </div>
                          <CardDescription className="capitalize text-base">
                            {plan.tier === 'enterprise' ? 'Solusi Enterprise' :
                             plan.tier === 'professional' ? 'Untuk Bisnis' :
                             'Untuk UMKM'}
                          </CardDescription>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="opacity-60 hover:opacity-100">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleEditPlan(plan)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Plan
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Plan
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Popular Badge */}
                      {plan.highlights?.includes('Terpopuler') && (
                        <div className="absolute top-4 right-4 z-10">
                          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 animate-pulse">
                            ⭐ Terpopuler
                          </Badge>
                        </div>
                      )}

                      {/* Highlights */}
                      {plan.highlights && plan.highlights.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {plan.highlights.map((highlight, index) => (
                            <Badge key={index} variant="secondary" className="text-xs font-medium bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                              {highlight}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Pricing Section */}
                      <div className="text-center space-y-2 p-4 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100">
                        <div className="text-4xl font-bold text-gray-900">
                          {formatCurrency(plan.priceMonthly)}
                          <span className="text-lg font-normal text-gray-500">/bulan</span>
                        </div>
                        {plan.priceYearly && (
                          <div className="text-sm text-green-600 font-medium">
                            💰 {formatCurrency(plan.priceYearly)}/tahun
                            <span className="text-xs text-gray-500 ml-1">(hemat 2 bulan)</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Description */}
                      {plan.description && (
                        <div className="text-sm text-gray-600 leading-relaxed">
                          {plan.description}
                        </div>
                      )}
                      
                      {/* Usage Limits */}
                      <div className="grid grid-cols-2 gap-4 p-3 bg-blue-50 rounded-lg">
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">{plan.maxAgents}</div>
                          <div className="text-xs text-gray-600">Agent</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">{plan.maxMessagesPerMonth.toLocaleString()}</div>
                          <div className="text-xs text-gray-600">Pesan/Bulan</div>
                        </div>
                      </div>

                      {/* Features */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-yellow-500" />
                          <p className="text-sm font-semibold text-gray-800">Fitur Unggulan:</p>
                        </div>
                        <ul className="text-sm text-gray-600 space-y-2">
                          {plan.features.slice(0, 6).map((feature, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                          {plan.features.length > 6 && (
                            <li className="text-xs text-blue-600 font-medium">
                              +{plan.features.length - 6} fitur lainnya...
                            </li>
                          )}
                        </ul>
                      </div>

                      {/* CTA Button */}
                      <Button className={`w-full py-3 font-semibold ${
                        plan.tier === 'enterprise' ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' :
                        plan.tier === 'professional' ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700' :
                        'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                      }`}>
                        🚀 Pilih Paket Ini
                      </Button>

                      {/* Stats */}
                      <div className="pt-4 border-t border-gray-200 space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Pelanggan Aktif</span>
                          <span className="font-medium text-gray-700">{plan.activeSubscriptions}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Revenue Bulanan</span>
                          <span className="font-medium text-gray-700">{formatCurrency(plan.totalRevenue)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
          )}
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Transaction History</h2>
            <div className="flex gap-2">
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="text-muted-foreground">{transaction.date}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{transaction.organization}</div>
                          <div className="text-sm text-muted-foreground">{transaction.orgCode}</div>
                        </div>
                      </TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(transaction.amount)}</TableCell>
                      <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                      <TableCell>{transaction.paymentMethod}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleTransactionAction('view', transaction.id)}>
                              View Details
                            </DropdownMenuItem>
                            {transaction.status === 'success' && (
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleTransactionAction('refund', transaction.id)}
                              >
                                Process Refund
                              </DropdownMenuItem>
                            )}
                            {transaction.status === 'failed' && (
                              <DropdownMenuItem onClick={() => handleTransactionAction('retry', transaction.id)}>
                                Retry Payment
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Plan Modal */}
      <PlanModal
        plan={editingPlan}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSavePlan}
      />
    </div>
  );
};

export default Financials;
