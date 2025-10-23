<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Services\AppointmentService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class AppointmentController extends Controller
{
    protected AppointmentService $appointmentService;

    public function __construct(AppointmentService $appointmentService)
    {
        $this->appointmentService = $appointmentService;
    }

    /**
     * Get list of appointments with filters.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Appointment::with(['facility', 'doctor', 'referral']);

            // Apply filters
            if ($request->has('facility_id')) {
                $query->where('facility_id', $request->facility_id);
            }

            if ($request->has('doctor_id')) {
                $query->where('doctor_id', $request->doctor_id);
            }

            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            if ($request->has('date_from') && $request->has('date_to')) {
                $query->betweenDates(
                    Carbon::parse($request->date_from),
                    Carbon::parse($request->date_to)
                );
            }

            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('patient_first_name', 'like', "%{$search}%")
                      ->orWhere('patient_last_name', 'like', "%{$search}%")
                      ->orWhere('patient_phone', 'like', "%{$search}%");
                });
            }

            // Sort
            $sortBy = $request->get('sort_by', 'appointment_datetime');
            $sortOrder = $request->get('sort_order', 'asc');
            $query->orderBy($sortBy, $sortOrder);

            // Paginate
            $perPage = $request->get('per_page', 20);
            $appointments = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $appointments,
                'timestamp' => now()->toISOString(),
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching appointments', ['error' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch appointments',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get single appointment by ID.
     */
    public function show(int $id): JsonResponse
    {
        try {
            $appointment = Appointment::with([
                'facility',
                'doctor',
                'referral',
                'bookedBy',
                'cancelledBy',
                'notes.user',
                'reminders',
            ])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $appointment,
                'timestamp' => now()->toISOString(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Appointment not found',
                'error' => $e->getMessage(),
            ], 404);
        }
    }

    /**
     * Check availability for a specific time slot.
     */
    public function checkAvailability(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'facility_id' => 'required|exists:healthcare_facilities,id',
            'doctor_id' => 'required|exists:users,id',
            'appointment_datetime' => 'required|date',
            'duration_minutes' => 'integer|min:15|max:120',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $availability = $this->appointmentService->checkAvailability(
                $request->facility_id,
                $request->doctor_id,
                Carbon::parse($request->appointment_datetime),
                $request->get('duration_minutes', 30)
            );

            return response()->json([
                'success' => true,
                'data' => $availability,
                'timestamp' => now()->toISOString(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error checking availability',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get available time slots for a specific date.
     */
    public function getAvailableSlots(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'facility_id' => 'required|exists:healthcare_facilities,id',
            'doctor_id' => 'required|exists:users,id',
            'date' => 'required|date',
            'slot_duration' => 'integer|min:15|max:120',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $slots = $this->appointmentService->getAvailableSlots(
                $request->facility_id,
                $request->doctor_id,
                Carbon::parse($request->date),
                $request->get('slot_duration', 30)
            );

            return response()->json([
                'success' => true,
                'data' => [
                    'date' => $request->date,
                    'slots' => $slots,
                    'total_slots' => count($slots),
                    'available_slots' => count(array_filter($slots, fn($slot) => $slot['available'])),
                ],
                'timestamp' => now()->toISOString(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching available slots',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Book a new appointment.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'patient_first_name' => 'required|string|max:255',
            'patient_last_name' => 'required|string|max:255',
            'patient_phone' => 'required|string|max:20',
            'patient_email' => 'nullable|email|max:255',
            'facility_id' => 'required|exists:healthcare_facilities,id',
            'doctor_id' => 'required|exists:users,id',
            'appointment_datetime' => 'required|date|after:now',
            'duration_minutes' => 'integer|min:15|max:120',
            'appointment_type' => 'required|in:consultation,follow_up,procedure,emergency,telemedicine,screening,other',
            'reason_for_visit' => 'required|string|max:1000',
            'special_requirements' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $appointment = $this->appointmentService->bookAppointment([
                ...$request->all(),
                'booked_by' => auth()->id(),
                'booking_source' => 'web',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Appointment booked successfully',
                'data' => $appointment->load(['facility', 'doctor']),
                'timestamp' => now()->toISOString(),
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error booking appointment', ['error' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to book appointment',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Reschedule an appointment.
     */
    public function reschedule(Request $request, int $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'new_datetime' => 'required|date|after:now',
            'reason' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $appointment = Appointment::findOrFail($id);
            $newAppointment = $this->appointmentService->rescheduleAppointment(
                $appointment,
                Carbon::parse($request->new_datetime),
                $request->reason
            );

            return response()->json([
                'success' => true,
                'message' => 'Appointment rescheduled successfully',
                'data' => $newAppointment->load(['facility', 'doctor']),
                'timestamp' => now()->toISOString(),
            ]);
        } catch (\Exception $e) {
            Log::error('Error rescheduling appointment', ['error' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to reschedule appointment',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Cancel an appointment.
     */
    public function cancel(Request $request, int $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'reason' => 'required|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $appointment = Appointment::findOrFail($id);
            $this->appointmentService->cancelAppointment(
                $appointment,
                auth()->id(),
                $request->reason
            );

            return response()->json([
                'success' => true,
                'message' => 'Appointment cancelled successfully',
                'data' => $appointment->fresh(),
                'timestamp' => now()->toISOString(),
            ]);
        } catch (\Exception $e) {
            Log::error('Error cancelling appointment', ['error' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to cancel appointment',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Confirm an appointment.
     */
    public function confirm(int $id): JsonResponse
    {
        try {
            $appointment = Appointment::findOrFail($id);
            $this->appointmentService->confirmAppointment($appointment, 'web');

            return response()->json([
                'success' => true,
                'message' => 'Appointment confirmed successfully',
                'data' => $appointment->fresh(),
                'timestamp' => now()->toISOString(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to confirm appointment',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Check in a patient.
     */
    public function checkIn(int $id): JsonResponse
    {
        try {
            $appointment = Appointment::findOrFail($id);
            $this->appointmentService->checkInPatient($appointment, auth()->id());

            return response()->json([
                'success' => true,
                'message' => 'Patient checked in successfully',
                'data' => $appointment->fresh(),
                'timestamp' => now()->toISOString(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to check in patient',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Complete an appointment.
     */
    public function complete(Request $request, int $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'visit_summary' => 'nullable|string|max:2000',
            'next_steps' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $appointment = Appointment::findOrFail($id);
            $this->appointmentService->completeAppointment($appointment, $request->all());

            return response()->json([
                'success' => true,
                'message' => 'Appointment completed successfully',
                'data' => $appointment->fresh(),
                'timestamp' => now()->toISOString(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to complete appointment',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Add patient to waiting list.
     */
    public function addToWaitingList(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'patient_first_name' => 'required|string|max:255',
            'patient_last_name' => 'required|string|max:255',
            'patient_phone' => 'required|string|max:20',
            'patient_email' => 'nullable|email|max:255',
            'facility_id' => 'required|exists:healthcare_facilities,id',
            'reason_for_visit' => 'required|string|max:1000',
            'priority' => 'in:Low,Medium,High,Urgent',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $entry = $this->appointmentService->addToWaitingList($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Added to waiting list successfully',
                'data' => $entry,
                'timestamp' => now()->toISOString(),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to add to waiting list',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
