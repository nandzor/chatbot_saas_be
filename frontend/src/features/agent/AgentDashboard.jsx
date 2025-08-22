import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Badge,
  Button,
  Progress,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui';
import { 
  MessageSquare,
  Clock,
  TrendingUp,
  TrendingDown,
  Target,
  Star,
  Users,
  BarChart3,
  Calendar,
  CheckCircle,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Minus,
  Activity,
  Bell,
  Award,
  Zap,
  Timer,
  MessageCircle,
  ThumbsUp,
  Coffee
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const AgentDashboard = () => {
  const [timeFrame, setTimeFrame] = useState('7d');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Mock data untuk agent performance
  const [agentMetrics, setAgentMetrics] = useState({
    realtime: {
      activeChats: 5,
      pendingChats: 2,
      avgResponseTime: '2.3 menit',
      currentCSAT: 4.7,
      todayResolved: 12,
      onlineTime: '6h 45m'
    },
    goals: {
      monthly: {
        targetCSAT: 4.5,
        currentCSAT: 4.7,
        targetResolutions: 100,
        currentResolutions: 78,
        targetAHT: '5 menit',
        currentAHT: '4.2 menit'
      }
    },
    followUps: [
      {
        id: 1,
        customer: 'PT Maju Jaya',
        issue: 'Masalah integrasi API',
        priority: 'high',
        dueDate: '2024-01-26T14:00:00Z',
        tags: ['technical', 'api']
      },
      {
        id: 2,
        customer: 'CV Digital Solution',
        issue: 'Follow-up training user',
        priority: 'medium',
        dueDate: '2024-01-27T10:00:00Z',
        tags: ['training', 'onboarding']
      },
      {
        id: 3,
        customer: 'StartupXYZ',
        issue: 'Konfirmasi upgrade plan',
        priority: 'low',
        dueDate: '2024-01-28T16:00:00Z',
        tags: ['sales', 'upgrade']
      }
    ]
  });

  // Mock data untuk trend performance
  const [performanceTrend, setPerformanceTrend] = useState([
    { date: '19 Jan', csat: 4.2, aht: 5.1, resolved: 8 },
    { date: '20 Jan', csat: 4.4, aht: 4.8, resolved: 12 },
    { date: '21 Jan', csat: 4.3, aht: 5.2, resolved: 9 },
    { date: '22 Jan', csat: 4.6, aht: 4.5, resolved: 15 },
    { date: '23 Jan', csat: 4.5, aht: 4.7, resolved: 11 },
    { date: '24 Jan', csat: 4.8, aht: 4.2, resolved: 14 },
    { date: '25 Jan', csat: 4.7, aht: 4.3, resolved: 12 }
  ]);

  // Mock data untuk achievements
  const [achievements, setAchievements] = useState([
    {
      id: 1,
      title: 'Customer Hero',
      description: 'Mencapai CSAT 4.5+ selama 7 hari berturut-turut',
      icon: Award,
      unlocked: true,
      unlockedDate: '2024-01-20'
    },
    {
      id: 2,
      title: 'Speed Master',
      description: 'Average Handle Time di bawah 5 menit',
      icon: Zap,
      unlocked: true,
      unlockedDate: '2024-01-22'
    },
    {
      id: 3,
      title: 'Resolution Expert',
      description: 'Menyelesaikan 50+ chat dalam sebulan',
      icon: Target,
      unlocked: false,
      progress: 78
    }
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getMetricTrend = (current, previous) => {
    if (current > previous) return { icon: TrendingUp, color: 'text-green-500', direction: 'up' };
    if (current < previous) return { icon: TrendingDown, color: 'text-red-500', direction: 'down' };
    return { icon: Minus, color: 'text-gray-500', direction: 'stable' };
  };

  const getPriorityBadge = (priority) => {
    const config = {
      high: { color: 'red', label: 'High' },
      medium: { color: 'yellow', label: 'Medium' },
      low: { color: 'green', label: 'Low' }
    };
    const priorityConfig = config[priority] || config.medium;
    return <Badge variant={priorityConfig.color}>{priorityConfig.label}</Badge>;
  };

  const formatTimeRemaining = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diff = due - now;
    
    if (diff < 0) return 'Overdue';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header dengan Real-time Status */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">My Dashboard</h1>
          <div className="flex items-center space-x-4 mt-2">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Online sejam {agentMetrics.realtime.onlineTime}</span>
            </div>
            <div className="text-sm text-gray-500">
              {currentTime.toLocaleTimeString('id-ID')} WIB
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            {timeFrame === '7d' ? '7 Hari' : '30 Hari'}
          </Button>
          <Button variant="outline" size="sm">
            <Coffee className="w-4 h-4 mr-2" />
            Break
          </Button>
        </div>
      </div>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-6 gap-4">
        {/* Active Chats Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Obrolan Aktif
                </p>
                <p className="text-2xl font-bold text-blue-600 mb-1">
                  {agentMetrics.realtime.activeChats}
                </p>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <p className="text-xs text-gray-500">
                    +{agentMetrics.realtime.pendingChats} pending
                  </p>
                </div>
              </div>
              <div className="p-2.5 bg-blue-50 rounded-lg flex-shrink-0">
                <MessageSquare className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CSAT Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  CSAT Saya
                </p>
                <div className="flex items-center space-x-2 mb-1">
                  <p className="text-2xl font-bold text-yellow-600">
                    {agentMetrics.realtime.currentCSAT}
                  </p>
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                </div>
                <div className="flex items-center space-x-1">
                  <ArrowUp className="w-3 h-3 text-green-500" />
                  <p className="text-xs text-green-600 font-medium">
                    +0.2 dari kemarin
                  </p>
                </div>
              </div>
              <div className="p-2.5 bg-yellow-50 rounded-lg flex-shrink-0">
                <ThumbsUp className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Handle Time Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Avg Handle Time
                </p>
                <p className="text-2xl font-bold text-green-600 mb-1">
                  {agentMetrics.goals.monthly.currentAHT}
                </p>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <p className="text-xs text-green-600 font-medium">
                    Target: {agentMetrics.goals.monthly.targetAHT}
                  </p>
                </div>
              </div>
              <div className="p-2.5 bg-green-50 rounded-lg flex-shrink-0">
                <Timer className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resolved Today Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Resolved Hari Ini
                </p>
                <p className="text-2xl font-bold text-purple-600 mb-1">
                  {agentMetrics.realtime.todayResolved}
                </p>
                <div className="flex items-center space-x-1">
                  <Target className="w-3 h-3 text-purple-500" />
                  <p className="text-xs text-purple-600 font-medium">
                    Target: 15/hari
                  </p>
                </div>
              </div>
              <div className="p-2.5 bg-purple-50 rounded-lg flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Response Time Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Response Time
                </p>
                <p className="text-2xl font-bold text-indigo-600 mb-1">
                  {agentMetrics.realtime.avgResponseTime}
                </p>
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-indigo-500" />
                  <p className="text-xs text-indigo-600 font-medium">
                    Avg minggu ini
                  </p>
                </div>
              </div>
              <div className="p-2.5 bg-indigo-50 rounded-lg flex-shrink-0">
                <Clock className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Follow-ups Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Follow-ups
                </p>
                <p className="text-2xl font-bold text-orange-600 mb-1">
                  {agentMetrics.followUps.length}
                </p>
                <div className="flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3 text-orange-500" />
                  <p className="text-xs text-orange-600 font-medium">
                    Perlu ditindaklanjuti
                  </p>
                </div>
              </div>
              <div className="p-2.5 bg-orange-50 rounded-lg flex-shrink-0">
                <Bell className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Trends & Goals */}
      <div className="grid grid-cols-2 gap-6">
        {/* Performance Trend Chart */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  <span>Trend Performa</span>
                </CardTitle>
                <CardDescription className="mt-1">
                  CSAT dan AHT 7 hari terakhir
                </CardDescription>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">CSAT</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">AHT</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    yAxisId="left" 
                    domain={[4, 5]} 
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => value.toFixed(1)}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    domain={[0, 8]} 
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="csat" 
                    stroke="#fbbf24" 
                    strokeWidth={3}
                    name="CSAT"
                    dot={{ fill: '#fbbf24', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#fbbf24', strokeWidth: 2 }}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="aht" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    name="AHT (min)"
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Goals */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Target className="w-5 h-5 text-green-600" />
              <span>Target Bulanan</span>
            </CardTitle>
            <CardDescription className="mt-1">
              Progress pencapaian target Januari 2024
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 space-y-6">
            {/* CSAT Goal */}
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-semibold text-yellow-800">CSAT Target</span>
                </div>
                <span className="text-sm font-bold text-yellow-700">
                  {agentMetrics.goals.monthly.currentCSAT}/{agentMetrics.goals.monthly.targetCSAT}
                </span>
              </div>
              <Progress 
                value={(agentMetrics.goals.monthly.currentCSAT / agentMetrics.goals.monthly.targetCSAT) * 100} 
                className="h-2.5 mb-2"
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-yellow-700">
                  +{((agentMetrics.goals.monthly.currentCSAT / agentMetrics.goals.monthly.targetCSAT) * 100 - 100).toFixed(1)}% dari target
                </p>
                <div className="flex items-center space-x-1">
                  <ArrowUp className="w-3 h-3 text-green-500" />
                  <span className="text-xs text-green-600 font-medium">On Track</span>
                </div>
              </div>
            </div>

            {/* Resolution Goal */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-800">Resolusi</span>
                </div>
                <span className="text-sm font-bold text-blue-700">
                  {agentMetrics.goals.monthly.currentResolutions}/{agentMetrics.goals.monthly.targetResolutions}
                </span>
              </div>
              <Progress 
                value={(agentMetrics.goals.monthly.currentResolutions / agentMetrics.goals.monthly.targetResolutions) * 100} 
                className="h-2.5 mb-2"
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-blue-700">
                  {((agentMetrics.goals.monthly.currentResolutions / agentMetrics.goals.monthly.targetResolutions) * 100).toFixed(0)}% tercapai
                </p>
                <div className="flex items-center space-x-1">
                  <Target className="w-3 h-3 text-blue-500" />
                  <span className="text-xs text-blue-600 font-medium">
                    {agentMetrics.goals.monthly.targetResolutions - agentMetrics.goals.monthly.currentResolutions} lagi
                  </span>
                </div>
              </div>
            </div>

            {/* Handle Time Goal */}
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Timer className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-semibold text-green-800">Average Handle Time</span>
                </div>
                <span className="text-sm font-bold text-green-700">
                  {agentMetrics.goals.monthly.currentAHT}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-green-700">
                  Target: {agentMetrics.goals.monthly.targetAHT}
                </p>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600 font-medium">Target Tercapai!</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Follow-ups & Achievements */}
      <div className="grid grid-cols-3 gap-6">
        {/* Follow-up Tasks */}
        <Card className="col-span-2 hover:shadow-md transition-shadow">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  <span>Daftar Follow-up</span>
                </CardTitle>
                <CardDescription className="mt-1">
                  Pelanggan yang perlu ditindaklanjuti
                </CardDescription>
              </div>
              <Badge variant="blue" className="px-3 py-1">
                {agentMetrics.followUps.length} aktif
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              {agentMetrics.followUps.map((followUp) => (
                <div key={followUp.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200">
                  {/* Header dengan Customer dan Priority */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <h4 className="font-semibold text-gray-900">{followUp.customer}</h4>
                      {getPriorityBadge(followUp.priority)}
                    </div>
                    <div className={`text-sm font-medium px-2 py-1 rounded-full ${
                      formatTimeRemaining(followUp.dueDate) === 'Overdue' 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {formatTimeRemaining(followUp.dueDate)}
                    </div>
                  </div>
                  
                  {/* Issue Description */}
                  <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                    {followUp.issue}
                  </p>
                  
                  {/* Footer dengan Tags dan Action */}
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                      {followUp.tags.map((tag) => (
                        <Badge key={tag} variant="gray" className="text-xs px-2 py-1 bg-gray-100 text-gray-700 border-gray-200">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Button size="sm" variant="outline" className="hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700">
                      Tindak Lanjut
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Award className="w-5 h-5 text-yellow-600" />
              <span>Pencapaian</span>
            </CardTitle>
            <CardDescription className="mt-1">
              Badge dan milestone Anda
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            {achievements.map((achievement) => (
              <div key={achievement.id} className={`p-4 rounded-lg border transition-all duration-200 ${
                achievement.unlocked 
                  ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200 hover:shadow-sm' 
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}>
                {/* Achievement Header */}
                <div className="flex items-start space-x-3 mb-3">
                  <div className={`p-2.5 rounded-lg flex-shrink-0 ${
                    achievement.unlocked ? 'bg-yellow-100' : 'bg-gray-200'
                  }`}>
                    <achievement.icon className={`w-4 h-4 ${
                      achievement.unlocked ? 'text-yellow-600' : 'text-gray-500'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-semibold text-sm mb-1 ${
                      achievement.unlocked ? 'text-yellow-800' : 'text-gray-700'
                    }`}>
                      {achievement.title}
                    </h4>
                    <p className={`text-xs leading-relaxed ${
                      achievement.unlocked ? 'text-yellow-700' : 'text-gray-600'
                    }`}>
                      {achievement.description}
                    </p>
                  </div>
                </div>
                
                {/* Achievement Status */}
                {achievement.unlocked ? (
                  <div className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg border border-green-200">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <div className="flex-1">
                      <span className="text-xs font-medium text-green-700">
                        Unlocked {new Date(achievement.unlockedDate).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium text-gray-700">{achievement.progress}%</span>
                    </div>
                    <Progress value={achievement.progress} className="h-2" />
                    <p className="text-xs text-gray-500 text-center">
                      {100 - achievement.progress}% lagi untuk unlock
                    </p>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Quick Actions</CardTitle>
          <CardDescription className="mt-1">
            Aksi cepat untuk meningkatkan produktivitas
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-5 gap-4">
            <Button 
              variant="outline" 
              className="h-24 flex-col hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200 group"
            >
              <div className="p-2 bg-blue-100 rounded-lg mb-2 group-hover:bg-blue-200 transition-colors">
                <MessageCircle className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm font-medium">Buka Inbox</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-24 flex-col hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-all duration-200 group"
            >
              <div className="p-2 bg-green-100 rounded-lg mb-2 group-hover:bg-green-200 transition-colors">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-sm font-medium">Cari Customer</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-24 flex-col hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 transition-all duration-200 group"
            >
              <div className="p-2 bg-purple-100 rounded-lg mb-2 group-hover:bg-purple-200 transition-colors">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-sm font-medium">Knowledge Base</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-24 flex-col hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700 transition-all duration-200 group"
            >
              <div className="p-2 bg-orange-100 rounded-lg mb-2 group-hover:bg-orange-200 transition-colors">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-sm font-medium">Jadwal Follow-up</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-24 flex-col hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 transition-all duration-200 group"
            >
              <div className="p-2 bg-indigo-100 rounded-lg mb-2 group-hover:bg-indigo-200 transition-colors">
                <BarChart3 className="w-6 h-6 text-indigo-600" />
              </div>
              <span className="text-sm font-medium">Lihat Laporan</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentDashboard;