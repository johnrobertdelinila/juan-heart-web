/**
 * Assessment API Client Tests
 *
 * Tests for the assessment API client functions including
 * endpoint calls, payload formatting, error handling, and response parsing.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getAssessment,
  validateAssessment,
  rejectAssessment,
  getClinicalNotes,
  createClinicalNote,
  getRiskAdjustments,
  adjustRiskScore,
} from '../assessment';
import type {
  ValidateAssessmentRequest,
  RejectAssessmentRequest,
  AdjustRiskScoreRequest,
  CreateClinicalNotePayload,
} from '../assessment';
import { mockAssessment, mockApiResponses, mockClinicalNote } from '@/test-utils';

// Mock global fetch
global.fetch = vi.fn();

describe('Assessment API Client', () => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getAssessment', () => {
    it('calls correct endpoint with assessment ID', async () => {
      const assessmentId = 1;
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockApiResponses.success,
      } as Response);

      await getAssessment(assessmentId);

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/assessments/${assessmentId}`,
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );
    });

    it('accepts string ID', async () => {
      const assessmentId = 'ext-123';
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockApiResponses.success,
      } as Response);

      await getAssessment(assessmentId);

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/assessments/${assessmentId}`,
        expect.any(Object)
      );
    });

    it('returns parsed response data', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockApiResponses.success,
      } as Response);

      const result = await getAssessment(1);

      expect(result).toEqual(mockApiResponses.success);
      expect(result.data).toEqual(mockAssessment);
    });

    it('uses cache: no-store for fresh data', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockApiResponses.success,
      } as Response);

      await getAssessment(1);

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          cache: 'no-store',
        })
      );
    });

    it('throws error when response is not ok', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ error: 'Assessment not found' }),
      } as Response);

      await expect(getAssessment(999)).rejects.toThrow();
    });

    it('handles network errors', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

      await expect(getAssessment(1)).rejects.toThrow('Network error');
    });
  });

  describe('validateAssessment', () => {
    const validationData: ValidateAssessmentRequest = {
      validated_risk_score: 75,
      validation_notes: 'Assessment reviewed and approved',
      validation_agrees_with_ml: true,
    };

    it('calls correct endpoint with POST method', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockApiResponses.validationSuccess,
      } as Response);

      await validateAssessment(1, validationData);

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/assessments/1/validate`,
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    it('sends correct JSON payload', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockApiResponses.validationSuccess,
      } as Response);

      await validateAssessment(1, validationData);

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify(validationData),
        })
      );
    });

    it('sets correct content-type header', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockApiResponses.validationSuccess,
      } as Response);

      await validateAssessment(1, validationData);

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );
    });

    it('returns success response', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockApiResponses.validationSuccess,
      } as Response);

      const result = await validateAssessment(1, validationData);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Assessment validated successfully');
    });

    it('handles optional validation_notes', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockApiResponses.validationSuccess,
      } as Response);

      const dataWithoutNotes = {
        validated_risk_score: 75,
        validation_agrees_with_ml: true,
      };

      await validateAssessment(1, dataWithoutNotes);

      const callBody = JSON.parse(
        (fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body
      );
      expect(callBody.validation_notes).toBeUndefined();
    });

    it('throws error on validation failure', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ error: 'Invalid risk score' }),
      } as Response);

      await expect(
        validateAssessment(1, validationData)
      ).rejects.toThrow();
    });
  });

  describe('rejectAssessment', () => {
    const rejectionData: RejectAssessmentRequest = {
      reason: 'Missing vital signs data',
      notify_mobile_user: true,
    };

    it('calls correct endpoint with POST method', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockApiResponses.rejectionSuccess,
      } as Response);

      await rejectAssessment(1, rejectionData);

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/assessments/1/reject`,
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    it('sends correct JSON payload', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockApiResponses.rejectionSuccess,
      } as Response);

      await rejectAssessment(1, rejectionData);

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify(rejectionData),
        })
      );
    });

    it('includes reason in payload', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockApiResponses.rejectionSuccess,
      } as Response);

      await rejectAssessment(1, rejectionData);

      const callBody = JSON.parse(
        (fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body
      );
      expect(callBody.reason).toBe('Missing vital signs data');
    });

    it('handles optional notify_mobile_user', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockApiResponses.rejectionSuccess,
      } as Response);

      const dataWithoutNotify = {
        reason: 'Test reason',
      };

      await rejectAssessment(1, dataWithoutNotify);

      const callBody = JSON.parse(
        (fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body
      );
      expect(callBody.notify_mobile_user).toBeUndefined();
    });

    it('returns success response', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockApiResponses.rejectionSuccess,
      } as Response);

      const result = await rejectAssessment(1, rejectionData);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Assessment rejected successfully');
    });
  });

  describe('getClinicalNotes', () => {
    it('calls correct endpoint', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockApiResponses.clinicalNotes,
      } as Response);

      await getClinicalNotes(1);

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/assessments/1/notes`,
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('accepts string ID', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockApiResponses.clinicalNotes,
      } as Response);

      await getClinicalNotes('ext-123');

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/assessments/ext-123/notes`,
        expect.any(Object)
      );
    });

    it('returns array of clinical notes', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockApiResponses.clinicalNotes,
      } as Response);

      const result = await getClinicalNotes(1);

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data[0]).toEqual(mockClinicalNote);
    });

    it('uses cache: no-store', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockApiResponses.clinicalNotes,
      } as Response);

      await getClinicalNotes(1);

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          cache: 'no-store',
        })
      );
    });
  });

  describe('createClinicalNote', () => {
    const notePayload: CreateClinicalNotePayload = {
      content: '<p>Patient shows improvement</p>',
      visibility: 'internal',
      mobile_visible: false,
    };

    it('calls correct endpoint with POST method', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          message: 'Note created',
          data: mockClinicalNote,
          timestamp: new Date().toISOString(),
        }),
      } as Response);

      await createClinicalNote(1, notePayload);

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/assessments/1/notes`,
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    it('sends FormData for file uploads', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          message: 'Note created',
          data: mockClinicalNote,
          timestamp: new Date().toISOString(),
        }),
      } as Response);

      await createClinicalNote(1, notePayload);

      const callOptions = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][1];
      expect(callOptions.body).toBeInstanceOf(FormData);
    });

    it('includes content in FormData', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          message: 'Note created',
          data: mockClinicalNote,
          timestamp: new Date().toISOString(),
        }),
      } as Response);

      await createClinicalNote(1, notePayload);

      const callOptions = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][1];
      const formData = callOptions.body as FormData;
      expect(formData.get('content')).toBe('<p>Patient shows improvement</p>');
    });

    it('includes visibility in FormData', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          message: 'Note created',
          data: mockClinicalNote,
          timestamp: new Date().toISOString(),
        }),
      } as Response);

      await createClinicalNote(1, notePayload);

      const callOptions = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][1];
      const formData = callOptions.body as FormData;
      expect(formData.get('visibility')).toBe('internal');
    });

    it('includes mobile_visible when provided', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          message: 'Note created',
          data: mockClinicalNote,
          timestamp: new Date().toISOString(),
        }),
      } as Response);

      await createClinicalNote(1, notePayload);

      const callOptions = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][1];
      const formData = callOptions.body as FormData;
      expect(formData.get('mobile_visible')).toBe('false');
    });

    it('includes parent_note_id when provided', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          message: 'Note created',
          data: mockClinicalNote,
          timestamp: new Date().toISOString(),
        }),
      } as Response);

      const payloadWithParent = {
        ...notePayload,
        parent_note_id: 5,
      };

      await createClinicalNote(1, payloadWithParent);

      const callOptions = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][1];
      const formData = callOptions.body as FormData;
      expect(formData.get('parent_note_id')).toBe('5');
    });

    it('appends attachments to FormData', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          message: 'Note created',
          data: mockClinicalNote,
          timestamp: new Date().toISOString(),
        }),
      } as Response);

      const file1 = new File(['content1'], 'file1.pdf', { type: 'application/pdf' });
      const file2 = new File(['content2'], 'file2.png', { type: 'image/png' });
      const payloadWithFiles = {
        ...notePayload,
        attachments: [file1, file2],
      };

      await createClinicalNote(1, payloadWithFiles);

      const callOptions = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][1];
      const formData = callOptions.body as FormData;
      const attachments = formData.getAll('attachments[]');
      expect(attachments).toHaveLength(2);
    });
  });

  describe('getRiskAdjustments', () => {
    it('calls correct endpoint', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockApiResponses.riskAdjustments,
      } as Response);

      await getRiskAdjustments(1);

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/assessments/1/risk-adjustments`,
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('returns array of risk adjustments', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockApiResponses.riskAdjustments,
      } as Response);

      const result = await getRiskAdjustments(1);

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe('adjustRiskScore', () => {
    const adjustmentPayload: AdjustRiskScoreRequest = {
      new_risk_score: 80,
      justification: 'Adjusted for family history',
    };

    it('calls correct endpoint with POST method', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          message: 'Risk score adjusted',
          data: {
            assessment: mockAssessment,
            adjustment: mockApiResponses.riskAdjustments.data[0],
          },
          timestamp: new Date().toISOString(),
        }),
      } as Response);

      await adjustRiskScore(1, adjustmentPayload);

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/assessments/1/risk-adjustments`,
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    it('sends correct JSON payload', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          message: 'Risk score adjusted',
          data: {
            assessment: mockAssessment,
            adjustment: mockApiResponses.riskAdjustments.data[0],
          },
          timestamp: new Date().toISOString(),
        }),
      } as Response);

      await adjustRiskScore(1, adjustmentPayload);

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify(adjustmentPayload),
        })
      );
    });

    it('includes new_risk_score in payload', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          message: 'Risk score adjusted',
          data: {
            assessment: mockAssessment,
            adjustment: mockApiResponses.riskAdjustments.data[0],
          },
          timestamp: new Date().toISOString(),
        }),
      } as Response);

      await adjustRiskScore(1, adjustmentPayload);

      const callBody = JSON.parse(
        (fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body
      );
      expect(callBody.new_risk_score).toBe(80);
    });

    it('includes justification in payload', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          message: 'Risk score adjusted',
          data: {
            assessment: mockAssessment,
            adjustment: mockApiResponses.riskAdjustments.data[0],
          },
          timestamp: new Date().toISOString(),
        }),
      } as Response);

      await adjustRiskScore(1, adjustmentPayload);

      const callBody = JSON.parse(
        (fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body
      );
      expect(callBody.justification).toBe('Adjusted for family history');
    });
  });

  describe('Error Handling', () => {
    it('logs API errors to console', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network failure'));

      await expect(getAssessment(1)).rejects.toThrow();

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });

    it('throws original error for upstream handling', async () => {
      const errorMessage = 'Custom API error';
      vi.mocked(fetch).mockRejectedValueOnce(new Error(errorMessage));

      await expect(getAssessment(1)).rejects.toThrow(errorMessage);
    });

    it('handles 500 server errors', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ error: 'Server error' }),
      } as Response);

      await expect(getAssessment(1)).rejects.toThrow();
    });

    it('handles 401 unauthorized errors', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({ error: 'Authentication required' }),
      } as Response);

      await expect(getAssessment(1)).rejects.toThrow();
    });

    it('handles 403 forbidden errors', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: async () => ({ error: 'Access denied' }),
      } as Response);

      await expect(getAssessment(1)).rejects.toThrow();
    });
  });
});
