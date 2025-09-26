import WebSocket from 'ws';

// Test WebSocket connection to Laravel Reverb
const testWebSocketConnection = () => {
  const wsUrl = 'ws://localhost:8081/app/14823957';
  
  console.log('Testing WebSocket connection to:', wsUrl);
  
  const ws = new WebSocket(wsUrl);
  
  ws.on('open', () => {
    console.log('✅ WebSocket connection established successfully!');
    
    // Send a test message
    const testMessage = {
      event: 'pusher:ping',
      data: {}
    };
    
    ws.send(JSON.stringify(testMessage));
    console.log('📤 Sent ping message');
  });
  
  ws.on('message', (data) => {
    console.log('📥 Received message:', data.toString());
  });
  
  ws.on('error', (error) => {
    console.error('❌ WebSocket error:', error.message);
  });
  
  ws.on('close', (code, reason) => {
    console.log(`🔌 WebSocket connection closed. Code: ${code}, Reason: ${reason}`);
  });
  
  // Close connection after 5 seconds
  setTimeout(() => {
    ws.close();
    console.log('🔄 Test completed');
  }, 5000);
};

// Run the test
testWebSocketConnection();
