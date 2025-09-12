import React, { useState, useCallback } from 'react';
import {
  Building2,
  Plus,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Users,
  Activity
} from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Skeleton,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui';
import { useClientManagement } from '@/hooks/useClientManagement';

const ClientManagementDashboard = () => {
  const [viewMode, setViewMode] = useState('overview');

  const {
    organizations,
    loading,
    error,
    statistics,
    loadOrganizations,
    getOrganizationStatistics
  } = useClientManagement();

  const [statisticsData, setStatisticsData] = useState({});
  const [statisticsLoading, setStatisticsLoading] = useState(true);

  const loadStatistics = useCallback(async () => {
    try {
      setStatisticsLoading(true);
      const response = await getOrganizationStatistics();
      if (response.success) {
        setStatisticsData(response.data);
      }
    } catch (error) {
    } finally {
      setStatisticsLoading(false);
    }
  }, [getOrganizationStatistics]);

  React.useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);

  const handleRefresh = useCallback(() => {
    loadOrganizations(true);
    loadStatistics();
  }, [loadOrganizations, loadStatistics]);

  const statisticsCards = [
    {
      title: 'Total Organizations',
      value: statisticsData.total_organizations || 0,
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      loading: statisticsLoading,
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Active Organizations',
      value: statisticsData.active_organizations || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      loading: statisticsLoading,
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: 'Trial Organizations',
      value: statisticsData.trial_organizations || 0,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      loading: statisticsLoading,
      change: '+15%',
      changeType: 'positive'
    },
    {
      title: 'Suspended Organizations',
      value: statisticsData.inactive_organizations || 0,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      loading: statisticsLoading,
      change: '-3%',
      changeType: 'negative'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Client Management</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive management of all client organizations and their data
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={viewMode} onValueChange={setViewMode}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Overview</SelectItem>
              <SelectItem value="table">Table View</SelectItem>
              <SelectItem value="analytics">Analytics</SelectItem>
              <SelectItem value="settings">Settings</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Client
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statisticsCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                    {card.loading ? (
                      <Skeleton className="h-8 w-16 mt-2" />
                    ) : (
                      <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                    )}
                    <div className="flex items-center mt-2">
                      <span className={`text-xs font-medium ${
                        card.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {card.change}
                      </span>
                      <span className="text-xs text-gray-500 ml-1">vs last month</span>
                    </div>
                  </div>
                  <div className={`h-12 w-12 ${card.bgColor} rounded-lg flex items-center justify-center`}>
                    <Icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Total Users</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">1,234</p>
            <p className="text-sm text-gray-500">Across all organizations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Active Sessions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">456</p>
            <p className="text-sm text-gray-500">Currently online</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="h-5 w-5" />
              <span>New This Month</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">23</p>
            <p className="text-sm text-gray-500">Organizations registered</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientManagementDashboard;
