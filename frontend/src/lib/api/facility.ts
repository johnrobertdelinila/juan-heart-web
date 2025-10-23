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
  const response = await fetch(
    `${API_URL}/facilities/${facilityId}/dashboard${buildQueryString(params)}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch facility dashboard: ${response.statusText}`);
  }

  const result: FacilityApiResponse<FacilityDashboard> = await response.json();
  return result.data;
}

/**
 * Get facility summary metrics
 */
export async function getFacilitySummary(
  facilityId: number,
  params?: DateRangeParams
): Promise<FacilitySummary> {
  const response = await fetch(
    `${API_URL}/facilities/${facilityId}/summary${buildQueryString(params)}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch facility summary: ${response.statusText}`);
  }

  const result: FacilityApiResponse<FacilitySummary> = await response.json();
  return result.data;
}

/**
 * Get patient flow metrics
 */
export async function getPatientFlowMetrics(
  facilityId: number,
  params?: DateRangeParams
): Promise<PatientFlowMetrics> {
  const response = await fetch(
    `${API_URL}/facilities/${facilityId}/patient-flow${buildQueryString(params)}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch patient flow metrics: ${response.statusText}`);
  }

  const result: FacilityApiResponse<PatientFlowMetrics> = await response.json();
  return result.data;
}

/**
 * Get referral metrics
 */
export async function getReferralMetrics(
  facilityId: number,
  params?: DateRangeParams
): Promise<ReferralMetrics> {
  const response = await fetch(
    `${API_URL}/facilities/${facilityId}/referral-metrics${buildQueryString(params)}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch referral metrics: ${response.statusText}`);
  }

  const result: FacilityApiResponse<ReferralMetrics> = await response.json();
  return result.data;
}

/**
 * Get capacity utilization metrics
 */
export async function getCapacityMetrics(
  facilityId: number,
  params?: DateRangeParams
): Promise<CapacityUtilization> {
  const response = await fetch(
    `${API_URL}/facilities/${facilityId}/capacity-metrics${buildQueryString(params)}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch capacity metrics: ${response.statusText}`);
  }

  const result: FacilityApiResponse<CapacityUtilization> = await response.json();
  return result.data;
}

/**
 * Get staff productivity metrics
 */
export async function getStaffProductivity(
  facilityId: number,
  params?: DateRangeParams
): Promise<StaffProductivity> {
  const response = await fetch(
    `${API_URL}/facilities/${facilityId}/staff-productivity${buildQueryString(params)}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch staff productivity: ${response.statusText}`);
  }

  const result: FacilityApiResponse<StaffProductivity> = await response.json();
  return result.data;
}

/**
 * Get performance comparison
 */
export async function getPerformanceComparison(
  facilityId: number,
  params?: DateRangeParams
): Promise<PerformanceComparison> {
  const response = await fetch(
    `${API_URL}/facilities/${facilityId}/performance-comparison${buildQueryString(params)}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch performance comparison: ${response.statusText}`);
  }

  const result: FacilityApiResponse<PerformanceComparison> = await response.json();
  return result.data;
}

/**
 * Get revenue analytics
 */
export async function getRevenueAnalytics(
  facilityId: number,
  params?: DateRangeParams
): Promise<RevenueAnalytics> {
  const response = await fetch(
    `${API_URL}/facilities/${facilityId}/revenue${buildQueryString(params)}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch revenue analytics: ${response.statusText}`);
  }

  const result: FacilityApiResponse<RevenueAnalytics> = await response.json();
  return result.data;
}
