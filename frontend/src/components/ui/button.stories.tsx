import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
      description: 'The visual style variant of the button',
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
      description: 'The size of the button',
    },
    asChild: {
      control: 'boolean',
      description: 'Render as child component',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// Primary button (default variant)
export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'default',
  },
};

// Destructive button for dangerous actions
export const Destructive: Story = {
  args: {
    children: 'Delete Assessment',
    variant: 'destructive',
  },
};

// Outline button for secondary actions
export const Outline: Story = {
  args: {
    children: 'Cancel',
    variant: 'outline',
  },
};

// Secondary button
export const Secondary: Story = {
  args: {
    children: 'Secondary Action',
    variant: 'secondary',
  },
};

// Ghost button for minimal UI
export const Ghost: Story = {
  args: {
    children: 'Ghost Button',
    variant: 'ghost',
  },
};

// Link style button
export const Link: Story = {
  args: {
    children: 'View Details',
    variant: 'link',
  },
};

// Small size
export const Small: Story = {
  args: {
    children: 'Small Button',
    size: 'sm',
  },
};

// Large size
export const Large: Story = {
  args: {
    children: 'Large Button',
    size: 'lg',
  },
};

// Disabled state
export const Disabled: Story = {
  args: {
    children: 'Disabled Button',
    disabled: true,
  },
};

// Healthcare-specific examples
export const ValidateAssessment: Story = {
  args: {
    children: 'Validate Assessment',
    variant: 'default',
    size: 'default',
  },
};

export const CreateReferral: Story = {
  args: {
    children: 'Create Referral',
    variant: 'default',
  },
};

export const ExportReport: Story = {
  args: {
    children: 'Export to PDF',
    variant: 'outline',
  },
};

export const EmergencyAction: Story = {
  args: {
    children: 'Emergency Alert',
    variant: 'destructive',
    size: 'lg',
  },
};
