import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Progress,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Phone,
  Mail,
  BookOpen,
  Calendar,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';

const ClientHealthDashboard = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [isLoading, setIsLoading] = useState(false);

  // Sample data for dashboard
  const [dashboardData] = useState({
    overview: {
      totalClients: 156,
      activeClients: 142,
      atRiskClients: 12,
      criticalClients: 2,
      totalMRR: 456000000,
      mrrAtRisk: 89000000,
      churnRate: 2.8
    },
    healthDistribution: {
      healthy: { count: 98, percentage: 62.8, mrr: 298000000 },
      atRisk: { count: 12, percentage: 7.7, mrr: 89000000 },
      critical: { count: 2, percentage: 1.3, mrr: 12000000 },
      trial: { count: 44, percentage: 28.2, mrr: 57000000 }
    },
    cohortAnalysis: {
      q1_2024: { joined: 45, churned: 2, retention: 95.6 },
      q4_2023: { joined: 38, churned: 3, retention: 92.1 },
      q3_2023: { joined: 42, churned: 1, retention: 97.6 },
      q2_2023: { joined: 31, churned: 4, retention: 87.1 }
    },
    csmActivity: {
      totalCalls: 89,
      totalEmails: 234,
      playbooksExecuted: 45,
      avgResponseTime: '2.3h',
      satisfactionScore: 4.6
    },
    recentActivity: [
      { id: 1, type: 'call', client: 'ABC Corporation', csm: 'Sarah Johnson', duration: '45m', outcome: 'positive' },
      { id: 2, type: 'email', client: 'TechStart Inc', csm: 'Mike Chen', subject: 'Feature Training', outcome: 'pending' },
      { id: 3, type: 'playbook', client: 'Global Solutions', csm: 'Lisa Wang', playbook: 'Onboarding Enterprise', status: 'completed' },
      { id: 4, type: 'call', client: 'Digital Agency Pro', csm: 'David Kim', duration: '32m', outcome: 'positive' }
    ]
  });

  const getHealthColor = (category) => {
    switch (category) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'atRisk': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      case 'trial': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getHealthIcon = (category) => {
    switch (category) {
      case 'healthy': return <CheckCircle className="w-4 h-4" />;
      case 'atRisk': return <AlertTriangle className="w-4 h-4" />;
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      case 'trial': return <Clock className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Client Health Dashboard</h1>
          <p className="text-muted-foreground">Portfolio health overview and Customer Success metrics</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <BarChart3 className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total MRR</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(dashboardData.overview.totalMRR)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12.5%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MRR at Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(dashboardData.overview.mrrAtRisk)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600">+2.1%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.overview.churnRate}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">-0.3%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.overview.activeClients}</div>
            <p className="text-xs text-muted-foreground">
              of {dashboardData.overview.totalClients} total clients
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cohort">Cohort Analysis</TabsTrigger>
          <TabsTrigger value="csm">CSM Activity</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Health Score Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Health Score Distribution</CardTitle>
                <CardDescription>Client portfolio health breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(dashboardData.healthDistribution).map(([category, data]) => (
                    <div key={category} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${getHealthColor(category)}`}>
                          {getHealthIcon(category)}
                        </div>
                        <div>
                          <div className="font-medium capitalize">{category}</div>
                          <div className="text-sm text-muted-foreground">
                            {data.count} clients • {formatCurrency(data.mrr)} MRR
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{data.percentage}%</div>
                        <Progress value={data.percentage} className="w-20 h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* CSM Activity Summary */}
            <Card>
              <CardHeader>
                <CardTitle>CSM Team Activity</CardTitle>
                <CardDescription>Last 7 days performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-blue-500" />
                      <span>Total Calls</span>
                    </div>
                    <span className="font-bold">{dashboardData.csmActivity.totalCalls}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-green-500" />
                      <span>Total Emails</span>
                    </div>
                    <span className="font-bold">{dashboardData.csmActivity.totalEmails}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-purple-500" />
                      <span>Playbooks Executed</span>
                    </div>
                    <span className="font-bold">{dashboardData.csmActivity.playbooksExecuted}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-orange-500" />
                      <span>Avg Response Time</span>
                    </div>
                    <span className="font-bold">{dashboardData.csmActivity.avgResponseTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span>Satisfaction Score</span>
                    </div>
                    <span className="font-bold">{dashboardData.csmActivity.satisfactionScore}/5.0</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Cohort Analysis Tab */}
        <TabsContent value="cohort" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cohort Churn Analysis</CardTitle>
              <CardDescription>Client retention by join quarter</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(dashboardData.cohortAnalysis).map(([quarter, data]) => (
                  <div key={quarter} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{quarter.toUpperCase()}</div>
                      <div className="text-sm text-muted-foreground">
                        Joined: {data.joined} • Churned: {data.churned}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{data.retention}%</div>
                      <div className="text-sm text-muted-foreground">Retention Rate</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CSM Activity Tab */}
        <TabsContent value="csm" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>CSM Performance Metrics</CardTitle>
              <CardDescription>Detailed team performance breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{dashboardData.csmActivity.totalCalls}</div>
                  <div className="text-sm text-muted-foreground">Total Calls</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{dashboardData.csmActivity.totalEmails}</div>
                  <div className="text-sm text-muted-foreground">Total Emails</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{dashboardData.csmActivity.playbooksExecuted}</div>
                  <div className="text-sm text-muted-foreground">Playbooks Executed</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recent Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent CSM Activity</CardTitle>
              <CardDescription>Latest interactions and playbook executions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        activity.type === 'call' ? 'bg-blue-100 text-blue-600' :
                        activity.type === 'email' ? 'bg-green-100 text-green-600' :
                        'bg-purple-100 text-purple-600'
                      }`}>
                        {activity.type === 'call' ? <Phone className="w-4 h-4" /> :
                         activity.type === 'email' ? <Mail className="w-4 h-4" /> :
                         <BookOpen className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="font-medium">{activity.client}</div>
                        <div className="text-sm text-muted-foreground">
                          {activity.type === 'call' ? `Call with ${activity.csm} • ${activity.duration}` :
                           activity.type === 'email' ? `Email by ${activity.csm} • ${activity.subject}` :
                           `${activity.playbook} by ${activity.csm}`}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={
                        activity.outcome === 'positive' ? 'green' :
                        activity.outcome === 'completed' ? 'blue' :
                        'default'
                      }>
                        {activity.outcome === 'positive' ? 'Positive' :
                         activity.outcome === 'completed' ? 'Completed' :
                         activity.outcome === 'pending' ? 'Pending' : activity.outcome}
                      </Badge>
                      <div className="text-xs text-muted-foreground mt-1">
                        {activity.type === 'call' ? '2 hours ago' :
                         activity.type === 'email' ? '4 hours ago' :
                         '1 day ago'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientHealthDashboard;
