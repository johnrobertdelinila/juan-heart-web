// Referral API Client

import type {
  Referral,
  ReferralStatistics,
  ReferralFilters,
  CreateReferralRequest,
  AcceptReferralRequest,
  RejectReferralRequest,
  UpdateStatusRequest,
  ScheduleAppointmentRequest,
  CompleteReferralRequest,
  EscalateReferralRequest,
  ReferralResponse,
  ReferralsResponse,
  StatisticsResponse,
  ApiError,
} from '@/types/referral';
import { handleApiRequest, logApiError } from './api-error-handler';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001/api/v1';

/**
 * Build query string from filters
 */
function buildQueryString(filters: Record<string, any>): string {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Get paginated list of referrals with optional filters
 */
export async function getReferrals(
  filters?: ReferralFilters
): Promise<ReferralsResponse | ApiError> {
  try {
    const queryString = filters ? buildQueryString(filters) : '';
    return await handleApiRequest<ReferralsResponse>(`${API_BASE_URL}/referrals${queryString}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
  } catch (error) {
    logApiError(error as any, 'getReferrals');
    throw error;
  }
}

/**
 * Get referral statistics
 */
export async function getReferralStatistics(filters?: {
  date_from?: string;
  date_to?: string;
  target_facility_id?: number;
  source_facility_id?: number;
}): Promise<StatisticsResponse | ApiError> {
  try {
    const queryString = filters ? buildQueryString(filters) : '';
    return await handleApiRequest<StatisticsResponse>(
      `${API_BASE_URL}/referrals/statistics${queryString}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      }
    );
  } catch (error) {
    logApiError(error as any, 'getReferralStatistics');
    throw error;
  }
}

/**
 * Get a single referral by ID
 */
export async function getReferralById(id: number): Promise<ReferralResponse | ApiError> {
  try {
    return await handleApiRequest<ReferralResponse>(`${API_BASE_URL}/referrals/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
  } catch (error) {
    logApiError(error as any, `getReferralById(${id})`);
    throw error;
  }
}

/**
 * Create a new referral
 */
export async function createReferral(
  request: CreateReferralRequest
): Promise<ReferralResponse | ApiError> {
  try {
    return await handleApiRequest<ReferralResponse>(`${API_BASE_URL}/referrals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(request),
    });
  } catch (error) {
    logApiError(error as any, 'createReferral');
    throw error;
  }
}

/**
 * Accept a referral
 */
export async function acceptReferral(
  id: number,
  request: AcceptReferralRequest
): Promise<ReferralResponse | ApiError> {
  try {
    return await handleApiRequest<ReferralResponse>(`${API_BASE_URL}/referrals/${id}/accept`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(request),
    });
  } catch (error) {
    logApiError(error as any, `acceptReferral(${id})`);
    throw error;
  }
}

/**
 * Reject a referral
 */
export async function rejectReferral(
  id: number,
  request: RejectReferralRequest
): Promise<ReferralResponse | ApiError> {
  try {
    return await handleApiRequest<ReferralResponse>(`${API_BASE_URL}/referrals/${id}/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(request),
    });
  } catch (error) {
    logApiError(error as any, `rejectReferral(${id})`);
    throw error;
  }
}

/**
 * Update referral status
 */
export async function updateReferralStatus(
  id: number,
  request: UpdateStatusRequest
): Promise<ReferralResponse | ApiError> {
  try {
    return await handleApiRequest<ReferralResponse>(`${API_BASE_URL}/referrals/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(request),
    });
  } catch (error) {
    logApiError(error as any, `updateReferralStatus(${id})`);
    throw error;
  }
}

/**
 * Schedule appointment for referral
 */
export async function scheduleAppointment(
  id: number,
  request: ScheduleAppointmentRequest
): Promise<ReferralResponse | ApiError> {
  try {
    return await handleApiRequest<ReferralResponse>(`${API_BASE_URL}/referrals/${id}/schedule`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(request),
    });
  } catch (error) {
    logApiError(error as any, `scheduleAppointment(${id})`);
    throw error;
  }
}

/**
 * Complete a referral with outcome
 */
export async function completeReferral(
  id: number,
  request: CompleteReferralRequest
): Promise<ReferralResponse | ApiError> {
  try {
    return await handleApiRequest<ReferralResponse>(`${API_BASE_URL}/referrals/${id}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(request),
    });
  } catch (error) {
    logApiError(error as any, `completeReferral(${id})`);
    throw error;
  }
}

/**
 * Escalate referral priority
 */
export async function escalateReferral(
  id: number,
  request: EscalateReferralRequest
): Promise<ReferralResponse | ApiError> {
  try {
    return await handleApiRequest<ReferralResponse>(`${API_BASE_URL}/referrals/${id}/escalate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(request),
    });
  } catch (error) {
    logApiError(error as any, `escalateReferral(${id})`);
    throw error;
  }
}

/**
 * Helper: Get priority color class (Juan Heart Design System)
 */
export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'Critical':
      return 'text-red-700 bg-red-50/50 border-red-200/60'; // --danger
    case 'High':
      return 'text-orange-700 bg-orange-50/50 border-orange-200/60'; // --warning
    case 'Medium':
      return 'text-yellow-700 bg-yellow-50/50 border-yellow-200/60';
    case 'Low':
      return 'text-green-700 bg-green-50/50 border-green-200/60'; // --success
    default:
      return 'text-gray-700 bg-gray-50 border-gray-200';
  }
}

/**
 * Helper: Get status color class (Juan Heart Design System)
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case 'pending':
      return 'text-yellow-700 bg-yellow-50/50 border-yellow-200/60'; // --warning context
    case 'accepted':
      return 'text-blue-700 bg-blue-50/50 border-blue-200/60'; // --info
    case 'in_transit':
      return 'text-purple-700 bg-purple-50/50 border-purple-200/60';
    case 'arrived':
      return 'text-indigo-700 bg-indigo-50/50 border-indigo-200/60';
    case 'in_progress':
      return 'text-cyan-700 bg-cyan-50/50 border-cyan-200/60'; // --info variant
    case 'completed':
      return 'text-green-700 bg-green-50/50 border-green-200/60'; // --success
    case 'rejected':
      return 'text-red-700 bg-red-50/50 border-red-200/60'; // --danger
    case 'cancelled':
      return 'text-gray-700 bg-gray-50 border-gray-200';
    default:
      return 'text-gray-700 bg-gray-50 border-gray-200';
  }
}

/**
 * Helper: Get urgency color class (Juan Heart Design System)
 */
export function getUrgencyColor(urgency: string): string {
  switch (urgency) {
    case 'Emergency':
      return 'text-red-700 bg-red-50/50 border-red-200/60'; // --danger
    case 'Urgent':
      return 'text-orange-700 bg-orange-50/50 border-orange-200/60'; // --warning
    case 'Routine':
      return 'text-blue-700 bg-blue-50/50 border-blue-200/60'; // --info
    default:
      return 'text-gray-700 bg-gray-50 border-gray-200';
  }
}

/**
 * Helper: Format date for display
 */
export function formatDate(dateString: string | null): string {
  if (!dateString) return 'N/A';

  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Helper: Format relative time
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) {
    return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  } else {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  }
}
