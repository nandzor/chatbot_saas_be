import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui';
import {
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Download,
  Zap,
  CheckCircle
} from 'lucide-react';

const SubscriptionPlansTab = ({
  subscriptionPlans = [],
  isLoading,
  onEditPlan,
  onCreatePlan,
  onExportData
}) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  // Data sudah ditransformasikan di service → gunakan langsung dari props

  // Ensure subscriptionPlans is always an array
  const safeSubscriptionPlans = Array.isArray(subscriptionPlans) ? subscriptionPlans : [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-muted-foreground">Loading subscription plans...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Subscription Plans</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onExportData}>
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          <Button onClick={onCreatePlan}>
            <Plus className="w-4 h-4 mr-2" />
            Create New Plan
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {safeSubscriptionPlans.map((plan) => (
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
                    <DropdownMenuItem onClick={() => onEditPlan(plan)}>
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
                  <div className="text-lg font-bold text-blue-600">{plan.maxMonthlyMessages.toLocaleString()}</div>
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
    </div>
  );
};

export default SubscriptionPlansTab;
