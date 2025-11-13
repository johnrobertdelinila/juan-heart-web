'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Activity,
  Users,
  FileText,
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Heart,
} from 'lucide-react';
import { getNationalOverview } from '@/lib/api/analytics';
import { AnimatedNumber } from '@/components/animations';
import { StatCardSkeleton, ChartSkeleton } from '@/components/animations';
import {
  pageTransitionVariants,
  chartVariants,
  quickActionVariants,
  staggerContainerVariants,
  staggerItemVariants,
  priorityQueueRowVariants,
  progressBarVariants,
  riskBadgePulseVariants,
} from '@/lib/framer-config';

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
      <div className="relative z-0 space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ChartSkeleton />
          </div>
          <ChartSkeleton />
        </div>
        <ChartSkeleton />
      </div>
    );
  }
  return (
    <motion.div
      variants={pageTransitionVariants}
      initial="initial"
      animate="animate"
      className="relative z-0 space-y-6"
    >
      {/* Page Header with Clinical Context */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <div className="bg-gradient-primary shadow-clinical-md flex h-11 w-11 items-center justify-center rounded-xl">
              <Heart className="h-6 w-6 text-white" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-slate-900">
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
            <CheckCircle2 className="mr-1.5 h-3 w-3" strokeWidth={1.5} />
            <span className="font-medium">All Systems Operational</span>
          </Badge>
          <Badge variant="outline" className="border-slate-300 text-slate-600 shadow-sm">
            <Clock className="mr-1.5 h-3 w-3" strokeWidth={1.5} />
            <span className="font-medium">Last sync: 2 min ago</span>
          </Badge>
        </div>
      </div>

      {/* Critical Alerts Banner */}
      <Card
        index={0}
        disableHoverLift
        className="border-l-danger from-danger/5 shadow-clinical-md border-danger/20 border border-l-4 bg-gradient-to-r to-transparent"
      >
        <CardContent className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <div className="bg-[#dc2626] flex h-10 w-10 items-center justify-center rounded-xl shadow-sm">
              <AlertCircle className="h-5 w-5 text-white" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[#dc2626] text-sm font-semibold tracking-tight">
                3 High-Risk Assessments Require Immediate Validation
              </p>
              <p className="mt-1 text-xs font-medium text-slate-600">
                Patients awaiting clinical review for over 4 hours
              </p>
            </div>
          </div>
          <Link href="/clinical">
            <Button className="bg-[#dc2626] rounded-lg px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:shadow-md">
              Review Now
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Enhanced Stats Grid with Trends */}
      {/* Phase 3.1: Staggered stat card grid animation */}
      <motion.div
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
        variants={staggerContainerVariants}
        initial="initial"
        animate="animate"
      >
        {/* Card 1: Total Assessments */}
        {/* Phase 3.2: Enhanced hover effects */}
        <motion.div variants={staggerItemVariants}>
          <motion.div
            whileHover={{
              y: -2,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              transition: { duration: 0.2 },
            }}
          >
            <Card
              index={1}
              className="clinical-card border-l-heart-red group overflow-hidden border-l-4"
            >
          <div className="from-heart-red/5 absolute inset-0 bg-gradient-to-br via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="metric-label">Total Assessments</CardTitle>
            <div className="bg-heart-red/10 flex h-10 w-10 items-center justify-center rounded-xl shadow-sm transition-transform duration-200 group-hover:scale-110">
              <Activity className="text-heart-red h-5 w-5" strokeWidth={1.5} />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="metric-value">
              <AnimatedNumber
                value={dashboardData?.summary.total_assessments || 0}
                duration={1}
                className="inline-block"
              />
            </div>
            <div className="mt-3 flex items-center gap-1.5">
              {dashboardData && dashboardData.summary.assessments_change >= 0 ? (
                <ArrowUpRight className="text-success h-4 w-4" strokeWidth={1.5} />
              ) : (
                <ArrowDownRight className="text-danger h-4 w-4" strokeWidth={1.5} />
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
          </motion.div>
        </motion.div>

        {/* Card 2: Active Patients */}
        <motion.div variants={staggerItemVariants}>
          <motion.div
            whileHover={{
              y: -2,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              transition: { duration: 0.2 },
            }}
          >
            <Card
              index={2}
              className="clinical-card border-l-info group overflow-hidden border-l-4"
            >
          <div className="from-info/5 absolute inset-0 bg-gradient-to-br via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="metric-label">Active Patients</CardTitle>
            <div className="bg-info/10 flex h-10 w-10 items-center justify-center rounded-xl shadow-sm transition-transform duration-200 group-hover:scale-110">
              <Users className="text-info h-5 w-5" strokeWidth={1.5} />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="metric-value">
              <AnimatedNumber
                value={dashboardData?.summary.total_assessments || 0}
                duration={1.2}
                className="inline-block"
              />
            </div>
            <div className="mt-3 flex items-center gap-1.5">
              <ArrowUpRight className="text-success h-4 w-4" strokeWidth={1.5} />
              <span className="metric-trend text-success">
                +{dashboardData?.summary.high_risk_percentage || 0}%
              </span>
              <span className="text-xs font-medium text-slate-500">high risk patients</span>
            </div>
            <div className="mt-4 space-y-2">
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 shadow-inner">
                <motion.div
                  className="from-info to-info-dark h-full rounded-full bg-gradient-to-r"
                  custom={`${dashboardData?.summary.referral_completion_rate || 0}%`}
                  variants={progressBarVariants}
                  initial="initial"
                  animate="animate"
                />
              </div>
              <p className="text-xs font-semibold text-slate-600">
                {dashboardData?.summary.referral_completion_rate || 0}% referral completion
              </p>
            </div>
          </CardContent>
        </Card>
          </motion.div>
        </motion.div>

        {/* Card 3: Pending Referrals */}
        <motion.div variants={staggerItemVariants}>
          <motion.div
            whileHover={{
              y: -2,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              transition: { duration: 0.2 },
            }}
          >
            <Card
              index={3}
              className="clinical-card border-l-warning group overflow-hidden border-l-4"
            >
          <div className="from-warning/5 absolute inset-0 bg-gradient-to-br via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="metric-label">Pending Referrals</CardTitle>
            <div className="bg-warning/10 flex h-10 w-10 items-center justify-center rounded-xl shadow-sm transition-transform duration-200 group-hover:scale-110">
              <FileText className="text-warning h-5 w-5" strokeWidth={1.5} />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="metric-value">
              <AnimatedNumber
                value={dashboardData?.summary.pending_referrals || 0}
                duration={1.4}
                className="inline-block"
              />
            </div>
            <div className="mt-3 flex items-center gap-1.5">
              <Minus className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
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
          </motion.div>
        </motion.div>

        {/* Card 4: Population Risk Score */}
        <motion.div variants={staggerItemVariants}>
          <motion.div
            whileHover={{
              y: -2,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              transition: { duration: 0.2 },
            }}
          >
            <Card
              index={4}
              className="clinical-card border-l-success group overflow-hidden border-l-4"
            >
          <div className="from-success/5 absolute inset-0 bg-gradient-to-br via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="metric-label">Avg. Risk Score</CardTitle>
            <div className="bg-success/10 flex h-10 w-10 items-center justify-center rounded-xl shadow-sm transition-transform duration-200 group-hover:scale-110">
              <TrendingUp className="text-success h-5 w-5" strokeWidth={1.5} />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="metric-value">
              <AnimatedNumber
                value={dashboardData?.summary.average_risk_score || 0}
                decimals={1}
                duration={1.6}
                className="inline-block"
              />
            </div>
            <div className="mt-3 flex items-center gap-1.5">
              <Minus className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
              <span className="metric-trend text-slate-600">
                +{dashboardData?.summary.risk_score_change.toFixed(1) || '0.0'}
              </span>
              <span className="text-xs font-medium text-slate-500">points this week</span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4 text-xs">
              <div className="bg-success/5 border-success/20 rounded-lg border p-2 text-center">
                <div className="text-success text-base font-semibold">
                  {dashboardData?.risk_distribution.data.Low || 0}
                </div>
                <div className="mt-0.5 font-semibold text-slate-600">Low</div>
              </div>
              <div className="bg-warning/5 border-warning/20 rounded-lg border p-2 text-center">
                <div className="text-warning text-base font-semibold">
                  {dashboardData?.risk_distribution.data.Moderate || 0}
                </div>
                <div className="mt-0.5 font-semibold text-slate-600">Moderate</div>
              </div>
              <div className="bg-danger/5 border-danger/20 rounded-lg border p-2 text-center">
                <div className="text-danger text-base font-semibold">
                  {dashboardData?.risk_distribution.data.High || 0}
                </div>
                <div className="mt-0.5 font-semibold text-slate-600">High</div>
              </div>
            </div>
          </CardContent>
        </Card>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Priority Assessment Queue */}
        <div className="lg:col-span-2">
          <Card index={5} className="clinical-card">
          <CardHeader className="bg-gradient-subtle border-b border-slate-200/60">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold tracking-tight text-slate-900">
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
                <AlertCircle className="mr-1 h-3 w-3" strokeWidth={1.5} />4 Require Attention
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {/* Phase 3.3: Priority queue item entrance animations */}
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
                <motion.div
                  key={idx}
                  custom={idx}
                  variants={priorityQueueRowVariants}
                  initial="initial"
                  whileInView="animate"
                  viewport={{ once: true }}
                  className="group hover:border-heart-red flex cursor-pointer items-center gap-4 border-l-2 border-transparent p-6 transition-all duration-200 hover:bg-slate-50/70"
                >
                  <div className="flex-shrink-0">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-xl text-xl font-semibold shadow-sm transition-transform group-hover:scale-105 ${
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
                      <p className="text-sm font-semibold tracking-tight text-slate-900">
                        {assessment.id}
                      </p>
                      {/* Phase 3.5: Risk badge pulse enhancement */}
                      <motion.div
                        variants={riskBadgePulseVariants}
                        initial="initial"
                        animate={assessment.level === 'High' || assessment.urgent ? 'pulse' : 'static'}
                      >
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
                      </motion.div>
                      {assessment.urgent && (
                        <motion.div
                          variants={riskBadgePulseVariants}
                          initial="initial"
                          animate="pulse"
                        >
                          <Badge className="bg-danger border-0 text-xs font-semibold text-white shadow-sm">
                            URGENT
                          </Badge>
                        </motion.div>
                      )}
                    </div>
                    <p className="truncate text-xs font-medium text-slate-600">
                      {assessment.symptoms}
                    </p>
                  </div>
                  <div className="flex-shrink-0 space-y-2 text-right">
                    <p className="text-xs font-semibold text-slate-500">{assessment.time}</p>
                    <Link href={`/assessments/${assessment.id}`}>
                      <Button className="bg-gradient-primary rounded-lg px-4 py-2 text-xs font-semibold text-white transition-colors hover:shadow-md">
                        Validate
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
        </div>

        {/* Quick Clinical Actions */}
        <Card index={6} className="clinical-card">
          <CardHeader className="bg-gradient-subtle border-b border-slate-200/60">
            <CardTitle className="text-lg font-semibold tracking-tight text-slate-900">
              Quick Actions
            </CardTitle>
            <p className="mt-1 text-xs font-medium text-slate-600">Common clinical workflows</p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              <Link href="/clinical" className="block">
                <motion.div
                  variants={quickActionVariants}
                  initial="initial"
                  whileHover="hover"
                  whileTap="tap"
                  className="bg-gradient-primary group border-heart-red-dark/20 w-full cursor-pointer rounded-xl border p-4 text-left transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/30 shadow-md">
                      <Activity className="h-5 w-5 text-white" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold tracking-tight text-white">
                        Review Queue
                      </div>
                      <div className="mt-0.5 text-xs font-medium text-white/90">
                        <AnimatedNumber
                          value={dashboardData?.summary.high_risk_cases || 0}
                          duration={1}
                          className="inline-block"
                        />{' '}
                        high-risk assessments
                      </div>
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-white/80 transition-colors group-hover:text-white" strokeWidth={1.5} />
                  </div>
                </motion.div>
              </Link>

              <Link href="/referrals" className="block">
                <motion.div
                  variants={quickActionVariants}
                  initial="initial"
                  whileHover="hover"
                  whileTap="tap"
                  className="group w-full cursor-pointer rounded-xl border border-slate-200/60 bg-white p-4 text-left transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-warning/10 flex h-11 w-11 items-center justify-center rounded-lg shadow-sm">
                      <FileText className="text-warning h-5 w-5" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold tracking-tight text-slate-900">
                        Manage Referrals
                      </div>
                      <div className="mt-0.5 text-xs font-medium text-slate-600">
                        <AnimatedNumber
                          value={dashboardData?.summary.pending_referrals || 0}
                          duration={1}
                          className="inline-block"
                        />{' '}
                        pending referrals
                      </div>
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-slate-400 transition-colors group-hover:text-slate-600" strokeWidth={1.5} />
                  </div>
                </motion.div>
              </Link>

              <Link href="/analytics" className="block">
                <motion.div
                  variants={quickActionVariants}
                  initial="initial"
                  whileHover="hover"
                  whileTap="tap"
                  className="group w-full cursor-pointer rounded-xl border border-slate-200/60 bg-white p-4 text-left transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-info/10 flex h-11 w-11 items-center justify-center rounded-lg shadow-sm">
                      <TrendingUp className="text-info h-5 w-5" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold tracking-tight text-slate-900">
                        Analytics Report
                      </div>
                      <div className="mt-0.5 text-xs font-medium text-slate-600">
                        Generate insights
                      </div>
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-slate-400 transition-colors group-hover:text-slate-600" strokeWidth={1.5} />
                  </div>
                </motion.div>
              </Link>

              <Link href="/patients" className="block">
                <motion.div
                  variants={quickActionVariants}
                  initial="initial"
                  whileHover="hover"
                  whileTap="tap"
                  className="group w-full cursor-pointer rounded-xl border border-slate-200/60 bg-white p-4 text-left transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-success/10 flex h-11 w-11 items-center justify-center rounded-lg shadow-sm">
                      <Users className="text-success h-5 w-5" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold tracking-tight text-slate-900">
                        Patient Registry
                      </div>
                      <div className="mt-0.5 text-xs font-medium text-slate-600">
                        <AnimatedNumber
                          value={dashboardData?.summary.total_assessments || 0}
                          duration={1}
                          className="inline-block"
                        />{' '}
                        active patients
                      </div>
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-slate-400 transition-colors group-hover:text-slate-600" strokeWidth={1.5} />
                  </div>
                </motion.div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health & Performance */}
      <motion.div
        variants={chartVariants}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: '-100px' }}
      >
        <Card index={7} className="clinical-card">
        <CardHeader className="bg-gradient-subtle border-b border-slate-200/60">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold tracking-tight text-slate-900">
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
              <CheckCircle2 className="mr-1.5 h-3 w-3" strokeWidth={1.5} />
              <span className="font-semibold">All Systems Normal</span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* API Status */}
            <div className="space-y-3 rounded-xl border border-slate-200/60 bg-slate-50/50 p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold tracking-tight text-slate-900">API Gateway</div>
                <div className="flex items-center gap-1.5">
                  <div className="bg-success status-pulse h-2 w-2 rounded-full shadow-sm" />
                  <span className="text-success text-xs font-semibold">Online</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600">Response Time</span>
                  <span className="font-semibold text-slate-900">45ms</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600">Uptime</span>
                  <span className="text-success font-semibold">99.97%</span>
                </div>
              </div>
            </div>

            {/* Database Status */}
            <div className="space-y-3 rounded-xl border border-slate-200/60 bg-slate-50/50 p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold tracking-tight text-slate-900">Database</div>
                <div className="flex items-center gap-1.5">
                  <div className="bg-success status-pulse h-2 w-2 rounded-full shadow-sm" />
                  <span className="text-success text-xs font-semibold">Healthy</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600">Query Time</span>
                  <span className="font-semibold text-slate-900">12ms</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600">Connections</span>
                  <span className="text-info font-semibold">47/200</span>
                </div>
              </div>
            </div>

            {/* Mobile Sync */}
            <div className="space-y-3 rounded-xl border border-slate-200/60 bg-slate-50/50 p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold tracking-tight text-slate-900">Mobile Sync</div>
                <div className="flex items-center gap-1.5">
                  <div className="bg-success status-pulse h-2 w-2 rounded-full shadow-sm" />
                  <span className="text-success text-xs font-semibold">Synced</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600">Last Sync</span>
                  <span className="font-semibold text-slate-900">2 min ago</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600">Queue</span>
                  <span className="text-success font-semibold">0 pending</span>
                </div>
              </div>
            </div>

            {/* Server Load */}
            <div className="space-y-3 rounded-xl border border-slate-200/60 bg-slate-50/50 p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold tracking-tight text-slate-900">Server Load</div>
                <div className="flex items-center gap-1.5">
                  <div className="bg-success h-2 w-2 rounded-full shadow-sm" />
                  <span className="text-success text-xs font-semibold">Normal</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600">CPU Usage</span>
                  <span className="font-semibold text-slate-900">23%</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600">Memory</span>
                  <span className="font-semibold text-slate-900">4.2 GB</span>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Metrics Bar */}
          {/* Phase 3.4: System health metric bar animations */}
          <div className="mt-6 border-t border-slate-200/60 pt-6">
            <div className="mb-3 flex items-center justify-between text-xs">
              <span className="font-semibold tracking-tight text-slate-900">
                Overall System Performance
              </span>
              <span className="text-success text-sm font-semibold">Excellent (98%)</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 shadow-inner">
              <motion.div
                className="from-success via-info to-success-dark h-full rounded-full bg-gradient-to-r shadow-sm"
                custom="98%"
                variants={progressBarVariants}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="font-medium text-slate-500">All services operational</span>
              <span className="font-medium text-slate-500">Last updated: Just now</span>
            </div>
          </div>
        </CardContent>
      </Card>
      </motion.div>
    </motion.div>
  );
}
