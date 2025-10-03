import { RouterProvider } from 'react-router-dom';
import router from '@/routes/index.jsx';
import '@/styles/globals.css';
import { AuthDebugPanel } from '@/components/debug';
import EchoProvider from '@/components/EchoProvider';

const App = () => {
  // Check if Auth Debug Panel is enabled - only in development
  const isAuthDebugPanelEnabled = () => {
    // Only enable in development mode
    if (import.meta.env.MODE !== 'development') return false;

    const value = import.meta.env.VITE_ENABLE_AUTH_DEBUG_PANEL;
    if (value === undefined || value === null) return false;

    const lowerValue = String(value).toLowerCase().trim();
    return lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes';
  };

  return (
    <EchoProvider>
      <RouterProvider router={router} />
      {/* Auth Debug Panel - Only shows when enabled */}
      {isAuthDebugPanelEnabled() && <AuthDebugPanel />}
    </EchoProvider>
  );
};

export default App;
