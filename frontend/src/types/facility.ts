// Facility Analytics Types

export interface Facility {
  id: number;
  name: string;
  code: string;
  type: string;
  level: string;
  address: string;
  city: string;
  province: string;
  region: string;
  phone: string;
  email: string;
  website?: string;
  latitude: number;
  longitude: number;
  is_24_7: boolean;
  has_emergency: boolean;
  services: string[];
  bed_capacity: number;
  icu_capacity: number;
  current_bed_availability: number;
  is_active: boolean;
}

export interface FacilitySummary {
  facility_name: string;
  facility_type: string;
  assessments_processed: number;
  active_patients: number;
  pending_referrals: number;
  avg_response_time_hours: number;
  bed_capacity: number;
  available_beds: number;
  bed_occupancy_percentage: number | null;
}

export interface DailyFlow {
  date: string;
  total_referrals: number;
  accepted: number;
  rejected: number;
  pending: number;
}

export interface PatientFlowMetrics {
  daily_flow: DailyFlow[];
  total_referrals_received: number;
  admitted_patients: number;
  admission_rate: number;
  peak_day: DailyFlow | null;
}

export interface ResponseTimeByPriority {
  priority: string;
  avg_response_hours: number;
  count: number;
}

export interface ReferralSource {
  name: string;
  count: number;
}

export interface ReferralMetrics {
  total_referrals: number;
  accepted_referrals: number;
  rejected_referrals: number;
  acceptance_rate: number;
  rejection_rate: number;
  response_time_by_priority: ResponseTimeByPriority[];
  top_referral_sources: ReferralSource[];
}

export interface CapacityUtilization {
  bed_capacity: number;
  available_beds: number;
  occupied_beds: number;
  occupancy_percentage: number;
  icu_capacity: number;
  icu_occupancy_percentage: number;
  staff_count: number;
  active_patients: number;
  patients_per_staff: number;
  utilization_trend: string;
}

export interface DoctorProductivity {
  doctor_id: number;
  doctor_name: string;
  validations_count: number;
  avg_validation_hours: number;
}

export interface StaffProductivity {
  doctor_productivity: DoctorProductivity[];
  total_validations: number;
  avg_validations_per_doctor: number;
  top_performer: DoctorProductivity | null;
}

export interface PerformanceComparison {
  acceptance_rate: {
    this_facility: number;
    average_for_type: number;
    rank: number;
    total_facilities: number;
  };
  avg_response_time: {
    this_facility: number;
    average_for_type: number;
  };
  facility_type: string;
}

export interface RevenueAnalytics {
  total_revenue: number;
  revenue_by_service: any[];
  revenue_trend: any[];
  average_revenue_per_patient: number;
  note: string;
}

export interface FacilityDashboard {
  summary: FacilitySummary;
  patient_flow: PatientFlowMetrics;
  referral_metrics: ReferralMetrics;
  capacity_utilization: CapacityUtilization;
  staff_productivity: StaffProductivity;
  performance_comparison: PerformanceComparison;
}

export interface FacilityApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}
