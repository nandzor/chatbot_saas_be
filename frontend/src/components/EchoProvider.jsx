/**
 * Laravel Echo Provider
 * Context provider for Laravel Echo WebSocket connections
 */

import { createContext, useContext, useEffect, useState } from 'react';
import { useEcho } from '@/hooks/useEcho';
import { authService } from '@/services/AuthService';

const EchoContext = createContext();

export const useEchoContext = () => {
  const context = useContext(EchoContext);
  if (!context) {
    throw new Error('useEchoContext must be used within an EchoProvider');
  }
  return context;
};

export const EchoProvider = ({ children }) => {
  const [organizationId, setOrganizationId] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Get organization ID from auth service
  useEffect(() => {
    const getOrganizationId = async () => {
      try {
        const user = await authService.getCurrentUser();
        const orgId = user?.organization_id || user?.organization?.id;
        setOrganizationId(orgId);
      } catch (error) {
        console.error('Failed to get organization ID:', error);
      }
    };

    getOrganizationId();
  }, []);

  // Initialize Echo when organization ID is available
  const {
    isConnected,
    connectionError,
    users,
    subscribeToConversation,
    unsubscribeFromConversation,
    sendTypingIndicator,
    markMessageAsRead,
    broadcastToOrganization,
    updateAuthToken,
    getConnectionStatus,
    disconnect
  } = useEcho({
    organizationId,
    onConnectionChange: (connected) => {
      if (connected && !isInitialized) {
        setIsInitialized(true);
      }
    }
  });

  // Note: Auth token updates are handled by useEcho hook

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  const value = {
    // State
    isConnected,
    connectionError,
    users,
    isInitialized,
    organizationId,

    // Methods
    subscribeToConversation,
    unsubscribeFromConversation,
    sendTypingIndicator,
    markMessageAsRead,
    broadcastToOrganization,
    updateAuthToken,
    getConnectionStatus,
    disconnect
  };

  return (
    <EchoContext.Provider value={value}>
      {children}
    </EchoContext.Provider>
  );
};

export default EchoProvider;
