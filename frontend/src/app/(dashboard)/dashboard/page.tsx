'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Activity,
  Users,
  FileText,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Heart,
} from 'lucide-react';
import { getNationalOverview } from '@/lib/api/analytics';

interface DashboardData {
  summary: {
    total_assessments: number;
    assessments_change: number;
    high_risk_cases: number;
    high_risk_percentage: number;
    average_risk_score: number;
    risk_score_change: number;
    pending_referrals: number;
    completed_referrals: number;
    referral_completion_rate: number;
    active_facilities: number;
  };
  risk_distribution: {
    data: {
      Low: number;
      Moderate: number;
      High: number;
    };
  };
}

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getNationalOverview();
        setDashboardData(data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="relative z-0 flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="border-heart-red mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-t-transparent"></div>
          <p className="text-slate-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="relative z-0 space-y-6">
      {/* Page Header with Clinical Context */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <div className="bg-gradient-primary shadow-clinical-md flex h-11 w-11 items-center justify-center rounded-xl">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                National CVD Monitoring
              </h1>
              <p className="mt-0.5 text-sm font-medium text-slate-600">
                Philippine Heart Center · Clinical Intelligence Platform
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="bg-success/10 text-success border-success/30 shadow-sm"
          >
            <CheckCircle2 className="mr-1.5 h-3 w-3" />
            <span className="font-medium">All Systems Operational</span>
          </Badge>
          <Badge variant="outline" className="border-slate-300 text-slate-600 shadow-sm">
            <Clock className="mr-1.5 h-3 w-3" />
            <span className="font-medium">Last sync: 2 min ago</span>
          </Badge>
        </div>
      </div>

      {/* Critical Alerts Banner */}
      <Card className="border-l-danger from-danger/5 shadow-clinical-md border-danger/20 border border-l-4 bg-gradient-to-r to-transparent">
        <CardContent className="flex items-center justify-between p-5">
          <div className="flex items-center gap-4">
            <div className="bg-danger flex h-10 w-10 items-center justify-center rounded-xl shadow-sm">
              <AlertCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-danger text-sm font-semibold tracking-tight">
                3 High-Risk Assessments Require Immediate Validation
              </p>
              <p className="mt-1 text-xs font-medium text-slate-600">
                Patients awaiting clinical review for over 4 hours
              </p>
            </div>
          </div>
          <Link href="/clinical">
            <Button className="bg-danger hover:bg-danger-dark rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:shadow-md">
              Review Now
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Enhanced Stats Grid with Trends */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Assessments */}
        <Card className="clinical-card border-l-heart-red group overflow-hidden border-l-4 transition-all duration-300 hover:-translate-y-1 hover:border-l-8 hover:shadow-2xl">
          <div className="from-heart-red/5 absolute inset-0 bg-gradient-to-br via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="metric-label">Total Assessments</CardTitle>
            <div className="bg-heart-red/10 flex h-10 w-10 items-center justify-center rounded-xl shadow-sm transition-transform duration-200 group-hover:scale-110">
              <Activity className="text-heart-red h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="metric-value">
              {dashboardData?.summary.total_assessments.toLocaleString() || 0}
            </div>
            <div className="mt-3 flex items-center gap-1.5">
              {dashboardData && dashboardData.summary.assessments_change >= 0 ? (
                <ArrowUpRight className="text-success h-4 w-4" />
              ) : (
                <ArrowDownRight className="text-danger h-4 w-4" />
              )}
              <span
                className={`metric-trend ${dashboardData && dashboardData.summary.assessments_change >= 0 ? 'text-success' : 'text-danger'}`}
              >
                {dashboardData?.summary.assessments_change >= 0 ? '+' : ''}
                {dashboardData?.summary.assessments_change || 0}%
              </span>
              <span className="text-xs font-medium text-slate-500">vs. last month</span>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="bg-danger/10 text-danger border-danger/30 text-xs font-semibold shadow-sm"
              >
                {dashboardData?.risk_distribution.data.High || 0} High Risk
              </Badge>
              <Badge
                variant="outline"
                className="bg-warning/10 text-warning border-warning/30 text-xs font-semibold shadow-sm"
              >
                {dashboardData?.risk_distribution.data.Moderate || 0} Moderate
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Active Patients */}
        <Card className="clinical-card border-l-info group overflow-hidden border-l-4 transition-all duration-300 hover:-translate-y-1 hover:border-l-8 hover:shadow-2xl">
          <div className="from-info/5 absolute inset-0 bg-gradient-to-br via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="metric-label">Active Patients</CardTitle>
            <div className="bg-info/10 flex h-10 w-10 items-center justify-center rounded-xl shadow-sm transition-transform duration-200 group-hover:scale-110">
              <Users className="text-info h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="metric-value">
              {dashboardData?.summary.total_assessments.toLocaleString() || 0}
            </div>
            <div className="mt-3 flex items-center gap-1.5">
              <ArrowUpRight className="text-success h-4 w-4" />
              <span className="metric-trend text-success">
                +{dashboardData?.summary.high_risk_percentage || 0}%
              </span>
              <span className="text-xs font-medium text-slate-500">high risk patients</span>
            </div>
            <div className="mt-4 space-y-2">
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 shadow-inner">
                <div
                  className="from-info to-info-dark h-full rounded-full bg-gradient-to-r transition-all duration-500"
                  style={{ width: `${dashboardData?.summary.referral_completion_rate || 0}%` }}
                />
              </div>
              <p className="text-xs font-semibold text-slate-600">
                {dashboardData?.summary.referral_completion_rate || 0}% referral completion
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Pending Referrals */}
        <Card
          className="clinical-card border-l-warning group overflow-hidden border-l-4 transition-all duration-300 hover:-translate-y-1 hover:border-l-8 hover:shadow-2xl"
          style={{ willChange: 'transform' }}
        >
          <div className="from-warning/5 absolute inset-0 bg-gradient-to-br via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="metric-label">Pending Referrals</CardTitle>
            <div className="bg-warning/10 flex h-10 w-10 items-center justify-center rounded-xl shadow-sm transition-transform duration-200 group-hover:scale-110">
              <FileText className="text-warning h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="metric-value">{dashboardData?.summary.pending_referrals || 0}</div>
            <div className="mt-3 flex items-center gap-1.5">
              <Minus className="h-4 w-4 text-slate-400" />
              <span className="metric-trend text-slate-600">Pending review</span>
              <span className="text-xs font-medium text-slate-500"></span>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="bg-success/10 text-success border-success/30 text-xs font-semibold shadow-sm"
              >
                {dashboardData?.summary.completed_referrals || 0} Completed
              </Badge>
              <Badge
                variant="outline"
                className="border-slate-300 bg-slate-100 text-xs font-semibold text-slate-600 shadow-sm"
              >
                {dashboardData?.summary.pending_referrals || 0} Awaiting
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Population Risk Score */}
        <Card
          className="clinical-card border-l-success group overflow-hidden border-l-4 transition-all duration-300 hover:-translate-y-1 hover:border-l-8 hover:shadow-2xl"
          style={{ willChange: 'transform' }}
        >
          <div className="from-success/5 absolute inset-0 bg-gradient-to-br via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="metric-label">Avg. Risk Score</CardTitle>
            <div className="bg-success/10 flex h-10 w-10 items-center justify-center rounded-xl shadow-sm transition-transform duration-200 group-hover:scale-110">
              <TrendingUp className="text-success h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="metric-value">
              {dashboardData?.summary.average_risk_score.toFixed(1) || '0.0'}
            </div>
            <div className="mt-3 flex items-center gap-1.5">
              <Minus className="h-4 w-4 text-slate-400" />
              <span className="metric-trend text-slate-600">
                +{dashboardData?.summary.risk_score_change.toFixed(1) || '0.0'}
              </span>
              <span className="text-xs font-medium text-slate-500">points this week</span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
              <div className="bg-success/5 border-success/20 rounded-lg border p-2 text-center">
                <div className="text-success text-base font-bold">
                  {dashboardData?.risk_distribution.data.Low || 0}
                </div>
                <div className="mt-0.5 font-semibold text-slate-600">Low</div>
              </div>
              <div className="bg-warning/5 border-warning/20 rounded-lg border p-2 text-center">
                <div className="text-warning text-base font-bold">
                  {dashboardData?.risk_distribution.data.Moderate || 0}
                </div>
                <div className="mt-0.5 font-semibold text-slate-600">Moderate</div>
              </div>
              <div className="bg-danger/5 border-danger/20 rounded-lg border p-2 text-center">
                <div className="text-danger text-base font-bold">
                  {dashboardData?.risk_distribution.data.High || 0}
                </div>
                <div className="mt-0.5 font-semibold text-slate-600">High</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Priority Assessment Queue */}
        <Card className="clinical-card lg:col-span-2">
          <CardHeader className="bg-gradient-subtle border-b border-slate-200/60">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold tracking-tight text-slate-900">
                  Priority Assessment Queue
                </CardTitle>
                <p className="mt-1 text-xs font-medium text-slate-600">
                  Real-time clinical validation queue
                </p>
              </div>
              <Badge
                variant="outline"
                className="bg-heart-red/10 text-heart-red border-heart-red/30 font-semibold shadow-sm"
              >
                <AlertCircle className="mr-1 h-3 w-3" />4 Require Attention
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {[
                {
                  id: 'ASS-2024-1847',
                  riskScore: 87,
                  level: 'High',
                  time: '3h ago',
                  symptoms: 'Chest pain, shortness of breath',
                  urgent: true,
                },
                {
                  id: 'ASS-2024-1846',
                  riskScore: 72,
                  level: 'Moderate',
                  time: '5h ago',
                  symptoms: 'Hypertension, family history',
                  urgent: false,
                },
                {
                  id: 'ASS-2024-1845',
                  riskScore: 91,
                  level: 'High',
                  time: '6h ago',
                  symptoms: 'Irregular heartbeat, fatigue',
                  urgent: true,
                },
                {
                  id: 'ASS-2024-1844',
                  riskScore: 68,
                  level: 'Moderate',
                  time: '7h ago',
                  symptoms: 'Diabetes, elevated cholesterol',
                  urgent: false,
                },
              ].map((assessment, idx) => (
                <div
                  key={idx}
                  className="group hover:border-heart-red flex cursor-pointer items-center gap-4 border-l-2 border-transparent p-5 transition-all duration-200 hover:bg-slate-50/70"
                >
                  <div className="flex-shrink-0">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-xl text-xl font-bold shadow-sm transition-transform group-hover:scale-105 ${
                        assessment.urgent
                          ? 'from-danger to-danger-dark bg-gradient-to-br text-white'
                          : 'from-warning to-warning-dark bg-gradient-to-br text-white'
                      }`}
                    >
                      {assessment.riskScore}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex items-center gap-2">
                      <p className="text-sm font-bold tracking-tight text-slate-900">
                        {assessment.id}
                      </p>
                      <Badge
                        variant="outline"
                        className={`text-xs font-semibold shadow-sm ${
                          assessment.urgent
                            ? 'bg-danger/10 text-danger border-danger/30'
                            : 'bg-warning/10 text-warning border-warning/30'
                        }`}
                      >
                        {assessment.level} Risk
                      </Badge>
                      {assessment.urgent && (
                        <Badge className="bg-danger border-0 text-xs font-bold text-white shadow-sm">
                          URGENT
                        </Badge>
                      )}
                    </div>
                    <p className="truncate text-xs font-medium text-slate-600">
                      {assessment.symptoms}
                    </p>
                  </div>
                  <div className="flex-shrink-0 space-y-2 text-right">
                    <p className="text-xs font-semibold text-slate-500">{assessment.time}</p>
                    <Link href={`/assessments/${assessment.id}`}>
                      <Button className="bg-gradient-primary rounded-lg px-4 py-2 text-xs font-bold text-white transition-colors hover:shadow-md">
                        Validate
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Clinical Actions */}
        <Card className="clinical-card">
          <CardHeader className="bg-gradient-subtle border-b border-slate-200/60">
            <CardTitle className="text-lg font-bold tracking-tight text-slate-900">
              Quick Actions
            </CardTitle>
            <p className="mt-1 text-xs font-medium text-slate-600">Common clinical workflows</p>
          </CardHeader>
          <CardContent className="p-5">
            <div className="space-y-3">
              <Link href="/clinical" className="block">
                <div className="bg-gradient-primary group border-heart-red-dark/20 w-full cursor-pointer rounded-xl border p-4 text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/20 shadow-sm">
                      <Activity className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold tracking-tight text-white">
                        Review Queue
                      </div>
                      <div className="mt-0.5 text-xs font-medium text-white/90">
                        {dashboardData?.summary.high_risk_cases || 0} high-risk assessments
                      </div>
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-white/80 transition-colors group-hover:text-white" />
                  </div>
                </div>
              </Link>

              <Link href="/referrals" className="block">
                <div className="group w-full cursor-pointer rounded-xl border border-slate-200/60 bg-white p-4 text-left transition-all duration-300 hover:scale-[1.02] hover:border-slate-300 hover:bg-slate-50 hover:shadow-xl active:scale-[0.98]">
                  <div className="flex items-center gap-3">
                    <div className="bg-warning/10 flex h-11 w-11 items-center justify-center rounded-lg shadow-sm">
                      <FileText className="text-warning h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold tracking-tight text-slate-900">
                        Manage Referrals
                      </div>
                      <div className="mt-0.5 text-xs font-medium text-slate-600">
                        {dashboardData?.summary.pending_referrals || 0} pending referrals
                      </div>
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-slate-400 transition-colors group-hover:text-slate-600" />
                  </div>
                </div>
              </Link>

              <Link href="/analytics" className="block">
                <div className="group w-full cursor-pointer rounded-xl border border-slate-200/60 bg-white p-4 text-left transition-all duration-300 hover:scale-[1.02] hover:border-slate-300 hover:bg-slate-50 hover:shadow-xl active:scale-[0.98]">
                  <div className="flex items-center gap-3">
                    <div className="bg-info/10 flex h-11 w-11 items-center justify-center rounded-lg shadow-sm">
                      <TrendingUp className="text-info h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold tracking-tight text-slate-900">
                        Analytics Report
                      </div>
                      <div className="mt-0.5 text-xs font-medium text-slate-600">
                        Generate insights
                      </div>
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-slate-400 transition-colors group-hover:text-slate-600" />
                  </div>
                </div>
              </Link>

              <Link href="/patients" className="block">
                <div className="group w-full cursor-pointer rounded-xl border border-slate-200/60 bg-white p-4 text-left transition-all duration-300 hover:scale-[1.02] hover:border-slate-300 hover:bg-slate-50 hover:shadow-xl active:scale-[0.98]">
                  <div className="flex items-center gap-3">
                    <div className="bg-success/10 flex h-11 w-11 items-center justify-center rounded-lg shadow-sm">
                      <Users className="text-success h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold tracking-tight text-slate-900">
                        Patient Registry
                      </div>
                      <div className="mt-0.5 text-xs font-medium text-slate-600">
                        {dashboardData?.summary.total_assessments || 0} active patients
                      </div>
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-slate-400 transition-colors group-hover:text-slate-600" />
                  </div>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health & Performance */}
      <Card className="clinical-card">
        <CardHeader className="bg-gradient-subtle border-b border-slate-200/60">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold tracking-tight text-slate-900">
                System Health & Performance
              </CardTitle>
              <p className="mt-1 text-xs font-medium text-slate-600">
                Real-time infrastructure monitoring
              </p>
            </div>
            <Badge
              variant="outline"
              className="bg-success/10 text-success border-success/30 shadow-sm"
            >
              <CheckCircle2 className="mr-1.5 h-3 w-3" />
              <span className="font-semibold">All Systems Normal</span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* API Status */}
            <div className="space-y-3 rounded-xl border border-slate-200/60 bg-slate-50/50 p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-bold tracking-tight text-slate-900">API Gateway</div>
                <div className="flex items-center gap-1.5">
                  <div className="bg-success status-pulse h-2 w-2 rounded-full shadow-sm" />
                  <span className="text-success text-xs font-bold">Online</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600">Response Time</span>
                  <span className="font-bold text-slate-900">45ms</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600">Uptime</span>
                  <span className="text-success font-bold">99.97%</span>
                </div>
              </div>
            </div>

            {/* Database Status */}
            <div className="space-y-3 rounded-xl border border-slate-200/60 bg-slate-50/50 p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-bold tracking-tight text-slate-900">Database</div>
                <div className="flex items-center gap-1.5">
                  <div className="bg-success status-pulse h-2 w-2 rounded-full shadow-sm" />
                  <span className="text-success text-xs font-bold">Healthy</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600">Query Time</span>
                  <span className="font-bold text-slate-900">12ms</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600">Connections</span>
                  <span className="text-info font-bold">47/200</span>
                </div>
              </div>
            </div>

            {/* Mobile Sync */}
            <div className="space-y-3 rounded-xl border border-slate-200/60 bg-slate-50/50 p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-bold tracking-tight text-slate-900">Mobile Sync</div>
                <div className="flex items-center gap-1.5">
                  <div className="bg-success status-pulse h-2 w-2 rounded-full shadow-sm" />
                  <span className="text-success text-xs font-bold">Synced</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600">Last Sync</span>
                  <span className="font-bold text-slate-900">2 min ago</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600">Queue</span>
                  <span className="text-success font-bold">0 pending</span>
                </div>
              </div>
            </div>

            {/* Server Load */}
            <div className="space-y-3 rounded-xl border border-slate-200/60 bg-slate-50/50 p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-bold tracking-tight text-slate-900">Server Load</div>
                <div className="flex items-center gap-1.5">
                  <div className="bg-success h-2 w-2 rounded-full shadow-sm" />
                  <span className="text-success text-xs font-bold">Normal</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600">CPU Usage</span>
                  <span className="font-bold text-slate-900">23%</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600">Memory</span>
                  <span className="font-bold text-slate-900">4.2 GB</span>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Metrics Bar */}
          <div className="mt-6 border-t border-slate-200/60 pt-6">
            <div className="mb-3 flex items-center justify-between text-xs">
              <span className="font-bold tracking-tight text-slate-900">
                Overall System Performance
              </span>
              <span className="text-success text-sm font-bold">Excellent (98%)</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 shadow-inner">
              <div
                className="from-success via-info to-success-dark h-full rounded-full bg-gradient-to-r shadow-sm transition-all duration-500"
                style={{ width: '98%' }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="font-medium text-slate-500">All services operational</span>
              <span className="font-medium text-slate-500">Last updated: Just now</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
