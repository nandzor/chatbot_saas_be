/**
 * WebSocket Configuration
 * Centralized configuration for Laravel Reverb WebSocket connection
 */

const config = {
  // WebSocket connection settings
  websocket: {
    host: import.meta.env.VITE_REVERB_HOST || window.location.hostname,
    port: import.meta.env.VITE_REVERB_PORT || '8081',
    appId: import.meta.env.VITE_REVERB_APP_ID || '14823957',
    appKey: import.meta.env.VITE_REVERB_APP_KEY || 'p8z4t7y2m9x6c1v5',
    appSecret: import.meta.env.VITE_REVERB_APP_SECRET || 'aK9sL3jH7gP5fD2rB8nV1cM0xZ4qW6eT',
    protocol: window.location.protocol === 'https:' ? 'wss:' : 'ws:',

    // Connection settings
    reconnectAttempts: 5,
    reconnectDelay: 3000,
    heartbeatInterval: 30000,

    // Channel prefixes
    channels: {
      organization: 'organization',
      inbox: 'inbox',
      conversation: 'conversation',
      private: 'private'
    }
  },

  // API settings
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000/api',
    timeout: 10000
  },

  // Application settings
  app: {
    name: import.meta.env.VITE_APP_NAME || 'Chatbot SaaS',
    environment: import.meta.env.VITE_NODE_ENV || 'local',
    debug: import.meta.env.VITE_ENABLE_DEBUG_MODE === 'true'
  }
};

/**
 * Get WebSocket URL
 */
export const getWebSocketUrl = () => {
  const { host, port, appKey, protocol } = config.websocket;
  return `${protocol}//${host}:${port}/app/${appKey}`;
};

/**
 * Get channel name for organization
 */
export const getOrganizationChannel = (organizationId) => {
  return `${config.websocket.channels.private}-${config.websocket.channels.organization}.${organizationId}`;
};

/**
 * Get channel name for inbox
 */
export const getInboxChannel = (organizationId) => {
  return `${config.websocket.channels.private}-${config.websocket.channels.inbox}.${organizationId}`;
};

/**
 * Get channel name for conversation
 */
export const getConversationChannel = (sessionId) => {
  return `${config.websocket.channels.private}-${config.websocket.channels.conversation}.${sessionId}`;
};

/**
 * Get API base URL
 */
export const getApiBaseUrl = () => {
  return config.api.baseUrl;
};

/**
 * Check if debug mode is enabled
 */
export const isDebugMode = () => {
  return config.app.debug;
};

/**
 * Get application name
 */
export const getAppName = () => {
  return config.app.name;
};

/**
 * Get application environment
 */
export const getAppEnvironment = () => {
  return config.app.environment;
};

export default config;
