/**
 * DataTable Component
 * Production-ready data table component using TanStack Table + Framer Motion
 * Follows Juan Heart design system specifications
 */

'use client';

import * as React from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { motion, AnimatePresence } from 'framer-motion';
import {
  tableRowVariants,
  tableRowHoverVariants,
  loadingSkeletonVariants,
  getAnimationVariants,
} from '@/lib/framer-config';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  loading?: boolean;
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enableRowSelection?: boolean;
  enablePagination?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  onRowClick?: (row: TData) => void;
  disableAnimations?: boolean;
  emptyState?: React.ReactNode;
  searchKey?: string;
  searchPlaceholder?: string;
  onTableReady?: (table: any) => void; // Callback to expose table instance
  onTableInstanceChange?: (table: any) => void; // Alternative callback name for compatibility

  // Render props for toolbar and pagination
  toolbar?: (table: any) => React.ReactNode;
  pagination?: (table: any) => React.ReactNode;

  // Optional overrides for manual pagination
  manualPagination?: boolean;
  pageCount?: number;
}

/**
 * Loading skeleton row component
 */
function LoadingRow({ columnCount }: { columnCount: number }) {
  return (
    <motion.tr
      variants={getAnimationVariants(loadingSkeletonVariants)}
      animate="loading"
      className="border-b border-slate-100"
    >
      {Array.from({ length: columnCount }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 rounded bg-slate-200" />
        </td>
      ))}
    </motion.tr>
  );
}

/**
 * Empty state component
 */
function DefaultEmptyState() {
  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <td colSpan={100} className="h-24 text-center">
        <div className="flex flex-col items-center justify-center space-y-2">
          <p className="text-sm font-medium text-slate-900">No results found</p>
          <p className="text-xs text-slate-600">Try adjusting your search or filter criteria</p>
        </div>
      </td>
    </motion.tr>
  );
}

export function DataTable<TData, TValue>({
  columns,
  data,
  loading = false,
  enableSorting = true,
  enableFiltering = true,
  enableRowSelection = false,
  enablePagination = true,
  pageSize = 10,
  pageSizeOptions = [10, 20, 50, 100],
  onRowClick,
  disableAnimations = false,
  emptyState,
  onTableReady,
  onTableInstanceChange,
  toolbar,
  pagination,
  manualPagination = false,
  pageCount,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });

  // Expose table instance to parent (support both callback names)
  React.useEffect(() => {
    if (onTableReady) {
      onTableReady(table);
    }
    if (onTableInstanceChange) {
      onTableInstanceChange(table);
    }
  }, [table, onTableReady, onTableInstanceChange]);

  // Reset page to 0 when filters change
  React.useEffect(() => {
    if (enablePagination) {
      table.setPageIndex(0);
    }
  }, [columnFilters, table, enablePagination]);

  const columnCount = table.getAllColumns().length;

  return (
    <div className="space-y-4">
      {/* Toolbar - search, filters, bulk actions */}
      {toolbar && toolbar(table)}

      {/* Table wrapper with horizontal scroll */}
      <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            {/* Table Header */}
            <thead className="bg-slate-50 border-b border-slate-200">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-slate-700"
                      style={{ width: header.getSize() }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            {/* Table Body */}
            <tbody>
              {loading ? (
                // Loading skeleton rows
                <>
                  {Array.from({ length: pageSize }).map((_, i) => (
                    <LoadingRow key={i} columnCount={columnCount} />
                  ))}
                </>
              ) : table.getRowModel().rows?.length ? (
                // Data rows with staggered animation
                <AnimatePresence mode="popLayout">
                  {table.getRowModel().rows.map((row, index) => (
                    <motion.tr
                      key={row.id}
                      custom={index}
                      variants={
                        disableAnimations ? undefined : getAnimationVariants(tableRowVariants)
                      }
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      whileHover={
                        disableAnimations
                          ? undefined
                          : getAnimationVariants(tableRowHoverVariants)?.hover
                      }
                      onClick={() => onRowClick?.(row.original)}
                      className="border-b border-slate-100 transition-colors duration-150 cursor-pointer"
                      data-state={row.getIsSelected() && 'selected'}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-6 py-4 text-sm text-slate-900">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </motion.tr>
                  ))}
                </AnimatePresence>
              ) : (
                // Empty state
                emptyState || <DefaultEmptyState />
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination - page controls */}
      {pagination && pagination(table)}

      {/* Expose table instance for toolbar and pagination (legacy) */}
      <div className="hidden" data-table-instance={JSON.stringify({ hasRows: table.getRowModel().rows?.length > 0 })} />
    </div>
  );
}

// Export table instance type for use in toolbar and pagination
export type { Table } from '@tanstack/react-table';
