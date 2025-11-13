/**
 * ClinicalNotesEditor Component Tests
 *
 * Tests for the rich text clinical notes editor including
 * text formatting, attachments, visibility settings, and note history.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, userEvent } from '@/test-utils';
import { ClinicalNotesEditor } from '../clinical-notes-editor';
import { mockClinicalNote, mockApiResponses } from '@/test-utils';
import * as assessmentApi from '@/lib/api/assessment';
import * as sweetalertConfig from '@/lib/sweetalert-config';

// Mock the API module
vi.mock('@/lib/api/assessment', () => ({
  getClinicalNotes: vi.fn(),
  createClinicalNote: vi.fn(),
}));

// Mock SweetAlert2 toasts
vi.mock('@/lib/sweetalert-config', () => ({
  showSuccessToast: vi.fn().mockResolvedValue(undefined),
  showErrorToast: vi.fn().mockResolvedValue(undefined),
}));

describe('ClinicalNotesEditor', () => {
  const mockAssessmentId = 1;

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock for fetching notes
    vi.mocked(assessmentApi.getClinicalNotes).mockResolvedValue(
      mockApiResponses.clinicalNotes
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders clinical notes editor', async () => {
      render(<ClinicalNotesEditor assessmentId={mockAssessmentId} />);

      await waitFor(() => {
        expect(screen.getByText('Clinical Notes & Attachments')).toBeInTheDocument();
        expect(screen.getByText('Rich Text Annotation')).toBeInTheDocument();
      });
    });

    it('loads clinical notes on mount', async () => {
      render(<ClinicalNotesEditor assessmentId={mockAssessmentId} />);

      await waitFor(() => {
        expect(assessmentApi.getClinicalNotes).toHaveBeenCalledWith(mockAssessmentId);
      });
    });

    it('shows loading state while fetching notes', () => {
      vi.mocked(assessmentApi.getClinicalNotes).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockApiResponses.clinicalNotes), 100))
      );

      render(<ClinicalNotesEditor assessmentId={mockAssessmentId} />);

      expect(screen.getByText('Loading clinical notes...')).toBeInTheDocument();
    });

    it('displays loaded notes in version history', async () => {
      render(<ClinicalNotesEditor assessmentId={mockAssessmentId} />);

      await waitFor(() => {
        expect(screen.getByText('Version History')).toBeInTheDocument();
        expect(screen.getByText('1 notes')).toBeInTheDocument();
      });
    });

    it('shows empty state when no notes exist', async () => {
      vi.mocked(assessmentApi.getClinicalNotes).mockResolvedValue({
        success: true,
        data: [],
        timestamp: new Date().toISOString(),
      });

      render(<ClinicalNotesEditor assessmentId={mockAssessmentId} />);

      await waitFor(() => {
        expect(screen.getByText(/No clinical notes recorded yet/i)).toBeInTheDocument();
      });
    });
  });

  describe('Rich Text Editor', () => {
    it('renders contentEditable div for text input', async () => {
      render(<ClinicalNotesEditor assessmentId={mockAssessmentId} />);

      await waitFor(() => {
        const editor = screen.getByLabelText('Clinical notes rich text editor');
        expect(editor).toBeInTheDocument();
        expect(editor).toHaveAttribute('contenteditable', 'true');
      });
    });

    it('renders formatting toolbar buttons', async () => {
      render(<ClinicalNotesEditor assessmentId={mockAssessmentId} />);

      await waitFor(() => {
        // Check for toolbar buttons (using aria-label for screen readers)
        const boldButton = screen.getByRole('button', { name: /bold/i });
        const italicButton = screen.getByRole('button', { name: /italic/i });
        const underlineButton = screen.getByRole('button', { name: /underline/i });

        expect(boldButton).toBeInTheDocument();
        expect(italicButton).toBeInTheDocument();
        expect(underlineButton).toBeInTheDocument();
      });
    });

    it('allows typing text into editor', async () => {
      const user = userEvent.setup();
      render(<ClinicalNotesEditor assessmentId={mockAssessmentId} />);

      await waitFor(async () => {
        const editor = screen.getByLabelText('Clinical notes rich text editor');
        await user.click(editor);
        await user.keyboard('Patient shows improvement');

        expect(editor.textContent).toContain('Patient shows improvement');
      });
    });

    it('executes formatting commands when toolbar buttons clicked', async () => {
      const user = userEvent.setup();
      const execCommandSpy = vi.spyOn(document, 'execCommand');

      render(<ClinicalNotesEditor assessmentId={mockAssessmentId} />);

      await waitFor(async () => {
        const boldButton = screen.getByRole('button', { name: /bold/i });
        await user.click(boldButton);

        expect(execCommandSpy).toHaveBeenCalledWith('bold', false);
      });

      execCommandSpy.mockRestore();
    });
  });

  describe('Visibility Options', () => {
    it('renders all visibility option buttons', async () => {
      render(<ClinicalNotesEditor assessmentId={mockAssessmentId} />);

      await waitFor(() => {
        expect(screen.getByText('Internal Team')).toBeInTheDocument();
        expect(screen.getByText('Share with Mobile User')).toBeInTheDocument();
        expect(screen.getByText('Private Draft')).toBeInTheDocument();
      });
    });

    it('defaults to internal visibility', async () => {
      render(<ClinicalNotesEditor assessmentId={mockAssessmentId} />);

      await waitFor(() => {
        const internalButton = screen.getByText('Internal Team').closest('button');
        expect(internalButton).toHaveClass(/border-heart-red/);
      });
    });

    it('allows changing visibility option', async () => {
      const user = userEvent.setup();
      render(<ClinicalNotesEditor assessmentId={mockAssessmentId} />);

      await waitFor(async () => {
        const sharedButton = screen.getByText('Share with Mobile User').closest('button');
        await user.click(sharedButton!);

        expect(sharedButton).toHaveClass(/border-heart-red/);
      });
    });

    it('shows mobile notification toggle', async () => {
      render(<ClinicalNotesEditor assessmentId={mockAssessmentId} />);

      await waitFor(() => {
        expect(screen.getByText('Notify mobile user')).toBeInTheDocument();
        expect(screen.getByRole('switch')).toBeInTheDocument();
      });
    });

    it('disables mobile notification toggle when visibility is not shared', async () => {
      const user = userEvent.setup();
      render(<ClinicalNotesEditor assessmentId={mockAssessmentId} />);

      await waitFor(async () => {
        // Default is 'internal', switch should be disabled
        const toggle = screen.getByRole('switch');
        expect(toggle).toBeDisabled();

        // Change to 'shared'
        const sharedButton = screen.getByText('Share with Mobile User').closest('button');
        await user.click(sharedButton!);

        // Now toggle should be enabled
        expect(toggle).not.toBeDisabled();
      });
    });
  });

  describe('Attachments', () => {
    it('renders file upload input', async () => {
      render(<ClinicalNotesEditor assessmentId={mockAssessmentId} />);

      await waitFor(() => {
        const fileInput = screen.getByRole('button', { name: /drag and drop or select/i })
          .parentElement?.querySelector('input[type="file"]');
        expect(fileInput).toBeInTheDocument();
        expect(fileInput).toHaveAttribute('accept', 'image/*,application/pdf');
        expect(fileInput).toHaveAttribute('multiple');
      });
    });

    it('shows selected files after upload', async () => {
      const user = userEvent.setup();
      render(<ClinicalNotesEditor assessmentId={mockAssessmentId} />);

      await waitFor(async () => {
        const fileInput = screen.getByRole('button', { name: /drag and drop or select/i })
          .parentElement?.querySelector('input[type="file"]') as HTMLInputElement;

        const file = new File(['test content'], 'test-image.png', { type: 'image/png' });
        await user.upload(fileInput, file);

        expect(screen.getByText('test-image.png')).toBeInTheDocument();
      });
    });

    it('allows removing selected files', async () => {
      const user = userEvent.setup();
      render(<ClinicalNotesEditor assessmentId={mockAssessmentId} />);

      await waitFor(async () => {
        const fileInput = screen.getByRole('button', { name: /drag and drop or select/i })
          .parentElement?.querySelector('input[type="file"]') as HTMLInputElement;

        const file = new File(['test content'], 'test-image.png', { type: 'image/png' });
        await user.upload(fileInput, file);

        expect(screen.getByText('test-image.png')).toBeInTheDocument();

        // Find and click remove button
        const removeButton = screen.getByText('test-image.png')
          .parentElement?.querySelector('button');
        await user.click(removeButton!);

        expect(screen.queryByText('test-image.png')).not.toBeInTheDocument();
      });
    });

    it('handles multiple file uploads', async () => {
      const user = userEvent.setup();
      render(<ClinicalNotesEditor assessmentId={mockAssessmentId} />);

      await waitFor(async () => {
        const fileInput = screen.getByRole('button', { name: /drag and drop or select/i })
          .parentElement?.querySelector('input[type="file"]') as HTMLInputElement;

        const file1 = new File(['test content 1'], 'test-1.png', { type: 'image/png' });
        const file2 = new File(['test content 2'], 'test-2.pdf', { type: 'application/pdf' });
        await user.upload(fileInput, [file1, file2]);

        expect(screen.getByText('test-1.png')).toBeInTheDocument();
        expect(screen.getByText('test-2.pdf')).toBeInTheDocument();
      });
    });
  });

  describe('Note Validation and Sanitization', () => {
    it('validates that note content is not empty before saving', async () => {
      const user = userEvent.setup();
      render(<ClinicalNotesEditor assessmentId={mockAssessmentId} />);

      await waitFor(async () => {
        const saveButton = screen.getByText('Save Note');
        await user.click(saveButton);

        expect(sweetalertConfig.showErrorToast).toHaveBeenCalledWith(
          'Please enter clinical notes before saving.'
        );
      });
    });

    it('validates that note content is not just whitespace', async () => {
      const user = userEvent.setup();
      render(<ClinicalNotesEditor assessmentId={mockAssessmentId} />);

      await waitFor(async () => {
        const editor = screen.getByLabelText('Clinical notes rich text editor');
        // Set innerHTML to just a line break
        editor.innerHTML = '<br>';

        const saveButton = screen.getByText('Save Note');
        await user.click(saveButton);

        expect(sweetalertConfig.showErrorToast).toHaveBeenCalledWith(
          'Please enter clinical notes before saving.'
        );
      });
    });

    it('sanitizes script tags from content', async () => {
      const user = userEvent.setup();
      vi.mocked(assessmentApi.createClinicalNote).mockResolvedValue({
        success: true,
        message: 'Note created',
        data: mockClinicalNote,
        timestamp: new Date().toISOString(),
      });

      render(<ClinicalNotesEditor assessmentId={mockAssessmentId} />);

      await waitFor(async () => {
        const editor = screen.getByLabelText('Clinical notes rich text editor');
        editor.innerHTML = '<p>Normal text</p><script>alert("XSS")</script>';

        const saveButton = screen.getByText('Save Note');
        await user.click(saveButton);

        // Check that script tags were removed in the API call
        const createCall = vi.mocked(assessmentApi.createClinicalNote).mock.calls[0];
        expect(createCall[1].content).not.toContain('<script>');
        expect(createCall[1].content).toContain('Normal text');
      });
    });

    it('sanitizes inline event handlers from content', async () => {
      const user = userEvent.setup();
      vi.mocked(assessmentApi.createClinicalNote).mockResolvedValue({
        success: true,
        message: 'Note created',
        data: mockClinicalNote,
        timestamp: new Date().toISOString(),
      });

      render(<ClinicalNotesEditor assessmentId={mockAssessmentId} />);

      await waitFor(async () => {
        const editor = screen.getByLabelText('Clinical notes rich text editor');
        editor.innerHTML = '<p onclick="alert(\'XSS\')">Click me</p>';

        const saveButton = screen.getByText('Save Note');
        await user.click(saveButton);

        // Check that onclick handlers were removed
        const createCall = vi.mocked(assessmentApi.createClinicalNote).mock.calls[0];
        expect(createCall[1].content).not.toContain('onclick');
      });
    });
  });

  describe('Note Submission', () => {
    it('calls createClinicalNote API with correct data', async () => {
      const user = userEvent.setup();
      const noteContent = '<p>Patient requires follow-up</p>';
      vi.mocked(assessmentApi.createClinicalNote).mockResolvedValue({
        success: true,
        message: 'Note created',
        data: mockClinicalNote,
        timestamp: new Date().toISOString(),
      });

      render(<ClinicalNotesEditor assessmentId={mockAssessmentId} />);

      await waitFor(async () => {
        const editor = screen.getByLabelText('Clinical notes rich text editor');
        editor.innerHTML = noteContent;

        const saveButton = screen.getByText('Save Note');
        await user.click(saveButton);
      });

      await waitFor(() => {
        expect(assessmentApi.createClinicalNote).toHaveBeenCalledWith(
          mockAssessmentId,
          expect.objectContaining({
            content: expect.stringContaining('Patient requires follow-up'),
            visibility: 'internal',
            mobile_visible: false,
          })
        );
      });
    });

    it('includes attachments in submission', async () => {
      const user = userEvent.setup();
      vi.mocked(assessmentApi.createClinicalNote).mockResolvedValue({
        success: true,
        message: 'Note created',
        data: mockClinicalNote,
        timestamp: new Date().toISOString(),
      });

      render(<ClinicalNotesEditor assessmentId={mockAssessmentId} />);

      await waitFor(async () => {
        const editor = screen.getByLabelText('Clinical notes rich text editor');
        editor.innerHTML = '<p>Test note</p>';

        const fileInput = screen.getByRole('button', { name: /drag and drop or select/i })
          .parentElement?.querySelector('input[type="file"]') as HTMLInputElement;

        const file = new File(['test content'], 'test-file.pdf', { type: 'application/pdf' });
        await user.upload(fileInput, file);

        const saveButton = screen.getByText('Save Note');
        await user.click(saveButton);
      });

      await waitFor(() => {
        const createCall = vi.mocked(assessmentApi.createClinicalNote).mock.calls[0];
        expect(createCall[1].attachments).toHaveLength(1);
        expect(createCall[1].attachments?.[0].name).toBe('test-file.pdf');
      });
    });

    it('shows loading state during submission', async () => {
      const user = userEvent.setup();
      vi.mocked(assessmentApi.createClinicalNote).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          success: true,
          message: 'Note created',
          data: mockClinicalNote,
          timestamp: new Date().toISOString(),
        }), 100))
      );

      render(<ClinicalNotesEditor assessmentId={mockAssessmentId} />);

      await waitFor(async () => {
        const editor = screen.getByLabelText('Clinical notes rich text editor');
        editor.innerHTML = '<p>Test note</p>';

        const saveButton = screen.getByText('Save Note');
        await user.click(saveButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Saving')).toBeInTheDocument();
      });
    });

    it('shows success toast on successful save', async () => {
      const user = userEvent.setup();
      vi.mocked(assessmentApi.createClinicalNote).mockResolvedValue({
        success: true,
        message: 'Note created',
        data: mockClinicalNote,
        timestamp: new Date().toISOString(),
      });

      render(<ClinicalNotesEditor assessmentId={mockAssessmentId} />);

      await waitFor(async () => {
        const editor = screen.getByLabelText('Clinical notes rich text editor');
        editor.innerHTML = '<p>Test note</p>';

        const saveButton = screen.getByText('Save Note');
        await user.click(saveButton);
      });

      await waitFor(() => {
        expect(sweetalertConfig.showSuccessToast).toHaveBeenCalledWith('Clinical note saved');
      });
    });

    it('resets editor after successful save', async () => {
      const user = userEvent.setup();
      vi.mocked(assessmentApi.createClinicalNote).mockResolvedValue({
        success: true,
        message: 'Note created',
        data: mockClinicalNote,
        timestamp: new Date().toISOString(),
      });

      render(<ClinicalNotesEditor assessmentId={mockAssessmentId} />);

      await waitFor(async () => {
        const editor = screen.getByLabelText('Clinical notes rich text editor');
        editor.innerHTML = '<p>Test note</p>';

        const saveButton = screen.getByText('Save Note');
        await user.click(saveButton);
      });

      await waitFor(() => {
        const editor = screen.getByLabelText('Clinical notes rich text editor');
        expect(editor.innerHTML).toBe('');
      });
    });

    it('reloads notes after successful save', async () => {
      const user = userEvent.setup();
      vi.mocked(assessmentApi.createClinicalNote).mockResolvedValue({
        success: true,
        message: 'Note created',
        data: mockClinicalNote,
        timestamp: new Date().toISOString(),
      });

      render(<ClinicalNotesEditor assessmentId={mockAssessmentId} />);

      // Clear initial load call
      vi.clearAllMocks();

      await waitFor(async () => {
        const editor = screen.getByLabelText('Clinical notes rich text editor');
        editor.innerHTML = '<p>Test note</p>';

        const saveButton = screen.getByText('Save Note');
        await user.click(saveButton);
      });

      await waitFor(() => {
        expect(assessmentApi.getClinicalNotes).toHaveBeenCalledWith(mockAssessmentId);
      });
    });

    it('shows error toast on save failure', async () => {
      const user = userEvent.setup();
      vi.mocked(assessmentApi.createClinicalNote).mockRejectedValue(
        new Error('Network error')
      );

      render(<ClinicalNotesEditor assessmentId={mockAssessmentId} />);

      await waitFor(async () => {
        const editor = screen.getByLabelText('Clinical notes rich text editor');
        editor.innerHTML = '<p>Test note</p>';

        const saveButton = screen.getByText('Save Note');
        await user.click(saveButton);
      });

      await waitFor(() => {
        expect(sweetalertConfig.showErrorToast).toHaveBeenCalledWith(
          'Unable to save clinical note',
          'Network error'
        );
      });
    });
  });

  describe('Clear Button', () => {
    it('clears editor content when clear button clicked', async () => {
      const user = userEvent.setup();
      render(<ClinicalNotesEditor assessmentId={mockAssessmentId} />);

      await waitFor(async () => {
        const editor = screen.getByLabelText('Clinical notes rich text editor');
        editor.innerHTML = '<p>Test content</p>';

        const clearButton = screen.getByText('Clear');
        await user.click(clearButton);

        expect(editor.innerHTML).toBe('');
      });
    });

    it('clears attachments when clear button clicked', async () => {
      const user = userEvent.setup();
      render(<ClinicalNotesEditor assessmentId={mockAssessmentId} />);

      await waitFor(async () => {
        const fileInput = screen.getByRole('button', { name: /drag and drop or select/i })
          .parentElement?.querySelector('input[type="file"]') as HTMLInputElement;

        const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
        await user.upload(fileInput, file);

        expect(screen.getByText('test.pdf')).toBeInTheDocument();

        const clearButton = screen.getByText('Clear');
        await user.click(clearButton);

        expect(screen.queryByText('test.pdf')).not.toBeInTheDocument();
      });
    });
  });

  describe('Note History', () => {
    it('displays note version in history', async () => {
      render(<ClinicalNotesEditor assessmentId={mockAssessmentId} />);

      await waitFor(() => {
        expect(screen.getByText('v1')).toBeInTheDocument();
      });
    });

    it('displays note author in history', async () => {
      render(<ClinicalNotesEditor assessmentId={mockAssessmentId} />);

      await waitFor(() => {
        expect(screen.getByText('Dr. Maria Santos')).toBeInTheDocument();
      });
    });

    it('displays note content in history', async () => {
      render(<ClinicalNotesEditor assessmentId={mockAssessmentId} />);

      await waitFor(() => {
        expect(screen.getByText(/Patient shows signs of hypertension/i)).toBeInTheDocument();
      });
    });

    it('shows shared/internal badge on notes', async () => {
      render(<ClinicalNotesEditor assessmentId={mockAssessmentId} />);

      await waitFor(() => {
        expect(screen.getByText('Internal')).toBeInTheDocument();
      });
    });

    it('allows loading note into editor', async () => {
      const user = userEvent.setup();
      render(<ClinicalNotesEditor assessmentId={mockAssessmentId} />);

      await waitFor(async () => {
        const loadButton = screen.getByRole('button', { name: /load into editor/i });
        await user.click(loadButton);

        const editor = screen.getByLabelText('Clinical notes rich text editor');
        expect(editor.innerHTML).toContain('Patient shows signs of hypertension');
      });
    });
  });
});
