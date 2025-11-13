/**
 * DataTableColumnHeader Component
 * Sortable column header with animated sort indicator
 */

'use client';

import * as React from 'react';
import { Column } from '@tanstack/react-table';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown, ChevronsUpDown } from 'lucide-react';
import { sortIndicatorVariants, getAnimationVariants } from '@/lib/framer-config';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface DataTableColumnHeaderProps<TData, TValue> extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
  disableAnimations?: boolean;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
  disableAnimations = false,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  const isSorted = column.getIsSorted();

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8 data-[state=open]:bg-slate-100 hover:bg-slate-100"
        onClick={() => {
          if (isSorted === 'asc') {
            column.toggleSorting(true);
          } else if (isSorted === 'desc') {
            column.clearSorting();
          } else {
            column.toggleSorting(false);
          }
        }}
      >
        <span>{title}</span>
        <motion.div
          variants={
            disableAnimations
              ? undefined
              : getAnimationVariants(sortIndicatorVariants)
          }
          animate={
            isSorted === 'asc' ? 'asc' : isSorted === 'desc' ? 'desc' : 'none'
          }
          className="ml-2 h-4 w-4"
        >
          {isSorted === 'asc' ? (
            <ArrowUp className="h-4 w-4" strokeWidth={1.5} />
          ) : isSorted === 'desc' ? (
            <ArrowDown className="h-4 w-4" strokeWidth={1.5} />
          ) : (
            <ChevronsUpDown className="h-4 w-4 opacity-30" strokeWidth={1.5} />
          )}
        </motion.div>
      </Button>
    </div>
  );
}
