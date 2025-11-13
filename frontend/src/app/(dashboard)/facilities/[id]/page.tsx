'use client';

import { use, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
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
import { Activity, Users, FileText, Clock, Bed, TrendingUp, Award, Calendar } from 'lucide-react';
import { getFacilityDashboard } from '@/lib/api/facility';
import type { FacilityDashboard } from '@/types/facility';

const COLORS = {
  primary: '#DC2626',
  success: '#16A34A',
  warning: '#F59E0B',
  info: '#0EA5E9',
  purple: '#9333EA',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function FacilityDashboardPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const facilityId = parseInt(resolvedParams.id);

  const [dashboard, setDashboard] = useState<FacilityDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const data = await getFacilityDashboard(facilityId);
        setDashboard(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [facilityId]);

  if (loading) {
    return (
      <div className="container mx-auto space-y-6 p-6">
        <Skeleton className="h-12 w-96" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200 bg-red-50" index={0} disableHoverLift>
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Dashboard</CardTitle>
            <CardDescription>{error || 'Failed to load facility dashboard'}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const {
    summary,
    patient_flow,
    referral_metrics,
    capacity_utilization,
    staff_productivity,
    performance_comparison,
  } = dashboard;

  // Prepare chart data
  const dailyFlowChartData = patient_flow.daily_flow.slice(-14).map((day) => ({
    date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    Accepted: day.accepted,
    Rejected: day.rejected,
    Pending: day.pending,
  }));

  const capacityData = [
    { name: 'Occupied', value: capacity_utilization.occupied_beds, fill: COLORS.primary },
    { name: 'Available', value: capacity_utilization.available_beds, fill: COLORS.success },
  ];

  const acceptanceData = [
    { name: 'Accepted', value: referral_metrics.accepted_referrals, fill: COLORS.success },
    { name: 'Rejected', value: referral_metrics.rejected_referrals, fill: COLORS.warning },
  ];

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">{summary.facility_name}</h1>
          <div className="mt-2 flex items-center gap-3">
            <Badge variant="outline">{summary.facility_type}</Badge>
            <span className="text-sm text-gray-500">Facility ID: {facilityId}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4 text-gray-700" />
            Date Range
          </Button>
          <Button>Export Report</Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card index={0}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assessments Processed</CardTitle>
            <Activity className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {summary.assessments_processed.toLocaleString()}
            </div>
            <p className="mt-1 text-xs text-gray-500">Total processed</p>
          </CardContent>
        </Card>

        <Card index={1}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Patients</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{summary.active_patients.toLocaleString()}</div>
            <p className="mt-1 text-xs text-gray-500">Currently active</p>
          </CardContent>
        </Card>

        <Card index={2}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Referrals</CardTitle>
            <FileText className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{summary.pending_referrals.toLocaleString()}</div>
            <p className="mt-1 text-xs text-gray-500">Awaiting review</p>
          </CardContent>
        </Card>

        <Card index={3}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{summary.avg_response_time_hours.toFixed(1)}h</div>
            <p className="mt-1 text-xs text-gray-500">Average hours</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Patient Flow */}
        <Card index={4}>
          <CardHeader>
            <CardTitle>Patient Flow (Last 14 Days)</CardTitle>
            <CardDescription>Daily referral admissions, rejections, and pending</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyFlowChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Accepted" fill={COLORS.success} />
                <Bar dataKey="Rejected" fill={COLORS.warning} />
                <Bar dataKey="Pending" fill={COLORS.info} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-sm text-gray-500">Total Referrals</div>
                <div className="text-xl font-semibold">{patient_flow.total_referrals_received}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Admitted</div>
                <div className="text-xl font-semibold">{patient_flow.admitted_patients}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Admission Rate</div>
                <div className="text-xl font-semibold">{patient_flow.admission_rate}%</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Referral Metrics */}
        <Card index={5}>
          <CardHeader>
            <CardTitle>Referral Performance</CardTitle>
            <CardDescription>Acceptance vs Rejection rates</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={acceptanceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {acceptanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-sm text-gray-500">Acceptance Rate</div>
                <div className="text-xl font-semibold text-green-600">
                  {referral_metrics.acceptance_rate}%
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Rejection Rate</div>
                <div className="text-xl font-semibold text-orange-600">
                  {referral_metrics.rejection_rate}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Capacity Utilization */}
        <Card index={6}>
          <CardHeader>
            <CardTitle>Capacity Utilization</CardTitle>
            <CardDescription>Bed and ICU occupancy</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">Bed Occupancy</span>
                  <span className="text-sm text-gray-500">
                    {(capacity_utilization?.occupancy_percentage ?? 0).toFixed(1)}%
                  </span>
                </div>
                <div className="h-3 w-full rounded-full bg-gray-200">
                  <div
                    className="h-3 rounded-full bg-red-600 transition-all"
                    style={{ width: `${capacity_utilization?.occupancy_percentage ?? 0}%` }}
                  />
                </div>
                <div className="mt-1 flex justify-between text-xs text-gray-500">
                  <span>
                    {capacity_utilization?.occupied_beds ?? 0} /{' '}
                    {capacity_utilization?.bed_capacity ?? 0} beds
                  </span>
                  <span>{capacity_utilization?.available_beds ?? 0} available</span>
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">ICU Occupancy</span>
                  <span className="text-sm text-gray-500">
                    {(capacity_utilization?.icu_occupancy_percentage ?? 0).toFixed(1)}%
                  </span>
                </div>
                <div className="h-3 w-full rounded-full bg-gray-200">
                  <div
                    className="h-3 rounded-full bg-orange-600 transition-all"
                    style={{ width: `${capacity_utilization?.icu_occupancy_percentage ?? 0}%` }}
                  />
                </div>
                <div className="mt-1 flex justify-between text-xs text-gray-500">
                  <span>{capacity_utilization?.icu_capacity ?? 0} ICU beds</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 border-t pt-4">
                <div className="text-center">
                  <Bed className="mx-auto mb-1 h-5 w-5 text-gray-500" />
                  <div className="text-sm text-gray-500">Total Capacity</div>
                  <div className="text-lg font-semibold">{capacity_utilization?.bed_capacity ?? 0}</div>
                </div>
                <div className="text-center">
                  <Users className="mx-auto mb-1 h-5 w-5 text-gray-500" />
                  <div className="text-sm text-gray-500">Staff</div>
                  <div className="text-lg font-semibold">{capacity_utilization?.staff_count ?? 0}</div>
                </div>
                <div className="text-center">
                  <Activity className="mx-auto mb-1 h-5 w-5 text-gray-500" />
                  <div className="text-sm text-gray-500">Patients/Staff</div>
                  <div className="text-lg font-semibold">
                    {(capacity_utilization?.patients_per_staff ?? 0).toFixed(1)}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Comparison */}
        <Card index={7}>
          <CardHeader>
            <CardTitle>Performance Benchmarking</CardTitle>
            <CardDescription>
              Comparison with similar {performance_comparison.facility_type} facilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium">Acceptance Rate Ranking</span>
                  <Badge variant="secondary">
                    #{performance_comparison.acceptance_rate.rank} of{' '}
                    {performance_comparison.acceptance_rate.total_facilities}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-red-50 p-4">
                    <div className="mb-1 text-xs text-gray-500">This Facility</div>
                    <div className="text-2xl font-semibold text-red-600">
                      {performance_comparison.acceptance_rate.this_facility}%
                    </div>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-4">
                    <div className="mb-1 text-xs text-gray-500">Average</div>
                    <div className="text-2xl font-semibold text-gray-600">
                      {performance_comparison.acceptance_rate.average_for_type}%
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium">Response Time Comparison</span>
                  <TrendingUp className="h-4 w-4 text-gray-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-red-50 p-4">
                    <div className="mb-1 text-xs text-gray-500">This Facility</div>
                    <div className="text-2xl font-semibold text-red-600">
                      {performance_comparison.avg_response_time.this_facility}h
                    </div>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-4">
                    <div className="mb-1 text-xs text-gray-500">Average</div>
                    <div className="text-2xl font-semibold text-gray-600">
                      {performance_comparison.avg_response_time.average_for_type}h
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Staff Productivity & Top Referral Sources */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Staff Productivity */}
        <Card index={8}>
          <CardHeader>
            <CardTitle>Staff Productivity</CardTitle>
            <CardDescription>Top performing doctors by validations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {staff_productivity.doctor_productivity.slice(0, 5).map((doctor, index) => (
                <div
                  key={doctor.doctor_id}
                  className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                >
                  <div className="flex items-center gap-3">
                    {index === 0 && <Award className="h-5 w-5 text-yellow-500" />}
                    <div>
                      <div className="font-medium">{doctor.doctor_name}</div>
                      <div className="text-sm text-gray-500">
                        Avg: {doctor.avg_validation_hours}h
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold">{doctor.validations_count}</div>
                    <div className="text-xs text-gray-500">validations</div>
                  </div>
                </div>
              ))}
              <div className="border-t pt-4 text-center">
                <div className="text-sm text-gray-500">Total Validations</div>
                <div className="text-2xl font-semibold">{staff_productivity.total_validations}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Referral Sources */}
        <Card index={9}>
          <CardHeader>
            <CardTitle>Top Referral Sources</CardTitle>
            <CardDescription>Facilities sending most referrals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {referral_metrics.top_referral_sources.slice(0, 5).map((source, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{source.name}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-lg font-semibold">{source.count}</div>
                    <div className="h-2 w-24 rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-red-600"
                        style={{
                          width: `${(source.count / referral_metrics.total_referrals) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
