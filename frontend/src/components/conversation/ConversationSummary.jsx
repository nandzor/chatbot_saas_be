import React from 'react';
import {
  User,
  MessageSquare,
  Clock,
  TrendingUp,
  Bot,
  Phone,
  Calendar,
  BarChart3,
  Activity
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { id } from 'date-fns/locale';

const ConversationSummary = ({ summary, loading = false }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center text-gray-500">
          <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Ringkasan percakapan tidak tersedia</p>
        </div>
      </div>
    );
  }

  const { customer, agent, statistics, classification, ai_analysis, timeline } = summary;

  /**
   * Format duration in human readable format
   */
  const formatDuration = (minutes) => {
    if (minutes < 1) return '< 1 menit';
    if (minutes < 60) return `${Math.round(minutes)} menit`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    return `${hours}j ${remainingMinutes}m`;
  };

  /**
   * Format response time
   */
  const formatResponseTime = (seconds) => {
    if (seconds < 60) return `${Math.round(seconds)} detik`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  /**
   * Get sentiment color
   */
  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-100';
      case 'negative': return 'text-red-600 bg-red-100';
      case 'neutral': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  /**
   * Get priority color
   */
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Ringkasan Percakapan
        </h3>
        <div className="flex items-center text-sm text-gray-500">
          <Calendar className="w-4 h-4 mr-1" />
          Dimulai {formatDistanceToNow(new Date(timeline.started_at), {
            addSuffix: true,
            locale: id
          })}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Customer & Agent Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700 flex items-center">
              <User className="w-4 h-4 mr-2" />
              Customer
            </h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{customer.name}</p>
                  <p className="text-sm text-gray-500">{customer.phone}</p>
                  <p className="text-xs text-gray-400">
                    {customer.total_messages} pesan
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Agent */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700 flex items-center">
              <User className="w-4 h-4 mr-2" />
              Agent
            </h4>
            <div className="bg-gray-50 rounded-lg p-4">
              {agent ? (
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{agent.name}</p>
                    <p className="text-sm text-gray-500">{agent.department}</p>
                    <p className="text-xs text-gray-400">
                      {agent.total_messages} pesan
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Bot Response</p>
                    <p className="text-sm text-gray-500">Otomatis</p>
                    <p className="text-xs text-gray-400">
                      {statistics.bot_messages} pesan
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700 flex items-center">
            <BarChart3 className="w-4 h-4 mr-2" />
            Statistik Percakapan
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <MessageSquare className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-900">
                {statistics.total_messages}
              </p>
              <p className="text-xs text-blue-700">Total Pesan</p>
            </div>

            <div className="bg-green-50 rounded-lg p-4 text-center">
              <User className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-900">
                {statistics.customer_messages}
              </p>
              <p className="text-xs text-green-700">Customer</p>
            </div>

            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <Bot className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-900">
                {statistics.bot_messages}
              </p>
              <p className="text-xs text-purple-700">Bot</p>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4 text-center">
              <Clock className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-yellow-900">
                {statistics.avg_response_time_seconds > 0
                  ? formatResponseTime(statistics.avg_response_time_seconds)
                  : 'N/A'
                }
              </p>
              <p className="text-xs text-yellow-700">Rata-rata Response</p>
            </div>
          </div>
        </div>

        {/* Session Info */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700 flex items-center">
            <Activity className="w-4 h-4 mr-2" />
            Informasi Sesi
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Durasi</span>
                <span className="font-medium text-gray-900">
                  {formatDuration(statistics.session_duration_minutes)}
                </span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Kategori</span>
                <span className="font-medium text-gray-900">
                  {classification.category || 'General'}
                </span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Prioritas</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(classification.priority)}`}>
                  {classification.priority || 'Normal'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Analysis */}
        {ai_analysis && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Analisis AI
            </h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Sentimen</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSentimentColor(ai_analysis.sentiment_analysis?.overall_sentiment)}`}>
                    {ai_analysis.sentiment_analysis?.overall_sentiment || 'Neutral'}
                  </span>
                  {ai_analysis.sentiment_analysis?.confidence && (
                    <p className="text-xs text-gray-500 mt-1">
                      Confidence: {Math.round(ai_analysis.sentiment_analysis.confidence * 100)}%
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Emosi</p>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                    {ai_analysis.sentiment_analysis?.emotion_detected || 'Neutral'}
                  </span>
                </div>
              </div>

              {ai_analysis.topics_discussed && ai_analysis.topics_discussed.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Topik yang Dibahas</p>
                  <div className="flex flex-wrap gap-2">
                    {ai_analysis.topics_discussed.map((topic, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700 flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            Timeline
          </h4>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Dimulai:</span>
                <span className="text-gray-900">
                  {format(new Date(timeline.started_at), 'dd MMM yyyy, HH:mm', { locale: id })}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Aktivitas Terakhir:</span>
                <span className="text-gray-900">
                  {format(new Date(timeline.last_activity_at), 'dd MMM yyyy, HH:mm', { locale: id })}
                </span>
              </div>

              {timeline.ended_at && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Berakhir:</span>
                  <span className="text-gray-900">
                    {format(new Date(timeline.ended_at), 'dd MMM yyyy, HH:mm', { locale: id })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationSummary;
