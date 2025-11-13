/**
 * ValidationWorkflow Component Tests
 *
 * Tests for the clinical validation workflow component including
 * approve/reject dialogs, risk adjustments, and API interactions.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, userEvent } from '@/test-utils';
import { ValidationWorkflow } from '../validation-workflow';
import { mockAssessment, mockValidatedAssessment, mockApiResponses } from '@/test-utils';
import * as assessmentApi from '@/lib/api/assessment';
import * as sweetalertConfig from '@/lib/sweetalert-config';

// Mock the API module
vi.mock('@/lib/api/assessment', () => ({
  validateAssessment: vi.fn(),
  rejectAssessment: vi.fn(),
  getRiskAdjustments: vi.fn(),
  adjustRiskScore: vi.fn(),
}));

// Mock SweetAlert2 toasts
vi.mock('@/lib/sweetalert-config', () => ({
  showSuccessToast: vi.fn().mockResolvedValue(undefined),
  showErrorToast: vi.fn().mockResolvedValue(undefined),
}));

describe('ValidationWorkflow', () => {
  const mockOnActionComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock for risk adjustments
    vi.mocked(assessmentApi.getRiskAdjustments).mockResolvedValue({
      success: true,
      data: [],
      timestamp: new Date().toISOString(),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders validation workflow with pending status', () => {
      render(
        <ValidationWorkflow
          assessment={mockAssessment}
          onActionComplete={mockOnActionComplete}
        />
      );

      expect(screen.getByText('Validation Workflow')).toBeInTheDocument();
      expect(screen.getByText(/Current Status: pending/i)).toBeInTheDocument();
      expect(screen.getByText('Approve Assessment')).toBeInTheDocument();
      expect(screen.getByText('Reject & Request Revisions')).toBeInTheDocument();
    });

    it('renders status timeline correctly', () => {
      render(
        <ValidationWorkflow
          assessment={mockAssessment}
          onActionComplete={mockOnActionComplete}
        />
      );

      expect(screen.getByText('Submitted from field')).toBeInTheDocument();
      expect(screen.getByText('Clinical review')).toBeInTheDocument();
      expect(screen.getByText('Final decision')).toBeInTheDocument();
    });

    it('renders validator information when available', () => {
      render(
        <ValidationWorkflow
          assessment={mockValidatedAssessment}
          onActionComplete={mockOnActionComplete}
        />
      );

      expect(screen.getByText(/Validator: Dr. Maria Santos/i)).toBeInTheDocument();
    });

    it('shows unassigned when no validator', () => {
      render(
        <ValidationWorkflow
          assessment={mockAssessment}
          onActionComplete={mockOnActionComplete}
        />
      );

      expect(screen.getByText(/Validator: Unassigned/i)).toBeInTheDocument();
    });
  });

  describe('Approve Button and Dialog', () => {
    it('renders approve button enabled for pending assessments', () => {
      render(
        <ValidationWorkflow
          assessment={mockAssessment}
          onActionComplete={mockOnActionComplete}
        />
      );

      const approveButton = screen.getByText('Approve Assessment');
      expect(approveButton).toBeInTheDocument();
      expect(approveButton).not.toBeDisabled();
    });

    it('disables approve button for validated assessments', () => {
      render(
        <ValidationWorkflow
          assessment={mockValidatedAssessment}
          onActionComplete={mockOnActionComplete}
        />
      );

      const approveButton = screen.getByText('Approve Assessment');
      expect(approveButton).toBeDisabled();
    });

    it('opens approve dialog when approve button clicked', async () => {
      const user = userEvent.setup();
      render(
        <ValidationWorkflow
          assessment={mockAssessment}
          onActionComplete={mockOnActionComplete}
        />
      );

      const approveButton = screen.getByText('Approve Assessment');
      await user.click(approveButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Approve Assessment')).toBeInTheDocument();
        expect(screen.getByLabelText('Validated Risk Score')).toBeInTheDocument();
      });
    });

    it('shows pre-filled risk score in approve dialog', async () => {
      const user = userEvent.setup();
      render(
        <ValidationWorkflow
          assessment={{ ...mockAssessment, ml_risk_score: 75 }}
          onActionComplete={mockOnActionComplete}
        />
      );

      const approveButton = screen.getByText('Approve Assessment');
      await user.click(approveButton);

      await waitFor(() => {
        const scoreInput = screen.getByLabelText('Validated Risk Score') as HTMLInputElement;
        expect(scoreInput.value).toBe('75');
      });
    });

    it('allows editing risk score in approve dialog', async () => {
      const user = userEvent.setup();
      render(
        <ValidationWorkflow
          assessment={mockAssessment}
          onActionComplete={mockOnActionComplete}
        />
      );

      const approveButton = screen.getByText('Approve Assessment');
      await user.click(approveButton);

      await waitFor(async () => {
        const scoreInput = screen.getByLabelText('Validated Risk Score') as HTMLInputElement;
        await user.clear(scoreInput);
        await user.type(scoreInput, '85');
        expect(scoreInput.value).toBe('85');
      });
    });

    it('allows entering validation notes', async () => {
      const user = userEvent.setup();
      render(
        <ValidationWorkflow
          assessment={mockAssessment}
          onActionComplete={mockOnActionComplete}
        />
      );

      const approveButton = screen.getByText('Approve Assessment');
      await user.click(approveButton);

      await waitFor(async () => {
        const notesTextarea = screen.getByLabelText('Clinical Notes') as HTMLTextAreaElement;
        await user.type(notesTextarea, 'Patient requires follow-up');
        expect(notesTextarea.value).toContain('Patient requires follow-up');
      });
    });

    it('shows ML agreement toggle', async () => {
      const user = userEvent.setup();
      render(
        <ValidationWorkflow
          assessment={mockAssessment}
          onActionComplete={mockOnActionComplete}
        />
      );

      const approveButton = screen.getByText('Approve Assessment');
      await user.click(approveButton);

      await waitFor(() => {
        expect(screen.getByText('Clinical assessment agrees with AI prediction')).toBeInTheDocument();
        expect(screen.getByRole('switch')).toBeInTheDocument();
      });
    });
  });

  describe('Approve Submission', () => {
    it('calls validateAssessment API with correct data', async () => {
      const user = userEvent.setup();
      vi.mocked(assessmentApi.validateAssessment).mockResolvedValue(
        mockApiResponses.validationSuccess
      );

      render(
        <ValidationWorkflow
          assessment={mockAssessment}
          onActionComplete={mockOnActionComplete}
        />
      );

      const approveButton = screen.getByText('Approve Assessment');
      await user.click(approveButton);

      await waitFor(async () => {
        const confirmButton = screen.getByText('Confirm Approval');
        await user.click(confirmButton);
      });

      await waitFor(() => {
        expect(assessmentApi.validateAssessment).toHaveBeenCalledWith(
          mockAssessment.id,
          expect.objectContaining({
            validated_risk_score: expect.any(Number),
            validation_agrees_with_ml: expect.any(Boolean),
          })
        );
      });
    });

    it('shows loading state during submission', async () => {
      const user = userEvent.setup();
      vi.mocked(assessmentApi.validateAssessment).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockApiResponses.validationSuccess), 100))
      );

      render(
        <ValidationWorkflow
          assessment={mockAssessment}
          onActionComplete={mockOnActionComplete}
        />
      );

      const approveButton = screen.getByText('Approve Assessment');
      await user.click(approveButton);

      await waitFor(async () => {
        const confirmButton = screen.getByText('Confirm Approval');
        await user.click(confirmButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Saving...')).toBeInTheDocument();
      });
    });

    it('shows success toast on successful approval', async () => {
      const user = userEvent.setup();
      vi.mocked(assessmentApi.validateAssessment).mockResolvedValue(
        mockApiResponses.validationSuccess
      );

      render(
        <ValidationWorkflow
          assessment={mockAssessment}
          onActionComplete={mockOnActionComplete}
        />
      );

      const approveButton = screen.getByText('Approve Assessment');
      await user.click(approveButton);

      await waitFor(async () => {
        const confirmButton = screen.getByText('Confirm Approval');
        await user.click(confirmButton);
      });

      await waitFor(() => {
        expect(sweetalertConfig.showSuccessToast).toHaveBeenCalledWith(
          'Assessment approved successfully'
        );
      });
    });

    it('calls onActionComplete after successful approval', async () => {
      const user = userEvent.setup();
      vi.mocked(assessmentApi.validateAssessment).mockResolvedValue(
        mockApiResponses.validationSuccess
      );

      render(
        <ValidationWorkflow
          assessment={mockAssessment}
          onActionComplete={mockOnActionComplete}
        />
      );

      const approveButton = screen.getByText('Approve Assessment');
      await user.click(approveButton);

      await waitFor(async () => {
        const confirmButton = screen.getByText('Confirm Approval');
        await user.click(confirmButton);
      });

      await waitFor(() => {
        expect(mockOnActionComplete).toHaveBeenCalled();
      });
    });

    it('shows error toast on approval failure', async () => {
      const user = userEvent.setup();
      vi.mocked(assessmentApi.validateAssessment).mockRejectedValue(
        new Error('Network error')
      );

      render(
        <ValidationWorkflow
          assessment={mockAssessment}
          onActionComplete={mockOnActionComplete}
        />
      );

      const approveButton = screen.getByText('Approve Assessment');
      await user.click(approveButton);

      await waitFor(async () => {
        const confirmButton = screen.getByText('Confirm Approval');
        await user.click(confirmButton);
      });

      await waitFor(() => {
        expect(sweetalertConfig.showErrorToast).toHaveBeenCalledWith(
          'Approval failed',
          'Network error'
        );
      });
    });

    it('validates risk score is a valid number', async () => {
      const user = userEvent.setup();
      render(
        <ValidationWorkflow
          assessment={mockAssessment}
          onActionComplete={mockOnActionComplete}
        />
      );

      const approveButton = screen.getByText('Approve Assessment');
      await user.click(approveButton);

      await waitFor(async () => {
        const scoreInput = screen.getByLabelText('Validated Risk Score') as HTMLInputElement;
        await user.clear(scoreInput);
        await user.type(scoreInput, 'invalid');

        const confirmButton = screen.getByText('Confirm Approval');
        await user.click(confirmButton);
      });

      await waitFor(() => {
        expect(sweetalertConfig.showErrorToast).toHaveBeenCalledWith(
          'Please enter a valid risk score (0-100).'
        );
      });
    });
  });

  describe('Reject Button and Dialog', () => {
    it('renders reject button enabled for pending assessments', () => {
      render(
        <ValidationWorkflow
          assessment={mockAssessment}
          onActionComplete={mockOnActionComplete}
        />
      );

      const rejectButton = screen.getByText('Reject & Request Revisions');
      expect(rejectButton).toBeInTheDocument();
      expect(rejectButton).not.toBeDisabled();
    });

    it('opens reject dialog when reject button clicked', async () => {
      const user = userEvent.setup();
      render(
        <ValidationWorkflow
          assessment={mockAssessment}
          onActionComplete={mockOnActionComplete}
        />
      );

      const rejectButton = screen.getByText('Reject & Request Revisions');
      await user.click(rejectButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Reject Assessment')).toBeInTheDocument();
        expect(screen.getByLabelText('Clinical Feedback')).toBeInTheDocument();
      });
    });

    it('requires rejection reason to be entered', async () => {
      const user = userEvent.setup();
      render(
        <ValidationWorkflow
          assessment={mockAssessment}
          onActionComplete={mockOnActionComplete}
        />
      );

      const rejectButton = screen.getByText('Reject & Request Revisions');
      await user.click(rejectButton);

      await waitFor(() => {
        const submitButton = screen.getByText('Submit Rejection');
        expect(submitButton).toBeDisabled();
      });
    });

    it('enables submit button when reason is entered', async () => {
      const user = userEvent.setup();
      render(
        <ValidationWorkflow
          assessment={mockAssessment}
          onActionComplete={mockOnActionComplete}
        />
      );

      const rejectButton = screen.getByText('Reject & Request Revisions');
      await user.click(rejectButton);

      await waitFor(async () => {
        const reasonTextarea = screen.getByLabelText('Clinical Feedback') as HTMLTextAreaElement;
        await user.type(reasonTextarea, 'Missing vital signs data');

        const submitButton = screen.getByText('Submit Rejection');
        expect(submitButton).not.toBeDisabled();
      });
    });

    it('shows mobile notification toggle', async () => {
      const user = userEvent.setup();
      render(
        <ValidationWorkflow
          assessment={mockAssessment}
          onActionComplete={mockOnActionComplete}
        />
      );

      const rejectButton = screen.getByText('Reject & Request Revisions');
      await user.click(rejectButton);

      await waitFor(() => {
        expect(screen.getByText('Notify mobile health worker')).toBeInTheDocument();
      });
    });
  });

  describe('Reject Submission', () => {
    it('calls rejectAssessment API with correct data', async () => {
      const user = userEvent.setup();
      const rejectionReason = 'Missing blood pressure readings';
      vi.mocked(assessmentApi.rejectAssessment).mockResolvedValue(
        mockApiResponses.rejectionSuccess
      );

      render(
        <ValidationWorkflow
          assessment={mockAssessment}
          onActionComplete={mockOnActionComplete}
        />
      );

      const rejectButton = screen.getByText('Reject & Request Revisions');
      await user.click(rejectButton);

      await waitFor(async () => {
        const reasonTextarea = screen.getByLabelText('Clinical Feedback') as HTMLTextAreaElement;
        await user.type(reasonTextarea, rejectionReason);

        const submitButton = screen.getByText('Submit Rejection');
        await user.click(submitButton);
      });

      await waitFor(() => {
        expect(assessmentApi.rejectAssessment).toHaveBeenCalledWith(
          mockAssessment.id,
          expect.objectContaining({
            reason: rejectionReason,
            notify_mobile_user: true,
          })
        );
      });
    });

    it('shows loading state during rejection', async () => {
      const user = userEvent.setup();
      vi.mocked(assessmentApi.rejectAssessment).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockApiResponses.rejectionSuccess), 100))
      );

      render(
        <ValidationWorkflow
          assessment={mockAssessment}
          onActionComplete={mockOnActionComplete}
        />
      );

      const rejectButton = screen.getByText('Reject & Request Revisions');
      await user.click(rejectButton);

      await waitFor(async () => {
        const reasonTextarea = screen.getByLabelText('Clinical Feedback') as HTMLTextAreaElement;
        await user.type(reasonTextarea, 'Test reason');

        const submitButton = screen.getByText('Submit Rejection');
        await user.click(submitButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Sending...')).toBeInTheDocument();
      });
    });

    it('shows success toast on successful rejection', async () => {
      const user = userEvent.setup();
      vi.mocked(assessmentApi.rejectAssessment).mockResolvedValue(
        mockApiResponses.rejectionSuccess
      );

      render(
        <ValidationWorkflow
          assessment={mockAssessment}
          onActionComplete={mockOnActionComplete}
        />
      );

      const rejectButton = screen.getByText('Reject & Request Revisions');
      await user.click(rejectButton);

      await waitFor(async () => {
        const reasonTextarea = screen.getByLabelText('Clinical Feedback') as HTMLTextAreaElement;
        await user.type(reasonTextarea, 'Test reason');

        const submitButton = screen.getByText('Submit Rejection');
        await user.click(submitButton);
      });

      await waitFor(() => {
        expect(sweetalertConfig.showSuccessToast).toHaveBeenCalledWith(
          'Rejection recorded and notification queued'
        );
      });
    });

    it('calls onActionComplete after successful rejection', async () => {
      const user = userEvent.setup();
      vi.mocked(assessmentApi.rejectAssessment).mockResolvedValue(
        mockApiResponses.rejectionSuccess
      );

      render(
        <ValidationWorkflow
          assessment={mockAssessment}
          onActionComplete={mockOnActionComplete}
        />
      );

      const rejectButton = screen.getByText('Reject & Request Revisions');
      await user.click(rejectButton);

      await waitFor(async () => {
        const reasonTextarea = screen.getByLabelText('Clinical Feedback') as HTMLTextAreaElement;
        await user.type(reasonTextarea, 'Test reason');

        const submitButton = screen.getByText('Submit Rejection');
        await user.click(submitButton);
      });

      await waitFor(() => {
        expect(mockOnActionComplete).toHaveBeenCalled();
      });
    });

    it('validates rejection reason is not empty', async () => {
      const user = userEvent.setup();
      render(
        <ValidationWorkflow
          assessment={mockAssessment}
          onActionComplete={mockOnActionComplete}
        />
      );

      const rejectButton = screen.getByText('Reject & Request Revisions');
      await user.click(rejectButton);

      await waitFor(async () => {
        const reasonTextarea = screen.getByLabelText('Clinical Feedback') as HTMLTextAreaElement;
        await user.type(reasonTextarea, '   '); // Only whitespace

        const submitButton = screen.getByText('Submit Rejection');
        await user.click(submitButton);
      });

      await waitFor(() => {
        expect(sweetalertConfig.showErrorToast).toHaveBeenCalledWith(
          'Please provide clinical reasoning for rejection.'
        );
      });
    });
  });

  describe('Risk Adjustment', () => {
    it('renders adjust risk score button', () => {
      render(
        <ValidationWorkflow
          assessment={{ ...mockAssessment, status: 'in_review' }}
          onActionComplete={mockOnActionComplete}
        />
      );

      expect(screen.getByText('Adjust Risk Score')).toBeInTheDocument();
    });

    it('opens risk adjustment dialog when button clicked', async () => {
      const user = userEvent.setup();
      render(
        <ValidationWorkflow
          assessment={{ ...mockAssessment, status: 'in_review' }}
          onActionComplete={mockOnActionComplete}
        />
      );

      const adjustButton = screen.getByText('Adjust Risk Score');
      await user.click(adjustButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Adjust Risk Score')).toBeInTheDocument();
        expect(screen.getByLabelText('New Risk Score')).toBeInTheDocument();
      });
    });

    it('loads risk adjustment history on mount', async () => {
      render(
        <ValidationWorkflow
          assessment={mockAssessment}
          onActionComplete={mockOnActionComplete}
        />
      );

      await waitFor(() => {
        expect(assessmentApi.getRiskAdjustments).toHaveBeenCalledWith(mockAssessment.id);
      });
    });
  });
});
