import { notFound } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { ArrowRight, Heart, Mail, Phone, Activity, AlertTriangle, Users } from 'lucide-react';
import { getPatientById } from '@/lib/api/patient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { AssessmentHistory } from '@/components/patient/assessment-history';

interface PatientProfilePageProps {
  params: {
    id: string;
  };
}

export const revalidate = 0;

export default async function PatientProfilePage({ params }: PatientProfilePageProps) {
  const response = await getPatientById(params.id);

  if (!response?.success) {
    notFound();
  }

  const { patient, assessments, latest_assessment: latestAssessment } = response.data;
  if (!patient || !latestAssessment) {
    notFound();
  }

  const age = calculateAge(patient.date_of_birth);
  const referralEvents = assessments.filter((assessment) =>
    ['requires_referral', 'in_transit', 'completed_referral'].includes(
      assessment.status.toLowerCase()
    )
  );

  const medicalHistory = buildMedicalHistorySummary(latestAssessment.medical_history);
  const lifestyleHighlights = buildLifestyleSummary(latestAssessment.lifestyle);
  const vitals = latestAssessment.vital_signs || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/patients"
          className="hover:text-heart-red text-sm font-semibold text-slate-600 transition-colors"
        >
          ← Back to Patient Registry
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={getRiskChip(latestAssessment.final_risk_level)}>
            {latestAssessment.final_risk_level} Risk
          </Badge>
          <Badge variant="outline" className="text-xs">
            {assessments.length} assessments
          </Badge>
          <Button variant="outline" size="sm">
            Export Profile
          </Button>
        </div>
      </div>

      <Card className="border-slate-200/70 shadow-sm">
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-2xl font-semibold tracking-tight text-slate-900">
              {patient.first_name} {patient.last_name}
            </CardTitle>
            <CardDescription>
              MRN #{latestAssessment.assessment_external_id ?? '—'} · Updated{' '}
              {formatDate(latestAssessment.assessment_date)}
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-2">
              <Users className="h-4 w-4" strokeWidth={1.5} />
              {age} y · {patient.sex}
            </span>
            {patient.phone && (
              <span className="flex items-center gap-2">
                <Phone className="h-4 w-4" strokeWidth={1.5} />
                {patient.phone}
              </span>
            )}
            {patient.email && (
              <span className="flex items-center gap-2">
                <Mail className="h-4 w-4" strokeWidth={1.5} />
                {patient.email}
              </span>
            )}
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-slate-200/70 shadow-sm">
          <CardHeader>
            <CardTitle>Demographics & Contact</CardTitle>
            <CardDescription>Identity, preferred channels, emergency reach-outs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 text-sm text-slate-600">
              <InfoRow label="Full Name" value={`${patient.first_name} ${patient.last_name}`} />
              <InfoRow
                label="Age / Sex"
                value={`${age} years · ${patient.sex === 'Male' ? 'Male' : 'Female'}`}
              />
              <InfoRow label="Email" value={patient.email ?? 'Not provided'} />
              <InfoRow label="Phone" value={patient.phone ?? 'Not provided'} />
              <InfoRow
                label="Location"
                value={
                  latestAssessment.city
                    ? `${latestAssessment.city}${latestAssessment.region ? `, ${latestAssessment.region}` : ''}`
                    : (latestAssessment.country ?? 'Not recorded')
                }
              />
            </div>
            <Separator />
            <div>
              <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                Emergency Contact
              </p>
              <p className="text-sm text-slate-700">
                {patient.phone ?? 'Pending'} <span className="text-xs text-slate-400">Primary</span>
              </p>
              <p className="text-xs text-slate-500">
                No secondary contact on file — prompt field nurse to update.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 shadow-sm">
          <CardHeader>
            <CardTitle>Risk & Care Plan</CardTitle>
            <CardDescription>Latest scores, urgency, and recommended action</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-3">
                <p className="text-xs font-semibold text-slate-500">Final Risk Score</p>
                <p className="text-2xl font-semibold text-slate-900">
                  {latestAssessment.final_risk_score ?? '—'}%
                </p>
                <p className="text-xs text-slate-500">
                  ML score {latestAssessment.ml_risk_score ?? '—'}%
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-3">
                <p className="text-xs font-semibold text-slate-500">Urgency</p>
                <p className="text-lg font-semibold text-slate-900">
                  {latestAssessment.urgency ?? 'Routine'}
                </p>
                <p className="text-xs text-slate-500">
                  Validated{' '}
                  {latestAssessment.validated_at
                    ? formatDate(latestAssessment.validated_at)
                    : 'Pending'}
                </p>
              </div>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              <p className="font-semibold">Recommended Action</p>
              <p>{latestAssessment.recommended_action ?? 'Awaiting clinician plan.'}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 shadow-sm">
          <CardHeader>
            <CardTitle>Vitals Snapshot</CardTitle>
            <CardDescription>Captured during latest assessment</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <VitalStat
              label="Blood Pressure"
              value={
                vitals.blood_pressure_systolic && vitals.blood_pressure_diastolic
                  ? `${vitals.blood_pressure_systolic}/${vitals.blood_pressure_diastolic} mmHg`
                  : '—'
              }
              icon={Activity}
            />
            <VitalStat
              label="Heart Rate"
              value={vitals.heart_rate ? `${vitals.heart_rate} bpm` : '—'}
              icon={Heart}
            />
            <VitalStat
              label="BMI"
              value={vitals.bmi ? `${vitals.bmi}` : '—'}
              icon={AlertTriangle}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AssessmentHistory assessments={assessments} />
        </div>

        <Card className="border-slate-200/70 shadow-sm">
          <CardHeader>
            <CardTitle>Medical History</CardTitle>
            <CardDescription>Auto-summarized from last assessment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {medicalHistory.length === 0 ? (
              <p className="text-sm text-slate-500">No chronic conditions documented.</p>
            ) : (
              <ul className="space-y-2 text-sm text-slate-700">
                {medicalHistory.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="bg-heart-red h-2 w-2 rounded-full" />
                    {item}
                  </li>
                ))}
              </ul>
            )}
            <Separator />
            <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Lifestyle Highlights
            </p>
            {lifestyleHighlights.length === 0 ? (
              <p className="text-sm text-slate-500">No lifestyle data recorded.</p>
            ) : (
              <ul className="space-y-1 text-sm text-slate-700">
                {lifestyleHighlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-slate-200/70 shadow-sm">
          <CardHeader>
            <CardTitle>Referral History</CardTitle>
            <CardDescription>Entries derived from assessment outcomes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {referralEvents.length === 0 ? (
              <p className="text-sm text-slate-500">No referrals triggered to date.</p>
            ) : (
              referralEvents.slice(0, 4).map((ref) => (
                <div
                  key={ref.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <p className="text-sm font-semibold text-slate-900">
                    {formatDate(ref.assessment_date)}
                  </p>
                  <p className="text-xs text-slate-500">Status: {ref.status.replace('_', ' ')}</p>
                  <p className="text-xs text-slate-500">
                    Risk {ref.final_risk_score ?? '—'}% · Plan:{' '}
                    {ref.recommended_action ?? 'Not documented'}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200/70 shadow-sm">
          <CardHeader>
            <CardTitle>Follow-up & Appointments</CardTitle>
            <CardDescription>Planned activities derived from care recommendations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <p className="font-semibold">Next Follow-up</p>
              <p>
                {latestAssessment.recommended_action ??
                  'Awaiting clinician update. Coordinate with facility nurse.'}
              </p>
              <p className="text-xs text-slate-500">
                Last validated{' '}
                {latestAssessment.validated_at ? formatDate(latestAssessment.validated_at) : 'N/A'}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <p className="font-semibold">Care Team Notes</p>
              <p>
                {latestAssessment.validation_notes ||
                  'No additional notes recorded. Encourage mobile user to provide updates.'}
              </p>
            </div>
            <Button variant="outline" className="w-full" asChild>
              <Link href={`/assessments?patient=${encodeURIComponent(patient.first_name)}`}>
                View All Assessments
                <ArrowRight className="ml-2 h-4 w-4" strokeWidth={1.5} />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function calculateAge(dateString: string): number {
  const dob = new Date(dateString);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

function formatDate(value?: string): string {
  if (!value) return '—';
  try {
    return format(new Date(value), 'PPP');
  } catch {
    return value;
  }
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-900">{value}</span>
    </div>
  );
}

function VitalStat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Activity;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white/70 p-3">
      <Icon className="text-heart-red h-5 w-5" strokeWidth={1.5} />
      <div>
        <p className="text-xs font-semibold text-slate-500">{label}</p>
        <p className="text-base font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function buildMedicalHistorySummary(history?: Record<string, unknown>): string[] {
  if (!history) return [];
  const entries: string[] = [];
  Object.entries(history).forEach(([key, value]) => {
    if (typeof value === 'boolean' && value) {
      entries.push(formatSentence(key));
    } else if (Array.isArray(value) && value.length > 0) {
      value.forEach((item) => {
        if (typeof item === 'string') {
          entries.push(formatSentence(item));
        }
      });
    } else if (typeof value === 'string' && value.trim().length > 0) {
      entries.push(formatSentence(value));
    }
  });
  return entries.slice(0, 6);
}

function buildLifestyleSummary(lifestyle?: Record<string, unknown>): string[] {
  if (!lifestyle) return [];
  const entries: string[] = [];
  const smoking = lifestyle.smoking;
  if (typeof smoking === 'boolean' && smoking) {
    const smokingFrequency =
      typeof lifestyle.smoking_frequency === 'string'
        ? lifestyle.smoking_frequency
        : 'frequency not specified';
    entries.push(`Smoker (${smokingFrequency})`);
  }
  const alcohol = lifestyle.alcohol;
  if (typeof alcohol === 'boolean' && alcohol) {
    const alcoholFrequency =
      typeof lifestyle.alcohol_frequency === 'string'
        ? lifestyle.alcohol_frequency
        : 'frequency not specified';
    entries.push(`Alcohol use (${alcoholFrequency})`);
  }
  const exercise = lifestyle.exercise;
  if (typeof exercise === 'boolean' && exercise) {
    const exerciseFrequency =
      typeof lifestyle.exercise_frequency === 'string' ? lifestyle.exercise_frequency : '—';
    entries.push(`Exercise pattern: ${exerciseFrequency}`);
  }
  if (typeof lifestyle.diet === 'string') {
    entries.push(`Diet quality: ${formatSentence(lifestyle.diet)}`);
  }
  if (typeof lifestyle.sleep_hours === 'number') {
    entries.push(`Sleep: ${lifestyle.sleep_hours} hrs/night`);
  }
  return entries.slice(0, 4);
}

function formatSentence(value: string): string {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
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
