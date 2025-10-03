<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\WahaSession;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SyncWahaSessionStatus extends Command
{
    protected $signature = 'waha:sync-status {--session= : Specific session name to sync}';
    protected $description = 'Sync WAHA session status from server to local database';

    public function handle()
    {
        $this->info('🔄 Starting WAHA session status sync...');

        $apiKey = env('WAHA_API_KEY');
        $baseUrl = env('WAHA_BASE_URL');

        if (!$apiKey || !$baseUrl) {
            $this->error('❌ WAHA_API_KEY or WAHA_BASE_URL not configured');
            return 1;
        }

        $sessions = $this->getSessionsToSync();

        foreach ($sessions as $session) {
            $this->syncSessionStatus($session, $apiKey, $baseUrl);
        }

        $this->info('✅ WAHA session status sync completed!');
        return 0;
    }

    private function getSessionsToSync()
    {
        $sessionName = $this->option('session');

        if ($sessionName) {
            $sessions = WahaSession::where('session_name', $sessionName)->get();
        } else {
            $sessions = WahaSession::whereIn('status', ['connecting', 'scanQR', 'working'])->get();
        }

        return $sessions;
    }

    private function syncSessionStatus($session, $apiKey, $baseUrl)
    {
        try {
            $this->info("📡 Syncing session: {$session->session_name}");

            $response = Http::withHeaders([
                'X-Api-Key' => $apiKey
            ])->timeout(10)->get("{$baseUrl}/api/sessions/{$session->session_name}");

            if ($response->successful()) {
                $data = $response->json();
                $serverStatus = strtolower($data['status'] ?? 'unknown');

                // Determine connection status based on server status
                $isConnected = in_array($serverStatus, ['working', 'connected']);
                $isAuthenticated = in_array($serverStatus, ['working', 'connected']);
                $isReady = $serverStatus === 'working';

                $updateData = [
                    'status' => $serverStatus,
                    'is_connected' => $isConnected,
                    'is_authenticated' => $isAuthenticated,
                    'is_ready' => $isReady,
                    'last_health_check' => now()
                ];

                $session->update($updateData);
                $this->info("  ✅ Updated status: {$serverStatus} | Connected: " . ($isConnected ? 'Yes' : 'No'));

                Log::info('WAHA session status synced', [
                    'session_name' => $session->session_name,
                    'status' => $serverStatus,
                    'is_connected' => $isConnected,
                    'is_authenticated' => $isAuthenticated,
                    'is_ready' => $isReady
                ]);
            } else {
                $this->warn("  ⚠️  Failed to fetch session status: {$response->status()}");
            }

        } catch (\Exception $e) {
            $this->error("  ❌ Error syncing session {$session->session_name}: {$e->getMessage()}");
            Log::error('WAHA session sync failed', [
                'session_name' => $session->session_name,
                'error' => $e->getMessage()
            ]);
        }
    }
}
