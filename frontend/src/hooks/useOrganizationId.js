/**
 * Hook untuk mendapatkan organizationId dari JWT token
 * Fallback ketika OrganizationProvider tidak tersedia
 */

import { useState, useEffect } from 'react';

export const useOrganizationId = () => {
  const [organizationId, setOrganizationId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getOrganizationIdFromToken = () => {
      try {
        // Coba ambil dari localStorage terlebih dahulu
        const savedOrg = localStorage.getItem('currentOrganization');
        if (savedOrg) {
          const orgData = JSON.parse(savedOrg);
          setOrganizationId(orgData.id);
          setLoading(false);
          return;
        }

        // Fallback: ambil dari JWT token
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (token) {
          try {
            // Decode JWT token (base64 decode payload)
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.organization_id) {
              setOrganizationId(payload.organization_id);
              setLoading(false);
              return;
            }
          } catch (error) {
            // Silent fail for JWT decode
          }
        }

        // Final fallback: gunakan default organization untuk development
        const defaultOrgId = '6a9f9f22-ef84-4375-a793-dd1af45ccdc0';
        setOrganizationId(defaultOrgId);
        setLoading(false);
      } catch (error) {
        // Fallback ke default organization
        setOrganizationId('6a9f9f22-ef84-4375-a793-dd1af45ccdc0');
        setLoading(false);
      }
    };

    getOrganizationIdFromToken();
  }, []);

  return { organizationId, loading };
};

export default useOrganizationId;
