/**
 * Laravel Echo Test Component
 * Component for testing Laravel Echo integration
 */

import React, { useState, useEffect } from 'react';
import { useEchoContext } from './EchoProvider';
import { Button } from '@/components/ui';
import { Send, Wifi, WifiOff, Users, MessageSquare } from 'lucide-react';

const EchoTest = () => {
  const {
    isConnected,
    connectionError,
    users,
    isInitialized,
    organizationId,
    sendTypingIndicator,
    markMessageAsRead,
    broadcastToOrganization,
    getConnectionStatus
  } = useEchoContext();

  const [testMessage, setTestMessage] = useState('');
  const [testSessionId, setTestSessionId] = useState('test-session-123');
  const [logs, setLogs] = useState([]);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, message, type }]);
  };

  useEffect(() => {
    if (isConnected) {
      addLog('Echo connected successfully', 'success');
    } else if (connectionError) {
      addLog(`Connection error: ${connectionError}`, 'error');
    }
  }, [isConnected, connectionError]);

  const handleSendTestMessage = () => {
    if (!testMessage.trim()) return;

    try {
      const success = broadcastToOrganization('test.message', {
        message: testMessage,
        timestamp: new Date().toISOString()
      });

      if (success) {
        addLog(`Sent test message: ${testMessage}`, 'success');
        setTestMessage('');
      } else {
        addLog('Failed to send test message', 'error');
      }
    } catch (error) {
      addLog(`Error sending test message: ${error.message}`, 'error');
    }
  };

  const handleSendTypingIndicator = (isTyping) => {
    try {
      const success = sendTypingIndicator(testSessionId, isTyping);
      if (success) {
        addLog(`Sent typing indicator: ${isTyping ? 'start' : 'stop'}`, 'info');
      } else {
        addLog('Failed to send typing indicator', 'error');
      }
    } catch (error) {
      addLog(`Error sending typing indicator: ${error.message}`, 'error');
    }
  };

  const handleMarkAsRead = () => {
    try {
      const success = markMessageAsRead(testSessionId, 'test-message-123');
      if (success) {
        addLog('Marked message as read', 'success');
      } else {
        addLog('Failed to mark message as read', 'error');
      }
    } catch (error) {
      addLog(`Error marking message as read: ${error.message}`, 'error');
    }
  };

  const handleGetStatus = () => {
    try {
      const status = getConnectionStatus();
      addLog(`Connection status: ${JSON.stringify(status, null, 2)}`, 'info');
    } catch (error) {
      addLog(`Error getting status: ${error.message}`, 'error');
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <MessageSquare className="w-6 h-6 mr-2" />
          Laravel Echo Test
        </h2>

        {/* Connection Status */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Connection Status</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <Wifi className="w-5 h-5 text-green-500" />
              ) : (
                <WifiOff className="w-5 h-5 text-red-500" />
              )}
              <span className={`text-sm ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-blue-600">{users.length} users online</span>
            </div>

            <div className="text-sm text-gray-600">
              <span className="font-medium">Initialized:</span> {isInitialized ? 'Yes' : 'No'}
            </div>

            <div className="text-sm text-gray-600">
              <span className="font-medium">Org ID:</span> {organizationId || 'None'}
            </div>
          </div>

          {connectionError && (
            <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
              <strong>Error:</strong> {connectionError}
            </div>
          )}
        </div>

        {/* Test Controls */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Test Controls</h3>

          <div className="space-y-4">
            {/* Test Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Message
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  placeholder="Enter test message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button
                  onClick={handleSendTestMessage}
                  disabled={!isConnected || !testMessage.trim()}
                  className="px-4 py-2"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send
                </Button>
              </div>
            </div>

            {/* Session ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Session ID
              </label>
              <input
                type="text"
                value={testSessionId}
                onChange={(e) => setTestSessionId(e.target.value)}
                placeholder="Enter session ID..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => handleSendTypingIndicator(true)}
                disabled={!isConnected}
                variant="outline"
                size="sm"
              >
                Start Typing
              </Button>

              <Button
                onClick={() => handleSendTypingIndicator(false)}
                disabled={!isConnected}
                variant="outline"
                size="sm"
              >
                Stop Typing
              </Button>

              <Button
                onClick={handleMarkAsRead}
                disabled={!isConnected}
                variant="outline"
                size="sm"
              >
                Mark as Read
              </Button>

              <Button
                onClick={handleGetStatus}
                variant="outline"
                size="sm"
              >
                Get Status
              </Button>

              <Button
                onClick={clearLogs}
                variant="outline"
                size="sm"
              >
                Clear Logs
              </Button>
            </div>
          </div>
        </div>

        {/* Logs */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Event Logs</h3>
          <div className="bg-black text-green-400 p-4 rounded-md font-mono text-sm max-h-64 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-gray-500">No logs yet...</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className={`mb-1 ${
                  log.type === 'error' ? 'text-red-400' :
                  log.type === 'success' ? 'text-green-400' :
                  'text-blue-400'
                }`}>
                  <span className="text-gray-500">[{log.timestamp}]</span> {log.message}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EchoTest;
