# Dokumentasi Fitur Super Admin

> **Role:** Super Administrator (Platform Level)
> 
> **Scope:** Super Admin memiliki akses penuh ke seluruh platform, mengelola semua organizations (clients), subscription plans, financial transactions, role & permission system, dan konfigurasi platform.

---

## 📑 Daftar Isi

1. [Dashboard](#1-dashboard)
2. [Financial Management](#2-financial-management)
3. [Transaction Management](#3-transaction-management)
4. [Client Management](#4-client-management)
5. [System Admin](#5-system-admin)
6. [Role Management](#6-role-management)
7. [Permission Management](#7-permission-management)
8. [Platform Configuration](#8-platform-configuration)

---

## 1. Dashboard

**Screenshot:** `superadmin_dashboard.png`

### Fitur Utama
- **Platform Metrics Overview**
  - Total clients/organizations
  - Total active subscriptions
  - Monthly Recurring Revenue (MRR)
  - Platform usage statistics (messages, AI requests, storage)
  - Growth metrics & trends
- **Financial Summary**
  - Revenue today/this month
  - Pending payments
  - Failed transactions
- **Client Activity**
  - New registrations
  - Trial conversions
  - Churned clients
- **System Health**
  - Server status
  - Database connections
  - Queue status
  - Storage usage
- **Recent Activities Timeline**
- **Quick Actions** (Create Client, View Finances, System Settings)

### Flow End User
1. **Login** → Super Admin credentials (highest privilege)
2. **Dashboard Landing** → Overview platform-wide metrics dan KPIs
3. **Monitor Real-time Data** → Active users, ongoing conversations, system load
4. **Analyze Trends** → Revenue growth, client retention, usage patterns via charts
5. **Quick Navigation** → Click cards atau quick action buttons untuk deep-dive ke specific areas
6. **Alerts & Notifications** → Review critical alerts (payment failures, system issues, high usage)

---

## 2. Financial Management

### 2.1 Financial Overview & Reports

**Screenshot:** `superadmin_financial.png`

#### Fitur
- **Revenue Dashboard**
  - Total revenue (lifetime, monthly, yearly)
  - Revenue by subscription plan
  - Revenue by billing cycle (monthly, quarterly, yearly)
  - Revenue trends & forecasts
- **Financial Metrics**
  - MRR (Monthly Recurring Revenue)
  - ARR (Annual Recurring Revenue)
  - ARPU (Average Revenue Per User)
  - Churn rate impact on revenue
- **Payment Status Summary**
  - Successful payments
  - Pending payments
  - Failed/declined payments
  - Refunds & chargebacks
- **Subscription Plans Performance**
  - Revenue per plan (Starter, Pro, Enterprise, etc.)
  - Most popular plans
  - Conversion rates
- **Invoice Management**
  - Generate bulk invoices
  - View unpaid invoices
  - Send payment reminders
  - Export financial reports (CSV, PDF, Excel)
- **Charts & Visualizations**
  - Revenue over time (line chart)
  - Revenue by plan (pie chart)
  - Payment status breakdown (bar chart)
- **Filters**
  - Date range selector
  - Filter by plan
  - Filter by organization
  - Filter by payment status

#### Flow End User
1. **Access Financial Section** → Navigate dari dashboard atau sidebar
2. **View Financial Overview** → Review high-level metrics (MRR, total revenue, payment status)
3. **Analyze Revenue Trends** → Explore charts untuk identify growth patterns atau anomalies
4. **Drill Down** → Click specific metrics untuk detailed breakdown
5. **Filter Data** → Apply filters (date range, plan type, organization) untuk focused analysis
6. **Generate Reports** → Export financial data untuk accounting atau investor reporting
7. **Action Items** → Identify unpaid invoices, follow up on failed payments, review refund requests

---

### 2.2 Create Financial Record

**Screenshot:** `superadmin_financial_create.png`

#### Fitur
- **Manual Transaction Entry Form**
  - Organization/Client selector (dropdown)
  - Transaction type (Payment, Refund, Credit, Adjustment, One-time charge)
  - Amount (IDR, USD, etc.)
  - Currency selector
  - Payment method (Credit Card, Bank Transfer, PayPal, Manual)
  - Transaction date
  - Reference number
  - Description/Notes
  - Invoice file upload
  - Tags/Categories
- **Auto-calculation**
  - Tax calculation (PPN/VAT)
  - Discount application
  - Final amount
- **Validation**
  - Required fields check
  - Amount validation
  - Duplicate transaction check

#### Flow End User
1. **Click "Create Transaction"** → From financial dashboard
2. **Select Organization** → Choose client dari dropdown (autocomplete search)
3. **Enter Transaction Details**:
   - Select transaction type (e.g., Payment)
   - Enter amount: Rp 500,000
   - Select currency: IDR
   - Select payment method: Bank Transfer
   - Enter reference: INV-2025-001
   - Add description: "Payment for Pro Plan - January 2025"
4. **Upload Invoice** (optional) → Attach PDF invoice
5. **Review & Validate** → System validates input, shows calculated totals
6. **Submit** → Transaction recorded, client balance updated, notification sent
7. **Confirmation** → Success message, redirect to transaction detail atau financial list

---

### 2.3 Edit Financial Record

**Screenshot:** `superadmin_financial_edit.png`

#### Fitur
- **Pre-filled Edit Form** (same fields as create, with current values)
- **Edit Restrictions**
  - Completed transactions may have limited edit options (audit trail)
  - Only specific fields editable (notes, tags, invoice)
  - Amount changes require approval atau create adjustment entry
- **Change Tracking**
  - Highlight modified fields
  - Show original vs new values
  - Audit log automatically generated
- **Void/Cancel Transaction** option (instead of delete)

#### Flow End User
1. **Access Transaction** → Click "Edit" dari financial list atau detail page
2. **Modify Fields** → Update necessary information (e.g., correct reference number, add notes)
3. **System Validation** → Real-time validation, prevent invalid changes
4. **Review Changes** → Compare original vs modified values
5. **Submit Update** → Changes saved dengan audit trail
6. **Confirmation** → Success message, email notification (jika configured)

**Note:** Critical fields (amount, organization) may require creating adjustment entry instead of direct edit untuk maintain audit integrity.

---

## 3. Transaction Management

### 3.1 Transaction History

**Screenshot:** `superadmin_transaction_history.png`

#### Fitur
- **Transaction List Table**
  - Transaction ID
  - Date & time
  - Organization/Client name
  - Transaction type (Payment, Refund, etc.)
  - Amount
  - Currency
  - Payment method
  - Status (Success, Pending, Failed, Refunded, Voided)
  - Reference number
  - Actions (View Detail, Edit, Void, Export)
- **Pagination** (dengan customizable page size)
- **Search & Filter**
  - Search by transaction ID, organization name, reference
  - Filter by date range
  - Filter by transaction type
  - Filter by status
  - Filter by payment method
  - Filter by amount range
- **Bulk Actions**
  - Export selected transactions
  - Mark as reviewed
  - Generate invoices
- **Status Indicators**
  - Color-coded badges (green=success, yellow=pending, red=failed)
- **Sort Options** (by date, amount, status, organization)
- **Quick Stats** di top (Total transactions, Total amount, Success rate)

#### Flow End User
1. **Access Transaction History** → Navigate dari Financial atau sidebar menu
2. **View All Transactions** → Paginated list dengan default sort (latest first)
3. **Search Specific Transaction** → Use search bar (e.g., search by invoice number "INV-2025-001")
4. **Filter Transactions**:
   - Select date range: "Last 30 days"
   - Filter status: "Failed" → Identify problematic payments
   - Filter organization: Select specific client
5. **Sort Data** → Click column headers untuk sort (e.g., sort by amount descending)
6. **View Details** → Click transaction row atau "View" button
7. **Bulk Export** → Select multiple transactions, export to CSV untuk reconciliation
8. **Take Actions** → Void failed transactions, resend payment links, contact clients

---

### 3.2 Transaction Detail

**Screenshot:** `superadmin_transaction_detail.png`

#### Fitur
- **Comprehensive Transaction Information**
  - **Basic Info**
    - Transaction ID (unique identifier)
    - Transaction type & status
    - Created date & time
    - Last updated timestamp
  - **Financial Details**
    - Gross amount
    - Tax amount (breakdown)
    - Discount applied
    - Net amount
    - Currency
  - **Party Information**
    - Organization name & ID
    - Organization contact (email, phone)
    - Billing address
  - **Payment Details**
    - Payment method
    - Payment gateway (Midtrans, Stripe, etc.)
    - Payment reference/transaction ID dari gateway
    - Card last 4 digits (jika card payment)
    - Bank name (jika bank transfer)
  - **Related Documents**
    - Invoice (view/download PDF)
    - Receipt
    - Refund document (jika applicable)
  - **Status History Timeline**
    - Created → Pending → Processing → Success
    - Timestamps untuk each status change
    - User who performed actions
  - **Audit Trail**
    - All changes/modifications logged
    - Created by, modified by
  - **Internal Notes** (editable)
  - **Related Transactions** (e.g., original payment & its refund)
- **Action Buttons**
  - Edit transaction
  - Void transaction
  - Process refund
  - Resend invoice
  - Download invoice
  - Contact organization
  - View organization detail

#### Flow End User
1. **Open Transaction Detail** → Click dari transaction list
2. **Review Complete Information** → All data in organized sections
3. **Check Status History** → Understand transaction lifecycle via timeline
4. **View Documents** → Download invoice atau receipt untuk records
5. **Check Audit Trail** → Verify who created/modified transaction
6. **Read Internal Notes** → Review any special notes dari team
7. **Take Actions**:
   - Issue refund jika customer complaint
   - Resend invoice jika customer tidak receive
   - Edit internal notes untuk documentation
   - Contact organization directly via email/phone link
8. **Navigate to Related Data** → Click organization link untuk view client profile

---

## 4. Client Management

### 4.1 Client Overview

**Screenshot:** `superadmin_client_overview.png`

#### Fitur
- **Client Dashboard Cards**
  - Total clients
  - Active clients
  - Trial clients
  - Suspended/Inactive clients
  - Churned clients (this month)
- **Growth Metrics**
  - New clients today/this week/this month
  - Growth rate percentage
  - Retention rate
- **Client Segmentation**
  - By subscription plan (Starter, Pro, Enterprise)
  - By industry
  - By company size
  - By region
- **Revenue from Clients**
  - Top paying clients
  - Revenue by client segment
- **Activity Summary**
  - Most active clients (by usage)
  - Clients with high usage (near quota)
  - Clients with low activity (churn risk)
- **Recent Client Activities**
  - New registrations
  - Plan upgrades
  - Plan downgrades
  - Cancellations
- **Visual Charts**
  - Client distribution pie chart
  - Growth trend line chart
  - Subscription status breakdown

#### Flow End User
1. **Access Client Overview** → From dashboard atau sidebar "Clients"
2. **Review Key Metrics** → Quick glance at total clients, active, trial, growth
3. **Analyze Segments** → Understand client distribution by plan, industry, size
4. **Identify Trends** → Growth rate, retention, churn patterns via charts
5. **Monitor Activity** → Review recent registrations, upgrades, cancellations
6. **Identify Action Items**:
   - Follow up dengan trial clients near end date
   - Contact high-usage clients untuk upsell
   - Reach out to low-activity clients (retention)
   - Thank top paying clients (customer success)
7. **Navigate to Details** → Click on specific metrics untuk detailed client list

---

### 4.2 Client Table/List

**Screenshot:** `superadmin_client_table.png`

#### Fitur
- **Comprehensive Client Table**
  - Organization logo
  - Organization name
  - Organization code (unique identifier)
  - Email & phone
  - Subscription plan (badge dengan color)
  - Subscription status (Active, Trial, Expired, Suspended)
  - Total users
  - Current usage (messages, storage)
  - Monthly spend
  - Registration date
  - Last active
  - Actions (View, Edit, Manage Users, Suspend, Delete)
- **Search & Filter**
  - Search by name, email, org code
  - Filter by subscription plan
  - Filter by status
  - Filter by registration date
  - Filter by usage level
  - Filter by industry
- **Sort Options** (All columns sortable)
- **Bulk Actions**
  - Export client list
  - Send bulk notifications
  - Bulk plan change (e.g., upgrade trial to paid)
  - Bulk suspend/activate
- **Pagination** dengan customizable rows per page
- **Quick View** (hover untuk preview tanpa full navigate)
- **Column Customization** (Show/hide columns)

#### Flow End User
1. **Access Client List** → Navigate dari overview atau sidebar
2. **View All Clients** → Table format dengan key information
3. **Search Client** → Type nama atau email di search bar untuk quick find
4. **Apply Filters**:
   - Filter status: "Trial" → View all trial clients
   - Filter plan: "Enterprise" → View high-value clients
   - Filter by date: "Registered this month" → View new clients
5. **Sort Data** → Click column header (e.g., sort by "Monthly Spend" descending untuk identify top clients)
6. **Bulk Operations**:
   - Select trial clients expiring soon
   - Send bulk email campaign untuk conversion
7. **Individual Actions**:
   - Click "View" → Open client detail page
   - Click "Edit" → Modify client information
   - Click "Manage Users" → Access user management
   - Click "Suspend" → Temporarily disable access (e.g., non-payment)
8. **Export Data** → Download CSV untuk reporting atau analysis di external tools

---

### 4.3 Client Detail

**Screenshot:** `superadmin_client_detail.png`

#### Fitur
- **Organization Profile**
  - Logo, name, display name
  - Organization code
  - Contact information (email, phone, address)
  - Website
  - Tax ID
  - Industry, business type, company size
- **Subscription Information**
  - Current plan dengan features
  - Subscription status dengan visual indicator
  - Billing cycle
  - Trial end date (jika trial)
  - Subscription start & end dates
  - Auto-renewal status
- **Usage Statistics**
  - Current usage vs quotas (progress bars):
    - Messages sent (e.g., 15,000 / 20,000)
    - AI requests (e.g., 3,200 / 5,000)
    - Storage (e.g., 2.5GB / 5GB)
    - Active agents (e.g., 8 / 10)
    - Active channels (e.g., 3 / 5)
  - Usage trend charts (daily/weekly/monthly)
  - Overage alerts (jika exceeded quota)
- **Financial Summary**
  - Total revenue dari client
  - Monthly spend (MRR dari client ini)
  - Last payment date & amount
  - Next billing date
  - Outstanding balance
  - Payment history link
- **User Management Summary**
  - Total users di organization
  - Active users
  - Roles distribution
  - Recent user activities
  - Quick link to manage users
- **Activity Timeline**
  - Registration date
  - Plan changes
  - Payments
  - Support tickets
  - Configuration changes
  - Login activities
- **Integration Status**
  - WhatsApp connections (active/inactive)
  - API usage
  - Webhook configurations
  - Third-party integrations
- **Settings & Configuration**
  - Timezone, locale, currency
  - Feature flags enabled
  - Security settings (2FA, IP whitelist)
  - API keys status
- **Internal Notes** (Super Admin only)
  - Add private notes tentang client
  - History of internal communications
- **Action Buttons**
  - Edit organization info
  - Manage users
  - Change subscription plan
  - Suspend/Activate account
  - View financial details
  - Impersonate (login as org admin untuk troubleshooting)
  - Send notification
  - Delete organization (dengan confirmation)

#### Flow End User
1. **Open Client Detail** → Click client dari table list
2. **Review Complete Profile** → All sections organized dalam tabs atau accordion
3. **Monitor Usage** → Check if client approaching quota limits → Upsell opportunity
4. **Check Subscription Status**:
   - Trial ending soon → Proactive conversion outreach
   - Auto-renewal off → Re-engagement campaign
   - Overage → Discuss plan upgrade
5. **Review Financial Health** → Check payment history, outstanding balance
6. **Analyze Activity** → Timeline shows engagement level → Identify healthy vs at-risk clients
7. **Manage Integrations** → Verify all integrations working properly
8. **Add Internal Notes** → Document conversations, special agreements, support issues
9. **Take Actions**:
   - **Upgrade Plan** → Client approaching limits → Change subscription
   - **Suspend Account** → Non-payment atau ToS violation
   - **Impersonate** → Login as client admin untuk troubleshoot issues
   - **Contact Client** → Send email atau notification
   - **Delete Organization** → Churn, contract end (dengan data export first)

---

### 4.4 Client Create

**Screenshot:** `superadmin_client_create.png`

#### Fitur
- **Organization Creation Form**
  - **Basic Information**
    - Organization name (required)
    - Display name
    - Email (required, unique)
    - Phone
    - Website
    - Address
    - Logo upload
  - **Business Information**
    - Industry (dropdown)
    - Business type
    - Company size
    - Tax ID
  - **Subscription Configuration**
    - Select subscription plan (dropdown)
    - Billing cycle (monthly, quarterly, yearly)
    - Start trial atau start paid immediately
    - Trial duration (jika trial)
    - Custom pricing (override standard plan pricing)
  - **Admin User Creation**
    - Admin name
    - Admin email
    - Auto-generate password atau custom
    - Send welcome email (checkbox)
  - **Settings**
    - Timezone
    - Locale/Language
    - Currency
  - **Feature Flags** (Enable/disable specific features)
  - **Internal Notes** (Super Admin reference)
- **Auto-generation**
  - Organization code (auto-generated, editable)
  - API keys
- **Validation**
  - Real-time validation
  - Email uniqueness check
  - Required fields indicator

#### Flow End User
1. **Click "Create New Client"** → From client overview atau list page
2. **Fill Organization Details**:
   - Enter name: "PT Contoh Digital"
   - Enter email: "admin@contohdigital.com"
   - Upload logo
   - Enter phone, website, address
   - Select industry: "E-commerce"
   - Select company size: "10-50 employees"
3. **Configure Subscription**:
   - Select plan: "Professional Plan"
   - Select billing: "Monthly"
   - Trial: Enable 14-day trial
   - Pricing: Use standard pricing (atau custom discount)
4. **Create Admin User**:
   - Name: "John Doe"
   - Email: "john@contohdigital.com"
   - Password: Auto-generate
   - Send welcome email: ✓ Checked
5. **Configure Settings**:
   - Timezone: Asia/Jakarta
   - Language: Indonesian
   - Currency: IDR
6. **Enable Features** → Toggle specific features (e.g., AI assistant, analytics)
7. **Add Internal Note** → "Referral from partner X, special pricing negotiated"
8. **Review All Fields** → Ensure accuracy
9. **Submit** → Click "Create Organization"
10. **System Processing**:
    - Create organization record
    - Create admin user dengan org_admin role
    - Send welcome email dengan login credentials
    - Setup default configurations
    - Create trial subscription (jika applicable)
11. **Confirmation** → Success message, redirect to client detail page
12. **Post-Creation** → Super admin can impersonate untuk help client setup

---

### 4.5 Client Update/Edit

**Screenshot:** `superadmin_client_update.png`

#### Fitur
- **Edit Organization Form** (pre-filled dengan current data)
- **Editable Fields** (same as create, dengan current values)
- **Additional Options**:
  - Change subscription plan (upgrade/downgrade)
  - Extend trial period
  - Modify quotas (custom limits)
  - Enable/disable features
  - Reset API keys
  - Regenerate organization code (dangerous)
- **Change Tracking** → Highlight modified fields
- **Audit Log** → All changes logged dengan timestamp & user
- **Danger Zone**:
  - Suspend organization
  - Delete organization (permanent, dengan confirmation)

#### Flow End User
1. **Access Edit Page** → Click "Edit" dari client detail atau list
2. **Modify Information** → Update necessary fields (e.g., phone number change, new logo)
3. **Adjust Subscription**:
   - Change plan dari Pro ke Enterprise
   - Modify custom pricing
   - Extend trial by 7 more days
4. **Update Quotas** → Increase message limit dari 20,000 to 50,000 (custom limit)
5. **Toggle Features** → Enable new beta feature untuk this client
6. **Add/Update Notes** → Document why changes made
7. **Review Changes** → System highlights all modified fields
8. **Save Changes** → Submit form
9. **System Actions**:
   - Update organization record
   - Recalculate quotas jika plan changed
   - Send notification to client (jika configured)
   - Log change in audit trail
10. **Confirmation** → Success message, changes reflected immediately
11. **Client Impact** → Client sees updated plan, features, quotas upon next login

---

### 4.6 Client Manage Users

**Screenshot:** `superadmin_client_manage_users.png`

#### Fitur
- **User List** (within selected organization)
  - User name, email
  - Role (Org Admin, Agent, Viewer, Custom)
  - Status (Active, Inactive, Suspended)
  - Last login
  - Actions (Edit, Reset Password, Suspend, Delete)
- **Add New User** (to this organization)
- **Bulk User Operations**
  - Import users (CSV)
  - Bulk role assignment
  - Bulk activation/deactivation
- **Role Management**
  - Assign/change roles
  - View permissions per role
- **User Activity** (per user)
  - Login history
  - Actions performed
  - Conversations handled (for agents)
- **Search & Filter** (within org users)

#### Flow End User
1. **Access User Management** → From client detail, click "Manage Users"
2. **View All Users** → List of users belonging to this organization
3. **Add New User**:
   - Click "Add User"
   - Enter name, email
   - Assign role: "Agent"
   - Send invitation email
   - User receives email, sets password
4. **Edit Existing User**:
   - Change role: Agent → Org Admin (promotion)
   - Update email atau name
5. **Suspend User** → Temporarily disable access (e.g., employee on leave)
6. **Reset Password** → Generate new password, send reset email
7. **Bulk Import** → Upload CSV dengan multiple users untuk rapid onboarding
8. **View User Activity** → Check login history, audit trail untuk specific user
9. **Delete User** → Remove user dari organization (e.g., employee left company)

**Note:** Super Admin dapat manage users across ANY organization, unlike Org Admin yang hanya manage users dalam own organization.

---

## 5. System Admin

**Screenshot:** `superadmin_sysadmin.png`

### Fitur
- **System-wide User Management**
  - List ALL users across ALL organizations
  - Super admin accounts
  - System admin accounts
  - Regular users aggregated
- **Super Admin Management**
  - Create new super admin accounts
  - Manage super admin permissions
  - Revoke super admin access
  - Audit log untuk super admin actions
- **System Roles**
  - Super Admin (platform level)
  - System Admin (global operations)
  - Support Admin (read-only, limited actions)
- **Global User Actions**
  - Search users across all organizations
  - Suspend user accounts globally
  - Reset passwords
  - View cross-organization activity
- **Security Management**
  - Failed login attempts monitoring
  - Suspicious activity alerts
  - IP blocking
  - Session management
- **Admin Activity Logs**
  - All super admin actions logged
  - All system admin actions logged
  - Audit trail untuk compliance

### Flow End User
1. **Access System Admin Panel** → High-privilege section
2. **View All Users** → Aggregated list dari all organizations
3. **Search Cross-Organization** → Find user by email across entire platform
4. **Manage Super Admins**:
   - Create new super admin: Promote trusted staff
   - Assign permissions: Full atau limited super admin
   - Revoke access: Offboard staff
5. **Monitor Security**:
   - Review failed login attempts → Identify brute force attacks
   - Check suspicious activity → IP from unusual location
   - Block IPs → Prevent access dari malicious sources
6. **Audit Compliance**:
   - Review admin activity logs
   - Generate compliance reports
   - Track who performed critical actions (delete org, change billing)
7. **Support Functions**:
   - Impersonate users untuk troubleshooting
   - Reset passwords globally
   - Unlock suspended accounts

---

## 6. Role Management

### 6.1 Role Index

**Screenshot:** `superadmin_role_index.png`

#### Fitur
- **Role List** (System-wide & Per-Organization)
  - Role name
  - Role code
  - Scope (Global, Organization, Department, Team)
  - Level (hierarchy)
  - Is system role (predefined vs custom)
  - Number of users assigned
  - Status (Active, Inactive)
  - Actions (View, Edit, Assign, Manage Permissions, Delete)
- **System Roles** (default, cannot delete):
  - Super Admin
  - System Admin
  - Org Admin
  - Agent
  - Viewer
- **Custom Roles** (created by orgs atau super admin)
- **Filter & Search**
  - Filter by scope
  - Filter by organization
  - Search by role name
- **Create New Role** button

#### Flow End User
1. **Access Role Management** → From sidebar atau settings
2. **View All Roles** → System roles + custom roles dari all organizations
3. **Understand Role Hierarchy**:
   - Level 1: Super Admin, System Admin (highest)
   - Level 2: Org Admin
   - Level 3: Agent, Manager
   - Level 4: Viewer (lowest)
4. **Search Role** → Find specific role by name atau code
5. **Filter Roles**:
   - Scope: "Organization" → View org-level roles only
   - Organization: Select specific org → View custom roles for that org
6. **Review Role Usage** → See how many users assigned to each role
7. **Take Actions**:
   - Click "View" → See role details dan permissions
   - Click "Edit" → Modify role configuration
   - Click "Assign" → Assign role to users
   - Click "Manage Permissions" → Configure granular permissions
   - Click "Delete" → Remove custom role (system roles cannot delete)

---

### 6.2 Role Create

**Screenshot:** `superadmin_role_create.png`

#### Fitur
- **Role Creation Form**
  - **Basic Information**
    - Role name (required)
    - Role code (auto-generated, editable)
    - Display name
    - Description
  - **Role Configuration**
    - Scope (Global, Organization, Department, Team, Personal)
    - Level (1-10, hierarchy)
    - Is system role (checkbox)
    - Is default role (auto-assign to new users)
  - **Inheritance**
    - Parent role (inherit permissions)
    - Inherit permissions (checkbox)
  - **Access Control**
    - Max users (limit number of users dengan role ini)
  - **UI/UX**
    - Color (badge color)
    - Icon (select icon)
    - Badge text
  - **Metadata** (custom JSON)
- **Template Selection** → Start with existing role template

#### Flow End User
1. **Click "Create Role"** → From role index
2. **Choose Template** (optional):
   - Start from scratch
   - Duplicate existing role (e.g., based on "Agent" role)
3. **Fill Basic Info**:
   - Name: "Senior Agent"
   - Code: "senior_agent"
   - Display: "Senior Customer Service Agent"
   - Description: "Experienced agent with additional privileges"
4. **Configure Role**:
   - Scope: "Organization"
   - Level: 3
   - Not system role
   - Not default
5. **Set Inheritance**:
   - Parent role: "Agent"
   - Inherit permissions: ✓ Yes → Starts dengan all Agent permissions
6. **Access Control**:
   - Max users: 5 → Limit to 5 senior agents per org
7. **Customize UI**:
   - Color: #F59E0B (orange)
   - Icon: star
   - Badge: "Senior"
8. **Submit** → Create role
9. **Next Steps** → Redirect to "Manage Permissions" untuk configure specific permissions beyond inherited ones

---

### 6.3 Role Detail

**Screenshot:** `superadmin_role_detail.png`

#### Fitur
- **Comprehensive Role Information**
  - **Overview**
    - Role name, code, display name
    - Description
    - Badge preview dengan color & icon
    - Status indicator
  - **Configuration**
    - Scope, level, system role status
    - Parent role (jika inherited)
    - Max users & current users count
  - **Permissions List**
    - All permissions assigned to role
    - Grouped by category (User Management, Content, Billing, etc.)
    - Inherited permissions (highlighted)
    - Directly assigned permissions
    - Permission details (resource, action, scope)
  - **Users Assigned**
    - List of users dengan role ini
    - Across organizations (jika global scope)
    - Quick links to user profiles
  - **Role Hierarchy**
    - Parent role
    - Child roles (roles yang inherit dari this role)
    - Visual hierarchy diagram
  - **Usage Statistics**
    - Number of users
    - Organizations using this role
    - Created date, last modified
  - **Audit Log**
    - Role creation log
    - Permission changes history
    - User assignment history
- **Action Buttons**
  - Edit role
  - Manage permissions
  - Assign to users
  - Clone role
  - Activate/Deactivate
  - Delete role (jika not system role)

#### Flow End User
1. **Open Role Detail** → Click role dari index
2. **Review Complete Configuration** → All settings displayed
3. **Understand Permissions** → Expand permission categories untuk see what this role can do
4. **Check Users** → See who has this role across platform
5. **Analyze Hierarchy** → Understand inheritance structure
6. **Review Audit Log** → Track changes to role over time
7. **Take Actions**:
   - Edit configuration → Update role settings
   - Manage permissions → Add/remove specific permissions
   - Assign to users → Grant role to additional users
   - Clone role → Create variation untuk different context

---

### 6.4 Role Edit

**Screenshot:** `superadmin_role_edit.png`

#### Fitur
- **Edit Role Form** (pre-filled dengan current data)
- **Editable Fields** (same as create)
- **Restrictions**:
  - System roles: Limited edits (can't change code, scope)
  - Custom roles: Full edit access
- **Change Impact Analysis**
  - Show affected users
  - Show affected organizations
  - Warn jika breaking changes
- **Version Control** → Save as new version vs update existing

#### Flow End User
1. **Access Edit Page** → Click "Edit" dari role detail
2. **Modify Configuration** → Update necessary fields (e.g., increase max users dari 5 to 10)
3. **Review Impact** → System shows "This change affects 15 users across 3 organizations"
4. **Save Changes** → Submit update
5. **System Actions**:
   - Update role record
   - Apply changes to all users dengan role ini
   - Log change in audit trail
   - Notify affected users (jika major changes)
6. **Confirmation** → Changes applied immediately

---

### 6.5 Role Assign

**Screenshot:** `superadmin_role_assign.png`

#### Fitur
- **Role Assignment Interface**
  - **User Selection**
    - Search users (autocomplete)
    - Select organization first (filter users)
    - Multi-select users untuk bulk assignment
  - **Role Selection**
    - Select role to assign
    - Role preview dengan permissions
  - **Assignment Configuration**
    - Is active (immediately active atau scheduled)
    - Is primary role (main role vs secondary)
    - Scope context (department ID, team ID, etc.)
    - Effective from (start date/time)
    - Effective until (expiration, optional)
    - Reason for assignment (notes)
  - **Permissions Preview**
    - Show what permissions user will gain
    - Show conflicts dengan existing roles (jika any)
- **Bulk Assignment** → Assign role to multiple users at once
- **Role Removal** → Remove role dari users

#### Flow End User
1. **Open Role Assignment** → From role detail, click "Assign to Users"
2. **Select Organization** → Filter users by organization (e.g., "PT Contoh Digital")
3. **Select Users**:
   - Search: Type "john" → Find "John Doe"
   - Check checkbox to select
   - Or bulk select all agents
4. **Configure Assignment**:
   - Is active: ✓ Yes
   - Is primary: No (secondary role)
   - Effective from: Now
   - Effective until: Leave empty (permanent)
   - Reason: "Promoted to Senior Agent after performance review"
5. **Review Permissions** → See summary of what permissions user will gain
6. **Check Conflicts** → System warns jika conflicting permissions dengan existing roles
7. **Confirm Assignment** → Submit
8. **System Actions**:
   - Create user_roles record
   - Apply permissions to user
   - Send notification to user: "You've been assigned Senior Agent role"
   - Log assignment in audit trail
9. **Confirmation** → Success message, users now have new role

---

### 6.6 Role Manage Permissions

**Screenshot:** `superadmin_manage_permission.png`

#### Fitur
- **Permission Management Interface** untuk specific role
  - **Permission List** (all available permissions)
  - **Grouped by Category**:
    - User Management (create_user, edit_user, delete_user, etc.)
    - Content Management (create_kb, edit_kb, delete_kb, etc.)
    - Conversation (view_conversation, reply_conversation, etc.)
    - Bot Management (create_personality, edit_bot, etc.)
    - Billing & Finance (view_billing, manage_payment, etc.)
    - Analytics (view_analytics, export_data, etc.)
    - Settings (manage_settings, api_access, etc.)
    - System Admin (manage_roles, manage_permissions, etc.)
  - **Permission Details** for each:
    - Permission name & code
    - Resource & action
    - Description
    - Is dangerous (requires extra caution)
    - Checkbox: Assigned atau not
  - **Inherited Permissions** (dari parent role, read-only)
  - **Search & Filter**
    - Search permission by name
    - Filter by category
    - Filter by resource
    - Show only assigned
    - Show only dangerous permissions
  - **Bulk Actions**
    - Select all in category
    - Grant selected
    - Revoke selected
  - **Permission Preview** → Show example of what permission allows

#### Flow End User
1. **Access Permission Management** → From role detail, click "Manage Permissions"
2. **View Current Permissions** → See what's already assigned (checkboxes checked)
3. **Review Inherited Permissions** → Grayed out permissions inherited dari parent role
4. **Add Permissions**:
   - Expand category: "User Management"
   - Check permissions:
     - ✓ create_user
     - ✓ edit_user
     - ✗ delete_user (too powerful for this role)
   - Expand "Conversation":
     - ✓ view_all_conversations (beyond just assigned conversations)
     - ✓ transfer_conversation
5. **Review Dangerous Permissions** → System highlights dengan red icon
   - Uncheck dangerous ones atau proceed dengan caution
6. **Bulk Operations**:
   - Filter category: "Analytics"
   - Click "Select All in Category"
   - Click "Grant Selected" → Assign all analytics permissions at once
7. **Search Specific Permission** → Search "export" → Find all export-related permissions
8. **Review Impact** → "Adding these 5 permissions will affect 12 users"
9. **Save Changes** → Submit
10. **System Actions**:
    - Create/update role_permissions records
    - Recalculate permissions untuk all users dengan role ini
    - Clear permission cache
    - Log changes in audit trail
11. **Confirmation** → Changes applied immediately, users now have updated permissions

---

## 7. Permission Management

### 7.1 Permission Index

**Screenshot:** `superadmin_permission_index.png`

#### Fitur
- **Permission List** (all permissions in system)
  - Permission name
  - Permission code
  - Resource (User, Conversation, Knowledge Base, etc.)
  - Action (create, read, update, delete, manage, etc.)
  - Scope (global, organization, department, team, personal)
  - Category/Group
  - Is system permission (core vs custom)
  - Is dangerous (requires extra confirmation)
  - Status (Active, Inactive)
  - Actions (View, Edit, Delete)
- **Grouped View** → View permissions grouped by resource atau category
- **Search & Filter**
  - Search by name atau code
  - Filter by resource
  - Filter by action
  - Filter by scope
  - Filter by category
  - Show only dangerous permissions
  - Show only system permissions
- **Create New Permission** button
- **Permission Statistics** → Total permissions, by resource, by category

#### Flow End User
1. **Access Permission Management** → From system admin atau settings
2. **View All Permissions** → Comprehensive list of all permissions (100+ permissions)
3. **Understand Permission Structure**:
   - Resource: What entity (User, Conversation, Bot, etc.)
   - Action: What operation (create, read, update, delete, manage)
   - Scope: What level (global, organization, team, personal)
4. **Filter Permissions**:
   - Filter resource: "Conversation" → See all conversation-related permissions
   - Filter action: "Delete" → See all delete permissions (review carefully)
5. **Search Specific Permission** → Search "export" → Find all export permissions
6. **Identify Dangerous Permissions** → Filter "Is Dangerous: Yes" → Review critical permissions (delete user, change billing, etc.)
7. **View Usage** → See which roles have each permission
8. **Take Actions**:
   - Click "View" → See permission details
   - Click "Edit" → Modify permission configuration
   - Click "Delete" → Remove custom permission (system permissions cannot delete)

---

### 7.2 Permission Create

**Screenshot:** `superadmin_permission_create.png`

#### Fitur
- **Permission Creation Form**
  - **Basic Information**
    - Permission name (required)
    - Permission code (auto-generated, editable)
    - Display name
    - Description (what this permission allows)
  - **Permission Details**
    - Resource (select from enum: User, Role, Permission, Conversation, Bot, Knowledge Base, Analytics, Billing, Settings, etc.)
    - Action (select: create, read, update, delete, manage, export, import, approve, etc.)
    - Scope (global, organization, department, team, personal)
  - **Conditions & Constraints** (JSON)
    - Dynamic conditions (e.g., "can only edit own conversations")
    - Field-level constraints (e.g., "can view but not export financial data")
  - **Grouping**
    - Category (User Management, Content, Billing, etc.)
    - Group name (untuk UI grouping)
  - **System Fields**
    - Is system permission (core permission, protected)
    - Is dangerous (requires extra confirmation to use)
    - Requires approval (permission assignment needs approval)
  - **UI/UX**
    - Sort order (display order in lists)
    - Is visible (show in UI atau hidden)

#### Flow End User
1. **Click "Create Permission"** → From permission index
2. **Fill Basic Info**:
   - Name: "Export Client Data"
   - Code: "export_client_data"
   - Display: "Export Client Information"
   - Description: "Allows exporting client data to CSV/Excel format"
3. **Configure Details**:
   - Resource: "Organization"
   - Action: "export"
   - Scope: "organization"
4. **Set Conditions** (advanced, optional):
   ```json
   {
     "own_organization_only": true,
     "exclude_financial_data": true
   }
   ```
5. **Set Grouping**:
   - Category: "Data Management"
   - Group: "Export Operations"
6. **Configure Flags**:
   - Is system permission: No (custom permission)
   - Is dangerous: No (export is safe)
   - Requires approval: No
7. **Set UI**:
   - Sort order: 100
   - Is visible: Yes
8. **Submit** → Create permission
9. **System Actions**:
   - Create permission record
   - Available untuk assignment to roles
   - Log creation in audit trail
10. **Confirmation** → Success, redirect to permission detail
11. **Next Steps** → Assign this permission to appropriate roles

---

### 7.3 Permission Detail

**Screenshot:** `superadmin_permission_detail.png`

#### Fitur
- **Comprehensive Permission Information**
  - **Overview**
    - Permission name, code, display name
    - Description
    - Status
  - **Configuration**
    - Resource, action, scope
    - Category & group
    - Is system permission, is dangerous, requires approval
    - Sort order, visibility
  - **Conditions & Constraints**
    - JSON display of conditions
    - Explanation of what constraints mean
  - **Usage Statistics**
    - Number of roles dengan permission ini
    - Number of users dengan permission ini (via roles)
    - Organizations using this permission
  - **Assigned to Roles**
    - List of roles that have this permission
    - Direct assignment vs inherited
    - Links to role details
  - **Permission Dependencies** (jika applicable)
    - Permissions required before this one can be used
    - Related permissions (usually granted together)
  - **Audit Log**
    - Creation date & creator
    - Modification history
    - Role assignment history
- **Action Buttons**
  - Edit permission
  - Assign to roles
  - View usage report
  - Activate/Deactivate
  - Delete permission (jika not system permission)

#### Flow End User
1. **Open Permission Detail** → Click permission dari index
2. **Review Complete Configuration** → Understand exactly what this permission allows
3. **Check Usage** → See which roles dan how many users have this permission
4. **Analyze Impact** → "This permission is assigned to 3 roles, affecting 45 users across 8 organizations"
5. **Review Dependencies** → Understand prerequisites
6. **Check Audit Log** → Track when permission created, modified, assigned
7. **Take Actions**:
   - Edit configuration → Modify conditions atau constraints
   - Assign to roles → Grant permission to additional roles
   - Deactivate → Temporarily disable permission without deleting
   - Delete → Remove custom permission (dengan impact warning)

---

### 7.4 Permission Edit/Update

**Screenshot:** `superadmin_permission_update.png`

#### Fitur
- **Edit Permission Form** (pre-filled dengan current data)
- **Editable Fields** (same as create)
- **Restrictions**:
  - System permissions: Limited edits (description, conditions, UI fields only)
  - Custom permissions: Full edit access
  - Resource & action: Cannot change (would break existing role assignments)
- **Change Impact Analysis**
  - Show affected roles
  - Show affected users
  - Warn jika breaking changes
- **Validation** → Prevent invalid configurations

#### Flow End User
1. **Access Edit Page** → Click "Edit" dari permission detail
2. **Modify Fields**:
   - Update description untuk clarity
   - Modify conditions (e.g., add field-level constraint)
   - Change category untuk better organization
   - Toggle "Is dangerous" jika permission more risky than initially thought
3. **Review Impact** → "Changing conditions will affect 3 roles dan 45 users"
4. **Save Changes** → Submit
5. **System Actions**:
   - Update permission record
   - Recalculate permissions untuk affected users (clear cache)
   - Log changes in audit trail
   - Notify affected org admins (jika major changes)
6. **Confirmation** → Changes applied

**Warning:** Modifying core system permissions can break application functionality. Proceed dengan extreme caution. Usually only edit custom permissions.

---

## 8. Platform Configuration

**Screenshot:** `superadmin_platform_configuration.png`

### Fitur
- **System-wide Settings**
  - **Application Settings**
    - Application name
    - Application URL
    - Support email
    - From email address
    - Company information
  - **Subscription Plans Configuration**
    - Default plans (Starter, Professional, Enterprise)
    - Plan features & limits
    - Pricing per plan
    - Trial duration default
    - Enable/disable plans
  - **Billing Configuration**
    - Payment gateways (Midtrans, Stripe, etc.)
    - Gateway credentials (API keys, merchant IDs)
    - Currency settings
    - Tax settings (PPN/VAT rates)
    - Invoice templates
    - Auto-billing settings
  - **Usage Limits & Quotas**
    - Default quotas per plan
    - Overage handling (block, charge, warn)
    - Rate limiting (API calls, messages)
  - **Email Settings**
    - SMTP configuration
    - Email templates
    - Notification triggers
    - Email frequency settings
  - **Security Settings**
    - Password policy (global)
    - Session timeout default
    - 2FA enforcement rules
    - IP whitelist/blacklist
    - API rate limits
    - CORS settings
  - **Feature Flags** (Platform-wide)
    - Enable/disable features globally
    - Beta features toggle
    - Maintenance mode
  - **Integration Settings**
    - WhatsApp Business API credentials
    - AI provider settings (OpenAI, etc.)
    - N8N workflow integration
    - WAHA API configuration
    - Third-party service connections
  - **Storage & Media**
    - Storage provider (local, S3, Google Cloud)
    - Max file size
    - Allowed file types
    - CDN configuration
  - **Localization**
    - Available languages
    - Default timezone
    - Date/time formats
    - Currency formats
  - **Monitoring & Logging**
    - Log level (debug, info, warning, error)
    - Log retention period
    - Error reporting (Sentry, Bugsnag)
    - Performance monitoring
  - **System Maintenance**
    - Database backup schedule
    - Cleanup jobs schedule
    - Cache warming
    - Index optimization
  - **Legal & Compliance**
    - Terms of Service (ToS) URL
    - Privacy Policy URL
    - Cookie policy
    - GDPR compliance settings
    - Data retention policies

### Flow End User
1. **Access Platform Configuration** → Super Admin only, high-security section
2. **Review Current Settings** → All settings organized in tabs atau accordion
3. **Configure by Section**:

   **A. Update Application Settings**
   - Change support email
   - Update company information
   - Modify application branding

   **B. Manage Subscription Plans**
   - Edit plan pricing: Update "Professional Plan" dari Rp 500,000 to Rp 550,000
   - Modify plan limits: Increase message quota from 20,000 to 25,000
   - Create new plan: "Enterprise Plus" dengan custom features
   - Enable/disable plan: Disable "Starter" plan untuk new signups

   **C. Configure Billing**
   - Update payment gateway: Add new Stripe account
   - Set tax rate: PPN 11%
   - Customize invoice template
   - Enable auto-billing: Auto-charge on renewal

   **D. Set Usage Limits**
   - Define rate limits: 100 API calls per minute
   - Configure overage: Block service when quota exceeded
   - Set warning thresholds: Warn at 80% usage

   **E. Configure Email**
   - Update SMTP settings: New email provider
   - Customize email templates: Welcome email, invoice email
   - Set notification rules: When to send emails

   **F. Strengthen Security**
   - Enforce password policy: Min 12 characters, special chars required
   - Set session timeout: 30 minutes
   - Require 2FA: For all org admins
   - Configure IP whitelist: Allow only corporate IPs untuk super admin

   **G. Enable Features**
   - Toggle new AI features: Enable GPT-4 integration
   - Enable beta: Allow select clients to test new bot personalities
   - Maintenance mode: Schedule maintenance window

   **H. Configure Integrations**
   - Update WhatsApp API: New credentials after renewal
   - Configure AI: Set OpenAI API key, model selection (GPT-4, GPT-3.5)
   - N8N integration: Webhook URLs, authentication tokens

   **I. Storage Settings**
   - Switch storage provider: From local to AWS S3
   - Set file size limits: Max 10MB per file
   - Configure CDN: CloudFlare settings untuk media delivery

   **J. Localization**
   - Enable languages: Indonesian, English, Malay
   - Set default timezone: Asia/Jakarta
   - Configure formats: DD/MM/YYYY, 24-hour time

   **K. Monitoring**
   - Set log level: Production = "warning", Development = "debug"
   - Configure error reporting: Integrate Sentry
   - Set retention: Keep logs for 90 days

   **L. Maintenance Schedules**
   - Database backup: Daily at 2 AM
   - Cleanup jobs: Weekly on Sunday
   - Cache clear: After each deployment

   **M. Legal Compliance**
   - Update ToS URL: Link to latest terms
   - Configure GDPR: Enable data export, right to be forgotten
   - Set data retention: Delete inactive data after 2 years

4. **Test Configuration** → Many settings have "Test" button (e.g., test email, test payment gateway)
5. **Save Changes** → Save per section atau global save
6. **System Actions**:
   - Update configuration
   - Apply settings globally
   - Restart services jika needed (queue workers, cache)
   - Clear caches
   - Log configuration changes
7. **Confirmation** → Settings applied platform-wide
8. **Monitor Impact** → Check application behavior after changes, monitor error logs

---

## Hierarchy & Access Summary

| Role | Scope | Key Capabilities |
|------|-------|------------------|
| **Super Admin** | Platform-wide | • Manage all organizations<br>• Configure platform settings<br>• Manage subscription plans & pricing<br>• Access financial data cross-org<br>• Manage roles & permissions<br>• Create super admins<br>• Impersonate any user<br>• Full system access |
| **System Admin** | Platform operations | • View all organizations<br>• Limited financial access<br>• User support & troubleshooting<br>• Monitor system health<br>• Cannot modify pricing atau delete orgs |
| **Org Admin** | Single organization | • Manage own organization<br>• Manage organization users<br>• Configure bot & knowledge base<br>• View organization analytics<br>• Manage subscription (upgrade/downgrade)<br>• Cannot access other organizations |
| **Agent** | Organization (limited) | • Handle conversations<br>• View assigned conversations<br>• Use knowledge base<br>• Personal settings only<br>• No admin access |

---

## Critical Super Admin Workflows

### 1. Onboard New Client (End-to-End)
```
Create Organization → Set Subscription Plan → Create Admin User 
→ Configure Initial Settings → Send Welcome Email → Monitor Trial 
→ Convert to Paid (jika trial success) → Ongoing Support
```

### 2. Handle Payment Issues
```
Transaction History → Identify Failed Payment → Contact Client 
→ Update Payment Method → Retry Payment → Mark as Resolved 
→ Document in Notes
```

### 3. Upgrade Client Plan
```
Client Detail → Check Current Usage → Recommend Plan 
→ Change Subscription → Update Quotas → Recalculate Billing 
→ Notify Client → Monitor Satisfaction
```

### 4. Create Custom Role for Organization
```
Role Index → Create New Role → Set Permissions → Assign to Users 
→ Test Access → Document Purpose → Monitor Usage
```

### 5. Platform Maintenance
```
Platform Config → Enable Maintenance Mode → Notify Clients 
→ Perform Updates (database migration, code deployment) 
→ Test Functionality → Disable Maintenance Mode → Monitor Logs
```

### 6. Compliance Audit
```
System Admin → Export Audit Logs → Review Admin Actions 
→ Check Financial Transactions → Verify Data Retention Compliance 
→ Generate Compliance Report → Archive
```

---

## Best Practices untuk Super Admin

### Security
- ✅ Use strong, unique passwords dengan 2FA enabled
- ✅ Review audit logs regularly untuk suspicious activities
- ✅ Limit number of super admin accounts (principle of least privilege)
- ✅ Use impersonation sparingly, log reason for impersonation
- ✅ Never share super admin credentials

### Financial Management
- ✅ Reconcile payments daily
- ✅ Follow up on failed payments within 24 hours
- ✅ Review refund requests before approving
- ✅ Monitor for fraudulent transactions
- ✅ Keep financial records for audit (minimum 7 years)

### Client Management
- ✅ Respond to client inquiries promptly
- ✅ Proactively reach out to trial clients before expiration
- ✅ Monitor usage to identify upsell opportunities
- ✅ Document all client interactions in internal notes
- ✅ Regular check-ins dengan high-value clients

### Role & Permission Management
- ✅ Review permissions quarterly untuk compliance
- ✅ Follow principle of least privilege
- ✅ Test role changes in staging before production
- ✅ Document custom roles dan their purposes
- ✅ Audit role assignments regularly

### Platform Configuration
- ✅ Test configuration changes in staging first
- ✅ Document all configuration changes dengan reason
- ✅ Have rollback plan before making critical changes
- ✅ Monitor system after configuration changes
- ✅ Keep configuration backups

### Data & Compliance
- ✅ Regular database backups (automated daily)
- ✅ Test backup restoration quarterly
- ✅ Comply dengan GDPR, CCPA, local data protection laws
- ✅ Honor data deletion requests within legal timeframes
- ✅ Maintain audit trails untuk compliance

---

## Troubleshooting Common Issues

### Payment Gateway Issues
**Problem:** Payment transactions failing
**Solution:**
1. Check platform configuration → Billing settings
2. Verify API keys valid dan not expired
3. Test payment gateway connection
4. Review gateway error logs
5. Contact payment provider support jika persistent
6. Notify affected clients, provide alternative payment method

### Performance Issues
**Problem:** Platform slow, timeouts
**Solution:**
1. Check system health dashboard
2. Review database connection pool status
3. Check Redis cache status
4. Monitor queue workers (RabbitMQ)
5. Review recent high-usage clients (may need rate limiting)
6. Scale infrastructure jika needed (more workers, bigger database)

### Client Cannot Login
**Problem:** Client reports login issues
**Solution:**
1. System Admin → Search user
2. Check user status (active, suspended?)
3. Check organization status (active, expired subscription?)
4. Review failed login attempts (locked out?)
5. Reset password atau unlock account
6. Test login after fix
7. Document issue dan resolution

### Role Permissions Not Working
**Problem:** User reports permission denied errors
**Solution:**
1. System Admin → Find user
2. Check assigned roles
3. Role Detail → Review permissions
4. Verify permission assignments correct
5. Clear permission cache
6. Ask user to logout dan login again
7. Test permission after fix

### Data Inconsistency
**Problem:** Financial data doesn't match reports
**Solution:**
1. Financial Management → Export raw data
2. Run reconciliation script
3. Identify discrepancies
4. Review audit logs untuk find when inconsistency introduced
5. Correct data manually jika needed (document reason)
6. Implement validation to prevent recurrence

---

## API Integration untuk Super Admin

Super Admin dapat access platform via API untuk automation:

### Example API Endpoints
```bash
# Authentication
POST /api/v1/superadmin/auth/login

# Client Management
GET /api/v1/superadmin/organizations
POST /api/v1/superadmin/organizations
PUT /api/v1/superadmin/organizations/{id}
DELETE /api/v1/superadmin/organizations/{id}

# Financial
GET /api/v1/superadmin/transactions
GET /api/v1/superadmin/financial/reports
POST /api/v1/superadmin/transactions

# Role & Permission
GET /api/v1/superadmin/roles
POST /api/v1/superadmin/roles
PUT /api/v1/superadmin/roles/{id}/permissions

# Platform Config
GET /api/v1/superadmin/config
PUT /api/v1/superadmin/config

# Analytics
GET /api/v1/superadmin/analytics/platform
GET /api/v1/superadmin/analytics/revenue
```

---

## Monitoring & Alerts

Super Admin should configure alerts untuk:

- 🔴 **Critical**: Server down, database connection failure, payment gateway offline
- 🟡 **Warning**: High CPU usage, high memory usage, high error rate, queue backlog
- 🟢 **Info**: New client registration, high-value transaction, trial expiring soon

**Alert Channels:**
- Email (immediate for critical)
- SMS (for critical alerts)
- Slack/Discord integration (for team notifications)
- Dashboard (real-time)

---

**Version:** 1.0  
**Last Updated:** October 8, 2025  
**Role:** Super Administrator  
**Document Type:** Platform Management Documentation  
**Target Audience:** Super Admins, Platform Engineers, C-Level Executives

---

**Built on Laravel 12 + PostgreSQL + FrankenPHP Architecture**
