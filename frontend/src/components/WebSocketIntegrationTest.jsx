/**
 * WebSocket Integration Test Component
 * Tests the complete backend-frontend integration
 */

import React, { useState, useEffect } from 'react';
import { useConversation } from '@/hooks/useConversation';
import { webSocketIntegrationService } from '@/services/WebSocketIntegrationService';
import { authService } from '@/services/AuthService';

const WebSocketIntegrationTest = () => {
  const [testSessionId, setTestSessionId] = useState('test-session-123');
  const [testMessage, setTestMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState({});
  const [user, setUser] = useState(null);
  const [organizationId, setOrganizationId] = useState(null);

  // Use the enhanced conversation hook
  const {
    isWebSocketConnected,
    isTyping,
    typingUsers,
    sendTypingIndicator,
    sendMessageWithWebSocket,
    markMessageAsReadWithWebSocket,
    getWebSocketStatus,
    testWebSocketConnection
  } = useConversation(testSessionId);

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
        setOrganizationId(currentUser?.organization_id || currentUser?.organization?.id);
      } catch (error) {
        console.error('Failed to get current user:', error);
      }
    };

    getCurrentUser();
  }, []);

  // Initialize WebSocket integration
  useEffect(() => {
    const initializeWebSocket = async () => {
      try {
        const success = await webSocketIntegrationService.initialize();
        if (success) {
          console.log('✅ WebSocket Integration initialized');
        }
      } catch (error) {
        console.error('❌ Failed to initialize WebSocket Integration:', error);
      }
    };

    if (organizationId) {
      initializeWebSocket();
    }
  }, [organizationId]);

  // Update connection status
  useEffect(() => {
    const status = getWebSocketStatus();
    setConnectionStatus(status);
  }, [isWebSocketConnected, getWebSocketStatus]);

  // Test WebSocket connection
  const testConnection = async () => {
    try {
      const result = await testWebSocketConnection();
      console.log('Connection test result:', result);
      alert(`Connection test: ${result.status} - ${result.message}`);
    } catch (error) {
      console.error('Connection test failed:', error);
      alert(`Connection test failed: ${error.message}`);
    }
  };

  // Test broadcasting
  const testBroadcasting = async () => {
    try {
      const result = await webSocketIntegrationService.testBroadcasting(
        `test-channel-${Date.now()}`,
        'Test broadcast message'
      );
      console.log('Broadcasting test result:', result);
      alert(`Broadcasting test: ${result.status} - ${result.message}`);
    } catch (error) {
      console.error('Broadcasting test failed:', error);
      alert(`Broadcasting test failed: ${error.message}`);
    }
  };

  // Send test message
  const sendTestMessage = async () => {
    if (!testMessage.trim()) return;

    try {
      const response = await sendMessageWithWebSocket({
        content: testMessage,
        type: 'text'
      });

      if (response.success) {
        setMessages(prev => [...prev, {
          id: Date.now(),
          content: testMessage,
          timestamp: new Date().toISOString(),
          type: 'sent'
        }]);
        setTestMessage('');
      }
    } catch (error) {
      console.error('Failed to send test message:', error);
      alert(`Failed to send message: ${error.message}`);
    }
  };

  // Test typing indicator
  const testTypingIndicator = () => {
    sendTypingIndicator(true);
    setTimeout(() => {
      sendTypingIndicator(false);
    }, 3000);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">WebSocket Integration Test</h2>

      {/* User Info */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">User Information</h3>
        <div className="text-sm text-gray-600">
          <div>User: {user?.name || 'Not loaded'}</div>
          <div>Organization ID: {organizationId || 'Not loaded'}</div>
          <div>Session ID: {testSessionId}</div>
        </div>
      </div>

      {/* Connection Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">Connection Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-3 h-3 rounded-full ${isWebSocketConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>WebSocket: {isWebSocketConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
            <div className="text-sm text-gray-600">
              <div>Initialized: {connectionStatus.isInitialized ? 'Yes' : 'No'}</div>
              <div>Reconnect Attempts: {connectionStatus.reconnectAttempts || 0}</div>
              <div>Channels: {connectionStatus.channels?.length || 0}</div>
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">
              <div>Typing: {isTyping ? 'Yes' : 'No'}</div>
              <div>Typing Users: {typingUsers.length}</div>
              <div>Messages: {messages.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Test Controls */}
      <div className="mb-6">
        <h3 className="font-semibold mb-4">Test Controls</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={testConnection}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Test Connection
          </button>

          <button
            onClick={testBroadcasting}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Test Broadcasting
          </button>

          <button
            onClick={testTypingIndicator}
            className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
          >
            Test Typing
          </button>

          <button
            onClick={() => setMessages([])}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            Clear Messages
          </button>
        </div>
      </div>

      {/* Message Input */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Send Test Message</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            placeholder="Enter test message..."
            className="flex-1 border border-gray-300 rounded px-3 py-2"
            onKeyPress={(e) => e.key === 'Enter' && sendTestMessage()}
          />
          <button
            onClick={sendTestMessage}
            className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
          >
            Send
          </button>
        </div>
      </div>

      {/* Messages Display */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Messages ({messages.length})</h3>
        <div className="bg-gray-50 rounded p-4 h-64 overflow-y-auto">
          {messages.length === 0 ? (
            <p className="text-gray-500">No messages yet. Send a test message above.</p>
          ) : (
            <div className="space-y-2">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className="p-2 rounded bg-blue-100"
                >
                  <div className="text-sm font-medium">Test Message</div>
                  <div className="text-gray-800">{message.content}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Typing Indicators */}
      {typingUsers.length > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
          <h3 className="font-semibold mb-2">Typing Users</h3>
          <div className="text-sm text-gray-600">
            {typingUsers.map((user, index) => (
              <div key={index}>
                {user.name} is typing...
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Configuration */}
      <div className="bg-gray-100 rounded p-4">
        <h3 className="font-semibold mb-2">Configuration</h3>
        <div className="text-sm text-gray-600 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div>Host: {import.meta.env.VITE_REVERB_HOST || 'localhost'}</div>
            <div>Port: {import.meta.env.VITE_REVERB_PORT || '8081'}</div>
            <div>Scheme: {import.meta.env.VITE_REVERB_SCHEME || 'http'}</div>
          </div>
          <div>
            <div>Debug: {import.meta.env.VITE_REVERB_DEBUG || 'false'}</div>
            <div>Base URL: {import.meta.env.VITE_BASE_URL || 'http://localhost:9000'}</div>
            <div>App Key: {import.meta.env.VITE_REVERB_APP_KEY || 'Not set'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebSocketIntegrationTest;
