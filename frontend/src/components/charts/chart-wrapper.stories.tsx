'use client';

import type { Meta, StoryObj } from '@storybook/react';
import {
  RiskDistributionChart,
  TrendChart,
  RiskScorePieChart,
  VolumeChart,
  FacilityPerformanceChart,
  RISK_COLORS,
} from './chart-wrapper';

const meta = {
  title: 'Charts/Healthcare Charts',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;

// Sample data for Risk Distribution
const riskDistributionData = [
  { category: 'Metro Manila', low: 450, moderate: 320, high: 180 },
  { category: 'Region III', low: 380, moderate: 280, high: 140 },
  { category: 'Region IV-A', low: 420, moderate: 310, high: 160 },
  { category: 'Region VII', low: 290, moderate: 220, high: 110 },
  { category: 'CAR', low: 180, moderate: 140, high: 70 },
];

// Sample data for Trends
const trendData = [
  { date: '2024-01', assessments: 1200, referrals: 340, validations: 280 },
  { date: '2024-02', assessments: 1400, referrals: 380, validations: 320 },
  { date: '2024-03', assessments: 1650, referrals: 420, validations: 380 },
  { date: '2024-04', assessments: 1550, referrals: 460, validations: 410 },
  { date: '2024-05', assessments: 1800, referrals: 520, validations: 470 },
  { date: '2024-06', assessments: 1950, referrals: 580, validations: 540 },
  { date: '2024-07', assessments: 2100, referrals: 630, validations: 590 },
];

// Sample data for Risk Score Pie
const riskScorePieData = [
  { name: 'Low Risk (0-39)', value: 1450, color: RISK_COLORS.low },
  { name: 'Moderate Risk (40-69)', value: 980, color: RISK_COLORS.moderate },
  { name: 'High Risk (70-100)', value: 570, color: RISK_COLORS.high },
];

// Sample data for Volume
const volumeData = [
  { month: 'Jan', mobile: 1200, validated: 980, pending: 220 },
  { month: 'Feb', mobile: 1400, validated: 1150, pending: 250 },
  { month: 'Mar', mobile: 1650, validated: 1380, pending: 270 },
  { month: 'Apr', mobile: 1550, validated: 1300, pending: 250 },
  { month: 'May', mobile: 1800, validated: 1520, pending: 280 },
  { month: 'Jun', mobile: 1950, validated: 1680, pending: 270 },
];

// Sample data for Facility Performance
const facilityData = [
  {
    facility: 'Philippine Heart Center',
    referralsReceived: 450,
    referralsAccepted: 420,
    avgResponseTime: 2.5,
  },
  {
    facility: 'PGH',
    referralsReceived: 380,
    referralsAccepted: 340,
    avgResponseTime: 3.2,
  },
  {
    facility: 'Vicente Sotto Memorial',
    referralsReceived: 290,
    referralsAccepted: 270,
    avgResponseTime: 2.8,
  },
  {
    facility: 'Lung Center of the PH',
    referralsReceived: 220,
    referralsAccepted: 200,
    avgResponseTime: 3.0,
  },
  {
    facility: 'St. Lukes Medical Center',
    referralsReceived: 180,
    referralsAccepted: 165,
    avgResponseTime: 2.2,
  },
];

// Risk Distribution Chart
export const RiskDistribution: StoryObj = {
  render: () => (
    <div className="w-full max-w-4xl">
      <RiskDistributionChart data={riskDistributionData} />
    </div>
  ),
};

export const RiskDistributionCustomTitle: StoryObj = {
  render: () => (
    <div className="w-full max-w-4xl">
      <RiskDistributionChart
        data={riskDistributionData}
        title="Regional CVD Risk Assessment"
        description="Cardiovascular disease risk distribution across major Philippine regions"
      />
    </div>
  ),
};

// Trend Chart
export const ActivityTrends: StoryObj = {
  render: () => (
    <div className="w-full max-w-4xl">
      <TrendChart data={trendData} />
    </div>
  ),
};

export const MonthlyGrowth: StoryObj = {
  render: () => (
    <div className="w-full max-w-4xl">
      <TrendChart
        data={trendData}
        title="Monthly Growth Trends"
        description="Assessment submissions and validations over the past 7 months"
      />
    </div>
  ),
};

// Pie Chart
export const RiskScoreDistribution: StoryObj = {
  render: () => (
    <div className="w-full max-w-2xl">
      <RiskScorePieChart data={riskScorePieData} />
    </div>
  ),
};

export const PatientRiskBreakdown: StoryObj = {
  render: () => (
    <div className="w-full max-w-2xl">
      <RiskScorePieChart
        data={riskScorePieData}
        title="Patient Risk Classification"
        description="Total patients classified by cardiovascular risk level"
      />
    </div>
  ),
};

// Volume Chart
export const AssessmentVolume: StoryObj = {
  render: () => (
    <div className="w-full max-w-4xl">
      <VolumeChart data={volumeData} />
    </div>
  ),
};

export const MonthlySubmissions: StoryObj = {
  render: () => (
    <div className="w-full max-w-4xl">
      <VolumeChart
        data={volumeData}
        title="Assessment Processing Pipeline"
        description="Tracking submissions from mobile app through validation"
      />
    </div>
  ),
};

// Facility Performance Chart
export const FacilityMetrics: StoryObj = {
  render: () => (
    <div className="w-full max-w-4xl">
      <FacilityPerformanceChart data={facilityData} />
    </div>
  ),
};

export const TopPerformingFacilities: StoryObj = {
  render: () => (
    <div className="w-full max-w-4xl">
      <FacilityPerformanceChart
        data={facilityData}
        title="Top Referral Hospitals"
        description="Referral acceptance rates by major healthcare facilities"
      />
    </div>
  ),
};

// Dashboard with multiple charts
export const DashboardCharts: StoryObj = {
  render: () => (
    <div className="grid w-full max-w-7xl gap-6">
      <div className="grid gap-6 md:grid-cols-2">
        <RiskScorePieChart data={riskScorePieData} />
        <RiskDistributionChart data={riskDistributionData.slice(0, 3)} />
      </div>
      <TrendChart data={trendData} />
      <div className="grid gap-6 md:grid-cols-2">
        <VolumeChart data={volumeData} />
        <FacilityPerformanceChart data={facilityData.slice(0, 3)} />
      </div>
    </div>
  ),
};

// Quarterly comparison
const quarterlyData = [
  { date: 'Q1 2024', assessments: 4250, referrals: 1140, validations: 980 },
  { date: 'Q2 2024', assessments: 5300, referrals: 1460, validations: 1300 },
  { date: 'Q3 2024', assessments: 6150, referrals: 1750, validations: 1620 },
  { date: 'Q4 2024', assessments: 6800, referrals: 1950, validations: 1850 },
];

export const QuarterlyTrends: StoryObj = {
  render: () => (
    <div className="w-full max-w-4xl">
      <TrendChart
        data={quarterlyData}
        title="Quarterly Performance"
        description="Year-over-year quarterly comparison of key metrics"
      />
    </div>
  ),
};

// Regional risk comparison
const regionalData = [
  { category: 'NCR', low: 850, moderate: 620, high: 380 },
  { category: 'Luzon', low: 1420, moderate: 980, high: 550 },
  { category: 'Visayas', low: 890, moderate: 680, high: 340 },
  { category: 'Mindanao', low: 720, moderate: 540, high: 280 },
];

export const RegionalComparison: StoryObj = {
  render: () => (
    <div className="w-full max-w-4xl">
      <RiskDistributionChart
        data={regionalData}
        title="Island Group Risk Comparison"
        description="CVD risk distribution across major Philippine island groups"
      />
    </div>
  ),
};

// Age group distribution
const ageGroupData = [
  { name: '18-30 years', value: 420, color: RISK_COLORS.low },
  { name: '31-45 years', value: 890, color: RISK_COLORS.moderate },
  { name: '46-60 years', value: 1240, color: RISK_COLORS.high },
  { name: '60+ years', value: 450, color: RISK_COLORS.high },
];

export const AgeDistribution: StoryObj = {
  render: () => (
    <div className="w-full max-w-2xl">
      <RiskScorePieChart
        data={ageGroupData}
        title="Assessment by Age Group"
        description="Distribution of patients assessed by age demographics"
      />
    </div>
  ),
};

// Weekly volume
const weeklyData = [
  { month: 'Week 1', mobile: 280, validated: 240, pending: 40 },
  { month: 'Week 2', mobile: 320, validated: 280, pending: 40 },
  { month: 'Week 3', mobile: 310, validated: 270, pending: 40 },
  { month: 'Week 4', mobile: 340, validated: 310, pending: 30 },
];

export const WeeklyVolume: StoryObj = {
  render: () => (
    <div className="w-full max-w-4xl">
      <VolumeChart
        data={weeklyData}
        title="Weekly Assessment Volume"
        description="Current month breakdown by week"
      />
    </div>
  ),
};

// All hospitals performance
const allHospitalsData = [
  { facility: 'PHC', referralsReceived: 450, referralsAccepted: 420, avgResponseTime: 2.5 },
  { facility: 'PGH', referralsReceived: 380, referralsAccepted: 340, avgResponseTime: 3.2 },
  { facility: 'VSMMC', referralsReceived: 290, referralsAccepted: 270, avgResponseTime: 2.8 },
  { facility: 'LCP', referralsReceived: 220, referralsAccepted: 200, avgResponseTime: 3.0 },
  { facility: 'SLMC', referralsReceived: 180, referralsAccepted: 165, avgResponseTime: 2.2 },
  { facility: 'NKTI', referralsReceived: 150, referralsAccepted: 140, avgResponseTime: 2.6 },
  { facility: 'JRRMMC', referralsReceived: 130, referralsAccepted: 120, avgResponseTime: 2.9 },
];

export const AllHospitalsPerformance: StoryObj = {
  render: () => (
    <div className="w-full max-w-5xl">
      <FacilityPerformanceChart
        data={allHospitalsData}
        title="National Hospital Network"
        description="Referral performance across all partner hospitals"
      />
    </div>
  ),
};
