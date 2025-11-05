'use client';

import { useEffect, useState } from 'react';
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
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Users,
  TrendingUp,
  FileText,
  Bell,
  Calendar,
} from 'lucide-react';
import { getClinicalDashboard } from '@/lib/api/clinical';
import type { ClinicalDashboard } from '@/types/clinical';

const COLORS = {
  high: '#DC2626',
  moderate: '#F59E0B',
  low: '#16A34A',
  success: '#16A34A',
  warning: '#F59E0B',
  danger: '#DC2626',
  info: '#0EA5E9',
};

export default function ClinicalDashboardPage() {
  const [dashboard, setDashboard] = useState<ClinicalDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Dashboard</CardTitle>
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

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clinical Dashboard</h1>
          <p className="mt-1 text-gray-500">Assessment queue and clinical workflow management</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Date Range
          </Button>
          <Button>View All Assessments</Button>
        </div>
      </div>

      {/* Clinical Alerts */}
      {clinical_alerts.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clinical_alerts.map((alert, index) => (
            <Card
              key={index}
              className={
                alert.type === 'critical'
                  ? 'border-red-300 bg-red-50'
                  : alert.type === 'urgent'
                    ? 'border-orange-300 bg-orange-50'
                    : 'border-blue-300 bg-blue-50'
              }
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Bell
                      className={`mt-0.5 h-5 w-5 ${alert.type === 'critical' ? 'text-red-600' : alert.type === 'urgent' ? 'text-orange-600' : 'text-blue-600'}`}
                    />
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
          ))}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Assessments</CardTitle>
            <FileText className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assessment_queue.summary.total_pending}</div>
            <p className="mt-1 text-xs text-red-600">
              {assessment_queue.summary.high_risk_pending} high risk
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Validated</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workload_metrics.today_validated}</div>
            <p className="mt-1 text-xs text-gray-500">Total: {workload_metrics.total_validated}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Validation Time</CardTitle>
            <Clock className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {workload_metrics.avg_validation_time_hours.toFixed(1)}h
            </div>
            <p className="mt-1 text-xs text-gray-500">Per assessment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productivity Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workload_metrics.productivity_score}/100</div>
            <p className="mt-1 text-xs text-green-600">
              {workload_metrics.productivity_score >= 70 ? 'Excellent' : 'Good'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Assessment Queue */}
        <Card>
          <CardHeader>
            <CardTitle>Assessment Queue</CardTitle>
            <CardDescription>Priority-sorted pending assessments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {assessment_queue.assessments.slice(0, 5).map((assessment) => (
                <div
                  key={assessment.id}
                  className="flex items-center justify-between rounded-lg border p-4 hover:bg-gray-50"
                >
                  <div className="flex flex-1 items-center gap-4">
                    <div
                      className={`h-3 w-3 rounded-full ${
                        assessment.risk_level === 'High'
                          ? 'bg-red-500'
                          : assessment.risk_level === 'Moderate'
                            ? 'bg-orange-500'
                            : 'bg-green-500'
                      }`}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{assessment.patient_name}</div>
                      <div className="text-sm text-gray-500">
                        {assessment.patient_age}y, {assessment.patient_sex} • Score:{' '}
                        {assessment.ml_score}
                      </div>
                      {assessment.chief_complaint && (
                        <div className="mt-1 truncate text-xs text-gray-400">
                          {assessment.chief_complaint}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={assessment.priority === 'Urgent' ? 'destructive' : 'secondary'}>
                      {assessment.priority}
                    </Badge>
                    <div className="text-sm text-gray-500">{assessment.days_pending}d</div>
                    <Button size="sm">Review</Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 border-t pt-4 text-center">
              <Button variant="outline" className="w-full">
                View All {assessment_queue.summary.total_pending} Assessments
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Risk Distribution */}
        <Card>
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
                    <div className="text-xl font-bold">{count}</div>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Weekly Workload Trend */}
        <Card>
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

        {/* Risk Trends */}
        <Card>
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
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Validation Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Validation Accuracy</CardTitle>
            <CardDescription>Agreement with ML predictions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">ML Agreement Rate</span>
                <span className="text-2xl font-bold text-green-600">
                  {validation_metrics.ml_agreement_rate}%
                </span>
              </div>
              <div className="h-3 w-full rounded-full bg-gray-200">
                <div
                  className="h-3 rounded-full bg-green-600"
                  style={{ width: `${validation_metrics.ml_agreement_rate}%` }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 border-t pt-4">
              <div>
                <div className="text-xs text-gray-500">Total Validations</div>
                <div className="text-lg font-bold">{validation_metrics.total_validations}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Avg Adjustment</div>
                <div className="text-lg font-bold">
                  {validation_metrics.avg_score_adjustment > 0 ? '+' : ''}
                  {validation_metrics.avg_score_adjustment}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Treatment Outcomes */}
        <Card>
          <CardHeader>
            <CardTitle>Treatment Outcomes</CardTitle>
            <CardDescription>Completed referrals and follow-ups</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-gray-50 p-3 text-center">
                <div className="text-xs text-gray-500">Completed</div>
                <div className="text-2xl font-bold">{treatment_outcomes.completed_referrals}</div>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 text-center">
                <div className="text-xs text-gray-500">Avg Days</div>
                <div className="text-2xl font-bold">
                  {treatment_outcomes.avg_treatment_time_days.toFixed(0)}
                </div>
              </div>
            </div>
            <div className="border-t pt-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm">Follow-up Compliance</span>
                <span className="font-bold">{treatment_outcomes.follow_up_compliance_rate}%</span>
              </div>
              <div className="text-xs text-gray-500">
                {treatment_outcomes.follow_up_completed} / {treatment_outcomes.follow_up_required}{' '}
                completed
              </div>
            </div>
          </CardContent>
        </Card>

        {/* High Risk Patients */}
        <Card>
          <CardHeader>
            <CardTitle>High Risk Patients</CardTitle>
            <CardDescription>Requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {patient_risk_stratification.high_risk_patients.slice(0, 5).map((patient) => (
                <div
                  key={patient.id}
                  className="flex items-center justify-between rounded bg-red-50 p-2"
                >
                  <div>
                    <div className="text-sm font-medium">{patient.patient_name}</div>
                    <div className="text-xs text-gray-500">
                      Age: {patient.age} • Score: {patient.risk_score}
                    </div>
                  </div>
                  <Badge variant="destructive">{patient.days_pending}d</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
