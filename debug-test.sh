#!/bin/bash

# Simple test for frontend components
echo "Testing frontend components..."

if test -f frontend/src/services/WebSocketIntegrationService.js; then
    echo "✅ WebSocketIntegrationService.js exists"
else
    echo "❌ WebSocketIntegrationService.js missing"
fi

if test -f frontend/src/components/EchoProvider.jsx; then
    echo "✅ EchoProvider.jsx exists"
else
    echo "❌ EchoProvider.jsx missing"
fi

if test -f frontend/src/hooks/useConversation.js; then
    echo "✅ useConversation.js exists"
else
    echo "❌ useConversation.js missing"
fi

# Test all together
if test -f frontend/src/services/WebSocketIntegrationService.js && test -f frontend/src/components/EchoProvider.jsx && test -f frontend/src/hooks/useConversation.js; then
    echo "✅ All frontend components exist"
    exit 0
else
    echo "❌ Some frontend components missing"
    exit 1
fi
