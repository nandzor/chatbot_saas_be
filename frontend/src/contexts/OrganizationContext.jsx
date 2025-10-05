/**
 * Organization Context
 * Context untuk mengelola data organization yang sedang aktif
 */

import { createContext, useContext, useState, useEffect } from 'react';

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

  // Load organization data from localStorage or API
  useEffect(() => {
    const loadOrganization = async () => {
      try {
        // Try to get from localStorage first
        const savedOrg = localStorage.getItem('currentOrganization');
        if (savedOrg) {
          const orgData = JSON.parse(savedOrg);
          setOrganization(orgData);
        } else {
          // Fallback to default organization for development
          const defaultOrg = {
            id: '6a9f9f22-ef84-4375-a793-dd1af45ccdc0',
            name: 'Test Organization',
            email: 'admin@test.com',
            status: 'active'
          };
          setOrganization(defaultOrg);
          localStorage.setItem('currentOrganization', JSON.stringify(defaultOrg));
        }
      } catch (error) {
        console.error('Failed to load organization:', error);
        // Fallback to default organization
        const defaultOrg = {
          id: '6a9f9f22-ef84-4375-a793-dd1af45ccdc0',
          name: 'Test Organization',
          email: 'admin@test.com',
          status: 'active'
        };
        setOrganization(defaultOrg);
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
