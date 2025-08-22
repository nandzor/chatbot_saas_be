import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Badge,
  Button,
  Alert,
  AlertDescription
} from '@/components/ui';
import { 
  DollarSign,
  Building2,
  CreditCard,
  TrendingDown,
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Users,
  MessageSquare,
  Clock,
  Zap,
  Eye
} from 'lucide-react';

const SuperAdminDashboard = () => {
  // Sample data untuk Business Intelligence
  const [biMetrics] = useState({
    mrr: 125750, // Monthly Recurring Revenue
    activeOrganizations: 342,
    activeSubscriptions: 387,
    churnRate: 2.4
  });

  // Sample data untuk Operational Health
  const [operationalHealth] = useState({
    systemHealth: {
      status: 'healthy',
      errorRate: 0.12,
      responseTime: 145
    },
    n8nStatus: {
      successRate: 99.7,
      totalExecutions: 15420,
      failedExecutions: 46
    }
  });

  // Sample data untuk Recent Activity
  const [recentActivities] = useState([
    {
      id: 1,
      timestamp: '2024-03-20 14:30:25',
      organization: 'ABC Corp',
      action: 'User Invited',
      description: 'New user sari.dewi@abccorp.com invited',
      type: 'user_management'
    },
    {
      id: 2,
      timestamp: '2024-03-20 13:45:12',
      organization: 'TechStart Inc',
      action: 'Plan Upgraded',
      description: 'Upgraded from Basic to Enterprise plan',
      type: 'subscription'
    },
    {
      id: 3,
      timestamp: '2024-03-20 12:15:45',
      organization: 'Global Solutions',
      action: 'Payment Processed',
      description: 'Monthly subscription payment $299',
      type: 'payment'
    },
    {
      id: 4,
      timestamp: '2024-03-20 11:30:18',
      organization: 'Digital Agency',
      action: 'Workflow Created',
      description: 'New N8N workflow: Customer Onboarding',
      type: 'automation'
    },
    {
      id: 5,
      timestamp: '2024-03-20 10:22:33',
      organization: 'StartupXYZ',
      action: 'Trial Started',
      description: 'Started 14-day Enterprise trial',
      type: 'trial'
    }
  ]);

  const getHealthIcon = (status) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'user_management':
        return <Users className="w-4 h-4 text-blue-500" />;
      case 'subscription':
        return <CreditCard className="w-4 h-4 text-green-500" />;
      case 'payment':
        return <DollarSign className="w-4 h-4 text-emerald-500" />;
      case 'automation':
        return <Zap className="w-4 h-4 text-purple-500" />;
      case 'trial':
        return <Clock className="w-4 h-4 text-orange-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Super Admin Dashboard</h1>
        <p className="text-muted-foreground">Platform overview dan business intelligence</p>
      </div>

      {/* Business Intelligence Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* MRR */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Recurring Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(biMetrics.mrr)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12.4%</span> dari bulan lalu
            </p>
          </CardContent>
        </Card>

        {/* Active Organizations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Organizations</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{biMetrics.activeOrganizations.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8</span> organisasi baru minggu ini
            </p>
          </CardContent>
        </Card>

        {/* Active Subscriptions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{biMetrics.activeSubscriptions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+15</span> subscription aktif
            </p>
          </CardContent>
        </Card>

        {/* Churn Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{biMetrics.churnRate}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">-0.8%</span> dari bulan lalu
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Operational Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Health Monitor */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getHealthIcon(operationalHealth.systemHealth.status)}
              System Health Monitor
            </CardTitle>
            <CardDescription>Real-time platform health metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge variant={operationalHealth.systemHealth.status === 'healthy' ? 'default' : 'destructive'}>
                {operationalHealth.systemHealth.status === 'healthy' ? 'Healthy' : 'Issues Detected'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Error Rate</span>
              <span className="text-sm font-medium">{operationalHealth.systemHealth.errorRate}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Avg Response Time</span>
              <span className="text-sm font-medium">{operationalHealth.systemHealth.responseTime}ms</span>
            </div>
            <Button variant="outline" size="sm" className="w-full">
              <Eye className="w-4 h-4 mr-2" />
              View Detailed Logs
            </Button>
          </CardContent>
        </Card>

        {/* N8N Execution Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-500" />
              N8N Execution Status
            </CardTitle>
            <CardDescription>Workflow automation platform status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Success Rate</span>
              <span className="text-sm font-medium text-green-600">{operationalHealth.n8nStatus.successRate}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Executions</span>
              <span className="text-sm font-medium">{operationalHealth.n8nStatus.totalExecutions.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Failed Executions</span>
              <span className="text-sm font-medium text-red-600">{operationalHealth.n8nStatus.failedExecutions}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{width: `${operationalHealth.n8nStatus.successRate}%`}}
              ></div>
            </div>
            <Button variant="outline" size="sm" className="w-full">
              <Activity className="w-4 h-4 mr-2" />
              View N8N Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Recent Platform Activity
          </CardTitle>
          <CardDescription>Latest activities across all organizations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{activity.action}</span>
                    <Badge variant="outline" className="text-xs">
                      {activity.organization}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t">
            <Button variant="outline" className="w-full">
              View All Activities
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuperAdminDashboard;
