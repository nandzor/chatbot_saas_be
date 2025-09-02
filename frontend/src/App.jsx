import React from 'react';
import { RouterProvider } from 'react-router-dom';
import router from './routes';
import './styles/globals.css';
import { AuthDebugPanel } from './components/debug';

const App = () => {
  // Check if Auth Debug Panel is enabled - langsung dari .env
  const isAuthDebugPanelEnabled = () => {
    const value = import.meta.env.VITE_ENABLE_AUTH_DEBUG_PANEL;
    if (value === undefined || value === null) return false;

    const lowerValue = String(value).toLowerCase().trim();
    return lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes';
  };

  return (
    <>
      <RouterProvider router={router} />
      {/* Auth Debug Panel - Only shows when enabled */}
      {isAuthDebugPanelEnabled() && <AuthDebugPanel />}
    </>
  );
};

export default App;
