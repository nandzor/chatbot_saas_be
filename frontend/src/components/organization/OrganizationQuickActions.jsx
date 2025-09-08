import React from 'react';
import {
  Building2,
  Users,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle,
  Plus,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui';

const OrganizationQuickActions = ({
  statistics = {},
  onRefresh,
  onCreateNew,
  onExport,
  onImport,
  loading = false
}) => {
  const quickActions = [
    {
      id: 'active',
      title: 'Active Organizations',
      value: statistics.active_organizations || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Currently active organizations'
    },
    {
      id: 'trial',
      title: 'Trial Organizations',
      value: statistics.trial_organizations || 0,
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Organizations in trial period'
    },
    {
      id: 'expired',
      title: 'Expired Trials',
      value: statistics.expired_trial_organizations || 0,
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'Organizations with expired trials'
    },
    {
      id: 'with-users',
      title: 'With Users',
      value: statistics.organizations_with_users || 0,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Organizations with active users'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => {
          const IconComponent = action.icon;
          return (
            <Card key={action.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{action.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{action.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${action.bgColor}`}>
                    <IconComponent className={`h-6 w-6 ${action.color}`} />
                  </div>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className="text-xs text-gray-500 mt-1 cursor-help">
                        {action.description}
                      </p>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{action.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="h-5 w-5" />
            <span>Quick Actions</span>
          </CardTitle>
          <CardDescription>
            Common actions for organization management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={onCreateNew}
              className="flex items-center space-x-2"
              disabled={loading}
            >
              <Plus className="h-4 w-4" />
              <span>Create Organization</span>
            </Button>

            <Button
              variant="outline"
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Data</span>
            </Button>

            <Button
              variant="outline"
              onClick={onExport}
              disabled={loading}
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export Data</span>
            </Button>

            <Button
              variant="outline"
              onClick={onImport}
              disabled={loading}
              className="flex items-center space-x-2"
            >
              <Upload className="h-4 w-4" />
              <span>Import Data</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Business Type Statistics */}
      {statistics.business_type_stats && Object.keys(statistics.business_type_stats).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Business Type Distribution</span>
            </CardTitle>
            <CardDescription>
              Distribution of organizations by business type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(statistics.business_type_stats).map(([type, count]) => (
                <Badge key={type} variant="secondary" className="px-3 py-1">
                  {type}: {count}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Industry Statistics */}
      {statistics.industry_stats && Object.keys(statistics.industry_stats).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="h-5 w-5" />
              <span>Industry Distribution</span>
            </CardTitle>
            <CardDescription>
              Distribution of organizations by industry
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(statistics.industry_stats).map(([industry, count]) => (
                <Badge key={industry} variant="outline" className="px-3 py-1">
                  {industry}: {count}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OrganizationQuickActions;
