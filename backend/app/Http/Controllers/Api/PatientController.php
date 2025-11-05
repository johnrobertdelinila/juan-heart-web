<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Assessment;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class PatientController extends Controller
{
    /**
     * Get list of unique patients with their latest assessment data
     */
    public function index(Request $request): JsonResponse
    {
        // Get unique patients by grouping assessments
        $query = Assessment::select([
            DB::raw('MIN(id) as id'),
            'patient_first_name',
            'patient_last_name',
            'patient_date_of_birth',
            'patient_sex',
            DB::raw('MAX(assessment_date) as last_assessment_date'),
            DB::raw('MAX(final_risk_level) as latest_risk_level'),
            DB::raw('COUNT(*) as total_assessments'),
        ])
        ->groupBy('patient_first_name', 'patient_last_name', 'patient_date_of_birth', 'patient_sex');

        // Apply filters
        if ($request->has('search')) {
            $search = $request->search;
            $query->having(function ($q) use ($search) {
                $q->where('patient_first_name', 'like', "%{$search}%")
                  ->orWhere('patient_last_name', 'like', "%{$search}%");
            });
        }

        if ($request->has('risk_level')) {
            $query->havingRaw('MAX(final_risk_level) = ?', [$request->risk_level]);
        }

        if ($request->has('sex')) {
            $query->where('patient_sex', $request->sex);
        }

        // Sort
        $sortBy = $request->get('sort_by', 'last_assessment_date');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Paginate
        $perPage = $request->get('per_page', 20);
        $patients = $query->paginate($perPage);

        // Transform the data to match frontend expectations
        $transformedData = $patients->getCollection()->map(function ($patient) {
            return [
                'id' => $patient->id,
                'patient_first_name' => $patient->patient_first_name,
                'patient_last_name' => $patient->patient_last_name,
                'patient_full_name' => trim("{$patient->patient_first_name} {$patient->patient_last_name}"),
                'patient_date_of_birth' => $patient->patient_date_of_birth,
                'patient_sex' => $patient->patient_sex,
                'last_assessment_date' => $patient->last_assessment_date,
                'latest_risk_level' => $patient->latest_risk_level,
                'total_assessments' => $patient->total_assessments,
                'status' => $this->determinePatientStatus($patient),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $transformedData,
            'pagination' => [
                'current_page' => $patients->currentPage(),
                'last_page' => $patients->lastPage(),
                'per_page' => $patients->perPage(),
                'total' => $patients->total(),
            ],
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Get patient statistics
     */
    public function statistics(Request $request): JsonResponse
    {
        // Get unique patient count
        $totalPatients = Assessment::select([
            'patient_first_name',
            'patient_last_name',
            'patient_date_of_birth',
        ])
        ->distinct()
        ->count(DB::raw('CONCAT(patient_first_name, patient_last_name, patient_date_of_birth)'));

        // Get patients with recent assessments (within 30 days) - "Active"
        $activePatients = Assessment::select([
            'patient_first_name',
            'patient_last_name',
            'patient_date_of_birth',
        ])
        ->where('assessment_date', '>=', now()->subDays(30))
        ->distinct()
        ->count(DB::raw('CONCAT(patient_first_name, patient_last_name, patient_date_of_birth)'));

        // Get patients needing follow-up (assessments between 30-90 days ago)
        $followUpPatients = Assessment::select([
            'patient_first_name',
            'patient_last_name',
            'patient_date_of_birth',
        ])
        ->whereBetween('assessment_date', [now()->subDays(90), now()->subDays(30)])
        ->distinct()
        ->count(DB::raw('CONCAT(patient_first_name, patient_last_name, patient_date_of_birth)'));

        // Get high risk patients (latest assessment is high risk)
        $highRiskPatients = Assessment::whereIn('id', function ($query) {
            $query->select(DB::raw('MAX(id)'))
                ->from('assessments')
                ->groupBy('patient_first_name', 'patient_last_name', 'patient_date_of_birth');
        })
        ->where('final_risk_level', 'High')
        ->count();

        return response()->json([
            'success' => true,
            'data' => [
                'total_patients' => $totalPatients,
                'active_patients' => $activePatients,
                'follow_up_patients' => $followUpPatients,
                'high_risk_patients' => $highRiskPatients,
            ],
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Get a single patient's profile with all assessments
     */
    public function show(string $id): JsonResponse
    {
        $assessment = Assessment::findOrFail($id);

        // Get all assessments for this patient
        $patientAssessments = Assessment::where('patient_first_name', $assessment->patient_first_name)
            ->where('patient_last_name', $assessment->patient_last_name)
            ->where('patient_date_of_birth', $assessment->patient_date_of_birth)
            ->orderBy('assessment_date', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'patient' => [
                    'first_name' => $assessment->patient_first_name,
                    'last_name' => $assessment->patient_last_name,
                    'date_of_birth' => $assessment->patient_date_of_birth,
                    'sex' => $assessment->patient_sex,
                    'email' => $assessment->patient_email,
                    'phone' => $assessment->patient_phone,
                ],
                'assessments' => $patientAssessments,
                'total_assessments' => $patientAssessments->count(),
                'latest_assessment' => $patientAssessments->first(),
            ],
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Determine patient status based on assessment dates
     */
    private function determinePatientStatus($patient): string
    {
        $daysSinceLastAssessment = now()->diffInDays($patient->last_assessment_date);

        if ($daysSinceLastAssessment <= 30) {
            return 'Active';
        } elseif ($daysSinceLastAssessment <= 90) {
            return 'Follow-up';
        } else {
            return 'Discharged';
        }
    }
}
