# Dokumentasi Fitur Agent

> **Role:** Agent / Customer Service Agent
> 
> **Deskripsi:** Agent adalah user yang bertanggung jawab untuk menangani conversations dengan customers, menjawab pertanyaan, dan memberikan support. Agent memiliki akses terbatas dibandingkan Organization Admin, fokus pada conversation management dan personal settings.

---

## Daftar Isi

1. [Dashboard](#1-dashboard)
2. [Inbox Management](#2-inbox-management)
3. [Conversation Chat](#3-conversation-chat)
4. [Profile Settings](#4-profile-settings)
5. [Availability Settings](#5-availability-settings)
6. [Notification Settings](#6-notification-settings)

---

## 1. Dashboard

**Screenshot:** `agent_dashboard.png`

### Fitur:
- **Personal Performance Metrics**: Statistik performa personal agent
  - Total conversations handled today/this week
  - Average response time
  - Average handle time
  - Customer satisfaction rating
- **Active Conversations Counter**: Jumlah conversations yang sedang aktif/assigned
- **Queue Status**: Jumlah conversations dalam queue menunggu assignment
- **Quick Stats Cards**:
  - Resolved conversations
  - Pending conversations
  - Average rating
  - Response rate
- **Recent Conversations**: List conversations terbaru yang di-handle
- **Performance Charts**: Grafik performa (daily, weekly, monthly)
- **Today's Activity Timeline**: Timeline aktivitas hari ini
- **Quick Actions**: 
  - View Inbox
  - Set Availability
  - Access Settings

### Flow End User:

1. **Login sebagai Agent**
   - Agent login menggunakan credentials yang diberikan org admin
   - Sistem authenticate dan verify role

2. **Landing di Dashboard**
   - Sistem automatically redirect ke dashboard setelah login
   - Dashboard menampilkan overview performa personal agent

3. **Melihat Personal Metrics**
   - Agent dapat melihat metrics personal seperti:
     - **Today's Stats**: 
       - Conversations handled: 15
       - Avg response time: 2.5 minutes
       - Avg handle time: 8 minutes
       - Customer satisfaction: 4.5/5.0
     - **This Week Stats**:
       - Total conversations: 87
       - Resolved: 82
       - Pending: 5
       - Rating trend graph
   - Visual indicators (colors, icons) untuk quick assessment:
     - Green: Meeting targets
     - Yellow: Near target
     - Red: Below target

4. **Monitoring Active Work**
   - **Active Conversations Section**:
     - Show jumlah conversations currently assigned to agent
     - Quick link untuk jump ke inbox
   - **Queue Status**:
     - Show jumlah unassigned conversations dalam queue
     - Agent dapat claim conversations dari queue

5. **Review Recent Activities**
   - **Recent Conversations List**:
     - Show 5-10 recent conversations
     - Display: Customer name, last message preview, status, time
     - Click untuk open conversation
   - **Activity Timeline**:
     - Chronological log aktivitas hari ini
     - Examples: "9:15 AM - Resolved conversation with John", "10:30 AM - Started chat with Sarah"

6. **View Performance Charts**
   - **Response Time Chart**: Line graph showing response time trend
   - **Conversation Volume Chart**: Bar chart showing daily conversation volume
   - **Rating Trend**: Line graph showing customer satisfaction over time
   - Agent dapat:
     - Hover untuk detail data points
     - Switch time period (today, week, month)
     - Compare dengan team average (jika available)

7. **Quick Actions**
   - **"Go to Inbox" Button**: Navigate langsung ke inbox untuk handle conversations
   - **"Set Availability" Button**: Quick toggle availability status
   - **"View Full Analytics" Link**: Link ke detailed analytics page (jika available)

8. **Status Indicator**
   - Dashboard header menampilkan current status:
     - 🟢 Online (Available)
     - 🟡 Away
     - 🔴 Offline
   - Quick toggle untuk change status

9. **Refresh & Real-time Updates**
   - Dashboard auto-refresh metrics setiap beberapa menit
   - Real-time notification jika ada new conversation assigned
   - Badge notifications untuk unread messages

---

## 2. Inbox Management

**Screenshot:** `agent_inbox_list.png`

### Fitur:
- **Conversation List**: Daftar semua conversations assigned ke agent atau dalam queue
- **Conversation Preview**:
  - Customer name/phone number
  - Last message preview
  - Timestamp
  - Unread message badge
  - Channel indicator (WhatsApp, Web, etc.)
- **Filtering Options**:
  - All conversations
  - Assigned to me
  - Unassigned (queue)
  - Resolved
  - Pending
- **Search Bar**: Search conversations by customer name, phone, atau message content
- **Sort Options**:
  - Newest first
  - Oldest first
  - Priority
  - Unread first
- **Status Labels**:
  - New (belum dibalas)
  - Active (ongoing conversation)
  - Waiting (menunggu customer response)
  - Resolved
- **Quick Actions per Conversation**:
  - Open chat
  - Assign to me
  - Mark as resolved
  - Add note
- **Bulk Selection**: Select multiple conversations untuk bulk actions
- **Pagination**: Navigate through conversation pages

### Flow End User:

1. **Akses Inbox**
   - Agent click "Inbox" dari navigation menu atau dashboard
   - Sistem load dan display conversation list

2. **View Conversation List**
   - Inbox menampilkan list conversations dengan preview:
     ```
     [Avatar] Customer Name                              3m ago
            Last message preview text here...            📱 [2]
     ```
   - Badge indicators:
     - Blue badge: Unread message count
     - Channel icon: WhatsApp/Web/etc.
     - Priority flag: High priority conversations
     - Status label: New/Active/Waiting/Resolved

3. **Filter Conversations**
   - Agent dapat filter untuk focus pada specific conversations:
     - **"Mine" Tab**: Show hanya conversations assigned to agent
       - Display: 12 conversations
       - Auto-sorted by newest message
     - **"Queue" Tab**: Show unassigned conversations
       - Agent dapat claim conversations dari sini
     - **"All" Tab**: Show semua conversations (mine + queue)
     - **"Resolved" Tab**: Show completed conversations
       - Untuk reference atau follow-up
   - Filter tambahan:
     - By channel (WhatsApp, Web)
     - By status (new, active, waiting)
     - By priority (high, normal, low)
     - By date range

4. **Search Conversations**
   - Agent dapat search menggunakan search bar:
     - Type customer name: "John Smith"
     - Type phone number: "+6281234567890"
     - Type message content: "order status"
   - Sistem perform real-time search dan highlight matches
   - Search results update instantly

5. **Sort Conversations**
   - Agent dapat sort conversation list:
     - **Newest First**: Latest message di top (default)
     - **Oldest First**: Oldest unanswered message di top
     - **Priority**: High priority conversations di top
     - **Unread First**: Conversations with unread messages di top
   - Click sort dropdown dan pilih sort method

6. **Claim Conversation dari Queue**
   - Untuk unassigned conversations:
     - Agent view conversation di "Queue" tab
     - Hover over conversation untuk show "Assign to Me" button
     - Click "Assign to Me"
     - Sistem assign conversation ke agent
     - Conversation move dari queue ke "Mine" tab
     - Notification sent ke system (untuk tracking)

7. **Open Conversation**
   - Agent click pada conversation card/row
   - Sistem open conversation chat interface
   - Detail conversation view muncul (lihat section #3)

8. **Quick Actions**
   - Tanpa open conversation, agent dapat:
     - **Hover** over conversation untuk show action menu
     - **Mark as Resolved**: Quick resolve tanpa open
     - **Add Note**: Add internal note untuk team
     - **Reassign**: Reassign ke agent lain (jika ada permission)
     - **Set Priority**: Change priority level
     - **Snooze**: Snooze conversation untuk follow-up nanti

9. **Bulk Actions**
   - Agent dapat select multiple conversations:
     - Click checkbox pada multiple conversations
     - Bulk action bar appear di top
     - Available actions:
       - Mark all as read
       - Resolve selected
       - Change priority
       - Export conversations
   - Click bulk action button
   - Confirm action
   - Sistem apply ke all selected conversations

10. **Real-time Updates**
    - Inbox auto-refresh untuk new messages:
      - New message badge update real-time
      - Conversation auto-move ke top jika ada new message
      - Desktop/sound notification (based on agent settings)
      - Visual highlight untuk new/updated conversations

11. **Pagination & Load More**
    - Jika conversations lebih dari display limit:
      - Show "Load More" button di bottom
      - Atau pagination controls (1, 2, 3, ...)
      - Infinite scroll option (jika enabled)
    - Agent navigate untuk view more conversations

---

## 3. Conversation Chat

**Screenshot:** `agent_conversation_chat.png`

### Fitur:
- **Chat Interface**: Full-screen atau split-view chat interface
- **Message History**: Complete conversation history dari awal
- **Customer Info Panel**: Sidebar dengan customer information
  - Customer name
  - Phone number/email
  - Profile picture
  - Previous conversation count
  - Tags/labels
  - Custom fields
  - Conversation history
- **Message Input Area**:
  - Text input box dengan rich text support
  - Character counter
  - Emoji picker
  - Formatting tools (bold, italic, etc.)
- **File Attachments**:
  - Upload dan send images
  - Upload dan send documents (PDF, DOCX, etc.)
  - Upload dan send videos
  - Drag & drop support
  - File preview before sending
- **Quick Replies**: Pre-defined response templates
- **Canned Responses**: Library of saved responses untuk common questions
- **Bot/Human Toggle**: Switch conversation dari bot ke human (manual mode)
- **Typing Indicator**: 
  - Show ketika customer is typing
  - Show ketika agent is typing (to customer)
- **Message Status Indicators**:
  - Sent (single checkmark)
  - Delivered (double checkmark)
  - Read (blue checkmarks)
  - Failed (red x icon)
- **Conversation Actions**:
  - Transfer to another agent
  - Add internal notes
  - Add tags/labels
  - Set priority
  - Resolve conversation
  - Reopen conversation
- **Message Timestamps**: Timestamp untuk setiap message
- **Conversation Timeline**: Timeline view of conversation events
- **Search in Conversation**: Search specific message dalam conversation
- **Customer Sentiment Indicator**: Visual indicator of customer mood (jika ada AI sentiment analysis)

### Flow End User:

1. **Open Conversation**
   - Agent click conversation dari inbox list
   - Sistem load conversation chat interface
   - Layout biasanya:
     - Left: Message thread (full conversation history)
     - Right: Customer info panel
     - Bottom: Message input area

2. **Review Conversation History**
   - Agent melihat full conversation history:
     - Scroll ke atas untuk view older messages
     - Messages grouped by date dengan date separators
     - Each message shows:
       - Sender (Customer atau Bot atau Agent name)
       - Message content
       - Timestamp (relative: "2 minutes ago" atau absolute: "10:30 AM")
       - Status indicators (sent/delivered/read)
   - System messages ditampilkan juga:
     - "Conversation started"
     - "Bot handed over to agent"
     - "Agent John joined the conversation"
     - "Conversation resolved"

3. **Review Customer Information**
   - **Customer Info Panel** di kanan shows:
     - **Basic Info**:
       - Profile photo
       - Full name: "John Doe"
       - Phone: "+62 812-3456-7890"
       - Email: "john@example.com"
     - **Customer Tags**: VIP, Returning Customer, etc.
     - **Conversation Stats**:
       - Current conversation status
       - Started: 10 minutes ago
       - First response time: 2 minutes
       - Number of messages: 15
     - **Previous Conversations**:
       - List of past conversations dengan customer ini
       - Click untuk view history
     - **Custom Fields** (jika configured):
       - Order ID
       - Account status
       - Subscription tier
       - Any custom data
     - **Notes Section**:
       - Internal notes from previous agents
       - Add new notes

4. **Check Bot Conversation Context**
   - Jika conversation started dengan bot:
     - Agent dapat see what bot already discussed
     - Review customer intent yang detected oleh bot
     - See knowledge base articles yang bot provided
     - Understand why bot handed over to human:
       - Complex question
       - Customer requested human
       - Bot confidence low
       - Escalation keyword detected

5. **Compose & Send Message**
   - Agent ready untuk reply:
     - **Type Message**:
       - Click di message input area
       - Type response message
       - Use formatting jika needed (bold, italic)
       - Message input supports multi-line (Shift+Enter untuk new line)
     - **Use Emoji**:
       - Click emoji icon
       - Select emoji dari picker
       - Emoji inserted ke message
     - **Preview Message**:
       - Review message sebelum send
       - Check spelling/grammar
     - **Send**:
       - Press Enter atau click Send button
       - Message instantly appear di chat thread
       - Status shows "Sending..." → "Sent" → "Delivered" → "Read"

6. **Use Quick Replies / Canned Responses**
   - Untuk faster response:
     - **Quick Replies Button**: Click lightning icon atau "/" in message input
     - **Browse Canned Responses**:
       - Popup modal shows list of pre-defined responses
       - Categories: Greeting, FAQ, Closing, etc.
       - Search canned responses
     - **Select Response**:
       - Click pada canned response
       - Response auto-populate di message input
       - Agent dapat edit jika needed untuk personalization
       - Send message
   - Examples canned responses:
     - "Thank you for contacting us. How can I help you today?"
     - "I understand your concern. Let me check that for you."
     - "Is there anything else I can help you with?"

7. **Send File Attachments**
   - Jika perlu send files:
     - **Click Attachment Icon**: Paperclip icon di message input area
     - **Select File Source**:
       - Upload from computer
       - Choose from media library
       - Take photo (jika on mobile)
     - **Select File**:
       - Browse dan select file (image, PDF, document, video)
       - Multiple files dapat selected sekaligus
     - **Preview**:
       - Sistem show preview of selected files
       - Agent dapat add caption
       - Agent dapat remove file jika salah
     - **Send**:
       - Click Send
       - Sistem upload file
       - Show upload progress bar
       - File delivered ke customer dengan preview
   - **Drag & Drop**:
     - Alternative: Drag file dari desktop
     - Drop ke chat interface
     - Auto-upload dan send

8. **Use Internal Notes**
   - Untuk communication dengan team tanpa customer see:
     - **Click "Add Note" icon** atau button
     - **Type Internal Note**:
       - Note tidak visible ke customer
       - Only visible to agents and admins
       - Use untuk:
         - Document customer issue
         - Leave context untuk next agent
         - Escalation notes
         - Resolution steps
     - **Send Note**:
       - Note appear di conversation timeline dengan different styling
       - Icon shows it's internal note
       - Timestamp logged

9. **Transfer Conversation**
   - Jika perlu transfer ke agent lain atau department:
     - **Click "Transfer" Button**
     - **Select Transfer Target**:
       - Choose another agent (list of available agents)
       - Choose department/team
       - Add transfer note/reason
     - **Confirm Transfer**:
       - Click Confirm
       - Sistem transfer conversation
       - System message posted: "Conversation transferred to Agent Sarah"
       - Original agent can still view conversation (read-only)
       - New agent receives notification dan conversation appears di inbox

10. **Manage Conversation Status**
    - **During Conversation**:
      - Status auto-update: "Active" ketika actively chatting
      - If waiting for customer: Can manually set to "Waiting"
    - **Resolve Conversation**:
      - Ketika issue resolved atau conversation complete:
        - Click "Resolve" button
        - Optional: Add resolution note
        - Optional: Ask customer untuk rating
        - Confirm resolution
        - Conversation marked as "Resolved"
        - Conversation removed from active inbox
        - Moved ke "Resolved" folder
    - **Reopen Conversation**:
      - Jika customer reply ke resolved conversation:
        - Conversation auto-reopen
        - Notification sent ke agent
        - Move back ke active inbox

11. **Handle Multiple Conversations**
    - Agent dapat handle multiple conversations simultaneously:
      - **Switch Between Conversations**:
        - Use conversation tabs atau list di sidebar
        - Click conversation untuk switch view
        - Unread badge shows conversations needing attention
      - **Smart Notifications**:
        - Desktop notification untuk new messages
        - Sound alert (based on settings)
        - Visual badge updates
      - **Context Switching**:
        - Each conversation maintains its context
        - No data loss when switching

12. **Set Priority & Tags**
    - **Set Priority**:
      - Click priority dropdown
      - Select: High, Normal, or Low
      - High priority shows red flag icon
      - Useful untuk escalations
    - **Add Tags**:
      - Click "Add Tag" button
      - Select from existing tags atau create new
      - Examples: "Technical Issue", "Billing", "Complaint", "Sales"
      - Tags help dengan filtering dan reporting

13. **Bot/Human Mode Toggle**
    - Jika conversation masih in bot mode:
      - **Take Over Conversation**:
        - Click "Take Over" atau "Switch to Manual" button
        - Bot stops responding
        - Agent has full control
        - System message: "Agent John is now handling your request"
      - **Hand Back to Bot**:
        - Jika agent done dan bot can continue:
        - Click "Hand to Bot" button
        - Bot resumes control
        - Useful untuk after-hours handoff

14. **Monitor Customer Typing & Online Status**
    - **Typing Indicator**:
      - Ketika customer typing: "Customer is typing..." appears
      - Helps agent wait untuk complete message
    - **Online Status**:
      - Shows ketika customer active/online
      - Shows "Last seen: 5 minutes ago" if offline

15. **Search in Conversation**
    - Untuk long conversations:
      - Click search icon dalam conversation
      - Type keyword atau phrase
      - Sistem highlight matching messages
      - Navigate between matches
      - Useful untuk reference previous discussion points

16. **Customer Sentiment Monitoring** (jika available)
    - AI-powered sentiment analysis:
      - Visual indicator shows customer mood:
        - 😊 Positive (green)
        - 😐 Neutral (yellow)
        - 😞 Negative/Frustrated (red)
      - Helps agent adjust tone dan approach
      - Alert jika sentiment declining

17. **Message Failures & Retry**
    - Jika message gagal send:
      - Red X icon appears on message
      - Error tooltip: "Failed to send"
      - Agent dapat:
        - Click "Retry" untuk resend
        - Edit message dan resend
        - Delete failed message

---

## 4. Profile Settings

**Screenshot:** `agent_profile_setting.png`

### Fitur:
- **Personal Information**:
  - Profile photo upload
  - Full name
  - Display name (how name appears to customers)
  - Email address
  - Phone number
  - Bio/About me
- **Account Settings**:
  - Change password
  - Email notifications preferences
  - Two-factor authentication (2FA)
  - Session management (active sessions, logout other devices)
- **Language & Region**:
  - Preferred language
  - Timezone
  - Date/time format
- **Profile Visibility**:
  - Show profile to customers (yes/no)
  - Display real name atau use alias
- **Signature**: Auto-signature untuk messages (jika applicable)
- **Working Hours Display**: Display working schedule on profile

### Flow End User:

1. **Access Profile Settings**
   - Agent click profile icon/avatar di top-right corner
   - Dropdown menu appears
   - Select "Profile Settings" atau "Account Settings"
   - Sistem open profile settings page

2. **View Current Profile**
   - Settings page menampilkan current profile information:
     - Profile photo di top
     - All personal information fields
     - Current settings status

3. **Update Profile Photo**
   - **Change Photo**:
     - Click pada current profile photo atau "Change Photo" button
     - Options appear:
       - Upload new photo dari computer
       - Take photo dengan webcam
       - Remove current photo
     - Select "Upload from Computer"
     - File browser opens
     - Select image file (JPG, PNG, max 5MB)
     - Crop/resize tool appears (jika available)
     - Adjust crop area
     - Click "Save"
     - Sistem upload dan update profile photo
     - New photo appears immediately di UI

4. **Update Personal Information**
   - **Edit Name**:
     - Current: "John Smith"
     - Click edit icon atau directly click field
     - Type new name
     - System auto-save atau click Save button
   - **Display Name**:
     - This is how name appears to customers
     - Can be different dari legal name
     - Example: "John" instead of "John Smith" untuk friendlier approach
   - **Email Address**:
     - View current email
     - Click Edit
     - Enter new email
     - System send verification email
     - Verify email untuk complete change
   - **Phone Number**:
     - Enter atau update phone number
     - Format validated
     - Optional: Add multiple phone numbers
   - **Bio/About**:
     - Text area untuk short bio
     - Example: "Customer support specialist with 5 years experience"
     - Character limit: 200 chars
     - Bio may appear in customer view (if enabled)

5. **Update Account Security**
   - **Change Password**:
     - Click "Change Password" button atau link
     - Modal form appears:
       - Current password (required untuk verification)
       - New password
       - Confirm new password
     - Password requirements displayed:
       - Minimum 8 characters
       - At least 1 uppercase
       - At least 1 number
       - At least 1 special character
     - Type passwords
     - Real-time validation shows checkmarks untuk requirements met
     - Click "Update Password"
     - System verify current password
     - Update ke new password
     - Success message appears
     - Agent may need to re-login
   
   - **Two-Factor Authentication (2FA)**:
     - **Enable 2FA**:
       - Toggle "Enable 2FA" switch
       - Setup wizard appears
       - Choose 2FA method:
         - Authenticator app (Google Authenticator, Authy)
         - SMS code
         - Email code
       - For Authenticator App:
         - QR code displayed
         - Scan QR code dengan authenticator app
         - Enter verification code dari app
         - System verify code
         - Backup codes generated dan displayed
         - Agent saves backup codes securely
         - 2FA enabled
     - **Disable 2FA**:
       - Toggle off
       - Enter current 2FA code untuk verify
       - Confirm disable
       - 2FA disabled
   
   - **Active Sessions Management**:
     - View list of active sessions:
       - Current session (This device)
       - Device type: Chrome on Windows
       - Location: Jakarta, Indonesia
       - Last active: Just now
       - IP address
     - Other sessions listed:
       - Mobile app on iPhone
       - Last active: 2 hours ago
     - Agent dapat:
       - Click "Logout" on specific session untuk remote logout
       - Click "Logout All Other Devices" untuk security
       - Confirmation required

6. **Configure Language & Region**
   - **Preferred Language**:
     - Dropdown menu dengan available languages
     - Current: English
     - Options: English, Indonesian, etc.
     - Select new language
     - UI immediately update ke selected language
   
   - **Timezone**:
     - Dropdown dengan timezone list
     - Current: Asia/Jakarta (GMT+7)
     - Type untuk search timezone
     - Select appropriate timezone
     - All timestamps dalam app adjust accordingly
   
   - **Date/Time Format**:
     - Date format options:
       - DD/MM/YYYY (31/12/2024)
       - MM/DD/YYYY (12/31/2024)
       - YYYY-MM-DD (2024-12-31)
     - Time format options:
       - 12-hour (2:30 PM)
       - 24-hour (14:30)
     - Select preferences
     - System apply formats throughout UI

7. **Configure Profile Visibility**
   - **Show Profile to Customers**:
     - Toggle switch: ON/OFF
     - When ON:
       - Customers can see agent profile photo
       - Customers can see agent display name
       - Customers can see agent bio (jika set)
     - When OFF:
       - Agent appears as "Support Agent" generic name
       - No photo shown (generic avatar)
   
   - **Display Name Preference**:
     - Radio options:
       - Use real name (John Smith)
       - Use display name/alias (John)
       - Use generic title (Support Agent)
     - Select preference
     - This affects how customers see agent identity

8. **Configure Message Signature** (jika available)
   - **Auto-Signature**:
     - Toggle "Add signature to messages": ON/OFF
     - Text editor untuk create signature:
       - Example: 
         ```
         Best regards,
         John Smith
         Customer Support Team
         ```
     - Signature auto-appended ke outgoing messages
     - Preview shows how signature appears
     - Variables available:
       - {agent_name}
       - {agent_role}
       - {company_name}
       - {support_email}

9. **Display Working Hours** (jika available)
   - **Show Working Schedule**:
     - Toggle to display working hours on profile
     - Customers can see when agent typically available
     - Linked dengan Availability Settings (Section #5)

10. **Save Changes**
    - Depending on platform design:
      - **Auto-Save**: Changes saved immediately as edited
      - **Manual Save**: 
        - "Save Changes" button di bottom of page
        - Click to apply all changes
        - Unsaved changes indicator jika navigating away
    - Success message appears: "Profile updated successfully"
    - Changes reflected immediately di all UI

11. **Cancel/Discard Changes**
    - If manual save model:
      - "Cancel" atau "Discard" button available
      - Click untuk revert semua unsaved changes
      - Confirmation prompt jika many changes made

---

## 5. Availability Settings

**Screenshot:** `agent_setting_availability.png`

### Fitur:
- **Current Status Selector**:
  - Online (Available)
  - Away
  - Busy (Do Not Disturb)
  - Offline
- **Working Hours Schedule**:
  - Set availability schedule per hari
  - Custom hours untuk each day of week
  - Mark days off
  - Multiple time slots per day
- **Auto-Status Settings**:
  - Auto-set to "Away" after idle time
  - Auto-set to "Offline" after work hours
  - Auto-set to "Online" at start of work hours
- **Break Time Settings**:
  - Schedule break times
  - Lunch break
  - Quick breaks
- **Capacity Settings**:
  - Maximum concurrent conversations
  - Auto-stop assignment when capacity reached
- **Out of Office**:
  - Set out of office periods (vacation, sick leave)
  - Date range selector
  - Auto-reply message untuk OOO period
- **Calendar Integration**: Sync dengan Google Calendar atau Outlook (jika available)

### Flow End User:

1. **Access Availability Settings**
   - Agent click "Settings" atau profile dropdown
   - Select "Availability" atau "Working Hours"
   - Availability settings page opens

2. **Set Current Status - Quick Toggle**
   - Di top of page atau dalam quick access:
     - **Status Dropdown** atau toggle buttons
     - Options visible:
       - 🟢 **Online** - Available to receive conversations
       - 🟡 **Away** - Temporarily unavailable
       - 🔴 **Busy** - Do not disturb, no new assignments
       - ⚫ **Offline** - Not available, completely offline
   - Agent click status untuk immediate change
   - Status indicator updates across entire system
   - Customer-facing impact:
     - Online: Agent receives new conversation assignments
     - Away/Busy: No new assignments, existing conversations continue
     - Offline: All conversations re-routed atau queued

3. **Configure Working Hours Schedule**
   - **Weekly Schedule Section**:
     - Grid/calendar view menampilkan 7 days of week
     - Current schedule displayed
   
   - **Edit Working Hours**:
     - **For Each Day**:
       - Monday through Sunday listed
       - Current setting shown, example:
         - Monday: 9:00 AM - 5:00 PM
         - Tuesday: 9:00 AM - 5:00 PM
         - Wednesday: 9:00 AM - 5:00 PM
         - Thursday: 9:00 AM - 5:00 PM
         - Friday: 9:00 AM - 5:00 PM
         - Saturday: Off
         - Sunday: Off
     
     - **Edit Specific Day**:
       - Click pada day atau Edit icon
       - Modal atau inline editor opens
       - Toggle "Working this day": ON/OFF
       - If ON, set time range:
         - Start time: Dropdown atau time picker (9:00 AM)
         - End time: Dropdown atau time picker (5:00 PM)
       - **Add Multiple Shifts** (jika needed):
         - Click "Add another time slot"
         - Example: Morning shift 9-12, Afternoon shift 1-5
         - Useful untuk lunch break gap
       - Click "Save"
     
     - **Quick Apply to Multiple Days**:
       - "Apply to all weekdays" button
       - Select template:
         - Weekdays (Mon-Fri): 9 AM - 5 PM
         - Weekends: Off
       - Confirm to apply

4. **Set Break Times**
   - **Configure Regular Breaks**:
     - Section: "Break Times"
     - **Lunch Break**:
       - Toggle "Schedule lunch break": ON
       - Set time: 12:00 PM - 1:00 PM
       - Apply to: All weekdays / Specific days
     - **Short Breaks**:
       - Add 15-minute break times
       - Example: 10:30 AM, 3:30 PM
     - During breaks:
       - Status auto-changes to "Away"
       - No new conversation assignments
       - Existing conversations remain accessible
     - Click "Save Break Schedule"

5. **Configure Auto-Status Rules**
   - **Auto-Away Settings**:
     - Checkbox: "Automatically set status to Away when idle"
     - Idle time threshold: Dropdown (5, 10, 15, 30 minutes)
     - Example: Set to Away after 10 minutes idle
     - Mouse/keyboard activity resets timer
   
   - **Auto-Offline Settings**:
     - Checkbox: "Automatically go Offline after working hours"
     - When enabled:
       - Status auto-changes to Offline after scheduled end time
       - Agent doesn't need to manually logout
   
   - **Auto-Online Settings**:
     - Checkbox: "Automatically go Online at start of working hours"
     - When enabled:
       - If agent logged in, status auto-changes to Online
       - Helps ensure availability at work start
   
   - **Notification Preferences**:
     - Checkbox: "Notify me before auto-status change"
     - Get notification 5 minutes before auto-change
     - Option to override dan stay online

6. **Set Conversation Capacity**
   - **Max Concurrent Conversations**:
     - Label: "Maximum conversations at once"
     - Input field atau slider: Set number (1-20)
     - Example: Set to 5
     - Meaning: Agent can handle max 5 active conversations simultaneously
   
   - **Auto-Stop Assignment**:
     - Checkbox: "Stop new assignments when capacity reached"
     - When enabled:
       - System tidak assign new conversations jika at max capacity
       - Agent can still manually claim dari queue
       - Status shows: "Online (At capacity: 5/5)"
   
   - **Capacity Warnings**:
     - Checkbox: "Warn me when approaching capacity"
     - Notification when 80% capacity reached
     - Example: Alert at 4/5 conversations

7. **Set Out of Office (OOO)**
   - **Schedule OOO Period**:
     - Click "Set Out of Office" atau "+ Add OOO"
     - Form appears:
       - **Reason**: Dropdown atau text field
         - Vacation
         - Sick Leave
         - Training
         - Personal Leave
         - Other (specify)
       - **Start Date**: Date picker - Select date
       - **Start Time**: Time picker - Select time
       - **End Date**: Date picker - Select date
       - **End Time**: Time picker - Select time
       - Example: 
         - Vacation
         - From: Dec 24, 2024 (5:00 PM)
         - To: Jan 2, 2025 (9:00 AM)
     
     - **Auto-Reply Message** (optional):
       - Checkbox: "Send auto-reply during OOO"
       - Text editor:
         ```
         I am currently out of office and will return on January 2.
         For urgent matters, please contact support@company.com.
         ```
       - This message auto-sent jika customer tries to reach agent
     
     - **Reassignment Options**:
       - Radio buttons:
         - Transfer my active conversations to another agent
         - Keep my conversations (will respond after return)
         - Transfer to team queue
       - If transfer, select target agent atau team
     
     - Click "Save OOO Settings"
   
   - **View Scheduled OOO**:
     - List of upcoming OOO periods
     - Option to edit atau cancel
   
   - **During OOO Period**:
     - Status automatically set to "Offline"
     - No new conversation assignments
     - Active conversations handled per settings
     - OOO indicator shows to admins

8. **Calendar Integration** (jika available)
   - **Connect Calendar**:
     - Section: "Calendar Integration"
     - Button: "Connect Google Calendar" atau "Connect Outlook"
     - Click button
     - OAuth authentication flow:
       - Redirect to Google/Microsoft login
       - Grant permissions
       - Redirect back to app
       - Confirmation: "Calendar connected"
   
   - **Sync Settings**:
     - **Two-way Sync**:
       - Working hours sync to calendar
       - Calendar events sync to availability
     - **Calendar-based Status**:
       - When calendar event active:
         - Auto-set status to "Busy"
         - Resume Online after event ends
     - **Event Types to Sync**:
       - Checkbox options:
         - All-day events
         - Busy events only
         - Out of office events
   
   - **Disconnect Calendar**:
     - Button to revoke access
     - Confirm action

9. **Preview & Test**
   - **Availability Preview**:
     - Visual calendar shows:
       - Green blocks: Available hours
       - Yellow blocks: Break times
       - Red blocks: Offline hours
       - Gray blocks: Out of office
     - Week view atau month view
     - Helps visualize schedule
   
   - **Test Status Changes**:
     - "Test notification" button
     - Trigger test status change notification
     - Verify notifications working correctly

10. **Save Configuration**
    - Review all settings
    - Click "Save Availability Settings"
    - System validates:
      - No conflicting schedules
      - Break times within working hours
      - OOO dates valid
    - Confirmation message: "Availability settings updated"
    - Settings take effect immediately

11. **Mobile Sync** (jika mobile app available)
    - Availability settings sync to mobile app
    - Agent dapat toggle status dari mobile
    - Push notifications untuk status reminders

---

## 6. Notification Settings

**Screenshot:** `agent_notification_setting.png`

### Fitur:
- **Notification Channels**:
  - In-app notifications (browser notifications)
  - Email notifications
  - SMS notifications (jika available)
  - Mobile push notifications (jika ada mobile app)
  - Desktop application notifications
- **Notification Types Configuration**:
  - New conversation assigned
  - New message in active conversation
  - Conversation transferred to me
  - Customer marked conversation as resolved
  - Mentioned in internal notes
  - Approaching capacity limit
  - Idle status warning
  - Working hours reminder
  - Performance milestones
  - System announcements
- **Notification Frequency**:
  - Instant (real-time)
  - Batched (every 5, 15, 30 minutes)
  - Daily digest
  - Off
- **Do Not Disturb Schedule**:
  - Set quiet hours
  - Mute notifications during specific times
  - Override untuk urgent notifications
- **Sound Settings**:
  - Enable/disable notification sounds
  - Choose notification sound
  - Volume control
- **Visual Settings**:
  - Badge notifications
  - Desktop alerts
  - Browser tab title notifications
- **Notification Preview**: Test notifications before saving

### Flow End User:

1. **Access Notification Settings**
   - Agent click "Settings" dari navigation atau profile menu
   - Select "Notifications" atau "Notification Preferences"
   - Notification settings page opens dengan organized sections

2. **Configure Notification Channels**
   - **Enable/Disable Channels**:
     - Section: "Notification Channels"
     - Toggle switches untuk each channel:
       
       - **In-App Notifications**:
         - Toggle: ON/OFF
         - Description: "Show notifications within the app"
         - When ON: Popup toasts appear di app interface
       
       - **Browser Push Notifications**:
         - Toggle: ON/OFF
         - Description: "Show desktop notifications even when browser minimized"
         - When first enabled:
           - Browser permission prompt appears
           - Click "Allow"
           - Notifications granted
         - Requires browser support
       
       - **Email Notifications**:
         - Toggle: ON/OFF
         - Description: "Receive notifications via email"
         - Email address shown: john.smith@company.com
         - Link to verify email jika not verified
       
       - **SMS Notifications**:
         - Toggle: ON/OFF (jika available)
         - Description: "Receive urgent notifications via SMS"
         - Phone number shown: +62 812-3456-7890
         - Note: "Standard SMS rates may apply"
       
       - **Mobile Push Notifications**:
         - Toggle: ON/OFF (jika mobile app installed)
         - Description: "Receive push notifications on mobile devices"
         - Shows connected devices:
           - iPhone 12 - Enabled
           - Android Phone - Disabled
         - Manage per device

3. **Configure Notification Types**
   - **Detailed Configuration per Type**:
     - Section: "What notifications do you want to receive?"
     - Table atau list dengan columns:
       - Notification Type
       - In-App
       - Email
       - Push
       - SMS
     
     - **Each notification type listed**:
       
       1. **New Conversation Assigned**
          - Description: "When a new conversation is assigned to you"
          - In-App: ☑️ Enabled
          - Email: ☑️ Enabled
          - Push: ☑️ Enabled
          - SMS: ☐ Disabled
          - Frequency: Instant
       
       2. **New Message in Active Conversation**
          - Description: "When you receive a new message in conversations you're handling"
          - In-App: ☑️ Enabled
          - Email: ☐ Disabled (too frequent)
          - Push: ☑️ Enabled
          - SMS: ☐ Disabled
          - Frequency: Instant
          - Sub-option: "Only notify if conversation tab not active"
       
       3. **Conversation Transferred to Me**
          - Description: "When another agent transfers a conversation to you"
          - In-App: ☑️ Enabled
          - Email: ☑️ Enabled
          - Push: ☑️ Enabled
          - SMS: ☐ Disabled
          - Frequency: Instant
       
       4. **Mentioned in Internal Notes**
          - Description: "When someone mentions you in a note (@mention)"
          - In-App: ☑️ Enabled
          - Email: ☑️ Enabled
          - Push: ☑️ Enabled
          - SMS: ☐ Disabled
       
       5. **Conversation Resolved by Customer**
          - Description: "When a customer marks conversation as resolved"
          - In-App: ☑️ Enabled
          - Email: ☐ Disabled
          - Push: ☐ Disabled
          - SMS: ☐ Disabled
       
       6. **Approaching Capacity Limit**
          - Description: "When you're close to max concurrent conversations"
          - In-App: ☑️ Enabled
          - Email: ☐ Disabled
          - Push: ☑️ Enabled
          - SMS: ☐ Disabled
          - Threshold: 80%
       
       7. **Idle Status Warning**
          - Description: "Reminder that your status will change to Away soon"
          - In-App: ☑️ Enabled
          - Email: ☐ Disabled
          - Push: ☑️ Enabled
          - SMS: ☐ Disabled
       
       8. **Working Hours Reminders**
          - Description: "Reminders about start/end of your working hours"
          - In-App: ☑️ Enabled
          - Email: ☑️ Enabled (daily digest)
          - Push: ☑️ Enabled
          - SMS: ☐ Disabled
          - Options:
            - 15 minutes before shift start
            - At shift end
       
       9. **Performance Milestones**
          - Description: "When you reach performance goals (100 conversations, etc.)"
          - In-App: ☑️ Enabled
          - Email: ☑️ Enabled (weekly digest)
          - Push: ☐ Disabled
          - SMS: ☐ Disabled
       
       10. **System Announcements**
           - Description: "Important updates from administrators"
           - In-App: ☑️ Enabled
           - Email: ☑️ Enabled
           - Push: ☑️ Enabled
           - SMS: ☐ Disabled
   
   - **Customize Each Type**:
     - Click pada notification type untuk expand details
     - Configure specific channels
     - Set frequency
     - Set conditions atau thresholds

4. **Configure Notification Frequency**
   - **Global Frequency Settings**:
     - For emails specifically (to avoid spam):
       - Radio buttons:
         - ⚫ **Instant** - Send immediately as they happen
         - ⚪ **Batched** - Group notifications
           - Every 15 minutes
           - Every 30 minutes
           - Every hour
         - ⚪ **Daily Digest** - One email per day with summary
           - Time: 9:00 AM
         - ⚪ **Weekly Digest** - One email per week
           - Day: Monday
           - Time: 9:00 AM
   
   - **Smart Batching**:
     - Checkbox: "Use smart batching"
     - System intelligently groups similar notifications
     - Example: "You have 5 new messages" instead of 5 separate alerts

5. **Configure Do Not Disturb (DND)**
   - **DND Schedule**:
     - Section: "Quiet Hours / Do Not Disturb"
     - Toggle: "Enable Do Not Disturb schedule"
     - When enabled:
       - **Set Quiet Hours**:
         - Daily schedule:
           - Start time: 10:00 PM
           - End time: 8:00 AM
         - Or custom per day:
           - Weekdays: 11:00 PM - 7:00 AM
           - Weekends: Midnight - 10:00 AM
       - **During DND**:
         - Mute all notifications
         - Or mute only:
           - Sounds
           - Visual alerts
           - Keep badge counts
   
   - **DND Exceptions**:
     - Checkbox options:
       - ☑️ "Allow urgent/high-priority notifications"
       - ☑️ "Allow mentions (@me)"
       - ☑️ "Allow from specific agents" (select agents)
       - ☐ "Allow SMS notifications" (override DND)
   
   - **Manual DND Toggle**:
     - Quick toggle untuk instantly enable DND
     - Options:
       - For 1 hour
       - For 2 hours
       - Until tomorrow
       - Indefinitely (until manually disabled)

6. **Configure Sound Settings**
   - **Notification Sounds**:
     - Section: "Sound Settings"
     - Master toggle: "Enable notification sounds"
     - When enabled:
       
       - **Sound Selection**:
         - Dropdown: Choose notification sound
         - Options:
           - Default (ding)
           - Chime
           - Alert
           - Soft
           - Custom (upload)
         - "Play" button untuk preview sound
       
       - **Volume Control**:
         - Slider: 0% to 100%
         - Test button to play at current volume
       
       - **Different Sounds per Type** (advanced):
         - New conversation: Sound A
         - New message: Sound B
         - Transfer: Sound C
         - Mention: Sound D
   
   - **Sound Frequency Limits**:
     - Checkbox: "Limit notification sound frequency"
     - Prevent sound overload:
       - Max 1 sound per 5 seconds
       - Or batch multiple notifications into 1 sound

7. **Configure Visual Settings**
   - **Badge Notifications**:
     - Toggle: "Show unread count badges"
     - Where badges appear:
       - Browser tab title: (5) Inbox - ChatBot
       - App icon (desktop/mobile)
       - Sidebar menu items
   
   - **Desktop Alert Style**:
     - Radio options:
       - ⚫ **Banner** - Slide from top, auto-dismiss
       - ⚪ **Modal** - Center screen, requires dismiss
       - ⚪ **Minimalist** - Small corner toast
     - Duration: Dropdown (3, 5, 10 seconds, Manual dismiss)
   
   - **Browser Tab Notifications**:
     - Checkbox: "Flash tab title for new notifications"
     - Example: "Inbox" ↔ "(1 new)" flashing
   
   - **In-App Alert Position**:
     - Radio options:
       - Top-right (default)
       - Top-center
       - Bottom-right
       - Bottom-left

8. **Test Notifications**
   - **Preview Panel**:
     - Section: "Test Your Notification Settings"
     - Button: "Send Test Notification"
     - Dropdown: Select notification type untuk test
       - New conversation
       - New message
       - Transfer
       - Mention
     - Click "Send Test"
     - System sends test notification via all enabled channels:
       - In-app toast appears
       - Browser push notification appears (jika enabled)
       - Email sent (jika enabled)
       - SMS sent (jika enabled)
     - Agent can verify:
       - Notifications received correctly
       - Sound playing properly
       - Visual style acceptable
       - Delivery speed acceptable

9. **Advanced Settings**
   - **Notification Grouping**:
     - Checkbox: "Group notifications by conversation"
     - Instead of separate alerts, group messages dari same conversation
   
   - **Priority Levels**:
     - Configure what's considered "urgent":
       - Conversations tagged as "High Priority"
       - Mentions dari managers
       - Escalations
       - Customer sentiment very negative
   
   - **Notification History**:
     - Link: "View notification history"
     - Shows log of all notifications sent:
       - Timestamp
       - Type
       - Channel
       - Delivery status (sent, delivered, read)
       - Action taken (clicked, dismissed, ignored)

10. **Save Notification Settings**
    - Review all configured settings
    - Click "Save Notification Preferences" button
    - System validates:
      - At least one channel enabled for critical notifications
      - No conflicting settings
      - Valid email/phone numbers
    - Confirmation message: "Notification settings saved successfully"
    - Settings take effect immediately
    - Test notification sent untuk verification

11. **Reset to Defaults**
    - Button: "Reset to Default Settings"
    - Revert all notification preferences to system defaults
    - Confirmation dialog:
      - "Are you sure? This will reset all your notification preferences."
      - Cancel / Reset
    - Useful jika too many customizations made

12. **Notification Management Tips** (Info section)
    - Best practices displayed:
      - ✅ Enable instant in-app notifications untuk active work
      - ✅ Use email digest untuk less urgent updates
      - ✅ Enable push notifications untuk when away dari desk
      - ✅ Set DND during personal time
      - ✅ Enable sound untuk new conversation assignments
      - ❌ Avoid enabling all channels untuk all types (notification fatigue)

---

## Summary Flow Diagram - Agent Journey

```
┌─────────────────────────────────────────────────────────┐
│                    AGENT LOGIN                          │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  DASHBOARD                              │
│  • Performance Metrics  • Active Conversations          │
│  • Recent Activity  • Quick Actions                     │
└──┬─────────┬────────────┬────────────┬─────────────┬───┘
   │         │            │            │             │
   ▼         ▼            ▼            ▼             ▼
┌──────┐ ┌──────┐ ┌────────────┐ ┌────────┐ ┌────────────┐
│ Inbox│ │ Chat │ │  Profile   │ │Availab.│ │Notificat.  │
│ List │ │      │ │  Settings  │ │Settings│ │  Settings  │
└──────┘ └──────┘ └────────────┘ └────────┘ └────────────┘
   │         │            │            │             │
   │         │            │            │             │
   ▼         ▼            ▼            ▼             ▼
• Filter    • Send       • Update     • Set Status  • Configure
• Search    • Message    • Profile    • Schedule    • Channels
• Claim     • Transfer   • Security   • Capacity    • Types
• Open      • Resolve    • Language   • OOO         • Frequency
```

---

## Key Differences: Agent vs Org Admin

| Feature | Organization Admin | Agent |
|---------|-------------------|-------|
| **Dashboard** | Organization-wide analytics | Personal performance metrics |
| **Inbox** | View all conversations | View assigned conversations only |
| **User Management** | Full CRUD access | Cannot manage users |
| **Bot Configuration** | Full control | No access |
| **Knowledge Base** | Create, edit, delete | View-only atau no access |
| **Settings** | Organization settings | Personal settings only |
| **Integrations** | Manage WhatsApp accounts | Use existing integrations |
| **Analytics** | Full org analytics | Personal performance only |

---

## Agent Responsibilities Summary

✅ **Primary Responsibilities:**
- Monitor assigned conversations di inbox
- Respond promptly ke customer messages
- Maintain good response time dan customer satisfaction
- Use knowledge base untuk accurate information
- Transfer complex cases appropriately
- Document conversations dengan internal notes
- Resolve conversations setelah complete
- Maintain professional availability schedule
- Keep profile information updated
- Follow notification preferences untuk work-life balance

✅ **Best Practices untuk Agents:**
1. **Response Time**: Aim untuk < 2 minutes first response
2. **Conversation Handling**: Handle conversations thoroughly before resolving
3. **Knowledge Use**: Reference knowledge base untuk consistent answers
4. **Professional Tone**: Maintain friendly, helpful, professional communication
5. **Availability**: Keep availability status accurate
6. **Capacity Management**: Don't overload - respect max conversation limits
7. **Documentation**: Add notes untuk context dan handoff
8. **Customer Satisfaction**: Always close conversations positively
9. **Continuous Learning**: Review performance metrics regularly
10. **Team Collaboration**: Use transfers dan mentions untuk team support

---

## Troubleshooting Common Issues

### Issue: Not Receiving Conversations
**Solutions:**
- Check availability status is "Online"
- Verify not at max capacity
- Check notification settings enabled
- Verify working hours configured
- Contact admin untuk assignment rules

### Issue: Notifications Not Working
**Solutions:**
- Check notification settings enabled
- Verify browser permissions granted
- Check DND not active
- Test notifications di settings
- Clear browser cache

### Issue: Cannot Send Messages
**Solutions:**
- Check internet connection
- Verify conversation not resolved
- Check WhatsApp connection status
- Refresh page
- Contact admin for support

### Issue: Profile Photo Not Uploading
**Solutions:**
- Check file size < 5MB
- Use supported format (JPG, PNG)
- Clear browser cache
- Try different browser
- Contact support

---

**Version:** 1.0  
**Last Updated:** October 8, 2025  
**Role:** Agent / Customer Service Agent  
**Document Type:** Feature Documentation  
**Target Audience:** Customer Service Agents, Support Team Members
