/**
 * Pages Index
 * Centralized export untuk semua pages
 */

// Auth Pages
export { default as Login } from './auth/Login';
export { default as Register } from './auth/Register';
export { default as ForgotPassword } from './auth/ForgotPassword';
export { default as ResetPassword } from './auth/ResetPassword';
export { default as SuperAdminLogin } from './auth/SuperAdminLogin';

// Dashboard Pages
export { default as Dashboard } from './dashboard/Dashboard';
export { default as Inbox } from './inbox/Inbox';
export { default as Analytics } from './analytics/Analytics';
export { default as Knowledge } from './knowledge/Knowledge';
export { default as Automations } from './automations/Automations';
export { default as Settings } from './settings/Settings';

// Management Pages
export { default as RoleList } from './roles/RoleList';
export { default as PermissionList } from './permissions/PermissionList';

// Error Pages
export { default as Unauthorized } from './errors/Unauthorized';
export { default as ServerError } from './errors/ServerError';
