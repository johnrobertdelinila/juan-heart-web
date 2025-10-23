// Clinical Dashboard Types

export interface AssessmentQueueItem {
  id: number;
  assessment_code: string;
  patient_name: string;
  patient_age: number | null;
  patient_sex: string;
  risk_level: string;
  ml_score: number;
  assessment_date: string;
  days_pending: number;
  priority: string;
  chief_complaint: string | null;
}

export interface AssessmentQueueSummary {
  total_pending: number;
  high_risk_pending: number;
  urgent_count: number;
  avg_wait_time_hours: number;
}

export interface AssessmentQueue {
  assessments: AssessmentQueueItem[];
  summary: AssessmentQueueSummary;
}

export interface RiskDistribution {
  [key: string]: number;
}

export interface RiskTrend {
  date: string;
  high_risk: number;
  moderate_risk: number;
  low_risk: number;
}

export interface HighRiskPatient {
  id: number;
  patient_name: string;
  age: number | null;
  risk_score: number;
  days_pending: number;
}

export interface PatientRiskStratification {
  risk_distribution: RiskDistribution;
  risk_trends: RiskTrend[];
  high_risk_patients: HighRiskPatient[];
}

export interface ClinicalAlert {
  type: 'critical' | 'urgent' | 'warning' | 'info';
  title: string;
  message: string;
  count: number;
  action: string;
}

export interface WorkloadMetrics {
  total_validated: number;
  avg_validation_time_hours: number;
  today_validated: number;
  today_pending: number;
  weekly_trend: Array<{
    date: string;
    count: number;
  }>;
  productivity_score: number;
}

export interface ValidationMetrics {
  total_validations: number;
  agreement_distribution: {
    [key: string]: number;
  };
  ml_agreement_rate: number;
  avg_score_adjustment: number;
  adjustment_range: {
    min: number;
    max: number;
  };
}

export interface TreatmentOutcomes {
  completed_referrals: number;
  avg_treatment_time_days: number;
  follow_up_required: number;
  follow_up_completed: number;
  follow_up_compliance_rate: number;
}

export interface ClinicalDashboard {
  assessment_queue: AssessmentQueue;
  patient_risk_stratification: PatientRiskStratification;
  clinical_alerts: ClinicalAlert[];
  workload_metrics: WorkloadMetrics;
  validation_metrics: ValidationMetrics;
  treatment_outcomes: TreatmentOutcomes;
}

export interface ClinicalApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}
