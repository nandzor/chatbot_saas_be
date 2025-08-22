import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge
} from '@/components/ui';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar,
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
import { ChartContainer, ChartTooltipContent } from '@/components/ui';
import { 
  channelPerformanceData, 
  sessionsData, 
  intentsData,
  agentsData 
} from '@/data/sampleData';

const Analytics = () => {
  const pieData = [
    { name: 'Bot Handled', value: 68, fill: 'hsl(var(--chart-1))' },
    { name: 'Agent Handled', value: 32, fill: 'hsl(var(--chart-4))' }
  ];

  const agentPerformanceData = [
    { name: 'Sarah Wilson', satisfaction: 4.8, handlingTime: 4.5, chats: 152 },
    { name: 'John Davis', satisfaction: 4.6, handlingTime: 5.2, chats: 98 },
    { name: 'Mike Chen', satisfaction: 4.9, handlingTime: 3.8, chats: 203 },
    { name: 'Emily Rodriguez', satisfaction: 4.7, handlingTime: 4.2, chats: 176 }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Analytics Dashboard</h2>
        <p className="text-muted-foreground">Deep insights into your chatbot performance</p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="intents">Intents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Session Trends</CardTitle>
                <CardDescription>Bot vs Agent sessions over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer className="h-[300px]" config={{}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sessionsData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="hour" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="bot" stroke="hsl(var(--chart-1))" strokeWidth={2} />
                      <Line type="monotone" dataKey="agent" stroke="hsl(var(--chart-4))" strokeWidth={2} />
                      <Legend />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Session Distribution</CardTitle>
                <CardDescription>Bot vs Agent handling ratio</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer className="h-[300px]" config={{}}>
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

          <Card>
            <CardHeader>
              <CardTitle>Top Intents Analysis</CardTitle>
              <CardDescription>Most frequently asked questions and their trends</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Intent</TableHead>
                    <TableHead>Count</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead>Trend</TableHead>
                    <TableHead>Success Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {intentsData.map(intent => (
                    <TableRow key={intent.name}>
                      <TableCell className="font-medium">{intent.name}</TableCell>
                      <TableCell>{intent.count}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-muted rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                              style={{ width: `${intent.percentage}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">{intent.percentage}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={intent.trending === 'up' ? 'default' : intent.trending === 'down' ? 'destructive' : 'secondary'}>
                          {intent.trending === 'up' ? '↗️ Up' : intent.trending === 'down' ? '↘️ Down' : '→ Stable'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium">
                          {Math.floor(Math.random() * 20 + 80)}%
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="channels" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Channel Performance</CardTitle>
              <CardDescription>Performance metrics across different channels</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer className="h-[400px]" config={{}}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={channelPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="channel" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="sessions" fill="hsl(var(--chart-1))" />
                    <Bar dataKey="satisfaction" fill="hsl(var(--chart-2))" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {channelPerformanceData.map(channel => (
              <Card key={channel.channel}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{channel.channel}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Sessions</span>
                      <span className="font-medium">{channel.sessions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Satisfaction</span>
                      <span className="font-medium">{channel.satisfaction}/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Avg Duration</span>
                      <span className="font-medium">{channel.avgDuration}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="agents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Agent Performance</CardTitle>
              <CardDescription>Individual agent performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Active Chats</TableHead>
                    <TableHead>Satisfaction</TableHead>
                    <TableHead>Avg Handling Time</TableHead>
                    <TableHead>Total Handled</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agentsData.map(agent => (
                    <TableRow key={agent.id}>
                      <TableCell className="font-medium">{agent.name}</TableCell>
                      <TableCell>
                        <Badge variant={agent.status === 'online' ? 'default' : agent.status === 'busy' ? 'secondary' : 'outline'}>
                          {agent.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{agent.activeChats}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{agent.satisfaction}</span>
                          <span className="text-sm text-muted-foreground">/5</span>
                        </div>
                      </TableCell>
                      <TableCell>{agent.avgHandlingTime}</TableCell>
                      <TableCell>{agent.totalHandled}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Agent Satisfaction</CardTitle>
                <CardDescription>Satisfaction scores by agent</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer className="h-[300px]" config={{}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={agentPerformanceData} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" domain={[0, 5]} className="text-xs" />
                      <YAxis dataKey="name" type="category" className="text-xs" />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="satisfaction" fill="hsl(var(--chart-3))" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Handling Time vs Satisfaction</CardTitle>
                <CardDescription>Correlation between handling time and satisfaction</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer className="h-[300px]" config={{}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={agentPerformanceData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="name" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="handlingTime" fill="hsl(var(--chart-4))" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="intents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Intent Analysis</CardTitle>
              <CardDescription>Detailed analysis of user intents and patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {intentsData.map(intent => (
                  <Card key={intent.name} className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium">{intent.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {intent.count} requests ({intent.percentage}%)
                        </p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Success Rate</span>
                          <span className="font-medium">{Math.floor(Math.random() * 20 + 80)}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Avg Response Time</span>
                          <span className="font-medium">{Math.floor(Math.random() * 5 + 1)}s</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Escalation Rate</span>
                          <span className="font-medium">{Math.floor(Math.random() * 30 + 10)}%</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
