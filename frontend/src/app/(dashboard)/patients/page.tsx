'use client';

import { useState, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { DataTableToolbar } from '@/components/ui/data-table-toolbar';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { DataTableFacetedFilter } from '@/components/ui/data-table-faceted-filter';
import type { Table } from '@tanstack/react-table';
import { Users, UserPlus } from 'lucide-react';
import { getPatients, getPatientStatistics } from '@/lib/api/patient';
import type { Patient, PatientStatistics } from '@/types/patient';

// Column definitions
const columns: ColumnDef<Patient>[] = [
  {
    accessorKey: 'patient_full_name',
    id: 'patient_full_name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Patient Name" />
    ),
    cell: ({ row }) => {
      const patient = row.original;
      return (
        <div className="flex items-center gap-3">
          <div className="bg-heart-red/10 flex h-10 w-10 items-center justify-center rounded-full">
            <Users className="text-heart-red h-5 w-5" strokeWidth={1.5} />
          </div>
          <span className="text-midnight-blue font-medium">
            {patient.patient_full_name}
          </span>
        </div>
      );
    },
    enableSorting: true,
    enableHiding: false,
  },
  {
    id: 'age_sex',
    accessorFn: (row) => `${getAge(row.patient_date_of_birth)}y / ${row.patient_sex}`,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Age / Sex" />
    ),
    cell: ({ row }) => {
      const patient = row.original;
      return (
        <span className="text-sm text-gray-700">
          {getAge(patient.patient_date_of_birth)}y / {patient.patient_sex}
        </span>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: 'latest_risk_level',
    id: 'latest_risk_level',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Risk Level" />
    ),
    cell: ({ row }) => {
      const riskLevel = row.getValue('latest_risk_level') as string;
      return (
        <Badge className={getRiskColor(riskLevel)}>
          {riskLevel}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    enableSorting: true,
  },
  {
    accessorKey: 'status',
    id: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      return (
        <Badge className={getStatusColor(status)}>
          {status}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    enableSorting: true,
  },
  {
    accessorKey: 'last_assessment_date',
    id: 'last_assessment_date',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Assessment" />
    ),
    cell: ({ row }) => {
      const date = row.getValue('last_assessment_date') as string;
      return (
        <span className="text-sm text-gray-700">
          {formatDate(date)}
        </span>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: 'total_assessments',
    id: 'total_assessments',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total Assessments" />
    ),
    cell: ({ row }) => {
      const count = row.getValue('total_assessments') as number;
      return (
        <span className="text-sm text-gray-700 text-center block font-mono">
          {count}
        </span>
      );
    },
    enableSorting: true,
  },
  {
    id: 'actions',
    header: () => <div className="text-right">Actions</div>,
    cell: () => {
      return (
        <div className="text-right">
          <Button variant="outline" size="sm">
            View Profile
          </Button>
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
];

// Helper functions
const getAge = (dateOfBirth: string): number => {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getRiskColor = (risk: string) => {
  switch (risk) {
    case 'High':
      return 'bg-red-100 text-red-800';
    case 'Moderate':
      return 'bg-yellow-100 text-yellow-800';
    case 'Low':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Active':
      return 'bg-green-100 text-green-800';
    case 'Follow-up':
      return 'bg-blue-100 text-blue-800';
    case 'Discharged':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [stats, setStats] = useState<PatientStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [table, setTable] = useState<Table<Patient> | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch patients list
        const patientsResponse = await getPatients({ per_page: 100 });

        // Fetch statistics
        const statsResponse = await getPatientStatistics();

        if (patientsResponse.success) {
          setPatients(patientsResponse.data);
        }

        if (statsResponse.success) {
          setStats(statsResponse.data);
        }
      } catch (error) {
        console.error('Error fetching patients:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Export handler
  const handleExport = () => {
    if (!table) return;

    const rows = table.getFilteredRowModel().rows;
    const csv = [
      ['Patient Name', 'Age', 'Sex', 'Risk Level', 'Status', 'Last Assessment', 'Total Assessments'].join(','),
      ...rows.map((row) => {
        const patient = row.original;
        return [
          patient.patient_full_name,
          getAge(patient.patient_date_of_birth),
          patient.patient_sex,
          patient.latest_risk_level,
          patient.status,
          formatDate(patient.last_assessment_date),
          patient.total_assessments,
        ].join(',');
      }),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `patients-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="border-t-heart-red mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-300" />
          <p className="text-gray-600">Loading patients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-midnight-blue text-4xl md:text-5xl font-semibold tracking-tight">Patients</h1>
          <p className="mt-2 text-gray-600">
            Manage patient records and track cardiovascular health
          </p>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4 text-white" />
          Add Patient
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card index={0}>
          <CardHeader className="pb-3">
            <CardDescription>Total Patients</CardDescription>
            <CardTitle className="text-3xl font-semibold tracking-tight font-mono tabular-nums">{stats?.total_patients.toLocaleString() || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-600">All time</p>
          </CardContent>
        </Card>

        <Card index={1}>
          <CardHeader className="pb-3">
            <CardDescription>Active Patients</CardDescription>
            <CardTitle className="text-3xl font-semibold tracking-tight font-mono tabular-nums text-green-600">
              {stats?.active_patients || 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-600">Currently monitored</p>
          </CardContent>
        </Card>

        <Card index={2}>
          <CardHeader className="pb-3">
            <CardDescription>Follow-up Required</CardDescription>
            <CardTitle className="text-3xl font-semibold tracking-tight font-mono tabular-nums text-blue-600">
              {stats?.follow_up_patients || 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-600">Scheduled visits</p>
          </CardContent>
        </Card>

        <Card index={3}>
          <CardHeader className="pb-3">
            <CardDescription>High Risk Patients</CardDescription>
            <CardTitle className="text-3xl font-semibold tracking-tight font-mono tabular-nums text-red-600">
              {stats?.high_risk_patients || 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-600">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Patients List */}
      <Card index={4}>
        <CardHeader>
          <CardTitle>Patient Registry</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Toolbar with search and filters */}
            {table && (
              <DataTableToolbar
                table={table}
                searchKey="patient_full_name"
                searchPlaceholder="Search by patient name..."
                filterComponents={
                  <>
                    <DataTableFacetedFilter
                      column={table.getColumn('latest_risk_level')}
                      title="Risk Level"
                      options={[
                        { label: 'High', value: 'High' },
                        { label: 'Moderate', value: 'Moderate' },
                        { label: 'Low', value: 'Low' },
                      ]}
                    />
                    <DataTableFacetedFilter
                      column={table.getColumn('status')}
                      title="Status"
                      options={[
                        { label: 'Active', value: 'Active' },
                        { label: 'Follow-up', value: 'Follow-up' },
                        { label: 'Discharged', value: 'Discharged' },
                      ]}
                    />
                  </>
                }
                onExport={handleExport}
              />
            )}

            {/* Data Table */}
            <DataTable
              columns={columns}
              data={patients}
              loading={isLoading}
              enableSorting={true}
              enableFiltering={true}
              enableRowSelection={false}
              enablePagination={true}
              pageSize={10}
              pageSizeOptions={[10, 20, 50, 100]}
              onTableReady={setTable}
            />

            {/* Pagination */}
            {table && (
              <DataTablePagination
                table={table}
                pageSizeOptions={[10, 20, 50, 100]}
                showSelectedCount={false}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
