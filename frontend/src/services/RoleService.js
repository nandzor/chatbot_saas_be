import { BaseService } from './BaseService';

/**
 * Role Service
 * Handles all role-related API operations with role-specific business logic
 * Extends BaseService for common CRUD operations
 */
export class RoleService extends BaseService {
  constructor() {
    super('/v1/roles', {
      enableCache: true,
      cacheTimeout: 2 * 60 * 1000, // 2 minutes for roles
      retryAttempts: 2
    });
  }

  /**
   * Get roles with advanced filtering and sorting
   */
  async getRoles(params = {}) {
    const defaultParams = {
      per_page: 15,
      sort_by: 'created_at',
      sort_order: 'desc',
      ...params
    };

    return this.get(defaultParams);
  }

  /**
   * Get role by ID or code (supports both UUID and string codes)
   */
  async getRoleById(identifier) {
    // Try as UUID first, then as code
    try {
      return await this.getById(identifier);
    } catch (error) {
      if (error.message.includes('not found')) {
        // Try as code
        return this.getByCode(identifier);
      }
      throw error;
    }
  }

  /**
   * Get role by code
   */
  async getByCode(code) {
    return this.request('GET', `/code/${code}`);
  }

  /**
   * Create new role with validation
   */
  async createRole(roleData) {
    const validatedData = this.validateRoleData(roleData);
    return this.create(validatedData);
  }

  /**
   * Update role with validation
   */
  async updateRole(id, roleData) {
    const validatedData = this.validateRoleData(roleData, true);
    return this.update(id, validatedData);
  }

  /**
   * Delete role with cascade options
   */
  async deleteRole(id, options = {}) {
    const { cascade = false, reassignUsers = false } = options;
    
    return this.request('DELETE', `/${id}`, {
      data: { cascade, reassign_users: reassignUsers }
    });
  }

  /**
   * Get users assigned to a role
   */
  async getUsersByRole(roleId, params = {}) {
    return this.request('GET', `/${roleId}/users`, { params });
  }

  /**
   * Assign role to users
   */
  async assignRole(roleId, userIds, options = {}) {
    const { notifyUsers = false, sendEmail = false } = options;
    
    return this.request('POST', `/${roleId}/assign`, {
      data: {
        user_ids: userIds,
        notify_users: notifyUsers,
        send_email: sendEmail,
        ...options
      }
    });
  }

  /**
   * Revoke role from users
   */
  async revokeRole(roleId, userIds, options = {}) {
    const { notifyUsers = false, reason = null } = options;
    
    return this.request('POST', `/${roleId}/revoke`, {
      data: {
        user_ids: userIds,
        notify_users: notifyUsers,
        reason,
        ...options
      }
    });
  }

  /**
   * Get role permissions
   */
  async getRolePermissions(roleId) {
    return this.request('GET', `/${roleId}/permissions`);
  }

  /**
   * Update role permissions
   */
  async updateRolePermissions(roleId, permissionIds, options = {}) {
    const { replace = true, notifyUsers = false } = options;
    
    return this.request('PUT', `/${roleId}/permissions`, {
      data: {
        permission_ids: permissionIds,
        replace,
        notify_users: notifyUsers,
        ...options
      }
    });
  }

  /**
   * Get role analytics
   */
  async getRoleAnalytics(roleId, params = {}) {
    const defaultParams = {
      time_range: '30d',
      metrics: ['user_count', 'activity', 'permissions'],
      ...params
    };

    return this.request('GET', `/${roleId}/analytics`, { params: defaultParams });
  }

  /**
   * Get all role analytics
   */
  async getAllRoleAnalytics(params = {}) {
    const defaultParams = {
      time_range: '30d',
      group_by: 'role',
      ...params
    };

    return this.request('GET', '/analytics', { params: defaultParams });
  }

  /**
   * Clone role with all permissions
   */
  async cloneRole(roleId, newRoleData) {
    const validatedData = this.validateRoleData(newRoleData);
    
    return this.request('POST', `/${roleId}/clone`, {
      data: validatedData
    });
  }

  /**
   * Bulk operations
   */
  async bulkAssignRoles(assignments) {
    return this.request('POST', '/bulk-assign', {
      data: { assignments }
    });
  }

  async bulkRevokeRoles(revocations) {
    return this.request('POST', '/bulk-revoke', {
      data: { revocations }
    });
  }

  async bulkUpdateRoles(updates) {
    return this.request('PUT', '/bulk-update', {
      data: { updates }
    });
  }

  /**
   * Role hierarchy operations
   */
  async getRoleHierarchy() {
    return this.request('GET', '/hierarchy');
  }

  async updateRoleHierarchy(hierarchy) {
    return this.request('PUT', '/hierarchy', {
      data: { hierarchy }
    });
  }

  async getInheritedPermissions(roleId) {
    return this.request('GET', `/${roleId}/inherited-permissions`);
  }

  /**
   * Role templates
   */
  async getRoleTemplates() {
    return this.request('GET', '/templates');
  }

  async createRoleFromTemplate(templateId, customizations = {}) {
    return this.request('POST', `/templates/${templateId}/create`, {
      data: customizations
    });
  }

  /**
   * Export/Import operations
   */
  async exportRoles(format = 'json', filters = {}) {
    return this.request('GET', '/export', {
      params: { format, ...filters },
      responseType: 'blob'
    });
  }

  async importRoles(file, options = {}) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('options', JSON.stringify(options));

    return this.request('POST', '/import', {
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }

  /**
   * Validation methods
   */
  validateRoleData(data, isUpdate = false) {
    const validated = { ...data };

    // Required fields for creation
    if (!isUpdate) {
      if (!validated.name?.trim()) {
        throw new Error('Role name is required');
      }
      if (!validated.code?.trim()) {
        throw new Error('Role code is required');
      }
    }

    // Validate code format
    if (validated.code && !/^[a-z0-9_]+$/.test(validated.code)) {
      throw new Error('Role code must contain only lowercase letters, numbers, and underscores');
    }

    // Validate level range
    if (validated.level !== undefined) {
      const level = parseInt(validated.level);
      if (isNaN(level) || level < 1 || level > 100) {
        throw new Error('Role level must be between 1 and 100');
      }
      validated.level = level;
    }

    // Validate max users
    if (validated.max_users !== undefined && validated.max_users !== null) {
      const maxUsers = parseInt(validated.max_users);
      if (isNaN(maxUsers) || maxUsers < 1) {
        throw new Error('Max users must be at least 1');
      }
      validated.max_users = maxUsers;
    }

    // Validate color format
    if (validated.color && !/^#[0-9A-F]{6}$/i.test(validated.color)) {
      throw new Error('Color must be a valid hex color (e.g., #3B82F6)');
    }

    // Sanitize strings
    if (validated.name) validated.name = validated.name.trim();
    if (validated.code) validated.code = validated.code.trim();
    if (validated.display_name) validated.display_name = validated.display_name.trim();
    if (validated.description) validated.description = validated.description.trim();

    return validated;
  }

  /**
   * Format role data for display
   */
  formatRoleData(role) {
    if (!role) return null;

    return {
      id: role.id,
      name: role.name,
      code: role.code,
      display_name: role.display_name || role.name,
      description: role.description,
      level: parseInt(role.level) || 50,
      scope: role.scope || 'organization',
      is_active: Boolean(role.is_active),
      is_system_role: Boolean(role.is_system_role),
      is_default: Boolean(role.is_default),
      max_users: role.max_users ? parseInt(role.max_users) : null,
      color: role.color || '#3B82F6',
      icon: role.icon || 'shield',
      badge_text: role.badge_text,
      inherits_permissions: Boolean(role.inherits_permissions),
      parent_role_id: role.parent_role_id,
      organization_id: role.organization_id,
      permission_ids: role.permission_ids || [],
      user_count: role.user_count || 0,
      created_at: role.created_at,
      updated_at: role.updated_at,
      metadata: role.metadata || {}
    };
  }

  /**
   * Get role statistics
   */
  async getRoleStats() {
    return this.request('GET', '/stats');
  }

  /**
   * Search roles with advanced filters
   */
  async searchRoles(query, filters = {}) {
    return this.request('GET', '/search', {
      params: { q: query, ...filters }
    });
  }

  /**
   * Get role suggestions for autocomplete
   */
  async getRoleSuggestions(query, limit = 10) {
    return this.request('GET', '/suggestions', {
      params: { q: query, limit }
    });
  }
}

// Export singleton instance
export const roleService = new RoleService();
