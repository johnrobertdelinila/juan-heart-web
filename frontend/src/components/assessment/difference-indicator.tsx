/**
 * Difference Indicator Component
 *
 * Visual badge indicating the type of difference between AI and clinical values.
 * Shows icons and text to represent increase, decrease, changes, or missing data.
 */

import { ArrowDownRight, ArrowUpRight, AlertTriangle, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { DifferenceType } from '@/lib/utils/comparison-helpers';
import { getDifferenceDescription, getDifferenceBadgeVariant } from '@/lib/utils/comparison-helpers';

interface DifferenceIndicatorProps {
  type: DifferenceType;
  value?: string | number;
  className?: string;
  showIcon?: boolean;
  showText?: boolean;
}

export function DifferenceIndicator({
  type,
  value,
  className = '',
  showIcon = true,
  showText = true,
}: DifferenceIndicatorProps) {
  // Don't render anything if there's no difference
  if (type === 'none') {
    return null;
  }

  const variant = getDifferenceBadgeVariant(type);
  const description = getDifferenceDescription(type);

  // Get icon based on difference type
  const getIcon = () => {
    if (!showIcon) return null;

    switch (type) {
      case 'increase':
        return <ArrowUpRight className="h-3 w-3" strokeWidth={2} />;
      case 'decrease':
        return <ArrowDownRight className="h-3 w-3" strokeWidth={2} />;
      case 'missing':
        return <AlertTriangle className="h-3 w-3" strokeWidth={2} />;
      case 'changed':
        return <Info className="h-3 w-3" strokeWidth={2} />;
      default:
        return null;
    }
  };

  // Get color classes based on type
  const getColorClasses = () => {
    switch (type) {
      case 'increase':
        return 'border-amber-400 bg-amber-50 text-amber-700';
      case 'decrease':
        return 'border-sky-400 bg-sky-50 text-sky-700';
      case 'changed':
        return 'border-violet-400 bg-violet-50 text-violet-700';
      case 'missing':
        return 'border-red-400 bg-red-50 text-red-700';
      default:
        return '';
    }
  };

  return (
    <Badge
      variant={variant}
      className={`inline-flex items-center gap-1 text-xs font-medium ${getColorClasses()} ${className}`}
    >
      {getIcon()}
      {showText && <span>{description}</span>}
      {value && <span className="font-mono font-semibold">{value}</span>}
    </Badge>
  );
}

/**
 * Compact Difference Indicator
 * Minimal version showing only icon
 */
export function CompactDifferenceIndicator({
  type,
  className = '',
}: Pick<DifferenceIndicatorProps, 'type' | 'className'>) {
  return (
    <DifferenceIndicator
      type={type}
      showIcon={true}
      showText={false}
      className={`h-5 w-5 rounded-full p-0.5 ${className}`}
    />
  );
}

/**
 * Difference Badge with Value
 * Shows delta value with icon
 */
export function DifferenceBadgeWithValue({
  type,
  absoluteDiff,
  percentageDiff,
  unit = '',
  className = '',
}: {
  type: DifferenceType;
  absoluteDiff?: number;
  percentageDiff?: number;
  unit?: string;
  className?: string;
}) {
  if (type === 'none' || !absoluteDiff) {
    return null;
  }

  const sign = absoluteDiff > 0 ? '+' : '';
  const formattedAbsolute = `${sign}${absoluteDiff.toFixed(1)}${unit}`;
  const formattedPercentage = percentageDiff
    ? `(${sign}${Math.abs(percentageDiff).toFixed(1)}%)`
    : '';

  return (
    <DifferenceIndicator
      type={type}
      value={`${formattedAbsolute} ${formattedPercentage}`}
      className={className}
    />
  );
}

/**
 * Difference Summary
 * Shows count of differences
 */
export function DifferenceSummary({
  totalFields,
  changedFields,
  className = '',
}: {
  totalFields: number;
  changedFields: number;
  className?: string;
}) {
  if (changedFields === 0) {
    return (
      <Badge variant="outline" className={`border-emerald-400 bg-emerald-50 text-emerald-700 ${className}`}>
        <Info className="mr-1 h-3 w-3" strokeWidth={2} />
        All values match
      </Badge>
    );
  }

  const percentage = ((changedFields / totalFields) * 100).toFixed(0);

  return (
    <Badge variant="outline" className={`border-amber-400 bg-amber-50 text-amber-700 ${className}`}>
      <AlertTriangle className="mr-1 h-3 w-3" strokeWidth={2} />
      {changedFields} of {totalFields} fields differ ({percentage}%)
    </Badge>
  );
}
