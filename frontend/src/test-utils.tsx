/**
 * Testing Utilities for Juan Heart Web Application
 *
 * Provides custom render functions, mock providers, and test helpers
 * for unit and integration testing of React components.
 */

import { render as rtlRender, RenderOptions } from '@testing-library/react';
import { ReactElement, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/**
 * Create a new QueryClient for each test to ensure isolation
 */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Disable retries in tests
        gcTime: 0, // Disable garbage collection
        staleTime: 0, // Always treat data as stale
      },
      mutations: {
        retry: false,
      },
    },
  });
}

/**
 * All Providers Wrapper
 * Wraps components with necessary context providers for testing
 */
interface AllProvidersProps {
  children: ReactNode;
  queryClient?: QueryClient;
}

function AllProviders({ children, queryClient }: AllProvidersProps) {
  const client = queryClient || createTestQueryClient();

  return (
    <QueryClientProvider client={client}>
      {children}
    </QueryClientProvider>
  );
}

/**
 * Custom render function that includes all necessary providers
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
}

export function render(
  ui: ReactElement,
  options?: CustomRenderOptions
) {
  const { queryClient, ...renderOptions } = options || {};

  return rtlRender(ui, {
    wrapper: ({ children }) => (
      <AllProviders queryClient={queryClient}>{children}</AllProviders>
    ),
    ...renderOptions,
  });
}

/**
 * Mock Assessment Data
 * Realistic test data for assessment components
 */
export const mockAssessment = {
  id: 1,
  mobile_user_id: 'test-user-123',
  session_id: 'session-456',
  assessment_external_id: 'EXT-001',

  // Patient information
  patient_first_name: 'Juan',
  patient_last_name: 'dela Cruz',
  patient_date_of_birth: '1960-05-15',
  patient_sex: 'Male' as const,
  patient_email: 'juan@example.com',
  patient_phone: '+639171234567',

  // Assessment metadata
  assessment_date: '2025-11-10T08:30:00Z',
  version: '1.0.0',
  algorithm_version: 'v2.1',
  completion_rate: 95,
  assessment_duration_minutes: 15,
  data_quality_score: 92,

  // Location
  country: 'Philippines',
  region: 'Metro Manila',
  city: 'Quezon City',
  latitude: 14.6760,
  longitude: 121.0437,

  // Risk scores
  ml_risk_score: 72,
  ml_risk_level: 'High',
  rule_based_score: 68,
  rule_based_level: 'Moderate',
  final_risk_score: 70,
  final_risk_level: 'High' as const,
  urgency: 'Urgent' as const,
  recommended_action: 'Referral to cardiologist recommended within 48 hours',

  // Validation
  status: 'pending' as const,
  validated_by: undefined,
  validated_at: undefined,
  validation_notes: undefined,
  validation_agrees_with_ml: undefined,

  // Timestamps
  created_at: '2025-11-10T08:45:00Z',
  updated_at: '2025-11-10T08:45:00Z',

  // Relationships
  validator: undefined,
};

/**
 * Mock Validated Assessment
 */
export const mockValidatedAssessment = {
  ...mockAssessment,
  status: 'validated' as const,
  validated_by: 1,
  validated_at: '2025-11-10T09:00:00Z',
  validation_notes: 'Assessment reviewed and approved. Patient requires follow-up.',
  validation_agrees_with_ml: true,
  validator: {
    id: 1,
    first_name: 'Dr. Maria',
    last_name: 'Santos',
  },
};

/**
 * Mock Rejected Assessment
 */
export const mockRejectedAssessment = {
  ...mockAssessment,
  status: 'rejected' as const,
  validated_by: 1,
  validated_at: '2025-11-10T09:00:00Z',
  validation_notes: 'Missing vital signs data. Please recollect blood pressure readings.',
  validation_agrees_with_ml: false,
  validator: {
    id: 1,
    first_name: 'Dr. Maria',
    last_name: 'Santos',
  },
};

/**
 * Mock Clinical Note
 */
export const mockClinicalNote = {
  id: 1,
  current_version: 1,
  latest_content: '<p>Patient shows signs of hypertension. Recommend lifestyle modifications and medication.</p>',
  visibility: 'internal' as const,
  mobile_visible: false,
  created_at: '2025-11-10T09:15:00Z',
  author: {
    first_name: 'Dr. Maria',
    last_name: 'Santos',
  },
  versions: [
    {
      id: 1,
      version: 1,
      content: '<p>Patient shows signs of hypertension. Recommend lifestyle modifications and medication.</p>',
      visibility: 'internal' as const,
      created_at: '2025-11-10T09:15:00Z',
      author: {
        first_name: 'Dr. Maria',
        last_name: 'Santos',
      },
      attachments: [],
    },
  ],
};

/**
 * Mock Risk Adjustment
 */
export const mockRiskAdjustment = {
  id: 1,
  old_score: 70,
  old_level: 'High',
  new_score: 75,
  new_level: 'High',
  difference: 5,
  justification: 'Adjusted for family history of cardiovascular disease',
  alert_triggered: false,
  created_at: '2025-11-10T09:20:00Z',
  clinician: {
    first_name: 'Dr. Maria',
    last_name: 'Santos',
  },
};

/**
 * Mock API Responses
 */
export const mockApiResponses = {
  success: {
    success: true,
    message: 'Operation successful',
    data: mockAssessment,
    timestamp: new Date().toISOString(),
  },
  error: {
    success: false,
    message: 'Operation failed',
    error: 'Internal server error',
    timestamp: new Date().toISOString(),
  },
  validationSuccess: {
    success: true,
    message: 'Assessment validated successfully',
    data: mockValidatedAssessment,
    timestamp: new Date().toISOString(),
  },
  rejectionSuccess: {
    success: true,
    message: 'Assessment rejected successfully',
    data: mockRejectedAssessment,
    timestamp: new Date().toISOString(),
  },
  clinicalNotes: {
    success: true,
    data: [mockClinicalNote],
    timestamp: new Date().toISOString(),
  },
  riskAdjustments: {
    success: true,
    data: [mockRiskAdjustment],
    timestamp: new Date().toISOString(),
  },
};

/**
 * Mock fetch for API calls
 */
export function mockFetch(response: unknown, options?: { status?: number; delay?: number }) {
  return vi.fn(() =>
    Promise.resolve({
      ok: options?.status ? options.status >= 200 && options.status < 300 : true,
      status: options?.status || 200,
      json: () => new Promise((resolve) => {
        if (options?.delay) {
          setTimeout(() => resolve(response), options.delay);
        } else {
          resolve(response);
        }
      }),
    })
  ) as unknown as typeof fetch;
}

/**
 * Wait for async operations to complete
 */
export function waitForAsync(ms = 0) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Re-export everything from @testing-library/react
 */
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
