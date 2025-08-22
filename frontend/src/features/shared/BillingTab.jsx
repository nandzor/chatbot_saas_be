import React, { useState } from 'react';
import { subscriptionPlansData } from '@/data/sampleData';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Button,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Label,
  Progress,
  Alert,
  AlertDescription
} from '@/components/ui';
import { 
  CreditCard,
  RefreshCw, 
  Download,
  Zap,
  Activity,
  Users,
  CheckCircle,
  FileText,
  X,
  Crown,
  Star,
  Rocket,
  Shield,
  Calendar,
  DollarSign,
  ArrowRight,
  Clock,
  Info,
  Check,
  MoreHorizontal,
  TrendingUp,
  Filter
} from 'lucide-react';

const BillingTab = () => {
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('enterprise');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Format currency like in superadmin
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Get current subscription data from superadmin plans
  const currentPlan = subscriptionPlansData.find(plan => plan.id === 'pro'); // Business plan as current
  const subscriptionData = {
    plan: currentPlan?.name || 'Business',
    price: `Rp ${(currentPlan?.priceMonthly || 799000).toLocaleString('id-ID')}/bulan`,
    validUntil: '20 April 2024',
    status: 'Aktif'
  };

  const usageData = {
    currentMessages: 1245,
    limitMessages: currentPlan?.maxMessagesPerMonth || 2000,
    percentage: Math.round((1245 / (currentPlan?.maxMessagesPerMonth || 2000)) * 100),
    activeUsers: 8,
    totalSeats: currentPlan?.maxAgents || 10,
    userPercentage: Math.round((8 / (currentPlan?.maxAgents || 10)) * 100)
  };

  const paymentTransactions = [
    { 
      id: 1, 
      date: '20 Mar 2024', 
      description: `${currentPlan?.name || 'Business'} Plan - Subscription`, 
      amount: formatCurrency(currentPlan?.priceMonthly || 799000), 
      status: 'Paid', 
      invoiceNumber: 'INV-2024-001' 
    },
    { 
      id: 2, 
      date: '20 Feb 2024', 
      description: `${currentPlan?.name || 'Business'} Plan - Subscription`, 
      amount: formatCurrency(currentPlan?.priceMonthly || 799000), 
      status: 'Paid', 
      invoiceNumber: 'INV-2024-002' 
    },
    { 
      id: 3, 
      date: '20 Jan 2024', 
      description: `${currentPlan?.name || 'Business'} Plan - Subscription`, 
      amount: formatCurrency(currentPlan?.priceMonthly || 799000), 
      status: 'Paid', 
      invoiceNumber: 'INV-2024-003' 
    },
  ];

  // Map superadmin subscription plans to billing format
  const availablePlans = subscriptionPlansData.map(plan => {
    // Determine icon based on tier
    let icon = Zap;
    if (plan.tier === 'professional') icon = Star;
    if (plan.tier === 'enterprise') icon = Crown;

    // Convert IDR to USD for display (approximate conversion)
    const monthlyPriceUSD = Math.round(plan.priceMonthly / 15000);
    const yearlyPriceUSD = Math.round(plan.priceYearly / 15000);

    return {
      id: plan.id,
      name: plan.name,
      tier: plan.tier,
      icon: icon,
      price: { 
        monthly: monthlyPriceUSD, 
        yearly: yearlyPriceUSD,
        monthlyIDR: plan.priceMonthly,
        yearlyIDR: plan.priceYearly
      },
      features: plan.features.slice(0, 6), // Show first 6 features for better UI
      current: plan.id === 'pro', // Assume current plan is 'pro' (Business)
      popular: plan.highlights?.includes('Nilai Terbaik') || plan.highlights?.includes('Terpopuler'),
      maxAgents: plan.maxAgents,
      maxMessages: plan.maxMessagesPerMonth,
      description: plan.description,
      highlights: plan.highlights
    };
  });

  const handleUpgradePlan = () => {
    setShowUpgradeDialog(true);
  };

  const handleDownloadInvoice = (transaction = null) => {
    setSelectedInvoice(transaction);
    setShowInvoiceDialog(true);
  };

  const handleConfirmUpgrade = () => {
    // Simulate upgrade process
    setShowUpgradeDialog(false);
    // In real app, this would trigger payment process
  };

  const handleDownloadInvoiceFile = () => {
    // Simulate invoice download
    setShowInvoiceDialog(false);
    // In real app, this would trigger file download
  };

  const closeDialogs = () => {
    setShowUpgradeDialog(false);
    setShowInvoiceDialog(false);
    setSelectedInvoice(null);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Billing & Subscription</h1>
          <p className="text-gray-600">Kelola langganan, tagihan, dan upgrade paket Anda</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => handleDownloadInvoice()}>
            <Download className="w-4 h-4 mr-2" />
            Download Invoice
          </Button>
          <Button onClick={handleUpgradePlan} className="bg-blue-600 hover:bg-blue-700">
            <RefreshCw className="w-4 h-4 mr-2" />
            Upgrade Plan
          </Button>
        </div>
      </div>

      {/* Current Subscription Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Plan Info Card */}
        <Card className="lg:col-span-2 border-l-4 border-l-blue-500">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">{subscriptionData.plan}</CardTitle>
                  <CardDescription className="text-sm">Paket aktif saat ini</CardDescription>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800 border-green-200">
                {subscriptionData.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold text-gray-900">
                  {formatCurrency(currentPlan?.priceMonthly || 799000)}
                  <span className="text-lg font-normal text-gray-500">/bulan</span>
                </div>
                <div className="text-sm text-green-600 font-medium">
                  💰 {formatCurrency(currentPlan?.priceYearly || 7990000)}/tahun
                  <span className="text-xs text-gray-500 ml-1">(hemat 2 bulan)</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Berlaku hingga</span>
              <span className="font-medium text-gray-900">{subscriptionData.validUntil}</span>
            </div>
          </CardContent>
        </Card>
        
        {/* Usage Statistics */}
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Penggunaan Pesan</CardTitle>
                <CardDescription>Bulan ini</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {usageData.currentMessages.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">
                dari {usageData.limitMessages.toLocaleString()} pesan
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Progress</span>
                <span className="font-medium">{usageData.percentage}%</span>
              </div>
              <Progress value={usageData.percentage} className="h-2" />
            </div>
          </CardContent>
        </Card>
        
        {/* Active Users */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Tim Aktif</CardTitle>
                <CardDescription>Agent tersedia</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {usageData.activeUsers}
              </div>
              <div className="text-sm text-gray-500">
                dari {usageData.totalSeats} agent
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Kapasitas</span>
                <span className="font-medium">{usageData.userPercentage}%</span>
              </div>
              <Progress value={usageData.userPercentage} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Riwayat Pembayaran</CardTitle>
                <CardDescription>Transaksi dan tagihan terbaru</CardDescription>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b-2">
                  <TableHead className="font-semibold text-gray-700">Tanggal</TableHead>
                  <TableHead className="font-semibold text-gray-700">Deskripsi</TableHead>
                  <TableHead className="font-semibold text-gray-700">Jumlah</TableHead>
                  <TableHead className="font-semibold text-gray-700">Status</TableHead>
                  <TableHead className="font-semibold text-gray-700 text-center">Invoice</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentTransactions.map((transaction) => (
                  <TableRow key={transaction.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="font-medium text-gray-900">{transaction.date}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-gray-700">{transaction.description}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-gray-900">{transaction.amount}</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {transaction.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownloadInvoice(transaction)}
                        className="hover:bg-blue-50 hover:border-blue-300"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        <span className="hidden sm:inline">Download</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {/* Summary Footer */}
          <div className="mt-6 pt-4 border-t bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Total transaksi bulan ini</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(currentPlan?.priceMonthly || 799000)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Plan Dialog */}
      {showUpgradeDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto shadow-2xl">
            <div className="p-8">
              {/* Dialog Header */}
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Upgrade Paket Anda</h2>
                  <p className="text-gray-600">Pilih paket yang sesuai dengan kebutuhan bisnis Anda</p>
                </div>
                <Button variant="ghost" size="sm" onClick={closeDialogs} className="hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Billing Cycle Toggle */}
              <div className="mb-8">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Pilih Periode Tagihan</h3>
                  <p className="text-sm text-gray-600">Hemat lebih banyak dengan paket tahunan</p>
                </div>
                <div className="flex items-center justify-center">
                  <div className="flex items-center bg-gray-100 rounded-xl p-1.5 shadow-inner">
                    <Button
                      variant={billingCycle === 'monthly' ? 'default' : 'ghost'}
                      size="lg"
                      onClick={() => setBillingCycle('monthly')}
                      className="rounded-lg px-6 py-3 font-medium transition-all"
                    >
                      Bulanan
                    </Button>
                    <Button
                      variant={billingCycle === 'yearly' ? 'default' : 'ghost'}
                      size="lg"
                      onClick={() => setBillingCycle('yearly')}
                      className="rounded-lg px-6 py-3 font-medium transition-all"
                    >
                      Tahunan 
                      <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700 border-green-200">
                        Hemat 20%
                      </Badge>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Plans Grid - Superadmin Style */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
                {availablePlans.map((plan) => {
                  const isSelected = selectedPlan === plan.id;
                  const isCurrentPlan = plan.current;

                  return (
                    <Card key={plan.id} className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer ${
                      plan.tier === 'enterprise' ? 'border-2 border-purple-500 shadow-lg' :
                      plan.tier === 'professional' ? 'border-2 border-blue-500 shadow-md' :
                      'border-2 border-green-500'
                    } ${isSelected ? 'ring-2 ring-blue-400' : ''}`}
                    onClick={() => setSelectedPlan(plan.id)}>
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
                          {isCurrentPlan && (
                            <Badge variant="secondary" className="bg-green-600 text-white">
                              Current Plan
                            </Badge>
                          )}
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
                            {formatCurrency(billingCycle === 'monthly' ? plan.price.monthlyIDR : plan.price.yearlyIDR)}
                            <span className="text-lg font-normal text-gray-500">/{billingCycle === 'monthly' ? 'bulan' : 'tahun'}</span>
                          </div>
                          {billingCycle === 'yearly' && (
                            <div className="text-sm text-green-600 font-medium">
                              💰 Hemat 2 bulan
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
                            <div className="text-lg font-bold text-blue-600">{plan.maxMessages.toLocaleString()}</div>
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
                          isCurrentPlan ? 'bg-gray-400 cursor-not-allowed' :
                          plan.tier === 'enterprise' ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' :
                          plan.tier === 'professional' ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700' :
                          'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                        }`} disabled={isCurrentPlan}>
                          {isCurrentPlan ? '✓ Paket Aktif' : '🚀 Pilih Paket Ini'}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Upgrade Summary */}
              {selectedPlan !== 'pro' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-900">Plan Change Summary</p>
                      <p className="text-blue-700 mt-1">
                        {selectedPlan === 'starter' 
                          ? 'Downgrading to Starter plan will reduce your message limit and team size.'
                          : 'Upgrading to Enterprise will give you unlimited access to all features.'
                        }
                      </p>
                      {selectedPlan === 'enterprise' && (
                        <div className="mt-2">
                          <p className="font-medium text-blue-900">What you'll get:</p>
                          <ul className="list-disc list-inside text-blue-700 mt-1">
                            <li>Unlimited messages and team members</li>
                            <li>Advanced AI features and custom branding</li>
                            <li>24/7 priority support with SLA</li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Method */}
              <div className="bg-gray-50 rounded-xl p-6 mb-8">
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  Metode Pembayaran
                </h4>
                <div className="bg-white rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">VISA</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">**** **** **** 4242</p>
                        <p className="text-sm text-gray-500">Berakhir 12/2025</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="hover:bg-blue-50 hover:border-blue-300">
                      Ubah Kartu
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Pembayaran aman dan terenkripsi
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
                <Button 
                  onClick={handleConfirmUpgrade}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 text-lg font-semibold rounded-xl shadow-lg"
                  disabled={selectedPlan === 'pro'}
                >
                  <Rocket className="w-5 h-5 mr-2" />
                  {selectedPlan === 'pro' ? '✓ Paket Aktif' : 'Upgrade Sekarang'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={closeDialogs} 
                  className="flex-1 py-3 text-lg font-medium rounded-xl border-2 hover:bg-gray-50"
                >
                  Batal
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Download Invoice Dialog */}
      {showInvoiceDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Download className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Download Invoice</h3>
                    <p className="text-sm text-gray-600">Unduh tagihan dalam format PDF</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={closeDialogs} className="hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {selectedInvoice ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 border rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium">{selectedInvoice.invoiceNumber}</p>
                        <p className="text-sm text-gray-600">{selectedInvoice.date}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Description:</span>
                        <span className="font-medium">{selectedInvoice.description}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Amount:</span>
                        <span className="font-medium">{selectedInvoice.amount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <Badge variant="default" className="text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {selectedInvoice.status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <Alert>
                    <Info className="w-4 h-4" />
                    <AlertDescription>
                      The invoice will be downloaded as a PDF file to your device.
                    </AlertDescription>
                  </Alert>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">Download the latest invoice for your current subscription.</p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <div className="text-sm">
                        <p className="font-medium text-blue-900">Latest Invoice</p>
                        <p className="text-blue-700">{currentPlan?.name || 'Business'} Plan - March 2024 ({formatCurrency(currentPlan?.priceMonthly || 799000)})</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t mt-6">
                <Button 
                  onClick={handleDownloadInvoiceFile}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 font-semibold rounded-xl shadow-lg"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download PDF
                </Button>
                <Button 
                  variant="outline" 
                  onClick={closeDialogs} 
                  className="flex-1 py-3 font-medium rounded-xl border-2 hover:bg-gray-50"
                >
                  Batal
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingTab;
