# Dokumentasi Fitur Organization Admin (Org Admin)

> **Role:** Organization Administrator
> 
> **Deskripsi:** Organization Admin memiliki akses penuh untuk mengelola seluruh aspek organisasi, termasuk user management, bot configuration, knowledge base, integrations, dan analytics.

---

## Daftar Isi

1. [Dashboard](#1-dashboard)
2. [Inbox & Conversation Management](#2-inbox--conversation-management)
3. [Knowledge Base Management](#3-knowledge-base-management)
4. [Bot Personalities Management](#4-bot-personalities-management)
5. [WhatsApp Integration](#5-whatsapp-integration)
6. [User Management](#6-user-management)
7. [Organization Settings](#7-organization-settings)

---

## 1. Dashboard

### 1.1 Dashboard Overview

**Screenshot:** `dashboard.png`

#### Fitur:
- **Overview Metrics**: Menampilkan ringkasan performa chatbot secara real-time
- **Quick Access**: Akses cepat ke fitur-fitur utama
- **Recent Activities**: Aktivitas terbaru dalam organisasi
- **Status Monitoring**: Status koneksi dan integrasi aktif

#### Flow End User:
1. Login sebagai Org Admin
2. Sistem menampilkan halaman dashboard sebagai landing page
3. User dapat melihat metrik penting seperti:
   - Total conversations
   - Active users
   - Response rate
   - Bot performance
4. User dapat mengklik quick action buttons untuk navigasi ke fitur lain

---

### 1.2 Dashboard Analytics

**Screenshot:** `dashboard_analytics.png`

#### Fitur:
- **Performance Charts**: Grafik performa chatbot (line, bar, pie charts)
- **Conversation Metrics**: 
  - Total conversations
  - Average response time
  - User satisfaction rate
  - Peak hours analysis
- **Filter Options**: Filter berdasarkan periode waktu (hari, minggu, bulan)
- **Export Data**: Export laporan dalam format CSV/PDF

#### Flow End User:
1. User mengakses menu "Analytics" dari sidebar atau dashboard
2. Sistem menampilkan berbagai visualisasi data analytics
3. User dapat:
   - Memilih rentang waktu untuk analisis
   - Melihat grafik interaktif
   - Hover untuk detail data spesifik
   - Export data untuk reporting
4. User dapat membandingkan performa antar periode
5. User dapat mengidentifikasi pattern dan trend untuk optimisasi

---

## 2. Inbox & Conversation Management

### 2.1 Inbox Overview

**Screenshot:** `inbox.png`

#### Fitur:
- **Conversation List**: Daftar semua percakapan aktif dan history
- **Filter & Search**: 
  - Filter by status (active, resolved, pending)
  - Search by customer name/phone
  - Filter by channel (WhatsApp, Web, etc.)
- **Conversation Status**: Visual indicator (unread, assigned, resolved)
- **Assignment**: Assign conversation ke team member tertentu
- **Bulk Actions**: Select multiple conversations untuk action

#### Flow End User:
1. User mengakses menu "Inbox" dari navigation
2. Sistem menampilkan list semua conversations
3. User dapat:
   - Melihat preview message terakhir
   - Filter conversations berdasarkan status
   - Search conversation tertentu
   - Melihat jumlah unread messages
   - Click pada conversation untuk membuka chat detail
4. User dapat melakukan bulk actions:
   - Mark as read/unread
   - Assign ke agent
   - Close conversation

---

### 2.2 Conversation Chat

**Screenshot:** `conversation_chat.png`

#### Fitur:
- **Chat Interface**: Interface chat real-time dengan customer
- **Message History**: Full history percakapan
- **Customer Info Panel**: Informasi detail customer di sidebar
- **Quick Replies**: Template response cepat
- **File Attachment**: Upload dan share files (image, document, video)
- **Bot/Human Toggle**: Switch antara bot response dan human takeover
- **Typing Indicator**: Menampilkan status typing
- **Message Status**: Delivered, read, failed indicators

#### Flow End User:
1. User memilih conversation dari inbox list
2. Sistem membuka chat interface dengan full message history
3. User dapat:
   - Membaca semua pesan dari awal conversation
   - Melihat informasi customer di panel samping
   - Mengetik dan mengirim response manual
   - Menggunakan quick reply templates
   - Attach files (gambar, dokumen)
   - Switch dari bot mode ke human mode
4. User dapat melihat real-time updates ketika customer mengirim pesan baru
5. User dapat menutup atau resolve conversation setelah selesai
6. Sistem mencatat semua aktivitas untuk audit trail

---

### 2.3 Inbox Settings

**Screenshot:** `inbox_setting.png`

#### Fitur:
- **Auto-Assignment Rules**: Konfigurasi aturan assignment otomatis
- **Business Hours**: Set jam operasional
- **Auto-Reply Settings**: Konfigurasi auto-reply untuk di luar jam kerja
- **Priority Rules**: Atur prioritas conversation berdasarkan kriteria
- **SLA Configuration**: Set Service Level Agreement targets
- **Notification Settings**: Konfigurasi notifikasi (email, push, sound)

#### Flow End User:
1. User mengakses "Settings" icon di Inbox page
2. Sistem menampilkan halaman inbox configuration
3. User dapat mengkonfigurasi:
   - **Auto-Assignment**: 
     - Enable/disable auto assignment
     - Set assignment rules (round-robin, skill-based, load-based)
     - Define agent availability
   - **Business Hours**:
     - Set operational hours per hari
     - Define timezone
     - Set holiday calendar
   - **Auto-Reply**:
     - Create auto-reply message template
     - Set triggers (outside business hours, all agents busy)
   - **Notifications**:
     - Configure notification channels
     - Set notification frequency
     - Define notification rules
4. User click "Save" untuk apply perubahan
5. Sistem memvalidasi dan apply settings

---

## 3. Knowledge Base Management

### 3.1 Knowledge Base Index

**Screenshot:** `knowledge_base_index.png`

#### Fitur:
- **Knowledge Base List**: Daftar semua knowledge base yang tersedia
- **Search & Filter**: Cari knowledge base berdasarkan nama, tag, kategori
- **Status Indicator**: Active/inactive knowledge base
- **Usage Statistics**: Statistik penggunaan masing-masing KB
- **Quick Actions**: Edit, delete, duplicate, activate/deactivate
- **Bulk Upload**: Upload multiple documents sekaligus
- **Categories/Tags**: Organisasi KB dengan categories dan tags

#### Flow End User:
1. User mengakses menu "Knowledge Base" dari navigation
2. Sistem menampilkan list semua knowledge base entries
3. User dapat melihat:
   - Nama knowledge base
   - Status (active/inactive)
   - Last updated date
   - Usage count
4. User dapat:
   - Search knowledge base tertentu
   - Filter by category atau tag
   - Sort by name, date, usage
   - Click "Create New" untuk tambah KB baru
   - Click action buttons (edit, delete, view details)
5. User dapat melihat statistik:
   - Total KB entries
   - Total size
   - Most used KB

---

### 3.2 Knowledge Base Create/Edit

**Screenshot:** `knowledge_base_create_edit.png`

#### Fitur:
- **Multiple Input Methods**:
  - Paste text directly
  - Import from URL/Website
  - Connect to external sources (Google Drive, Notion, etc.)
- **Content Editor**: Rich text editor untuk manual input
- **Metadata Configuration**:
  - Title/Name
  - Description
  - Category
  - Tags
  - Priority
- **Preview**: Preview bagaimana bot akan menggunakan KB
- **Chunking Settings**: Konfigurasi bagaimana content dipecah untuk processing
- **Validation**: Auto-validate content quality dan relevance

#### Flow End User:

**Create New Knowledge Base:**
1. User click button "Create New Knowledge Base" dari index page
2. Sistem menampilkan form creation
3. User melakukan:
   - **Step 1: Choose Input Method**
     - Pilih method: Upload File, Paste Text, Import URL, atau Manual Entry
   - **Step 2: Input Content**
     - Upload file atau input content sesuai method yang dipilih
     - Sistem auto-extract dan preview content
   - **Step 3: Configure Metadata**
     - Input title (required)
     - Input description
     - Select category
     - Add tags untuk searchability
     - Set priority level (high, medium, low)
   - **Step 4: Configure Processing**
     - Set chunking strategy
     - Configure embedding settings
     - Set retrieval parameters
   - **Step 5: Preview & Validate**
     - Preview bagaimana bot akan menggunakan KB
     - Test dengan sample queries
     - View generated embeddings
4. User click "Save" atau "Save & Activate"
5. Sistem process content dan generate embeddings
6. Sistem menampilkan success message dan redirect ke index page

**Edit Existing Knowledge Base:**
1. User click "Edit" button pada KB entry di index page
2. Sistem load KB data dan tampilkan edit form (sama dengan create form)
3. User melakukan perubahan pada:
   - Content (replace file, update text)
   - Metadata (title, description, tags)
   - Settings (priority, processing config)
4. User click "Update"
5. Sistem re-process jika ada perubahan content
6. Sistem update metadata dan redirect ke index page

---

## 4. Bot Personalities Management

### 4.1 Bot Personalities Index

**Screenshot:** `bot_personalities_index.png`

#### Fitur:
- **Personalities List**: Daftar semua bot personalities yang tersedia
- **Active Personality Indicator**: Menunjukkan personality yang sedang aktif
- **Quick Preview**: Preview singkat personality configuration
- **Template Gallery**: Template personalities siap pakai
- **Clone Feature**: Duplicate existing personality untuk customization
- **Version History**: Track perubahan personality over time

#### Flow End User:
1. User mengakses menu "Bot Personalities" dari navigation
2. Sistem menampilkan list semua personalities yang telah dibuat
3. User dapat melihat:
   - Nama personality
   - Status (Active/Inactive)
   - Description singkat
   - Last modified date
   - Usage statistics
4. User dapat:
   - Melihat personality mana yang currently active
   - Search dan filter personalities
   - Create new personality dari scratch atau template
   - Edit existing personality
   - Delete personality yang tidak digunakan
   - Clone personality untuk variasi
   - Activate/deactivate personality
5. User dapat switch active personality untuk A/B testing

---

### 4.2 Bot Personalities Create

**Screenshot:** `bot_personalities_create.png`

#### Fitur:
- **Basic Information**:
  - Personality name
  - Description
  - Bot avatar/image
- **Personality Configuration**:
  - Tone of voice (formal, casual, friendly, professional)
  - Language style
  - Response length preference
  - Emoji usage
- **Behavior Settings**:
  - Greeting message
  - Fallback responses
  - Conversation style
  - Proactivity level
- **System Prompts**: Custom system prompts untuk guide bot behavior
- **Template Selection**: Pilih dari pre-built personality templates

#### Flow End User:
1. User click button "Create New Personality" dari index page
2. Sistem menampilkan creation wizard atau form
3. User melakukan:
   - **Step 1: Choose Template or Start from Scratch**
     - Pilih template (Customer Service, Sales, Technical Support, etc.)
     - Atau start with blank personality
   - **Step 2: Basic Information**
     - Input personality name (e.g., "Friendly Customer Support Bot")
     - Add description
     - Upload bot avatar
   - **Step 3: Define Personality Traits**
     - Select tone: Formal ↔ Casual slider
     - Select energy: Reserved ↔ Enthusiastic slider
     - Emoji usage: None/Minimal/Moderate/Frequent
     - Response length: Concise/Moderate/Detailed
     - Formality level: Professional/Neutral/Casual
   - **Step 4: Configure Behavior**
     - Input greeting message template
     - Define fallback responses
     - Set conversation flow preferences
     - Configure proactivity (offer help, ask clarifying questions)
   - **Step 5: Advanced - System Prompts**
     - Write or edit system prompt yang guide bot behavior
     - Define do's and don'ts
     - Set context awareness rules
   - **Step 6: Test**
     - Test personality dengan sample conversations
     - Refine berdasarkan hasil test
4. User click "Save" atau "Save & Activate"
5. Sistem save configuration
6. Sistem redirect ke personality detail page atau index

---

### 4.3 Bot Personalities Detail

**Screenshot:** `bot_personalities_detail.png`

#### Fitur:
- **Personality Overview**: Summary lengkap personality configuration
- **Configuration Display**: View all settings dalam organized layout
- **Performance Metrics**: 
  - User satisfaction scores when using this personality
  - Conversation success rate
  - Average conversation length
  - Common user feedback
- **Sample Conversations**: Example conversations menggunakan personality ini
- **A/B Test Results**: Jika personality digunakan dalam A/B testing
- **Action Buttons**: Edit, Clone, Delete, Activate/Deactivate

#### Flow End User:
1. User click pada personality name dari index page
2. Sistem menampilkan detail page dengan full configuration
3. User dapat melihat:
   - **Overview Section**:
     - Personality name, description, status
     - Created date dan last modified
     - Current usage (active/inactive)
   - **Configuration Section**:
     - Semua personality traits dan settings
     - System prompts yang digunakan
     - Behavior rules
   - **Performance Metrics** (jika personality pernah active):
     - User satisfaction scores
     - Conversation statistics
     - Performance comparison dengan personalities lain
   - **Sample Conversations**:
     - Real example conversations menggunakan personality ini
     - Highlight typical responses
   - **Version History**:
     - Track perubahan configuration over time
     - Option untuk rollback ke version sebelumnya
4. User dapat:
   - Click "Edit" untuk modify personality
   - Click "Clone" untuk create variation
   - Click "Activate" untuk set sebagai active personality
   - Click "Delete" untuk remove (jika tidak active)
   - Click "Test" untuk try personality di test environment

---

### 4.4 Bot Personalities Update

**Screenshot:** `bot_personalities_update.png`

#### Fitur:
- **Edit Form**: Similar dengan create form tapi pre-filled dengan existing data
- **Change Tracking**: Visual indicator untuk fields yang diubah
- **Preview Changes**: Preview bagaimana changes affect bot responses
- **Version Control**: Create new version atau update existing
- **Rollback Option**: Kemampuan untuk rollback jika needed

#### Flow End User:
1. User click "Edit" button dari detail page atau index page
2. Sistem load existing personality data ke edit form
3. User melakukan perubahan pada:
   - Basic information (name, description, avatar)
   - Personality traits (tone, style, emoji usage, etc.)
   - Behavior settings (greetings, fallbacks, flow)
   - System prompts
4. Sistem highlight fields yang diubah (change tracking)
5. User dapat:
   - Preview changes dengan test conversations
   - Compare current vs new configuration
   - See impact analysis (jika ada)
6. User memilih:
   - "Update" - Update version yang ada (for minor changes)
   - "Save as New Version" - Create new version (for major changes)
   - "Cancel" - Discard changes
7. Sistem save perubahan dan update timestamp
8. Jika personality currently active, sistem dapat:
   - Apply changes immediately, atau
   - Schedule changes untuk deployment di waktu tertentu
9. Sistem redirect ke detail page dengan success message

---

## 5. WhatsApp Integration

### 5.1 WhatsApp Integration Index

**Screenshot:** `whatsapp_integration_index.png`

#### Fitur:
- **Connected Accounts**: List semua WhatsApp accounts yang terconnect
- **Account Status**: Online/offline status dan connection health
- **Connection Method**: WhatsApp Business API atau WhatsApp Web
- **Account Information**:
  - Phone number
  - Display name
  - Profile picture
  - Connection date
- **Message Statistics**: Stats untuk masing-masing connected account
- **Quick Actions**: Disconnect, reconnect, settings
- **Add New Account**: Connect WhatsApp account baru

#### Flow End User:
1. User mengakses menu "WhatsApp Integration" dari navigation
2. Sistem menampilkan list semua WhatsApp accounts
3. User dapat melihat:
   - Semua connected WhatsApp numbers
   - Status masing-masing connection (active, disconnected, error)
   - Message statistics per account
   - Last active timestamp
4. User dapat:
   - View detail masing-masing account
   - Disconnect account
   - Reconnect jika connection lost
   - Access account settings
   - Click "Add New Account" untuk connect WhatsApp baru
5. Sistem menampilkan alerts jika ada connection issues
6. User dapat monitor health status real-time

---

### 5.2 QR Code Scan (WhatsApp Connection)

**Screenshot:** `qr_code_scan.png`

#### Fitur:
- **QR Code Display**: Large QR code untuk scanning
- **Auto-Refresh**: QR code auto-refresh setiap beberapa detik
- **Connection Instructions**: Step-by-step guide untuk user
- **Connection Status**: Real-time status update
- **Alternative Methods**: Link ke WhatsApp Business API setup
- **Troubleshooting**: Help section untuk common issues

#### Flow End User:

**Connect WhatsApp via Web (QR Code):**
1. User click "Add New Account" atau "Connect WhatsApp" dari index page
2. User memilih connection method:
   - WhatsApp Web (QR Code) - untuk quick setup
   - WhatsApp Business API - untuk enterprise solution
3. Jika pilih WhatsApp Web, sistem menampilkan QR code page
4. User melihat:
   - Large QR code di center
   - Step-by-step instructions:
     ```
     1. Buka WhatsApp di smartphone Anda
     2. Tap Menu (⋮) atau Settings
     3. Pilih "Linked Devices"
     4. Tap "Link a Device"
     5. Scan QR code yang ditampilkan
     ```
   - QR code auto-refresh timer
   - Connection status indicator
5. User scan QR code menggunakan WhatsApp mobile app
6. Sistem detect scan dan menampilkan "Connecting..." status
7. Setelah berhasil connect:
   - Sistem menampilkan success message
   - Show connected account information
   - Redirect ke WhatsApp settings page atau index
8. Jika gagal atau timeout:
   - Sistem generate new QR code
   - Display troubleshooting tips

**Connect WhatsApp Business API:**
1. User pilih "WhatsApp Business API" method
2. Sistem redirect ke API configuration page
3. User input:
   - Phone number
   - API credentials
   - Webhook URL
   - Verification token
4. Follow API setup wizard
5. Verify connection
6. Complete configuration

---

## 6. User Management

### 6.1 User Management Index

**Screenshot:** `user_management_index.png`

#### Fitur:
- **User List**: Daftar semua users dalam organization
- **User Information Display**:
  - Name
  - Email
  - Role (Org Admin, Agent, Viewer, etc.)
  - Status (Active, Inactive, Pending)
  - Last login
- **Search & Filter**:
  - Search by name atau email
  - Filter by role
  - Filter by status
  - Filter by department/team
- **Bulk Actions**: Select multiple users untuk action
- **User Statistics**: Total users, active users, pending invitations
- **Quick Actions**: Edit, view detail, deactivate, resend invitation

#### Flow End User:
1. User mengakses menu "User Management" dari navigation
2. Sistem menampilkan table/list semua users
3. User dapat melihat:
   - Overview statistics (total users, active, inactive, pending)
   - List semua users dengan informasi basic
   - Role assignment masing-masing user
   - Last activity timestamp
4. User dapat:
   - Search user specific by name atau email
   - Filter users by:
     - Role (Org Admin, Agent, Viewer)
     - Status (Active, Inactive, Pending Invitation)
     - Department atau team
   - Sort by name, email, join date, last login
   - Click pada user untuk view detail
   - Click "Create New User" atau "Invite User"
   - Perform quick actions dari table:
     - Edit user
     - View details
     - Deactivate/activate
     - Resend invitation
     - Delete user
5. User dapat bulk select dan perform actions:
   - Bulk activate/deactivate
   - Bulk role assignment
   - Bulk delete

---

### 6.2 User Management Detail

**Screenshot:** `user_management_detail.png`

#### Fitur:
- **User Profile Information**:
  - Profile photo
  - Full name
  - Email address
  - Phone number
  - Role dan permissions
  - Department/team
  - Join date
- **Activity Log**: History aktivitas user
- **Performance Metrics**: 
  - Conversations handled
  - Average response time
  - Customer satisfaction rating
- **Permissions Detail**: Detailed view of user permissions
- **Session Information**: Active sessions dan devices
- **Action Buttons**: Edit, deactivate, reset password, delete

#### Flow End User:
1. User click pada user name dari user list
2. Sistem menampilkan detail page dengan comprehensive information
3. User dapat melihat:
   - **Profile Section**:
     - User photo dan basic info
     - Contact information
     - Current role dan status
     - Join date dan last login
   - **Role & Permissions Section**:
     - Assigned role (Org Admin, Agent, Viewer, etc.)
     - Detailed permissions list
     - Access level untuk masing-masing feature
   - **Activity Log**:
     - Recent activities
     - Login history
     - Action performed (created KB, modified bot, etc.)
     - Timestamp untuk semua activities
   - **Performance Metrics** (for Agent role):
     - Total conversations handled
     - Average response time
     - Average handle time
     - Customer satisfaction scores
     - Peak performance hours
   - **Team & Department**:
     - Assigned team atau department
     - Team members lainnya
   - **Session Information**:
     - Active sessions
     - Devices yang digunakan
     - Last IP address
4. User dapat:
   - Click "Edit" untuk modify user information
   - Click "Change Role" untuk reassign role
   - Click "Deactivate" untuk deactivate user account
   - Click "Reset Password" untuk send reset password email
   - Click "View Activity Log" untuk detailed audit trail
   - Click "Delete" untuk permanently remove user
5. Sistem log semua views untuk audit purposes

---

### 6.3 User Management Create

**Screenshot:** `user_management_create.png`

#### Fitur:
- **User Information Form**:
  - Full name (required)
  - Email address (required)
  - Phone number (optional)
  - Profile photo upload
- **Role Selection**: Pilih role untuk user baru
- **Permission Configuration**: Customize permissions jika needed
- **Team/Department Assignment**: Assign ke team atau department
- **Invitation Settings**: 
  - Send invitation immediately atau later
  - Custom invitation message
  - Set temporary password atau force password creation
- **Bulk Import**: Import multiple users via CSV

#### Flow End User:

**Create Single User:**
1. User click "Create New User" atau "Invite User" button dari index
2. Sistem menampilkan user creation form
3. User mengisi:
   - **Step 1: Basic Information**
     - Input full name (required)
     - Input email address (required, must be unique)
     - Input phone number (optional)
     - Upload profile photo (optional)
   - **Step 2: Role & Permissions**
     - Select role dari dropdown:
       - Organization Admin (full access)
       - Agent (handle conversations, limited admin)
       - Viewer (read-only access)
       - Custom (custom permissions)
     - Jika pilih Custom, configure detailed permissions:
       - Can view conversations
       - Can reply to conversations
       - Can manage knowledge base
       - Can manage bot personalities
       - Can view analytics
       - Can manage users
       - etc.
   - **Step 3: Team Assignment**
     - Select department atau team
     - Assign as team leader (optional)
   - **Step 4: Invitation Settings**
     - Choose invitation method:
       - Send email invitation immediately
       - Generate invitation link to send manually
       - Create account without invitation (set temporary password)
     - Customize invitation email message (optional)
     - Set account activation deadline
4. User review semua information
5. User click "Create User" atau "Create & Send Invitation"
6. Sistem:
   - Validate all inputs
   - Create user account
   - Send invitation email (jika dipilih)
   - Generate temporary password (jika dipilih)
   - Show success message dengan invitation link/details
7. Sistem redirect ke user detail page atau index

**Bulk Import Users:**
1. User click "Bulk Import" button
2. Sistem provide CSV template untuk download
3. User download template dan fill dengan user data
4. User upload completed CSV file
5. Sistem:
   - Validate CSV format dan data
   - Show preview of users to be imported
   - Highlight any errors atau duplicates
6. User review dan confirm import
7. Sistem create all users dan send invitations
8. Show import summary (successful, failed, duplicates)

---

### 6.4 User Management Edit

**Screenshot:** `user_management_edit.png`

#### Fitur:
- **Edit Form**: Pre-filled form dengan existing user data
- **Editable Fields**:
  - Name
  - Email
  - Phone
  - Profile photo
  - Role
  - Permissions
  - Team assignment
  - Status (active/inactive)
- **Password Reset**: Option untuk reset user password
- **Change Tracking**: Track perubahan untuk audit
- **Validation**: Real-time validation untuk changes

#### Flow End User:
1. User click "Edit" button dari user detail atau index page
2. Sistem load user data ke edit form
3. Form menampilkan current values untuk semua fields
4. User dapat modify:
   - **Basic Information**:
     - Update full name
     - Update email (dengan validation)
     - Update phone number
     - Change profile photo
   - **Role & Permissions**:
     - Change role
     - Modify permissions (jika custom role)
     - Add atau remove specific permissions
   - **Team Assignment**:
     - Reassign ke team lain
     - Update team role (member, leader)
   - **Account Status**:
     - Activate/deactivate account
     - Lock account (temporary suspension)
   - **Additional Settings**:
     - Force password change on next login
     - Require 2FA (two-factor authentication)
     - Set account expiration date
5. Sistem perform real-time validation
6. Sistem highlight modified fields
7. User dapat:
   - Click "Save Changes" untuk apply modifications
   - Click "Reset Password" untuk send password reset email
   - Click "Cancel" untuk discard changes
8. Jika user mengubah critical settings (role, permissions):
   - Sistem menampilkan confirmation dialog
   - Explain impact of changes
9. Setelah confirm:
   - Sistem save changes
   - Log perubahan untuk audit trail
   - Send notification ke affected user (jika applicable)
   - Show success message
10. Sistem redirect ke user detail page dengan updated information

---

## 7. Organization Settings

**Screenshot:** `organization_setting.png`

#### Fitur:
- **Organization Profile**:
  - Organization name
  - Logo upload
  - Primary color/branding
  - Timezone
  - Default language
- **Subscription & Billing**:
  - Current plan details
  - Usage statistics
  - Billing information
  - Payment method
  - Invoice history
- **Security Settings**:
  - Two-factor authentication policy
  - Password policy
  - Session timeout
  - IP whitelist
  - API keys management
- **Notification Preferences**:
  - Email notifications
  - SMS notifications
  - Webhook configurations
- **Integration Settings**:
  - API endpoints
  - Webhook URLs
  - Third-party integrations
- **Data & Privacy**:
  - Data retention policy
  - GDPR compliance settings
  - Export data options
  - Delete organization option

#### Flow End User:
1. User mengakses "Organization Settings" dari profile menu atau navigation
2. Sistem menampilkan settings page dengan multiple sections/tabs
3. User dapat configure:

   **A. Organization Profile:**
   - Update organization name
   - Upload/change logo
   - Set brand colors (primary, secondary)
   - Select timezone (untuk timestamp display)
   - Set default language
   - Input organization details (address, contact info)
   
   **B. Subscription & Billing:**
   - View current plan:
     - Plan name (Starter, Professional, Enterprise)
     - Features included
     - Usage limits (messages/month, users, KB size)
   - View usage statistics:
     - Messages sent this month
     - Storage used
     - Active users
     - Progress bars dan alerts untuk limits
   - Manage billing:
     - View current billing cycle
     - Update payment method
     - Download invoices
     - View payment history
   - Upgrade/downgrade plan:
     - Compare plans
     - Select new plan
     - Process payment
   
   **C. Security Settings:**
   - Two-Factor Authentication:
     - Enable/disable 2FA for all users
     - Make 2FA mandatory
   - Password Policy:
     - Minimum password length
     - Require special characters
     - Password expiration period
     - Prevent password reuse
   - Session Management:
     - Set session timeout duration
     - Enable "remember me" option
     - Force logout after inactivity
   - IP Whitelist:
     - Add allowed IP addresses
     - Block all other IPs
   - API Keys:
     - Generate new API keys
     - View existing keys
     - Revoke keys
     - Set key permissions dan expiration
   
   **D. Notification Preferences:**
   - Email Notifications:
     - Enable/disable global email notifications
     - Configure notification types:
       - New user registration
       - Failed login attempts
       - High conversation volume
       - Bot errors
       - Billing alerts
     - Set notification recipients
   - SMS Notifications (jika available):
     - Configure SMS alerts
     - Set phone numbers
   - Webhooks:
     - Add webhook URLs
     - Select events untuk trigger webhooks
     - Configure retry logic
     - View webhook logs
   
   **E. Integration Settings:**
   - API Configuration:
     - View API documentation link
     - Copy API endpoint URLs
     - Configure rate limits
   - Third-Party Integrations:
     - Connect dengan CRM (Salesforce, HubSpot)
     - Connect dengan Help Desk (Zendesk, Freshdesk)
     - Connect dengan Analytics (Google Analytics)
     - Configure OAuth connections
   
   **F. Data & Privacy:**
   - Data Retention:
     - Set retention period untuk conversations
     - Set retention period untuk analytics data
     - Configure automatic deletion
   - GDPR Compliance:
     - Enable data anonymization
     - Configure consent management
     - Set data processing terms
   - Export Data:
     - Export all organization data
     - Select data types untuk export
     - Choose format (JSON, CSV)
     - Download exported files
   - Danger Zone:
     - Delete organization (requires confirmation)
     - Transfer ownership
     - Suspend organization

4. User modify settings sesuai kebutuhan
5. Sistem perform real-time validation
6. User click "Save" pada masing-masing section
7. Sistem:
   - Validate changes
   - Apply settings
   - Send confirmation
   - Log changes untuk audit
8. Untuk critical changes (security, deletion):
   - Sistem require password confirmation atau 2FA
   - Show impact warnings
   - Require explicit confirmation

---

## Summary Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      ORG ADMIN LOGIN                         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                        DASHBOARD                             │
│  • Overview Metrics  • Analytics  • Quick Actions            │
└──┬────────┬────────┬────────┬────────┬────────┬────────┬───┘
   │        │        │        │        │        │        │
   │        │        │        │        │        │        │
   ▼        ▼        ▼        ▼        ▼        ▼        ▼
┌─────┐┌────────┐┌──────┐┌──────┐┌─────────┐┌──────┐┌──────┐
│Inbox││Knowledge││Bot   ││WhatsApp││User   ││Org   ││Analytics│
│     ││Base    ││Pers  ││Integr ││Mgmt   ││Settings││       │
└─────┘└────────┘└──────┘└──────┘└─────────┘└──────┘└──────┘
```

---

## Kesimpulan

Role **Organization Admin** memiliki kontrol penuh terhadap sistem chatbot SaaS, meliputi:

✅ **Dashboard & Analytics** - Monitoring performa dan metrics
✅ **Inbox Management** - Mengelola conversations dan customer interactions
✅ **Knowledge Base** - Mengelola bot knowledge dan training data
✅ **Bot Personalities** - Customize bot behavior dan personality
✅ **WhatsApp Integration** - Connect dan manage WhatsApp accounts
✅ **User Management** - Mengelola team members dan permissions
✅ **Organization Settings** - Configure organization-wide settings dan policies

Setiap fitur dirancang dengan user-friendly interface dan comprehensive controls untuk memastikan org admin dapat efficiently manage seluruh operasional chatbot organization.

---

**Version:** 1.0  
**Last Updated:** October 8, 2025  
**Role:** Organization Administrator  
**Document Type:** Feature Documentation
