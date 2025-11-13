'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import {
  getReferrals,
  getReferralStatistics,
  getPriorityColor,
  getStatusColor,
  getUrgencyColor,
  formatRelativeTime,
} from '@/lib/api/referral';
import type { Referral, ReferralStatistics, ReferralFilters } from '@/types/referral';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTable } from '@/components/ui/data-table';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { DataTableToolbar } from '@/components/ui/data-table-toolbar';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { DataTableFacetedFilter } from '@/components/ui/data-table-faceted-filter';
import type { Table } from '@tanstack/react-table';
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  Search,
  TrendingUp,
  Users,
  Clock,
  Eye,
  Download,
} from 'lucide-react';

// Column definitions for Referrals DataTable
const createColumns = (router: ReturnType<typeof useRouter>): ColumnDef<Referral>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'id',
    id: 'id',
    header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
    cell: ({ row }) => (
      <span className="font-mono text-sm text-slate-700">#{row.getValue('id')}</span>
    ),
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: 'patient_full_name',
    id: 'patient_full_name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Patient" />,
    cell: ({ row }) => (
      <span className="font-medium text-slate-900">{row.getValue('patient_full_name')}</span>
    ),
    enableSorting: true,
    enableHiding: false,
  },
  {
    id: 'source_facility',
    accessorFn: (row) => row.source_facility?.name || 'N/A',
    header: ({ column }) => <DataTableColumnHeader column={column} title="From Facility" />,
    cell: ({ row }) => {
      const referral = row.original;
      return (
        <span className="text-sm text-slate-700">
          {referral.source_facility?.name || 'N/A'}
        </span>
      );
    },
    enableSorting: true,
  },
  {
    id: 'target_facility',
    accessorFn: (row) => row.target_facility?.name || 'Unknown',
    header: ({ column }) => <DataTableColumnHeader column={column} title="To Facility" />,
    cell: ({ row }) => {
      const referral = row.original;
      return (
        <span className="text-sm text-slate-700">{referral.target_facility?.name}</span>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: 'priority',
    id: 'priority',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Priority" />,
    cell: ({ row }) => {
      const priority = row.getValue('priority') as string;
      return <Badge className={getPriorityColor(priority)}>{priority}</Badge>;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    enableSorting: true,
  },
  {
    accessorKey: 'urgency',
    id: 'urgency',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Urgency" />,
    cell: ({ row }) => {
      const urgency = row.getValue('urgency') as string;
      return <Badge className={getUrgencyColor(urgency)}>{urgency}</Badge>;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    enableSorting: true,
  },
  {
    accessorKey: 'status',
    id: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const referral = row.original;
      return (
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(referral.status)}>
            {referral.status.replace('_', ' ')}
          </Badge>
          {referral.is_overdue && (
            <Badge className="border-red-200 bg-red-50 text-red-700 text-xs">Overdue</Badge>
          )}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    enableSorting: true,
  },
  {
    accessorKey: 'created_at',
    id: 'created_at',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
    cell: ({ row }) => {
      const date = row.getValue('created_at') as string;
      return <span className="text-sm text-slate-700">{formatRelativeTime(date)}</span>;
    },
    enableSorting: true,
  },
  {
    id: 'actions',
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const referral = row.original;
      return (
        <div className="text-right">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/referrals/${referral.id}`);
            }}
          >
            <Eye className="mr-1 h-3.5 w-3.5" strokeWidth={1.5} />
            View
          </Button>
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
];

export default function ReferralsPage() {
  const router = useRouter();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [statistics, setStatistics] = useState<ReferralStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage] = useState(20);

  // Filters
  const [filters, setFilters] = useState<ReferralFilters>({
    status: undefined,
    priority: undefined,
    urgency: undefined,
    search: undefined,
    sort_by: 'created_at',
    sort_order: 'desc',
  });

  const [searchInput, setSearchInput] = useState('');

  // Fetch data
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, filters, perPage]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch referrals
      const referralsResponse = await getReferrals({
        ...filters,
        page: currentPage,
        per_page: perPage,
      });

      if ('success' in referralsResponse && referralsResponse.success) {
        setReferrals(referralsResponse.data.data);
        setTotalPages(referralsResponse.data.last_page);
      } else {
        throw new Error('Failed to load referrals');
      }

      // Fetch statistics
      const statsResponse = await getReferralStatistics();

      if ('success' in statsResponse && statsResponse.success) {
        setStatistics(statsResponse.data);
      }
    } catch (err) {
      console.error('Referrals fetch error:', err);
      // Set a user-friendly error message
      setError(
        'Unable to connect to backend server. Please ensure the Laravel backend is running on http://127.0.0.1:8001'
      );
      // Set empty data instead of leaving it undefined
      setReferrals([]);
      setStatistics({
        total_referrals: 0,
        pending: 0,
        accepted: 0,
        rejected: 0,
        completed: 0,
        critical_pending: 0,
        acceptance_rate: 0,
        avg_response_time_hours: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setFilters({ ...filters, search: searchInput || undefined });
    setCurrentPage(1);
  };

  const handleFilterChange = (key: keyof ReferralFilters, value: any) => {
    setFilters({ ...filters, [key]: value || undefined });
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      status: undefined,
      priority: undefined,
      urgency: undefined,
      search: undefined,
      sort_by: 'created_at',
      sort_order: 'desc',
    });
    setSearchInput('');
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Referral Management</h1>
          <p className="mt-1 text-gray-600">
            Manage patient referrals between healthcare facilities
          </p>
        </div>
        <Link href="/referrals/create">
          <Button className="bg-heart-red hover:bg-heart-red-dark">
            <Plus className="mr-2 h-4 w-4 text-white" />
            Create Referral
          </Button>
        </Link>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card index={0}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Referrals</CardTitle>
              <Users className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{statistics.total_referrals}</div>
              <p className="mt-1 text-xs text-gray-500">All time</p>
            </CardContent>
          </Card>

          <Card index={1}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-yellow-600">{statistics.pending}</div>
              <p className="mt-1 text-xs text-gray-500">{statistics.critical_pending} critical</p>
            </CardContent>
          </Card>

          <Card index={2}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Acceptance Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-green-600">{statistics.acceptance_rate}%</div>
              <p className="mt-1 text-xs text-gray-500">
                {statistics.accepted} accepted, {statistics.rejected} rejected
              </p>
            </CardContent>
          </Card>

          <Card index={3}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Avg Response Time</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-blue-600">
                {statistics.avg_response_time_hours}h
              </div>
              <p className="mt-1 text-xs text-gray-500">Time to acceptance</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card index={4} disableHoverLift={true}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <CardTitle>Filters</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Search */}
            <div className="flex gap-2">
              <Input
                placeholder="Search by patient name or ID..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} size="icon">
                <Search className="h-4 w-4 text-white" />
              </Button>
            </div>

            {/* Status Filter */}
            <Select
              value={filters.status || 'all'}
              onValueChange={(value) =>
                handleFilterChange('status', value === 'all' ? undefined : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            {/* Priority Filter */}
            <Select
              value={filters.priority || 'all'}
              onValueChange={(value) =>
                handleFilterChange('priority', value === 'all' ? undefined : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>

            {/* Urgency Filter */}
            <Select
              value={filters.urgency || 'all'}
              onValueChange={(value) =>
                handleFilterChange('urgency', value === 'all' ? undefined : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Urgency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Urgency Levels</SelectItem>
                <SelectItem value="Emergency">Emergency</SelectItem>
                <SelectItem value="Urgent">Urgent</SelectItem>
                <SelectItem value="Routine">Routine</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Referrals List */}
      <Card index={5} disableHoverLift={true}>
        <CardHeader>
          <CardTitle>Referrals</CardTitle>
          <CardDescription>
            {loading
              ? 'Loading referrals...'
              : `Showing ${referrals.length} referral${referrals.length !== 1 ? 's' : ''}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="flex h-64 items-center justify-center">
              <div className="max-w-md text-center">
                <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
                <p className="mb-2 text-lg font-semibold text-red-600">Backend Connection Error</p>
                <p className="mb-4 text-sm text-gray-600">{error}</p>
                <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-left">
                  <p className="mb-2 text-xs font-semibold text-slate-700">To start the backend:</p>
                  <code className="block rounded bg-slate-900 p-2 text-xs text-green-400">
                    cd backend && php artisan serve
                  </code>
                </div>
                <Button onClick={fetchData} className="bg-heart-red hover:bg-heart-red-dark">
                  Try Again
                </Button>
              </div>
            </div>
          ) : (
            <>
              <DataTable
                columns={createColumns(router)}
                data={referrals}
                loading={loading}
                enablePagination={false} // Using server-side pagination
                onRowClick={(referral) => router.push(`/referrals/${referral.id}`)}
                emptyState={
                  <tr>
                    <td colSpan={9} className="h-64">
                      <div className="flex h-full items-center justify-center">
                        <div className="text-center">
                          <Users className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                          <p className="font-medium text-gray-600">No referrals found</p>
                          <p className="mt-2 text-sm text-gray-500">
                            Try adjusting your filters or create a new referral
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                }
              />

              {/* Server-side Pagination */}
              {!loading && totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between border-t pt-6">
                  <div className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="mr-1 h-4 w-4" strokeWidth={1.5} />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="ml-1 h-4 w-4" strokeWidth={1.5} />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
