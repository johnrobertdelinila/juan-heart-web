<?php

namespace App\Services;

use App\Models\Appointment;
use App\Models\AppointmentReminder;
use App\Models\AppointmentWaitingList;
use App\Models\DoctorAvailability;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AppointmentService
{
    /**
     * Check doctor availability for a given date/time.
     */
    public function checkAvailability(int $facilityId, int $doctorId, Carbon $dateTime, int $durationMinutes = 30): array
    {
        // Check if doctor has regular schedule for this day
        $dayOfWeek = $dateTime->dayOfWeekIso; // 1 = Monday, 7 = Sunday
        $time = $dateTime->format('H:i:s');

        // Check specific date availability (overrides regular schedule)
        $specificAvailability = DoctorAvailability::where('doctor_id', $doctorId)
            ->where('facility_id', $facilityId)
            ->where('schedule_type', 'specific')
            ->where('specific_date', $dateTime->toDateString())
            ->where('is_available', true)
            ->first();

        if ($specificAvailability) {
            $isWithinSchedule = $time >= $specificAvailability->specific_start_time &&
                              $time < $specificAvailability->specific_end_time;

            if (!$isWithinSchedule) {
                return ['available' => false, 'reason' => 'Outside doctor schedule'];
            }
        } else {
            // Check regular weekly schedule
            $regularAvailability = DoctorAvailability::where('doctor_id', $doctorId)
                ->where('facility_id', $facilityId)
                ->where('schedule_type', 'regular')
                ->where('day_of_week', $dayOfWeek)
                ->where('is_available', true)
                ->first();

            if (!$regularAvailability) {
                return ['available' => false, 'reason' => 'Doctor not available on this day'];
            }

            $isWithinSchedule = $time >= $regularAvailability->start_time &&
                              $time < $regularAvailability->end_time;

            if (!$isWithinSchedule) {
                return ['available' => false, 'reason' => 'Outside doctor schedule'];
            }
        }

        // Check for blocked time
        $blockedTime = DoctorAvailability::where('doctor_id', $doctorId)
            ->where('facility_id', $facilityId)
            ->where('schedule_type', 'blocked')
            ->where('specific_date', $dateTime->toDateString())
            ->where('is_available', false)
            ->where('specific_start_time', '<=', $time)
            ->where('specific_end_time', '>', $time)
            ->exists();

        if ($blockedTime) {
            return ['available' => false, 'reason' => 'Time slot is blocked'];
        }

        // Check for existing appointments
        $endTime = $dateTime->copy()->addMinutes($durationMinutes);

        $conflictingAppointments = Appointment::where('facility_id', $facilityId)
            ->where('doctor_id', $doctorId)
            ->whereIn('status', ['scheduled', 'confirmed', 'in_progress'])
            ->where(function ($query) use ($dateTime, $endTime) {
                $query->whereBetween('appointment_datetime', [$dateTime, $endTime])
                    ->orWhere(function ($q) use ($dateTime, $endTime) {
                        $q->where('appointment_datetime', '<=', $dateTime)
                          ->whereRaw('DATE_ADD(appointment_datetime, INTERVAL duration_minutes MINUTE) > ?', [$dateTime]);
                    });
            })
            ->count();

        if ($conflictingAppointments > 0) {
            return ['available' => false, 'reason' => 'Time slot already booked'];
        }

        return ['available' => true, 'slot' => $dateTime];
    }

    /**
     * Get available time slots for a doctor on a specific date.
     */
    public function getAvailableSlots(int $facilityId, int $doctorId, Carbon $date, int $slotDuration = 30): array
    {
        $dayOfWeek = $date->dayOfWeekIso;
        $slots = [];

        // Get doctor's schedule for this day
        $schedule = DoctorAvailability::where('doctor_id', $doctorId)
            ->where('facility_id', $facilityId)
            ->where(function ($query) use ($dayOfWeek, $date) {
                $query->where(function ($q) use ($dayOfWeek) {
                    $q->where('schedule_type', 'regular')
                      ->where('day_of_week', $dayOfWeek);
                })->orWhere(function ($q) use ($date) {
                    $q->where('schedule_type', 'specific')
                      ->where('specific_date', $date->toDateString());
                });
            })
            ->where('is_available', true)
            ->first();

        if (!$schedule) {
            return [];
        }

        // Determine start and end time
        if ($schedule->schedule_type === 'specific') {
            $startTime = Carbon::parse($schedule->specific_start_time);
            $endTime = Carbon::parse($schedule->specific_end_time);
        } else {
            $startTime = Carbon::parse($schedule->start_time);
            $endTime = Carbon::parse($schedule->end_time);
        }

        // Generate time slots
        $currentSlot = $date->copy()->setTimeFrom($startTime);
        $endSlot = $date->copy()->setTimeFrom($endTime);

        while ($currentSlot->lt($endSlot)) {
            // Check if slot is available
            $availability = $this->checkAvailability($facilityId, $doctorId, $currentSlot->copy(), $slotDuration);

            if ($availability['available']) {
                $slots[] = [
                    'time' => $currentSlot->format('H:i'),
                    'datetime' => $currentSlot->toDateTimeString(),
                    'available' => true,
                ];
            } else {
                $slots[] = [
                    'time' => $currentSlot->format('H:i'),
                    'datetime' => $currentSlot->toDateTimeString(),
                    'available' => false,
                    'reason' => $availability['reason'] ?? 'Not available',
                ];
            }

            $currentSlot->addMinutes($slotDuration + ($schedule->buffer_time_minutes ?? 0));
        }

        return $slots;
    }

    /**
     * Book an appointment.
     */
    public function bookAppointment(array $data): Appointment
    {
        return DB::transaction(function () use ($data) {
            $appointmentDateTime = Carbon::parse($data['appointment_datetime']);

            // Check availability
            $availability = $this->checkAvailability(
                $data['facility_id'],
                $data['doctor_id'],
                $appointmentDateTime,
                $data['duration_minutes'] ?? 30
            );

            if (!$availability['available']) {
                throw new \Exception('Time slot not available: ' . $availability['reason']);
            }

            // Create appointment
            $appointment = Appointment::create([
                'referral_id' => $data['referral_id'] ?? null,
                'patient_first_name' => $data['patient_first_name'],
                'patient_last_name' => $data['patient_last_name'],
                'patient_email' => $data['patient_email'] ?? null,
                'patient_phone' => $data['patient_phone'],
                'patient_date_of_birth' => $data['patient_date_of_birth'] ?? null,
                'facility_id' => $data['facility_id'],
                'doctor_id' => $data['doctor_id'],
                'appointment_datetime' => $appointmentDateTime,
                'duration_minutes' => $data['duration_minutes'] ?? 30,
                'appointment_type' => $data['appointment_type'] ?? 'consultation',
                'department' => $data['department'] ?? null,
                'reason_for_visit' => $data['reason_for_visit'],
                'special_requirements' => $data['special_requirements'] ?? null,
                'booked_by' => $data['booked_by'] ?? null,
                'booking_source' => $data['booking_source'] ?? 'web',
                'reminder_preferences' => $data['reminder_preferences'] ?? null,
                'status' => 'scheduled',
            ]);

            // Schedule reminders
            $this->scheduleReminders($appointment);

            // If from waiting list, update waiting list entry
            if (isset($data['waiting_list_id'])) {
                AppointmentWaitingList::where('id', $data['waiting_list_id'])->update([
                    'status' => 'scheduled',
                    'appointment_id' => $appointment->id,
                    'scheduled_at' => now(),
                ]);

                $appointment->update([
                    'from_waiting_list' => true,
                ]);
            }

            Log::info('Appointment booked', [
                'appointment_id' => $appointment->id,
                'patient' => $appointment->patient_full_name,
                'datetime' => $appointment->appointment_datetime,
            ]);

            return $appointment;
        });
    }

    /**
     * Reschedule an appointment.
     */
    public function rescheduleAppointment(Appointment $appointment, Carbon $newDateTime, ?string $reason = null): Appointment
    {
        if (!$appointment->canBeRescheduled()) {
            throw new \Exception('Appointment cannot be rescheduled');
        }

        return DB::transaction(function () use ($appointment, $newDateTime, $reason) {
            // Check availability for new time
            $availability = $this->checkAvailability(
                $appointment->facility_id,
                $appointment->doctor_id,
                $newDateTime,
                $appointment->duration_minutes
            );

            if (!$availability['available']) {
                throw new \Exception('New time slot not available: ' . $availability['reason']);
            }

            // Create new appointment with rescheduled reference
            $newAppointment = $appointment->replicate();
            $newAppointment->appointment_datetime = $newDateTime;
            $newAppointment->rescheduled_from = $appointment->id;
            $newAppointment->rescheduled_at = now();
            $newAppointment->status = 'scheduled';
            $newAppointment->save();

            // Update old appointment status
            $appointment->update([
                'status' => 'rescheduled',
                'status_notes' => $reason,
            ]);

            // Reschedule reminders for new appointment
            $this->scheduleReminders($newAppointment);

            Log::info('Appointment rescheduled', [
                'old_appointment_id' => $appointment->id,
                'new_appointment_id' => $newAppointment->id,
                'new_datetime' => $newDateTime,
            ]);

            return $newAppointment;
        });
    }

    /**
     * Cancel an appointment.
     */
    public function cancelAppointment(Appointment $appointment, int $cancelledBy, string $reason): bool
    {
        if (!$appointment->canBeCancelled()) {
            throw new \Exception('Appointment cannot be cancelled');
        }

        $appointment->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
            'cancelled_by' => $cancelledBy,
            'cancellation_reason' => $reason,
        ]);

        // Cancel pending reminders
        AppointmentReminder::where('appointment_id', $appointment->id)
            ->where('status', 'pending')
            ->update(['status' => 'cancelled']);

        Log::info('Appointment cancelled', [
            'appointment_id' => $appointment->id,
            'reason' => $reason,
        ]);

        return true;
    }

    /**
     * Confirm an appointment.
     */
    public function confirmAppointment(Appointment $appointment, string $method = 'web'): bool
    {
        $appointment->update([
            'status' => 'confirmed',
            'is_confirmed' => true,
            'confirmed_at' => now(),
            'confirmation_method' => $method,
        ]);

        Log::info('Appointment confirmed', [
            'appointment_id' => $appointment->id,
            'method' => $method,
        ]);

        return true;
    }

    /**
     * Check in a patient for their appointment.
     */
    public function checkInPatient(Appointment $appointment, int $checkedInBy): bool
    {
        $appointment->update([
            'status' => 'checked_in',
            'checked_in_at' => now(),
            'checked_in_by' => $checkedInBy,
        ]);

        Log::info('Patient checked in', [
            'appointment_id' => $appointment->id,
        ]);

        return true;
    }

    /**
     * Complete an appointment.
     */
    public function completeAppointment(Appointment $appointment, array $completionData): bool
    {
        $appointment->update([
            'status' => 'completed',
            'completed_at' => now(),
            'visit_summary' => $completionData['visit_summary'] ?? null,
            'next_steps' => $completionData['next_steps'] ?? null,
        ]);

        Log::info('Appointment completed', [
            'appointment_id' => $appointment->id,
        ]);

        return true;
    }

    /**
     * Schedule reminders for an appointment.
     */
    protected function scheduleReminders(Appointment $appointment): void
    {
        $reminderSchedule = [
            ['type' => '7_days_before', 'days' => 7],
            ['type' => '1_day_before', 'days' => 1],
            ['type' => 'same_day', 'days' => 0],
        ];

        foreach ($reminderSchedule as $reminder) {
            $scheduledFor = $appointment->appointment_datetime->copy()->subDays($reminder['days']);

            // Only schedule future reminders
            if ($scheduledFor->isFuture()) {
                AppointmentReminder::create([
                    'appointment_id' => $appointment->id,
                    'reminder_type' => $reminder['type'],
                    'channel' => 'email', // Can be configured per patient preference
                    'scheduled_for' => $scheduledFor->setTime(9, 0), // 9 AM
                    'recipient' => $appointment->patient_email ?? $appointment->patient_phone,
                    'status' => 'pending',
                ]);
            }
        }
    }

    /**
     * Add patient to waiting list.
     */
    public function addToWaitingList(array $data): AppointmentWaitingList
    {
        // Calculate current position
        $currentMaxPosition = AppointmentWaitingList::where('facility_id', $data['facility_id'])
            ->where('status', 'active')
            ->max('position') ?? 0;

        $entry = AppointmentWaitingList::create([
            'patient_first_name' => $data['patient_first_name'],
            'patient_last_name' => $data['patient_last_name'],
            'patient_email' => $data['patient_email'] ?? null,
            'patient_phone' => $data['patient_phone'],
            'patient_date_of_birth' => $data['patient_date_of_birth'] ?? null,
            'facility_id' => $data['facility_id'],
            'preferred_doctor_id' => $data['preferred_doctor_id'] ?? null,
            'reason_for_visit' => $data['reason_for_visit'],
            'preferred_date_from' => $data['preferred_date_from'] ?? null,
            'preferred_date_to' => $data['preferred_date_to'] ?? null,
            'preferred_time_slots' => $data['preferred_time_slots'] ?? null,
            'preferred_days_of_week' => $data['preferred_days_of_week'] ?? null,
            'priority' => $data['priority'] ?? 'Medium',
            'priority_reason' => $data['priority_reason'] ?? null,
            'position' => $currentMaxPosition + 1,
            'status' => 'active',
        ]);

        Log::info('Patient added to waiting list', [
            'waiting_list_id' => $entry->id,
            'patient' => $entry->patient_full_name,
            'position' => $entry->position,
        ]);

        return $entry;
    }

    /**
     * Get appointments for a specific date range.
     */
    public function getAppointmentsByDateRange(int $facilityId, Carbon $startDate, Carbon $endDate, ?int $doctorId = null): array
    {
        $query = Appointment::with(['doctor', 'facility'])
            ->where('facility_id', $facilityId)
            ->betweenDates($startDate, $endDate)
            ->orderBy('appointment_datetime');

        if ($doctorId) {
            $query->where('doctor_id', $doctorId);
        }

        return $query->get()->toArray();
    }

    /**
     * Mark no-show appointments.
     */
    public function markNoShows(): int
    {
        $noShowThreshold = now()->subHours(1); // 1 hour past appointment time

        $updated = Appointment::whereIn('status', ['scheduled', 'confirmed'])
            ->where('appointment_datetime', '<', $noShowThreshold)
            ->update([
                'status' => 'no_show',
                'status_notes' => 'Patient did not show up for scheduled appointment',
            ]);

        if ($updated > 0) {
            Log::info("Marked {$updated} appointments as no-show");
        }

        return $updated;
    }
}
