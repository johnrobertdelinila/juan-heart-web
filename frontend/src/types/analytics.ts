/**
 * Analytics Type Definitions
 * Types for the National Overview Dashboard and analytics features
 */

export interface SummaryMetrics {
  total_assessments: number;
  assessments_change: number;
  high_risk_cases: number;
  high_risk_percentage: number;
  average_risk_score: number;
  risk_score_change: number;
  pending_referrals: number;
  completed_referrals: number;
  referral_completion_rate: number;
  active_facilities: number;
}

export interface RiskDistribution {
  data: {
    [key: string]: number; // e.g., { "High": 150, "Moderate": 300, "Low": 450 }
  };
  percentages: {
    [key: string]: number; // e.g., { "High": 16.7, "Moderate": 33.3, "Low": 50.0 }
  };
  total: number;
}

export interface GeographicCity {
  city: string;
  count: number;
}

export interface GeographicRegion {
  region: string;
  total_assessments: number;
  high_risk_count: number;
  high_risk_percentage: number;
  cities: GeographicCity[];
}

export interface DailyAssessment {
  date: string;
  total: number;
  high_risk: number;
  moderate_risk: number;
  low_risk: number;
  avg_score: number;
}

export interface TrendAnalysis {
  daily_assessments: DailyAssessment[];
  peak_day: DailyAssessment | null;
  trend_direction: 'increasing' | 'decreasing' | 'stable';
}

export interface DemographicsAnalysis {
  age_distribution: {
    [ageGroup: string]: number; // e.g., { "< 30": 100, "30-39": 250 }
  };
  sex_distribution: {
    [sex: string]: number; // e.g., { "Male": 450, "Female": 550 }
  };
  high_risk_by_age: {
    [ageGroup: string]: number;
  };
}

export interface SystemHealth {
  validation_rate: number;
  avg_validation_time_hours: number;
  referral_acceptance_rate: number;
  system_uptime: number;
  active_users_today: number;
}

export interface NationalOverview {
  summary: SummaryMetrics;
  risk_distribution: RiskDistribution;
  geographic_distribution: GeographicRegion[];
  trends: TrendAnalysis;
  demographics: DemographicsAnalysis;
  system_health: SystemHealth;
}

export interface RealTimeMetrics {
  total: number;
  today: number;
  this_week: number;
  this_month: number;
  pending_validation: number;
}

export interface AnalyticsFilters {
  start_date?: string;
  end_date?: string;
}

export interface AnalyticsResponse<T> {
  success: boolean;
  data: T;
  filters?: AnalyticsFilters;
  timestamp?: string;
}
