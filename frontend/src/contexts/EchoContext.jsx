/**
 * Echo Context
 * React context for Laravel Echo WebSocket connections
 */

import { createContext } from 'react';

export const EchoContext = createContext({
  // State
  isConnected: false,
  connectionError: null,
  users: [],
  isInitialized: false,
  organizationId: null,

  // Methods
  subscribeToConversation: () => {},
  unsubscribeFromConversation: () => {},
  sendTypingIndicator: () => {},
  markMessageAsRead: () => {},
  broadcastToOrganization: () => {},
  updateAuthToken: () => {},
  getConnectionStatus: () => {},
  disconnect: () => {}
});

export default EchoContext;
