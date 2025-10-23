'use client';

import type { Meta, StoryObj } from '@storybook/react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

const meta = {
  title: 'UI/Dialog',
  component: Dialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic dialog
export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>
            This is a basic dialog with a title and description.
          </DialogDescription>
        </DialogHeader>
        <p className="text-sm">Dialog content goes here.</p>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

// Confirm action dialog
export const ConfirmAction: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete Patient Record</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the patient record and remove
            all associated data from our servers.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button variant="destructive">Delete Record</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

// Healthcare-specific examples
export const ValidateAssessment: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Validate Assessment</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Clinical Assessment Validation</DialogTitle>
          <DialogDescription>
            Review and validate the cardiovascular risk assessment for this patient.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="rounded-md border p-4">
            <h4 className="mb-2 text-sm font-medium">Original ML Assessment</h4>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ML Risk Score:</span>
                <span className="font-semibold">75/100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Risk Level:</span>
                <span className="text-warning font-semibold">High Risk</span>
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="clinical-score">
              Clinical Risk Score <span className="text-destructive">*</span>
            </Label>
            <Input
              id="clinical-score"
              type="number"
              placeholder="Enter score (0-100)"
              defaultValue="75"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="risk-level">
              Final Risk Level <span className="text-destructive">*</span>
            </Label>
            <Select defaultValue="high">
              <SelectTrigger id="risk-level">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low Risk (0-39)</SelectItem>
                <SelectItem value="moderate">Moderate Risk (40-69)</SelectItem>
                <SelectItem value="high">High Risk (70-100)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">
              Clinical Notes <span className="text-destructive">*</span>
            </Label>
            <textarea
              id="notes"
              className="border-input focus-visible:border-ring focus-visible:ring-ring/50 flex min-h-[100px] w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
              placeholder="Enter clinical observations and recommendations..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button>Validate Assessment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const CreateReferral: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Create Referral</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Patient Referral</DialogTitle>
          <DialogDescription>
            Refer this patient to a specialist or healthcare facility.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="facility">
              Target Facility <span className="text-destructive">*</span>
            </Label>
            <Select>
              <SelectTrigger id="facility">
                <SelectValue placeholder="Select facility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="phc">Philippine Heart Center</SelectItem>
                <SelectItem value="pgh">Philippine General Hospital</SelectItem>
                <SelectItem value="makati-med">Makati Medical Center</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="priority">
              Priority Level <span className="text-destructive">*</span>
            </Label>
            <Select>
              <SelectTrigger id="priority">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="emergency">Emergency</SelectItem>
                <SelectItem value="urgent">Urgent (24-48h)</SelectItem>
                <SelectItem value="routine">Routine (1-2 weeks)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="reason">
              Referral Reason <span className="text-destructive">*</span>
            </Label>
            <textarea
              id="reason"
              className="border-input focus-visible:border-ring focus-visible:ring-ring/50 flex min-h-[100px] w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
              placeholder="Chief complaint and clinical summary..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button>Create Referral</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const ConfirmEmergency: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">Emergency Alert</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-destructive size-5" />
            <DialogTitle className="text-destructive">Emergency Referral Required</DialogTitle>
          </div>
          <DialogDescription>
            Critical vital signs detected. Immediate medical attention is required.
          </DialogDescription>
        </DialogHeader>
        <div className="border-destructive bg-destructive/10 rounded-md border p-4">
          <h4 className="text-destructive mb-2 text-sm font-semibold">Critical Indicators:</h4>
          <ul className="text-destructive list-inside list-disc space-y-1 text-sm">
            <li>Systolic BP: 180 mmHg (Critical)</li>
            <li>Severe chest pain reported</li>
            <li>Risk Score: 95/100</li>
          </ul>
        </div>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button variant="destructive">Create Emergency Referral</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const SuccessNotification: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Show Success</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="text-success size-5" />
            <DialogTitle>Assessment Validated Successfully</DialogTitle>
          </div>
          <DialogDescription>
            The clinical assessment has been validated and saved to the patient record.
          </DialogDescription>
        </DialogHeader>
        <div className="bg-muted/50 space-y-2 rounded-md border p-4">
          <p className="text-sm">
            <span className="font-medium">Validated by:</span> Dr. Maria Santos
          </p>
          <p className="text-sm">
            <span className="font-medium">Final Risk Level:</span>{' '}
            <span className="text-success">Low Risk</span>
          </p>
          <p className="text-sm">
            <span className="font-medium">Date:</span> October 21, 2025
          </p>
        </div>
        <DialogFooter>
          <Button>View Patient Record</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const InfoDialog: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Info className="mr-2 size-4" />
          About Risk Score
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cardiovascular Risk Score Calculation</DialogTitle>
          <DialogDescription>
            Understanding how the CVD risk score is calculated using WHO guidelines.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <div>
            <h4 className="mb-2 font-semibold">Risk Factors Considered:</h4>
            <ul className="text-muted-foreground list-inside list-disc space-y-1">
              <li>Age and gender</li>
              <li>Blood pressure readings</li>
              <li>Cholesterol levels</li>
              <li>Smoking status</li>
              <li>Diabetes status</li>
              <li>Family history</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-2 font-semibold">Risk Levels:</h4>
            <ul className="space-y-1">
              <li className="flex items-center gap-2">
                <span className="bg-success size-2 rounded-full" />
                <span>Low Risk: 0-39 points</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="bg-warning size-2 rounded-full" />
                <span>Moderate Risk: 40-69 points</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="bg-destructive size-2 rounded-full" />
                <span>High Risk: 70-100 points</span>
              </li>
            </ul>
          </div>
        </div>
        <DialogFooter>
          <Button>Got it</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const ViewPatientDetails: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">View Details</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Patient Assessment Details</DialogTitle>
          <DialogDescription>Complete assessment information for J.D.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-2">
            <h4 className="text-sm font-semibold">Patient Information</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Patient ID:</span>
                <p className="font-medium">PHC-2025-00123</p>
              </div>
              <div>
                <span className="text-muted-foreground">Age/Gender:</span>
                <p className="font-medium">45, Male</p>
              </div>
              <div>
                <span className="text-muted-foreground">Blood Type:</span>
                <p className="font-medium">O+</p>
              </div>
              <div>
                <span className="text-muted-foreground">Contact:</span>
                <p className="font-medium">+63 912 345 6789</p>
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <h4 className="text-sm font-semibold">Vital Signs</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Blood Pressure:</span>
                <p className="font-medium">140/90 mmHg</p>
              </div>
              <div>
                <span className="text-muted-foreground">Heart Rate:</span>
                <p className="font-medium">88 bpm</p>
              </div>
              <div>
                <span className="text-muted-foreground">Blood Sugar:</span>
                <p className="font-medium">110 mg/dL</p>
              </div>
              <div>
                <span className="text-muted-foreground">Cholesterol:</span>
                <p className="font-medium">240 mg/dL</p>
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <h4 className="text-sm font-semibold">Risk Assessment</h4>
            <div className="flex items-center justify-between rounded-md border p-3">
              <span className="text-muted-foreground text-sm">Final Risk Score:</span>
              <span className="text-warning text-lg font-bold">65/100</span>
            </div>
            <div className="flex items-center justify-between rounded-md border p-3">
              <span className="text-muted-foreground text-sm">Risk Level:</span>
              <span className="text-warning font-semibold">Moderate Risk</span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline">Close</Button>
          <Button>Validate Assessment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const WithoutCloseButton: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Required Action</Button>
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Action Required</DialogTitle>
          <DialogDescription>You must complete this action before proceeding.</DialogDescription>
        </DialogHeader>
        <p className="text-sm">This dialog requires explicit action and cannot be dismissed.</p>
        <DialogFooter>
          <Button variant="outline">Skip for Now</Button>
          <Button>Complete Action</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};
