import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  BarChart,
  Bar,
  ComposedChart
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Button } from '@/components/ui';
import { BarChart3, LineChart as LineChartIcon, TrendingUp } from 'lucide-react';

const AdvancedGrowthChart = ({ data = [], height = 400 }) => {
  const [chartType, setChartType] = useState('area');
  const [showRevenue, setShowRevenue] = useState(false);

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    return data.map((item, index) => {
      const prevItem = index > 0 ? data[index - 1] : null;

      return {
        ...item,
        displayDate: new Date(item.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        }),
        // Calculate growth rates
        orgGrowthRate: prevItem ?
          ((item.organizations - prevItem.organizations) / prevItem.organizations * 100).toFixed(1) : 0,
        userGrowthRate: prevItem ?
          ((item.users - prevItem.users) / prevItem.users * 100).toFixed(1) : 0,
        // Cumulative new additions
        cumulativeNewOrgs: data.slice(0, index + 1).reduce((sum, d) => sum + (d.newOrganizations || 0), 0),
        cumulativeNewUsers: data.slice(0, index + 1).reduce((sum, d) => sum + (d.newUsers || 0), 0)
      };
    });
  }, [data]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg min-w-[200px]">
          <p className="font-semibold text-gray-900 mb-3">{label}</p>

          <div className="space-y-2">
            {payload.map((entry, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm text-gray-600">{entry.name}</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
                </span>
              </div>
            ))}
          </div>

          {data && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">New Orgs:</span>
                  <span className="ml-1 font-semibold">{data.newOrganizations || 0}</span>
                </div>
                <div>
                  <span className="text-gray-500">New Users:</span>
                  <span className="ml-1 font-semibold">{data.newUsers || 0}</span>
                </div>
                <div>
                  <span className="text-gray-500">Org Growth:</span>
                  <span className={`ml-1 font-semibold ${data.orgGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {data.orgGrowthRate}%
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">User Growth:</span>
                  <span className={`ml-1 font-semibold ${data.userGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {data.userGrowthRate}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    if (!chartData || chartData.length === 0) {
      return (
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center">
            <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <div className="text-gray-400 mb-2">No growth data available</div>
            <div className="text-sm text-gray-500">Growth trend data will appear here</div>
          </div>
        </div>
      );
    }

    const commonProps = {
      data: chartData,
      margin: { top: 20, right: 30, left: 20, bottom: 20 },
    };

    switch (chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="displayDate"
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => value.toLocaleString()}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="organizations"
                stroke="#3b82f6"
                strokeWidth={3}
                name="Organizations"
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="users"
                stroke="#10b981"
                strokeWidth={3}
                name="Users"
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              />
              {showRevenue && (
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Revenue ($)"
                  dot={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="displayDate"
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => value.toLocaleString()}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="organizations" fill="#3b82f6" name="Organizations" radius={[2, 2, 0, 0]} />
              <Bar dataKey="users" fill="#10b981" name="Users" radius={[2, 2, 0, 0]} />
              {showRevenue && (
                <Bar dataKey="revenue" fill="#f59e0b" name="Revenue ($)" radius={[2, 2, 0, 0]} />
              )}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'composed':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="displayDate"
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => value.toLocaleString()}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="newOrganizations" fill="#3b82f6" name="New Organizations" radius={[2, 2, 0, 0]} />
              <Bar dataKey="newUsers" fill="#10b981" name="New Users" radius={[2, 2, 0, 0]} />
              <Line
                type="monotone"
                dataKey="organizations"
                stroke="#1e40af"
                strokeWidth={2}
                name="Total Organizations"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="users"
                stroke="#059669"
                strokeWidth={2}
                name="Total Users"
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        );

      default: // area
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="displayDate"
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => value.toLocaleString()}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="organizations"
                stackId="1"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.2}
                strokeWidth={2}
                name="Organizations"
              />
              <Area
                type="monotone"
                dataKey="users"
                stackId="2"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.2}
                strokeWidth={2}
                name="Users"
              />
              {showRevenue && (
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Revenue ($)"
                  dot={false}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Growth Trend Analysis</span>
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Organization and user growth over time
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <Button
                variant={chartType === 'area' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('area')}
              >
                <Area className="h-4 w-4" />
              </Button>
              <Button
                variant={chartType === 'line' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('line')}
              >
                <LineChartIcon className="h-4 w-4" />
              </Button>
              <Button
                variant={chartType === 'bar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('bar')}
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
              <Button
                variant={chartType === 'composed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('composed')}
              >
                <TrendingUp className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant={showRevenue ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowRevenue(!showRevenue)}
            >
              Revenue
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div style={{ height: `${height}px` }}>
          {renderChart()}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedGrowthChart;
