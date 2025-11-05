/**
 * Patient-related TypeScript type definitions for Juan Heart Web Application
 */

export interface Patient {
  id: number;
  patient_first_name: string;
  patient_last_name: string;
  patient_full_name: string;
  patient_date_of_birth: string;
  patient_sex: 'Male' | 'Female';
  last_assessment_date: string;
  latest_risk_level: 'High' | 'Moderate' | 'Low';
  total_assessments: number;
  status: 'Active' | 'Follow-up' | 'Discharged';
  patient_email?: string;
  patient_phone?: string;
}

export interface PatientStatistics {
  total_patients: number;
  active_patients: number;
  follow_up_patients: number;
  high_risk_patients: number;
}

export interface PatientDetail {
  patient: {
    first_name: string;
    last_name: string;
    date_of_birth: string;
    sex: 'Male' | 'Female';
    email?: string;
    phone?: string;
  };
  assessments: Assessment[];
  total_assessments: number;
  latest_assessment: Assessment;
}

export interface Assessment {
  id: number;
  assessment_external_id: string;
  assessment_date: string;
  final_risk_level: 'High' | 'Moderate' | 'Low';
  final_risk_score: number;
  ml_risk_score: number;
  status: string;
  validated_at?: string;
  validated_by?: number;
  validation_notes?: string;
}

export interface PatientListParams {
  page?: number;
  per_page?: number;
  search?: string;
  risk_level?: 'High' | 'Moderate' | 'Low';
  sex?: 'Male' | 'Female';
  sort_by?: 'last_assessment_date' | 'patient_first_name' | 'patient_last_name';
  sort_order?: 'asc' | 'desc';
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface PatientListResponse {
  success: boolean;
  data: Patient[];
  pagination: PaginationMeta;
  timestamp: string;
}

export interface PatientStatisticsResponse {
  success: boolean;
  data: PatientStatistics;
  timestamp: string;
}

export interface PatientDetailResponse {
  success: boolean;
  data: PatientDetail;
  timestamp: string;
}
