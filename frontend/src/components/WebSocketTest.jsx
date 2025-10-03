/**
 * WebSocket Test Component
 * Component for testing WebSocket connection and functionality
 */

import React, { useState, useEffect } from 'react';
import { useEcho } from '@/hooks/useEcho';
import { authService } from '@/services/AuthService';

const WebSocketTest = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [testMessage, setTestMessage] = useState('');
  const [organizationId, setOrganizationId] = useState(null);
  const [user, setUser] = useState(null);

  // Initialize Echo hook
  const {
    isConnected: echoConnected,
    connectionError: echoError,
    subscribeToConversation,
    unsubscribeFromConversation,
    sendTypingIndicator,
    markMessageAsRead,
    broadcastToOrganization,
    getConnectionStatus
  } = useEcho({
    organizationId,
    onMessage: (data) => {
      console.log('📨 Message received:', data);
      setMessages(prev => [...prev, {
        id: Date.now(),
        content: data.message || 'Test message',
        timestamp: new Date().toISOString(),
        type: 'received'
      }]);
    },
    onTyping: (data) => {
      console.log('⌨️ Typing indicator:', data);
    },
    onConnectionChange: (connected) => {
      setIsConnected(connected);
      console.log('🔌 Connection status:', connected ? 'Connected' : 'Disconnected');
    },
    onUsersOnline: (users) => {
      console.log('👥 Users online:', users);
    }
  });

  // Get current user and organization
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
        setOrganizationId(currentUser?.organization_id || currentUser?.organization?.id);
      } catch (error) {
        console.error('Failed to get current user:', error);
        setConnectionError('Authentication failed');
      }
    };

    getCurrentUser();
  }, []);

  // Update connection status
  useEffect(() => {
    setIsConnected(echoConnected);
    setConnectionError(echoError);
  }, [echoConnected, echoError]);

  // Test WebSocket connection
  const testConnection = async () => {
    try {
      const status = getConnectionStatus();
      console.log('WebSocket Status:', status);

      // Test broadcasting
      if (organizationId) {
        const success = broadcastToOrganization('TestEvent', {
          message: 'Test broadcast message',
          timestamp: new Date().toISOString()
        });

        if (success) {
          console.log('✅ Broadcast test successful');
        } else {
          console.error('❌ Broadcast test failed');
        }
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      setConnectionError(error.message);
    }
  };

  // Send test message
  const sendTestMessage = () => {
    if (!testMessage.trim()) return;

    const newMessage = {
      id: Date.now(),
      content: testMessage,
      timestamp: new Date().toISOString(),
      type: 'sent'
    };

    setMessages(prev => [...prev, newMessage]);
    setTestMessage('');

    // Simulate typing indicator
    if (organizationId) {
      sendTypingIndicator(organizationId, true);
      setTimeout(() => {
        sendTypingIndicator(organizationId, false);
      }, 1000);
    }
  };

  // Test conversation subscription
  const testConversationSubscription = () => {
    if (organizationId) {
      const channel = subscribeToConversation(`test-${organizationId}`);
      if (channel) {
        console.log('✅ Conversation subscription successful');
      } else {
        console.error('❌ Conversation subscription failed');
      }
    }
  };

  // Clear messages
  const clearMessages = () => {
    setMessages([]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">WebSocket Connection Test</h2>

      {/* Connection Status */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="font-semibold">
            Status: {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        {connectionError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Error: {connectionError}
          </div>
        )}

        {user && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
            User: {user.name} | Organization: {organizationId}
          </div>
        )}
      </div>

      {/* Test Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <button
          onClick={testConnection}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Test Connection
        </button>

        <button
          onClick={testConversationSubscription}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          disabled={!organizationId}
        >
          Test Subscription
        </button>

        <button
          onClick={clearMessages}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
        >
          Clear Messages
        </button>
      </div>

      {/* Message Input */}
      <div className="mb-6">
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
            className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
          >
            Send
          </button>
        </div>
      </div>

      {/* Messages Display */}
      <div className="bg-gray-50 rounded p-4 h-64 overflow-y-auto">
        <h3 className="font-semibold mb-2">Messages ({messages.length})</h3>
        {messages.length === 0 ? (
          <p className="text-gray-500">No messages yet. Send a test message above.</p>
        ) : (
          <div className="space-y-2">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`p-2 rounded ${
                  message.type === 'sent'
                    ? 'bg-blue-100 ml-8'
                    : 'bg-green-100 mr-8'
                }`}
              >
                <div className="text-sm font-medium">
                  {message.type === 'sent' ? 'You' : 'Received'}
                </div>
                <div className="text-gray-800">{message.content}</div>
                <div className="text-xs text-gray-500">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Connection Details */}
      <div className="mt-6 bg-gray-100 rounded p-4">
        <h3 className="font-semibold mb-2">Connection Details</h3>
        <div className="text-sm text-gray-600">
          <div>Host: {import.meta.env.VITE_REVERB_HOST || 'localhost'}</div>
          <div>Port: {import.meta.env.VITE_REVERB_PORT || '8081'}</div>
          <div>Scheme: {import.meta.env.VITE_REVERB_SCHEME || 'http'}</div>
          <div>Debug: {import.meta.env.VITE_REVERB_DEBUG || 'false'}</div>
        </div>
      </div>
    </div>
  );
};

export default WebSocketTest;
