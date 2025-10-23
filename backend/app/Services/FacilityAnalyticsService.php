<?php

namespace App\Services;

use App\Models\Assessment;
use App\Models\Referral;
use App\Models\HealthcareFacility;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class FacilityAnalyticsService
{
    /**
     * Check if referrals table exists
     * TODO: Remove this check once Milestone 4 (Referral System) is implemented
     */
    private function referralsTableExists(): bool
    {
        try {
            return DB::select("SHOW TABLES LIKE 'referrals'") ? true : false;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Get facility dashboard metrics
     */
    public function getFacilityDashboard(int $facilityId, array $filters = []): array
    {
        $startDate = $filters['start_date'] ?? Carbon::now()->subMonths(3);
        $endDate = $filters['end_date'] ?? Carbon::now();

        // Try to get real data, fallback to empty data if referral system not implemented
        try {
            return Cache::remember("facility_dashboard_{$facilityId}_{$startDate}_{$endDate}", 300, function () use ($facilityId, $startDate, $endDate) {
                return [
                    'summary' => $this->getFacilitySummary($facilityId, $startDate, $endDate),
                    'patient_flow' => $this->getPatientFlowMetrics($facilityId, $startDate, $endDate),
                    'referral_metrics' => $this->getReferralMetrics($facilityId, $startDate, $endDate),
                    'capacity_utilization' => $this->getCapacityUtilization($facilityId, $startDate, $endDate),
                    'staff_productivity' => $this->getStaffProductivity($facilityId, $startDate, $endDate),
                    'performance_comparison' => $this->getPerformanceComparison($facilityId, $startDate, $endDate),
                ];
            });
        } catch (\Exception $e) {
            // Referral system not fully implemented yet, return empty dashboard
            $facility = HealthcareFacility::findOrFail($facilityId);
            return [
                'summary' => [
                    'facility_name' => $facility->name,
                    'facility_type' => $facility->type,
                    'assessments_processed' => 0,
                    'active_patients' => 0,
                    'pending_referrals' => 0,
                    'avg_response_time_hours' => 0,
                    'bed_capacity' => $facility->bed_capacity ?? 0,
                    'available_beds' => $facility->current_bed_availability ?? 0,
                    'bed_occupancy_percentage' => 0,
                ],
                'patient_flow' => [
                    'daily_flow' => [],
                    'total_referrals_received' => 0,
                    'admitted_patients' => 0,
                    'admission_rate' => 0,
                    'peak_day' => null,
                ],
                'referral_metrics' => [
                    'total_referrals' => 0,
                    'accepted_referrals' => 0,
                    'rejected_referrals' => 0,
                    'acceptance_rate' => 0,
                    'rejection_rate' => 0,
                    'response_time_by_priority' => [],
                    'top_referral_sources' => [],
                ],
                'capacity_utilization' => [
                    'bed_capacity' => $facility->bed_capacity ?? 0,
                    'available_beds' => $facility->current_bed_availability ?? 0,
                    'occupied_beds' => 0,
                    'occupancy_percentage' => 0.0,
                    'icu_capacity' => $facility->icu_capacity ?? 0,
                    'icu_occupancy_percentage' => 0.0,
                    'staff_count' => 0,
                    'active_patients' => 0,
                    'patients_per_staff' => 0.0,
                    'utilization_trend' => 'stable',
                ],
                'staff_productivity' => [
                    'doctor_productivity' => [],
                    'total_validations' => 0,
                    'avg_validations_per_doctor' => 0,
                    'top_performer' => null,
                ],
                'performance_comparison' => [
                    'acceptance_rate' => [
                        'this_facility' => 0,
                        'average_for_type' => 0,
                        'rank' => 1,
                        'total_facilities' => 1,
                    ],
                    'avg_response_time' => [
                        'this_facility' => 0,
                        'average_for_type' => 0,
                    ],
                    'facility_type' => $facility->type,
                ],
            ];
        }
    }

    /**
     * Get facility summary metrics
     */
    public function getFacilitySummary(int $facilityId, $startDate, $endDate): array
    {
        $facility = HealthcareFacility::findOrFail($facilityId);

        // TODO: These queries require referrals table and relationship (Milestone 4)
        // Temporarily returning zero values until referral system is implemented
        $assessmentsProcessed = 0;
        $activePatients = 0;
        $pendingReferrals = 0;
        $avgResponseTime = 0;

        // Bed occupancy - using facility capacity data
        $bedOccupancy = $facility->bed_capacity > 0
            ? round(($facility->current_bed_availability / $facility->bed_capacity) * 100, 1)
            : 0;

        return [
            'facility_name' => $facility->name,
            'facility_type' => $facility->type,
            'assessments_processed' => $assessmentsProcessed,
            'active_patients' => $activePatients,
            'pending_referrals' => $pendingReferrals,
            'avg_response_time_hours' => round($avgResponseTime, 1),
            'bed_capacity' => $facility->bed_capacity,
            'available_beds' => $facility->current_bed_availability,
            'bed_occupancy_percentage' => $bedOccupancy,
        ];
    }

    /**
     * Get patient flow metrics
     */
    public function getPatientFlowMetrics(int $facilityId, $startDate, $endDate): array
    {
        // Daily patient flow
        $dailyFlow = Referral::where('target_facility_id', $facilityId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as total_referrals'),
                DB::raw('SUM(CASE WHEN status = "accepted" THEN 1 ELSE 0 END) as accepted'),
                DB::raw('SUM(CASE WHEN status = "rejected" THEN 1 ELSE 0 END) as rejected'),
                DB::raw('SUM(CASE WHEN status = "pending" THEN 1 ELSE 0 END) as pending')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->toArray();

        // Admission rate
        $totalReferrals = Referral::where('target_facility_id', $facilityId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        $admittedPatients = Referral::where('target_facility_id', $facilityId)
            ->where('status', 'accepted')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        return [
            'daily_flow' => $dailyFlow,
            'total_referrals_received' => $totalReferrals,
            'admitted_patients' => $admittedPatients,
            'admission_rate' => $totalReferrals > 0
                ? round(($admittedPatients / $totalReferrals) * 100, 1)
                : 0,
            'peak_day' => collect($dailyFlow)->sortByDesc('total_referrals')->first(),
        ];
    }

    /**
     * Get referral metrics
     */
    public function getReferralMetrics(int $facilityId, $startDate, $endDate): array
    {
        // Referral acceptance rate
        $totalReferrals = Referral::where('target_facility_id', $facilityId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        $acceptedReferrals = Referral::where('target_facility_id', $facilityId)
            ->where('status', 'accepted')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        $rejectedReferrals = Referral::where('target_facility_id', $facilityId)
            ->where('status', 'rejected')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        // Average response time by priority
        $responseTimeByPriority = Referral::where('target_facility_id', $facilityId)
            ->whereNotNull('accepted_at')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->select(
                'priority',
                DB::raw('AVG(TIMESTAMPDIFF(HOUR, created_at, accepted_at)) as avg_hours'),
                DB::raw('COUNT(*) as count')
            )
            ->groupBy('priority')
            ->get()
            ->map(function ($item) {
                return [
                    'priority' => $item->priority ?? 'Normal',
                    'avg_response_hours' => round($item->avg_hours, 1),
                    'count' => $item->count,
                ];
            })
            ->toArray();

        // Referral sources
        $referralSources = Referral::where('target_facility_id', $facilityId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->join('healthcare_facilities', 'referrals.source_facility_id', '=', 'healthcare_facilities.id')
            ->select('healthcare_facilities.name', DB::raw('COUNT(*) as count'))
            ->groupBy('healthcare_facilities.id', 'healthcare_facilities.name')
            ->orderBy('count', 'desc')
            ->limit(10)
            ->get()
            ->toArray();

        return [
            'total_referrals' => $totalReferrals,
            'accepted_referrals' => $acceptedReferrals,
            'rejected_referrals' => $rejectedReferrals,
            'acceptance_rate' => $totalReferrals > 0
                ? round(($acceptedReferrals / $totalReferrals) * 100, 1)
                : 0,
            'rejection_rate' => $totalReferrals > 0
                ? round(($rejectedReferrals / $totalReferrals) * 100, 1)
                : 0,
            'response_time_by_priority' => $responseTimeByPriority,
            'top_referral_sources' => $referralSources,
        ];
    }

    /**
     * Get capacity utilization metrics
     */
    public function getCapacityUtilization(int $facilityId, $startDate, $endDate): array
    {
        $facility = HealthcareFacility::findOrFail($facilityId);

        // Historical bed occupancy (simulated - should come from daily snapshots in production)
        $avgOccupancy = $facility->getBedOccupancyPercentage() ?? 0.0;

        // ICU utilization
        $icuOccupancy = $facility->icu_capacity > 0
            ? round((($facility->icu_capacity - ($facility->current_bed_availability ?? 0)) / $facility->icu_capacity) * 100, 1)
            : 0.0;

        // Staff utilization (patients per staff member)
        $staffCount = User::where('facility_id', $facilityId)
            ->whereHas('roles', function ($query) {
                $query->whereIn('name', ['Doctor', 'Nurse', 'Cardiologist']);
            })
            ->count();

        $activePatients = Assessment::whereHas('referrals', function ($query) use ($facilityId) {
            $query->where('target_facility_id', $facilityId)
                  ->where('status', 'accepted');
        })
        ->whereBetween('assessment_date', [$startDate, $endDate])
        ->distinct('patient_national_id')
        ->count('patient_national_id');

        $patientsPerStaff = $staffCount > 0 ? round($activePatients / $staffCount, 1) : 0.0;

        return [
            'bed_capacity' => $facility->bed_capacity ?? 0,
            'available_beds' => $facility->current_bed_availability ?? 0,
            'occupied_beds' => ($facility->bed_capacity ?? 0) - ($facility->current_bed_availability ?? 0),
            'occupancy_percentage' => (float) $avgOccupancy,
            'icu_capacity' => $facility->icu_capacity ?? 0,
            'icu_occupancy_percentage' => (float) $icuOccupancy,
            'staff_count' => $staffCount,
            'active_patients' => $activePatients,
            'patients_per_staff' => (float) $patientsPerStaff,
            'utilization_trend' => 'stable', // TODO: Calculate from historical data
        ];
    }

    /**
     * Get staff productivity metrics
     */
    public function getStaffProductivity(int $facilityId, $startDate, $endDate): array
    {
        // Assessments validated per doctor
        $doctorProductivity = Assessment::whereHas('referrals', function ($query) use ($facilityId) {
            $query->where('target_facility_id', $facilityId);
        })
        ->whereNotNull('validated_by')
        ->whereBetween('validated_at', [$startDate, $endDate])
        ->join('users', 'assessments.validated_by', '=', 'users.id')
        ->select(
            'users.id',
            DB::raw('CONCAT(users.first_name, " ", users.last_name) as doctor_name'),
            DB::raw('COUNT(*) as validations_count'),
            DB::raw('AVG(TIMESTAMPDIFF(HOUR, assessments.synced_at, assessments.validated_at)) as avg_validation_hours')
        )
        ->groupBy('users.id', 'doctor_name')
        ->orderBy('validations_count', 'desc')
        ->limit(10)
        ->get()
        ->map(function ($item) {
            return [
                'doctor_id' => $item->id,
                'doctor_name' => $item->doctor_name,
                'validations_count' => $item->validations_count,
                'avg_validation_hours' => round($item->avg_validation_hours, 1),
            ];
        })
        ->toArray();

        // Average validations per doctor
        $totalValidations = collect($doctorProductivity)->sum('validations_count');
        $doctorCount = count($doctorProductivity);
        $avgValidationsPerDoctor = $doctorCount > 0 ? round($totalValidations / $doctorCount, 1) : 0;

        return [
            'doctor_productivity' => $doctorProductivity,
            'total_validations' => $totalValidations,
            'avg_validations_per_doctor' => $avgValidationsPerDoctor,
            'top_performer' => collect($doctorProductivity)->first(),
        ];
    }

    /**
     * Get performance comparison with other facilities
     */
    public function getPerformanceComparison(int $facilityId, $startDate, $endDate): array
    {
        $facility = HealthcareFacility::findOrFail($facilityId);

        // Get all facilities of the same type
        $facilitiesOfSameType = HealthcareFacility::where('type', $facility->type)
            ->where('is_active', true)
            ->pluck('id');

        // Compare acceptance rates
        $acceptanceRates = Referral::whereIn('target_facility_id', $facilitiesOfSameType)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->select(
                'target_facility_id',
                DB::raw('COUNT(*) as total'),
                DB::raw('SUM(CASE WHEN status = "accepted" THEN 1 ELSE 0 END) as accepted')
            )
            ->groupBy('target_facility_id')
            ->get()
            ->map(function ($item) {
                return [
                    'facility_id' => $item->target_facility_id,
                    'acceptance_rate' => $item->total > 0
                        ? round(($item->accepted / $item->total) * 100, 1)
                        : 0,
                ];
            });

        $thisFacilityRate = $acceptanceRates->where('facility_id', $facilityId)->first();
        $avgRate = $acceptanceRates->avg('acceptance_rate');

        // Compare response times
        $responseTimes = Referral::whereIn('target_facility_id', $facilitiesOfSameType)
            ->whereNotNull('accepted_at')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->select(
                'target_facility_id',
                DB::raw('AVG(TIMESTAMPDIFF(HOUR, created_at, accepted_at)) as avg_hours')
            )
            ->groupBy('target_facility_id')
            ->get();

        $thisFacilityTime = $responseTimes->where('target_facility_id', $facilityId)->first();
        $avgTime = $responseTimes->avg('avg_hours');

        return [
            'acceptance_rate' => [
                'this_facility' => $thisFacilityRate['acceptance_rate'] ?? 0,
                'average_for_type' => round($avgRate, 1),
                'rank' => $acceptanceRates->sortByDesc('acceptance_rate')->search(function ($item) use ($facilityId) {
                    return $item['facility_id'] === $facilityId;
                }) + 1,
                'total_facilities' => $acceptanceRates->count(),
            ],
            'avg_response_time' => [
                'this_facility' => $thisFacilityTime ? round($thisFacilityTime->avg_hours, 1) : 0,
                'average_for_type' => round($avgTime, 1),
            ],
            'facility_type' => $facility->type,
        ];
    }

    /**
     * Get facility revenue analytics (placeholder)
     */
    public function getRevenueAnalytics(int $facilityId, $startDate, $endDate): array
    {
        // TODO: Implement when billing/payment system is integrated
        return [
            'total_revenue' => 0,
            'revenue_by_service' => [],
            'revenue_trend' => [],
            'average_revenue_per_patient' => 0,
            'note' => 'Revenue tracking will be available after billing system integration',
        ];
    }
}
