/**
 * Table Utility Functions
 * Helper functions for data table operations
 */

import { Row } from '@tanstack/react-table';

/**
 * Fuzzy search filter
 * Case-insensitive substring matching
 */
export function fuzzyFilter<TData>(
  row: Row<TData>,
  columnId: string,
  filterValue: string
): boolean {
  const value = row.getValue(columnId);
  if (value == null) return false;

  const searchString = String(value).toLowerCase();
  const searchValue = filterValue.toLowerCase();

  return searchString.includes(searchValue);
}

/**
 * Date range filter
 * Filter rows by date range (inclusive)
 */
export function dateRangeFilter<TData>(
  row: Row<TData>,
  columnId: string,
  filterValue: [Date | null, Date | null]
): boolean {
  const [start, end] = filterValue;
  const date = new Date(row.getValue(columnId) as string);

  if (start && date < start) return false;
  if (end && date > end) return false;

  return true;
}

/**
 * Number range filter
 * Filter rows by numeric range (inclusive)
 */
export function numberRangeFilter<TData>(
  row: Row<TData>,
  columnId: string,
  filterValue: [number | null, number | null]
): boolean {
  const [min, max] = filterValue;
  const value = row.getValue(columnId) as number;

  if (min != null && value < min) return false;
  if (max != null && value > max) return false;

  return true;
}

/**
 * Multi-select filter
 * Filter rows by multiple selected values
 */
export function multiSelectFilter<TData>(
  row: Row<TData>,
  columnId: string,
  filterValue: string[]
): boolean {
  if (!filterValue || filterValue.length === 0) return true;

  const value = row.getValue(columnId) as string;
  return filterValue.includes(value);
}

/**
 * Export table data to CSV
 * Converts table rows to CSV format and triggers download
 */
export function exportToCSV<TData>(
  data: TData[],
  filename: string = 'export.csv',
  columns?: { key: keyof TData; label: string }[]
): void {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Determine columns
  const cols =
    columns ||
    (Object.keys(data[0] as object).map((key) => ({
      key: key as keyof TData,
      label: key,
    })) as { key: keyof TData; label: string }[]);

  // Create CSV header
  const header = cols.map((col) => `"${col.label}"`).join(',');

  // Create CSV rows
  const rows = data.map((row) =>
    cols
      .map((col) => {
        const value = row[col.key];
        // Escape quotes and wrap in quotes
        const escaped = String(value ?? '').replace(/"/g, '""');
        return `"${escaped}"`;
      })
      .join(',')
  );

  // Combine header and rows
  const csv = [header, ...rows].join('\n');

  // Create blob and trigger download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Export table data to Excel (XLSX)
 * Note: Requires xlsx library to be installed: npm install xlsx
 */
export async function exportToExcel<TData>(
  data: TData[],
  filename: string = 'export.xlsx',
  sheetName: string = 'Sheet1',
  columns?: { key: keyof TData; label: string }[]
): Promise<void> {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  try {
    // Dynamically import xlsx to keep bundle size small
    const XLSX = await import('xlsx');

    // Determine columns
    const cols =
      columns ||
      (Object.keys(data[0] as object).map((key) => ({
        key: key as keyof TData,
        label: key,
      })) as { key: keyof TData; label: string }[]);

    // Transform data for Excel
    const excelData = data.map((row) => {
      const excelRow: Record<string, unknown> = {};
      cols.forEach((col) => {
        excelRow[col.label] = row[col.key];
      });
      return excelRow;
    });

    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Trigger download
    XLSX.writeFile(workbook, filename);
  } catch (error) {
    console.error('Error exporting to Excel. Make sure xlsx is installed:', error);
    // Fallback to CSV
    console.log('Falling back to CSV export');
    exportToCSV(data, filename.replace('.xlsx', '.csv'), columns);
  }
}

/**
 * Format cell value for display
 * Handles common data types with appropriate formatting
 */
export function formatCellValue(value: unknown, type?: 'date' | 'number' | 'currency' | 'percentage'): string {
  if (value == null) return '-';

  switch (type) {
    case 'date':
      return new Date(value as string).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });

    case 'number':
      return typeof value === 'number' ? value.toLocaleString() : String(value);

    case 'currency':
      return typeof value === 'number'
        ? new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'PHP', // Philippine Peso
          }).format(value)
        : String(value);

    case 'percentage':
      return typeof value === 'number' ? `${(value * 100).toFixed(1)}%` : String(value);

    default:
      return String(value);
  }
}

/**
 * Get sorted data from table
 * Useful for exporting sorted/filtered data
 */
export function getSortedData<TData>(rows: Row<TData>[]): TData[] {
  return rows.map((row) => row.original);
}

/**
 * Batch operation helper
 * Process multiple rows with progress callback
 */
export async function batchOperation<TData>(
  rows: TData[],
  operation: (row: TData) => Promise<void>,
  onProgress?: (completed: number, total: number) => void
): Promise<void> {
  const total = rows.length;
  let completed = 0;

  for (const row of rows) {
    await operation(row);
    completed++;
    onProgress?.(completed, total);
  }
}
