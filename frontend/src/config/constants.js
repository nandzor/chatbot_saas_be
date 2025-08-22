// Application Constants
export const APP_NAME = 'ChatBot Pro';
export const APP_VERSION = '1.0.0';

// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
export const API_TIMEOUT = 10000;

// Authentication
export const AUTH_TOKEN_KEY = 'chatbot_auth_token';
export const USER_DATA_KEY = 'chatbot_user';
export const SESSION_KEY = 'chatbot_session';

// User Roles
export const ROLES = {
  SUPERADMIN: 'superadmin',
  ORGANIZATION_ADMIN: 'organization_admin',
  AGENT: 'agent'
};

// Permissions
export const PERMISSIONS = {
  // Super Admin Permissions
  ALL: '*',
  
  // Organization Admin Permissions
  HANDLE_CHATS: 'handle_chats',
  MANAGE_USERS: 'manage_users',
  MANAGE_AGENTS: 'manage_agents',
  MANAGE_SETTINGS: 'manage_settings',
  VIEW_ANALYTICS: 'view_analytics',
  MANAGE_BILLING: 'manage_billing',
  MANAGE_AUTOMATIONS: 'manage_automations',
  
  // Agent Permissions
  VIEW_CONVERSATIONS: 'view_conversations',
  UPDATE_PROFILE: 'update_profile'
};

// Route Paths
export const ROUTES = {
  // Auth Routes
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  
  // Dashboard Routes
  DASHBOARD: '/dashboard',
  INBOX: '/dashboard/inbox',
  ANALYTICS: '/dashboard/analytics',
  KNOWLEDGE: '/dashboard/knowledge',
  AUTOMATIONS: '/dashboard/automations',
  SETTINGS: '/dashboard/settings',
  
  // Super Admin Routes
  SUPERADMIN: '/superadmin',
  SUPERADMIN_FINANCIALS: '/superadmin/financials',
  SUPERADMIN_CLIENTS: '/superadmin/clients',
  SUPERADMIN_SYSTEM: '/superadmin/system',
  
  // Agent Routes
  AGENT: '/agent',
  AGENT_INBOX: '/agent/inbox',
  AGENT_PROFILE: '/agent/profile',
  
  // Error Routes
  UNAUTHORIZED: '/unauthorized',
  SERVER_ERROR: '/server-error',
  NOT_FOUND: '/404'
};

// UI Constants
export const UI = {
  SIDEBAR_WIDTH: 256,
  HEADER_HEIGHT: 64,
  BORDER_RADIUS: 8,
  TRANSITION_DURATION: 200
};

// Currency
export const CURRENCY = {
  CODE: 'IDR',
  SYMBOL: 'Rp',
  LOCALE: 'id-ID'
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50]
};

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
};

// Validation
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
};

// Local Storage Keys
export const STORAGE_KEYS = {
  THEME: 'chatbot_theme',
  LANGUAGE: 'chatbot_language',
  SIDEBAR_COLLAPSED: 'chatbot_sidebar_collapsed'
};
