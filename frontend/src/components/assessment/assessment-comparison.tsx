'use client';

import Link from 'next/link';
import { format, differenceInYears } from 'date-fns';
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Brain,
  Calendar,
  CheckCircle2,
  ClipboardList,
  FileText,
  LayoutPanelLeft,
  MapPin,
  ShieldCheck,
  Stethoscope,
  User,
} from 'lucide-react';
import type { Assessment, ClinicalValidation, RiskLevel } from '@/types/assessment';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface AssessmentComparisonProps {
  assessment: Assessment;
}

type DifferenceTone = 'positive' | 'negative' | 'neutral' | 'info' | 'pending';

interface ComparisonField {
  key: string;
  label: string;
  aiValue: string;
  aiSupportingText?: string;
  clinicalValue: string;
  clinicalSupportingText?: string;
  difference?: {
    label: string;
    tone: DifferenceTone;
  };
}

interface PillEntry {
  label: string;
  tone?: 'default' | 'critical' | 'warning';
}

export function AssessmentComparison({ assessment }: AssessmentComparisonProps) {
  const latestValidation = getLatestValidation(assessment.clinicalValidations);
  const aiRiskScore = assessment.ml_risk_score ?? null;
  const clinicalRiskScore =
    latestValidation?.validated_risk_score ?? assessment.final_risk_score ?? null;

  const aiRiskLevel = assessment.ml_risk_level ?? computeRiskLevel(aiRiskScore);
  const clinicalRiskLevel =
    latestValidation?.validated_risk_level ?? assessment.final_risk_level ?? 'Pending';

  const agreement =
    latestValidation?.validation_agrees_with_ml ?? assessment.validation_agrees_with_ml ?? null;
  const clinicalNotes = latestValidation?.validation_notes ?? assessment.validation_notes ?? '';
  const validatorName =
    latestValidation?.validator?.first_name && latestValidation?.validator?.last_name
      ? `${latestValidation.validator.first_name} ${latestValidation.validator.last_name}`
      : assessment.validator
        ? `${assessment.validator.first_name} ${assessment.validator.last_name}`
        : 'Unassigned';

  const reviewedAt = latestValidation?.created_at ?? assessment.validated_at ?? null;
  const scoreDelta =
    aiRiskScore !== null && clinicalRiskScore !== null
      ? clinicalRiskScore - aiRiskScore
      : null;

  const comparisonFields: ComparisonField[] = [
    {
      key: 'risk_score',
      label: 'Risk Score',
      aiValue: formatScore(aiRiskScore),
      aiSupportingText: aiRiskLevel ? `${aiRiskLevel} threshold` : 'Model output',
      clinicalValue: formatScore(clinicalRiskScore),
      clinicalSupportingText: clinicalRiskLevel
        ? `${clinicalRiskLevel} classification`
        : 'Awaiting review',
      difference: buildScoreDifference(scoreDelta),
    },
    {
      key: 'risk_level',
      label: 'Risk Level',
      aiValue: aiRiskLevel ?? 'Not available',
      clinicalValue: clinicalRiskLevel,
      difference: aiRiskLevel && clinicalRiskLevel && aiRiskLevel !== clinicalRiskLevel
        ? { label: 'Adjusted by clinician', tone: 'info' }
        : { label: 'Matches AI', tone: 'neutral' },
    },
    {
      key: 'urgency',
      label: 'Urgency',
      aiValue: assessment.urgency ?? 'Not evaluated',
      clinicalValue:
        assessment.status === 'validated'
          ? 'Validated & communicated'
          : latestValidation
            ? 'In clinical review'
            : 'Pending review',
      difference: latestValidation
        ? { label: 'Escalated for review', tone: 'info' }
        : { label: 'Awaiting clinician action', tone: 'pending' },
    },
    {
      key: 'recommendation',
      label: 'Recommended Action',
      aiValue: assessment.recommended_action ?? 'No AI recommendation',
      clinicalValue: clinicalNotes ? clinicalNotes : 'No clinical notes yet',
      difference: clinicalNotes
        ? { label: 'Clinical rationale available', tone: 'neutral' }
        : { label: 'Notes required', tone: 'pending' },
    },
    {
      key: 'agreement',
      label: 'Agreement',
      aiValue: assessment.model_confidence
        ? `Model confidence ${formatConfidence(assessment.model_confidence)}`
        : 'Confidence not reported',
      clinicalValue:
        agreement === null
          ? 'Pending clinical input'
          : agreement
            ? 'Clinician agrees with AI outcome'
            : 'Clinician overrides AI outcome',
      difference:
        agreement === null
          ? { label: 'Awaiting decision', tone: 'pending' }
          : agreement
            ? { label: 'Aligned', tone: 'neutral' }
            : { label: 'Manual override', tone: 'negative' },
    },
  ];

  const vitalEntries = buildVitalEntries(assessment);
  const symptomPills = buildSymptomPills(assessment);
  const historyPills = buildHistoryPills(assessment);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/assessments"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-heart-red"
        >
          <LayoutPanelLeft className="h-4 w-4" strokeWidth={1.5} />
          Back to assessment queue
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <Badge className={cn('px-3 py-1 text-xs', getRiskBadgeClass(assessment.final_risk_level))}>
            {assessment.final_risk_level} Risk
          </Badge>
          <Badge className={cn('px-3 py-1 text-xs', getStatusBadgeClass(assessment.status))}>
            {formatStatus(assessment.status)}
          </Badge>
          {assessment.assessment_external_id && (
            <Badge variant="outline" className="font-mono text-[11px] uppercase tracking-wider">
              #{assessment.assessment_external_id}
            </Badge>
          )}
        </div>
      </div>

      <Card className="border-slate-200/70 shadow-sm">
        <CardContent className="grid gap-6 p-6 md:grid-cols-3">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Patient
            </p>
            <div className="flex items-center gap-3">
              <div className="bg-heart-red/10 flex h-12 w-12 items-center justify-center rounded-2xl">
                <User className="h-5 w-5 text-heart-red" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-lg font-semibold text-slate-900">
                  {assessment.patient_first_name} {assessment.patient_last_name}
                </p>
                <p className="text-sm text-slate-500">
                  {formatAge(assessment.patient_date_of_birth)} · {assessment.patient_sex}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Assessment Date
            </p>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Calendar className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
              {formatDate(assessment.assessment_date)}
            </div>
            {assessment.city && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <MapPin className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
                {assessment.city}, {assessment.region ?? assessment.country}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Mobile Submission
            </p>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-sm text-slate-500">
                Device: {assessment.device_platform ?? 'Unknown'} · v
                {assessment.app_version ?? 'N/A'}
              </p>
              <p className="text-xs text-slate-400">
                Session {assessment.session_id ?? '—'} · {assessment.mobile_user_id ?? 'Mobile user'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-slate-200/80 shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Brain className="h-5 w-5 text-heart-red" strokeWidth={1.5} />
                AI Model Assessment
              </CardTitle>
              <CardDescription>Automated cardiovascular risk interpretation</CardDescription>
            </div>
            {assessment.algorithm_version && (
              <Badge variant="outline" className="font-mono text-[11px]">
                Model {assessment.algorithm_version}
              </Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 md:grid-cols-3">
              <MetricBlock
                label="Risk Score"
                value={formatScore(aiRiskScore)}
                auxiliary={aiRiskLevel ?? 'Pending'}
                accent="text-heart-red"
              />
              <MetricBlock
                label="Confidence"
                value={assessment.model_confidence ? formatConfidence(assessment.model_confidence) : '—'}
                auxiliary="Model certainty"
              />
              <MetricBlock
                label="Data Quality"
                value={
                  assessment.data_quality_score
                    ? `${assessment.data_quality_score}%`
                    : assessment.data_completeness_score
                      ? `${Math.round(assessment.data_completeness_score * 100)}%`
                      : 'Not scored'
                }
                auxiliary="Completeness"
              />
            </div>

            <Separator />

            <div className="grid gap-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                AI Recommendations
              </p>
              {assessment.recommendations && assessment.recommendations.length > 0 ? (
                <div className="space-y-3">
                  {assessment.recommendations.map((recommendation, index) => (
                    <div
                      key={`${recommendation.type}-${index}`}
                      className="rounded-2xl border border-slate-200/70 bg-white px-4 py-3 shadow-xs"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                          <ClipboardList className="h-4 w-4 text-heart-red" strokeWidth={1.5} />
                          {recommendation.type}
                        </div>
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[11px]',
                            recommendation.priority === 'High'
                              ? 'border-red-200 text-[#dc2626]'
                              : recommendation.priority === 'Medium'
                                ? 'border-amber-200 text-amber-700'
                                : 'border-emerald-200 text-emerald-700'
                          )}
                        >
                          {recommendation.priority} priority
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">{recommendation.description}</p>
                      {recommendation.action && (
                        <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                          Next step: {recommendation.action}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-6 text-center text-sm text-slate-500">
                  No AI-driven recommendations captured for this assessment.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Stethoscope className="h-5 w-5 text-heart-red" strokeWidth={1.5} />
                Clinical Review
              </CardTitle>
              <CardDescription>Manual validation & risk adjudication</CardDescription>
            </div>
            <Badge
              variant="outline"
              className={cn(
                'gap-1 text-[11px]',
                agreement === false ? 'border-red-200 text-red-600' : 'border-emerald-200 text-emerald-700'
              )}
            >
              {agreement === null
                ? 'Pending'
                : agreement
                  ? 'Aligned with AI'
                  : 'Manual override'}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 md:grid-cols-3">
              <MetricBlock
                label="Validated Score"
                value={formatScore(clinicalRiskScore)}
                auxiliary={clinicalRiskLevel}
                accent="text-emerald-600"
              />
              <MetricBlock
                label="Validator"
                value={validatorName}
                auxiliary={reviewedAt ? `Reviewed ${formatDateTime(reviewedAt)}` : 'Awaiting assignment'}
              />
              <MetricBlock
                label="Status"
                value={formatStatus(assessment.status)}
                auxiliary={assessment.validated_at ? 'Updated' : 'In progress'}
              />
            </div>

            {scoreDelta !== null && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  {scoreDelta > 0 ? (
                    <ArrowUpRight className="h-4 w-4 text-amber-600" strokeWidth={1.5} />
                  ) : scoreDelta < 0 ? (
                    <ArrowDownRight className="h-4 w-4 text-emerald-600" strokeWidth={1.5} />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" strokeWidth={1.5} />
                  )}
                  <span className="font-medium text-slate-700">
                    {scoreDelta === 0
                      ? 'Matches AI recommendation'
                      : `${scoreDelta > 0 ? '+' : ''}${scoreDelta} pts vs AI score`}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {scoreDelta === 0
                    ? 'Clinician validated the automated risk interpretation without adjustments.'
                    : 'Clinical judgement adjusted the AI score to reflect bedside context.'}
                </p>
              </div>
            )}

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Clinical Notes
              </p>
              <div className="mt-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                {clinicalNotes ? (
                  clinicalNotes
                ) : (
                  <span className="text-slate-400">No notes provided yet.</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200/80 shadow-sm">
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="text-lg">Field-by-Field Comparison</CardTitle>
              <CardDescription>Side-by-side visibility into AI output vs clinical decisions</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <Badge className="bg-heart-red/10 text-heart-red" variant="outline">
                AI Assessment
              </Badge>
              <Badge className="bg-emerald-50 text-emerald-700" variant="outline">
                Clinical Review
              </Badge>
              <Badge className="bg-amber-50 text-amber-700" variant="outline">
                Differences Highlighted
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {comparisonFields.map((field) => (
              <div
                key={field.key}
                className="grid gap-4 px-4 py-5 md:grid-cols-[220px,1fr,1fr]"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-800">{field.label}</p>
                  {field.difference && (
                    <DifferenceBadge label={field.difference.label} tone={field.difference.tone} />
                  )}
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50/60 px-4 py-3">
                  <p className="text-sm font-medium text-slate-900">{field.aiValue}</p>
                  {field.aiSupportingText && (
                    <p className="text-xs text-slate-500">{field.aiSupportingText}</p>
                  )}
                </div>
                <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-[inset_0_1px_0_rgba(15,23,42,0.04)]">
                  <p className="text-sm font-medium text-slate-900">{field.clinicalValue}</p>
                  {field.clinicalSupportingText && (
                    <p className="text-xs text-slate-500">{field.clinicalSupportingText}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-slate-200/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Key Vitals</CardTitle>
            <CardDescription>Patient measurements captured during intake</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {vitalEntries.length > 0 ? (
              vitalEntries.map((vital) => (
                <div
                  key={vital.label}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                >
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {vital.label}
                    </p>
                    <p className="text-lg font-semibold text-slate-900">{vital.value}</p>
                  </div>
                  <Activity className="h-5 w-5 text-slate-300" strokeWidth={1.5} />
                </div>
              ))
            ) : (
              <EmptyState message="No vital signs were submitted with this assessment." />
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Symptoms & Presentation</CardTitle>
            <CardDescription>Indicators reported by community health worker</CardDescription>
          </CardHeader>
          <CardContent>
            {symptomPills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {symptomPills.map((pill) => (
                  <InlinePill key={pill.label} label={pill.label} tone={pill.tone} />
                ))}
              </div>
            ) : (
              <EmptyState message="No symptoms were flagged in this intake." />
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Medical History</CardTitle>
            <CardDescription>Chronic conditions and prior events</CardDescription>
          </CardHeader>
          <CardContent>
            {historyPills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {historyPills.map((pill) => (
                  <InlinePill key={pill.label} label={pill.label} tone={pill.tone} />
                ))}
              </div>
            ) : (
              <EmptyState message="No significant medical history documented." />
            )}
          </CardContent>
        </Card>
      </div>

      {assessment.clinicalValidations && assessment.clinicalValidations.length > 0 && (
        <Card className="border-slate-200/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Clinical Validation Timeline</CardTitle>
            <CardDescription>Audit-ready log of every validation event</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[...assessment.clinicalValidations]
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .map((validation) => (
                <div
                  key={`${validation.id}-${validation.created_at}`}
                  className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3"
                >
                  <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-heart-red/10 text-heart-red">
                    <ShieldCheck className="h-4 w-4" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900">
                        {validation.validator?.first_name
                          ? `${validation.validator.first_name} ${validation.validator.last_name}`
                          : 'Clinician'}
                      </p>
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-[11px]',
                          validation.validation_agrees_with_ml
                            ? 'border-emerald-200 text-emerald-700'
                            : 'border-amber-200 text-amber-700'
                        )}
                      >
                        {validation.validation_agrees_with_ml ? 'Agreed with AI' : 'Adjusted'}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500">
                      {formatDateTime(validation.created_at)}
                    </p>
                    <p className="text-sm text-slate-700">{validation.validation_notes ?? '—'}</p>
                  </div>
                  <div className="text-right text-sm font-semibold text-slate-800">
                    {validation.validated_risk_score}%{' '}
                    <span className="text-xs font-normal text-slate-500">
                      {validation.validated_risk_level}
                    </span>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function MetricBlock({
  label,
  value,
  auxiliary,
  accent,
}: {
  label: string;
  value: string;
  auxiliary?: string | null;
  accent?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className={cn('text-xl font-semibold text-slate-900', accent)}>{value}</p>
      {auxiliary && <p className="text-xs text-slate-500">{auxiliary}</p>}
    </div>
  );
}

function DifferenceBadge({ label, tone }: { label: string; tone: DifferenceTone }) {
  const toneClasses: Record<DifferenceTone, string> = {
    positive: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
    negative: 'bg-red-50 text-red-600 border border-red-100',
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200',
    info: 'bg-amber-50 text-amber-700 border border-amber-100',
    pending: 'bg-slate-50 text-slate-500 border border-dashed border-slate-200',
  };

  return (
    <span className={cn('mt-1 inline-flex items-center rounded-full px-3 py-1 text-[11px]', toneClasses[tone])}>
      {label}
    </span>
  );
}

function InlinePill({ label, tone = 'default' }: PillEntry) {
  const toneClasses =
    tone === 'critical'
      ? 'bg-red-50 text-red-700 border-red-200'
      : tone === 'warning'
        ? 'bg-amber-50 text-amber-700 border-amber-200'
        : 'bg-slate-100 text-slate-600 border-slate-200';

  return (
    <span className={cn('rounded-full border px-3 py-1 text-xs font-medium', toneClasses)}>
      {label}
    </span>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-6 text-center text-sm text-slate-500">
      {message}
    </div>
  );
}

function buildScoreDifference(scoreDelta: number | null): ComparisonField['difference'] {
  if (scoreDelta === null) {
    return { label: 'No data', tone: 'pending' };
  }
  if (scoreDelta === 0) {
    return { label: 'Matches AI', tone: 'neutral' };
  }

  return {
    label: `${scoreDelta > 0 ? '+' : ''}${scoreDelta} pts adjustment`,
    tone: scoreDelta > 0 ? 'positive' : 'negative',
  };
}

function formatScore(value: number | null): string {
  if (value === null || Number.isNaN(value)) {
    return '—';
  }
  return `${value}%`;
}

function formatConfidence(value: number): string {
  if (value <= 1) {
    return `${Math.round(value * 100)}%`;
  }
  return `${value}%`;
}

function formatDate(value?: string): string {
  if (!value) return '—';
  try {
    return format(new Date(value), 'PPP');
  } catch {
    return value;
  }
}

function formatDateTime(value?: string): string {
  if (!value) return '—';
  try {
    return format(new Date(value), 'PPP • p');
  } catch {
    return value;
  }
}

function formatAge(dob?: string): string {
  if (!dob) return 'N/A';
  try {
    const age = differenceInYears(new Date(), new Date(dob));
    return `${age}y`;
  } catch {
    return 'N/A';
  }
}

function getLatestValidation(validations?: ClinicalValidation[]): ClinicalValidation | null {
  if (!validations || validations.length === 0) return null;
  return validations.reduce((latest, current) => {
    if (!latest) return current;
    return new Date(current.created_at).getTime() > new Date(latest.created_at).getTime()
      ? current
      : latest;
  });
}

function computeRiskLevel(score: number | null): RiskLevel | null {
  if (score === null) return null;
  if (score >= 70) return 'High';
  if (score >= 40) return 'Moderate';
  return 'Low';
}

function getRiskBadgeClass(level?: string | null) {
  switch (level) {
    case 'High':
      return 'bg-red-50 text-[#dc2626] border border-red-200';
    case 'Moderate':
      return 'bg-amber-50 text-amber-700 border border-amber-200';
    case 'Low':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    default:
      return 'bg-slate-100 text-slate-600 border border-slate-200';
  }
}

function getStatusBadgeClass(status: string) {
  switch (status) {
    case 'pending':
      return 'bg-amber-50 text-amber-700 border border-amber-200';
    case 'validated':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    case 'in_review':
      return 'bg-blue-50 text-blue-700 border border-blue-200';
    case 'requires_referral':
      return 'bg-purple-50 text-purple-700 border border-purple-200';
    case 'rejected':
      return 'bg-red-50 text-red-600 border border-red-200';
    default:
      return 'bg-slate-100 text-slate-600 border border-slate-200';
  }
}

function formatStatus(status: string) {
  const labelMap: Record<string, string> = {
    pending: 'Pending',
    validated: 'Validated',
    in_review: 'In Review',
    requires_referral: 'Requires Referral',
    completed: 'Completed',
    rejected: 'Rejected',
  };
  return labelMap[status] ?? status;
}

function buildVitalEntries(assessment: Assessment) {
  const vitals = assessment.vital_signs;
  if (!vitals) return [];

  const entries: { label: string; value: string }[] = [];

  if (vitals.blood_pressure_systolic && vitals.blood_pressure_diastolic) {
    entries.push({
      label: 'Blood Pressure',
      value: `${vitals.blood_pressure_systolic}/${vitals.blood_pressure_diastolic} mmHg`,
    });
  }
  if (vitals.heart_rate) {
    entries.push({ label: 'Heart Rate', value: `${vitals.heart_rate} bpm` });
  }
  if (vitals.oxygen_saturation) {
    entries.push({ label: 'Oxygen Saturation', value: `${vitals.oxygen_saturation}% SpO₂` });
  }
  if (vitals.temperature) {
    entries.push({ label: 'Temperature', value: `${vitals.temperature} °C` });
  }
  if (vitals.bmi) {
    entries.push({ label: 'BMI', value: `${vitals.bmi}` });
  }

  return entries;
}

function buildSymptomPills(assessment: Assessment): PillEntry[] {
  const symptoms = assessment.symptoms;
  if (!symptoms) return [];

  const pills: PillEntry[] = [];

  Object.entries(symptoms).forEach(([key, value]) => {
    if (typeof value === 'boolean' && value) {
      pills.push({
        label: formatLabel(key),
        tone: key === 'chest_pain' || key === 'shortness_of_breath' ? 'critical' : 'warning',
      });
    }

    if (Array.isArray(value)) {
      value.forEach((entry) => {
        pills.push({ label: formatLabel(entry) });
      });
    }
  });

  return pills;
}

function buildHistoryPills(assessment: Assessment): PillEntry[] {
  const history = assessment.medical_history;
  if (!history) return [];

  const pills: PillEntry[] = [];

  Object.entries(history).forEach(([key, value]) => {
    if (typeof value === 'boolean' && value) {
      pills.push({
        label: formatLabel(key),
        tone: ['diabetes', 'hypertension', 'previous_heart_disease'].includes(key) ? 'critical' : 'default',
      });
    }

    if (Array.isArray(value) && value.length > 0) {
      value.forEach((entry) => {
        pills.push({ label: formatLabel(entry) });
      });
    }
  });

  return pills;
}

function formatLabel(raw: string) {
  return raw
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
