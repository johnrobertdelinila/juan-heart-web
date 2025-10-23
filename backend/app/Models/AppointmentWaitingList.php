<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AppointmentWaitingList extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'appointment_waiting_list';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'patient_first_name',
        'patient_last_name',
        'patient_email',
        'patient_phone',
        'patient_date_of_birth',
        'facility_id',
        'preferred_doctor_id',
        'reason_for_visit',
        'preferred_date_from',
        'preferred_date_to',
        'preferred_time_slots',
        'preferred_days_of_week',
        'priority',
        'priority_reason',
        'status',
        'position',
        'contact_attempts',
        'last_contacted_at',
        'contact_notes',
        'appointment_id',
        'scheduled_at',
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
            'preferred_date_from' => 'date',
            'preferred_date_to' => 'date',
            'preferred_time_slots' => 'array',
            'preferred_days_of_week' => 'array',
            'last_contacted_at' => 'datetime',
            'scheduled_at' => 'datetime',
            'contact_attempts' => 'integer',
            'position' => 'integer',
        ];
    }

    /**
     * Get the facility.
     */
    public function facility()
    {
        return $this->belongsTo(HealthcareFacility::class, 'facility_id');
    }

    /**
     * Get the preferred doctor.
     */
    public function preferredDoctor()
    {
        return $this->belongsTo(User::class, 'preferred_doctor_id');
    }

    /**
     * Get the appointment when scheduled.
     */
    public function appointment()
    {
        return $this->belongsTo(Appointment::class);
    }

    /**
     * Scope active waiting list entries.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope by priority.
     */
    public function scopeByPriority($query, string $priority)
    {
        return $query->where('priority', $priority);
    }

    /**
     * Get patient's full name.
     */
    public function getPatientFullNameAttribute(): string
    {
        return trim("{$this->patient_first_name} {$this->patient_last_name}");
    }
}
