/**
 * Permission constants for frontend components
 * These codes match the backend permission system
 */

export const PERMISSIONS = {
  // User Management
  USERS: {
    VIEW: 'users.view_org',
    CREATE: 'users.create_org',
    UPDATE: 'users.update_org',
    DELETE: 'users.delete_org',
    VIEW_ALL: 'users.view_all',
    MANAGE_ROLES: 'users.manage_roles'
  },

  // Agent Management
  AGENTS: {
    VIEW: 'agents.view',
    CREATE: 'agents.create',
    UPDATE: 'agents.update',
    DELETE: 'agents.delete',
    EXECUTE: 'agents.execute'
  },

  // Customer Management
  CUSTOMERS: {
    VIEW: 'customers.view',
    CREATE: 'customers.create',
    UPDATE: 'customers.update',
    DELETE: 'customers.delete'
  },

  // Chat Sessions
  CHAT_SESSIONS: {
    VIEW: 'chat_sessions.view',
    CREATE: 'chat_sessions.create',
    UPDATE: 'chat_sessions.update',
    DELETE: 'chat_sessions.delete',
    // Manual session management
    MANUAL_CREATE: 'chat_sessions.manual_create',
    MANUAL_ASSIGN: 'chat_sessions.manual_assign',
    MANUAL_TRANSFER: 'chat_sessions.manual_transfer',
    MANUAL_END: 'chat_sessions.manual_end'
  },

  // Messages
  MESSAGES: {
    VIEW: 'messages.view',
    CREATE: 'messages.create',
    UPDATE: 'messages.update',
    DELETE: 'messages.delete'
  },

  // Knowledge Management
  KNOWLEDGE: {
    VIEW: 'knowledge_articles.view',
    CREATE: 'knowledge_articles.create',
    UPDATE: 'knowledge_articles.update',
    DELETE: 'knowledge_articles.delete',
    PUBLISH: 'knowledge_articles.publish'
  },

  // Bot Personalities
  BOT_PERSONALITIES: {
    VIEW: 'bot_personalities.view',
    CREATE: 'bot_personalities.create',
    UPDATE: 'bot_personalities.update',
    DELETE: 'bot_personalities.delete'
  },

  // Channel Configurations
  CHANNEL_CONFIGS: {
    VIEW: 'channel_configs.view',
    CREATE: 'channel_configs.create',
    UPDATE: 'channel_configs.update',
    DELETE: 'channel_configs.delete'
  },

  // Analytics
  ANALYTICS: {
    VIEW: 'analytics.view',
    EXPORT: 'analytics.export'
  },

  // Inbox Management
  INBOX: {
    VIEW: 'inbox.view',
    CREATE: 'inbox.create',
    UPDATE: 'inbox.update',
    DELETE: 'inbox.delete',
    MANAGE: 'inbox.manage',
    EXPORT: 'inbox.export',
    // Manual session management
    MANUAL_CREATE: 'inbox.sessions.manual_create',
    MANUAL_ASSIGN: 'inbox.sessions.manual_assign',
    MANUAL_TRANSFER: 'inbox.sessions.manual_transfer',
    MANUAL_END: 'inbox.sessions.manual_end'
  },

  // Conversation Management (Enhanced)
  CONVERSATIONS: {
    VIEW: 'conversations.view',
    CREATE: 'conversations.create',
    UPDATE: 'conversations.update',
    DELETE: 'conversations.delete',
    SEND_MESSAGE: 'conversations.send_message',
    END: 'conversations.end',
    TRANSFER: 'conversations.transfer',
    HISTORY: 'conversations.history',
    LOG: 'conversations.log',
    STATISTICS: 'conversations.statistics'
  },

  // Message Management (Enhanced)
  MESSAGES: {
    VIEW: 'messages.view',
    CREATE: 'messages.create',
    UPDATE: 'messages.update',
    DELETE: 'messages.delete',
    VIEW_ALL: 'messages.view_all',
    EDIT: 'messages.edit',
    MARK_READ: 'messages.mark_read',
    REACT: 'messages.react',
    FORWARD: 'messages.forward',
    EXPORT: 'messages.export'
  },

  // Billing
  BILLING: {
    VIEW: 'billing.view',
    MANAGE: 'billing.manage'
  },

  // API Management
  API_KEYS: {
    VIEW: 'api_keys.view',
    CREATE: 'api_keys.create',
    UPDATE: 'api_keys.update',
    DELETE: 'api_keys.delete'
  },

  // Settings Management
  SETTINGS: {
    VIEW: 'settings.view',
    MANAGE: 'manage_settings',
    UPDATE: 'settings.update',
    CONFIGURE: 'settings.configure'
  },

  // Organization Management
  ORGANIZATION: {
    VIEW: 'organization.view',
    MANAGE: 'manage_organization',
    UPDATE: 'organization.update',
    CONFIGURE: 'organization.configure'
  },

  // Chat Management
  CHAT: {
    HANDLE: 'handle_chats',
    VIEW: 'chat.view',
    MANAGE: 'chat.manage'
  },

  // Webhooks
  WEBHOOKS: {
    VIEW: 'webhooks.view',
    CREATE: 'webhooks.create',
    UPDATE: 'webhooks.update',
    DELETE: 'webhooks.delete'
  },

  // Workflows
  WORKFLOWS: {
    VIEW: 'workflows.view',
    CREATE: 'workflows.create',
    UPDATE: 'workflows.update',
    DELETE: 'workflows.delete',
    EXECUTE: 'workflows.execute'
  },

  // Organizations (Admin)
  ORGANIZATIONS: {
    VIEW: 'organizations.view',
    CREATE: 'organizations.create',
    UPDATE: 'organizations.update',
    DELETE: 'organizations.delete'
  },

  // Roles (Admin)
  ROLES: {
    VIEW: 'roles.view',
    CREATE: 'roles.create',
    UPDATE: 'roles.update',
    DELETE: 'roles.delete',
    ASSIGN: 'roles.assign',
    REVOKE: 'roles.revoke'
  },

  // Permissions (Admin)
  PERMISSIONS: {
    VIEW: 'permissions.view',
    CREATE: 'permissions.create',
    UPDATE: 'permissions.update',
    DELETE: 'permissions.delete'
  },

  // System Logs (Admin)
  SYSTEM_LOGS: {
    VIEW: 'system_logs.view'
  }
};

// Permission groups for easier management
export const PERMISSION_GROUPS = {
  USER_MANAGEMENT: [
    PERMISSIONS.USERS.VIEW,
    PERMISSIONS.USERS.CREATE,
    PERMISSIONS.USERS.UPDATE,
    PERMISSIONS.USERS.DELETE
  ],

  AGENT_MANAGEMENT: [
    PERMISSIONS.AGENTS.VIEW,
    PERMISSIONS.AGENTS.CREATE,
    PERMISSIONS.AGENTS.UPDATE,
    PERMISSIONS.AGENTS.DELETE,
    PERMISSIONS.AGENTS.EXECUTE
  ],

  CONTENT_MANAGEMENT: [
    PERMISSIONS.KNOWLEDGE.VIEW,
    PERMISSIONS.KNOWLEDGE.CREATE,
    PERMISSIONS.KNOWLEDGE.UPDATE,
    PERMISSIONS.KNOWLEDGE.DELETE,
    PERMISSIONS.KNOWLEDGE.PUBLISH
  ],

  SYSTEM_ADMIN: [
    PERMISSIONS.ORGANIZATIONS.VIEW,
    PERMISSIONS.ROLES.VIEW,
    PERMISSIONS.PERMISSIONS.VIEW,
    PERMISSIONS.SYSTEM_LOGS.VIEW
  ],

  ORGANIZATION_ADMIN: [
    PERMISSIONS.ORGANIZATION.VIEW,
    PERMISSIONS.ORGANIZATION.MANAGE,
    PERMISSIONS.ORGANIZATION.UPDATE,
    PERMISSIONS.ORGANIZATION.CONFIGURE,
    PERMISSIONS.SETTINGS.MANAGE,
    PERMISSIONS.SETTINGS.UPDATE,
    PERMISSIONS.SETTINGS.CONFIGURE
  ],

  CHAT_MANAGEMENT: [
    PERMISSIONS.CHAT.HANDLE,
    PERMISSIONS.CHAT.VIEW,
    PERMISSIONS.CHAT.MANAGE
  ],

  N8N_AUTOMATION_MANAGEMENT: [
    'manage_n8n_automations',
    'manage_workflows',
    'configure_bots'
  ]
};

// Role-based permission sets
export const ROLE_PERMISSIONS = {
  SUPER_ADMIN: ['*'], // All permissions
  ORG_ADMIN: [
    ...PERMISSION_GROUPS.USER_MANAGEMENT,
    ...PERMISSION_GROUPS.AGENT_MANAGEMENT,
    ...PERMISSION_GROUPS.CONTENT_MANAGEMENT,
    ...PERMISSION_GROUPS.ORGANIZATION_ADMIN,
    ...PERMISSION_GROUPS.CHAT_MANAGEMENT,
    PERMISSIONS.ANALYTICS.VIEW,
    PERMISSIONS.BILLING.MANAGE,
    PERMISSIONS.SETTINGS.MANAGE,
    PERMISSIONS.ORGANIZATION.MANAGE,
    PERMISSIONS.CHAT.HANDLE,
    'manage_knowledge_base'
  ],
  AGENT: [
    PERMISSIONS.CHAT_SESSIONS.VIEW,
    PERMISSIONS.CHAT_SESSIONS.CREATE,
    PERMISSIONS.CHAT_SESSIONS.UPDATE,
    PERMISSIONS.CHAT_SESSIONS.MANUAL_CREATE,
    PERMISSIONS.CHAT_SESSIONS.MANUAL_ASSIGN,
    PERMISSIONS.CHAT_SESSIONS.MANUAL_TRANSFER,
    PERMISSIONS.CHAT_SESSIONS.MANUAL_END,
    PERMISSIONS.MESSAGES.VIEW,
    PERMISSIONS.MESSAGES.CREATE,
    PERMISSIONS.MESSAGES.UPDATE,
    PERMISSIONS.MESSAGES.EDIT,
    PERMISSIONS.MESSAGES.MARK_READ,
    PERMISSIONS.MESSAGES.REACT,
    PERMISSIONS.KNOWLEDGE.VIEW,
    PERMISSIONS.INBOX.VIEW,
    PERMISSIONS.INBOX.CREATE,
    PERMISSIONS.INBOX.UPDATE,
    PERMISSIONS.INBOX.MANAGE,
    PERMISSIONS.INBOX.MANUAL_CREATE,
    PERMISSIONS.INBOX.MANUAL_ASSIGN,
    PERMISSIONS.INBOX.MANUAL_TRANSFER,
    PERMISSIONS.INBOX.MANUAL_END,
    PERMISSIONS.CONVERSATIONS.VIEW,
    PERMISSIONS.CONVERSATIONS.CREATE,
    PERMISSIONS.CONVERSATIONS.UPDATE,
    PERMISSIONS.CONVERSATIONS.SEND_MESSAGE,
    PERMISSIONS.CONVERSATIONS.END,
    PERMISSIONS.CONVERSATIONS.TRANSFER,
    PERMISSIONS.CONVERSATIONS.HISTORY,
    PERMISSIONS.CONVERSATIONS.LOG,
    PERMISSIONS.CONVERSATIONS.STATISTICS
  ],
  CUSTOMER: [
    PERMISSIONS.CHAT_SESSIONS.VIEW,
    PERMISSIONS.MESSAGES.VIEW,
    PERMISSIONS.MESSAGES.CREATE
  ]
};

// Helper functions
export const hasPermission = (userPermissions, requiredPermission) => {
  if (!userPermissions || !Array.isArray(userPermissions)) {
    return false;
  }

  // Super admin has all permissions
  if (userPermissions.includes('*')) {
    return true;
  }

  return userPermissions.includes(requiredPermission);
};

export const hasAnyPermission = (userPermissions, requiredPermissions) => {
  if (!userPermissions || !Array.isArray(userPermissions)) {
    return false;
  }

  // Super admin has all permissions
  if (userPermissions.includes('*')) {
    return true;
  }

  return requiredPermissions.some(permission =>
    userPermissions.includes(permission)
  );
};

export const hasAllPermissions = (userPermissions, requiredPermissions) => {
  if (!userPermissions || !Array.isArray(userPermissions)) {
    return false;
  }

  // Super admin has all permissions
  if (userPermissions.includes('*')) {
    return true;
  }

  return requiredPermissions.every(permission =>
    userPermissions.includes(permission)
  );
};

export default PERMISSIONS;
