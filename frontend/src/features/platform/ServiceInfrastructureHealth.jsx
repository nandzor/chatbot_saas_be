import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Badge,
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Progress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui';
import { 
  Server, 
  Database, 
  Cloud, 
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Cpu,
  HardDrive,
  Network,
  Zap,
  RefreshCw,
  PlayCircle,
  StopCircle,
  Pause,
  Settings,
  Download,
  Upload,
  Globe,
  Shield,
  TrendingUp,
  TrendingDown,
  Minus,
  ExternalLink,
  FileText,
  Archive,
  RotateCcw
} from 'lucide-react';

const ServiceInfrastructureHealth = () => {
  const [activeTab, setActiveTab] = useState('microservices');
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);

  // Mock data untuk microservices
  const [microservices, setMicroservices] = useState([
    {
      id: 'api-gateway',
      name: 'API Gateway',
      status: 'healthy',
      version: 'v2.1.3',
      instances: 3,
      healthyInstances: 3,
      uptime: '99.9%',
      lastDeployment: '2024-01-20T10:00:00Z',
      metrics: {
        requestsPerMinute: 1247,
        p99Latency: 45,
        errorRate: 0.2,
        cpuUsage: 65,
        memoryUsage: 70,
        diskUsage: 45
      },
      endpoints: [
        { path: '/api/v1/auth', status: 'healthy', responseTime: 120 },
        { path: '/api/v1/users', status: 'healthy', responseTime: 85 },
        { path: '/api/v1/payments', status: 'degraded', responseTime: 350 }
      ]
    },
    {
      id: 'auth-service',
      name: 'Authentication Service',
      status: 'healthy',
      version: 'v1.8.2',
      instances: 2,
      healthyInstances: 2,
      uptime: '99.8%',
      lastDeployment: '2024-01-18T14:30:00Z',
      metrics: {
        requestsPerMinute: 523,
        p99Latency: 78,
        errorRate: 0.1,
        cpuUsage: 45,
        memoryUsage: 60,
        diskUsage: 30
      },
      endpoints: [
        { path: '/auth/login', status: 'healthy', responseTime: 95 },
        { path: '/auth/refresh', status: 'healthy', responseTime: 65 },
        { path: '/auth/verify', status: 'healthy', responseTime: 110 }
      ]
    },
    {
      id: 'messaging-service',
      name: 'Messaging Service',
      status: 'warning',
      version: 'v1.5.1',
      instances: 2,
      healthyInstances: 1,
      uptime: '98.5%',
      lastDeployment: '2024-01-15T09:15:00Z',
      metrics: {
        requestsPerMinute: 892,
        p99Latency: 156,
        errorRate: 2.1,
        cpuUsage: 85,
        memoryUsage: 90,
        diskUsage: 65
      },
      endpoints: [
        { path: '/messaging/email', status: 'warning', responseTime: 245 },
        { path: '/messaging/sms', status: 'healthy', responseTime: 120 },
        { path: '/messaging/webhook', status: 'error', responseTime: 0 }
      ]
    },
    {
      id: 'payment-service',
      name: 'Payment Processing',
      status: 'healthy',
      version: 'v3.2.1',
      instances: 4,
      healthyInstances: 4,
      uptime: '99.95%',
      lastDeployment: '2024-01-22T16:45:00Z',
      metrics: {
        requestsPerMinute: 234,
        p99Latency: 89,
        errorRate: 0.05,
        cpuUsage: 35,
        memoryUsage: 55,
        diskUsage: 40
      },
      endpoints: [
        { path: '/payments/process', status: 'healthy', responseTime: 180 },
        { path: '/payments/refund', status: 'healthy', responseTime: 145 },
        { path: '/payments/webhook', status: 'healthy', responseTime: 90 }
      ]
    },
    {
      id: 'n8n-workflows',
      name: 'N8N Workflow Engine',
      status: 'healthy',
      version: 'v0.219.1',
      instances: 2,
      healthyInstances: 2,
      uptime: '99.7%',
      lastDeployment: '2024-01-19T11:20:00Z',
      metrics: {
        requestsPerMinute: 167,
        p99Latency: 234,
        errorRate: 0.3,
        cpuUsage: 55,
        memoryUsage: 65,
        diskUsage: 70
      },
      endpoints: [
        { path: '/n8n/webhooks', status: 'healthy', responseTime: 156 },
        { path: '/n8n/api', status: 'healthy', responseTime: 198 },
        { path: '/n8n/editor', status: 'healthy', responseTime: 245 }
      ]
    }
  ]);

  // Mock data untuk job queues
  const [jobQueues, setJobQueues] = useState([
    {
      id: 'email-queue',
      name: 'Email Queue',
      status: 'active',
      pending: 23,
      processing: 5,
      failed: 2,
      completed: 1247,
      workers: 8,
      throughput: '45 jobs/min',
      avgProcessingTime: '2.3s',
      lastProcessed: '2024-01-25T15:30:00Z'
    },
    {
      id: 'report-queue',
      name: 'Report Generation',
      status: 'active',
      pending: 12,
      processing: 2,
      failed: 0,
      completed: 89,
      workers: 3,
      throughput: '8 jobs/min',
      avgProcessingTime: '15.6s',
      lastProcessed: '2024-01-25T15:28:00Z'
    },
    {
      id: 'analytics-queue',
      name: 'Analytics Aggregation',
      status: 'paused',
      pending: 156,
      processing: 0,
      failed: 5,
      completed: 523,
      workers: 0,
      throughput: '0 jobs/min',
      avgProcessingTime: '5.2s',
      lastProcessed: '2024-01-25T14:45:00Z'
    },
    {
      id: 'backup-queue',
      name: 'Database Backup',
      status: 'active',
      pending: 0,
      processing: 1,
      failed: 0,
      completed: 24,
      workers: 1,
      throughput: '1 job/day',
      avgProcessingTime: '45min',
      lastProcessed: '2024-01-25T03:00:00Z'
    }
  ]);

  // Mock data untuk backup management
  const [backups, setBackups] = useState([
    {
      id: 1,
      type: 'Full Database',
      status: 'completed',
      size: '2.3 GB',
      duration: '12 minutes',
      timestamp: '2024-01-25T03:00:00Z',
      retentionDays: 30,
      location: 's3://backups/db-full-20240125.sql.gz'
    },
    {
      id: 2,
      type: 'Incremental',
      status: 'completed',
      size: '156 MB',
      duration: '3 minutes',
      timestamp: '2024-01-24T15:00:00Z',
      retentionDays: 7,
      location: 's3://backups/db-inc-20240124.sql.gz'
    },
    {
      id: 3,
      type: 'Configuration',
      status: 'completed',
      size: '45 MB',
      duration: '1 minute',
      timestamp: '2024-01-24T12:00:00Z',
      retentionDays: 14,
      location: 's3://backups/config-20240124.tar.gz'
    },
    {
      id: 4,
      type: 'Full Database',
      status: 'failed',
      size: '0 MB',
      duration: '0 minutes',
      timestamp: '2024-01-23T03:00:00Z',
      retentionDays: 30,
      location: null,
      error: 'Connection timeout to backup storage'
    }
  ]);

  // Mock N8N workflow data
  const [n8nWorkflows, setN8nWorkflows] = useState([
    {
      id: 1,
      name: 'Customer Onboarding',
      status: 'active',
      executions: 156,
      successRate: 98.7,
      lastExecution: '2024-01-25T15:25:00Z',
      avgDuration: '2.3s',
      description: 'Automated customer onboarding workflow'
    },
    {
      id: 2,
      name: 'Payment Notifications',
      status: 'active',
      executions: 523,
      successRate: 99.2,
      lastExecution: '2024-01-25T15:30:00Z',
      avgDuration: '1.8s',
      description: 'Send payment confirmation emails'
    },
    {
      id: 3,
      name: 'Data Synchronization',
      status: 'error',
      executions: 89,
      successRate: 85.4,
      lastExecution: '2024-01-25T14:45:00Z',
      avgDuration: '5.6s',
      description: 'Sync data between systems',
      error: 'API connection failed'
    }
  ]);

  const getStatusColor = (status) => {
    const colors = {
      healthy: 'text-green-600',
      warning: 'text-yellow-600',
      error: 'text-red-600',
      degraded: 'text-orange-600',
      active: 'text-green-600',
      paused: 'text-gray-600',
      failed: 'text-red-600',
      completed: 'text-green-600'
    };
    return colors[status] || 'text-gray-600';
  };

  const getStatusBadge = (status) => {
    const config = {
      healthy: { color: 'green', label: 'Healthy' },
      warning: { color: 'yellow', label: 'Warning' },
      error: { color: 'red', label: 'Error' },
      degraded: { color: 'orange', label: 'Degraded' },
      active: { color: 'green', label: 'Active' },
      paused: { color: 'gray', label: 'Paused' },
      failed: { color: 'red', label: 'Failed' },
      completed: { color: 'green', label: 'Completed' }
    };
    const statusConfig = config[status] || config.healthy;
    return <Badge variant={statusConfig.color}>{statusConfig.label}</Badge>;
  };

  const getMetricTrend = (value, threshold) => {
    if (value > threshold * 1.2) return { icon: TrendingUp, color: 'text-red-500' };
    if (value > threshold) return { icon: TrendingUp, color: 'text-yellow-500' };
    return { icon: TrendingDown, color: 'text-green-500' };
  };

  const formatUptime = (percentage) => {
    return parseFloat(percentage.replace('%', '')).toFixed(2) + '%';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Service & Infrastructure Health</h1>
          <p className="text-gray-600">Monitor microservices, job queues, and infrastructure components</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Label>Auto-refresh</Label>
            <input 
              type="checkbox" 
              checked={isAutoRefresh} 
              onChange={(e) => setIsAutoRefresh(e.target.checked)}
              className="rounded border-gray-300"
            />
            <Select value={refreshInterval.toString()} onValueChange={(value) => setRefreshInterval(parseInt(value))}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10s</SelectItem>
                <SelectItem value="30">30s</SelectItem>
                <SelectItem value="60">1m</SelectItem>
                <SelectItem value="300">5m</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Service Health Overview */}
      <div className="grid grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Healthy Services</p>
                <p className="text-2xl font-bold text-gray-900">
                  {microservices.filter(s => s.status === 'healthy').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Warning Services</p>
                <p className="text-2xl font-bold text-gray-900">
                  {microservices.filter(s => s.status === 'warning').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Jobs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {jobQueues.reduce((sum, q) => sum + q.processing, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Server className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Instances</p>
                <p className="text-2xl font-bold text-gray-900">
                  {microservices.reduce((sum, s) => sum + s.instances, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="microservices" className="flex items-center space-x-2">
            <Server className="w-4 h-4" />
            <span>Microservices</span>
          </TabsTrigger>
          <TabsTrigger value="queues" className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>Job Queues</span>
          </TabsTrigger>
          <TabsTrigger value="workflows" className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>N8N Workflows</span>
          </TabsTrigger>
          <TabsTrigger value="backups" className="flex items-center space-x-2">
            <Archive className="w-4 h-4" />
            <span>Backups</span>
          </TabsTrigger>
        </TabsList>

        {/* Microservices Health */}
        <TabsContent value="microservices" className="space-y-6">
          <div className="grid gap-6">
            {microservices.map((service) => (
              <Card key={service.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        service.status === 'healthy' ? 'bg-green-500' :
                        service.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      <div>
                        <CardTitle className="text-lg">{service.name}</CardTitle>
                        <CardDescription>
                          {service.version} • {service.instances} instances • {service.uptime} uptime
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(service.status)}
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Service Metrics */}
                  <div className="grid grid-cols-6 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Requests/min</div>
                      <div className="text-lg font-bold mt-1">{service.metrics.requestsPerMinute}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500 uppercase tracking-wide">P99 Latency</div>
                      <div className="text-lg font-bold mt-1">{service.metrics.p99Latency}ms</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Error Rate</div>
                      <div className="text-lg font-bold mt-1">{service.metrics.errorRate}%</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500 uppercase tracking-wide">CPU</div>
                      <div className="text-lg font-bold mt-1">{service.metrics.cpuUsage}%</div>
                      <Progress value={service.metrics.cpuUsage} className="mt-1 h-2" />
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Memory</div>
                      <div className="text-lg font-bold mt-1">{service.metrics.memoryUsage}%</div>
                      <Progress value={service.metrics.memoryUsage} className="mt-1 h-2" />
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Disk</div>
                      <div className="text-lg font-bold mt-1">{service.metrics.diskUsage}%</div>
                      <Progress value={service.metrics.diskUsage} className="mt-1 h-2" />
                    </div>
                  </div>

                  {/* Endpoints Health */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Endpoint Health</h4>
                    <div className="space-y-2">
                      {service.endpoints.map((endpoint, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={`w-2 h-2 rounded-full ${
                              endpoint.status === 'healthy' ? 'bg-green-500' :
                              endpoint.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
                            }`}></div>
                            <span className="font-mono text-sm">{endpoint.path}</span>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600">
                              {endpoint.responseTime ? `${endpoint.responseTime}ms` : 'N/A'}
                            </span>
                            <Badge 
                              variant={endpoint.status === 'healthy' ? 'green' : 
                                     endpoint.status === 'degraded' ? 'yellow' : 'red'}
                              className="text-xs"
                            >
                              {endpoint.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Job Queues Management */}
        <TabsContent value="queues" className="space-y-6">
          <div className="grid gap-6">
            {jobQueues.map((queue) => (
              <Card key={queue.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-3">
                        <span>{queue.name}</span>
                        {getStatusBadge(queue.status)}
                      </CardTitle>
                      <CardDescription>
                        {queue.workers} workers • {queue.throughput} • avg {queue.avgProcessingTime}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      {queue.status === 'paused' ? (
                        <Button variant="outline" size="sm">
                          <PlayCircle className="w-4 h-4 mr-2" />
                          Resume
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm">
                          <Pause className="w-4 h-4 mr-2" />
                          Pause
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-4">
                    <div className="text-center">
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Pending</div>
                      <div className="text-2xl font-bold mt-1 text-blue-600">{queue.pending}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Processing</div>
                      <div className="text-2xl font-bold mt-1 text-yellow-600">{queue.processing}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Failed</div>
                      <div className="text-2xl font-bold mt-1 text-red-600">{queue.failed}</div>
                      {queue.failed > 0 && (
                        <Button variant="outline" size="sm" className="mt-1">
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Retry
                        </Button>
                      )}
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Completed</div>
                      <div className="text-2xl font-bold mt-1 text-green-600">{queue.completed}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Workers</div>
                      <div className="text-2xl font-bold mt-1">{queue.workers}</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 text-xs text-gray-500">
                    Last processed: {new Date(queue.lastProcessed).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* N8N Workflows */}
        <TabsContent value="workflows" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">N8N Workflow Management</h3>
              <p className="text-sm text-gray-600">Monitor and manage automated workflows</p>
            </div>
            <Button variant="outline">
              <ExternalLink className="w-4 h-4 mr-2" />
              Open N8N Editor
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Workflow</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Executions</TableHead>
                    <TableHead>Success Rate</TableHead>
                    <TableHead>Avg Duration</TableHead>
                    <TableHead>Last Execution</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {n8nWorkflows.map((workflow) => (
                    <TableRow key={workflow.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">{workflow.name}</div>
                          <div className="text-sm text-gray-600">{workflow.description}</div>
                          {workflow.error && (
                            <div className="text-xs text-red-600 mt-1">⚠️ {workflow.error}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(workflow.status)}</TableCell>
                      <TableCell>{workflow.executions}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span>{workflow.successRate}%</span>
                          <Progress value={workflow.successRate} className="w-16 h-2" />
                        </div>
                      </TableCell>
                      <TableCell>{workflow.avgDuration}</TableCell>
                      <TableCell>
                        <div className="text-sm">{new Date(workflow.lastExecution).toLocaleString()}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {workflow.status === 'active' ? (
                            <Button variant="ghost" size="sm">
                              <StopCircle className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button variant="ghost" size="sm">
                              <PlayCircle className="w-4 h-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="sm">
                            <FileText className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backup & Disaster Recovery */}
        <TabsContent value="backups" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Backup & Disaster Recovery</h3>
              <p className="text-sm text-gray-600">Monitor backup status and manage recovery processes</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download Backup
              </Button>
              <Button>
                <RotateCcw className="w-4 h-4 mr-2" />
                Create Backup
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Backup Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Retention</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {backups.map((backup) => (
                    <TableRow key={backup.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Archive className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">{backup.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          {getStatusBadge(backup.status)}
                          {backup.error && (
                            <div className="text-xs text-red-600 mt-1">{backup.error}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{backup.size}</TableCell>
                      <TableCell>{backup.duration}</TableCell>
                      <TableCell>
                        <div className="text-sm">{new Date(backup.timestamp).toLocaleString()}</div>
                      </TableCell>
                      <TableCell>{backup.retentionDays} days</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {backup.status === 'completed' && (
                            <>
                              <Button variant="ghost" size="sm">
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <RotateCcw className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          {backup.status === 'failed' && (
                            <Button variant="ghost" size="sm">
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" className="text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Backup Schedule & Policies */}
          <Card>
            <CardHeader>
              <CardTitle>Backup Policies</CardTitle>
              <CardDescription>Configure automated backup schedules and retention policies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Full Backup Schedule</Label>
                    <Input defaultValue="Daily at 03:00 UTC" />
                  </div>
                  <div>
                    <Label>Incremental Schedule</Label>
                    <Input defaultValue="Every 6 hours" />
                  </div>
                  <div>
                    <Label>Configuration Backup</Label>
                    <Input defaultValue="Daily at 12:00 UTC" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Full Backup Retention</Label>
                    <Input defaultValue="30" type="number" />
                  </div>
                  <div>
                    <Label>Incremental Retention</Label>
                    <Input defaultValue="7" type="number" />
                  </div>
                  <div>
                    <Label>Config Retention</Label>
                    <Input defaultValue="14" type="number" />
                  </div>
                </div>
                <Button className="w-full">Update Backup Policies</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ServiceInfrastructureHealth;
