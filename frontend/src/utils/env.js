// This file has been removed and replaced with direct import.meta.env usage
// All environment variables are now accessed directly from import.meta.env
// Example: import.meta.env.VITE_ENABLE_AUTH_DEBUG_PANEL

// For backward compatibility, you can still use this file if needed
// But it's recommended to use import.meta.env directly in components

export const isAuthDebugPanelEnabled = () => {
  const value = import.meta.env.VITE_ENABLE_AUTH_DEBUG_PANEL;
  if (value === undefined || value === null) return false;

  const lowerValue = String(value).toLowerCase().trim();
  return lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes';
};

export const isDevelopment = () => {
  return import.meta.env.MODE === 'development' ||
         import.meta.env.VITE_NODE_ENV === 'development';
};

// Minimal exports for backward compatibility
export default {
  isAuthDebugPanelEnabled,
  isDevelopment
};
