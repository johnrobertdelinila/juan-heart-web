/**
 * DataTableToolbar Component
 * Search, filters, and bulk actions for data tables
 */

'use client';

import * as React from 'react';
import { Table } from '@tanstack/react-table';
import { X, Search, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { bulkActionToolbarVariants, getAnimationVariants } from '@/lib/framer-config';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DataTableViewOptions } from './data-table-view-options';

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  searchKey?: string;
  searchPlaceholder?: string;
  filterComponents?: React.ReactNode;
  bulkActions?: React.ReactNode;
  onExport?: () => void;
  disableAnimations?: boolean;
}

export function DataTableToolbar<TData>({
  table,
  searchKey,
  searchPlaceholder = 'Search...',
  filterComponents,
  bulkActions,
  onExport,
  disableAnimations = false,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const selectedRowCount = table.getFilteredSelectedRowModel().rows.length;
  const [searchValue, setSearchValue] = React.useState('');

  // Debounced search with useTransition for better performance
  const [isPending, startTransition] = React.useTransition();

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    startTransition(() => {
      if (searchKey) {
        table.getColumn(searchKey)?.setFilterValue(value);
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Main toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search and filters (left side) */}
        <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center">
          {/* Search input */}
          {searchKey && (
            <div className="relative w-full sm:w-64">
              <Search
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                strokeWidth={1.5}
              />
              <Input
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9"
              />
              {isPending && (
                <div className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-slate-300 border-t-heart-red" />
              )}
            </div>
          )}

          {/* Filter components */}
          {filterComponents && <div className="flex flex-wrap gap-2">{filterComponents}</div>}

          {/* Clear filters button */}
          {isFiltered && (
            <Button
              variant="ghost"
              onClick={() => table.resetColumnFilters()}
              className="h-8 px-2 lg:px-3"
            >
              Reset
              <X className="ml-2 h-4 w-4" strokeWidth={1.5} />
            </Button>
          )}
        </div>

        {/* Actions (right side) */}
        <div className="flex items-center gap-2">
          {/* Export button */}
          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="mr-2 h-4 w-4" strokeWidth={1.5} />
              Export
            </Button>
          )}

          {/* Column visibility */}
          <DataTableViewOptions table={table} />
        </div>
      </div>

      {/* Bulk actions toolbar (appears when rows are selected) */}
      <AnimatePresence>
        {selectedRowCount > 0 && bulkActions && (
          <motion.div
            variants={
              disableAnimations
                ? undefined
                : getAnimationVariants(bulkActionToolbarVariants)
            }
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
          >
            <div className="flex items-center gap-4">
              <p className="text-sm font-medium text-slate-900">
                {selectedRowCount} row{selectedRowCount > 1 ? 's' : ''} selected
              </p>
              <div className="flex items-center gap-2">{bulkActions}</div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => table.toggleAllRowsSelected(false)}
            >
              Clear selection
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
