/**
 * Field Formatters
 *
 * Utilities for formatting assessment field values consistently
 * across the comparison interface.
 */

/**
 * Format a generic value for display
 */
export function formatValue(
  value: string | number | boolean | null | undefined
): string {
  if (value === null || value === undefined) {
    return 'Not recorded';
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  if (typeof value === 'number') {
    return value.toString();
  }

  return value;
}

/**
 * Format blood pressure (systolic/diastolic)
 */
export function formatBloodPressure(
  systolic: number | null | undefined,
  diastolic: number | null | undefined
): string {
  if (!systolic || !diastolic) {
    return 'Not recorded';
  }

  return `${systolic}/${diastolic}`;
}

/**
 * Format heart rate
 */
export function formatHeartRate(value: number | null | undefined): string {
  if (!value) {
    return 'Not recorded';
  }

  return `${value}`;
}

/**
 * Format oxygen saturation
 */
export function formatOxygenSaturation(value: number | null | undefined): string {
  if (!value) {
    return 'Not recorded';
  }

  return `${value}`;
}

/**
 * Format temperature
 */
export function formatTemperature(value: number | null | undefined): string {
  if (!value) {
    return 'Not recorded';
  }

  return value.toFixed(1);
}

/**
 * Format BMI
 */
export function formatBMI(value: number | null | undefined): string {
  if (!value) {
    return 'Not recorded';
  }

  const bmi = value.toFixed(1);
  let category = '';

  if (value < 18.5) {
    category = ' (Underweight)';
  } else if (value < 25) {
    category = ' (Normal)';
  } else if (value < 30) {
    category = ' (Overweight)';
  } else {
    category = ' (Obese)';
  }

  return `${bmi}${category}`;
}

/**
 * Format risk score
 */
export function formatRiskScore(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return 'Not calculated';
  }

  return value.toFixed(1);
}

/**
 * Format risk level
 */
export function formatRiskLevel(
  value: 'low' | 'moderate' | 'high' | 'critical' | null | undefined
): string {
  if (!value) {
    return 'Not assessed';
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * Get risk level color class
 */
export function getRiskLevelColor(
  value: 'low' | 'moderate' | 'high' | 'critical' | null | undefined
): string {
  switch (value) {
    case 'low':
      return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    case 'moderate':
      return 'text-amber-700 bg-amber-50 border-amber-200';
    case 'high':
      return 'text-orange-700 bg-orange-50 border-orange-200';
    case 'critical':
      return 'text-red-700 bg-red-50 border-red-200';
    default:
      return 'text-slate-700 bg-slate-50 border-slate-200';
  }
}

/**
 * Format symptom severity
 */
export function formatSymptomSeverity(
  value: 'mild' | 'moderate' | 'severe' | null | undefined
): string {
  if (!value) {
    return 'Not recorded';
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * Format medication string
 */
export function formatMedication(
  name: string,
  dosage?: string | null,
  frequency?: string | null
): string {
  let result = name;

  if (dosage) {
    result += ` - ${dosage}`;
  }

  if (frequency) {
    result += ` (${frequency})`;
  }

  return result;
}

/**
 * Format medications array
 */
export function formatMedicationsList(
  medications: Array<{
    name: string;
    dosage?: string | null;
    frequency?: string | null;
  }> | null | undefined
): string {
  if (!medications || medications.length === 0) {
    return 'No medications';
  }

  return medications
    .map((med) => formatMedication(med.name, med.dosage, med.frequency))
    .join(', ');
}

/**
 * Format symptoms array
 */
export function formatSymptomsList(
  symptoms: string[] | null | undefined
): string {
  if (!symptoms || symptoms.length === 0) {
    return 'No symptoms reported';
  }

  return symptoms.join(', ');
}

/**
 * Format medical history conditions
 */
export function formatMedicalHistory(
  conditions: string[] | null | undefined
): string {
  if (!conditions || conditions.length === 0) {
    return 'No pre-existing conditions';
  }

  return conditions.join(', ');
}

/**
 * Format smoking status
 */
export function formatSmokingStatus(
  status: 'never' | 'former' | 'current' | null | undefined,
  frequency?: string | null
): string {
  if (!status) {
    return 'Not recorded';
  }

  let result = status.charAt(0).toUpperCase() + status.slice(1);

  if (status === 'current' && frequency) {
    result += ` (${frequency})`;
  }

  return result;
}

/**
 * Format exercise frequency
 */
export function formatExerciseFrequency(
  frequency: string | null | undefined
): string {
  if (!frequency) {
    return 'Not recorded';
  }

  return frequency;
}

/**
 * Format diet type
 */
export function formatDiet(diet: string | null | undefined): string {
  if (!diet) {
    return 'Not recorded';
  }

  return diet;
}

/**
 * Format sleep hours
 */
export function formatSleepHours(hours: number | null | undefined): string {
  if (!hours) {
    return 'Not recorded';
  }

  return `${hours} hours/night`;
}

/**
 * Format stress level
 */
export function formatStressLevel(
  level: 'low' | 'moderate' | 'high' | null | undefined
): string {
  if (!level) {
    return 'Not recorded';
  }

  return level.charAt(0).toUpperCase() + level.slice(1);
}

/**
 * Format date
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) {
    return 'Not recorded';
  }

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
}

/**
 * Format duration (minutes to readable string)
 */
export function formatDuration(minutes: number | null | undefined): string {
  if (!minutes) {
    return 'Not recorded';
  }

  if (minutes < 60) {
    return `${minutes} minutes`;
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (mins === 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }

  return `${hours} hour${hours > 1 ? 's' : ''} ${mins} minutes`;
}

/**
 * Format confidence score
 */
export function formatConfidence(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return 'Not available';
  }

  const percentage = (value * 100).toFixed(0);
  return `${percentage}%`;
}

/**
 * Format urgency level
 */
export function formatUrgency(
  value: 'routine' | 'urgent' | 'emergency' | null | undefined
): string {
  if (!value) {
    return 'Not assessed';
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * Get urgency color class
 */
export function getUrgencyColor(
  value: 'routine' | 'urgent' | 'emergency' | null | undefined
): string {
  switch (value) {
    case 'routine':
      return 'text-slate-700 bg-slate-50 border-slate-200';
    case 'urgent':
      return 'text-amber-700 bg-amber-50 border-amber-200';
    case 'emergency':
      return 'text-red-700 bg-red-50 border-red-200';
    default:
      return 'text-slate-700 bg-slate-50 border-slate-200';
  }
}

/**
 * Format recommendation text
 */
export function formatRecommendation(text: string | null | undefined): string {
  if (!text) {
    return 'No recommendation provided';
  }

  return text;
}

/**
 * Format agreement status
 */
export function formatAgreement(agrees: boolean | null | undefined): string {
  if (agrees === null || agrees === undefined) {
    return 'Not assessed';
  }

  return agrees ? 'Agrees' : 'Disagrees';
}

/**
 * Get agreement color class
 */
export function getAgreementColor(agrees: boolean | null | undefined): string {
  if (agrees === null || agrees === undefined) {
    return 'text-slate-700 bg-slate-50 border-slate-200';
  }

  return agrees
    ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
    : 'text-red-700 bg-red-50 border-red-200';
}
