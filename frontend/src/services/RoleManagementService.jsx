import { api } from './api';

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
