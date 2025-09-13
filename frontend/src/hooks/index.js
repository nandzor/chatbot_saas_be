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
export * from './useOrganizationPermissions';
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
export { default as useApi } from './useApi';
export { default as useAuth } from './useAuth';
export { default as useClientManagement } from './useClientManagement';
export { default as useOrganizationManagement } from './useOrganizationManagement';
export { default as useUserManagement } from './useUserManagement';
export { default as usePermissionManagement } from './usePermissionManagement';
