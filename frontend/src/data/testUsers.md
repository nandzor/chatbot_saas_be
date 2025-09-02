# Test Users Documentation

## Available Test Users

### 1. Super Administrator
- **Username:** `superadmin`
- **Password:** `super123`
- **Role:** `superadmin`
- **Permissions:** All permissions (*)
- **Description:** Full system access across all organizations
- **Use Case:** System-wide administration, manage multiple organizations

### 2. Organization Administrator
- **Username:** `orgadmin`
- **Password:** `admin123`
- **Role:** `organization_admin`
- **Organization:** PT Teknologi Nusantara
- **Permissions:** 
  - manage_users
  - manage_agents
  - manage_settings
  - view_analytics
  - manage_billing
- **Description:** Organization administrator with full org management access
- **Use Case:** Manage users, settings, billing within their organization

### 3. Agent
- **Username:** `agent1`
- **Password:** `agent123`
- **Role:** `agent`
- **Organization:** PT Teknologi Nusantara
- **Specialization:** Customer Support
- **Permissions:**
  - handle_chats
  - view_conversations
  - update_profile
- **Description:** Customer support agent with chat handling capabilities
- **Use Case:** Handle customer conversations and manage personal profile

## Permission System

### Super Admin Permissions
- `*` (All permissions - wildcard)

### Organization Admin Permissions
- `manage_users` - Invite/manage users in organization
- `manage_agents` - Manage agent profiles and assignments
- `manage_settings` - Access settings and configurations
- `view_analytics` - View analytics and reports
- `manage_billing` - Manage subscription and billing

### Agent Permissions
- `handle_chats` - Handle customer conversations
- `view_conversations` - View conversation history
- `update_profile` - Update personal profile settings

## Usage Instructions

1. On the login page, you'll see test user cards on the right side
2. Click the "Use" button next to any test user to auto-fill the login form
3. Click "Login" to authenticate with that user's credentials
4. The system will redirect to the dashboard with role-appropriate access

## Protected Routes

- **Dashboard:** All authenticated users
- **Inbox:** Requires `handle_chats` permission (Agents)
- **Analytics:** Requires `view_analytics` permission (Org Admin+)
- **Knowledge:** All authenticated users
- **Automations:** Requires `manage_settings` permission (Org Admin+)
- **Settings:** Requires `manage_settings` permission (Org Admin+)

## Role Hierarchy

```
Super Admin (*)
├── Full system access
├── Manage all organizations
└── Override all permissions

Organization Admin
├── Manage organization users
├── Configure organization settings
├── View organization analytics
└── Manage billing

Agent
├── Handle customer chats
├── View conversations
└── Update personal profile
```
