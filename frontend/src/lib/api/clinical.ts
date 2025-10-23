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
  const response = await fetch(
    `${API_URL}/clinical/dashboard${buildQueryString({ user_id: userId, ...params })}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch clinical dashboard: ${response.statusText}`);
  }

  const result: ClinicalApiResponse<ClinicalDashboard> = await response.json();
  return result.data;
}

/**
 * Get assessment queue
 */
export async function getAssessmentQueue(
  userId: number,
  filters?: Omit<QueueFilters, 'user_id'>
): Promise<AssessmentQueue> {
  const response = await fetch(
    `${API_URL}/clinical/assessment-queue${buildQueryString({ user_id: userId, ...filters })}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch assessment queue: ${response.statusText}`);
  }

  const result: ClinicalApiResponse<AssessmentQueue> = await response.json();
  return result.data;
}

/**
 * Get patient risk stratification
 */
export async function getRiskStratification(
  userId: number,
  params?: { start_date?: string; end_date?: string }
): Promise<PatientRiskStratification> {
  const response = await fetch(
    `${API_URL}/clinical/risk-stratification${buildQueryString({ user_id: userId, ...params })}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch risk stratification: ${response.statusText}`);
  }

  const result: ClinicalApiResponse<PatientRiskStratification> = await response.json();
  return result.data;
}

/**
 * Get clinical alerts
 */
export async function getClinicalAlerts(userId: number): Promise<ClinicalAlert[]> {
  const response = await fetch(
    `${API_URL}/clinical/alerts${buildQueryString({ user_id: userId })}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch clinical alerts: ${response.statusText}`);
  }

  const result: ClinicalApiResponse<ClinicalAlert[]> = await response.json();
  return result.data;
}

/**
 * Get workload metrics
 */
export async function getWorkloadMetrics(
  userId: number,
  params?: { start_date?: string; end_date?: string }
): Promise<WorkloadMetrics> {
  const response = await fetch(
    `${API_URL}/clinical/workload${buildQueryString({ user_id: userId, ...params })}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch workload metrics: ${response.statusText}`);
  }

  const result: ClinicalApiResponse<WorkloadMetrics> = await response.json();
  return result.data;
}

/**
 * Get validation metrics
 */
export async function getValidationMetrics(
  userId: number,
  params?: { start_date?: string; end_date?: string }
): Promise<ValidationMetrics> {
  const response = await fetch(
    `${API_URL}/clinical/validation-metrics${buildQueryString({ user_id: userId, ...params })}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch validation metrics: ${response.statusText}`);
  }

  const result: ClinicalApiResponse<ValidationMetrics> = await response.json();
  return result.data;
}

/**
 * Get treatment outcomes
 */
export async function getTreatmentOutcomes(
  userId: number,
  params?: { start_date?: string; end_date?: string }
): Promise<TreatmentOutcomes> {
  const response = await fetch(
    `${API_URL}/clinical/treatment-outcomes${buildQueryString({ user_id: userId, ...params })}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch treatment outcomes: ${response.statusText}`);
  }

  const result: ClinicalApiResponse<TreatmentOutcomes> = await response.json();
  return result.data;
}
