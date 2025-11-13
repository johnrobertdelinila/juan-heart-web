<?php

namespace App\Http\Controllers\Api\Mobile;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class MobileAppointmentController extends Controller
{
    /**
     * Get appointments for mobile user
     * Lightweight payload optimized for mobile apps
     *
     * GET /api/v1/mobile/appointments?mobile_user_id={id}
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'mobile_user_id' => 'required|string',
                'status' => 'nullable|string|in:pending,confirmed,completed,cancelled',
                'from_date' => 'nullable|date',
                'to_date' => 'nullable|date',
                'per_page' => 'nullable|integer|min:1|max:100',
            ]);

            $query = Appointment::query()
                ->whereNotNull('mobile_appointment_id'); // Only mobile appointments

            // Filter by mobile_user_id (search in names, phone, or email)
            if (!empty($validated['mobile_user_id'])) {
                $query->where(function($q) use ($validated) {
                    $q->where('patient_first_name', 'like', '%' . $validated['mobile_user_id'] . '%')
                      ->orWhere('patient_last_name', 'like', '%' . $validated['mobile_user_id'] . '%')
                      ->orWhere('patient_phone', 'like', '%' . $validated['mobile_user_id'] . '%')
                      ->orWhere('patient_email', 'like', '%' . $validated['mobile_user_id'] . '%');
                });
            }

            // Filter by status
            if (!empty($validated['status'])) {
                $query->where('status', $validated['status']);
            }

            // Filter by date range
            if (!empty($validated['from_date'])) {
                $query->where('appointment_datetime', '>=', $validated['from_date']);
            }
            if (!empty($validated['to_date'])) {
                $query->where('appointment_datetime', '<=', $validated['to_date']);
            }

            // Get results with pagination
            $perPage = $validated['per_page'] ?? 20;
            $appointments = $query
                ->with('facility')
                ->orderBy('appointment_datetime', 'desc')
                ->paginate($perPage);

            // Transform to lightweight mobile format
            $data = $appointments->map(function ($appointment) {
                return [
                    'id' => $appointment->id,
                    'mobile_appointment_id' => $appointment->mobile_appointment_id,
                    'appointment_datetime' => $appointment->appointment_datetime,
                    'status' => $appointment->status,
                    'facility_name' => $appointment->facility->name ?? 'Unknown Facility',
                    'facility_address' => $appointment->facility->address ?? null,
                    'facility_phone' => $appointment->facility->phone_number ?? null,
                    'doctor_name' => $appointment->doctor_id ? ('Dr. ' . $appointment->doctor_id) : 'TBA',
                    'appointment_type' => $appointment->appointment_type,
                    'reason_for_visit' => $appointment->reason_for_visit,
                    'department' => $appointment->department,
                    'patient_first_name' => $appointment->patient_first_name,
                    'patient_last_name' => $appointment->patient_last_name,
                    'patient_phone' => $appointment->patient_phone,
                    'patient_email' => $appointment->patient_email,
                    'is_confirmed' => $appointment->is_confirmed,
                    'confirmed_at' => $appointment->confirmed_at,
                    'cancellation_reason' => $appointment->cancellation_reason,
                    'cancellation_notes' => $appointment->cancellation_notes,
                    'created_at' => $appointment->created_at,
                    'updated_at' => $appointment->updated_at,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $data,
                'pagination' => [
                    'total' => $appointments->total(),
                    'per_page' => $appointments->perPage(),
                    'current_page' => $appointments->currentPage(),
                    'last_page' => $appointments->lastPage(),
                    'from' => $appointments->firstItem(),
                    'to' => $appointments->lastItem(),
                ],
                'timestamp' => now()->toIso8601String(),
            ], 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
                'timestamp' => now()->toIso8601String(),
            ], 422);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch appointments',
                'error' => $e->getMessage(),
                'timestamp' => now()->toIso8601String(),
            ], 500);
        }
    }

    /**
     * Get appointment statistics for mobile user
     *
     * GET /api/v1/mobile/appointments/stats?mobile_user_id={id}
     */
    public function statistics(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'mobile_user_id' => 'required|string',
            ]);

            $query = Appointment::query()
                ->whereNotNull('mobile_appointment_id')
                ->where(function($q) use ($validated) {
                    $q->where('patient_first_name', 'like', '%' . $validated['mobile_user_id'] . '%')
                      ->orWhere('patient_last_name', 'like', '%' . $validated['mobile_user_id'] . '%')
                      ->orWhere('patient_phone', 'like', '%' . $validated['mobile_user_id'] . '%')
                      ->orWhere('patient_email', 'like', '%' . $validated['mobile_user_id'] . '%');
                });

            $total = $query->count();
            $pending = (clone $query)->where('status', 'pending')->count();
            $confirmed = (clone $query)->where('status', 'confirmed')->count();
            $completed = (clone $query)->where('status', 'completed')->count();
            $cancelled = (clone $query)->where('status', 'cancelled')->count();

            // Get upcoming appointments
            $upcoming = (clone $query)
                ->where('status', '!=', 'cancelled')
                ->where('appointment_datetime', '>=', now())
                ->orderBy('appointment_datetime', 'asc')
                ->limit(5)
                ->with('facility')
                ->get()
                ->map(function ($appointment) {
                    return [
                        'id' => $appointment->id,
                        'mobile_appointment_id' => $appointment->mobile_appointment_id,
                        'appointment_datetime' => $appointment->appointment_datetime,
                        'status' => $appointment->status,
                        'facility_name' => $appointment->facility->name ?? 'Unknown',
                        'doctor_name' => $appointment->doctor_id ? ('Dr. ' . $appointment->doctor_id) : 'TBA',
                        'appointment_type' => $appointment->appointment_type,
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => [
                    'total_appointments' => $total,
                    'pending' => $pending,
                    'confirmed' => $confirmed,
                    'completed' => $completed,
                    'cancelled' => $cancelled,
                    'upcoming_appointments' => $upcoming,
                ],
                'timestamp' => now()->toIso8601String(),
            ], 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
                'timestamp' => now()->toIso8601String(),
            ], 422);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch statistics',
                'error' => $e->getMessage(),
                'timestamp' => now()->toIso8601String(),
            ], 500);
        }
    }
}
