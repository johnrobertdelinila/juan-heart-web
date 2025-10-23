<?php

namespace App\Services;

use App\Models\Assessment;
use App\Models\Referral;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class ClinicalDashboardService
{
    /**
     * Get clinical dashboard data
     */
    public function getClinicalDashboard(int $userId, array $filters = []): array
    {
        $startDate = $filters['start_date'] ?? Carbon::now()->subMonths(1);
        $endDate = $filters['end_date'] ?? Carbon::now();

        return Cache::remember("clinical_dashboard_{$userId}_{$startDate}_{$endDate}", 300, function () use ($userId, $filters, $startDate, $endDate) {
            return [
                'assessment_queue' => $this->getAssessmentQueue($userId, $filters),
                'patient_risk_stratification' => $this->getPatientRiskStratification($userId, $startDate, $endDate),
                'clinical_alerts' => $this->getClinicalAlerts($userId),
                'workload_metrics' => $this->getWorkloadMetrics($userId, $startDate, $endDate),
                'validation_metrics' => $this->getValidationMetrics($userId, $startDate, $endDate),
                'treatment_outcomes' => $this->getTreatmentOutcomes($userId, $startDate, $endDate),
            ];
        });
    }

    /**
     * Get assessment queue for clinical review
     */
    public function getAssessmentQueue(int $userId, array $filters = []): array
    {
        $user = User::findOrFail($userId);
        $facilityId = $user->facility_id;

        $priority = $filters['priority'] ?? null;
        $riskLevel = $filters['risk_level'] ?? null;
        $status = $filters['status'] ?? 'pending';

        $query = Assessment::where('status', $status)
            ->whereHas('referrals', function ($q) use ($facilityId) {
                $q->where('target_facility_id', $facilityId);
            })
            ->with(['referrals', 'validator']);

        if ($priority) {
            $query->whereHas('referrals', function ($q) use ($priority) {
                $q->where('priority', $priority);
            });
        }

        if ($riskLevel) {
            $query->where('final_risk_level', $riskLevel);
        }

        // Priority sorting: High risk first, then by date
        $assessments = $query->orderByRaw("
            CASE
                WHEN final_risk_level = 'High' THEN 1
                WHEN final_risk_level = 'Moderate' THEN 2
                WHEN final_risk_level = 'Low' THEN 3
                ELSE 4
            END
        ")
        ->orderBy('assessment_date', 'desc')
        ->limit(50)
        ->get()
        ->map(function ($assessment) {
            return [
                'id' => $assessment->id,
                'assessment_code' => $assessment->assessment_code,
                'patient_name' => $assessment->patient_first_name . ' ' . $assessment->patient_last_name,
                'patient_age' => Carbon::parse($assessment->patient_date_of_birth)->age ?? null,
                'patient_sex' => $assessment->patient_sex,
                'risk_level' => $assessment->final_risk_level,
                'ml_score' => $assessment->ml_risk_score,
                'assessment_date' => $assessment->assessment_date,
                'days_pending' => Carbon::parse($assessment->synced_at ?? $assessment->created_at)->diffInDays(Carbon::now()),
                'priority' => $assessment->referrals->first()->priority ?? 'Normal',
                'chief_complaint' => $assessment->referrals->first()->chief_complaint ?? null,
            ];
        })
        ->toArray();

        $summary = [
            'total_pending' => Assessment::where('status', 'pending')->count(),
            'high_risk_pending' => Assessment::where('status', 'pending')->where('final_risk_level', 'High')->count(),
            'urgent_count' => Assessment::where('status', 'pending')
                ->whereHas('referrals', fn($q) => $q->where('priority', 'Urgent'))
                ->count(),
            'avg_wait_time_hours' => Assessment::where('status', 'pending')
                ->selectRaw('AVG(TIMESTAMPDIFF(HOUR, synced_at, NOW())) as avg_hours')
                ->value('avg_hours') ?? 0,
        ];

        return [
            'assessments' => $assessments,
            'summary' => $summary,
        ];
    }

    /**
     * Get patient risk stratification
     */
    public function getPatientRiskStratification(int $userId, $startDate, $endDate): array
    {
        $user = User::findOrFail($userId);
        $facilityId = $user->facility_id;

        // Risk distribution
        $riskDistribution = Assessment::whereHas('referrals', function ($q) use ($facilityId) {
            $q->where('target_facility_id', $facilityId);
        })
        ->whereBetween('assessment_date', [$startDate, $endDate])
        ->select('final_risk_level', DB::raw('COUNT(*) as count'))
        ->groupBy('final_risk_level')
        ->get()
        ->mapWithKeys(fn($item) => [$item->final_risk_level ?? 'Unknown' => $item->count])
        ->toArray();

        // Risk trends over time
        $riskTrends = Assessment::whereHas('referrals', function ($q) use ($facilityId) {
            $q->where('target_facility_id', $facilityId);
        })
        ->whereBetween('assessment_date', [$startDate, $endDate])
        ->select(
            DB::raw('DATE(assessment_date) as date'),
            DB::raw('COUNT(CASE WHEN final_risk_level = "High" THEN 1 END) as high_risk'),
            DB::raw('COUNT(CASE WHEN final_risk_level = "Moderate" THEN 1 END) as moderate_risk'),
            DB::raw('COUNT(CASE WHEN final_risk_level = "Low" THEN 1 END) as low_risk')
        )
        ->groupBy('date')
        ->orderBy('date')
        ->get()
        ->toArray();

        // High risk patients requiring immediate attention
        $highRiskPatients = Assessment::where('final_risk_level', 'High')
            ->where('status', 'pending')
            ->whereHas('referrals', function ($q) use ($facilityId) {
                $q->where('target_facility_id', $facilityId);
            })
            ->orderBy('ml_risk_score', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($assessment) {
                return [
                    'id' => $assessment->id,
                    'patient_name' => $assessment->patient_first_name . ' ' . $assessment->patient_last_name,
                    'age' => Carbon::parse($assessment->patient_date_of_birth)->age ?? null,
                    'risk_score' => $assessment->ml_risk_score,
                    'days_pending' => Carbon::parse($assessment->synced_at)->diffInDays(Carbon::now()),
                ];
            })
            ->toArray();

        return [
            'risk_distribution' => $riskDistribution,
            'risk_trends' => $riskTrends,
            'high_risk_patients' => $highRiskPatients,
        ];
    }

    /**
     * Get clinical alerts and notifications
     */
    public function getClinicalAlerts(int $userId): array
    {
        $user = User::findOrFail($userId);
        $facilityId = $user->facility_id;

        $alerts = [];

        // Critical assessments (high risk, pending > 24 hours)
        $criticalCount = Assessment::where('final_risk_level', 'High')
            ->where('status', 'pending')
            ->whereHas('referrals', fn($q) => $q->where('target_facility_id', $facilityId))
            ->whereRaw('TIMESTAMPDIFF(HOUR, synced_at, NOW()) > 24')
            ->count();

        if ($criticalCount > 0) {
            $alerts[] = [
                'type' => 'critical',
                'title' => 'Critical Assessments Pending',
                'message' => "{$criticalCount} high-risk assessments pending for more than 24 hours",
                'count' => $criticalCount,
                'action' => 'Review Now',
            ];
        }

        // Urgent referrals
        $urgentReferrals = Referral::where('target_facility_id', $facilityId)
            ->where('priority', 'Urgent')
            ->where('status', 'pending')
            ->count();

        if ($urgentReferrals > 0) {
            $alerts[] = [
                'type' => 'urgent',
                'title' => 'Urgent Referrals',
                'message' => "{$urgentReferrals} urgent referrals awaiting response",
                'count' => $urgentReferrals,
                'action' => 'Review Referrals',
            ];
        }

        // Follow-up required
        $followUpCount = Assessment::where('status', 'validated')
            ->whereNotNull('next_assessment_recommended')
            ->whereRaw('DATE(next_assessment_recommended) <= CURDATE()')
            ->whereHas('referrals', fn($q) => $q->where('target_facility_id', $facilityId))
            ->count();

        if ($followUpCount > 0) {
            $alerts[] = [
                'type' => 'info',
                'title' => 'Follow-ups Due',
                'message' => "{$followUpCount} patients require follow-up assessments",
                'count' => $followUpCount,
                'action' => 'View Patients',
            ];
        }

        return $alerts;
    }

    /**
     * Get workload metrics for the clinician
     */
    public function getWorkloadMetrics(int $userId, $startDate, $endDate): array
    {
        // Assessments validated by this user
        $validatedCount = Assessment::where('validated_by', $userId)
            ->whereBetween('validated_at', [$startDate, $endDate])
            ->count();

        // Average validation time
        $avgValidationTime = Assessment::where('validated_by', $userId)
            ->whereNotNull('validated_at')
            ->whereNotNull('synced_at')
            ->whereBetween('validated_at', [$startDate, $endDate])
            ->selectRaw('AVG(TIMESTAMPDIFF(HOUR, synced_at, validated_at)) as avg_hours')
            ->value('avg_hours') ?? 0;

        // Today's workload
        $todayValidated = Assessment::where('validated_by', $userId)
            ->whereDate('validated_at', Carbon::today())
            ->count();

        $todayPending = Assessment::where('status', 'pending')
            ->whereHas('referrals', function ($q) use ($userId) {
                $user = User::find($userId);
                $q->where('target_facility_id', $user->facility_id);
            })
            ->count();

        // Weekly trend
        $weeklyTrend = Assessment::where('validated_by', $userId)
            ->whereBetween('validated_at', [Carbon::now()->subDays(7), Carbon::now()])
            ->select(
                DB::raw('DATE(validated_at) as date'),
                DB::raw('COUNT(*) as count')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->toArray();

        return [
            'total_validated' => $validatedCount,
            'avg_validation_time_hours' => round($avgValidationTime, 1),
            'today_validated' => $todayValidated,
            'today_pending' => $todayPending,
            'weekly_trend' => $weeklyTrend,
            'productivity_score' => $this->calculateProductivityScore($validatedCount, $avgValidationTime),
        ];
    }

    /**
     * Get validation metrics and accuracy
     */
    public function getValidationMetrics(int $userId, $startDate, $endDate): array
    {
        // Agreement with ML scores
        $validations = DB::table('clinical_validations')
            ->where('doctor_id', $userId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->select('agreement_level', DB::raw('COUNT(*) as count'))
            ->groupBy('agreement_level')
            ->get()
            ->mapWithKeys(fn($item) => [$item->agreement_level => $item->count])
            ->toArray();

        $totalValidations = array_sum($validations);
        $agreementRate = $totalValidations > 0
            ? round((($validations['High'] ?? 0) / $totalValidations) * 100, 1)
            : 0;

        // Score adjustments
        $scoreAdjustments = DB::table('clinical_validations')
            ->where('doctor_id', $userId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('
                AVG(validated_score - original_ml_score) as avg_adjustment,
                MIN(validated_score - original_ml_score) as min_adjustment,
                MAX(validated_score - original_ml_score) as max_adjustment
            ')
            ->first();

        return [
            'total_validations' => $totalValidations,
            'agreement_distribution' => $validations,
            'ml_agreement_rate' => $agreementRate,
            'avg_score_adjustment' => round($scoreAdjustments->avg_adjustment ?? 0, 2),
            'adjustment_range' => [
                'min' => round($scoreAdjustments->min_adjustment ?? 0, 2),
                'max' => round($scoreAdjustments->max_adjustment ?? 0, 2),
            ],
        ];
    }

    /**
     * Get treatment outcomes tracking
     */
    public function getTreatmentOutcomes(int $userId, $startDate, $endDate): array
    {
        $user = User::findOrFail($userId);
        $facilityId = $user->facility_id;

        // Referrals completed
        $completedReferrals = Referral::where('target_facility_id', $facilityId)
            ->where('status', 'completed')
            ->whereBetween('completed_at', [$startDate, $endDate])
            ->count();

        // Average treatment time
        $avgTreatmentTime = Referral::where('target_facility_id', $facilityId)
            ->where('status', 'completed')
            ->whereBetween('completed_at', [$startDate, $endDate])
            ->selectRaw('AVG(TIMESTAMPDIFF(DAY, accepted_at, completed_at)) as avg_days')
            ->value('avg_days') ?? 0;

        // Follow-up compliance
        $followUpRequired = Assessment::where('status', 'validated')
            ->whereNotNull('next_assessment_recommended')
            ->whereHas('referrals', fn($q) => $q->where('target_facility_id', $facilityId))
            ->whereBetween('validated_at', [$startDate, $endDate])
            ->count();

        $followUpCompleted = 0; // TODO: Track when patients return for follow-up

        return [
            'completed_referrals' => $completedReferrals,
            'avg_treatment_time_days' => round($avgTreatmentTime, 1),
            'follow_up_required' => $followUpRequired,
            'follow_up_completed' => $followUpCompleted,
            'follow_up_compliance_rate' => $followUpRequired > 0
                ? round(($followUpCompleted / $followUpRequired) * 100, 1)
                : 0,
        ];
    }

    /**
     * Calculate productivity score
     */
    private function calculateProductivityScore(int $validatedCount, float $avgTime): int
    {
        // Score based on volume and speed
        $volumeScore = min($validatedCount * 2, 50); // Max 50 points
        $speedScore = $avgTime > 0 ? min((24 / $avgTime) * 50, 50) : 0; // Max 50 points

        return (int) round($volumeScore + $speedScore);
    }
}
