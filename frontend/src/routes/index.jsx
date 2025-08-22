import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layout Components
import RootLayout from '@/layouts/RootLayout';
import AuthLayout from '@/layouts/AuthLayout';
import DashboardLayout from '@/layouts/DashboardLayout';
import SuperAdminLayout from '@/layouts/SuperAdminLayout';
import AgentLayout from '@/layouts/AgentLayout';

// Auth Pages
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import ResetPassword from '@/pages/auth/ResetPassword';

// Dashboard Pages
import Dashboard from '@/pages/dashboard/Dashboard';
import Inbox from '@/pages/inbox/Inbox';
import Analytics from '@/pages/analytics/Analytics';
import Knowledge from '@/pages/knowledge/Knowledge';
import Automations from '@/pages/automations/Automations';
import Settings from '@/pages/settings/Settings';
import ProfileSettings from '@/features/shared/ProfileSettings';

// Super Admin Pages
import SuperAdminDashboard from '@/pages/superadmin/Dashboard';
import Financials from '@/pages/superadmin/Financials';
import ClientManagement from '@/pages/superadmin/ClientManagement';
import SystemSettings from '@/pages/superadmin/SystemSettings';

// Agent Pages
import AgentDashboard from '@/features/agent/AgentDashboard';
import AgentInbox from '@/features/agent/AgentInbox';
import AgentProfile from '@/features/agent/AgentProfile';

// UI Components Demo
import BadgeDemo from '@/components/ui/BadgeDemo';

// Client Success & Management
import ClientHealthDashboard from '@/features/superadmin/ClientHealthDashboard';
import OnboardingPipeline from '@/features/superadmin/OnboardingPipeline';
import AutomationPlaybooks from '@/features/superadmin/AutomationPlaybooks';
import ClientCommunicationCenter from '@/features/superadmin/ClientCommunicationCenter';

// Platform Engineering & DevOps
import PlatformConfiguration from '@/features/platform/PlatformConfiguration';
import ServiceInfrastructureHealth from '@/features/platform/ServiceInfrastructureHealth';
import SecurityCompliance from '@/features/platform/SecurityCompliance';

// Client Layout and Components
import ClientLayout from '@/layouts/ClientLayout';
import ClientOverview from '@/features/client/ClientOverview';
import ClientCommunication from '@/features/client/ClientCommunication';
import ClientUsers from '@/features/client/ClientUsers';
import ClientBilling from '@/features/client/ClientBilling';
import ClientWorkflows from '@/features/client/ClientWorkflows';
import ClientNotes from '@/features/client/ClientNotes';
import ClientSuccessPlays from '@/features/client/ClientSuccessPlays';

// Error Pages
import NotFound from '@/pages/errors/NotFound';
import Unauthorized from '@/pages/errors/Unauthorized';
import ServerError from '@/pages/errors/ServerError';

// Protected Route Components
import ProtectedRoute from '@/features/auth/ProtectedRoute';
import RoleBasedRoute from '@/features/auth/RoleBasedRoute';
import RoleBasedRedirect from '@/features/auth/RoleBasedRedirect';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <NotFound />,
    children: [
      // Auth Routes
      {
        path: '/auth',
        element: <AuthLayout />,
        children: [
          { index: true, element: <Navigate to="/auth/login" replace /> },
          { path: 'login', element: <Login /> },
          { path: 'register', element: <Register /> },
          { path: 'forgot-password', element: <ForgotPassword /> },
          { path: 'reset-password', element: <ResetPassword /> },
        ],
      },

      // Dashboard Routes (Organization Admin/Manager)
      {
        path: '/dashboard',
        element: (
          <RoleBasedRoute requiredRole="organization_admin">
            <DashboardLayout />
          </RoleBasedRoute>
        ),
        children: [
          { index: true, element: <Dashboard /> },
          { 
            path: 'inbox', 
            element: (
              <RoleBasedRoute requiredPermission="handle_chats">
                <Inbox />
              </RoleBasedRoute>
            ) 
          },
          { 
            path: 'analytics', 
            element: (
              <RoleBasedRoute requiredPermission="view_analytics">
                <Analytics />
              </RoleBasedRoute>
            ) 
          },
          { path: 'knowledge', element: <Knowledge /> },
          { 
            path: 'automations', 
            element: (
              <RoleBasedRoute requiredPermission="manage_settings">
                <Automations />
              </RoleBasedRoute>
            ) 
          },
          { 
            path: 'settings', 
            element: (
              <RoleBasedRoute requiredPermission="manage_settings">
                <Settings />
              </RoleBasedRoute>
            ) 
          },
          { 
            path: 'profile', 
            element: <ProfileSettings />
          },
        ],
      },

      // Super Admin Routes
      {
        path: '/superadmin',
        element: (
          <RoleBasedRoute requiredRole="superadmin">
            <SuperAdminLayout />
          </RoleBasedRoute>
        ),
        children: [
          { index: true, element: <SuperAdminDashboard /> },
          { path: 'financials', element: <Financials /> },
          { path: 'clients', element: <ClientManagement /> },
          { path: 'system', element: <SystemSettings /> },
          
          // Client Success & Management Routes
          { path: 'client-health', element: <ClientHealthDashboard /> },
          { path: 'onboarding', element: <OnboardingPipeline /> },
          { path: 'automation', element: <AutomationPlaybooks /> },
          { path: 'communication', element: <ClientCommunicationCenter /> },
          
          // Platform Engineering & DevOps Routes
          { path: 'platform/configuration', element: <PlatformConfiguration /> },
          { path: 'platform/health', element: <ServiceInfrastructureHealth /> },
          { path: 'platform/security', element: <SecurityCompliance /> },
          
          // Nested Client Routes - Inside SuperAdmin Layout
          { path: 'clients/:clientId', element: <ClientLayout /> },
          { path: 'clients/:clientId/users', element: <ClientLayout /> },
          { path: 'clients/:clientId/billing', element: <ClientLayout /> },
          { path: 'clients/:clientId/workflows', element: <ClientLayout /> },
          { path: 'clients/:clientId/communication', element: <ClientLayout /> },
          { path: 'clients/:clientId/notes', element: <ClientLayout /> },
          { path: 'clients/:clientId/success-plays', element: <ClientLayout /> },
        ],
      },

      // Agent Routes
      {
        path: '/agent',
        element: (
          <RoleBasedRoute requiredRole="agent">
            <AgentLayout />
          </RoleBasedRoute>
        ),
        children: [
          { index: true, element: <AgentDashboard /> },
          { path: 'inbox', element: <AgentInbox /> },
          { path: 'profile', element: <AgentProfile /> },
        ],
      },

      // UI Demo Routes
      { path: '/demo/badge', element: <BadgeDemo /> },

      // Error Routes
      { path: '/unauthorized', element: <Unauthorized /> },
      { path: '/server-error', element: <ServerError /> },

      // Default redirect - will be handled by RoleBasedRedirect
      { index: true, element: <RoleBasedRedirect /> },
    ],
  },
]);

export default router;
