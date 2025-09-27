/**
 * Hooks Index
 * Centralized export untuk semua custom hooks
 */

// API Hooks
export * from './useApi';

// Authentication Hooks
export * from './useAuth';

// Management Hooks
export * from './useClientManagement';
export * from './useClientAnalytics';
export * from './useClientSettings';
export * from './useOrganizationManagement';
export * from './useOrganizationAnalytics';
export * from './useOrganizationSettings';
export * from './useOrganizationUsers';
export * from './useUserManagement';
export * from './usePermissionManagement';
export * from './usePermissionCheck';
export * from './usePermissions';

// Utility Hooks
export * from './usePagination';
export * from './useNavigation';
export * from './useSessionManager';
export * from './useTransactionHistory';

// Re-export default hooks
export { useApi } from './useApi';
export { useAuth } from './useAuth';
export { useClientManagement } from './useClientManagement';
export { useOrganizationManagement } from './useOrganizationManagement';
export { useUserManagement } from './useUserManagement';
export { usePermissionManagement } from './usePermissionManagement';
