<?php

namespace App\Http\Controllers\Api\Mobile;

use App\Http\Controllers\Controller;
use App\Http\Resources\Mobile\EducationalContentResource;
use App\Models\EducationalContent;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

/**
 * Mobile Educational Content Controller
 *
 * Provides educational content API for Juan Heart Mobile app.
 * Supports offline-first architecture with sync capabilities.
 */
class EducationalContentController extends Controller
{
    /**
     * Get all published educational content with filters
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        try {
            // Validate query parameters
            $validated = $request->validate([
                'category' => 'nullable|string|in:cvd_prevention,symptom_recognition,lifestyle_modification,medication_compliance,emergency_response,risk_factors,nutrition,exercise',
                'language' => 'nullable|string|in:en,fil',
                'search' => 'nullable|string|max:255',
                'page' => 'nullable|integer|min:1',
                'per_page' => 'nullable|integer|min:1|max:200',
            ]);

            // Build query
            $query = EducationalContent::query()->published();

            // Apply category filter
            if ($request->has('category')) {
                $query->category($validated['category']);
            }

            // Apply search filter
            if ($request->has('search')) {
                $query->search($validated['search']);
            }

            // Order by created date (newest first)
            $query->orderBy('created_at', 'desc');

            // Paginate results
            $perPage = $validated['per_page'] ?? 50;
            $contents = $query->paginate($perPage);

            // Get total views across all content
            $totalViews = EducationalContent::getTotalViews();

            return response()->json([
                'success' => true,
                'data' => EducationalContentResource::collection($contents),
                'meta' => [
                    'current_page' => $contents->currentPage(),
                    'per_page' => $contents->perPage(),
                    'total' => $contents->total(),
                    'last_page' => $contents->lastPage(),
                    'total_views' => $totalViews,
                    'filters_applied' => array_filter([
                        'category' => $request->query('category'),
                        'language' => $request->query('language'),
                        'search' => $request->query('search'),
                    ]),
                ],
            ], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid query parameters',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch educational content',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get content updated since timestamp (for incremental sync)
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function sync(Request $request): JsonResponse
    {
        try {
            // Validate timestamp parameter
            $validated = $request->validate([
                'since' => 'required|date',
            ]);

            $since = Carbon::parse($validated['since']);

            // Get content updated after the given timestamp
            $contents = EducationalContent::getUpdatedSince($since);

            // Get latest update timestamp
            $latestUpdate = EducationalContent::published()
                ->max('updated_at');

            return response()->json([
                'success' => true,
                'data' => EducationalContentResource::collection($contents),
                'meta' => [
                    'total' => $contents->count(),
                    'since' => $since->toIso8601String(),
                    'last_updated' => $latestUpdate ? Carbon::parse($latestUpdate)->toIso8601String() : null,
                    'has_more' => false,
                ],
            ], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid timestamp parameter',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to sync educational content',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get single content by ID and increment view count
     *
     * @param string $id
     * @return JsonResponse
     */
    public function show(string $id): JsonResponse
    {
        try {
            $content = EducationalContent::published()->findOrFail($id);

            // Increment view count
            $content->incrementViews();

            return response()->json([
                'success' => true,
                'data' => new EducationalContentResource($content),
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Educational content not found',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch educational content',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get available categories
     *
     * @return JsonResponse
     */
    public function categories(): JsonResponse
    {
        try {
            $categories = EducationalContent::getAvailableCategories();

            // Get content count per category
            $categoryCounts = EducationalContent::published()
                ->selectRaw('category, COUNT(*) as count')
                ->groupBy('category')
                ->pluck('count', 'category');

            // Format response with counts
            $categoriesWithCounts = array_map(function ($category) use ($categoryCounts) {
                return [
                    'value' => $category,
                    'count' => $categoryCounts[$category] ?? 0,
                ];
            }, $categories);

            return response()->json([
                'success' => true,
                'data' => $categoriesWithCounts,
                'meta' => [
                    'total_categories' => count($categories),
                ],
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch categories',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get content statistics
     *
     * @return JsonResponse
     */
    public function stats(): JsonResponse
    {
        try {
            // Get total content count
            $totalContent = EducationalContent::published()->count();

            // Get total views
            $totalViews = EducationalContent::getTotalViews();

            // Get content count by category
            $byCategory = EducationalContent::published()
                ->selectRaw('category, COUNT(*) as count')
                ->groupBy('category')
                ->pluck('count', 'category');

            // Get most viewed content
            $mostViewed = EducationalContent::published()
                ->orderBy('views', 'desc')
                ->take(5)
                ->get()
                ->map(function ($content) {
                    return [
                        'id' => $content->id,
                        'title_en' => $content->title_en,
                        'title_fil' => $content->title_fil,
                        'category' => $content->category,
                        'views' => $content->views,
                    ];
                });

            // Get recently published content (last 30 days)
            $recentCount = EducationalContent::published()
                ->recent(30)
                ->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'total_content' => $totalContent,
                    'total_views' => $totalViews,
                    'by_category' => $byCategory,
                    'most_viewed' => $mostViewed,
                    'recent_count' => $recentCount,
                ],
                'meta' => [
                    'generated_at' => Carbon::now()->toIso8601String(),
                ],
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch statistics',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
