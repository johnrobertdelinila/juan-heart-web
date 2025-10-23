import type { Meta, StoryObj } from '@storybook/react';
import { Label } from './label';
import { Input } from './input';
import { AlertCircle, Info, CheckCircle2 } from 'lucide-react';

const meta = {
  title: 'UI/Label',
  component: Label,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: '400px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic label variations
export const Default: Story = {
  args: {
    children: 'Patient Name',
    htmlFor: 'patient-name',
  },
};

export const WithInput: Story = {
  render: () => (
    <div className="grid gap-2">
      <Label htmlFor="name">Full Name</Label>
      <Input id="name" placeholder="Juan Dela Cruz" />
    </div>
  ),
};

export const Required: Story = {
  render: () => (
    <div className="grid gap-2">
      <Label htmlFor="email">
        Email Address <span className="text-destructive">*</span>
      </Label>
      <Input id="email" type="email" placeholder="patient@example.com" required />
    </div>
  ),
};

export const WithDescription: Story = {
  render: () => (
    <div className="grid gap-2">
      <Label htmlFor="patient-id">Patient ID</Label>
      <Input id="patient-id" placeholder="PHC-2025-00001" />
      <p className="text-muted-foreground text-sm">
        Unique identifier assigned by Philippine Heart Center
      </p>
    </div>
  ),
};

export const WithError: Story = {
  render: () => (
    <div className="grid gap-2">
      <Label htmlFor="blood-sugar" className="text-destructive">
        Blood Sugar Level (mg/dL)
      </Label>
      <Input
        id="blood-sugar"
        type="number"
        placeholder="100"
        aria-invalid="true"
        className="border-destructive"
      />
      <p className="text-destructive text-sm">Value must be between 0 and 600</p>
    </div>
  ),
};

export const WithSuccess: Story = {
  render: () => (
    <div className="grid gap-2">
      <Label htmlFor="validated" className="text-success">
        Clinical Validation
      </Label>
      <Input id="validated" value="Assessment validated successfully" disabled />
      <p className="text-success text-sm">Validation completed by Dr. Santos</p>
    </div>
  ),
};

// Healthcare-specific examples with icons
export const WithInfoIcon: Story = {
  render: () => (
    <div className="grid gap-2">
      <Label htmlFor="risk-score">
        <Info className="text-info size-4" />
        Risk Score
      </Label>
      <Input id="risk-score" type="number" placeholder="75" min="0" max="100" />
      <p className="text-muted-foreground text-sm">Score calculated based on WHO guidelines</p>
    </div>
  ),
};

export const WithWarningIcon: Story = {
  render: () => (
    <div className="grid gap-2">
      <Label htmlFor="cholesterol">
        <AlertCircle className="text-warning size-4" />
        Total Cholesterol (mg/dL)
      </Label>
      <Input id="cholesterol" type="number" placeholder="240" />
      <p className="text-warning text-sm">Borderline high cholesterol detected</p>
    </div>
  ),
};

export const WithCheckIcon: Story = {
  render: () => (
    <div className="grid gap-2">
      <Label htmlFor="blood-pressure">
        <CheckCircle2 className="text-success size-4" />
        Blood Pressure (mmHg)
      </Label>
      <Input id="blood-pressure" value="120/80" disabled />
      <p className="text-success text-sm">Normal blood pressure</p>
    </div>
  ),
};

// Multiple related fields
export const VitalSigns: Story = {
  render: () => (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <Label htmlFor="systolic">
          Systolic BP <span className="text-muted-foreground">(mmHg)</span>
        </Label>
        <Input id="systolic" type="number" placeholder="120" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="diastolic">
          Diastolic BP <span className="text-muted-foreground">(mmHg)</span>
        </Label>
        <Input id="diastolic" type="number" placeholder="80" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="heart-rate">
          Heart Rate <span className="text-muted-foreground">(bpm)</span>
        </Label>
        <Input id="heart-rate" type="number" placeholder="72" />
      </div>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="grid gap-2" data-disabled="true">
      <Label htmlFor="disabled-field" className="opacity-50">
        Read-only Field
      </Label>
      <Input id="disabled-field" value="This field is disabled" disabled />
    </div>
  ),
};
