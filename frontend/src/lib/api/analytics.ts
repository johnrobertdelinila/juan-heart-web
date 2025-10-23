/**
 * Analytics API Client
 * Handles all analytics and dashboard data fetching
 */

import type {
  NationalOverview,
  RealTimeMetrics,
  GeographicRegion,
  TrendAnalysis,
  DemographicsAnalysis,
  AnalyticsFilters,
  AnalyticsResponse,
} from '@/types/analytics';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001/api/v1';

/**
 * Get national overview dashboard data with optional filters
 */
export async function getNationalOverview(filters?: AnalyticsFilters): Promise<NationalOverview> {
  const queryParams = new URLSearchParams();

  if (filters?.start_date) {
    queryParams.append('start_date', filters.start_date);
  }
  if (filters?.end_date) {
    queryParams.append('end_date', filters.end_date);
  }

  const url = `${API_BASE_URL}/analytics/national-overview${
    queryParams.toString() ? `?${queryParams.toString()}` : ''
  }`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      // Add auth token when available
      // 'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch national overview: ${response.statusText}`);
  }

  const result: AnalyticsResponse<NationalOverview> = await response.json();
  return result.data;
}

/**
 * Get real-time assessment metrics
 */
export async function getRealTimeMetrics(): Promise<RealTimeMetrics> {
  const response = await fetch(`${API_BASE_URL}/analytics/real-time-metrics`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch real-time metrics: ${response.statusText}`);
  }

  const result: AnalyticsResponse<RealTimeMetrics> = await response.json();
  return result.data;
}

/**
 * Get geographic distribution of assessments
 */
export async function getGeographicDistribution(
  filters?: AnalyticsFilters
): Promise<GeographicRegion[]> {
  const queryParams = new URLSearchParams();

  if (filters?.start_date) {
    queryParams.append('start_date', filters.start_date);
  }
  if (filters?.end_date) {
    queryParams.append('end_date', filters.end_date);
  }

  const url = `${API_BASE_URL}/analytics/geographic-distribution${
    queryParams.toString() ? `?${queryParams.toString()}` : ''
  }`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch geographic distribution: ${response.statusText}`);
  }

  const result: AnalyticsResponse<GeographicRegion[]> = await response.json();
  return result.data;
}

/**
 * Get trend analysis data
 */
export async function getTrendAnalysis(filters?: AnalyticsFilters): Promise<TrendAnalysis> {
  const queryParams = new URLSearchParams();

  if (filters?.start_date) {
    queryParams.append('start_date', filters.start_date);
  }
  if (filters?.end_date) {
    queryParams.append('end_date', filters.end_date);
  }

  const url = `${API_BASE_URL}/analytics/trend-analysis${
    queryParams.toString() ? `?${queryParams.toString()}` : ''
  }`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch trend analysis: ${response.statusText}`);
  }

  const result: AnalyticsResponse<TrendAnalysis> = await response.json();
  return result.data;
}

/**
 * Get demographics analysis
 */
export async function getDemographicsAnalysis(
  filters?: AnalyticsFilters
): Promise<DemographicsAnalysis> {
  const queryParams = new URLSearchParams();

  if (filters?.start_date) {
    queryParams.append('start_date', filters.start_date);
  }
  if (filters?.end_date) {
    queryParams.append('end_date', filters.end_date);
  }

  const url = `${API_BASE_URL}/analytics/demographics-analysis${
    queryParams.toString() ? `?${queryParams.toString()}` : ''
  }`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch demographics analysis: ${response.statusText}`);
  }

  const result: AnalyticsResponse<DemographicsAnalysis> = await response.json();
  return result.data;
}

/**
 * Export dashboard data (placeholder for future implementation)
 */
export async function exportDashboardData(
  filters?: AnalyticsFilters,
  format: 'excel' | 'csv' | 'pdf' = 'excel'
): Promise<{ success: boolean; message: string }> {
  const queryParams = new URLSearchParams();

  if (filters?.start_date) {
    queryParams.append('start_date', filters.start_date);
  }
  if (filters?.end_date) {
    queryParams.append('end_date', filters.end_date);
  }
  queryParams.append('format', format);

  const url = `${API_BASE_URL}/analytics/export${
    queryParams.toString() ? `?${queryParams.toString()}` : ''
  }`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to export data: ${response.statusText}`);
  }

  return response.json();
}
