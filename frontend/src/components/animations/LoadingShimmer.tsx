'use client';

import { motion } from 'framer-motion';
import { shimmerVariants } from '@/lib/framer-config';
import { cn } from '@/lib/utils';

interface LoadingShimmerProps {
  className?: string;
  children?: React.ReactNode;
}

export function LoadingShimmer({ className, children }: LoadingShimmerProps) {
  return (
    <div className={cn('relative overflow-hidden bg-slate-100 rounded-md', className)}>
      {children}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
        variants={shimmerVariants}
        initial="initial"
        animate="animate"
      />
    </div>
  );
}

// Preset skeleton components
export function StatCardSkeleton() {
  return (
    <div className="space-y-3">
      <LoadingShimmer className="h-4 w-24" />
      <LoadingShimmer className="h-8 w-32" />
      <LoadingShimmer className="h-3 w-16" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="space-y-4">
      <LoadingShimmer className="h-6 w-48" />
      <LoadingShimmer className="h-64 w-full" />
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <div className="flex gap-4 py-3">
      <LoadingShimmer className="h-4 w-32" />
      <LoadingShimmer className="h-4 w-24" />
      <LoadingShimmer className="h-4 w-20" />
      <LoadingShimmer className="h-4 w-16" />
    </div>
  );
}

// Page header skeleton with title and description
export function PageHeaderSkeleton() {
  return (
    <div className="space-y-3">
      <LoadingShimmer className="h-8 w-64" />
      <LoadingShimmer className="h-4 w-96" />
    </div>
  );
}

// Data table skeleton with header and multiple rows
export function DataTableSkeleton() {
  return (
    <div className="space-y-4">
      {/* Table header */}
      <div className="flex gap-4 border-b border-slate-200 pb-3">
        <LoadingShimmer className="h-4 w-32" />
        <LoadingShimmer className="h-4 w-40" />
        <LoadingShimmer className="h-4 w-24" />
        <LoadingShimmer className="h-4 w-28" />
        <LoadingShimmer className="h-4 w-24" />
      </div>

      {/* Table rows */}
      {Array.from({ length: 8 }).map((_, i) => (
        <TableRowSkeleton key={i} />
      ))}
    </div>
  );
}

// Filter bar skeleton with search and filter buttons
export function FilterBarSkeleton() {
  return (
    <div className="flex items-center gap-4">
      <LoadingShimmer className="h-10 w-full max-w-sm" />
      <LoadingShimmer className="h-10 w-24" />
      <LoadingShimmer className="h-10 w-24" />
      <LoadingShimmer className="h-10 w-24" />
    </div>
  );
}
