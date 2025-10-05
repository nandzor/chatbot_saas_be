/**
 * Google Drive Service
 * Service untuk mengelola Google Drive API dengan backend yang baru
 */

import api from './api';

class GoogleDriveService {
  constructor() {
    this.baseUrl = '/drive';
    this.oauthBaseUrl = '/auth/google-drive'; // Use Google Drive integration endpoint
  }

  /**
   * Generate Google OAuth authorization URL untuk Google Drive integration
   */
  async generateAuthUrl(organizationId, userId, redirectUrl = 'http://localhost:3001/oauth/callback') {
    try {
      const response = await api.get(`${this.oauthBaseUrl}/redirect`, {
        params: {
          organization_id: organizationId,
          user_id: userId, // Add user_id for Google Drive integration
          redirect_url: redirectUrl
        }
      });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return this.handleError(error, 'Failed to generate Google OAuth URL');
    }
  }

  /**
   * Get OAuth status
   */
  async getOAuthStatus() {
    try {
      const response = await api.get(`${this.baseUrl}/status`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return this.handleError(error, 'Failed to get OAuth status');
    }
  }

  /**
   * Revoke OAuth credential untuk Google Drive integration
   */
  async revokeOAuthCredential() {
    try {
      const response = await api.post('/oauth/google-drive/revoke');
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return this.handleError(error, 'Failed to revoke OAuth credential');
    }
  }

  /**
   * Get files from Google Drive
   */
  async getFiles(pageSize = 10, pageToken = null) {
    try {
      const params = { page_size: pageSize };
      if (pageToken) {
        params.page_token = pageToken;
      }

      const response = await api.get(`${this.baseUrl}/files`, { params });
      return {
        success: true,
        files: response.data.data.files || [],
        nextPageToken: response.data.data.nextPageToken || null
      };
    } catch (error) {
      return this.handleError(error, 'Failed to get files');
    }
  }

  /**
   * Get file details by ID
   */
  async getFileDetails(fileId) {
    try {
      const response = await api.get(`${this.baseUrl}/files/${fileId}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return this.handleError(error, 'Failed to get file details');
    }
  }

  /**
   * Create a new file in Google Drive
   */
  async createFile(fileName, content, mimeType = 'text/plain') {
    try {
      const response = await api.post(`${this.baseUrl}/files`, {
        file_name: fileName,
        content: content,
        mime_type: mimeType
      });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return this.handleError(error, 'Failed to create file');
    }
  }

  /**
   * Update file content
   */
  async updateFile(fileId, content, mimeType = 'text/plain') {
    try {
      const response = await api.put(`${this.baseUrl}/files/${fileId}`, {
        content: content,
        mime_type: mimeType
      });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return this.handleError(error, 'Failed to update file');
    }
  }

  /**
   * Delete file from Google Drive
   */
  async deleteFile(fileId) {
    try {
      const response = await api.delete(`${this.baseUrl}/files/${fileId}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return this.handleError(error, 'Failed to delete file');
    }
  }

  /**
   * Download file content
   */
  async downloadFile(fileId) {
    try {
      const response = await api.get(`${this.baseUrl}/files/${fileId}/download`, {
        responseType: 'blob'
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return this.handleError(error, 'Failed to download file');
    }
  }

  /**
   * Search files by name
   */
  async searchFiles(query, pageSize = 10) {
    try {
      const response = await api.get(`${this.baseUrl}/search`, {
        params: {
          query: query,
          page_size: pageSize
        }
      });
      return {
        success: true,
        files: response.data.data.files || [],
        nextPageToken: response.data.data.nextPageToken || null
      };
    } catch (error) {
      return this.handleError(error, 'Failed to search files');
    }
  }

  /**
   * Get user's drive storage info
   */
  async getStorageInfo() {
    try {
      const response = await api.get(`${this.baseUrl}/storage`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return this.handleError(error, 'Failed to get storage info');
    }
  }

  /**
   * Copy file
   */
  async copyFile(fileId, newName = null) {
    try {
      const response = await api.post(`${this.baseUrl}/files/${fileId}/copy`, {
        name: newName
      });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return this.handleError(error, 'Failed to copy file');
    }
  }

  /**
   * Export file to different format
   */
  async exportFile(fileId, mimeType) {
    try {
      const response = await api.get(`${this.baseUrl}/files/${fileId}/export`, {
        params: { mime_type: mimeType },
        responseType: 'blob'
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return this.handleError(error, 'Failed to export file');
    }
  }

  /**
   * Generate file IDs
   */
  async generateFileIds(count = 1) {
    try {
      const response = await api.get(`${this.baseUrl}/files/generateIds`, {
        params: { count: count }
      });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return this.handleError(error, 'Failed to generate file IDs');
    }
  }

  /**
   * Empty trash
   */
  async emptyTrash() {
    try {
      const response = await api.delete(`${this.baseUrl}/files/trash`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return this.handleError(error, 'Failed to empty trash');
    }
  }

  /**
   * Get file permissions
   */
  async getFilePermissions(fileId) {
    try {
      const response = await api.get(`${this.baseUrl}/files/${fileId}/permissions`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return this.handleError(error, 'Failed to get file permissions');
    }
  }

  /**
   * Create file permission
   */
  async createFilePermission(fileId, permission) {
    try {
      const response = await api.post(`${this.baseUrl}/files/${fileId}/permissions`, permission);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return this.handleError(error, 'Failed to create file permission');
    }
  }

  /**
   * Update file permission
   */
  async updateFilePermission(fileId, permissionId, permission) {
    try {
      const response = await api.put(`${this.baseUrl}/files/${fileId}/permissions/${permissionId}`, permission);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return this.handleError(error, 'Failed to update file permission');
    }
  }

  /**
   * Delete file permission
   */
  async deleteFilePermission(fileId, permissionId) {
    try {
      const response = await api.delete(`${this.baseUrl}/files/${fileId}/permissions/${permissionId}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return this.handleError(error, 'Failed to delete file permission');
    }
  }

  /**
   * Get file comments
   */
  async getFileComments(fileId) {
    try {
      const response = await api.get(`${this.baseUrl}/files/${fileId}/comments`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return this.handleError(error, 'Failed to get file comments');
    }
  }

  /**
   * Create file comment
   */
  async createFileComment(fileId, comment) {
    try {
      const response = await api.post(`${this.baseUrl}/files/${fileId}/comments`, comment);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return this.handleError(error, 'Failed to create file comment');
    }
  }

  /**
   * Get file revisions
   */
  async getFileRevisions(fileId) {
    try {
      const response = await api.get(`${this.baseUrl}/files/${fileId}/revisions`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return this.handleError(error, 'Failed to get file revisions');
    }
  }

  /**
   * Get shared drives
   */
  async getSharedDrives() {
    try {
      const response = await api.get(`${this.baseUrl}/drives`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return this.handleError(error, 'Failed to get shared drives');
    }
  }

  /**
   * Create shared drive
   */
  async createSharedDrive(name, description = '') {
    try {
      const response = await api.post(`${this.baseUrl}/drives`, {
        name: name,
        description: description
      });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return this.handleError(error, 'Failed to create shared drive');
    }
  }

  /**
   * Error handler
   */
  handleError(error, defaultMessage) {
    console.error('Google Drive Service Error:', error);

    let message = defaultMessage;
    let statusCode = 500;

    if (error.response) {
      statusCode = error.response.status;
      const errorData = error.response.data;

      if (errorData?.message) {
        message = errorData.message;
      } else if (errorData?.error) {
        message = errorData.error;
      } else if (typeof errorData === 'string') {
        message = errorData;
      }

      // Handle specific error cases
      if (statusCode === 401) {
        message = 'Authentication failed. Please reconnect your Google Drive account.';
      } else if (statusCode === 403) {
        message = 'Access denied. Please check your Google Drive permissions.';
      } else if (statusCode === 404) {
        message = 'File or resource not found.';
      } else if (statusCode === 429) {
        message = 'Rate limit exceeded. Please try again later.';
      }
    } else if (error.request) {
      message = 'Network error. Please check your connection.';
    } else {
      message = error.message || defaultMessage;
    }

    return {
      success: false,
      error: message,
      statusCode,
      details: error.response?.data || null
    };
  }
}

export const googleDriveService = new GoogleDriveService();
export default googleDriveService;
