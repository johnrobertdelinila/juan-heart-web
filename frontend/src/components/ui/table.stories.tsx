'use client';

import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from './table';
import { Button } from './button';
import { Input } from './input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { ArrowDown, ArrowUp, ArrowUpDown, Eye, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu';

const meta = {
  title: 'UI/Table',
  component: Table,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic table
export const Default: Story = {
  render: () => (
    <Table>
      <TableCaption>A list of recent patients</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Patient ID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Age</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="font-medium">PHC-2025-00001</TableCell>
          <TableCell>J.D.</TableCell>
          <TableCell>45</TableCell>
          <TableCell>Active</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">PHC-2025-00002</TableCell>
          <TableCell>M.S.</TableCell>
          <TableCell>52</TableCell>
          <TableCell>Active</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">PHC-2025-00003</TableCell>
          <TableCell>A.R.</TableCell>
          <TableCell>38</TableCell>
          <TableCell>Pending</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};

// Healthcare assessments table
const assessmentsData = [
  {
    id: 'ASM-001',
    patient: 'J.D.',
    age: 45,
    gender: 'M',
    riskScore: 75,
    riskLevel: 'High',
    status: 'Pending',
    date: '2025-10-20',
  },
  {
    id: 'ASM-002',
    patient: 'M.S.',
    age: 52,
    gender: 'F',
    riskScore: 65,
    riskLevel: 'Moderate',
    status: 'Validated',
    date: '2025-10-20',
  },
  {
    id: 'ASM-003',
    patient: 'A.R.',
    age: 38,
    gender: 'M',
    riskScore: 30,
    riskLevel: 'Low',
    status: 'Completed',
    date: '2025-10-19',
  },
  {
    id: 'ASM-004',
    patient: 'L.C.',
    age: 60,
    gender: 'F',
    riskScore: 85,
    riskLevel: 'High',
    status: 'Referred',
    date: '2025-10-19',
  },
];

export const AssessmentsTable: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Recent Assessments</h3>
        <Button size="sm">Export Data</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Assessment ID</TableHead>
            <TableHead>Patient</TableHead>
            <TableHead>Age/Gender</TableHead>
            <TableHead>Risk Score</TableHead>
            <TableHead>Risk Level</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assessmentsData.map((assessment) => (
            <TableRow key={assessment.id}>
              <TableCell className="font-medium">{assessment.id}</TableCell>
              <TableCell>{assessment.patient}</TableCell>
              <TableCell>
                {assessment.age}, {assessment.gender}
              </TableCell>
              <TableCell>
                <span className="font-semibold">{assessment.riskScore}/100</span>
              </TableCell>
              <TableCell>
                <span
                  className={
                    assessment.riskLevel === 'High'
                      ? 'text-destructive'
                      : assessment.riskLevel === 'Moderate'
                        ? 'text-warning'
                        : 'text-success'
                  }
                >
                  {assessment.riskLevel}
                </span>
              </TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    assessment.status === 'Pending'
                      ? 'bg-warning/10 text-warning'
                      : assessment.status === 'Validated'
                        ? 'bg-info/10 text-info'
                        : assessment.status === 'Completed'
                          ? 'bg-muted text-muted-foreground'
                          : 'bg-success/10 text-success'
                  }`}
                >
                  {assessment.status}
                </span>
              </TableCell>
              <TableCell className="text-muted-foreground">{assessment.date}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    <DropdownMenuItem>Validate</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Create Referral</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={7}>Total Assessments</TableCell>
            <TableCell className="text-right font-medium">4</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  ),
};

// Sortable table with state
export const SortableTable: Story = {
  render: () => {
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    const handleSort = (column: string) => {
      if (sortColumn === column) {
        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
      } else {
        setSortColumn(column);
        setSortDirection('asc');
      }
    };

    const SortButton = ({ column, children }: { column: string; children: React.ReactNode }) => (
      <button
        onClick={() => handleSort(column)}
        className="hover:text-foreground flex items-center gap-1"
      >
        {children}
        {sortColumn === column ? (
          sortDirection === 'asc' ? (
            <ArrowUp className="size-4" />
          ) : (
            <ArrowDown className="size-4" />
          )
        ) : (
          <ArrowUpDown className="size-4 opacity-50" />
        )}
      </button>
    );

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Sortable Assessments Table</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <SortButton column="id">ID</SortButton>
              </TableHead>
              <TableHead>
                <SortButton column="patient">Patient</SortButton>
              </TableHead>
              <TableHead>
                <SortButton column="score">Risk Score</SortButton>
              </TableHead>
              <TableHead>
                <SortButton column="status">Status</SortButton>
              </TableHead>
              <TableHead>
                <SortButton column="date">Date</SortButton>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assessmentsData.map((assessment) => (
              <TableRow key={assessment.id}>
                <TableCell className="font-medium">{assessment.id}</TableCell>
                <TableCell>{assessment.patient}</TableCell>
                <TableCell>{assessment.riskScore}/100</TableCell>
                <TableCell>{assessment.status}</TableCell>
                <TableCell>{assessment.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  },
};

// Filterable table
export const FilterableTable: Story = {
  render: () => {
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredData = assessmentsData.filter((item) => {
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchesSearch =
        searchTerm === '' ||
        item.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search by patient or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Validated">Validated</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Referred">Referred</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Assessment ID</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Risk Score</TableHead>
              <TableHead>Risk Level</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((assessment) => (
                <TableRow key={assessment.id}>
                  <TableCell className="font-medium">{assessment.id}</TableCell>
                  <TableCell>{assessment.patient}</TableCell>
                  <TableCell>{assessment.riskScore}/100</TableCell>
                  <TableCell>
                    <span
                      className={
                        assessment.riskLevel === 'High'
                          ? 'text-destructive'
                          : assessment.riskLevel === 'Moderate'
                            ? 'text-warning'
                            : 'text-success'
                      }
                    >
                      {assessment.riskLevel}
                    </span>
                  </TableCell>
                  <TableCell>{assessment.status}</TableCell>
                  <TableCell className="text-muted-foreground">{assessment.date}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={5}>Showing Results</TableCell>
              <TableCell className="text-right font-medium">{filteredData.length}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    );
  },
};

// Referrals table
const referralsData = [
  {
    id: 'REF-001',
    patient: 'J.D., 45, M',
    source: 'Community Health Center',
    target: 'Philippine Heart Center',
    priority: 'Emergency',
    status: 'Pending',
    date: '2025-10-21',
  },
  {
    id: 'REF-002',
    patient: 'L.C., 60, F',
    source: 'Rural Health Unit',
    target: 'Provincial Hospital',
    priority: 'Urgent',
    status: 'Accepted',
    date: '2025-10-20',
  },
  {
    id: 'REF-003',
    patient: 'M.T., 38, M',
    source: 'Barangay Health Station',
    target: 'District Hospital',
    priority: 'Routine',
    status: 'Completed',
    date: '2025-10-18',
  },
];

export const ReferralsTable: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Patient Referrals</h3>
        <Button size="sm">New Referral</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Referral ID</TableHead>
            <TableHead>Patient</TableHead>
            <TableHead>Source Facility</TableHead>
            <TableHead>Target Facility</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {referralsData.map((referral) => (
            <TableRow key={referral.id}>
              <TableCell className="font-medium">{referral.id}</TableCell>
              <TableCell>{referral.patient}</TableCell>
              <TableCell className="text-muted-foreground">{referral.source}</TableCell>
              <TableCell>{referral.target}</TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    referral.priority === 'Emergency'
                      ? 'bg-destructive/10 text-destructive'
                      : referral.priority === 'Urgent'
                        ? 'bg-warning/10 text-warning'
                        : 'bg-info/10 text-info'
                  }`}
                >
                  {referral.priority}
                </span>
              </TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    referral.status === 'Pending'
                      ? 'bg-warning/10 text-warning'
                      : referral.status === 'Accepted'
                        ? 'bg-success/10 text-success'
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {referral.status}
                </span>
              </TableCell>
              <TableCell className="text-muted-foreground">{referral.date}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm">
                  <Eye className="mr-2 size-4" />
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  ),
};

// Compact table
export const CompactTable: Story = {
  render: () => (
    <Table>
      <TableCaption>Compact table layout</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">ID</TableHead>
          <TableHead>Patient</TableHead>
          <TableHead>Score</TableHead>
          <TableHead className="text-right">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {assessmentsData.slice(0, 3).map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-mono text-xs">{item.id}</TableCell>
            <TableCell className="text-sm">{item.patient}</TableCell>
            <TableCell className="text-sm">{item.riskScore}</TableCell>
            <TableCell className="text-right text-xs">{item.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};
