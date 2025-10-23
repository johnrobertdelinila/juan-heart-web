<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Referral extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'assessment_id',
        'patient_first_name',
        'patient_last_name',
        'patient_date_of_birth',
        'patient_sex',
        'patient_phone',
        'source_facility_id',
        'target_facility_id',
        'referring_user_id',
        'assigned_doctor_id',
        'priority',
        'urgency',
        'referral_type',
        'chief_complaint',
        'clinical_notes',
        'required_services',
        'status',
        'status_notes',
        'accepted_at',
        'arrived_at',
        'completed_at',
        'cancelled_at',
        'scheduled_appointment',
        'appointment_notes',
        'transport_method',
        'transport_notes',
        'estimated_travel_time_minutes',
        'referral_letter_path',
        'attached_documents',
        'records_transferred',
        'requires_follow_up',
        'follow_up_date',
        'follow_up_notes',
        'treatment_summary',
        'diagnosis',
        'recommendations',
        'outcome',
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
            'accepted_at' => 'datetime',
            'arrived_at' => 'datetime',
            'completed_at' => 'datetime',
            'cancelled_at' => 'datetime',
            'scheduled_appointment' => 'datetime',
            'estimated_travel_time_minutes' => 'decimal:2',
            'required_services' => 'array',
            'attached_documents' => 'array',
            'records_transferred' => 'boolean',
            'requires_follow_up' => 'boolean',
            'follow_up_date' => 'datetime',
            'deleted_at' => 'datetime',
        ];
    }

    /**
     * Get the assessment that this referral belongs to.
     */
    public function assessment()
    {
        return $this->belongsTo(Assessment::class);
    }

    /**
     * Get the source facility.
     */
    public function sourceFacility()
    {
        return $this->belongsTo(HealthcareFacility::class, 'source_facility_id');
    }

    /**
     * Get the target facility.
     */
    public function targetFacility()
    {
        return $this->belongsTo(HealthcareFacility::class, 'target_facility_id');
    }

    /**
     * Get the user who created the referral.
     */
    public function referringUser()
    {
        return $this->belongsTo(User::class, 'referring_user_id');
    }

    /**
     * Get the assigned doctor.
     */
    public function assignedDoctor()
    {
        return $this->belongsTo(User::class, 'assigned_doctor_id');
    }

    /**
     * Get the history/audit trail for this referral.
     */
    public function history()
    {
        return $this->hasMany(ReferralHistory::class)->orderBy('created_at', 'desc');
    }

    /**
     * Scope a query to only include pending referrals.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope a query to only include accepted referrals.
     */
    public function scopeAccepted($query)
    {
        return $query->where('status', 'accepted');
    }

    /**
     * Scope a query to only include completed referrals.
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope a query to filter by priority.
     */
    public function scopeByPriority($query, string $priority)
    {
        return $query->where('priority', $priority);
    }

    /**
     * Scope a query to filter by urgency.
     */
    public function scopeByUrgency($query, string $urgency)
    {
        return $query->where('urgency', $urgency);
    }

    /**
     * Scope a query to filter by target facility.
     */
    public function scopeForFacility($query, int $facilityId)
    {
        return $query->where('target_facility_id', $facilityId);
    }

    /**
     * Scope a query to filter by source facility.
     */
    public function scopeFromFacility($query, int $facilityId)
    {
        return $query->where('source_facility_id', $facilityId);
    }

    /**
     * Scope a query to filter critical referrals.
     */
    public function scopeCritical($query)
    {
        return $query->where('priority', 'Critical');
    }

    /**
     * Check if referral is pending.
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if referral is accepted.
     */
    public function isAccepted(): bool
    {
        return $this->status === 'accepted';
    }

    /**
     * Check if referral is completed.
     */
    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    /**
     * Check if referral is critical priority.
     */
    public function isCritical(): bool
    {
        return $this->priority === 'Critical';
    }

    /**
     * Check if referral is emergency.
     */
    public function isEmergency(): bool
    {
        return $this->urgency === 'Emergency';
    }

    /**
     * Get patient's full name.
     */
    public function getPatientFullNameAttribute(): string
    {
        return trim("{$this->patient_first_name} {$this->patient_last_name}");
    }

    /**
     * Calculate time since referral was created.
     */
    public function getTimeSinceCreatedAttribute(): ?string
    {
        if (!$this->created_at) {
            return null;
        }

        return $this->created_at->diffForHumans();
    }

    /**
     * Check if appointment is overdue.
     */
    public function isAppointmentOverdue(): bool
    {
        if (!$this->scheduled_appointment) {
            return false;
        }

        return $this->scheduled_appointment->isPast() && !$this->isCompleted();
    }

    /**
     * Check if referral is overdue (pending for more than 24 hours).
     */
    public function isOverdue(): bool
    {
        if (!$this->isPending()) {
            return false;
        }

        return $this->created_at->diffInHours(now()) > 24;
    }

    /**
     * Calculate response time in hours.
     */
    public function getResponseTimeHours(): ?float
    {
        if (!$this->accepted_at) {
            return null;
        }

        return $this->created_at->diffInHours($this->accepted_at);
    }

    /**
     * Calculate total processing time in days.
     */
    public function getProcessingTimeDays(): ?float
    {
        if (!$this->completed_at) {
            return null;
        }

        return $this->created_at->diffInDays($this->completed_at);
    }

    /**
     * Check if referral is rejected.
     */
    public function isRejected(): bool
    {
        return $this->status === 'rejected';
    }

    /**
     * Check if referral is cancelled.
     */
    public function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }

    /**
     * Check if referral is high priority.
     */
    public function isHighPriority(): bool
    {
        return in_array($this->priority, ['High', 'Critical']);
    }
}
