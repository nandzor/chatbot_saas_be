<?php

require_once __DIR__ . '/vendor/autoload.php';

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;
use App\Services\BotPersonalityService;
use App\Services\N8n\N8nService;
use App\Models\BotPersonality;
use App\Models\OAuthCredential;

// Test script untuk RAG Google Drive integration
class RagGoogleDriveTest
{
    private $botPersonalityService;
    private $n8nService;

    public function __construct()
    {
        $this->botPersonalityService = app(BotPersonalityService::class);
        $this->n8nService = app(N8nService::class);
    }

    public function testEnsureGoogleDriveCredentials()
    {
        echo "=== Testing Ensure Google Drive Credentials ===\n";

        try {
            // Test dengan organization ID yang ada
            $organizationId = '6a9f9f22-ef84-4375-a793-dd1af45ccdc0'; // Admin organization

            $credentials = $this->botPersonalityService->ensureGoogleDriveCredentialsForRag($organizationId);

            if ($credentials) {
                echo "✅ Credentials found/created successfully\n";
                echo "   - Credential ID: " . $credentials['credential_id'] . "\n";
                echo "   - N8N Credential ID: " . ($credentials['n8n_credential_id'] ?? 'Not set') . "\n";
                echo "   - Has Access Token: " . (!empty($credentials['access_token']) ? 'Yes' : 'No') . "\n";
                echo "   - Has Refresh Token: " . (!empty($credentials['refresh_token']) ? 'Yes' : 'No') . "\n";
                echo "   - Scope: " . ($credentials['scope'] ?? 'Not set') . "\n";
            } else {
                echo "❌ No credentials found\n";
            }

        } catch (Exception $e) {
            echo "❌ Error: " . $e->getMessage() . "\n";
            echo "   Trace: " . $e->getTraceAsString() . "\n";
        }
    }

    public function testRagEnhancement()
    {
        echo "\n=== Testing RAG Enhancement ===\n";

        try {
            // Test dengan bot personality yang ada
            $personality = BotPersonality::where('organization_id', '6a9f9f22-ef84-4375-a793-dd1af45ccdc0')->first();

            if (!$personality) {
                echo "❌ No bot personality found for testing\n";
                return;
            }

            echo "✅ Found bot personality: " . $personality->name . "\n";
            echo "   - ID: " . $personality->id . "\n";
            echo "   - N8N Workflow ID: " . ($personality->n8n_workflow_id ?? 'Not set') . "\n";

            // Test RAG enhancement dengan mock data
            $mockGoogleDriveData = [
                'files' => [
                    [
                        'file_id' => 'test-file-1',
                        'file_name' => 'Test Sheet.xlsx',
                        'mime_type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                        'web_view_link' => 'https://docs.google.com/spreadsheets/d/test-file-1/edit',
                        'size' => 1024
                    ],
                    [
                        'file_id' => 'test-file-2',
                        'file_name' => 'Test Document.docx',
                        'mime_type' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                        'web_view_link' => 'https://docs.google.com/document/d/test-file-2/edit',
                        'size' => 2048
                    ]
                ],
                'organization_id' => $personality->organization_id,
                'personality_id' => $personality->id,
                'credentials' => [
                    'access_token' => 'test-access-token',
                    'refresh_token' => 'test-refresh-token',
                    'scope' => 'https://www.googleapis.com/auth/drive',
                    'n8n_credential_id' => 'test-n8n-credential-id'
                ]
            ];

            if ($personality->n8n_workflow_id) {
                echo "   - Testing RAG enhancement...\n";

                $result = $this->n8nService->enhanceWorkflowWithRag($personality->n8n_workflow_id, $mockGoogleDriveData);

                if ($result['success']) {
                    echo "✅ RAG enhancement successful\n";
                    echo "   - RAG nodes added: " . count($result['rag_nodes'] ?? []) . "\n";
                } else {
                    echo "❌ RAG enhancement failed: " . ($result['error'] ?? 'Unknown error') . "\n";
                }
            } else {
                echo "⚠️  No N8N workflow ID set, skipping RAG enhancement test\n";
            }

        } catch (Exception $e) {
            echo "❌ Error: " . $e->getMessage() . "\n";
            echo "   Trace: " . $e->getTraceAsString() . "\n";
        }
    }

    public function testOAuthCredentials()
    {
        echo "\n=== Testing OAuth Credentials ===\n";

        try {
            $oauthCredentials = OAuthCredential::where('organization_id', '6a9f9f22-ef84-4375-a793-dd1af45ccdc0')
                ->where('service', 'google-drive')
                ->where('status', 'active')
                ->get();

            echo "✅ Found " . $oauthCredentials->count() . " OAuth credentials\n";

            foreach ($oauthCredentials as $credential) {
                echo "   - ID: " . $credential->id . "\n";
                echo "   - Service: " . $credential->service . "\n";
                echo "   - Status: " . $credential->status . "\n";
                echo "   - N8N Credential ID: " . ($credential->n8n_credential_id ?? 'Not set') . "\n";
                echo "   - Has Access Token: " . (!empty($credential->access_token) ? 'Yes' : 'No') . "\n";
                echo "   - Has Refresh Token: " . (!empty($credential->refresh_token) ? 'Yes' : 'No') . "\n";
                echo "   - Scope: " . ($credential->scope ?? 'Not set') . "\n";
                echo "   - Expires At: " . ($credential->expires_at ?? 'Not set') . "\n";
                echo "   ---\n";
            }

        } catch (Exception $e) {
            echo "❌ Error: " . $e->getMessage() . "\n";
        }
    }

    public function runAllTests()
    {
        echo "Starting RAG Google Drive Integration Tests...\n";
        echo "==============================================\n";

        $this->testOAuthCredentials();
        $this->testEnsureGoogleDriveCredentials();
        $this->testRagEnhancement();

        echo "\n==============================================\n";
        echo "Tests completed!\n";
    }
}

// Run tests
$test = new RagGoogleDriveTest();
$test->runAllTests();
