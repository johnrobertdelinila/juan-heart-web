'use client';

import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Activity, Calendar, Download, Shield, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import type { Assessment } from '@/types/patient';
import type { TooltipProps } from 'recharts';

interface AssessmentHistoryProps {
  assessments: Assessment[];
}

type RiskLevel = Assessment['final_risk_level'];

interface SummaryMetrics {
  total: number;
  distribution: Record<RiskLevel, number>;
  avgScore: number | null;
  lastValidated: string | null;
}

interface TrendPoint {
  date: string;
  label: string;
  score: number;
  risk?: RiskLevel;
  status: string;
}

export function AssessmentHistory({ assessments }: AssessmentHistoryProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const sortedAssessments = useMemo(
    () =>
      [...assessments].sort(
        (a, b) => new Date(b.assessment_date).getTime() - new Date(a.assessment_date).getTime()
      ),
    [assessments]
  );

  const filteredAssessments = useMemo(() => {
    return sortedAssessments.filter((assessment) => {
      const assessmentTime = new Date(assessment.assessment_date).getTime();
      if (startDate) {
        const start = new Date(startDate).getTime();
        if (assessmentTime < start) return false;
      }
      if (endDate) {
        const end = new Date(endDate).getTime();
        if (assessmentTime > end) return false;
      }
      return true;
    });
  }, [sortedAssessments, startDate, endDate]);

  const quickFilter = (range: '30d' | '90d' | '365d' | 'all') => {
    if (range === 'all') {
      setStartDate('');
      setEndDate('');
      return;
    }

    const end = new Date();
    const start = new Date();
    const days = range === '30d' ? 30 : range === '90d' ? 90 : 365;
    start.setDate(end.getDate() - days);
    setStartDate(start.toISOString().slice(0, 10));
    setEndDate(end.toISOString().slice(0, 10));
  };

  const summary = useMemo<SummaryMetrics>(() => {
    const distribution: SummaryMetrics['distribution'] = {
      High: 0,
      Moderate: 0,
      Low: 0,
    };

    let cumulativeScore = 0;
    let scoredCount = 0;
    let lastValidated: string | null = null;

    filteredAssessments.forEach((assessment) => {
      if (assessment.final_risk_level) {
        distribution[assessment.final_risk_level] += 1;
      }

      const score = resolveRiskScore(assessment);
      if (typeof score === 'number') {
        cumulativeScore += score;
        scoredCount += 1;
      }

      if (assessment.validated_at) {
        if (!lastValidated || new Date(assessment.validated_at) > new Date(lastValidated)) {
          lastValidated = assessment.validated_at;
        }
      }
    });

    return {
      total: filteredAssessments.length,
      distribution,
      avgScore: scoredCount ? Math.round(cumulativeScore / scoredCount) : null,
      lastValidated,
    };
  }, [filteredAssessments]);

  const chartData = useMemo(
    () =>
      filteredAssessments
        .map<TrendPoint>((assessment) => ({
          date: formatDate(assessment.assessment_date),
          label: format(new Date(assessment.assessment_date), 'PPP'),
          score: resolveRiskScore(assessment) ?? 0,
          risk: assessment.final_risk_level,
          status: formatStatus(assessment.status),
        }))
        .reverse(),
    [filteredAssessments]
  );

  const handleExportPdf = () => {
    if (typeof window === 'undefined') return;

    const printWindow = window.open('', '', 'width=900,height=650');
    if (!printWindow) return;

    const timelineRows = filteredAssessments
      .map((assessment) => {
        const risk = assessment.final_risk_level ?? 'Unspecified';
        const score = resolveRiskScore(assessment);
        const status = formatStatus(assessment.status);
        return `
          <div class="entry">
            <div class="entry-header">
              <span class="entry-date">${escapeHtml(formatDate(assessment.assessment_date))}</span>
              <span class="entry-risk ${risk.toLowerCase()}">${escapeHtml(risk)} Risk</span>
            </div>
            <div class="entry-body">
              <p><strong>Score:</strong> ${score ?? '—'}%</p>
              <p><strong>Status:</strong> ${escapeHtml(status)}</p>
              <p><strong>Validated:</strong> ${
                assessment.validated_at ? formatDate(assessment.validated_at) : 'Pending'
              }</p>
              <p><strong>Recommendation:</strong> ${escapeHtml(
                assessment.recommended_action ?? 'Not documented'
              )}</p>
            </div>
          </div>
        `;
      })
      .join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Assessment History Timeline</title>
          <style>
            body {
              font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
              padding: 32px;
              color: #0f172a;
              background: #f8fafc;
            }
            h1 {
              margin-bottom: 4px;
            }
            .subheading {
              margin-top: 0;
              color: #475569;
            }
            .entry {
              border: 1px solid #e2e8f0;
              border-radius: 16px;
              background: #fff;
              padding: 16px;
              margin-bottom: 12px;
            }
            .entry-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              flex-wrap: wrap;
              gap: 8px;
            }
            .entry-date {
              font-weight: 600;
            }
            .entry-risk {
              padding: 4px 10px;
              border-radius: 999px;
              font-size: 12px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.04em;
            }
            .entry-risk.high {
              background: #fee2e2;
              color: #b91c1c;
            }
            .entry-risk.moderate {
              background: #fef3c7;
              color: #ca8a04;
            }
            .entry-risk.low {
              background: #dcfce7;
              color: #15803d;
            }
            .entry-body {
              margin-top: 12px;
              font-size: 14px;
              color: #475569;
              line-height: 1.4;
            }
            @media print {
              body {
                background: #fff;
              }
            }
          </style>
        </head>
        <body>
          <h1>Assessment History Timeline</h1>
          <p class="subheading">Generated ${format(new Date(), 'PPpp')}</p>
          ${timelineRows || '<p>No assessments available for export.</p>'}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <Card className="border-slate-200/70 shadow-sm">
      <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <CardTitle>Assessment History Timeline</CardTitle>
          <CardDescription>Chronological ledger with risk trend and export support</CardDescription>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => quickFilter('30d')}>
            Last 30d
          </Button>
          <Button variant="outline" size="sm" onClick={() => quickFilter('90d')}>
            Last 90d
          </Button>
          <Button variant="outline" size="sm" onClick={() => quickFilter('365d')}>
            Last 12mo
          </Button>
          <Button variant="outline" size="sm" onClick={() => quickFilter('all')}>
            All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2 text-sm">
            <label className="text-xs font-semibold text-slate-500">Start Date</label>
            <Input
              type="date"
              value={startDate}
              max={endDate || undefined}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </div>
          <div className="space-y-2 text-sm">
            <label className="text-xs font-semibold text-slate-500">End Date</label>
            <Input
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2 text-right text-xs text-slate-500">
            {summary.lastValidated && <p>Last validated · {formatDate(summary.lastValidated)}</p>}
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-end">
              <Button variant="ghost" size="sm" onClick={() => quickFilter('all')}>
                Reset Range
              </Button>
              <Button variant="secondary" className="w-full md:w-auto" onClick={handleExportPdf}>
                <Download className="mr-2 h-4 w-4" strokeWidth={1.5} />
                Export Timeline PDF
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <SummaryStat
            icon={Calendar}
            label="Assessments"
            value={summary.total.toString()}
            helper="Records in current range"
          />
          <SummaryStat
            icon={Shield}
            label="High Risk"
            value={summary.distribution.High.toString()}
            helper="Require escalation"
            valueClassName="text-red-600"
          />
          <SummaryStat
            icon={Shield}
            label="Moderate Risk"
            value={summary.distribution.Moderate.toString()}
            helper="Active monitoring"
            valueClassName="text-amber-600"
          />
          <SummaryStat
            icon={TrendingUp}
            label="Avg Final Score"
            value={summary.avgScore !== null ? `${summary.avgScore}%` : '—'}
            helper="Final vs AI alignment"
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          {chartData.length < 2 ? (
            <p className="text-sm text-slate-500">Not enough data for trend visualization.</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <Tooltip content={<RiskTrendTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#dc2626"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <Separator />

        <div className="space-y-6">
          {filteredAssessments.length === 0 ? (
            <p className="text-sm text-slate-500">No assessments match the selected filters.</p>
          ) : (
            <div className="relative">
              <div className="pointer-events-none absolute top-2 left-4 hidden h-[calc(100%-1rem)] w-px bg-gradient-to-b from-slate-200 to-slate-300 md:block" />
              <div className="space-y-4">
                {filteredAssessments.map((assessment, index) => {
                  const timelineIdentifier =
                    assessment.assessment_external_id ?? `Assessment #${assessment.id}`;
                  return (
                    <div
                      key={`${assessment.id}-${index}`}
                      className="relative rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm"
                    >
                      <div
                        className={`absolute top-5 -left-8 hidden h-3.5 w-3.5 rounded-full border-2 border-white shadow-sm ring-2 md:block ${getRiskDot(
                          assessment.final_risk_level
                        )}`}
                      />
                      <div className="flex flex-wrap items-center gap-3">
                        <Badge className={getRiskChip(assessment.final_risk_level)}>
                          {assessment.final_risk_level} Risk
                        </Badge>
                        <p className="font-semibold text-slate-900">
                          {format(new Date(assessment.assessment_date), 'PPP')}
                        </p>
                        <p className="text-sm text-slate-500">
                          Score {resolveRiskScore(assessment) ?? '—'}% · Status{' '}
                          {formatStatus(assessment.status)}
                        </p>
                        <div className="ml-auto flex items-center gap-1 text-xs text-slate-500">
                          <Calendar className="h-3.5 w-3.5" strokeWidth={1.5} />
                          {timelineIdentifier}
                        </div>
                      </div>
                      <div className="mt-3 grid gap-3 text-xs text-slate-500 md:grid-cols-3">
                        <InfoPill
                          icon={Activity}
                          label="ML Score"
                          value={`${assessment.ml_risk_score ?? '—'}%`}
                        />
                        <InfoPill
                          icon={Activity}
                          label="Validated At"
                          value={
                            assessment.validated_at
                              ? formatDate(assessment.validated_at)
                              : 'Pending validation'
                          }
                        />
                        <InfoPill
                          icon={Activity}
                          label="Recommendation"
                          value={assessment.recommended_action ?? 'Not documented'}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function formatDate(value: string) {
  try {
    return format(new Date(value), 'PP');
  } catch {
    return value;
  }
}

function getRiskChip(risk?: string) {
  switch (risk) {
    case 'High':
      return 'bg-red-50 text-red-700';
    case 'Moderate':
      return 'bg-amber-50 text-amber-700';
    case 'Low':
      return 'bg-emerald-50 text-emerald-700';
    default:
      return 'bg-slate-100 text-slate-600';
  }
}

function getRiskDot(risk?: string) {
  switch (risk) {
    case 'High':
      return 'bg-red-500 ring-red-100';
    case 'Moderate':
      return 'bg-amber-500 ring-amber-100';
    case 'Low':
      return 'bg-emerald-500 ring-emerald-100';
    default:
      return 'bg-slate-400 ring-slate-200';
  }
}

function formatStatus(status: string) {
  return status
    .split('_')
    .map((piece) => piece.charAt(0).toUpperCase() + piece.slice(1))
    .join(' ');
}

function resolveRiskScore(assessment: Assessment) {
  if (typeof assessment.final_risk_score === 'number') return assessment.final_risk_score;
  if (typeof assessment.ml_risk_score === 'number') return assessment.ml_risk_score;
  return null;
}

function escapeHtml(value: string) {
  return `${value}`
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function InfoPill({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
      <Icon className="h-3.5 w-3.5 text-slate-400" strokeWidth={1.5} />
      <div>
        <p className="text-[10px] font-semibold tracking-wide text-slate-400 uppercase">{label}</p>
        <p className="text-xs text-slate-700">{value}</p>
      </div>
    </div>
  );
}

function SummaryStat({
  icon: Icon,
  label,
  value,
  helper,
  valueClassName = '',
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  helper: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600">
        <Icon className="h-4 w-4" strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-[10px] font-semibold tracking-wide text-slate-400 uppercase">{label}</p>
        <p className={`text-base font-semibold text-slate-900 ${valueClassName}`}>{value}</p>
        <p className="text-[11px] text-slate-500">{helper}</p>
      </div>
    </div>
  );
}

function RiskTrendTooltip(props: TooltipProps<number, string>) {
  if (!props.active || !props.payload?.length) {
    return null;
  }

  const payload = props.payload[0];
  const dataPoint = payload.payload as TrendPoint;

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 shadow-md">
      <p className="font-semibold text-slate-900">{dataPoint.label}</p>
      <p className="mt-1 text-slate-500">{dataPoint.status}</p>
      <p className="mt-1 text-slate-900">
        Score {dataPoint.score}%{' '}
        <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
          {dataPoint.risk ?? 'Unknown'} Risk
        </span>
      </p>
    </div>
  );
}
