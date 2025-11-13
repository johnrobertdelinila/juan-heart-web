'use client';

import { useState, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTable } from '@/components/ui/data-table';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { DataTableToolbar } from '@/components/ui/data-table-toolbar';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { DataTableFacetedFilter } from '@/components/ui/data-table-faceted-filter';
import type { Table } from '@tanstack/react-table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Calendar,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  CalendarPlus,
  Smartphone,
  Globe,
  User,
  Loader2,
  Mail,
  Building2,
  Stethoscope,
  FileText,
  X,
} from 'lucide-react';
import {
  getAppointments,
  getAppointment,
  confirmAppointment,
  checkInAppointment,
} from '@/lib/api/appointment';
import {
  showConfirmAppointmentDialog,
  showCheckInPatientDialog,
  showSuccessToast,
  showErrorToast,
  showLoadingDialog,
  closeDialog,
} from '@/lib/sweetalert-config';
import type { Appointment, AppointmentStatus, BookingSource } from '@/types/appointment';
import { PageHeaderSkeleton, StatCardSkeleton, DataTableSkeleton } from '@/components/animations';

interface AppointmentStats {
  total_today: number;
  confirmed: number;
  pending: number;
  completed: number;
}

// Helper functions
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

const getStatusColor = (status: AppointmentStatus) => {
  switch (status) {
    case 'scheduled':
      return 'bg-blue-100 text-blue-800';
    case 'confirmed':
      return 'bg-green-100 text-green-800';
    case 'checked_in':
      return 'bg-purple-100 text-purple-800';
    case 'in_progress':
      return 'bg-yellow-100 text-yellow-800';
    case 'completed':
      return 'bg-gray-100 text-gray-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    case 'no_show':
      return 'bg-orange-100 text-orange-800';
    case 'rescheduled':
      return 'bg-indigo-100 text-indigo-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusLabel = (status: AppointmentStatus) => {
  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'emergency':
      return 'bg-red-100 text-red-800';
    case 'consultation':
      return 'bg-blue-100 text-blue-800';
    case 'follow_up':
      return 'bg-green-100 text-green-800';
    case 'procedure':
      return 'bg-purple-100 text-purple-800';
    case 'screening':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const formatAppointmentType = (type: string): string => {
  return type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<AppointmentStats>({
    total_today: 0,
    confirmed: 0,
    pending: 0,
    completed: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [table, setTable] = useState<Table<Appointment> | null>(null);

  // Detail view dialog state
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Column definitions
  const columns: ColumnDef<Appointment>[] = [
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
      id: 'patient',
      accessorFn: (row) => `${row.patient_first_name} ${row.patient_last_name}`,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Patient" />,
      cell: ({ row }) => {
        const appointment = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="bg-heart-red/10 flex h-10 w-10 items-center justify-center rounded-full">
              <User className="text-heart-red h-5 w-5" strokeWidth={1.5} />
            </div>
            <div>
              <div className="text-midnight-blue font-semibold">
                {appointment.patient_first_name} {appointment.patient_last_name}
              </div>
              {appointment.patient_email && (
                <div className="font-mono text-xs text-gray-500">
                  ID: {appointment.id.toString().padStart(6, '0')}
                </div>
              )}
            </div>
          </div>
        );
      },
      enableSorting: true,
    },
    {
      id: 'contact',
      header: () => <div>Contact</div>,
      cell: ({ row }) => {
        const appointment = row.original;
        return (
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-1.5 text-gray-700">
              <Phone className="h-3.5 w-3.5 text-gray-400" strokeWidth={1.5} />
              {appointment.patient_phone}
            </div>
            {appointment.patient_email && (
              <div className="flex items-center gap-1.5 text-gray-500">
                <Mail className="h-3.5 w-3.5 text-gray-400" strokeWidth={1.5} />
                <span className="max-w-[160px] truncate">{appointment.patient_email}</span>
              </div>
            )}
          </div>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: 'appointment_datetime',
      id: 'appointment_datetime',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Date & Time" />,
      cell: ({ row }) => {
        const datetime = row.getValue('appointment_datetime') as string;
        return (
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-sm font-medium text-gray-900">
              <Calendar className="h-3.5 w-3.5 text-gray-400" strokeWidth={1.5} />
              {formatDate(datetime)}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <Clock className="h-3 w-3 text-gray-400" strokeWidth={1.5} />
              {formatTime(datetime)}
            </div>
          </div>
        );
      },
      enableSorting: true,
    },
    {
      id: 'facility',
      accessorFn: (row) => row.facility?.name || 'N/A',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Facility" />,
      cell: ({ row }) => {
        const appointment = row.original;
        return (
          <div className="flex max-w-[180px] items-start gap-1.5">
            <MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-gray-400" strokeWidth={1.5} />
            <div>
              <div className="truncate text-sm font-medium text-gray-900">
                {appointment.facility?.name || 'N/A'}
              </div>
              {appointment.facility?.city && (
                <div className="text-xs text-gray-500">{appointment.facility.city}</div>
              )}
            </div>
          </div>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
      enableSorting: true,
    },
    {
      accessorKey: 'appointment_type',
      id: 'appointment_type',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
      cell: ({ row }) => {
        const type = row.getValue('appointment_type') as string;
        return <Badge className={getTypeColor(type)}>{formatAppointmentType(type)}</Badge>;
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
        const status = row.getValue('status') as AppointmentStatus;
        return <Badge className={getStatusColor(status)}>{getStatusLabel(status)}</Badge>;
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
      enableSorting: true,
    },
    {
      accessorKey: 'booking_source',
      id: 'booking_source',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Source" />,
      cell: ({ row }) => {
        const source = row.getValue('booking_source') as BookingSource | undefined;
        if (!source) return <span className="text-xs text-gray-400">N/A</span>;

        return (
          <Badge variant="outline" className="gap-1">
            {source === 'mobile' && <Smartphone className="h-3 w-3" strokeWidth={1.5} />}
            {source === 'web' && <Globe className="h-3 w-3" strokeWidth={1.5} />}
            {source === 'phone' && <Phone className="h-3 w-3" strokeWidth={1.5} />}
            {source === 'walk_in' && <User className="h-3 w-3" strokeWidth={1.5} />}
            {source.charAt(0).toUpperCase() + source.slice(1).replace('_', '-')}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const appointment = row.original;
        return (
          <div className="flex justify-end gap-2">
            {appointment.status === 'scheduled' && (
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  handleConfirmAppointment(appointment);
                }}
              >
                <CheckCircle className="mr-1 h-3 w-3" strokeWidth={1.5} />
                Confirm
              </Button>
            )}
            {appointment.status === 'confirmed' && (
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCheckInPatient(appointment);
                }}
              >
                Check In
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                handleViewAppointment(appointment.id);
              }}
            >
              View
            </Button>
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
  ];

  // Fetch appointments on mount
  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const response = await getAppointments({ per_page: 100 });

      if (response.success) {
        setAppointments(response.data.data);

        // Calculate stats from current data
        const today = new Date().toISOString().split('T')[0] || '';
        const todayAppointments = response.data.data.filter((apt) =>
          apt.appointment_datetime.startsWith(today)
        );

        setStats({
          total_today: todayAppointments.length,
          confirmed: response.data.data.filter((apt) => apt.status === 'confirmed').length,
          pending: response.data.data.filter((apt) => apt.status === 'scheduled').length,
          completed: response.data.data.filter((apt) => apt.status === 'completed').length,
        });
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle appointment confirmation
  const handleConfirmAppointment = async (appointment: Appointment) => {
    const patientName = `${appointment.patient_first_name} ${appointment.patient_last_name}`;
    const appointmentType = appointment.appointment_type;

    const result = await showConfirmAppointmentDialog(patientName, appointmentType);

    if (result.isConfirmed) {
      showLoadingDialog('Confirming appointment...');

      try {
        await confirmAppointment(appointment.id);
        closeDialog();
        await showSuccessToast('Appointment confirmed successfully');
        fetchAppointments(); // Refresh list
      } catch (error) {
        closeDialog();
        console.error('Error confirming appointment:', error);
        await showErrorToast(
          'Failed to confirm appointment',
          error instanceof Error ? error.message : 'Please try again'
        );
      }
    }
  };

  // Handle patient check-in
  const handleCheckInPatient = async (appointment: Appointment) => {
    const patientName = `${appointment.patient_first_name} ${appointment.patient_last_name}`;
    const appointmentType = appointment.appointment_type;

    const result = await showCheckInPatientDialog(patientName, appointmentType);

    if (result.isConfirmed) {
      showLoadingDialog('Checking in patient...');

      try {
        await checkInAppointment(appointment.id);
        closeDialog();
        await showSuccessToast('Patient checked in successfully');
        fetchAppointments(); // Refresh list
      } catch (error) {
        closeDialog();
        console.error('Error checking in patient:', error);
        await showErrorToast(
          'Failed to check in patient',
          error instanceof Error ? error.message : 'Please try again'
        );
      }
    }
  };

  // Handle view appointment details
  const handleViewAppointment = async (appointmentId: number) => {
    setIsLoadingDetail(true);
    setIsDetailDialogOpen(true);

    try {
      const response = await getAppointment(appointmentId);
      if (response.success) {
        setSelectedAppointment(response.data);
      }
    } catch (error) {
      console.error('Error fetching appointment details:', error);
      await showErrorToast(
        'Failed to load appointment details',
        error instanceof Error ? error.message : 'Please try again'
      );
      setIsDetailDialogOpen(false);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // Handle bulk confirm appointments
  const handleBulkConfirm = async () => {
    if (!table) return;

    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const selectedAppointments = selectedRows.map((row) => row.original);
    const scheduledAppointments = selectedAppointments.filter((apt) => apt.status === 'scheduled');

    if (scheduledAppointments.length === 0) {
      await showErrorToast(
        'No scheduled appointments selected',
        'Please select appointments with scheduled status'
      );
      return;
    }

    showLoadingDialog(`Confirming ${scheduledAppointments.length} appointment(s)...`);

    try {
      for (const appointment of scheduledAppointments) {
        await confirmAppointment(appointment.id);
      }

      closeDialog();
      await showSuccessToast(
        `Successfully confirmed ${scheduledAppointments.length} appointment(s)`
      );
      table.toggleAllRowsSelected(false);
      fetchAppointments();
    } catch (error) {
      closeDialog();
      console.error('Error bulk confirming appointments:', error);
      await showErrorToast('Failed to confirm appointments', 'Please try again');
    }
  };

  // Handle bulk check-in
  const handleBulkCheckIn = async () => {
    if (!table) return;

    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const selectedAppointments = selectedRows.map((row) => row.original);
    const confirmedAppointments = selectedAppointments.filter((apt) => apt.status === 'confirmed');

    if (confirmedAppointments.length === 0) {
      await showErrorToast(
        'No confirmed appointments selected',
        'Please select appointments with confirmed status'
      );
      return;
    }

    showLoadingDialog(`Checking in ${confirmedAppointments.length} patient(s)...`);

    try {
      for (const appointment of confirmedAppointments) {
        await checkInAppointment(appointment.id);
      }

      closeDialog();
      await showSuccessToast(`Successfully checked in ${confirmedAppointments.length} patient(s)`);
      table.toggleAllRowsSelected(false);
      fetchAppointments();
    } catch (error) {
      closeDialog();
      console.error('Error bulk checking in patients:', error);
      await showErrorToast('Failed to check in patients', 'Please try again');
    }
  };

  // Export handler
  const handleExport = () => {
    if (!table) return;

    const rows = table.getFilteredRowModel().rows;
    const csv = [
      [
        'Patient Name',
        'Phone',
        'Email',
        'Date',
        'Time',
        'Facility',
        'Type',
        'Status',
        'Source',
      ].join(','),
      ...rows.map((row) => {
        const appointment = row.original;
        return [
          `"${appointment.patient_first_name} ${appointment.patient_last_name}"`,
          appointment.patient_phone,
          appointment.patient_email || '',
          formatDate(appointment.appointment_datetime),
          formatTime(appointment.appointment_datetime),
          `"${appointment.facility?.name || 'N/A'}"`,
          formatAppointmentType(appointment.appointment_type),
          getStatusLabel(appointment.status),
          appointment.booking_source || '',
        ].join(',');
      }),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `appointments-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Only show full page loading on initial load
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <PageHeaderSkeleton />

        {/* Stats Cards Skeleton */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card index={0} disableHoverLift={true}>
            <CardContent className="pt-6">
              <StatCardSkeleton />
            </CardContent>
          </Card>
          <Card index={1} disableHoverLift={true}>
            <CardContent className="pt-6">
              <StatCardSkeleton />
            </CardContent>
          </Card>
          <Card index={2} disableHoverLift={true}>
            <CardContent className="pt-6">
              <StatCardSkeleton />
            </CardContent>
          </Card>
          <Card index={3} disableHoverLift={true}>
            <CardContent className="pt-6">
              <StatCardSkeleton />
            </CardContent>
          </Card>
        </div>

        {/* Data Table Skeleton */}
        <Card index={4} disableHoverLift={true}>
          <CardHeader>
            <CardTitle>Appointments List</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTableSkeleton />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-midnight-blue text-3xl font-semibold">Appointments</h1>
          <p className="mt-2 text-gray-600">
            View and manage appointments from web and mobile bookings
          </p>
        </div>
        <Button>
          <CalendarPlus className="mr-2 h-4 w-4 text-white" />
          Book Appointment
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card index={0}>
          <CardHeader className="pb-3">
            <CardDescription>Total Today</CardDescription>
            <CardTitle className="text-3xl">{stats.total_today}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-600">Scheduled for today</p>
          </CardContent>
        </Card>

        <Card index={1}>
          <CardHeader className="pb-3">
            <CardDescription>Confirmed</CardDescription>
            <CardTitle className="text-3xl text-green-600">{stats.confirmed}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-600">Ready for visit</p>
          </CardContent>
        </Card>

        <Card index={2}>
          <CardHeader className="pb-3">
            <CardDescription>Pending</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{stats.pending}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-600">Awaiting confirmation</p>
          </CardContent>
        </Card>

        <Card index={3}>
          <CardHeader className="pb-3">
            <CardDescription>Completed</CardDescription>
            <CardTitle className="text-3xl text-gray-600">{stats.completed}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-600">Finished appointments</p>
          </CardContent>
        </Card>
      </div>

      {/* Appointments DataTable */}
      <Card index={4} disableHoverLift={true}>
        <CardHeader>
          <CardTitle>Appointments List</CardTitle>
          <CardDescription>{appointments.length} appointments found</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={appointments}
            onTableInstanceChange={setTable}
            toolbar={(table) => (
              <DataTableToolbar
                table={table}
                searchKey="patient"
                searchPlaceholder="Search by patient name..."
                filterComponents={
                  <>
                    <DataTableFacetedFilter
                      column={table.getColumn('status')}
                      title="Status"
                      options={[
                        { label: 'Scheduled', value: 'scheduled' },
                        { label: 'Confirmed', value: 'confirmed' },
                        { label: 'Checked In', value: 'checked_in' },
                        { label: 'In Progress', value: 'in_progress' },
                        { label: 'Completed', value: 'completed' },
                        { label: 'Cancelled', value: 'cancelled' },
                        { label: 'No Show', value: 'no_show' },
                      ]}
                    />
                    <DataTableFacetedFilter
                      column={table.getColumn('booking_source')}
                      title="Source"
                      options={[
                        { label: 'Mobile App', value: 'mobile' },
                        { label: 'Web Portal', value: 'web' },
                        { label: 'Phone', value: 'phone' },
                        { label: 'Walk-in', value: 'walk_in' },
                      ]}
                    />
                    <DataTableFacetedFilter
                      column={table.getColumn('appointment_type')}
                      title="Type"
                      options={[
                        { label: 'Consultation', value: 'consultation' },
                        { label: 'Follow Up', value: 'follow_up' },
                        { label: 'Procedure', value: 'procedure' },
                        { label: 'Emergency', value: 'emergency' },
                        { label: 'Screening', value: 'screening' },
                      ]}
                    />
                  </>
                }
                bulkActions={
                  <>
                    <Button size="sm" variant="outline" onClick={handleBulkConfirm}>
                      <CheckCircle className="mr-2 h-4 w-4" strokeWidth={1.5} />
                      Bulk Confirm
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleBulkCheckIn}>
                      <User className="mr-2 h-4 w-4" strokeWidth={1.5} />
                      Bulk Check In
                    </Button>
                  </>
                }
                onExport={handleExport}
              />
            )}
            pagination={(table) => <DataTablePagination table={table} />}
          />
        </CardContent>
      </Card>

      {/* Appointment Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Appointment Details</span>
              {selectedAppointment && (
                <Badge className={getStatusColor(selectedAppointment.status)}>
                  {getStatusLabel(selectedAppointment.status)}
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>Complete information about this appointment</DialogDescription>
          </DialogHeader>

          {isLoadingDetail ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="text-heart-red mx-auto mb-4 h-8 w-8 animate-spin" />
                <p className="text-gray-600">Loading appointment details...</p>
              </div>
            </div>
          ) : selectedAppointment ? (
            <div className="space-y-6">
              {/* Patient Information */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <User className="text-heart-red h-5 w-5" />
                  Patient Information
                </h3>
                <div className="grid gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Full Name</label>
                    <p className="mt-1 text-base font-semibold text-gray-900">
                      {selectedAppointment.patient_first_name}{' '}
                      {selectedAppointment.patient_last_name}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="mt-1 flex items-center gap-2 text-base text-gray-900">
                      <Phone className="h-4 w-4 text-gray-400" />
                      {selectedAppointment.patient_phone}
                    </p>
                  </div>
                  {selectedAppointment.patient_email && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="mt-1 flex items-center gap-2 text-base text-gray-900">
                        <Mail className="h-4 w-4 text-gray-400" />
                        {selectedAppointment.patient_email}
                      </p>
                    </div>
                  )}
                  {selectedAppointment.patient_date_of_birth && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                      <p className="mt-1 text-base text-gray-900">
                        {formatDate(selectedAppointment.patient_date_of_birth)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Appointment Information */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <Calendar className="text-heart-red h-5 w-5" />
                  Appointment Information
                </h3>
                <div className="grid gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date & Time</label>
                    <p className="mt-1 text-base font-semibold text-gray-900">
                      {formatDate(selectedAppointment.appointment_datetime)}
                    </p>
                    <p className="text-base text-gray-700">
                      {formatTime(selectedAppointment.appointment_datetime)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Duration</label>
                    <p className="mt-1 flex items-center gap-2 text-base text-gray-900">
                      <Clock className="h-4 w-4 text-gray-400" />
                      {selectedAppointment.duration_minutes} minutes
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Type</label>
                    <p className="mt-1">
                      <Badge className={getTypeColor(selectedAppointment.appointment_type)}>
                        {formatAppointmentType(selectedAppointment.appointment_type)}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Booking Source</label>
                    <p className="mt-1">
                      {selectedAppointment.booking_source === 'mobile' && (
                        <Badge variant="outline" className="gap-1">
                          <Smartphone className="h-3 w-3" />
                          Mobile App
                        </Badge>
                      )}
                      {selectedAppointment.booking_source === 'web' && (
                        <Badge variant="outline" className="gap-1">
                          <Globe className="h-3 w-3" />
                          Web Portal
                        </Badge>
                      )}
                      {selectedAppointment.booking_source === 'phone' && (
                        <Badge variant="outline" className="gap-1">
                          <Phone className="h-3 w-3" />
                          Phone
                        </Badge>
                      )}
                      {!selectedAppointment.booking_source && (
                        <span className="text-sm text-gray-400">Not specified</span>
                      )}
                    </p>
                  </div>
                  {selectedAppointment.department && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Department</label>
                      <p className="mt-1 text-base text-gray-900">
                        {selectedAppointment.department}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Facility & Doctor Information */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <Building2 className="text-heart-red h-5 w-5" />
                  Facility & Provider
                </h3>
                <div className="grid gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Healthcare Facility</label>
                    {selectedAppointment.facility ? (
                      <div className="mt-1">
                        <p className="text-base font-semibold text-gray-900">
                          {selectedAppointment.facility.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {selectedAppointment.facility.address}
                        </p>
                        <p className="text-sm text-gray-600">
                          {selectedAppointment.facility.city},{' '}
                          {selectedAppointment.facility.province}
                        </p>
                        <Badge variant="secondary" className="mt-1">
                          {selectedAppointment.facility.type}
                        </Badge>
                      </div>
                    ) : (
                      <p className="mt-1 text-sm text-gray-400">Not assigned</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Doctor</label>
                    {selectedAppointment.doctor ? (
                      <div className="mt-1">
                        <p className="flex items-center gap-2 text-base font-semibold text-gray-900">
                          <Stethoscope className="h-4 w-4 text-gray-400" />
                          Dr. {selectedAppointment.doctor.first_name}{' '}
                          {selectedAppointment.doctor.last_name}
                        </p>
                        {selectedAppointment.doctor.specialization && (
                          <p className="text-sm text-gray-600">
                            {selectedAppointment.doctor.specialization}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="mt-1 text-sm text-gray-400">Not assigned</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Reason & Requirements */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <FileText className="text-heart-red h-5 w-5" />
                  Visit Details
                </h3>
                <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Reason for Visit</label>
                    <p className="mt-1 text-base text-gray-900">
                      {selectedAppointment.reason_for_visit}
                    </p>
                  </div>
                  {selectedAppointment.special_requirements && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Special Requirements
                      </label>
                      <p className="mt-1 text-base text-gray-900">
                        {selectedAppointment.special_requirements}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Information */}
              {(selectedAppointment.is_confirmed ||
                selectedAppointment.checked_in_at ||
                selectedAppointment.completed_at ||
                selectedAppointment.cancelled_at) && (
                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
                    <CheckCircle className="text-heart-red h-5 w-5" />
                    Status History
                  </h3>
                  <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-4">
                    {selectedAppointment.is_confirmed && selectedAppointment.confirmed_at && (
                      <div className="flex items-center gap-3 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <div>
                          <span className="font-medium text-gray-900">Confirmed</span>
                          <span className="text-gray-600">
                            {' '}
                            on {formatDate(selectedAppointment.confirmed_at)} at{' '}
                            {formatTime(selectedAppointment.confirmed_at)}
                          </span>
                          {selectedAppointment.confirmation_method && (
                            <span className="text-gray-500">
                              {' '}
                              via {selectedAppointment.confirmation_method}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    {selectedAppointment.checked_in_at && (
                      <div className="flex items-center gap-3 text-sm">
                        <CheckCircle className="h-4 w-4 text-purple-600" />
                        <div>
                          <span className="font-medium text-gray-900">Checked In</span>
                          <span className="text-gray-600">
                            {' '}
                            on {formatDate(selectedAppointment.checked_in_at)} at{' '}
                            {formatTime(selectedAppointment.checked_in_at)}
                          </span>
                        </div>
                      </div>
                    )}
                    {selectedAppointment.completed_at && (
                      <div className="flex items-center gap-3 text-sm">
                        <CheckCircle className="h-4 w-4 text-gray-600" />
                        <div>
                          <span className="font-medium text-gray-900">Completed</span>
                          <span className="text-gray-600">
                            {' '}
                            on {formatDate(selectedAppointment.completed_at)} at{' '}
                            {formatTime(selectedAppointment.completed_at)}
                          </span>
                        </div>
                      </div>
                    )}
                    {selectedAppointment.cancelled_at && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-3 text-sm">
                          <X className="h-4 w-4 text-red-600" />
                          <div>
                            <span className="font-medium text-gray-900">Cancelled</span>
                            <span className="text-gray-600">
                              {' '}
                              on {formatDate(selectedAppointment.cancelled_at)} at{' '}
                              {formatTime(selectedAppointment.cancelled_at)}
                            </span>
                          </div>
                        </div>
                        {selectedAppointment.cancellation_reason && (
                          <p className="ml-7 text-sm text-gray-600">
                            Reason: {selectedAppointment.cancellation_reason}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Visit Summary (for completed appointments) */}
              {(selectedAppointment.visit_summary || selectedAppointment.next_steps) && (
                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
                    <FileText className="text-heart-red h-5 w-5" />
                    Visit Summary
                  </h3>
                  <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                    {selectedAppointment.visit_summary && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Summary</label>
                        <p className="mt-1 text-base text-gray-900">
                          {selectedAppointment.visit_summary}
                        </p>
                      </div>
                    )}
                    {selectedAppointment.next_steps && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Next Steps</label>
                        <p className="mt-1 text-base text-gray-900">
                          {selectedAppointment.next_steps}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Related Records */}
              {(selectedAppointment.assessment || selectedAppointment.referral) && (
                <div>
                  <h3 className="mb-3 text-lg font-semibold text-gray-900">Related Records</h3>
                  <div className="grid gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 md:grid-cols-2">
                    {selectedAppointment.assessment && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Assessment</label>
                        <p className="mt-1 text-base text-gray-900">
                          #{selectedAppointment.assessment.assessment_external_id}
                        </p>
                        <Badge className="mt-1" variant="secondary">
                          {selectedAppointment.assessment.final_risk_level}
                        </Badge>
                      </div>
                    )}
                    {selectedAppointment.referral && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Referral</label>
                        <p className="mt-1 text-base text-gray-900">
                          #{selectedAppointment.referral.referral_number}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="border-t border-gray-200 pt-4">
                <div className="grid gap-2 text-xs text-gray-500 md:grid-cols-2">
                  <div>
                    <span className="font-medium">Created:</span>{' '}
                    {formatDate(selectedAppointment.created_at)} at{' '}
                    {formatTime(selectedAppointment.created_at)}
                  </div>
                  <div>
                    <span className="font-medium">Last Updated:</span>{' '}
                    {formatDate(selectedAppointment.updated_at)} at{' '}
                    {formatTime(selectedAppointment.updated_at)}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
