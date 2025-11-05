/**
 * Patient API Client for Juan Heart Web Application
 */

import type {
  PatientListParams,
  PatientListResponse,
  PatientStatisticsResponse,
  PatientDetailResponse,
} from '@/types/patient';

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
  const queryString = buildQueryString(params);
  const response = await fetch(`${API_BASE_URL}/patients${queryString}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store', // Always fetch fresh data for patient information
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch patients: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get patient statistics
 */
export async function getPatientStatistics(): Promise<PatientStatisticsResponse> {
  const response = await fetch(`${API_BASE_URL}/patients/statistics`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch patient statistics: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get a single patient's profile with all assessments
 */
export async function getPatientById(id: number | string): Promise<PatientDetailResponse> {
  const response = await fetch(`${API_BASE_URL}/patients/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch patient details: ${response.statusText}`);
  }

  return response.json();
}
