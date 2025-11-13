'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ColumnDef } from '@tanstack/react-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTable } from '@/components/ui/data-table';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { DataTableToolbar } from '@/components/ui/data-table-toolbar';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { DataTableFacetedFilter } from '@/components/ui/data-table-faceted-filter';
import type { Table } from '@tanstack/react-table';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  CheckCircle2,
  Clock,
  TrendingUp,
  FileText,
  Bell,
  Calendar,
} from 'lucide-react';
import { getClinicalDashboard } from '@/lib/api/clinical';
import type { ClinicalDashboard, AssessmentQueueItem } from '@/types/clinical';
import { AnimatedNumber } from '@/components/animations';
import { LoadingShimmer, StatCardSkeleton, ChartSkeleton } from '@/components/animations';
import {
  pageTransitionVariants,
  staggerContainerVariants,
  staggerItemVariants,
  chartVariants,
  priorityQueueRowVariants,
  progressBarVariants,
  riskBadgePulseVariants,
  quickActionVariants,
  urgentPulseVariants,
} from '@/lib/framer-config';

// Semantic colors aligned with Juan Heart Design System
const COLORS = {
  high: '#dc2626', // --danger (Heart Red)
  moderate: '#f59e0b', // --warning
  low: '#16a34a', // --success
  success: '#16a34a', // --success
  warning: '#f59e0b', // --warning
  danger: '#dc2626', // --danger (Heart Red)
  info: '#0ea5e9', // --info
};

// Helper function to get risk level color
const getRiskColor = (riskLevel: string): string => {
  switch (riskLevel) {
    case 'High':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'Moderate':
      return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'Low':
      return 'bg-green-50 text-green-700 border-green-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

// Column definitions for Assessment Queue DataTable
const assessmentQueueColumns: ColumnDef<AssessmentQueueItem>[] = [
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
    size: 40,
  },
  {
    id: 'priority',
    header: '',
    cell: ({ row }) => {
      const assessment = row.original;
      const color =
        assessment.risk_level === 'High'
          ? COLORS.high
          : assessment.risk_level === 'Moderate'
            ? COLORS.moderate
            : COLORS.low;
      return (
        <div
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: color }}
          title={`${assessment.risk_level} Risk`}
        />
      );
    },
    enableSorting: false,
    size: 40,
  },
  {
    accessorKey: 'patient_name',
    id: 'patient_name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Patient" />,
    cell: ({ row }) => (
      <span className="font-medium text-slate-900">{row.getValue('patient_name')}</span>
    ),
    enableSorting: true,
  },
  {
    id: 'age_sex',
    accessorFn: (row) => `${row.patient_age || 'N/A'}y, ${row.patient_sex}`,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Age / Sex" />,
    cell: ({ row }) => {
      const assessment = row.original;
      return (
        <span className="text-sm text-slate-700">
          {assessment.patient_age || 'N/A'}y, {assessment.patient_sex}
        </span>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: 'ml_score',
    id: 'ml_score',
    header: ({ column }) => <DataTableColumnHeader column={column} title="ML Score" />,
    cell: ({ row }) => (
      <span className="font-mono text-sm font-medium text-slate-900">
        {row.getValue('ml_score')}
      </span>
    ),
    enableSorting: true,
  },
  {
    accessorKey: 'chief_complaint',
    id: 'chief_complaint',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Chief Complaint" />,
    cell: ({ row }) => {
      const complaint = row.getValue('chief_complaint') as string | null;
      return (
        <span className="text-sm text-slate-700 line-clamp-1" title={complaint || 'N/A'}>
          {complaint || 'N/A'}
        </span>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: 'risk_level',
    id: 'risk_level',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Risk Level" />,
    cell: ({ row }) => {
      const riskLevel = row.getValue('risk_level') as string;
      return (
        <motion.div
          variants={riskBadgePulseVariants}
          initial="initial"
          animate={riskLevel === 'High' ? 'pulse' : 'static'}
        >
          <Badge className={getRiskColor(riskLevel)}>{riskLevel}</Badge>
        </motion.div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    enableSorting: true,
  },
  {
    accessorKey: 'days_pending',
    id: 'days_pending',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Days Pending" />,
    cell: ({ row }) => (
      <span className="text-sm text-slate-700">{row.getValue('days_pending')}d</span>
    ),
    enableSorting: true,
  },
  {
    id: 'actions',
    header: () => <div className="text-right">Actions</div>,
    cell: () => (
      <div className="text-right">
        <Button size="sm">Review</Button>
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
];

export default function ClinicalDashboardPage() {
  const [dashboard, setDashboard] = useState<ClinicalDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllAssessments, setShowAllAssessments] = useState(false);
  const [table, setTable] = useState<Table<AssessmentQueueItem> | null>(null);

  // TODO: Get actual user ID from auth context
  // Using valid user ID (1) for demo purposes - this user exists in database
  const userId = 1;

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const data = await getClinicalDashboard(userId);
        setDashboard(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [userId]);

  if (loading) {
    return (
      <div className="container mx-auto space-y-6 p-6">
        <Skeleton className="h-12 w-96" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="container mx-auto p-6">
        <Card index={0} disableHoverLift className="border-red-200/60 bg-red-50/50">
          <CardHeader>
            <CardTitle style={{ color: 'var(--danger)' }}>Error Loading Dashboard</CardTitle>
            <CardDescription>{error || 'Failed to load clinical dashboard'}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const {
    assessment_queue,
    patient_risk_stratification,
    clinical_alerts,
    workload_metrics,
    validation_metrics,
    treatment_outcomes,
  } = dashboard;

  // Prepare chart data
  const riskDistributionData = Object.entries(patient_risk_stratification.risk_distribution).map(
    ([name, value]) => ({
      name,
      value,
      fill: COLORS[name.toLowerCase() as keyof typeof COLORS] || COLORS.info,
    })
  );

  const weeklyTrendData = workload_metrics.weekly_trend.map((item) => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    validations: item.count,
  }));

  const riskTrendsData = patient_risk_stratification.risk_trends.slice(-14).map((item) => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    High: item.high_risk,
    Moderate: item.moderate_risk,
    Low: item.low_risk,
  }));

  // Export handler for assessment queue
  const handleExport = () => {
    if (!table) return;

    const rows = table.getFilteredRowModel().rows;
    const csv = [
      ['Patient', 'Age', 'Sex', 'ML Score', 'Risk Level', 'Days Pending', 'Chief Complaint'].join(','),
      ...rows.map((row) => {
        const assessment = row.original;
        return [
          `"${assessment.patient_name}"`,
          assessment.patient_age || 'N/A',
          assessment.patient_sex,
          assessment.ml_score,
          assessment.risk_level,
          assessment.days_pending,
          `"${assessment.chief_complaint || 'N/A'}"`,
        ].join(',');
      }),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clinical-queue-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      className="container mx-auto space-y-6 p-6"
      variants={pageTransitionVariants}
      initial="initial"
      animate="animate"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Clinical Dashboard</h1>
          <p className="mt-1 text-gray-500">Assessment queue and clinical workflow management</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4 text-gray-700" strokeWidth={1.5} />
            Date Range
          </Button>
          <Button>View All Assessments</Button>
        </div>
      </div>

      {/* Clinical Alerts */}
      {clinical_alerts.length > 0 && (
        <motion.div
          className="space-y-4"
          variants={staggerContainerVariants}
          initial="initial"
          animate="animate"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {clinical_alerts.map((alert, index) => (
              <motion.div key={index} variants={staggerItemVariants}>
                <Card
                  index={index}
                  disableHoverLift
                  className={
                    alert.type === 'critical'
                      ? 'border-red-200/60 bg-red-50/50'
                      : alert.type === 'urgent'
                        ? 'border-orange-200/60 bg-orange-50/50'
                        : 'border-blue-200/60 bg-blue-50/50'
                  }
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <motion.div
                          variants={urgentPulseVariants}
                          initial="initial"
                          animate={alert.type === 'critical' ? 'animate' : 'initial'}
                        >
                          <Bell
                            className={`mt-0.5 h-5 w-5`}
                            strokeWidth={1.5}
                            style={{
                              color:
                                alert.type === 'critical'
                                  ? 'var(--danger)'
                                  : alert.type === 'urgent'
                                    ? 'var(--warning)'
                                    : 'var(--info)',
                            }}
                          />
                        </motion.div>
                        <div>
                          <h3 className="font-semibold">{alert.title}</h3>
                          <p className="mt-1 text-sm text-gray-600">{alert.message}</p>
                          <Button size="sm" variant="link" className="mt-2 pl-0">
                            {alert.action} →
                          </Button>
                        </div>
                      </div>
                      <Badge
                        variant={alert.type === 'critical' ? 'destructive' : 'secondary'}
                        className="ml-2"
                      >
                        {alert.count}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Summary Cards */}
      <motion.div
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
        variants={staggerContainerVariants}
        initial="initial"
        animate="animate"
      >
        {/* Card 1: Pending Assessments */}
        <motion.div variants={staggerItemVariants}>
          <motion.div
            whileHover={{
              y: -2,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              transition: { duration: 0.2 },
            }}
          >
            <Card index={0}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Assessments</CardTitle>
                <FileText className="h-4 w-4 text-gray-500" strokeWidth={1.5} />
              </CardHeader>
              <CardContent>
                <AnimatedNumber
                  value={assessment_queue.summary.total_pending || 0}
                  duration={1}
                  className="text-2xl font-semibold"
                />
                <p className="mt-1 text-xs" style={{ color: 'var(--danger)' }}>
                  {assessment_queue.summary.high_risk_pending} high risk
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Card 2: Today's Validated */}
        <motion.div variants={staggerItemVariants}>
          <motion.div
            whileHover={{
              y: -2,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              transition: { duration: 0.2 },
            }}
          >
            <Card index={1}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today&apos;s Validated</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-gray-500" strokeWidth={1.5} />
              </CardHeader>
              <CardContent>
                <AnimatedNumber
                  value={workload_metrics.today_validated || 0}
                  duration={1.2}
                  className="text-2xl font-semibold"
                />
                <p className="mt-1 text-xs text-gray-500">Total: {workload_metrics.total_validated}</p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Card 3: Avg Validation Time */}
        <motion.div variants={staggerItemVariants}>
          <motion.div
            whileHover={{
              y: -2,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              transition: { duration: 0.2 },
            }}
          >
            <Card index={2}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Validation Time</CardTitle>
                <Clock className="h-4 w-4 text-gray-500" strokeWidth={1.5} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">
                  <AnimatedNumber
                    value={workload_metrics.avg_validation_time_hours || 0}
                    duration={1.4}
                    decimals={1}
                    suffix="h"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Per assessment</p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Card 4: Productivity Score */}
        <motion.div variants={staggerItemVariants}>
          <motion.div
            whileHover={{
              y: -2,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              transition: { duration: 0.2 },
            }}
          >
            <Card index={3}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Productivity Score</CardTitle>
                <TrendingUp className="h-4 w-4 text-gray-500" strokeWidth={1.5} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">
                  <AnimatedNumber
                    value={workload_metrics.productivity_score || 0}
                    duration={1.6}
                    suffix="/100"
                  />
                </div>
                <p className="mt-1 text-xs" style={{ color: 'var(--success)' }}>
                  {workload_metrics.productivity_score >= 70 ? 'Excellent' : 'Good'}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Assessment Queue */}
        <motion.div
          variants={chartVariants}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-100px' }}
        >
          <Card index={4} disableHoverLift={true}>
            <CardHeader>
              <CardTitle>Assessment Queue</CardTitle>
              <CardDescription>
                {showAllAssessments
                  ? `All ${assessment_queue.summary.total_pending} pending assessments`
                  : `Top 5 priority assessments (${assessment_queue.summary.total_pending} total)`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={assessmentQueueColumns}
                data={
                  showAllAssessments
                    ? assessment_queue.assessments
                    : assessment_queue.assessments.slice(0, 5)
                }
                loading={false}
                enablePagination={showAllAssessments}
                enableRowSelection={true}
                pageSize={10}
                disableAnimations={false}
                onTableInstanceChange={setTable}
                toolbar={(table) => (
                  <DataTableToolbar
                    table={table}
                    searchKey="patient_name"
                    searchPlaceholder="Search by patient name..."
                    filterComponents={
                      <DataTableFacetedFilter
                        column={table.getColumn('risk_level')}
                        title="Risk Level"
                        options={[
                          { label: 'High', value: 'High' },
                          { label: 'Moderate', value: 'Moderate' },
                          { label: 'Low', value: 'Low' },
                        ]}
                      />
                    }
                    onExport={handleExport}
                  />
                )}
                pagination={(table) => showAllAssessments && <DataTablePagination table={table} />}
                emptyState={
                  <tr>
                    <td colSpan={9} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <CheckCircle2 className="h-8 w-8 text-green-500" strokeWidth={1.5} />
                        <p className="text-sm font-medium text-slate-900">No pending assessments</p>
                        <p className="text-xs text-slate-600">All assessments have been validated</p>
                      </div>
                    </td>
                  </tr>
                }
              />
              {!showAllAssessments && (
                <div className="mt-4 border-t pt-4 text-center">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowAllAssessments(true)}
                  >
                    View All {assessment_queue.summary.total_pending} Assessments
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Risk Distribution */}
        <motion.div
          variants={chartVariants}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-100px' }}
        >
          <Card index={5}>
            <CardHeader>
              <CardTitle>Patient Risk Distribution</CardTitle>
              <CardDescription>Current risk level breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={riskDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {riskDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                {Object.entries(patient_risk_stratification.risk_distribution).map(
                  ([level, count]) => (
                    <div key={level}>
                      <div className="text-sm text-gray-500">{level}</div>
                      <div className="text-xl font-semibold">{count}</div>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Weekly Workload Trend */}
        <motion.div
          variants={chartVariants}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-100px' }}
        >
          <Card index={6}>
            <CardHeader>
              <CardTitle>Weekly Validation Trend</CardTitle>
              <CardDescription>Assessments validated per day</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weeklyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="validations" stroke={COLORS.high} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Risk Trends */}
        <motion.div
          variants={chartVariants}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-100px' }}
        >
          <Card index={7}>
            <CardHeader>
              <CardTitle>Risk Level Trends (14 Days)</CardTitle>
              <CardDescription>Daily risk assessment distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={riskTrendsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="High" fill={COLORS.high} />
                  <Bar dataKey="Moderate" fill={COLORS.moderate} />
                  <Bar dataKey="Low" fill={COLORS.low} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Validation Metrics */}
        <Card index={8}>
          <CardHeader>
            <CardTitle>Validation Accuracy</CardTitle>
            <CardDescription>Agreement with ML predictions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">ML Agreement Rate</span>
                <span className="text-2xl font-semibold" style={{ color: 'var(--success)' }}>
                  <AnimatedNumber
                    value={validation_metrics.ml_agreement_rate || 0}
                    duration={1}
                    decimals={1}
                    suffix="%"
                  />
                </span>
              </div>
              <motion.div className="h-3 w-full rounded-full bg-gray-200 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    backgroundColor: 'var(--success)',
                  }}
                  custom={`${validation_metrics.ml_agreement_rate || 0}%`}
                  variants={progressBarVariants}
                  initial="initial"
                  animate="animate"
                />
              </motion.div>
            </div>
            <div className="grid grid-cols-2 gap-4 border-t pt-4">
              <div>
                <div className="text-xs text-gray-500">Total Validations</div>
                <div className="text-lg font-semibold">
                  <AnimatedNumber
                    value={validation_metrics.total_validations || 0}
                    duration={1.2}
                  />
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Avg Adjustment</div>
                <div className="text-lg font-semibold">
                  <AnimatedNumber
                    value={validation_metrics.avg_score_adjustment || 0}
                    duration={1.4}
                    decimals={2}
                    prefix={validation_metrics.avg_score_adjustment > 0 ? '+' : ''}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Treatment Outcomes */}
        <Card index={9}>
          <CardHeader>
            <CardTitle>Treatment Outcomes</CardTitle>
            <CardDescription>Completed referrals and follow-ups</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-gray-50 p-3 text-center">
                <div className="text-xs text-gray-500">Completed</div>
                <div className="text-2xl font-semibold">
                  <AnimatedNumber
                    value={treatment_outcomes.completed_referrals || 0}
                    duration={1}
                  />
                </div>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 text-center">
                <div className="text-xs text-gray-500">Avg Days</div>
                <div className="text-2xl font-semibold">
                  <AnimatedNumber
                    value={treatment_outcomes.avg_treatment_time_days || 0}
                    duration={1.2}
                    decimals={1}
                  />
                </div>
              </div>
            </div>
            <div className="border-t pt-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm">Follow-up Compliance</span>
                <span className="font-semibold">
                  <AnimatedNumber
                    value={treatment_outcomes.follow_up_compliance_rate || 0}
                    duration={1.4}
                    decimals={1}
                    suffix="%"
                  />
                </span>
              </div>
              <motion.div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    backgroundColor: 'var(--success)',
                  }}
                  custom={`${treatment_outcomes.follow_up_compliance_rate || 0}%`}
                  variants={progressBarVariants}
                  initial="initial"
                  animate="animate"
                />
              </motion.div>
              <div className="mt-2 text-xs text-gray-500">
                {treatment_outcomes.follow_up_completed} / {treatment_outcomes.follow_up_required}{' '}
                completed
              </div>
            </div>
          </CardContent>
        </Card>

        {/* High Risk Patients */}
        <Card index={10}>
          <CardHeader>
            <CardTitle>High Risk Patients</CardTitle>
            <CardDescription>Requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {patient_risk_stratification.high_risk_patients.slice(0, 5).map((patient, idx) => (
                <motion.div
                  key={patient.id}
                  custom={idx}
                  variants={priorityQueueRowVariants}
                  initial="initial"
                  whileInView="animate"
                  viewport={{ once: true }}
                  className="flex items-center justify-between rounded-lg border border-danger/30 bg-danger/5 p-4 transition-colors hover:bg-danger/10"
                >
                  <div>
                    <div className="text-sm font-medium">{patient.patient_name}</div>
                    <div className="text-xs text-gray-500">
                      Age: {patient.age} • Score: {patient.risk_score}
                    </div>
                  </div>
                  <motion.div
                    variants={riskBadgePulseVariants}
                    initial="initial"
                    animate="pulse"
                  >
                    <Badge variant="destructive">{patient.days_pending}d</Badge>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
