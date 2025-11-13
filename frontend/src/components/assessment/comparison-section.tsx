/**
 * Comparison Section Component
 *
 * Wrapper component for groups of related comparison fields.
 * Supports collapsible sections, icons, and difference count badges.
 */

'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, type LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ComparisonSectionProps {
  title: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  differenceCount?: number;
  totalFields?: number;
  defaultExpanded?: boolean;
  collapsible?: boolean;
  className?: string;
}

export function ComparisonSection({
  title,
  icon: Icon,
  children,
  differenceCount = 0,
  totalFields,
  defaultExpanded = true,
  collapsible = true,
  className = '',
}: ComparisonSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggleExpanded = () => {
    if (collapsible) {
      setIsExpanded(!isExpanded);
    }
  };

  const hasDifferences = differenceCount > 0;

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader
        className={cn(
          'border-b border-slate-200 bg-slate-50',
          collapsible && 'cursor-pointer hover:bg-slate-100',
          'transition-colors'
        )}
        onClick={toggleExpanded}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {collapsible && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpanded();
                }}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" strokeWidth={1.5} />
                ) : (
                  <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
                )}
              </Button>
            )}
            {Icon && (
              <div className="rounded-lg bg-white p-2 shadow-sm">
                <Icon className="h-5 w-5 text-red-600" strokeWidth={1.5} />
              </div>
            )}
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          </div>

          {totalFields !== undefined && (
            <div className="flex items-center gap-2">
              {hasDifferences ? (
                <Badge
                  variant="outline"
                  className="border-amber-400 bg-amber-50 text-amber-700"
                >
                  {differenceCount} of {totalFields} differ
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="border-emerald-400 bg-emerald-50 text-emerald-700"
                >
                  All match
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      {isExpanded && <CardContent className="p-6">{children}</CardContent>}
    </Card>
  );
}

/**
 * Simple Comparison Section
 * No collapsible functionality, just a header and content
 */
export function SimpleComparisonSection({
  title,
  icon: Icon,
  children,
  className = '',
}: Pick<ComparisonSectionProps, 'title' | 'icon' | 'children' | 'className'>) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="rounded-lg bg-slate-50 p-2">
            <Icon className="h-5 w-5 text-red-600" strokeWidth={1.5} />
          </div>
        )}
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

/**
 * Comparison Section Group
 * Container for multiple comparison sections
 */
export function ComparisonSectionGroup({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn('space-y-6', className)}>{children}</div>;
}

/**
 * Split Comparison Section
 * Side-by-side sections for AI and Clinical
 */
export function SplitComparisonSection({
  title,
  icon: Icon,
  aiContent,
  clinicalContent,
  className = '',
}: {
  title: string;
  icon?: LucideIcon;
  aiContent: React.ReactNode;
  clinicalContent: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="rounded-lg bg-slate-50 p-2">
            <Icon className="h-5 w-5 text-red-600" strokeWidth={1.5} />
          </div>
        )}
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* AI Content */}
        <div className="space-y-3 rounded-xl border border-blue-200 bg-blue-50/30 p-4">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-blue-700">
            AI Assessment
          </h4>
          {aiContent}
        </div>

        {/* Clinical Content */}
        <div className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50/30 p-4">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            Clinical Review
          </h4>
          {clinicalContent}
        </div>
      </div>
    </div>
  );
}
