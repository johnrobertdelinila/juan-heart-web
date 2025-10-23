'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Users,
  MapPin,
  Download,
  RefreshCw,
  Calendar,
} from 'lucide-react';
import { getNationalOverview, getRealTimeMetrics } from '@/lib/api/analytics';
import type { NationalOverview, RealTimeMetrics } from '@/types/analytics';
import { toast } from 'sonner';

// Juan Heart color palette
const COLORS = {
  high: '#DC2626', // Red
  moderate: '#F59E0B', // Amber
  low: '#16A34A', // Green
  primary: '#DC2626',
  secondary: '#1E293B',
  info: '#0EA5E9',
};

const RISK_COLORS = [COLORS.high, COLORS.moderate, COLORS.low];

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [overview, setOverview] = useState<NationalOverview | null>(null);
  const [realTimeMetrics, setRealTimeMetrics] = useState<RealTimeMetrics | null>(null);
  const [filters, setFilters] = useState({
    start_date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [overviewData, metricsData] = await Promise.all([
        getNationalOverview(filters),
        getRealTimeMetrics(),
      ]);
      setOverview(overviewData);
      setRealTimeMetrics(metricsData);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast.error('Failed to load analytics data', {
        description: 'Please try again or contact support if the issue persists.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
    toast.success('Dashboard refreshed');
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    fetchData();
  };

  useEffect(() => {
    fetchData();
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !overview) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <RefreshCw className="text-heart-red mx-auto h-12 w-12 animate-spin" />
          <p className="mt-4 text-gray-600">Loading analytics dashboard...</p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const riskDistributionData = Object.entries(overview.risk_distribution.data).map(
    ([level, count]) => ({
      name: level,
      value: count,
      percentage: overview.risk_distribution.percentages[level],
    })
  );

  const trendData = overview.trends.daily_assessments.map((item) => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    total: item.total,
    high: item.high_risk,
    moderate: item.moderate_risk,
    low: item.low_risk,
    avgScore: item.avg_score,
  }));

  const ageDistributionData = Object.entries(overview.demographics.age_distribution).map(
    ([age, count]) => ({
      age,
      count,
    })
  );

  const sexDistributionData = Object.entries(overview.demographics.sex_distribution).map(
    ([sex, count]) => ({
      sex,
      count,
    })
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-midnight-blue text-3xl font-bold">National Overview Dashboard</h1>
          <p className="text-gray-600">
            Comprehensive analytics and insights for Juan Heart platform
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Date Range Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Calendar className="mr-2 h-5 w-5" />
            Date Range Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={filters.start_date}
                onChange={(e) => handleFilterChange('start_date', e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={filters.end_date}
                onChange={(e) => handleFilterChange('end_date', e.target.value)}
              />
            </div>
            <Button onClick={applyFilters}>Apply Filters</Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
            <Activity className="text-heart-red h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview.summary.total_assessments.toLocaleString()}
            </div>
            <p className="flex items-center text-xs text-gray-600">
              {overview.summary.assessments_change > 0 ? (
                <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3 text-red-600" />
              )}
              {Math.abs(overview.summary.assessments_change)}% from previous period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk Cases</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview.summary.high_risk_cases.toLocaleString()}
            </div>
            <p className="text-xs text-gray-600">
              {overview.summary.high_risk_percentage}% of total assessments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Risk Score</CardTitle>
            <Activity className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview.summary.average_risk_score.toFixed(1)}
            </div>
            <p className="flex items-center text-xs text-gray-600">
              {overview.summary.risk_score_change > 0 ? (
                <TrendingUp className="mr-1 h-3 w-3 text-red-600" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3 text-green-600" />
              )}
              {Math.abs(overview.summary.risk_score_change).toFixed(1)} points change
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Facilities</CardTitle>
            <MapPin className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.summary.active_facilities}</div>
            <p className="text-xs text-gray-600">Healthcare facilities registered</p>
          </CardContent>
        </Card>
      </div>

      {/* Real-Time Metrics */}
      {realTimeMetrics && (
        <Card>
          <CardHeader>
            <CardTitle>Real-Time Assessment Metrics</CardTitle>
            <CardDescription>Live assessment counts across different time periods</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-5">
              <div className="text-center">
                <p className="text-heart-red text-2xl font-bold">
                  {realTimeMetrics.total.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Total</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{realTimeMetrics.today.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Today</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{realTimeMetrics.this_week.toLocaleString()}</p>
                <p className="text-sm text-gray-600">This Week</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{realTimeMetrics.this_month.toLocaleString()}</p>
                <p className="text-sm text-gray-600">This Month</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-600">
                  {realTimeMetrics.pending_validation.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Pending Validation</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts Section */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="risk">Risk Distribution</TabsTrigger>
          <TabsTrigger value="geography">Geography</TabsTrigger>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
          <TabsTrigger value="system">System Health</TabsTrigger>
        </TabsList>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Assessment Trends Over Time</CardTitle>
              <CardDescription>
                Daily assessment volume and risk breakdown ({overview.trends.trend_direction} trend)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke={COLORS.primary}
                    fillOpacity={1}
                    fill="url(#colorTotal)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Risk Level Distribution Over Time</CardTitle>
              <CardDescription>Stacked view of risk categories</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="high"
                    stackId="1"
                    stroke={COLORS.high}
                    fill={COLORS.high}
                  />
                  <Area
                    type="monotone"
                    dataKey="moderate"
                    stackId="1"
                    stroke={COLORS.moderate}
                    fill={COLORS.moderate}
                  />
                  <Area
                    type="monotone"
                    dataKey="low"
                    stackId="1"
                    stroke={COLORS.low}
                    fill={COLORS.low}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Average Risk Score Trend</CardTitle>
              <CardDescription>Daily average ML risk scores</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="avgScore"
                    stroke={COLORS.info}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Risk Distribution Tab */}
        <TabsContent value="risk" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Risk Level Distribution</CardTitle>
                <CardDescription>Breakdown of assessments by risk category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={riskDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {riskDistributionData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={RISK_COLORS[index % RISK_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Distribution Counts</CardTitle>
                <CardDescription>Absolute numbers by risk level</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={riskDistributionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill={COLORS.primary}>
                      {riskDistributionData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={RISK_COLORS[index % RISK_COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Geography Tab */}
        <TabsContent value="geography" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Geographic Distribution</CardTitle>
              <CardDescription>Assessment distribution across regions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {overview.geographic_distribution.slice(0, 10).map((region) => (
                  <div key={region.region} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="text-heart-red h-4 w-4" />
                        <span className="font-medium">{region.region || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span>{region.total_assessments.toLocaleString()} assessments</span>
                        <span className="text-red-600">
                          {region.high_risk_count} high risk ({region.high_risk_percentage}%)
                        </span>
                      </div>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full bg-red-600"
                        style={{ width: `${region.high_risk_percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Demographics Tab */}
        <TabsContent value="demographics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Age Distribution</CardTitle>
                <CardDescription>Assessments by age group</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={ageDistributionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="age" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill={COLORS.primary} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sex Distribution</CardTitle>
                <CardDescription>Assessments by biological sex</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={sexDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ sex, count }) => `${sex}: ${count}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {sexDistributionData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={[COLORS.info, COLORS.moderate][index % 2]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* System Health Tab */}
        <TabsContent value="system" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Validation Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{overview.system_health.validation_rate}%</div>
                <p className="text-sm text-gray-600">Assessments validated by clinicians</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Avg Validation Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {overview.system_health.avg_validation_time_hours.toFixed(1)}h
                </div>
                <p className="text-sm text-gray-600">Time to clinical validation</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Referral Acceptance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {overview.system_health.referral_acceptance_rate}%
                </div>
                <p className="text-sm text-gray-600">Referrals accepted by facilities</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>System Performance Indicators</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">System Uptime</span>
                <span className="text-2xl font-bold text-green-600">
                  {overview.system_health.system_uptime}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Active Users Today</span>
                <span className="text-2xl font-bold">
                  {overview.system_health.active_users_today}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Referral Completion Rate</span>
                <span className="text-2xl font-bold">
                  {overview.summary.referral_completion_rate}%
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
