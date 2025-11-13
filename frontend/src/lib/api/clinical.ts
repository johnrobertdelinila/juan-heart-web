// Clinical Dashboard API Client

import type {
  ClinicalDashboard,
  AssessmentQueue,
  PatientRiskStratification,
  ClinicalAlert,
  WorkloadMetrics,
  ValidationMetrics,
  TreatmentOutcomes,
  ClinicalApiResponse,
} from '@/types/clinical';
import { handleApiRequest, logApiError } from './api-error-handler';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001/api/v1';

interface DateRangeParams {
  user_id: number;
  start_date?: string;
  end_date?: string;
}

interface QueueFilters extends DateRangeParams {
  priority?: string;
  risk_level?: string;
  status?: string;
}

/**
 * Build query string from parameters
 */
function buildQueryString(params: Record<string, any>): string {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, String(value));
    }
  });
  const queryString = queryParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Get complete clinical dashboard data
 */
export async function getClinicalDashboard(
  userId: number,
  params?: { start_date?: string; end_date?: string }
): Promise<ClinicalDashboard> {
  try {
    const result = await handleApiRequest<ClinicalApiResponse<ClinicalDashboard>>(
      `${API_URL}/clinical/dashboard${buildQueryString({ user_id: userId, ...params })}`
    );

    return result.data;
  } catch (error) {
    logApiError(error as any, 'getClinicalDashboard');
    throw error;
  }
}

/**
 * Get assessment queue
 */
export async function getAssessmentQueue(
  userId: number,
  filters?: Omit<QueueFilters, 'user_id'>
): Promise<AssessmentQueue> {
  try {
    const result = await handleApiRequest<ClinicalApiResponse<AssessmentQueue>>(
      `${API_URL}/clinical/assessment-queue${buildQueryString({ user_id: userId, ...filters })}`
    );

    return result.data;
  } catch (error) {
    logApiError(error as any, 'getAssessmentQueue');
    throw error;
  }
}

/**
 * Get patient risk stratification
 */
export async function getRiskStratification(
  userId: number,
  params?: { start_date?: string; end_date?: string }
): Promise<PatientRiskStratification> {
  try {
    const result = await handleApiRequest<ClinicalApiResponse<PatientRiskStratification>>(
      `${API_URL}/clinical/risk-stratification${buildQueryString({ user_id: userId, ...params })}`
    );

    return result.data;
  } catch (error) {
    logApiError(error as any, 'getRiskStratification');
    throw error;
  }
}

/**
 * Get clinical alerts
 */
export async function getClinicalAlerts(userId: number): Promise<ClinicalAlert[]> {
  try {
    const result = await handleApiRequest<ClinicalApiResponse<ClinicalAlert[]>>(
      `${API_URL}/clinical/alerts${buildQueryString({ user_id: userId })}`
    );

    return result.data;
  } catch (error) {
    logApiError(error as any, 'getClinicalAlerts');
    throw error;
  }
}

/**
 * Get workload metrics
 */
export async function getWorkloadMetrics(
  userId: number,
  params?: { start_date?: string; end_date?: string }
): Promise<WorkloadMetrics> {
  try {
    const result = await handleApiRequest<ClinicalApiResponse<WorkloadMetrics>>(
      `${API_URL}/clinical/workload${buildQueryString({ user_id: userId, ...params })}`
    );

    return result.data;
  } catch (error) {
    logApiError(error as any, 'getWorkloadMetrics');
    throw error;
  }
}

/**
 * Get validation metrics
 */
export async function getValidationMetrics(
  userId: number,
  params?: { start_date?: string; end_date?: string }
): Promise<ValidationMetrics> {
  try {
    const result = await handleApiRequest<ClinicalApiResponse<ValidationMetrics>>(
      `${API_URL}/clinical/validation-metrics${buildQueryString({ user_id: userId, ...params })}`
    );

    return result.data;
  } catch (error) {
    logApiError(error as any, 'getValidationMetrics');
    throw error;
  }
}

/**
 * Get treatment outcomes
 */
export async function getTreatmentOutcomes(
  userId: number,
  params?: { start_date?: string; end_date?: string }
): Promise<TreatmentOutcomes> {
  try {
    const result = await handleApiRequest<ClinicalApiResponse<TreatmentOutcomes>>(
      `${API_URL}/clinical/treatment-outcomes${buildQueryString({ user_id: userId, ...params })}`
    );

    return result.data;
  } catch (error) {
    logApiError(error as any, 'getTreatmentOutcomes');
    throw error;
  }
}
