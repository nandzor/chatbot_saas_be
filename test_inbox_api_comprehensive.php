<?php
/**
 * Comprehensive Inbox API Test Script
 * Tests all inbox endpoints with proper authentication
 */

// Configuration
$baseUrl = 'http://localhost:9000/api';
$adminCredentials = [
    'email' => 'admin@test.com',
    'password' => 'Password123!'
];

// Colors for output
$colors = [
    'red' => "\033[31m",
    'green' => "\033[32m",
    'yellow' => "\033[33m",
    'blue' => "\033[34m",
    'magenta' => "\033[35m",
    'cyan' => "\033[36m",
    'white' => "\033[37m",
    'reset' => "\033[0m"
];

function colorize($text, $color = 'white') {
    global $colors;
    return $colors[$color] . $text . $colors['reset'];
}

function makeRequest($url, $method = 'GET', $data = null, $headers = []) {
    $ch = curl_init();
    
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array_merge([
        'Content-Type: application/json',
        'Accept: application/json'
    ], $headers));
    
    if ($data) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    
    curl_close($ch);
    
    return [
        'status' => $httpCode,
        'body' => $response,
        'error' => $error
    ];
}

function testEndpoint($name, $url, $method = 'GET', $data = null, $headers = []) {
    echo colorize("\n" . str_repeat("=", 60), 'cyan');
    echo colorize("\nTesting: $name", 'yellow');
    echo colorize("\nURL: $method $url", 'blue');
    
    if ($data) {
        echo colorize("\nData: " . json_encode($data, JSON_PRETTY_PRINT), 'magenta');
    }
    
    $response = makeRequest($url, $method, $data, $headers);
    
    echo colorize("\nHTTP Status: " . $response['status'], 
        $response['status'] >= 200 && $response['status'] < 300 ? 'green' : 'red');
    
    if ($response['error']) {
        echo colorize("\nCURL Error: " . $response['error'], 'red');
    }
    
    $body = json_decode($response['body'], true);
    if ($body) {
        echo colorize("\nResponse: " . json_encode($body, JSON_PRETTY_PRINT), 'white');
    } else {
        echo colorize("\nRaw Response: " . $response['body'], 'white');
    }
    
    return $response;
}

// Step 1: Login to get authentication token
echo colorize("\n" . str_repeat("=", 80), 'green');
echo colorize("\nSTEP 1: AUTHENTICATION", 'green');
echo colorize("\n" . str_repeat("=", 80), 'green');

$loginResponse = testEndpoint(
    'Admin Login',
    $baseUrl . '/auth/login',
    'POST',
    $adminCredentials
);

if ($loginResponse['status'] !== 200) {
    echo colorize("\n❌ Login failed! Cannot proceed with tests.", 'red');
    exit(1);
}

$loginData = json_decode($loginResponse['body'], true);
$token = $loginData['data']['token'] ?? null;
$organizationId = $loginData['data']['user']['organization_id'] ?? null;

if (!$token) {
    echo colorize("\n❌ No token received! Cannot proceed with tests.", 'red');
    exit(1);
}

echo colorize("\n✅ Login successful! Token: " . substr($token, 0, 20) . "...", 'green');
echo colorize("\nOrganization ID: $organizationId", 'green');

$authHeaders = ['Authorization: Bearer ' . $token];

// Step 2: Test all inbox endpoints
echo colorize("\n" . str_repeat("=", 80), 'green');
echo colorize("\nSTEP 2: INBOX API ENDPOINTS TESTING", 'green');
echo colorize("\n" . str_repeat("=", 80), 'green');

// 2.1 Statistics and Overview
echo colorize("\n" . str_repeat("-", 60), 'yellow');
echo colorize("\n2.1 STATISTICS AND OVERVIEW", 'yellow');
echo colorize("\n" . str_repeat("-", 60), 'yellow');

testEndpoint(
    'Inbox Statistics',
    $baseUrl . '/inbox/statistics',
    'GET',
    null,
    $authHeaders
);

testEndpoint(
    'Export Data',
    $baseUrl . '/inbox/export',
    'GET',
    null,
    $authHeaders
);

// 2.2 Session Management
echo colorize("\n" . str_repeat("-", 60), 'yellow');
echo colorize("\n2.2 SESSION MANAGEMENT", 'yellow');
echo colorize("\n" . str_repeat("-", 60), 'yellow');

testEndpoint(
    'All Sessions',
    $baseUrl . '/inbox/sessions',
    'GET',
    null,
    $authHeaders
);

testEndpoint(
    'Active Sessions',
    $baseUrl . '/inbox/sessions/active',
    'GET',
    null,
    $authHeaders
);

testEndpoint(
    'Pending Sessions',
    $baseUrl . '/inbox/sessions/pending',
    'GET',
    null,
    $authHeaders
);

// 2.3 Bot Personality Management
echo colorize("\n" . str_repeat("-", 60), 'yellow');
echo colorize("\n2.3 BOT PERSONALITY MANAGEMENT", 'yellow');
echo colorize("\n" . str_repeat("-", 60), 'yellow');

testEndpoint(
    'Bot Personalities List',
    $baseUrl . '/inbox/bot-personalities',
    'GET',
    null,
    $authHeaders
);

testEndpoint(
    'Available Bot Personalities',
    $baseUrl . '/inbox/bot-personalities/available',
    'GET',
    null,
    $authHeaders
);

testEndpoint(
    'Bot Personality Statistics',
    $baseUrl . '/inbox/bot-personalities/statistics',
    'GET',
    null,
    $authHeaders
);

// 2.4 Test with sample session ID (if sessions exist)
echo colorize("\n" . str_repeat("-", 60), 'yellow');
echo colorize("\n2.4 SESSION-SPECIFIC OPERATIONS", 'yellow');
echo colorize("\n" . str_repeat("-", 60), 'yellow');

// First, get sessions to find a valid session ID
$sessionsResponse = makeRequest($baseUrl . '/inbox/sessions', 'GET', null, $authHeaders);
$sessionsData = json_decode($sessionsResponse['body'], true);

$sampleSessionId = null;
if ($sessionsData && isset($sessionsData['data']['data']) && count($sessionsData['data']['data']) > 0) {
    $sampleSessionId = $sessionsData['data']['data'][0]['id'];
    echo colorize("\nFound sample session ID: $sampleSessionId", 'green');
    
    // Test session-specific endpoints
    testEndpoint(
        'Get Session Details',
        $baseUrl . '/inbox/sessions/' . $sampleSessionId,
        'GET',
        null,
        $authHeaders
    );
    
    testEndpoint(
        'Get Session Messages',
        $baseUrl . '/inbox/sessions/' . $sampleSessionId . '/messages',
        'GET',
        null,
        $authHeaders
    );
    
    testEndpoint(
        'Get Session Analytics',
        $baseUrl . '/inbox/sessions/' . $sampleSessionId . '/analytics',
        'GET',
        null,
        $authHeaders
    );
    
    // Test bot personality assignment
    testEndpoint(
        'Assign Bot Personality to Session',
        $baseUrl . '/inbox/sessions/' . $sampleSessionId . '/assign-personality',
        'POST',
        ['personality_id' => 1], // Assuming personality ID 1 exists
        $authHeaders
    );
    
    // Test AI response generation
    testEndpoint(
        'Generate AI Response',
        $baseUrl . '/inbox/sessions/' . $sampleSessionId . '/generate-ai-response',
        'POST',
        ['message' => 'Hello, how can you help me?'],
        $authHeaders
    );
    
} else {
    echo colorize("\n⚠️  No sessions found. Skipping session-specific tests.", 'yellow');
}

// 2.5 Test bot personality performance (if personalities exist)
echo colorize("\n" . str_repeat("-", 60), 'yellow');
echo colorize("\n2.5 BOT PERSONALITY PERFORMANCE", 'yellow');
echo colorize("\n" . str_repeat("-", 60), 'yellow');

testEndpoint(
    'Bot Personality Performance (ID: 1)',
    $baseUrl . '/inbox/bot-personalities/1/performance',
    'GET',
    null,
    $authHeaders
);

// 2.6 Test session creation (requires create permission)
echo colorize("\n" . str_repeat("-", 60), 'yellow');
echo colorize("\n2.6 SESSION CREATION", 'yellow');
echo colorize("\n" . str_repeat("-", 60), 'yellow');

testEndpoint(
    'Create New Session',
    $baseUrl . '/inbox/sessions',
    'POST',
    [
        'customer_id' => 1,
        'channel' => 'whatsapp',
        'status' => 'active'
    ],
    $authHeaders
);

// 2.7 Test message operations
echo colorize("\n" . str_repeat("-", 60), 'yellow');
echo colorize("\n2.7 MESSAGE OPERATIONS", 'yellow');
echo colorize("\n" . str_repeat("-", 60), 'yellow');

if ($sampleSessionId) {
    testEndpoint(
        'Send Message to Session',
        $baseUrl . '/inbox/sessions/' . $sampleSessionId . '/messages',
        'POST',
        [
            'content' => 'Test message from API',
            'type' => 'text',
            'sender' => 'agent'
        ],
        $authHeaders
    );
    
    testEndpoint(
        'Mark Message as Read',
        $baseUrl . '/inbox/sessions/' . $sampleSessionId . '/messages/1/read',
        'POST',
        null,
        $authHeaders
    );
}

// 2.8 Test session transfer and end
echo colorize("\n" . str_repeat("-", 60), 'yellow');
echo colorize("\n2.8 SESSION TRANSFER AND END", 'yellow');
echo colorize("\n" . str_repeat("-", 60), 'yellow');

if ($sampleSessionId) {
    testEndpoint(
        'Transfer Session',
        $baseUrl . '/inbox/sessions/' . $sampleSessionId . '/transfer',
        'POST',
        [
            'agent_id' => 1,
            'reason' => 'Test transfer'
        ],
        $authHeaders
    );
    
    testEndpoint(
        'End Session',
        $baseUrl . '/inbox/sessions/' . $sampleSessionId . '/end',
        'POST',
        [
            'reason' => 'Test end session'
        ],
        $authHeaders
    );
}

// Summary
echo colorize("\n" . str_repeat("=", 80), 'green');
echo colorize("\nTEST SUMMARY", 'green');
echo colorize("\n" . str_repeat("=", 80), 'green');
echo colorize("\n✅ All inbox API endpoints have been tested!", 'green');
echo colorize("\n📊 Check the responses above for any errors or issues.", 'yellow');
echo colorize("\n🔧 If any endpoints fail, check:", 'cyan');
echo colorize("\n   - Database connection", 'white');
echo colorize("\n   - Permission middleware", 'white');
echo colorize("\n   - Controller method implementations", 'white');
echo colorize("\n   - Service layer dependencies", 'white');
echo colorize("\n" . str_repeat("=", 80), 'green');
?>
