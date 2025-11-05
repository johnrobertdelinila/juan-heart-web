<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Appointment extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'mobile_appointment_id',
        'referral_id',
        'assessment_id',
        'patient_first_name',
        'patient_last_name',
        'patient_email',
        'patient_phone',
        'patient_date_of_birth',
        'facility_id',
        'doctor_id',
        'appointment_datetime',
        'duration_minutes',
        'appointment_type',
        'department',
        'reason_for_visit',
        'special_requirements',
        'status',
        'status_notes',
        'is_confirmed',
        'confirmed_at',
        'confirmation_method',
        'checked_in_at',
        'checked_in_by',
        'completed_at',
        'visit_summary',
        'next_steps',
        'cancelled_at',
        'cancelled_by',
        'cancellation_reason',
        'rescheduled_from',
        'rescheduled_at',
        'reminder_sent',
        'reminder_sent_at',
        'reminder_preferences',
        'booked_by',
        'booking_source',
        'from_waiting_list',
        'waiting_list_position',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'patient_date_of_birth' => 'date',
            'appointment_datetime' => 'datetime',
            'confirmed_at' => 'datetime',
            'checked_in_at' => 'datetime',
            'completed_at' => 'datetime',
            'cancelled_at' => 'datetime',
            'rescheduled_at' => 'datetime',
            'reminder_sent_at' => 'datetime',
            'reminder_preferences' => 'array',
            'is_confirmed' => 'boolean',
            'reminder_sent' => 'boolean',
            'from_waiting_list' => 'boolean',
            'duration_minutes' => 'integer',
            'waiting_list_position' => 'integer',
        ];
    }

    /**
     * Get the referral associated with this appointment.
     */
    public function referral()
    {
        return $this->belongsTo(Referral::class);
    }

    /**
     * Get the assessment associated with this appointment.
     */
    public function assessment()
    {
        return $this->belongsTo(Assessment::class);
    }

    /**
     * Get the facility where the appointment is scheduled.
     */
    public function facility()
    {
        return $this->belongsTo(HealthcareFacility::class, 'facility_id');
    }

    /**
     * Get the doctor assigned to this appointment.
     */
    public function doctor()
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    /**
     * Get the user who booked the appointment.
     */
    public function bookedBy()
    {
        return $this->belongsTo(User::class, 'booked_by');
    }

    /**
     * Get the user who checked in the patient.
     */
    public function checkedInBy()
    {
        return $this->belongsTo(User::class, 'checked_in_by');
    }

    /**
     * Get the user who cancelled the appointment.
     */
    public function cancelledBy()
    {
        return $this->belongsTo(User::class, 'cancelled_by');
    }

    /**
     * Get the original appointment if this was rescheduled.
     */
    public function originalAppointment()
    {
        return $this->belongsTo(Appointment::class, 'rescheduled_from');
    }

    /**
     * Get all rescheduled appointments from this one.
     */
    public function rescheduledAppointments()
    {
        return $this->hasMany(Appointment::class, 'rescheduled_from');
    }

    /**
     * Get the reminders for this appointment.
     */
    public function reminders()
    {
        return $this->hasMany(AppointmentReminder::class);
    }

    /**
     * Get the notes for this appointment.
     */
    public function notes()
    {
        return $this->hasMany(AppointmentNote::class)->orderBy('created_at', 'desc');
    }

    /**
     * Scope a query to only include scheduled appointments.
     */
    public function scopeScheduled($query)
    {
        return $query->where('status', 'scheduled');
    }

    /**
     * Scope a query to only include confirmed appointments.
     */
    public function scopeConfirmed($query)
    {
        return $query->where('status', 'confirmed');
    }

    /**
     * Scope a query to only include completed appointments.
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope a query to only include cancelled appointments.
     */
    public function scopeCancelled($query)
    {
        return $query->where('status', 'cancelled');
    }

    /**
     * Scope a query to filter by facility.
     */
    public function scopeForFacility($query, int $facilityId)
    {
        return $query->where('facility_id', $facilityId);
    }

    /**
     * Scope a query to filter by doctor.
     */
    public function scopeForDoctor($query, int $doctorId)
    {
        return $query->where('doctor_id', $doctorId);
    }

    /**
     * Scope a query to filter by date range.
     */
    public function scopeBetweenDates($query, $startDate, $endDate)
    {
        return $query->whereBetween('appointment_datetime', [$startDate, $endDate]);
    }

    /**
     * Scope a query to only include upcoming appointments.
     */
    public function scopeUpcoming($query)
    {
        return $query->where('appointment_datetime', '>', now())
            ->whereIn('status', ['scheduled', 'confirmed']);
    }

    /**
     * Scope a query to only include past appointments.
     */
    public function scopePast($query)
    {
        return $query->where('appointment_datetime', '<', now());
    }

    /**
     * Scope a query to only include today's appointments.
     */
    public function scopeToday($query)
    {
        return $query->whereDate('appointment_datetime', today());
    }

    /**
     * Check if appointment is scheduled.
     */
    public function isScheduled(): bool
    {
        return $this->status === 'scheduled';
    }

    /**
     * Check if appointment is confirmed.
     */
    public function isConfirmed(): bool
    {
        return $this->status === 'confirmed' || $this->is_confirmed;
    }

    /**
     * Check if appointment is completed.
     */
    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    /**
     * Check if appointment is cancelled.
     */
    public function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }

    /**
     * Check if appointment is upcoming.
     */
    public function isUpcoming(): bool
    {
        return $this->appointment_datetime->isFuture() &&
               in_array($this->status, ['scheduled', 'confirmed']);
    }

    /**
     * Check if appointment is overdue (patient didn't show).
     */
    public function isOverdue(): bool
    {
        return $this->appointment_datetime->isPast() &&
               in_array($this->status, ['scheduled', 'confirmed']);
    }

    /**
     * Check if patient has checked in.
     */
    public function hasCheckedIn(): bool
    {
        return $this->status === 'checked_in' || $this->checked_in_at !== null;
    }

    /**
     * Get patient's full name.
     */
    public function getPatientFullNameAttribute(): string
    {
        return trim("{$this->patient_first_name} {$this->patient_last_name}");
    }

    /**
     * Get appointment end time.
     */
    public function getAppointmentEndTimeAttribute()
    {
        return $this->appointment_datetime->addMinutes($this->duration_minutes);
    }

    /**
     * Get time until appointment.
     */
    public function getTimeUntilAppointmentAttribute(): ?string
    {
        if ($this->appointment_datetime->isPast()) {
            return null;
        }

        return $this->appointment_datetime->diffForHumans();
    }

    /**
     * Calculate duration between creation and appointment.
     */
    public function getDaysUntilAppointmentAttribute(): int
    {
        return $this->created_at->diffInDays($this->appointment_datetime);
    }

    /**
     * Check if reminder should be sent.
     */
    public function shouldSendReminder(): bool
    {
        if ($this->reminder_sent || $this->isCancelled() || $this->isCompleted()) {
            return false;
        }

        // Send reminder 24 hours before appointment
        $reminderTime = $this->appointment_datetime->subDay();
        return now()->isAfter($reminderTime) && now()->isBefore($this->appointment_datetime);
    }

    /**
     * Check if appointment can be rescheduled.
     */
    public function canBeRescheduled(): bool
    {
        return in_array($this->status, ['scheduled', 'confirmed']) &&
               $this->appointment_datetime->isFuture();
    }

    /**
     * Check if appointment can be cancelled.
     */
    public function canBeCancelled(): bool
    {
        return in_array($this->status, ['scheduled', 'confirmed', 'checked_in']) &&
               $this->appointment_datetime->isFuture();
    }
}
