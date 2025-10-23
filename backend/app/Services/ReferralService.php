<?php

namespace App\Services;

use App\Models\Assessment;
use App\Models\HealthcareFacility;
use App\Models\Referral;
use App\Models\ReferralHistory;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class ReferralService
{
    /**
     * Get paginated referrals with filters
     */
    public function getReferrals(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        $query = Referral::with([
            'assessment',
            'sourceFacility',
            'targetFacility',
            'referringUser',
            'assignedDoctor',
        ]);

        // Apply filters
        $this->applyFilters($query, $filters);

        // Apply sorting
        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortOrder = $filters['sort_order'] ?? 'desc';

        // Priority-based sorting for pending referrals
        if (!isset($filters['sort_by']) && isset($filters['status']) && $filters['status'] === 'pending') {
            $query->orderByRaw("FIELD(priority, 'Critical', 'High', 'Medium', 'Low')")
                  ->orderBy('created_at', 'desc');
        } else {
            $query->orderBy($sortBy, $sortOrder);
        }

        return $query->paginate($perPage);
    }

    /**
     * Get a single referral by ID with relationships
     */
    public function getReferralById(int $id): ?Referral
    {
        return Referral::with([
            'assessment',
            'assessment.patient',
            'sourceFacility',
            'targetFacility',
            'referringUser',
            'assignedDoctor',
            'history',
            'history.user',
        ])->find($id);
    }

    /**
     * Create a new referral from assessment
     */
    public function createReferral(Assessment $assessment, array $data): Referral
    {
        return DB::transaction(function () use ($assessment, $data) {
            // Auto-determine priority based on assessment risk level
            $priority = $this->determinePriority($assessment);

            // Auto-determine urgency based on risk score and symptoms
            $urgency = $this->determineUrgency($assessment);

            // Find best matching facility if not specified
            if (empty($data['target_facility_id'])) {
                $data['target_facility_id'] = $this->findBestMatchingFacility($assessment, $data);
            }

            // Create referral
            $referral = Referral::create([
                'assessment_id' => $assessment->id,
                'patient_first_name' => $data['patient_first_name'] ?? $assessment->patient->first_name ?? 'Unknown',
                'patient_last_name' => $data['patient_last_name'] ?? $assessment->patient->last_name ?? 'Unknown',
                'patient_date_of_birth' => $data['patient_date_of_birth'] ?? $assessment->patient->date_of_birth ?? null,
                'patient_sex' => $data['patient_sex'] ?? $assessment->patient->sex ?? null,
                'patient_phone' => $data['patient_phone'] ?? $assessment->patient->phone ?? null,
                'source_facility_id' => $data['source_facility_id'] ?? auth()->user()->facility_id ?? null,
                'target_facility_id' => $data['target_facility_id'],
                'referring_user_id' => auth()->id(),
                'priority' => $data['priority'] ?? $priority,
                'urgency' => $data['urgency'] ?? $urgency,
                'referral_type' => $data['referral_type'] ?? $this->determineReferralType($assessment),
                'chief_complaint' => $data['chief_complaint'] ?? null,
                'clinical_notes' => $data['clinical_notes'] ?? null,
                'required_services' => $data['required_services'] ?? $this->determineRequiredServices($assessment),
                'status' => 'pending',
            ]);

            // Log creation
            ReferralHistory::log(
                referralId: $referral->id,
                action: 'created',
                description: 'Referral created from assessment',
                userId: auth()->id(),
                previousStatus: null,
                newStatus: 'pending',
                metadata: [
                    'assessment_id' => $assessment->id,
                    'ml_score' => $assessment->ml_score,
                    'final_risk_level' => $assessment->final_risk_level,
                ]
            );

            return $referral;
        });
    }

    /**
     * Accept a referral
     */
    public function acceptReferral(Referral $referral, array $data): Referral
    {
        return DB::transaction(function () use ($referral, $data) {
            $oldStatus = $referral->status;

            $referral->update([
                'status' => 'accepted',
                'accepted_at' => now(),
                'assigned_doctor_id' => $data['assigned_doctor_id'] ?? auth()->id(),
                'status_notes' => $data['notes'] ?? null,
                'scheduled_appointment' => $data['scheduled_appointment'] ?? null,
                'appointment_notes' => $data['appointment_notes'] ?? null,
            ]);

            // Log acceptance
            ReferralHistory::log(
                referralId: $referral->id,
                action: 'accepted',
                description: 'Referral accepted by target facility',
                userId: auth()->id(),
                previousStatus: $oldStatus,
                newStatus: 'accepted',
                notes: $data['notes'] ?? null,
                metadata: [
                    'assigned_doctor_id' => $referral->assigned_doctor_id,
                    'scheduled_appointment' => $referral->scheduled_appointment?->toDateTimeString(),
                ]
            );

            return $referral->fresh();
        });
    }

    /**
     * Reject a referral
     */
    public function rejectReferral(Referral $referral, string $reason, ?array $suggestedFacilities = null): Referral
    {
        return DB::transaction(function () use ($referral, $reason, $suggestedFacilities) {
            $oldStatus = $referral->status;

            $referral->update([
                'status' => 'rejected',
                'status_notes' => $reason,
            ]);

            // Log rejection
            ReferralHistory::log(
                referralId: $referral->id,
                action: 'rejected',
                description: 'Referral rejected by target facility',
                userId: auth()->id(),
                previousStatus: $oldStatus,
                newStatus: 'rejected',
                notes: $reason,
                metadata: [
                    'suggested_facilities' => $suggestedFacilities,
                ]
            );

            return $referral->fresh();
        });
    }

    /**
     * Update referral status
     */
    public function updateStatus(Referral $referral, string $newStatus, ?string $notes = null): Referral
    {
        return DB::transaction(function () use ($referral, $newStatus, $notes) {
            $oldStatus = $referral->status;

            $updateData = ['status' => $newStatus];

            // Set timestamp based on status
            match ($newStatus) {
                'accepted' => $updateData['accepted_at'] = now(),
                'arrived' => $updateData['arrived_at'] = now(),
                'completed' => $updateData['completed_at'] = now(),
                'cancelled' => $updateData['cancelled_at'] = now(),
                default => null,
            };

            if ($notes) {
                $updateData['status_notes'] = $notes;
            }

            $referral->update($updateData);

            // Log status change
            ReferralHistory::log(
                referralId: $referral->id,
                action: 'status_changed',
                description: "Status changed from {$oldStatus} to {$newStatus}",
                userId: auth()->id(),
                previousStatus: $oldStatus,
                newStatus: $newStatus,
                notes: $notes
            );

            return $referral->fresh();
        });
    }

    /**
     * Schedule appointment for referral
     */
    public function scheduleAppointment(Referral $referral, array $data): Referral
    {
        return DB::transaction(function () use ($referral, $data) {
            $referral->update([
                'scheduled_appointment' => $data['appointment_datetime'],
                'appointment_notes' => $data['notes'] ?? null,
                'assigned_doctor_id' => $data['assigned_doctor_id'] ?? $referral->assigned_doctor_id,
            ]);

            // Log scheduling
            ReferralHistory::log(
                referralId: $referral->id,
                action: 'scheduled',
                description: 'Appointment scheduled',
                userId: auth()->id(),
                notes: $data['notes'] ?? null,
                metadata: [
                    'appointment_datetime' => $data['appointment_datetime'],
                    'assigned_doctor_id' => $referral->assigned_doctor_id,
                ]
            );

            return $referral->fresh();
        });
    }

    /**
     * Complete referral with outcome
     */
    public function completeReferral(Referral $referral, array $data): Referral
    {
        return DB::transaction(function () use ($referral, $data) {
            $oldStatus = $referral->status;

            $referral->update([
                'status' => 'completed',
                'completed_at' => now(),
                'treatment_summary' => $data['treatment_summary'] ?? null,
                'diagnosis' => $data['diagnosis'] ?? null,
                'recommendations' => $data['recommendations'] ?? null,
                'outcome' => $data['outcome'] ?? 'Unknown',
                'requires_follow_up' => $data['requires_follow_up'] ?? false,
                'follow_up_date' => $data['follow_up_date'] ?? null,
                'follow_up_notes' => $data['follow_up_notes'] ?? null,
            ]);

            // Log completion
            ReferralHistory::log(
                referralId: $referral->id,
                action: 'completed',
                description: 'Referral completed',
                userId: auth()->id(),
                previousStatus: $oldStatus,
                newStatus: 'completed',
                metadata: [
                    'outcome' => $referral->outcome,
                    'requires_follow_up' => $referral->requires_follow_up,
                ]
            );

            return $referral->fresh();
        });
    }

    /**
     * Escalate referral priority
     */
    public function escalateReferral(Referral $referral, string $newPriority, string $reason): Referral
    {
        return DB::transaction(function () use ($referral, $newPriority, $reason) {
            $oldPriority = $referral->priority;

            $referral->update([
                'priority' => $newPriority,
            ]);

            // Log escalation
            ReferralHistory::log(
                referralId: $referral->id,
                action: 'escalated',
                description: "Priority escalated from {$oldPriority} to {$newPriority}",
                userId: auth()->id(),
                notes: $reason,
                metadata: [
                    'old_priority' => $oldPriority,
                    'new_priority' => $newPriority,
                ]
            );

            return $referral->fresh();
        });
    }

    /**
     * Get referral statistics
     */
    public function getReferralStatistics(array $filters = []): array
    {
        $cacheKey = 'referral_statistics_' . md5(json_encode($filters));

        return Cache::remember($cacheKey, 300, function () use ($filters) {
            $query = Referral::query();
            $this->applyDateFilters($query, $filters);

            $totalReferrals = (clone $query)->count();
            $pendingReferrals = (clone $query)->where('status', 'pending')->count();
            $acceptedReferrals = (clone $query)->where('status', 'accepted')->count();
            $completedReferrals = (clone $query)->where('status', 'completed')->count();
            $rejectedReferrals = (clone $query)->where('status', 'rejected')->count();

            // Calculate acceptance rate
            $processedReferrals = $acceptedReferrals + $rejectedReferrals;
            $acceptanceRate = $processedReferrals > 0
                ? round(($acceptedReferrals / $processedReferrals) * 100, 1)
                : 0;

            // Calculate average response time (hours)
            $avgResponseTime = (clone $query)
                ->whereNotNull('accepted_at')
                ->selectRaw('AVG(TIMESTAMPDIFF(HOUR, created_at, accepted_at)) as avg_hours')
                ->value('avg_hours');

            return [
                'total_referrals' => $totalReferrals,
                'pending' => $pendingReferrals,
                'accepted' => $acceptedReferrals,
                'completed' => $completedReferrals,
                'rejected' => $rejectedReferrals,
                'acceptance_rate' => $acceptanceRate,
                'avg_response_time_hours' => round($avgResponseTime ?? 0, 1),
                'critical_pending' => (clone $query)->where('status', 'pending')->where('priority', 'Critical')->count(),
            ];
        });
    }

    /**
     * Apply filters to query
     */
    private function applyFilters(Builder $query, array $filters): void
    {
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['priority'])) {
            $query->where('priority', $filters['priority']);
        }

        if (!empty($filters['urgency'])) {
            $query->where('urgency', $filters['urgency']);
        }

        if (!empty($filters['target_facility_id'])) {
            $query->where('target_facility_id', $filters['target_facility_id']);
        }

        if (!empty($filters['source_facility_id'])) {
            $query->where('source_facility_id', $filters['source_facility_id']);
        }

        if (!empty($filters['assigned_doctor_id'])) {
            $query->where('assigned_doctor_id', $filters['assigned_doctor_id']);
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('patient_first_name', 'like', "%{$search}%")
                  ->orWhere('patient_last_name', 'like', "%{$search}%")
                  ->orWhere('chief_complaint', 'like', "%{$search}%")
                  ->orWhere('id', 'like', "%{$search}%");
            });
        }

        $this->applyDateFilters($query, $filters);
    }

    /**
     * Apply date filters to query
     */
    private function applyDateFilters(Builder $query, array $filters): void
    {
        if (!empty($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }
    }

    /**
     * Determine priority based on assessment
     */
    private function determinePriority(Assessment $assessment): string
    {
        $riskLevel = $assessment->final_risk_level ?? $assessment->ml_score;

        return match (true) {
            $riskLevel >= 75 => 'Critical',
            $riskLevel >= 50 => 'High',
            $riskLevel >= 25 => 'Medium',
            default => 'Low',
        };
    }

    /**
     * Determine urgency based on assessment
     */
    private function determineUrgency(Assessment $assessment): string
    {
        $riskLevel = $assessment->final_risk_level ?? $assessment->ml_score;

        // Check for emergency symptoms
        $symptoms = $assessment->symptoms ?? [];
        $emergencySymptoms = ['chest_pain', 'shortness_of_breath', 'severe_headache', 'loss_of_consciousness'];

        $hasEmergencySymptom = is_array($symptoms) &&
            count(array_intersect(array_keys($symptoms), $emergencySymptoms)) > 0;

        return match (true) {
            $riskLevel >= 75 || $hasEmergencySymptom => 'Emergency',
            $riskLevel >= 50 => 'Urgent',
            default => 'Routine',
        };
    }

    /**
     * Determine referral type based on assessment
     */
    private function determineReferralType(Assessment $assessment): string
    {
        $riskLevel = $assessment->final_risk_level ?? $assessment->ml_score;

        return match (true) {
            $riskLevel >= 75 => 'Emergency CVD Care',
            $riskLevel >= 50 => 'High Risk CVD Assessment',
            default => 'CVD Risk Consultation',
        };
    }

    /**
     * Determine required services based on assessment
     */
    private function determineRequiredServices(Assessment $assessment): array
    {
        $services = ['Cardiology Consultation'];

        $riskLevel = $assessment->final_risk_level ?? $assessment->ml_score;

        if ($riskLevel >= 50) {
            $services[] = 'ECG';
            $services[] = 'Laboratory Tests';
        }

        if ($riskLevel >= 75) {
            $services[] = 'Emergency Care';
            $services[] = 'Cardiac Monitoring';
        }

        return $services;
    }

    /**
     * Find best matching facility for referral
     */
    private function findBestMatchingFacility(Assessment $assessment, array $data): int
    {
        $riskLevel = $assessment->final_risk_level ?? $assessment->ml_score;

        // Determine required facility level
        $requiredLevel = match (true) {
            $riskLevel >= 75 => 'Tertiary',
            $riskLevel >= 50 => 'Secondary',
            default => 'Primary',
        };

        // Find nearest facility with required level and capacity
        $facility = HealthcareFacility::where('facility_level', $requiredLevel)
            ->where('is_active', true)
            ->where('accepts_referrals', true)
            ->first();

        // Fallback to any active facility if none found
        if (!$facility) {
            $facility = HealthcareFacility::where('is_active', true)
                ->where('accepts_referrals', true)
                ->first();
        }

        return $facility?->id ?? 1; // Fallback to ID 1 (should be PHC)
    }
}
