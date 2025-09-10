<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\SystemConfiguration\StoreSystemConfigurationRequest;
use App\Http\Requests\Api\V1\SystemConfiguration\UpdateSystemConfigurationRequest;
use App\Http\Resources\Api\V1\SystemConfigurationResource;
use App\Models\SystemConfiguration;
use App\Services\SystemConfigurationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Log;

class SystemConfigurationController extends Controller
{
    protected SystemConfigurationService $systemConfigurationService;

    public function __construct(SystemConfigurationService $systemConfigurationService)
    {
        $this->systemConfigurationService = $systemConfigurationService;
    }

    /**
     * Display a listing of system configurations
     */
    public function index(Request $request)
    {
        try {
            $query = SystemConfiguration::query();

            // Apply filters
            if ($request->has('category')) {
                $query->byCategory($request->category);
            }

            if ($request->has('is_public')) {
                $query->where('is_public', $request->boolean('is_public'));
            }

            if ($request->has('is_editable')) {
                $query->where('is_editable', $request->boolean('is_editable'));
            }

            if ($request->has('type')) {
                $query->where('type', $request->type);
            }

            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('key', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                });
            }

            // Apply sorting
            $sortBy = $request->get('sort_by', 'sort_order');
            $sortOrder = $request->get('sort_order', 'asc');
            $query->ordered();

            // Pagination
            $perPage = $request->get('per_page', 15);
            $configurations = $query->paginate($perPage);

            return SystemConfigurationResource::collection($configurations);
        } catch (\Exception $e) {
            Log::error('Failed to fetch system configurations', [
                'error' => $e->getMessage(),
                'filters' => $request->all(),
            ]);

            return response()->json([
                'message' => 'Failed to fetch system configurations',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Store a newly created system configuration
     */
    public function store(StoreSystemConfigurationRequest $request): JsonResponse
    {
        try {
            $configuration = SystemConfiguration::create($request->validated());

            Log::info('System configuration created', [
                'configuration_id' => $configuration->id,
                'key' => $configuration->key,
                'category' => $configuration->category,
            ]);

            return response()->json([
                'message' => 'System configuration created successfully',
                'data' => new SystemConfigurationResource($configuration),
            ], 201);
        } catch (\Exception $e) {
            Log::error('Failed to create system configuration', [
                'error' => $e->getMessage(),
                'data' => $request->validated(),
            ]);

            return response()->json([
                'message' => 'Failed to create system configuration',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Display the specified system configuration
     */
    public function show(SystemConfiguration $systemConfiguration): JsonResponse
    {
        try {
            return response()->json([
                'data' => new SystemConfigurationResource($systemConfiguration),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch system configuration', [
                'configuration_id' => $systemConfiguration->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to fetch system configuration',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Update the specified system configuration
     */
    public function update(UpdateSystemConfigurationRequest $request, SystemConfiguration $systemConfiguration): JsonResponse
    {
        try {
            $systemConfiguration->update($request->validated());
            $updatedConfiguration = $systemConfiguration->fresh();

            Log::info('System configuration updated', [
                'configuration_id' => $systemConfiguration->id,
                'key' => $systemConfiguration->key,
                'changes' => $request->validated(),
            ]);

            return response()->json([
                'message' => 'System configuration updated successfully',
                'data' => new SystemConfigurationResource($updatedConfiguration),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to update system configuration', [
                'configuration_id' => $systemConfiguration->id,
                'error' => $e->getMessage(),
                'data' => $request->validated(),
            ]);

            return response()->json([
                'message' => 'Failed to update system configuration',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Remove the specified system configuration
     */
    public function destroy(SystemConfiguration $systemConfiguration): JsonResponse
    {
        try {
            $this->systemConfigurationService->delete($systemConfiguration);

            Log::info('System configuration deleted', [
                'configuration_id' => $systemConfiguration->id,
                'key' => $systemConfiguration->key,
            ]);

            return response()->json([
                'message' => 'System configuration deleted successfully',
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to delete system configuration', [
                'configuration_id' => $systemConfiguration->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to delete system configuration',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Get configurations by category
     */
    public function getByCategory(string $category): JsonResponse
    {
        try {
            $configurations = $this->systemConfigurationService->getByCategory($category);

            return response()->json([
                'data' => $configurations,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch configurations by category', [
                'category' => $category,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to fetch configurations by category',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Get public configurations
     */
    public function getPublic(): JsonResponse
    {
        try {
            $configurations = $this->systemConfigurationService->getPublicConfigs();

            return response()->json([
                'data' => $configurations,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch public configurations', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to fetch public configurations',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Get specific configuration value
     */
    public function getValue(string $key): JsonResponse
    {
        try {
            $value = $this->systemConfigurationService->get($key);

            return response()->json([
                'data' => [
                    'key' => $key,
                    'value' => $value,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch configuration value', [
                'key' => $key,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to fetch configuration value',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Set specific configuration value
     */
    public function setValue(Request $request, string $key): JsonResponse
    {
        try {
            $request->validate([
                'value' => 'required',
                'type' => 'sometimes|string|in:string,integer,float,boolean,json,array',
            ]);

            $type = $request->get('type', 'string');
            $success = $this->systemConfigurationService->set($key, $request->value, $type);

            if ($success) {
                Log::info('Configuration value set', [
                    'key' => $key,
                    'type' => $type,
                ]);

                return response()->json([
                    'message' => 'Configuration value set successfully',
                    'data' => [
                        'key' => $key,
                        'value' => $request->value,
                        'type' => $type,
                    ],
                ]);
            } else {
                return response()->json([
                    'message' => 'Failed to set configuration value',
                ], 500);
            }
        } catch (\Exception $e) {
            Log::error('Failed to set configuration value', [
                'key' => $key,
                'error' => $e->getMessage(),
                'data' => $request->all(),
            ]);

            return response()->json([
                'message' => 'Failed to set configuration value',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Bulk update configurations
     */
    public function bulkUpdate(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'configurations' => 'required|array',
                'configurations.*.key' => 'required|string',
                'configurations.*.value' => 'required',
                'configurations.*.type' => 'sometimes|string|in:string,integer,float,boolean,json,array',
            ]);

            $results = $this->systemConfigurationService->bulkUpdate($request->configurations);

            Log::info('Bulk configuration update completed', [
                'total_requested' => count($request->configurations),
                'successful' => count(array_filter($results)),
                'failed' => count(array_filter($results, fn($result) => !$result)),
            ]);

            return response()->json([
                'message' => 'Bulk update completed',
                'data' => [
                    'total_requested' => count($request->configurations),
                    'successful' => count(array_filter($results)),
                    'failed' => count(array_filter($results, fn($result) => !$result)),
                    'results' => $results,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to bulk update configurations', [
                'error' => $e->getMessage(),
                'data' => $request->all(),
            ]);

            return response()->json([
                'message' => 'Failed to bulk update configurations',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Export configurations
     */
    public function export(Request $request): JsonResponse
    {
        try {
            $categories = $request->get('categories', []);
            $export = $this->systemConfigurationService->export($categories);

            return response()->json([
                'data' => $export,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to export configurations', [
                'error' => $e->getMessage(),
                'categories' => $request->get('categories', []),
            ]);

            return response()->json([
                'message' => 'Failed to export configurations',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Import configurations
     */
    public function import(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'configurations' => 'required|array',
            ]);

            $results = $this->systemConfigurationService->import($request->configurations);

            Log::info('Configuration import completed', [
                'total_requested' => count($request->configurations),
                'successful' => count(array_filter($results)),
                'failed' => count(array_filter($results, fn($result) => !$result)),
            ]);

            return response()->json([
                'message' => 'Configuration import completed',
                'data' => [
                    'total_requested' => count($request->configurations),
                    'successful' => count(array_filter($results)),
                    'failed' => count(array_filter($results, fn($result) => !$result)),
                    'results' => $results,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to import configurations', [
                'error' => $e->getMessage(),
                'data' => $request->all(),
            ]);

            return response()->json([
                'message' => 'Failed to import configurations',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Clear configuration cache
     */
    public function clearCache(Request $request): JsonResponse
    {
        try {
            $key = $request->get('key');
            $this->systemConfigurationService->clearCache($key);

            Log::info('Configuration cache cleared', [
                'key' => $key,
            ]);

            return response()->json([
                'message' => 'Configuration cache cleared successfully',
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to clear configuration cache', [
                'error' => $e->getMessage(),
                'key' => $request->get('key'),
            ]);

            return response()->json([
                'message' => 'Failed to clear configuration cache',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Warm up configuration cache
     */
    public function warmUpCache(): JsonResponse
    {
        try {
            $this->systemConfigurationService->warmUpCache();

            return response()->json([
                'message' => 'Configuration cache warmed up successfully',
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to warm up configuration cache', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to warm up configuration cache',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }
}
