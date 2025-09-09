# Byterover Handbook - Frontend

*Generated: 2025-01-09*

## Layer 1: System Overview

**Purpose**: Modern, scalable chatbot SaaS platform frontend built with React 18, featuring comprehensive client management, role-based access control, and real-time analytics dashboard for B2B SaaS operations.

**Tech Stack**: 
- **Framework**: React 18.2.0 with Vite 4.5.0
- **Routing**: React Router DOM 7.8.1
- **Styling**: Tailwind CSS 3.3.5 with custom design system
- **State Management**: React Context API + Custom Hooks
- **HTTP Client**: Axios 1.11.0
- **UI Components**: Custom component library with Lucide React icons
- **Build Tool**: Vite with optimized bundling and code splitting
- **Deployment**: Docker, Nginx, Vercel support

**Architecture**: 
Feature-First Architecture with Layered Component Structure:
- **Feature-Based Organization**: Components organized by business features (client, auth, dashboard, etc.)
- **Component Composition**: Presentational/Container pattern with reusable UI components
- **Custom Hooks**: Business logic abstraction and state management
- **Context API**: Global state management for auth, roles, and pagination
- **Protected Routes**: Role-based access control with permission checking
- **Service Layer**: API abstraction with centralized error handling

**Key Technical Decisions**:
- **Feature-First Structure**: Organizes code by business domain rather than technical concerns
- **Custom Hook Pattern**: Encapsulates business logic and API calls for reusability
- **Component Composition**: Promotes reusability through compound components
- **Role-Based Security**: Multi-level access control (SuperAdmin, OrgAdmin, Agent, User)
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Performance Optimization**: Code splitting, lazy loading, and memoization

**Entry Points**: 
- **Main Entry**: `src/main.jsx` - Application bootstrap
- **App Component**: `src/App.jsx` - Router provider and debug panel
- **Router**: `src/routes/index.jsx` - Route configuration and protected routes

---

## Layer 2: Module Map

**Core Modules**:
- **Authentication Module** (`src/features/auth/`): Login, registration, password reset, role-based access
- **Client Management Module** (`src/features/client/`): Client overview, users, billing, workflows, communication
- **Dashboard Module** (`src/features/dashboard/`): Analytics, inbox, knowledge base, automations
- **SuperAdmin Module** (`src/features/superadmin/`): System management, user management, organization management
- **Agent Module** (`src/features/agent/`): Agent dashboard, inbox, profile management
- **Platform Module** (`src/features/platform/`): Infrastructure health, security compliance, configuration

**Data Layer**:
- **API Services** (`src/api/`): Centralized API calls with Axios configuration
- **Custom Hooks** (`src/hooks/`): Data fetching and state management hooks
- **Context Providers** (`src/contexts/`): Global state management (Auth, Roles, Pagination)
- **Data Transformation** (`src/utils/`): Data formatting and validation utilities

**Integration Points**:
- **Backend API**: RESTful API integration with Laravel backend
- **Authentication**: JWT token-based authentication with refresh mechanism
- **Role Management**: Permission-based access control system
- **Real-time Updates**: WebSocket integration for live data updates
- **File Upload**: S3-compatible file upload with progress tracking

**Utilities**:
- **UI Components** (`src/components/ui/`): Reusable design system components
- **Layout Components** (`src/layouts/`): Page layout wrappers and navigation
- **Common Components** (`src/components/common/`): Shared business components
- **Utility Functions** (`src/utils/`): Helper functions and formatters
- **Configuration** (`src/config/`): Environment and application configuration

**Module Dependencies**:
- **Auth Module** → **All Modules** (Authentication required)
- **Client Module** → **SuperAdmin Module** (Client management access)
- **Dashboard Module** → **Auth Module** (User context)
- **Agent Module** → **Auth Module** (Agent role verification)
- **Platform Module** → **SuperAdmin Module** (System administration)

---

## Layer 3: Integration Guide

**API Endpoints**:
- **Authentication**: `/api/v1/auth/*` - Login, register, password reset
- **User Management**: `/api/v1/users/*` - CRUD operations for users
- **Organization Management**: `/api/v1/organizations/*` - Organization CRUD
- **Client Management**: `/api/v1/clients/*` - Client data and operations
- **Analytics**: `/api/v1/analytics/*` - Dashboard metrics and reports
- **Settings**: `/api/v1/settings/*` - Application configuration

**Configuration Files**:
- **Vite Config** (`vite.config.js`): Build configuration, aliases, environment handling
- **Tailwind Config** (`tailwind.config.js`): Design system configuration
- **Package.json**: Dependencies and build scripts
- **Environment Variables**: `.env.local` for local development configuration
- **Docker Config**: `docker-compose.yml`, `Dockerfile` for containerization

**External Integrations**:
- **Laravel Backend API**: Primary data source and business logic
- **AWS S3**: File storage and asset management
- **WebSocket Server**: Real-time communication and updates
- **Email Service**: Password reset and notification emails
- **Analytics Service**: Usage tracking and performance monitoring

**Workflows**:
- **Authentication Flow**: Login → Token validation → Role assignment → Route protection
- **Client Management Flow**: Client selection → Overview → Detailed management → Action execution
- **Dashboard Flow**: Data fetching → Real-time updates → User interaction → State updates
- **Permission Flow**: Route access → Permission check → Component rendering → Action authorization

**Interface Definitions**:
- **API Response Types**: Standardized response format with error handling
- **Component Props**: TypeScript-style prop definitions for components
- **Context Interfaces**: State shape definitions for React contexts
- **Hook Interfaces**: Custom hook return types and parameters

---

## Layer 4: Extension Points

**Design Patterns**:
- **Feature-First Architecture**: Business domain organization for scalability
- **Custom Hook Pattern**: Logic abstraction and reusability
- **Component Composition**: Flexible UI component building
- **Context + Reducer Pattern**: Global state management
- **Higher-Order Components**: Route protection and permission checking
- **Render Props Pattern**: Flexible component data sharing

**Extension Points**:
- **New Feature Modules**: Add new business features in `src/features/`
- **Custom Hooks**: Extend business logic in `src/hooks/`
- **UI Components**: Add reusable components in `src/components/ui/`
- **API Services**: Add new endpoints in `src/api/`
- **Layout Components**: Create new page layouts in `src/layouts/`
- **Route Protection**: Add new role-based routes in `src/routes/`

**Customization Areas**:
- **Theme System**: Tailwind CSS customization for branding
- **Component Library**: Extend UI component system
- **Permission System**: Add new roles and permissions
- **API Integration**: Add new backend services
- **Analytics**: Integrate new tracking services
- **Deployment**: Configure new deployment targets

**Plugin Architecture**:
- **Feature Plugins**: Modular feature additions
- **UI Plugins**: Component library extensions
- **API Plugins**: Service layer extensions
- **Theme Plugins**: Design system customizations
- **Analytics Plugins**: Tracking and monitoring extensions

**Recent Changes**:
- **Client Management Enhancement**: Comprehensive client overview and management features
- **Role-Based Security**: Multi-level access control implementation
- **Performance Optimization**: Code splitting and lazy loading
- **Responsive Design**: Mobile-first UI improvements
- **API Integration**: Enhanced backend communication patterns

---

*Byterover handbook optimized for agent navigation and human developer onboarding*
