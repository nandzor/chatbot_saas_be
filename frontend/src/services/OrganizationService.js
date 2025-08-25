import { BaseService } from './BaseService';

/**
 * OrganizationService - Handles organization management operations
 * Extends BaseService for common CRUD operations
 */
class OrganizationService extends BaseService {
  constructor() {
    super('/api/v1/organizations');
  }

  /**
   * Get organizations with pagination and filters
   */
  async getOrganizations(params = {}) {
    return this.get('', { params });
  }

  /**
   * Get organization by ID
   */
  async getOrganizationById(id) {
    return this.getById(id);
  }

  /**
   * Create new organization
   */
  async createOrganization(organizationData) {
    return this.create(organizationData);
  }

  /**
   * Update organization
   */
  async updateOrganization(id, organizationData) {
    return this.update(id, organizationData);
  }

  /**
   * Delete organization
   */
  async deleteOrganization(id) {
    return this.delete(id);
  }

  /**
   * Bulk delete organizations
   */
  async bulkDeleteOrganizations(ids) {
    return this.request('DELETE', '/bulk', { ids });
  }

  /**
   * Get organization users
   */
  async getOrganizationUsers(organizationId, params = {}) {
    return this.request('GET', `/${organizationId}/users`, { params });
  }

  /**
   * Add user to organization
   */
  async addUserToOrganization(organizationId, userId, role = 'member') {
    return this.request('POST', `/${organizationId}/users`, {
      user_id: userId,
      role
    });
  }

  /**
   * Remove user from organization
   */
  async removeUserFromOrganization(organizationId, userId) {
    return this.request('DELETE', `/${organizationId}/users/${userId}`);
  }

  /**
   * Get organization roles
   */
  async getOrganizationRoles(organizationId) {
    return this.request('GET', `/${organizationId}/roles`);
  }

  /**
   * Create organization role
   */
  async createOrganizationRole(organizationId, roleData) {
    return this.request('POST', `/${organizationId}/roles`, roleData);
  }

  /**
   * Update organization role
   */
  async updateOrganizationRole(organizationId, roleId, roleData) {
    return this.request('PUT', `/${organizationId}/roles/${roleId}`, roleData);
  }

  /**
   * Delete organization role
   */
  async deleteOrganizationRole(organizationId, roleId) {
    return this.request('DELETE', `/${organizationId}/roles/${roleId}`);
  }

  /**
   * Get organization settings
   */
  async getOrganizationSettings(organizationId) {
    return this.request('GET', `/${organizationId}/settings`);
  }

  /**
   * Update organization settings
   */
  async updateOrganizationSettings(organizationId, settings) {
    return this.request('PUT', `/${organizationId}/settings`, settings);
  }

  /**
   * Get organization statistics
   */
  async getOrganizationStats(organizationId) {
    return this.request('GET', `/${organizationId}/stats`);
  }

  /**
   * Get organization activity
   */
  async getOrganizationActivity(organizationId, params = {}) {
    return this.request('GET', `/${organizationId}/activity`, { params });
  }

  /**
   * Invite user to organization
   */
  async inviteUserToOrganization(organizationId, email, role = 'member') {
    return this.request('POST', `/${organizationId}/invitations`, {
      email,
      role
    });
  }

  /**
   * Get organization invitations
   */
  async getOrganizationInvitations(organizationId) {
    return this.request('GET', `/${organizationId}/invitations`);
  }

  /**
   * Cancel organization invitation
   */
  async cancelOrganizationInvitation(organizationId, invitationId) {
    return this.request('DELETE', `/${organizationId}/invitations/${invitationId}`);
  }

  /**
   * Validate organization data
   */
  validateOrganizationData(data, isUpdate = false) {
    const errors = {};

    // Required fields
    if (!isUpdate || data.name !== undefined) {
      if (!data.name || data.name.trim().length < 2) {
        errors.name = 'Organization name must be at least 2 characters long';
      }
    }

    if (!isUpdate || data.slug !== undefined) {
      if (!data.slug) {
        errors.slug = 'Organization slug is required';
      } else if (!/^[a-z0-9-]+$/.test(data.slug)) {
        errors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens';
      }
    }

    // Optional validations
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (data.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(data.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }

    if (data.website && !/^https?:\/\/.+/.test(data.website)) {
      errors.website = 'Please enter a valid website URL';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Format organization data for API
   */
  formatOrganizationData(data) {
    const formatted = { ...data };

    // Remove empty strings and null values
    Object.keys(formatted).forEach(key => {
      if (formatted[key] === '' || formatted[key] === null || formatted[key] === undefined) {
        delete formatted[key];
      }
    });

    // Format specific fields
    if (formatted.name) {
      formatted.name = formatted.name.trim();
    }

    if (formatted.slug) {
      formatted.slug = formatted.slug.toLowerCase().trim();
    }

    if (formatted.email) {
      formatted.email = formatted.email.toLowerCase().trim();
    }

    if (formatted.website && !formatted.website.startsWith('http')) {
      formatted.website = `https://${formatted.website}`;
    }

    return formatted;
  }

  /**
   * Get organization export data
   */
  async exportOrganizations(format = 'json', filters = {}) {
    const params = { ...filters, format };
    return this.request('GET', '/export', { params });
  }

  /**
   * Import organizations
   */
  async importOrganizations(file, options = {}) {
    const formData = new FormData();
    formData.append('file', file);

    Object.keys(options).forEach(key => {
      formData.append(key, options[key]);
    });

    return this.request('POST', '/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
}

// Create and export singleton instance
export const organizationService = new OrganizationService();
export default OrganizationService;
