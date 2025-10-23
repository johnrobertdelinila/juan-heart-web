<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\FacilityAnalyticsService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class FacilityAnalyticsController extends Controller
{
    protected FacilityAnalyticsService $analyticsService;

    public function __construct(FacilityAnalyticsService $analyticsService)
    {
        $this->analyticsService = $analyticsService;
    }

    /**
     * Get facility dashboard metrics
     * GET /api/v1/facilities/{id}/dashboard
     */
    public function dashboard(Request $request, int $facilityId): JsonResponse
    {
        $validated = $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        $filters = [
            'start_date' => isset($validated['start_date']) ? Carbon::parse($validated['start_date']) : null,
            'end_date' => isset($validated['end_date']) ? Carbon::parse($validated['end_date']) : null,
        ];

        $data = $this->analyticsService->getFacilityDashboard($facilityId, $filters);

        return response()->json([
            'success' => true,
            'data' => $data,
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Get facility summary metrics
     * GET /api/v1/facilities/{id}/summary
     */
    public function summary(Request $request, int $facilityId): JsonResponse
    {
        $validated = $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        $startDate = isset($validated['start_date']) ? Carbon::parse($validated['start_date']) : Carbon::now()->subMonths(3);
        $endDate = isset($validated['end_date']) ? Carbon::parse($validated['end_date']) : Carbon::now();

        $data = $this->analyticsService->getFacilitySummary($facilityId, $startDate, $endDate);

        return response()->json([
            'success' => true,
            'data' => $data,
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Get patient flow metrics
     * GET /api/v1/facilities/{id}/patient-flow
     */
    public function patientFlow(Request $request, int $facilityId): JsonResponse
    {
        $validated = $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        $startDate = isset($validated['start_date']) ? Carbon::parse($validated['start_date']) : Carbon::now()->subMonths(3);
        $endDate = isset($validated['end_date']) ? Carbon::parse($validated['end_date']) : Carbon::now();

        $data = $this->analyticsService->getPatientFlowMetrics($facilityId, $startDate, $endDate);

        return response()->json([
            'success' => true,
            'data' => $data,
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Get referral metrics
     * GET /api/v1/facilities/{id}/referral-metrics
     */
    public function referralMetrics(Request $request, int $facilityId): JsonResponse
    {
        $validated = $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        $startDate = isset($validated['start_date']) ? Carbon::parse($validated['start_date']) : Carbon::now()->subMonths(3);
        $endDate = isset($validated['end_date']) ? Carbon::parse($validated['end_date']) : Carbon::now();

        $data = $this->analyticsService->getReferralMetrics($facilityId, $startDate, $endDate);

        return response()->json([
            'success' => true,
            'data' => $data,
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Get capacity utilization metrics
     * GET /api/v1/facilities/{id}/capacity
     */
    public function capacity(Request $request, int $facilityId): JsonResponse
    {
        $validated = $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        $startDate = isset($validated['start_date']) ? Carbon::parse($validated['start_date']) : Carbon::now()->subMonths(3);
        $endDate = isset($validated['end_date']) ? Carbon::parse($validated['end_date']) : Carbon::now();

        $data = $this->analyticsService->getCapacityUtilization($facilityId, $startDate, $endDate);

        return response()->json([
            'success' => true,
            'data' => $data,
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Get staff productivity metrics
     * GET /api/v1/facilities/{id}/staff-productivity
     */
    public function staffProductivity(Request $request, int $facilityId): JsonResponse
    {
        $validated = $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        $startDate = isset($validated['start_date']) ? Carbon::parse($validated['start_date']) : Carbon::now()->subMonths(3);
        $endDate = isset($validated['end_date']) ? Carbon::parse($validated['end_date']) : Carbon::now();

        $data = $this->analyticsService->getStaffProductivity($facilityId, $startDate, $endDate);

        return response()->json([
            'success' => true,
            'data' => $data,
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Get performance comparison with other facilities
     * GET /api/v1/facilities/{id}/performance-comparison
     */
    public function performanceComparison(Request $request, int $facilityId): JsonResponse
    {
        $validated = $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        $startDate = isset($validated['start_date']) ? Carbon::parse($validated['start_date']) : Carbon::now()->subMonths(3);
        $endDate = isset($validated['end_date']) ? Carbon::parse($validated['end_date']) : Carbon::now();

        $data = $this->analyticsService->getPerformanceComparison($facilityId, $startDate, $endDate);

        return response()->json([
            'success' => true,
            'data' => $data,
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Get revenue analytics
     * GET /api/v1/facilities/{id}/revenue
     */
    public function revenue(Request $request, int $facilityId): JsonResponse
    {
        $validated = $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        $startDate = isset($validated['start_date']) ? Carbon::parse($validated['start_date']) : Carbon::now()->subMonths(3);
        $endDate = isset($validated['end_date']) ? Carbon::parse($validated['end_date']) : Carbon::now();

        $data = $this->analyticsService->getRevenueAnalytics($facilityId, $startDate, $endDate);

        return response()->json([
            'success' => true,
            'data' => $data,
            'timestamp' => now()->toIso8601String(),
        ]);
    }
}
