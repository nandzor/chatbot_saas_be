#!/bin/bash

# WebSocket Test Script
# Tests WebSocket functionality and connection

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 WebSocket Test Script${NC}"
echo "=========================="

# Configuration
BACKEND_URL="http://localhost:9000"
REVERB_HOST="localhost"
REVERB_PORT="8081"

# Test 1: Backend Health Check
echo -e "\n${YELLOW}Testing Backend Health...${NC}"
if curl -s "$BACKEND_URL/api/websocket/health" | grep -q "status.*ok"; then
    echo -e "${GREEN}✅ Backend health check passed${NC}"
else
    echo -e "${RED}❌ Backend health check failed${NC}"
    exit 1
fi

# Test 2: WebSocket Configuration
echo -e "\n${YELLOW}Testing WebSocket Configuration...${NC}"
if curl -s "$BACKEND_URL/api/websocket/config" | grep -q "host"; then
    echo -e "${GREEN}✅ WebSocket configuration accessible${NC}"
else
    echo -e "${RED}❌ WebSocket configuration failed${NC}"
    exit 1
fi

# Test 3: Reverb Server Connection
echo -e "\n${YELLOW}Testing Reverb Server Connection...${NC}"
if curl -s "http://$REVERB_HOST:$REVERB_PORT/apps/chatbot_saas/events" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Reverb server is accessible${NC}"
else
    echo -e "${RED}❌ Reverb server connection failed${NC}"
    exit 1
fi

# Test 4: Environment Variables
echo -e "\n${YELLOW}Testing Environment Variables...${NC}"
if docker exec cte_app grep -q "REVERB_APP_ID=chatbot_saas" .env; then
    echo -e "${GREEN}✅ Backend environment configured${NC}"
else
    echo -e "${RED}❌ Backend environment not configured${NC}"
    exit 1
fi

if grep -q "VITE_REVERB_APP_ID=chatbot_saas" frontend/.env 2>/dev/null; then
    echo -e "${GREEN}✅ Frontend environment configured${NC}"
else
    echo -e "${RED}❌ Frontend environment not configured${NC}"
    exit 1
fi

echo -e "\n${GREEN}🎉 All WebSocket tests passed!${NC}"
echo -e "\n${BLUE}Next Steps:${NC}"
echo "1. Start Reverb: docker exec cte_app php artisan reverb:start"
echo "2. Start Frontend: cd frontend && npm run dev"
echo "3. Test Integration: http://localhost:3000/dashboard/websocket-integration-test"
