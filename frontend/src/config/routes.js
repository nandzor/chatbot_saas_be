/**
 * Routes Configuration
 * Centralized routing configuration
 */

export const ROUTES = {
  // Public Routes
  PUBLIC: {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
    ABOUT: '/about',
    CONTACT: '/contact',
    PRICING: '/pricing',
    FEATURES: '/features'
  },

  // Dashboard Routes
  DASHBOARD: {
    MAIN: '/dashboard',
    OVERVIEW: '/dashboard/overview',
    ANALYTICS: '/dashboard/analytics',
    REPORTS: '/dashboard/reports',
    WHATSAPP: '/dashboard/whatsapp'
  },

  // SuperAdmin Routes
  SUPERADMIN: {
    MAIN: '/superadmin',
    DASHBOARD: '/superadmin/dashboard',
    USERS: '/superadmin/users',
    ORGANIZATIONS: '/superadmin/organizations',
    SUBSCRIPTIONS: '/superadmin/subscriptions',
    PAYMENTS: '/superadmin/payments',
    ANALYTICS: '/superadmin/analytics',
    SYSTEM: '/superadmin/system',
    SETTINGS: '/superadmin/settings'
  },

  // User Management Routes
  USERS: {
    LIST: '/users',
    CREATE: '/users/create',
    EDIT: '/users/:id/edit',
    VIEW: '/users/:id',
    PROFILE: '/users/profile',
    SETTINGS: '/users/settings'
  },

  // Organization Management Routes
  ORGANIZATIONS: {
    LIST: '/organizations',
    CREATE: '/organizations/create',
    EDIT: '/organizations/:id/edit',
    VIEW: '/organizations/:id',
    SETTINGS: '/organizations/:id/settings',
    USERS: '/organizations/:id/users',
    ROLES: '/organizations/:id/roles',
    PERMISSIONS: '/organizations/:id/permissions'
  },

  // Subscription Management Routes
  SUBSCRIPTIONS: {
    LIST: '/subscriptions',
    CREATE: '/subscriptions/create',
    EDIT: '/subscriptions/:id/edit',
    VIEW: '/subscriptions/:id',
    PLANS: '/subscriptions/plans',
    BILLING: '/subscriptions/billing',
    INVOICES: '/subscriptions/invoices'
  },

  // Chatbot Management Routes
  CHATBOTS: {
    LIST: '/chatbots',
    CREATE: '/chatbots/create',
    EDIT: '/chatbots/:id/edit',
    VIEW: '/chatbots/:id',
    TRAIN: '/chatbots/:id/train',
    TEST: '/chatbots/:id/test',
    CONVERSATIONS: '/chatbots/:id/conversations'
  },

  // Conversation Management Routes
  CONVERSATIONS: {
    LIST: '/conversations',
    VIEW: '/conversations/:id',
    HISTORY: '/conversations/history',
    LIVE: '/conversations/live'
  },

  // Analytics Routes
  ANALYTICS: {
    DASHBOARD: '/analytics',
    USAGE: '/analytics/usage',
    PERFORMANCE: '/analytics/performance',
    REVENUE: '/analytics/revenue',
    USERS: '/analytics/users',
    CONVERSATIONS: '/analytics/conversations'
  },

  // Settings Routes
  SETTINGS: {
    PROFILE: '/settings/profile',
    ACCOUNT: '/settings/account',
    SECURITY: '/settings/security',
    NOTIFICATIONS: '/settings/notifications',
    PREFERENCES: '/settings/preferences',
    BILLING: '/settings/billing',
    API: '/settings/api'
  },

  // Error Routes
  ERROR: {
    NOT_FOUND: '/404',
    UNAUTHORIZED: '/401',
    FORBIDDEN: '/403',
    SERVER_ERROR: '/500'
  }
};

export default ROUTES;
