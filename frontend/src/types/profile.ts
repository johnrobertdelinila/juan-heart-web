// User Profile Types for Juan Heart Web Application

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  date_of_birth?: string;
  sex?: 'Male' | 'Female' | 'Other';
  phone?: string;
  license_no?: string;
  specialization?: string;
  position?: string;
  department?: string;
  facility_id?: number;
  language_preference: 'en' | 'fil';
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  last_login_at?: string;
  last_login_ip?: string;
  mfa_enabled: boolean;
  mfa_method?: 'sms' | 'email' | 'authenticator';
  session_timeout_minutes: number;
  bio?: string;
  profile_picture?: string;
  notification_preferences?: NotificationPreferences;
  email_verified_at?: string;
  password_changed_at?: string;
  force_password_change: boolean;
  created_at: string;
  updated_at: string;
  // Relationships
  facility?: Facility;
  roles?: Role[];
  permissions?: Permission[];
  trusted_devices?: TrustedDevice[];
}

export interface NotificationPreferences {
  email?: {
    assessment_assigned?: boolean;
    referral_received?: boolean;
    system_updates?: boolean;
    daily_digest?: boolean;
  };
  sms?: {
    urgent_alerts?: boolean;
    referral_received?: boolean;
  };
  push?: {
    assessment_assigned?: boolean;
    referral_received?: boolean;
    comments?: boolean;
  };
}

export interface Facility {
  id: number;
  name: string;
  code: string;
  type: string;
  level: string;
  address?: string;
  city?: string;
  province?: string;
  region?: string;
  phone?: string;
  email?: string;
  is_active: boolean;
}

export interface Role {
  id: number;
  name: string;
  display_name: string;
  description?: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: number;
  name: string;
  display_name: string;
  description?: string;
  category?: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
}

export interface TrustedDevice {
  id: number;
  user_id: number;
  device_fingerprint: string;
  device_name?: string;
  device_type?: string;
  browser?: string;
  platform?: string;
  ip_address?: string;
  last_used_at?: string;
  trusted_at: string;
  expires_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserActivityLog {
  id: number;
  user_id: number;
  action: string;
  description?: string;
  ip_address?: string;
  user_agent?: string;
  device_type?: string;
  browser?: string;
  platform?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

// Request/Response Types

export interface ProfileResponse {
  user: User;
  profile_completion: number;
}

export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  date_of_birth?: string;
  sex?: 'Male' | 'Female' | 'Other';
  phone?: string;
  license_no?: string;
  specialization?: string;
  position?: string;
  department?: string;
  language_preference?: 'en' | 'fil';
  bio?: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

export interface ToggleMfaRequest {
  enabled: boolean;
  method?: 'sms' | 'email' | 'authenticator';
}

export interface ActivityLogsResponse {
  logs: UserActivityLog[];
}

export interface CompletionStatusResponse {
  completion_percentage: number;
}
