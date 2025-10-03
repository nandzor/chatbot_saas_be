import React from 'react';
import WebSocketTest from '@/components/WebSocketTest';
import EchoProvider from '@/components/EchoProvider';

const WebSocketTestPage = () => {
  return (
    <EchoProvider>
      <div className="min-h-screen bg-gray-100 py-8">
        <WebSocketTest />
      </div>
    </EchoProvider>
  );
};

export default WebSocketTestPage;
