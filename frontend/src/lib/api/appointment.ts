/**
 * Appointment API Client for Juan Heart Web Application
 */

import type {
  AppointmentFilters,
  AppointmentListResponse,
  AppointmentDetailResponse,
  AppointmentActionResponse,
} from '@/types/appointment';
import { handleApiRequest, logApiError } from './api-error-handler';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001/api/v1';

/**
 * Build query string from parameters
 */
function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Get list of appointments with pagination and filters
 */
export async function getAppointments(
  filters: AppointmentFilters = {}
): Promise<AppointmentListResponse> {
  try {
    const queryString = buildQueryString(filters);
    return await handleApiRequest<AppointmentListResponse>(
      `${API_BASE_URL}/appointments${queryString}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store', // Always fetch fresh data for appointments
      }
    );
  } catch (error) {
    logApiError(error as any, 'getAppointments');
    throw error;
  }
}

/**
 * Get a single appointment by ID
 */
export async function getAppointment(id: number | string): Promise<AppointmentDetailResponse> {
  try {
    return await handleApiRequest<AppointmentDetailResponse>(
      `${API_BASE_URL}/appointments/${id}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    );
  } catch (error) {
    logApiError(error as any, `getAppointment(${id})`);
    throw error;
  }
}

/**
 * Confirm an appointment
 */
export async function confirmAppointment(id: number): Promise<AppointmentActionResponse> {
  try {
    return await handleApiRequest<AppointmentActionResponse>(
      `${API_BASE_URL}/appointments/${id}/confirm`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    logApiError(error as any, `confirmAppointment(${id})`);
    throw error;
  }
}

/**
 * Cancel an appointment
 */
export async function cancelAppointment(
  id: number,
  reason: string
): Promise<AppointmentActionResponse> {
  try {
    return await handleApiRequest<AppointmentActionResponse>(
      `${API_BASE_URL}/appointments/${id}/cancel`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      }
    );
  } catch (error) {
    logApiError(error as any, `cancelAppointment(${id})`);
    throw error;
  }
}

/**
 * Check in a patient
 */
export async function checkInAppointment(id: number): Promise<AppointmentActionResponse> {
  try {
    return await handleApiRequest<AppointmentActionResponse>(
      `${API_BASE_URL}/appointments/${id}/check-in`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    logApiError(error as any, `checkInAppointment(${id})`);
    throw error;
  }
}

/**
 * Reschedule an appointment
 */
export async function rescheduleAppointment(
  id: number,
  newDateTime: string,
  reason?: string
): Promise<AppointmentActionResponse> {
  try {
    return await handleApiRequest<AppointmentActionResponse>(
      `${API_BASE_URL}/appointments/${id}/reschedule`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          new_datetime: newDateTime,
          reason,
        }),
      }
    );
  } catch (error) {
    logApiError(error as any, `rescheduleAppointment(${id})`);
    throw error;
  }
}

/**
 * Complete an appointment
 */
export async function completeAppointment(
  id: number,
  data: { visit_summary?: string; next_steps?: string }
): Promise<AppointmentActionResponse> {
  try {
    return await handleApiRequest<AppointmentActionResponse>(
      `${API_BASE_URL}/appointments/${id}/complete`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    );
  } catch (error) {
    logApiError(error as any, `completeAppointment(${id})`);
    throw error;
  }
}
