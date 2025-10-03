#!/bin/bash

# WAHA Service Log Test Script
# Tests the WAHA service logging functionality

echo "🔍 WAHA Service Log Test Script"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test functions
test_waha_log_class() {
    echo -e "${BLUE}📋 Testing WahaServiceLog class...${NC}"

    if docker exec cte_app test -f app/Services/Waha/WahaServiceLog.php; then
        echo -e "✅ WahaServiceLog class exists"
    else
        echo -e "❌ WahaServiceLog class not found"
        return 1
    fi

    if docker exec cte_app test -f app/Console/Commands/WahaLogViewer.php; then
        echo -e "✅ WahaLogViewer command exists"
    else
        echo -e "❌ WahaLogViewer command not found"
        return 1
    fi

    echo ""
}

test_log_channel() {
    echo -e "${BLUE}📋 Testing WAHA log channel...${NC}"

    if docker exec cte_app grep -q "'waha'" config/logging.php; then
        echo -e "✅ WAHA log channel configured"
    else
        echo -e "❌ WAHA log channel not configured"
        return 1
    fi

    echo ""
}

test_waha_service_integration() {
    echo -e "${BLUE}📋 Testing WahaService integration...${NC}"

    if docker exec cte_app grep -q "WahaServiceLog" app/Services/Waha/WahaService.php; then
        echo -e "✅ WahaServiceLog imported in WahaService"
    else
        echo -e "❌ WahaServiceLog not imported in WahaService"
        return 1
    fi

    if docker exec cte_app grep -q "logTypingIndicator" app/Services/Waha/WahaService.php; then
        echo -e "✅ Typing indicator logging integrated"
    else
        echo -e "❌ Typing indicator logging not integrated"
        return 1
    fi

    if docker exec cte_app grep -q "logOutgoingMessage" app/Services/Waha/WahaService.php; then
        echo -e "✅ Outgoing message logging integrated"
    else
        echo -e "❌ Outgoing message logging not integrated"
        return 1
    fi

    if docker exec cte_app grep -q "logMediaUpload" app/Services/Waha/WahaService.php; then
        echo -e "✅ Media upload logging integrated"
    else
        echo -e "❌ Media upload logging not integrated"
        return 1
    fi

    if docker exec cte_app grep -q "logWebhook" app/Services/Waha/WahaService.php; then
        echo -e "✅ Webhook logging integrated"
    else
        echo -e "❌ Webhook logging not integrated"
        return 1
    fi

    echo ""
}

test_artisan_command() {
    echo -e "${BLUE}📋 Testing Artisan command...${NC}"

    # Test if command is registered
    if docker exec cte_app php artisan list | grep -q "waha:logs"; then
        echo -e "✅ waha:logs command registered"
    else
        echo -e "❌ waha:logs command not registered"
        return 1
    fi

    # Test command help
    if docker exec cte_app php artisan waha:logs --help > /dev/null 2>&1; then
        echo -e "✅ waha:logs command help works"
    else
        echo -e "❌ waha:logs command help failed"
        return 1
    fi

    echo ""
}

test_log_file_creation() {
    echo -e "${BLUE}📋 Testing log file creation...${NC}"

    # Create a test log entry
    docker exec cte_app php -r "
        use App\Services\Waha\WahaServiceLog;
        require_once 'vendor/autoload.php';
        \$app = require_once 'bootstrap/app.php';
        \$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

        WahaServiceLog::logTypingIndicator('test_session', '+1234567890', true, 'success');
        WahaServiceLog::logOutgoingMessage('test_session', '+1234567890', 'Test message', 'text', 'success');
        WahaServiceLog::logMediaUpload('test_session', '+1234567890', 'image', 'test.jpg', 'success');
        WahaServiceLog::logWebhook('TestEvent', ['test' => 'data'], 'success');

        echo 'Test logs created successfully';
    " > /dev/null 2>&1

    if [ $? -eq 0 ]; then
        echo -e "✅ Test log entries created"
    else
        echo -e "❌ Failed to create test log entries"
        return 1
    fi

    # Check if log file exists
    if docker exec cte_app test -f storage/logs/waha-service.log; then
        echo -e "✅ WAHA service log file created"
    else
        echo -e "❌ WAHA service log file not created"
        return 1
    fi

    echo ""
}

test_log_viewer() {
    echo -e "${BLUE}📋 Testing log viewer functionality...${NC}"

    # Test viewing recent logs
    if docker exec cte_app php artisan waha:logs --limit=5 > /dev/null 2>&1; then
        echo -e "✅ Recent logs viewable"
    else
        echo -e "❌ Recent logs not viewable"
        return 1
    fi

    # Test filtering by service
    if docker exec cte_app php artisan waha:logs --service=typing-indicator --limit=5 > /dev/null 2>&1; then
        echo -e "✅ Service filtering works"
    else
        echo -e "❌ Service filtering failed"
        return 1
    fi

    # Test statistics
    if docker exec cte_app php artisan waha:logs --stats --hours=1 > /dev/null 2>&1; then
        echo -e "✅ Statistics viewable"
    else
        echo -e "❌ Statistics not viewable"
        return 1
    fi

    echo ""
}

test_log_rotation() {
    echo -e "${BLUE}📋 Testing log rotation...${NC}"

    # Check if log rotation is configured
    if docker exec cte_app grep -q "MAX_LOG_SIZE" app/Services/Waha/WahaServiceLog.php; then
        echo -e "✅ Log rotation configured"
    else
        echo -e "❌ Log rotation not configured"
        return 1
    fi

    if docker exec cte_app grep -q "MAX_LOG_FILES" app/Services/Waha/WahaServiceLog.php; then
        echo -e "✅ Log file limit configured"
    else
        echo -e "❌ Log file limit not configured"
        return 1
    fi

    echo ""
}

# Main test execution
main() {
    echo -e "${GREEN}🚀 Starting WAHA Service Log Tests${NC}"
    echo ""

    local tests_passed=0
    local tests_total=0

    # Run tests
    tests_total=$((tests_total + 1))
    if test_waha_log_class; then
        tests_passed=$((tests_passed + 1))
    fi

    tests_total=$((tests_total + 1))
    if test_log_channel; then
        tests_passed=$((tests_passed + 1))
    fi

    tests_total=$((tests_total + 1))
    if test_waha_service_integration; then
        tests_passed=$((tests_passed + 1))
    fi

    tests_total=$((tests_total + 1))
    if test_artisan_command; then
        tests_passed=$((tests_passed + 1))
    fi

    tests_total=$((tests_total + 1))
    if test_log_file_creation; then
        tests_passed=$((tests_passed + 1))
    fi

    tests_total=$((tests_total + 1))
    if test_log_viewer; then
        tests_passed=$((tests_passed + 1))
    fi

    tests_total=$((tests_total + 1))
    if test_log_rotation; then
        tests_passed=$((tests_passed + 1))
    fi

    echo ""
    echo "================================"
    echo -e "${BLUE}📊 Test Results${NC}"
    echo "================================"
    echo -e "Tests Passed: ${GREEN}$tests_passed${NC} / ${BLUE}$tests_total${NC}"

    if [ $tests_passed -eq $tests_total ]; then
        echo -e "${GREEN}🎉 All WAHA Service Log tests passed!${NC}"
        echo ""
        echo -e "${YELLOW}📋 Available Commands:${NC}"
        echo "  php artisan waha:logs                    # View recent logs"
        echo "  php artisan waha:logs --service=typing-indicator  # Filter by service"
        echo "  php artisan waha:logs --session=session_123      # Filter by session"
        echo "  php artisan waha:logs --stats            # View statistics"
        echo "  php artisan waha:logs --stats --hours=168 # View 7-day statistics"
        echo ""
        echo -e "${YELLOW}📁 Log Files:${NC}"
        echo "  storage/logs/waha-service.log    # Main service log"
        echo "  storage/logs/waha.log            # Laravel log channel"
        echo ""
        echo -e "${YELLOW}📖 Documentation:${NC}"
        echo "  WAHA_SERVICE_LOG.md             # Complete documentation"
        exit 0
    else
        echo -e "${RED}❌ Some tests failed. Please check the output above.${NC}"
        exit 1
    fi
}

# Run main function
main "$@"
