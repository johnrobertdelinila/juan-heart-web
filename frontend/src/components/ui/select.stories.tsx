import type { Meta, StoryObj } from '@storybook/react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from './select';
import { Label } from './label';

const meta = {
  title: 'UI/Select',
  component: Select,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: '400px', minHeight: '300px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic select variations
export const Default: Story = {
  render: () => (
    <Select>
      <SelectTrigger>
        <SelectValue placeholder="Select an option" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option1">Option 1</SelectItem>
        <SelectItem value="option2">Option 2</SelectItem>
        <SelectItem value="option3">Option 3</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <div className="grid gap-2">
      <Label htmlFor="gender">Gender</Label>
      <Select>
        <SelectTrigger id="gender">
          <SelectValue placeholder="Select gender" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="male">Male</SelectItem>
          <SelectItem value="female">Female</SelectItem>
          <SelectItem value="other">Other</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};

export const SmallSize: Story = {
  render: () => (
    <div className="grid gap-2">
      <Label htmlFor="status">Status</Label>
      <Select>
        <SelectTrigger id="status" size="sm">
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};

export const WithGroups: Story = {
  render: () => (
    <div className="grid gap-2">
      <Label htmlFor="region">Region</Label>
      <Select>
        <SelectTrigger id="region">
          <SelectValue placeholder="Select region" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Luzon</SelectLabel>
            <SelectItem value="ncr">National Capital Region</SelectItem>
            <SelectItem value="region3">Central Luzon</SelectItem>
            <SelectItem value="region4a">CALABARZON</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>Visayas</SelectLabel>
            <SelectItem value="region6">Western Visayas</SelectItem>
            <SelectItem value="region7">Central Visayas</SelectItem>
            <SelectItem value="region8">Eastern Visayas</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>Mindanao</SelectLabel>
            <SelectItem value="region11">Davao Region</SelectItem>
            <SelectItem value="region12">SOCCSKSARGEN</SelectItem>
            <SelectItem value="caraga">Caraga</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  ),
};

// Healthcare-specific examples
export const RiskLevel: Story = {
  render: () => (
    <div className="grid gap-2">
      <Label htmlFor="risk-level">
        CVD Risk Level <span className="text-destructive">*</span>
      </Label>
      <Select>
        <SelectTrigger id="risk-level">
          <SelectValue placeholder="Select risk level" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="low">
            <span className="flex items-center gap-2">
              <span className="bg-success size-2 rounded-full" />
              Low Risk (0-39)
            </span>
          </SelectItem>
          <SelectItem value="moderate">
            <span className="flex items-center gap-2">
              <span className="bg-warning size-2 rounded-full" />
              Moderate Risk (40-69)
            </span>
          </SelectItem>
          <SelectItem value="high">
            <span className="flex items-center gap-2">
              <span className="bg-destructive size-2 rounded-full" />
              High Risk (70-100)
            </span>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};

export const BloodType: Story = {
  render: () => (
    <div className="grid gap-2">
      <Label htmlFor="blood-type">Blood Type</Label>
      <Select>
        <SelectTrigger id="blood-type">
          <SelectValue placeholder="Select blood type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a-positive">A+</SelectItem>
          <SelectItem value="a-negative">A-</SelectItem>
          <SelectItem value="b-positive">B+</SelectItem>
          <SelectItem value="b-negative">B-</SelectItem>
          <SelectItem value="ab-positive">AB+</SelectItem>
          <SelectItem value="ab-negative">AB-</SelectItem>
          <SelectItem value="o-positive">O+</SelectItem>
          <SelectItem value="o-negative">O-</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};

export const FacilityType: Story = {
  render: () => (
    <div className="grid gap-2">
      <Label htmlFor="facility">Healthcare Facility Type</Label>
      <Select>
        <SelectTrigger id="facility">
          <SelectValue placeholder="Select facility type" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Primary Care</SelectLabel>
            <SelectItem value="rhc">Rural Health Center</SelectItem>
            <SelectItem value="chc">Community Health Center</SelectItem>
            <SelectItem value="bhc">Barangay Health Station</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>Secondary Care</SelectLabel>
            <SelectItem value="district-hospital">District Hospital</SelectItem>
            <SelectItem value="provincial-hospital">Provincial Hospital</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>Tertiary Care</SelectLabel>
            <SelectItem value="medical-center">Medical Center</SelectItem>
            <SelectItem value="specialty-hospital">Specialty Hospital</SelectItem>
            <SelectItem value="phc">Philippine Heart Center</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  ),
};

export const ReferralPriority: Story = {
  render: () => (
    <div className="grid gap-2">
      <Label htmlFor="priority">
        Referral Priority <span className="text-destructive">*</span>
      </Label>
      <Select>
        <SelectTrigger id="priority">
          <SelectValue placeholder="Select priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="emergency">
            <span className="text-destructive flex items-center gap-2">
              <span className="bg-destructive size-2 rounded-full" />
              Emergency - Immediate attention required
            </span>
          </SelectItem>
          <SelectItem value="urgent">
            <span className="text-warning flex items-center gap-2">
              <span className="bg-warning size-2 rounded-full" />
              Urgent - Within 24-48 hours
            </span>
          </SelectItem>
          <SelectItem value="routine">
            <span className="text-info flex items-center gap-2">
              <span className="bg-info size-2 rounded-full" />
              Routine - Within 1-2 weeks
            </span>
          </SelectItem>
          <SelectItem value="follow-up">
            <span className="text-muted-foreground flex items-center gap-2">
              <span className="bg-muted-foreground size-2 rounded-full" />
              Follow-up - Scheduled appointment
            </span>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};

export const Specialization: Story = {
  render: () => (
    <div className="grid gap-2">
      <Label htmlFor="specialization">Cardiologist Specialization</Label>
      <Select>
        <SelectTrigger id="specialization">
          <SelectValue placeholder="Select specialization" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="interventional">Interventional Cardiology</SelectItem>
          <SelectItem value="electrophysiology">Cardiac Electrophysiology</SelectItem>
          <SelectItem value="heart-failure">Heart Failure & Transplant</SelectItem>
          <SelectItem value="preventive">Preventive Cardiology</SelectItem>
          <SelectItem value="pediatric">Pediatric Cardiology</SelectItem>
          <SelectItem value="imaging">Cardiovascular Imaging</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};

export const AssessmentStatus: Story = {
  render: () => (
    <div className="grid gap-2">
      <Label htmlFor="assessment-status">Assessment Status</Label>
      <Select>
        <SelectTrigger id="assessment-status">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Assessments</SelectItem>
          <SelectSeparator />
          <SelectItem value="pending">
            <span className="flex items-center gap-2">
              <span className="bg-warning size-2 rounded-full" />
              Pending Validation
            </span>
          </SelectItem>
          <SelectItem value="validated">
            <span className="flex items-center gap-2">
              <span className="bg-success size-2 rounded-full" />
              Validated
            </span>
          </SelectItem>
          <SelectItem value="referred">
            <span className="flex items-center gap-2">
              <span className="bg-info size-2 rounded-full" />
              Referred
            </span>
          </SelectItem>
          <SelectItem value="completed">
            <span className="flex items-center gap-2">
              <span className="bg-muted-foreground size-2 rounded-full" />
              Completed
            </span>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};

export const DateRange: Story = {
  render: () => (
    <div className="grid gap-2">
      <Label htmlFor="date-range">Date Range</Label>
      <Select>
        <SelectTrigger id="date-range" size="sm">
          <SelectValue placeholder="Select range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="today">Today</SelectItem>
          <SelectItem value="yesterday">Yesterday</SelectItem>
          <SelectItem value="last-7-days">Last 7 days</SelectItem>
          <SelectItem value="last-30-days">Last 30 days</SelectItem>
          <SelectItem value="this-month">This month</SelectItem>
          <SelectItem value="last-month">Last month</SelectItem>
          <SelectItem value="custom">Custom range...</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="grid gap-2">
      <Label htmlFor="disabled-select" className="opacity-50">
        Disabled Select
      </Label>
      <Select disabled>
        <SelectTrigger id="disabled-select">
          <SelectValue placeholder="Cannot select" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option">Option</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};
