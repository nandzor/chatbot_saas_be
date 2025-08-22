# User, Role, Permission, and Organization Management Seeders

This directory contains comprehensive seeders for the Chatbot SaaS backend system's user, role, permission, and organization management functionality.

## Overview

The seeders create a complete RBAC (Role-Based Access Control) system with:
- **Subscription Plans**: Different pricing tiers with feature limits
- **Organizations**: Multi-tenant organizations with their own settings
- **Permissions**: Granular permissions for different resources and actions
- **Roles**: Predefined roles with appropriate permission sets
- **Users**: Sample users with different roles and organizations
- **Role-Permission Assignments**: Mapping permissions to roles
- **User-Role Assignments**: Mapping users to their roles

## Seeder Structure

### 1. SubscriptionPlanSeeder
Creates subscription plans with different tiers:
- **Trial Plan**: Free trial with limited features
- **Starter Plan**: Basic plan for small businesses
- **Professional Plan**: Advanced plan for growing businesses
- **Enterprise Plan**: Unlimited plan for large organizations

### 2. OrganizationSeeder
Creates sample organizations:
- **Demo Organization**: Trial organization for testing
- **TechCorp Solutions**: Starter plan organization
- **Enterprise Solutions**: Professional plan organization

Each organization includes:
- Complete business information
- Subscription and billing details
- UI/UX preferences
- Security settings
- API configuration

### 3. PermissionSeeder
Creates comprehensive permissions:

#### System Permissions (Global Scope)
- User Management: `users.view_all`, `users.create`, `users.update`, `users.delete`, `users.manage_roles`
- Organization Management: `organizations.view`, `organizations.create`, `organizations.update`, `organizations.delete`
- Role Management: `roles.view`, `roles.create`, `roles.update`, `roles.delete`, `roles.manage_permissions`
- Permission Management: `permissions.view`, `permissions.create`, `permissions.update`, `permissions.delete`
- System Management: `system_logs.view`, `system.manage`

#### Organization Permissions (Organization Scope)
- User Management: `users.view_org`, `users.create_org`, `users.update_org`, `users.delete_org`
- Agent Management: `agents.view`, `agents.create`, `agents.update`, `agents.delete`, `agents.execute`
- Customer Management: `customers.view`, `customers.create`, `customers.update`, `customers.delete`
- Chat Management: `chat_sessions.view`, `chat_sessions.create`, `chat_sessions.update`, `chat_sessions.delete`
- Message Management: `messages.view`, `messages.create`, `messages.update`, `messages.delete`
- Knowledge Management: `knowledge_articles.view`, `knowledge_articles.create`, `knowledge_articles.update`, `knowledge_articles.delete`, `knowledge_articles.publish`
- Bot Management: `bot_personalities.view`, `bot_personalities.create`, `bot_personalities.update`, `bot_personalities.delete`
- Channel Management: `channel_configs.view`, `channel_configs.create`, `channel_configs.update`, `channel_configs.delete`
- Analytics: `analytics.view`, `analytics.export`
- Billing: `billing.view`, `billing.manage`
- API Management: `api_keys.view`, `api_keys.create`, `api_keys.update`, `api_keys.delete`
- Webhook Management: `webhooks.view`, `webhooks.create`, `webhooks.update`, `webhooks.delete`
- Workflow Management: `workflows.view`, `workflows.create`, `workflows.update`, `workflows.delete`, `workflows.execute`

### 4. RoleSeeder
Creates roles with different permission levels:

#### System Roles (Global Scope)
- **Super Administrator**: Full system access (level 100)
- **System Administrator**: System-wide administration (level 90)
- **Support Team**: Customer support access (level 50)

#### Organization Roles (Organization Scope)
- **Organization Administrator**: Full organization access (level 80)
- **Manager**: Team management capabilities (level 60)
- **Agent**: Chatbot operation (level 40)
- **Content Creator**: Knowledge base management (level 30)
- **Analyst**: Analytics and reporting (level 25)
- **Customer**: Basic customer access (level 10)
- **Viewer**: Read-only access (level 5)

### 5. UserSeeder
Creates users with different roles:

#### System Users
- **Super Administrator**: `superadmin@chatbot-saas.com` / `SuperAdmin123!`
- **System Administrator**: `systemadmin@chatbot-saas.com` / `SystemAdmin123!`
- **Support Team**: `support@chatbot-saas.com` / `Support123!`

#### Organization Users (per organization)
- **Organization Administrator**: `admin@{org_code}.com` / `Admin123!`
- **Manager**: `manager@{org_code}.com` / `Manager123!`
- **Agent**: `agent@{org_code}.com` / `Agent123!`
- **Content Creator**: `creator@{org_code}.com` / `Creator123!`
- **Analyst**: `analyst@{org_code}.com` / `Analyst123!`
- **Customer**: `customer@{org_code}.com` / `Customer123!`

### 6. RolePermissionSeeder
Assigns permissions to roles based on their level and scope:

#### Permission Assignment Logic
- **Super Administrator**: All permissions
- **System Administrator**: All system permissions + limited dangerous operations
- **Support Team**: Limited system access for customer support
- **Organization Administrator**: All organization permissions + limited global permissions
- **Manager**: Team management permissions
- **Agent**: Chatbot operation permissions
- **Content Creator**: Content management permissions
- **Analyst**: Analytics and reporting permissions
- **Customer**: Basic access permissions
- **Viewer**: Read-only permissions

### 7. UserRoleSeeder
Assigns roles to users and creates additional role assignments:

#### Role Assignment Logic
- **Primary Role**: Based on user's role field
- **Additional Roles**: 
  - Super Admin: All system roles
  - Organization Admin: Viewer role
  - Manager: Agent and Viewer roles
  - Agent: Viewer role

## Usage

### Running All Seeders
```bash
php artisan db:seed
```

### Running Specific Seeder
```bash
php artisan db:seed --class=UserRolePermissionManagementSeeder
```

### Running Individual Seeders
```bash
php artisan db:seed --class=SubscriptionPlanSeeder
php artisan db:seed --class=OrganizationSeeder
php artisan db:seed --class=PermissionSeeder
php artisan db:seed --class=RoleSeeder
php artisan db:seed --class=UserSeeder
php artisan db:seed --class=RolePermissionSeeder
php artisan db:seed --class=UserRoleSeeder
```

## Data Structure

### Subscription Plans
- **Trial**: 14 days, 1 agent, 50 articles, 500 messages/month
- **Starter**: IDR 299K/month, 3 agents, 200 articles, 2000 messages/month
- **Professional**: IDR 799K/month, 10 agents, 1000 articles, 10000 messages/month
- **Enterprise**: IDR 1999K/month, unlimited agents, unlimited articles, unlimited messages

### Organizations
- **Demo Organization**: Trial plan, Indonesian locale
- **TechCorp Solutions**: Starter plan, English locale
- **Enterprise Solutions**: Professional plan, English locale

### Users
Each organization gets 6 users with different roles and appropriate permissions.

## Security Features

### Password Policy
- Minimum 8-12 characters (depending on role)
- Requires special characters, numbers, uppercase letters
- Two-factor authentication for admin roles

### Session Management
- Configurable session timeouts
- Concurrent session limits
- IP whitelist support for enterprise organizations

### Permission Security
- Dangerous permissions require approval
- System permissions are protected
- Organization-scoped permissions prevent cross-organization access

## Testing

### Login Credentials
Use the following credentials to test different user types:

#### System Users
- **Super Admin**: `superadmin@chatbot-saas.com` / `SuperAdmin123!`
- **System Admin**: `systemadmin@chatbot-saas.com` / `SystemAdmin123!`
- **Support**: `support@chatbot-saas.com` / `Support123!`

#### Organization Users
- **Demo Org Admin**: `admin@DEMO001.com` / `Admin123!`
- **TechCorp Manager**: `manager@TECH001.com` / `Manager123!`
- **Enterprise Agent**: `agent@ENTERPRISE001.com` / `Agent123!`

### Permission Testing
Each role has specific permissions that can be tested:
- **Super Admin**: Can access everything
- **Organization Admin**: Can manage their organization
- **Manager**: Can manage teams and content
- **Agent**: Can operate chatbots
- **Customer**: Can use chat features
- **Viewer**: Can only view data

## Maintenance

### Adding New Permissions
1. Add permission to `PermissionSeeder`
2. Update `RolePermissionSeeder` to assign to appropriate roles
3. Run the permission seeder

### Adding New Roles
1. Add role to `RoleSeeder`
2. Update `RolePermissionSeeder` to assign permissions
3. Update `UserRoleSeeder` if needed
4. Run the role seeder

### Adding New Organizations
1. Add organization to `OrganizationSeeder`
2. Run the organization seeder
3. Users will be created automatically

## Notes

- All passwords follow the pattern: `{Role}123!`
- Email addresses follow the pattern: `{role}@{org_code}.com`
- Usernames follow the pattern: `{role}_{org_code}`
- All users have verified email and phone numbers
- Two-factor authentication is enabled for admin roles
- API access is enabled based on subscription plan
- All data includes proper metadata for tracking
