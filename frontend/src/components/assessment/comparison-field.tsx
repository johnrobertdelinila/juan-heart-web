/**
 * Comparison Field Component
 *
 * Reusable component for displaying field-by-field comparison
 * between AI and clinical assessment values with visual highlighting.
 */

import { cn } from '@/lib/utils';
import type { DifferenceType } from '@/lib/utils/comparison-helpers';
import { getDifferenceClasses } from '@/lib/utils/comparison-helpers';
import { DifferenceIndicator, DifferenceBadgeWithValue } from './difference-indicator';

interface ComparisonFieldProps {
  label: string;
  aiValue: string | number | null;
  clinicalValue: string | number | null;
  unit?: string;
  isDifferent?: boolean;
  differenceType?: DifferenceType;
  absoluteDiff?: number;
  percentageDiff?: number;
  className?: string;
}

export function ComparisonField({
  label,
  aiValue,
  clinicalValue,
  unit,
  isDifferent = false,
  differenceType = 'none',
  absoluteDiff,
  percentageDiff,
  className = '',
}: ComparisonFieldProps) {
  const formatDisplayValue = (value: string | number | null) => {
    if (value === null) {
      return 'Not recorded';
    }
    return value;
  };

  const aiClasses = cn(
    'rounded-xl border px-4 py-3 transition-all',
    getDifferenceClasses(differenceType, 'ai'),
    className
  );

  const clinicalClasses = cn(
    'rounded-xl border px-4 py-3 transition-all',
    getDifferenceClasses(differenceType, 'clinical'),
    className
  );

  return (
    <div className="grid gap-3 md:grid-cols-[200px,1fr,1fr] md:gap-4">
      {/* Label Column */}
      <div className="flex items-center justify-between md:justify-start">
        <p className="text-sm font-semibold text-slate-800">{label}</p>
        <div className="md:hidden">
          {isDifferent && absoluteDiff !== undefined && (
            <DifferenceBadgeWithValue
              type={differenceType}
              absoluteDiff={absoluteDiff}
              percentageDiff={percentageDiff}
              unit={unit}
            />
          )}
          {isDifferent && absoluteDiff === undefined && (
            <DifferenceIndicator type={differenceType} />
          )}
        </div>
      </div>

      {/* AI Value Column */}
      <div className={aiClasses}>
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-900">
            {formatDisplayValue(aiValue)}
            {unit && aiValue !== null && (
              <span className="ml-1 text-slate-500">{unit}</span>
            )}
          </p>
          <div className="hidden md:block">
            {isDifferent && absoluteDiff !== undefined && (
              <DifferenceBadgeWithValue
                type={differenceType}
                absoluteDiff={absoluteDiff}
                percentageDiff={percentageDiff}
                unit={unit}
              />
            )}
            {isDifferent && absoluteDiff === undefined && (
              <DifferenceIndicator type={differenceType} />
            )}
          </div>
        </div>
      </div>

      {/* Clinical Value Column */}
      <div className={clinicalClasses}>
        <p className="text-sm font-medium text-slate-900">
          {formatDisplayValue(clinicalValue)}
          {unit && clinicalValue !== null && (
            <span className="ml-1 text-slate-500">{unit}</span>
          )}
        </p>
      </div>
    </div>
  );
}

/**
 * Boolean Comparison Field
 * Specialized for Yes/No values
 */
export function BooleanComparisonField({
  label,
  aiValue,
  clinicalValue,
  isDifferent = false,
  differenceType = 'none',
  className = '',
}: {
  label: string;
  aiValue: boolean | null;
  clinicalValue: boolean | null;
  isDifferent?: boolean;
  differenceType?: DifferenceType;
  className?: string;
}) {
  const formatBoolean = (value: boolean | null) => {
    if (value === null) return 'Not recorded';
    return value ? 'Yes' : 'No';
  };

  return (
    <ComparisonField
      label={label}
      aiValue={formatBoolean(aiValue)}
      clinicalValue={formatBoolean(clinicalValue)}
      isDifferent={isDifferent}
      differenceType={differenceType}
      className={className}
    />
  );
}

/**
 * Array Comparison Field
 * For lists like symptoms, medications, etc.
 */
export function ArrayComparisonField({
  label,
  aiValue,
  clinicalValue,
  isDifferent = false,
  differenceType = 'none',
  className = '',
}: {
  label: string;
  aiValue: string[] | null;
  clinicalValue: string[] | null;
  isDifferent?: boolean;
  differenceType?: DifferenceType;
  className?: string;
}) {
  const formatArray = (value: string[] | null) => {
    if (!value || value.length === 0) return 'None';
    return value.join(', ');
  };

  const aiClasses = cn(
    'rounded-xl border px-4 py-3 transition-all',
    getDifferenceClasses(differenceType, 'ai'),
    className
  );

  const clinicalClasses = cn(
    'rounded-xl border px-4 py-3 transition-all',
    getDifferenceClasses(differenceType, 'clinical'),
    className
  );

  return (
    <div className="grid gap-3 md:grid-cols-[200px,1fr,1fr] md:gap-4">
      {/* Label Column */}
      <div className="flex items-center justify-between md:justify-start">
        <p className="text-sm font-semibold text-slate-800">{label}</p>
        <div className="md:hidden">
          {isDifferent && <DifferenceIndicator type={differenceType} />}
        </div>
      </div>

      {/* AI Value Column */}
      <div className={aiClasses}>
        <div className="flex items-start justify-between">
          <p className="text-sm font-medium text-slate-900">
            {formatArray(aiValue)}
          </p>
          <div className="ml-2 hidden md:block">
            {isDifferent && <DifferenceIndicator type={differenceType} />}
          </div>
        </div>
      </div>

      {/* Clinical Value Column */}
      <div className={clinicalClasses}>
        <p className="text-sm font-medium text-slate-900">
          {formatArray(clinicalValue)}
        </p>
      </div>
    </div>
  );
}

/**
 * Text Comparison Field
 * For longer text fields like notes
 */
export function TextComparisonField({
  label,
  aiValue,
  clinicalValue,
  isDifferent = false,
  differenceType = 'none',
  className = '',
  maxLines = 3,
}: {
  label: string;
  aiValue: string | null;
  clinicalValue: string | null;
  isDifferent?: boolean;
  differenceType?: DifferenceType;
  className?: string;
  maxLines?: number;
}) {
  const formatText = (value: string | null) => {
    if (!value) return 'Not provided';
    return value;
  };

  const aiClasses = cn(
    'rounded-xl border px-4 py-3 transition-all',
    getDifferenceClasses(differenceType, 'ai'),
    className
  );

  const clinicalClasses = cn(
    'rounded-xl border px-4 py-3 transition-all',
    getDifferenceClasses(differenceType, 'clinical'),
    className
  );

  const textClasses = cn(
    'text-sm font-medium text-slate-900',
    maxLines && `line-clamp-${maxLines}`
  );

  return (
    <div className="grid gap-3 md:grid-cols-[200px,1fr,1fr] md:gap-4">
      {/* Label Column */}
      <div className="flex items-start justify-between md:justify-start md:pt-3">
        <p className="text-sm font-semibold text-slate-800">{label}</p>
        <div className="md:hidden">
          {isDifferent && <DifferenceIndicator type={differenceType} />}
        </div>
      </div>

      {/* AI Value Column */}
      <div className={aiClasses}>
        <div className="flex items-start justify-between">
          <p className={textClasses}>{formatText(aiValue)}</p>
          <div className="ml-2 hidden md:block">
            {isDifferent && <DifferenceIndicator type={differenceType} />}
          </div>
        </div>
      </div>

      {/* Clinical Value Column */}
      <div className={clinicalClasses}>
        <p className={textClasses}>{formatText(clinicalValue)}</p>
      </div>
    </div>
  );
}

/**
 * Comparison Field Header
 * Column headers for comparison sections
 */
export function ComparisonFieldHeader() {
  return (
    <div className="hidden grid-cols-[200px,1fr,1fr] gap-4 border-b border-slate-200 pb-2 md:grid">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Field
      </div>
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        AI Assessment
      </div>
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Clinical Review
      </div>
    </div>
  );
}
