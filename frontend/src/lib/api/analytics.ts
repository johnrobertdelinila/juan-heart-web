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
import { handleApiRequest, logApiError } from './api-error-handler';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001/api/v1';

/**
 * Get national overview dashboard data with optional filters
 */
export async function getNationalOverview(filters?: AnalyticsFilters): Promise<NationalOverview> {
  try {
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

    const result = await handleApiRequest<AnalyticsResponse<NationalOverview>>(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Add auth token when available
        // 'Authorization': `Bearer ${token}`,
      },
    });

    return result.data;
  } catch (error) {
    logApiError(error as any, 'getNationalOverview');
    throw error;
  }
}

/**
 * Get real-time assessment metrics
 */
export async function getRealTimeMetrics(): Promise<RealTimeMetrics> {
  try {
    const result = await handleApiRequest<AnalyticsResponse<RealTimeMetrics>>(
      `${API_BASE_URL}/analytics/real-time-metrics`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return result.data;
  } catch (error) {
    logApiError(error as any, 'getRealTimeMetrics');
    throw error;
  }
}

/**
 * Get geographic distribution of assessments
 */
export async function getGeographicDistribution(
  filters?: AnalyticsFilters
): Promise<GeographicRegion[]> {
  try {
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

    const result = await handleApiRequest<AnalyticsResponse<GeographicRegion[]>>(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return result.data;
  } catch (error) {
    logApiError(error as any, 'getGeographicDistribution');
    throw error;
  }
}

/**
 * Get trend analysis data
 */
export async function getTrendAnalysis(filters?: AnalyticsFilters): Promise<TrendAnalysis> {
  try {
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

    const result = await handleApiRequest<AnalyticsResponse<TrendAnalysis>>(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return result.data;
  } catch (error) {
    logApiError(error as any, 'getTrendAnalysis');
    throw error;
  }
}

/**
 * Get demographics analysis
 */
export async function getDemographicsAnalysis(
  filters?: AnalyticsFilters
): Promise<DemographicsAnalysis> {
  try {
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

    const result = await handleApiRequest<AnalyticsResponse<DemographicsAnalysis>>(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return result.data;
  } catch (error) {
    logApiError(error as any, 'getDemographicsAnalysis');
    throw error;
  }
}

/**
 * Export dashboard data (placeholder for future implementation)
 */
export async function exportDashboardData(
  filters?: AnalyticsFilters,
  format: 'excel' | 'csv' | 'pdf' = 'excel'
): Promise<{ success: boolean; message: string }> {
  try {
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

    return await handleApiRequest<{ success: boolean; message: string }>(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    logApiError(error as any, 'exportDashboardData');
    throw error;
  }
}
