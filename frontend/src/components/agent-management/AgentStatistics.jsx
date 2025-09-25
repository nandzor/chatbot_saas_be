import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui';
import {
  Users,
  UserCheck,
  UserX,
  Pause,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Star
} from 'lucide-react';

const AgentStatistics = ({ statistics }) => {
  if (!statistics) return null;

  const stats = [
    {
      title: 'Total Agents',
      value: statistics.total_agents || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Active Agents',
      value: statistics.active_agents || 0,
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Inactive Agents',
      value: statistics.inactive_agents || 0,
      icon: UserX,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
    },
    {
      title: 'Suspended Agents',
      value: statistics.suspended_agents || 0,
      icon: Pause,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  const availabilityStats = [
    {
      title: 'Available',
      value: statistics.available_agents || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Busy',
      value: statistics.busy_agents || 0,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Away',
      value: statistics.away_agents || 0,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Offline',
      value: statistics.offline_agents || 0,
      icon: Pause,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
    },
  ];

  const performanceStats = [
    {
      title: 'Avg Satisfaction',
      value: statistics.avg_satisfaction ? statistics.avg_satisfaction.toFixed(1) : '0.0',
      suffix: '/5',
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Avg Response Time',
      value: statistics.avg_response_time ? statistics.avg_response_time.toFixed(0) : '0',
      suffix: 's',
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Status Overview</CardTitle>
          <CardDescription>
            Current status distribution of your agents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className={`p-4 rounded-lg ${stat.bgColor}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                    <Icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Availability Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Availability Overview</CardTitle>
          <CardDescription>
            Current availability status of your agents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {availabilityStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className={`p-4 rounded-lg ${stat.bgColor}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                    <Icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Overview</CardTitle>
          <CardDescription>
            Average performance metrics across all agents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {performanceStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className={`p-4 rounded-lg ${stat.bgColor}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className={`text-2xl font-bold ${stat.color}`}>
                        {stat.value}{stat.suffix}
                      </p>
                    </div>
                    <Icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Stats</CardTitle>
          <CardDescription>
            Key metrics at a glance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {statistics.total_agents || 0}
              </div>
              <div className="text-sm text-gray-600">Total Agents</div>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {statistics.active_agents || 0}
              </div>
              <div className="text-sm text-gray-600">Active Agents</div>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {statistics.available_agents || 0}
              </div>
              <div className="text-sm text-gray-600">Available Now</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentStatistics;
