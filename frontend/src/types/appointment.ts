/**
 * Appointment-related TypeScript type definitions for Juan Heart Web Application
 */

export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'checked_in'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show'
  | 'rescheduled';

export type AppointmentType =
  | 'consultation'
  | 'follow_up'
  | 'procedure'
  | 'emergency'
  | 'telemedicine'
  | 'screening'
  | 'other';

export type BookingSource = 'web' | 'mobile' | 'phone' | 'walk_in';

export interface Appointment {
  id: number;
  mobile_appointment_id?: string;
  referral_id?: number;
  assessment_id?: number;
  patient_first_name: string;
  patient_last_name: string;
  patient_email?: string;
  patient_phone: string;
  patient_date_of_birth?: string;
  facility_id?: number;
  doctor_id?: number;
  appointment_datetime: string;
  duration_minutes: number;
  appointment_type: AppointmentType;
  department?: string;
  reason_for_visit: string;
  special_requirements?: string;
  status: AppointmentStatus;
  status_notes?: string;
  is_confirmed: boolean;
  confirmed_at?: string;
  confirmation_method?: string;
  checked_in_at?: string;
  checked_in_by?: number;
  completed_at?: string;
  visit_summary?: string;
  next_steps?: string;
  cancelled_at?: string;
  cancelled_by?: number;
  cancellation_reason?: string;
  rescheduled_from?: number;
  rescheduled_at?: string;
  booking_source?: BookingSource;
  from_waiting_list?: boolean;
  waiting_list_position?: number;
  created_at: string;
  updated_at: string;

  // Relationships
  facility?: {
    id: number;
    name: string;
    type: string;
    address: string;
    city: string;
    province: string;
  };
  doctor?: {
    id: number;
    first_name: string;
    last_name: string;
    specialization?: string;
  };
  assessment?: {
    id: number;
    assessment_external_id: string;
    final_risk_level: string;
  };
  referral?: {
    id: number;
    referral_number: string;
  };

  // Computed attributes
  patient_full_name?: string;
  time_until_appointment?: string;
}

export interface AppointmentStatistics {
  total_appointments: number;
  today_appointments: number;
  confirmed_appointments: number;
  pending_appointments: number;
  completed_appointments: number;
  cancelled_appointments: number;
  upcoming_appointments: number;
  mobile_bookings: number;
}

export interface AppointmentFilters {
  page?: number;
  per_page?: number;
  search?: string;
  status?: AppointmentStatus;
  booking_source?: BookingSource;
  appointment_type?: AppointmentType;
  facility_id?: number;
  doctor_id?: number;
  date_from?: string;
  date_to?: string;
  sort_by?: 'appointment_datetime' | 'patient_first_name' | 'patient_last_name' | 'created_at';
  sort_order?: 'asc' | 'desc';
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface AppointmentListResponse {
  success: boolean;
  data: {
    data: Appointment[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
  timestamp: string;
}

export interface AppointmentDetailResponse {
  success: boolean;
  data: Appointment;
  timestamp: string;
}

export interface AppointmentActionResponse {
  success: boolean;
  message: string;
  data: Appointment;
  timestamp: string;
}
