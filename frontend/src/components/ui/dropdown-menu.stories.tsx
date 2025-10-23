'use client';

import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { Button } from './button';
import {
  MoreHorizontal,
  User,
  Settings,
  LogOut,
  Eye,
  Edit,
  Trash2,
  Download,
  Share2,
  FileText,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from 'lucide-react';

const meta = {
  title: 'UI/Dropdown Menu',
  component: DropdownMenu,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic dropdown menu
export const Default: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>Open Menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

// With icons
export const WithIcons: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <User className="mr-2 size-4" />
          Account
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User className="mr-2 size-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 size-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <LogOut className="mr-2 size-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

// Healthcare-specific examples
export const AssessmentActions: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Assessment Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Eye className="mr-2 size-4" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Edit className="mr-2 size-4" />
          Edit Assessment
        </DropdownMenuItem>
        <DropdownMenuItem>
          <CheckCircle2 className="mr-2 size-4" />
          Validate
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <FileText className="mr-2 size-4" />
          Create Referral
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Download className="mr-2 size-4" />
          Export PDF
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <Trash2 className="mr-2 size-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const ReferralActions: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Referral Actions</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Manage Referral</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Eye className="mr-2 size-4" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem>
          <CheckCircle2 className="text-success mr-2 size-4" />
          Accept Referral
        </DropdownMenuItem>
        <DropdownMenuItem>
          <XCircle className="text-destructive mr-2 size-4" />
          Reject Referral
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Share2 className="mr-2 size-4" />
          Forward to Specialist
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Download className="mr-2 size-4" />
          Download Records
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

// With checkbox items
export const WithCheckboxes: Story = {
  render: () => {
    const [showPending, setShowPending] = useState(true);
    const [showValidated, setShowValidated] = useState(true);
    const [showCompleted, setShowCompleted] = useState(false);

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Filter Status</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Show Assessments</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem checked={showPending} onCheckedChange={setShowPending}>
            Pending Validation
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem checked={showValidated} onCheckedChange={setShowValidated}>
            Validated
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem checked={showCompleted} onCheckedChange={setShowCompleted}>
            Completed
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
};

// With radio group
export const WithRadioGroup: Story = {
  render: () => {
    const [riskFilter, setRiskFilter] = useState('all');

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Risk Level Filter</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Filter by Risk Level</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={riskFilter} onValueChange={setRiskFilter}>
            <DropdownMenuRadioItem value="all">All Levels</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="low">Low Risk</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="moderate">Moderate Risk</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="high">High Risk</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
};

// With submenu
export const WithSubmenu: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>Export Options</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Export Data</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Download className="mr-2 size-4" />
            Quick Export
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <FileText className="mr-2 size-4" />
              Export Format
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>PDF Document</DropdownMenuItem>
              <DropdownMenuItem>Excel Spreadsheet</DropdownMenuItem>
              <DropdownMenuItem>CSV File</DropdownMenuItem>
              <DropdownMenuItem>JSON Data</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Date Range</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Today</DropdownMenuItem>
              <DropdownMenuItem>Last 7 days</DropdownMenuItem>
              <DropdownMenuItem>Last 30 days</DropdownMenuItem>
              <DropdownMenuItem>Custom range...</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

// With keyboard shortcuts
export const WithShortcuts: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Actions</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Eye className="mr-2 size-4" />
          View
          <DropdownMenuShortcut>⌘V</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Edit className="mr-2 size-4" />
          Edit
          <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Download className="mr-2 size-4" />
          Download
          <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <Trash2 className="mr-2 size-4" />
          Delete
          <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

// Priority selector
export const PrioritySelector: Story = {
  render: () => {
    const [priority, setPriority] = useState('routine');

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <AlertCircle className="mr-2 size-4" />
            Set Priority
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Referral Priority</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={priority} onValueChange={setPriority}>
            <DropdownMenuRadioItem value="emergency">
              <span className="flex items-center gap-2">
                <span className="bg-destructive size-2 rounded-full" />
                Emergency
              </span>
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="urgent">
              <span className="flex items-center gap-2">
                <span className="bg-warning size-2 rounded-full" />
                Urgent (24-48h)
              </span>
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="routine">
              <span className="flex items-center gap-2">
                <span className="bg-info size-2 rounded-full" />
                Routine (1-2 weeks)
              </span>
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="follow-up">
              <span className="flex items-center gap-2">
                <span className="bg-muted-foreground size-2 rounded-full" />
                Follow-up
              </span>
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
};

// Status updater
export const StatusUpdater: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm">Update Status</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Change Assessment Status</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <span className="flex items-center gap-2">
            <span className="bg-warning size-2 rounded-full" />
            Mark as Pending
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <span className="flex items-center gap-2">
            <span className="bg-info size-2 rounded-full" />
            Mark as In Progress
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <span className="flex items-center gap-2">
            <span className="bg-success size-2 rounded-full" />
            Mark as Validated
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <span className="flex items-center gap-2">
            <span className="bg-muted-foreground size-2 rounded-full" />
            Mark as Completed
          </span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <XCircle className="mr-2 size-4" />
          Mark as Cancelled
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

// Bulk actions
export const BulkActions: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Bulk Actions (3 selected)</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Actions for 3 items</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <CheckCircle2 className="mr-2 size-4" />
          Validate All
        </DropdownMenuItem>
        <DropdownMenuItem>
          <FileText className="mr-2 size-4" />
          Batch Create Referrals
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Download className="mr-2 size-4" />
          Export Selected
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <Trash2 className="mr-2 size-4" />
          Delete Selected
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

// Disabled items
export const WithDisabledItems: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>Actions</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Available Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>View Details</DropdownMenuItem>
        <DropdownMenuItem disabled>Edit (Read-only mode)</DropdownMenuItem>
        <DropdownMenuItem>Download</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled variant="destructive">
          Delete (No permission)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};
