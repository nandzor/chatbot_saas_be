import { useState, useEffect } from 'react';
import ProfileService from '@/services/ProfileService';

const profileService = new ProfileService();
import { handleError } from '@/utils/errorHandler';
import {
  Computer,
  Smartphone,
  MapPin,
  Clock,
  LogOut,
  AlertTriangle
} from 'lucide-react';

const ActiveSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      const sessionsData = await profileService.getActiveSessions();
      setSessions(sessionsData || []);
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Error loading sessions:', err);
      }
      setError(handleError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutAll = async () => {
    if (!window.confirm('Apakah Anda yakin ingin keluar dari semua perangkat lain? Tindakan ini akan mengakhiri semua sesi aktif kecuali sesi saat ini.')) {
      return;
    }

    try {
      setLogoutLoading(true);
      await profileService.logoutAllDevices();

      // Reload sessions to show updated list
      await loadSessions();

      // Show success message
      alert('Berhasil keluar dari semua perangkat lain');
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Error logging out all devices:', err);
      }
      const errorMessage = handleError(err);
      alert(`Gagal keluar dari semua perangkat: ${errorMessage.message}`);
    } finally {
      setLogoutLoading(false);
    }
  };

  const getDeviceIcon = (deviceInfo) => {
    if (!deviceInfo) return <Computer className="w-5 h-5" />;

    const device = deviceInfo.toLowerCase();
    if (device.includes('mobile') || device.includes('android') || device.includes('iphone')) {
      return <Smartphone className="w-5 h-5" />;
    }
    return <Computer className="w-5 h-5" />;
  };

  const formatLastActivity = (lastActivity) => {
    if (!lastActivity) return 'Tidak diketahui';

    // If it's already formatted by backend (diffForHumans)
    if (typeof lastActivity === 'string') {
      return lastActivity;
    }

    // If it's a date object, format it
    const date = new Date(lastActivity);
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatLocation = (locationInfo) => {
    if (!locationInfo) return 'Lokasi tidak diketahui';

    if (typeof locationInfo === 'string') {
      return locationInfo;
    }

    if (locationInfo.city && locationInfo.country) {
      return `${locationInfo.city}, ${locationInfo.country}`;
    }

    return 'Lokasi tidak diketahui';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Gagal Memuat Sesi</h3>
            <p className="text-gray-500 mb-4">{error.message}</p>
            <button
              onClick={loadSessions}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Sesi Aktif</h2>
          <button
            onClick={handleLogoutAll}
            disabled={logoutLoading || sessions.length <= 1}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {logoutLoading ? 'Memproses...' : 'Keluar dari Semua Perangkat Lain'}
          </button>
      </div>

      {/* Sessions List */}
      <div className="p-6">
        {sessions.length === 0 ? (
          <div className="text-center py-8">
            <Computer className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak Ada Sesi Aktif</h3>
            <p className="text-gray-500">Tidak ada sesi aktif yang ditemukan.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`p-4 rounded-lg border ${
                  session.is_current
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {getDeviceIcon(session.device_info)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            session.is_current
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {session.is_current ? 'Sesi Saat Ini' : 'Sesi Aktif'}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <span className="font-medium">
                            {session.device_info || 'Perangkat Tidak Diketahui'}
                          </span>
                        </div>

                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span>{formatLocation(session.location_info)}</span>
                        </div>

                        <div className="flex items-center text-sm text-gray-500">
                          <span className="font-mono text-xs">
                            IP: {session.ip_address || 'Tidak diketahui'}
                          </span>
                        </div>

                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>
                            Terakhir aktif: {formatLastActivity(session.last_activity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveSessions;
