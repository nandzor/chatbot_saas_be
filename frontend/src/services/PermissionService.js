import { BaseService } from './BaseService';

/**
 * Permission Service
 * Handles all permission-related API operations with permission-specific business logic
 * Extends BaseService for common CRUD operations
 */
export class PermissionService extends BaseService {
  constructor() {
    super('/v1/permissions', {
      enableCache: true,
      cacheTimeout: 5 * 60 * 1000, // 5 minutes for permissions
      retryAttempts: 2
    });
  }

  /**
   * Get permissions with advanced filtering and sorting
   */
  async getPermissions(params = {}) {
    const defaultParams = {
      per_page: 15,
      sort_by: 'name',
      sort_order: 'asc',
      ...params
    };

    return this.get(defaultParams);
  }

  /**
   * Get permission by ID or code (supports both UUID and string codes)
   */
  async getPermissionById(identifier) {
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
   * Get permission by code
   */
  async getByCode(code) {
    return this.request('GET', `/code/${code}`);
  }

  /**
   * Create new permission with validation
   */
  async createPermission(permissionData) {
    const validatedData = this.validatePermissionData(permissionData);
    return this.create(validatedData);
  }

  /**
   * Update permission with validation
   */
  async updatePermission(id, permissionData) {
    const validatedData = this.validatePermissionData(permissionData, true);
    return this.update(id, validatedData);
  }

  /**
   * Delete permission with cascade options
   */
  async deletePermission(id, options = {}) {
    const { cascade = false, removeFromRoles = false } = options;
    
    return this.request('DELETE', `/${id}`, {
      data: { cascade, remove_from_roles: removeFromRoles }
    });
  }

  /**
   * Get permission groups/categories
   */
  async getPermissionGroups() {
    return this.request('GET', '/groups');
  }

  /**
   * Create permission group
   */
  async createPermissionGroup(groupData) {
    const validatedData = this.validateGroupData(groupData);
    return this.request('POST', '/groups', { data: validatedData });
  }

  /**
   * Update permission group
   */
  async updatePermissionGroup(groupId, groupData) {
    const validatedData = this.validateGroupData(groupData, true);
    return this.request('PUT', `/groups/${groupId}`, { data: validatedData });
  }

  /**
   * Delete permission group
   */
  async deletePermissionGroup(groupId, options = {}) {
    const { cascade = false } = options;
    
    return this.request('DELETE', `/groups/${groupId}`, {
      data: { cascade }
    });
  }

  /**
   * Get permissions by category
   */
  async getPermissionsByCategory(category, params = {}) {
    return this.request('GET', `/category/${category}`, { params });
  }

  /**
   * Get permissions by resource
   */
  async getPermissionsByResource(resource, params = {}) {
    return this.request('GET', `/resource/${resource}`, { params });
  }

  /**
   * Get permissions by action
   */
  async getPermissionsByAction(action, params = {}) {
    return this.request('GET', `/action/${action}`, { params });
  }

  /**
   * Get system permissions
   */
  async getSystemPermissions(params = {}) {
    return this.request('GET', '/system', { params });
  }

  /**
   * Get custom permissions
   */
  async getCustomPermissions(params = {}) {
    return this.request('GET', '/custom', { params });
  }

  /**
   * Bulk operations
   */
  async bulkCreatePermissions(permissions) {
    const validatedPermissions = permissions.map(p => this.validatePermissionData(p));
    
    return this.request('POST', '/bulk-create', {
      data: { permissions: validatedPermissions }
    });
  }

  async bulkUpdatePermissions(updates) {
    const validatedUpdates = updates.map(update => ({
      id: update.id,
      data: this.validatePermissionData(update.data, true)
    }));
    
    return this.request('PUT', '/bulk-update', {
      data: { updates: validatedUpdates }
    });
  }

  async bulkDeletePermissions(ids, options = {}) {
    return this.bulkDelete(ids, options);
  }

  /**
   * Permission assignment operations
   */
  async assignPermissionsToRole(roleId, permissionIds, options = {}) {
    const { replace = false, notifyUsers = false } = options;
    
    return this.request('POST', `/assign-to-role/${roleId}`, {
      data: {
        permission_ids: permissionIds,
        replace,
        notify_users: notifyUsers,
        ...options
      }
    });
  }

  async revokePermissionsFromRole(roleId, permissionIds, options = {}) {
    const { notifyUsers = false, reason = null } = options;
    
    return this.request('POST', `/revoke-from-role/${roleId}`, {
      data: {
        permission_ids: permissionIds,
        notify_users: notifyUsers,
        reason,
        ...options
      }
    });
  }

  async assignPermissionsToUser(userId, permissionIds, options = {}) {
    const { replace = false, notifyUser = false } = options;
    
    return this.request('POST', `/assign-to-user/${userId}`, {
      data: {
        permission_ids: permissionIds,
        replace,
        notify_user: notifyUser,
        ...options
      }
    });
  }

  async revokePermissionsFromUser(userId, permissionIds, options = {}) {
    const { notifyUser = false, reason = null } = options;
    
    return this.request('POST', `/revoke-from-user/${userId}`, {
      data: {
        permission_ids: permissionIds,
        notify_user: notifyUser,
        reason,
        ...options
      }
    });
  }

  /**
   * Permission checking operations
   */
  async checkUserPermission(userId, permissionCode) {
    return this.request('GET', `/check-user/${userId}/${permissionCode}`);
  }

  async checkRolePermission(roleId, permissionCode) {
    return this.request('GET', `/check-role/${roleId}/${permissionCode}`);
  }

  async getUserPermissions(userId, params = {}) {
    return this.request('GET', `/user/${userId}`, { params });
  }

  async getRolePermissions(roleId, params = {}) {
    return this.request('GET', `/role/${roleId}`, { params });
  }

  /**
   * Permission analytics
   */
  async getPermissionAnalytics(params = {}) {
    const defaultParams = {
      time_range: '30d',
      group_by: 'category',
      ...params
    };

    return this.request('GET', '/analytics', { params: defaultParams });
  }

  async getPermissionUsageStats(permissionId, params = {}) {
    return this.request('GET', `/${permissionId}/usage-stats`, { params });
  }

  /**
   * Permission templates
   */
  async getPermissionTemplates() {
    return this.request('GET', '/templates');
  }

  async createPermissionFromTemplate(templateId, customizations = {}) {
    return this.request('POST', `/templates/${templateId}/create`, {
      data: customizations
    });
  }

  /**
   * Export/Import operations
   */
  async exportPermissions(format = 'json', filters = {}) {
    return this.request('GET', '/export', {
      params: { format, ...filters },
      responseType: 'blob'
    });
  }

  async importPermissions(file, options = {}) {
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
  validatePermissionData(data, isUpdate = false) {
    const validated = { ...data };

    // Required fields for creation
    if (!isUpdate) {
      if (!validated.name?.trim()) {
        throw new Error('Permission name is required');
      }
      if (!validated.code?.trim()) {
        throw new Error('Permission code is required');
      }
      if (!validated.category?.trim()) {
        throw new Error('Permission category is required');
      }
      if (!validated.resource?.trim()) {
        throw new Error('Permission resource is required');
      }
      if (!validated.action?.trim()) {
        throw new Error('Permission action is required');
      }
    }

    // Validate code format
    if (validated.code && !/^[a-z0-9._-]+$/.test(validated.code)) {
      throw new Error('Permission code can only contain lowercase letters, numbers, dots, underscores, and hyphens');
    }

    // Validate resource format
    if (validated.resource && !/^[a-z0-9._-]+$/.test(validated.resource)) {
      throw new Error('Resource can only contain lowercase letters, numbers, dots, underscores, and hyphens');
    }

    // Validate action format
    if (validated.action && !/^[a-z0-9._-]+$/.test(validated.action)) {
      throw new Error('Action can only contain lowercase letters, numbers, dots, underscores, and hyphens');
    }

    // Sanitize strings
    if (validated.name) validated.name = validated.name.trim();
    if (validated.code) validated.code = validated.code.trim();
    if (validated.description) validated.description = validated.description.trim();
    if (validated.category) validated.category = validated.category.trim();
    if (validated.resource) validated.resource = validated.resource.trim();
    if (validated.action) validated.action = validated.action.trim();

    // Set defaults
    if (validated.is_system === undefined) validated.is_system = false;
    if (validated.is_visible === undefined) validated.is_visible = true;
    if (validated.status === undefined) validated.status = 'active';

    return validated;
  }

  validateGroupData(data, isUpdate = false) {
    const validated = { ...data };

    // Required fields for creation
    if (!isUpdate) {
      if (!validated.name?.trim()) {
        throw new Error('Group name is required');
      }
      if (!validated.code?.trim()) {
        throw new Error('Group code is required');
      }
    }

    // Validate code format
    if (validated.code && !/^[a-z0-9._-]+$/.test(validated.code)) {
      throw new Error('Group code can only contain lowercase letters, numbers, dots, underscores, and hyphens');
    }

    // Sanitize strings
    if (validated.name) validated.name = validated.name.trim();
    if (validated.code) validated.code = validated.code.trim();
    if (validated.description) validated.description = validated.description.trim();

    return validated;
  }

  /**
   * Format permission data for display
   */
  formatPermissionData(permission) {
    if (!permission) return null;

    return {
      id: permission.id,
      name: permission.name,
      code: permission.code,
      description: permission.description,
      category: permission.category,
      resource: permission.resource,
      action: permission.action,
      is_system: Boolean(permission.is_system),
      is_visible: Boolean(permission.is_visible),
      status: permission.status || 'active',
      metadata: permission.metadata || {},
      created_at: permission.created_at,
      updated_at: permission.updated_at
    };
  }

  /**
   * Get permission statistics
   */
  async getPermissionStats() {
    return this.request('GET', '/stats');
  }

  /**
   * Search permissions with advanced filters
   */
  async searchPermissions(query, filters = {}) {
    return this.request('GET', '/search', {
      params: { q: query, ...filters }
    });
  }

  /**
   * Get permission suggestions for autocomplete
   */
  async getPermissionSuggestions(query, limit = 10) {
    return this.request('GET', '/suggestions', {
      params: { q: query, limit }
    });
  }

  /**
   * Get permission dependencies
   */
  async getPermissionDependencies(permissionId) {
    return this.request('GET', `/${permissionId}/dependencies`);
  }

  /**
   * Check permission conflicts
   */
  async checkPermissionConflicts(permissionData) {
    return this.request('POST', '/check-conflicts', {
      data: permissionData
    });
  }
}

// Export singleton instance
export const permissionService = new PermissionService();
