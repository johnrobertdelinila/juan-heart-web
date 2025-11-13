/**
 * Assessment-related TypeScript type definitions for Juan Heart Web Application
 */

export type AssessmentStatus =
  | 'pending'
  | 'in_review'
  | 'validated'
  | 'requires_referral'
  | 'completed'
  | 'rejected';

export type RiskLevel = 'Low' | 'Moderate' | 'High';

export type Urgency = 'Routine' | 'Urgent' | 'Emergency';

export interface Assessment {
  id: number;
  mobile_user_id: string;
  session_id: string;
  assessment_external_id: string;

  // Patient information
  patient_first_name: string;
  patient_last_name: string;
  patient_date_of_birth: string;
  patient_sex: 'Male' | 'Female' | 'Other';
  patient_email?: string;
  patient_phone?: string;

  // Assessment metadata
  assessment_date: string;
  version: string;
  algorithm_version?: string;
  completion_rate: number;
  assessment_duration_minutes?: number;
  data_quality_score?: number;

  // Location
  country: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;

  // Risk scores
  ml_risk_score?: number;
  ml_risk_level?: string;
  rule_based_score?: number;
  rule_based_level?: string;
  final_risk_score?: number;
  final_risk_level: RiskLevel;
  urgency?: Urgency;
  recommended_action?: string;

  // JSON data fields
  vital_signs?: VitalSigns;
  symptoms?: Symptoms;
  medical_history?: MedicalHistory;
  medications?: Medication[];
  lifestyle?: Lifestyle;
  recommendations?: Recommendation[];

  // Validation
  status: AssessmentStatus;
  validated_by?: number;
  validated_at?: string;
  validation_notes?: string;
  validation_agrees_with_ml?: boolean;

  // Device information
  device_platform?: string;
  device_version?: string;
  app_version?: string;
  device_language?: string;
  timezone?: string;

  // Technical metadata
  model_version?: string;
  model_confidence?: number;
  processing_time_ms?: number;
  data_completeness_score?: number;

  // Timestamps
  mobile_created_at?: string;
  synced_at?: string;
  created_at: string;
  updated_at: string;

  // Relationships
  validator?: {
    id: number;
    first_name: string;
    last_name: string;
  };
  clinicalValidations?: ClinicalValidation[];
  referrals?: AssessmentReferral[];
  comments?: AssessmentComment[];
  attachments?: AssessmentAttachment[];
}

// Vital Signs structure
export interface VitalSigns {
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  heart_rate?: number;
  respiratory_rate?: number;
  temperature?: number;
  oxygen_saturation?: number;
  weight?: number;
  height?: number;
  bmi?: number;
}

// Symptoms structure
export interface Symptoms {
  chest_pain?: boolean;
  shortness_of_breath?: boolean;
  fatigue?: boolean;
  palpitations?: boolean;
  dizziness?: boolean;
  swelling?: boolean;
  other_symptoms?: string[];
  severity?: Record<string, number>;
  duration?: Record<string, string>;
}

// Medical History structure
export interface MedicalHistory {
  previous_heart_disease?: boolean;
  diabetes?: boolean;
  hypertension?: boolean;
  high_cholesterol?: boolean;
  stroke?: boolean;
  family_history?: string[];
  surgeries?: string[];
  chronic_conditions?: string[];
}

// Medication structure
export interface Medication {
  name: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
}

// Lifestyle structure
export interface Lifestyle {
  smoking?: boolean;
  smoking_frequency?: string;
  alcohol?: boolean;
  alcohol_frequency?: string;
  exercise?: boolean;
  exercise_frequency?: string;
  diet?: string;
  stress_level?: number;
  sleep_hours?: number;
}

// Recommendation structure
export interface Recommendation {
  type: string;
  priority: 'High' | 'Medium' | 'Low';
  description: string;
  action?: string;
}

// Clinical Validation
export interface ClinicalValidation {
  id: number;
  assessment_id: number;
  validator_id: number;
  validated_risk_score: number;
  validated_risk_level: RiskLevel;
  validation_notes?: string;
  validation_agrees_with_ml: boolean;
  created_at: string;
  validator?: {
    first_name: string;
    last_name: string;
  };
}

// Assessment Referral
export interface AssessmentReferral {
  id: number;
  referral_number: string;
  status: string;
  facility?: {
    name: string;
  };
}

// Assessment Comment
export interface AssessmentComment {
  id: number;
  comment: string;
  created_at: string;
  comment_type?: string;
  visibility?: 'private' | 'internal' | 'shared';
  parent_id?: number | null;
  is_resolved?: boolean;
  user?: {
    first_name: string;
    last_name: string;
  };
  attachments?: AssessmentAttachment[];
}

// Assessment Attachment
export interface AssessmentAttachment {
  id: number;
  file_name?: string;
  filename?: string;
  file_type?: string;
  mime_type?: string;
  file_size: number;
  created_at?: string;
  url?: string;
  is_image?: boolean;
  is_pdf?: boolean;
  description?: string;
}

// Validation request
export interface ValidateAssessmentRequest {
  validated_risk_score: number; // 0-100
  validation_notes?: string; // Optional notes
  validation_agrees_with_ml: boolean; // Does clinical assessment agree with ML?
}

export interface RejectAssessmentRequest {
  reason: string;
  notify_mobile_user?: boolean;
}

export interface ClinicalNoteVersion {
  id: number;
  version: number;
  content: string;
  visibility: 'private' | 'internal' | 'shared';
  created_at: string | null;
  author?: {
    first_name: string;
    last_name: string;
  } | null;
  attachments: AssessmentAttachment[];
}

export interface ClinicalNote {
  id: number;
  current_version: number;
  latest_content: string | null;
  visibility: 'private' | 'internal' | 'shared' | string;
  mobile_visible: boolean;
  created_at: string | null;
  author?: {
    first_name: string;
    last_name: string;
  } | null;
  versions: ClinicalNoteVersion[];
}

export interface ClinicalNotesResponse {
  success: boolean;
  data: ClinicalNote[];
  timestamp: string;
}

export interface ClinicalNoteActionResponse {
  success: boolean;
  message: string;
  data: ClinicalNote;
  timestamp: string;
}

export interface RiskAdjustment {
  id: number;
  old_score?: number | null;
  old_level?: string | null;
  new_score: number;
  new_level: string;
  difference?: number | null;
  justification: string;
  alert_triggered: boolean;
  created_at: string | null;
  clinician?: {
    first_name: string;
    last_name: string;
  } | null;
}

export interface RiskAdjustmentListResponse {
  success: boolean;
  data: RiskAdjustment[];
  timestamp: string;
}

export interface RiskAdjustmentActionResponse {
  success: boolean;
  message: string;
  data: {
    assessment: Assessment;
    adjustment: RiskAdjustment;
  };
  timestamp: string;
}

export interface AdjustRiskScoreRequest {
  new_risk_score: number;
  justification: string;
}

// Statistics
export interface AssessmentStatistics {
  total_assessments: number;
  pending_assessments: number;
  validated_assessments: number;
  high_risk_count: number;
  moderate_risk_count: number;
  low_risk_count: number;
  average_risk_score: number;
  average_ml_score: number;
  today_count: number;
  this_week_count: number;
  this_month_count: number;
}

// API Response types
export interface AssessmentListResponse {
  success: boolean;
  data: Assessment[];
  timestamp: string;
}

export interface AssessmentDetailResponse {
  success: boolean;
  data: Assessment;
  timestamp: string;
}

export interface AssessmentActionResponse {
  success: boolean;
  message: string;
  data: Assessment;
  timestamp: string;
}

export interface AssessmentStatisticsResponse {
  success: boolean;
  data: AssessmentStatistics;
  timestamp: string;
}

// Comparison types
export type DifferenceType = 'increase' | 'decrease' | 'changed' | 'none' | 'missing';

export interface ComparisonResult<T> {
  aiValue: T;
  clinicalValue: T;
  isDifferent: boolean;
  differenceType: DifferenceType;
  percentageDiff?: number;
  absoluteDiff?: number;
}

export interface ComparisonFieldProps {
  label: string;
  aiValue: string | number | null;
  clinicalValue: string | number | null;
  unit?: string;
  isDifferent?: boolean;
  differenceType?: DifferenceType;
  absoluteDiff?: number;
  percentageDiff?: number;
}

export interface VitalSignsComparison {
  bloodPressure: ComparisonResult<string | null>;
  heartRate: ComparisonResult<number | null>;
  oxygenSaturation: ComparisonResult<number | null>;
  temperature: ComparisonResult<number | null>;
  bmi: ComparisonResult<number | null>;
}

export interface SymptomsComparison {
  chestPain: ComparisonResult<boolean | null>;
  shortnessOfBreath: ComparisonResult<boolean | null>;
  fatigue: ComparisonResult<boolean | null>;
  palpitations: ComparisonResult<boolean | null>;
  dizziness: ComparisonResult<boolean | null>;
  swelling: ComparisonResult<boolean | null>;
  otherSymptoms: ComparisonResult<string[] | null>;
}

export interface MedicalHistoryComparison {
  previousHeartDisease: ComparisonResult<boolean | null>;
  diabetes: ComparisonResult<boolean | null>;
  hypertension: ComparisonResult<boolean | null>;
  highCholesterol: ComparisonResult<boolean | null>;
  stroke: ComparisonResult<boolean | null>;
  familyHistory: ComparisonResult<string[] | null>;
  surgeries: ComparisonResult<string[] | null>;
  chronicConditions: ComparisonResult<string[] | null>;
}

export interface MedicationsComparison {
  medications: ComparisonResult<Medication[] | null>;
}

export interface LifestyleComparison {
  smoking: ComparisonResult<boolean | null>;
  smokingFrequency: ComparisonResult<string | null>;
  alcohol: ComparisonResult<boolean | null>;
  alcoholFrequency: ComparisonResult<string | null>;
  exercise: ComparisonResult<boolean | null>;
  exerciseFrequency: ComparisonResult<string | null>;
  diet: ComparisonResult<string | null>;
  stressLevel: ComparisonResult<number | null>;
  sleepHours: ComparisonResult<number | null>;
}

export interface AssessmentComparison {
  riskScore: ComparisonResult<number | null>;
  riskLevel: ComparisonResult<string | null>;
  urgency: ComparisonResult<string | null>;
  recommendation: ComparisonResult<string | null>;
  vitalSigns: VitalSignsComparison;
  symptoms: SymptomsComparison;
  medicalHistory: MedicalHistoryComparison;
  medications: MedicationsComparison;
  lifestyle: LifestyleComparison;
  totalDifferences: number;
  totalFields: number;
}
