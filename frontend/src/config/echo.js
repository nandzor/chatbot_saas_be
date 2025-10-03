/**
 * Laravel Echo Configuration
 * Configuration for Laravel Echo with Reverb WebSocket server
 */

import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Echo configuration
const echoConfig = {
  // Reverb WebSocket configuration
  broadcaster: 'reverb',
  key: import.meta.env.VITE_REVERB_APP_KEY || 'p8z4t7y2m9x6c1v5',
  wsHost: import.meta.env.VITE_REVERB_HOST || '100.81.120.54',
  wsPort: import.meta.env.VITE_REVERB_PORT || 8081,
  wssPort: import.meta.env.VITE_REVERB_PORT || 8081,
  forceTLS: (import.meta.env.VITE_REVERB_SCHEME || 'http') === 'https',
  encrypted: (import.meta.env.VITE_REVERB_SCHEME || 'http') === 'https',
  enabledTransports: ['ws', 'wss'],

  // Connection settings
  cluster: import.meta.env.VITE_REVERB_APP_CLUSTER || 'mt1',
  disableStats: true,

  // Authentication
  authEndpoint: `${import.meta.env.VITE_BASE_URL || 'http://100.81.120.54:9000'}/broadcasting/auth`,
  auth: {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('jwt_token') || localStorage.getItem('sanctum_token') || ''}`,
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  },
};

// Create Echo instance
let echo = null;

/**
 * Initialize Laravel Echo
 */
export const initializeEcho = (token = null) => {
  if (echo) {
    return echo;
  }

  try {
    // Set up Pusher for Echo
    window.Pusher = Pusher;

    // Update auth token if provided
    if (token) {
      echoConfig.auth.headers.Authorization = `Bearer ${token}`;
    }


    // Create Echo instance
    echo = new Echo(echoConfig);

    return echo;
  } catch (error) {
    console.error('❌ Failed to initialize Laravel Echo:', error);
    return null;
  }
};

/**
 * Get Echo instance
 */
export const getEcho = () => {
  return echo || initializeEcho();
};

/**
 * Disconnect Echo
 */
export const disconnectEcho = () => {
  if (echo) {
    echo.disconnect();
    echo = null;
  }
};

/**
 * Update authentication token
 */
export const updateEchoAuth = (token) => {
  if (!echo?.connector?.pusher?.config?.auth?.headers) {
    return;
  }

  echo.connector.pusher.config.auth.headers.Authorization = `Bearer ${token}`;
};

/**
 * Channel name helpers
 */
export const getChannelNames = {
  organization: (organizationId) => `private-organization.${organizationId}`,
  inbox: (organizationId) => `private-inbox.${organizationId}`,
  conversation: (sessionId) => `private-conversation.${sessionId}`,
  presence: (organizationId) => `presence-organization.${organizationId}`,
};

/**
 * Event names
 */
export const EventNames = {
  // Message events
  MESSAGE_SENT: 'MessageSent',
  MESSAGE_PROCESSED: 'MessageProcessed',
  MESSAGE_READ: 'MessageRead',

  // Session events
  SESSION_UPDATED: 'SessionUpdated',
  SESSION_ASSIGNED: 'SessionAssigned',
  SESSION_TRANSFERRED: 'SessionTransferred',
  SESSION_ENDED: 'SessionEnded',

  // Typing events
  TYPING_START: 'TypingStart',
  TYPING_STOP: 'TypingStop',

  // User events
  USER_ONLINE: 'UserOnline',
  USER_OFFLINE: 'UserOffline',
  USER_TYPING: 'UserTyping',
};

export default echoConfig;
