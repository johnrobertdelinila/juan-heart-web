<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AnalyticsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Carbon\Carbon;

class AnalyticsController extends Controller
{
    protected AnalyticsService $analyticsService;

    public function __construct(AnalyticsService $analyticsService)
    {
        $this->analyticsService = $analyticsService;
    }

    /**
     * Get national overview dashboard data
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getNationalOverview(Request $request): JsonResponse
    {
        $filters = [
            'start_date' => $request->input('start_date', Carbon::now()->subMonths(3)),
            'end_date' => $request->input('end_date', Carbon::now()),
        ];

        $data = $this->analyticsService->getNationalOverview($filters);

        return response()->json([
            'success' => true,
            'data' => $data,
            'filters' => $filters,
        ]);
    }

    /**
     * Get real-time metrics
     *
     * @return JsonResponse
     */
    public function getRealTimeMetrics(): JsonResponse
    {
        $metrics = $this->analyticsService->getRealTimeAssessmentCount();

        return response()->json([
            'success' => true,
            'data' => $metrics,
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Get geographic distribution
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getGeographicDistribution(Request $request): JsonResponse
    {
        $startDate = $request->input('start_date', Carbon::now()->subMonths(3));
        $endDate = $request->input('end_date', Carbon::now());

        $data = $this->analyticsService->getGeographicDistribution($startDate, $endDate);

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * Get trend analysis
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getTrendAnalysis(Request $request): JsonResponse
    {
        $startDate = $request->input('start_date', Carbon::now()->subMonths(3));
        $endDate = $request->input('end_date', Carbon::now());

        $data = $this->analyticsService->getTrendAnalysis($startDate, $endDate);

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * Get demographics analysis
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getDemographicsAnalysis(Request $request): JsonResponse
    {
        $startDate = $request->input('start_date', Carbon::now()->subMonths(3));
        $endDate = $request->input('end_date', Carbon::now());

        $data = $this->analyticsService->getDemographicsAnalysis($startDate, $endDate);

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * Export dashboard data to Excel/CSV
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function exportData(Request $request): JsonResponse
    {
        // TODO: Implement export functionality with Laravel Excel
        return response()->json([
            'success' => true,
            'message' => 'Export functionality will be implemented in next phase',
        ]);
    }
}
