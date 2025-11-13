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

            if ($request->has('booking_source')) {
                $query->where('booking_source', $request->booking_source);
            }

            if ($request->has('appointment_type')) {
                $query->where('appointment_type', $request->appointment_type);
            }

            if ($request->has('date_from') && $request->has('date_to')) {
                $query->betweenDates(
                    Carbon::parse($request->date_from),
                    Carbon::parse($request->date_to)
                );
            }

            if ($request->has('search') && !empty($request->search)) {
                $search = trim($request->search);

                // Split search term into individual words for better matching
                $searchTerms = array_filter(explode(' ', $search));

                $query->where(function ($q) use ($search, $searchTerms) {
                    // First priority: Match full phrase in concatenated name
                    $q->whereRaw("CONCAT(IFNULL(patient_first_name, ''), ' ', IFNULL(patient_last_name, '')) LIKE ?", ["%{$search}%"])
                      ->orWhereRaw("CONCAT(IFNULL(patient_last_name, ''), ' ', IFNULL(patient_first_name, '')) LIKE ?", ["%{$search}%"]);

                    // Second priority: Match in single fields
                    $q->orWhere('patient_email', 'like', "%{$search}%")
                      ->orWhere('patient_phone', 'like', "%{$search}%")
                      ->orWhere('appointment_type', 'like', "%{$search}%")
                      ->orWhere('status', 'like', "%{$search}%")
                      ->orWhere('booking_source', 'like', "%{$search}%")
                      ->orWhere('reason_for_visit', 'like', "%{$search}%")
                      // Search in formatted date/time
                      ->orWhereRaw("DATE_FORMAT(appointment_datetime, '%Y-%m-%d') LIKE ?", ["%{$search}%"])
                      ->orWhereRaw("DATE_FORMAT(appointment_datetime, '%M %d, %Y') LIKE ?", ["%{$search}%"])
                      ->orWhereRaw("DATE_FORMAT(appointment_datetime, '%W, %M %d') LIKE ?", ["%{$search}%"])
                      ->orWhereRaw("DATE_FORMAT(appointment_datetime, '%h:%i %p') LIKE ?", ["%{$search}%"]);

                    // Search in facility name
                    $q->orWhereHas('facility', function ($fq) use ($search) {
                        $fq->where('name', 'like', "%{$search}%")
                           ->orWhere('city', 'like', "%{$search}%");
                    });

                    // If multiple words, also check if ALL words appear in the appointment
                    if (count($searchTerms) > 1) {
                        $q->orWhere(function ($subQuery) use ($searchTerms) {
                            foreach ($searchTerms as $term) {
                                $subQuery->where(function ($termQuery) use ($term) {
                                    $termQuery->where('patient_first_name', 'like', "%{$term}%")
                                              ->orWhere('patient_last_name', 'like', "%{$term}%")
                                              ->orWhere('patient_email', 'like', "%{$term}%")
                                              ->orWhere('patient_phone', 'like', "%{$term}%")
                                              ->orWhere('appointment_type', 'like', "%{$term}%")
                                              ->orWhere('status', 'like', "%{$term}%")
                                              ->orWhere('booking_source', 'like', "%{$term}%")
                                              ->orWhere('reason_for_visit', 'like', "%{$term}%")
                                              ->orWhereHas('facility', function ($fq) use ($term) {
                                                  $fq->where('name', 'like', "%{$term}%")
                                                     ->orWhere('city', 'like', "%{$term}%");
                                              });
                                });
                            }
                        });
                    }
                    // For single word searches, be more flexible
                    else if (count($searchTerms) == 1) {
                        $term = $searchTerms[0];
                        $q->orWhere('patient_first_name', 'like', "%{$term}%")
                          ->orWhere('patient_last_name', 'like', "%{$term}%");
                    }
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
     * Get appointment statistics.
     */
    public function statistics(Request $request): JsonResponse
    {
        try {
            // Get date range for today
            $today = now()->startOfDay();
            $tomorrow = now()->endOfDay();

            // Get counts
            $totalToday = Appointment::whereBetween('appointment_datetime', [$today, $tomorrow])->count();
            $confirmed = Appointment::where('status', 'confirmed')
                ->whereBetween('appointment_datetime', [$today, $tomorrow])
                ->count();
            $pending = Appointment::whereIn('status', ['scheduled', 'rescheduled'])
                ->whereBetween('appointment_datetime', [$today, $tomorrow])
                ->count();
            $completed = Appointment::where('status', 'completed')
                ->whereBetween('appointment_datetime', [$today, $tomorrow])
                ->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'total_today' => $totalToday,
                    'confirmed' => $confirmed,
                    'pending' => $pending,
                    'completed' => $completed,
                ],
                'timestamp' => now()->toISOString(),
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching appointment statistics', ['error' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch appointment statistics',
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

            // Generate confirmation token for email/SMS confirmation
            $confirmationToken = bin2hex(random_bytes(32)); // 64 character hex string
            $tokenExpiresAt = now()->addHours(24); // Token expires in 24 hours

            $appointment->update([
                'confirmation_token' => $confirmationToken,
                'token_expires_at' => $tokenExpiresAt,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Appointment booked successfully',
                'data' => $appointment->load(['facility', 'doctor', 'assessment']),
                'confirmation_token' => $confirmationToken,
                'confirmation_url' => config('app.url') . '/api/v1/appointments/confirm-public?token=' . $confirmationToken,
                'token_expires_at' => $tokenExpiresAt,
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
            // TEMPORARY: Default to admin user (ID 1) when no auth
            $this->appointmentService->cancelAppointment(
                $appointment,
                auth()->id() ?? 1,
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
            // TEMPORARY: Default to admin user (ID 1) when no auth
            $this->appointmentService->checkInPatient($appointment, auth()->id() ?? 1);

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

    /**
     * Public appointment confirmation using token
     * No authentication required - uses secure token
     *
     * POST /api/v1/appointments/confirm-public
     */
    public function confirmPublic(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'token' => 'required|string|size:64',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid token format',
                    'errors' => $validator->errors(),
                    'timestamp' => now()->toIso8601String(),
                ], 422);
            }

            // Find appointment by confirmation token
            $appointment = Appointment::where('confirmation_token', $request->token)->first();

            if (!$appointment) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid or expired confirmation token',
                    'timestamp' => now()->toIso8601String(),
                ], 404);
            }

            // Check if token has expired (24 hours from creation)
            if ($appointment->token_expires_at && now()->isAfter($appointment->token_expires_at)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Confirmation token has expired. Please contact the facility to reschedule.',
                    'timestamp' => now()->toIso8601String(),
                ], 410); // 410 Gone
            }

            // Check if already confirmed
            if ($appointment->is_confirmed) {
                return response()->json([
                    'success' => true,
                    'message' => 'Appointment is already confirmed',
                    'data' => [
                        'id' => $appointment->id,
                        'appointment_datetime' => $appointment->appointment_datetime,
                        'facility_name' => $appointment->facility->name ?? 'Unknown',
                        'status' => $appointment->status,
                        'confirmed_at' => $appointment->confirmed_at,
                    ],
                    'timestamp' => now()->toIso8601String(),
                ], 200);
            }

            // Confirm the appointment
            $appointment->update([
                'is_confirmed' => true,
                'confirmed_at' => now(),
                'confirmation_method' => 'token',
                'status' => 'confirmed',
                'confirmation_token' => null, // Invalidate token after use
                'token_expires_at' => null,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Appointment confirmed successfully',
                'data' => [
                    'id' => $appointment->id,
                    'appointment_datetime' => $appointment->appointment_datetime,
                    'facility_name' => $appointment->facility->name ?? 'Unknown',
                    'facility_address' => $appointment->facility->address ?? null,
                    'facility_phone' => $appointment->facility->phone_number ?? null,
                    'patient_name' => "{$appointment->patient_first_name} {$appointment->patient_last_name}",
                    'appointment_type' => $appointment->appointment_type,
                    'status' => $appointment->status,
                    'confirmed_at' => $appointment->confirmed_at,
                ],
                'timestamp' => now()->toIso8601String(),
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error confirming appointment', ['error' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to confirm appointment',
                'error' => $e->getMessage(),
                'timestamp' => now()->toIso8601String(),
            ], 500);
        }
    }
}
