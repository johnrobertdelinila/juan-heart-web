'use client';

import * as React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export interface ChartWrapperProps {
  /**
   * Chart title
   */
  title?: string;
  /**
   * Chart description
   */
  description?: string;
  /**
   * Chart content
   */
  children: React.ReactNode;
  /**
   * Additional className for the card
   */
  className?: string;
}

export function ChartWrapper({ title, description, children, className }: ChartWrapperProps) {
  return (
    <Card className={className}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>{children}</CardContent>
    </Card>
  );
}

// Color palette for healthcare data
export const COLORS = {
  primary: 'hsl(var(--primary))',
  secondary: 'hsl(var(--secondary))',
  success: 'hsl(var(--success))',
  warning: 'hsl(var(--warning))',
  danger: 'hsl(var(--destructive))',
  info: 'hsl(var(--info))',
  muted: 'hsl(var(--muted))',
};

export const RISK_COLORS = {
  low: COLORS.success,
  moderate: COLORS.warning,
  high: COLORS.danger,
};

// Custom tooltip component
export interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

export function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload) return null;

  return (
    <div className="bg-background rounded-lg border p-3 shadow-lg">
      <p className="mb-2 font-semibold">{label}</p>
      {payload.map((entry: any, index: number) => (
        <p key={index} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: <span className="font-semibold">{entry.value}</span>
        </p>
      ))}
    </div>
  );
}

// Risk Distribution Bar Chart
export interface RiskDistributionData {
  category: string;
  low: number;
  moderate: number;
  high: number;
}

export interface RiskDistributionChartProps {
  data: RiskDistributionData[];
  title?: string;
  description?: string;
}

export function RiskDistributionChart({
  data,
  title = 'Risk Distribution',
  description = 'Distribution of cardiovascular risk levels',
}: RiskDistributionChartProps) {
  return (
    <ChartWrapper title={title} description={description}>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="category" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="low" name="Low Risk" fill={RISK_COLORS.low} />
          <Bar dataKey="moderate" name="Moderate Risk" fill={RISK_COLORS.moderate} />
          <Bar dataKey="high" name="High Risk" fill={RISK_COLORS.high} />
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

// Trend Line Chart
export interface TrendData {
  date: string;
  assessments: number;
  referrals: number;
  validations: number;
}

export interface TrendChartProps {
  data: TrendData[];
  title?: string;
  description?: string;
}

export function TrendChart({
  data,
  title = 'Activity Trends',
  description = 'Daily activity over time',
}: TrendChartProps) {
  return (
    <ChartWrapper title={title} description={description}>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="assessments"
            name="Assessments"
            stroke={COLORS.primary}
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="referrals"
            name="Referrals"
            stroke={COLORS.warning}
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="validations"
            name="Validations"
            stroke={COLORS.success}
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

// Risk Score Pie Chart
export interface RiskScoreData {
  name: string;
  value: number;
  color: string;
}

export interface RiskScorePieChartProps {
  data: RiskScoreData[];
  title?: string;
  description?: string;
}

export function RiskScorePieChart({
  data,
  title = 'Risk Level Distribution',
  description = 'Percentage of patients by risk level',
}: RiskScorePieChartProps) {
  return (
    <ChartWrapper title={title} description={description}>
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

// Assessment Volume Area Chart
export interface VolumeData {
  month: string;
  mobile: number;
  validated: number;
  pending: number;
}

export interface VolumeChartProps {
  data: VolumeData[];
  title?: string;
  description?: string;
}

export function VolumeChart({
  data,
  title = 'Assessment Volume',
  description = 'Monthly assessment submissions and validations',
}: VolumeChartProps) {
  return (
    <ChartWrapper title={title} description={description}>
      <ResponsiveContainer width="100%" height={350}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Area
            type="monotone"
            dataKey="mobile"
            name="Mobile Submissions"
            stackId="1"
            stroke={COLORS.primary}
            fill={COLORS.primary}
            fillOpacity={0.6}
          />
          <Area
            type="monotone"
            dataKey="validated"
            name="Validated"
            stackId="1"
            stroke={COLORS.success}
            fill={COLORS.success}
            fillOpacity={0.6}
          />
          <Area
            type="monotone"
            dataKey="pending"
            name="Pending"
            stackId="1"
            stroke={COLORS.warning}
            fill={COLORS.warning}
            fillOpacity={0.6}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

// Facility Performance Bar Chart
export interface FacilityData {
  facility: string;
  referralsReceived: number;
  referralsAccepted: number;
  avgResponseTime: number;
}

export interface FacilityPerformanceChartProps {
  data: FacilityData[];
  title?: string;
  description?: string;
}

export function FacilityPerformanceChart({
  data,
  title = 'Facility Performance',
  description = 'Referral metrics by healthcare facility',
}: FacilityPerformanceChartProps) {
  return (
    <ChartWrapper title={title} description={description}>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="facility" type="category" width={150} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="referralsReceived" name="Received" fill={COLORS.info} />
          <Bar dataKey="referralsAccepted" name="Accepted" fill={COLORS.success} />
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}
