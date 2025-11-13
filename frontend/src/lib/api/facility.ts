// Facility Analytics API Client

import type {
  FacilityDashboard,
  FacilitySummary,
  PatientFlowMetrics,
  ReferralMetrics,
  CapacityUtilization,
  StaffProductivity,
  PerformanceComparison,
  RevenueAnalytics,
  FacilityApiResponse,
} from '@/types/facility';
import { handleApiRequest, logApiError } from './api-error-handler';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001/api/v1';

interface DateRangeParams {
  start_date?: string;
  end_date?: string;
}

/**
 * Build query string from date range parameters
 */
function buildQueryString(params?: DateRangeParams): string {
  if (!params) return '';
  const queryParams = new URLSearchParams();
  if (params.start_date) queryParams.append('start_date', params.start_date);
  if (params.end_date) queryParams.append('end_date', params.end_date);
  const queryString = queryParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Get complete facility dashboard data
 */
export async function getFacilityDashboard(
  facilityId: number,
  params?: DateRangeParams
): Promise<FacilityDashboard> {
  try {
    const result = await handleApiRequest<FacilityApiResponse<FacilityDashboard>>(
      `${API_URL}/facilities/${facilityId}/dashboard${buildQueryString(params)}`
    );

    return result.data;
  } catch (error) {
    logApiError(error as any, `getFacilityDashboard(${facilityId})`);
    throw error;
  }
}

/**
 * Get facility summary metrics
 */
export async function getFacilitySummary(
  facilityId: number,
  params?: DateRangeParams
): Promise<FacilitySummary> {
  try {
    const result = await handleApiRequest<FacilityApiResponse<FacilitySummary>>(
      `${API_URL}/facilities/${facilityId}/summary${buildQueryString(params)}`
    );

    return result.data;
  } catch (error) {
    logApiError(error as any, `getFacilitySummary(${facilityId})`);
    throw error;
  }
}

/**
 * Get patient flow metrics
 */
export async function getPatientFlowMetrics(
  facilityId: number,
  params?: DateRangeParams
): Promise<PatientFlowMetrics> {
  try {
    const result = await handleApiRequest<FacilityApiResponse<PatientFlowMetrics>>(
      `${API_URL}/facilities/${facilityId}/patient-flow${buildQueryString(params)}`
    );

    return result.data;
  } catch (error) {
    logApiError(error as any, `getPatientFlowMetrics(${facilityId})`);
    throw error;
  }
}

/**
 * Get referral metrics
 */
export async function getReferralMetrics(
  facilityId: number,
  params?: DateRangeParams
): Promise<ReferralMetrics> {
  try {
    const result = await handleApiRequest<FacilityApiResponse<ReferralMetrics>>(
      `${API_URL}/facilities/${facilityId}/referral-metrics${buildQueryString(params)}`
    );

    return result.data;
  } catch (error) {
    logApiError(error as any, `getReferralMetrics(${facilityId})`);
    throw error;
  }
}

/**
 * Get capacity utilization metrics
 */
export async function getCapacityMetrics(
  facilityId: number,
  params?: DateRangeParams
): Promise<CapacityUtilization> {
  try {
    const result = await handleApiRequest<FacilityApiResponse<CapacityUtilization>>(
      `${API_URL}/facilities/${facilityId}/capacity-metrics${buildQueryString(params)}`
    );

    return result.data;
  } catch (error) {
    logApiError(error as any, `getCapacityMetrics(${facilityId})`);
    throw error;
  }
}

/**
 * Get staff productivity metrics
 */
export async function getStaffProductivity(
  facilityId: number,
  params?: DateRangeParams
): Promise<StaffProductivity> {
  try {
    const result = await handleApiRequest<FacilityApiResponse<StaffProductivity>>(
      `${API_URL}/facilities/${facilityId}/staff-productivity${buildQueryString(params)}`
    );

    return result.data;
  } catch (error) {
    logApiError(error as any, `getStaffProductivity(${facilityId})`);
    throw error;
  }
}

/**
 * Get performance comparison
 */
export async function getPerformanceComparison(
  facilityId: number,
  params?: DateRangeParams
): Promise<PerformanceComparison> {
  try {
    const result = await handleApiRequest<FacilityApiResponse<PerformanceComparison>>(
      `${API_URL}/facilities/${facilityId}/performance-comparison${buildQueryString(params)}`
    );

    return result.data;
  } catch (error) {
    logApiError(error as any, `getPerformanceComparison(${facilityId})`);
    throw error;
  }
}

/**
 * Get revenue analytics
 */
export async function getRevenueAnalytics(
  facilityId: number,
  params?: DateRangeParams
): Promise<RevenueAnalytics> {
  try {
    const result = await handleApiRequest<FacilityApiResponse<RevenueAnalytics>>(
      `${API_URL}/facilities/${facilityId}/revenue${buildQueryString(params)}`
    );

    return result.data;
  } catch (error) {
    logApiError(error as any, `getRevenueAnalytics(${facilityId})`);
    throw error;
  }
}
