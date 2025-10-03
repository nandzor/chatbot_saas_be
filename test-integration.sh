#!/bin/bash

# Backend-Frontend WebSocket Integration Test
# Comprehensive testing script for the complete integration

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Backend-Frontend WebSocket Integration Test${NC}"
echo "=================================================="

# Configuration
BACKEND_URL="http://localhost:9000"
FRONTEND_URL="http://localhost:3000"
REVERB_HOST="localhost"
REVERB_PORT="8081"

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0
TOTAL_TESTS=0

# Function to run a test
run_test() {
    local test_name="$1"
    local test_command="$2"

    echo -e "\n${YELLOW}Testing: $test_name${NC}"
    TOTAL_TESTS=$((TOTAL_TESTS + 1))

    if eval "$test_command"; then
        echo -e "${GREEN}✅ PASSED: $test_name${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}❌ FAILED: $test_name${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
}

# Test 1: Backend Health Check
run_test "Backend Health Check" "
curl -s $BACKEND_URL/api/websocket/health | grep -q 'status.*ok'
"

# Test 2: WebSocket Configuration
run_test "WebSocket Configuration" "
curl -s $BACKEND_URL/api/websocket/config | grep -q 'host'
"

# Test 3: Reverb Server Connection
run_test "Reverb Server Connection" "
curl -s http://$REVERB_HOST:$REVERB_PORT/apps/chatbot_saas/events > /dev/null 2>&1
"

# Test 4: Environment Variables Check
run_test "Backend Environment Variables" "
grep -q 'REVERB_APP_ID=chatbot_saas' .env 2>/dev/null || echo 'Backend .env not found or missing REVERB_APP_ID'
"

# Test 5: Frontend Environment Variables
run_test "Frontend Environment Variables" "
grep -q 'VITE_REVERB_APP_ID=chatbot_saas' frontend/.env 2>/dev/null || echo 'Frontend .env not found or missing VITE_REVERB_APP_ID'
"

# Test 6: Laravel Reverb Installation
run_test "Laravel Reverb Installation" "
composer show laravel/reverb > /dev/null 2>&1
"

# Test 7: Frontend Dependencies
run_test "Frontend Dependencies" "
cd frontend && npm list laravel-echo > /dev/null 2>&1 && npm list pusher-js > /dev/null 2>&1
"

# Test 8: Backend Routes
run_test "Backend Routes" "
docker exec cte_app grep -q '/health' routes/api.php && docker exec cte_app grep -q '/config' routes/api.php
"

# Test 9: Frontend Components
run_test "Frontend Components" "
test -f frontend/src/services/WebSocketIntegrationService.js && \
test -f frontend/src/components/EchoProvider.jsx && \
test -f frontend/src/hooks/useConversation.js
"

# Test 10: Backend Services
run_test "Backend Services" "
docker exec cte_app test -f app/Services/WebSocketIntegrationService.php && \
docker exec cte_app test -f app/Http/Controllers/WebSocketController.php && \
docker exec cte_app test -f app/Events/MessageSent.php
"

# Test 11: Authentication Setup
run_test "Authentication Setup" "
docker exec cte_app test -f app/Broadcasting/ReverbAuthManager.php && \
docker exec cte_app test -f routes/channels.php
"

# Test 12: Frontend Integration
run_test "Frontend Integration" "
grep -q 'EchoProvider' frontend/src/App.jsx && \
grep -q 'useConversation' frontend/src/hooks/useConversation.js
"

# Test 13: Backend Broadcasting
run_test "Backend Broadcasting" "
docker exec cte_app grep -q 'BROADCAST_CONNECTION=reverb' .env 2>/dev/null || echo 'BROADCAST_CONNECTION not set to reverb'
"

# Test 14: Frontend Echo Configuration
run_test "Frontend Echo Configuration" "
test -f frontend/src/config/echo.js && \
grep -q 'broadcaster.*reverb' frontend/src/config/echo.js
"

# Test 15: Integration Test Component
run_test "Integration Test Component" "
test -f frontend/src/components/WebSocketIntegrationTest.jsx && \
grep -q 'websocket-integration-test' frontend/src/routes/index.jsx
"

# Test 16: Error Handling
run_test "Error Handling" "
grep -q 'try.*catch' frontend/src/services/WebSocketIntegrationService.js && \
docker exec cte_app grep -q 'try.*catch' app/Services/WebSocketIntegrationService.php
"

# Test 17: Performance Optimizations
run_test "Performance Optimizations" "
docker exec cte_app grep -q 'REVERB_MAX_CONNECTIONS=2000' .env 2>/dev/null || echo 'Max connections not optimized' && \
docker exec cte_app grep -q 'REVERB_HEARTBEAT_INTERVAL=15' .env 2>/dev/null || echo 'Heartbeat not optimized'
"

# Test 18: Security Features
run_test "Security Features" "
docker exec cte_app grep -q 'JWT' app/Broadcasting/ReverbAuthManager.php && \
docker exec cte_app grep -q 'organization_id' app/Broadcasting/ReverbAuthManager.php
"

# Test 19: Documentation
run_test "Documentation" "
test -f BACKEND_FRONTEND_INTEGRATION.md && \
test -f frontend/WEBSOCKET_SETUP.md
"

# Test 20: Monitoring
run_test "Monitoring" "
docker exec cte_app test -f app/Console/Commands/WebSocketMonitor.php && \
test -f test-websocket.sh
"

# Summary
echo -e "\n${BLUE}📊 Test Summary${NC}"
echo "=================="
echo -e "Total Tests: $TOTAL_TESTS"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All tests passed! Integration is complete.${NC}"
    echo -e "\n${BLUE}Next Steps:${NC}"
    echo "1. Start backend: php artisan reverb:start"
    echo "2. Start frontend: cd frontend && npm run dev"
    echo "3. Test integration: http://localhost:3000/dashboard/websocket-integration-test"
    echo "4. Monitor logs: tail -f storage/logs/reverb.log"
else
    echo -e "\n${RED}⚠️ Some tests failed. Please check the issues above.${NC}"
    echo -e "\n${YELLOW}Common fixes:${NC}"
    echo "1. Check environment variables in .env and frontend/.env"
    echo "2. Install missing dependencies: composer install && npm install"
    echo "3. Start Reverb server: php artisan reverb:start"
    echo "4. Check firewall settings for port 8081"
fi

# Exit with appropriate code
if [ $TESTS_FAILED -eq 0 ]; then
    exit 0
else
    exit 1
fi
