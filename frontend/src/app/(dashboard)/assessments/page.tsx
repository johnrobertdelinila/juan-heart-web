'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTable } from '@/components/ui/data-table';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { DataTableToolbar } from '@/components/ui/data-table-toolbar';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { DataTableFacetedFilter } from '@/components/ui/data-table-faceted-filter';
import type { Table } from '@tanstack/react-table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  FileText,
  Download,
  User,
  Calendar,
  MapPin,
  Activity,
  Heart,
  Pill,
  Utensils,
  AlertTriangle,
  CheckCircle,
  Loader2,
  TrendingUp,
  Smartphone,
  Stethoscope,
} from 'lucide-react';
import { getAssessment, validateAssessment } from '@/lib/api/assessment';
import {
  showValidateAssessmentDialog,
  showSuccessToast,
  showErrorToast,
  showLoadingDialog,
  closeDialog,
} from '@/lib/sweetalert-config';
import type { Assessment as FullAssessment } from '@/types/assessment';
import { ValidationWorkflow } from '@/components/assessment/validation-workflow';
import { ClinicalNotesEditor } from '@/components/assessment/clinical-notes-editor';
import { motion } from 'framer-motion';
import {
  pageTransitionVariants,
  staggerContainerVariants,
  staggerItemVariants,
  riskBadgePulseVariants,
} from '@/lib/framer-config';
import { AnimatedNumber, StatCardSkeleton, DataTableSkeleton } from '@/components/animations';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

interface Assessment {
  id: number;
  assessment_external_id: string;
  patient_first_name: string;
  patient_last_name: string;
  patient_date_of_birth: string;
  final_risk_level: 'High' | 'Moderate' | 'Low';
  ml_risk_score: number;
  assessment_date: string;
  status: string;
  validator?: {
    first_name: string;
    last_name: string;
  };
}

interface AssessmentStats {
  total_assessments: number;
  pending_assessments: number;
  validated_assessments: number;
  high_risk_assessments: number;
  average_risk_score: number;
}

export default function AssessmentsPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [stats, setStats] = useState<AssessmentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [table, setTable] = useState<Table<Assessment> | null>(null);

  // Detail view dialog state
  const [selectedAssessment, setSelectedAssessment] = useState<FullAssessment | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Column definitions
  const columns: ColumnDef<Assessment>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'assessment_external_id',
      id: 'assessment_external_id',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Assessment ID" />,
      cell: ({ row }) => {
        const id = row.getValue('assessment_external_id') as string;
        return (
          <button
            onClick={() => handleViewAssessment(row.original.id)}
            className="font-mono text-sm text-blue-600 hover:text-blue-800 hover:underline"
          >
            {id}
          </button>
        );
      },
      enableSorting: true,
    },
    {
      id: 'patient',
      accessorFn: (row) => `${row.patient_first_name} ${row.patient_last_name}`,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Patient Name" />,
      cell: ({ row }) => {
        const assessment = row.original;
        return (
          <button
            onClick={() => handleViewAssessment(assessment.id)}
            className="flex items-center gap-2 text-left hover:underline"
          >
            <div className="bg-heart-red/10 flex h-8 w-8 items-center justify-center rounded-full">
              <User className="text-heart-red h-4 w-4" strokeWidth={1.5} />
            </div>
            <span className="text-midnight-blue font-medium">
              {assessment.patient_first_name} {assessment.patient_last_name}
            </span>
          </button>
        );
      },
      enableSorting: true,
    },
    {
      id: 'age_sex',
      accessorFn: (row) => getAge(row.patient_date_of_birth),
      header: ({ column }) => <DataTableColumnHeader column={column} title="Age" />,
      cell: ({ row }) => {
        const age = getAge(row.original.patient_date_of_birth);
        return <span className="text-sm text-gray-700">{age}y</span>;
      },
      enableSorting: true,
    },
    {
      accessorKey: 'final_risk_level',
      id: 'final_risk_level',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Risk Level" />,
      cell: ({ row }) => {
        const risk = row.getValue('final_risk_level') as string;
        return (
          <motion.div
            variants={riskBadgePulseVariants}
            initial="initial"
            animate={risk === 'High' ? 'pulse' : 'static'}
            className="inline-block"
          >
            <Badge className={getRiskColor(risk)}>{risk} Risk</Badge>
          </motion.div>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
      enableSorting: true,
    },
    {
      accessorKey: 'ml_risk_score',
      id: 'ml_risk_score',
      header: ({ column }) => <DataTableColumnHeader column={column} title="ML Score" />,
      cell: ({ row }) => {
        const score = row.getValue('ml_risk_score') as number;
        const scoreColor =
          score >= 70 ? 'text-red-600' : score >= 40 ? 'text-yellow-600' : 'text-green-600';
        return <span className={`font-mono text-sm font-semibold ${scoreColor}`}>{score}%</span>;
      },
      enableSorting: true,
    },
    {
      accessorKey: 'status',
      id: 'status',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        return <Badge className={getStatusColor(status)}>{getStatusLabel(status)}</Badge>;
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
      enableSorting: true,
    },
    {
      accessorKey: 'assessment_date',
      id: 'assessment_date',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
      cell: ({ row }) => {
        const date = row.getValue('assessment_date') as string;
        return (
          <div className="flex items-center gap-1.5 text-sm text-gray-700">
            <Calendar className="h-3.5 w-3.5 text-gray-400" strokeWidth={1.5} />
            {formatDate(date)}
          </div>
        );
      },
      enableSorting: true,
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const assessment = row.original;
        return (
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="ghost"
              asChild
              className="hover:text-heart-red text-slate-600"
            >
              <Link
                href={`/assessments/${assessment.id}`}
                className="flex items-center gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                <Stethoscope className="h-3.5 w-3.5" strokeWidth={1.5} />
                Compare
              </Link>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                handleViewAssessment(assessment.id);
              }}
            >
              View Details
            </Button>
            {assessment.status === 'pending' && (
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleValidateAssessment(assessment);
                }}
              >
                <CheckCircle className="mr-1 h-3 w-3" strokeWidth={1.5} />
                Validate
              </Button>
            )}
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
  ];

  const fetchAssessmentsAndStats = async () => {
    try {
      const [assessmentsResponse, statsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/assessments?per_page=100`),
        fetch(`${API_BASE_URL}/assessments/statistics`),
      ]);

      const [assessmentsData, statsData] = await Promise.all([
        assessmentsResponse.json(),
        statsResponse.json(),
      ]);

      if (assessmentsData.success) {
        setAssessments(assessmentsData.data);
      }

      if (statsData.success) {
        setStats(statsData.data);
      }
    } catch (error) {
      console.error('Error fetching assessments:', error);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      await fetchAssessmentsAndStats();
      setIsLoading(false);
    };

    initialize();
  }, []);

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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusLabel = (status: string): string => {
    if (status === 'pending') return 'Pending';
    if (status === 'validated') return 'Validated';
    if (status === 'in_review') return 'In Review';
    if (status === 'requires_referral') return 'Requires Referral';
    return status.charAt(0).toUpperCase() + status.slice(1);
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
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'validated':
        return 'bg-blue-100 text-blue-800';
      case 'in_review':
        return 'bg-purple-100 text-purple-800';
      case 'requires_referral':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Handle view assessment details
  const handleViewAssessment = async (assessmentId: number) => {
    setIsLoadingDetail(true);
    setIsDetailDialogOpen(true);

    try {
      const response = await getAssessment(assessmentId);
      if (response.success) {
        setSelectedAssessment(response.data);
      }
    } catch (error) {
      console.error('Error fetching assessment details:', error);
      await showErrorToast(
        'Failed to load assessment details',
        error instanceof Error ? error.message : 'Please try again'
      );
      setIsDetailDialogOpen(false);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleValidationWorkflowComplete = async (assessmentId: number) => {
    await fetchAssessmentsAndStats();
    await handleViewAssessment(assessmentId);
  };

  // Handle validate assessment
  const handleValidateAssessment = async (assessment: Assessment) => {
    const patientName = `${assessment.patient_first_name} ${assessment.patient_last_name}`;
    const result = await showValidateAssessmentDialog(
      patientName,
      assessment.final_risk_level,
      assessment.ml_risk_score
    );

    if (result.isConfirmed && result.value) {
      showLoadingDialog('Validating assessment...');

      try {
        await validateAssessment(assessment.id, result.value);
        closeDialog();
        await showSuccessToast('Assessment validated successfully');

        await fetchAssessmentsAndStats();
      } catch (error) {
        closeDialog();
        console.error('Error validating assessment:', error);
        await showErrorToast(
          'Failed to validate assessment',
          error instanceof Error ? error.message : 'Please try again'
        );
      }
    }
  };

  // Handle bulk validate
  const handleBulkValidate = async () => {
    if (!table) return;

    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const selectedAssessments = selectedRows.map((row) => row.original);
    const pendingAssessments = selectedAssessments.filter((a) => a.status === 'pending');

    if (pendingAssessments.length === 0) {
      await showErrorToast(
        'No pending assessments selected',
        'Please select assessments with pending status'
      );
      return;
    }

    showLoadingDialog(`Validating ${pendingAssessments.length} assessment(s)...`);

    try {
      for (const assessment of pendingAssessments) {
        await validateAssessment(assessment.id, {
          validated_risk_score: assessment.ml_risk_score,
          validation_notes: 'Bulk validated',
          validation_agrees_with_ml: true,
        });
      }

      closeDialog();
      await showSuccessToast(`Successfully validated ${pendingAssessments.length} assessment(s)`);
      table.toggleAllRowsSelected(false);

      // Refresh data
      const assessmentsResponse = await fetch(`${API_BASE_URL}/assessments?per_page=100`);
      const assessmentsData = await assessmentsResponse.json();
      if (assessmentsData.success) {
        setAssessments(assessmentsData.data);
      }

      const statsResponse = await fetch(`${API_BASE_URL}/assessments/statistics`);
      const statsData = await statsResponse.json();
      if (statsData.success) {
        setStats(statsData.data);
      }
    } catch (error) {
      closeDialog();
      console.error('Error bulk validating assessments:', error);
      await showErrorToast('Failed to validate assessments', 'Please try again');
    }
  };

  // Export handler
  const handleExport = () => {
    if (!table) return;

    const rows = table.getFilteredRowModel().rows;
    const csv = [
      ['Assessment ID', 'Patient Name', 'Age', 'Risk Level', 'ML Score', 'Status', 'Date'].join(
        ','
      ),
      ...rows.map((row) => {
        const assessment = row.original;
        return [
          assessment.assessment_external_id,
          `"${assessment.patient_first_name} ${assessment.patient_last_name}"`,
          getAge(assessment.patient_date_of_birth),
          assessment.final_risk_level,
          assessment.ml_risk_score,
          getStatusLabel(assessment.status),
          formatDate(assessment.assessment_date),
        ].join(',');
      }),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assessments-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Stats Cards Skeleton */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card index={0} disableHoverLift={true}>
            <CardContent className="pt-6">
              <StatCardSkeleton />
            </CardContent>
          </Card>
          <Card index={1} disableHoverLift={true}>
            <CardContent className="pt-6">
              <StatCardSkeleton />
            </CardContent>
          </Card>
          <Card index={2} disableHoverLift={true}>
            <CardContent className="pt-6">
              <StatCardSkeleton />
            </CardContent>
          </Card>
          <Card index={3} disableHoverLift={true}>
            <CardContent className="pt-6">
              <StatCardSkeleton />
            </CardContent>
          </Card>
        </div>

        {/* Data Table Skeleton */}
        <Card index={4} disableHoverLift={true}>
          <CardHeader>
            <CardTitle>Assessment Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTableSkeleton />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      variants={pageTransitionVariants}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-midnight-blue text-4xl font-semibold tracking-tight md:text-5xl">
            Assessments
          </h1>
          <p className="mt-2 text-gray-600">
            Review and validate cardiovascular risk assessments from the mobile app
          </p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4 text-white" />
          Export
        </Button>
      </div>

      {/* Stats Cards */}
      <motion.div
        className="grid gap-6 md:grid-cols-4"
        variants={staggerContainerVariants}
        initial="initial"
        animate="animate"
      >
        <motion.div variants={staggerItemVariants}>
          <Card index={0}>
            <CardHeader className="pb-3">
              <CardDescription>Total Assessments</CardDescription>
              <CardTitle className="font-mono text-3xl font-semibold tracking-tight tabular-nums">
                <AnimatedNumber value={stats?.total_assessments || 0} duration={1} />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-600">All time</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={staggerItemVariants}>
          <Card index={1}>
            <CardHeader className="pb-3">
              <CardDescription>Pending Review</CardDescription>
              <CardTitle className="font-mono text-3xl font-semibold tracking-tight text-orange-600 tabular-nums">
                <AnimatedNumber value={stats?.pending_assessments || 0} duration={1} />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-600">Requires validation</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={staggerItemVariants}>
          <Card index={2}>
            <CardHeader className="pb-3">
              <CardDescription>High Risk</CardDescription>
              <CardTitle className="font-mono text-3xl font-semibold tracking-tight text-red-600 tabular-nums">
                <AnimatedNumber value={stats?.high_risk_assessments || 0} duration={1} />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-600">Priority assessments</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={staggerItemVariants}>
          <Card index={3}>
            <CardHeader className="pb-3">
              <CardDescription>Avg. ML Score</CardDescription>
              <CardTitle className="font-mono text-3xl font-semibold tracking-tight tabular-nums">
                <AnimatedNumber
                  value={stats?.average_risk_score || 0}
                  duration={1.2}
                  decimals={1}
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-600">All assessments</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Assessments DataTable */}
      <Card index={4} disableHoverLift={true}>
        <CardHeader>
          <CardTitle>Assessment Queue</CardTitle>
          <CardDescription>{assessments.length} assessments found</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={assessments}
            onTableInstanceChange={setTable}
            toolbar={(table) => (
              <DataTableToolbar
                table={table}
                searchKey="patient"
                searchPlaceholder="Search by patient name or assessment ID..."
                filterComponents={
                  <>
                    <DataTableFacetedFilter
                      column={table.getColumn('final_risk_level')}
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
                        { label: 'Pending', value: 'pending' },
                        { label: 'Validated', value: 'validated' },
                        { label: 'In Review', value: 'in_review' },
                        { label: 'Requires Referral', value: 'requires_referral' },
                      ]}
                    />
                  </>
                }
                bulkActions={
                  <Button size="sm" variant="outline" onClick={handleBulkValidate}>
                    <CheckCircle className="mr-2 h-4 w-4" strokeWidth={1.5} />
                    Bulk Validate
                  </Button>
                }
                onExport={handleExport}
              />
            )}
            pagination={(table) => <DataTablePagination table={table} />}
          />
        </CardContent>
      </Card>

      {/* Assessment Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Assessment Details</span>
              {selectedAssessment && (
                <div className="flex gap-2">
                  <Badge className={getRiskColor(selectedAssessment.final_risk_level)}>
                    {selectedAssessment.final_risk_level} Risk
                  </Badge>
                  <Badge className={getStatusColor(selectedAssessment.status)}>
                    {getStatusLabel(selectedAssessment.status)}
                  </Badge>
                </div>
              )}
            </DialogTitle>
            <DialogDescription>
              Complete cardiovascular risk assessment information
            </DialogDescription>
          </DialogHeader>

          {isLoadingDetail ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="text-heart-red mx-auto mb-4 h-8 w-8 animate-spin" />
                <p className="text-gray-600">Loading assessment details...</p>
              </div>
            </div>
          ) : selectedAssessment ? (
            <div className="space-y-6">
              {/* Patient Information */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <User className="text-heart-red h-5 w-5" />
                  Patient Information
                </h3>
                <div className="grid gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Full Name</label>
                    <p className="mt-1 text-base font-semibold text-gray-900">
                      {selectedAssessment.patient_first_name} {selectedAssessment.patient_last_name}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                    <p className="mt-1 text-base text-gray-900">
                      {formatDate(selectedAssessment.patient_date_of_birth)} (
                      {getAge(selectedAssessment.patient_date_of_birth)}y)
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Sex</label>
                    <p className="mt-1 text-base text-gray-900">{selectedAssessment.patient_sex}</p>
                  </div>
                  {selectedAssessment.patient_email && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="mt-1 text-base text-gray-900">
                        {selectedAssessment.patient_email}
                      </p>
                    </div>
                  )}
                  {selectedAssessment.patient_phone && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Phone</label>
                      <p className="mt-1 text-base text-gray-900">
                        {selectedAssessment.patient_phone}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Assessment Information */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <Calendar className="text-heart-red h-5 w-5" />
                  Assessment Information
                </h3>
                <div className="grid gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Assessment ID</label>
                    <p className="mt-1 font-mono text-base text-gray-900">
                      {selectedAssessment.assessment_external_id}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Assessment Date</label>
                    <p className="mt-1 text-base text-gray-900">
                      {formatDate(selectedAssessment.assessment_date)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Completion Rate</label>
                    <p className="mt-1 text-base text-gray-900">
                      {selectedAssessment.completion_rate}%
                    </p>
                  </div>
                  {selectedAssessment.assessment_duration_minutes && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Duration</label>
                      <p className="mt-1 text-base text-gray-900">
                        {selectedAssessment.assessment_duration_minutes} minutes
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-500">Version</label>
                    <p className="mt-1 text-base text-gray-900">{selectedAssessment.version}</p>
                  </div>
                  {selectedAssessment.data_quality_score && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Data Quality</label>
                      <p className="mt-1 text-base text-gray-900">
                        {selectedAssessment.data_quality_score}%
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Location */}
              {(selectedAssessment.country || selectedAssessment.city) && (
                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
                    <MapPin className="text-heart-red h-5 w-5" />
                    Location
                  </h3>
                  <div className="grid gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 md:grid-cols-2">
                    {selectedAssessment.country && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Country</label>
                        <p className="mt-1 text-base text-gray-900">{selectedAssessment.country}</p>
                      </div>
                    )}
                    {selectedAssessment.city && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">City</label>
                        <p className="mt-1 text-base text-gray-900">
                          {selectedAssessment.city}
                          {selectedAssessment.region && `, ${selectedAssessment.region}`}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Risk Assessment */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <TrendingUp className="text-heart-red h-5 w-5" />
                  Risk Assessment
                </h3>
                <div className="grid gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-gray-500">ML Risk Score</label>
                    <p className="mt-1 text-2xl font-semibold text-gray-900">
                      {selectedAssessment.ml_risk_score || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedAssessment.ml_risk_level || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Final Risk Score</label>
                    <p className="mt-1 text-2xl font-semibold text-gray-900">
                      {selectedAssessment.final_risk_score || 'N/A'}
                    </p>
                    <Badge className={getRiskColor(selectedAssessment.final_risk_level)}>
                      {selectedAssessment.final_risk_level}
                    </Badge>
                  </div>
                  {selectedAssessment.urgency && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Urgency</label>
                      <p className="mt-1">
                        <Badge
                          variant={
                            selectedAssessment.urgency === 'Emergency' ? 'destructive' : 'secondary'
                          }
                        >
                          {selectedAssessment.urgency}
                        </Badge>
                      </p>
                    </div>
                  )}
                  {selectedAssessment.recommended_action && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Recommended Action
                      </label>
                      <p className="mt-1 text-base text-gray-900">
                        {selectedAssessment.recommended_action}
                      </p>
                    </div>
                  )}
                  {selectedAssessment.model_confidence && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Model Confidence</label>
                      <p className="mt-1 text-base text-gray-900">
                        {(selectedAssessment.model_confidence * 100).toFixed(1)}%
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <ValidationWorkflow
                assessment={selectedAssessment}
                onActionComplete={() => handleValidationWorkflowComplete(selectedAssessment.id)}
              />
              <ClinicalNotesEditor assessmentId={selectedAssessment.id} />

              {/* Vital Signs */}
              {selectedAssessment.vital_signs &&
                Object.keys(selectedAssessment.vital_signs).length > 0 && (
                  <div>
                    <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <Activity className="text-heart-red h-5 w-5" />
                      Vital Signs
                    </h3>
                    <div className="grid gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 md:grid-cols-3">
                      {selectedAssessment.vital_signs.blood_pressure_systolic && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Blood Pressure
                          </label>
                          <p className="mt-1 text-base text-gray-900">
                            {selectedAssessment.vital_signs.blood_pressure_systolic}/
                            {selectedAssessment.vital_signs.blood_pressure_diastolic} mmHg
                          </p>
                        </div>
                      )}
                      {selectedAssessment.vital_signs.heart_rate && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Heart Rate</label>
                          <p className="mt-1 text-base text-gray-900">
                            {selectedAssessment.vital_signs.heart_rate} bpm
                          </p>
                        </div>
                      )}
                      {selectedAssessment.vital_signs.bmi && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">BMI</label>
                          <p className="mt-1 text-base text-gray-900">
                            {selectedAssessment.vital_signs.bmi}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              {/* Symptoms */}
              {selectedAssessment.symptoms &&
                Object.keys(selectedAssessment.symptoms).length > 0 && (
                  <div>
                    <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <Heart className="text-heart-red h-5 w-5" />
                      Symptoms
                    </h3>
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                      <div className="grid gap-2 md:grid-cols-2">
                        {selectedAssessment.symptoms.chest_pain && (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-gray-900">Chest Pain</span>
                          </div>
                        )}
                        {selectedAssessment.symptoms.shortness_of_breath && (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-gray-900">Shortness of Breath</span>
                          </div>
                        )}
                        {selectedAssessment.symptoms.fatigue && (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-gray-900">Fatigue</span>
                          </div>
                        )}
                        {selectedAssessment.symptoms.palpitations && (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-gray-900">Palpitations</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

              {/* Medical History */}
              {selectedAssessment.medical_history &&
                Object.keys(selectedAssessment.medical_history).length > 0 && (
                  <div>
                    <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <FileText className="text-heart-red h-5 w-5" />
                      Medical History
                    </h3>
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                      <div className="grid gap-2 md:grid-cols-2">
                        {selectedAssessment.medical_history.diabetes && (
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                            <span className="text-sm text-gray-900">Diabetes</span>
                          </div>
                        )}
                        {selectedAssessment.medical_history.hypertension && (
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                            <span className="text-sm text-gray-900">Hypertension</span>
                          </div>
                        )}
                        {selectedAssessment.medical_history.high_cholesterol && (
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                            <span className="text-sm text-gray-900">High Cholesterol</span>
                          </div>
                        )}
                        {selectedAssessment.medical_history.previous_heart_disease && (
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                            <span className="text-sm text-gray-900">Previous Heart Disease</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

              {/* Medications */}
              {selectedAssessment.medications && selectedAssessment.medications.length > 0 && (
                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
                    <Pill className="text-heart-red h-5 w-5" />
                    Medications
                  </h3>
                  <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-4">
                    {selectedAssessment.medications.map((med, idx) => (
                      <div key={idx} className="border-b border-gray-200 pb-2 last:border-0">
                        <p className="font-medium text-gray-900">{med.name}</p>
                        {(med.dosage || med.frequency) && (
                          <p className="text-sm text-gray-600">
                            {med.dosage} {med.frequency && `• ${med.frequency}`}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lifestyle */}
              {selectedAssessment.lifestyle &&
                Object.keys(selectedAssessment.lifestyle).length > 0 && (
                  <div>
                    <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <Utensils className="text-heart-red h-5 w-5" />
                      Lifestyle Factors
                    </h3>
                    <div className="grid gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 md:grid-cols-2">
                      {selectedAssessment.lifestyle.smoking !== undefined && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Smoking</label>
                          <p className="mt-1 text-base text-gray-900">
                            {selectedAssessment.lifestyle.smoking ? 'Yes' : 'No'}
                            {selectedAssessment.lifestyle.smoking_frequency &&
                              ` (${selectedAssessment.lifestyle.smoking_frequency})`}
                          </p>
                        </div>
                      )}
                      {selectedAssessment.lifestyle.exercise !== undefined && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Exercise</label>
                          <p className="mt-1 text-base text-gray-900">
                            {selectedAssessment.lifestyle.exercise ? 'Yes' : 'No'}
                            {selectedAssessment.lifestyle.exercise_frequency &&
                              ` (${selectedAssessment.lifestyle.exercise_frequency})`}
                          </p>
                        </div>
                      )}
                      {selectedAssessment.lifestyle.diet && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Diet</label>
                          <p className="mt-1 text-base text-gray-900">
                            {selectedAssessment.lifestyle.diet}
                          </p>
                        </div>
                      )}
                      {selectedAssessment.lifestyle.sleep_hours && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Sleep</label>
                          <p className="mt-1 text-base text-gray-900">
                            {selectedAssessment.lifestyle.sleep_hours} hours/night
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              {/* Recommendations */}
              {selectedAssessment.recommendations &&
                selectedAssessment.recommendations.length > 0 && (
                  <div>
                    <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <CheckCircle className="text-heart-red h-5 w-5" />
                      Recommendations
                    </h3>
                    <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                      {selectedAssessment.recommendations.map((rec, idx) => (
                        <div key={idx} className="flex gap-3">
                          <Badge variant={rec.priority === 'High' ? 'destructive' : 'secondary'}>
                            {rec.priority}
                          </Badge>
                          <div>
                            <p className="font-medium text-gray-900">{rec.type}</p>
                            <p className="text-sm text-gray-600">{rec.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Validation Information */}
              {(selectedAssessment.validated_by || selectedAssessment.validated_at) && (
                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
                    <CheckCircle className="text-heart-red h-5 w-5" />
                    Validation Information
                  </h3>
                  <div className="space-y-3 rounded-lg border border-gray-200 bg-green-50 p-4">
                    {selectedAssessment.validator && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Validated By</label>
                        <p className="mt-1 text-base font-semibold text-gray-900">
                          {selectedAssessment.validator.first_name}{' '}
                          {selectedAssessment.validator.last_name}
                        </p>
                      </div>
                    )}
                    {selectedAssessment.validated_at && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Validated At</label>
                        <p className="mt-1 text-base text-gray-900">
                          {formatDate(selectedAssessment.validated_at)}
                        </p>
                      </div>
                    )}
                    {selectedAssessment.validation_agrees_with_ml !== undefined && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Agreement with ML
                        </label>
                        <p className="mt-1">
                          <Badge
                            variant={
                              selectedAssessment.validation_agrees_with_ml ? 'default' : 'secondary'
                            }
                          >
                            {selectedAssessment.validation_agrees_with_ml ? 'Agrees' : 'Disagrees'}
                          </Badge>
                        </p>
                      </div>
                    )}
                    {selectedAssessment.validation_notes && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Validation Notes
                        </label>
                        <p className="mt-1 text-base text-gray-900">
                          {selectedAssessment.validation_notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Device & Technical Info */}
              {(selectedAssessment.device_platform || selectedAssessment.app_version) && (
                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
                    <Smartphone className="text-heart-red h-5 w-5" />
                    Device & Technical Information
                  </h3>
                  <div className="grid gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 md:grid-cols-2">
                    {selectedAssessment.device_platform && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Platform</label>
                        <p className="mt-1 text-base text-gray-900">
                          {selectedAssessment.device_platform}
                        </p>
                      </div>
                    )}
                    {selectedAssessment.app_version && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">App Version</label>
                        <p className="mt-1 text-base text-gray-900">
                          {selectedAssessment.app_version}
                        </p>
                      </div>
                    )}
                    {selectedAssessment.processing_time_ms && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Processing Time</label>
                        <p className="mt-1 text-base text-gray-900">
                          {selectedAssessment.processing_time_ms}ms
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="border-t border-gray-200 pt-4">
                <div className="grid gap-2 text-xs text-gray-500 md:grid-cols-2">
                  <div>
                    <span className="font-medium">Created:</span>{' '}
                    {formatDate(selectedAssessment.created_at)}
                  </div>
                  <div>
                    <span className="font-medium">Last Updated:</span>{' '}
                    {formatDate(selectedAssessment.updated_at)}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
