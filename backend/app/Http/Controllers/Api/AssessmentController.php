<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Assessment;
use App\Models\AssessmentAttachment;
use App\Models\AssessmentComment;
use App\Models\AssessmentRiskAdjustment;
use App\Models\AuditLog;
use App\Models\ClinicalValidation;
use App\Models\Notification;
use App\Models\User;
use App\Notifications\AssessmentValidated;
use App\Notifications\AssessmentRejected;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class AssessmentController extends Controller
{
    protected int $riskAdjustmentAlertThreshold = 15;
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
     * Store assessment from mobile app
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'mobile_user_id' => 'required|string',
                'session_id' => 'required|string',
                'assessment_external_id' => 'nullable|string',
                'patient_first_name' => 'nullable|string',
                'patient_last_name' => 'nullable|string',
                'patient_date_of_birth' => 'nullable|date',
                'patient_sex' => 'nullable|string',
                'patient_email' => 'nullable|email',
                'patient_phone' => 'nullable|string',
                'assessment_date' => 'required|date',
                'version' => 'nullable|string',
                'region' => 'nullable|string',
                'city' => 'nullable|string',
                'latitude' => 'nullable|numeric',
                'longitude' => 'nullable|numeric',
                'final_risk_score' => 'required|integer|min:1|max:25',
                'final_risk_level' => 'required|string',
                'urgency' => 'nullable|string',
                'recommended_action' => 'nullable|string',
                'vital_signs' => 'nullable|array',
                'symptoms' => 'nullable|array',
                'medical_history' => 'nullable|array',
                'medications' => 'nullable|array',
                'lifestyle' => 'nullable|array',
                'recommendations' => 'nullable|array',
                'device_platform' => 'nullable|string',
                'device_version' => 'nullable|string',
                'app_version' => 'nullable|string',
                'mobile_created_at' => 'nullable|date',
            ]);

            // Create assessment
            $assessment = Assessment::create(array_merge($validated, [
                'status' => 'pending',
                'synced_at' => now(),
                'country' => 'Philippines', // Default
            ]));

            return response()->json([
                'success' => true,
                'message' => 'Assessment saved successfully',
                'data' => [
                    'id' => $assessment->id,
                    'assessment_external_id' => $assessment->assessment_external_id,
                    'synced_at' => $assessment->synced_at,
                ],
                'timestamp' => now()->toIso8601String(),
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
                'timestamp' => now()->toIso8601String(),
            ], 422);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to save assessment',
                'error' => $e->getMessage(),
                'timestamp' => now()->toIso8601String(),
            ], 500);
        }
    }

    /**
     * Bulk upload assessments (for offline sync)
     * POST /api/v1/assessments/bulk
     */
    public function bulkStore(Request $request): JsonResponse
    {
        try {
            // Validate that we have an array of assessments
            $request->validate([
                'assessments' => 'required|array|min:1|max:100',
                'assessments.*.mobile_user_id' => 'required|string',
                'assessments.*.session_id' => 'required|string',
                'assessments.*.assessment_date' => 'required|date',
                'assessments.*.final_risk_score' => 'required|integer|min:1|max:25',
                'assessments.*.final_risk_level' => 'required|string',
            ]);

            $results = [];
            $successCount = 0;
            $failureCount = 0;

            DB::beginTransaction();

            try {
                foreach ($request->assessments as $index => $assessmentData) {
                    try {
                        // Validate individual assessment (reuse validation from store method)
                        $validator = Validator::make($assessmentData, [
                            'mobile_user_id' => 'required|string',
                            'session_id' => 'required|string',
                            'assessment_external_id' => 'nullable|string',
                            'patient_first_name' => 'nullable|string',
                            'patient_last_name' => 'nullable|string',
                            'patient_date_of_birth' => 'nullable|date',
                            'patient_sex' => 'nullable|string',
                            'patient_email' => 'nullable|email',
                            'patient_phone' => 'nullable|string',
                            'assessment_date' => 'required|date',
                            'version' => 'nullable|string',
                            'region' => 'nullable|string',
                            'city' => 'nullable|string',
                            'latitude' => 'nullable|numeric',
                            'longitude' => 'nullable|numeric',
                            'final_risk_score' => 'required|integer|min:1|max:25',
                            'final_risk_level' => 'required|string',
                            'urgency' => 'nullable|string',
                            'recommended_action' => 'nullable|string',
                            'vital_signs' => 'nullable|array',
                            'symptoms' => 'nullable|array',
                            'medical_history' => 'nullable|array',
                            'medications' => 'nullable|array',
                            'lifestyle' => 'nullable|array',
                            'recommendations' => 'nullable|array',
                            'device_platform' => 'nullable|string',
                            'device_version' => 'nullable|string',
                            'app_version' => 'nullable|string',
                            'mobile_created_at' => 'nullable|date',
                        ]);

                        if ($validator->fails()) {
                            $results[] = [
                                'index' => $index,
                                'success' => false,
                                'errors' => $validator->errors(),
                                'mobile_user_id' => $assessmentData['mobile_user_id'] ?? null,
                                'session_id' => $assessmentData['session_id'] ?? null,
                            ];
                            $failureCount++;
                            continue;
                        }

                        $validated = $validator->validated();

                        // Check for duplicate external_id to prevent re-syncing
                        if (!empty($validated['assessment_external_id'])) {
                            $existing = Assessment::where('assessment_external_id', $validated['assessment_external_id'])->first();
                            if ($existing) {
                                $results[] = [
                                    'index' => $index,
                                    'success' => false,
                                    'message' => 'Assessment already exists (duplicate external_id)',
                                    'assessment_id' => $existing->id,
                                    'assessment_external_id' => $existing->assessment_external_id,
                                ];
                                $failureCount++;
                                continue;
                            }
                        }

                        // Create assessment
                        $assessment = Assessment::create(array_merge($validated, [
                            'status' => 'pending',
                            'synced_at' => now(),
                            'country' => 'Philippines',
                        ]));

                        $results[] = [
                            'index' => $index,
                            'success' => true,
                            'assessment_id' => $assessment->id,
                            'assessment_external_id' => $assessment->assessment_external_id,
                        ];
                        $successCount++;

                    } catch (\Exception $e) {
                        $results[] = [
                            'index' => $index,
                            'success' => false,
                            'error' => $e->getMessage(),
                            'mobile_user_id' => $assessmentData['mobile_user_id'] ?? null,
                        ];
                        $failureCount++;
                    }
                }

                DB::commit();

                return response()->json([
                    'success' => true,
                    'message' => sprintf(
                        'Bulk sync completed: %d succeeded, %d failed out of %d',
                        $successCount,
                        $failureCount,
                        count($request->assessments)
                    ),
                    'summary' => [
                        'total' => count($request->assessments),
                        'success' => $successCount,
                        'failed' => $failureCount,
                    ],
                    'results' => $results,
                    'timestamp' => now()->toIso8601String(),
                ], 200);

            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Bulk validation failed',
                'errors' => $e->errors(),
                'timestamp' => now()->toIso8601String(),
            ], 422);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Bulk upload failed',
                'error' => $e->getMessage(),
                'timestamp' => now()->toIso8601String(),
            ], 500);
        }
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
        $assessment = Assessment::with('clinicalValidations')->findOrFail($id);

        $validated = $request->validate([
            'validated_risk_score' => 'required|integer|min:0|max:100',
            'validation_notes' => 'nullable|string|max:1000',
            'validation_agrees_with_ml' => 'required|boolean',
        ]);

        $oldSnapshot = $this->captureAuditSnapshot($assessment);
        $actingUser = $this->resolveActingUser($request);
        $validatedLevel = $this->getRiskLevel((int) $validated['validated_risk_score']);

        $updatePayload = [
            'final_risk_score' => (int) $validated['validated_risk_score'],
            'final_risk_level' => $validatedLevel,
            'validation_notes' => $validated['validation_notes'],
            'validation_agrees_with_ml' => (bool) $validated['validation_agrees_with_ml'],
            'validated_by' => $actingUser?->id,
            'validated_at' => now(),
            'status' => 'validated',
        ];

        $assessment->update($updatePayload);
        $assessment->refresh();

        $agreementLevel = $updatePayload['validation_agrees_with_ml']
            ? 'complete_agreement'
            : ($assessment->ml_risk_score !== null &&
                abs($updatePayload['final_risk_score'] - $assessment->ml_risk_score) >= 15
                ? 'significant_difference'
                : 'partial_agreement');

        $this->createClinicalValidationRecord($assessment, [
            'doctor_id' => $actingUser?->id,
            'validated_score' => $updatePayload['final_risk_score'],
            'validated_level' => $validatedLevel,
            'validation_notes' => $updatePayload['validation_notes'],
            'agreement_level' => $agreementLevel,
        ]);

        $this->logAssessmentAudit(
            $request,
            $assessment,
            $oldSnapshot,
            $updatePayload,
            'assessment.validated',
            'Assessment approved by clinician'
        );

        $this->notifyAssessmentOwner($assessment, 'Assessment Approved', 'A clinician approved your cardiovascular assessment.', [
            'status' => 'validated',
            'validated_risk_score' => $updatePayload['final_risk_score'],
            'validated_risk_level' => $validatedLevel,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Assessment validated successfully',
            'data' => $assessment,
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Reject an assessment with clinical feedback
     */
    public function reject(Request $request, string $id): JsonResponse
    {
        $assessment = Assessment::findOrFail($id);

        $validated = $request->validate([
            'reason' => 'required|string|max:1000',
            'notify_mobile_user' => 'sometimes|boolean',
        ]);

        $oldSnapshot = $this->captureAuditSnapshot($assessment);
        $actingUser = $this->resolveActingUser($request);

        $updatePayload = [
            'status' => 'rejected',
            'validation_notes' => $validated['reason'],
            'validated_by' => $actingUser?->id,
            'validated_at' => now(),
            'validation_agrees_with_ml' => false,
        ];

        $assessment->update($updatePayload);
        $assessment->refresh();

        $this->createClinicalValidationRecord($assessment, [
            'doctor_id' => $actingUser?->id,
            'validated_score' => $assessment->final_risk_score ?? $assessment->ml_risk_score ?? 0,
            'validated_level' => $assessment->final_risk_level ?? $assessment->ml_risk_level ?? 'Low',
            'validation_notes' => $validated['reason'],
            'agreement_level' => 'complete_disagreement',
            'recommendations' => 'Resubmission required. ' . $validated['reason'],
        ]);

        $this->logAssessmentAudit(
            $request,
            $assessment,
            $oldSnapshot,
            $updatePayload,
            'assessment.rejected',
            'Assessment rejected pending additional clinical data',
            'high'
        );

        if (($validated['notify_mobile_user'] ?? true) === true) {
            $this->notifyAssessmentOwner(
                $assessment,
                'Assessment Rejected',
                'Please review and resubmit the assessment with the requested information.',
                [
                    'status' => 'rejected',
                    'reason' => $validated['reason'],
                ],
                'high'
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Assessment rejected successfully',
            'data' => $assessment,
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Fetch clinical notes with version history for an assessment
     */
    public function clinicalNotes(Request $request, string $id): JsonResponse
    {
        $assessment = Assessment::findOrFail($id);

        $notes = AssessmentComment::with([
            'user',
            'attachments',
            'replies' => function ($query) {
                $query->orderBy('created_at', 'desc');
            },
            'replies.user',
            'replies.attachments',
        ])
            ->where('assessment_id', $assessment->id)
            ->where('comment_type', 'clinical_note')
            ->whereNull('parent_id')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn ($note) => $this->transformClinicalNote($note));

        return response()->json([
            'success' => true,
            'data' => $notes,
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Store a new clinical note or version with optional attachments
     */
    public function storeClinicalNote(Request $request, string $id): JsonResponse
    {
        $assessment = Assessment::findOrFail($id);

        $validated = $request->validate([
            'content' => 'required|string|max:5000',
            'visibility' => 'required|in:private,internal,shared',
            'mobile_visible' => 'sometimes|boolean',
            'parent_note_id' => 'nullable|exists:assessment_comments,id',
            'attachments' => 'nullable|array|max:5',
            'attachments.*' => 'file|mimes:jpg,jpeg,png,pdf|max:10240',
        ]);

        $actingUser = $this->resolveActingUser($request);

        $parentId = null;
        if (!empty($validated['parent_note_id'])) {
            $parentNote = AssessmentComment::where('assessment_id', $assessment->id)
                ->where('comment_type', 'clinical_note')
                ->findOrFail($validated['parent_note_id']);
            $parentId = $parentNote->parent_id ?? $parentNote->id;
        }

        $visibility = $validated['visibility'];
        if (($validated['mobile_visible'] ?? false) === true) {
            $visibility = 'shared';
        }

        $note = AssessmentComment::create([
            'assessment_id' => $assessment->id,
            'user_id' => $actingUser?->id,
            'comment' => $validated['content'],
            'comment_type' => 'clinical_note',
            'visibility' => $visibility,
            'parent_id' => $parentId,
        ]);

        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $path = $file->store('clinical-notes');

                AssessmentAttachment::create([
                    'assessment_id' => $assessment->id,
                    'comment_id' => $note->id,
                    'uploaded_by' => $actingUser?->id,
                    'file_name' => $file->getClientOriginalName(),
                    'file_path' => $path,
                    'file_type' => $file->extension(),
                    'mime_type' => $file->getMimeType(),
                    'file_size' => $file->getSize(),
                    'description' => 'Clinical note attachment',
                    'document_type' => 'clinical_note',
                    'is_sensitive' => $visibility !== 'shared',
                    'access_permissions' => $visibility === 'shared' ? ['mobile', 'clinical'] : ['clinical'],
                ]);
            }
        }

        $rootId = $note->parent_id ?? $note->id;
        $rootNote = AssessmentComment::with([
            'user',
            'attachments',
            'replies' => function ($query) {
                $query->orderBy('created_at', 'desc');
            },
            'replies.user',
            'replies.attachments',
        ])->findOrFail($rootId);

        $this->logAssessmentAudit(
            $request,
            $assessment,
            [],
            [
                'note_id' => $note->id,
                'visibility' => $visibility,
                'has_attachments' => $request->hasFile('attachments'),
            ],
            'assessment.note_created',
            'Clinical note recorded'
        );

        if ($visibility === 'shared') {
            $this->notifyAssessmentOwner(
                $assessment,
                'New Clinical Note Available',
                'A clinician shared new guidance for your assessment.',
                [
                    'note_id' => $note->id,
                    'assessment_id' => $assessment->id,
                ],
                'normal'
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Clinical note saved',
            'data' => $this->transformClinicalNote($rootNote),
            'timestamp' => now()->toIso8601String(),
        ], 201);
    }

    /**
     * Retrieve risk score adjustment history
     */
    public function riskAdjustments(Request $request, string $id): JsonResponse
    {
        $assessment = Assessment::findOrFail($id);

        $history = AssessmentRiskAdjustment::with('clinician')
            ->where('assessment_id', $assessment->id)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (AssessmentRiskAdjustment $adjustment) => $this->transformRiskAdjustment($adjustment));

        return response()->json([
            'success' => true,
            'data' => $history,
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Adjust an assessment's risk score post-validation
     */
    public function adjustRiskScore(Request $request, string $id): JsonResponse
    {
        $assessment = Assessment::findOrFail($id);

        $validated = $request->validate([
            'new_risk_score' => 'required|integer|min:0|max:100',
            'justification' => 'required|string|min:10|max:2000',
        ]);

        $oldScore = $assessment->final_risk_score ?? $assessment->ml_risk_score ?? null;
        $oldLevel = $assessment->final_risk_level ?? $assessment->ml_risk_level ?? 'Low';
        $newScore = (int) $validated['new_risk_score'];
        $newLevel = $this->getRiskLevel($newScore);

        if ($oldScore === $newScore) {
            return response()->json([
                'success' => false,
                'message' => 'Risk score is unchanged.',
            ], 422);
        }

        $difference = $oldScore !== null ? $newScore - $oldScore : null;
        $alertTriggered = $difference !== null && abs($difference) >= $this->riskAdjustmentAlertThreshold;
        $actingUser = $this->resolveActingUser($request);

        $oldSnapshot = $this->captureAuditSnapshot($assessment);

        $assessment->update([
            'final_risk_score' => $newScore,
            'final_risk_level' => $newLevel,
            'validated_by' => $actingUser?->id ?? $assessment->validated_by,
            'validated_at' => now(),
            'status' => 'validated',
        ]);
        $assessment->refresh();

        $adjustment = AssessmentRiskAdjustment::create([
            'assessment_id' => $assessment->id,
            'adjusted_by' => $actingUser?->id,
            'old_score' => $oldScore,
            'old_level' => $oldLevel,
            'new_score' => $newScore,
            'new_level' => $newLevel,
            'difference' => $difference,
            'justification' => $validated['justification'],
            'alert_triggered' => $alertTriggered,
            'metadata' => [
                'threshold' => $this->riskAdjustmentAlertThreshold,
            ],
        ]);

        $this->logAssessmentAudit(
            $request,
            $assessment,
            $oldSnapshot,
            [
                'new_risk_score' => $newScore,
                'new_risk_level' => $newLevel,
                'justification' => $validated['justification'],
            ],
            'assessment.risk_adjusted',
            'Risk score manually adjusted',
            $alertTriggered ? 'high' : 'medium'
        );

        if ($alertTriggered) {
            $this->notifyAssessmentOwner(
                $assessment,
                'Risk Score Adjusted',
                'A clinician significantly changed the assessment risk score.',
                [
                    'new_risk_score' => $newScore,
                    'new_risk_level' => $newLevel,
                    'difference' => $difference,
                ],
                'high'
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Risk score adjusted successfully',
            'data' => [
                'assessment' => $assessment->fresh(),
                'adjustment' => $this->transformRiskAdjustment($adjustment),
            ],
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Capture key fields for audit logging before an update
     */
    protected function captureAuditSnapshot(Assessment $assessment): array
    {
        return [
            'status' => $assessment->status,
            'final_risk_score' => $assessment->final_risk_score,
            'final_risk_level' => $assessment->final_risk_level,
            'validation_notes' => $assessment->validation_notes,
            'validation_agrees_with_ml' => $assessment->validation_agrees_with_ml,
            'validated_by' => $assessment->validated_by,
            'validated_at' => optional($assessment->validated_at)->toDateTimeString(),
        ];
    }

    /**
     * Resolve acting clinician user from request or default seed accounts
     */
    protected function resolveActingUser(Request $request): ?User
    {
        if ($request->user()) {
            return $request->user();
        }

        static $cachedUser = null;
        if ($cachedUser === null) {
            $cachedUser = User::where('email', 'cardiologist.phc@juanheart.ph')->first() ?? User::first();
        }

        return $cachedUser;
    }

    /**
     * Create a clinical validation history record
     */
    protected function createClinicalValidationRecord(Assessment $assessment, array $payload): void
    {
        $doctorId = $payload['doctor_id']
            ?? User::where('email', 'cardiologist.phc@juanheart.ph')->value('id')
            ?? User::value('id');
        if (!$doctorId) {
            return;
        }

        $validatedScore = (int) ($payload['validated_score'] ?? $assessment->final_risk_score ?? $assessment->ml_risk_score ?? 0);
        $validatedLevel = $payload['validated_level'] ?? $assessment->final_risk_level ?? $assessment->ml_risk_level ?? 'Low';
        $mlScore = $assessment->ml_risk_score;
        $scoreDifference = $mlScore !== null ? $validatedScore - $mlScore : null;

        ClinicalValidation::create([
            'assessment_id' => $assessment->id,
            'doctor_id' => $doctorId,
            'original_ml_score' => $assessment->ml_risk_score,
            'original_ml_level' => $assessment->ml_risk_level,
            'validated_score' => $validatedScore,
            'validated_level' => $validatedLevel,
            'agreement_level' => $payload['agreement_level'] ?? null,
            'score_difference' => $scoreDifference,
            'clinical_notes' => $payload['validation_notes'] ?? $assessment->validation_notes ?? 'No clinical notes provided.',
            'additional_tests_required' => $payload['additional_tests_required'] ?? null,
            'recommendations' => $payload['recommendations'] ?? ($assessment->recommended_action ?? 'See assessment record for recommendations.'),
            'requires_immediate_attention' => $payload['requires_immediate_attention'] ?? ($assessment->final_risk_level === 'High'),
            'requires_follow_up' => $payload['requires_follow_up'] ?? false,
            'follow_up_days' => $payload['follow_up_days'] ?? null,
            'follow_up_instructions' => $payload['follow_up_instructions'] ?? null,
        ]);
    }

    /**
     * Persist an audit trail record for validation actions
     */
    protected function logAssessmentAudit(
        Request $request,
        Assessment $assessment,
        array $oldValues,
        array $newValues,
        string $eventType,
        string $description,
        string $severity = 'medium'
    ): void {
        try {
            $actingUser = $this->resolveActingUser($request);

            AuditLog::create([
                'user_id' => $actingUser?->id,
                'user_email' => $actingUser?->email,
                'user_role' => $actingUser?->getRoleNames()->first(),
                'session_id' => $request->header('X-Session-Id'),
                'event_type' => $eventType,
                'event_category' => 'assessment_validation',
                'action_description' => $description,
                'ip_address' => $request->ip(),
                'user_agent' => substr((string) $request->header('User-Agent'), 0, 500),
                'model_type' => Assessment::class,
                'model_id' => $assessment->id,
                'old_values' => $oldValues,
                'new_values' => $newValues,
                'http_method' => $request->method(),
                'url' => $request->fullUrl(),
                'request_data' => $request->except(['password', 'token']),
                'response_code' => 200,
                'response_message' => $description,
                'severity' => $severity,
                'is_sensitive' => true,
                'contains_pii' => true,
                'contains_phi' => true,
                'data_classification' => 'restricted',
                'tags' => ['assessment', 'validation'],
                'metadata' => [
                    'assessment_external_id' => $assessment->assessment_external_id,
                    'mobile_user_id' => $assessment->mobile_user_id,
                ],
                'created_at' => now(),
            ]);
        } catch (\Throwable $e) {
            report($e);
        }
    }

    /**
     * Store notification for downstream mobile delivery
     */
    protected function notifyAssessmentOwner(
        Assessment $assessment,
        string $title,
        string $body,
        array $data = [],
        string $priority = 'normal'
    ): void {
        try {
            $priority = in_array($priority, ['low', 'normal', 'high', 'critical'], true) ? $priority : 'normal';
            $userId = $assessment->validated_by
                ?? User::where('email', 'doctor.manila@juanheart.ph')->value('id')
                ?? User::value('id');

            if (!$userId) {
                return;
            }

            $user = User::find($userId);
            if (!$user) {
                return;
            }

            $actionUrl = $this->buildFrontendUrl("assessments/{$assessment->id}");

            // Determine notification type based on assessment status
            if ($assessment->status === 'validated' || $assessment->status === 'approved') {
                // Use Laravel Notification for validated assessments
                $user->notify(new AssessmentValidated(
                    $assessment,
                    $data['clinician_notes'] ?? $body,
                    $actionUrl
                ));
            } elseif ($assessment->status === 'rejected' || $assessment->status === 'needs_review') {
                // Use Laravel Notification for rejected/needs review
                $user->notify(new AssessmentRejected(
                    $assessment,
                    $data['reason'] ?? $body,
                    $data['next_steps'] ?? 'Please review and update the assessment.',
                    $actionUrl
                ));
            } else {
                // Fallback to in-app notification only
                Notification::create([
                    'user_id' => $userId,
                    'type' => 'assessment',
                    'title' => $title,
                    'body' => $body,
                    'priority' => $priority,
                    'data' => array_merge([
                        'assessment_id' => $assessment->id,
                        'assessment_external_id' => $assessment->assessment_external_id,
                        'mobile_user_id' => $assessment->mobile_user_id,
                    ], $data),
                    'action_url' => $actionUrl,
                    'related_assessment_id' => $assessment->id,
                ]);
            }
        } catch (\Throwable $e) {
            report($e);
        }
    }

    protected function buildFrontendUrl(string $path): string
    {
        $base = config('app.frontend_url') ?? config('app.url');
        return rtrim($base, '/') . '/' . ltrim($path, '/');
    }

    /**
     * Transform a clinical note with its version history for API responses
     */
    protected function transformClinicalNote(AssessmentComment $note): array
    {
        $versions = collect([$note])
            ->merge($note->replies ?? collect())
            ->sortBy('created_at')
            ->values()
            ->map(function (AssessmentComment $version, int $index) {
                return [
                    'id' => $version->id,
                    'version' => $index + 1,
                    'content' => $version->comment,
                    'visibility' => $version->visibility,
                    'created_at' => optional($version->created_at)->toIso8601String(),
                    'author' => $version->user ? [
                        'first_name' => $version->user->first_name,
                        'last_name' => $version->user->last_name,
                    ] : null,
                    'attachments' => $version->attachments?->map(function (AssessmentAttachment $attachment) {
                        return [
                            'id' => $attachment->id,
                            'file_name' => $attachment->file_name,
                            'file_type' => $attachment->file_type,
                            'mime_type' => $attachment->mime_type,
                            'file_size' => $attachment->file_size,
                            'url' => Storage::url($attachment->file_path),
                            'is_image' => $attachment->isImage(),
                            'is_pdf' => $attachment->isPDF(),
                        ];
                    })->values() ?? [],
                ];
            });

        $latest = $versions->last();

        return [
            'id' => $note->id,
            'current_version' => $versions->count(),
            'latest_content' => $latest['content'] ?? null,
            'visibility' => $latest['visibility'] ?? $note->visibility,
            'mobile_visible' => ($latest['visibility'] ?? $note->visibility) === 'shared',
            'created_at' => $versions->first()['created_at'] ?? null,
            'author' => $versions->first()['author'] ?? null,
            'versions' => $versions,
        ];
    }

    /**
     * Format risk adjustment record for API responses
     */
    protected function transformRiskAdjustment(AssessmentRiskAdjustment $adjustment): array
    {
        return [
            'id' => $adjustment->id,
            'old_score' => $adjustment->old_score,
            'old_level' => $adjustment->old_level,
            'new_score' => $adjustment->new_score,
            'new_level' => $adjustment->new_level,
            'difference' => $adjustment->difference,
            'justification' => $adjustment->justification,
            'alert_triggered' => $adjustment->alert_triggered,
            'created_at' => optional($adjustment->created_at)->toIso8601String(),
            'clinician' => $adjustment->clinician ? [
                'first_name' => $adjustment->clinician->first_name,
                'last_name' => $adjustment->clinician->last_name,
            ] : null,
        ];
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
     * Update assessment with conflict resolution
     * Uses optimistic locking via version number
     * PUT /api/v1/assessments/{id}
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $validated = $request->validate([
                'version_counter' => 'required|integer|min:1', // Client must send current version_counter
                'mobile_user_id' => 'nullable|string',
                'session_id' => 'nullable|string',
                'assessment_external_id' => 'nullable|string',
                'patient_first_name' => 'nullable|string',
                'patient_last_name' => 'nullable|string',
                'patient_date_of_birth' => 'nullable|date',
                'patient_sex' => 'nullable|string',
                'patient_email' => 'nullable|email',
                'patient_phone' => 'nullable|string',
                'assessment_date' => 'nullable|date',
                'region' => 'nullable|string',
                'city' => 'nullable|string',
                'latitude' => 'nullable|numeric',
                'longitude' => 'nullable|numeric',
                'final_risk_score' => 'nullable|integer|min:1|max:25',
                'final_risk_level' => 'nullable|string',
                'urgency' => 'nullable|string',
                'recommended_action' => 'nullable|string',
                'vital_signs' => 'nullable|array',
                'symptoms' => 'nullable|array',
                'medical_history' => 'nullable|array',
                'medications' => 'nullable|array',
                'lifestyle' => 'nullable|array',
                'recommendations' => 'nullable|array',
                'device_platform' => 'nullable|string',
                'device_version' => 'nullable|string',
                'app_version' => 'nullable|string',
            ]);

            // Find the assessment
            $assessment = Assessment::findOrFail($id);

            // Check for version conflict (optimistic locking)
            if ($assessment->version_counter != $validated['version_counter']) {
                return response()->json([
                    'success' => false,
                    'error' => 'conflict',
                    'message' => 'Assessment has been modified by another user. Please refresh and try again.',
                    'current_version_counter' => $assessment->version_counter,
                    'submitted_version_counter' => $validated['version_counter'],
                    'current_data' => $assessment,
                    'timestamp' => now()->toIso8601String(),
                ], 409); // 409 Conflict
            }

            // Increment version_counter for next update
            $validated['version_counter'] = $assessment->version_counter + 1;
            $validated['synced_at'] = now();

            // Update the assessment
            $assessment->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Assessment updated successfully',
                'data' => [
                    'id' => $assessment->id,
                    'version_counter' => $assessment->version_counter,
                    'assessment_external_id' => $assessment->assessment_external_id,
                    'synced_at' => $assessment->synced_at,
                ],
                'timestamp' => now()->toIso8601String(),
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Assessment not found',
                'timestamp' => now()->toIso8601String(),
            ], 404);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
                'timestamp' => now()->toIso8601String(),
            ], 422);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update assessment',
                'error' => $e->getMessage(),
                'timestamp' => now()->toIso8601String(),
            ], 500);
        }
    }

    /**
     * Export assessments to CSV
     * POST /api/v1/assessments/export
     */
    public function export(Request $request)
    {
        try {
            $validated = $request->validate([
                'from_date' => 'nullable|date',
                'to_date' => 'nullable|date',
                'risk_level' => 'nullable|in:Low,Moderate,High',
                'status' => 'nullable|in:pending,in_review,validated,requires_referral,completed,rejected',
                'region' => 'nullable|string',
                'city' => 'nullable|string',
                'format' => 'nullable|in:csv,json',
            ]);

            // Build query with filters
            $query = Assessment::query()->with(['validator', 'clinicalValidations']);

            if (!empty($validated['from_date'])) {
                $query->where('assessment_date', '>=', $validated['from_date']);
            }
            if (!empty($validated['to_date'])) {
                $query->where('assessment_date', '<=', $validated['to_date']);
            }
            if (!empty($validated['risk_level'])) {
                $query->where('final_risk_level', $validated['risk_level']);
            }
            if (!empty($validated['status'])) {
                $query->where('status', $validated['status']);
            }
            if (!empty($validated['region'])) {
                $query->where('region', $validated['region']);
            }
            if (!empty($validated['city'])) {
                $query->where('city', $validated['city']);
            }

            $assessments = $query->orderBy('assessment_date', 'desc')->get();

            $format = $validated['format'] ?? 'csv';

            if ($format === 'json') {
                // JSON export
                return response()->json([
                    'success' => true,
                    'count' => $assessments->count(),
                    'data' => $assessments,
                    'exported_at' => now()->toIso8601String(),
                ], 200);
            }

            // CSV export
            $filename = 'assessments_export_' . now()->format('Y-m-d_His') . '.csv';

            $headers = [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            ];

            $callback = function() use ($assessments) {
                $file = fopen('php://output', 'w');

                // CSV headers
                fputcsv($file, [
                    'ID',
                    'External ID',
                    'Assessment Date',
                    'Patient Name',
                    'Sex',
                    'Age',
                    'Email',
                    'Phone',
                    'Region',
                    'City',
                    'ML Risk Score',
                    'ML Risk Level',
                    'Final Risk Score',
                    'Final Risk Level',
                    'Urgency',
                    'Recommended Action',
                    'Status',
                    'Validated By',
                    'Validated At',
                    'Systolic BP',
                    'Diastolic BP',
                    'Heart Rate',
                    'BMI',
                    'Smoking',
                    'Physical Activity',
                    'Created At',
                    'Synced At',
                ]);

                // Data rows
                foreach ($assessments as $assessment) {
                    $vitalSigns = $assessment->vital_signs ?? [];
                    $lifestyle = $assessment->lifestyle ?? [];

                    // Calculate age if DOB available
                    $age = $assessment->patient_date_of_birth
                        ? \Carbon\Carbon::parse($assessment->patient_date_of_birth)->age
                        : 'N/A';

                    fputcsv($file, [
                        $assessment->id,
                        $assessment->assessment_external_id,
                        $assessment->assessment_date,
                        $assessment->patient_first_name . ' ' . $assessment->patient_last_name,
                        $assessment->patient_sex,
                        $age,
                        $assessment->patient_email,
                        $assessment->patient_phone,
                        $assessment->region,
                        $assessment->city,
                        $assessment->ml_risk_score,
                        $assessment->ml_risk_level,
                        $assessment->final_risk_score,
                        $assessment->final_risk_level,
                        $assessment->urgency,
                        $assessment->recommended_action,
                        $assessment->status,
                        $assessment->validator ? $assessment->validator->name : 'N/A',
                        $assessment->validated_at,
                        $vitalSigns['systolic_bp'] ?? 'N/A',
                        $vitalSigns['diastolic_bp'] ?? 'N/A',
                        $vitalSigns['heart_rate'] ?? 'N/A',
                        $vitalSigns['bmi'] ?? 'N/A',
                        $lifestyle['smoking'] ?? 'N/A',
                        $lifestyle['physical_activity'] ?? 'N/A',
                        $assessment->created_at,
                        $assessment->synced_at,
                    ]);
                }

                fclose($file);
            };

            return response()->stream($callback, 200, $headers);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
                'timestamp' => now()->toIso8601String(),
            ], 422);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to export assessments',
                'error' => $e->getMessage(),
                'timestamp' => now()->toIso8601String(),
            ], 500);
        }
    }
}
