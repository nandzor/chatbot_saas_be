import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Progress,
  Skeleton,
  Alert,
  AlertDescription
} from '@/components/ui';
import {
  MessageSquare,
  Clock,
  TrendingUp,
  Target,
  Star,
  Users,
  BarChart3,
  Calendar,
  CheckCircle,
  AlertCircle,
  ArrowUp,
  Activity,
  Bell,
  Timer,
  MessageCircle,
  ThumbsUp,
  Coffee,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAgentDashboard } from '@/hooks/useAgentDashboard';

const AgentDashboard = () => {
  const [timeFrame, setTimeFrame] = useState('7d');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Memoize dateRange to prevent unnecessary re-renders
  const dateRange = useMemo(() => ({
    days: timeFrame === '7d' ? 7 : 30
  }), [timeFrame]);

  // Use agent dashboard hook
  const {
    stats,
    recentSessions,
    performanceMetrics,
    realtimeActivity,
    loading,
    isLoading,
    hasErrors,
    refresh,
    lastUpdated
  } = useAgentDashboard({
    autoRefresh: true,
    refreshInterval: 30000, // 30 seconds
    dateRange,
    onError: (type, error) => {
      console.error(`Error in ${type}:`, error);
    },
    onSuccess: (type, data) => {
      console.log(`Successfully loaded ${type}:`, data);
    }
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Helper functions

  const formatTime = (seconds) => {
    if (!seconds) return '0m';
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  const formatNumber = (num) => {
    if (num === null || num === undefined) return '0';
    return num.toLocaleString('id-ID');
  };

  const formatRating = (rating) => {
    if (!rating) return '0.0';
    return parseFloat(rating).toFixed(1);
  };

  const handleRefresh = () => {
    refresh('all');
  };

  const handleTimeFrameChange = (newTimeFrame) => {
    setTimeFrame(newTimeFrame);
    // Refresh data with new timeframe
    refresh('all', { days: newTimeFrame === '7d' ? 7 : 30 });
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
              <span className="text-sm text-gray-600">
                {loading.realtimeActivity ? (
                  <Skeleton className="h-4 w-24" />
                ) : (
                  `Online - ${realtimeActivity?.active_sessions_count || 0} aktif`
                )}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              {currentTime.toLocaleTimeString('id-ID')} WIB
            </div>
            {lastUpdated && (
              <div className="text-xs text-gray-400">
                Terakhir update: {lastUpdated.toLocaleTimeString('id-ID')}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleTimeFrameChange(timeFrame === '7d' ? '30d' : '7d')}
            disabled={isLoading}
          >
            <Calendar className="w-4 h-4 mr-2" />
            {timeFrame === '7d' ? '7 Hari' : '30 Hari'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Coffee className="w-4 h-4 mr-2" />
            Break
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {hasErrors && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Terjadi kesalahan saat memuat data dashboard. Beberapa data mungkin tidak tersedia.
            <Button variant="link" onClick={handleRefresh} className="ml-2 p-0 h-auto">
              Coba lagi
            </Button>
          </AlertDescription>
        </Alert>
      )}

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
                {loading.stats ? (
                  <Skeleton className="h-8 w-16 mb-2" />
                ) : (
                  <p className="text-2xl font-bold text-blue-600 mb-1">
                    {stats?.active_sessions || 0}
                  </p>
                )}
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <p className="text-xs text-gray-500">
                    +{stats?.pending_sessions || 0} pending
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
                {loading.stats ? (
                  <Skeleton className="h-8 w-16 mb-2" />
                ) : (
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="text-2xl font-bold text-yellow-600">
                      {formatRating(stats?.avg_rating)}
                    </p>
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <ArrowUp className="w-3 h-3 text-green-500" />
                  <p className="text-xs text-green-600 font-medium">
                    {stats?.satisfaction_count || 0} rating
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
                {loading.stats ? (
                  <Skeleton className="h-8 w-16 mb-2" />
                ) : (
                  <p className="text-2xl font-bold text-green-600 mb-1">
                    {formatTime(stats?.avg_resolution_time)}
                  </p>
                )}
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <p className="text-xs text-green-600 font-medium">
                    Target: 5 menit
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
                {loading.stats ? (
                  <Skeleton className="h-8 w-16 mb-2" />
                ) : (
                  <p className="text-2xl font-bold text-purple-600 mb-1">
                    {stats?.today_sessions || 0}
                  </p>
                )}
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
                {loading.stats ? (
                  <Skeleton className="h-8 w-16 mb-2" />
                ) : (
                  <p className="text-2xl font-bold text-indigo-600 mb-1">
                    {formatTime(stats?.avg_response_time)}
                  </p>
                )}
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
                  Total Messages
                </p>
                {loading.stats ? (
                  <Skeleton className="h-8 w-16 mb-2" />
                ) : (
                  <p className="text-2xl font-bold text-orange-600 mb-1">
                    {formatNumber(stats?.total_messages || 0)}
                  </p>
                )}
                <div className="flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3 text-orange-500" />
                  <p className="text-xs text-orange-600 font-medium">
                    {formatNumber(stats?.agent_messages || 0)} dari agent
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
                  CSAT dan AHT {timeFrame === '7d' ? '7' : '30'} hari terakhir
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
              {loading.performanceMetrics ? (
                <div className="flex items-center justify-center h-full">
                  <Skeleton className="h-full w-full" />
                </div>
              ) : performanceMetrics?.trend_data ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceMetrics.trend_data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">Tidak ada data performa tersedia</p>
                  </div>
                </div>
              )}
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
              Progress pencapaian target {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
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
                  {loading.stats ? (
                    <Skeleton className="h-4 w-16" />
                  ) : (
                    `${formatRating(stats?.avg_rating)}/4.5`
                  )}
                </span>
              </div>
              <Progress
                value={loading.stats ? 0 : (stats?.avg_rating / 4.5) * 100}
                className="h-2.5 mb-2"
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-yellow-700">
                  {loading.stats ? (
                    <Skeleton className="h-3 w-24" />
                  ) : (
                    `${stats?.avg_rating > 4.5 ? '+' : ''}${((stats?.avg_rating / 4.5) * 100 - 100).toFixed(1)}% dari target`
                  )}
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
                  {loading.stats ? (
                    <Skeleton className="h-4 w-16" />
                  ) : (
                    `${stats?.resolved_sessions || 0}/100`
                  )}
                </span>
              </div>
              <Progress
                value={loading.stats ? 0 : ((stats?.resolved_sessions || 0) / 100) * 100}
                className="h-2.5 mb-2"
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-blue-700">
                  {loading.stats ? (
                    <Skeleton className="h-3 w-24" />
                  ) : (
                    `${((stats?.resolved_sessions || 0) / 100 * 100).toFixed(0)}% tercapai`
                  )}
                </p>
                <div className="flex items-center space-x-1">
                  <Target className="w-3 h-3 text-blue-500" />
                  <span className="text-xs text-blue-600 font-medium">
                    {loading.stats ? (
                      <Skeleton className="h-3 w-16" />
                    ) : (
                      `${100 - (stats?.resolved_sessions || 0)} lagi`
                    )}
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
                  {loading.stats ? (
                    <Skeleton className="h-4 w-16" />
                  ) : (
                    formatTime(stats?.avg_resolution_time)
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-green-700">
                  Target: 5 menit
                </p>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600 font-medium">
                    {loading.stats ? (
                      <Skeleton className="h-3 w-20" />
                    ) : (
                      stats?.avg_resolution_time < 300 ? 'Target Tercapai!' : 'Perlu Perbaikan'
                    )}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Follow-ups & Achievements */}
      <div className="grid grid-cols-3 gap-6">
        {/* Recent Sessions */}
        <Card className="col-span-2 hover:shadow-md transition-shadow">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  <span>Sesi Terbaru</span>
                </CardTitle>
                <CardDescription className="mt-1">
                  Obrolan yang baru saja ditangani
                </CardDescription>
              </div>
              <Badge variant="blue" className="px-3 py-1">
                {loading.recentSessions ? (
                  <Skeleton className="h-4 w-8" />
                ) : (
                  `${recentSessions?.data?.length || 0} sesi`
                )}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              {loading.recentSessions ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2 mb-3" />
                    <div className="flex justify-between">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-8 w-24" />
                    </div>
                  </div>
                ))
              ) : recentSessions?.data?.length > 0 ? (
                recentSessions.data.map((session) => (
                  <div key={session.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200">
                    {/* Header dengan Customer dan Status */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          session.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                        }`}></div>
                        <h4 className="font-semibold text-gray-900">
                          {session.customer?.name || 'Unknown Customer'}
                        </h4>
                        <Badge variant={session.priority === 'high' ? 'red' : session.priority === 'medium' ? 'yellow' : 'green'}>
                          {session.priority || 'normal'}
                        </Badge>
                      </div>
                      <div className={`text-sm font-medium px-2 py-1 rounded-full ${
                        session.is_resolved
                          ? 'bg-green-100 text-green-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {session.is_resolved ? 'Resolved' : 'Pending'}
                      </div>
                    </div>

                    {/* Session Details */}
                    <div className="text-sm text-gray-600 mb-3">
                      <div className="flex items-center space-x-4">
                        <span>Kategori: {session.category || 'General'}</span>
                        <span>•</span>
                        <span>{session.total_messages || 0} pesan</span>
                        {session.satisfaction_rating && (
                          <>
                            <span>•</span>
                            <span className="flex items-center space-x-1">
                              <Star className="w-3 h-3 text-yellow-500 fill-current" />
                              <span>{session.satisfaction_rating}</span>
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Footer dengan Time dan Action */}
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        {new Date(session.last_activity_at).toLocaleString('id-ID')}
                      </div>
                      <Button size="sm" variant="outline" className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700">
                        Lihat Detail
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Tidak ada sesi terbaru</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Real-time Activity */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Activity className="w-5 h-5 text-green-600" />
              <span>Aktivitas Real-time</span>
            </CardTitle>
            <CardDescription className="mt-1">
              Aktivitas terkini dan pesan terbaru
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            {loading.realtimeActivity ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="p-3 border border-gray-200 rounded-lg">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))
            ) : realtimeActivity?.recent_messages?.length > 0 ? (
              realtimeActivity.recent_messages.slice(0, 5).map((message) => (
                <div key={message.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      message.sender_type === 'agent' ? 'bg-blue-500' : 'bg-gray-400'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {message.sender_name || 'Unknown'}
                        </span>
                        <Badge variant="gray" className="text-xs">
                          {message.sender_type}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {message.content || message.message_content || 'No content'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(message.created_at).toLocaleTimeString('id-ID')}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-500">
                <Activity className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Tidak ada aktivitas terkini</p>
              </div>
            )}
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
              onClick={() => window.location.href = '/agent/inbox'}
            >
              <div className="p-2 bg-blue-100 rounded-lg mb-2 group-hover:bg-blue-200 transition-colors">
                <MessageCircle className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm font-medium">Buka Inbox</span>
            </Button>

            <Button
              variant="outline"
              className="h-24 flex-col hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-all duration-200 group"
              onClick={() => window.location.href = '/agent/customers'}
            >
              <div className="p-2 bg-green-100 rounded-lg mb-2 group-hover:bg-green-200 transition-colors">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-sm font-medium">Cari Customer</span>
            </Button>

            <Button
              variant="outline"
              className="h-24 flex-col hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 transition-all duration-200 group"
              onClick={() => window.location.href = '/agent/knowledge-base'}
            >
              <div className="p-2 bg-purple-100 rounded-lg mb-2 group-hover:bg-purple-200 transition-colors">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-sm font-medium">Knowledge Base</span>
            </Button>

            <Button
              variant="outline"
              className="h-24 flex-col hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700 transition-all duration-200 group"
              onClick={() => window.location.href = '/agent/schedule'}
            >
              <div className="p-2 bg-orange-100 rounded-lg mb-2 group-hover:bg-orange-200 transition-colors">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-sm font-medium">Jadwal Follow-up</span>
            </Button>

            <Button
              variant="outline"
              className="h-24 flex-col hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 transition-all duration-200 group"
              onClick={() => window.location.href = '/agent/reports'}
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
