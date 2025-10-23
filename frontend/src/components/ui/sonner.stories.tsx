'use client';

import type { Meta, StoryObj } from '@storybook/react';
import { Toaster } from './sonner';
import { Button } from './button';
import { toast } from 'sonner';
import {
  CheckCircle2,
  AlertCircle,
  Info as InfoIcon,
  XCircle,
  Heart,
  Activity,
  FileText,
} from 'lucide-react';

const meta = {
  title: 'UI/Toast (Sonner)',
  component: Toaster,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div>
        <Toaster />
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic toast types
export const Default: Story = {
  render: () => (
    <div className="space-y-2">
      <Button onClick={() => toast('This is a default toast')}>Show Default Toast</Button>
    </div>
  ),
};

export const Success: Story = {
  render: () => (
    <Button onClick={() => toast.success('Assessment validated successfully!')}>
      Show Success Toast
    </Button>
  ),
};

export const Error: Story = {
  render: () => (
    <Button
      variant="destructive"
      onClick={() => toast.error('Failed to save assessment. Please try again.')}
    >
      Show Error Toast
    </Button>
  ),
};

export const Warning: Story = {
  render: () => (
    <Button
      variant="outline"
      onClick={() => toast.warning('Patient has elevated blood pressure readings')}
    >
      Show Warning Toast
    </Button>
  ),
};

export const Info: Story = {
  render: () => (
    <Button
      variant="outline"
      onClick={() => toast.info('New referral guidelines are now available')}
    >
      Show Info Toast
    </Button>
  ),
};

export const Loading: Story = {
  render: () => (
    <Button
      onClick={() => {
        const id = toast.loading('Validating assessment...');
        setTimeout(() => {
          toast.success('Assessment validated successfully!', { id });
        }, 2000);
      }}
    >
      Show Loading Toast
    </Button>
  ),
};

// Healthcare-specific examples
export const AssessmentValidated: Story = {
  render: () => (
    <Button
      onClick={() =>
        toast.success('Clinical Assessment Validated', {
          description: 'Risk score updated to 65/100 (Moderate Risk)',
          duration: 5000,
        })
      }
    >
      Assessment Validated
    </Button>
  ),
};

export const ReferralCreated: Story = {
  render: () => (
    <Button
      onClick={() =>
        toast.success('Referral Created Successfully', {
          description: 'Patient J.D. referred to Philippine Heart Center',
          icon: <FileText className="size-4" />,
        })
      }
    >
      Referral Created
    </Button>
  ),
};

export const CriticalAlert: Story = {
  render: () => (
    <Button
      variant="destructive"
      onClick={() =>
        toast.error('Critical Vital Signs Detected', {
          description: 'BP: 180/110 mmHg - Immediate attention required',
          icon: <Heart className="size-4" />,
          duration: 10000,
        })
      }
    >
      Critical Alert
    </Button>
  ),
};

export const ValidationWarning: Story = {
  render: () => (
    <Button
      variant="outline"
      onClick={() =>
        toast.warning('ML Score Differs from Rule-Based Score', {
          description: 'ML: 75/100, Rule-based: 60/100 - Please review carefully',
          duration: 7000,
        })
      }
    >
      Validation Warning
    </Button>
  ),
};

export const DataSyncInfo: Story = {
  render: () => (
    <Button
      variant="outline"
      onClick={() =>
        toast.info('Mobile Data Synced', {
          description: '15 new assessments received from Juan Heart mobile app',
          icon: <InfoIcon className="size-4" />,
        })
      }
    >
      Data Sync Info
    </Button>
  ),
};

// With actions
export const WithActions: Story = {
  render: () => (
    <Button
      onClick={() =>
        toast('Assessment requires validation', {
          description: 'High-risk patient detected. Review recommended.',
          action: {
            label: 'Review Now',
            onClick: () => console.log('Reviewing assessment'),
          },
        })
      }
    >
      Toast with Action
    </Button>
  ),
};

export const WithMultipleActions: Story = {
  render: () => (
    <Button
      onClick={() =>
        toast.success('Referral Received', {
          description: 'New referral from Community Health Center',
          action: {
            label: 'Accept',
            onClick: () => toast.success('Referral accepted'),
          },
          cancel: {
            label: 'Reject',
            onClick: () => toast.error('Referral rejected'),
          },
        })
      }
    >
      Referral with Actions
    </Button>
  ),
};

// Promise handling
export const PromiseToast: Story = {
  render: () => {
    const handleValidation = () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ score: 75, level: 'High Risk' });
        }, 2000);
      });
    };

    return (
      <Button
        onClick={() =>
          toast.promise(handleValidation(), {
            loading: 'Validating assessment...',
            success: (data: any) => `Assessment validated: ${data.score}/100 (${data.level})`,
            error: 'Validation failed. Please try again.',
          })
        }
      >
        Validate with Promise
      </Button>
    );
  },
};

// Custom duration
export const ShortDuration: Story = {
  render: () => (
    <Button onClick={() => toast('This disappears quickly', { duration: 2000 })}>
      2 Second Toast
    </Button>
  ),
};

export const LongDuration: Story = {
  render: () => (
    <Button
      onClick={() =>
        toast.warning('This message stays longer', {
          description: 'Important information that needs attention',
          duration: 10000,
        })
      }
    >
      10 Second Toast
    </Button>
  ),
};

export const PersistentToast: Story = {
  render: () => (
    <Button
      variant="destructive"
      onClick={() =>
        toast.error('Critical Error - Manual Dismiss Required', {
          description: 'System detected a critical issue that needs immediate attention',
          duration: Infinity,
        })
      }
    >
      Persistent Toast
    </Button>
  ),
};

// Rich content
export const RichContent: Story = {
  render: () => (
    <Button
      onClick={() =>
        toast.success('Patient Assessment Summary', {
          description: (
            <div className="mt-2 space-y-1 text-sm">
              <p>
                <strong>Patient:</strong> J.D., 45, Male
              </p>
              <p>
                <strong>Risk Score:</strong> 75/100
              </p>
              <p>
                <strong>Status:</strong> High Risk - Referral recommended
              </p>
            </div>
          ),
          duration: 7000,
        })
      }
    >
      Rich Content Toast
    </Button>
  ),
};

// Stacked toasts
export const MultipleToasts: Story = {
  render: () => (
    <Button
      onClick={() => {
        toast.success('Assessment 1 validated');
        setTimeout(() => toast.success('Assessment 2 validated'), 500);
        setTimeout(() => toast.success('Assessment 3 validated'), 1000);
        setTimeout(() => toast.info('All assessments processed'), 1500);
      }}
    >
      Show Multiple Toasts
    </Button>
  ),
};

// Dismiss toasts
export const DismissableToast: Story = {
  render: () => {
    let toastId: string | number;

    return (
      <div className="flex gap-2">
        <Button
          onClick={() => {
            toastId = toast('This toast can be dismissed manually', {
              duration: Infinity,
            });
          }}
        >
          Show Toast
        </Button>
        <Button variant="outline" onClick={() => toast.dismiss(toastId)}>
          Dismiss Toast
        </Button>
        <Button variant="destructive" onClick={() => toast.dismiss()}>
          Dismiss All
        </Button>
      </div>
    );
  },
};

// Healthcare workflow example
export const WorkflowExample: Story = {
  render: () => {
    const handleWorkflow = async () => {
      // Step 1: Start validation
      const validationId = toast.loading('Step 1: Validating patient data...');

      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Step 2: Processing
      toast.loading('Step 2: Calculating risk score...', { id: validationId });

      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Step 3: Creating referral
      toast.loading('Step 3: Creating referral...', { id: validationId });

      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Complete
      toast.success('Workflow Completed', {
        id: validationId,
        description: 'Patient assessment validated and referral created successfully',
        duration: 5000,
      });
    };

    return <Button onClick={handleWorkflow}>Run Assessment Workflow</Button>;
  },
};

// Position variations (shown in single example)
export const AllVariations: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-2">
      <Button onClick={() => toast.success('Assessment validated!')}>Success</Button>
      <Button onClick={() => toast.error('Validation failed!')}>Error</Button>
      <Button onClick={() => toast.warning('Review required')}>Warning</Button>
      <Button onClick={() => toast.info('New data synced')}>Info</Button>
      <Button
        onClick={() =>
          toast('Action required', {
            description: 'Patient needs immediate attention',
            action: { label: 'Review', onClick: () => {} },
          })
        }
      >
        With Action
      </Button>
      <Button onClick={() => toast.loading('Processing...')}>Loading</Button>
    </div>
  ),
};
