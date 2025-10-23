// Referral Management Types

export type ReferralStatus =
  | 'pending'
  | 'accepted'
  | 'in_transit'
  | 'arrived'
  | 'in_progress'
  | 'completed'
  | 'rejected'
  | 'cancelled';

export type ReferralPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export type ReferralUrgency = 'Routine' | 'Urgent' | 'Emergency';

export type TransportMethod = 'Ambulance' | 'Private' | 'Public' | 'Walk-in' | 'Other';

export type Outcome = 'Improved' | 'Stable' | 'Deteriorated' | 'Deceased' | 'Unknown';

export type HistoryAction =
  | 'created'
  | 'assigned'
  | 'accepted'
  | 'rejected'
  | 'scheduled'
  | 'rescheduled'
  | 'completed'
  | 'cancelled'
  | 'escalated'
  | 'status_changed'
  | 'priority_changed'
  | 'notes_added'
  | 'attachment_added';

export interface Facility {
  id: number;
  name: string;
  code: string;
  facility_type: string;
  facility_level: string;
  address: string;
  city: string;
  province: string;
  region: string;
  phone: string | null;
  email: string | null;
}

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  specialization: string | null;
  license_no: string | null;
}

export interface Assessment {
  id: number;
  assessment_type: string;
  ml_score: number;
  final_risk_level: string;
  vital_signs: Record<string, any> | null;
  symptoms: Record<string, any> | null;
  created_at: string;
}

export interface ReferralHistory {
  id: number;
  referral_id: number;
  user_id: number | null;
  user: User | null;
  action: HistoryAction;
  action_description: string;
  previous_status: ReferralStatus | null;
  new_status: ReferralStatus | null;
  notes: string | null;
  metadata: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface Referral {
  id: number;
  assessment_id: number;
  assessment?: Assessment;

  // Patient information
  patient_first_name: string;
  patient_last_name: string;
  patient_full_name: string;
  patient_date_of_birth: string | null;
  patient_sex: 'Male' | 'Female' | 'Other' | null;
  patient_phone: string | null;

  // Facilities and staff
  source_facility_id: number | null;
  source_facility?: Facility | null;
  target_facility_id: number;
  target_facility?: Facility;
  referring_user_id: number | null;
  referring_user?: User | null;
  assigned_doctor_id: number | null;
  assigned_doctor?: User | null;

  // Referral details
  priority: ReferralPriority;
  urgency: ReferralUrgency;
  referral_type: string | null;
  chief_complaint: string | null;
  clinical_notes: string | null;
  required_services: string[] | null;

  // Status tracking
  status: ReferralStatus;
  status_notes: string | null;
  accepted_at: string | null;
  arrived_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;

  // Appointment
  scheduled_appointment: string | null;
  appointment_notes: string | null;

  // Transportation
  transport_method: TransportMethod | null;
  transport_notes: string | null;
  estimated_travel_time_minutes: number | null;

  // Documents
  referral_letter_path: string | null;
  attached_documents: string[] | null;
  records_transferred: boolean;

  // Follow-up
  requires_follow_up: boolean;
  follow_up_date: string | null;
  follow_up_notes: string | null;

  // Outcome
  treatment_summary: string | null;
  diagnosis: string | null;
  recommendations: string | null;
  outcome: Outcome | null;

  // Timestamps
  created_at: string;
  updated_at: string;
  deleted_at: string | null;

  // Computed fields
  time_since_created: string | null;
  is_pending: boolean;
  is_accepted: boolean;
  is_completed: boolean;
  is_critical: boolean;
  is_emergency: boolean;
  is_overdue: boolean;

  // History
  history?: ReferralHistory[];
}

export interface ReferralStatistics {
  total_referrals: number;
  pending: number;
  accepted: number;
  completed: number;
  rejected: number;
  acceptance_rate: number;
  avg_response_time_hours: number;
  critical_pending: number;
}

export interface PaginatedReferrals {
  data: Referral[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

// Request types
export interface CreateReferralRequest {
  assessment_id: number;
  target_facility_id?: number;
  source_facility_id?: number;
  priority?: ReferralPriority;
  urgency?: ReferralUrgency;
  referral_type?: string;
  chief_complaint?: string;
  clinical_notes?: string;
  required_services?: string[];
  patient_first_name?: string;
  patient_last_name?: string;
  patient_date_of_birth?: string;
  patient_sex?: 'Male' | 'Female' | 'Other';
  patient_phone?: string;
}

export interface AcceptReferralRequest {
  assigned_doctor_id?: number;
  notes?: string;
  scheduled_appointment?: string;
  appointment_notes?: string;
}

export interface RejectReferralRequest {
  reason: string;
  suggested_facilities?: Array<{
    id: number;
    name: string;
  }>;
}

export interface UpdateStatusRequest {
  status: ReferralStatus;
  notes?: string;
}

export interface ScheduleAppointmentRequest {
  appointment_datetime: string;
  assigned_doctor_id?: number;
  notes?: string;
}

export interface CompleteReferralRequest {
  treatment_summary?: string;
  diagnosis?: string;
  recommendations?: string;
  outcome?: Outcome;
  requires_follow_up?: boolean;
  follow_up_date?: string;
  follow_up_notes?: string;
}

export interface EscalateReferralRequest {
  priority: 'Medium' | 'High' | 'Critical';
  reason: string;
}

export interface ReferralFilters {
  status?: ReferralStatus;
  priority?: ReferralPriority;
  urgency?: ReferralUrgency;
  target_facility_id?: number;
  source_facility_id?: number;
  assigned_doctor_id?: number;
  search?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: 'created_at' | 'priority' | 'urgency' | 'scheduled_appointment';
  sort_order?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}

// Response types
export interface ReferralResponse {
  success: boolean;
  message?: string;
  data: Referral;
  timestamp: string;
}

export interface ReferralsResponse {
  success: boolean;
  data: PaginatedReferrals;
  timestamp: string;
}

export interface StatisticsResponse {
  success: boolean;
  data: ReferralStatistics;
  timestamp: string;
}

export interface ApiError {
  success: false;
  message: string;
  error?: string;
  errors?: Record<string, string[]>;
}
