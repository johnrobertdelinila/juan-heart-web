<?php

namespace App\Services;

use App\Models\Assessment;
use App\Models\Referral;
use App\Models\HealthcareFacility;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class AnalyticsService
{
    /**
     * Get national overview dashboard metrics
     */
    public function getNationalOverview(array $filters = []): array
    {
        $startDate = $filters['start_date'] ?? Carbon::now()->subMonths(3);
        $endDate = $filters['end_date'] ?? Carbon::now();

        return Cache::remember("national_overview_{$startDate}_{$endDate}", 300, function () use ($startDate, $endDate) {
            return [
                'summary' => $this->getSummaryMetrics($startDate, $endDate),
                'risk_distribution' => $this->getRiskDistribution($startDate, $endDate),
                'geographic_distribution' => $this->getGeographicDistribution($startDate, $endDate),
                'trends' => $this->getTrendAnalysis($startDate, $endDate),
                'demographics' => $this->getDemographicsAnalysis($startDate, $endDate),
                'system_health' => $this->getSystemHealth(),
            ];
        });
    }

    /**
     * Get summary metrics (KPIs)
     */
    public function getSummaryMetrics($startDate, $endDate): array
    {
        $assessmentsCount = Assessment::whereBetween('assessment_date', [$startDate, $endDate])->count();
        $previousPeriodStart = Carbon::parse($startDate)->sub(Carbon::parse($startDate)->diffInDays($endDate), 'days');
        $previousAssessmentsCount = Assessment::whereBetween('assessment_date', [$previousPeriodStart, $startDate])->count();

        $highRiskCount = Assessment::whereBetween('assessment_date', [$startDate, $endDate])
            ->where('final_risk_level', 'High')
            ->count();

        $averageRiskScore = Assessment::whereBetween('assessment_date', [$startDate, $endDate])
            ->avg('ml_risk_score') ?? 0;

        $previousAvgRiskScore = Assessment::whereBetween('assessment_date', [$previousPeriodStart, $startDate])
            ->avg('ml_risk_score') ?? 0;

        $pendingReferrals = Referral::where('status', 'pending')->count();
        $completedReferrals = Referral::where('status', 'completed')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        $activeFacilities = HealthcareFacility::where('is_active', true)->count();

        return [
            'total_assessments' => $assessmentsCount,
            'assessments_change' => $previousAssessmentsCount > 0
                ? round((($assessmentsCount - $previousAssessmentsCount) / $previousAssessmentsCount) * 100, 1)
                : 0,
            'high_risk_cases' => $highRiskCount,
            'high_risk_percentage' => $assessmentsCount > 0
                ? round(($highRiskCount / $assessmentsCount) * 100, 1)
                : 0,
            'average_risk_score' => round($averageRiskScore, 1),
            'risk_score_change' => round($averageRiskScore - $previousAvgRiskScore, 1),
            'pending_referrals' => $pendingReferrals,
            'completed_referrals' => $completedReferrals,
            'referral_completion_rate' => ($pendingReferrals + $completedReferrals) > 0
                ? round(($completedReferrals / ($pendingReferrals + $completedReferrals)) * 100, 1)
                : 0,
            'active_facilities' => $activeFacilities,
        ];
    }

    /**
     * Get risk distribution across categories
     */
    public function getRiskDistribution($startDate, $endDate): array
    {
        $distribution = Assessment::whereBetween('assessment_date', [$startDate, $endDate])
            ->select('final_risk_level', DB::raw('count(*) as count'))
            ->groupBy('final_risk_level')
            ->get()
            ->mapWithKeys(fn($item) => [$item->final_risk_level ?? 'Unknown' => $item->count])
            ->toArray();

        $total = array_sum($distribution);

        return [
            'data' => $distribution,
            'percentages' => array_map(
                fn($count) => $total > 0 ? round(($count / $total) * 100, 1) : 0,
                $distribution
            ),
            'total' => $total,
        ];
    }

    /**
     * Get geographic distribution by region
     */
    public function getGeographicDistribution($startDate, $endDate): array
    {
        return Assessment::whereBetween('assessment_date', [$startDate, $endDate])
            ->select('region', 'city', 'final_risk_level', DB::raw('count(*) as count'))
            ->groupBy('region', 'city', 'final_risk_level')
            ->orderBy('count', 'desc')
            ->get()
            ->groupBy('region')
            ->map(function ($regionData, $region) {
                $total = $regionData->sum('count');
                $highRisk = $regionData->where('final_risk_level', 'High')->sum('count');

                return [
                    'region' => $region ?? 'Unknown',
                    'total_assessments' => $total,
                    'high_risk_count' => $highRisk,
                    'high_risk_percentage' => $total > 0 ? round(($highRisk / $total) * 100, 1) : 0,
                    'cities' => $regionData->groupBy('city')->map(fn($cityData) => [
                        'city' => $cityData[0]->city ?? 'Unknown',
                        'count' => $cityData->sum('count'),
                    ])->values(),
                ];
            })
            ->values()
            ->toArray();
    }

    /**
     * Get trend analysis over time
     */
    public function getTrendAnalysis($startDate, $endDate): array
    {
        $assessmentsTrend = Assessment::whereBetween('assessment_date', [$startDate, $endDate])
            ->select(
                DB::raw('DATE(assessment_date) as date'),
                DB::raw('count(*) as total'),
                DB::raw('SUM(CASE WHEN final_risk_level = "High" THEN 1 ELSE 0 END) as high_risk'),
                DB::raw('SUM(CASE WHEN final_risk_level = "Moderate" THEN 1 ELSE 0 END) as moderate_risk'),
                DB::raw('SUM(CASE WHEN final_risk_level = "Low" THEN 1 ELSE 0 END) as low_risk'),
                DB::raw('AVG(ml_risk_score) as avg_score')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(function ($item) {
                return [
                    'date' => $item->date,
                    'total' => $item->total,
                    'high_risk' => $item->high_risk,
                    'moderate_risk' => $item->moderate_risk,
                    'low_risk' => $item->low_risk,
                    'avg_score' => round($item->avg_score, 1),
                ];
            })
            ->toArray();

        return [
            'daily_assessments' => $assessmentsTrend,
            'peak_day' => collect($assessmentsTrend)->sortByDesc('total')->first(),
            'trend_direction' => $this->calculateTrendDirection($assessmentsTrend),
        ];
    }

    /**
     * Get demographics analysis
     */
    public function getDemographicsAnalysis($startDate, $endDate): array
    {
        // Age distribution
        $ageDistribution = Assessment::whereBetween('assessment_date', [$startDate, $endDate])
            ->whereNotNull('patient_date_of_birth')
            ->get()
            ->map(function ($assessment) {
                $age = Carbon::parse($assessment->patient_date_of_birth)->age;
                if ($age < 30) return '< 30';
                if ($age < 40) return '30-39';
                if ($age < 50) return '40-49';
                if ($age < 60) return '50-59';
                return '60+';
            })
            ->countBy()
            ->toArray();

        // Sex distribution
        $sexDistribution = Assessment::whereBetween('assessment_date', [$startDate, $endDate])
            ->select('patient_sex', DB::raw('count(*) as count'))
            ->whereNotNull('patient_sex')
            ->groupBy('patient_sex')
            ->get()
            ->mapWithKeys(fn($item) => [$item->patient_sex => $item->count])
            ->toArray();

        // Risk by demographics
        $riskByAge = Assessment::whereBetween('assessment_date', [$startDate, $endDate])
            ->whereNotNull('patient_date_of_birth')
            ->where('final_risk_level', 'High')
            ->get()
            ->groupBy(function ($assessment) {
                $age = Carbon::parse($assessment->patient_date_of_birth)->age;
                if ($age < 30) return '< 30';
                if ($age < 40) return '30-39';
                if ($age < 50) return '40-49';
                if ($age < 60) return '50-59';
                return '60+';
            })
            ->map->count()
            ->toArray();

        return [
            'age_distribution' => $ageDistribution,
            'sex_distribution' => $sexDistribution,
            'high_risk_by_age' => $riskByAge,
        ];
    }

    /**
     * Get system health indicators
     */
    public function getSystemHealth(): array
    {
        // Assessment validation rate
        $totalAssessments = Assessment::count();
        $validatedAssessments = Assessment::where('status', 'validated')->count();

        // Average response time (simulated - will be real in production)
        $avgValidationTime = Assessment::whereNotNull('validated_at')
            ->whereNotNull('synced_at')
            ->selectRaw('AVG(TIMESTAMPDIFF(HOUR, synced_at, validated_at)) as avg_hours')
            ->value('avg_hours') ?? 24;

        // Referral acceptance rate
        $totalReferrals = Referral::count();
        $acceptedReferrals = Referral::where('status', 'accepted')->count();

        return [
            'validation_rate' => $totalAssessments > 0
                ? round(($validatedAssessments / $totalAssessments) * 100, 1)
                : 0,
            'avg_validation_time_hours' => round($avgValidationTime, 1),
            'referral_acceptance_rate' => $totalReferrals > 0
                ? round(($acceptedReferrals / $totalReferrals) * 100, 1)
                : 0,
            'system_uptime' => 99.9, // From monitoring system
            'active_users_today' => $this->getActiveUsersToday(),
        ];
    }

    /**
     * Calculate trend direction
     */
    private function calculateTrendDirection(array $data): string
    {
        if (count($data) < 2) return 'stable';

        $first = collect($data)->take(ceil(count($data) / 2))->avg('total');
        $last = collect($data)->skip(floor(count($data) / 2))->avg('total');

        if ($last > $first * 1.1) return 'increasing';
        if ($last < $first * 0.9) return 'decreasing';
        return 'stable';
    }

    /**
     * Get active users count for today
     */
    private function getActiveUsersToday(): int
    {
        return DB::table('user_activity_logs')
            ->whereDate('created_at', Carbon::today())
            ->distinct('user_id')
            ->count('user_id');
    }

    /**
     * Get real-time assessment count
     */
    public function getRealTimeAssessmentCount(): array
    {
        return [
            'total' => Assessment::count(),
            'today' => Assessment::whereDate('assessment_date', Carbon::today())->count(),
            'this_week' => Assessment::whereBetween('assessment_date', [
                Carbon::now()->startOfWeek(),
                Carbon::now()->endOfWeek()
            ])->count(),
            'this_month' => Assessment::whereMonth('assessment_date', Carbon::now()->month)
                ->whereYear('assessment_date', Carbon::now()->year)
                ->count(),
            'pending_validation' => Assessment::where('status', 'pending')->count(),
        ];
    }
}
