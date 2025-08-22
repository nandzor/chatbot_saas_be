import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Badge,
  Progress,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui';
import { 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Activity,
  CheckCircle,
  AlertTriangle,
  Clock,
  BarChart3
} from 'lucide-react';

const ClientOverview = ({ clientData }) => {

  // Sample data for client overview
  const [overviewData] = useState({
    healthScoreBreakdown: {
      usage: { score: 95, status: 'excellent' },
      satisfaction: { score: 88, status: 'good' },
      billing: { score: 100, status: 'excellent' },
      support: { score: 85, status: 'good' }
    },
    keyTimeline: [
      { date: '2024-01-15', event: 'Account Created', type: 'milestone' },
      { date: '2024-01-20', event: 'First Subscription Activated', type: 'milestone' },
      { date: '2024-03-10', event: 'Support Ticket Resolved', type: 'support' },
      { date: '2024-03-20', event: 'Last Admin Login', type: 'activity' }
    ],
    usageAnalysis: {
      messages: { used: 8500, limit: 10000, percentage: 85 },
      agents: { used: 18, limit: 25, percentage: 72 },
      storage: { used: 4.2, limit: 10, percentage: 42 }
    },
    featureAdoption: [
      { feature: 'AI Chatbot', adopted: true, usage: 95 },
      { feature: 'Live Chat', adopted: true, usage: 78 },
      { feature: 'Analytics', adopted: true, usage: 65 },
      { feature: 'Integrations', adopted: false, usage: 0 },
      { feature: 'API Access', adopted: true, usage: 45 }
    ]
  });

  const getScoreColor = (status) => {
    switch (status) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getUsageColor = (percentage) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-6">
      {/* Health Score Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Health Score Breakdown</CardTitle>
          <CardDescription>Detailed analysis of client health metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {Object.entries(overviewData.healthScoreBreakdown).map(([key, data]) => (
              <div key={key} className="text-center">
                <div className={`text-3xl font-bold mb-2 ${getScoreColor(data.status)}`}>
                  {data.score}
                </div>
                <div className="text-sm font-medium text-gray-600 capitalize mb-1">
                  {key}
                </div>
                <Badge variant={data.status === 'excellent' ? 'green' : data.status === 'good' ? 'blue' : 'yellow'}>
                  {data.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Key Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Key Timeline</CardTitle>
            <CardDescription>Important events and milestones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {overviewData.keyTimeline.map((event, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`p-2 rounded-full ${
                    event.type === 'milestone' ? 'bg-green-100 text-green-600' :
                    event.type === 'support' ? 'bg-blue-100 text-blue-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {event.type === 'milestone' ? <CheckCircle className="w-4 h-4" /> :
                     event.type === 'support' ? <MessageSquare className="w-4 h-4" /> :
                     <Activity className="w-4 h-4" />}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{event.event}</div>
                    <div className="text-xs text-gray-500">{event.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Usage Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Usage Analysis</CardTitle>
            <CardDescription>Current resource utilization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(overviewData.usageAnalysis).map(([key, data]) => (
                <div key={key}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium capitalize">{key}</span>
                    <span className="text-sm text-gray-600">
                      {typeof data.used === 'number' && data.used < 100 
                        ? `${data.used}${key === 'storage' ? 'GB' : ''}`
                        : data.used.toLocaleString()
                      } / {typeof data.limit === 'number' && data.limit < 100
                        ? `${data.limit}${key === 'storage' ? 'GB' : ''}`
                        : data.limit.toLocaleString()
                      }
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getUsageColor(data.percentage)}`}
                      style={{ width: `${data.percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {data.percentage}% used
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feature Adoption */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Adoption</CardTitle>
          <CardDescription>Platform feature usage and adoption status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {overviewData.featureAdoption.map((feature, index) => (
              <div key={index} className="text-center p-4 border rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  {feature.adopted ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <div className="font-medium text-sm mb-1">{feature.feature}</div>
                <Badge variant={feature.adopted ? 'green' : 'default'}>
                  {feature.adopted ? `${feature.usage}% usage` : 'Not Adopted'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientOverview;
