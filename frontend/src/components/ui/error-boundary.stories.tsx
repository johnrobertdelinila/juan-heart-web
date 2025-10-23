'use client';

import type { Meta, StoryObj } from '@storybook/react';
import {
  DefaultErrorFallback,
  MinimalErrorFallback,
  ClinicalErrorFallback,
  InlineError,
  EmptyState,
  ErrorBoundary,
} from './error-boundary';
import { Heart, Search, FileText, Users, Database } from 'lucide-react';
import { Button } from './button';

const meta = {
  title: 'UI/Error Handling',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;

// Mock error for testing
const mockError = new Error('Failed to load patient data from the server');
mockError.stack = `Error: Failed to load patient data from the server
    at fetchPatientData (api.ts:45:11)
    at async AssessmentPage (page.tsx:23:20)`;

const networkError = new Error('Network request failed: Connection timeout');
const dataError = new Error('Data validation failed: Invalid risk score format');

// Default error fallback
export const DefaultError: StoryObj = {
  render: () => (
    <div className="w-full max-w-2xl">
      <DefaultErrorFallback
        error={mockError}
        resetError={() => console.log('Reset error')}
        showDetails={false}
      />
    </div>
  ),
};

export const DefaultErrorWithDetails: StoryObj = {
  render: () => (
    <div className="w-full max-w-2xl">
      <DefaultErrorFallback
        error={mockError}
        resetError={() => console.log('Reset error')}
        showDetails={true}
      />
    </div>
  ),
};

// Minimal error fallback
export const MinimalError: StoryObj = {
  render: () => (
    <div className="w-full max-w-md">
      <MinimalErrorFallback
        error={new Error('Unable to load assessment details')}
        resetError={() => console.log('Reset error')}
      />
    </div>
  ),
};

// Clinical error fallback - Network Error
export const ClinicalNetworkError: StoryObj = {
  render: () => (
    <div className="w-full max-w-2xl">
      <ClinicalErrorFallback
        error={networkError}
        resetError={() => console.log('Reset error')}
        showDetails={false}
      />
    </div>
  ),
};

// Clinical error fallback - Data Error
export const ClinicalDataError: StoryObj = {
  render: () => (
    <div className="w-full max-w-2xl">
      <ClinicalErrorFallback
        error={dataError}
        resetError={() => console.log('Reset error')}
        showDetails={false}
      />
    </div>
  ),
};

// Clinical error with details
export const ClinicalErrorWithDetails: StoryObj = {
  render: () => (
    <div className="w-full max-w-2xl">
      <ClinicalErrorFallback
        error={mockError}
        resetError={() => console.log('Reset error')}
        showDetails={true}
      />
    </div>
  ),
};

// Inline error variations
export const InlineErrorDefault: StoryObj = {
  render: () => (
    <div className="w-full max-w-lg">
      <InlineError
        title="Failed to load"
        message="Unable to retrieve assessment data. Please try again."
        onRetry={() => console.log('Retry clicked')}
      />
    </div>
  ),
};

export const InlineErrorNoIcon: StoryObj = {
  render: () => (
    <div className="w-full max-w-lg">
      <InlineError
        title="Validation Error"
        message="The risk score must be between 0 and 100."
        showIcon={false}
      />
    </div>
  ),
};

export const InlineErrorNoRetry: StoryObj = {
  render: () => (
    <div className="w-full max-w-lg">
      <InlineError
        title="Permission Denied"
        message="You do not have permission to access this patient's records."
      />
    </div>
  ),
};

// Healthcare-specific inline errors
export const AssessmentLoadError: StoryObj = {
  render: () => (
    <div className="w-full max-w-lg space-y-4">
      <h3 className="text-lg font-semibold">Patient Assessment</h3>
      <InlineError
        title="Assessment Unavailable"
        message="This assessment could not be loaded. The record may have been deleted or you may not have permission to view it."
        onRetry={() => console.log('Retry')}
      />
    </div>
  ),
};

export const ReferralCreateError: StoryObj = {
  render: () => (
    <div className="w-full max-w-lg space-y-4">
      <h3 className="text-lg font-semibold">Create Referral</h3>
      <InlineError
        title="Referral Creation Failed"
        message="Unable to create referral. The target facility may be at full capacity or there may be missing required information."
        onRetry={() => console.log('Retry')}
      />
    </div>
  ),
};

export const SyncError: StoryObj = {
  render: () => (
    <div className="w-full max-w-lg space-y-4">
      <h3 className="text-lg font-semibold">Mobile App Sync</h3>
      <InlineError
        title="Sync Failed"
        message="Unable to synchronize data with the mobile app. Latest assessments may not be visible."
        onRetry={() => console.log('Retry sync')}
      />
    </div>
  ),
};

// Empty state variations
export const EmptyStateNoAssessments: StoryObj = {
  render: () => (
    <div className="w-full max-w-2xl">
      <EmptyState
        icon={<Heart className="size-16" />}
        title="No assessments found"
        description="There are no patient assessments matching your criteria. Try adjusting your filters or create a new assessment."
        action={{
          label: 'Create Assessment',
          onClick: () => console.log('Create clicked'),
        }}
      />
    </div>
  ),
};

export const EmptyStateNoReferrals: StoryObj = {
  render: () => (
    <div className="w-full max-w-2xl">
      <EmptyState
        icon={<FileText className="size-16" />}
        title="No active referrals"
        description="You don't have any active referrals at the moment. Referrals will appear here once created."
      />
    </div>
  ),
};

export const EmptyStateNoResults: StoryObj = {
  render: () => (
    <div className="w-full max-w-2xl">
      <EmptyState
        icon={<Search className="size-16" />}
        title="No results found"
        description="No patients match your search query. Try different keywords or check the spelling."
        action={{
          label: 'Clear Search',
          onClick: () => console.log('Clear search'),
        }}
      />
    </div>
  ),
};

export const EmptyStateNoPatients: StoryObj = {
  render: () => (
    <div className="w-full max-w-2xl">
      <EmptyState
        icon={<Users className="size-16" />}
        title="No patients registered"
        description="Get started by adding your first patient to the system."
        action={{
          label: 'Add Patient',
          onClick: () => console.log('Add patient'),
        }}
      />
    </div>
  ),
};

export const EmptyStateNoData: StoryObj = {
  render: () => (
    <div className="w-full max-w-2xl">
      <EmptyState
        icon={<Database className="size-16" />}
        title="No data available"
        description="There is no data to display for the selected time period. Try selecting a different date range."
      />
    </div>
  ),
};

// Error Boundary in action
const BuggyComponent = () => {
  const [shouldThrow, setShouldThrow] = React.useState(false);

  if (shouldThrow) {
    throw new Error('This is a test error from BuggyComponent');
  }

  return (
    <div className="space-y-4 rounded-lg border p-6">
      <h3 className="text-lg font-semibold">Working Component</h3>
      <p className="text-muted-foreground text-sm">
        This component is working normally. Click the button to trigger an error.
      </p>
      <Button variant="destructive" onClick={() => setShouldThrow(true)}>
        Trigger Error
      </Button>
    </div>
  );
};

export const ErrorBoundaryExample: StoryObj = {
  render: () => (
    <div className="w-full max-w-2xl">
      <ErrorBoundary showDetails={true}>
        <BuggyComponent />
      </ErrorBoundary>
    </div>
  ),
};

export const ErrorBoundaryWithCustomFallback: StoryObj = {
  render: () => (
    <div className="w-full max-w-2xl">
      <ErrorBoundary fallback={MinimalErrorFallback}>
        <BuggyComponent />
      </ErrorBoundary>
    </div>
  ),
};

export const ErrorBoundaryClinical: StoryObj = {
  render: () => (
    <div className="w-full max-w-2xl">
      <ErrorBoundary fallback={ClinicalErrorFallback} showDetails={true}>
        <BuggyComponent />
      </ErrorBoundary>
    </div>
  ),
};

// Multiple inline errors in form
export const FormWithErrors: StoryObj = {
  render: () => (
    <div className="w-full max-w-2xl space-y-4">
      <h2 className="text-2xl font-bold">Patient Assessment Form</h2>
      <InlineError
        title="Invalid Blood Pressure"
        message="Systolic pressure cannot be lower than diastolic pressure. Please check your measurements."
        showIcon={true}
      />
      <InlineError
        title="Missing Required Field"
        message="Patient age is required for risk calculation."
        showIcon={true}
      />
      <InlineError
        title="Data Format Error"
        message="Risk score must be a number between 0 and 100."
        showIcon={true}
      />
    </div>
  ),
};
