'use client';

import type { Meta, StoryObj } from '@storybook/react';
import { Breadcrumb } from './breadcrumb';
import { Heart, FileText, User, Building2, BarChart3, Settings } from 'lucide-react';

const meta = {
  title: 'Layout/Breadcrumb',
  component: Breadcrumb,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Breadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

// Simple breadcrumb
export const Simple: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Overview' },
    ],
  },
};

// Without home icon
export const WithoutHomeIcon: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Overview' },
    ],
    showHomeIcon: false,
  },
};

// Healthcare workflow breadcrumbs
export const AssessmentDetail: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Assessments', href: '/assessments', icon: Heart },
      { label: 'Patient Assessment #12345' },
    ],
  },
};

export const ReferralWorkflow: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Referrals', href: '/referrals', icon: FileText },
      { label: 'Create New Referral' },
    ],
  },
};

export const PatientProfile: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Patients', href: '/patients', icon: User },
      { label: 'Juan Dela Cruz', href: '/patients/123' },
      { label: 'Medical History' },
    ],
  },
};

export const FacilityManagement: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Facilities', href: '/facilities', icon: Building2 },
      { label: 'Philippine Heart Center', href: '/facilities/phc' },
      { label: 'Edit Details' },
    ],
  },
};

export const AnalyticsDashboard: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Analytics', href: '/analytics', icon: BarChart3 },
      { label: 'CVD Risk Trends', href: '/analytics/cvd-risk' },
      { label: 'Regional Analysis' },
    ],
  },
};

export const SettingsPage: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Settings', href: '/settings', icon: Settings },
      { label: 'User Management', href: '/settings/users' },
      { label: 'Role Permissions' },
    ],
  },
};

// Deep navigation
export const DeepNavigation: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Assessments', href: '/dashboard/assessments' },
      { label: 'High Risk', href: '/dashboard/assessments/high-risk' },
      { label: 'Patient Details', href: '/dashboard/assessments/high-risk/123' },
      { label: 'Validation' },
    ],
  },
};

// Single level
export const SingleLevel: Story = {
  args: {
    items: [{ label: 'Dashboard' }],
  },
};

// Two levels
export const TwoLevels: Story = {
  args: {
    items: [{ label: 'Home', href: '/' }, { label: 'Dashboard' }],
  },
};

// All items with icons
export const AllWithIcons: Story = {
  args: {
    items: [
      { label: 'Home', href: '/', icon: Heart },
      { label: 'Assessments', href: '/assessments', icon: Heart },
      { label: 'Validation', icon: FileText },
    ],
  },
};

// Custom separator
export const CustomSeparator: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Assessments', href: '/assessments' },
      { label: 'Details' },
    ],
    separator: <span className="text-muted-foreground">/</span>,
  },
};

// Long breadcrumb
export const LongBreadcrumb: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Administration', href: '/admin' },
      { label: 'Healthcare Facilities', href: '/admin/facilities' },
      { label: 'Philippine Heart Center', href: '/admin/facilities/phc' },
      { label: 'Department Management', href: '/admin/facilities/phc/departments' },
      { label: 'Cardiology Department', href: '/admin/facilities/phc/departments/cardio' },
      { label: 'Staff Assignments' },
    ],
  },
};

// Clinical validation workflow
export const ClinicalValidation: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Assessments', href: '/assessments', icon: Heart },
      { label: 'Pending Validation', href: '/assessments/pending' },
      { label: 'High Risk Patients', href: '/assessments/pending/high-risk' },
      { label: 'Assessment #ASM-2024-00123' },
    ],
  },
};
