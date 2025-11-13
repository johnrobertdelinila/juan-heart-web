/**
 * Comparison Utilities
 *
 * Utilities for comparing AI and clinical assessment values
 * and detecting differences for visual highlighting.
 */

export type DifferenceType = 'increase' | 'decrease' | 'changed' | 'none' | 'missing';

export interface ComparisonResult<T> {
  aiValue: T;
  clinicalValue: T;
  isDifferent: boolean;
  differenceType: DifferenceType;
  percentageDiff?: number;
  absoluteDiff?: number;
}

/**
 * Compare two numeric values and return detailed comparison result
 */
export function compareNumericValues(
  aiValue: number | null | undefined,
  clinicalValue: number | null | undefined
): ComparisonResult<number | null> {
  const ai = aiValue ?? null;
  const clinical = clinicalValue ?? null;

  // Both missing
  if (ai === null && clinical === null) {
    return {
      aiValue: null,
      clinicalValue: null,
      isDifferent: false,
      differenceType: 'none',
    };
  }

  // One missing
  if (ai === null || clinical === null) {
    return {
      aiValue: ai,
      clinicalValue: clinical,
      isDifferent: true,
      differenceType: 'missing',
    };
  }

  // Both present - calculate difference
  const isDifferent = ai !== clinical;
  const absoluteDiff = clinical - ai;
  const percentageDiff = ai !== 0 ? (absoluteDiff / ai) * 100 : 0;

  let differenceType: DifferenceType = 'none';
  if (isDifferent) {
    differenceType = absoluteDiff > 0 ? 'increase' : 'decrease';
  }

  return {
    aiValue: ai,
    clinicalValue: clinical,
    isDifferent,
    differenceType,
    absoluteDiff,
    percentageDiff,
  };
}

/**
 * Compare two string values
 */
export function compareStringValues(
  aiValue: string | null | undefined,
  clinicalValue: string | null | undefined
): ComparisonResult<string | null> {
  const ai = aiValue ?? null;
  const clinical = clinicalValue ?? null;

  // Both missing
  if (ai === null && clinical === null) {
    return {
      aiValue: null,
      clinicalValue: null,
      isDifferent: false,
      differenceType: 'none',
    };
  }

  // One missing
  if (ai === null || clinical === null) {
    return {
      aiValue: ai,
      clinicalValue: clinical,
      isDifferent: true,
      differenceType: 'missing',
    };
  }

  // Both present - compare
  const isDifferent = ai.toLowerCase() !== clinical.toLowerCase();

  return {
    aiValue: ai,
    clinicalValue: clinical,
    isDifferent,
    differenceType: isDifferent ? 'changed' : 'none',
  };
}

/**
 * Compare two boolean values
 */
export function compareBooleanValues(
  aiValue: boolean | null | undefined,
  clinicalValue: boolean | null | undefined
): ComparisonResult<boolean | null> {
  const ai = aiValue ?? null;
  const clinical = clinicalValue ?? null;

  // Both missing
  if (ai === null && clinical === null) {
    return {
      aiValue: null,
      clinicalValue: null,
      isDifferent: false,
      differenceType: 'none',
    };
  }

  // One missing
  if (ai === null || clinical === null) {
    return {
      aiValue: ai,
      clinicalValue: clinical,
      isDifferent: true,
      differenceType: 'missing',
    };
  }

  // Both present - compare
  const isDifferent = ai !== clinical;

  return {
    aiValue: ai,
    clinicalValue: clinical,
    isDifferent,
    differenceType: isDifferent ? 'changed' : 'none',
  };
}

/**
 * Compare two arrays of strings
 */
export function compareArrays(
  aiValue: string[] | null | undefined,
  clinicalValue: string[] | null | undefined
): ComparisonResult<string[] | null> {
  const ai = aiValue ?? null;
  const clinical = clinicalValue ?? null;

  // Both missing
  if (ai === null && clinical === null) {
    return {
      aiValue: null,
      clinicalValue: null,
      isDifferent: false,
      differenceType: 'none',
    };
  }

  // One missing
  if (ai === null || clinical === null) {
    return {
      aiValue: ai,
      clinicalValue: clinical,
      isDifferent: true,
      differenceType: 'missing',
    };
  }

  // Both present - compare
  const isDifferent =
    ai.length !== clinical.length ||
    !ai.every((item, index) => item === clinical[index]);

  return {
    aiValue: ai,
    clinicalValue: clinical,
    isDifferent,
    differenceType: isDifferent ? 'changed' : 'none',
  };
}

/**
 * Compare blood pressure values (systolic/diastolic)
 */
export function compareBloodPressure(
  aiSystolic: number | null | undefined,
  aiDiastolic: number | null | undefined,
  clinicalSystolic: number | null | undefined,
  clinicalDiastolic: number | null | undefined
): ComparisonResult<string | null> {
  const aiValue =
    aiSystolic && aiDiastolic ? `${aiSystolic}/${aiDiastolic}` : null;
  const clinicalValue =
    clinicalSystolic && clinicalDiastolic
      ? `${clinicalSystolic}/${clinicalDiastolic}`
      : null;

  // Both missing
  if (aiValue === null && clinicalValue === null) {
    return {
      aiValue: null,
      clinicalValue: null,
      isDifferent: false,
      differenceType: 'none',
    };
  }

  // One missing
  if (aiValue === null || clinicalValue === null) {
    return {
      aiValue,
      clinicalValue,
      isDifferent: true,
      differenceType: 'missing',
    };
  }

  // Both present - compare
  const isDifferent =
    aiSystolic !== clinicalSystolic || aiDiastolic !== clinicalDiastolic;

  // Calculate direction based on systolic (primary indicator)
  let differenceType: DifferenceType = 'none';
  if (isDifferent && aiSystolic && clinicalSystolic) {
    differenceType = clinicalSystolic > aiSystolic ? 'increase' : 'decrease';
  } else if (isDifferent) {
    differenceType = 'changed';
  }

  return {
    aiValue,
    clinicalValue,
    isDifferent,
    differenceType,
  };
}

/**
 * Format difference for display
 */
export function formatDifference(
  result: ComparisonResult<number | null>
): string {
  if (result.differenceType === 'missing') {
    return 'Data missing';
  }

  if (result.differenceType === 'none' || !result.absoluteDiff) {
    return 'No change';
  }

  const sign = result.absoluteDiff > 0 ? '+' : '';
  const value = Math.abs(result.absoluteDiff);

  return `${sign}${value.toFixed(1)}`;
}

/**
 * Format percentage difference for display
 */
export function formatPercentageDifference(
  result: ComparisonResult<number | null>
): string {
  if (result.differenceType === 'missing') {
    return '';
  }

  if (result.differenceType === 'none' || !result.percentageDiff) {
    return '';
  }

  const sign = result.percentageDiff > 0 ? '+' : '';
  const value = Math.abs(result.percentageDiff);

  return `(${sign}${value.toFixed(1)}%)`;
}

/**
 * Get human-readable difference description
 */
export function getDifferenceDescription(
  differenceType: DifferenceType
): string {
  switch (differenceType) {
    case 'increase':
      return 'Increased';
    case 'decrease':
      return 'Decreased';
    case 'changed':
      return 'Modified';
    case 'missing':
      return 'Data incomplete';
    case 'none':
      return 'No change';
    default:
      return '';
  }
}

/**
 * Count differences in an object
 */
export function countDifferences(
  comparisons: Record<string, ComparisonResult<unknown>>
): number {
  return Object.values(comparisons).filter((c) => c.isDifferent).length;
}

/**
 * Get CSS classes for difference highlighting
 */
export function getDifferenceClasses(
  differenceType: DifferenceType,
  side: 'ai' | 'clinical'
): string {
  if (differenceType === 'none') {
    return 'border-slate-200 bg-slate-50';
  }

  if (differenceType === 'missing') {
    return 'border-amber-200 border-dashed bg-amber-50/30';
  }

  // Different values - highlight with side-specific colors
  if (side === 'ai') {
    return 'border-l-4 border-blue-400 bg-blue-50/50';
  } else {
    return 'border-l-4 border-emerald-400 bg-emerald-50/50';
  }
}

/**
 * Get badge variant based on difference type
 */
export function getDifferenceBadgeVariant(
  differenceType: DifferenceType
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (differenceType) {
    case 'increase':
      return 'default';
    case 'decrease':
      return 'secondary';
    case 'changed':
      return 'outline';
    case 'missing':
      return 'destructive';
    case 'none':
      return 'outline';
    default:
      return 'outline';
  }
}
