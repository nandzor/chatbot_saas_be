import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Calendar,
  Download,
  TrendingUp,
  Star,
  AlertCircle,
  UserCheck,
  Headphones,
  MessageSquare,
  Smile,
  Users
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  ChartContainer,
  ChartTooltipContent
} from '@/components/ui';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Tooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

const Dashboard = () => {
  const { user, logout } = useAuth();

  console.log('📊 Dashboard component rendering...');

  const handleLogout = () => {
    logout();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600">
            Please log in to access the dashboard.
          </p>
        </div>
      </div>
    );
  }

  // Sample data - seharusnya dipindah ke file data terpisah
  const pieData = [
    { name: 'Bot Handled', value: 68, fill: 'hsl(var(--chart-1))' },
    { name: 'Agent Handled', value: 32, fill: 'hsl(var(--chart-4))' }
  ];

  const sessionsData = [
    { hour: '00:00', bot: 45, agent: 12 },
    { hour: '04:00', bot: 32, agent: 8 },
    { hour: '08:00', bot: 89, agent: 34 },
    { hour: '12:00', bot: 120, agent: 56 },
    { hour: '16:00', bot: 98, agent: 45 },
    { hour: '20:00', bot: 67, agent: 23 }
  ];

  const intentsData = [
    { name: "Customer Support", count: 289, percentage: 24, trending: "stable" },
    { name: "Technical Support", count: 198, percentage: 16, trending: "down" },
    { name: "Product Inquiry", count: 156, percentage: 13, trending: "up" },
    { name: "Billing Question", count: 134, percentage: 11, trending: "stable" },
    { name: "Account Access", count: 98, percentage: 8, trending: "down" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
            <p className="text-gray-600">Welcome back, {user?.full_name || user?.username || 'User'}!</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {user?.full_name || user?.username || 'User'}
              </p>
              <p className="text-xs text-gray-500">
                {user?.email || 'No email'}
              </p>
            </div>
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              Today
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Sessions Today</p>
                  <p className="text-3xl font-bold text-gray-900">1,247</p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-green-500">+15% from yesterday</span>
                  </div>
                </div>
                <MessageSquare className="w-10 h-10 text-blue-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Avg Satisfaction</p>
                  <p className="text-3xl font-bold text-gray-900">4.7</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <Star className="w-3 h-3 text-yellow-500" />
                  </div>
                </div>
                <Smile className="w-10 h-10 text-green-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Handover Count</p>
                  <p className="text-3xl font-bold text-gray-900">89</p>
                  <div className="flex items-center gap-1 mt-2">
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                    <span className="text-xs text-yellow-500">32% of sessions</span>
                  </div>
                </div>
                <Users className="w-10 h-10 text-purple-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Active Agents</p>
                  <p className="text-3xl font-bold text-gray-900">12/15</p>
                  <div className="flex items-center gap-1 mt-2">
                    <UserCheck className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-green-500">80% online</span>
                  </div>
                </div>
                <Headphones className="w-10 h-10 text-indigo-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Bot vs Agent Sessions</CardTitle>
              <CardDescription>Session distribution over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer className="h-[300px]" config={{}}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sessionsData}>
                    <defs>
                      <linearGradient id="colorBot" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorAgent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-4))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--chart-4))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="hour" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Area type="monotone" dataKey="bot" stackId="1" stroke="hsl(var(--chart-1))" fill="url(#colorBot)" />
                    <Area type="monotone" dataKey="agent" stackId="1" stroke="hsl(var(--chart-4))" fill="url(#colorAgent)" />
                    <Legend />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Session Distribution</CardTitle>
              <CardDescription>Bot vs Agent handling</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer className="h-[250px]" config={{}}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top Intents Table */}
        <Card>
          <CardHeader>
            <CardTitle>Top Intents</CardTitle>
            <CardDescription>Most frequently asked questions</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Intent</TableHead>
                  <TableHead>Count</TableHead>
                  <TableHead>Percentage</TableHead>
                  <TableHead>Trend</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {intentsData.map(intent => (
                  <TableRow key={intent.name}>
                    <TableCell className="font-medium">{intent.name}</TableCell>
                    <TableCell>{intent.count}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                            style={{ width: `${intent.percentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{intent.percentage}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {intent.trending === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
                      {intent.trending === 'down' && <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />}
                      {intent.trending === 'stable' && <div className="w-4 h-4 text-gray-500">—</div>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
                <MessageSquare className="w-6 h-6 text-blue-500" />
                <div className="text-left">
                  <div className="font-medium">Handle Chats</div>
                  <div className="text-sm text-gray-500">Respond to customer inquiries</div>
                </div>
              </Button>

              <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
                <TrendingUp className="w-6 h-6 text-green-500" />
                <div className="text-left">
                  <div className="font-medium">View Analytics</div>
                  <div className="text-sm text-gray-500">Check performance metrics</div>
                </div>
              </Button>

              <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
                <Users className="w-6 h-6 text-purple-500" />
                <div className="text-left">
                  <div className="font-medium">Manage Users</div>
                  <div className="text-sm text-gray-500">Add, edit, or remove users</div>
                </div>
              </Button>

              <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
                <Star className="w-6 h-6 text-yellow-500" />
                <div className="text-left">
                  <div className="font-medium">Knowledge Base</div>
                  <div className="text-sm text-gray-500">Manage articles and documentation</div>
                </div>
              </Button>

              <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
                <UserCheck className="w-6 h-6 text-indigo-500" />
                <div className="text-left">
                  <div className="font-medium">Role Management</div>
                  <div className="text-sm text-gray-500">Manage roles and permissions</div>
                </div>
              </Button>

              <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
                <AlertCircle className="w-6 h-6 text-gray-500" />
                <div className="text-left">
                  <div className="font-medium">Settings</div>
                  <div className="text-sm text-gray-500">Configure system settings</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
