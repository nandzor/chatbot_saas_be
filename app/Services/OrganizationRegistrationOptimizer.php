<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use App\Models\Organization;
use App\Models\User;
use App\Models\EmailVerificationToken;
use Carbon\Carbon;

class OrganizationRegistrationOptimizer
{
    /**
     * Optimize database queries for organization registration.
     */
    public function optimizeDatabaseQueries(): array
    {
        $results = [];

        // Add database indexes
        $results['indexes'] = $this->addDatabaseIndexes();

        // Optimize existing queries
        $results['query_optimizations'] = $this->optimizeQueries();

        // Clean up old data
        $results['cleanup'] = $this->cleanupOldData();

        // Cache optimization
        $results['cache_optimization'] = $this->optimizeCache();

        return $results;
    }

    /**
     * Add database indexes for better performance.
     */
    private function addDatabaseIndexes(): array
    {
        $indexes = [];

        try {
            // Index for organizations table
            $indexes['organizations'] = $this->addOrganizationIndexes();

            // Index for users table
            $indexes['users'] = $this->addUserIndexes();

            // Index for email_verification_tokens table
            $indexes['email_verification_tokens'] = $this->addEmailVerificationTokenIndexes();

            Log::info('Database indexes added successfully', $indexes);

        } catch (\Exception $e) {
            Log::error('Failed to add database indexes', [
                'error' => $e->getMessage(),
            ]);
            $indexes['error'] = $e->getMessage();
        }

        return $indexes;
    }

    /**
     * Add indexes for organizations table.
     */
    private function addOrganizationIndexes(): array
    {
        $indexes = [];

        try {
            // Index for status queries
            if (!$this->indexExists('organizations', 'organizations_status_index')) {
                DB::statement('CREATE INDEX organizations_status_index ON organizations(status)');
                $indexes[] = 'organizations_status_index';
            }

            // Index for email queries
            if (!$this->indexExists('organizations', 'organizations_email_index')) {
                DB::statement('CREATE INDEX organizations_email_index ON organizations(email)');
                $indexes[] = 'organizations_email_index';
            }

            // Index for org_code queries
            if (!$this->indexExists('organizations', 'organizations_org_code_index')) {
                DB::statement('CREATE INDEX organizations_org_code_index ON organizations(org_code)');
                $indexes[] = 'organizations_org_code_index';
            }

            // Index for created_at queries (for reporting)
            if (!$this->indexExists('organizations', 'organizations_created_at_index')) {
                DB::statement('CREATE INDEX organizations_created_at_index ON organizations(created_at)');
                $indexes[] = 'organizations_created_at_index';
            }

            // Composite index for status and created_at
            if (!$this->indexExists('organizations', 'organizations_status_created_at_index')) {
                DB::statement('CREATE INDEX organizations_status_created_at_index ON organizations(status, created_at)');
                $indexes[] = 'organizations_status_created_at_index';
            }

        } catch (\Exception $e) {
            Log::error('Failed to add organization indexes', [
                'error' => $e->getMessage(),
            ]);
        }

        return $indexes;
    }

    /**
     * Add indexes for users table.
     */
    private function addUserIndexes(): array
    {
        $indexes = [];

        try {
            // Index for email queries
            if (!$this->indexExists('users', 'users_email_index')) {
                DB::statement('CREATE INDEX users_email_index ON users(email)');
                $indexes[] = 'users_email_index';
            }

            // Index for organization_id queries
            if (!$this->indexExists('users', 'users_organization_id_index')) {
                DB::statement('CREATE INDEX users_organization_id_index ON users(organization_id)');
                $indexes[] = 'users_organization_id_index';
            }

            // Index for status queries
            if (!$this->indexExists('users', 'users_status_index')) {
                DB::statement('CREATE INDEX users_status_index ON users(status)');
                $indexes[] = 'users_status_index';
            }

            // Index for username queries
            if (!$this->indexExists('users', 'users_username_index')) {
                DB::statement('CREATE INDEX users_username_index ON users(username)');
                $indexes[] = 'users_username_index';
            }

            // Composite index for organization_id and status
            if (!$this->indexExists('users', 'users_organization_id_status_index')) {
                DB::statement('CREATE INDEX users_organization_id_status_index ON users(organization_id, status)');
                $indexes[] = 'users_organization_id_status_index';
            }

        } catch (\Exception $e) {
            Log::error('Failed to add user indexes', [
                'error' => $e->getMessage(),
            ]);
        }

        return $indexes;
    }

    /**
     * Add indexes for email_verification_tokens table.
     */
    private function addEmailVerificationTokenIndexes(): array
    {
        $indexes = [];

        try {
            // Index for token queries
            if (!$this->indexExists('email_verification_tokens', 'email_verification_tokens_token_index')) {
                DB::statement('CREATE INDEX email_verification_tokens_token_index ON email_verification_tokens(token)');
                $indexes[] = 'email_verification_tokens_token_index';
            }

            // Index for email queries
            if (!$this->indexExists('email_verification_tokens', 'email_verification_tokens_email_index')) {
                DB::statement('CREATE INDEX email_verification_tokens_email_index ON email_verification_tokens(email)');
                $indexes[] = 'email_verification_tokens_email_index';
            }

            // Index for expires_at queries
            if (!$this->indexExists('email_verification_tokens', 'email_verification_tokens_expires_at_index')) {
                DB::statement('CREATE INDEX email_verification_tokens_expires_at_index ON email_verification_tokens(expires_at)');
                $indexes[] = 'email_verification_tokens_expires_at_index';
            }

            // Index for is_used queries
            if (!$this->indexExists('email_verification_tokens', 'email_verification_tokens_is_used_index')) {
                DB::statement('CREATE INDEX email_verification_tokens_is_used_index ON email_verification_tokens(is_used)');
                $indexes[] = 'email_verification_tokens_is_used_index';
            }

            // Composite index for email and type
            if (!$this->indexExists('email_verification_tokens', 'email_verification_tokens_email_type_index')) {
                DB::statement('CREATE INDEX email_verification_tokens_email_type_index ON email_verification_tokens(email, type)');
                $indexes[] = 'email_verification_tokens_email_type_index';
            }

            // Composite index for is_used and expires_at
            if (!$this->indexExists('email_verification_tokens', 'email_verification_tokens_is_used_expires_at_index')) {
                DB::statement('CREATE INDEX email_verification_tokens_is_used_expires_at_index ON email_verification_tokens(is_used, expires_at)');
                $indexes[] = 'email_verification_tokens_is_used_expires_at_index';
            }

        } catch (\Exception $e) {
            Log::error('Failed to add email verification token indexes', [
                'error' => $e->getMessage(),
            ]);
        }

        return $indexes;
    }

    /**
     * Check if index exists.
     */
    private function indexExists(string $table, string $indexName): bool
    {
        try {
            $result = DB::select("
                SELECT COUNT(*) as count 
                FROM pg_indexes 
                WHERE tablename = ? AND indexname = ?
            ", [$table, $indexName]);

            return $result[0]->count > 0;
        } catch (\Exception $e) {
            Log::error('Failed to check index existence', [
                'table' => $table,
                'index' => $indexName,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Optimize existing queries.
     */
    private function optimizeQueries(): array
    {
        $optimizations = [];

        try {
            // Analyze tables for better query planning
            $tables = ['organizations', 'users', 'email_verification_tokens'];
            
            foreach ($tables as $table) {
                DB::statement("ANALYZE {$table}");
                $optimizations[] = "Analyzed table: {$table}";
            }

            // Update table statistics
            DB::statement('UPDATE pg_stat_user_tables SET n_tup_ins = 0, n_tup_upd = 0, n_tup_del = 0');
            $optimizations[] = 'Updated table statistics';

            Log::info('Query optimizations completed', $optimizations);

        } catch (\Exception $e) {
            Log::error('Failed to optimize queries', [
                'error' => $e->getMessage(),
            ]);
            $optimizations['error'] = $e->getMessage();
        }

        return $optimizations;
    }

    /**
     * Clean up old data.
     */
    private function cleanupOldData(): array
    {
        $cleanup = [];

        try {
            // Clean up expired verification tokens older than 30 days
            $expiredTokens = EmailVerificationToken::where('expires_at', '<', now()->subDays(30))->delete();
            $cleanup['expired_verification_tokens'] = $expiredTokens;

            // Clean up used verification tokens older than 7 days
            $usedTokens = EmailVerificationToken::where('is_used', true)
                ->where('used_at', '<', now()->subDays(7))
                ->delete();
            $cleanup['used_verification_tokens'] = $usedTokens;

            // Clean up old audit logs (if using database logging)
            // This would typically clean up old log entries
            $cleanup['old_audit_logs'] = 0;

            Log::info('Data cleanup completed', $cleanup);

        } catch (\Exception $e) {
            Log::error('Failed to cleanup old data', [
                'error' => $e->getMessage(),
            ]);
            $cleanup['error'] = $e->getMessage();
        }

        return $cleanup;
    }

    /**
     * Optimize cache configuration.
     */
    private function optimizeCache(): array
    {
        $optimizations = [];

        try {
            // Clear all caches
            Cache::flush();
            $optimizations[] = 'Cleared all caches';

            // Pre-warm frequently accessed data
            $this->preWarmCache();
            $optimizations[] = 'Pre-warmed frequently accessed data';

            Log::info('Cache optimization completed', $optimizations);

        } catch (\Exception $e) {
            Log::error('Failed to optimize cache', [
                'error' => $e->getMessage(),
            ]);
            $optimizations['error'] = $e->getMessage();
        }

        return $optimizations;
    }

    /**
     * Pre-warm cache with frequently accessed data.
     */
    private function preWarmCache(): void
    {
        try {
            // Cache organization statistics
            $orgStats = [
                'total_organizations' => Organization::count(),
                'pending_approvals' => Organization::where('status', 'pending_approval')->count(),
                'active_organizations' => Organization::where('status', 'active')->count(),
            ];
            Cache::put('organization_stats', $orgStats, 3600); // 1 hour

            // Cache user statistics
            $userStats = [
                'total_users' => User::count(),
                'pending_verifications' => User::where('status', 'pending_verification')->count(),
                'active_users' => User::where('status', 'active')->count(),
            ];
            Cache::put('user_stats', $userStats, 3600); // 1 hour

            // Cache verification token statistics
            $tokenStats = [
                'pending_tokens' => EmailVerificationToken::where('is_used', false)
                    ->where('expires_at', '>', now())->count(),
                'expired_tokens' => EmailVerificationToken::where('expires_at', '<', now())->count(),
            ];
            Cache::put('verification_token_stats', $tokenStats, 1800); // 30 minutes

        } catch (\Exception $e) {
            Log::error('Failed to pre-warm cache', [
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Get database performance metrics.
     */
    public function getDatabasePerformanceMetrics(): array
    {
        $metrics = [];

        try {
            // Get table sizes
            $metrics['table_sizes'] = $this->getTableSizes();

            // Get index usage statistics
            $metrics['index_usage'] = $this->getIndexUsageStats();

            // Get query performance statistics
            $metrics['query_performance'] = $this->getQueryPerformanceStats();

            // Get connection statistics
            $metrics['connection_stats'] = $this->getConnectionStats();

        } catch (\Exception $e) {
            Log::error('Failed to get database performance metrics', [
                'error' => $e->getMessage(),
            ]);
            $metrics['error'] = $e->getMessage();
        }

        return $metrics;
    }

    /**
     * Get table sizes.
     */
    private function getTableSizes(): array
    {
        try {
            $tables = ['organizations', 'users', 'email_verification_tokens'];
            $sizes = [];

            foreach ($tables as $table) {
                $result = DB::select("
                    SELECT 
                        pg_size_pretty(pg_total_relation_size(?)) as size,
                        pg_total_relation_size(?) as size_bytes
                ", [$table, $table]);

                $sizes[$table] = [
                    'size' => $result[0]->size,
                    'size_bytes' => $result[0]->size_bytes,
                ];
            }

            return $sizes;
        } catch (\Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }

    /**
     * Get index usage statistics.
     */
    private function getIndexUsageStats(): array
    {
        try {
            $result = DB::select("
                SELECT 
                    schemaname,
                    tablename,
                    indexname,
                    idx_scan,
                    idx_tup_read,
                    idx_tup_fetch
                FROM pg_stat_user_indexes 
                WHERE tablename IN ('organizations', 'users', 'email_verification_tokens')
                ORDER BY idx_scan DESC
            ");

            return array_map(function ($row) {
                return [
                    'table' => $row->tablename,
                    'index' => $row->indexname,
                    'scans' => $row->idx_scan,
                    'tuples_read' => $row->idx_tup_read,
                    'tuples_fetched' => $row->idx_tup_fetch,
                ];
            }, $result);
        } catch (\Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }

    /**
     * Get query performance statistics.
     */
    private function getQueryPerformanceStats(): array
    {
        try {
            $result = DB::select("
                SELECT 
                    query,
                    calls,
                    total_time,
                    mean_time,
                    rows
                FROM pg_stat_statements 
                WHERE query LIKE '%organizations%' 
                   OR query LIKE '%users%' 
                   OR query LIKE '%email_verification_tokens%'
                ORDER BY total_time DESC
                LIMIT 10
            ");

            return array_map(function ($row) {
                return [
                    'query' => substr($row->query, 0, 100) . '...',
                    'calls' => $row->calls,
                    'total_time' => round($row->total_time, 2),
                    'mean_time' => round($row->mean_time, 2),
                    'rows' => $row->rows,
                ];
            }, $result);
        } catch (\Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }

    /**
     * Get connection statistics.
     */
    private function getConnectionStats(): array
    {
        try {
            $result = DB::select("
                SELECT 
                    count(*) as total_connections,
                    count(*) FILTER (WHERE state = 'active') as active_connections,
                    count(*) FILTER (WHERE state = 'idle') as idle_connections
                FROM pg_stat_activity 
                WHERE datname = current_database()
            ");

            return [
                'total_connections' => $result[0]->total_connections,
                'active_connections' => $result[0]->active_connections,
                'idle_connections' => $result[0]->idle_connections,
            ];
        } catch (\Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }

    /**
     * Run database maintenance.
     */
    public function runDatabaseMaintenance(): array
    {
        $results = [];

        try {
            // Vacuum analyze tables
            $tables = ['organizations', 'users', 'email_verification_tokens'];
            
            foreach ($tables as $table) {
                DB::statement("VACUUM ANALYZE {$table}");
                $results[] = "Vacuumed and analyzed table: {$table}";
            }

            // Reindex tables
            foreach ($tables as $table) {
                DB::statement("REINDEX TABLE {$table}");
                $results[] = "Reindexed table: {$table}";
            }

            Log::info('Database maintenance completed', $results);

        } catch (\Exception $e) {
            Log::error('Failed to run database maintenance', [
                'error' => $e->getMessage(),
            ]);
            $results['error'] = $e->getMessage();
        }

        return $results;
    }
}
