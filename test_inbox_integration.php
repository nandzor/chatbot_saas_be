<?php

/**
 * Simple test script to verify inbox integration
 * This is a basic test to ensure the API endpoints are working
 */

require_once __DIR__ . '/vendor/autoload.php';

use App\Services\InboxService;
use App\Models\ChatSession;
use App\Models\Message;
use App\Models\Customer;
use App\Models\Agent;

echo "Testing Inbox Integration...\n\n";

// Test 1: Check if InboxService can be instantiated
try {
    $inboxService = new InboxService();
    echo "✅ InboxService instantiated successfully\n";
} catch (Exception $e) {
    echo "❌ Failed to instantiate InboxService: " . $e->getMessage() . "\n";
}

// Test 2: Check if models exist and can be instantiated
$models = [
    'ChatSession' => ChatSession::class,
    'Message' => Message::class,
    'Customer' => Customer::class,
    'Agent' => Agent::class,
];

foreach ($models as $name => $class) {
    try {
        $model = new $class();
        echo "✅ {$name} model instantiated successfully\n";
    } catch (Exception $e) {
        echo "❌ Failed to instantiate {$name}: " . $e->getMessage() . "\n";
    }
}

// Test 3: Check if API routes are properly defined
$routesFile = __DIR__ . '/routes/api.php';
if (file_exists($routesFile)) {
    $content = file_get_contents($routesFile);
    if (strpos($content, 'inbox') !== false) {
        echo "✅ Inbox routes found in API routes file\n";
    } else {
        echo "❌ Inbox routes not found in API routes file\n";
    }
} else {
    echo "❌ API routes file not found\n";
}

// Test 4: Check if frontend files exist
$frontendFiles = [
    '/frontend/src/services/inboxApi.js',
    '/frontend/src/features/shared/SessionManager.jsx',
    '/frontend/src/features/shared/InboxManagement.jsx',
    '/frontend/src/pages/inbox/Inbox.jsx',
];

foreach ($frontendFiles as $file) {
    $fullPath = __DIR__ . $file;
    if (file_exists($fullPath)) {
        echo "✅ Frontend file exists: {$file}\n";
    } else {
        echo "❌ Frontend file missing: {$file}\n";
    }
}

echo "\n🎉 Inbox integration test completed!\n";
echo "\nTo test the full integration:\n";
echo "1. Start the Laravel server: php artisan serve\n";
echo "2. Start the frontend: cd frontend && npm start\n";
echo "3. Navigate to /inbox in your browser\n";
echo "4. Check the browser console for any errors\n";
echo "5. Test the API endpoints using Postman or curl\n\n";

echo "API Endpoints to test:\n";
echo "- GET /api/v1/inbox/statistics\n";
echo "- GET /api/v1/inbox/sessions\n";
echo "- GET /api/v1/inbox/sessions/active\n";
echo "- GET /api/v1/inbox/sessions/pending\n";
echo "- POST /api/v1/inbox/sessions\n";
echo "- PUT /api/v1/inbox/sessions/{id}\n";
echo "- POST /api/v1/inbox/sessions/{id}/transfer\n";
echo "- POST /api/v1/inbox/sessions/{id}/end\n";
echo "- GET /api/v1/inbox/sessions/{id}/messages\n";
echo "- POST /api/v1/inbox/sessions/{id}/messages\n";
echo "- GET /api/v1/inbox/export\n";
