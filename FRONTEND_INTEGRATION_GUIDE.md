# Frontend Integration Guide - Organization Management

## Overview
This guide provides comprehensive instructions for integrating the Organization Management API with your frontend application. The API follows RESTful conventions and includes authentication, real-time updates, and comprehensive error handling.

## Base Configuration

### API Base URL
```javascript
const API_BASE_URL = 'https://your-domain.com/api/v1';
```

### Authentication Setup
```javascript
// Set up axios interceptor for authentication
import axios from 'axios';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

## Organization Management Service

### Service Class
```javascript
class OrganizationManagementService {
  constructor(apiClient) {
    this.api = apiClient;
  }

  // Get organization settings
  async getOrganizationSettings(organizationId) {
    try {
      const response = await this.api.get(`/organizations/${organizationId}/settings`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load settings'
      };
    }
  }

  // Save organization settings
  async saveOrganizationSettings(organizationId, settings) {
    try {
      const response = await this.api.put(`/organizations/${organizationId}/settings`, settings);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to save settings',
        validationErrors: error.response?.data?.errors
      };
    }
  }

  // Get organization analytics
  async getOrganizationAnalytics(organizationId, params = {}) {
    try {
      const response = await this.api.get(`/organizations/${organizationId}/analytics`, { params });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load analytics'
      };
    }
  }

  // Get organization users
  async getOrganizationUsers(organizationId, params = {}) {
    try {
      const response = await this.api.get(`/organizations/${organizationId}/users`, { params });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load users'
      };
    }
  }

  // Get organization roles
  async getOrganizationRoles(organizationId) {
    try {
      const response = await this.api.get(`/organizations/${organizationId}/roles`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load roles'
      };
    }
  }

  // Save role permissions
  async saveRolePermissions(organizationId, roleId, permissions) {
    try {
      const response = await this.api.put(`/organizations/${organizationId}/roles/${roleId}/permissions`, {
        permissions
      });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to save permissions'
      };
    }
  }

  // Test webhook
  async testWebhook(organizationId, webhookUrl) {
    try {
      const response = await this.api.post(`/organizations/${organizationId}/webhook/test`, {
        webhookUrl
      });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to test webhook'
      };
    }
  }

  // Get audit logs
  async getAuditLogs(organizationId, params = {}) {
    try {
      const response = await this.api.get(`/organizations/${organizationId}/audit-logs`, { params });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load audit logs'
      };
    }
  }

  // Get audit log statistics
  async getAuditLogStatistics(organizationId, params = {}) {
    try {
      const response = await this.api.get(`/organizations/${organizationId}/audit-logs/statistics`, { params });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load audit statistics'
      };
    }
  }

  // Get notifications
  async getNotifications(organizationId, params = {}) {
    try {
      const response = await this.api.get(`/organizations/${organizationId}/notifications`, { params });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load notifications'
      };
    }
  }

  // Send notification
  async sendNotification(organizationId, notificationData) {
    try {
      const response = await this.api.post(`/organizations/${organizationId}/notifications`, notificationData);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to send notification'
      };
    }
  }

  // Mark notification as read
  async markNotificationAsRead(organizationId, notificationId) {
    try {
      const response = await this.api.patch(`/organizations/${organizationId}/notifications/${notificationId}/read`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to mark notification as read'
      };
    }
  }

  // Mark all notifications as read
  async markAllNotificationsAsRead(organizationId) {
    try {
      const response = await this.api.patch(`/organizations/${organizationId}/notifications/read-all`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to mark all notifications as read'
      };
    }
  }

  // Delete notification
  async deleteNotification(organizationId, notificationId) {
    try {
      const response = await this.api.delete(`/organizations/${organizationId}/notifications/${notificationId}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete notification'
      };
    }
  }

  // Superadmin: Login as admin
  async loginAsAdmin(organizationId, organizationName) {
    try {
      const response = await this.api.post('/superadmin/login-as-admin', {
        organization_id: organizationId,
        organization_name: organizationName
      });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to login as admin'
      };
    }
  }

  // Superadmin: Force password reset
  async forcePasswordReset(organizationId, email, organizationName) {
    try {
      const response = await this.api.post('/superadmin/force-password-reset', {
        organization_id: organizationId,
        email: email,
        organization_name: organizationName
      });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to send password reset'
      };
    }
  }
}

// Export service instance
export const organizationService = new OrganizationManagementService(api);
```

## React Hooks Integration

### useOrganizationSettings Hook
```javascript
import { useState, useEffect, useCallback } from 'react';
import { organizationService } from '../services/OrganizationManagementService';

export const useOrganizationSettings = (organizationId) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadSettings = useCallback(async () => {
    if (!organizationId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await organizationService.getOrganizationSettings(organizationId);
      
      if (result.success) {
        setSettings(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  const saveSettings = useCallback(async (newSettings) => {
    if (!organizationId) return;

    setSaving(true);
    setError(null);

    try {
      const result = await organizationService.saveOrganizationSettings(organizationId, newSettings);
      
      if (result.success) {
        setSettings(result.data);
        return { success: true };
      } else {
        setError(result.error);
        return { 
          success: false, 
          error: result.error,
          validationErrors: result.validationErrors 
        };
      }
    } catch (err) {
      setError('Failed to save settings');
      return { success: false, error: 'Failed to save settings' };
    } finally {
      setSaving(false);
    }
  }, [organizationId]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    settings,
    loading,
    error,
    saving,
    loadSettings,
    saveSettings
  };
};
```

### useOrganizationAnalytics Hook
```javascript
import { useState, useEffect, useCallback } from 'react';
import { organizationService } from '../services/OrganizationManagementService';

export const useOrganizationAnalytics = (organizationId) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadAnalytics = useCallback(async (params = {}) => {
    if (!organizationId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await organizationService.getOrganizationAnalytics(organizationId, params);
      
      if (result.success) {
        setAnalytics(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  return {
    analytics,
    loading,
    error,
    loadAnalytics
  };
};
```

### useOrganizationAuditLogs Hook
```javascript
import { useState, useEffect, useCallback } from 'react';
import { organizationService } from '../services/OrganizationManagementService';

export const useOrganizationAuditLogs = (organizationId) => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0
  });

  const loadAuditLogs = useCallback(async (params = {}) => {
    if (!organizationId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await organizationService.getAuditLogs(organizationId, params);
      
      if (result.success) {
        setAuditLogs(result.data);
        // Update pagination if available
        if (result.data.current_page) {
          setPagination({
            current_page: result.data.current_page,
            last_page: result.data.last_page,
            per_page: result.data.per_page,
            total: result.data.total
          });
        }
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  const loadStatistics = useCallback(async (params = {}) => {
    if (!organizationId) return;

    try {
      const result = await organizationService.getAuditLogStatistics(organizationId, params);
      
      if (result.success) {
        setStatistics(result.data);
      }
    } catch (err) {
      console.error('Failed to load audit statistics:', err);
    }
  }, [organizationId]);

  useEffect(() => {
    loadAuditLogs();
    loadStatistics();
  }, [loadAuditLogs, loadStatistics]);

  return {
    auditLogs,
    statistics,
    loading,
    error,
    pagination,
    loadAuditLogs,
    loadStatistics
  };
};
```

## Real-time Updates with WebSocket

### WebSocket Connection Setup
```javascript
import { useEffect, useRef } from 'react';

export const useOrganizationWebSocket = (organizationId, onMessage) => {
  const wsRef = useRef(null);

  useEffect(() => {
    if (!organizationId) return;

    const token = localStorage.getItem('auth_token');
    const wsUrl = `wss://your-domain.com/ws/organization/${organizationId}?token=${token}`;

    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log('WebSocket connected');
    };

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessage(data);
    };

    wsRef.current.onclose = () => {
      console.log('WebSocket disconnected');
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [organizationId, onMessage]);

  const sendMessage = (message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  };

  return { sendMessage };
};
```

### Real-time Organization Updates
```javascript
import { useOrganizationWebSocket } from './useOrganizationWebSocket';

export const useRealTimeOrganizationUpdates = (organizationId, onUpdate) => {
  const handleMessage = (data) => {
    if (data.type === 'organization.activity') {
      onUpdate(data);
    }
  };

  useOrganizationWebSocket(organizationId, handleMessage);
};
```

## Error Handling

### Global Error Handler
```javascript
import { toast } from 'react-hot-toast';

export const handleApiError = (error, defaultMessage = 'An error occurred') => {
  if (error.response?.data?.message) {
    toast.error(error.response.data.message);
  } else if (error.response?.data?.errors) {
    // Handle validation errors
    const errors = error.response.data.errors;
    Object.values(errors).forEach(errorArray => {
      errorArray.forEach(errorMessage => {
        toast.error(errorMessage);
      });
    });
  } else {
    toast.error(defaultMessage);
  }
};
```

### Form Validation Helper
```javascript
export const getValidationErrors = (error) => {
  if (error.response?.data?.errors) {
    return error.response.data.errors;
  }
  return {};
};

export const hasValidationError = (field, errors) => {
  return errors[field] && errors[field].length > 0;
};

export const getValidationErrorMessage = (field, errors) => {
  return errors[field] ? errors[field][0] : '';
};
```

## Example React Component

### OrganizationSettings Component
```javascript
import React, { useState } from 'react';
import { useOrganizationSettings } from '../hooks/useOrganizationSettings';
import { handleApiError } from '../utils/errorHandler';

export const OrganizationSettings = ({ organizationId }) => {
  const { settings, loading, error, saving, saveSettings } = useOrganizationSettings(organizationId);
  const [formData, setFormData] = useState({});
  const [validationErrors, setValidationErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const result = await saveSettings(formData);
    
    if (result.success) {
      toast.success('Settings saved successfully');
      setValidationErrors({});
    } else {
      if (result.validationErrors) {
        setValidationErrors(result.validationErrors);
      } else {
        handleApiError(result.error);
      }
    }
  };

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  if (loading) {
    return <div>Loading settings...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Organization Name</label>
        <input
          type="text"
          value={formData.name || settings?.general?.name || ''}
          onChange={(e) => handleFieldChange('general.name', e.target.value)}
          className={validationErrors['general.name'] ? 'error' : ''}
        />
        {validationErrors['general.name'] && (
          <span className="error-message">{validationErrors['general.name'][0]}</span>
        )}
      </div>

      <div>
        <label>Email</label>
        <input
          type="email"
          value={formData.email || settings?.general?.email || ''}
          onChange={(e) => handleFieldChange('general.email', e.target.value)}
          className={validationErrors['general.email'] ? 'error' : ''}
        />
        {validationErrors['general.email'] && (
          <span className="error-message">{validationErrors['general.email'][0]}</span>
        )}
      </div>

      <button type="submit" disabled={saving}>
        {saving ? 'Saving...' : 'Save Settings'}
      </button>
    </form>
  );
};
```

## Testing

### Mock Service for Testing
```javascript
export const mockOrganizationService = {
  getOrganizationSettings: jest.fn(),
  saveOrganizationSettings: jest.fn(),
  getOrganizationAnalytics: jest.fn(),
  getOrganizationUsers: jest.fn(),
  getOrganizationRoles: jest.fn(),
  saveRolePermissions: jest.fn(),
  testWebhook: jest.fn(),
  getAuditLogs: jest.fn(),
  getAuditLogStatistics: jest.fn(),
  getNotifications: jest.fn(),
  sendNotification: jest.fn(),
  markNotificationAsRead: jest.fn(),
  markAllNotificationsAsRead: jest.fn(),
  deleteNotification: jest.fn(),
  loginAsAdmin: jest.fn(),
  forcePasswordReset: jest.fn(),
};
```

### Test Example
```javascript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OrganizationSettings } from '../OrganizationSettings';
import { mockOrganizationService } from '../__mocks__/OrganizationManagementService';

jest.mock('../services/OrganizationManagementService', () => ({
  organizationService: mockOrganizationService
}));

describe('OrganizationSettings', () => {
  beforeEach(() => {
    mockOrganizationService.getOrganizationSettings.mockResolvedValue({
      success: true,
      data: {
        general: {
          name: 'Test Organization',
          email: 'test@example.com'
        }
      }
    });
  });

  it('should load and display organization settings', async () => {
    render(<OrganizationSettings organizationId="1" />);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Organization')).toBeInTheDocument();
      expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
    });
  });

  it('should save settings successfully', async () => {
    mockOrganizationService.saveOrganizationSettings.mockResolvedValue({
      success: true,
      data: { general: { name: 'Updated Organization' } }
    });

    render(<OrganizationSettings organizationId="1" />);
    
    await waitFor(() => {
      const nameInput = screen.getByDisplayValue('Test Organization');
      fireEvent.change(nameInput, { target: { value: 'Updated Organization' } });
    });

    const saveButton = screen.getByText('Save Settings');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOrganizationService.saveOrganizationSettings).toHaveBeenCalledWith(
        '1',
        { 'general.name': 'Updated Organization' }
      );
    });
  });
});
```

## Best Practices

1. **Error Handling**: Always handle API errors gracefully and provide user feedback
2. **Loading States**: Show loading indicators during API calls
3. **Validation**: Implement client-side validation with server-side validation fallback
4. **Caching**: Cache API responses when appropriate to improve performance
5. **Real-time Updates**: Use WebSocket connections for real-time data updates
6. **Security**: Never expose sensitive data in client-side code
7. **Testing**: Write comprehensive tests for all API integrations
8. **Documentation**: Keep API documentation up to date with any changes

This integration guide provides a complete foundation for integrating the Organization Management API with your frontend application.
