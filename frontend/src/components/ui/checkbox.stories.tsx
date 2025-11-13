import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Checkbox } from './checkbox';
import { Label } from './label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './form';
import { Button } from './button';

const meta = {
  title: 'UI/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    checked: {
      control: 'boolean',
      description: 'Controlled checked state',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the checkbox is disabled',
    },
    hasError: {
      control: 'boolean',
      description: 'Error state triggers shake animation',
    },
    disableAnimations: {
      control: 'boolean',
      description: 'Disable all animations',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ minWidth: '400px', padding: '20px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic checkbox variations
export const Default: Story = {
  args: {
    checked: false,
  },
};

export const Checked: Story = {
  args: {
    checked: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    checked: false,
  },
};

export const DisabledChecked: Story = {
  args: {
    disabled: true,
    checked: true,
  },
};

export const WithError: Story = {
  args: {
    hasError: true,
    checked: false,
  },
};

// Interactive example with label
export const WithLabel: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);

    return (
      <div className="flex items-center space-x-2">
        <Checkbox
          id="terms"
          checked={checked}
          onCheckedChange={setChecked}
        />
        <Label
          htmlFor="terms"
          className="text-sm font-normal cursor-pointer select-none"
        >
          I confirm patient consent for treatment
        </Label>
      </div>
    );
  },
};

// Clinical healthcare examples
export const PatientConsent: Story = {
  render: () => {
    const [consents, setConsents] = useState({
      treatment: false,
      dataSharing: false,
      emergency: false,
    });

    return (
      <div className="grid gap-4">
        <div className="flex items-start space-x-2">
          <Checkbox
            id="treatment"
            checked={consents.treatment}
            onCheckedChange={(checked) =>
              setConsents({ ...consents, treatment: checked })
            }
          />
          <div className="grid gap-1.5 leading-none">
            <Label
              htmlFor="treatment"
              className="text-sm font-normal cursor-pointer select-none"
            >
              Treatment Authorization
            </Label>
            <p className="text-xs text-slate-500">
              Patient consents to proposed cardiovascular treatment plan
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox
            id="dataSharing"
            checked={consents.dataSharing}
            onCheckedChange={(checked) =>
              setConsents({ ...consents, dataSharing: checked })
            }
          />
          <div className="grid gap-1.5 leading-none">
            <Label
              htmlFor="dataSharing"
              className="text-sm font-normal cursor-pointer select-none"
            >
              Data Sharing Agreement
            </Label>
            <p className="text-xs text-slate-500">
              Authorize sharing medical records with Philippine Heart Center
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox
            id="emergency"
            checked={consents.emergency}
            onCheckedChange={(checked) =>
              setConsents({ ...consents, emergency: checked })
            }
          />
          <div className="grid gap-1.5 leading-none">
            <Label
              htmlFor="emergency"
              className="text-sm font-normal cursor-pointer select-none"
            >
              Emergency Contact Notification
            </Label>
            <p className="text-xs text-slate-500">
              Notify emergency contacts if critical condition detected
            </p>
          </div>
        </div>
      </div>
    );
  },
};

export const RiskAssessment: Story = {
  render: () => {
    const [risks, setRisks] = useState({
      diabetes: false,
      hypertension: false,
      smoking: false,
      familyHistory: false,
    });

    return (
      <div className="space-y-4">
        <div className="border-b pb-2">
          <h3 className="text-sm font-semibold text-slate-900">
            Cardiovascular Risk Factors
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Select all that apply to patient
          </p>
        </div>

        <div className="grid gap-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="diabetes"
              checked={risks.diabetes}
              onCheckedChange={(checked) =>
                setRisks({ ...risks, diabetes: checked })
              }
            />
            <Label
              htmlFor="diabetes"
              className="text-sm font-normal cursor-pointer select-none"
            >
              Type 2 Diabetes
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="hypertension"
              checked={risks.hypertension}
              onCheckedChange={(checked) =>
                setRisks({ ...risks, hypertension: checked })
              }
            />
            <Label
              htmlFor="hypertension"
              className="text-sm font-normal cursor-pointer select-none"
            >
              Hypertension
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="smoking"
              checked={risks.smoking}
              onCheckedChange={(checked) =>
                setRisks({ ...risks, smoking: checked })
              }
            />
            <Label
              htmlFor="smoking"
              className="text-sm font-normal cursor-pointer select-none"
            >
              Current Smoker
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="familyHistory"
              checked={risks.familyHistory}
              onCheckedChange={(checked) =>
                setRisks({ ...risks, familyHistory: checked })
              }
            />
            <Label
              htmlFor="familyHistory"
              className="text-sm font-normal cursor-pointer select-none"
            >
              Family History of Heart Disease
            </Label>
          </div>
        </div>

        <div className="pt-2 border-t">
          <p className="text-xs text-slate-600">
            Risk factors identified:{' '}
            <span className="font-semibold text-[#dc2626]">
              {Object.values(risks).filter(Boolean).length} / 4
            </span>
          </p>
        </div>
      </div>
    );
  },
};

// Form integration example with validation
export const InForm: Story = {
  render: () => {
    const formSchema = z.object({
      terms: z.boolean().refine((val) => val === true, {
        message: 'You must accept the terms and conditions',
      }),
      marketing: z.boolean().optional(),
    });

    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        terms: false,
        marketing: false,
      },
    });

    function onSubmit(data: z.infer<typeof formSchema>) {
      alert(JSON.stringify(data, null, 2));
    }

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="terms"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    hasError={!!form.formState.errors.terms}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm font-normal">
                    I confirm this is a high-risk patient requiring immediate attention
                  </FormLabel>
                  <FormDescription>
                    This will trigger emergency protocol notifications to the cardiac unit.
                  </FormDescription>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="marketing"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm font-normal">
                    Send assessment summary to patient email
                  </FormLabel>
                  <FormDescription>
                    Optional: Patient will receive PDF summary of cardiovascular assessment.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <Button type="submit">Submit Assessment</Button>
        </form>
      </Form>
    );
  },
};

// Animation states showcase
export const AnimationStates: Story = {
  render: () => {
    const [showError, setShowError] = useState(false);
    const [checked, setChecked] = useState(false);

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 mb-3">
            Interactive Checkbox with Animations
          </h3>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="animated"
              checked={checked}
              onCheckedChange={setChecked}
              hasError={showError}
            />
            <Label
              htmlFor="animated"
              className="text-sm font-normal cursor-pointer select-none"
            >
              Click to see spring animation
            </Label>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowError(!showError)}
          >
            {showError ? 'Remove' : 'Trigger'} Error Shake
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setChecked(!checked)}
          >
            Toggle Checked
          </Button>
        </div>

        <div className="text-xs text-slate-500 border-t pt-3">
          <p className="font-medium mb-1">Animation Features:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Spring animation on check/uncheck (scale: 0.8 → 1.05 → 1)</li>
            <li>Checkmark fade-in with scale animation</li>
            <li>Error shake animation (horizontal shake with spring physics)</li>
            <li>Hover scale effect (1.05x)</li>
            <li>Tap scale effect (0.95x)</li>
            <li>Respects prefers-reduced-motion</li>
          </ul>
        </div>
      </div>
    );
  },
};

export const WithoutAnimations: Story = {
  args: {
    disableAnimations: true,
    checked: false,
  },
};
