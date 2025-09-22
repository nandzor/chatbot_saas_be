<?php

require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== DEBUGGING N8N WORKFLOW CREATION ===\n\n";

try {
    // Get first organization
    $organization = \App\Models\Organization::first();
    if (!$organization) {
        echo "❌ No organizations found\n";
        exit(1);
    }

    echo "✅ Organization found: " . $organization->name . "\n";

    // Test N8N service directly
    $n8nService = app(\App\Services\N8n\N8nService::class);
    $wahaSessionService = app(\App\Services\Waha\WahaSessionService::class);

    $sessionName = 'test-session-' . time();
    echo "📝 Testing with session name: " . $sessionName . "\n";

    // Test N8N service createWorkflowWithDatabase directly
    echo "\n1. Testing N8N service createWorkflowWithDatabase...\n";

    // Read workflow payload from file
    $workflowPayload = json_decode(file_get_contents('/app/waha_workflow_payload.json'), true);
    if (!$workflowPayload) {
        throw new Exception('Failed to load workflow payload');
    }

    // Update payload for organization
    $workflowPayload['name'] = str_replace('organization_id_(count001)', $organization->id, $workflowPayload['name']);
    if (isset($workflowPayload['nodes'][0]['webhookId'])) {
        $workflowPayload['nodes'][0]['webhookId'] = str_replace('organization_id_(count001)', $organization->id, $workflowPayload['nodes'][0]['webhookId']);
    }

    echo "   - Payload name: " . ($workflowPayload['name'] ?? 'N/A') . "\n";
    echo "   - First node webhookId: " . ($workflowPayload['nodes'][0]['webhookId'] ?? 'N/A') . "\n";

    $result = $n8nService->createWorkflowWithDatabase(
        $workflowPayload,
        $organization->id,
        \Illuminate\Support\Facades\Auth::id(),
        'waha_' . $sessionName
    );

    echo "   - Result success: " . (isset($result['success']) && $result['success'] ? 'true' : 'false') . "\n";
    echo "   - Result data keys: " . implode(', ', array_keys($result)) . "\n";
    echo "   - Full result: " . json_encode($result, JSON_PRETTY_PRINT) . "\n";

    if (isset($result['n8n_workflow'])) {
        echo "   - N8N workflow type: " . gettype($result['n8n_workflow']) . "\n";
        if (is_object($result['n8n_workflow'])) {
            echo "   - N8N workflow ID: " . ($result['n8n_workflow']->workflow_id ?? 'N/A') . "\n";
            echo "   - N8N workflow name: " . ($result['n8n_workflow']->name ?? 'N/A') . "\n";
        } elseif (is_array($result['n8n_workflow'])) {
            echo "   - N8N workflow array keys: " . implode(', ', array_keys($result['n8n_workflow'])) . "\n";
        }
    }

    // Test extractWebhookIdFromWorkflow using reflection
    echo "\n2. Testing extractWebhookIdFromWorkflow...\n";
    $reflection = new ReflectionClass($wahaSessionService);
    $method = $reflection->getMethod('extractWebhookIdFromWorkflow');
    $method->setAccessible(true);
    $webhookId = $method->invoke($wahaSessionService, $result);
    echo "   - Extracted webhook ID: " . ($webhookId ?? 'NULL') . "\n";

    // Test full createN8nWorkflowForWaha using reflection
    echo "\n3. Testing full createN8nWorkflowForWaha...\n";
    $method = $reflection->getMethod('createN8nWorkflowForWaha');
    $method->setAccessible(true);
    $fullResult = $method->invoke($wahaSessionService, $organization->id, $sessionName);
    echo "   - Full result keys: " . implode(', ', array_keys($fullResult)) . "\n";
    echo "   - Webhook ID: " . ($fullResult['webhook_id'] ?? 'N/A') . "\n";
    echo "   - Webhook URL: " . ($fullResult['webhook_url'] ?? 'N/A') . "\n";

    if (isset($fullResult['n8n_workflow']) && $fullResult['n8n_workflow']) {
        echo "   - N8N workflow ID: " . ($fullResult['n8n_workflow']->workflow_id ?? 'N/A') . "\n";
        echo "   - N8N workflow name: " . ($fullResult['n8n_workflow']->name ?? 'N/A') . "\n";
    }

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
    exit(1);
}

echo "\n=== DEBUG COMPLETED ===\n";
