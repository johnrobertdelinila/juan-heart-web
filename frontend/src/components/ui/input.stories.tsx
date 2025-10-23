import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './input';
import { Label } from './label';

const meta = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'date', 'time'],
      description: 'HTML input type',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '400px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic input variations
export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="grid gap-2">
      <Label htmlFor="patient-name">Patient Name</Label>
      <Input id="patient-name" placeholder="Juan Dela Cruz" />
    </div>
  ),
};

export const Email: Story = {
  render: () => (
    <div className="grid gap-2">
      <Label htmlFor="email">Email Address</Label>
      <Input id="email" type="email" placeholder="patient@example.com" />
    </div>
  ),
};

export const Password: Story = {
  render: () => (
    <div className="grid gap-2">
      <Label htmlFor="password">Password</Label>
      <Input id="password" type="password" placeholder="Enter password" />
    </div>
  ),
};

export const Number: Story = {
  render: () => (
    <div className="grid gap-2">
      <Label htmlFor="age">Age</Label>
      <Input id="age" type="number" placeholder="45" min="0" max="120" />
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="grid gap-2">
      <Label htmlFor="disabled">Disabled Input</Label>
      <Input id="disabled" placeholder="Cannot edit" disabled />
    </div>
  ),
};

// Healthcare-specific examples
export const BloodPressure: Story = {
  render: () => (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="systolic">Systolic Blood Pressure (mmHg)</Label>
        <Input id="systolic" type="number" placeholder="120" min="0" max="300" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="diastolic">Diastolic Blood Pressure (mmHg)</Label>
        <Input id="diastolic" type="number" placeholder="80" min="0" max="200" />
      </div>
    </div>
  ),
};

export const HeartRate: Story = {
  render: () => (
    <div className="grid gap-2">
      <Label htmlFor="heart-rate">Heart Rate (bpm)</Label>
      <Input id="heart-rate" type="number" placeholder="72" min="30" max="250" />
    </div>
  ),
};

export const PatientID: Story = {
  render: () => (
    <div className="grid gap-2">
      <Label htmlFor="patient-id">Patient ID</Label>
      <Input id="patient-id" placeholder="PHC-2025-00001" pattern="[A-Z]{3}-\d{4}-\d{5}" />
    </div>
  ),
};

export const PhoneNumber: Story = {
  render: () => (
    <div className="grid gap-2">
      <Label htmlFor="phone">Contact Number</Label>
      <Input id="phone" type="tel" placeholder="+63 912 345 6789" />
    </div>
  ),
};

export const AppointmentDate: Story = {
  render: () => (
    <div className="grid gap-2">
      <Label htmlFor="appointment">Appointment Date</Label>
      <Input id="appointment" type="date" />
    </div>
  ),
};

export const AppointmentTime: Story = {
  render: () => (
    <div className="grid gap-2">
      <Label htmlFor="time">Appointment Time</Label>
      <Input id="time" type="time" />
    </div>
  ),
};

export const WithError: Story = {
  render: () => (
    <div className="grid gap-2">
      <Label htmlFor="error-input" className="text-destructive">
        Blood Sugar Level (mg/dL)
      </Label>
      <Input
        id="error-input"
        type="number"
        placeholder="100"
        aria-invalid="true"
        className="border-destructive"
      />
      <p className="text-destructive text-sm">Value must be between 0 and 600</p>
    </div>
  ),
};

export const SearchInput: Story = {
  render: () => (
    <div className="grid gap-2">
      <Label htmlFor="search">Search Patients</Label>
      <Input id="search" type="search" placeholder="Search by name, ID, or phone..." />
    </div>
  ),
};

export const FileUpload: Story = {
  render: () => (
    <div className="grid gap-2">
      <Label htmlFor="medical-records">Upload Medical Records</Label>
      <Input id="medical-records" type="file" accept=".pdf,.jpg,.png" multiple />
    </div>
  ),
};
