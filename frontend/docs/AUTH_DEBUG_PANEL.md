# Auth Debug Panel

The Auth Debug Panel is a development and debugging tool that provides real-time visibility into the authentication state of the application.

## Features

- **Real-time Authentication Status**: Shows current authentication state
- **User Data Inspection**: View current user data in JSON format
- **Token Information**: Display token details (length, type, preview)
- **Environment Configuration**: View current environment settings
- **Feature Flags Status**: See which features are enabled/disabled
- **Copy to Clipboard**: Easy copying of data for debugging
- **Sensitive Data Toggle**: Show/hide sensitive information like tokens

## Environment Configuration

### Single Environment Variable

The Auth Debug Panel is controlled by a single environment variable:

```bash
VITE_ENABLE_AUTH_DEBUG_PANEL=true
```

### Supported Values

The environment variable accepts multiple formats:

| Value | Result |
|-------|--------|
| `true` | Panel enabled |
| `false` | Panel disabled |
| `1` | Panel enabled |
| `0` | Panel disabled |
| `yes` | Panel enabled |
| `no` | Panel disabled |
| `undefined` | Panel disabled (default) |

### Environment Examples

#### Development Environment
```bash
# .env.development
VITE_ENABLE_AUTH_DEBUG_PANEL=true
```

#### Production Environment
```bash
# .env.production
VITE_ENABLE_AUTH_DEBUG_PANEL=false
```

#### Temporary Production Debugging
```bash
# .env.production (temporary)
VITE_ENABLE_AUTH_DEBUG_PANEL=true
```

## Usage

### Enabling the Panel

1. Set the environment variable in your `.env` file:
   ```bash
   VITE_ENABLE_AUTH_DEBUG_PANEL=true
   ```

2. Restart your development server:
   ```bash
   npm run dev
   ```

3. The panel will appear as a floating button in the bottom-right corner

### Using the Panel

1. **Click the "Auth Debug" button** to open the panel
2. **Overview Tab**: Quick status overview
3. **Data Tab**: Detailed user and token information
4. **Environment Tab**: Environment configuration and feature flags

### Panel Features

#### Overview Tab
- Authentication status (Authenticated/Not Authenticated)
- User data availability
- Token availability
- Environment mode (Development/Production)
- Refresh and logout buttons

#### Data Tab
- **User Data**: Complete user object in JSON format
- **Token Information**: Token length, type, and preview
- **Sensitive Data Toggle**: Show/hide full token value
- **Copy Buttons**: Copy data to clipboard

#### Environment Tab
- Current environment configuration
- Feature flags status
- API configuration
- Last update timestamp

## Implementation Details

### Direct Environment Access

The panel uses direct `import.meta.env` access for simplicity:

```javascript
// Simple environment check
const isAuthDebugPanelEnabled = () => {
  const value = import.meta.env.VITE_ENABLE_AUTH_DEBUG_PANEL;
  if (value === undefined || value === null) return false;
  
  const lowerValue = String(value).toLowerCase().trim();
  return lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes';
};

// Usage in component
{isAuthDebugPanelEnabled() && <AuthDebugPanel />}
```

### Component Structure
```
src/components/debug/
├── AuthDebugPanel.jsx    # Main debug panel component
└── index.js              # Export file
```

### Integration
The panel is integrated into the main App component and only renders when enabled:

```jsx
// App.jsx
{isAuthDebugPanelEnabled() && <AuthDebugPanel />}
```

## Security Considerations

### Development
- Safe to enable in development environments
- Provides valuable debugging information
- No security risks in local development

### Production
- **Use with caution** in production environments
- Only enable temporarily for debugging
- Contains sensitive authentication data
- Remember to disable after debugging

### Best Practices
1. **Default to disabled** in production
2. **Enable only when needed** for debugging
3. **Disable immediately** after debugging
4. **Never commit** production `.env` files with debug enabled
5. **Use environment-specific** configuration files

## Troubleshooting

### Panel Not Showing
1. Check environment variable is set correctly
2. Verify the value is one of the supported formats
3. Restart the development server
4. Check browser console for errors

### Data Not Loading
1. Ensure authentication service is properly initialized
2. Check API endpoints are accessible
3. Verify user is logged in (if required)
4. Check browser console for errors

### Environment Issues
1. Verify `.env` file is in the correct location
2. Check environment variable naming (must start with `VITE_`)
3. Ensure no typos in variable names
4. Restart server after environment changes

## API Reference

### Environment Functions
```javascript
// Direct environment access (recommended)
const value = import.meta.env.VITE_ENABLE_AUTH_DEBUG_PANEL;

// Simple helper function
const isAuthDebugPanelEnabled = () => {
  const value = import.meta.env.VITE_ENABLE_AUTH_DEBUG_PANEL;
  if (value === undefined || value === null) return false;
  
  const lowerValue = String(value).toLowerCase().trim();
  return lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes';
};
```

### Component Props
The AuthDebugPanel component accepts no props and is fully self-contained.

## Examples

### Development Setup
```bash
# .env
VITE_ENABLE_AUTH_DEBUG_PANEL=true
VITE_API_BASE_URL=http://localhost:9000/api
VITE_DEBUG=true
```

### Production Debugging
```bash
# .env.production (temporary)
VITE_ENABLE_AUTH_DEBUG_PANEL=true
VITE_API_BASE_URL=https://api.yourdomain.com/api
VITE_DEBUG=false
```

### Disable in Production
```bash
# .env.production
VITE_ENABLE_AUTH_DEBUG_PANEL=false
VITE_API_BASE_URL=https://api.yourdomain.com/api
VITE_DEBUG=false
```

## Benefits of Simplified Approach

1. **No Extra Files**: Direct `import.meta.env` usage
2. **Simpler Code**: Less abstraction, easier to understand
3. **Standard Vite**: Uses Vite's built-in environment handling
4. **Less Complexity**: No utility functions needed
5. **Better Performance**: No extra imports or processing

## Contributing

When adding new debug features:
1. Use direct `import.meta.env` access
2. Keep environment checks simple and inline
3. Include proper security considerations
4. Update this documentation
5. Test in both development and production environments
