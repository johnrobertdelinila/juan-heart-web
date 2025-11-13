import type { SweetAlertResult } from 'sweetalert2';

// Lazy load SweetAlert2 to reduce initial bundle size
const loadSwal = async () => {
  const { default: Swal } = await import('sweetalert2');
  return Swal;
};

// Custom styling for Juan Heart theme
const customStyles = {
  confirmButtonColor: '#DC2626', // Heart Red
  cancelButtonColor: '#6B7280', // Gray
  customClass: {
    popup: 'font-sans',
    title: 'text-gray-900',
    htmlContainer: 'text-gray-700',
    confirmButton: 'rounded-md px-4 py-2 font-medium',
    cancelButton: 'rounded-md px-4 py-2 font-medium',
  },
};

/**
 * Format appointment type for display
 */
const formatAppointmentType = (type: string): string => {
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Show confirmation dialog for confirming an appointment
 */
export const showConfirmAppointmentDialog = async (
  patientName: string,
  appointmentType: string
): Promise<SweetAlertResult> => {
  const Swal = await loadSwal();
  return Swal.fire({
    title: 'Confirm Appointment',
    html: `
      <div class="space-y-4">
        <p class="text-gray-700">Are you sure you want to confirm this appointment?</p>
        <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
            <span class="font-semibold text-gray-900">${patientName}</span>
          </div>
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <span class="text-sm text-gray-600">${formatAppointmentType(appointmentType)}</span>
          </div>
        </div>
      </div>
    `,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Confirm Appointment',
    cancelButtonText: 'Cancel',
    ...customStyles,
    reverseButtons: true,
  });
};

/**
 * Show confirmation dialog for checking in a patient
 */
export const showCheckInPatientDialog = async (
  patientName: string,
  appointmentType: string
): Promise<SweetAlertResult> => {
  const Swal = await loadSwal();
  return Swal.fire({
    title: 'Check In Patient',
    html: `
      <div class="space-y-4">
        <p class="text-gray-700">Are you sure you want to check in this patient?</p>
        <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
            <span class="font-semibold text-gray-900">${patientName}</span>
          </div>
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <span class="text-sm text-gray-600">${formatAppointmentType(appointmentType)}</span>
          </div>
        </div>
        <p class="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-md p-2">
          The patient's status will be updated to "checked in" and they will be added to the queue.
        </p>
      </div>
    `,
    icon: 'info',
    showCancelButton: true,
    confirmButtonText: 'Check In',
    cancelButtonText: 'Cancel',
    ...customStyles,
    reverseButtons: true,
  });
};

/**
 * Show validation dialog for assessing an assessment
 */
export const showValidateAssessmentDialog = async (
  patientName: string,
  currentRiskLevel: string,
  mlRiskScore: number | undefined
): Promise<SweetAlertResult & { value?: { validated_risk_score: number; validation_notes: string; validation_agrees_with_ml: boolean } }> => {
  const Swal = await loadSwal();
  return Swal.fire({
    title: 'Validate Assessment',
    html: `
      <div class="space-y-4">
        <p class="text-gray-700">Provide clinical validation for this assessment</p>
        <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
            <span class="font-semibold text-gray-900">${patientName}</span>
          </div>
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span class="text-sm text-gray-600">Current Risk: <span class="font-semibold">${currentRiskLevel}</span>${mlRiskScore ? ` (ML Score: ${mlRiskScore})` : ''}</span>
          </div>
        </div>

        <div class="text-left space-y-3">
          <div>
            <label for="risk-score" class="block text-sm font-medium text-gray-700 mb-1">
              Validated Risk Score (0-100) *
            </label>
            <input
              id="risk-score"
              type="number"
              min="0"
              max="100"
              class="swal2-input w-full"
              placeholder="Enter risk score"
              value="${mlRiskScore || 50}"
              style="margin: 0; width: 100%;"
            />
            <p class="text-xs text-gray-500 mt-1">
              Low: 0-39, Moderate: 40-69, High: 70-100
            </p>
          </div>

          <div>
            <label class="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                id="agrees-ml"
                type="checkbox"
                class="rounded border-gray-300"
                ${mlRiskScore ? 'checked' : ''}
              />
              <span>Clinical assessment agrees with ML prediction</span>
            </label>
          </div>

          <div>
            <label for="validation-notes" class="block text-sm font-medium text-gray-700 mb-1">
              Validation Notes (Optional)
            </label>
            <textarea
              id="validation-notes"
              class="swal2-textarea"
              placeholder="Enter clinical observations, reasoning, or additional notes..."
              rows="3"
              style="margin: 0; width: 100%;"
            ></textarea>
          </div>
        </div>
      </div>
    `,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Validate Assessment',
    cancelButtonText: 'Cancel',
    ...customStyles,
    reverseButtons: true,
    focusConfirm: false,
    preConfirm: () => {
      const riskScoreInput = document.getElementById('risk-score') as HTMLInputElement;
      const agreesInput = document.getElementById('agrees-ml') as HTMLInputElement;
      const notesInput = document.getElementById('validation-notes') as HTMLTextAreaElement;

      const riskScore = parseInt(riskScoreInput.value);

      if (!riskScoreInput.value || isNaN(riskScore)) {
        Swal.showValidationMessage('Please enter a valid risk score');
        return false;
      }

      if (riskScore < 0 || riskScore > 100) {
        Swal.showValidationMessage('Risk score must be between 0 and 100');
        return false;
      }

      return {
        validated_risk_score: riskScore,
        validation_notes: notesInput.value.trim(),
        validation_agrees_with_ml: agreesInput.checked,
      };
    },
  });
};

/**
 * Show success notification
 */
export const showSuccessToast = async (message: string): Promise<SweetAlertResult> => {
  const Swal = await loadSwal();
  return Swal.fire({
    toast: true,
    position: 'top-end',
    icon: 'success',
    title: message,
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    },
  });
};

/**
 * Show error notification
 */
export const showErrorToast = async (message: string, details?: string): Promise<SweetAlertResult> => {
  const Swal = await loadSwal();
  return Swal.fire({
    icon: 'error',
    title: 'Oops...',
    text: message,
    footer: details ? `<p class="text-sm text-gray-500">${details}</p>` : undefined,
    ...customStyles,
  });
};

/**
 * Show loading indicator
 */
export const showLoadingDialog = async (message: string = 'Processing...'): Promise<void> => {
  const Swal = await loadSwal();
  Swal.fire({
    title: message,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });
};

/**
 * Close any open SweetAlert2 dialog
 */
export const closeDialog = async (): Promise<void> => {
  const Swal = await loadSwal();
  Swal.close();
};