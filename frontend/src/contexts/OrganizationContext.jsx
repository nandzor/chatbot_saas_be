/**
 * Organization Context
 * Context untuk mengelola data organization yang sedang aktif
 */

import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/api';

const OrganizationContext = createContext();

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
};

export const OrganizationProvider = ({ children }) => {
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load organization data from API
  useEffect(() => {
    const loadOrganization = async () => {
      try {
        setLoading(true);

        // Check if user is authenticated
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) {
          setOrganization(null);
          setLoading(false);
          return;
        }

        // Try to get from localStorage first (cached data)
        const savedOrg = localStorage.getItem('currentOrganization');
        if (savedOrg) {
          const orgData = JSON.parse(savedOrg);
          setOrganization(orgData);
          setLoading(false);
        }

        // Always fetch fresh data from API
        try {
          const response = await api.get('/auth/me');
          if (response.data.success && response.data.data.organization) {
            const orgData = response.data.data.organization;
            const organizationInfo = {
              id: orgData.id,
              name: orgData.name,
              org_code: orgData.org_code,
              display_name: orgData.display_name,
              subscription_status: orgData.subscription_status,
              timezone: orgData.timezone,
              locale: orgData.locale,
              currency: orgData.currency
            };

            setOrganization(organizationInfo);
            localStorage.setItem('currentOrganization', JSON.stringify(organizationInfo));
          }
        } catch (apiError) {
          console.warn('Failed to fetch organization from API:', apiError);
          // Keep using cached data if API fails
          if (!savedOrg) {
            setOrganization(null);
          }
        }
      } catch (error) {
        console.error('Failed to load organization:', error);
        setOrganization(null);
      } finally {
        setLoading(false);
      }
    };

    loadOrganization();
  }, []);

  const updateOrganization = (newOrg) => {
    setOrganization(newOrg);
    localStorage.setItem('currentOrganization', JSON.stringify(newOrg));
  };

  const clearOrganization = () => {
    setOrganization(null);
    localStorage.removeItem('currentOrganization');
  };

  const value = {
    organization,
    organizationId: organization?.id,
    updateOrganization,
    clearOrganization,
    loading
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
};

export default OrganizationContext;
