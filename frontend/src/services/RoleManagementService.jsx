import api from './api';

class RoleManagementService {
  constructor() {
    this.baseUrl = '/v1/roles';
  }

  /**
   * Get all roles with pagination and filters
   */
  async getRoles(params = {}) {
    try {
      const response = await api.get(this.baseUrl, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get a specific role with details
   */
  async getRole(id) {
    try {
      const response = await api.get(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create a new role
   */
  async createRole(roleData) {
    try {
      const response = await api.post(this.baseUrl, roleData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update an existing role
   */
  async updateRole(id, roleData) {
    try {
      const response = await api.put(`${this.baseUrl}/${id}`, roleData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete a role
   */
  async deleteRole(id) {
    try {
      const response = await api.delete(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get users assigned to a role
   */
  async getUsersByRole(roleId) {
    try {
      const response = await api.get(`${this.baseUrl}/${roleId}/users`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Assign role to users
   */
  async assignRole(roleId, userIds, options = {}) {
    try {
      const response = await api.post(`${this.baseUrl}/assign`, {
        role_id: roleId,
        user_ids: userIds,
        ...options
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Revoke role from users
   */
  async revokeRole(roleId, userIds) {
    try {
      const response = await api.post(`${this.baseUrl}/revoke`, {
        role_id: roleId,
        user_ids: userIds
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get available users for role assignment
   */
  async getAvailableUsersForRole(roleId) {
    try {
      const response = await api.get(`${this.baseUrl}/${roleId}/available-users`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get role assignment statistics
   */
  async getRoleAssignmentStats(roleId) {
    try {
      const response = await api.get(`${this.baseUrl}/${roleId}/assignment-stats`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Bulk assign role to users
   */
  async bulkAssignRole(roleId, userIds, options = {}) {
    try {
      const response = await api.post(`${this.baseUrl}/${roleId}/bulk-assign`, {
        user_ids: userIds,
        ...options
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Bulk revoke role from users
   */
  async bulkRevokeRole(roleId, userIds) {
    try {
      const response = await api.post(`${this.baseUrl}/${roleId}/bulk-revoke`, {
        user_ids: userIds
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get all permissions
   */
  async getPermissions() {
    try {
      const response = await api.get('/v1/permissions');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get permissions for a specific role
   */
  async getRolePermissions(roleId) {
    try {
      const response = await api.get(`${this.baseUrl}/${roleId}/permissions`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update permissions for a role
   */
  async updateRolePermissions(roleId, permissionIds) {
    try {
      const response = await api.put(`${this.baseUrl}/${roleId}/permissions`, {
        permission_ids: permissionIds
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Grant permission to role
   */
  async grantPermission(roleId, permissionId, options = {}) {
    try {
      const response = await api.post(`${this.baseUrl}/${roleId}/permissions`, {
        permission_id: permissionId,
        ...options
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Revoke permission from role
   */
  async revokePermission(roleId, permissionId) {
    try {
      const response = await api.delete(`${this.baseUrl}/${roleId}/permissions/${permissionId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get role analytics
   */
  async getAnalytics(params = {}) {
    try {
      const response = await api.get(`${this.baseUrl}/analytics`, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get role statistics
   */
  async getStatistics() {
    try {
      const response = await api.get(`${this.baseUrl}/statistics`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Export roles data
   */
  async exportRoles(format = 'json', filters = {}) {
    try {
      const response = await api.get(`${this.baseUrl}/export`, {
        params: { format, ...filters },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Import roles data
   */
  async importRoles(file, options = {}) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      Object.keys(options).forEach(key => {
        formData.append(key, options[key]);
      });

      const response = await api.post(`${this.baseUrl}/import`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Bulk delete roles
   */
  async bulkDelete(roleIds) {
    try {
      const response = await api.post(`${this.baseUrl}/bulk-delete`, {
        role_ids: roleIds
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Bulk clone roles
   */
  async bulkClone(roleIds, options = {}) {
    try {
      const response = await api.post(`${this.baseUrl}/bulk-clone`, {
        role_ids: roleIds,
        ...options
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Bulk archive roles
   */
  async bulkArchive(roleIds) {
    try {
      const response = await api.post(`${this.baseUrl}/bulk-archive`, {
        role_ids: roleIds
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Bulk unarchive roles
   */
  async bulkUnarchive(roleIds) {
    try {
      const response = await api.post(`${this.baseUrl}/bulk-unarchive`, {
        role_ids: roleIds
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Bulk assign users to roles
   */
  async bulkAssignUsers(roleIds, options = {}) {
    try {
      const response = await api.post(`${this.baseUrl}/bulk-assign-users`, {
        role_ids: roleIds,
        ...options
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get available roles for assignment
   */
  async getAvailableRoles() {
    try {
      const response = await api.get(`${this.baseUrl}/available`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get role statistics
   */
  async getRoleStatistics() {
    try {
      const response = await api.get(`${this.baseUrl}/statistics`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Validate role assignment
   */
  async validateRoleAssignment(roleId, userIds) {
    try {
      const response = await api.post(`${this.baseUrl}/validate-assignment`, {
        role_id: roleId,
        user_ids: userIds
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get permissions for role assignment
   */
  async getPermissionsForRole() {
    try {
      const response = await api.get(`${this.baseUrl}/permissions`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors
   */
  handleError(error) {
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 400:
          return new Error(data.message || 'Invalid request data');
        case 401:
          return new Error('Unauthorized access');
        case 403:
          return new Error('Permission denied');
        case 404:
          return new Error('Role not found');
        case 409:
          return new Error(data.message || 'Role already exists');
        case 422:
          return new Error(data.message || 'Validation failed');
        case 500:
          return new Error('Internal server error');
        default:
          return new Error(data.message || 'An error occurred');
      }
    }

    return new Error('Network error');
  }

  /**
   * Format role data for form submission
   */
  formatRoleData(data) {
    return {
      name: data.name,
      code: data.code,
      display_name: data.display_name,
      description: data.description,
      level: parseInt(data.level),
      scope: data.scope,
      is_active: Boolean(data.is_active),
      is_system_role: Boolean(data.is_system_role),
      permission_ids: data.permission_ids || [],
      metadata: data.metadata || {}
    };
  }

  /**
   * Format assignment data
   */
  formatAssignmentData(roleId, userIds, options = {}) {
    return {
      role_id: roleId,
      user_ids: userIds,
      is_active: Boolean(options.is_active ?? true),
      is_primary: Boolean(options.is_primary ?? false),
      scope: options.scope || 'organization',
      scope_context: options.scope_context,
      effective_from: options.effective_from,
      effective_until: options.effective_until,
      assigned_reason: options.assigned_reason
    };
  }
}

export const roleManagementService = new RoleManagementService();
export default roleManagementService;
