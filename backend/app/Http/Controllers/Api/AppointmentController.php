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
        // 🔧 FIX: Check for duplicate mobile_appointment_id first (idempotency)
        if ($request->has('mobile_appointment_id') && !empty($request->mobile_appointment_id)) {
            $existingAppointment = Appointment::where('mobile_appointment_id', $request->mobile_appointment_id)
                                              ->with(['facility', 'doctor', 'assessment'])
                                              ->first();

            if ($existingAppointment) {
                Log::info("✅ Idempotent sync: Appointment already exists", [
                    'mobile_appointment_id' => $request->mobile_appointment_id,
                    'backend_id' => $existingAppointment->id,
                ]);

                // Return existing appointment with 200 OK (not 422)
                return response()->json([
                    'success' => true,
                    'message' => 'Appointment already exists (idempotent sync)',
                    'data' => $existingAppointment,
                    'already_exists' => true,
                    'timestamp' => now()->toISOString(),
                ], 200);
            }
        }

        // 🔧 FIX: Determine if this is a mobile booking for offline-first sync
        $isMobileBooking = $request->get('booking_source') === 'mobile' ||
                          $request->has('mobile_appointment_id');

        $validator = Validator::make($request->all(), [
            // Mobile app tracking - removed 'unique' rule since we handle it above
            'mobile_appointment_id' => 'nullable|string',

            // Patient information
            'patient_first_name' => 'required|string|max:255',
            'patient_last_name' => 'required|string|max:255',
            'patient_phone' => 'required|string|max:20',
            'patient_email' => 'nullable|email|max:255',

            // Facility and doctor (allow name-based lookup for mobile app)
            'facility_id' => 'nullable|exists:healthcare_facilities,id',
            'facility_name' => 'nullable|string|max:255',
            'doctor_id' => 'nullable|exists:users,id',
            'doctor_name' => 'nullable|string|max:255',

            // Appointment details
            // 🔧 FIX: Allow past dates for mobile bookings (offline-first sync)
            // Mobile apps create appointments offline, may sync hours/days later
            'appointment_datetime' => $isMobileBooking
                ? 'required|date'  // Mobile: Allow any date (offline sync scenario)
                : 'required|date|after:now',  // Web/phone: Must be future
            'duration_minutes' => 'integer|min:15|max:120',
            'appointment_type' => 'required|in:consultation,follow_up,procedure,emergency,telemedicine,screening,other',
            'reason_for_visit' => 'required|string|max:1000',
            'special_requirements' => 'nullable|string|max:500',

            // Assessment integration
            'assessment_id' => 'nullable|exists:assessments,id',
            'assessment_external_id' => 'nullable|string',

            // Booking source
            'booking_source' => 'nullable|in:web,mobile,phone,walk_in',

            // Mobile app timestamps
            'mobile_created_at' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $data = $request->all();

            // Resolve facility by name if ID not provided (mobile app compatibility)
            if (!isset($data['facility_id']) && isset($data['facility_name'])) {
                // Try exact match first
                $facility = \App\Models\HealthcareFacility::where('name', $data['facility_name'])->first();

                // Try fuzzy match if exact match fails
                if (!$facility) {
                    $facility = \App\Models\HealthcareFacility::where('name', 'LIKE', '%' . $data['facility_name'] . '%')
                        ->first();
                }

                if ($facility) {
                    $data['facility_id'] = $facility->id;
                    Log::info("Facility mapped: {$data['facility_name']} -> ID {$facility->id}");
                } else {
                    // Create placeholder facility for unmapped mobile facilities
                    // Determine facility type based on name keywords
                    $facilityType = 'Primary Care Clinic'; // Default
                    $nameLower = strtolower($data['facility_name']);

                    if (str_contains($nameLower, 'barangay')) {
                        $facilityType = 'Barangay Health Center';
                    } elseif (str_contains($nameLower, 'rural')) {
                        $facilityType = 'Rural Health Unit';
                    } elseif (str_contains($nameLower, 'district')) {
                        $facilityType = 'District Hospital';
                    } elseif (str_contains($nameLower, 'provincial')) {
                        $facilityType = 'Provincial Hospital';
                    } elseif (str_contains($nameLower, 'regional')) {
                        $facilityType = 'Regional Hospital';
                    } elseif (str_contains($nameLower, 'medical center') || str_contains($nameLower, 'medical centre')) {
                        $facilityType = 'Medical Center';
                    } elseif (str_contains($nameLower, 'specialty') || str_contains($nameLower, 'speciality')) {
                        $facilityType = 'Specialty Center';
                    } elseif (str_contains($nameLower, 'emergency')) {
                        $facilityType = 'Emergency Facility';
                    } elseif (str_contains($nameLower, 'hospital') || str_contains($nameLower, 'clinic')) {
                        $facilityType = 'Tertiary Hospital';
                    }

                    $facility = \App\Models\HealthcareFacility::create([
                        'name' => $data['facility_name'],
                        'type' => $facilityType,
                        'region' => 'Unknown',
                        'city' => 'To be verified',
                        'province' => 'To be verified',
                        'address' => 'To be verified',
                        'latitude' => 0.0,
                        'longitude' => 0.0,
                        'is_verified' => false,
                        'created_from_mobile' => true,
                        'is_active' => true,
                        'accepts_referrals' => false,
                    ]);

                    $data['facility_id'] = $facility->id;
                    Log::warning("Created placeholder facility: {$data['facility_name']} (ID {$facility->id}, Type: {$facilityType})");
                }
            }

            // Resolve assessment by external ID if assessment_id not provided
            if (!isset($data['assessment_id']) && isset($data['assessment_external_id'])) {
                $assessment = \App\Models\Assessment::where('assessment_external_id', $data['assessment_external_id'])->first();
                if ($assessment) {
                    $data['assessment_id'] = $assessment->id;
                }
            }

            // Set booking source
            $data['booking_source'] = $request->get('booking_source', auth()->check() ? 'web' : 'mobile');

            // Set booked_by if authenticated
            if (auth()->check()) {
                $data['booked_by'] = auth()->id();
            }

            $appointment = $this->appointmentService->bookAppointment($data);

            return response()->json([
                'success' => true,
                'message' => 'Appointment booked successfully',
                'data' => $appointment->load(['facility', 'doctor', 'assessment']),
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
        // 🔧 FIX: Allow past dates for mobile bookings (offline-first sync)
        $isMobileBooking = $request->get('booking_source') === 'mobile' ||
                          $request->has('mobile_appointment_id');

        $validator = Validator::make($request->all(), [
            'new_datetime' => $isMobileBooking
                ? 'required|date'  // Mobile: Allow any date
                : 'required|date|after:now',  // Web: Must be future
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
