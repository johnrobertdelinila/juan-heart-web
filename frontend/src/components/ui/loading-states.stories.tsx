'use client';

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Spinner,
  LoadingOverlay,
  AssessmentCardSkeleton,
  PatientCardSkeleton,
  TableSkeleton,
  ChartSkeleton,
  DashboardSkeleton,
  FormSkeleton,
  ListSkeleton,
} from './loading-states';
import { Button } from './button';

const meta = {
  title: 'UI/Loading States',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;

// Spinner variations
export const SpinnerSmall: StoryObj = {
  render: () => <Spinner size="sm" />,
};

export const SpinnerMedium: StoryObj = {
  render: () => <Spinner size="md" />,
};

export const SpinnerLarge: StoryObj = {
  render: () => <Spinner size="lg" />,
};

export const SpinnerExtraLarge: StoryObj = {
  render: () => <Spinner size="xl" />,
};

// Spinner in button
export const SpinnerInButton: StoryObj = {
  render: () => (
    <div className="flex gap-2">
      <Button disabled>
        <Spinner size="sm" className="mr-2" />
        Loading...
      </Button>
      <Button variant="outline" disabled>
        <Spinner size="sm" className="mr-2" />
        Processing
      </Button>
    </div>
  ),
};

// Loading overlay
export const LoadingOverlayDefault: StoryObj = {
  render: () => (
    <div className="relative h-96 w-96">
      <div className="p-4">
        <p>Content behind overlay</p>
      </div>
      <LoadingOverlay />
    </div>
  ),
};

export const LoadingOverlayWithMessage: StoryObj = {
  render: () => (
    <div className="relative h-96 w-96">
      <div className="p-4">
        <p>Content behind overlay</p>
      </div>
      <LoadingOverlay message="Validating assessment..." />
    </div>
  ),
};

export const LoadingOverlayProcessing: StoryObj = {
  render: () => (
    <div className="relative h-96 w-96">
      <div className="p-4">
        <p>Content behind overlay</p>
      </div>
      <LoadingOverlay message="Processing patient data. Please wait..." />
    </div>
  ),
};

// Assessment card skeleton
export const AssessmentSkeleton: StoryObj = {
  render: () => (
    <div className="w-96">
      <AssessmentCardSkeleton />
    </div>
  ),
};

export const MultipleAssessmentSkeletons: StoryObj = {
  render: () => (
    <div className="grid w-full max-w-4xl gap-4 md:grid-cols-2">
      <AssessmentCardSkeleton />
      <AssessmentCardSkeleton />
      <AssessmentCardSkeleton />
      <AssessmentCardSkeleton />
    </div>
  ),
};

// Patient card skeleton
export const PatientSkeleton: StoryObj = {
  render: () => (
    <div className="w-96">
      <PatientCardSkeleton />
    </div>
  ),
};

export const MultiplePatientSkeletons: StoryObj = {
  render: () => (
    <div className="grid w-full max-w-4xl gap-4 md:grid-cols-2 lg:grid-cols-3">
      <PatientCardSkeleton />
      <PatientCardSkeleton />
      <PatientCardSkeleton />
    </div>
  ),
};

// Table skeleton
export const TableSkeletonSmall: StoryObj = {
  render: () => (
    <div className="w-full max-w-4xl">
      <TableSkeleton rows={3} columns={3} />
    </div>
  ),
};

export const TableSkeletonDefault: StoryObj = {
  render: () => (
    <div className="w-full max-w-4xl">
      <TableSkeleton rows={5} columns={5} />
    </div>
  ),
};

export const TableSkeletonLarge: StoryObj = {
  render: () => (
    <div className="w-full max-w-6xl">
      <TableSkeleton rows={10} columns={7} />
    </div>
  ),
};

// Chart skeleton
export const ChartSkeletonSingle: StoryObj = {
  render: () => (
    <div className="w-full max-w-2xl">
      <ChartSkeleton />
    </div>
  ),
};

export const ChartSkeletonMultiple: StoryObj = {
  render: () => (
    <div className="grid w-full max-w-6xl gap-4 md:grid-cols-2">
      <ChartSkeleton />
      <ChartSkeleton />
    </div>
  ),
};

// Dashboard skeleton
export const DashboardSkeletonFull: StoryObj = {
  render: () => (
    <div className="w-full max-w-7xl">
      <DashboardSkeleton />
    </div>
  ),
};

// Form skeleton
export const FormSkeletonDefault: StoryObj = {
  render: () => (
    <div className="w-full max-w-2xl">
      <FormSkeleton />
    </div>
  ),
};

// List skeleton
export const ListSkeletonSmall: StoryObj = {
  render: () => (
    <div className="w-full max-w-2xl">
      <ListSkeleton items={3} />
    </div>
  ),
};

export const ListSkeletonDefault: StoryObj = {
  render: () => (
    <div className="w-full max-w-2xl">
      <ListSkeleton items={5} />
    </div>
  ),
};

export const ListSkeletonLarge: StoryObj = {
  render: () => (
    <div className="w-full max-w-2xl">
      <ListSkeleton items={10} />
    </div>
  ),
};

// Healthcare workflow examples
export const LoadingAssessments: StoryObj = {
  render: () => (
    <div className="w-full max-w-7xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Patient Assessments</h2>
          <p className="text-muted-foreground">Loading assessments...</p>
        </div>
        <Spinner size="md" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AssessmentCardSkeleton />
        <AssessmentCardSkeleton />
        <AssessmentCardSkeleton />
        <AssessmentCardSkeleton />
        <AssessmentCardSkeleton />
        <AssessmentCardSkeleton />
      </div>
    </div>
  ),
};

export const LoadingReferrals: StoryObj = {
  render: () => (
    <div className="w-full max-w-7xl space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Active Referrals</h2>
        <Spinner size="md" />
      </div>
      <TableSkeleton rows={8} columns={6} />
    </div>
  ),
};

export const LoadingAnalytics: StoryObj = {
  render: () => (
    <div className="w-full max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">CVD Risk Analytics</h2>
        <Spinner size="md" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <ChartSkeleton />
        <ChartSkeleton />
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    </div>
  ),
};

export const LoadingPatientProfile: StoryObj = {
  render: () => (
    <div className="w-full max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-muted size-16 animate-pulse rounded-full" />
          <div className="space-y-2">
            <div className="bg-muted h-6 w-48 animate-pulse rounded" />
            <div className="bg-muted h-4 w-32 animate-pulse rounded" />
          </div>
        </div>
        <Spinner size="md" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <FormSkeleton />
        <div className="space-y-4">
          <ChartSkeleton />
        </div>
      </div>
    </div>
  ),
};

// Progressive loading example
export const ProgressiveLoading: StoryObj = {
  render: () => {
    const [stage, setStage] = React.useState(1);

    React.useEffect(() => {
      const interval = setInterval(() => {
        setStage((prev) => (prev >= 3 ? 1 : prev + 1));
      }, 2000);
      return () => clearInterval(interval);
    }, []);

    return (
      <div className="w-full max-w-4xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Loading Assessment Data</h2>
          <Spinner size="md" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {stage >= 1 ? <span className="text-success">✓</span> : <Spinner size="sm" />}
            <span className={stage >= 1 ? 'text-foreground' : 'text-muted-foreground'}>
              Fetching patient data...
            </span>
          </div>
          <div className="flex items-center gap-2">
            {stage >= 2 ? (
              <span className="text-success">✓</span>
            ) : stage === 1 ? (
              <Spinner size="sm" />
            ) : (
              <span className="text-muted-foreground">○</span>
            )}
            <span className={stage >= 2 ? 'text-foreground' : 'text-muted-foreground'}>
              Calculating risk scores...
            </span>
          </div>
          <div className="flex items-center gap-2">
            {stage >= 3 ? (
              <span className="text-success">✓</span>
            ) : stage === 2 ? (
              <Spinner size="sm" />
            ) : (
              <span className="text-muted-foreground">○</span>
            )}
            <span className={stage >= 3 ? 'text-foreground' : 'text-muted-foreground'}>
              Loading validation history...
            </span>
          </div>
        </div>
        <AssessmentCardSkeleton />
      </div>
    );
  },
};
