/**
 * Patient API Client for Juan Heart Web Application
 */

import type {
  PatientListParams,
  PatientListResponse,
  PatientStatisticsResponse,
  PatientDetailResponse,
} from '@/types/patient';
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
 * Get list of patients with pagination and filters
 */
export async function getPatients(params: PatientListParams = {}): Promise<PatientListResponse> {
  try {
    const queryString = buildQueryString(params);
    return await handleApiRequest<PatientListResponse>(
      `${API_BASE_URL}/patients${queryString}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store', // Always fetch fresh data for patient information
      }
    );
  } catch (error) {
    logApiError(error as any, 'getPatients');
    throw error;
  }
}

/**
 * Get patient statistics
 */
export async function getPatientStatistics(): Promise<PatientStatisticsResponse> {
  try {
    return await handleApiRequest<PatientStatisticsResponse>(
      `${API_BASE_URL}/patients/statistics`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    );
  } catch (error) {
    logApiError(error as any, 'getPatientStatistics');
    throw error;
  }
}

/**
 * Get a single patient's profile with all assessments
 */
export async function getPatientById(id: number | string): Promise<PatientDetailResponse> {
  try {
    return await handleApiRequest<PatientDetailResponse>(
      `${API_BASE_URL}/patients/${id}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    );
  } catch (error) {
    logApiError(error as any, `getPatientById(${id})`);
    throw error;
  }
}
