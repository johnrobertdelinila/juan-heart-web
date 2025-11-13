/**
 * Assessment API Client for Juan Heart Web Application
 */

import type {
  AssessmentDetailResponse,
  AssessmentActionResponse,
  ValidateAssessmentRequest,
  RejectAssessmentRequest,
  ClinicalNotesResponse,
  ClinicalNoteActionResponse,
  RiskAdjustmentListResponse,
  RiskAdjustmentActionResponse,
  AdjustRiskScoreRequest,
} from '@/types/assessment';
import { handleApiRequest, logApiError, type ApiError } from './api-error-handler';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

/**
 * Get a single assessment by ID with full details
 */
export async function getAssessment(id: number | string): Promise<AssessmentDetailResponse> {
  try {
    return await handleApiRequest<AssessmentDetailResponse>(`${API_BASE_URL}/assessments/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });
  } catch (error) {
    logApiError(error as ApiError, `getAssessment(${id})`);
    throw error;
  }
}

/**
 * Validate an assessment
 * @param id - Assessment ID
 * @param data - Validation data (validated_risk_score, validation_notes, validation_agrees_with_ml)
 */
export async function validateAssessment(
  id: number,
  data: ValidateAssessmentRequest
): Promise<AssessmentActionResponse> {
  try {
    return await handleApiRequest<AssessmentActionResponse>(
      `${API_BASE_URL}/assessments/${id}/validate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    );
  } catch (error) {
    logApiError(error as ApiError, `validateAssessment(${id})`);
    throw error;
  }
}

/**
 * Reject an assessment with clinical reasoning
 * @param id - Assessment ID
 * @param data - Rejection payload
 */
export async function rejectAssessment(
  id: number,
  data: RejectAssessmentRequest
): Promise<AssessmentActionResponse> {
  try {
    return await handleApiRequest<AssessmentActionResponse>(
      `${API_BASE_URL}/assessments/${id}/reject`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    );
  } catch (error) {
    logApiError(error as ApiError, `rejectAssessment(${id})`);
    throw error;
  }
}

export async function getClinicalNotes(id: number | string): Promise<ClinicalNotesResponse> {
  try {
    return await handleApiRequest<ClinicalNotesResponse>(
      `${API_BASE_URL}/assessments/${id}/notes`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    );
  } catch (error) {
    logApiError(error as ApiError, `getClinicalNotes(${id})`);
    throw error;
  }
}

export interface CreateClinicalNotePayload {
  content: string;
  visibility: 'private' | 'internal' | 'shared';
  mobile_visible?: boolean;
  parent_note_id?: number;
  attachments?: File[];
}

export async function createClinicalNote(
  id: number | string,
  payload: CreateClinicalNotePayload
): Promise<ClinicalNoteActionResponse> {
  try {
    const formData = new FormData();
    formData.append('content', payload.content);
    formData.append('visibility', payload.visibility);
    if (typeof payload.mobile_visible !== 'undefined') {
      formData.append('mobile_visible', String(payload.mobile_visible));
    }
    if (payload.parent_note_id) {
      formData.append('parent_note_id', String(payload.parent_note_id));
    }
    payload.attachments?.forEach((file) => {
      formData.append('attachments[]', file);
    });

    return await handleApiRequest<ClinicalNoteActionResponse>(
      `${API_BASE_URL}/assessments/${id}/notes`,
      {
        method: 'POST',
        body: formData,
      }
    );
  } catch (error) {
    logApiError(error as ApiError, `createClinicalNote(${id})`);
    throw error;
  }
}

export async function getRiskAdjustments(id: number | string): Promise<RiskAdjustmentListResponse> {
  try {
    return await handleApiRequest<RiskAdjustmentListResponse>(
      `${API_BASE_URL}/assessments/${id}/risk-adjustments`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    );
  } catch (error) {
    logApiError(error as ApiError, `getRiskAdjustments(${id})`);
    throw error;
  }
}

export async function adjustRiskScore(
  id: number | string,
  payload: AdjustRiskScoreRequest
): Promise<RiskAdjustmentActionResponse> {
  try {
    return await handleApiRequest<RiskAdjustmentActionResponse>(
      `${API_BASE_URL}/assessments/${id}/risk-adjustments`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );
  } catch (error) {
    logApiError(error as ApiError, `adjustRiskScore(${id})`);
    throw error;
  }
}
