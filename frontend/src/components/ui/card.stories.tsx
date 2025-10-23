import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from './card';
import { Button } from './button';

const meta = {
  title: 'UI/Card',
  component: Card,
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
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic card with title and description
export const Basic: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>Patient Assessment</CardTitle>
        <CardDescription>Review and validate cardiovascular risk assessment</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm">
          Risk Score: <span className="text-foreground font-semibold">75/100</span>
        </p>
        <p className="text-muted-foreground text-sm">
          Classification: <span className="text-warning font-semibold">High Risk</span>
        </p>
      </CardContent>
    </Card>
  ),
};

// Card with actions
export const WithActions: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>Pending Referral</CardTitle>
        <CardDescription>New referral from Community Health Center</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm">
            <span className="font-medium">Patient:</span> J.D. (45, Male)
          </p>
          <p className="text-sm">
            <span className="font-medium">Priority:</span> High
          </p>
          <p className="text-sm">
            <span className="font-medium">Risk:</span> Hypertension, High Cholesterol
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Reject</Button>
        <Button>Accept Referral</Button>
      </CardFooter>
    </Card>
  ),
};

// Statistics card
export const Statistics: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>Assessments Today</CardTitle>
        <CardDescription>Total assessments processed</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold">1,247</div>
        <p className="text-success text-sm">+12% from yesterday</p>
      </CardContent>
    </Card>
  ),
};

// Alert card
export const Alert: Story = {
  render: () => (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="text-destructive">Critical Alert</CardTitle>
        <CardDescription>Immediate attention required</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">
          Patient with severe symptoms detected. Emergency referral recommended.
        </p>
      </CardContent>
      <CardFooter>
        <Button variant="destructive" className="w-full">
          Create Emergency Referral
        </Button>
      </CardFooter>
    </Card>
  ),
};

// Healthcare provider card
export const ProviderProfile: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>Dr. Maria Santos</CardTitle>
        <CardDescription>Interventional Cardiologist</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm">
            <span className="font-medium">License:</span> PRC-12345678
          </p>
          <p className="text-sm">
            <span className="font-medium">Facility:</span> Philippine Heart Center
          </p>
          <p className="text-sm">
            <span className="font-medium">Availability:</span> Mon-Fri, 9AM-5PM
          </p>
          <p className="text-sm">
            <span className="font-medium">Specialization:</span> Coronary Interventions
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          View Full Profile
        </Button>
      </CardFooter>
    </Card>
  ),
};
