/**
 * Echo Connection Status Component
 * Displays Laravel Echo WebSocket connection status
 */

import { useContext } from 'react';
import { EchoContext } from '@/contexts/EchoContext';
import { Wifi, WifiOff, AlertCircle, Users } from 'lucide-react';

const EchoStatus = ({ showUsers = false, className = '' }) => {
  const context = useContext(EchoContext);

  // Fallback if context is not available
  if (!context) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
        <span className="text-xs text-gray-500">Loading...</span>
      </div>
    );
  }

  const { isConnected, connectionError, users, isInitialized } = context;

  // Debug logging
  console.log('EchoStatus Debug:', { isConnected, isInitialized, connectionError, users: users?.length });

  if (!isInitialized) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
        <span className="text-xs text-gray-500">Connecting...</span>
      </div>
    );
  }

  if (connectionError) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <AlertCircle className="w-3 h-3 text-red-500" />
        <span className="text-xs text-red-600">Connection Error</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {isConnected ? (
        <>
          <Wifi className="w-3 h-3 text-green-500" />
          <span className="text-xs text-green-600">Connected</span>
        </>
      ) : (
        <>
          <WifiOff className="w-3 h-3 text-red-500" />
          <span className="text-xs text-red-600">Disconnected</span>
        </>
      )}

      {showUsers && users && users.length > 0 && (
        <div className="flex items-center space-x-1">
          <Users className="w-3 h-3 text-blue-500" />
          <span className="text-xs text-blue-600">{users.length}</span>
        </div>
      )}
    </div>
  );
};

export default EchoStatus;
