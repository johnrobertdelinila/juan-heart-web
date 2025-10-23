<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ClinicalDashboardService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class ClinicalDashboardController extends Controller
{
    protected ClinicalDashboardService $clinicalService;

    public function __construct(ClinicalDashboardService $clinicalService)
    {
        $this->clinicalService = $clinicalService;
    }

    /**
     * Get clinical dashboard data
     * GET /api/v1/clinical/dashboard
     */
    public function dashboard(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|integer|exists:users,id',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        $userId = $validated['user_id'];
        $filters = [
            'start_date' => isset($validated['start_date']) ? Carbon::parse($validated['start_date']) : null,
            'end_date' => isset($validated['end_date']) ? Carbon::parse($validated['end_date']) : null,
        ];

        $data = $this->clinicalService->getClinicalDashboard($userId, $filters);

        return response()->json([
            'success' => true,
            'data' => $data,
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Get assessment queue
     * GET /api/v1/clinical/assessment-queue
     */
    public function assessmentQueue(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|integer|exists:users,id',
            'priority' => 'nullable|string|in:Urgent,High,Normal,Low',
            'risk_level' => 'nullable|string|in:High,Moderate,Low',
            'status' => 'nullable|string|in:pending,validated,completed',
        ]);

        $userId = $validated['user_id'];
        $filters = [
            'priority' => $validated['priority'] ?? null,
            'risk_level' => $validated['risk_level'] ?? null,
            'status' => $validated['status'] ?? 'pending',
        ];

        $data = $this->clinicalService->getAssessmentQueue($userId, $filters);

        return response()->json([
            'success' => true,
            'data' => $data,
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Get patient risk stratification
     * GET /api/v1/clinical/risk-stratification
     */
    public function riskStratification(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|integer|exists:users,id',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        $userId = $validated['user_id'];
        $startDate = isset($validated['start_date']) ? Carbon::parse($validated['start_date']) : Carbon::now()->subMonths(1);
        $endDate = isset($validated['end_date']) ? Carbon::parse($validated['end_date']) : Carbon::now();

        $data = $this->clinicalService->getPatientRiskStratification($userId, $startDate, $endDate);

        return response()->json([
            'success' => true,
            'data' => $data,
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Get clinical alerts
     * GET /api/v1/clinical/alerts
     */
    public function alerts(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|integer|exists:users,id',
        ]);

        $userId = $validated['user_id'];
        $data = $this->clinicalService->getClinicalAlerts($userId);

        return response()->json([
            'success' => true,
            'data' => $data,
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Get workload metrics
     * GET /api/v1/clinical/workload
     */
    public function workload(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|integer|exists:users,id',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        $userId = $validated['user_id'];
        $startDate = isset($validated['start_date']) ? Carbon::parse($validated['start_date']) : Carbon::now()->subMonths(1);
        $endDate = isset($validated['end_date']) ? Carbon::parse($validated['end_date']) : Carbon::now();

        $data = $this->clinicalService->getWorkloadMetrics($userId, $startDate, $endDate);

        return response()->json([
            'success' => true,
            'data' => $data,
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Get validation metrics
     * GET /api/v1/clinical/validation-metrics
     */
    public function validationMetrics(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|integer|exists:users,id',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        $userId = $validated['user_id'];
        $startDate = isset($validated['start_date']) ? Carbon::parse($validated['start_date']) : Carbon::now()->subMonths(1);
        $endDate = isset($validated['end_date']) ? Carbon::parse($validated['end_date']) : Carbon::now();

        $data = $this->clinicalService->getValidationMetrics($userId, $startDate, $endDate);

        return response()->json([
            'success' => true,
            'data' => $data,
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Get treatment outcomes
     * GET /api/v1/clinical/treatment-outcomes
     */
    public function treatmentOutcomes(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|integer|exists:users,id',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        $userId = $validated['user_id'];
        $startDate = isset($validated['start_date']) ? Carbon::parse($validated['start_date']) : Carbon::now()->subMonths(1);
        $endDate = isset($validated['end_date']) ? Carbon::parse($validated['end_date']) : Carbon::now();

        $data = $this->clinicalService->getTreatmentOutcomes($userId, $startDate, $endDate);

        return response()->json([
            'success' => true,
            'data' => $data,
            'timestamp' => now()->toIso8601String(),
        ]);
    }
}
