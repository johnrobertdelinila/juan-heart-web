<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Assessment;
use App\Models\Referral;
use App\Services\ReferralService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class ReferralController extends Controller
{
    public function __construct(
        private ReferralService $referralService
    ) {}

    /**
     * Get paginated list of referrals with filters
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'status' => ['nullable', Rule::in(['pending', 'accepted', 'in_transit', 'arrived', 'in_progress', 'completed', 'rejected', 'cancelled'])],
            'priority' => ['nullable', Rule::in(['Low', 'Medium', 'High', 'Critical'])],
            'urgency' => ['nullable', Rule::in(['Routine', 'Urgent', 'Emergency'])],
            'target_facility_id' => 'nullable|integer|exists:healthcare_facilities,id',
            'source_facility_id' => 'nullable|integer|exists:healthcare_facilities,id',
            'assigned_doctor_id' => 'nullable|integer|exists:users,id',
            'search' => 'nullable|string|max:255',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date|after_or_equal:date_from',
            'sort_by' => ['nullable', Rule::in(['created_at', 'priority', 'urgency', 'scheduled_appointment'])],
            'sort_order' => ['nullable', Rule::in(['asc', 'desc'])],
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $filters = $request->only([
                'status',
                'priority',
                'urgency',
                'target_facility_id',
                'source_facility_id',
                'assigned_doctor_id',
                'search',
                'date_from',
                'date_to',
                'sort_by',
                'sort_order',
            ]);

            $perPage = $request->input('per_page', 20);

            $referrals = $this->referralService->getReferrals($filters, $perPage);

            return response()->json([
                'success' => true,
                'data' => $referrals,
                'timestamp' => now()->toISOString(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve referrals',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get referral statistics
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function statistics(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date|after_or_equal:date_from',
            'target_facility_id' => 'nullable|integer|exists:healthcare_facilities,id',
            'source_facility_id' => 'nullable|integer|exists:healthcare_facilities,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $filters = $request->only(['date_from', 'date_to', 'target_facility_id', 'source_facility_id']);
            $statistics = $this->referralService->getReferralStatistics($filters);

            return response()->json([
                'success' => true,
                'data' => $statistics,
                'timestamp' => now()->toISOString(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve statistics',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get a single referral by ID
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        try {
            $referral = $this->referralService->getReferralById($id);

            if (!$referral) {
                return response()->json([
                    'success' => false,
                    'message' => 'Referral not found',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $referral,
                'timestamp' => now()->toISOString(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve referral',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Create a new referral from assessment
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'assessment_id' => 'required|integer|exists:assessments,id',
            'target_facility_id' => 'nullable|integer|exists:healthcare_facilities,id',
            'source_facility_id' => 'nullable|integer|exists:healthcare_facilities,id',
            'priority' => ['nullable', Rule::in(['Low', 'Medium', 'High', 'Critical'])],
            'urgency' => ['nullable', Rule::in(['Routine', 'Urgent', 'Emergency'])],
            'referral_type' => 'nullable|string|max:255',
            'chief_complaint' => 'nullable|string|max:1000',
            'clinical_notes' => 'nullable|string|max:5000',
            'required_services' => 'nullable|array',
            'required_services.*' => 'string|max:255',
            'patient_first_name' => 'nullable|string|max:255',
            'patient_last_name' => 'nullable|string|max:255',
            'patient_date_of_birth' => 'nullable|date',
            'patient_sex' => ['nullable', Rule::in(['Male', 'Female', 'Other'])],
            'patient_phone' => 'nullable|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $assessment = Assessment::findOrFail($request->assessment_id);

            $referral = $this->referralService->createReferral($assessment, $request->all());

            return response()->json([
                'success' => true,
                'message' => 'Referral created successfully',
                'data' => $referral->load([
                    'assessment',
                    'sourceFacility',
                    'targetFacility',
                    'referringUser',
                ]),
                'timestamp' => now()->toISOString(),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create referral',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Accept a referral
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function accept(Request $request, int $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'assigned_doctor_id' => 'nullable|integer|exists:users,id',
            'notes' => 'nullable|string|max:1000',
            'scheduled_appointment' => 'nullable|date|after:now',
            'appointment_notes' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $referral = Referral::findOrFail($id);

            if (!$referral->isPending()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Only pending referrals can be accepted',
                ], 400);
            }

            $referral = $this->referralService->acceptReferral($referral, $request->all());

            return response()->json([
                'success' => true,
                'message' => 'Referral accepted successfully',
                'data' => $referral,
                'timestamp' => now()->toISOString(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to accept referral',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Reject a referral
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function reject(Request $request, int $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'reason' => 'required|string|max:1000',
            'suggested_facilities' => 'nullable|array',
            'suggested_facilities.*.id' => 'integer|exists:healthcare_facilities,id',
            'suggested_facilities.*.name' => 'string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $referral = Referral::findOrFail($id);

            if (!$referral->isPending()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Only pending referrals can be rejected',
                ], 400);
            }

            $referral = $this->referralService->rejectReferral(
                $referral,
                $request->reason,
                $request->suggested_facilities
            );

            return response()->json([
                'success' => true,
                'message' => 'Referral rejected',
                'data' => $referral,
                'timestamp' => now()->toISOString(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to reject referral',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update referral status
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'status' => ['required', Rule::in(['pending', 'accepted', 'in_transit', 'arrived', 'in_progress', 'completed', 'rejected', 'cancelled'])],
            'notes' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $referral = Referral::findOrFail($id);

            $referral = $this->referralService->updateStatus(
                $referral,
                $request->status,
                $request->notes
            );

            return response()->json([
                'success' => true,
                'message' => 'Status updated successfully',
                'data' => $referral,
                'timestamp' => now()->toISOString(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update status',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Schedule appointment for referral
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function scheduleAppointment(Request $request, int $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'appointment_datetime' => 'required|date|after:now',
            'assigned_doctor_id' => 'nullable|integer|exists:users,id',
            'notes' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $referral = Referral::findOrFail($id);

            $referral = $this->referralService->scheduleAppointment($referral, $request->all());

            return response()->json([
                'success' => true,
                'message' => 'Appointment scheduled successfully',
                'data' => $referral,
                'timestamp' => now()->toISOString(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to schedule appointment',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Complete referral with outcome
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function complete(Request $request, int $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'treatment_summary' => 'nullable|string|max:5000',
            'diagnosis' => 'nullable|string|max:2000',
            'recommendations' => 'nullable|string|max:2000',
            'outcome' => ['nullable', Rule::in(['Improved', 'Stable', 'Deteriorated', 'Deceased', 'Unknown'])],
            'requires_follow_up' => 'nullable|boolean',
            'follow_up_date' => 'nullable|date|after:now',
            'follow_up_notes' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $referral = Referral::findOrFail($id);

            if ($referral->isCompleted()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Referral is already completed',
                ], 400);
            }

            $referral = $this->referralService->completeReferral($referral, $request->all());

            return response()->json([
                'success' => true,
                'message' => 'Referral completed successfully',
                'data' => $referral,
                'timestamp' => now()->toISOString(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to complete referral',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Escalate referral priority
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function escalate(Request $request, int $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'priority' => ['required', Rule::in(['Medium', 'High', 'Critical'])],
            'reason' => 'required|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $referral = Referral::findOrFail($id);

            $referral = $this->referralService->escalateReferral(
                $referral,
                $request->priority,
                $request->reason
            );

            return response()->json([
                'success' => true,
                'message' => 'Referral escalated successfully',
                'data' => $referral,
                'timestamp' => now()->toISOString(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to escalate referral',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
