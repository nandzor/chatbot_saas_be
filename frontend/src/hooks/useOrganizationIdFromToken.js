/**
 * Hook untuk mendapatkan organizationId dari API atau JWT token
 * Tidak memerlukan OrganizationProvider
 */

import { useState, useEffect } from 'react';
import { api } from '@/api';

export const useOrganizationIdFromToken = () => {
  const [organizationId, setOrganizationId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getOrganizationId = async () => {
      try {
        setLoading(true);

        // Check if user is authenticated
        const token = localStorage.getItem('jwt_token') || localStorage.getItem('token') || sessionStorage.getItem('token');

        if (!token) {
          setOrganizationId(null);
          setLoading(false);
          return;
        }

        // Priority 1: Try to get from JWT token first (fastest)
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const orgId = payload.organization_id;

          if (orgId) {
            setOrganizationId(orgId);
            setLoading(false);
            return;
          }
        } catch (jwtError) {
          // Silent fail for JWT decode
        }

        // If JWT token doesn't have organization_id, set to null
        setOrganizationId(null);
      } catch (error) {
        setOrganizationId(null);
      } finally {
        setLoading(false);
      }
    };

    getOrganizationId();
  }, []);

  return { organizationId, loading };
};

export default useOrganizationIdFromToken;
