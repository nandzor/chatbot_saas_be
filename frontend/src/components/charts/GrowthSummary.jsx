import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { TrendingUp, TrendingDown, Users, Building2, DollarSign } from 'lucide-react';

const GrowthSummary = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return null;
  }

  const calculateGrowthMetrics = () => {
    const firstData = data[0];
    const lastData = data[data.length - 1];

    const orgGrowth = firstData && lastData ?
      ((lastData.organizations - firstData.organizations) / firstData.organizations * 100) : 0;

    const userGrowth = firstData && lastData ?
      ((lastData.users - firstData.users) / firstData.users * 100) : 0;

    const totalNewOrgs = data.reduce((sum, item) => sum + (item.newOrganizations || 0), 0);
    const totalNewUsers = data.reduce((sum, item) => sum + (item.newUsers || 0), 0);

    const avgDailyOrgs = totalNewOrgs / data.length;
    const avgDailyUsers = totalNewUsers / data.length;

    return {
      orgGrowth: orgGrowth.toFixed(1),
      userGrowth: userGrowth.toFixed(1),
      totalNewOrgs,
      totalNewUsers,
      avgDailyOrgs: avgDailyOrgs.toFixed(1),
      avgDailyUsers: avgDailyUsers.toFixed(1)
    };
  };

  const metrics = calculateGrowthMetrics();

  const StatCard = ({ title, value, change, icon: Icon, color = "blue" }) => {
    const isPositive = parseFloat(change) >= 0;
    const colorClasses = {
      blue: "text-blue-600 bg-blue-50",
      green: "text-green-600 bg-green-50",
      yellow: "text-yellow-600 bg-yellow-50",
      red: "text-red-600 bg-red-50"
    };

    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <div className="flex items-center mt-1">
                {isPositive ? (
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                )}
                <span className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {change}%
                </span>
              </div>
            </div>
            <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
              <Icon className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Growth Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Organization Growth"
              value={`${metrics.orgGrowth}%`}
              change={metrics.orgGrowth}
              icon={Building2}
              color="blue"
            />
            <StatCard
              title="User Growth"
              value={`${metrics.userGrowth}%`}
              change={metrics.userGrowth}
              icon={Users}
              color="green"
            />
            <StatCard
              title="New Organizations"
              value={metrics.totalNewOrgs}
              change={metrics.avgDailyOrgs}
              icon={Building2}
              color="yellow"
            />
            <StatCard
              title="New Users"
              value={metrics.totalNewUsers}
              change={metrics.avgDailyUsers}
              icon={Users}
              color="green"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GrowthSummary;
