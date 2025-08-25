import { api } from './api';

class PermissionManagementService {
  constructor() {
    this.baseUrl = '/v1/permissions';
  }

  /**
   * Get all permissions with pagination and filters
   */
  async getPermissions(params = {}) {
    try {
      console.log('PermissionManagementService: Fetching permissions with params:', params);

      const response = await api.get(this.baseUrl, { params });
      console.log('PermissionManagementService: API response:', response);

      // Return the full response data structure
      return response.data;
    } catch (error) {
      console.error('PermissionManagementService: Error fetching permissions:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get a specific permission with details
   */
  async getPermission(id) {
    try {
      const response = await api.get(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create a new permission
   */
  async createPermission(permissionData) {
    try {
      const response = await api.post(this.baseUrl, permissionData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update an existing permission
   */
  async updatePermission(id, permissionData) {
    try {
      const response = await api.put(`${this.baseUrl}/${id}`, permissionData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete a permission
   */
  async deletePermission(id) {
    try {
      const response = await api.delete(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get permission groups
   */
  async getPermissionGroups() {
    try {
      const response = await api.get(`${this.baseUrl}/groups`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create permission group
   */
  async createPermissionGroup(groupData) {
    try {
      const response = await api.post(`${this.baseUrl}/groups`, groupData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get role permissions
   */
  async getRolePermissions(roleId) {
    try {
      const response = await api.get(`${this.baseUrl}/roles/${roleId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Assign permissions to role
   */
  async assignPermissionsToRole(roleId, permissionIds) {
    try {
      const response = await api.post(`${this.baseUrl}/roles/${roleId}/assign`, {
        permission_ids: permissionIds
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Remove permissions from role
   */
  async removePermissionsFromRole(roleId, permissionIds) {
    try {
      const response = await api.post(`${this.baseUrl}/roles/${roleId}/revoke`, {
        permission_ids: permissionIds
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Check user permission
   */
  async checkUserPermission(permissionCode) {
    try {
      const response = await api.get(`${this.baseUrl}/check/${permissionCode}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get user permissions
   */
  async getUserPermissions() {
    try {
      const response = await api.get(`${this.baseUrl}/user`);
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
          return new Error('Permission not found');
        case 409:
          return new Error(data.message || 'Permission already exists');
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
   * Format permission data for form submission
   */
  formatPermissionData(data) {
    return {
      name: data.name,
      code: data.code,
      description: data.description,
      category: data.category,
      resource: data.resource,
      action: data.action,
      is_system: Boolean(data.is_system),
      is_visible: Boolean(data.is_visible),
      status: data.status || 'active',
      metadata: data.metadata || {}
    };
  }

  /**
   * Get predefined categories
   */
  getCategories() {
    return [
      'user_management',
      'role_management',
      'permission_management',
      'system_administration',
      'content_management',
      'analytics',
      'billing',
      'api_management',
      'workflows',
      'automations'
    ];
  }

  /**
   * Get predefined resources
   */
  getResources() {
    return [
      'users',
      'roles',
      'permissions',
      'organizations',
      'clients',
      'knowledge',
      'chat_sessions',
      'analytics',
      'billing',
      'api_keys',
      'workflows',
      'automations'
    ];
  }

  /**
   * Get predefined actions
   */
  getActions() {
    return [
      'view',
      'create',
      'update',
      'delete',
      'manage',
      'execute',
      'publish',
      'export',
      'import',
      'assign',
      'revoke'
    ];
  }
}

export const permissionManagementService = new PermissionManagementService();
export default permissionManagementService;
