<?php

require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== UPDATING N8N WORKFLOW ID FOR EXISTING SESSIONS ===\n\n";

try {
    // Get first organization
    $organization = \App\Models\Organization::first();
    if (!$organization) {
        echo "❌ No organizations found\n";
        exit(1);
    }

    echo "✅ Organization found: " . $organization->name . "\n";

    // Find sessions without n8n_workflow_id
    $sessions = \App\Models\WahaSession::where('organization_id', $organization->id)
        ->whereNull('n8n_workflow_id')
        ->get();

    echo "📝 Found " . $sessions->count() . " sessions without n8n_workflow_id\n\n";

    foreach ($sessions as $session) {
        echo "Processing session: " . $session->session_name . "\n";

        // Try to find matching N8N workflow by name pattern
        $workflowName = $organization->id . '_waha' . str_replace('-', '', $session->session_name);
        $n8nWorkflow = \App\Models\N8nWorkflow::where('organization_id', $organization->id)
            ->where('name', 'like', '%' . $session->session_name . '%')
            ->first();

        if ($n8nWorkflow) {
            echo "  ✅ Found matching N8N workflow: " . $n8nWorkflow->name . "\n";
            echo "  📝 Updating session with workflow ID: " . $n8nWorkflow->id . "\n";

            $session->update(['n8n_workflow_id' => $n8nWorkflow->id]);
            echo "  ✅ Session updated successfully\n";
        } else {
            echo "  ❌ No matching N8N workflow found\n";

            // Create a new N8N workflow for this session
            echo "  📝 Creating new N8N workflow...\n";

            $wahaSessionService = app(\App\Services\Waha\WahaSessionService::class);
            $reflection = new ReflectionClass($wahaSessionService);
            $method = $reflection->getMethod('createN8nWorkflowForWaha');
            $method->setAccessible(true);

            try {
                $result = $method->invoke($wahaSessionService, $organization->id, $session->session_name);

                if (isset($result['database_id'])) {
                    $workflowId = $result['database_id'];
                    echo "  ✅ Created N8N workflow with ID: " . $workflowId . "\n";

                    $session->update(['n8n_workflow_id' => $workflowId]);
                    echo "  ✅ Session updated with new workflow ID\n";
                } else {
                    echo "  ❌ Failed to create N8N workflow\n";
                }
            } catch (Exception $e) {
                echo "  ❌ Error creating N8N workflow: " . $e->getMessage() . "\n";
            }
        }

        echo "---\n";
    }

    // Verify all sessions now have n8n_workflow_id
    echo "\nVerifying all sessions have n8n_workflow_id...\n";
    $sessionsWithoutWorkflow = \App\Models\WahaSession::where('organization_id', $organization->id)
        ->whereNull('n8n_workflow_id')
        ->count();

    if ($sessionsWithoutWorkflow === 0) {
        echo "✅ All sessions now have n8n_workflow_id\n";
    } else {
        echo "❌ " . $sessionsWithoutWorkflow . " sessions still without n8n_workflow_id\n";
    }

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
    exit(1);
}

echo "\n=== UPDATE COMPLETED ===\n";
