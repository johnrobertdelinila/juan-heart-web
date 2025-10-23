<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Assessment;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AssessmentController extends Controller
{
    /**
     * Get list of assessments with pagination and filters
     */
    public function index(Request $request): JsonResponse
    {
        $query = Assessment::query()->with(['validator']);

        // Apply filters
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('risk_level')) {
            $query->where('final_risk_level', $request->risk_level);
        }

        if ($request->has('urgency')) {
            $query->where('urgency', $request->urgency);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('patient_first_name', 'like', "%{$search}%")
                  ->orWhere('patient_last_name', 'like', "%{$search}%")
                  ->orWhere('assessment_external_id', 'like', "%{$search}%");
            });
        }

        if ($request->has('region')) {
            $query->where('region', $request->region);
        }

        // Date range filter
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->betweenDates($request->start_date, $request->end_date);
        }

        // Sort
        $sortBy = $request->get('sort_by', 'assessment_date');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Paginate
        $perPage = $request->get('per_page', 20);
        $assessments = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $assessments->items(),
            'pagination' => [
                'current_page' => $assessments->currentPage(),
                'last_page' => $assessments->lastPage(),
                'per_page' => $assessments->perPage(),
                'total' => $assessments->total(),
            ],
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Get assessment statistics
     */
    public function statistics(Request $request): JsonResponse
    {
        $query = Assessment::query();

        // Apply date range if provided
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->betweenDates($request->start_date, $request->end_date);
        }

        $totalAssessments = $query->count();
        $pendingAssessments = (clone $query)->where('status', 'pending')->count();
        $validatedAssessments = (clone $query)->where('status', 'validated')->count();
        $highRiskAssessments = (clone $query)->where('final_risk_level', 'High')->count();
        $moderateRiskAssessments = (clone $query)->where('final_risk_level', 'Moderate')->count();
        $lowRiskAssessments = (clone $query)->where('final_risk_level', 'Low')->count();

        $avgRiskScore = (clone $query)->avg('final_risk_score') ?? 0;

        return response()->json([
            'success' => true,
            'data' => [
                'total_assessments' => $totalAssessments,
                'pending_assessments' => $pendingAssessments,
                'validated_assessments' => $validatedAssessments,
                'high_risk_assessments' => $highRiskAssessments,
                'moderate_risk_assessments' => $moderateRiskAssessments,
                'low_risk_assessments' => $lowRiskAssessments,
                'average_risk_score' => round($avgRiskScore, 1),
                'risk_distribution' => [
                    'High' => $highRiskAssessments,
                    'Moderate' => $moderateRiskAssessments,
                    'Low' => $lowRiskAssessments,
                ],
            ],
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Get a single assessment by ID
     */
    public function show(string $id): JsonResponse
    {
        $assessment = Assessment::with(['validator', 'clinicalValidations', 'referrals', 'comments', 'attachments'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $assessment,
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Validate an assessment
     */
    public function validate(Request $request, string $id): JsonResponse
    {
        $assessment = Assessment::findOrFail($id);

        $request->validate([
            'validated_risk_score' => 'required|integer|min:0|max:100',
            'validation_notes' => 'nullable|string|max:1000',
            'validation_agrees_with_ml' => 'required|boolean',
        ]);

        $assessment->update([
            'final_risk_score' => $request->validated_risk_score,
            'final_risk_level' => $this->getRiskLevel($request->validated_risk_score),
            'validation_notes' => $request->validation_notes,
            'validation_agrees_with_ml' => $request->validation_agrees_with_ml,
            'validated_by' => $request->user()->id ?? null,
            'validated_at' => now(),
            'status' => 'validated',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Assessment validated successfully',
            'data' => $assessment->fresh(),
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Get risk level from score
     */
    private function getRiskLevel(int $score): string
    {
        if ($score >= 70) {
            return 'High';
        } elseif ($score >= 40) {
            return 'Moderate';
        } else {
            return 'Low';
        }
    }

    /**
     * Export assessments
     */
    public function export(Request $request): JsonResponse
    {
        // Placeholder for export functionality
        return response()->json([
            'success' => true,
            'message' => 'Export functionality will be implemented',
            'timestamp' => now()->toIso8601String(),
        ]);
    }
}
