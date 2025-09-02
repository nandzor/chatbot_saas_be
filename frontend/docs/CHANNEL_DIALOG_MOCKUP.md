# Add Channel Dialog Mockup

## Overview
Created a comprehensive mockup dialog for adding new channels in the `/dashboard/settings` page, specifically for organization admin role.

## Location
- **Page**: `/dashboard/settings`
- **Component**: `src/features/shared/ChannelsTab.jsx`
- **Role**: Organization Admin

## Features Implemented

### 1. Dialog Trigger
- "Add Channel" button in the Channel Configurations card
- Opens modal dialog when clicked

### 2. Channel Types Supported
- **WhatsApp Business**: API Token, Phone Number, Webhook URL
- **Website Chat Widget**: Webhook URL
- **Facebook Messenger**: Page ID, Access Token, App Secret
- **Instagram Direct**: Page ID, Access Token
- **Email Support**: Webhook URL
- **SMS Gateway**: API Token, Phone Number

### 3. Dynamic Form Fields
- Form fields change based on selected channel type
- Required field validation
- Password fields for sensitive data (tokens, secrets)
- Proper placeholders and labels

### 4. Form Structure
```
1. Channel Name (required)
2. Channel Type Selection (dropdown with icons)
3. Description (optional)
4. Dynamic Configuration Fields (based on type)
5. Settings (webhooks, notifications)
6. Info Alert with setup instructions
7. Action Buttons (Create/Cancel)
```

### 5. UI/UX Features
- **Modal Overlay**: Full-screen overlay with backdrop blur
- **Responsive Design**: Max width 2xl, scrollable on small screens
- **Icons**: Each channel type has appropriate icons
- **Validation**: Required field indicators
- **Settings Toggles**: Enable/disable webhooks and notifications
- **Info Alert**: Setup guidance for users
- **Form Reset**: Clears form data on close/cancel

### 6. Channel Configuration Fields

#### WhatsApp Business
- API Token (password field)
- Phone Number (+62 format)
- Webhook URL

#### Website Chat Widget
- Webhook URL only

#### Facebook Messenger
- Page ID
- Access Token (password field)
- App Secret (password field)

#### Instagram Direct
- Page ID
- Access Token (password field)

#### Email Support
- Webhook URL only

#### SMS Gateway
- API Token (password field)
- Phone Number

### 7. Settings Options
- **Enable Webhook**: Toggle for automatic message receiving
- **Enable Notifications**: Toggle for new message notifications

### 8. User Experience
- **Progressive Disclosure**: Configuration fields appear after type selection
- **Clear Descriptions**: Each channel type has helpful descriptions
- **Visual Feedback**: Icons and colors for different channel types
- **Accessibility**: Proper labels and form structure
- **Error Prevention**: Required field validation

## Technical Implementation

### State Management
```javascript
const [showAddDialog, setShowAddDialog] = useState(false);
const [formData, setFormData] = useState({
  name: '',
  type: '',
  description: '',
  // ... other fields
});
```

### Dynamic Field Rendering
- `renderFieldsByType()` function generates fields based on channel type
- Switch statement handles different field types
- Proper input types for security (password for tokens)

### Form Handling
- `handleSubmit()` processes form submission
- `handleInputChange()` manages form state
- `resetForm()` clears all form data
- `closeDialog()` closes modal and resets form

## Benefits
1. **Comprehensive**: Supports multiple channel types
2. **User-Friendly**: Clear interface with helpful guidance
3. **Secure**: Password fields for sensitive data
4. **Flexible**: Easy to add new channel types
5. **Professional**: Modern UI with proper validation
6. **Accessible**: Proper form structure and labels

## Future Enhancements
- Real API integration
- Field validation with error messages
- Success/error notifications
- Channel testing functionality
- Advanced configuration options
